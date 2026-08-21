import Image from "next/image";

/**
 * EaVenueNetwork — Cycle 28, Task 4-D.
 *
 * Magazine-style partner-network directory — full list of partner venues
 * organized by district / neighborhood, with capacity + inline tag.
 * This is the B2B credibility block — EA's strongest asset per
 * DESIGN-CRITIQUE.md §6.2 ("The partner-venue network page is the
 * second most borrowable asset. EA's 60-venue partner list is a
 * uniquely strong B2B credibility signal.").
 *
 * EA source: `https://elegantaffairscaterers.com/about/our-venues` —
 * 60+ named NYC venues organized by neighborhood (Manhattan Midtown,
 * Meatpacking, LES/Soho, FiDi, UES/UWS, Brooklyn, Upstate NY).
 *
 * Interfood adaptation: 30 RU venues shown across 5 SPb/LenOblast
 * districts (ЦЕНТРАЛЬНЫЙ, ПЕТРОГРАДСКИЙ, ПРИМОРСКИЙ, ВОССТАНИЯ /
 * СМОЛЬНЫЙ, КУРОРТНЫЙ РАЙОН). Eyebrow promises "40+" (curated below —
 * full list is broader). Body copy: "Ниже — избранное. Если вашей
 * площадки нет в списке, мы её изучим и привезём."
 *
 * Layout — magazine two-column:
 *  - LEFT (2fr on lg, full width on mobile, order-2 lg:order-1):
 *    Vertical stack of 5 district groups. Each group has a small
 *    uppercase header (Barlow Semi Condensed Bold, mauve, with red
 *    2px × 32px underline) and below a list of 4-6 venue names
 *    (Montserrat 1rem, ink) with inline capacity tag ("· 220 мест").
 *    Separated by hairline dividers (mauve @ 30% transparent).
 *  - RIGHT (1fr on lg, full width on mobile, order-1 lg:order-2):
 *    Single hero venue card — full-bleed 4:5 portrait of one iconic
 *    partner venue (Усадьба «Коттедж», /media/banket-1.jpg). Below:
 *    "Featured" eyebrow + venue name (Playfair 1.5rem ink) + meta
 *    line (Barlow uppercase 0.75rem mauve "180 гостей · Курортный
 *    район") + 2-line description. Sticky on desktop (position: sticky;
 *    top: 5rem — `lg:sticky lg:top-20`) so the hero stays in view
 *    as the user scrolls through the long left column. On mobile: no
 *    sticky, hero goes first.
 *  - Bottom: ea-text-link "Запросить площадку под ваш запрос →" → #contact.
 *
 * Server Component (no "use client") — no state, no animation, no hooks.
 * The reveal-on-scroll behaviour lives in the sibling EaVenuesSpotlight
 * section; this section reads as a settled editorial spread.
 *
 * Self-contained — uses shared EA utility classes from globals.css
 * (.ea-section, .ea-section--blush, .ea-container, .ea-container--wide,
 * .ea-eyebrow, .ea-section-h2, .ea-body, .ea-text-link,
 * .ea-text-link__arrow) + Tailwind classes + inline styles for the
 * hairline divider, district header, list rows, and hero card chrome.
 *
 * @see docs/EA-ANALYSIS.md §3.9 (HQ/TwoFortyThirty callout) + §3.12 (blog/press blush bg)
 * @see docs/reference-library/elegant-affairs/BRAND-CONTEXT.md §2.5 (60-venue network)
 * @see docs/reference-library/elegant-affairs/DESIGN-CRITIQUE.md §6.2 (B2B credibility asset)
 */

type Venue = {
  /** Venue name (Montserrat 1rem, ink). */
  name: string;
  /** Inline capacity tag — "· 220 мест" (mauve 0.875rem). */
  capacity: string;
};

type District = {
  /** Uppercase neighborhood label (Barlow Semi Condensed Bold, mauve). */
  name: string;
  /** 4-6 partner venues in this district. */
  venues: Venue[];
};

const DISTRICTS: District[] = [
  {
    name: "ЦЕНТРАЛЬНЫЙ",
    venues: [
      { name: "Атриум на Рубинштейна", capacity: "220 мест" },
      { name: "Лофт «Этаж»", capacity: "180 мест" },
      { name: "Палата Восточных Купцов", capacity: "90 мест" },
      { name: "Особняк Бреневой", capacity: "140 мест" },
      { name: "Клуб «Маяк»", capacity: "250 мест" },
      { name: "Лофт «Антресоль»", capacity: "110 мест" },
    ],
  },
  {
    name: "ПЕТРОГРАДСКИЙ",
    venues: [
      { name: "Особняк Кочубея", capacity: "240 мест" },
      { name: "Дом Архитектора", capacity: "180 мест" },
      { name: "Юсуповский дворец", capacity: "320 мест" },
      { name: "Гранд-отель Европа", capacity: "450 мест" },
      { name: "Шаляпин-холл", capacity: "280 мест" },
      { name: "Особняк Лихачёва", capacity: "110 мест" },
    ],
  },
  {
    name: "ПРИМОРСКИЙ",
    venues: [
      { name: "Яхт-клуб «Геракл»", capacity: "350 мест" },
      { name: "Гольф-клуб «Длинное»", capacity: "220 мест" },
      { name: "Парк «Тихий залив»", capacity: "800 мест" },
      { name: "Конгресс-холл «Васильевский»", capacity: "400 мест" },
      { name: "Park Inn Пулковская", capacity: "320 мест" },
      { name: "Лофт «Морская панорама»", capacity: "130 мест" },
    ],
  },
  {
    name: "ВОССТАНИЯ / СМОЛЬНЫЙ",
    venues: [
      { name: "Лофт «Смольный»", capacity: "200 мест" },
      { name: "Отель «Гранд Каньон»", capacity: "220 мест" },
      { name: "Hall «Крепостная»", capacity: "150 мест" },
      { name: "Лофт «Суворовский»", capacity: "160 мест" },
      { name: "Дом «Свердловский»", capacity: "90 мест" },
      { name: "Бизнес-центр «Тверской»", capacity: "110 мест" },
    ],
  },
  {
    name: "КУРОРТНЫЙ РАЙОН",
    venues: [
      { name: "Усадьба «Коттедж»", capacity: "180 мест" },
      { name: "Замок «Принц Ойген»", capacity: "220 мест" },
      { name: "Особняк «Татьяна»", capacity: "90 мест" },
      { name: "Парк «Сосновый берег»", capacity: "500 мест" },
      { name: "Загородный клуб «Сестрорецк»", capacity: "280 мест" },
      { name: "Замок «Лапландия»", capacity: "350 мест" },
    ],
  },
];

export function EaVenueNetwork() {
  return (
    <section
      id="ea-venue-network"
      aria-label="Партнёрская сеть площадок"
      className="ea-section ea-section--blush"
    >
      <div className="ea-container ea-container--wide">
        {/* Header */}
        <div className="mb-14 max-w-3xl">
          <p className="ea-eyebrow mb-3">
            ПАРТНЁРСКАЯ СЕТЬ · 40+ ПЛОЩАДОК
          </p>
          <h2 className="ea-section-h2 mb-6">
            Где угодно. <i>В любое время.</i>
          </h2>
          <p className="ea-body">
            Мы работаем на площадках-партнёрах в Санкт-Петербурге,
            Ленинградской области и Москве. Ниже — избранное. Если вашей
            площадки нет в списке, мы её изучим и привезём.
          </p>
        </div>

        {/* Magazine two-column layout — left list (2fr) + right sticky hero (1fr) */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[2fr_1fr] lg:gap-16">
          {/* LEFT — district lists */}
          <div className="order-2 lg:order-1">
            {DISTRICTS.map((d, i) => (
              <div
                key={d.name}
                className={i > 0 ? "mt-10 pt-10" : ""}
                style={
                  i > 0
                    ? {
                        borderTop:
                          "1px solid color-mix(in oklch, var(--ea-mauve) 30%, transparent)",
                      }
                    : undefined
                }
              >
                {/* District header — Barlow Semi Condensed Bold, mauve, uppercase. */}
                <h3
                  className="mb-1"
                  style={{
                    fontFamily: "var(--ea-font-eyebrow)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--ea-mauve)",
                  }}
                >
                  {d.name}
                </h3>

                {/* Red 2px × 32px underline (EA signature). */}
                <div
                  aria-hidden="true"
                  style={{
                    width: "32px",
                    height: "2px",
                    background: "var(--ea-red)",
                    marginBottom: "1.5rem",
                  }}
                />

                {/* Venue list — Montserrat 1rem, ink + inline capacity tag. */}
                <ul className="space-y-3">
                  {d.venues.map((v) => (
                    <li
                      key={v.name}
                      className="flex flex-wrap items-baseline gap-2"
                      style={{
                        fontFamily: "var(--ea-font-body)",
                        fontSize: "1rem",
                        lineHeight: 1.5,
                        color: "var(--ea-ink)",
                      }}
                    >
                      <span>{v.name}</span>
                      <span
                        aria-hidden="true"
                        style={{
                          color: "var(--ea-mauve)",
                          fontSize: "0.875rem",
                        }}
                      >
                        · {v.capacity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* RIGHT — featured hero venue card. Sticky on desktop (lg:sticky
              lg:top-20 = 5rem). On mobile: order-1 (first), no sticky. */}
          <aside className="order-1 lg:order-2">
            <div
              className="lg:sticky lg:top-20"
              style={{
                boxShadow: "var(--ea-shadow-cream)",
                borderRadius: "4px",
                overflow: "hidden",
                background: "var(--ea-white)",
              }}
            >
              {/* Full-bleed 4:5 portrait of the featured venue. */}
              <div
                className="relative w-full"
                style={{ aspectRatio: "4 / 5" }}
              >
                <Image
                  src="/media/banket-1.jpg"
                  alt="Усадьба «Коттедж» — банкетный зал в загородном комплексе, фуршетная сервировка."
                  fill
                  sizes="(max-width:1024px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>

              {/* Featured venue meta + description panel. */}
              <div className="p-6">
                <p
                  className="mb-2"
                  style={{
                    fontFamily: "var(--ea-font-eyebrow)",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--ea-red)",
                  }}
                >
                  Featured
                </p>
                <h3
                  className="mb-3"
                  style={{
                    fontFamily: "var(--ea-font-display)",
                    fontWeight: 400,
                    fontSize: "1.5rem",
                    lineHeight: 1.15,
                    color: "var(--ea-ink)",
                  }}
                >
                  Усадьба «Коттедж»
                </h3>
                <p
                  className="mb-3"
                  style={{
                    fontFamily: "var(--ea-font-eyebrow)",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--ea-mauve)",
                  }}
                >
                  180 гостей · Курортный район
                </p>
                <p
                  className="ea-body"
                  style={{ opacity: 1 }}
                >
                  Двухэтажный загородный банкетный комплекс с террасой,
                  каминным залом и авторской кухней. Сценарий для свадеб,
                  юбилеев и корпоративных выездов под ключ.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom — single ea-text-link → #contact. */}
        <div className="mt-16 flex justify-center">
          <a href="#contact" className="ea-text-link">
            Запросить площадку под ваш запрос
            <svg
              className="ea-text-link__arrow"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M4 12h14M14 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

export default EaVenueNetwork;
