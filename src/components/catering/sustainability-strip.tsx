"use client";

import { Reveal } from "@/components/catering/reveal";

/**
 * SustainabilityStrip — a quiet 3-statement editorial strip in Salt Block
 * brand-voice restraint (Cycle 26, audit recommendation #3).
 *
 * Replaces the noisy value-props marquee in About with three numbered
 * editorial cells divided by thin vertical `.sb-section-rule` rules — same
 * typographic discipline as Salt Block's "The SaltBlock Difference" section
 * (SALTBLOCK-ANALYSIS.md §6.5 + DESIGN-CRITIQUE.md §4 premium-feel choice #5:
 * the dual-pillar / 3-card editorial grid with restrained brand-voice copy).
 *
 * Layout spec:
 *   - Section padding `clamp(4rem, 7vw, 6rem) 2rem`, bg `var(--cream)`.
 *   - Content frame: max-w-[1070px] mx-auto (matches joels content frame so
 *     PageBorders align, per cycle-26 audit's "ONE content frame" fix).
 *   - 3-column grid (md:grid-cols-3) with thin vertical `.sb-section-rule`
 *     dividers between cells (hidden on mobile single-column).
 *   - Each cell: numbered eyebrow (Barlow Semi Condensed 14/700/0.2em bordeaux)
 *     → 2-word uppercase Playfair title (clamp 1.5–2rem / 600 / ink) → 2–3
 *     sentence Karla 16px body at opacity 0.75 / lh 1.65.
 *   - Below the cells: thin horizontal `.sb-section-rule` divider + a single
 *     italic Playfair Display 18px line at opacity 0.7.
 *
 * Motion: each cell fades up via the shared `Reveal` primitive with 0.15s
 * stagger. `Reveal` internally respects `prefers-reduced-motion` (returns a
 * static div, no transform) — so this component is reduced-motion-safe by
 * construction. No additional motion imports needed.
 */

type Statement = {
  num: string;
  title: string;
  body: string;
};

const STATEMENTS: Statement[] = [
  {
    num: "01",
    title: "ЛОКАЛЬНЫЕ ФЕРМЕРЫ",
    body:
      "Мы работаем с фермерами Ленинградской области: молочная ферма в Приозерске, тепличное хозяйство во Всеволожске, частная пекарня в Парголово. Каждый поставщик — это имя и адрес, а не штрихкод на коробке.",
  },
  {
    num: "02",
    title: "СЕЗОННЫЕ ПРОДУКТЫ",
    body:
      "Меню меняется каждые шесть недель. Когда в Ленобласти поспевает клубника — у нас клубничный тарт. Когда приходит белая рыба из Финского залива — у нас сибас на углях. Гость ест то, что сейчас на пике.",
  },
  {
    num: "03",
    title: "БЕЗ ПОЛУФАБРИКАТОВ",
    body:
      "Никаких замороженных заготовок. Хлеб печём сами. Соусы варим утром в день мероприятия. Бульоны томим 12 часов. Это дороже. Это медленнее. Это правильно.",
  },
];

const CLOSING_LINE =
  "Это не маркетинг. Это наша операционная философия.";

export function SustainabilityStrip() {
  return (
    <section
      id="sustainability"
      aria-label="Принципы работы — локальные фермеры, сезонные продукты, без полуфабрикатов"
      data-header-theme="light"
      className="section-light bg-cream"
      style={{ padding: "clamp(4rem, 7vw, 6rem) 2rem" }}
    >
      <div className="mx-auto max-w-[1070px]">
        {/* 3-cell editorial grid with thin vertical sb-section-rule dividers. */}
        <div className="grid grid-cols-1 gap-y-10 md:grid-cols-3 md:gap-x-0">
          {STATEMENTS.map((s, i) => (
            <Reveal
              key={s.num}
              delay={i * 0.15}
              className={
                "relative px-0 md:px-8 " +
                (i === 0 ? "md:pl-0" : "") +
                (i === STATEMENTS.length - 1 ? " md:pr-0" : "")
              }
            >
              {/*
                Vertical .sb-section-rule between cells — absolutely positioned
                at the left edge of cells 2 and 3 on md+ only. Hidden on mobile
                (single-column) where the horizontal rhythm comes from gap-y.
              */}
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="sb-section-rule absolute left-0 top-0 hidden h-full w-px md:block"
                />
              )}

              {/* Numbered eyebrow — Barlow Semi Condensed 14/700/0.2em bordeaux. */}
              <span
                className="font-barlow block font-bold uppercase text-bordeaux"
                style={{
                  fontSize: "14px",
                  letterSpacing: "0.2em",
                  lineHeight: 1,
                }}
              >
                {s.num}
              </span>

              {/* Title — 2-word uppercase Playfair Display, clamp 1.5–2rem, 600, ink. */}
              <h3
                className="mt-5 font-display text-ink"
                style={{
                  fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                  fontWeight: 600,
                  lineHeight: 1.15,
                }}
              >
                {s.title}
              </h3>

              {/* Body — Karla 16px / lh 1.65 / opacity 0.75. */}
              <p
                className="mt-4 text-ink/75"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "16px",
                  lineHeight: 1.65,
                }}
              >
                {s.body}
              </p>
            </Reveal>
          ))}
        </div>

        {/* Closing: thin horizontal .sb-section-rule + italic Playfair line. */}
        <Reveal delay={0.45}>
          <div className="mt-14">
            <hr className="sb-section-rule h-px w-full" />
            <p
              className="mx-auto mt-8 max-w-[1070px] text-center text-ink/70"
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "18px",
                lineHeight: 1.5,
              }}
            >
              {CLOSING_LINE}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
