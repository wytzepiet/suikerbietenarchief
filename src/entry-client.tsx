import { mount, StartClient } from "@solidjs/start/client";
import gsap from "gsap-trial";
import { ScrollTrigger } from "gsap-trial/ScrollTrigger";
import { ScrollSmoother } from "gsap-trial/ScrollSmoother";

mount(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  return <StartClient />;
}, document.getElementById("app")!);
