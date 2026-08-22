import Image from "next/image";

/**
 * CepLocationsStrip — Creative Edge Parties §6.11 locations strip replica.
 *
 * Full-bleed dim photo + wordmark + city strip. In CEP's source this sits
 * just before the Instagram grid: a tall full-bleed photo of an event space
 * with the beige CEP wordmark logo and the city strip "NEW YORK | MIAMI |
 * PALM BEACH | WORLDWIDE" (32.8px Neutra2Display-Light, uppercase, black).
 *
 * Our adaptation:
 *  - Russian copy: "САНКТ-ПЕТЕРБУРГ | МОСКВА | ВСЯ РОССИЯ" matching our
 *    actual operating geography.
 *  - Wordmark image replaced by the text eyebrow "INTERFOOD CATERING"
 *    (per task spec — we are not cloning the CEP egg logo, we substitute our
 *    own brand line).
 *  - `data-header-theme="light"` so the sticky header switches to its dark
 *    text variant over this bright image area.
 *
 * Server Component — no hooks. The Ken-Burns zoom on the bg image is pure
 * CSS via `.cep-bg-zoom` and respects `prefers-reduced-motion` via the
 * global override in globals.css.
 *
 * @see creativeedge-analysis.md §6.11 (Locations strip)
 */
export function CepLocationsStrip() {
  return (
    <section
      aria-label="География работы"
      data-header-theme="light"
      className="relative h-[60vh] w-full overflow-hidden md:h-[75vh]"
    >
      {/* Full-bleed background photo with subtle Ken-Burns zoom */}
      <Image
        src="/media/cep/cep-locations-bg.jpg"
        alt="Сцена банкета Interfood Catering — тёплый свет, сервировка"
        fill
        priority
        sizes="100vw"
        className="cep-bg-zoom object-cover"
      />

      {/* Dim overlay for readability (text sits on the photo) */}
      <div
        className="absolute inset-0 bg-black/35"
        aria-hidden="true"
      />

      {/* Foreground content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
        {/* Wordmark — Cycle 31.1: BIGGER and two-color split per user
            request: "горизонтальную надпись interfoodcatering сделай большего
            размера и раздели два слова разными цветами". "INTERFOOD" in
            cream/white (the brand primary), "CATERING" in gold (the accent
            already used on the hero wordmark dot). Rendered as a single
            large Prata display wordmark — same font family as the hero
            "Interfood." — so the brand reads consistently across screens.
            Was a small 12px eyebrow; now a clamp(2.5rem, 6vw, 4.5rem)
            display wordmark that anchors the locations strip visually. */}
        <h2
          className="tott-display"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            lineHeight: 1,
            letterSpacing: "0.01em",
            fontWeight: 400,
            margin: 0,
            color: "rgba(255,255,255,0.96)",
            textShadow: "0 2px 24px rgba(0,0,0,0.35)",
          }}
        >
          INTERFOOD{" "}
          <span style={{ color: "var(--gold)" }}>CATERING</span>
        </h2>

        {/* City strip — 32.8px Neutra2Display-Light, uppercase, tight-tracked,
            pipe-separated like CEP's "NEW YORK | MIAMI | PALM BEACH | WORLDWIDE".
            Sits below the wordmark with a top margin. */}
        <p
          className="cep-display mt-8 text-white/90"
          style={{
            fontSize: "clamp(1.5rem, 2.4vw, 2.1rem)",
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
            textShadow: "0 1px 12px rgba(0,0,0,0.4)",
          }}
        >
          САНКТ-ПЕТЕРБУРГ&nbsp;|&nbsp;МОСКВА&nbsp;|&nbsp;ВСЯ&nbsp;РОССИЯ
        </p>
      </div>
    </section>
  );
}

export default CepLocationsStrip;
