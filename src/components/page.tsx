import PageTitle from "./pageTitle";
import { isServer } from "solid-js/web";
import { onCleanup, onMount, Show } from "solid-js";
import { useLocation } from "@solidjs/router";

const scrollPositions: { [path: string]: number } = {};
let scrollSmooth: ScrollSmoother | null = null;

const Page = (props: {
  title?: string;
  class?: string;
  hideUntilMounted?: boolean;
  saveScrollY?: boolean;
  children: any;
}) => {
  const { pathname } = useLocation();

  if (!isServer && props.hideUntilMounted) {
    document.body.style.opacity = "0";
    onMount(() => (document.body.style.opacity = "1"));
  }

  onMount(async () => {
    if (!scrollSmooth) {
      const { ScrollSmoother } = await import("gsap-trial/ScrollSmoother");
      scrollSmooth = ScrollSmoother.create({
        smooth: 1, // how long (in seconds) it takes to "catch up" to the native scroll position
        effects: true, // looks for data-speed and data-lag attributes on elements
        smoothTouch: 0.1, // much shorter smoothing time on touch devices (default is NO smoothing on touch devices)
      });
    }

    if (props.saveScrollY && scrollPositions[pathname]) {
      scrollSmooth.scrollTo(scrollPositions[pathname], false);
    }
  });

  const savePosition = () => (scrollPositions[pathname] = window.scrollY);
  if (!isServer && props.saveScrollY) onCleanup(savePosition);

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