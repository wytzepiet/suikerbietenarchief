import { cn } from "@/libs/cn";
import { Video } from "@/libs/datamodels/video";
import "@mux/mux-player";

interface MuxPlayerProps {
  video: Video;
  class?: string;
  style?: string;
  autoplay?: boolean;
  muted?: boolean;
}

export default function MuxPlayer(props: MuxPlayerProps) {
  if (props.autoplay) props.muted = true;
  const aspectRatio = () =>
    props.video.data.aspect_ratio?.replace(":", " / ") ?? "16 / 9";

  return (
    <div
      class={cn("relative", props.class)}
      style={`aspect-ratio: ${aspectRatio()}; --media-accent-color: hsl(var(--muted-foreground))`}
    >
      {/* @ts-ignore */}
      <mux-player
        class="absolute inset-0 object-cover"
        playback-id={props.video.data.playback_id}
        autoplay={props.autoplay}
        loop={props.autoplay}
        muted={props.muted}
        style={props.style}
      />
    </div>
  );
}
// o01EPwa914Z4SnGt2E527dU02L5gL69Pb25yvHI9R7cCA
