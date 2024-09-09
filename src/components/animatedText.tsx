import { mergeProps, onMount } from "solid-js";
import { cn } from "@/libs/cn";

interface Props {
  duration?: number;
  remote?: boolean;
  delay?: number;
  children: any;
  class?: string;
  tweenVars?: gsap.TweenVars;
  scrollTrigger?: ScrollTrigger.StaticVars | false;
}

export default function AnimatedText(props: Props) {
  const content = (
    <div
      class={cn("opacity-0", props.class)}
      style="clip-path: inset(0px 0px 0px 0px)"
    >
      {props.children}
    </div>
  ) as HTMLElement;

  onMount(async () => {
    const [{ gsap }, { SplitText }, { ScrollTrigger }] = await Promise.all([
      import("gsap"),
      import("gsap/SplitText"),
      import("gsap/ScrollTrigger"),
    ]);

    gsap.registerPlugin(SplitText, ScrollTrigger);
    const split = new SplitText(content);

    gsap.from(
      split.chars,
      mergeProps(props.tweenVars, {
        duration: 1.5,
        delay: (props.delay ?? 100) / 1000,
        ease: "power4.out",
        y: "1.2em",
        clipPath: "inset(0 0 100% 0)",
        stagger: 0.01,
        scrollTrigger:
          props.scrollTrigger != false
            ? mergeProps(props.scrollTrigger, {
                trigger: content,
                start: "top 80%",
                end: "bottom 20%",
              })
            : undefined,
      })
    );
    content.style.opacity = "1";
  });

  return content;
}
