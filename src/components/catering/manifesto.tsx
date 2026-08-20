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
 * Manifesto — the signature scroll moment: «Manifesto-as-Window» (LIGHT THEME).
 *
 * A pinned ~250vh section where:
 *   1. A giant Playfair Display word «LOVE» fills the viewport, its letters
 *      filled with a slow Ken-Burns food photo (SVG clipPath).
 *   2. Three dish-image layers crossfade through the word as the user scrolls
 *      (Task 2-b §4): dish-1 → dish-2 → dish-3 over [0, 0.66] of scroll progress.
 *   3. Beneath it, a one-sentence brand manifesto colorizes word-by-word from
 *      soft to full opacity. Each word also gets a 1px bordeaux underline that
 *      draws in left-to-right (scaleX 0 → 1) synced with the colorize transform.
 *   4. The section background eases from deep ink (#0E0D0B) to cream (#FAF8F5)
 *      over the second half via a stacked cream-overlay div.
 *   5. After the pinned scroll-space ends, a 50vh chapter-divider gradient
 *      (cream→charcoal→cream) bridges the manifesto into the next section,
 *      using stacked-opacity divs (NOT framer-motion backgroundColor interpolation,
 *      per AGENTS.md §12 gotcha #4).
 */

const MANIFESTO_IMG = "/media/event-12.jpg";
const MANIFESTO_IMG_ALT = "Праздничная сервировка банкетного стола — Interfood Catering";

// Three dish photos that crossfade through the «LOVE» letters as the user scrolls.
// Layer 1 is visible at the start; layer 2 peaks at 33% scroll; layer 3 settles
// in by 66% and stays visible through the end of the pinned section.
// NOTE: skipped /media/menu-bbq.jpg because that file is actually an HTML 404
// page (file extension is .jpg but content is text/html — would fail to render
// as an SVG <image>). Using /media/event-06.jpg (Scandinavian BBQ) instead.
const MANIFESTO_DISHES = [
  { src: "/media/concorde-handhelds.jpg", alt: "Фуршетная линия — Interfood Catering" },
  { src: "/media/concorde-boardroom.webp", alt: "Сервировка банкетного стола — Interfood Catering" },
  { src: "/media/event-06.jpg", alt: "Барбекю на природе — Interfood Catering" },
] as const;

// Single poetic line, split into words for scroll-colorize + underline draw-in.
const MANIFESTO_WORDS =
  "Кулинарное новаторство и безупречный сервис — краеугольный камень Interfood Catering. Мы стремимся строить долгосрочные отношения на основе личного сервиса и исключительного качества.".split(
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

  // The «LOVE» word-as-window animation values
  const wordOpacity = useTransform(
    scrollYProgress,
    [0.0, 0.12, 0.96],
    [0, 1, 1],
  );
  const wordScale = useTransform(scrollYProgress, [0.05, 0.5], [1.12, 1.0]);
  const wordY = useTransform(scrollYProgress, [0.05, 0.5], [40, 0]);

  // Photo behind the word (faint depth layer, separate from the 3 dish layers).
  const photoOpacity = useTransform(
    scrollYProgress,
    [0.35, 0.7, 0.98],
    [0, 0.3, 0.5],
  );

  // Three-dish crossfade opacities (Task 2-b §4). Each layer is clipped by
  // the existing #manifesto-pir-clip SVG clipPath so the dishes appear
  // INSIDE the «LOVE» letters. Together they create a continuous dish-morph:
  //   layer 1: [0, 0.33] → [1, 0] (visible at start, fades out)
  //   layer 2: [0, 0.33, 0.66] → [0, 1, 0] (fades in to peak at 33%, fades out by 66%)
  //   layer 3: [0.33, 0.66] → [0, 1] (fades in by 66%, stays at 1 through end)
  // Reduced-motion: all three layers get opacity 1 (final state — dish 3 visible).
  const dish1Opacity = useTransform(scrollYProgress, [0, 0.33], [1, 0]);
  const dish2Opacity = useTransform(scrollYProgress, [0, 0.33, 0.66], [0, 1, 0]);
  const dish3Opacity = useTransform(scrollYProgress, [0.33, 0.66], [0, 1]);
  const dishOpacities = [dish1Opacity, dish2Opacity, dish3Opacity];

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
        data-header-theme="light"
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
            LOVE
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
      data-header-theme="dark"
      className="section-dark relative bg-[#0E0D0B]"
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
            <div className="absolute inset-0 bg-[#0E0D0B]/50" />
          </motion.div>

          {/* Eyebrow — gold accent for light theme */}
          <motion.span
            style={{ opacity: eyebrowOpacity }}
            className="absolute left-1/2 top-[14vh] -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.5em] text-gold/60 md:text-xs"
          >
            03 · Манифест
          </motion.span>

          {/* sr-only heading for document outline / screen readers */}
          <h2 className="sr-only">Сделано с любовью — Манифест Interfood Catering</h2>

          {/* The word-as-window: «LOVE» as SVG with multi-dish crossfade layers (Task 2-b §4). */}
          <motion.div
            style={{ opacity: wordOpacity, scale: wordScale, y: wordY }}
            className="relative flex w-full items-center justify-center px-4"
            aria-label="Любовь"
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
                    LOVE
                  </text>
                </clipPath>
              </defs>
              {/* The original background food photo, clipped to the LOVE glyphs. */}
              <image
                href={MANIFESTO_IMG}
                x="0"
                y="0"
                width="1000"
                height="360"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#manifesto-pir-clip)"
              />
              {/*
                Three-dish crossfade layers (Task 2-b §4) — each clipped by the
                same #manifesto-pir-clip so the dishes appear INSIDE the LOVE letters.
                Opacity is driven by per-layer MotionValues attached to each
                <motion.image> via the style prop. Together they create a
                continuous dish-morph as the user scrolls.
              */}
              {MANIFESTO_DISHES.map((dish, i) => (
                <motion.image
                  key={dish.src}
                  href={dish.src}
                  x="0"
                  y="0"
                  width="1000"
                  height="360"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath="url(#manifesto-pir-clip)"
                  style={{ opacity: dishOpacities[i] }}
                />
              ))}
            </svg>
          </motion.div>

          {/* The colorizing Manifesto line — each word also draws an underline (Task 2-b §4). */}
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
            Дальше — меню →
          </motion.span>
        </div>
      </div>

      {/*
        Chapter-divider hand-off zone (Task 2-b §4) — 50vh gradient that eases
        cream → charcoal → cream as a "breath" between manifesto and the next
        section. Implemented as stacked-opacity divs (NOT framer-motion
        backgroundColor interpolation per AGENTS.md §12 gotcha #4):
          - bg-cream base layer (always full opacity)
          - bg-ink overlay with vertical CSS mask that creates the
            transparent → opaque → transparent fade from top to bottom
        The mask itself is a CSS linear-gradient (composited by the browser),
        so no useTransform/color interpolation is involved. Reduced-motion sees
        the same static gradient (mask is not motion-driven).
      */}
      <div
        aria-hidden="true"
        className="relative h-[50vh] overflow-hidden bg-cream"
      >
        <div
          className="absolute inset-0 bg-ink"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 50%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 50%, transparent 100%)",
          }}
        />
      </div>
    </section>
  );
}

/**
 * ManifestoWord — a single word that colorizes from soft → full opacity
 * across its own slice of the scroll progress, and draws a 1px bordeaux
 * underline (scaleX 0 → 1, transform-origin: left) synced with the colorize.
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
  // Underline draw-in: scaleX 0 → 1, same input range as the colorize.
  // transform-origin: left so the line draws from left to right.
  const underlineScaleX = useTransform(progress, [start, end], [0, 1]);

  return (
    <span className="mr-[0.25em] inline-block">
      <motion.span style={{ opacity, color }}>{word}</motion.span>
      {/* 1px bordeaux underline, drawn in left-to-right with the colorize. */}
      <motion.span
        aria-hidden="true"
        className="block h-px bg-bordeaux"
        style={{
          scaleX: underlineScaleX,
          transformOrigin: "left",
        }}
      />
    </span>
  );
}
