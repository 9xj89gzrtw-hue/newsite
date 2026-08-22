"use client";

import * as React from "react";
import { useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * ScrollBoundVideo — scroll-scrubbed cinematic video (Sondaven / Cartier W&W).
 *
 * As the user scrolls through the tall track (default 200vh), the bound video's
 * `currentTime` is driven directly by `scrollYProgress` — the video plays
 * forward on scroll-down, backward on scroll-up. No `.play()` call, no audio,
 * no autoplay loop. The video element is paused at mount; we only ever seek.
 *
 * Implementation notes:
 *  - Native `<video>` is used instead of `VideoPlayer` because:
 *      (a) VideoPlayer wraps `<video>` in a `rounded-2xl border aspect-video`
 *          container — we want full-bleed sticky;
 *      (b) VideoPlayer doesn't forward a ref to the underlying `<video>`,
 *          and we need direct access to `currentTime` / `duration` /
 *          `readyState` / `loadeddata` event for seek-scrubbing.
 *  - The video src is a Mux stream URL built from `playbackId`:
 *      `https://stream.mux.com/${playbackId}/low.mp4`
 *    (Per task instructions — allowed fallback for VideoPlayer since the
 *     existing VideoPlayer doesn't expose the underlying video element ref.)
 *  - Throttle: rAF-batched seek so rapid scroll events coalesce to 1 seek/frame.
 *  - Reduced-motion: skip the scroll binding entirely — call `video.play()`
 *    as a normal autoplay loop fallback. Muted + playsInline + loop.
 *
 * Layout (Sondaven / Lando Norris pin-spacer pattern):
 *   <div ref={containerRef} style={{ height: scrollHeight }}>  ← scroll track
 *     <div className="sticky top-0 h-screen overflow-hidden">  ← sticky pin
 *       <video className="h-full w-full object-cover" ... />
 *     </div>
 *   </div>
 *
 * Animation rule (RULES §5): no transform/opacity here — we only set
 * `video.currentTime` (a media property, not a CSS animation). The sticky
 * positioning is CSS-only, no transition. This is the one legitimate
 * non-transform animation exception per the rules (alongside the html
 * background-color transition for theme-flip).
 */
export interface ScrollBoundVideoProps {
  /** Mux playback ID — used to build `https://stream.mux.com/<id>/low.mp4`. */
  playbackId: string;
  /** Optional extra className on the outer (track) container. */
  className?: string;
  /**
   * CSS height of the scroll track. Default '200vh' — gives 1 viewport of
   * scroll-down scrubbing distance beyond the 100vh sticky pin.
   */
  scrollHeight?: string;
  /** Optional poster image src (shown before video metadata loads). */
  poster?: string;
}

export function ScrollBoundVideo({
  playbackId,
  className,
  scrollHeight = "200vh",
  poster,
}: ScrollBoundVideoProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // rAF throttle — coalesce rapid scroll bursts into 1 seek/frame.
  const rafRef = React.useRef<number>(0);
  const pendingProgressRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reduced-motion: autoplay loop fallback, skip scroll binding entirely.
    if (prefersReducedMotion) {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      // Best-effort autoplay; ignore rejection (browser may block until
      // interaction — that's fine, the user can still scroll past).
      video.play().catch(() => {
        /* no-op — autoplay blocked; user scroll will still see first frame */
      });
      return;
    }

    // Non-reduced path: pause + mute + never autoplay. We only seek.
    video.muted = true;
    video.loop = false;
    video.playsInline = true;
    video.pause();

    /** Apply the most recent scroll progress to video.currentTime (rAF-batched). */
    const applySeek = () => {
      rafRef.current = 0;
      const p = pendingProgressRef.current;
      if (p == null) return;
      pendingProgressRef.current = null;
      // Need HAVE_CURRENT_DATA (readyState 2) at minimum to seek reliably.
      if (video.readyState < 2) return;
      const dur = video.duration;
      // duration can be NaN / Infinity before metadata — guard.
      if (!Number.isFinite(dur) || dur <= 0) return;
      // Clamp 0..1 to protect against tiny float overflow at scroll bounds.
      const clamped = Math.min(1, Math.max(0, p));
      video.currentTime = clamped * dur;
    };

    /** First seek: once metadata is loaded, jump to the current scroll position. */
    const onLoadedData = () => {
      // If we have a pending progress, apply it now that duration is known.
      if (pendingProgressRef.current != null) applySeek();
    };

    const onSeek = (latest: number) => {
      pendingProgressRef.current = latest;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(applySeek);
      }
    };

    // Subscribe to scroll progress changes.
    const unsubscribe = scrollYProgress.on("change", onSeek);
    video.addEventListener("loadeddata", onLoadedData);

    return () => {
      unsubscribe();
      video.removeEventListener("loadeddata", onLoadedData);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [scrollYProgress, prefersReducedMotion]);

  const src = `https://stream.mux.com/${playbackId}/low.mp4`;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height: scrollHeight }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          playsInline
          preload="metadata"
          // No controls — this is a cinematic scroll-scrub, not a media player.
          // Tab-key focus still works (the container is keyboard-scrollable
          // by default), and we keep the video element in the a11y tree so
          // screen readers can announce it.
          aria-label="Скролл-управляемое видео"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

/**
 * Note on useScroll + useMotionValueEvent:
 *  - useScroll returns a MotionValue<number> in [0,1] for scrollYProgress.
 *  - We subscribe via `.on('change', cb)` (preferred over useMotionValueEvent
 *    inside an effect because it lets us cleanly unsubscribe + rAF-throttle).
 *  - rAF batching ensures that even a Lenis-driven 120fps scroll burst only
 *    triggers 1 actual video.currentTime seek per frame (browsers cap seeks
 *    anyway, but explicit throttling keeps the main thread calm).
 *
 * If the Mux stream URL pattern changes (e.g. signed URLs required), update
 * the `src` construction above. For development without a real Mux asset,
 * pass any direct MP4 URL by swapping the playbackId→src mapping for a `src`
 * prop variant (left as a future extension point).
 */
