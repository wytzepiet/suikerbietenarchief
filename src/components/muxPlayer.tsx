import { cn } from "@/libs/cn";
import "@mux/mux-player";

interface MuxPlayerProps {
  playbackId: string;
  class?: string;
  style?: string;
  autoplay?: boolean;
  muted?: boolean;
  aspectRatio?: string | null;
}

export default function MuxPlayer(props: MuxPlayerProps) {
  if (props.autoplay) props.muted = true;
  const aspectRatio = props.aspectRatio?.replace(":", " / ");

  return (
    <div
      class={cn("relative", props.class)}
      style={aspectRatio ? `aspect-ratio: ${aspectRatio}` : ""}
    >
      {/* @ts-ignore */}
      <mux-player
        class={aspectRatio ? "absolute inset-0" : ""}
        playback-id={props.playbackId}
        autoplay={props.autoplay}
        loop={props.autoplay}
        muted={props.muted}
        style={props.style}
        aspectRatio={props.aspectRatio}
      />
    </div>
  );
}
// o01EPwa914Z4SnGt2E527dU02L5gL69Pb25yvHI9R7cCA
