"use client";

import { useId, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { ComponentProps, KeyboardEvent } from "react";

/**
 * EaFaqAccordion — Elegant Affairs minimalist single-column FAQ accordion.
 * (Cycle 28 — Task 4-G.)
 *
 * REPLACES the existing `faq.tsx` (476 lines: category tabs + search-as-you-
 * type + thumbs feedback widget — maximalist) with EA's restraint pattern:
 * one narrow column, six hairline-divided items, an editorial H2 with the
 * italic-as-fragment trailing phrase ("Что важно *знать*."), a red +/− glyph
 * that rotates 45° to × on open, and a single text + arrow CTA at the bottom.
 * NO tabs. NO search. NO feedback widgets. Restraint > decoration.
 *
 * DESIGN-LANGUAGE SOURCES (docs/EA-ANALYSIS.md):
 *   - §3.12 Blog + Press layout (single narrow column, hairline dividers).
 *   - §5.1   text + arrow link button (no fill, no border).
 *   - §5.3   FAQ-style content patterns (single-column accordion, large
 *            serif question, restrained sans answer).
 *   - §5.4   2 px solid horizontal divider rule (here: 1 px hairline mauve).
 *   - §5.5   eyebrow — small uppercase label above a headline.
 *   - §5.6   large serif H2 with optional italic fragment.
 *   - §4.5   italic-as-fragment typographic device (trailing phrase in red).
 *   - §4.6   text + animated arrow buttons (CTA at bottom).
 *   - §4.7   section reveal on scroll (fadeInUp — replicated via Motion
 *            whileInView, stagger 0.05s per item).
 *
 * ACCESSIBILITY:
 *   - Each item's row is `role="button"` + `tabIndex={0}` (click + Enter/Space).
 *   - `aria-expanded`, `aria-controls`, `id`-pairing between trigger + panel.
 *   - Panel `role="region"` + `aria-labelledby`.
 *   - +/− SVG is `aria-hidden` (decorative — the open state is already
 *     announced via aria-expanded).
 *   - Honors `prefers-reduced-motion` (AnimatePresence collapses instantly,
 *     +/− rotation becomes a 2-frame swap, scroll-reveal returns empty props).
 *
 * CONTENT: 6 realistic RU catering questions per the Cycle 28 brief.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

type FaqItem = { q: string; a: string };

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Какой минимальный заказ?",
    a: "Банкеты — от 30 гостей, фуршеты — от 20, кофе-брейки — от 15, барбекю — от 20, обеды в офис — от 10. Для меньших форматов есть доставка закусок в индивидуальной упаковке.",
  },
  {
    q: "За сколько дней нужно бронировать?",
    a: "Свадьбы и банкеты — за 14–30 дней. Корпоративные обеды — за 3 рабочих дня. Аварийные заказы (24 часа) — возможны с наценкой 25%.",
  },
  {
    q: "Что входит в стоимость?",
    a: "Еда, доставка, сервировка, посуда, текстиль, повар и официанты на месте. Не входит: аренда площадки, алкоголь, музыка, флористика — поможем организовать по запросу.",
  },
  {
    q: "Можете учесть аллергии и диеты?",
    a: "Да. Вегетарианское, веганское, безглютеновое, халяль, кошер — без доплат. Специфические аллергии просим сообщить за 7 дней.",
  },
  {
    q: "Как происходит оплата?",
    a: "Предоплата 30% при подтверждении заказа, окончательный расчёт — не позднее 3 дней до мероприятия (условия публичной оферты). Работаем с юр. лицами по безналичному расчёту.",
  },
  {
    q: "Есть ли дегустация перед заказом?",
    a: "Да. Запишитесь на приватную дегустацию в нашей студии на Петроградке. Шесть блюд из вашего будущего меню за 45 минут — 3500 ₽/чел. Сумма возвращается при заказе от 50 гостей.",
  },
];

type MotionDivProps = ComponentProps<typeof motion.div>;
type MotionH2Props = ComponentProps<typeof motion.h2>;
type MotionPProps = ComponentProps<typeof motion.p>;
type MotionSvgProps = ComponentProps<typeof motion.svg>;

/**
 * Plus glyph — two crossed lines (vertical + horizontal) rendered as SVG
 * strokes. Rotates 45° → × when `isOpen`. Motion animates the rotation;
 * stroke stays red at all times (EA signature accent).
 */
function PlusGlyph({
  isOpen,
  reduce,
}: {
  isOpen: boolean;
  reduce: boolean | null;
}) {
  return (
    <motion.svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
      animate={{ rotate: isOpen ? 45 : 0 }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 0.32, ease: EASE }
      }
      style={{
        flex: "0 0 auto",
        color: "var(--ea-red)",
        minWidth: "20px",
        minHeight: "20px",
      }}
    >
      <line
        x1="7"
        y1="1"
        x2="7"
        y2="13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="1"
        y1="7"
        x2="13"
        y2="7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

export function EaFaqAccordion() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);
  const reactId = useId();

  const toggle = (i: number) => setOpen((cur) => (cur === i ? null : i));

  const onKey = (i: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      toggle(i);
    }
  };

  // Shared Motion reveal preset — fade-up 18px → 0 over 550ms. Empty when
  // reduced-motion is requested (the element renders statically + visible).
  const reveal = (
    delay: number,
  ): Partial<MotionDivProps & MotionH2Props & MotionPProps> =>
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
      id="faq"
      data-component="ea-faq-accordion"
      data-header-theme="light"
      aria-label="Частые вопросы"
      className="ea-section ea-section--cream relative"
    >
      <div className="ea-container ea-container--narrow">
        {/* Eyebrow — mauve (overrides the default ea-eyebrow red since the
            section is the calm FAQ block, not the brand-red CTA moment). */}
        <motion.p
          className="ea-eyebrow text-center"
          style={{ color: "var(--ea-mauve)" }}
          {...reveal(0)}
        >
          Вопросы · Ответы
        </motion.p>

        {/* H2 with italic-as-fragment trailing phrase ("знать" in red). */}
        <motion.h2
          id={`${reactId}-headline`}
          className="ea-section-h2 mt-5 text-center"
          style={{ fontSize: "clamp(2.5rem, 5.5vw, 4rem)" }}
          {...reveal(0.05)}
        >
          Что важно <i className="ea-italic-fragment">знать</i>.
        </motion.h2>

        {/* Body line + ea-text-link → #contact. */}
        <motion.p
          className="mt-6 text-center"
          style={{
            fontFamily: "var(--ea-font-body)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
            color: "color-mix(in oklch, var(--ea-ink) 70%, transparent)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.6em",
          }}
          {...reveal(0.1)}
        >
          <span>
            Не нашли свой вопрос? Напишите нам — ответим в течение рабочего дня.
          </span>
          <a href="#contact" className="ea-text-link" style={{ fontSize: "0.85rem" }}>
            Задать вопрос
            <svg
              className="ea-text-link__arrow"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </motion.p>

        {/* Accordion list — hairline-divided, single column. */}
        <div className="mt-12" style={{ marginTop: "clamp(2rem, 4vw, 3rem)" }}>
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            const panelId = `${reactId}-panel-${i}`;
            const triggerId = `${reactId}-trigger-${i}`;
            const isLast = i === FAQ_ITEMS.length - 1;
            const triggerReveal: Partial<MotionDivProps> = reduce
              ? {}
              : {
                  initial: { opacity: 0, y: 18 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: "-40px" },
                  transition: {
                    duration: 0.55,
                    delay: 0.05 * i,
                    ease: EASE,
                  },
                };
            return (
              <motion.div
                key={item.q}
                className="ea-faq-accordion__item"
                style={{
                  borderTop:
                    "1px solid color-mix(in oklch, var(--ea-mauve) 25%, transparent)",
                  ...(isLast
                    ? {
                        borderBottom:
                          "1px solid color-mix(in oklch, var(--ea-mauve) 25%, transparent)",
                      }
                    : null),
                }}
                {...triggerReveal}
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
                  className="relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full focus-visible:after:w-full"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1.5rem",
                    padding: "1.5rem 0",
                    cursor: "pointer",
                    fontFamily: "var(--ea-font-eyebrow)",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    lineHeight: 1.4,
                    color: "var(--ea-ink)",
                    background: "transparent",
                    width: "100%",
                    textAlign: "left",
                    outline: "none",
                  }}
                >
                  <span style={{ flex: "1 1 auto" }}>{item.q}</span>
                  <PlusGlyph isOpen={isOpen} reduce={reduce} />
                </div>

                {/* Animated panel — height auto via Motion AnimatePresence. */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="panel"
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      initial={
                        reduce ? false : { height: 0, opacity: 0 }
                      }
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { duration: 0.34, ease: EASE }
                      }
                      style={{ overflow: "hidden" }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--ea-font-body)",
                          fontSize: "0.95rem",
                          lineHeight: 1.7,
                          color: "color-mix(in oklch, var(--ea-ink) 82%, transparent)",
                          paddingBottom: "1.5rem",
                          paddingRight: "2.5rem",
                          margin: 0,
                        }}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default EaFaqAccordion;
