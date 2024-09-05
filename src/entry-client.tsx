import { mount, StartClient } from "@solidjs/start/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

mount(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  return <StartClient />;
}, document.getElementById("app")!);
