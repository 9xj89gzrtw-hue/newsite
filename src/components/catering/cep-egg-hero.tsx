"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";

/**
 * CepEggHero — Creative Edge Parties signature hero (Cycle 27).
 *
 * Full-viewport black section replicating CEP's "THE EGG / CAME FIRST." hero
 * from creativeedgeparties.com homepage §6.2. Adapted to the Interfood RU
 * brand voice as a stacked two-line aphorism that plays on the
 * chicken-and-egg riddle the way CEP does:
 *
 *   ЕДА                 (line 1 — food)
 *   ПРЕЖДЕ ВСЕГО.       (line 2 — comes first)
 *
 * Composition (matches CEP pixel layout):
 *   - Background: full-bleed egg photograph with `.cep-bg-zoom` Ken-Burns
 *     animation + a subtle 25% dark overlay so white text reads.
 *   - Headline top-left (px-8 md:px-14, pt-24) using `.cep-hero-h1` (clamp
 *     up to 244px, line-height 0.88 so the two lines sit tight — CEP rule).
 *   - Below headline: a small wordmark rendered as text "INTERFOOD CATERING"
 *     in `.cep-eyebrow` (the foreign CEP wordmark PNG doesn't fit the RU
 *     brand, per task instructions).
 *   - Subhead in `.cep-text` 17px white/80.
 *   - Bottom-right locations strip in `.cep-nav-link` 22px (right-aligned):
 *     САНКТ-ПЕТЕРБУРГ | МОСКВА | ВСЯ РОССИЯ (mirrors CEP's
 *     "NEW YORK | MIAMI | PALM BEACH | WORLDWIDE").
 *   - No CTAs in hero (CEP rule — luxury restraint).
 *   - Scroll cue bottom-center: 1px×60px white/40 line + "SCROLL" eyebrow.
 *
 * Animation: framer-motion staggered `whileInView` reveal on each headline
 * line (opacity 0→1, y 40→0, stagger 0.15s, duration 0.8 ease). The
 * wordmark, subhead, and locations strip follow at +0.45s each. Respects
 * `useReducedMotion()` — when reduced, all elements render statically
 * (mounted gate avoids SSR hydration mismatch per AGENTS.md §14 грабли #8).
 *
 * @see /home/z/my-project/creativeedge-analysis.md §6.2 (Hero)
 */
export function CepEggHero() {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const showStatic = mounted && Boolean(reduce);

  // Container orchestrates the staggered reveal of all hero blocks.
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  // Per-word reveal — opacity + 40px upward slide, 0.8s ease.
  const wordVariants = showStatic
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, ease: "easeOut" as const },
        },
      };

  // Late-arriving supporting blocks (wordmark + subhead + locations strip).
  const supportingVariants = showStatic
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: "easeOut" as const },
        },
      };

  return (
    <section
      id="hero"
      data-header-theme="dark"
      aria-label="Interfood Catering — премиальный кейтеринг"
      className="cep-section-black relative min-h-screen w-full overflow-hidden"
    >
      {/* Background egg photograph — monumentally scaled (object-cover +
          scale-110) so the egg fills the frame edge-to-edge like CEP's
          original, with `.cep-bg-zoom` Ken-Burns drift on top. */}
      <Image
        src="/media/cep/cep-egg-hero.webp"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="cep-bg-zoom scale-110 object-cover"
      />
      {/* Layered overlays: a stronger bottom-left gradient (so the headline
          reads against the egg's bright highlights) + an overall 18% veil. */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/15 to-black/40"
        aria-hidden="true"
      />

      {/* Stacked headline top-left + supporting copy. The headline uses
          ENGLISH ("THE EGG / CAME FIRST.") exactly like CEP so the
          Neutra2Display-Light font (Latin-only) renders the brand signature.
          A RU translation sits below as the subhead. */}
      <motion.div
        className="relative z-10 flex min-h-screen flex-col justify-center px-6 pt-24 md:px-14"
        initial={showStatic ? false : "hidden"}
        animate={showStatic ? undefined : "visible"}
        variants={containerVariants}
      >
        <h1 className="cep-hero-h1 text-white">
          <motion.span variants={wordVariants} className="block">
            THE EGG
          </motion.span>
          <motion.span variants={wordVariants} className="block">
            CAME FIRST.
          </motion.span>
        </h1>

        {/* Wordmark — text version ("INTERFOOD CATERING") chosen over the
            CEP wordmark PNG because the foreign wordmark doesn't fit the
            Russian brand identity. */}
        <motion.p
          variants={supportingVariants}
          className="cep-eyebrow mt-8 text-white"
          style={{ letterSpacing: "0.12em" }}
        >
          INTERFOOD CATERING
        </motion.p>

        {/* Subhead — RU of CEP's "Reinventing food as design since 1989."
            Sits directly under the wordmark, tight leading, white/80. */}
        <motion.p
          variants={supportingVariants}
          className="cep-text mt-3 max-w-md text-[17px] leading-[1.2] text-white/80"
        >
          Переосмысляем еду как искусство с 2014 года.
        </motion.p>
      </motion.div>

      {/* Locations strip bottom-right — mirrors CEP "NEW YORK | MIAMI |
          PALM BEACH | WORLDWIDE". Hidden on small screens to avoid wrapping
          over the headline. */}
      <motion.div
        className="absolute bottom-8 right-8 z-10 hidden text-right md:block md:right-14"
        initial={showStatic ? false : { opacity: 0 }}
        animate={
          showStatic
            ? undefined
            : { opacity: 1, transition: { delay: 0.9, duration: 0.7 } }
        }
      >
        <p className="cep-nav-link text-[18px] text-white sm:text-[20px] md:text-[22px]">
          САНКТ-ПЕТЕРБУРГ
          <span className="mx-2 text-white/50" aria-hidden="true">
            |
          </span>
          МОСКВА
          <span className="mx-2 text-white/50" aria-hidden="true">
            |
          </span>
          ВСЯ РОССИЯ
        </p>
      </motion.div>

      {/* Scroll cue bottom-center — 1px×60px white/40 vertical line +
          "SCROLL" eyebrow. */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        initial={showStatic ? false : { opacity: 0 }}
        animate={
          showStatic
            ? undefined
            : { opacity: 1, transition: { delay: 1.4, duration: 0.8 } }
        }
        aria-hidden="true"
      >
        <span className="cep-eyebrow text-[11px] text-white/60">SCROLL</span>
        {showStatic ? (
          <span className="block h-[60px] w-px bg-white/40" />
        ) : (
          <motion.span
            className="block w-px bg-white/40"
            style={{ height: 60, transformOrigin: "top" }}
            animate={{ scaleY: [0.4, 1, 0.4] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.6,
            }}
          />
        )}
      </motion.div>
    </section>
  );
}

export default CepEggHero;
