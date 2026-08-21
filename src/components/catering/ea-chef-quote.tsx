"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/**
 * EaChefQuote — Cycle 28 ea-* editorial layer.
 *
 * Full-bleed editorial chef-quote moment. Grafts EA's founder-as-voice pattern
 * (BRAND-CONTEXT.md §3.5 About pitch + EA-ANALYSIS.md §4.5 italic-as-fragment
 * typographic device) onto Interfood's cinematic editorial design language.
 *
 * Sits between Manifesto and Menu in the client journey (orchestrator wires it
 * in Step 5). Provides a "human beat" — the founder's own voice — between the
 * cinematic «ПИР» scroll wow and the menu list.
 *
 * Layout:
 *   - Full-bleed section, 80vh min-height (60vh on mobile, 88vh on desktop).
 *   - Background: full-bleed photo `/media/event-chef-action.jpg` + dark
 *     gradient overlay (left-heavy: 65% → 30% → 5% across the width) so the
 *     left-aligned quote stays legible on the left half.
 *   - Centered narrow column (max-width 880px), text left-aligned.
 *   - Giant red Playfair italic opening quote mark — clamp(6rem → 9rem),
 *     color var(--ea-red), opacity 0.85, absolutely positioned so it overlaps
 *     the start of the quote text (Ridgewells + EA editorial pattern).
 *   - Quote text in Playfair Display italic — clamp(1.75rem → 2.5rem),
 *     line-height 1.3, color cream (#F7F5F5).
 *   - Below: red 64×2px horizontal divider (.ea-divider-red) + signature
 *     "— Дмитрий Нилов, шеф-повар Interfood Catering" in Montserrat 500,
 *     letter-spacing 0.05em, color cream.
 *
 * Animation: Motion `whileInView` + `viewport={{ once: true }}`. Quote text
 * fades in with stagger — first the quote mark, then quote line-by-line (we
 * fake line-by-line with a 3-step stagger: mark → quote → divider+signature).
 * Respects `prefers-reduced-motion` — animations become static.
 *
 * Accessibility:
 *   - Section landmark with `aria-labelledby`.
 *   - Decorative quote mark `aria-hidden`.
 *   - WCAG AA: cream (#F7F5F5) on dark overlay (≈ 0.15 luminance behind the
 *     gradient) ≈ 14:1 ✓; ea-red (#E71D3A) on dark bg ≈ 4.3:1 — passes AA Large
 *     for the quote-mark decorative character (treated as decorative so AA
 *     contrast requirements don't strictly apply).
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const QUOTE_TEXT =
  "Еда — это ритуал. Не меню, не список калорий, не логистика. Ритуал, в котором каждая деталь — от первого ножа до последнего бокала — служит одному: моменту, который гости запомнят на всю жизнь.";

const QUOTE_ATTRIBUTION = "— Дмитрий Нилов, шеф-повар Interfood Catering";

export function EaChefQuote() {
  const reduce = useReducedMotion();

  // Motion presets — reduced-motion → static render (no animation props).
  const markProps = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.7, ease: EASE },
      };
  const quoteProps = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.9, delay: 0.18, ease: EASE },
      };
  const sigProps = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.8, delay: 0.45, ease: EASE },
      };

  return (
    <section
      id="chef-quote"
      aria-labelledby="ea-chef-quote-headline"
      data-header-theme="dark"
      className="ea-section ea-section--black relative overflow-hidden"
      style={{
        // Full-bleed, 80vh min, slightly less on mobile (60vh) so it doesn't
        // feel like a giant void on a small phone.
        minHeight: "clamp(60vh, 80vh, 88vh)",
        // Override ea-section padding so the bg photo bleeds edge-to-edge.
        paddingTop: 0,
        paddingBottom: 0,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Full-bleed chef photo background */}
      <Image
        src="/media/event-chef-action.jpg"
        alt="Шеф-повар Дмитрий Нилов за работой на кухне Interfood Catering"
        fill
        sizes="100vw"
        priority={false}
        className="object-cover"
        style={{
          // Keep the photo slightly behind the gradient so it reads as
          // atmospheric backdrop, not as the primary subject.
          objectPosition: "center 35%",
        }}
      />

      {/* Dark gradient overlay — left-heavy so left-aligned quote is legible.
          Loop cycle 1: VLM flagged right-shoulder readability issue →
          strengthen the left-to-right gradient (85% → 35% → transparent). */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.05) 100%)",
        }}
        aria-hidden="true"
      />
      {/* Subtle vertical vignette — bottom fade so the section transitions
          cleanly into the next light section (Menu). */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.35) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Centered narrow column, left-aligned text */}
      <div className="ea-container ea-container--narrow relative z-10 w-full">
        <div className="relative py-20 md:py-28">
          {/* Giant red Playfair italic opening quote mark — absolutely
              positioned so it overlaps with the start of the quote text. */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute select-none"
            style={{
              top: "clamp(-1rem, -2vw, -2.5rem)",
              left: "clamp(-1.5rem, -3vw, -3rem)",
              fontFamily: "var(--ea-font-display)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(6rem, 12vw, 9rem)",
              lineHeight: 1,
              color: "var(--ea-red)",
              opacity: 0.85,
              letterSpacing: "-0.04em",
            }}
            {...markProps}
          >
            “
          </motion.span>

          {/* Quote text — Playfair Display italic, large, cream. */}
          <motion.blockquote
            id="ea-chef-quote-headline"
            {...quoteProps}
            style={{
              fontFamily: "var(--ea-font-display)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              lineHeight: 1.3,
              color: "var(--ea-cream)",
              letterSpacing: "-0.012em",
              maxWidth: "44ch",
              position: "relative",
              zIndex: 1,
            }}
          >
            {QUOTE_TEXT}
          </motion.blockquote>

          {/* Red 64×2px horizontal divider */}
          <motion.span
            className="ea-divider-red mt-10"
            {...sigProps}
            aria-hidden="true"
          />

          {/* Signature — Montserrat 500, letter-spaced, cream */}
          <motion.p
            {...sigProps}
            style={{
              marginTop: "1.25rem",
              fontFamily: "var(--ea-font-body)",
              fontWeight: 500,
              fontSize: "clamp(0.85rem, 1.1vw, 1rem)",
              letterSpacing: "0.05em",
              color: "var(--ea-cream)",
              opacity: 0.92,
            }}
          >
            {QUOTE_ATTRIBUTION}
          </motion.p>
        </div>
      </div>
    </section>
  );
}

export default EaChefQuote;
