"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Custom cursor — LIGHT THEME
 * 
 * A small dot + a lagging ring that grows on hover over interactive elements.
 * Gold accent color instead of bordeaux.
 * Hidden on touch / coarse pointers.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState<string>("");
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

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      {/* Dot — gold colored */}
      <motion.div
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold"
        style={{ x: dotX, y: dotY }}
        animate={{ width: hovering ? 0 : 6, height: hovering ? 0 : 6 }}
        transition={{ duration: 0.2 }}
      />
      {/* Ring — with gold border and subtle background */}
      <motion.div
        className="fixed top-0 left-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/60 text-xs uppercase tracking-wider text-gold font-medium"
        style={{ x: ringX, y: ringY }}
        animate={{
          width: hovering ? 70 : 36,
          height: hovering ? 70 : 36,
          backgroundColor: hovering
            ? "rgba(196,149,106,0.12)"
            : "rgba(196,149,106,0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {label}
      </motion.div>
    </div>
  );
}
