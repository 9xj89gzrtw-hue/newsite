"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Instagram, ArrowUpRight } from "lucide-react";

/**
 * SocialHandle — Ridgewells giant social-handle-as-section-title moment.
 *
 * Pattern source: docs/RIDGEWELLS-ANALYSIS.md §2.13, §9 (P2.3), §10.6.
 * Ridgewells dedicates a 425px section to "@RidgewellsDC" at 82px as the
 * headline, with a "FOLLOW US" eyebrow above and a brand hashtag below.
 *
 * We adapt: "@sopranoscatering" (our Instagram handle) as the giant headline,
 * "Follow Us" eyebrow, "#MadeWithLove" hashtag. Links to IG.
 *
 * Placement: right before <SiteFooter /> — closes the page on a branded,
 * memorable note (Ridgewells places it as the last content section).
 */

const EASE = [0.4, 0, 0.2, 1] as const;
const INSTAGRAM_URL = "https://www.instagram.com/nilov_catering";
const HASHTAG = "#ЕдаКакИскусство";

export function SocialHandle() {
  const reduce = useReducedMotion();

  return (
    <section
      id="social"
      data-header-theme="light"
      aria-labelledby="social-headline"
      className="section-light relative overflow-hidden bg-cream py-24 md:py-36"
    >
      {/* Subtle warm radial glow behind the handle for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(196,149,106,0.10) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Decorative thin rules above + below (Ridgewells editorial divider) */}
      <div className="ridge-rule absolute inset-x-[10%] top-12 text-ink/30" aria-hidden="true" />
      <div className="ridge-rule absolute inset-x-[10%] bottom-12 text-ink/30" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* Eyebrow — "FOLLOW US" equivalent, with IG icon */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="inline-flex items-center gap-3"
        >
          <Instagram className="size-5 text-bordeaux" aria-hidden="true" />
          <span className="eyebrow-wide text-bordeaux">Follow Us</span>
        </motion.div>

        {/* Giant handle headline — the wow moment */}
        <motion.h2
          id="social-headline"
          initial={reduce ? false : { opacity: 0, y: 32, scale: 0.97 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, delay: 0.12, ease: EASE }}
          className="giant-handle mt-8 text-ink"
        >
          <Link
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center transition-colors hover:text-bordeaux"
            aria-label="Interfood Catering в Instagram — @nilov_catering"
          >
            <span className="italic">@nilov</span>
            <span className="not-italic">catering</span>
            <ArrowUpRight
              className="ml-3 size-[0.6em] text-gold transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              aria-hidden="true"
            />
          </Link>
        </motion.h2>

        {/* Hashtag — brand tagline */}
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          className="mt-7 font-sans text-[0.9rem] font-medium uppercase tracking-[0.28em] text-ink/55 md:text-[1rem]"
        >
          {HASHTAG}
        </motion.p>

        {/* Secondary CTA — link to events gallery (keep users exploring) */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
          className="mt-10"
        >
          <Link
            href="#events"
            className="font-sans text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-ink underline-offset-[6px] transition-colors hover:text-bordeaux hover:underline"
          >
            View Event Photo Galleries
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
