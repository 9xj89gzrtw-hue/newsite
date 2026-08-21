"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Cubic-bezier tuple type matching framer-motion's BezierDefinition. */
type Bezier = [number, number, number, number];

/** Fade + rise on scroll-into-view. Respects reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  once = true,
  ease = [0.22, 1, 0.36, 1],
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
  /** Custom easing curve (default = Ridgewells editorial). */
  ease?: Bezier;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  );
}
