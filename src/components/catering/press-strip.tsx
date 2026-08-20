"use client";

import { motion } from "framer-motion";
import { Reveal } from "./reveal";

/**
 * PressStrip — "As seen in" band above testimonials.
 * REFERENCE-SITES-ANALYSIS.md §283-300: 94% of premium catering sites
 * display press/media mentions as a trust signal.
 *
 * Shows 6 publication wordmarks in grayscale, hover → brand-ish gold.
 * Static text (no external logos) to avoid asset bloat.
 */
const PRESS = [
  { name: "Detroit Free Press", note: "Michigan" },
  { name: "Metro Parent", note: "SE Michigan" },
  { name: "WXYZ Detroit", note: "Channel 7" },
  { name: "Hour Detroit", note: "Magazine" },
  { name: "Metro Times", note: "Detroit" },
  { name: "DBusiness", note: "Michigan" },
];

export function PressStrip() {
  return (
    <section
      aria-label="Press about us"
      className="relative overflow-hidden border-y border-border-line bg-white py-12"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <p className="mb-8 text-center font-mono text-xs uppercase tracking-[0.3em] text-ink/70">
            As seen in
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16">
            {PRESS.map((p, i) => (
              <motion.li
                key={p.name}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  delay: i * 0.06,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group flex flex-col items-center gap-1 text-center"
              >
                <span className="font-display text-2xl text-ink/70 transition-colors duration-300 group-hover:text-gold md:text-3xl">
                  {p.name}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink/70 transition-colors duration-300 group-hover:text-gold/70">
                  {p.note}
                </span>
              </motion.li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
