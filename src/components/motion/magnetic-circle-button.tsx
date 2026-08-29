"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticCircleButtonProps {
  /** Link target (internal path or external URL). */
  href: string;
  /** Icon or short label rendered inside the circle. */
  children: React.ReactNode;
  /** REQUIRED: accessible name (circle often has no visible text). */
  ariaLabel: string;
  /** Circle diameter in px. Clamped to ≥44 for touch targets. @default 88 */
  size?: number;
  /** Circle background + rim color. @default 'gold' */
  variant?: "gold" | "espresso" | "cream" | "terracotta";
  className?: string;
  /** Magnetic strength of the OUTER layer (0.2 subtle → 0.35 strong). @default 0.3 */
  strength?: number;
}

/**
 * Variant → Tailwind classes for the bg circle + the label color.
 * Warm tokens only (RULES §5.9 — no indigo/blue).
 */
const VARIANTS: Record<
  NonNullable<MagneticCircleButtonProps["variant"]>,
  { bg: string; label: string }
> = {
  // Gold rim with a darker-gold hairline (manual OKLCH-adjacent shade).
  gold: { bg: "bg-gold ring-1 ring-[#A67B4D]", label: "text-ink" },
  espresso: { bg: "bg-ink", label: "text-cream" },
  cream: { bg: "bg-cream ring-1 ring-ink/20", label: "text-ink" },
  terracotta: { bg: "bg-terracotta", label: "text-cream" },
};

/**
 * MagneticCircleButton — Sondaven `btn-circle` 3-tier magnetic CTA.
 *
 * Layering (the "inner-target" Sondaven pattern):
 *  1. Outer `<motion.a>` — the whole button translates toward the cursor at
 *     `strength × (cursor − center)` (spring-smoothed, matches `magnetic.tsx`).
 *  2. Middle bg circle — scales 1 → 1.12 on hover (independent spring).
 *  3. Inner label — translates by `0.3 × (cursor − center)` INDEPENDENTLY with
 *     a stiffer spring, so the label chases the cursor harder than the body.
 *     Net effect: label moves ~2× the button body — the luxury "alive" feel.
 *
 * - 44px min touch target enforced (RULES §5.7).
 * - `focus-visible` gold outline for keyboard a11y.
 * - `data-cursor=""` so the existing `CustomCursor` treats it as interactive.
 * - External links (http*) get `target="_blank" rel="noopener noreferrer"`.
 * - `prefers-reduced-motion`: plain `<a>` with circle styling, no springs.
 */
export function MagneticCircleButton({
  href,
  children,
  ariaLabel,
  size = 88,
  variant = "gold",
  className,
  strength = 0.3,
}: MagneticCircleButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  // C62 hydration-safety: branch the tree only after mount (SSR/client parity
  // on the first render; reduce swaps in post-hydration — legal).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Outer translation (whole button).
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.3 });

  // Inner label translation — stiffer spring so it leads the body.
  const innerX = useMotionValue(0);
  const innerY = useMotionValue(0);
  const isx = useSpring(innerX, { stiffness: 350, damping: 18, mass: 0.3 });
  const isy = useSpring(innerY, { stiffness: 350, damping: 18, mass: 0.3 });

  // Bg circle hover scale.
  const bgScale = useSpring(1, { stiffness: 250, damping: 20 });

  const diameter = Math.max(size, 44);
  const isExternal = /^https?:\/\//i.test(href);
  const v = VARIANTS[variant];

  const externalAttrs = isExternal
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  if (mounted && reduce) {
    return (
      <a
        href={href}
        aria-label={ariaLabel}
        data-cursor=""
        className={cn(
          "relative inline-flex items-center justify-center rounded-full",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
          v.bg,
          v.label,
          className,
        )}
        style={{ width: diameter, height: diameter }}
        {...externalAttrs}
      >
        {children}
      </a>
    );
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      data-cursor=""
      className={cn(
        "relative inline-flex items-center justify-center rounded-full",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        className,
      )}
      style={{ x: sx, y: sy, width: diameter, height: diameter }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        x.set(dx * strength);
        y.set(dy * strength);
        // Inner label translates by a fixed 0.3 factor, independent of the
        // outer `strength` prop — the Sondaven inner-target signature.
        innerX.set(dx * 0.3);
        innerY.set(dy * 0.3);
      }}
      onMouseEnter={() => bgScale.set(1.12)}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
        innerX.set(0);
        innerY.set(0);
        bgScale.set(1);
      }}
      {...externalAttrs}
    >
      {/* Middle: bg circle that scales on hover. */}
      <motion.div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 rounded-full pointer-events-none",
          v.bg,
        )}
        style={{ scale: bgScale }}
      />

      {/* Inner: label that translates independently toward the cursor. */}
      <motion.div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 grid place-items-center pointer-events-none",
          v.label,
        )}
        style={{ x: isx, y: isy }}
      >
        {children}
      </motion.div>
    </motion.a>
  );
}
