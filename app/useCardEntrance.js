"use client";
import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* Card entrance for the marquee rows (Expertise / What I Do and Featured
   Projects): every card wrapper carries `data-slide-in="left|right"`, and
   each card sweeps in from its own side (opposite directions so odds and
   evens open toward each other) with a rise, a slight scale and a tilt, then
   reverses away when the section scrolls back out.

   It is GSAP-only - no resting state lives in CSS (the resting state is the
   row's plain layout), so with JS unavailable or prefers-reduced-motion the
   cards are simply visible. `immediateRender: false` is important: it defers
   the off-screen / zero-opacity start state until the entrance tween actually
   starts playing, so the cards are NEVER parked invisible - they only hide
   for the duration of their own slide-in. Each card gets its own ScrollTrigger
   so the entrance cascades naturally as the section crosses the viewport, and
   every copy of the duplicated marquee set is covered. */
export default function useCardEntrance() {
  useIsomorphicLayoutEffect(() => {
    const cards = Array.from(document.querySelectorAll("[data-slide-in]"));
    if (!cards.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const tweens = [];
    try {
      cards.forEach((el, i) => {
        const dir = el.getAttribute("data-slide-in") === "right" ? 1 : -1;
        tweens.push(
          gsap.from(el, {
            xPercent: dir * 90,
            y: 28,
            rotate: dir * -1.2,
            scale: 0.95,
            opacity: 0,
            duration: 0.9,
            delay: (i % 6) * 0.05,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true,
            },
          })
        );
      });
    } catch (e) {
      /* A hiccup in one card's entrance must never hide the row. */
    }

    /* Re-measure after the page (webfonts, images) and a short settle-delay,
       so trigger positions are correct if the layout shifted after mount. */
    const refreshTriggers = () => ScrollTrigger.refresh();
    window.addEventListener("load", refreshTriggers);
    const refreshTimer = window.setTimeout(refreshTriggers, 350);

    return () => {
      window.removeEventListener("load", refreshTriggers);
      window.clearTimeout(refreshTimer);
      tweens.forEach((tween) => {
        if (tween.scrollTrigger) tween.scrollTrigger.kill();
        tween.kill();
      });
    };
  }, []);
}