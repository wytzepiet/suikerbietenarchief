import { Video } from "@/libs/datamodels/video";
import { createVideoList } from "@/libs/datamodels/videoList";
import { useGsap } from "@/libs/utils/useGsap";
import { onMount } from "solid-js";

export const VideoFetchTrigger = ({
  videos,
}: {
  videos: ReturnType<typeof createVideoList>;
}) => {
  const fetchTrigger = (<div />) as HTMLDivElement;

  useGsap((gsap, { ScrollTrigger }) => {
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: fetchTrigger,
      start: "top bottom+=200px",
      onEnter: () => videos.fetchMore().then(() => trigger.refresh()),
    });
  });

  return fetchTrigger;
};
