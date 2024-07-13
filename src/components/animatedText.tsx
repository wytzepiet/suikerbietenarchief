import { ComponentProps, onMount } from "solid-js";
import gsap from "gsap-trial/dist/gsap";

interface Props {
  duration?: number;
  remote?: boolean;
  delay?: number;
  children: any;
  class?: string;
}

export default function AnimatedText(props: ComponentProps<"div"> & Props) {
  const content = (
    <div
      class={"opacity-0 " + props.class}
      style="clip-path: inset(0px 0px 0px 0px)"
    >
      {props.children}
    </div>
  ) as HTMLElement;

  onMount(async () => {
    const { SplitText } = await import("gsap-trial/SplitText");
    await import("gsap-trial/dist/ScrollTrigger");
    const split = new SplitText(content);

    content.style.opacity = "1";
    gsap.from(split.chars, {
      duration: 1.5,
      delay: (props.delay ?? 100) / 1000,
      ease: "power4.out",
      y: "1.2em",
      clipPath: "inset(0 0 100% 0)",
      stagger: 0.015,
      scrollTrigger: {
        trigger: content,
        start: "top 80%",
        end: "bottom 20%",
      },
    });
    // const split = new SplitText(content);
    // gsap.from(split.chars, {
    //   duration: 1,
    //   y: 100,
    //   autoAlpha: 0,
    //   stagger: 0.05,
    //   scrollTrigger: content,
    // });
  });

  // setContent(new SplitText(props.children, { type: "words,chars" }));
  // const merged = mergeProps(defaults, props);
  // const tl = gsap.timeline({ delay: merged.delay });
  // tl.from(content().chars, {
  //   duration: merged.duration / 1000,
  //   opacity: 0,
  //   y: 20,
  //   stagger: 0.02,
  // });

  return content;
}
