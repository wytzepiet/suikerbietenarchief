import { cn } from "@/libs/cn";
import { mux } from "@/libs/mux/server";
import "@mux/mux-player";
import { createResource } from "solid-js";

interface MuxPlayerProps {
  playbackId: string;
  class?: string;
  style?: string;
  autoplay?: boolean;
  muted?: boolean;
}

export default function MuxPlayer(props: MuxPlayerProps) {
  if (props.autoplay) props.muted = true;

  return (
    <>
      <div class={cn("relative", props.class)}>
        <img
          class="w-full opacity-0"
          src={`https://image.mux.com/${props.playbackId}/thumbnail.webp`}
          alt="Video thumbnail"
        />
        {/* @ts-ignore */}
        <mux-player
          class={"absolute inset-0"}
          playback-id={props.playbackId}
          autoplay={props.autoplay}
          loop={props.autoplay}
          muted={props.muted}
          style={props.style}
        />
      </div>
    </>
  );
}
// o01EPwa914Z4SnGt2E527dU02L5gL69Pb25yvHI9R7cCA
