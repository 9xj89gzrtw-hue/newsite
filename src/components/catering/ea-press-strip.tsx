"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ComponentProps, CSSProperties } from "react";
import "./ea-press-strip.css";

/**
 * EaPressStrip — standalone Elegant Affairs press strip (Cycle 28 — Task 4-G).
 *
 * Restores the orphaned `sb-press-strip.tsx` variant (per AGENTS.md §17 TODO
 * + docs/CYCLE-28-COMPONENT-AUDIT.md §7 item #7) as a fresh ea-* component.
 * This is NOT docked to the hero — it's a section in its own right, used
 * mid-page as a low-band authority signal: eight verifiable publication
 * mastheads in a single horizontal row, separated by 1px hairlines, with a
 * small uppercase tagline beneath each name and a single text + arrow CTA
 * at the bottom.
 *
 * DESIGN-LANGUAGE SOURCES (docs/EA-ANALYSIS.md):
 *   - §3.12 Blog + Press — EA's own press strip uses card-style images with
 *     badge overlays. We strip that down to TEXT ONLY (no images, no badges)
 *     per Cycle 28 minimalism mandate (audit §7 #7 "restored from orphaned
 *     SbPressStrip standalone variant").
 *   - §5.1   text + arrow link button (no fill, no border) — bottom CTA.
 *   - §5.4   2 px solid horizontal rule — here: 1px hairline mauve vertical
 *            dividers between cards.
 *   - §5.5   eyebrow — small uppercase label above the headline.
 *   - §4.6   text + animated arrow buttons.
 *   - §4.7   section reveal on scroll — stagger 0.04s per card.
 *
 * HOVER PATTERN (see ea-press-strip.css):
 *   - Default: name in Playfair italic 1rem, ink @ opacity 0.7.
 *   - On hover/focus: opacity → 1, scale 1.05, and a 2px × 24px red line
 *     grows from 0 to 24px width above the name. The line + scale combo
 *     mimics EA's "right_arr_btn" hover micro-animation (nudge + red colour
 *     pop) transposed to a card context.
 *
 * ACCESSIBILITY:
 *   - Each card is a real `<a>` link with `aria-label` containing the
 *     publication name + tagline (so screen readers don't lose context
 *     when the visual hierarchy splits name + tagline into separate spans).
 *   - Visible focus ring (1px solid red, 4px offset) for keyboard parity.
 *   - Decorative line is `aria-hidden`.
 *   - Honors `prefers-reduced-motion` (line shows permanently, no scale).
 *
 * CONTENT: 8 typical RU catering/lifestyle publications per the Cycle 28
 * brief — Resto.ru, Афиша Daily, The Village, Собака.ru, Time Out, Forbes,
 * Ресторановед, Gastronomika. Each card has a small uppercase tagline:
 * "Гид 2024", "Рейтинг 2025", or "Интервью".
 */

const EASE = [0.22, 1, 0.36, 1] as const;

type Press = { name: string; tagline: string; href: string };

const PRESS: Press[] = [
  { name: "Resto.ru", tagline: "Гид 2024", href: "https://www.resto.ru/" },
  { name: "Афиша Daily", tagline: "Рейтинг 2025", href: "https://daily.afisha.ru/" },
  { name: "The Village", tagline: "Обзор", href: "https://www.the-village.ru/" },
  { name: "Собака.ru", tagline: "Интервью", href: "https://www.sobaka.ru/" },
  { name: "Time Out", tagline: "Гид 2024", href: "https://www.timeout.com/" },
  { name: "Forbes", tagline: "Рейтинг 2025", href: "https://www.forbes.ru/" },
  { name: "Ресторановед", tagline: "Интервью", href: "#press" },
  { name: "Gastronomika", tagline: "Обзор", href: "#press" },
];

type MotionLiProps = ComponentProps<typeof motion.li>;
type MotionPProps = ComponentProps<typeof motion.p>;
type MotionDivProps = ComponentProps<typeof motion.div>;

export function EaPressStrip() {
  const reduce = useReducedMotion();

  // Shared Motion reveal preset — fade-up 14px → 0 over 500ms with per-card
  // stagger 0.04s. Empty when reduced-motion is requested.
  const cardReveal = (i: number): Partial<MotionLiProps> =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-40px" },
          transition: {
            duration: 0.5,
            delay: 0.04 * i,
            ease: EASE,
          },
        };

  const eyebrowReveal: Partial<MotionPProps> = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.5, ease: EASE },
      };

  const ctaReveal: Partial<MotionDivProps> = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-40px" },
        transition: { duration: 0.5, delay: 0.32, ease: EASE },
      };

  return (
    <section
      data-component="ea-press-strip"
      data-header-theme="light"
      aria-label="СМИ о нас"
      className="ea-section ea-section--white relative"
      style={{ paddingBlock: "clamp(3rem, 5vw, 4.5rem)" }}
    >
      <div className="ea-container ea-container--wide">
        {/* Eyebrow — mauve (overriding the default ea-eyebrow red). */}
        <motion.p
          className="ea-eyebrow text-center"
          style={{ color: "var(--ea-mauve)" }}
          {...eyebrowReveal}
        >
          О нас пишут
        </motion.p>

        {/* Press row — single horizontal row on desktop, wraps on mobile. */}
        <ul
          className="mt-10 flex flex-wrap items-stretch justify-center"
          style={{ marginTop: "clamp(1.5rem, 3vw, 2.25rem)", gap: 0 }}
        >
          {PRESS.map((p, i) => {
            const isLast = i === PRESS.length - 1;
            const isExternal = !p.href.startsWith("#");
            const liStyle: CSSProperties = {
              position: "relative",
              display: "flex",
              flex: "1 1 11rem",
              maxWidth: "16rem",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.25rem 1rem",
              borderRight: isLast
                ? "none"
                : "1px solid color-mix(in oklch, var(--ea-mauve) 25%, transparent)",
            };
            return (
              <motion.li
                key={p.name}
                className="ea-press-strip__item"
                style={liStyle}
                {...cardReveal(i)}
              >
                <a
                  href={p.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="ea-press-strip__card"
                  aria-label={`${p.name} — ${p.tagline}`}
                >
                  {/* Red 2px × 24px line — grows from 0 on hover (see CSS). */}
                  <span className="ea-press-strip__line" aria-hidden="true" />
                  {/* Publication name — Playfair italic 1rem, ink @ 0.7. */}
                  <span className="ea-press-strip__name">{p.name}</span>
                  {/* Tagline — Montserrat 0.7rem uppercase mauve. */}
                  <span className="ea-press-strip__tagline">{p.tagline}</span>
                </a>
              </motion.li>
            );
          })}
        </ul>

        {/* Bottom CTA — ea-text-link → #press anchor (route not built yet). */}
        <motion.div
          className="mt-10 text-center"
          style={{ marginTop: "clamp(1.75rem, 3vw, 2.5rem)" }}
          {...ctaReveal}
        >
          <a href="#press" className="ea-text-link" style={{ fontSize: "0.85rem" }}>
            Читать все публикации
            <svg
              className="ea-text-link__arrow"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default EaPressStrip;
