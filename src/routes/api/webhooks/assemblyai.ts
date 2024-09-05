import { supabase } from "@/libs/services/supabase/server";
import { generateMetadata } from "@/libs/services/openai";
import { json } from "@solidjs/router";
import { APIEvent } from "node_modules/@solidjs/start/dist/server";
import { getTranscript } from "@/libs/services/assemblyai";
import { updateMetadata } from "@/libs/services/updatemetadata";
import { F } from "node_modules/@kobalte/core/dist/form-control-label-fea2aaa3";

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

    const { id, title, prompt_hint, generate_description } = data;

    if (!generate_description) return;

    const { text: transcript } = await getTranscript(transcriptId);

    console.log("Transcript text:", transcript);

    if (!transcript) {
      console.error("Error fetching transcript text for video:", title);
      return json({ error: "Error fetching transcript text" }, { status: 500 });
    }

    if (!id || !title || !prompt_hint) {
      console.error("Error fetching video data for video:", title);
      return json({ error: "Error fetching video data" }, { status: 500 });
    }

    try {
      await updateMetadata(id, { title, prompt_hint, transcript });
    } catch (error) {
      console.error("Error updating metadata for video:", title);
      return json({ error: "Error updating metadata" }, { status: 500 });
    }

    return json({ message: "Webhook received successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
}
