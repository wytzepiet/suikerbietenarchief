"use server";

import Mux from "@mux/mux-node";

export const muxClient = () =>
  new Mux({
    tokenId: process.env.VITE_MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
    webhookSecret: process.env.MUX_WEBHOOK_SECRET,
  });

export async function getMuxInfo(assetId: string) {
  console.log("getting mux info");
  return await muxClient().video.assets.retrieve(assetId);
}

export async function deleteMuxVideo(assetId: string) {
  return await muxClient().video.assets.delete(assetId);
}

export async function createMuxUpload() {
  return muxClient().video.uploads.create({
    cors_origin: "https://suikerbietenarchief.vercel.app",
    new_asset_settings: {
      playback_policy: ["public"],
      encoding_tier: "smart",
      mp4_support: "audio-only",
    },
  });
}
