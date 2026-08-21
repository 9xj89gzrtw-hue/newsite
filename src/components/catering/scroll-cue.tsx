"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * ScrollCue — joels.com signature "scroll" indicator (Cycle 24).
 *
 * Vertical 1px × 94px line in sage that animates via the `joel-scroll-cue`
 * CSS keyframe (retracts from top, then re-extends from bottom). Below the
 * line: "SCROLL" text in sage, 12px Karla 500, uppercase, ls 0.3em.
 *
 * The keyframe:
 *   0%   { transform: scaleY(1); transform-origin: 0 100%; }
 *   40%  { transform: scaleY(0); transform-origin: 0 100%; }
 *   60%  { transform: scaleY(0); transform-origin: 0 0; }
 *   100% { transform: scaleY(1); transform-origin: 0 0; }
 *
 * Implementation note: framer-motion's `animate` prop would also work here
 * (per §10.7), but using a CSS keyframe lets us keep this component light
 * (no per-frame JS) and respects `prefers-reduced-motion` declaratively
 * (the `.joel-scroll-cue-line` rule disables the animation under reduced
 * motion).
 *
 * Source: docs/JOELS-ANALYSIS.md §TL;DR, §9 P2.7, §10.7, §14 CSS.
 *
 * @param delay — framer-motion delay (s) for the cue's fade-in. Default 1.37s
 *   (joels.com ScrollCue timing).
 */
export function ScrollCue({ delay = 1.37 }: { delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
      animate={reduce ? undefined : { opacity: 1, scale: 1 }}
      transition={{ delay, duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
      aria-hidden="true"
    >
      <span className="joel-scroll-cue-line" />
      <span className="font-sans text-[12px] font-medium uppercase tracking-[0.3em] text-sage">
        Scroll
      </span>
    </motion.div>
  );
}

export default ScrollCue;
