"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * StackedParallaxImages — joels.com About-section wow moment (Cycle 24).
 *
 * Two stacked images that translate at different speeds and in opposite
 * directions as the section scrolls into view, creating layered depth.
 *
 *   - Main image (landscape):    y: [ 30, -30]  (joels' main +30 / smoothness 30)
 *   - Stacked image (portrait):  y: [-15,  15]  (joels' stacked -15 / slower)
 *
 * Uses framer-motion `useScroll` (target = wrapper ref, offset start-end →
 * end-start) and `useTransform` to map scroll progress to pixel translation.
 * `prefers-reduced-motion` users get a fully static layout (no transforms).
 *
 * Stacked image is positioned absolutely at bottom-right, w-2/3, with a
 * subtle ring + shadow to lift it off the main image — matches the joels
 * composition (about-2.jpg main + salad.jpg portrait overlay).
 *
 * Source: docs/JOELS-ANALYSIS.md §TL;DR #3, §9 P2.1, §10.4, §13.
 */
type StackedParallaxImagesProps = {
  /** Main landscape image (rendered at full width of the wrapper). */
  mainSrc: string;
  mainAlt: string;
  /** Stacked portrait image (rendered at 2/3 width, bottom-right). */
  stackedSrc: string;
  stackedAlt: string;
  /** Aspect ratio for the main image (defaults to 4/3 landscape). */
  aspect?: string;
  /** Optional className for the outer wrapper. */
  className?: string;
};

export function StackedParallaxImages({
  mainSrc,
  mainAlt,
  stackedSrc,
  stackedAlt,
  aspect = "4 / 3",
  className = "",
}: StackedParallaxImagesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Main: +30 → -30 (joels main parallax `{"y":30}`).
  const yMain = useTransform(scrollYProgress, [0, 1], [30, -30]);
  // Stacked: -15 → +15 (opposite direction, half the speed).
  const yStacked = useTransform(scrollYProgress, [0, 1], [-15, 15]);

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      // Tall enough bottom padding so the stacked portrait has room to overhang.
      style={{ paddingBottom: "3rem", paddingRight: "2rem" }}
    >
      {/* Main image — landscape, full width of wrapper */}
      <motion.div
        style={
          reduce
            ? undefined
            : { y: yMain, willChange: "transform" }
        }
        className="relative w-full overflow-hidden"
      >
        <Image
          src={mainSrc}
          alt={mainAlt}
          width={1000}
          height={764}
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="h-auto w-full object-cover"
        />
      </motion.div>

      {/* Stacked image — portrait, 2/3 width, bottom-right overhang */}
      <motion.div
        style={
          reduce
            ? undefined
            : { y: yStacked, willChange: "transform" }
        }
        className="absolute -bottom-6 -right-4 w-2/3 overflow-hidden shadow-2xl shadow-ink/30 ring-1 ring-ink/10 sm:-bottom-12 sm:-right-8"
      >
        <Image
          src={stackedSrc}
          alt={stackedAlt}
          width={1000}
          height={1360}
          sizes="(max-width: 1024px) 66vw, 26vw"
          className="h-auto w-full object-cover"
        />
      </motion.div>

      {/* Hidden but useful: preserve the aspect-ratio expectation for SSR */}
      <span className="sr-only" style={{ display: "none" }}>
        {aspect}
      </span>
    </div>
  );
}

export default StackedParallaxImages;
