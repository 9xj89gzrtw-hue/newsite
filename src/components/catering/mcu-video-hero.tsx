"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { MCU_HERO_VIDEO, MCU_HERO_POSTER } from "@/lib/mculinary-media";

/**
 * McuVideoHero — mculinary WOW #1 cinematic video hero.
 *
 * Full-bleed autoplay muted loop video (clamp 560-765px tall) with a dark
 * gradient overlay, eyebrow + oversized two-line serif headline (visually
 * `mcu-h1`, semantically `<h2>` — the site `<header>` already owns the
 * page `<h1>` per GgHero pattern), supporting body line, and two CTAs
 * (gold solid + gold-outline pill).
 *
 * Animation: staggered fade-in-up on eyebrow → h2 → body → CTAs (0.1s
 * steps). Uses `animate` (mount-based), not `whileInView` — the hero is
 * above the fold.
 *
 * Performance: an IntersectionObserver on the `<section>` pauses the
 * `<video>` when it scrolls out of view and resumes `play()` when it
 * re-enters (`.catch(()=>{})` guards autoplay-policy rejections).
 *
 * Accessibility: `<video aria-hidden>` (decorative — the headline carries
 * meaning), `<h2>` for the headline (avoids duplicate `<h1>`), `aria-label`
 * on the section, `preload="metadata"` + `poster` fallback.
 *
 * Reduced motion: `useReducedMotion()` — when true, motion.* components
 * render static (no initial/animate). The video still autoplays (it's not
 * a motion animation — and mculinary's reference also keeps the video
 * under reduced-motion; the reduced-motion media query in globals.css
 * only disables the marquee + reveal transitions, not the hero video).
 *
 * @see /docs/reference-library/mculinary/MCULINARY-ANALYSIS.md §5 §3, §7 wow #1 #2
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
      style={{ height: "clamp(560px, 85vh, 765px)" }}
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

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <motion.p
          className="mcu-eyebrow-lg mb-6 font-light tracking-wide text-white/95"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
          {...fadeUp(0)}
        >
          Кейтеринг в Санкт-Петербурге с 2009 года
        </motion.p>

        <motion.h2
          className="mcu-h1 text-white"
          style={{ textShadow: "0 4px 32px rgba(0,0,0,0.45), 0 1px 4px rgba(0,0,0,0.4)" }}
          {...fadeUp(0.1)}
        >
          Еда как
          <br />
          <span
            className="italic"
            style={{
              color: "var(--mcu-gold)",
              textShadow:
                "0 4px 32px rgba(0,0,0,0.5), 0 0 28px rgba(175,148,105,0.45)",
            }}
          >
            искусство
          </span>
        </motion.h2>

        <motion.p
          className="mcu-body mt-8 max-w-xl font-normal text-white/90"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
          {...fadeUp(0.2)}
        >
          Премиальный кейтеринг для свадеб, корпоративов и крупных событий. От
          дегустации до последнего гостя — безупречно.
        </motion.p>

        <motion.div
          className="mt-12 flex flex-wrap items-center justify-center gap-5"
          {...fadeUp(0.3)}
        >
          <a href="#calculator" className="mcu-btn-gold">
            Рассчитать стоимость
          </a>
          <a href="#contact" className="mcu-btn-pill">
            Связаться с нами
          </a>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/70">
        <ChevronDown className="h-6 w-6 animate-bounce" aria-hidden="true" />
      </div>
    </section>
  );
}

export default McuVideoHero;
