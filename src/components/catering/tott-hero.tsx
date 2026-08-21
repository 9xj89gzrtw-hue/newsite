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
 *   - TOP-LEFT script accent (Nothing You Could Do) — mirrors their hero
 *     top-left script overlay ("bacon & bluecheese tartlet"). Ours:
 *     "food as art" — the Interfood brand tagline in their script font.
 *   - Centered stack: wordmark "Interfood." (Prata) + subtitle
 *     "лучший кейтеринг Санкт-Петербурга" (Lato, tracked uppercase).
 *   - Scroll cue bottom-center (animated line + "SCROLL" eyebrow).
 *   - NO cities strip, NO long subhead (per task v2: лишняя информация
 *     и города там не нужны).
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

      {/* CENTERED brand stack — per task v10: 3 lines, shifted DOWN for
          better optical balance (translateY +60px instead of -40px), "food
          as art" made larger, and the eyebrow label wraps cleanly on mobile
          ("Лучший кейтеринг" / "Санкт-Петербурга") via an explicit <br> that
          only shows on small screens (hidden sm:inline).
          Composition:
            1. "Interfood." — massive high-contrast serif (Prata), gold dot
            2. "food as art" — handwritten script (Nothing You Could Do),
               nestled tight below the wordmark (negative margin, signature)
            3. "ЛУЧШИЙ КЕЙТЕРИНГ" / "САНКТ-ПЕТЕРБУРГА" — small uppercase
               tracked sans-serif eyebrow (Lato via Karla Cyrillic fallback),
               wraps to 2 lines on mobile (break after "кейтеринг"), single
               line on sm+ screens. Generous editorial whitespace below the
               script pair.
          Text-shadow on white text for video-bg legibility. */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center [transform:translateY(60px)]"
        initial={showStatic ? false : "hidden"}
        animate={showStatic ? undefined : "visible"}
        variants={container}
      >
        {/* Wordmark — Prata (high-contrast serif). Gold dot accent. Massive,
            dominates the viewport. */}
        <motion.h1
          variants={rise}
          className="tott-display text-white"
          style={{
            fontSize: "clamp(3.5rem, 13vw, 9.5rem)",
            lineHeight: 0.92,
            letterSpacing: "-0.02em",
            textShadow: "0 2px 30px rgba(0,0,0,0.45)",
          }}
        >
          Interfood<span style={{ color: "var(--gold)", marginLeft: "0.05em" }}>.</span>
        </motion.h1>

        {/* Script tagline — Nothing You Could Do. Nestles tight under the
            wordmark (negative mt) for a signature/underline feel. Per task
            v10: "сделай food as art побольше" — bumped from clamp(1.75rem,
            4.5vw, 3.5rem) to clamp(3rem, 8vw, 6rem). */}
        <motion.p
          variants={rise}
          className="tott-script text-white/95"
          style={{
            fontSize: "clamp(3rem, 8vw, 6rem)",
            lineHeight: 1,
            marginTop: "-0.5rem",
            textShadow: "0 2px 30px rgba(0,0,0,0.45)",
          }}
        >
          food as art
        </motion.p>

        {/* Eyebrow label — Lato (sans-serif, .tott-body) ALL CAPS, small,
            wide letter-spacing. Per task v10: "сделай чтобы на мобильных
            версиях переносился лучший кейтеринг а следующая строга Санкт-
            Петербурга" — explicit <br className="sm:hidden"> after "кейтеринг"
            forces the wrap on mobile only; on sm+ screens the <br> is hidden
            so the label renders as one line. Generous editorial whitespace
            below the script pair (mt-10). padding-left optically centers
            the tracked label. */}
        <motion.p
          variants={fade}
          className="tott-body text-white/85"
          style={{
            fontSize: "clamp(11px, 1.2vw, 14px)",
            lineHeight: 1.4,
            letterSpacing: "0.35em",
            fontWeight: 700,
            textTransform: "uppercase",
            marginTop: "2.5rem",
            paddingLeft: "0.35em",
            textShadow: "0 2px 20px rgba(0,0,0,0.4)",
          }}
        >
          Лучший кейтеринг
          <br className="sm:hidden" />
          {" "}Санкт-Петербурга
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
