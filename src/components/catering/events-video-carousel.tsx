"use client";

/**
 * EventsVideoCarousel — Section #9 of the new site structure.
 * ----------------------------------------------------------------------------
 * Horizontal carousel of 4 event-type video tiles. Pure CSS scroll-snap
 * + a 5s auto-advance `useEffect`. Clicking a tile opens a fullscreen
 * modal with the full video unmuted + native controls + Escape-to-close.
 *
 * FORKED FROM `ea-events-portfolio.tsx` (Cycle 28 EA editorial layer) —
 * same bulletproof no-library approach: native CSS scroll-snap-x mandatory,
 * pause-on-mouseenter, IntersectionObserver-gated autoplay for perf,
 * `useReducedMotion` short-circuit. Adds: `<video>` instead of `<Image>`,
 * click-to-expand modal, Escape key handler, custom scrollbar styling.
 *
 * EA design language grafted:
 *  - Cream section bg (var(--ea-cream)).
 *  - TiltedAccent handwritten marginalia ("события") above the eyebrow —
 *    a human handwritten gesture opening the "events video" beat.
 *  - Italic-as-fragment H2 ("События, которые мы *создаём*." → italic + red).
 *  - Eyebrow (Barlow Semi Condensed Bold) + H2 (Playfair) + meta (Poppins).
 *  - Bottom overlay panel (gradient → rgba(0,0,0,0.78)) with category tag +
 *    Playfair title + meta — mirrors EA's "Our Events" cards.
 *  - Custom 2px × 100% red progress indicator.
 *  - ggcatering-style play-pill CTA overlay on each tile (1px solid white,
 *    radius 9999px, padding 8px/16px) — clicking opens the modal.
 *
 * Source strategy: we don't have separate per-event video clips, so the
 * two existing repo teaser videos (mculinary-hero.mp4 + gg-hero-video.mp4)
 * are REUSED in rotation across the 4 tiles. Posters come from the existing
 * /media/event-0[1-4].{png,jpg} assets.
 *
 * Motion:
 *  - Auto-advances every 5000ms by one card-width + 24px gap.
 *  - Pauses on mouseenter, resumes on mouseleave.
 *  - Respects `useReducedMotion` — when reduced, no auto-advance.
 *  - Subtle motion.div fade-up on header (respects reduced-motion).
 *  - Pauses autoplay entirely while the modal is open (activeIndex !== null).
 *
 * Mobile: STILL horizontal scroll — no grid collapse. This is the magazine
 * horizontal-read signature (per EA + Ridgewells editorial layer brief).
 *
 * Self-contained: scoped CSS in `./events-video-carousel.css`. No edits
 * to globals.css, no edits to any other catering/*.tsx file.
 *
 * @see ea-events-portfolio.tsx (fork source — carousel mechanics)
 * @see ea-venues-spotlight.tsx (style reference — header + tile composition)
 * @see docs/reference-library/elegant-affairs/BRAND-CONTEXT.md §2.5
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { TiltedAccent } from "@/components/catering/tilted-accent";
import "./events-video-carousel.css";

/** EA Easing — quiet cubic-bezier used across the editorial layer. */
const EASE = [0.22, 1, 0.36, 1] as const;

/** Auto-advance interval in milliseconds. */
const AUTOPLAY_MS = 5000;

/** Card gap in pixels — must match `gap: 1.5rem` in events-video-carousel.css. */
const CARD_GAP_PX = 24;

type EventTile = {
  /** Background teaser video — looping muted autoplay. */
  video: string;
  /** Poster image — shown before video loads (and as fallback). */
  poster: string;
  /** Category tag (Barlow Semi Condensed Bold uppercase, var(--ea-red)). */
  category: string;
  /** Title (Playfair Display 1.5rem white). */
  title: string;
  /** Meta line (Poppins 0.85rem white/70) — venue · guest count. */
  meta: string;
  /** aria-label for the `<video>` element describing its content. */
  videoAlt: string;
};

/**
 * 4 event-type tiles. Uses the in-repo food b-roll (mculinary-hero.mp4)
 * for all 4 tiles — different poster images + captions per tile give each
 * tile its own visual identity. (Cycle 32 /loop fix: previously alternated
 * with gg-hero-video.mp4, but that clip shows the ggcatering brand logo,
 * which is wrong on our site.)
 * Posters come from the existing /media/event-0[1-4].{png,jpg} assets.
 */
const TILES: EventTile[] = [
  {
    video: "/media/mculinary/mculinary-hero.mp4",
    poster: "/media/event-01.png",
    category: "Свадьбы",
    title: "Свадебный банкет",
    meta: "Усадьба · 180 гостей",
    videoAlt: "Тизер-видео свадебного банкета в усадьбе на 180 гостей",
  },
  {
    video: "/media/mculinary/mculinary-hero.mp4",
    poster: "/media/event-02.jpg",
    category: "Корпоратив",
    title: "Корпоративный ужин",
    meta: "Ленэкспо · 1200 гостей",
    videoAlt: "Тизер-видео корпоративного ужина в Ленэкспо на 1200 гостей",
  },
  {
    video: "/media/mculinary/mculinary-hero.mp4",
    poster: "/media/event-03.jpg",
    category: "Банкеты",
    title: "Банкет в особняке",
    meta: "Частная усадьба · 120 гостей",
    videoAlt: "Тизер-видео банкета в частном особняке на 120 гостей",
  },
  {
    video: "/media/mculinary/mculinary-hero.mp4",
    poster: "/media/event-04.jpg",
    category: "Фуршеты",
    title: "Фуршет на презентации",
    meta: "Шоурум · 200 гостей",
    videoAlt: "Тизер-видео фуршета на презентации для 200 гостей",
  },
];

export function EventsVideoCarousel() {
  const reduce = useReducedMotion();
  const scrollerRef = useRef<HTMLUListElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [progress, setProgress] = useState(0);

  /** activeIndex !== null → fullscreen modal open with that tile's video. */
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  /**
   * Advance the scroller by one card-width + gap. When at the end, wrap
   * back to the start (continuous-loop illusion). Forked verbatim (modulo
   * the class hook) from ea-events-portfolio.tsx.
   */
  const advance = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.querySelector<HTMLElement>(
      ".ea-evt-video__card",
    );
    const cardWidth = card ? card.offsetWidth : 320;
    const delta = cardWidth + CARD_GAP_PX;
    const max = scroller.scrollWidth - scroller.clientWidth;
    if (max <= 0) return;
    const atEnd = scroller.scrollLeft + delta >= max - 4;
    scroller.scrollTo({
      left: atEnd ? 0 : scroller.scrollLeft + delta,
      behavior: "smooth",
    });
  }, []);

  const startAuto = useCallback(() => {
    // No autoplay under reduced-motion OR while modal is open.
    if (reduce) return;
    if (activeIndex !== null) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(advance, AUTOPLAY_MS);
  }, [advance, reduce, activeIndex]);

  const stopAuto = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start autoplay + pause when offscreen (perf). Re-runs when modal state
  // changes so opening/closing the modal cleanly pauses/resumes autoplay.
  useEffect(() => {
    if (reduce) return;
    if (activeIndex !== null) {
      stopAuto();
      return;
    }
    const scroller = scrollerRef.current;
    if (!scroller) {
      startAuto();
      return;
    }
    const section = scroller.closest("section");
    if (!section) {
      startAuto();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startAuto();
        else stopAuto();
      },
      { threshold: 0.25 },
    );
    io.observe(section);
    return () => {
      io.disconnect();
      stopAuto();
    };
  }, [reduce, activeIndex, startAuto, stopAuto]);

  // Scroll-progress bar — rAF-throttled to keep scroll perf clean.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = scroller.scrollWidth - scroller.clientWidth;
        const pct = max > 0 ? scroller.scrollLeft / max : 0;
        setProgress(pct);
        ticking = false;
      });
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  // Escape key closes the open modal. Locks body scroll while modal is open
  // so the background doesn't scroll behind the overlay.
  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeIndex]);

  const openModal = useCallback((i: number) => setActiveIndex(i), []);
  const closeModal = useCallback(() => setActiveIndex(null), []);

  const activeTile = activeIndex === null ? null : TILES[activeIndex];

  return (
    <section
      id="events-video-carousel"
      aria-label="Видео мероприятий"
      className="ea-evt-video ea-section ea-section--cream"
    >
      <div className="ea-container ea-container--wide">
        {/* Header — TiltedAccent + eyebrow + H2 (italic-as-fragment) + subtitle. */}
        <motion.div
          className="ea-evt-video__top"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="ea-evt-video__heading-block">
            <TiltedAccent text="события" className="mb-3 block" />
            <span className="ea-eyebrow">Видео мероприятий</span>
            <h2 className="ea-section-h2 ea-evt-video__h2">
              {"События, которые мы "}
              <i className="ea-italic-fragment">создаём</i>
              {"."}
            </h2>
            <p className="ea-evt-video__subtitle">
              Короткие истории о том, как проходит наш кейтеринг — от
              подготовки до финального тоста.
            </p>
          </div>
        </motion.div>

        {/* Horizontal carousel — pure CSS scroll-snap. */}
        <ul
          ref={scrollerRef}
          className="ea-evt-video__scroller"
          aria-label="Видео мероприятий — горизонтальная прокрутка"
          aria-roledescription="carousel"
          onMouseEnter={stopAuto}
          onMouseLeave={startAuto}
          tabIndex={0}
        >
          {TILES.map((tile, i) => (
            <li
              key={`${tile.video}-${i}`}
              className="ea-evt-video__card"
              role="group"
              aria-roledescription="slide"
              aria-label={`Видео ${i + 1} из ${TILES.length}: ${tile.title}`}
            >
              {/* Background looping muted autoplay teaser video. */}
              <video
                className="ea-evt-video__video"
                src={tile.video}
                poster={tile.poster}
                autoPlay
                muted
                playsInline
                loop
                preload="metadata"
                aria-label={tile.videoAlt}
              />

              {/* Bottom gradient overlay — rgba(0,0,0,0.78) → transparent. */}
              <div className="ea-evt-video__overlay" aria-hidden="true" />

              {/* Center play-pill CTA — ggcatering signature. */}
              <button
                type="button"
                className="ea-evt-video__play"
                onClick={() => openModal(i)}
                aria-label={`Открыть видео: ${tile.title}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="ea-evt-video__play-icon"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Смотреть видео</span>
              </button>

              {/* Bottom caption panel. */}
              <div className="ea-evt-video__caption">
                <span className="ea-evt-video__category">
                  {tile.category}
                </span>
                <h3 className="ea-evt-video__title">{tile.title}</h3>
                <p className="ea-evt-video__meta">{tile.meta}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Custom 2px × 100% red progress indicator (JS-driven width). */}
        <div className="ea-evt-video__progress-track" aria-hidden="true">
          <div
            className="ea-evt-video__progress-bar"
            style={{
              width: `${Math.max(0.08, Math.min(1, progress)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Fullscreen modal — full video unmuted + native controls + close. */}
      {activeTile && (
        <div
          className="ea-evt-video__modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Видео: ${activeTile.title}`}
          onClick={closeModal}
        >
          <button
            type="button"
            className="ea-evt-video__close"
            onClick={closeModal}
            aria-label="Закрыть видео"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
          <div
            className="ea-evt-video__modal-frame"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              className="ea-evt-video__modal-video"
              src={activeTile.video}
              poster={activeTile.poster}
              autoPlay
              controls
              loop
              playsInline
              aria-label={activeTile.videoAlt}
            />
            <div className="ea-evt-video__modal-caption">
              <span className="ea-evt-video__category">
                {activeTile.category}
              </span>
              <h3 className="ea-evt-video__modal-title">{activeTile.title}</h3>
              <p className="ea-evt-video__meta">{activeTile.meta}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default EventsVideoCarousel;
