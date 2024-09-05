"use server";

import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });

export function transcribe(playbackId: string) {
  return client.transcripts.submit({
    audio_url: `https://stream.mux.com/${playbackId}/audio.m4a`,
    language_code: "nl",
    webhook_url: `${process.env.APP_URL}/api/webhooks/assemblyai?playback_id=${playbackId}`,
  });
}

export function getTranscript(transcriptId: string) {
  return client.transcripts.get(transcriptId);
}

export function deleteTranscript(transcriptId: string) {
  return client.transcripts.delete(transcriptId);
}
