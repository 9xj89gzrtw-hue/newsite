/**
 * McuMarqueeBand — Salt Block signature repeating brand-phrase marquee.
 *
 * Restyled for Cycle 26 (Salt Block editorial layer, WOW #3): the band sits
 * as the SECOND section right after the hero. Single line of large Barlow
 * Semi Condensed Bold cream text on deep ink-black (var(--espresso)),
 * scrolling horizontally via pure CSS translateX(0 → -50%) over 32s linear
 * infinite. The phrase set is repeated **7×** inline to evoke Salt Block's
 * rhetorical insistence pattern (see DESIGN-CRITIQUE.md §4 #1).
 *
 * Layout
 *   <section.sb-marquee-repeating>           (overflow hidden, flex center)
 *     <div.sb-marquee-track>                 (animates translateX 0→-50%)
 *       <div flex> [first half, 7×PHRASES]  </div>
 *       <div flex> [duplicate half, 7×PHRASES, aria-hidden] </div>
 *
 * The duplicate half is what makes the loop seamless: when the track has
 * scrolled -50% of its own width, the second half is exactly where the
 * first was at 0%, so the visual repeats without a visible jump. Both
 * halves contain the same 7×PHRASES = 42 phrase instances, totalling 84
 * rendered phrases (Salt Block's "show the phrase 7×" insistence taken
 * literally and doubled for the seamless loop).
 *
 * Pure CSS animation → Server Component (no `'use client'`). Respects
 * prefers-reduced-motion: globals.css disables the animation entirely so
 * the band shows the phrases statically.
 *
 * @see /docs/SALTBLOCK-ANALYSIS.md §10 (WOW #3) + §11 (marquee insistence)
 * @see /docs/reference-library/saltblock/DESIGN-CRITIQUE.md §4 #1
 */

const PHRASES = [
  "ШЕФ-ДРАЙВЕН КЕЙТЕРИНГ",
  "АВТОРСКАЯ КУХНЯ",
  "ФЕРМЕРСКИЕ ПРОДУКТЫ",
  "СВАДЬБЫ И БАНКЕТЫ",
  "С 2009 ГОДА",
  "САНКТ-ПЕТЕРБУРГ",
] as const;

// Salt Block rhetorical insistence: repeat the phrase set 7× inline so the
// brand-positioning message is drummed in visually as the band scrolls past.
const REPEAT = 7;

type PhraseInstance = { phrase: string; key: string };

/** Build the 7×PHRASES set used in each half of the track. */
function buildPhraseSet(prefix: string): PhraseInstance[] {
  return Array.from({ length: REPEAT * PHRASES.length }).map((_, i) => ({
    phrase: PHRASES[i % PHRASES.length],
    key: `${prefix}-${i}`,
  }));
}

export function McuMarqueeBand() {
  const firstHalf = buildPhraseSet("a");
  const duplicateHalf = buildPhraseSet("b");

  return (
    <section
      aria-label="Позиционирование бренда"
      className="sb-marquee-repeating"
    >
      <div className="sb-marquee-track">
        {/* First half — visible during translateX(0 → -50%) */}
        <div className="flex items-center">
          {firstHalf.map(({ phrase, key }) => (
            <span key={key} className="sb-marquee-phrase">
              <span>{phrase}</span>
              <span className="sb-marquee-sep" aria-hidden="true">
                ✦
              </span>
            </span>
          ))}
        </div>
        {/* Duplicate half — clones the first half so the -50% position lines
            up seamlessly with the 0% position. Hidden from screen readers to
            avoid reading the phrases twice. */}
        <div className="flex items-center" aria-hidden={true}>
          {duplicateHalf.map(({ phrase, key }) => (
            <span key={key} className="sb-marquee-phrase">
              <span>{phrase}</span>
              <span className="sb-marquee-sep" aria-hidden="true">
                ✦
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default McuMarqueeBand;
