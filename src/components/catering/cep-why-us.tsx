"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";
import { TiltedAccent } from "@/components/catering/tilted-accent";

/**
 * CepWhyUs — Creative Edge Parties "WHY US?" section replica (Cycle 27).
 *
 * Full-bleed black band with a massive left-aligned section H2 ("ПОЧЕМУ МЫ?")
 * followed by 4 value-prop phrases in a 4-col row. CEP rule: NO body copy
 * under each phrase — just the headline. Restraint is the brand voice.
 * (creativeedge-analysis.md §6.6)
 *
 * Editorial flourish: each phrase (except the first) is separated on desktop
 * by a thin vertical red hairline (`border-l border-cep-red/30 pl-6`), hidden
 * on mobile. Staggered fade+slide reveal (0.1s between phrases) — disabled
 * for reduced-motion users.
 *
 * Typography:
 *  - H2 uses the global `.cep-section-h2` utility (clamp up to ~142px).
 *  - Phrases use `.cep-display` (Neutra2Display-Light, falls back to Poppins
 *    for Cyrillic) with an inline override to `clamp(1.5rem, 2.6vw, 2.4rem)`
 *    (≈37px — CEP's H3 value-prop scale) and `line-height: 1.05`.
 */

const PHRASES: string[] = [
  "LIMITLESS\nCREATIVITY",
  "IMMERSIVE\nEXPERIENCES",
  "EXQUISITE FOOD\n& DRINK",
  "FLAWLESS\nEXECUTION",
];

export function CepWhyUs() {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  // Disable animation entirely for SSR + reduced-motion users — render final.
  const animate = mounted && !reduceMotion;

  return (
    <section
      data-header-theme="dark"
      aria-label="Почему мы"
      className="cep-section-black px-8 py-24 md:px-14 md:py-32"
    >
      <div className="mx-auto max-w-screen-2xl">
        {/* Cycle 31 — gamma-style -6° tilted handwritten accent ABOVE the H2.
            "почему" mirrors the section's question ("ПОЧЕМУ МЫ?") in Marck
            Script (cyrillic-capable). Red, rotated -6°, sized to sit between
            the eyebrow and H2 scales — an editorial marginalia, not a
            headline. Marks the start of the "why us" beat with a human
            handwritten gesture. */}
        <TiltedAccent text="почему" className="mb-6 block md:mb-8" />
        <motion.h2
          className="cep-section-h2 mb-16 text-white md:mb-24"
          initial={animate ? { opacity: 0, y: 32 } : false}
          whileInView={animate ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          WHY US?
        </motion.h2>
        <motion.p
          className="cep-text mt-2 mb-16 max-w-md text-white/55 md:mb-24"
          initial={animate ? { opacity: 0, y: 16 } : false}
          whileInView={animate ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          Почему выбирают нас — четыре принципа нашей работы.
        </motion.p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {PHRASES.map((phrase, i) => (
            <motion.div
              key={phrase}
              // Thin vertical red hairline between props on desktop only.
              // Hover: hairline shifts to full-opacity red + phrase letter-spacing expands.
              className={`group/prop cursor-default transition-colors ${
                i > 0
                  ? "md:border-l md:border-cep-red/30 md:pl-6 hover:md:border-cep-red"
                  : ""
              }`}
              initial={animate ? { opacity: 0, y: 24 } : false}
              whileInView={animate ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: 0.1 * i, // 0.1s stagger between phrases
              }}
            >
              <h3
                className="cep-display text-white transition-[letter-spacing,color] duration-500 group-hover/prop:text-cep-red"
                style={{
                  fontSize: "clamp(1.5rem, 2.6vw, 2.4rem)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                }}
              >
                <span className="inline-block transition-[transform] duration-500 group-hover/prop:[transform:translateX(6px)]">
                  {phrase.split("\n").map((line, idx, arr) => (
                    <span key={idx}>
                      {line}
                      {idx < arr.length - 1 && <br />}
                    </span>
                  ))}
                </span>
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
