"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createFrameSequence, TOTAL_FRAMES } from "./heroFrames";
import useReveal from "./useReveal";
import useCardEntrance from "./useCardEntrance";
import useContactScroll from "./useContactScroll";
import useHeadingReveal from "./useHeadingReveal";
import useSignatureReveal from "./useSignatureReveal";
import GlowingSquares from "./components/GlowingSquares";
import InfiniteMarquee from "./components/InfiniteMarquee";
import TechnologyMarquee from "./components/TechnologyMarquee";
import RotatingSquare from "./components/RotatingSquare";
import ContactForm from "./components/ContactForm";
import SignatureSection from "./components/SignatureSection";
import { contact, hero, nav, profile, projects, services, socials, technologyRows } from "./data/portfolio";

function Silhouette({ className = "" }) {
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMax slice" className={className}>
      <rect width="300" height="400" fill="#f3e9e8" />
      <circle cx="150" cy="130" r="58" fill="#e6c9c9" />
      <path d="M40 400c0-90 50-140 110-140s110 50 110 140z" fill="#e6c9c9" />
    </svg>
  );
}

function PhotoSlot({ src, onPick, className = "", children }) {
  return (
    <div
      className={`relative overflow-hidden cursor-pointer bg-white/10 ${className}`}
      onClick={onPick}
      title="Click to add your photo"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="Portrait" className="relative z-10 w-full h-full object-cover object-top" />
      ) : (
        <Silhouette className="w-full h-full" />
      )}
      {children}
    </div>
  );
}

/* Expertise tile: a compact, square-like card (a touch taller than square on
   tiny phones, an exact square from sm up) instead of the old tall rectangle.
   The internal flex column keeps every tile aligned as they glide past:
     • the ". Host" label and the title are pinned to the top (with a reserved
       two-line title box so single-line titles don't shift the rest up),
     • the description is `flex-1`, absorbing whatever height is left, and
     • the tech badge always sits flush against the bottom edge.
   The fixed aspect ratio makes all tiles identical, so nothing is cramped. */
function ServiceCard({ s, i }) {
  return (
    <div className="group flex w-full aspect-[5/6] flex-col rounded-3xl border border-line/60 bg-slate p-5 text-left transition duration-300 hover:border-gold/60 hover:shadow-[0_24px_50px_-24px_rgba(212,175,55,0.45)] sm:aspect-square sm:p-6">
      <span className="mono-label !text-ink/45">. Host 0{i + 1}</span>
      {/* Reserved two-line box keeps every title at the same baseline. */}
      <h3 className="mb-2 mt-3 min-h-[2.75em] text-[clamp(1rem,1.15vw,1.2rem)] font-bold leading-snug text-white">
        {s.t}
      </h3>
      {/* flex-grow soaks up the height difference and pins the badge down. */}
      <p className="flex-1 text-[12.5px] leading-relaxed text-ink/70 sm:text-[13px]">{s.d}</p>
      <span className="mono-label mt-4 inline-flex w-fit items-center rounded-full border border-line bg-ash px-3 py-1.5 !text-gold transition group-hover:border-gold/50">
        {s.c}
      </span>
    </div>
  );
}

function ProjectCard({ p, i }) {
  return (
    <div className="text-left border border-line/60 bg-slate rounded-2xl p-6 h-full hover:border-gold/60 hover:shadow-[0_20px_40px_-22px_rgba(212,175,55,0.3)] transition">
      <div className="flex justify-between items-center">
        <span className="mono-label !text-ink/45">. Project 0{i + 1}</span>
        <span className="mono-label !text-gold border border-gold/40 rounded-full px-3 py-1 bg-ash">{p.tag}</span>
      </div>
      <h3 className="text-[clamp(1.05rem,1.6vw,1.25rem)] font-bold mt-3 mb-2 text-white">{p.n}</h3>
      <p className="text-ink/70 text-[13px] leading-relaxed">{p.d}</p>
      <div className="flex flex-wrap gap-2 mt-4">
        {p.tech.map((t) => (
          <span key={t} className="mono-label !text-ink border border-line rounded-full px-3 py-1 bg-ash">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  useReveal();
  useCardEntrance();
  useContactScroll();
  useHeadingReveal();
  useSignatureReveal();
  const heroRef = useRef(null);
  const heroStageRef = useRef(null);
  const heroSceneRef = useRef(null);
  const heroCanvasRef = useRef(null);
  const heroFrameImgRef = useRef(null);
  const lastFrameRef = useRef(-1);
  const aboutCanvasRef = useRef(null);
  const aboutFrameImgRef = useRef(null);
  const aboutLastFrameRef = useRef(-1);
  const fileRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const [photo, setPhoto] = useState(null);
  const [active, setActive] = useState("home");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(profile.photoStorageKey);
      if (saved) setPhoto(saved);
    } catch (e) {}
  }, []);

  /* Shared hero scrub math: the same progress → word / scale / opacity
     mapping the hero has always used, so the GSAP timeline and the
     reduced-motion fallback behave identically. */
  function heroProgress() {
    const el = heroRef.current;
    if (!el) return 0;
    const max = el.offsetHeight - window.innerHeight;
    /* Rect-based: -rect.top equals scroll past the header top (which now
       begins 76px below the page top under the fixed nav), so progress
       stays exactly in lockstep with the ScrollTrigger `top top` → `bottom
       bottom` range even though the header no longer starts at y=0. */
    const rect = el.getBoundingClientRect();
    return Math.min(1, Math.max(0, -rect.top / Math.max(1, max)));
  }

  /* The word swap is the only stateful part of the scrub (it re-renders React
     just 3 times across the whole timeline). Scale and fade are written
     straight to the DOM through refs, so scrubbing at 60-120fps never triggers
     a React re-render. `animate: false` is the prefers-reduced-motion path:
     words still swap, but the scene stays static. */
  function applyHeroProgress(value, { animate = true } = {}) {
    const p = Math.min(1, Math.max(0, value));
    const i = Math.min(hero.words.length - 1, Math.floor(p * hero.words.length * 0.92));
    setIdx((prev) => (prev === i ? prev : i));
    if (!animate) return;
    const scene = heroSceneRef.current;
    if (scene) scene.style.transform = `scale(${1 + p * 0.12})`;
    const stage = heroStageRef.current;
    if (stage) stage.style.opacity = String(1 - Math.max(0, (p - 0.85) / 0.15));
  }

  /* Paints one sequence frame onto a canvas.

      `fit` picks the scaling:
        "cover"  - scale up until the canvas is filled edge to edge; whatever
                   overflows is cropped (About portrait).
        "contain" - the WHOLE frame stays visible at its own aspect ratio,
                   nothing is ever cropped (hero: the head/hood can no longer
                   be cut off the top). Any empty bands left over are filled
                   with `bg` first, so they blend into the dark stage instead
                   of showing as transparent gutters.

      `align` positions the image inside the canvas: "center" (default),
      "top" or "bottom". Both `ImageBitmap` (width/height) and `<img>`
      (naturalWidth/naturalHeight) are handled. The backing store is bounded
      so a high-DPR screen never allocates an unbounded bitmap. */
  const MAX_CANVAS_SIDE = 2048;
  /* Hero paint: contain so the entire image fits, on the stage's coal
     background (#050505) so the letterbox bands are invisible. */
  const HERO_PAINT = { fit: "contain", bg: "#050505" };
  function paintFrame(canvas, image, options = {}) {
    if (!canvas || !image) return;
    const { fit = "cover", align = "center", bg = null } = options;
    const iw = image.naturalWidth || image.width;
    const ih = image.naturalHeight || image.height;
    if (!iw || !ih) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = Math.max(1, Math.round(rect.width * dpr));
    let h = Math.max(1, Math.round(rect.height * dpr));
    const longest = Math.max(w, h);
    if (longest > MAX_CANVAS_SIDE) {
      const k = MAX_CANVAS_SIDE / longest;
      w = Math.max(1, Math.round(w * k));
      h = Math.max(1, Math.round(h * k));
    }
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const scale = fit === "contain" ? Math.min(w / iw, h / ih) : Math.max(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const ox = (w - dw) / 2;
    const oy = align === "top" ? 0 : align === "bottom" ? h - dh : (h - dh) / 2;
    ctx.clearRect(0, 0, w, h);
    if (bg && (dw < w || dh < h)) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(image, ox, oy, dw, dh);
  }

  /* One shared frame sequence serves BOTH portrait canvases - hero and About.
     The hero canvas is driven by the GSAP ScrollTrigger scrub below; the About
     canvas by its own ScrollTrigger scrub. The loader keeps a per-consumer
     active frame, so a frame fetched for one portrait is reused by the other. */
  useEffect(() => {
    const hero = heroRef.current;
    const heroCanvas = heroCanvasRef.current;
    const about = document.getElementById("about");
    const aboutCanvas = aboutCanvasRef.current;
    if (!hero || !heroCanvas) return;

    const seq = createFrameSequence({
      onFrame: (id, index, image) => {
        if (id === "about") {
          if (!aboutCanvas) return;
          aboutFrameImgRef.current = image;
          paintFrame(aboutCanvas, image, { align: "top" });
        } else {
          heroFrameImgRef.current = image;
          /* Contain: the whole 1280x720 frame stays visible - the head can
             never be cut off the top - with the side bands painted coal so
             they blend into the stage. */
          paintFrame(heroCanvas, image, HERO_PAINT);
        }
      },
    });
    lastFrameRef.current = -1;
    aboutLastFrameRef.current = -1;
    applyHeroProgress(heroProgress());

    /* Frame index for scroll progress p across the 192-frame reel: p=0 is
       frame 0 and p=1 is exactly the last frame. */
    const frameAt = (p) => Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(p * (TOTAL_FRAMES - 1))));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      /* Reduced motion: no ScrollTrigger, no scrub - both canvases settle on a
         single static frame while the word swap / scale / fade keep running on
         the plain scroll listener they always used. */
      seq.request("hero", 0, { single: true });
      if (aboutCanvas) seq.request("about", 0, { single: true });
      const onScroll = () => applyHeroProgress(heroProgress(), { animate: false });
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => {
        window.removeEventListener("scroll", onScroll);
        seq.dispose();
      };
    }

    gsap.registerPlugin(ScrollTrigger);
    const timelines = [];

    /* Hero "sweet pin": the stage is pinned visually by its own CSS sticky
       positioning (.hero-stage { top: 76px; height: calc(100vh - 76px) }.)
       `top top` → `bottom bottom` on the 400vh header makes progress 0→1 span
       exactly the 300vh runway, and that pinned runway is synchronised with
       the sticky range (both compute out to 76px → 76px + 3 × viewport).
       So the visitor CANNOT leave the hero early: the stage stays glued in
       the viewport below the nav until progress hits 1 (the last frame of
       the sequence, the last frame of the reel), and only then unpins and
       scrolls away letting the About section arrive.

       One scrubbed timeline owns EVERYTHING: the word swap / scale / fade
       polish AND the frame sequence. On every scrub tick the proxy `p`
       (0 → 1, linear) maps onto frame 0 … 191 and looks that frame straight
       up in the fully-preloaded array, then paints it via ctx.drawImage
       (contain - nothing cropped, DPR-aware, size-capped - see paintFrame).
       Because all 192 frames are already decoded in memory, the lookup is
       instant: no network wait, no missing frames, even mid flick-scroll.
       lastFrameRef dedupes so the loader is only asked on an actual frame
       change; during the initial warm-up the loader paints the nearest frame
       that has arrived and sharpens the moment the wanted one lands, so the
       canvas never blanks. */
    const scrub = { p: 0 };
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom bottom",
        /* Short 0.1s catch-up: the scrub tracks the scroll almost instantly
           and linearly instead of lagging ~0.6s behind. */
        scrub: 0.1,
      },
    });
    tl.to(scrub, {
      p: 1,
      duration: 1,
      ease: "none",
      onUpdate: () => {
        applyHeroProgress(scrub.p);
        const frame = frameAt(scrub.p);
        if (frame !== lastFrameRef.current) {
          lastFrameRef.current = frame;
          seq.request("hero", frame);
        }
      },
    });
    timelines.push(tl);

    /* Kick off the sequence at the frame the page loaded on (usually 0), so
       the hero footage appears as soon as the first decode lands. */
    lastFrameRef.current = frameAt(heroProgress());
    seq.request("hero", lastFrameRef.current);

    /* Re-measure every ScrollTrigger once the page (webfonts, frames list,
       images) and a short settle-delay have finished, so the hero and About
       scrub ranges are correct - never a stale start/end if layout shifted. */
    const refreshTriggers = () => ScrollTrigger.refresh();
    window.addEventListener("load", refreshTriggers);
    const refreshTimer = window.setTimeout(refreshTriggers, 350);

    /* About: the portrait is a normal in-flow element, so its sequence is
       scrubbed across the section's whole passage through the viewport -
       first frame as the section enters from below, last frame as it leaves
       through the top. */
    if (about && aboutCanvas) {
      const aboutScrub = { p: 0 };
      const aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: about,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      });
      aboutTl.to(aboutScrub, {
        p: 1,
        duration: 1,
        ease: "none",
        onUpdate: () => {
          const frame = frameAt(aboutScrub.p);
          if (frame !== aboutLastFrameRef.current) {
            aboutLastFrameRef.current = frame;
            seq.request("about", frame);
          }
        },
      });
      timelines.push(aboutTl);
      aboutLastFrameRef.current = 0;
      seq.request("about", 0);
    }

    return () => {
      window.removeEventListener("load", refreshTriggers);
      window.clearTimeout(refreshTimer);
      timelines.forEach((t) => {
        if (t.scrollTrigger) t.scrollTrigger.kill();
        t.kill();
      });
      seq.dispose();
    };
  }, []);

  /* Keeps both canvases crisp after a resize / orientation change by
     re-drawing the frames that are already in hand (no refetch). */
  useEffect(() => {
    let t;
    function onResize() {
      clearTimeout(t);
      t = setTimeout(() => {
        if (heroFrameImgRef.current)
          paintFrame(heroCanvasRef.current, heroFrameImgRef.current, HERO_PAINT);
        if (aboutFrameImgRef.current)
          paintFrame(aboutCanvasRef.current, aboutFrameImgRef.current, { align: "top" });
      }, 120);
    }
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const ids = nav.map((n) => n.toLowerCase());
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      setPhoto(r.result);
      try {
        localStorage.setItem(profile.photoStorageKey, r.result);
      } catch (err) {}
    };
    r.readAsDataURL(f);
  }

  const w = hero.words[idx];

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />

      {/* NAV */}
      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between gap-3 border-b border-gold/20 bg-coal/95 px-4 py-3.5 shadow-[0_4px_24px_-16px_rgba(0,0,0,0.9)] backdrop-blur sm:px-5 md:px-10">
        <a href="#home" className="min-w-0 truncate font-black text-base text-gold sm:text-lg">
          {profile.name}<span className="text-gold">.</span>
        </a>
        <ul className="hidden md:flex gap-4 lg:gap-7 text-[11.5px] md:text-[12px] font-medium">
            {nav.map((n) => {
              const id = n.toLowerCase();
              return (
                <li key={n}>
                  <a
                    href={`#${id}`}
                    className={`relative after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:rounded-full after:bg-gold after:transition-all after:duration-300 ${
                      active === id
                        ? "text-gold font-bold after:w-full"
                        : "text-ink hover:text-gold after:w-0 hover:after:w-full"
                    }`}
                  >
                    {n}
                  </a>
                </li>
              );
            })}
          </ul>
        <a href="#contact" className="shrink-0 rounded-full bg-gold text-black text-[12px] font-bold px-4 sm:px-5 py-2.5 shadow-[0_6px_20px_-10px_rgba(212,175,55,0.5)] hover:bg-gold-bright transition">
          Hire Me
        </a>
      </nav>

      {/* HERO */}
      <header ref={heroRef} id="home" className="relative bg-coal mt-[76px]" style={{ height: "400vh" }}>
        <div ref={heroStageRef} className="hero-stage sticky overflow-hidden bg-coal">
          {/* soft gold glow */}
          <div className="hero-glow" aria-hidden="true" />

          {/* Full-bleed scroll-scrubbed frame sequence. The canvas sits
              directly and transparently on the dark stage - no frame, border,
              radius or shadow. An uploaded photo paints over the frames as the
              next layer, still beneath the text. */}
          <div ref={heroSceneRef} className="hero-scene">
            <canvas ref={heroCanvasRef} className="hero-canvas" aria-hidden="true" />
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Portrait" className="hero-photo" />
            ) : null}
          </div>

          {/* Readability scrim: keeps the copy/CTAs legible over the footage
              without drawing a box around the scene. */}
          <div className="hero-scrim" aria-hidden="true" />

          <div className="hero-copy absolute left-4 md:left-10 top-[34%] md:top-[44%] z-10 max-w-[92vw] md:max-w-[42vw]">
            <div className="hero-eyebrow mono-label mb-3 !text-white/60">
              Hi, I&apos;m <span className="text-white underline decoration-gold-bright underline-offset-4">{profile.name}</span>
            </div>
            <h1 className="hero-title font-black uppercase leading-[1.04] tracking-tight text-[clamp(1.85rem,5.3vw,3.95rem)] text-white">
              {w.h[0]}
              <br />
              <span className="text-gold-bright">{w.h[1]}</span>
            </h1>
          </div>

          <div className="hidden md:block absolute right-10 top-[40%] w-[280px] z-10">
            <div className="hero-blurb-lead mono-label !text-white/60">{w.s}</div>
            <p className="hero-blurb-body mt-2.5 text-[13px] leading-relaxed text-white/75">{w.d}</p>
          </div>

          <div className="hero-cta absolute right-4 md:right-10 bottom-10 md:bottom-16 z-10 flex flex-wrap gap-2.5">
            <a href="#projects" className="rounded-full bg-gold text-black text-[12px] font-bold px-4 md:px-5 py-2.5 shadow-[0_10px_30px_-12px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 hover:bg-gold-bright transition">
              View My Work
            </a>
            <a href="#contact" className="rounded-full border border-gold/60 text-gold-bright text-[12px] font-bold px-4 md:px-5 py-2.5 hover:-translate-y-0.5 hover:bg-gold hover:border-gold hover:text-black transition">
              Contact Me
            </a>
          </div>
          <div className="hidden sm:block hero-cta absolute left-4 md:left-10 bottom-10 md:bottom-16 mono-label !text-white/50 z-10">
            ↓ Scroll to scrub timeline
          </div>
        </div>
      </header>

      {/* ABOUT */}
      <section id="about" className="bg-ash px-5 py-20 md:px-10 md:py-24 lg:py-28">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[300px_1fr] gap-10 md:gap-14 items-center reveal">
          <div className="relative w-full max-w-[300px] aspect-[3/4] mx-auto md:mx-0">
            <GlowingSquares className="absolute inset-0" />
            <RotatingSquare />
            <PhotoSlot
              src={photo}
              onPick={() => fileRef.current?.click()}
              className="relative w-full h-full rounded-[28px] border border-gold/30 shadow-[0_0_90px_-25px_rgba(212,175,55,0.35)] z-10"
            >
              {/* Second scroll-scrubbed sequence: same frames as the hero,
                  scrubbed across this section's passage through the viewport.
                  Sits under the z-10 portrait and the z-20 badge, so an
                  uploaded photo (or the status bar) always paints above it. */}
              <canvas ref={aboutCanvasRef} className="absolute inset-0 block w-full h-full" aria-hidden="true" />
              <div className="absolute left-3 right-3 bottom-3 z-20 bg-black/25 backdrop-blur text-white rounded-xl px-4 py-2.5 flex justify-between items-center">
                <span className="mono-label !text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold-bright inline-block" />
                  {profile.statusBadge}
                </span>
                <span className="mono-label !text-white">{profile.yearBadge}</span>
              </div>
            </PhotoSlot>
          </div>
          <div>
            <span className="mono-label !text-gold border border-line rounded-full px-3.5 py-1.5 bg-slate">. System profile</span>
            <h2 className="section-heading font-black about-title mt-4 mb-4 text-white">
              {profile.headline} <span className="text-gold">{profile.name}</span>
            </h2>
            <p className="text-ink/70 leading-relaxed max-w-xl text-[15px]">{profile.bio}</p>
            <div className="mt-7 grid grid-cols-3 gap-2.5 sm:gap-3">
              {profile.stats.map(({ a, b }) => (
                <div key={a} className="border border-line bg-slate rounded-2xl p-3.5 sm:p-4 transition hover:border-gold/50 hover:shadow-[0_0_28px_-12px_rgba(212,175,55,0.35)]">
                  <b className="block text-[13px] mb-1.5 text-ink break-words">{a}</b>
                  <span className="mono-label !text-ink/55 break-words">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EXPERTISE */}
      <section id="expertise" className="bg-coal px-5 py-20 text-center md:px-10 md:py-24 lg:py-28">
        <span className="mono-label !text-gold border border-line rounded-full px-3.5 py-1.5 bg-slate">. Expertise</span>
        <h2 className="section-heading font-black text-[clamp(1.7rem,3.8vw,2.6rem)] mt-4 mb-10 text-white md:mb-14">What I Do</h2>
        {/* Infinite left-moving marquee of the five service tiles. The track
            duplicates the set (see InfiniteMarquee) so it loops seamlessly,
            and the row gets a little vertical padding so the tiles' hover glow
            is not clipped by the marquee's overflow-hidden. */}
        <InfiniteMarquee
          items={services}
          gap={20}
          speed={44}
          className="py-2 sm:py-3"
          renderItem={(s, i) => (
            <div className="w-[clamp(232px,80vw,318px)] shrink-0" data-slide-in={i % 2 === 0 ? "left" : "right"}>
              <ServiceCard s={s} i={i} />
            </div>
          )}
        />
      </section>

      {/* SKILLS */}
      <section id="skills" className="bg-ash px-5 py-20 text-center md:px-10 md:py-24 lg:py-28">
        <span className="mono-label !text-gold border border-line rounded-full px-3.5 py-1.5 bg-slate">● Technical stack</span>
        <h2 className="section-heading font-black text-[clamp(1.7rem,3.8vw,2.6rem)] mt-4 mb-2 text-white">Technologies I Work With</h2>
        <p className="mono-label !text-ink/55">Full-stack expertise across web development, databases and cloud</p>
        <TechnologyMarquee rows={technologyRows} />
      </section>

      {/* PROJECTS */}
      <section id="projects" className="bg-coal px-5 py-20 text-center md:px-10 md:py-24 lg:py-28">
        <span className="mono-label !text-gold border border-line rounded-full px-3.5 py-1.5 bg-slate">. Portfolio work</span>
        <h2 className="section-heading font-black text-[clamp(1.7rem,3.8vw,2.6rem)] mt-4 mb-10 text-white">Featured Engineering Projects</h2>
        <InfiniteMarquee
          items={projects}
          gap={20}
          speed={50}
          reverse
          renderItem={(p, i) => (
            <div className="w-[min(82vw,340px)] shrink-0" data-slide-in={i % 2 === 0 ? "left" : "right"}>
              <ProjectCard p={p} i={i} />
            </div>
          )}
        />
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-smoke px-5 py-20 text-center md:px-10 md:py-28 lg:py-32">
        <div className="max-w-5xl mx-auto contact-stage">
          <div className="contact-watermark" aria-hidden="true">
            {contact.headline}
          </div>
          <div className="contact-layer">
          <span className="mono-label inline-block mb-8 !text-gold border border-line rounded-full px-3.5 py-1.5 bg-slate">
            . Contact
          </span>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Box 1 — Introduction */}
            <div className="contact-animate contact-left flex flex-col justify-between rounded-3xl border border-line bg-slate p-6 sm:p-8">
              <div>
                <span className="mono-label !text-gold">. Introduction</span>
                <h3 className="mt-4 text-[clamp(1.5rem,3vw,2rem)] font-black leading-tight text-white">{contact.subline}</h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/70">{contact.intro}</p>
                <div className="flex flex-wrap gap-3 mt-8">
                  {socials.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      className="rounded-full border border-line/80 text-[12px] font-bold px-5 py-2.5 text-ink hover:-translate-y-0.5 hover:border-gold hover:text-gold-bright transition"
                    >
                      {s.name}
                    </a>
                  ))}
                </div>
              </div>
              <a
                href={`mailto:${contact.email}`}
                className="mt-10 inline-flex items-center gap-2 mono-label !text-ink border-b-2 border-gold pb-1 w-fit transition hover:text-gold-bright"
              >
                {contact.email}
              </a>
            </div>

            {/* Box 2 — Contact form */}
            <ContactForm email={contact.email} className="contact-animate contact-right" />
          </div>
          </div>
        </div>
      </section>

      {/* FINAL SIGNATURE */}
      <SignatureSection />

      <footer className="border-t-2 border-gold/20 bg-coal px-4 py-6 text-center text-ink/75 mono-label">
        © 2026 <span className="text-gold">{profile.name}</span>. All rights reserved.
      </footer>
    </>
  );
}