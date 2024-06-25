import inView from "@/libs/utils/inView";
import styles from "./animatedtext.module.css";
import { mergeProps, onMount } from "solid-js";

interface Props {
  duration?: number;
  remote?: boolean;
  delay?: number;
  children: string;
}
const defaults = { duration: 1000, delay: 0 };

export default function AnimatedText(props: Props) {
  const merged = mergeProps(defaults, props);

  const words = merged.children.split(" ");

  const content = words.map((word, i) => {
    let el: HTMLElement | undefined;

    onMount(() => {
      el?.style.setProperty("transition-delay", `${merged.delay + i * 50}ms`);
      el?.style.setProperty("transition-duration", `${merged.duration}ms`);
    });

    return (
      <span ref={el} class={"whitespace-break-spaces animated " + styles.word}>
        {word + " "}
      </span>
    );
  });

  if (merged.remote) return content;
  return <div use:inView>{content}</div>;
}
