"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";

/**
 * Custom cursor — LIGHT THEME
 *
 * A small dot + a lagging ring that grows on hover over interactive elements.
 * Gold accent color instead of bordeaux. Hidden on touch / coarse pointers.
 *
 * Phase 9 P2 wow-factor: when hovering an element with `data-cursor-image`
 * attribute (URL to an image), the cursor ring expands to 120px and shows
 * the image inside via spring-tracked motion.div. Useful for #menu CTA
 * hover-preview (shows a signature dish photo when user hovers "Меню" link).
 *
 * Animation rule (RULES §5): only transform/opacity — never width/height.
 * The ring is a fixed 70px element that scales 0.5 → 1 on hover (visible
 * size 35px → 70px, matching the original 36/70 behaviour). The dot is a
 * fixed 6px element that fades + shrinks via opacity/scale on hover.
 * Image preview is a 120px fixed element that scales 0 → 1 on data-cursor-image hover.
 *
 * Respects prefers-reduced-motion: scale animation is disabled (instant
 * state change) and the spring is replaced with a 0-duration transition.
 * Image preview is also disabled for reduced-motion (just shows label).
 */
const RING_BASE_SIZE_PX = 70;
const DOT_BASE_SIZE_PX = 6;
const PREVIEW_BASE_SIZE_PX = 120;

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string>("");
  const prefersReducedMotion = useReducedMotion();
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 350, damping: 28, mass: 0.6 });
  const ringY = useSpring(dotY, { stiffness: 350, damping: 28, mass: 0.6 });
  // Preview follows the cursor more closely (less lag) — feels responsive
  const previewX = useSpring(dotX, { stiffness: 500, damping: 32, mass: 0.4 });
  const previewY = useSpring(dotY, { stiffness: 500, damping: 32, mass: 0.4 });
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
        // Phase 9: read data-cursor-image attribute if present
        const img = interactive.getAttribute("data-cursor-image");
        setPreviewImage(img || "");
      } else {
        setHovering(false);
        setLabel("");
        setPreviewImage("");
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
  // When preview is active, hide the ring entirely (image preview takes over)
  const hasPreview = Boolean(previewImage) && !prefersReducedMotion;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block" aria-hidden="true">
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
      {/* When preview is active, ring hides (opacity 0) — preview takes over */}
      <motion.div
        className="fixed top-0 left-0 flex -ml-[35px] -mt-[35px] items-center justify-center rounded-full border border-gold/60 text-xs uppercase tracking-wider text-gold font-medium overflow-hidden"
        style={
          {
            x: ringX,
            y: ringY,
            width: RING_BASE_SIZE_PX,
            height: RING_BASE_SIZE_PX,
          } as const
        }
        animate={{
          scale: prefersReducedMotion ? 1 : hasPreview ? 0 : hovering ? 1 : 0.5,
          opacity: hasPreview ? 0 : 1,
          backgroundColor: hovering
            ? "rgba(196,149,106,0.12)"
            : "rgba(196,149,106,0)",
        }}
        transition={ringTransition}
      >
        {label}
      </motion.div>
      {/* Phase 9: Image preview element — fixed 120px, scales 0→1 on
          data-cursor-image hover. Spring-tracked to follow cursor.
          Uses next/image with object-cover. Border gold/40 + shadow for depth. */}
      <AnimatePresence>
        {hasPreview && (
          <motion.div
            key="cursor-preview"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed top-0 left-0 -ml-[60px] -mt-[60px] overflow-hidden rounded-2xl border-2 border-gold/40 shadow-2xl shadow-ink/30 pointer-events-none"
            style={{
              x: previewX,
              y: previewY,
              width: PREVIEW_BASE_SIZE_PX,
              height: PREVIEW_BASE_SIZE_PX,
            }}
          >
            <Image
              src={previewImage}
              alt="Превью блюда"
              fill
              sizes="120px"
              className="object-cover"
              unoptimized
            />
            {/* Subtle gradient overlay for depth */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent"
            />
            {/* Label badge — shows the data-cursor label below the image */}
            {label && (
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] uppercase tracking-wider text-cream backdrop-blur-sm whitespace-nowrap">
                {label}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
