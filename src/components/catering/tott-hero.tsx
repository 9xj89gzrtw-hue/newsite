"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";

/**
 * TottHero — Talk of the Town (talkofthetownatlanta.com) hero graft (Cycle 30).
 *
 * Reproduces their Slider-Revolution full-bleed hero composition:
 *   - Full-viewport background VIDEO (their site uses a static photo — we
 *     upgrade to cinematic motion per the task brief: "вместо их фотки хедера
 *     вставить скопированную фотку с другого сайта в классном качестве или
 *     видео". Source: /media/mculinary/mculinary-hero.mp4 — already in-repo,
 *     1280×720 28s loop of real plated food (crostini with cream cheese,
 *     chutney, microgreens). Poster fallback: /media/hero-premium/hero-premium-6.jpg
 *     (Unsplash candlelit wedding dinner, deep bokeh).
 *   - Layered dark gradient overlay so the centered white wordmark reads.
 *   - 5px white border decorative frame inset (their SR7 border shape —
 *     `.tott-border-frame` utility).
 *   - Centered stack:
 *       • eyebrow "INTERFOOD CATERING" (Lato, tracked)
 *       • wordmark "Interfood." (Prata — their display font, Latin-only)
 *       • script accent "food as art" (Nothing You Could Do — their hero
 *         overlay script font; English because the face is Latin-only)
 *       • RU subhead "Еда как искусство — выездной кейтеринг полного цикла"
 *   - Bottom locations strip "САНКТ-ПЕТЕРБУРГ | МОСКВА | ВСЯ РОССИЯ".
 *   - Scroll cue bottom-center (animated line + "SCROLL" eyebrow).
 *
 * Animation: framer-motion staggered reveal (opacity + 40px rise, 0.8s ease),
 * respecting `useReducedMotion()` + SSR mount gate (no hydration mismatch).
 * The SiteHeader docks at the BOTTOM of this hero (100vh) via its own scroll
 * logic — see site-header.tsx. Hence `min-h-screen` so the bottom-docked nav
 * aligns to the hero's bottom edge.
 *
 * @see docs/talkofthetown-MINED-EXTRACTION.md (hero section)
 */
const HERO_VIDEO = "/media/mculinary/mculinary-hero.mp4";
const HERO_POSTER = "/media/hero-premium/hero-premium-6.jpg";

export function TottHero() {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const showStatic = mounted && Boolean(reduce);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
  };
  const rise = showStatic
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0, y: 36 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: "easeOut" as const } },
      };
  const fade = showStatic
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.7, ease: "easeOut" as const } },
      };

  return (
    <section
      id="hero"
      data-header-theme="transparent"
      aria-label="Interfood Catering — премиальный кейтеринг"
      className="relative min-h-screen w-full overflow-hidden bg-black"
    >
      {/* Background image — LCP priority (next/image). Sits at z-0 and acts
          as the video poster (the video overlays it once playing). */}
      <Image
        src={HERO_POSTER}
        alt="Премиальный банкетный стол — кейтеринг Interfood"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 z-0 size-full object-cover"
      />

      {/* Background video — cinematic motion (replaces talkofthetown's static
          hero photo per task brief). Overlays the poster image (z-10) once it
          begins playing. object-cover fills viewport; muted + playsInline for
          autoplay + iOS compliance. */}
      <video
        className="absolute inset-0 z-[1] size-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      {/* Layered overlays: center-weighted darkening so the white wordmark
          reads against any video frame, plus a bottom gradient so the
          bottom-docked nav (cream bg when scrolled) blends. */}
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-b from-black/55 via-black/25 to-black/65"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.35)_70%,rgba(0,0,0,0.6)_100%)]"
        aria-hidden="true"
      />

      {/* 5px white border decorative frame — talkofthetown SR7 signature. */}
      <span className="tott-border-frame z-[3]" aria-hidden="true" />

      {/* Centered brand stack. */}
      <motion.div
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center"
        initial={showStatic ? false : "hidden"}
        animate={showStatic ? undefined : "visible"}
        variants={container}
      >
        <motion.p
          variants={fade}
          className="tott-body text-[11px] font-bold uppercase tracking-[0.4em] text-white/85 sm:text-[13px]"
        >
          Interfood Catering
        </motion.p>

        {/* Wordmark — Prata (their display serif). Gold dot = Interfood brand
            signature (kept across all cycles). */}
        <motion.h1
          variants={rise}
          className="tott-display mt-4 text-white"
          style={{ fontSize: "clamp(3.5rem, 11vw, 9rem)", lineHeight: 0.92, letterSpacing: "-0.01em" }}
        >
          Interfood<span style={{ color: "var(--gold)" }}>.</span>
        </motion.h1>

        {/* Script accent — Nothing You Could Do (their hero overlay font).
            English phrase because the face is Latin-only. */}
        <motion.p
          variants={rise}
          className="tott-script mt-2 text-white/95"
          style={{ fontSize: "clamp(2.2rem, 6vw, 4.2rem)", lineHeight: 1 }}
        >
          food as art
        </motion.p>

        {/* RU subhead — Lato (their body font, has Cyrillic). */}
        <motion.p
          variants={rise}
          className="tott-body mt-7 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg"
        >
          Еда как искусство — выездной кейтеринг полного цикла в Санкт-Петербурге.
          Фуршет, банкет, кофе-брейк от 2450&#8381;/чел.
        </motion.p>

        {/* Locations strip — mirrors their "ATLANTA" hero footer. */}
        <motion.p
          variants={fade}
          className="tott-body mt-8 text-[12px] font-bold uppercase tracking-[0.3em] text-white/70 sm:text-sm"
        >
          Санкт-Петербург
          <span className="mx-3 text-white/30" aria-hidden="true">|</span>
          Москва
          <span className="mx-3 text-white/30" aria-hidden="true">|</span>
          Вся Россия
        </motion.p>
      </motion.div>

      {/* Scroll cue bottom-center (sits above the docked nav). */}
      <motion.div
        className="absolute bottom-28 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        initial={showStatic ? false : { opacity: 0 }}
        animate={showStatic ? undefined : { opacity: 1, transition: { delay: 1.3, duration: 0.8 } }}
        aria-hidden="true"
      >
        <span className="tott-body text-[10px] font-bold uppercase tracking-[0.35em] text-white/60">
          Scroll
        </span>
        {showStatic ? (
          <span className="block h-[54px] w-px bg-white/40" />
        ) : (
          <motion.span
            className="block w-px bg-white/40"
            style={{ height: 54, transformOrigin: "top" }}
            animate={{ scaleY: [0.4, 1, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
          />
        )}
      </motion.div>
    </section>
  );
}

export default TottHero;
