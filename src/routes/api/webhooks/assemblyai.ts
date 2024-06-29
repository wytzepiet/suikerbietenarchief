"use server";

import { supabase } from "@/libs/services/supabase/server";
import { generateMetadata } from "@/libs/services/openai";
import { json } from "@solidjs/router";
import { APIEvent } from "node_modules/@solidjs/start/dist/server";
import { getTranscript } from "@/libs/services/assemblyai";

export async function POST({ request }: APIEvent) {
  try {
    const res = await request.json();
    const { searchParams } = new URL(request.url);
    const playbackId = String(searchParams.get("playback_id"));
    const transcriptId = String(res.transcript_id);

    console.log("Received AssemblyAI webhook:", { playbackId, transcriptId });
    console.log(res);

    const { data, error } = await supabase()
      .from("videos")
      .update({ transcript_id: transcriptId })
      .eq("playback_id", playbackId)
      .select()
      .single();

    if (error) {
      console.error("Error updating video document:", error);
      return json({ error: error.message }, { status: 500 });
    }

    if (!data.generate_description) return;

    const transcript = await getTranscript(transcriptId);

    console.log("Transcript text:", transcript.text);

    if (!transcript.text) {
      console.error("Error fetching transcript text for video:", data.title);
      return json({ error: "Error fetching transcript text" }, { status: 500 });
    }

    const metadata = await generateMetadata(
      data.title,
      data.prompt_hint,
      transcript.text
    );
    if (metadata) {
      await supabase().from("videos").update(metadata).eq("id", data.id);
    }

    return json({ message: "Webhook received successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
}
