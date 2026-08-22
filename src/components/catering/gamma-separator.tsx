import Image from "next/image";
import { ClipPathReveal } from "@/components/motion/clip-path-reveal";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";

/**
 * GammaSeparator — Cycle 31 (gammacatering.com signature full-bleed separator)
 * --------------------------------------------------------------------------
 * A cinematic full-bleed photo breather that gamma inserts between major
 * sections (their `.full-width-image.has-fixed-ratio` pattern, e.g.
 * `gamma-catering-separator-scaled.jpg` between the experiences block and
 * the locations block). Pure visual rest — no CTAs, no body copy, just the
 * image + an optional centered handwritten watermark.
 *
 * Layout:
 *  - Section: width:100%; height: clamp(280px, 38vw, 480px) — a wide landscape
 *    band, shorter than the hero. Below the fold, so priority={false} on
 *    the next/image (let the LCP-critical assets above load first).
 *  - next/image fill + object-cover, sized at 100vw so the photo is
 *    responsive at every breakpoint.
 *  - Overlay: subtle dark gradient `from-black/20 via-transparent to-black/20`
 *    (left-edge + right-edge darkening) so a centered accent could sit on
 *    either side and still read; also adds depth to a flat photo.
 *  - Centered handwritten watermark "interfood" in Marck Script
 *    (--font-marck), rotated -6° (gamma's signature tilt), white at 70%
 *    opacity, font-size clamp(2rem, 4vw, 3.5rem) — gamma's "Gamma is a
 *    feeling" -6° handwritten accent applied to our separator.
 *
 * Cycle 34 WOW graft (sondaven.com):
 *  - `data-theme-flip="espresso"` flips the html root `--background` to night
 *    (espresso) for the duration of this band — the "interfood" handwritten
 *    watermark (-6° tilt, Marck Script) pops on dark for cinematic contrast
 *    between the founder story above and the FAQ below.
 *  - The full-bleed photo (image + overlay + watermark together) reveals
 *    left→right via `ClipPathReveal direction="left"` on enter — different
 *    direction from the editorial divider (bottom) and tott parallax band
 *    (top) for variety across the 3 parallax bands.
 *  - The "interfood" watermark text now drops in per-char via SplitTextReveal
 *    mode="chars" stagger={0.04} — each letter lifts in from below with a
 *    40ms stagger. The -6° tilt, Marck Script face, and 70% opacity white
 *    color are preserved (they're on the outer `.gamma-separator__watermark`
 *    span, which now wraps the SplitTextReveal instance).
 *
 * Server Component — no hooks, no client JS at the section level. ClipPathReveal
 * and SplitTextReveal are client islands (motion/react + split-type); the
 * `.gamma-separator` CSS class still controls the section's height/overflow/
 * bg-color, and `prefers-reduced-motion` is handled inside both motion
 * primitives (they render static markup under reduced motion).
 *
 * Photo asset: /media/gamma/gamma-catering-separator.jpg (downloaded from
 * gammacatering.com in Task 1).
 */

const SEPARATOR_HEIGHT = "clamp(280px, 38vw, 480px)";

export function GammaSeparator() {
  return (
    <section
      data-component="gamma-separator"
      data-header-theme="light"
      data-theme-flip="espresso"
      aria-label="Фото-разделитель — пауза между разделами"
      className="gamma-separator"
    >
      {/*
        ClipPathReveal wraps the full-bleed photo + overlay + watermark
        together so the whole stack reveals left→right on enter. The wrapper
        div inside ClipPathReveal carries an explicit height matching the
        section's `.gamma-separator` height (clamp(280px, 38vw, 480px)) so
        next/image `fill` (position:absolute) has a definite containing
        block — the inner motion.div's height is auto, so this in-flow
        wrapper establishes it. The `.gamma-separator__watermark` span keeps
        its -6° tilt + Marck Script face + white 70% opacity (defined in CSS)
        — the SplitTextReveal inside it inherits those styles and just adds
        the per-char drop-in animation.
      */}
      <ClipPathReveal direction="left" duration={1.0} className="absolute inset-0">
        <div className="relative w-full" style={{ height: SEPARATOR_HEIGHT }}>
          <Image
            src="/media/gamma/gamma-catering-separator.jpg"
            alt=""
            fill
            sizes="100vw"
            priority={false}
            className="gamma-separator__img object-cover"
          />
          {/* Subtle left/right darkening — depth + legible accent backdrop. */}
          <div
            className="gamma-separator__overlay"
            aria-hidden="true"
          />
          {/* Gamma-style -6° handwritten watermark — centered, rotated,
              70% opacity white Marck Script. The outer span carries the
              layout + visual treatment (CSS .gamma-separator__watermark);
              the inner SplitTextReveal splits "interfood" into chars and
              drops each letter in from below with 40ms stagger. */}
          <span
            className="gamma-separator__watermark"
            aria-hidden="true"
          >
            <SplitTextReveal as="span" mode="chars" stagger={0.04}>
              interfood
            </SplitTextReveal>
          </span>
        </div>
      </ClipPathReveal>
    </section>
  );
}

export default GammaSeparator;
