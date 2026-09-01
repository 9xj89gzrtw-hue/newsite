"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

/**
 * TiltCard — reusable 3D tilt wrapper (Task 5-C).
 *
 * The card rotates toward the pointer: rotateX/rotateY are derived from the
 * pointer's normalized position inside the element (0..1 → ±max degrees),
 * spring-smoothed for the luxurious return, with `transformPerspective`
 * folding the perspective into the element's own transform (no extra DOM
 * node, no layout). Pointer leaves → springs ease back to 0/0.
 *
 * - max: maximum tilt in degrees (default 8). Keep ≤ 8 — beyond that the
 *   parallax reads as a gimmick on a premium catering site.
 * - glare: adds a soft specular highlight. The glare is a ::after
 *   radial-gradient (CSS utility `.tilt-card__glare` in globals.css) whose
 *   ONLY animated property is opacity — never background-position, so it
 *   costs nothing per frame.
 *
 * Perf / rules (RULES §5, AGENTS motion rules):
 * - only transform is animated (rotateX/rotateY on this element);
 * - pointermove handlers are rAF-free by design: they only `set()` two
 *   motion values (pointer position), and the springs write the transform
 *   on framer's own frame loop — no React re-renders, no layout reads
 *   except one getBoundingClientRect per move (batched by the browser);
 * - responds to mouse pointers only (`pointerType === "mouse"`) so touch
 *   scrolling never jitters the card;
 * - prefers-reduced-motion: renders a plain static wrapper (C62
 *   hydration-safe: the reduce branch resolves only after mount).
 *
 * Reference: the classic Awwwards "tilt on hover" card (CodyHouse /
 * Olivier Larose pointer-tracking recipe).
 */
export function TiltCard({
  children,
  max = 8,
  glare = false,
  className,
}: {
  children: ReactNode;
  /** Maximum tilt in degrees (both axes). Default 8. */
  max?: number;
  /** Soft specular glare overlay (opacity-only, CSS-driven). */
  glare?: boolean;
  /** Extra classes — `tilt-card` (position: relative) is always applied;
   * `tilt-card__glare` (the ::after highlight) is applied when glare=true. */
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // C62 hydration-safety: branch the tree only after mount — SSR and the
  // first client render agree (static div), the tilt arms post-hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Normalized pointer position 0..1 within the card.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  // Pointer position → rotation: top edge tilts away, right edge tilts
  // toward the viewer. [0..1] → [±max]°.
  const rawRotateX = useTransform(py, [0, 1], [max, -max]);
  const rawRotateY = useTransform(px, [0, 1], [-max, max]);
  // Spring return — springs (not transitions) so mid-move retargeting
  // stays butter-smooth (stiffness 200 / damping 20 ≈ 300ms settle).
  const rotateX = useSpring(rawRotateX, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(rawRotateY, { stiffness: 200, damping: 20 });

  if (mounted && reduce) {
    // Static wrapper — keep the tilt-card base class (position: relative)
    // so consumer layouts don't shift between branches.
    return <div className={["tilt-card", className].filter(Boolean).join(" ")}>{children}</div>;
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Mouse only — touch/pen scrolling must not tilt the card.
    if (e.pointerType !== "mouse") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r || r.width <= 0 || r.height <= 0) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };

  const onPointerLeave = () => {
    // Reset to the exact center → both rotations spring back to 0.
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      className={[
        "tilt-card",
        glare ? "tilt-card__glare" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ rotateX, rotateY, transformPerspective: 600 }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </motion.div>
  );
}

export default TiltCard;
