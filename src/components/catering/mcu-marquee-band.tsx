/**
 * McuMarqueeBand — slow continuous auto-scrolling marquee band.
 *
 * A thin navy band with gold-light italic Playfair text scrolling infinitely.
 * mculinary doesn't have one, but the user explicitly wants "wow effects" and
 * "auto-moving" elements (per Cycle 25 brief). This is the "Кейтеринг без
 * границ" band of signature phrases: Свадбы / Корпоративы / Фуршеты / etc.
 *
 * Pure CSS animation via `.mcu-marquee` (translateX 0 → -50% over 40s linear
 * infinite, see globals.css). The content is duplicated twice (the [0,1] map)
 * so the loop is seamless; the second copy is `aria-hidden` for screen
 * readers. Hover pauses the animation (`.mcu-marquee:hover` rule).
 *
 * No JS animation — this is a Server Component. Respects prefers-reduced-
 * motion: the reduced-motion media query in globals.css disables the
 * animation entirely (`.mcu-marquee { animation: none }`), so the band shows
 * the phrases statically.
 *
 * @see /docs/reference-library/mculinary/MCULINARY-ANALYSIS.md §7 wow #1 #8
 */

const PHRASES: readonly string[] = [
  "Свадьбы",
  "Корпоративы",
  "Фуршеты",
  "Банкеты",
  "Дегустации",
  "Кейтеринг на выезд",
] as const;

export function McuMarqueeBand() {
  return (
    <section
      className="mcu-section-navy overflow-hidden py-6"
      aria-label="Кейтеринг без границ"
    >
      <div className="mcu-marquee">
        {[0, 1].map((dup) => (
          <div
            key={dup}
            className="flex items-center gap-8 pr-8"
            aria-hidden={dup === 1 ? true : undefined}
          >
            {PHRASES.map((phrase, i) => (
              <span key={i} className="flex items-center gap-8">
                <span className="mcu-h3 whitespace-nowrap italic text-white/90">
                  {phrase}
                </span>
                <span
                  className="text-2xl text-[var(--mcu-gold)]"
                  aria-hidden="true"
                >
                  ✦
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export default McuMarqueeBand;
