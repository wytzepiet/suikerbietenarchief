import "@mux/mux-player";

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
      {/* @ts-ignore */}
      <mux-player
        class={props.class}
        playback-id="o01EPwa914Z4SnGt2E527dU02L5gL69Pb25yvHI9R7cCA"
        autoplay={props.autoplay}
        loop={props.autoplay}
        muted={props.muted}
        style={props.style}
      />
    </>
  );
}
