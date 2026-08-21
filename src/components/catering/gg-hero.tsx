"use client";

/**
 * GgHero — ggcatering.com hero pattern adapted to Interfood (Russian content,
 * real catering imagery from /public/media/).
 *
 * Replicates the signature ggcatering.com wow effect:
 *   1. Multi-tile asymmetric image collage on a 10×10 grid (5 image tiles in
 *      corners/sides + 3 decorative SVG shapes — lime circle, yellow triangle,
 *      blush zigzag — filling the gaps).
 *   2. A massive Poppins semibold headline stacked over 3 lines:
 *        Line 1 — "Кейтеринг"   (left-aligned)
 *        Line 2 — "с"           (right-aligned, ml-auto)
 *        Line 3 — rotating word (mr-auto, italic + lime colour) cycling
 *                 through synonyms every ~2.2s via AnimatePresence (vertical
 *                 translateY carousel, transform-only — respects reduced
 *                 motion).
 *   3. A tagline eyebrow + 2 pill CTAs (primary "Рассчитать стоимость" +
 *      ghost "Смотреть видео").
 *   4. A bottom scroll cue with an animated chevron.
 *
 * Layout convention: child of <main className="flex min-h-screen flex-col
 * bg-cream">. Section itself paints solid white (bg-white) and is full-height
 * (min-h-screen). Foreground content sits on z-10 above the z-0 collage so
 * the headline reads cleanly while image tiles peek out from behind.
 *
 * Conventions followed:
 *   - motion/react (NOT framer-motion) — see src/components/motion/reveal.tsx
 *   - next/image with fill + required alt — never raw <img>
 *   - .gg-* CSS classes from globals.css "Cycle 22" module
 *   - prefers-reduced-motion handled via useReducedMotion()
 *   - Decorative SVGs marked aria-hidden; section has descriptive aria-label
 *   - Semantic <h2> (the site <header> already owns <h1>)
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/** Rotating synonyms for the third headline line.
 *  All instrumental-case Russian words that grammatically follow "с"
 *  ("Кейтеринг с ..."). The first one is uppercase to echo ggcatering's
 *  initial "Twist" emphasis — the rest are sentence case for variety. */
const ROTATING_WORDS: string[] = [
  "ИЗЮМИНКОЙ",
  "шиком",
  "размахом",
  "вкусом",
  "классом",
  "душой",
  "огоньком",
  "стилем",
  "смыслом",
  "страстью",
];

// Static headline fragment (line 1 of the hero). Line 2 is composed of the
// preposition "с" + a rotating emphasis word — see GgRotatingText below.
const STATIC_HEADLINE_LINE = "Кейтеринг";

type CollageTile = {
  src: string;
  alt: string;
  /** Tailwind grid placement classes (col-start/span + row-start/span). */
  grid: string;
  /** Stagger delay (s) for the scale-fade enter animation. */
  delay: number;
};

/** 5 asymmetric image tiles placed around the centre of the 10×10 grid so
 *  the centre stays clear for the headline. Mirrors ggcatering's layout
 *  (top-centre / mid-left / right-portrait / bottom-left / bottom-centre). */
const IMAGE_TILES: CollageTile[] = [
  {
    src: "/media/concorde-avo-toast.jpg",
    alt: "Тост с авокадо — кейтеринг Interfood",
    grid: "col-start-5 col-span-2 row-start-1 row-span-2",
    delay: 0.1,
  },
  {
    src: "/media/concorde-dessert.jpg",
    alt: "Десерт — кейтеринг Interfood",
    grid: "col-start-1 col-span-3 row-start-4 row-span-3",
    delay: 0.2,
  },
  {
    src: "/media/gamma-table-birds-eye.webp",
    alt: "Банкетный стол сверху — кейтеринг Interfood",
    grid: "col-start-8 col-span-2 row-start-3 row-span-4",
    delay: 0.3,
  },
  {
    src: "/media/snack-1.jpg",
    alt: "Снек-бокс — кейтеринг Interfood",
    grid: "col-start-1 col-span-2 row-start-8 row-span-3",
    delay: 0.4,
  },
  {
    src: "/media/ridgewells-scallops.jpg",
    alt: "Морские гребешки — кейтеринг Interfood",
    grid: "col-start-5 col-span-3 row-start-8 row-span-3",
    delay: 0.5,
  },
];

/* ------------------------------------------------------------------ */
/* GgRotatingText — vertical carousel of synonyms (transform-only)     */
/* ------------------------------------------------------------------ */

function GgRotatingText({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return; // static — no carousel under reduced motion
    const id = setInterval(
      () => setIdx((i) => (i + 1) % words.length),
      2200,
    );
    return () => clearInterval(id);
  }, [reduce, words.length]);

  return (
    <span className="gg-rotating-text-wrap gg-italic text-[var(--gg-lime)]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[idx]}
          initial={reduce ? false : { y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="gg-rotating-text-track block"
        >
          {words[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Decorative SVG shapes                                               */
/* ------------------------------------------------------------------ */

/** Lime filled circle — top-right of the collage. */
function LimeCircleShape() {
  return (
    <motion.svg
      viewBox="0 0 128 128"
      className="h-16 w-16 text-[var(--gg-lime)] md:h-20 md:w-20"
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="64" cy="64" r="64" fill="currentColor" />
    </motion.svg>
  );
}

/** Light-yellow right-triangle — bottom-right of the collage. */
function YellowTriangleShape() {
  return (
    <motion.svg
      viewBox="0 0 256 221"
      className="h-24 w-24 text-[var(--gg-light-yellow)] md:h-32 md:w-32"
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 0L256 221H0L0 0Z" fill="currentColor" />
    </motion.svg>
  );
}

/** Blush zigzag/chevron path — middle-bottom gap of the collage. */
function BlushZigzagShape() {
  return (
    <motion.svg
      viewBox="0 0 471 408"
      className="h-20 w-20 md:h-24 md:w-24"
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#FCE4E4"
        d="m0 0 235.986 203.938H0V0ZM235.014 203.938 471 407.876H235.014V203.938Z"
      />
    </motion.svg>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function GgHero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="gg-hero"
      data-enter="hero"
      data-header-theme="light"
      aria-label="Кейтеринг Interfood — кейтеринг с изюминкой"
      className="gg-poppins relative w-full min-h-screen overflow-hidden bg-white py-16 text-[var(--gg-charcoal-dark)] lg:py-20"
    >
      {/* ─── Background collage (10×10 grid) ────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 grid grid-cols-10 grid-rows-10 opacity-90"
      >
        {/* Lime circle — top-right corner gap */}
        <div className="col-start-9 col-span-2 row-start-1 row-span-2 flex items-center justify-center">
          <LimeCircleShape />
        </div>

        {/* 5 image tiles placed asymmetrically around the centre */}
        {IMAGE_TILES.map((tile) => (
          <motion.div
            key={tile.src}
            className={`gg-collage-cell relative overflow-hidden ${tile.grid}`}
            initial={reduce ? false : { opacity: 0, scale: 1.08 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 1.2,
              delay: tile.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Image
              src={tile.src}
              alt={tile.alt}
              fill
              sizes="20vw"
              className="h-full w-full object-cover"
            />
          </motion.div>
        ))}

        {/* Blush zigzag — middle-bottom-left gap (between tiles 4 & 5) */}
        <div className="col-start-3 col-span-2 row-start-7 row-span-2 flex items-center justify-center">
          <BlushZigzagShape />
        </div>

        {/* Yellow triangle — bottom-right corner */}
        <div className="col-start-9 col-span-2 row-start-9 row-span-2 flex items-end justify-end">
          <YellowTriangleShape />
        </div>
      </div>

      {/* ─── Foreground headline + CTAs ─────────────────────────────── */}
      {/* Radial gradient backdrop creates a soft "spotlight" behind the
          headline so the dark text remains readable over the busy image
          collage — keeps the ggcatering wow-effect of overlap without
          sacrificing legibility. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0) 75%)",
        }}
      />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h2 className="gg-hero-headline flex flex-col items-center md:py-12">
          {/* Line 1: "Кейтеринг" (centered) */}
          <motion.span
            className="block"
            initial={reduce ? false : { y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="block">Кейтеринг</span>
          </motion.span>

          {/* Line 2: "с [rotating word]" — combined so the preposition is not isolated */}
          <motion.span
            className="block"
            initial={reduce ? false : { y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-baseline gap-[0.18em]">
              <span>с</span>
              <GgRotatingText words={ROTATING_WORDS} />
              {/* Screen-reader-only static text — full sentence so SR users
                  don't hear "Кейтеринг с [changing word]" spam. */}
              <span className="sr-only">изюминкой</span>
            </span>
          </motion.span>
        </h2>

        {/* Tagline eyebrow */}
        <motion.p
          className="gg-tagline mt-8"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            delay: 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          Выездной кейтеринг полного цикла в Санкт-Петербурге
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="mt-12 flex flex-wrap justify-center gap-4"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            delay: 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <a className="gg-btn gg-btn-primary" href="#calculator">
            Рассчитать стоимость
          </a>
          <a className="gg-btn gg-btn-ghost" href="#video">
            Смотреть видео
          </a>
        </motion.div>
      </div>

      {/* ─── Scroll cue (bottom-centre) ─────────────────────────────── */}
      <motion.div
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[var(--gg-ash)]"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      >
        <span className="gg-tagline">Листайте</span>
        <motion.div
          animate={reduce ? undefined : { y: [0, 8, 0] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default GgHero;
