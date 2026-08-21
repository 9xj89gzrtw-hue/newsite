"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { Reveal } from "./reveal";

/**
 * SbPressStrip — Salt Block "as featured in" press strip (Cycle 26).
 *
 * REFERENCE: docs/SALTBLOCK-ANALYSIS.md §6.2 + §13.8 — "the press strip
 * docked at the bottom [of the hero] is a tiny cheap wow that signals
 * authority". Cycle 26 brief (Task 3-B): "build saltblock-press-strip.tsx —
 * press strip with verifiable publication logos".
 *
 * Two variants:
 *  - `docked`      — absolute bottom 0, full-width, gradient overlay to
 *                    dark (handled by .sb-press-strip[data-variant="docked"]
 *                    in globals.css), cream logos at 85% opacity.
 *  - `standalone`  — own <section>, eyebrow + centered flex row of 6 logos,
 *                    max-w-[1070px] mx-auto, 4rem vertical padding.
 *
 * Logos are rendered as inline SVG <text> elements — no external image
 * assets, so the strip stays asset-light and crisp at any DPR. Each logo
 * uses var(--font-serif) (Playfair Display) or var(--font-barlow)
 * (Barlow Semi Condensed) at 22px. Color + opacity controlled by the
 * .sb-press-strip__logo class scoped under [data-variant] in globals.css.
 *
 * Russian press choice: per SALTBLOCK-ANALYSIS.md §12.3, Salt Block's own
 * 4-logo strip uses regional Tampa publications which would feel weak for
 * our СПб luxury positioning — we use national-tier Russian outlets instead
 * (Forbes Russia, AFISHA Daily, The Village, Собака.ru, TimeOut СПб,
 * Resto.ru).
 */
export interface SbPressStripProps {
  /** `docked` = pinned to hero bottom edge; `standalone` = own section. */
  variant?: "docked" | "standalone";
  /** Optional "О НАС ПИШУТ" eyebrow above the row (standalone only). */
  eyebrow?: string;
  /** Override the default 6-logo list. */
  logos?: string[];
  /** Extra className merged into the root element. */
  className?: string;
}

const DEFAULT_LOGOS = [
  "Resto.ru",
  "АФИША Daily",
  "The Village",
  "Собака.ru",
  "Time Out",
  "Forbes",
];

const STAGGER = 0.08;

/**
 * Pick a font family per logo so the row reads as a real magazine masthead
 * (display serif for the classical brands, condensed sans for the modern
 * outlets). Falls back to web-safe fonts if the next/font variables haven't
 * loaded yet.
 */
function pickFont(label: string): {
  fontFamily: string;
  fontWeight: number;
  letterSpacing: string;
} {
  // Classical / editorial outlets → Playfair Display (high-contrast serif).
  const isSerif = /АФИША|Forbes|Собака/.test(label);
  if (isSerif) {
    return {
      fontFamily:
        "var(--font-serif), 'Playfair Display', Georgia, 'Times New Roman', serif",
      fontWeight: 500,
      letterSpacing: "0.01em",
    };
  }
  // Modern / industry outlets → Barlow Semi Condensed (tight grotesk).
  return {
    fontFamily:
      "var(--font-barlow), 'Barlow Semi Condensed', system-ui, sans-serif",
    fontWeight: 600,
    letterSpacing: "0.04em",
  };
}

function LogoText({ label }: { label: string }) {
  const font = pickFont(label);
  return (
    <svg
      viewBox="0 0 220 40"
      role="img"
      aria-label={label}
      className="block h-[22px] w-auto max-w-[180px]"
      style={{ overflow: "visible" }}
    >
      <text
        x="0"
        y="27"
        fontFamily={font.fontFamily}
        fontSize="22"
        fontWeight={font.fontWeight}
        letterSpacing={font.letterSpacing}
        fill="currentColor"
      >
        {label}
      </text>
    </svg>
  );
}

const dockedListStyle: CSSProperties = {
  padding: "1.5rem 2rem",
};

export function SbPressStrip({
  variant = "standalone",
  eyebrow = "О НАС ПИШУТ",
  logos = DEFAULT_LOGOS,
  className = "",
}: SbPressStripProps) {
  const reduce = useReducedMotion();

  // ===== DOCKED VARIANT — pinned to hero bottom edge =====
  if (variant === "docked") {
    return (
      <div
        data-component="sb-press-strip"
        data-variant="docked"
        className={`sb-press-strip pointer-events-none absolute inset-x-0 bottom-0 z-20 ${className}`}
        aria-label="СМИ о нас"
      >
        <ul
          className="sb-press-strip__list pointer-events-auto relative mx-auto flex max-w-[1070px] flex-wrap items-center justify-center gap-x-8 gap-y-3 md:gap-x-12"
          style={dockedListStyle}
        >
          {logos.map((label, i) => (
            <motion.li
              key={label}
              className="sb-press-strip__logo"
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 0.85, y: 0 }}
              transition={{
                delay: reduce ? 0 : 0.15 + i * STAGGER,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <LogoText label={label} />
            </motion.li>
          ))}
        </ul>
      </div>
    );
  }

  // ===== STANDALONE VARIANT — own section, eyebrow + centered row =====
  return (
    <section
      data-component="sb-press-strip"
      data-variant="standalone"
      className={`sb-press-strip relative w-full bg-cream py-16 md:py-20 ${className}`}
      aria-label="СМИ о нас"
    >
      <div className="mx-auto max-w-[1070px] px-5 md:px-8">
        {eyebrow ? (
          <Reveal>
            <p className="mb-8 text-center font-barlow text-[11px] uppercase tracking-[0.32em] text-ink/60 md:text-xs">
              {eyebrow}
            </p>
          </Reveal>
        ) : null}
        <Reveal delay={0.08}>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-14">
            {logos.map((label, i) => (
              <motion.li
                key={label}
                className="sb-press-strip__logo"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={reduce ? undefined : { opacity: 0.85, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  delay: i * STAGGER,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <LogoText label={label} />
              </motion.li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export default SbPressStrip;
