"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * MarqueeBand — Ridgewells solid-color infinite marquee (WOW #2).
 *
 * Pattern source: docs/RIDGEWELLS-ANALYSIS.md §2.7, §6.4, §9 (P2.2), §10.5.
 * Ridgewells uses a 94px-tall solid-aubergine band with a single brand
 * sentence + white pill CTA. We adapt: solid bordeaux bg, the brand phrase
 * "Eastern Market • Old World Way • Made with Love" repeated infinitely, with a
 * cream pill CTA "Book Your Date" on the right (desktop).
 *
 * Implementation: duplicated track → translateX(-50%) loops seamlessly.
 * CSS-driven (.ridge-marquee-track) so it runs off the main thread.
 * Pause on hover/focus. Respects prefers-reduced-motion (static render).
 */

const PHRASE = "Eastern Market · Old World Way · Made with Love";
const SEPARATOR = "✦"; // elegant star, not a heavy bullet

function MarqueeContent({ paused = false }: { paused?: boolean }) {
  // Render enough copies to fill 2× the viewport width so the -50% translate
  // loops without a visible seam. 8 copies is safe on ultra-wide.
  const items = Array.from({ length: 8 });
  return (
    <div
      className={`ridge-marquee-track ${paused ? "" : ""}`}
      aria-hidden={paused ? undefined : "true"}
    >
      {items.map((_, i) => (
        <span
          key={i}
          className="flex items-center gap-8 whitespace-nowrap px-8 font-display text-cream"
          style={{ fontSize: "clamp(1.6rem, 3.6vw, 3rem)", lineHeight: 1 }}
        >
          <span className="italic">{PHRASE}</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="ridge-star text-gold"
            aria-hidden="true"
            style={{ flexShrink: 0, animationDelay: `${(i % 4) * 0.3}s` }}
          >
            <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.5l7.1-.6z" />
          </svg>
        </span>
      ))}
    </div>
  );
}

export function MarqueeBand() {
  const reduce = useReducedMotion();

  return (
    <section
      data-header-theme="dark"
      aria-label="Soprano's Catering slogan"
      className="section-bordeaux ridge-marquee-pause relative overflow-hidden border-y border-gold/20"
    >
      {/* Marquee track — two identical halves for seamless -50% loop.
          When reduced-motion is set, render a single static centered line. */}
      {reduce ? (
        <div className="flex items-center justify-center py-7 md:py-9">
          <span
            className="font-display italic text-cream"
            style={{ fontSize: "clamp(1.5rem, 3.2vw, 2.6rem)" }}
          >
            {PHRASE}
          </span>
        </div>
      ) : (
        <div className="relative flex items-center py-7 md:py-9">
          {/* Edge fade masks for a cinematic "appearing from nowhere" feel */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bordeaux to-transparent md:w-40" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bordeaux to-transparent md:w-40" />

          {/* The duplicated track (so -50% translate loops seamlessly) */}
          <div className="flex w-max">
            <MarqueeContent />
            <MarqueeContent />
          </div>

          {/* Floating CTA pill — desktop only, sits above the marquee on the right.
              Mobile users see the marquee text + can scroll to #contact. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-none absolute inset-y-0 right-6 z-20 hidden items-center md:flex"
          >
            <Link
              href="#contact"
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-bordeaux transition-all duration-300 hover:scale-105 hover:bg-gold hover:text-cream"
              style={{ boxShadow: "0 4px 20px rgba(255,255,255,0.18), 0 8px 30px rgba(0,0,0,0.25)" }}
            >
              Book Your Date
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      )}
    </section>
  );
}
