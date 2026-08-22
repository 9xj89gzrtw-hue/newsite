import Image from "next/image";

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
 * Server Component — no hooks, no client JS. The handwritten watermark is
 * pure CSS (font-family + transform + opacity), no animation needed.
 *
 * Photo asset: /media/gamma/gamma-catering-separator.jpg (downloaded from
 * gammacatering.com in Task 1).
 */

export function GammaSeparator() {
  return (
    <section
      data-component="gamma-separator"
      data-header-theme="light"
      aria-label="Фото-разделитель — пауза между разделами"
      className="gamma-separator"
    >
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
          70% opacity white Marck Script. */}
      <span
        className="gamma-separator__watermark"
        aria-hidden="true"
      >
        interfood
      </span>
    </section>
  );
}

export default GammaSeparator;
