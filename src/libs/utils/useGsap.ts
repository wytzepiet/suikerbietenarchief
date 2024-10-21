import { gsap as gs } from "gsap";
import { onMount } from "solid-js";
import { isServer } from "solid-js/web";

export const useGsap = async (
  fn: (gsap: typeof gs, all: typeof import("gsap/all")) => void
) => {
  if (isServer) return;
  const all = import("gsap/all");
  onMount(async () => {
    fn(gs, await all);
  });
};
