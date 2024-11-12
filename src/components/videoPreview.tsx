import { Video } from "@/libs/datamodels/video";
import { A } from "@solidjs/router";
import { Card } from "./ui/card";
import { createSignal, Show } from "solid-js";
import { cn } from "@/libs/cn";

export function VideoPreview({
  video,
  showText = true,
  ...props
}: {
  video: Video;
  showText?: boolean;
  class?: string;
}) {
  const [preview, setPreview] = createSignal(false);

  return (
    <A
      href={`/archief/videos/${video.data.id}`}
      class={cn(
        "transition-all duration-300 [&.s-exit-to]:opacity-0 aspect-[3/2]",
        props.class
      )}
      noScroll
    >
      <Card
        class={`video-card w-full h-full relative overflow-hidden group video-${video.data.id}`}
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
          class="w-full h-full object-cover scale-105  group-hover:opacity-0 transition-opacity duration-300"
          src={video.thumbnailUrl()}
          alt=""
        />

        <Show when={showText}>
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
        </Show>
      </Card>
    </A>
  ) as HTMLElement;
}
