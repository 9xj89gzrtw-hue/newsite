"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { MCU_HERO_VIDEO, MCU_HERO_POSTER } from "@/lib/mculinary-media";
import { PetalButton } from "./petal-button";
import { SbPressStrip } from "./sb-press-strip";

/**
 * McuVideoHero — Salt Block WOW #1 cinematic video hero (Cycle 26 restyle).
 *
 * Full-bleed autoplay muted loop video (clamp 640-880px tall) with a dark
 * gradient overlay. Cycle 26 restyle replaces the previous mculinary-era
 * multi-line italic gold headline + dual gold pill CTAs with the Salt Block
 * signature trio:
 *   1. 160px-uppercase Playfair Display H1 — `ЕДА КАК ИСКУССТВО`
 *      (rendered via `.sb-hero-title[data-tone="cream"]`, clamp 4-10rem).
 *   2. Petal-shaped primary + outline CTAs (`.sb-petal-btn`) — `dark` for
 *      the calculator, `outline data-tone="cream"` for the menu (cream so
 *      the outline reads on the dark video bg).
 *   3. Docked press strip at the hero bottom edge (`SbPressStrip` variant=
 *      `docked`) — 4-6 publication logos sitting on a gradient overlay.
 *
 * Semantically `<h2>` (the site `<header>` already owns the page `<h1>`
 * per GgHero pattern). Animation: staggered fade-in-up on eyebrow → h2 →
 * body → CTAs (0.1s steps). Uses `animate` (mount-based), not `whileInView`.
 *
 * Performance: an IntersectionObserver on the `<section>` pauses the
 * `<video>` when it scrolls out of view and resumes `play()` when it
 * re-enters (`.catch(()=>{})` guards autoplay-policy rejections).
 *
 * Accessibility: `<video aria-hidden>` (decorative — the headline carries
 * meaning), `aria-label` on the section, `preload="metadata"` + poster
 * fallback.
 *
 * Reduced motion: `useReducedMotion()` — when true, motion.* components
 * render static (no initial/animate). The video still autoplays (it's not
 * a motion animation).
 *
 * @see /docs/SALTBLOCK-ANALYSIS.md §10 (WOW moments), §9.2 (petal button)
 */

type FadeUpFn = (delay: number) => Record<string, unknown>;

export function McuVideoHero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pause video when hero scrolls out of view (perf).
  useEffect(() => {
    const el = sectionRef.current;
    const v = videoRef.current;
    if (!el || !v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().catch(() => {
            /* autoplay may be blocked by policy — poster will show */
          });
        } else {
          v.pause();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Staggered fade-in-up. When reduce → empty props (motion renders visible).
  const fadeUp: FadeUpFn = (delay) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: "easeOut" as const },
        };

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "clamp(640px, 92vh, 880px)" }}
      aria-label="Interfood Catering — премиальный кейтеринг"
    >
      <video
        ref={videoRef}
        className="mcu-hero-video"
        src={MCU_HERO_VIDEO}
        poster={MCU_HERO_POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="mcu-hero-overlay" />

      {/* Hero content — vertically centered; pb-32 reserves ~128px for the
          docked press strip at the bottom edge. */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-32 text-center text-white">
        <motion.p
          className="mcu-eyebrow-lg mb-6 font-light tracking-wide text-white/95"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
          {...fadeUp(0)}
        >
          Кейтеринг в Санкт-Петербурге с 2009 года
        </motion.p>

        {/* WOW #1 — 160px max Playfair Display uppercase H1 (.sb-hero-title). */}
        <motion.h2
          className="sb-hero-title"
          data-tone="cream"
          {...fadeUp(0.1)}
        >
          ЕДА КАК
          <br />
          ИСКУССТВО
        </motion.h2>

        <motion.p
          className="mcu-body mt-8 mb-8 max-w-xl text-base font-normal text-cream/80 md:text-lg"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
          {...fadeUp(0.2)}
        >
          Выездной кейтеринг полного цикла в Санкт-Петербурге. Свадьбы,
          банкеты, фуршеты — от 2450 ₽/чел. Создаём ритуал, а не просто меню.
        </motion.p>

        {/* WOW #2 — Petal-shaped CTAs (dark + cream outline). */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          {...fadeUp(0.3)}
        >
          <PetalButton href="#calculator" variant="dark" size="lg">
            Рассчитать стоимость
          </PetalButton>
          <PetalButton
            href="#menu"
            variant="outline"
            size="lg"
            data-tone="cream"
          >
            Смотреть меню
          </PetalButton>
        </motion.div>
      </div>

      {/* WOW #3 — Press strip docked at hero bottom edge. Must be the LAST
          child of <section> so .sb-press-strip[data-variant="docked"]
          (absolute bottom-0) sits flush against the hero bottom. */}
      <SbPressStrip variant="docked" />
    </section>
  );
}

export default McuVideoHero;
