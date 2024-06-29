import PageTitle from "@/components/pageTitle";
import { Card } from "@/components/ui/card";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { createVideoList } from "@/libs/datamodels/videoList";
import { A } from "@solidjs/router";
import { For } from "solid-js";

export default function Archief() {
  const videos = createVideoList();
  videos.fetchVideos();

  return (
    <main class="flex flex-col items-center">
      <PageTitle>Archief</PageTitle>
      <h1>About</h1>

      <div class="w-[1200px] flex flex-col gap-4">
        <TextFieldRoot onChange={videos.search}>
          <TextField placeholder="Zoek een video..."></TextField>
        </TextFieldRoot>
        <div class="grid gap-4  max-w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <For each={videos.videos}>
            {(video) => (
              <A href={`/videos/${video.data.id}`}>
                <Card class="relative overflow-hidden group">
                  <img
                    class="absolute h-full w-full inset-0 object-cover scale-105 hidden group-hover:block"
                    src={video.thumbnailUrl({ type: "animated" })}
                    alt=""
                  />
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
                      <p class="text-muted-foreground text-sm line-clamp-2 overflow-ellipsis">
                        {video.data.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </A>
            )}
          </For>
        </div>
      </div>
    </main>
  );
}
