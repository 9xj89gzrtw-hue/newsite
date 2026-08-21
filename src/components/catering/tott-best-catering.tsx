"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";

/**
 * TottBestCatering — Talk of the Town (talkofthetownatlanta.com) "atlanta's
 * best catering company" section graft (Cycle 30, task v3).
 *
 * Reproduces their homepage rows 1–4 structure on a SOLID WHITE background
 * (their site uses beige parallax for row 2, but the user explicitly asked
 * for white: "на белом фоне там где сейчас у нас полоска избранные клиенты").
 * Replaces the Cycle-27 CepClientMarquee (black "ИЗБРАННЫЕ КЛИЕНТЫ" strip)
 * — that strip was Interfood's loudest, lowest-information block, and the
 * talkofthetown reference puts a calm brand-positioning statement here
 * instead. Better client-journey logic: after the hero brand promise, the
 * next beat should be WHO we are and WHY we're the best — not a logo parade.
 *
 * Composition (mirrors their rows 1–4):
 *   - Solid white section bg + generous vertical padding.
 *   - Centered column, max-w-3xl.
 *   - Eyebrow "ЛУЧШИЙ КЕЙТЕРИНГ САНКТ-ПЕТЕРБУРГА" (Lato tracked, burgundy) —
 *     their row 1 "atlanta's best catering company" eyebrow.
 *   - H1 "ПЕТЕРБУРГ / КЕЙТЕРИНГ С ДУШОЙ" (Prata, two-line stacked) — their
 *     row 3 "ATLANTA / CATERERS THAT CARE" h1 pattern. Prata is Latin-only,
 *     so RU renders in Playfair (serif fallback with Cyrillic) — same display
 *     weight, same editorial feel.
 *   - H2 "декаданс блюд / безупречная подача" (Prata italic-style, olive) —
 *     their row 3 "decadent dishes / flawless presentation" h2.
 *   - Body paragraph (Lato) — their "Talk of the Town creates memorable,
 *     distinctive dishes..." copy, adapted to Interfood's RU voice.
 *   - CTA button "СМОТРЕТЬ МЕНЮ" (burgundy tott-cta-btn) → #menu.
 *
 * Animation: framer-motion staggered fade+rise (0.15s stagger), reduced-motion
 * aware + SSR mount gate (no hydration mismatch).
 *
 * @see docs/talkofthetown-MINED-EXTRACTION.md §8 (rows 1-4)
 */
export function TottBestCatering() {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const animate = mounted && !reduce;

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };
  const rise = animate
    ? {
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
      }
    : { hidden: {}, visible: {} };

  return (
    <section
      data-header-theme="light"
      aria-label="Лучший кейтеринг Санкт-Петербурга"
      className="relative overflow-hidden bg-white px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={animate ? "hidden" : false}
          whileInView={animate ? "visible" : undefined}
          viewport={{ once: true, margin: "-15% 0px" }}
          variants={container}
        >
          {/* Eyebrow — their row-1 "atlanta's best catering company". */}
          <motion.p
            variants={rise}
            className="tott-body mb-6 text-[12px] font-bold uppercase tracking-[0.32em] text-tott-burgundy sm:text-sm"
          >
            Лучший кейтеринг Санкт-Петербурга
          </motion.p>

          {/* H1 — two-line stacked display headline (their row-3 "ATLANTA /
              CATERERS THAT CARE" pattern). Prata is Latin-only → RU falls
              back to Playfair (serif, Cyrillic). */}
          <motion.h2
            variants={rise}
            className="font-serif text-ink"
            style={{
              fontSize: "clamp(2.4rem, 7vw, 5rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.01em",
              fontWeight: 400,
            }}
          >
            <span className="block">Петербург</span>
            <span className="block">кейтеринг с душой</span>
          </motion.h2>

          {/* H2 — their row-3 "decadent dishes / flawless presentation" h2.
              Olive accent, slightly smaller, italic feel via Playfair italic. */}
          <motion.p
            variants={rise}
            className="font-serif mt-6 text-tott-olive-deep"
            style={{
              fontSize: "clamp(1.2rem, 2.4vw, 1.8rem)",
              lineHeight: 1.2,
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            декаданс блюд
            <span className="mx-3 text-tott-olive/50" aria-hidden="true">·</span>
            безупречная подача
          </motion.p>

          {/* Body — their "Talk of the Town creates memorable, distinctive
              dishes..." copy, adapted to Interfood's RU voice. */}
          <motion.p
            variants={rise}
            className="tott-body mx-auto mt-8 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg"
          >
            Interfood создаёт запоминающиеся, особенные блюда под вкус и тон
            вашего события. Мы отбираем лучшие сезонные ингредиенты, готовим
            с нуля и подаём так, чтобы каждый гость запомнил момент.
          </motion.p>

          {/* CTA — burgundy tott-cta-btn (their "explore the menu" button). */}
          <motion.div variants={rise} className="mt-10">
            <a href="#menu" className="tott-cta-btn min-h-[44px]">
              Смотреть меню
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default TottBestCatering;
