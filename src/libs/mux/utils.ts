"use server";

import { mux } from "@/libs/mux/server";

export function getVideoInfo(assetId: string | null) {
  if (!assetId) return null;
  return mux.video.assets.retrieve(assetId);
}

export async function deleteMuxVideo(assetId: string) {
  return await mux.video.assets.delete(assetId);
}
