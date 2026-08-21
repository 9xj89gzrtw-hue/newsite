import Image from "next/image";

/**
 * CepEditorialDivider — Creative Edge Parties section-5 divider replica (Cycle 27).
 *
 * A pure visual breather: full-bleed cream section with a single art-directed
 * photograph filling it, Ken-Burns slow zoom, NO text overlay. CEP editorial
 * rule — let the imagery breathe between heavy type sections.
 * (creativeedge-analysis.md §6.7)
 *
 * Top + bottom edges fade from cream → transparent so the photo blends
 * seamlessly into the adjacent cream sections above/below (no hard seam).
 *
 * Server Component — no hooks, no client JS. The Ken-Burns animation is pure
 * CSS (`.cep-bg-zoom` keyframes already defined in globals.css), and
 * `prefers-reduced-motion` is handled at the CSS layer (globals.css disables
 * `.cep-bg-zoom` animation under reduced motion).
 */

export function CepEditorialDivider() {
  return (
    <section
      data-header-theme="light"
      aria-label="Фото-разделитель"
      className={
        "cep-section-cream relative h-[40vh] overflow-hidden md:h-[55vh] " +
        // Top edge: cream → transparent (blends with section above)
        "before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-16 " +
        "before:bg-gradient-to-b before:from-cep-cream before:to-transparent before:content-[''] " +
        // Bottom edge: transparent → cream (blends with section below)
        "after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-16 " +
        "after:bg-gradient-to-t after:from-cep-cream after:to-transparent after:content-['']"
      }
    >
      <Image
        src="/media/cep/cep-divider-image.png"
        alt=""
        fill
        sizes="100vw"
        className="cep-bg-zoom object-cover"
      />
    </section>
  );
}
