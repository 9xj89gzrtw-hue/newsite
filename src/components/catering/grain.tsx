"use client";

import { useEffect, useRef } from "react";

/**
 * GrainOverlay — fixed full-viewport SVG film-grain noise at low opacity with
 * `mix-blend-mode: overlay`. Subtly animates background-position to feel "alive"
 * (shot-on-film register, Awwwards-tier).
 *
 * Respects prefers-reduced-motion (static grain, no animation).
 * Pointer-events: none — never blocks interaction.
 */
export function GrainOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let pos = 0;
    const tick = () => {
      pos = (pos + 0.4) % 50;
      el.style.backgroundPosition = `${-pos}px ${-pos}px`;
      raf = requestAnimationFrame(tick);
    };
    // Throttle to ~20fps for cheap CPU
    let last = 0;
    const loop = (t: number) => {
      if (t - last > 50) {
        last = t;
        pos = (pos + 2) % 50;
        el.style.backgroundPosition = `${-pos}px ${-pos}px`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      void tick;
    };
  }, []);

  // Inline SVG turbulence noise as data URI (no external asset)
  const noise =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.55'/></svg>`,
    );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] opacity-[0.05] mix-blend-overlay"
      style={{
        backgroundImage: `url("${noise}")`,
        backgroundRepeat: "repeat",
        backgroundSize: "160px 160px",
      }}
    />
  );
}
