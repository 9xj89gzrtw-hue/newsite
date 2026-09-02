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
 *  - (Task 4-B: the TiltedAccent handwritten marginalia + the word
 *    «кухня» in copy were removed at the owner's request — the eyebrow
 *    now opens the beat directly.)
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
 * W4-FIX (hover-тизер): every tile renders a <video muted loop playsInline
 * preload="none"> ON TOP of its poster (the video's own poster attribute
 * shows the identical frame, so the static look is unchanged). The teaser
 * plays ONLY on card hover, ONLY on fine-pointer devices
 * (matchMedia("(hover: hover) and (pointer: fine)")), ONLY while the section
 * is intersecting the viewport (IO gate) and NEVER more than one at a time
 * (entering a card pauses its siblings). preload="none" keeps the mp4s out
 * of the network until the first hover; coarse-pointer (touch) users see
 * the static poster; prefers-reduced-motion disables hover videos entirely.
 * The modal (unmuted + controls) and the «Смотреть видео» pill are unchanged.
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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { ClipPathReveal } from "@/components/motion/clip-path-reveal";
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
 * 4 tiles with genuinely DIFFERENT video clips (Cycle 39 honesty fix:
 * previously all 4 tiles opened the same full video while captions
 * promised different event stories). The mculinary b-roll (28s) is cut
 * into 4 unique 7-second fragments via ffmpeg — each tile opens its own
 * clip in a fullscreen modal: crostini appetizers / tortellini / dessert /
 * plated main. Posters come from /media/event-0[1-4] assets.
 */
const TILES: EventTile[] = [
  {
    video: "/media/clips/catering-clip-1.mp4",
    poster: "/media/event-01.png",
    category: "Закуски",
    title: "Кростини и канапе",
    meta: "Старт банкета · первая подача",
    videoAlt: "Видео: кростини с топпингами — подача закусок",
  },
  {
    video: "/media/clips/catering-clip-2.mp4",
    poster: "/media/event-02.jpg",
    category: "Горячее",
    title: "Тортелини с овощами",
    meta: "Основная подача · в работе",
    videoAlt: "Видео: тортелини с овощами — горячая подача",
  },
  {
    video: "/media/clips/catering-clip-3.mp4",
    poster: "/media/event-03.jpg",
    category: "Десерты",
    title: "Меренга и мороженое",
    meta: "Финал трапезы · авторский десерт",
    videoAlt: "Видео: десерт с меренгой и мороженым",
  },
  {
    video: "/media/clips/catering-clip-4.mp4",
    poster: "/media/event-04.jpg",
    category: "Мастерство шефа",
    title: "Авторское горячее",
    meta: "Мясо с гарниром · порционная подача",
    videoAlt: "Видео: авторское горячее блюдо с мясом и гарниром",
  },
];

export function EventsVideoCarousel() {
  const reduce = useReducedMotion();
  // C62 hydration-safety: entrance props serialize into SSR HTML — the
  // reduce branch resolves only after mount (direct branch = mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduceSettled = mounted && reduce;
  const scrollerRef = useRef<HTMLUListElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [progress, setProgress] = useState(0);

  /** activeIndex !== null → fullscreen modal open with that tile's video. */
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  /* ── W4-FIX: hover-видео-тизеры (десктоп, fine pointer) ─────────────────
   *
   * Per-tile teaser <video> elements (see the <li> render below). The gate
   * resolves once on the client — it only affects event-handler behaviour,
   * never the rendered DOM, so SSR/hydration markup stays identical. */
  const sectionRef = useRef<HTMLElement | null>(null);
  const hoverVideosRef = useRef<Array<HTMLVideoElement | null>>([]);
  const inViewRef = useRef(false);
  const canHoverVideo = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    [],
  );

  /** React doesn't serialize the `muted` attribute into SSR HTML — pin the
   *  DOM property on mount so hover play() (muted) is never rejected. */
  useEffect(() => {
    hoverVideosRef.current.forEach((v) => {
      if (v) v.muted = true;
    });
  }, []);

  /** IO-гейт: вне вьюпорта тизеры не играют ВООБЩЕ — при выходе гасим все
   *  (в т.ч. случайно оставшийся играющим) и запрещаем новый hover-play. */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        inViewRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) {
          hoverVideosRef.current.forEach((v) => {
            if (v && !v.paused) v.pause();
          });
        }
      },
      { rootMargin: "100px" },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  /** Hover = ровно ОДНО играющее видео: вход в карточку ставит её и глушит
   *  остальных; выход — пауза этой. Гейты: fine pointer, не reduced-motion,
   *  секция в вьюпорте, модалка закрыта. */
  const playHoverVideo = (i: number) => {
    if (!canHoverVideo || reduce || activeIndex !== null) return;
    if (!inViewRef.current) return;
    hoverVideosRef.current.forEach((v, j) => {
      if (!v) return;
      if (j === i) {
        if (v.paused) {
          void v.play().catch(() => {
            /* rejected — the static poster stays */
          });
        }
      } else if (!v.paused) {
        v.pause();
      }
    });
  };

  const pauseHoverVideo = (i: number) => {
    const v = hoverVideosRef.current[i];
    if (v && !v.paused) v.pause();
  };

  /** Модалка открыта — её видео (со звуком) должно играть одно: глушим
   *  hover-тизеры. */
  const pauseHoverVideos = useCallback(() => {
    hoverVideosRef.current.forEach((v) => {
      if (v && !v.paused) v.pause();
    });
  }, []);

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

  /* Latest closeModal for the ESC listener — assigned in an effect that
     lives after closeModal's declaration (see below). */
  const closeModalRef = useRef<() => void>(() => {});

  // Escape key closes the open modal. Locks body scroll while modal is open
  // so the background doesn't scroll behind the overlay.
  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      /* Cycle 42 fix: route ESC through closeModal so focus returns to
         the opener tile (setActiveIndex(null) bypassed the return). */
      if (e.key === "Escape") {
        e.preventDefault();
        closeModalRef.current();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeIndex]);

  // Cycle 39 a11y fix: move focus into the modal when it opens and keep it
  // trapped while open (Tab cycles close → video → caption → close).
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const videoWrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (activeIndex === null) return;
    closeRef.current?.focus();
  }, [activeIndex]);
  const trapFocus = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !videoWrapRef.current) return;
    const focusables = Array.from(
      videoWrapRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], video[controls], [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Cycle 40 a11y: remember which tile opened the modal so focus returns
  // there on close (previously focus fell to <body> — keyboard users lost
  // their place on the page).
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const openModal = useCallback(
    (i: number) => {
      pauseHoverVideos();
      openerRef.current =
        document.activeElement instanceof HTMLButtonElement
          ? document.activeElement
          : null;
      setActiveIndex(i);
    },
    [pauseHoverVideos],
  );
  const closeModal = useCallback(() => {
    setActiveIndex(null);
    requestAnimationFrame(() => openerRef.current?.focus());
  }, []);
  useEffect(() => {
    closeModalRef.current = closeModal;
  }, [closeModal]);

  const activeTile = activeIndex === null ? null : TILES[activeIndex];

  return (
    <section
      ref={sectionRef}
      id="events-video-carousel"
      aria-label="Видео мероприятий"
      className="ea-evt-video ea-section ea-section--cream"
    >
      <div className="ea-container ea-container--wide">
        {/* Header — eyebrow + H2 (italic-as-fragment) + subtitle.
            (Task 4-B: TiltedAccent «кухня» removed; wording updated.) */}
        <motion.div
          className="ea-evt-video__top"
          initial={reduceSettled ? false : { opacity: 0, y: 24 }}
          whileInView={reduceSettled ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="ea-evt-video__heading-block">
            <span className="ea-eyebrow">Видео с наших мероприятий</span>
            <h2 className="ea-section-h2 ea-evt-video__h2">
              {"Блюда, которые мы "}
              <i className="ea-italic-fragment">создаём</i>
              {"."}
            </h2>
            <p className="ea-evt-video__subtitle">
              Четыре фрагмента нашей работы — от первых закусок до десертов.
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
              className="ea-evt-video__card group"
              role="group"
              aria-roledescription="slide"
              aria-label={`Видео ${i + 1} из ${TILES.length}: ${tile.title}`}
              onMouseEnter={() => playHoverVideo(i)}
              onMouseLeave={() => pauseHoverVideo(i)}
            >
              {/* Poster image — the visual base of the tile (alt text carries
                  the content description for AT; eager: tiles live in a
                  horizontal scroller — lazy images horizontally off-screen
                  never load and read as "broken" to audits). */}
              <ClipPathReveal
                direction="alternate"
                index={i}
                duration={0.8}
                className="absolute inset-0"
              >
                <img
                  className="ea-evt-video__video"
                  src={tile.poster}
                  alt={tile.videoAlt}
                  loading="eager"
                  decoding="async"
                />
              </ClipPathReveal>

              {/* W4-FIX hover-тизер: <video> ALWAYS in the DOM above the
                  poster (same .ea-evt-video__video class → same absolute
                  fill + hover scale). preload="none" + poster → the browser
                  fetches nothing until play() and shows the poster frame,
                  so the static look is pixel-identical. Plays only on hover
                  (fine pointer, section in view, one at a time) — see
                  playHoverVideo above. Decorative: aria-hidden, the img alt
                  carries the description. */}
              <video
                ref={(el) => {
                  hoverVideosRef.current[i] = el;
                }}
                className="ea-evt-video__video"
                src={tile.video}
                poster={tile.poster}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
                tabIndex={-1}
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

        {/* Cycle 39 fix: desktop prev/next arrows — the 4th card was
            partially cut with no affordance. Arrows scroll one card. */}
        <div className="ea-evt-video__nav">
          <button
            type="button"
            className="ea-evt-video__nav-btn"
            onClick={() => {
              const scroller = scrollerRef.current;
              if (!scroller) return;
              const card = scroller.querySelector<HTMLElement>(".ea-evt-video__card");
              const w = (card?.offsetWidth ?? 320) + CARD_GAP_PX;
              scroller.scrollBy({ left: -w, behavior: "smooth" });
            }}
            aria-label="Предыдущее видео"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            className="ea-evt-video__nav-btn"
            onClick={() => {
              const scroller = scrollerRef.current;
              if (!scroller) return;
              const card = scroller.querySelector<HTMLElement>(".ea-evt-video__card");
              const w = (card?.offsetWidth ?? 320) + CARD_GAP_PX;
              scroller.scrollBy({ left: w, behavior: "smooth" });
            }}
            aria-label="Следующее видео"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
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
          onKeyDown={trapFocus}
        >
          <button
            ref={closeRef}
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
            ref={videoWrapRef}
            className="ea-evt-video__modal-frame"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              className="ea-evt-video__modal-video"
              src={activeTile.video}
              poster={activeTile.poster}
              autoPlay
              controls
              playsInline
              preload="metadata"
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
