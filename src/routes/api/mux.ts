"use server";

import { mux } from "@/libs/mux/client";
import { supabase } from "@/libs/supabase/server";
import { APIEvent } from "node_modules/@solidjs/start/dist/server";

function oopsie(message: string, status: number) {
  console.error(message);
  return new Response(message, { status });
}
export async function POST({ request }: APIEvent) {
  try {
    // Parse the incoming request body
    // // const payload = await request.json();
    // const body = JSON.stringify(payload, null, 2);
    // console.log('Received Mux webhook:', body);
    const hook = mux.webhooks.unwrap(await request.text(), request.headers);

    console.log("hook: ", hook.type);

    // console.log('Unwrapped Mux event:', JSON.stringify(event, null, 2));

    if (hook.type === "video.asset.created") {
      if (!hook.data.upload_id) {
        return oopsie("Upload ID not found in webhook", 400);
      }

      const uploads = await supabase()
        .from("uploads")
        .select()
        .eq("upload_id", hook.data.upload_id);

      if (!uploads.data || uploads.data?.length === 0) {
        return oopsie(
          "Upload not found in database. upload_id= " + hook.data.upload_id,
          404
        );
      } else if (uploads.data?.length > 1) {
        return oopsie("Multiple uploads found in database", 500);
      }

      const video = await supabase()
        .from("videos")
        .select("*")
        .eq("asset_id", hook.data.id);

      if (video.data && video.data.length > 0) {
        return oopsie("Video already exists in database", 409);
      }

      const upload = uploads.data[0];
      const { data, error } = await supabase()
        .from("videos")
        .insert([
          {
            asset_id: hook.data.id,
            title: upload.title,
            description: upload.description,
            status: hook.data.status,
          },
        ]);

      if (error) {
        return oopsie("Error inserting video into database", 500);
      }
      return new Response("OK", { status: 200 });
    }
    if (hook.type === "video.asset.static_renditions.ready") {
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);

    // Return a 500 response if there was an error processing the webhook
    return new Response("Internal Server Error", { status: 500 });
  }
}
