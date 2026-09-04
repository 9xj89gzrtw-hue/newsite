import Image from "next/image";
import { ClipPathReveal } from "@/components/motion/clip-path-reveal";

/**
 * CepEditorialDivider — Creative Edge Parties section-5 divider replica (Cycle 27).
 *
 * A pure visual breather: full-bleed section with a single art-directed
 * photograph filling it, Ken-Burns slow zoom, NO text overlay. CEP editorial
 * rule — let the imagery breathe between heavy type sections.
 * (creativeedge-analysis.md §6.7)
 *
 * Top + bottom edges fade from the active theme bg → transparent so the photo
 * blends seamlessly into the adjacent sections above/below (no hard seam).
 *
 * Cycle 34 WOW graft (sondaven.com):
 *  - `data-theme-flip="espresso"` flips the html root `--background` to night
 *    (espresso) for the duration of this band — cinematic contrast after the
 *    bright carousel above and before the cream services section below.
 *  - The photo reveals bottom→top via `ClipPathReveal direction="bottom"` on
 *    enter (the existing Ken-Burns CSS animation continues to play inside the
 *    clipped container; the two animations compose on different elements).
 *  - Edge fades use `from-background` (dynamic CSS var) so they always match
 *    the active theme — cream when the section is out of view, espresso while
 *    the band is the focus.
 *
 * Server Component — no hooks, no client JS at the section level. The
 * ClipPathReveal wrapper is a client island (framer-motion useInView); the
 * Ken-Burns animation is pure CSS (`.cep-bg-zoom` keyframes already defined in
 * globals.css), and `prefers-reduced-motion` is handled at the CSS layer
 * (globals.css disables `.cep-bg-zoom` animation under reduced motion) plus
 * inside ClipPathReveal (renders a plain `<div>` wrapper under reduced motion).
 */

export function CepEditorialDivider() {
  return (
    <section
      data-header-theme="light"
      data-theme-flip="espresso"
      aria-label="Фото-разделитель"
      className={
        "relative h-[40vh] overflow-hidden md:h-[55vh] " +
        // Top edge: theme bg → transparent (blends with section above). Uses
        // the dynamic `--background` var so the fade matches whatever theme
        // is currently active (espresso while this band is in view, cream
        // otherwise — smooth hand-off on scroll).
        "before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-16 " +
        "before:bg-gradient-to-b before:from-background before:to-transparent before:content-[''] " +
        // Bottom edge: transparent → theme bg (blends with section below).
        "after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-16 " +
        "after:bg-gradient-to-t after:from-background after:to-transparent after:content-['']"
      }
    >
      {/*
        ClipPathReveal wraps the photo container; the existing Ken-Burns zoom
        (`.cep-bg-zoom` on the Image) keeps playing inside. The two animations
        compose on different elements: outer motion.div clips (bottom→top),
        inner motion.div scales 1.15→1.0, Image does its own Ken-Burns scale.

        The wrapper div inside ClipPathReveal carries an explicit height
        matching the section so next/image `fill` (position:absolute) has a
        definite containing block — the inner motion.div's height is auto, so
        the wrapper establishes the in-flow content that gives it height.
      */}
      <ClipPathReveal direction="bottom" duration={1.1} className="absolute inset-0">
        <div className="relative h-[40vh] w-full md:h-[55vh]">
          <Image
            src="/media/cep/cep-locations-bg.jpg"
            alt=""
            fill
            sizes="100vw"
            className="cep-bg-zoom object-cover"
          />
        </div>
      </ClipPathReveal>
    </section>
  );
}
