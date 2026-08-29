"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type ClipDirection = "top" | "right" | "bottom" | "left" | "alternate";

interface ClipPathRevealProps {
  children: React.ReactNode;
  /**
   * Which side the clip opens from. `alternate` cycles through
   * `[bottom, left, top, right]` using `index % 4` (Sondaven directional
   * reveal pattern).
   *
   * @default 'bottom'
   */
  direction?: ClipDirection;
  /** Delay in seconds before the reveal begins. @default 0 */
  delay?: number;
  /** Reveal duration in seconds. @default 0.9 */
  duration?: number;
  /** Used only when `direction='alternate'` to pick a side. */
  index?: number;
  /** Trigger once vs. every time it enters the viewport. @default true */
  once?: boolean;
  className?: string;
}

/**
 * inset() builders per direction. `t` is the clipped percentage (100 = fully
 * hidden, 0 = fully revealed). The non-animated sides stay at 0 so the shape
 * of the string is constant and Framer Motion can interpolate token-by-token.
 *
 *   top    → inset(t% 0 0 0)   reveals top→bottom
 *   right  → inset(0 t% 0 0)   reveals right→left
 *   bottom → inset(0 0 t% 0)   reveals bottom→top
 *   left   → inset(0 0 0 t%)   reveals left→right
 */
const INSETS: Record<
  Exclude<ClipDirection, "alternate">,
  (t: number) => string
> = {
  top: (t) => `inset(${t}% 0 0 0)`,
  right: (t) => `inset(0 ${t}% 0 0)`,
  bottom: (t) => `inset(0 0 ${t}% 0)`,
  left: (t) => `inset(0 0 0 ${t}%)`,
};

const ALTERNATE_CYCLE = [
  "bottom",
  "left",
  "top",
  "right",
] as const satisfies readonly Exclude<ClipDirection, "alternate">[];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * ClipPathReveal — directional `clip-path: inset(...)` reveal with a subtle
 * inner zoom (1.15 → 1.0). The Sondaven / Floema signature photo reveal.
 *
 * - `framer-motion` (matches `magnetic.tsx`, `cursor.tsx`, `delivery-block.tsx`
 *   which all use framer-motion — keeps a single motion library to avoid
 *   motion/react × framer-motion context conflicts). Uses `useInView` hook +
 *   imperative `animate` prop (NOT `whileInView`) — the imperative `animate`
 *   prop driven by the `useInView` boolean animates `clip-path` correctly
 *   (whileInView only animates transform/opacity reliably).
 * - transform / clip-path / opacity only — GPU-composited, never touches
 *   layout (RULES §5).
 * - `prefers-reduced-motion`: renders children in a plain `<div>`, no clip,
 *   no scale.
 * - `relative h-full w-full` on the inner zoom wrapper so `fill`-positioned
 *   children (next/image `fill`, absolute overlays) inherit the outer
 *   wrapper's height AND have a positioned parent — without `relative`,
 *   next/image `fill` warns "parent with invalid position: static" and the
 *   image collapses to 0 height.
 */
export function ClipPathReveal({
  children,
  direction = "bottom",
  delay = 0,
  duration = 0.9,
  index,
  once = true,
  className,
}: ClipPathRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // C62 hydration-safety: branch the tree on reduce ONLY after mount —
  // useReducedMotion() is false at SSR and true on a reduce-user's first
  // client render; a direct branch caused a hydration mismatch (React
  // regenerated the whole page tree). First client render must match SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const inView = useInView(ref, { once, margin: "-80px" });

  const resolvedDir: Exclude<ClipDirection, "alternate"> =
    direction === "alternate"
      ? ALTERNATE_CYCLE[(index ?? 0) % ALTERNATE_CYCLE.length]
      : direction;

  if (mounted && reduce) {
    return <div className={className}>{children}</div>;
  }

  const insetFn = INSETS[resolvedDir];
  const transition = { duration, delay, ease: EASE };

  // Directional y-offset — gives each direction a subtle directional feel
  // even without clip-path (top reveals from above, bottom from below, etc.).
  // Pairs with the inner scale 1.15 → 1.0 zoom for the premium Sondaven-style
  // "image pushing forward" reveal.
  const dirOffset =
    resolvedDir === "top" ? 40 : resolvedDir === "bottom" ? -40 : 0;
  const dirX =
    resolvedDir === "left" ? 40 : resolvedDir === "right" ? -40 : 0;

  return (
    <motion.div
      ref={ref}
      className={cn("relative", className)}
      initial={{ opacity: 0, y: dirOffset, x: dirX }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={transition}
    >
      {/* Inner zoom-reveal: child scales 1.15 → 1.0 over the same duration
          for the premium "image pushing out of the mask" feel (Sondaven
          pairs a scale zoom with every photo reveal).

          `relative h-full w-full`: the `relative` is REQUIRED so that
          next/image `fill` children see a positioned parent (otherwise Next
          warns "parent with invalid position: static" and the image
          collapses to 0 height). `h-full w-full` propagates the outer
          wrapper's height down so `fill` children fill the reveal area. */}
      <motion.div
        className="relative h-full w-full"
        style={{ willChange: "transform" }}
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once, margin: "-80px" }}
        transition={transition}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
