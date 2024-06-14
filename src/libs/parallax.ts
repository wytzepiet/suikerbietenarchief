import { onMount } from "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      parallax: number;
    }
  }
}

export default function parallax(el: HTMLElement, speed: () => number) {
  let rect = el.getBoundingClientRect();
  let offset = 0;
  const initialOffset = 0;
  const center = () => window.innerHeight / 2 + initialOffset;
  const offsetFromCenter = () => rect.top + rect.height / 2 - center() - offset;
  const getOffset = () => offsetFromCenter() * (speed() - 1);
  function getThresholds() {
    if (speed() < 1) return { top: -20, bottom: window.innerHeight + 20 };
    return { top: offset, bottom: window.innerHeight + offset };
  }
  function move() {
    const newOffset = getOffset();
    if (newOffset === offset) return;
    el.style.setProperty("transform", `translate(0px, ${getOffset()}px)`);
    offset = newOffset;
  }
  function scroll() {
    rect = el.getBoundingClientRect();
    const thresholds = getThresholds();
    const inView = rect.top < thresholds.bottom && rect.bottom > thresholds.top;
    if (inView) move();
  }
  function handleScroll() {
    window.requestAnimationFrame(scroll);
  }

  onMount(() => {
    move();
    window.addEventListener("resize", handleScroll);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  });
}
