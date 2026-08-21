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
  /** Visual variant — `default` keeps the Ridgewells editorial rhythm,
   *  `joels` switches to the joels.com rhythm (sage 0.4em eyebrow + 50px
   *  Playfair headline). Backward-compatible — default unchanged. */
  variant?: "default" | "joels";
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
  variant = "default",
  className = "",
  headlineDelay = 0.15,
  leadDelay = 0.3,
}: SectionHeaderProps) {
  const reduce = useReducedMotion();
  const tones = TONE_CLASSES[tone];
  const alignCls = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  const headlineCls =
    variant === "joels"
      ? "joel-section-title"
      : size === "xl"
        ? "display-headline-xl"
        : "display-headline";
  // Joels eyebrow: sage, 0.4em tracking, 11px, Karla 500, uppercase.
  // Default eyebrow keeps the existing `.eyebrow` class behaviour.
  const eyebrowCls = variant === "joels" ? "joel-eyebrow" : `eyebrow ${tones.eyebrow}`;
  // In joels variant, the headline uses the joels color (ink) regardless of tone
  // — the .joel-section-title class hardcodes color: var(--ink). We still
  // pass tones.headline for the default variant.
  const headlineColorCls = variant === "joels" ? "" : tones.headline;

  const baseTransition = { duration: 0.8, ease: EASE };

  return (
    <div className={`flex flex-col gap-4 ${alignCls} ${className}`}>
      {eyebrow ? (
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ ...baseTransition, duration: 0.6 }}
          className={eyebrowCls}
        >
          {eyebrow}
        </motion.p>
      ) : null}

      <motion.h2
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ ...baseTransition, delay: headlineDelay }}
        className={`${headlineCls} ${headlineColorCls}`}
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
