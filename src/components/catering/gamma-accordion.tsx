"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import type { KeyboardEvent, ComponentProps } from "react";

/**
 * GammaAccordion — Cycle 31 NEW (Task 2-c).
 *
 * gammacatering.com signature vertical accordion — "blocks that fold
 * vertically". Each row: handwritten Marck Script accent label (red, rotated
 * -3°) + big Playfair Display title + Plus chevron that rotates 45° → × when
 * open. Click the row and a panel expands BELOW the header using the
 * `grid-template-rows: 0fr → 1fr` CSS trick — the most reliable way to
 * animate a variable-height panel without JS height measurement and without
 * an AnimatePresence height transition.
 *
 * BEHAVIOUR: classic accordion — only ONE item open at a time (clicking
 * another closes the first). First item is open by default on mount. Click
 * the open item's header again to close it.
 *
 * CONTENT: 4 RU items describing Interfood's full-service cycle:
 *   1. Замысел  (label "замысел") — Concept
 *   2. Дизайн   (label "деталь")  — Design
 *   3. Исполнение (label "в деле") — Implementation
 *   4. Сервис   (label "забота")  — Service
 *
 * DESIGN-LANGUAGE SOURCES:
 *   - docs/advanced-technical/site_21_gamma.html lines 308-365 — accordion HTML
 *   - .tott-script-ru (Marck Script Cyrillic analog) for handwritten labels
 *   - .ea-italic-fragment (EA signature italic-as-fragment device) for the
 *     "от замысла до сервиса" trailing italic phrase in the section header
 *   - .ea-outline-btn — EA outline CTA button (red 1px border, hover fill)
 *   - --ea-red #E71D3A — accent for label/chevron/eyebrow/italic fragment
 *   - --font-serif (Playfair Display) for titles + headline
 *
 * ACCESSIBILITY:
 *   - Each header is `role="button"` + `tabIndex={0}` (click + Enter/Space).
 *   - `aria-expanded`, `aria-controls`, `id`-pairing between trigger + panel.
 *   - Panel `role="region"` + `aria-labelledby`.
 *   - Closed panel has React 19 `inert` attribute (skips focus + screen
 *     readers) so its links aren't tab-reachable when collapsed.
 *   - Plus chevron is `aria-hidden` (decorative — open state is already
 *     announced via aria-expanded).
 *   - Honors `prefers-reduced-motion` — CSS turns off grid-rows transition
 *     + chevron rotation; framer-motion reveal returns empty props so items
 *     render statically + visible.
 *
 * POSITION: sits in page.tsx AFTER EaServiceTabs (premium tabbed services) as
 * a "how we work — full cycle" depth beat, BEFORE EaEventsPortfolio
 * (horizontal scroll gallery). Sits on cream background (bg-cream).
 */

const EASE = [0.22, 1, 0.36, 1] as const;

type GammaItem = {
  /** Handwritten accent label (Marck Script, lowercase short Russian word). */
  label: string;
  /** Big editorial title (Playfair Display). */
  title: string;
  /** Body copy revealed when the panel is open. */
  body: string;
  /** CTA button label. */
  cta: string;
  /** CTA href. */
  href: string;
};

const ITEMS: GammaItem[] = [
  {
    label: "замысел",
    title: "Замысел",
    body: "Мы делаем гораздо больше, чем просто еду и напитки. С взглядом на целое, Interfood разрабатывает концепции мероприятий, объединяющие кулинарное видение, пространственный дизайн и драматургию. На этапе концепции мы определяем кулинарную идею, формат обслуживания, порядок проведения, опыт гостей и бюджет.",
    cta: "Подробнее",
    href: "#contact",
  },
  {
    label: "деталь",
    title: "Дизайн",
    body: "Мы разрабатываем визуальные дизайн-концепции для мероприятий, пространств и сценографии. Это охватывает не только сервировку стола, флористику и декор, но и пространственные концепции, выбор материалов, обстановку, освещение и интерьер. Эти услуги можно заказать как часть кейтерингового проекта или отдельно.",
    cta: "Подробнее",
    href: "#contact",
  },
  {
    label: "в деле",
    title: "Исполнение",
    body: "Безупречное мероприятие требует точности и опыта. Именно за это стоит Interfood. Мы берём на себя операционную подготовку, а также проведение мероприятия на месте — включая кухню, сервис, координацию партнёров, монтаж и демонтаж. Наша цель — чтобы клиенты наслаждались своим мероприятием без забот, зная, что за кулисами всё работает идеально.",
    cta: "Подробнее",
    href: "#contact",
  },
  {
    label: "забота",
    title: "Сервис",
    body: "Персональный менеджер сопровождает вас на каждом этапе — от первой встречи до последнего гостя. Мы координируем тайминг, логистику, партнёров и неожиданные ситуации. Вы получаете одного ответственного человека, который знает все детали вашего события.",
    cta: "Обсудить",
    href: "#contact",
  },
];

type MotionDivProps = ComponentProps<typeof motion.div>;
type MotionPProps = ComponentProps<typeof motion.p>;
type MotionH2Props = ComponentProps<typeof motion.h2>;

export function GammaAccordion() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number>(0); // first item open by default
  const reactId = useId();

  // Click toggles: open another closes the first; clicking the open one
  // closes it (so `open === -1` means all closed).
  const toggle = (i: number) => setOpen((cur) => (cur === i ? -1 : i));

  const onKey = (i: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      toggle(i);
    }
  };

  // Reveal preset — fade-up 18px → 0 over 550ms with `delay * i` stagger.
  // Empty (static render) when prefers-reduced-motion is requested.
  const reveal = (
    delay: number,
  ): Partial<MotionDivProps & MotionPProps & MotionH2Props> =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.55, delay, ease: EASE },
        };

  return (
    <section
      id="how-we-work"
      data-component="gamma-accordion"
      data-header-theme="light"
      aria-label="Как мы работаем — полный цикл"
      className="bg-cream py-24 md:py-32 px-6"
    >
      <div className="mx-auto w-full max-w-[900px]">
        {/* ── Section header ────────────────────────────────────────────────
            Eyebrow "ЧТО МЫ ДЕЛАЕМ" (uppercase tracked red) + big Playfair
            headline "Полный цикл — от замысла до сервиса." with the italic-
            as-fragment device (red italic words "замысла" + "сервиса"). */}
        <motion.p
          className="font-bold uppercase tracking-[0.22em]"
          style={{
            fontFamily: "var(--font-barlow), var(--font-sans), sans-serif",
            fontSize: "clamp(0.75rem, 1vw, 0.85rem)",
            color: "var(--ea-red)",
          }}
          {...reveal(0)}
        >
          Что мы делаем
        </motion.p>

        <motion.h2
          className="mt-4"
          style={{
            fontFamily:
              "var(--font-serif), 'Playfair Display', Georgia, serif",
            fontWeight: 400,
            fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.018em",
            color: "var(--ink)",
          }}
          {...reveal(0.1)}
        >
          Полный цикл — от{" "}
          <i
            style={{
              fontStyle: "italic",
              fontWeight: 400,
              color: "var(--ea-red)",
            }}
          >
            замысла
          </i>{" "}
          до{" "}
          <i
            style={{
              fontStyle: "italic",
              fontWeight: 400,
              color: "var(--ea-red)",
            }}
          >
            сервиса
          </i>
          .
        </motion.h2>

        {/* ── Accordion ──────────────────────────────────────────────────── */}
        <div className="gamma-accordion mt-12 md:mt-16">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            const panelId = `${reactId}-panel-${i}`;
            const triggerId = `${reactId}-trigger-${i}`;

            return (
              <motion.div
                key={item.title}
                className={`gamma-accordion__item ${isOpen ? "is-open" : ""}`}
                {...reveal(0.15 + 0.05 * i)}
              >
                {/* Click target — full row (button role + keyboard). */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  id={triggerId}
                  onClick={() => toggle(i)}
                  onKeyDown={onKey(i)}
                  className="gamma-accordion__header"
                >
                  <span className="gamma-accordion__label">{item.label}</span>
                  <h3 className="gamma-accordion__title">{item.title}</h3>
                  <span
                    className="gamma-accordion__chevron"
                    aria-hidden="true"
                  >
                    <Plus size={28} strokeWidth={1.4} />
                  </span>
                </div>

                {/* Animated panel — height auto via CSS grid-rows 0fr→1fr
                    (transition is on the .gamma-accordion__panel class).
                    Closed panels get React 19 `inert` so their CTA link
                    isn't tab-reachable while collapsed. */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  className="gamma-accordion__panel"
                  inert={!isOpen}
                >
                  <div className="gamma-accordion__panel-inner">
                    <div className="gamma-accordion__body">
                      {/* Empty column under the handwritten label so the body
                          text aligns visually with the title column. */}
                      <div
                        className="gamma-accordion__body-spacer"
                        aria-hidden="true"
                      />
                      <div className="gamma-accordion__body-inner">
                        <p className="gamma-accordion__text">{item.body}</p>
                        <a href={item.href} className="ea-outline-btn">
                          {item.cta}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default GammaAccordion;
