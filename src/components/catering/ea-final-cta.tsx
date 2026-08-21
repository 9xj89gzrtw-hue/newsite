"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

/**
 * EaFinalCta — Elegant Affairs dramatic minimal final CTA moment.
 *
 * Pattern source: docs/EA-ANALYSIS.md §3.7 ("We're your secret ingredient."
 * full-bleed closer with single oversized italic-as-fragment headline) +
 * §4.5 (italic-as-fragment trailing-phrase device) + §5.4 (CTA strategy —
 * minimal two-button pair, primary fill + secondary outline) + §7 footer
 * contact strip ("It's party time" closer + 3-location address row).
 *
 * Adaptation for Interfood:
 *  - Pure-black bg (--ea-black) — closes the page on a cinematic beat
 *    before the SiteFooter. EA's footer uses a near-black with mauve
 *    divider; we go full-black for editorial drama.
 *  - Eyebrow "ОБСУДИМ СОБЫТИЕ" (Barlow Semi Condensed Bold uppercase, red,
 *    letter-spacing 0.18em) — uses shared .ea-eyebrow utility.
 *  - H2 in Playfair Display, clamp 3rem→7rem, line-height 1, cream,
 *    letter-spacing -0.02em: "Обсудим <i>событие</i>?" — italic fragment
 *    "событие" colored red. The single oversized italic-as-fragment
 *    headline IS the closer (no second sub-headline).
 *  - Short paragraph (Montserrat 1.0625rem, line-height 1.7, cream/75,
 *    max-width 640px, centered) — sets expectations (calc within business
 *    day, no obligations).
 *  - Row of 2 CTAs centered:
 *      Primary:   .ea-solid-btn   "Рассчитать стоимость" → #calculator
 *      Secondary: .ea-outline-btn "Написать письмо"     → #contact
 *    Both shared utilities from globals.css — no per-component CSS needed.
 *  - Bottom: 3 contact lines in a row, separated by red • bullets
 *    (Montserrat 0.875rem, cream/60, letter-spacing 0.05em, uppercase).
 *
 * Replaces: src/components/catering/social-handle.tsx (Ridgewells
 * bordeaux/gold giant-@-handle). Does NOT delete social-handle.tsx — the
 * orchestrator decides wiring.
 *
 * Placement (target): right before <SiteFooter /> — closes the page on a
 * branded, actionable note (EA places the "It's party time" closer in the
 * same position).
 *
 * Reveal-on-scroll stagger: eyebrow → headline → paragraph → CTAs →
 * contact lines (5-step 80-120ms stagger). Respects prefers-reduced-motion.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export function EaFinalCta() {
  const reduce = useReducedMotion();

  return (
    <section
      id="final-cta"
      data-header-theme="dark"
      aria-labelledby="ea-final-cta-headline"
      className="ea-section ea-section--black relative overflow-hidden"
      style={{
        paddingTop: "clamp(7rem, 14vw, 11rem)",
        paddingBottom: "clamp(7rem, 14vw, 11rem)",
      }}
    >
      {/* Subtle red vignette — barely-there painterly bloom to avoid the
          flat-black "cheap" look EA's audit flagged. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 12%, rgba(231,29,58,0.12) 0%, transparent 55%), radial-gradient(ellipse at 50% 95%, rgba(231,29,58,0.05) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Top hairline rule — EA editorial divider discipline. */}
      <div
        className="pointer-events-none absolute inset-x-[8%] top-10"
        style={{
          height: "1px",
          background:
            "linear-gradient(to right, transparent, rgba(247,245,245,0.18), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-6 text-center">
        {/* Eyebrow — "ОБСУДИМ СОБЫТИЕ" */}
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="ea-eyebrow"
        >
          Обсудим событие
        </motion.span>

        {/* Headline — Playfair Display, oversized, italic-as-fragment
            trailing phrase "событие" colored red. */}
        <motion.h2
          id="ea-final-cta-headline"
          initial={reduce ? false : { opacity: 0, y: 32, scale: 0.98 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          className="mt-8 font-serif"
          style={{
            fontSize: "clamp(3rem, 8vw, 7rem)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            fontWeight: 400,
            color: "var(--ea-cream)",
          }}
        >
          Обсудим{" "}
          <i className="italic" style={{ color: "var(--ea-red)" }}>
            событие
          </i>
          ?
        </motion.h2>

        {/* Short paragraph — sets expectations */}
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.24, ease: EASE }}
          className="mx-auto mt-10"
          style={{
            fontFamily: "var(--ea-font-body)",
            fontSize: "1.0625rem",
            lineHeight: 1.7,
            maxWidth: "640px",
            color: "color-mix(in oklab, var(--ea-cream) 75%, transparent)",
          }}
        >
          Расскажите о дате, площадке и количестве гостей — пришлём расчёт
          в течение рабочего дня. Без обязательств.
        </motion.p>

        {/* CTA row — primary solid red + secondary outline red, centered. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.38, ease: EASE }}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
        >
          <Link
            href="#calculator"
            className="ea-solid-btn"
            aria-label="Рассчитать стоимость — открыть калькулятор"
          >
            Рассчитать стоимость
          </Link>
          <Link
            href="#contact"
            className="ea-outline-btn"
            aria-label="Написать письмо — открыть форму контактов"
          >
            Написать письмо
          </Link>
        </motion.div>

        {/* Contact strip — 3 lines separated by red • bullets. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.52, ease: EASE }}
          className="mt-16 flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2"
        >
          <ContactLine>Тел. +7 812 401-50-50</ContactLine>
          <RedBullet />
          <ContactLine>pochta@interfood-catering.ru</ContactLine>
          <RedBullet />
          <ContactLine>Санкт-Петербург · Москва · Вся Россия</ContactLine>
        </motion.div>
      </div>
    </section>
  );
}

/** Contact line — Montserrat 0.875rem, cream/60, letter-spacing 0.05em,
 * uppercase. Renders as a single <span>. */
function ContactLine({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="tracking-[0.05em] uppercase"
      style={{
        fontFamily: "var(--ea-font-body)",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "color-mix(in oklab, var(--ea-cream) 60%, transparent)",
      }}
    >
      {children}
    </span>
  );
}

/** Red bullet separator — small • between contact lines. Hidden on mobile
 * (lines stack vertically with gap) to keep mobile clean. */
function RedBullet() {
  return (
    <span
      aria-hidden="true"
      className="hidden sm:inline-block"
      style={{
        color: "var(--ea-red)",
        fontSize: "0.75rem",
        lineHeight: 1,
      }}
    >
      •
    </span>
  );
}

export default EaFinalCta;
