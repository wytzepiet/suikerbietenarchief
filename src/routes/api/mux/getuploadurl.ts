"use server";

import { mux } from "@/libs/mux/client";
import { supabase } from "@/libs/supabase/server";
import { json } from "@solidjs/router";
import { createClient } from "@supabase/supabase-js";
import { APIEvent } from "node_modules/@solidjs/start/dist/server";

export async function GET(event: APIEvent) {
  // const user = await supabase.auth.getUser();
  console.log("mux.video.uploads.create");
  const upload = await mux.video.uploads.create({
    cors_origin: "https://suikerbietenarchief.nl",
    new_asset_settings: {
      playback_policy: ["public"],
      encoding_tier: "baseline",
    },
  });
  return json({ data: upload });
}
