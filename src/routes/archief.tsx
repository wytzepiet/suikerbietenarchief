import { Card } from "@/components/ui/card";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { createVideoList } from "@/libs/datamodels/videoList";
import { A, RouteSectionProps } from "@solidjs/router";
import { For, Show, createSignal, onMount } from "solid-js";
import gsap from "gsap/dist/gsap";
import { TransitionGroup } from "solid-transition-group";
import AnimatedText from "@/components/animatedText";
import Page from "@/components/page";

const videos = createVideoList();

export default function Archief(props: RouteSectionProps) {
  // if (props.children) return props.children;

  const animateVideos = () => {
    onMount(() => {
      videos.videos[0];
      gsap.from(".video-card", {
        duration: 1.5,
        ease: "power2.out",
        y: "1.2em",
        opacity: 0,
        // clipPath: "inset(0 0 100% 0)",
        stagger: 0.05,
      });
    });
  };

  if (videos.videos.length) animateVideos();
  else videos.fetchVideos().then(animateVideos);

  onMount(() => {
    gsap.from(".search-bar", {
      duration: 1.5,
      ease: "power2.out",
      y: "1.2em",
      opacity: 0,
      stagger: 0.05,
    });
  });
  return (
    <Page
      title="Archief"
      class="w-[1200px] max-w-full flex flex-col gap-4 pt-[50px] px-4"
      hideUntilMounted
    >
      {props.children}

      <div class="archief flex flex-col gap-4">
        <div>
          <h1 class="page-title font-medium text-6xl">
            <AnimatedText>Archief</AnimatedText>
          </h1>
          <TextFieldRoot onChange={videos.search} class="search-bar max-w-md">
            <TextField placeholder="Zoek een video..."></TextField>
          </TextFieldRoot>
        </div>
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <TransitionGroup>
            <For each={videos.videos.map((v) => v.data.id)}>
              {(_, i) => {
                const video = videos.videos[i()];
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
              }}
            </For>
          </TransitionGroup>
        </div>
        <div class="h-screen"></div>
      </div>
    </Page>
  );
}
