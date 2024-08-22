import { mount, StartClient } from "@solidjs/start/client";
import gsap from "gsap-trial";
import { ScrollTrigger } from "gsap-trial/ScrollTrigger";
import { ScrollSmoother } from "gsap-trial/ScrollSmoother";
import { SplitText } from "gsap-trial/SplitText";
import { Flip } from "gsap-trial/Flip";

mount(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, Flip);
  return <StartClient />;
}, document.getElementById("app")!);
