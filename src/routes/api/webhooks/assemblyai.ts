"use server";

import { getTranscript } from "@/libs/assemblyai/utils";
import { supabase } from "@/libs/supabase/server";
import { generateMetadata } from "@/libs/video/generatemetadata";
import { json } from "@solidjs/router";
import { APIEvent } from "node_modules/@solidjs/start/dist/server";

export async function POST({ request }: APIEvent) {
  try {
    const { searchParams } = new URL(request.url);
    const playbackId = String(searchParams.get("playback_id"));
    const transcriptId = String((await request.json()).transcript_id);

    console.log("Received AssemblyAI webhook:", { playbackId, transcriptId });
    console.log(await request.json());

    const {data, error} = await supabase()
      .from("videos")
      .update({ transcript_id: transcriptId })
      .eq("playback_id", playbackId).select().single();
      
    if (error) {
      console.error("Error updating video document:", error);
      return json({ error: error.message }, { status: 500 });
    }

    if(!data.generate_description) return;

    const transcript = await getTranscript(transcriptId);
    
    console.log("Transcript text:", transcript.text);

    if(!transcript.text) {
      console.error("Error fetching transcript text for video:", data.title);
      return json({ error: "Error fetching transcript text" }, { status: 500 });
    }

    const metadata = await generateMetadata(data.title, data.prompt_hint, transcript.text);
    if(metadata) {
      await supabase().from("videos").upsert(metadata).eq("id", data.id);
    }

    return json({ message: "Webhook received successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
}

