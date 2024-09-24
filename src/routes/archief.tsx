import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { createVideoList } from "@/libs/datamodels/videoList";
import { RouteSectionProps } from "@solidjs/router";
import { For, onMount } from "solid-js";
import gsap from "gsap";
import { TransitionGroup } from "solid-transition-group";
import AnimatedText from "@/components/animatedText";
import Page from "@/components/page";
import { VideoPreview } from "@/components/videoPreview";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

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

  const fetchTrigger = (<div />) as HTMLDivElement;
  onMount(async () => {
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: fetchTrigger,
      start: "top bottom+=200px",
      onEnter: () => videos.fetchMore().then(() => trigger.refresh()),
    });
  });

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
                return <VideoPreview video={video} />;
              }}
            </For>
          </TransitionGroup>
        </div>
        {fetchTrigger}
        <div class="h-32"></div>
      </div>
    </Page>
  );
}
