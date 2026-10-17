/* ===== Frame-sequence preloader (hero + About portraits) =====
   All 192 JPEG frames (public/frames/ezgif-frame-001.jpg … ezgif-frame-192.jpg)
   are fetched and decoded ONCE on page load into one in-memory array. After
   that, every scroll tick is a pure array lookup + ctx.drawImage, so the GSAP
   ScrollTrigger scrub paints the exact frame instantly - no sliding window, no
   waiting on network mid-scroll, no stutter even through a flick-scroll of the
   whole reel.

   Decoding happens off the main thread with createImageBitmap (falling back to
   an <img> where unsupported). A bounded number of requests runs in parallel so
   the page's own assets are not starved, and downloads are re-prioritised
   around whatever frame is on screen right now, so the frames you are most
   likely to see first land first.

   While the preload is still warming up, each canvas paints the nearest frame
   that HAS arrived - the hero shows frame 0 as soon as it decodes and simply
   sharpens as the rest stream in. The picture never blanks.

   The full preload only starts when a consumer asks for a non-static frame:
   prefers-reduced-motion visitors (single poster frame) never download the
   other 191 images.

   Consumers (hero canvas id "hero", About canvas id "about") call
   `request(id, index, { single })` to declare which frame they want;
   `onFrame(id, index, image)` fires whenever there is something new to paint.
   `dispose()` closes every decoded bitmap so unmounting cannot leak GPU
   memory. */

export const TOTAL_FRAMES = 192;

const FRAME_PREFIX = "ezgif-frame-";
const FRAME_EXT = "jpg";
/* Zero-padding actually used on disk: ezgif-frame-001.jpg … ezgif-frame-192.jpg */
const FRAME_PAD = 3;

const MAX_CONCURRENT = 8;

function frameUrl(index) {
  return `/frames/${FRAME_PREFIX}${String(index + 1).padStart(FRAME_PAD, "0")}.${FRAME_EXT}`;
}

export function createFrameSequence({ onFrame } = {}) {
  const frames = new Array(TOTAL_FRAMES).fill(null);
  const loading = new Set();
  const failed = new Set();
  const actives = new Map(); // consumer id -> active frame index
  const queued = new Set(); // indices currently waiting in the queue
  const painted = new Map(); // consumer id -> last index actually drawn

  const canBitmap =
    typeof window !== "undefined" &&
    typeof window.createImageBitmap === "function" &&
    typeof window.fetch === "function";

  const release = (image) => {
    if (image && typeof image.close === "function") image.close();
  };

  let disposed = false;
  let fullPreload = false;
  let queue = [];

  function nearestTo(index) {
    if (frames[index]) return index;
    for (let d = 1; d < TOTAL_FRAMES; d++) {
      if (index - d >= 0 && frames[index - d]) return index - d;
      if (index + d < TOTAL_FRAMES && frames[index + d]) return index + d;
    }
    return -1;
  }

  function paint() {
    if (!onFrame) return;
    actives.forEach((active, id) => {
      const i = nearestTo(active);
      /* Dedupe: while the preload streams in, every completed decode repaints
         ALL consumers - only actually draw when the visible frame changed. */
      if (i >= 0 && painted.get(id) !== i) {
        painted.set(id, i);
        onFrame(id, i, frames[i]);
      }
    });
  }

  function pushQueue(indices) {
    for (const i of indices) {
      if (!frames[i] && !loading.has(i) && !failed.has(i) && !queued.has(i)) {
        queued.add(i);
        queue.push(i);
      }
    }
  }

  /* Re-order the pending downloads around the frame that is on screen now, so
     a flick-scroll pulls the frames about to be needed, not the ones behind. */
  function prioritize(target) {
    if (queue.length > 1) {
      queue.sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
    }
  }

  function pump() {
    while (!disposed && loading.size < MAX_CONCURRENT && queue.length) {
      const index = queue.shift();
      queued.delete(index);
      if (frames[index] || loading.has(index) || failed.has(index)) continue;
      load(index);
    }
  }

  function load(index) {
    loading.add(index);
    const url = frameUrl(index);

    const done = (image) => {
      loading.delete(index);
      if (disposed) {
        release(image);
        return;
      }
      frames[index] = image;
      paint();
      pump();
    };
    const fail = () => {
      loading.delete(index);
      failed.add(index);
      pump();
    };

    /* createImageBitmap keeps JPEG decoding off the main thread (no scroll
       hitch); the <img> path is the fallback for older browsers. */
    if (canBitmap) {
      fetch(url, { cache: "force-cache" })
        .then((res) => {
          if (!res.ok) throw new Error("http " + res.status);
          return res.blob();
        })
        .then((blob) => createImageBitmap(blob))
        .then(done)
        .catch(fail);
      return;
    }

    const img = new Image();
    img.decoding = "async";
    img.onload = () => done(img);
    img.onerror = fail;
    img.src = url;
  }

  /* Queue every frame exactly once, nearest-first around the live consumers -
     the reel is fully preloaded after this, nothing is ever evicted. */
  function startFullPreload() {
    if (fullPreload || disposed) return;
    fullPreload = true;
    const all = Array.from({ length: TOTAL_FRAMES }, (_, i) => i);
    let target = 0;
    if (actives.size) {
      target = [...actives.values()].reduce((best, v) => (Math.abs(v) < Math.abs(best) ? v : best), 0);
    }
    all.sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
    pushQueue(all);
    pump();
  }

  /* Ask the loader to make `index` the active frame for consumer `id`.
      `single: true` loads only that one frame (the prefers-reduced-motion
      poster) and never triggers the full preload. */
  function request(id, index, { single = false } = {}) {
    if (disposed || TOTAL_FRAMES < 1) return;
    const next = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(index)));
    actives.set(id, next);

    if (single) {
      pushQueue([next]);
    } else {
      startFullPreload();
      prioritize(next);
    }
    /* Paint immediately: if the frame is already decoded no load event will
       ever fire, and if it is not, this snaps each canvas to its closest
       available frame while the queue fills in behind it. */
    paint();
    pump();
  }

  function dispose() {
    disposed = true;
    queue = [];
    queued.clear();
    actives.clear();
    painted.clear();
    loading.clear();
    frames.forEach((image) => release(image));
    frames.fill(null);
  }

  return { request, dispose };
}
