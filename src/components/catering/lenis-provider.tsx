"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Smooth-scroll provider (Lenis) with GSAP ScrollTrigger bridge.
 * Respects prefers-reduced-motion (native scroll then).
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    /* C61: глобальный хук для программных скроллов блоков — Lenis.scrollTo
       корректно гасит колесную инерцию (голый window.scrollTo(smooth)
       Lenis перебивает своим таргетом, грабля §2) */
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    let off = () => {};
    (async () => {
      try {
        const gsapMod = await import("gsap");
        const stMod = await import("gsap/ScrollTrigger");
        const gsap = gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        lenis.on("scroll", ScrollTrigger.update);
        off = () => lenis.off("scroll", ScrollTrigger.update);
      } catch {
        /* GSAP optional */
      }
    })();

    return () => {
      off();
      cancelAnimationFrame(raf);
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
