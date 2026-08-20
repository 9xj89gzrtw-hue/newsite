"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Ridgewells editorial section header — Cycle 21.
 * The signature rhythm: wide-tracked uppercase eyebrow fades up first,
 * then a huge Playfair Display headline follows ~0.15s later.
 *
 * Source: docs/RIDGEWELLS-ANALYSIS.md §1.2, §9 (P1.1), §10.1.
 * Respects prefers-reduced-motion (renders static, no transform).
 */

const EASE = [0.4, 0, 0.2, 1] as const;

type SectionHeaderProps = {
  eyebrow?: ReactNode;
  headline: ReactNode;
  /** Optional sub-headline / lead paragraph below the headline. */
  lead?: ReactNode;
  /** Text alignment. */
  align?: "left" | "center";
  /** Tone — controls eyebrow + headline color tokens. */
  tone?: "light" | "dark" | "bordeaux";
  /** Size of the headline. */
  size?: "default" | "xl";
  /** Extra className for the wrapper. */
  className?: string;
  /** Override the default stagger delays (ms). */
  headlineDelay?: number;
  leadDelay?: number;
};

const TONE_CLASSES: Record<
  NonNullable<SectionHeaderProps["tone"]>,
  { eyebrow: string; headline: string; lead: string }
> = {
  light: {
    eyebrow: "text-bordeaux",
    headline: "text-ink",
    lead: "text-ink/70",
  },
  dark: {
    eyebrow: "text-gold",
    headline: "text-cream",
    lead: "text-cream/75",
  },
  bordeaux: {
    eyebrow: "text-cream/70",
    headline: "tinted-headline",
    lead: "text-cream/80",
  },
};

export function SectionHeader({
  eyebrow,
  headline,
  lead,
  align = "left",
  tone = "light",
  size = "default",
  className = "",
  headlineDelay = 0.15,
  leadDelay = 0.3,
}: SectionHeaderProps) {
  const reduce = useReducedMotion();
  const tones = TONE_CLASSES[tone];
  const alignCls = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  const headlineCls = size === "xl" ? "display-headline-xl" : "display-headline";

  const baseTransition = { duration: 0.8, ease: EASE };

  return (
    <div className={`flex flex-col gap-4 ${alignCls} ${className}`}>
      {eyebrow ? (
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ ...baseTransition, duration: 0.6 }}
          className={`eyebrow ${tones.eyebrow}`}
        >
          {eyebrow}
        </motion.p>
      ) : null}

      <motion.h2
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ ...baseTransition, delay: headlineDelay }}
        className={`${headlineCls} ${tones.headline}`}
      >
        {headline}
      </motion.h2>

      {lead ? (
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ ...baseTransition, delay: leadDelay }}
          className={`mt-2 max-w-2xl text-[1.05rem] leading-[1.55] ${tones.lead}`}
        >
          {lead}
        </motion.p>
      ) : null}
    </div>
  );
}
