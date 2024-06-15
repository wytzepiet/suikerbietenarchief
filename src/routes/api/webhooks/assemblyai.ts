"use server";

import { supabase } from "@/libs/supabase/server";
import { json } from "@solidjs/router";
import { APIEvent } from "node_modules/@solidjs/start/dist/server";

export async function POST({ request }: APIEvent) {
  try {
    const { searchParams } = new URL(request.url);
    const transcriptId = String((await request.json()).transcript_id);
    const playbackId = String(searchParams.get("playback_id"));

    const { error } = await supabase()
      .from("videos")
      .update({ transcript_id: transcriptId })
      .eq("playback_id", playbackId);

    if (error) {
      console.error("Error updating video document:", error);
      return json({ error: error.message }, { status: 500 });
    }

    return json({ message: "Webhook received successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
}
