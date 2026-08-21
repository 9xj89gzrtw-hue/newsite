"use client";

/**
 * CepTestimonialsHeader — Cycle 27.
 *
 * Replicates creativeedgeparties.com §6.8 "TESTIMONIALS" header (analysis
 * line 241–244): a single massive 129.6px headline on cream, left-aligned,
 * nothing else. The minimalism is the wow — the word IS the section.
 *
 * Adaptation for our RU site: the headline reads «ОТЗЫВЫ» (the direct RU
 * counterpart to "TESTIMONIALS"). Cyrillic glyphs fall back per-glyph to
 * Montserrat (loaded as --font-poppins, full Cyrillic subset) since the
 * self-hosted Neutra2Display-Light is Latin-only (see layout.tsx:70–88).
 *
 * - Full-bleed cream section (.cep-section-cream, py-16 md:py-24, px-8 md:px-14)
 * - One massive «ОТЗЫВЫ» headline (.cep-section-h2, black, left-aligned)
 *   clamps up to ~144px (9rem) — close to CEP's measured 129.6px
 * - Subtle 64px red hairline under the word for editorial detail
 * - Reveal on scroll (framer-motion opacity+y), gated by useMounted +
 *   useReducedMotion to avoid SSR hydration mismatch and respect a11y
 */

import { motion, useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";

export function CepTestimonialsHeader() {
  const mounted = useMounted();
  const reduce = useReducedMotion();
  const animate = mounted && !reduce;

  return (
    <section
      aria-label="Отзывы клиентов"
      className="cep-section-cream px-8 py-16 md:px-14 md:py-24"
    >
      <motion.div
        initial={animate ? { opacity: 0, y: 32 } : false}
        whileInView={animate ? { opacity: 1, y: 0 } : undefined}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="cep-section-h2 text-cep-black">TESTIMONIALS</h2>
        {/* Editorial red hairline — a tiny detail CEP uses under section
            headlines to mark the start of a new chapter. */}
        <div
          aria-hidden="true"
          className="mt-6 h-px w-16 bg-cep-red"
        />
      </motion.div>
    </section>
  );
}

export default CepTestimonialsHeader;
