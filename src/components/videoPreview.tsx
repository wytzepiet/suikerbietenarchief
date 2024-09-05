import { Video } from "@/libs/datamodels/video";
import { A } from "@solidjs/router";
import { Card } from "./ui/card";
import { createSignal, Show } from "solid-js";

export function VideoPreview({ video }: { video: Video }) {
  const [preview, setPreview] = createSignal(false);

  return (
    <A
      href={`/archief/videos/${video.data.id}`}
      class="transition-all duration-300 [&.s-exit-to]:opacity-0 aspect-[3/2]"
      noScroll
    >
      <Card
        class={`video-card relative overflow-hidden group video-${video.data.id}`}
        data-flip-id={video.data.id}
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
          class="w-full object-cover scale-105  group-hover:opacity-0 transition-opacity duration-300"
          src={video.thumbnailUrl()}
          alt=""
        />

        <div class="absolute inset-0 bg-gradient-to-t from-background to-transparent">
          <div class="absolute bottom-0 p-4">
            <h2 class="text-2xl font-medium line-clamp-1 overflow-ellipsis">
              {video.data.title}
            </h2>
            <p class="text-muted-foreground text-sm line-clamp-1 overflow-ellipsis">
              {video.data.description}
            </p>
          </div>
        </div>
      </Card>
    </A>
  ) as HTMLElement;
}
