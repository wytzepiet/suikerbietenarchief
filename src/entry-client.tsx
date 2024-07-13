import { mount, StartClient } from "@solidjs/start/client";
import gsap from "gsap-trial";
import { ScrollTrigger } from "gsap-trial/ScrollTrigger";
import { ScrollSmoother } from "gsap-trial/ScrollSmoother";
import { SplitText } from "gsap-trial/SplitText";

mount(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
  return <StartClient />;
}, document.getElementById("app")!);
