"use client";

/**
 * CepProcess — Cycle 27.
 *
 * Replicates creativeedgeparties.com §6.10 "THE CREATIVE EDGE" process
 * (analysis line 268–279). CEP signature: 3-column numbered process on
 * white bg — 01 DREAM / 02 BUILD / 03 SAVOR — with massive step numbers
 * matching the H2 size, restrained body copy, and zero decorative chrome.
 *
 * Adaptation: section H2 reads «ТВОРЧЕСКИЙ ПОДХОД» (RU of "THE CREATIVE
 * EDGE"); step titles read МЕЧТА / СОЗДАНИЕ / НАСЛАЖДЕНИЕ (RU of
 * DREAM / BUILD / SAVOR). Body copy is bespoke RU in CEP's plain-claim
 * editorial voice (no exclamation points, no marketing fluff). Cyrillic
 * glyphs fall back per-glyph to Montserrat (loaded as --font-poppins)
 * since Neutra2Display-Light is Latin-only.
 *
 * - Full-bleed white section (data-header-theme="light")
 * - Section H2 top-left + reveal on scroll (framer-motion opacity+y)
 * - 3-col grid on md+, single col on mobile
 * - Each step: massive step number (.cep-step-number) → title (.cep-display)
 *   → body (.cep-text). Thin vertical red hairline between columns on
 *   desktop via border-l border-cep-red/20 on steps 2 + 3.
 * - Staggered reveal per step (index * 0.12s delay).
 * - Reduced-motion: render static (no opacity+y animation), content still
 *   visible.
 *
 * CSS classes used (defined in globals.css "CREATIVE EDGE PARTIES" layer):
 *  .cep-section-h2  — clamp(3rem, 9vw, 9rem) uppercase Neutra2Display
 *  .cep-step-number — clamp(3rem, 5.5vw, 4.5rem) uppercase Neutra2Display
 *  .cep-display     — uppercase Neutra2Display (we override font-size inline
 *                     to match CEP's 37.448px step-title scale)
 *  .cep-text        — Neutra2Text_Book body
 */

import { motion, useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";
import type { ReactNode } from "react";
import { TiltedAccent } from "@/components/catering/tilted-accent";

type Step = {
  num: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    num: "01",
    title: "ЗАМЫСЕЛ",
    body:
      "Никаких шаблонов. Никаких готовых меню. Каждое событие мы строим с нуля вокруг вашей идеи.",
  },
  {
    num: "02",
    title: "РЕАЛИЗАЦИЯ",
    body:
      "Мы делали всё — от запусков брендов до свадеб на берегу залива. Когда мы говорим, что ваша смелая идея осуществима, это значит, что мы уже реализовали подобное. За спиной — 17 лет реального опыта.",
  },
  {
    num: "03",
    title: "НАСЛАЖДЕНИЕ",
    body:
      "Мы относимся к вашим гостям с той же точностью, что и к мишленовским блюдам. Каждая деталь выверена — чтобы вы просто наслаждались вечером. Поэтому клиенты возвращаются снова и снова.",
  },
];

/** Editorial easing — Ridgewells/CEP shared curve. */
const EASE = [0.22, 1, 0.36, 1] as const;

export function CepProcess() {
  const mounted = useMounted();
  const reduce = useReducedMotion();
  const animate = mounted && !reduce;

  return (
    <section
      aria-label="Творческий подход — как мы работаем"
      data-header-theme="light"
      className="bg-[#F7F5F5] px-8 py-24 text-cep-black md:px-14 md:py-36"
    >
      {/* Section H2 — reveal on scroll. */}
      <motion.div
        initial={animate ? { opacity: 0, y: 32 } : false}
        whileInView={animate ? { opacity: 1, y: 0 } : undefined}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {/* Cycle 31 — gamma-style -6° tilted handwritten accent ABOVE the H2.
            "процесс" echoes the section's process theme (3-step «ТВОРЧЕСКИЙ
            ПОДХОД») in Marck Script Cyrillic. Red, rotated -6°, sized to sit
            between the eyebrow and H2 scales — an editorial marginalia that
            opens the "how we work" beat with a human handwritten gesture. */}
        <TiltedAccent text="процесс" className="mb-6 block md:mb-8" />
        <h2 className="cep-section-h2 mb-16 text-cep-black md:mb-24">
          Творческий подход
        </h2>
      </motion.div>

      {/* 3-column grid — single col on mobile, 3-up on md+.
          Steps 2 and 3 get a thin vertical red hairline on the left on
          md+ (the CEP editorial divider between columns). */}
      <ol className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
        {STEPS.map((step, i) => (
          <motion.li
            key={step.num}
            initial={animate ? { opacity: 0, y: 28 } : false}
            whileInView={animate ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.6,
              delay: i * 0.12,
              ease: EASE,
            }}
            className={
              // Vertical red hairline between columns on desktop.
              i > 0
                ? "border-cep-red/20 pl-0 md:border-l md:pl-8"
                : undefined
            }
          >
            <ProcessStep step={step} />
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

/** Single process step — number + title + body. */
function ProcessStep({ step }: { step: Step }): ReactNode {
  return (
    <>
      {/* Big step number — .cep-step-number clamps to ~68px. */}
      <div className="cep-step-number mb-4 text-cep-black">{step.num}</div>
      {/* Thin red accent line under the number — anchors the "Creative Edge"
          branding and breaks the whitespace (VLM critique fix). */}
      <div className="mb-6 h-px w-10 bg-cep-red" aria-hidden="true" />

      {/* Step title — .cep-display (uppercase Neutra2Display) with
          inline font-size override matching CEP's measured 37.448px
          step-title scale (clamp(1.5rem, 2.6vw, 2.4rem)). */}
      <h3
        className="cep-display mb-4 text-cep-black"
        style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.4rem)" }}
      >
        {step.title}
      </h3>

      {/* Body copy — .cep-text (Neutra2Text_Book) at 17px, 75% opacity
          black, line-height 1.6, max-w-xs for editorial column width. */}
      <p
        className="cep-text max-w-xs text-cep-black/75"
        style={{ fontSize: "17px", lineHeight: 1.6 }}
      >
        {step.body}
      </p>
    </>
  );
}

export default CepProcess;
