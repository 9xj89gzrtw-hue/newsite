"use client";

import { motion, useReducedMotion } from "motion/react";
import * as React from "react";

type RevealProps = {
  children: React.ReactNode;
  /** Delay in seconds before the reveal starts. */
  delay?: number;
  /** Y-offset in px the element travels from. */
  y?: number;
  className?: string;
  /** Trigger once vs. every time it enters the viewport. */
  once?: boolean;
};

/**
 * Fade + rise on scroll-into-view. The workhorse micro-interaction for the
 * whole site. Respects `prefers-reduced-motion` (renders children static).
 *
 * Uses `motion/react` (the new package name for Framer Motion v12+).
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  once = true,
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1], // easeOutExpo-ish
      }}
    >
      {children}
    </motion.div>
  );
}
