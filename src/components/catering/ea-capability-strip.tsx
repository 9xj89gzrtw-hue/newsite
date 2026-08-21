"use client";

/**
 * EaCapabilityStrip — Cycle 28, Task 4-C.
 *
 * Elegant Affairs graft: "capability-as-brand-proof" (DESIGN-CRITIQUE
 * recommendation #8 — list unusual capabilities as a navigation item,
 * signalling "we can do anything beyond standard catering"). EA's
 * "Disaster Relief" nav item is the canonical example.
 *
 * Interfood equivalent: 5 unusual capabilities — Аварийный кейтеринг 24/7
 * (emergency response catering), Полевая кухня (field kitchen),
 * Шатёр-монтаж (tent installation), Видео-трансляция (livestream),
 * Сцена и свет (stage + light). Each card pairs an extreme capability
 * with one line of practical proof.
 *
 * Design language:
 *  - Section bg --ea-black (#000). Vertical padding clamp(5rem, 8vw, 7rem)
 *    (slightly tighter than .ea-section default to keep the strip dense).
 *  - .ea-container--wide (1440px).
 *  - Eyebrow "ВОЗМОЖНОСТИ · ЗА ПРЕДЕЛАМИ КЕЙТЕРИНГА" in cream
 *    (--ea-capability-strip__eyebrow override, since .ea-eyebrow is red).
 *  - H2 "Мы умеем <i>больше</i>." cream Playfair, italic fragment in red
 *    via .ea-italic-fragment.
 *  - 5 capability cards, no bg / no border, centred text. Top: red 2px ×
 *    24px vertical bar. Title (Barlow Semi Condensed Bold, 1.25rem, cream,
 *    uppercase). Description (Montserrat 0.875rem, cream @ 70%).
 *  - Vertical hairline cream divider between cards (hidden on mobile,
 *    where cards stack into a column with gap).
 *  - Bottom: small line + ea-text-link "Обсудить задачу →" → #contact.
 *
 * Self-contained — uses shared EA utility classes from globals.css
 * (.ea-section, .ea-section--black, .ea-container--wide, .ea-eyebrow,
 * .ea-section-h2, .ea-italic-fragment, .ea-text-link, .ea-text-link__arrow)
 * + Tailwind classes + inline styles for component-specific typography.
 * The cream-on-black overrides for the eyebrow, H2 and text-link live in
 * the sibling scoped CSS file `./ea-capability-strip.css` (imported once).
 */

import "./ea-capability-strip.css";

import { Fragment } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type Capability = {
  /** Title (Barlow Semi Condensed Bold, 1.25rem, cream, uppercase). */
  title: string;
  /** One-line practical description. */
  desc: string;
};

const CAPABILITIES: Capability[] = [
  {
    title: "Аварийный кейтеринг 24/7",
    desc: "Подмена основного подрядчика за 6 часов — без снижения меню.",
  },
  {
    title: "Полевая кухня",
    desc: "Горячие обеды на объекте без инфраструктуры — генератор, вода, вывоз.",
  },
  {
    title: "Шатёр-монтаж",
    desc: "Шатры 6×12 м под ключ, монтаж за 4 часа, тёплый пол в межсезонье.",
  },
  {
    title: "Видео-трансляция",
    desc: "Прямой эфир на 5 платформ одновременно — свадьбы, конференции, гала.",
  },
  {
    title: "Сцена и свет",
    desc: "Сцена 8×6 м, свет, звук, ppt-управление — один подрядчик на всё.",
  },
];

export function EaCapabilityStrip() {
  const reduceMotion = useReducedMotion();

  const cardVariants: Variants = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reduceMotion
        ? { duration: 0 }
        : {
            duration: 0.6,
            delay: i * 0.08,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          },
    }),
  };

  return (
    <section
      className="ea-section ea-section--black"
      aria-label="Возможности за пределами кейтеринга"
      style={{ paddingBlock: "clamp(5rem, 8vw, 7rem)" }}
    >
      <div className="ea-container ea-container--wide">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-5 text-center md:mb-14">
          <span className="ea-eyebrow ea-capability-strip__eyebrow">
            Возможности · За пределами кейтеринга
          </span>
          <h2 className="ea-section-h2 ea-capability-strip__h2">
            Мы умеем <i className="ea-italic-fragment">больше</i>.
          </h2>
        </div>

        {/* 5-card horizontal row */}
        <motion.div
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="flex flex-col gap-10 md:flex-row md:items-stretch md:gap-0"
        >
          {CAPABILITIES.map((c, i) => (
            <Fragment key={c.title}>
              {i > 0 && (
                <span
                  aria-hidden
                  className="hidden md:block self-stretch"
                  style={{
                    width: "1px",
                    background:
                      "color-mix(in oklch, var(--ea-cream) 10%, transparent)",
                  }}
                />
              )}
              <motion.div
                variants={cardVariants}
                custom={i}
                className={`flex flex-1 flex-col items-center px-4 text-center md:px-6 ea-capability-strip__card${i % 2 === 1 ? " ea-capability-strip__card--alt" : ""}`}
              >
                {/* Top: red 2px × 24px vertical bar — appears on hover/focus
                    only, to preserve EA restraint principle (one accent
                    moment per block, not 5 red bars across a row). */}
                <span
                  aria-hidden
                  className="ea-capability-strip__bar"
                  style={{
                    display: "block",
                    width: "2px",
                    height: "24px",
                    background: "var(--ea-red)",
                    transition: "opacity 280ms ease, transform 320ms ease",
                    opacity: 0.4,
                  }}
                />
                {/* Title */}
                <div
                  style={{
                    fontFamily: "var(--ea-font-eyebrow)",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    letterSpacing: "0.04em",
                    lineHeight: 1.2,
                    color: "var(--ea-cream)",
                    textTransform: "uppercase",
                    marginTop: "1.25rem",
                    maxWidth: "16ch",
                  }}
                >
                  {c.title}
                </div>
                {/* Description */}
                <p
                  style={{
                    fontFamily: "var(--ea-font-body)",
                    fontSize: "0.875rem",
                    lineHeight: 1.55,
                    color: "color-mix(in oklch, var(--ea-cream) 70%, transparent)",
                    marginTop: "0.85rem",
                    maxWidth: "22ch",
                  }}
                >
                  {c.desc}
                </p>
              </motion.div>
            </Fragment>
          ))}
        </motion.div>

        {/* Bottom — microline + ea-text-link "Обсудить задачу →" */}
        <div className="mt-14 flex flex-col items-center justify-center gap-5 text-center md:mt-16 md:flex-row md:gap-8">
          <p
            style={{
              fontFamily: "var(--ea-font-body)",
              fontSize: "0.9375rem",
              lineHeight: 1.5,
              color: "color-mix(in oklch, var(--ea-cream) 80%, transparent)",
              maxWidth: "40ch",
            }}
          >
            Если у вас нестандартная задача — позвоните. Мы найдём решение.
          </p>
          <a
            href="#contact"
            className="ea-text-link ea-capability-strip__link"
          >
            Обсудить задачу
            <svg
              className="ea-text-link__arrow"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

export default EaCapabilityStrip;
