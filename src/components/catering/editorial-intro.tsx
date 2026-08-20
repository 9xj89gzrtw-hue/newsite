"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { OutlineButton } from "./outline-button";

/**
 * EditorialIntro — Ridgewells signature "painterly bloom" intro section.
 *
 * Pattern source: docs/RIDGEWELLS-ANALYSIS.md §2.3, §3, §9 (P1.2), §10.2.
 * This is WOW moment #1: a 10-layer radial-gradient "digital watercolor"
 * background (pure CSS, zero asset weight) + editorial eyebrow + huge serif
 * headline with manual line break + centered body paragraph.
 *
 * Placed right after <Hero /> to deliver the "luxury magazine" opening
 * Ridgewells uses between their hero slideshow and the services grid.
 *
 * Adapted to our palette: Ridgewells' aubergine/magenta blooms → our
 * bordeaux/terracotta/honey (NO indigo/blue — see RULES §9).
 */

const EASE = [0.4, 0, 0.2, 1] as const;

export function EditorialIntro() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Subtle parallax on the content block + fade as it scrolls past.
  const contentY = useTransform(scrollYProgress, [0, 0.6], [40, -20]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.25, 0.85, 1], [0, 1, 1, 0.85]);

  return (
    <section
      id="intro"
      ref={ref}
      data-header-theme="dark"
      aria-labelledby="intro-headline"
      className="section-dark painterly-bg-deep painterly-drift relative overflow-hidden py-28 md:py-44"
    >
      {/* Local grain overlay — stronger than the global one, for "painterly
          texture/atmosphere" (VLM v2 critique). SVG feTurbulence, multiply blend. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "300px 300px",
        }}
      />
      {/* Deep vignette — darken edges strongly to focus the centered content
          and add "dark painterly" depth (VLM v2 critique). */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 15%, rgba(20,12,8,0.45) 65%, rgba(10,6,4,0.75) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Decorative top + bottom rules (Ridgewells editorial divider pattern) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 ridge-rule text-cream/40" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 ridge-rule text-cream/40" aria-hidden="true" />

      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative mx-auto max-w-3xl px-6 text-center"
      >
        {/* Eyebrow — wide-tracked uppercase. Use peach (#E8B889) for higher
            contrast on the dark painterly bg (VLM v2: gold too low contrast). */}
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="eyebrow-wide"
          style={{ color: "#E8B889" }}
        >
          Soprano&rsquo;s Catering. Author cuisine. Impeccable service. Unforgettable impressions.
        </motion.p>

        {/* Headline — huge Playfair, manual line break for poetic rhythm
            (Ridgewells §1.2, §9 P1.6 — "Every event has a\nstory to tell.")
            Italic accent in warm peach (brighter than gold on dark bg). */}
        <motion.h2
          id="intro-headline"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          className="display-headline-xl mt-7 tinted-headline"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}
        >
          Every event has its
          <br />
          <span className="italic" style={{ color: "#E8B889" }}>
            own story
          </span>{" "}
          at the table.
        </motion.h2>

        {/* Lead paragraph — Ridgewells uses 18px Gotham Book, lh 1.4 */}
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
          className="mx-auto mt-9 max-w-xl text-[1.05rem] leading-[1.6] text-cream/90 md:text-[1.15rem]"
        >
          Soprano&rsquo;s Catering is a Michigan family that turns every event into
          a celebration of the table. Hand-picked seasonal produce, our chefs&rsquo;
          hands, and the magic of catering — from a reception for 20 to a banquet for 500.
        </motion.p>

        {/* Dual CTA — Ridgewells uses two outline buttons (INQUIRE + ORDER).
           We mirror with "View Menu" + "Get a Quote". */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4 text-cream"
        >
          <OutlineButton href="#menu" variant="dark">
            View Menu
          </OutlineButton>
          <OutlineButton href="#calculator" variant="dark" icon={false}>
            Get a Quote
          </OutlineButton>
        </motion.div>

        {/* Floating decorative gold dot — subtle "alive" accent */}
        <motion.span
          className="pointer-events-none absolute -right-2 top-1/2 hidden size-2 rounded-full bg-gold/70 md:block"
          aria-hidden="true"
          animate={reduce ? undefined : { opacity: [0.3, 0.9, 0.3], scale: [1, 1.4, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
