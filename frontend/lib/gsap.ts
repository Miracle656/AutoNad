import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register all GSAP plugins once
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // Set default ease
  gsap.defaults({ ease: "power3.out" });
}

export { gsap, ScrollTrigger };
