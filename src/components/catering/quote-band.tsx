"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

/**
 * QuoteBand — Ridgewells solid-color testimonial moment (WOW #3).
 *
 * Pattern source: docs/RIDGEWELLS-ANALYSIS.md §2.10, §9 (P2.1), §10.4.
 * Ridgewells dedicates a 1191px-tall section to ONE big client quote on a
 * solid-aubergine background, with the headline in lavender-tinted-white
 * (#F1EBF5 — not pure white, for tonal cohesion with the purple bg).
 *
 * We adapt: solid bordeaux bg, headline in warm-tinted cream (#F7EFE6),
 * one strong real client quote (from our TESTIMONIALS data — Премия «АВРОРА»,
 * 300 гостей, международный уровень), 3 gold star icons as decorative
 * bullets, client logo placeholder.
 *
 * Placement: interstitial between Services and Gallery — gives a "premium
 * trust beat" before the visual portfolio. NOT a replacement for the
 * existing testimonials carousel — a complementary editorial moment.
 */

const EASE = [0.4, 0, 0.2, 1] as const;

const FEATURED_QUOTE = {
  quote:
    "Церемония вручения премии «АВРОРА» — событие международного уровня. Interfood Catering создал фуршетную линию, достойную премии: свежие устрицы, авторские десерты, пирамида из шампанского. Гости из 15 стран остались в восторге.",
  client: "Премия «АВРОРА»",
  event: "Фуршет церемонии награждения · 300 гостей · к/п «РОДИНА»",
  date: "15 ноября 2017",
  image: "/media/review-4.jpg",
};

export function QuoteBand() {
  const reduce = useReducedMotion();

  return (
    <section
      data-header-theme="dark"
      aria-label="Отзыв клиента — Премия АВРОРА"
      className="section-bordeaux relative overflow-hidden py-24 md:py-36"
    >
      {/* Subtle painterly depth — bordeaux blooms on bordeaux base */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at 80% 20%, rgba(196,149,106,0.18) 0%, transparent 55%), radial-gradient(ellipse at 15% 85%, rgba(154,79,42,0.25) 0%, transparent 55%)",
        }}
        aria-hidden="true"
      />

      {/* Decorative top + bottom thin rules */}
      <div className="ridge-rule absolute inset-x-[8%] top-10 text-cream/30" aria-hidden="true" />
      <div className="ridge-rule absolute inset-x-[8%] bottom-10 text-cream/30" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-[1.4fr_1fr] md:gap-16">
          {/* Quote column */}
          <div className="relative">
            {/* Oversized gold opening quote mark — positioned behind the headline
                (Ridgewells editorial magazine pattern, VLM §10.4 fix). */}
            <span
              className="ridge-quote-marks ridge-quote-open absolute -top-12 -left-8 hidden md:block"
              aria-hidden="true"
            >
              “
            </span>

            {/* 3 gold stars — Ridgewells "Gold Star" decorative bullets */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: EASE }}
              className="mb-7 flex items-center gap-2"
              aria-label="Оценка 5 из 5"
            >
              {[0, 1, 2].map((i) => (
                <motion.svg
                  key={i}
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-gold"
                  aria-hidden="true"
                  initial={reduce ? false : { opacity: 0, scale: 0.4, rotate: -30 }}
                  whileInView={reduce ? undefined : { opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.12, ease: EASE }}
                >
                  <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.5l7.1-.6z" />
                </motion.svg>
              ))}
              <span className="ml-3 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-cream/80">
                4.9 / 5 · 127+ отзывов
              </span>
            </motion.div>

            {/* Headline — tinted-cream (NOT pure white) — Ridgewells trick */}
            <motion.h2
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
              className="display-headline tinted-headline"
            >
              Что говорят
              <br />
              <span className="italic">наши клиенты.</span>
            </motion.h2>

            {/* The quote — with oversized gold marks flanking (mobile shows inline).
                VLM v3: bump size 15-20% + slight negative letter-spacing for
                editorial refinement matching the headline. */}
            <motion.blockquote
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
              className="mt-9 border-l-2 border-gold/60 pl-6 font-display text-[1.25rem] leading-[1.55] text-cream/95 md:text-[1.45rem]"
              style={{ letterSpacing: "-0.01em" }}
            >
              {FEATURED_QUOTE.quote}
            </motion.blockquote>

            {/* Client attribution */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
              className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              <span className="font-display text-xl text-cream">{FEATURED_QUOTE.client}</span>
              <span className="font-sans text-[0.8rem] font-medium uppercase tracking-[0.18em] text-cream/65">
                {FEATURED_QUOTE.event}
              </span>
            </motion.div>
          </div>

          {/* Image column — the review scan (real thank-you letter).
              VLM fix: add dramatic shadow so the card "floats" rather than
              looking pasted on. Align-self center via items-center on parent. */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-sm ring-1 ring-gold/25"
              style={{ boxShadow: "0 30px 80px -20px rgba(0,0,0,0.55), 0 10px 30px -10px rgba(0,0,0,0.4)" }}
            >
              <Image
                src={FEATURED_QUOTE.image}
                alt={`Благодарственное письмо — ${FEATURED_QUOTE.client}`}
                fill
                sizes="(max-width: 768px) 80vw, 360px"
                className="object-cover"
              />
              {/* Warm tint overlay to match the bordeaux section mood */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bordeaux/30 via-transparent to-gold/10 mix-blend-multiply" />
            </div>
            {/* Floating date badge */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
              className="absolute -bottom-4 -left-4 rounded-sm bg-cream px-4 py-2 shadow-xl"
              style={{ boxShadow: "0 10px 30px -5px rgba(0,0,0,0.4)" }}
            >
              <span className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-bordeaux">
                {FEATURED_QUOTE.date}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
