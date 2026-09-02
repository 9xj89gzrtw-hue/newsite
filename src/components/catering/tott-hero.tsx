"use client";

import { useEffect, useRef } from "react";
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
 *     "food as art" — the nilov catering brand tagline in their script font.
 *   - Centered stack: wordmark "nilov / catering." (Prata, two lines,
 *     gold dot) + subtitle
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
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  /* FIX-4 [F2, W1-D] §39 «живое видео без фриза: IO + preload="none"» —
   * тот же паттерн, что gg-video-showcase.tsx:192-203. Раньше <video
   * autoPlay> качал 5.16MB mculinary-hero.mp4 в критическом пути парсинга
   * HTML (~6.1MB начального трафика, замер W1-D). Теперь: preload="none" —
   * байты не запрашиваются, пока play() не вызван IO-гейтом; IO
   * (rootMargin 100px) мгновенно стартует play при появлении секции в
   * вьюпорте — hero виден с первой секунды, поэтому визуально НИЧЕГО не
   * меняется (тот же autoplay-эффект, только запрос видео уходит после
   * гидрации, а не блокирует начальный HTML); при уходе из вьюпорта —
   * pause (экономия трафика на фоне ниже фолда). poster — существующее
   * hero-фото (HERO_POSTER), дедуплицируется с poster-атрибутом
   * gg-video-showcase (тот же URL).
   *
   * prefers-reduced-motion: IO не создаём — видео не играет, остаётся
   * статичный постер (next/image z-0) — эталонный паттерн §39.
   */
  useEffect(() => {
    if (reduce) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          // Muted-луп — разрешён всегда; отказ просто оставляет постер.
          void video.play().catch(() => {
            /* autoplay rejected — poster image stays */
          });
        } else {
          video.pause();
        }
      },
      { rootMargin: "100px" },
    );
    io.observe(section);
    return () => {
      io.disconnect();
      video.pause();
    };
  }, [reduce]);

  /** FIX-4: React не сериализует атрибут `muted` в SSR-HTML (known
   *  React #10389) — пиним DOM-свойство на монте, чтобы muted-autoplay
   *  из IO-гейта никогда не отклонялся (как в gg-video-showcase). */
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = true;
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      data-header-theme="transparent"
      aria-label="nilov catering — лучший кейтеринг Санкт-Петербурга"
      className="relative min-h-[100svh] w-full overflow-hidden bg-black"
    >
      {/* Background image — LCP priority (next/image). Sits at z-0 and acts
          as the video poster (the video overlays it once playing). */}
      <Image
        src={HERO_POSTER}
        alt="Лучший банкетный стол — кейтеринг nilov catering"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 z-0 size-full object-cover"
      />

      {/* Background video — cinematic motion (replaces talkofthetown's static
          hero photo per task brief). Overlays the poster image (z-10) once it
          begins playing. object-cover fills viewport; muted + playsInline for
          autoplay + iOS compliance.
          FIX-4 [F2]: preload="none" + IO-гейт (см. эффект выше) — 5.16MB
          уходит из критического пути; poster = HERO_POSTER (дедуп с
          gg-video-showcase). autoPlay-атрибут убран — старт выдаёт IO,
          hero в вьюпорте с первой секунды, визуал не меняется. */}
      <video
        ref={videoRef}
        className="absolute inset-0 z-[1] size-full object-cover"
        muted
        loop
        playsInline
        preload="none"
        poster={HERO_POSTER}
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
          better optical balance (W1-FIX: translateY +40px — при +60px на
          1440×900 eyebrow «ЛУЧШИЙ КЕЙТЕРИНГ…» пересекался со scroll-cue
          «ЛИСТАЙТЕ»; +40 + bottom-12 (было bottom-28) дают зазор ≥8px), "food
          as art" made larger, and the eyebrow label wraps cleanly on mobile
          ("Лучший кейтеринг" / "Санкт-Петербурга") via an explicit <br> that
          only shows on small screens (hidden sm:inline).
          Composition:
            1. "nilov" / "catering." — massive high-contrast serif (Prata),
               two explicit lines (block spans — никогда не рвётся посреди
               слова, §1.5), gold dot after "catering"
            2. "food as art" — handwritten script (Nothing You Could Do),
               nestled tight below the wordmark (negative margin, signature)
            3. "ЛУЧШИЙ КЕЙТЕРИНГ" / "САНКТ-ПЕТЕРБУРГА" — small uppercase
               tracked sans-serif eyebrow (Lato via Karla Cyrillic fallback),
               wraps to 2 lines on mobile (break after "кейтеринг"), single
               line on sm+ screens. Generous editorial whitespace below the
               script pair.
          Text-shadow on white text for video-bg legibility. */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center [transform:translateY(40px)]"
        initial={showStatic ? false : "hidden"}
        animate={showStatic ? undefined : "visible"}
        variants={container}
      >
        {/* Wordmark — Prata (high-contrast serif). Two stacked lines
            "nilov" / "catering." — вау-композиция: широкая строка
            "catering." (~4.1em) при 15vw занимает ~62vw — влезает и на
            мобиле, и на десктопе. Разрыв строк — осознанный (block-спаны
            по границе слов), mid-word перенос невозможен. Золотая точка
            после "catering" — фирменный акцент. Mobile floor 3.5rem
            держит иерархию над script-флор 2.25rem (task v11) и
            гарантирует, что "catering." не упирается в px-6-поля на
            320px-экранах. */}
        <motion.h1
          variants={rise}
          /* Cycle 40 SEO fix: the visible wordmark alone carries no keywords;
             aria-label gives search engines «лучший кейтеринг
             Санкт-Петербурга» without changing the visual design. */
          aria-label="nilov catering — лучший кейтеринг Санкт-Петербурга"
          className="tott-display text-white"
          style={{
            fontSize: "clamp(3.5rem, 15vw, 10rem)",
            lineHeight: 0.93,
            letterSpacing: "-0.02em",
            textShadow: "0 2px 30px rgba(0,0,0,0.45)",
          }}
        >
          <span className="block">nilov</span>
          <span className="block">
            catering<span style={{ color: "var(--gold)", marginLeft: "0.05em" }}>.</span>
          </span>
        </motion.h1>

        {/* Script tagline — Nothing You Could Do (Latin script font). Nestles tight
            under the wordmark (negative mt) for a signature/underline feel.
            Per user: "food as art" stays in English — латинский скрипт-акцент
            над латинским вордмарком «nilov catering» (food ↔ catering),
            фонетика и семантика читаются одинаково в обеих локáлях.
            Tilted -6° (rotate) for a handwritten signature gesture — mirrors
            gamma's tilted-accent device. The rotation is applied to an inner
            <span> so framer-motion's `rise` variant (opacity + y) on the
            outer <motion.p> doesn't clobber the transform.
            Size kept smaller than the wordmark (floor 2.25rem vs 4rem) so the
            visual hierarchy holds on narrow screens. */}
        <motion.p
          variants={rise}
          className="tott-script text-white/95"
          style={{
            fontSize: "clamp(2.25rem, 6vw, 4.5rem)",
            lineHeight: 1,
            /* W1-FIX: -0.5rem давал пересечение line-box'ов «catering.» и
               «food as art» на 8px @390×844 (замер критика); 0.25rem
               даёт 4px зазор. */
            marginTop: "0.25rem",
            textShadow: "0 2px 30px rgba(0,0,0,0.45)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              transform: "rotate(-6deg)",
              transformOrigin: "center",
            }}
          >
            food as art
          </span>
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

      {/* Scroll cue bottom-center (sits above the docked nav). W1-FIX:
          bottom-12 (was bottom-28) — at 1440×900 the cue overlapped the
          eyebrow label; measured gap after the fix ≥8px. */}
      <motion.div
        className="absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        initial={showStatic ? false : { opacity: 0 }}
        animate={showStatic ? undefined : { opacity: 1, transition: { delay: 1.3, duration: 0.8 } }}
        aria-hidden="true"
      >
        <span className="tott-body text-[13px] font-bold uppercase tracking-[0.35em] text-white/85">
          Листайте
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
