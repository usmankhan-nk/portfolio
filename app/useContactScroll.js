"use client";
import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* Contact card entrance, driven by a GSAP ScrollTrigger timeline:
   - The form (right card) leads from the right; the Introduction card
     follows 0.12s later from the left, so the pair reads as a staged
     sequence instead of two simultaneous slides.
   - `toggleActions: "play none none reverse"`: entering the section plays
     the entrance, scrolling back above it reverses it, so the cards glide
     away and replay on every re-entry from either direction - the same
     behaviour the old IntersectionObserver + CSS transition pair had.
   - The start offsets mirror that old CSS entrance: ~105% of each card's
     own width on desktop (18% on mobile, where the cards stack), plus a
     small rise, a 0.94 scale and a tilt toward the centre. The values are
     functions so `invalidateOnRefresh` recomputes them after a resize, and
     GSAP owns the transforms entirely - the resting state is simply the
     plain grid layout, exactly what no-JS visitors always see.
   - prefers-reduced-motion: the hook does nothing at all - the cards sit
     in their normal grid position from the start. */
export default function useContactScroll() {
  useIsomorphicLayoutEffect(() => {
    const section = document.getElementById("contact");
    if (!section) return;
    const right = section.querySelector(".contact-right");
    const left = section.querySelector(".contact-left");
    if (!left || !right) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const startState = (dir) => ({
      xPercent: () => dir * (window.innerWidth < 768 ? 18 : 105),
      y: () => (window.innerWidth < 768 ? 14 : 26),
      scale: 0.94,
      rotate: () => dir * (window.innerWidth < 768 ? 1.2 : 1.6),
      opacity: 0,
      duration: 1.1,
      ease: "power4.out",
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      },
    });
    tl.from(right, startState(1), 0);
    tl.from(left, startState(-1), 0.12);

    /* Re-measure the trigger once the page (webfonts, images) and a short
       settle-delay finish, so `top 80%` is never measured against a shifted
       layout. */
    const refreshTriggers = () => ScrollTrigger.refresh();
    window.addEventListener("load", refreshTriggers);
    const refreshTimer = window.setTimeout(refreshTriggers, 350);

    return () => {
      window.removeEventListener("load", refreshTriggers);
      window.clearTimeout(refreshTimer);
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
      gsap.set([left, right], { clearProps: "all" });
    };
  }, []);
}
