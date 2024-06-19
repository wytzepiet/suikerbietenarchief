"use server";

import { mux } from "@/libs/mux/server";
import { supabase } from "../supabase/server";

export function getVideoInfo(assetId: string | null) {
    if (!assetId) return null;
  return mux.video.assets.retrieve(assetId);
}


export async function deleteMuxVideo(assetId: string) {
    const user = await supabase().auth.getUser();
    if(!user.data.user) return;
    return await mux.video.assets.delete(assetId);
}