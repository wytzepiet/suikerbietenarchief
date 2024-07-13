import PageTitle from "@/components/pageTitle";
import { Card } from "@/components/ui/card";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { createVideoList } from "@/libs/datamodels/videoList";
import { A } from "@solidjs/router";
import { For, Show, createSignal } from "solid-js";

export default function Archief() {
  const videos = createVideoList();
  videos.fetchVideos();

  return (
    <main class="w-[1200px] max-w-full flex flex-col gap-4 pt-[50px] px-4">
      <PageTitle>Archief</PageTitle>

      <div>
        <h1 class="font-medium text-3xl">Archief</h1>
        <TextFieldRoot onChange={videos.search} class="max-w-md">
          <TextField placeholder="Zoek een video..."></TextField>
        </TextFieldRoot>
      </div>
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <For each={videos.videos}>
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
