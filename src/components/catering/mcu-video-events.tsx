"use client";

/**
 * McuVideoEvents — Cycle 25.
 *
 * "Events video gallery" carousel — Instagram-reel-style portrait (9:16) video
 * cards that auto-advance every 4.5s (manual setInterval — the embla autoplay
 * plugin had timing issues with React 19). Each <video> independently autoplays
 * muted+loop; IntersectionObserver pauses offscreen videos for perf.
 *
 * mculinary.com has only ONE hero video, but the user explicitly wants a
 * populated auto-moving video gallery. MCU_VIDEO_SLIDES re-uses the hero MP4
 * across 5 slides at different #t= offsets so the gallery looks populated.
 *
 * Section: dark navy gradient (wow moment on dark).
 * Reduced motion: no carousel autoplay + poster-only <video> (no autoPlay).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import EmblaCarousel from "embla-carousel";
import type { EmblaCarouselType } from "embla-carousel";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MCU_VIDEO_SLIDES } from "@/lib/mculinary-media";

const AUTOPLAY_DELAY = 4500;

type VideoSlideProps = {
  src: string;
  poster: string;
  caption: string;
  start: number;
  index: number;
  total: number;
  reduced: boolean;
  sectionInView: boolean;
};

function VideoSlide({
  src,
  poster,
  caption,
  start,
  index,
  total,
  reduced,
  sectionInView,
}: VideoSlideProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardInView, setCardInView] = useState(false);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setCardInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => setCardInView(entries[0].isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced) return;
    const shouldPlay = cardInView && sectionInView;
    if (shouldPlay) {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else if (!video.paused) {
      video.pause();
    }
  }, [cardInView, sectionInView, reduced]);

  return (
    <div
      className="mcu-embla__slide"
      role="group"
      aria-roledescription="slide"
      aria-label={`Видео ${index + 1} из ${total}`}
    >
      <div className="mcu-video-card" ref={cardRef}>
        {reduced ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            poster={poster}
            preload="none"
            aria-label={caption}
          />
        ) : (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={`${src}#t=${start}`}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={caption}
          />
        )}
        <div className="mcu-video-card-overlay">
          <span className="mcu-eyebrow" style={{ color: "var(--mcu-gold-light)" }}>
            МЕРОПРИЯТИЕ
          </span>
          <p className="mcu-card-title mt-1 text-white">{caption}</p>
        </div>
      </div>
    </div>
  );
}

export function McuVideoEvents() {
  const reduced = useReducedMotion() ?? false;

  // Direct Embla init (bypasses the embla-carousel-react wrapper).
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [emblaApi, setEmblaApi] = useState<EmblaCarouselType | undefined>();

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const api = EmblaCarousel(vp, { loop: true, align: "start" }, []);
    setEmblaApi(api);
    return () => {
      api.destroy();
    };
  }, []);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const sectionRef = useRef<HTMLElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sectionInView, setSectionInView] = useState(false);

  // Section-level IO — pause ALL videos + carousel when offscreen.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setSectionInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => setSectionInView(entries[0].isIntersecting),
      { threshold: 0.15 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
    setScrollSnaps(api.scrollSnapList());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Manual autoplay — bulletproof.
  const startAuto = useCallback(() => {
    if (reduced) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => emblaApi?.scrollNext(), AUTOPLAY_DELAY);
  }, [emblaApi, reduced]);

  const stopAuto = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start/stop autoplay based on section visibility.
  useEffect(() => {
    if (!emblaApi || reduced) return;
    if (sectionInView) startAuto();
    else stopAuto();
    return () => stopAuto();
  }, [emblaApi, reduced, sectionInView, startAuto, stopAuto]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const dots =
    scrollSnaps.length > 0
      ? Array.from({ length: scrollSnaps.length }, (_, i) => i)
      : Array.from({ length: MCU_VIDEO_SLIDES.length }, (_, i) => i);

  return (
    <section
      ref={sectionRef}
      className="mcu-section-navy-deep py-24"
      aria-label="Видео наших мероприятий"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <span className="mcu-eyebrow" style={{ color: "var(--mcu-gold-light)" }}>
            ВИДЕО
          </span>
          <h2 className="mcu-h2 mt-3 text-white">Мероприятия в движении</h2>
          <p className="mcu-body mcu-body-light mx-auto mt-5 max-w-xl">
            Шоурил наших событий — от дегустаций до банкетов на сотни гостей.
            Каждое видео — отдельная история кейтеринга.
          </p>
        </div>

        <div
          className="relative"
          onMouseEnter={stopAuto}
          onMouseLeave={startAuto}
        >
          <div className="mcu-embla mcu-video-carousel" ref={viewportRef}>
            <div className="mcu-embla__container">
              {MCU_VIDEO_SLIDES.map((slide, i) => (
                <VideoSlide
                  key={`${slide.src}-${i}`}
                  src={slide.src}
                  poster={slide.poster}
                  caption={slide.caption}
                  start={slide.start}
                  index={i}
                  total={MCU_VIDEO_SLIDES.length}
                  reduced={reduced}
                  sectionInView={sectionInView}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            className="mcu-embla__arrow mcu-embla__arrow--prev mcu-embla__arrow--on-light"
            onClick={scrollPrev}
            aria-label="Предыдущее видео"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="mcu-embla__arrow mcu-embla__arrow--next mcu-embla__arrow--on-light"
            onClick={scrollNext}
            aria-label="Следующее видео"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="mcu-embla__dots mcu-embla__dots--on-dark mt-10">
          {dots.map((i) => (
            <button
              key={i}
              type="button"
              className={cn("mcu-embla__dot", i === selectedIndex && "is-selected")}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Слайд ${i + 1}`}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <a href="#contact" className="mcu-btn-gold">
            Обсудить ваше событие
          </a>
        </div>
      </div>
    </section>
  );
}

export default McuVideoEvents;
