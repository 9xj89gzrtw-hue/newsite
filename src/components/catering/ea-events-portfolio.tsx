"use client";

/**
 * EaEventsPortfolio — Cycle 28 (EA editorial layer)
 * ---------------------------------------------------
 * Magazine-style horizontal-scroll gallery with native CSS scroll-snap.
 *
 * REPLACES `mcu-photo-filmstrip.tsx` (Embla filmstrip, broken under React 19
 * per CYCLE-28-COMPONENT-AUDIT.md §3 — score 7/10). No carousel library: pure
 * CSS scroll-snap + a 4.5s auto-advance useEffect. Bulletproof on React 19.
 *
 * EA design language grafted (per docs/EA-ANALYSIS.md §3.11 + §11):
 *  - Cream section bg (var(--ea-cream)) — same as EA's image-shadow tint.
 *  - Italic-as-fragment trailing phrase ("лучше всего" → italic + red).
 *  - Eyebrow (Barlow Semi Condensed Bold) + H2 (Playfair) + ea-text-link.
 *  - Image hover: scale(1.06) over 700ms (EA's 1.1/200ms refined to be quieter).
 *  - Bottom overlay panel (gradient → rgba(0,0,0,0.78)) with category tag +
 *    Playfair title + Montserrat meta — mirrors EA's "Our Events" cards.
 *  - Custom 2px × 100% red progress indicator (EA-red accent line).
 *
 * Motion:
 *  - Auto-advances every 4500ms by one card-width + 24px gap.
 *  - Pauses on mouseenter, resumes on mouseleave.
 *  - Respects `useReducedMotion` — when reduced, no auto-advance.
 *  - Subtle motion.div fade-up on header (respects reduced-motion).
 *
 * Mobile: STILL horizontal scroll — no grid collapse. This is the magazine
 * horizontal-read signature (per EA + Ridgewells editorial layer brief).
 *
 * Self-contained: scoped CSS in `./ea-events-portfolio.css`. No edits to
 * globals.css, no edits to any other catering/*.tsx file.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { TiltedAccent } from "@/components/catering/tilted-accent";
import { ClipPathReveal } from "@/components/motion/clip-path-reveal";
import "./ea-events-portfolio.css";

/** EA Easing — quiet cubic-bezier used across the editorial layer. */
const EASE = [0.22, 1, 0.36, 1] as const;

/** Auto-advance interval in milliseconds. */
const AUTOPLAY_MS = 4500;

/** Card gap in pixels — must match `gap: 1.5rem` in ea-events-portfolio.css. */
const CARD_GAP_PX = 24;

type EventCard = {
  src: string;
  category: string;
  title: string;
  meta: string;
  alt: string;
};

/**
 * 8 event cards — mapped 1:1 to the existing /public/media/event-0[1-8].{png,jpg}
 * assets. Captions follow the brief's spec: venue · guest count, with EA-style
 * category tags drawn from the canonical Weddings · Corporate · Private Parties
 * trio (EA-ANALYSIS.md §3.11).
 */
const EVENTS: EventCard[] = [
  {
    src: "/media/event-01.png",
    category: "Свадьбы",
    title: "Свадьба в усадьбе",
    meta: "Усадьба · 180 гостей",
    alt: "Свадебный банкет в усадьбе на 180 гостей",
  },
  {
    src: "/media/event-02.jpg",
    category: "Корпоратив",
    title: "Корпоративный гала-ужин",
    meta: "Ленэкспо · 1200 гостей",
    alt: "Корпоративный гала-ужин в Ленэкспо на 1200 гостей",
  },
  {
    src: "/media/event-03.jpg",
    category: "Частные приёмы",
    title: "День рождения в особняке",
    meta: "Частная усадьба · 120 гостей",
    alt: "День рождения в частном особняке на 120 гостей",
  },
  {
    src: "/media/event-04.jpg",
    category: "Благотворительность",
    title: "Благотворительный гала",
    meta: "Городской отель · 450 гостей",
    alt: "Благотворительный гала-ужин на 450 гостей",
  },
  {
    src: "/media/event-05.jpg",
    category: "Конференции",
    title: "Кейтеринг для конференции",
    meta: "Конгресс-центр · 350 гостей",
    alt: "Кейтеринг на конференции для 350 гостей",
  },
  {
    src: "/media/event-06.jpg",
    category: "Свадьбы",
    title: "Выездная церемония",
    meta: "Подмосковье · 90 гостей",
    alt: "Выездная свадебная церемония на 90 гостей",
  },
  {
    src: "/media/event-07.jpg",
    category: "Презентации",
    title: "Презентация продукта",
    meta: "Шоурум · 200 гостей",
    alt: "Презентация нового продукта на 200 гостей",
  },
  {
    src: "/media/event-08.jpg",
    category: "Частные приёмы",
    title: "Юбилейный ужин",
    meta: "Ресторан · 60 гостей",
    alt: "Юбилейный ужин на 60 гостей",
  },
];

export function EaEventsPortfolio() {
  const reduce = useReducedMotion();
  const scrollerRef = useRef<HTMLUListElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [progress, setProgress] = useState(0);

  /**
   * Advance the scroller by one card-width + gap. When at the end, wrap back
   * to the start (continuous-loop illusion).
   */
  const advance = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.querySelector<HTMLElement>(
      ".ea-evt-portfolio__card",
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
    if (reduce) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(advance, AUTOPLAY_MS);
  }, [advance, reduce]);

  const stopAuto = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start autoplay + pause when offscreen (perf).
  useEffect(() => {
    if (reduce) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
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
  }, [reduce, startAuto, stopAuto]);

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

  return (
    <section
      id="ea-events-portfolio"
      aria-labelledby="ea-events-portfolio-headline"
      className="ea-evt-portfolio ea-section ea-section--cream"
    >
      <div className="ea-container ea-container--wide">
        <motion.div
          className="ea-evt-portfolio__top"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="ea-evt-portfolio__heading-block">
            {/* Cycle 31 — gamma-style -6° tilted handwritten accent ABOVE the
                eyebrow. "события" echoes the eyebrow's "События · Избранное"
                but in Marck Script Cyrillic — a different voice (handwritten
                vs formal Barlow). Red, rotated -6°, sized to sit between the
                eyebrow and H2 scales — an editorial marginalia that opens
                the "what we do best" beat with a human handwritten gesture. */}
            <TiltedAccent text="события" className="mb-3 block" />
            <span className="ea-eyebrow">События · Избранное</span>
            <h2
              id="ea-events-portfolio-headline"
              className="ea-section-h2 ea-evt-portfolio__h2"
            >
              {"Что мы умеем "}
              <i className="ea-italic-fragment">лучше всего</i>
              {"."}
            </h2>
          </div>
          <Link
            href="#ea-service-tabs"
            className="ea-text-link ea-evt-portfolio__all-link"
            aria-label="Все события"
          >
            Все события
            <svg
              className="ea-text-link__arrow"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M4 12h15M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        <ul
          ref={scrollerRef}
          className="ea-evt-portfolio__scroller"
          aria-label="Избранные события Interfood — горизонтальная прокрутка"
          aria-roledescription="carousel"
          onMouseEnter={stopAuto}
          onMouseLeave={startAuto}
          tabIndex={0}
        >
          {EVENTS.map((event, i) => (
            <li
              key={event.src}
              className="ea-evt-portfolio__card"
              role="group"
              aria-roledescription="slide"
              aria-label={`Событие ${i + 1} из ${EVENTS.length}: ${event.title}`}
            >
              {/*
                Cycle 34 WOW graft — sondaven.com alternating directional
                clip-path reveal. Each card's image enters with a different
                clip direction (cycling [bottom, left, top, right] via index%4)
                so the 8-card horizontal scroll has rhythm, not a uniform wipe.

                The wrapper div inside ClipPathReveal carries `aspect-[4/5]`
                matching the card's CSS `.ea-evt-portfolio__card { aspect-ratio:
                4/5 }` so next/image `fill` (position:absolute) has a definite
                containing block — the inner motion.div's height is auto, so this
                in-flow wrapper establishes it via aspect-ratio.

                The existing CSS hover scale (.ea-evt-portfolio__img → scale
                1.06 on .ea-evt-portfolio__card:hover) keeps working — it lives
                on the Image element and composes with the inner motion.div's
                scale(1.15)→(1) reveal animation (different elements).
              */}
              <ClipPathReveal
                direction="alternate"
                index={i}
                duration={0.8}
                className="absolute inset-0"
              >
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={event.src}
                    alt={event.alt}
                    fill
                    sizes="(max-width: 768px) 88vw, 380px"
                    className="ea-evt-portfolio__img object-cover"
                    loading="eager"
                  />
                </div>
              </ClipPathReveal>
              <div className="ea-evt-portfolio__overlay">
                <span className="ea-evt-portfolio__category">
                  {event.category}
                </span>
                <h3 className="ea-evt-portfolio__title">{event.title}</h3>
                <p className="ea-evt-portfolio__meta">{event.meta}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="ea-evt-portfolio__progress-track" aria-hidden="true">
          <div
            className="ea-evt-portfolio__progress-bar"
            style={{
              width: `${Math.max(0.08, Math.min(1, progress)) * 100}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default EaEventsPortfolio;
