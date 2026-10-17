"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* Global smooth scrolling (Lenis) wired into the GSAP ticker so the hero
   frame-sequence scrub, every ScrollTrigger entrance and native scrolling all
   share one eased clock. The easing is intentionally gentle (an ease-out-expo
   curve over ~1.15s) so the page still feels responsive, never floaty.

   prefers-reduced-motion: Lenis is never created, so the page falls back to
   the browser's native (instant) scrolling and the hero shows its static
   poster frame. */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    /* Route in-page anchor clicks through Lenis so they glide instead of
       jumping, and clear the fixed nav (76px). */
    const onClick = (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -76, duration: 1.2 });
    };
    document.addEventListener("click", onClick);

    /* Lenis owns the scroll position now - re-measure every trigger once. */
    ScrollTrigger.refresh();

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return null;
}
