import { APIEvent } from "node_modules/@solidjs/start/dist/server";

export async function POST(event: APIEvent) {
  console.log("supabase.video.POST");
  console.log(JSON.stringify(event, null, 2));
  return new Response("supabase.video.POST", { status: 200 });
}
