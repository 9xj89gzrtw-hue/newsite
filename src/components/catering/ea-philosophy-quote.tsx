"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * EaPhilosophyQuote — Elegant Affairs editorial philosophy quote moment.
 *
 * Pattern source: docs/EA-ANALYSIS.md §3.7 (Secret Ingredient "We're your
 * secret ingredient." blush-bg full-bleed quote with oversized champagne-gif
 * decoration) + §4.5 (italic-as-fragment trailing-phrase typographic device).
 *
 * Adaptation for Interfood:
 *  - Pure-black bg (--ea-black) instead of EA's blush — closes the
 *    "philosophy beat" with cinematic drama before Calculator. EA's pink-blush
 *    is reserved for the more intimate EaTastingCta section.
 *  - Giant red Playfair italic opening quote mark """ positioned absolute
 *    top-left of the quote block (font-size clamp 7rem→11rem, opacity 0.9,
 *    line-height 1, padding-bottom 0).
 *  - Quote text in Playfair Display italic, clamp 1.875rem→3rem, line-height
 *    1.32, cream/95, letter-spacing -0.012em. Italic-as-fragment device: the
 *    word "ритуал" colored red (signature EA device transposed to RU copy).
 *  - Below: red 2px × 64px horizontal divider (.ea-divider-red).
 *  - Attribution line: chef name + role, Montserrat 500 0.9rem, letter-spacing
 *    0.05em, cream/75.
 *
 * Replaces: src/components/catering/quote-band.tsx (Ridgewells bordeaux/gold).
 * Does NOT delete quote-band.tsx — the orchestrator decides wiring.
 *
 * Placement (target): interstitial between Services and Calculator — gives the
 * page a "philosophical pause" before the price-transparency block. Mirrors
 * EA's Secret Ingredient section position between About/Our Food + Events.
 *
 * Reveal-on-scroll: the entire block fades up + slight scale (0.98 → 1) over
 * 900ms. Respects prefers-reduced-motion (per EA-ANALYSIS.md §9 motion schedule).
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export function EaPhilosophyQuote() {
  const reduce = useReducedMotion();

  return (
    <section
      data-header-theme="dark"
      aria-label="Философия — Дмитрий Нилов, шеф-повар Interfood Catering"
      className="ea-section ea-section--black relative overflow-hidden"
      style={{
        paddingTop: "clamp(6rem, 12vw, 10rem)",
        paddingBottom: "clamp(6rem, 12vw, 10rem)",
      }}
    >
      {/* Subtle red vignette for editorial depth — barely-there painterly
          bloom on the black, never enough to distract from the quote. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 16% 18%, rgba(231,29,58,0.10) 0%, transparent 55%), radial-gradient(ellipse at 88% 92%, rgba(231,29,58,0.06) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Decorative top + bottom hairline rules — EA's editorial divider
          discipline (one thin rule, not gradients or borders). */}
      <div
        className="pointer-events-none absolute inset-x-[8%] top-10"
        style={{
          height: "1px",
          background:
            "linear-gradient(to right, transparent, rgba(247,245,245,0.18), transparent)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-[8%] bottom-10"
        style={{
          height: "1px",
          background:
            "linear-gradient(to right, transparent, rgba(247,245,245,0.18), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[980px] px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 32, scale: 0.98 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative"
        >
          {/* Giant red Playfair italic opening quote mark — positioned
              absolute top-left of the quote column. Decorative only
              (aria-hidden). The low-9 mark opens upward and anchors the
              eye to the first word of the quote. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute select-none font-serif italic"
            style={{
              top: "clamp(-2.5rem, -4vw, -1rem)",
              left: "clamp(-1.5rem, -3vw, -0.5rem)",
              fontSize: "clamp(7rem, 11vw, 11rem)",
              lineHeight: 1,
              color: "var(--ea-red)",
              opacity: 0.9,
              paddingBottom: 0,
            }}
          >
            {"\u201C"}
          </span>

          {/* Quote — Playfair Display italic. Whole quote italic per EA's
              §3.7 device. The word "ритуал" is the italic-as-fragment
              emphasis word, colored red. */}
          <blockquote
            className="relative font-serif italic"
            style={{
              fontSize: "clamp(1.875rem, 3.6vw, 3rem)",
              lineHeight: 1.32,
              letterSpacing: "-0.012em",
              color: "color-mix(in oklab, var(--ea-cream) 95%, transparent)",
            }}
          >
            Еда — это не логистика. Это{" "}
            <i className="italic" style={{ color: "var(--ea-red)" }}>
              ритуал
            </i>
            . От первого ножа до последнего бокала — каждый момент служит
            одному: чтобы гости запомнили этот вечер на всю жизнь.
          </blockquote>

          {/* Red 2px × 64px horizontal divider — EA's signature closing
              rule after every editorial moment. */}
          <span
            className="ea-divider-red mt-12"
            style={{ display: "block" }}
          />

          {/* Attribution — Montserrat 500, 0.9rem, letter-spacing 0.05em,
              cream/75. Uppercase per EA's eyebrow discipline. */}
          <p
            className="mt-6"
            style={{
              fontFamily: "var(--ea-font-body)",
              fontWeight: 500,
              fontSize: "0.9rem",
              letterSpacing: "0.05em",
              color: "color-mix(in oklab, var(--ea-cream) 75%, transparent)",
            }}
          >
            — ДМИТРИЙ НИЛОВ, ШЕФ-ПОВАР INTERFOOD CATERING
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default EaPhilosophyQuote;
