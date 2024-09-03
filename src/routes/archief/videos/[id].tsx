import MuxPlayer from "@/components/muxPlayer";
import { Card } from "@/components/ui/card";
import { Video, createVideo } from "@/libs/datamodels/video";
import { createVideoList } from "@/libs/datamodels/videoList";
import { supabase } from "@/libs/services/supabase/client";
import { A, useParams } from "@solidjs/router";
import {
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import gsap from "gsap-trial/dist/gsap";

export const [video, setVideo] = createSignal<Video | null>(null);

export default function VideoScreen() {
  const params = useParams();

  const recommendations = createVideoList();
  recommendations.fetchVideos();

  if (!video()?.data) {
    const query = supabase.from("videos").select().eq("id", params.id);
    query.then(({ data, error }) => {
      if (error) throw error;
      setVideo(createVideo(data[0]));
    });
  }
  onCleanup(() => setVideo(null));

  let canPlay = false;
  createEffect(() => {
    if (video()?.data) {
      setTimeout(() => {
        const player = document.querySelector("mux-player");
        player?.addEventListener("canplay", () => (canPlay = true));
      }, 1);
    }
  });

  onMount(() => {
    gsap.from(".video-info > *", {
      duration: 1.5,
      ease: "power2.out",
      y: "1.2em",
      opacity: 0,
      stagger: 0.1,
    });
  });

  return (
    <main
      id="main"
      class="w-[800px] max-w-full flex flex-col gap-4 pt-[80px] px-4"
      style={{ opacity: video()?.data ? 1 : 0 }}
    >
      <div class="video-info">
        <Card id="video" class="fade-in overflow-hidden">
          <Show when={video()?.data}>
            <MuxPlayer autoplay video={video()!} />{" "}
          </Show>
          <Show when={!video()?.data}>
            <img src={video()?.thumbnailUrl()} alt="thumbnail" />
          </Show>
        </Card>
        <h1 class="text-3xl font-medium mt-8 mb-2">{video()?.data.title}</h1>
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
