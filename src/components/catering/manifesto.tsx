"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

/**
 * Manifesto — the signature scroll moment: «Манифест-as-Window» (LIGHT THEME).
 *
 * A pinned ~250vh section where:
 *   1. A giant Playfair Display word «ПИР» fills the viewport, its letters
 *      filled with a slow Ken-Burns food photo (background-clip: text).
 *   2. As the user scrolls, the word fades/slides in and a clip-mask reveals
 *      it top-to-bottom.
 *   3. Beneath it, a one-sentence brand manifesto colorizes word-by-word from
 *      soft to full opacity, locked to scroll progress.
 *   4. The section background eases from warm charcoal (#2D2A26) to cream (#FAF8F5)
 *      over the second half — "chapter" transition into #menu.
 *
 * LIGHT THEME ADAPTATION:
 * - Dark warm base instead of pure black
 * - Gold accent for eyebrow text
 * - Cream overlay transition
 */

const MANIFESTO_IMG = "/media/event-12.jpg";
const MANIFESTO_IMG_ALT = "Праздничная сервировка банкета — Interfood Catering";

// Single poetic line, split into words for scroll-colorize.
const MANIFESTO_WORDS =
  "Пир начинается задолго до первой подачи — с рук повара, с сезона, с тишины перед застольем".split(
    " ",
  );

export function Manifesto() {
  const containerRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Section background: warm dark base + cream overlay that fades in at the end.
  const creamOverlayOpacity = useTransform(
    scrollYProgress,
    [0.82, 0.98],
    [0, 1],
  );

  // The «ПИР» word-as-window animation values
  const wordOpacity = useTransform(
    scrollYProgress,
    [0.0, 0.12, 0.96],
    [0, 1, 1],
  );
  const wordScale = useTransform(scrollYProgress, [0.05, 0.5], [1.12, 1.0]);
  const wordY = useTransform(scrollYProgress, [0.05, 0.5], [40, 0]);

  // Photo behind the word
  const photoOpacity = useTransform(
    scrollYProgress,
    [0.35, 0.7, 0.98],
    [0, 0.3, 0.5],
  );

  // Eyebrow + subline
  const eyebrowOpacity = useTransform(
    scrollYProgress,
    [0.0, 0.1, 0.85],
    [0, 1, 0.6],
  );
  const sublineOpacity = useTransform(
    scrollYProgress,
    [0.9, 0.98],
    [0, 1],
  );

  // Paragraph fades out as palette flips
  const paragraphOpacity = useTransform(
    scrollYProgress,
    [0, 0.78, 0.9],
    [1, 1, 0],
  );

  // Reduced-motion: static final state.
  if (reduce) {
    return (
      <section
        id="manifesto"
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream py-24"
      >
        <div className="relative z-10 px-6 text-center">
          <h2
            className="font-display gradient-text"
            style={{
              fontSize: "clamp(5rem, 26vw, 18rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.03em",
            }}
          >
            ПИР
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-ink/70">
            {MANIFESTO_WORDS.join(" ")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="manifesto"
      ref={containerRef}
      className="relative bg-[#2D2A26]"
    >
      {/* Scroll space — 250vh gives ~150vh of pinned scroll-play. */}
      <div className="h-[250vh]">
        {/* Pinned viewport-height stage. */}
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          {/* Cream overlay — fades in at the end (chapter transition). */}
          <motion.div
            style={{ opacity: creamOverlayOpacity }}
            className="pointer-events-none absolute inset-0 bg-[#FAF8F5]"
            aria-hidden="true"
          />

          {/* Subtle photo behind the word (faint, for depth). */}
          <motion.div
            style={{ opacity: photoOpacity }}
            className="pointer-events-none absolute inset-0"
          >
            <Image
              src={MANIFESTO_IMG}
              alt={MANIFESTO_IMG_ALT}
              fill
              sizes="100vw"
              className="object-cover kenburns-slow"
            />
            <div className="absolute inset-0 bg-[#2D2A26]/50" />
          </motion.div>

          {/* Eyebrow — gold accent for light theme */}
          <motion.span
            style={{ opacity: eyebrowOpacity }}
            className="absolute left-1/2 top-[14vh] -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.5em] text-gold/60 md:text-xs"
          >
            03 · Манифест
          </motion.span>

          {/* sr-only heading for document outline / screen readers */}
          <h2 className="sr-only">Пир — манифест Interfood Catering</h2>

          {/* The word-as-window: «ПИР» as SVG */}
          <motion.div
            style={{ opacity: wordOpacity, scale: wordScale, y: wordY }}
            className="relative flex w-full items-center justify-center px-4"
            aria-label="Пир"
            role="img"
          >
            <svg
              viewBox="0 0 1000 360"
              preserveAspectRatio="xMidYMid meet"
              className="h-auto w-full max-w-[92vw]"
              aria-hidden="true"
            >
              <defs>
                <clipPath id="manifesto-pir-clip">
                  <text
                    x="500"
                    y="280"
                    textAnchor="middle"
                    className="font-display"
                    style={{
                      fontSize: "300px",
                      fontWeight: 500,
                      letterSpacing: "-10px",
                    }}
                  >
                    ПИР
                  </text>
                </clipPath>
              </defs>
              {/* The food photo, clipped to the ПИР glyphs */}
              <image
                href={MANIFESTO_IMG}
                x="0"
                y="0"
                width="1000"
                height="360"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#manifesto-pir-clip)"
              />
            </svg>
          </motion.div>

          {/* The colorizing manifesto line */}
          <motion.div
            style={{ opacity: paragraphOpacity }}
            className="absolute bottom-[14vh] left-1/2 max-w-3xl -translate-x-1/2 px-6 text-center"
          >
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.1rem, 2.4vw, 1.85rem)",
                lineHeight: 1.4,
                fontStyle: "italic",
              }}
            >
              {MANIFESTO_WORDS.map((w, i) => (
                <ManifestoWord
                  key={i}
                  word={w}
                  index={i}
                  total={MANIFESTO_WORDS.length}
                  progress={scrollYProgress}
                />
              ))}
            </p>
          </motion.div>

          {/* Closing subline — appears as palette flips to cream. */}
          <motion.span
            style={{ opacity: sublineOpacity }}
            className="absolute bottom-[6vh] left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.4em] text-gold/60 md:text-xs"
          >
            Переходим к меню →
          </motion.span>
        </div>
      </div>
    </section>
  );
}

/**
 * ManifestoWord — a single word that colorizes from soft → full opacity
 * across its own slice of the scroll progress.
 */
function ManifestoWord({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  // Word colorize happens in the [0.15, 0.6] band, staggered per word.
  const start = 0.15 + (index / total) * 0.4;
  const end = start + 0.12;
  const opacity = useTransform(progress, [start, end], [0.15, 1]);
  // Warm cream color progression
  const color = useTransform(progress, [start, end], [
    "rgba(250,248,245,0.15)",
    "rgba(250,248,245,1)",
  ]);

  return (
    <motion.span style={{ opacity, color }} className="mr-[0.25em] inline-block">
      {word}
    </motion.span>
  );
}
