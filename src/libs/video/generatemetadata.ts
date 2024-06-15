"use server";

import { supabase } from "../supabase/server";

export async function generateMetadata(playbackId: string) {
  const { error, data } = await supabase()
    .from("videos")
    .select()
    .eq("playback_id", playbackId);

  if (error) {
    return console.error("Error fetching video document:", error);
  }
  if (data.length === 0) {
    return console.error("Video not found in database");
  }
  if (data.length > 1) {
    return console.error("Multiple videos found in database");
  }

  if (!data[0].transcript_id) {
    return console.error("Transcript ID not found in video document");
  }
}
