"use client";

import { useEffect, useRef } from "react";

/**
 * GrainOverlay — fixed full-viewport SVG film-grain noise at low opacity.
 *
 * Cycle 41 PERF FIX (critical): previously this component animated
 * `background-position` on a `mix-blend-mode: overlay` full-viewport layer
 * from a 20fps rAF loop. background-position changes are NOT compositable —
 * they trigger a full-page repaint every 50ms, and with the blend mode the
 * whole frame had to be re-blended on the CPU. On software-rendered browsers
 * (headless Chrome / SwiftShader) this froze the main thread completely
 * 10–60s after load, killing every interaction on the page.
 *
 * The grain is now STATIC (no animation, no blend mode — plain alpha
 * compositing at 4.5% opacity). Visually near-identical, ~0 runtime cost.
 *
 * Pointer-events: none — never blocks interaction.
 */
export function GrainOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  // No-op mount effect kept for API stability (component may be referenced
  // by tests / future effects). The overlay is fully CSS-static now.
  useEffect(() => {
    void ref;
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
      className="pointer-events-none fixed inset-0 z-[100] opacity-[0.045]"
      style={{
        backgroundImage: `url("${noise}")`,
        backgroundRepeat: "repeat",
        backgroundSize: "160px 160px",
      }}
    />
  );
}
