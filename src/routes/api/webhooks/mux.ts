import { muxClient } from "@/libs/services/mux";
import { supabase } from "@/libs/services/supabase/server";
import { transcribe } from "@/libs/services/assemblyai";
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
    const hook = muxClient().webhooks.unwrap(
      await request.text(),
      request.headers
    );

    console.log("hook:", hook.type);

    // console.log('Unwrapped Mux event:', JSON.stringify(event, null, 2));

    if (hook.type === "video.asset.created") {
      if (!hook.data.upload_id) {
        return oopsie("Upload ID not found in webhook", 400);
      }

      const uploads = await supabase()
        .from("uploads")
        .select()
        .eq("upload_id", hook.data.upload_id)
        .order("created_at", { ascending: false });

      if (!uploads.data || uploads.data?.length === 0) {
        return oopsie(
          "Upload not found in database. upload_id= " + hook.data.upload_id,
          404
        );
      }

      const video = await supabase()
        .from("videos")
        .select()
        .eq("asset_id", hook.data.id);

      if (video.data && video.data.length > 0) {
        return oopsie("Video already exists in database", 409);
      }

      const upload = uploads.data[0];

      const { error } = await supabase()
        .from("videos")
        .insert({
          asset_id: hook.data.id,
          title: upload.title,
          description: upload.description,
          status: hook.data.status,
          playback_id: hook.data.playback_ids?.at(0)?.id,
          generate_description: upload.generate_description,
          prompt_hint: upload.prompt_hint,
          created_by: upload.user_id,
          edited_by: upload.user_id,
          upload: upload.id,
        });

      if (error) {
        return oopsie(
          "Error inserting video into database: " + error.message,
          500
        );
      }
      return new Response("OK", { status: 200 });
    }
    if (hook.type === "video.asset.ready") {
      const { error } = await supabase()
        .from("videos")
        .update({
          status: hook.data.status,
          playback_id: hook.data.playback_ids?.at(0)?.id,
          aspect_ratio: hook.data.aspect_ratio,
          duration: hook.data.duration,
        })
        .eq("asset_id", hook.data.id)
        .select();

      if (error) {
        return oopsie(
          "Error updating video status in database: " + error.message,
          500
        );
      }
    }
    if (hook.type === "video.asset.static_renditions.ready") {
      const playbackId = hook.data.playback_ids?.at(0)?.id;
      if (playbackId) transcribe(playbackId);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);

    // Return a 500 response if there was an error processing the webhook
    return new Response("Internal Server Error", { status: 500 });
  }
}
