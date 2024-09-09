import PageTitle from "./pageTitle";
import { isServer } from "solid-js/web";
import { onMount, Show } from "solid-js";

let scrollSmoother: ScrollSmoother | null = null;

const Page = (props: {
  title?: string;
  class?: string;
  hideUntilMounted?: boolean;
  saveScrollY?: boolean;
  children: any;
}) => {
  if (!isServer && props.hideUntilMounted) {
    document.body.style.opacity = "0";
    onMount(() => (document.body.style.opacity = "1"));
  }

  onMount(async () => {
    console.log("loading scrollSmooth");
    const { ScrollSmoother } = await import("gsap/ScrollSmoother");
    scrollSmoother?.kill();
    scrollSmoother = ScrollSmoother.create({
      smooth: 1, // how long (in seconds) it takes to "catch up" to the native scroll position
      effects: true, // looks for data-speed and data-lag attributes on elements
      smoothTouch: 0.1, // much shorter smoothing time on touch devices (default is NO smoothing on touch devices)
    });
  });

  return (
    <main class={props.class}>
      <Show when={props.title}>
        <PageTitle>{props.title!}</PageTitle>
      </Show>
      {props.children}
    </main>
  );
};

export default Page;
