"use server";

import Mux from "@mux/mux-node";

export const mux = new Mux({
  tokenId: process.env.VITE_MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
  webhookSecret: process.env.MUX_WEBHOOK_SECRET,
});

export function getVideoInfo(assetId: string | null) {
  if (!assetId) return null;
  return mux.video.assets.retrieve(assetId);
}

export async function deleteMuxVideo(assetId: string) {
  return await mux.video.assets.delete(assetId);
}

export async function createMuxUpload() {
  return mux.video.uploads.create({
    cors_origin: "https://suikerbietenarchief.vercel.app",
    new_asset_settings: {
      playback_policy: ["public"],
      encoding_tier: "smart",
      mp4_support: "audio-only",
    },
  });
}
