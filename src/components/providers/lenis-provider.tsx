"use client";

import Lenis from "lenis";
import * as React from "react";

/**
 * Smooth-scroll provider (Lenis) with optional GSAP ScrollTrigger bridge.
 *
 * Wiring (see docs/ANIMATION-PRESETS.md):
 *   - Lenis drives the scroll position via requestAnimationFrame.
 *   - On each scroll tick we call `ScrollTrigger.update()` so GSAP scenes stay
 *     in sync with the eased scroll.
 *   - `prefers-reduced-motion` disables Lenis entirely (native scroll).
 *
 * GSAP is imported dynamically so it never lands in the server bundle and only
 * loads on screens that actually use scroll-driven scenes.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Bridge to GSAP ScrollTrigger (loaded on demand).
    let cleanup = () => {};
    (async () => {
      try {
        const gsapMod = await import("gsap");
        const stMod = await import("gsap/ScrollTrigger");
        const gsap = gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        lenis.on("scroll", ScrollTrigger.update);
        cleanup = () => lenis.off("scroll", ScrollTrigger.update);
      } catch {
        // GSAP optional — Lenis still works standalone.
      }
    })();

    return () => {
      cleanup();
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
