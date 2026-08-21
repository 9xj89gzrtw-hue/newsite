"use client";

/**
 * EaServicesGrid — Cycle 28 (EA editorial layer)
 * ------------------------------------------------
 * 4-column minimal service cards teaser. SITS ABOVE `services-overview.tsx`
 * (Ridgewells 2-up). NOT a replacement — a quick-scan teaser row that
 * precedes the detailed editorial cards below it.
 *
 * SUPPLEMENTS `services-overview.tsx` per CYCLE-28-COMPONENT-AUDIT.md §7
 * (recommended ea-* component #3) + §15 RESTYLE sketch.
 *
 * EA design language grafted (per docs/EA-ANALYSIS.md §3.5 About pitch +
 * §3.11 events cards + §11 token recommendations):
 *  - Blush section bg (var(--ea-blush)) — EA's premium-section background.
 *  - Italic-as-fragment trailing phrase ("наш кейтеринг" → italic + red).
 *  - Eyebrow (Barlow Semi Condensed Bold) + H2 (Playfair) + ea-text-link.
 *  - Each card: 2px × 32px red vertical line + mauve 01/02/03/04 number.
 *  - Title: Barlow Semi Condensed Bold 1.15rem uppercase ink.
 *  - Body: Montserrat 0.9rem, ink @ 75% opacity, 2-line clamp.
 *  - Hairline dividers between cards (cream-deep color, desktop only).
 *  - ea-text-link "Подробнее →" scrolls to existing #services-overview
 *    section (the actual ID of ServicesOverview — link target verified).
 *
 * Motion:
 *  - motion.div fade-up reveal on each card (staggered 0.08s).
 *  - Respects `useReducedMotion` — when reduced, all motion disabled.
 *
 * Self-contained: scoped CSS in `./ea-services-grid.css`. No edits to
 * globals.css, no edits to any other catering/*.tsx file.
 */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import "./ea-services-grid.css";

/** EA Easing — quiet cubic-bezier used across the editorial layer. */
const EASE = [0.22, 1, 0.36, 1] as const;

type ServiceCard = {
  num: string;
  title: string;
  body: string;
};

/**
 * 4 canonical Interfood service categories — match the brief's spec:
 * "СВАДЬБЫ", "КОРПОРАТИВ", "БАНКЕТЫ", "ФУРШЕТЫ".
 */
const CARDS: ServiceCard[] = [
  {
    num: "01",
    title: "Свадьбы",
    body: "Авторское меню, welcome-зона, сервировка и официанты — банкет под ключ для вашего дня.",
  },
  {
    num: "02",
    title: "Корпоратив",
    body: "Галá, презентации, новогодние вечера и пикники — сервис, формирующий имидж бренда.",
  },
  {
    num: "03",
    title: "Банкеты",
    body: "Торжества на 50–500 гостей: юбилеи, годовщины, конференции и церемонии награждения.",
  },
  {
    num: "04",
    title: "Фуршеты",
    body: "Канапе, бьюти-зона, кофе-брейки — лёгкий формат для приёма на ногах и деловых встреч.",
  },
];

export function EaServicesGrid() {
  const reduce = useReducedMotion();

  return (
    <section
      id="ea-services-grid"
      aria-labelledby="ea-services-grid-headline"
      className="ea-svc-grid ea-section ea-section--blush"
    >
      <div className="ea-container ea-container--wide">
        <motion.div
          className="ea-svc-grid__head"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="ea-eyebrow">Услуги · Полный цикл</span>
          <h2
            id="ea-services-grid-headline"
            className="ea-section-h2 ea-svc-grid__h2"
          >
            {"Что входит в "}
            <i className="ea-italic-fragment">наш кейтеринг</i>
            {"."}
          </h2>
        </motion.div>

        <div className="ea-svc-grid__row">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.num}
              className="ea-svc-grid__card"
              initial={reduce ? false : { opacity: 0, y: 30 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
            >
              <div className="ea-svc-grid__num-block">
                <span className="ea-svc-grid__line" aria-hidden="true" />
                <span className="ea-svc-grid__num">{card.num}</span>
              </div>
              <h3 className="ea-svc-grid__title">{card.title}</h3>
              <p className="ea-svc-grid__body">{card.body}</p>
              <Link
                href="#services-overview"
                className="ea-text-link ea-svc-grid__link"
                aria-label={`Подробнее: ${card.title}`}
              >
                Подробнее
                <svg
                  className="ea-text-link__arrow"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M4 12h15M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EaServicesGrid;
