"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/**
 * EaTastingCta — Elegant Affairs "Book a Tasting" mid-page CTA pattern.
 *
 * Pattern source: docs/EA-ANALYSIS.md §3.7 (Secret Ingredient blush-bg
 * section between About + Our Food — premium two-tone editorial rhythm)
 * + §5.4 (CTA strategy — minimal two-button pair, primary fill) + §4.5
 * (italic-as-fragment trailing-phrase typographic device).
 *
 * Adaptation for Interfood:
 *  - Blush bg (--ea-blush #F1ECEC) — EA's signature premium-section
 *    surface, paired with the black bookend sections (philosophy quote +
 *    final CTA) to give the page a two-tone blush/black/blush/black
 *    editorial rhythm.
 *  - SHORTER than the bookend sections (clamp 4rem→5.5rem vs 6rem→10rem
 *    + 7rem→11rem) — a quick beat, not a destination.
 *  - Two-column 50/50 layout:
 *      Desktop:  image LEFT, text RIGHT (DOM order flipped via Tailwind
 *                `order` utilities).
 *      Mobile:   text FIRST, image SECOND (DOM-order natural flow).
 *  - LEFT column: next/image 4:5 aspect, /media/concorde-avo-toast.jpg,
 *    rounded-2 corners (Tailwind `rounded-2xl`), soft shadow
 *    var(--ea-shadow-blush), slight hover scale (1.02 over 480ms).
 *  - RIGHT column:
 *      - eyebrow "ЗАПИСЬ НА ДЕГУСТАЦИЮ" (.ea-eyebrow shared utility)
 *      - H3 Playfair Display 2rem→2.5rem, line-height 1.15, ink:
 *        "Хотите попробовать <i>до</i> заказа?" (italic "до" red).
 *      - 2-line body (Montserrat, ink/82, line-height 1.65): "Запишитесь
 *        на приватную дегустацию в нашей студии на Петроградке. Шесть
 *        блюд из вашего будущего меню — за 45 минут. 3500 ₽ с человека,
 *        возвращаем при заказе от 50 гостей."
 *      - .ea-solid-btn "Записаться →" → #contact
 *
 * NEW section (no predecessor to REPLACE) — fills the gap between
 * TastingMenuExperience and Calculator in the client journey. Orchestrator
 * wires it; this file is self-contained and side-effect free.
 *
 * Placement (target): mid-page, between TastingMenuExperience and
 * Calculator. The blush surface acts as a soft palette-cleanser between
 * the editorial menu photography above and the calculator data-entry below.
 *
 * Reveal-on-scroll for both columns. Respects prefers-reduced-motion.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export function EaTastingCta() {
  const reduce = useReducedMotion();

  return (
    <section
      id="tasting-cta"
      data-header-theme="light"
      aria-labelledby="ea-tasting-cta-headline"
      className="ea-section ea-section--blush relative overflow-hidden"
      style={{
        paddingTop: "clamp(4rem, 6vw, 5.5rem)",
        paddingBottom: "clamp(4rem, 6vw, 5.5rem)",
      }}
    >
      <div className="relative mx-auto w-full max-w-[1280px] px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center md:gap-16">
          {/* IMAGE column — DOM order 2 (so text shows first on mobile),
              flipped to order 1 (LEFT) on desktop via Tailwind order. */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, ease: EASE }}
            className="order-2 md:order-1"
          >
            <motion.div
              whileHover={reduce ? undefined : { scale: 1.02 }}
              transition={{ duration: 0.48, ease: EASE }}
              className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl"
              style={{
                boxShadow: "var(--ea-shadow-blush)",
              }}
            >
              <Image
                src="/media/concorde-avo-toast.jpg"
                alt="Тарелка с авокадо-тостом на дегустации в студии Interfood Catering на Петроградке"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out"
              />
            </motion.div>
          </motion.div>

          {/* TEXT column — DOM order 1 (shows first on mobile), flipped
              to order 2 (RIGHT) on desktop. */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.12, ease: EASE }}
            className="order-1 md:order-2"
          >
            <span className="ea-eyebrow">Запись на дегустацию</span>

            <h3
              id="ea-tasting-cta-headline"
              className="mt-5 font-serif"
              style={{
                fontSize: "clamp(2rem, 3vw, 2.5rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.012em",
                fontWeight: 400,
                color: "var(--ea-ink)",
              }}
            >
              Хотите попробовать{" "}
              <i className="italic" style={{ color: "var(--ea-red)" }}>
                до
              </i>{" "}
              заказа?
            </h3>

            <p
              className="mt-5 max-w-[520px]"
              style={{
                fontFamily: "var(--ea-font-body)",
                fontSize: "1rem",
                lineHeight: 1.65,
                color: "color-mix(in oklab, var(--ea-ink) 82%, transparent)",
              }}
            >
              Запишитесь на приватную дегустацию в нашей студии на
              Петроградке. Шесть блюд из вашего будущего меню — за 45 минут.
              3500&nbsp;₽ с человека, возвращаем при заказе от 50 гостей.
            </p>

            <div className="mt-8">
              <Link
                href="#contact"
                className="ea-solid-btn"
                aria-label="Записаться на дегустацию — открыть форму контактов"
              >
                Записаться{" "}
                <span aria-hidden="true" className="ml-1">
                  →
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default EaTastingCta;
