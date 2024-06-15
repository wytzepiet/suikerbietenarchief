import { Button } from "@/components/ui/button";
import { A } from "@solidjs/router";
import { Ellipsis, Upload } from "lucide-solid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/libs/supabase/client";
import { For, createResource } from "solid-js";
import { mux } from "@/libs/mux/client";


async function synchoniseWithMux() {
  "use server";
  const muxVideos = await mux.video.assets.list();
  if (!muxVideos) return;
  const vids = supabase().from("videos");

  muxVideos.data.forEach(async (muxVideo) => {
    const { data, error } = await vids.select().eq("asset_id", muxVideo.id);
    if (error) {
      console.error("Error fetching video document:", error);
    }
    console.log("data: ", data);
    if (data?.length === 0) {
      const response = await vids.insert({
        asset_id: muxVideo.id,
        playback_id: muxVideo.playback_ids?.at(0)?.id,
      });
      console.log("response: ", response);
    }
  });
}

export default function Videos() {
  const [videos] = createResource(async () => {
    return = await supabase().from("videos").select().neq("asset_id", null);
  });

  return (
    <div>
      <div class="flex justify-between">
        <h1 class="text-2xl font-medium">Video's</h1>

        <div class="flex gap-4">
          <A href="/admin/upload">
            <Button class="flex gap-2 items-center">
              <Upload size="1.2em" strokeWidth={3} />
              Bulk upload
            </Button>
          </A>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" class="px-2">
                <Ellipsis size="1.5em" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                class="cursor-pointer"
                onSelect={synchoniseWithMux}
              >
                Synchroniseer met Mux
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <For each={videos()?.data}>
        {(video) => (
          <div class="flex gap-4">
            <p>{video.title}</p>
            <p>{video.id}</p>
          </div>
        )}
      </For>
    </div>
  );
}
