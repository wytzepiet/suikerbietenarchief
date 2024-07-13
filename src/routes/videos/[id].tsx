import MuxPlayer from "@/components/muxPlayer";
import { Card } from "@/components/ui/card";
import { Video, createVideo } from "@/libs/datamodels/video";
import { createVideoList } from "@/libs/datamodels/videoList";
import { supabase } from "@/libs/services/supabase/client";
import { A, useParams } from "@solidjs/router";
import { For, Show, createEffect, createSignal } from "solid-js";

export default function VideoScreen() {
  const params = useParams();

  const [video, setVideo] = createSignal<Video | undefined>(undefined);

  createEffect(() => {
    setVideo(undefined);
    const req = supabase.from("videos").select().eq("id", params.id);
    req.then(({ data }) => data && setVideo(createVideo(data[0])));
  });

  const recommendations = createVideoList();
  recommendations.fetchVideos();

  return (
    <main class="w-[800px] max-w-full flex flex-col gap-4 pt-[40px] px-4">
      <Card class="overflow-hidden">
        {video()?.data && <MuxPlayer video={video()!} />}
      </Card>

      <div>
        <h1 class="text-3xl font-medium">{video()?.data.title}</h1>
        <p class="text-muted-foreground">{video()?.data.description}</p>
      </div>

      <div class="h-8"></div>
      <h1 class="text-xl font-medium">Gerelateerde video's</h1>
      <div class="grid gap-4 grid-cols-1 md:grid-cols-2">
        <For each={recommendations.videos}>
          {(video) => {
            const [preview, setPreview] = createSignal(false);
            return (
              <A href={`/videos/${video.data.id}`}>
                <Card
                  class="relative overflow-hidden group"
                  onMouseOver={() => setPreview(true)}
                >
                  <Show when={preview()}>
                    <img
                      class="absolute h-full w-full inset-0 object-cover scale-105"
                      src={video.thumbnailUrl({ type: "animated" })}
                      alt=""
                    />
                  </Show>
                  <img
                    class="w-full object-cover scale-105 aspect-video group-hover:opacity-0 transition-opacity duration-300"
                    src={video.thumbnailUrl()}
                    alt=""
                  />

                  <div class="absolute inset-0 bg-gradient-to-t from-background to-transparent">
                    <div class="absolute bottom-0 p-4">
                      <h2 class="text-xl font-medium line-clamp-1 overflow-ellipsis">
                        {video.data.title}
                      </h2>
                      <p class="text-muted-foreground text-sm line-clamp-1 overflow-ellipsis">
                        {video.data.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </A>
            );
          }}
        </For>
      </div>
    </main>
  );
}
