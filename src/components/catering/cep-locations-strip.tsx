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
        {/* Wordmark substitute — small eyebrow line in brand voice */}
        <p className="cep-eyebrow mb-8 tracking-[0.35em] text-black">
          INTERFOOD CATERING
        </p>

        {/* City strip — 32.8px Neutra2Display-Light, uppercase, tight-tracked,
            pipe-separated like CEP's "NEW YORK | MIAMI | PALM BEACH | WORLDWIDE" */}
        <h2
          className="cep-display text-black"
          style={{
            fontSize: "clamp(1.5rem, 2.4vw, 2.1rem)",
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
          }}
        >
          САНКТ-ПЕТЕРБУРГ&nbsp;|&nbsp;МОСКВА&nbsp;|&nbsp;ВСЯ&nbsp;РОССИЯ
        </h2>
      </div>
    </section>
  );
}

export default CepLocationsStrip;
