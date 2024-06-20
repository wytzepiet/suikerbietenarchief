"use server";

import { AssemblyAI } from "assemblyai";

const assemblyAI = () => {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) throw new Error("No AssemblyAI API key found");
  return new AssemblyAI({ apiKey });
};

export function transcribe(playbackId: string) {
  return assemblyAI().transcripts.submit({
    audio_url: `https://stream.mux.com/${playbackId}/audio.m4a`,
    language_code: "nl",
    webhook_url: `https://shortly-fit-leopard.ngrok-free.app/api/webhooks/assemblyai?playback_id=${playbackId}`,
  });
}

export function getTranscript(transcriptId: string) {
  return assemblyAI().transcripts.get(transcriptId);
}
