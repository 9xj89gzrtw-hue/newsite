"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

/**
 * Custom cursor — LIGHT THEME
 *
 * A small dot + a lagging ring that grows on hover over interactive elements.
 * Gold accent color instead of bordeaux. Hidden on touch / coarse pointers.
 *
 * Animation rule (RULES §5): only transform/opacity — never width/height.
 * The ring is a fixed 70px element that scales 0.5 → 1 on hover (visible
 * size 35px → 70px, matching the original 36/70 behaviour). The dot is a
 * fixed 6px element that fades + shrinks via opacity/scale on hover.
 * Centering uses negative margins so it doesn't conflict with the
 * framer-motion inline transform.
 *
 * Respects prefers-reduced-motion: scale animation is disabled (instant
 * state change) and the spring is replaced with a 0-duration transition.
 */
const RING_BASE_SIZE_PX = 70;
const DOT_BASE_SIZE_PX = 6;

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState<string>("");
  const prefersReducedMotion = useReducedMotion();
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 350, damping: 28, mass: 0.6 });
  const ringY = useSpring(dotY, { stiffness: 350, damping: 28, mass: 0.6 });
  const raf = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.body.classList.add("catering-cursor");

    const move = (e: MouseEvent) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        dotX.set(e.clientX);
        dotY.set(e.clientY);
      });
      const t = e.target as HTMLElement;
      const interactive = t.closest(
        "a,button,[data-cursor],input,select,textarea,label,[role=button]",
      );
      if (interactive) {
        setHovering(true);
        setLabel(interactive.getAttribute("data-cursor") || "");
      } else {
        setHovering(false);
        setLabel("");
      }
    };

    window.addEventListener("mousemove", move, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      document.body.classList.remove("catering-cursor");
      cancelAnimationFrame(raf.current);
    };
  }, [dotX, dotY]);

  if (!enabled) return null;

  // Reduced motion: skip scale animation entirely (instant state change
  // via 0-duration transition).
  const ringTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 300, damping: 20 };

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      {/* Dot — fixed 6px, fades + shrinks on hover (transform/opacity only) */}
      <motion.div
        className="fixed top-0 left-0 -ml-[3px] -mt-[3px] rounded-full bg-gold"
        style={
          {
            x: dotX,
            y: dotY,
            width: DOT_BASE_SIZE_PX,
            height: DOT_BASE_SIZE_PX,
          } as const
        }
        animate={{
          opacity: hovering ? 0 : 1,
          scale: prefersReducedMotion ? 1 : hovering ? 0.5 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
      {/* Ring — fixed 70px, scales 0.5→1 on hover (transform/opacity only) */}
      <motion.div
        className="fixed top-0 left-0 flex -ml-[35px] -mt-[35px] items-center justify-center rounded-full border border-gold/60 text-xs uppercase tracking-wider text-gold font-medium"
        style={
          {
            x: ringX,
            y: ringY,
            width: RING_BASE_SIZE_PX,
            height: RING_BASE_SIZE_PX,
          } as const
        }
        animate={{
          scale: prefersReducedMotion ? 1 : hovering ? 1 : 0.5,
          backgroundColor: hovering
            ? "rgba(196,149,106,0.12)"
            : "rgba(196,149,106,0)",
        }}
        transition={ringTransition}
      >
        {label}
      </motion.div>
    </div>
  );
}
