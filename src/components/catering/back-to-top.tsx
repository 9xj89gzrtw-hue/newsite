"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowUp } from "lucide-react";

/**
 * BackToTop — LIGHT THEME
 * Floating button to scroll back to top of page.
 * Includes a circular scroll-progress ring (gold) around the button —
 * visually shows how far down the page the user has scrolled.
 *
 * Inspired by Ridgewells / Salt Block back-to-top patterns (REF §818-826).
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Ring math: r=22 → circumference = 2π × 22 ≈ 138.23
  const RADIUS = 22;
  const CIRC = 2 * Math.PI * RADIUS;

  return (
    <motion.button
      onClick={scrollToTop}
      aria-label="Back to top"
      data-back-to-top=""
      initial={false}
      animate={
        visible
          ? { y: 0, opacity: 1, scale: 1 }
          : { y: 80, opacity: 0, scale: 0.6 }
      }
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group fixed bottom-6 left-6 z-50 flex size-14 items-center justify-center rounded-full bg-gradient-to-r from-gold to-terracotta text-white shadow-lg shadow-gold/30 hover:scale-110 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      {/* Progress ring (gold) */}
      <svg
        className="absolute inset-0 -rotate-90 pointer-events-none"
        viewBox="0 0 50 50"
        aria-hidden="true"
      >
        <motion.circle
          cx="25"
          cy="25"
          r={RADIUS}
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ pathLength, opacity: 0.95 }}
          strokeDasharray={CIRC}
        />
      </svg>
      <ArrowUp className="size-5 transition-transform group-hover:-translate-y-0.5" />
    </motion.button>
  );
}
