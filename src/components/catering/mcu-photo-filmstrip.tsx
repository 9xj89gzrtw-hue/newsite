"use client";

/**
 * mculinary.com photo filmstrip — variable-width centerMode carousel.
 *
 * Auto-advances every 3500ms (user requested all carousels auto-moving).
 * Pause-on-hover + pause-when-offscreen. Variable slide widths (340-520px)
 * create the filmstrip rhythm — 3-4 slides visible at 1440px viewport.
 *
 * Implementation (Cycle 25 critique-loop):
 *  - Manual setInterval autoplay (NOT the embla-carousel-autoplay plugin —
 *    the plugin had a timing/init issue with React 19 + Next 16 where the
 *    timer never fired). Manual interval is bulletproof.
 *  - Pause-on-hover via onMouseEnter/Leave (clears + restarts interval).
 *  - Pause-when-offscreen via IntersectionObserver (perf).
 *  - Reduced-motion → no interval, slides still visible.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import EmblaCarousel from "embla-carousel";
import type { EmblaCarouselType } from "embla-carousel";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { MCU_PHOTO_SLIDES } from "@/lib/mculinary-media";

const AUTOPLAY_DELAY = 3500;
const TOTAL = MCU_PHOTO_SLIDES.length;

export function McuPhotoFilmstrip() {
  const reduce = useReducedMotion();

  // Direct Embla init (bypasses the embla-carousel-react wrapper which had an
  // init issue with React 19 + Next 16 — emblaApi stayed undefined because the
  // wrapper's useState-setter-as-ref-callback wasn't firing reliably).
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [emblaApi, setEmblaApi] = useState<EmblaCarouselType | undefined>();

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const api = EmblaCarousel(
      vp,
      { loop: true, align: "center", containScroll: "trimSnaps" },
      [],
    );
    setEmblaApi(api);
    return () => {
      api.destroy();
    };
  }, []);

  const sectionRef = useRef<HTMLElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect(emblaApi);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Manual autoplay — bulletproof (no plugin timing issues).
  const startAuto = useCallback(() => {
    if (reduce) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      emblaApi?.scrollNext();
    }, AUTOPLAY_DELAY);
  }, [emblaApi, reduce]);

  const stopAuto = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start autoplay + pause when offscreen (perf) + pause on hover.
  useEffect(() => {
    if (!emblaApi || reduce) return;
    const el = sectionRef.current;
    if (!el) {
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
    io.observe(el);
    return () => {
      io.disconnect();
      stopAuto();
    };
  }, [emblaApi, reduce, startAuto, stopAuto]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  const dots = Array.from({ length: scrollSnaps.length }, (_, i) => i);

  return (
    <section
      ref={sectionRef}
      className="mcu-section-cream-texture py-20 md:py-24"
      aria-label="Фотогалерея мероприятий"
    >
      <div className="mx-auto mb-12 max-w-2xl px-6 text-center">
        <p className="mcu-eyebrow mcu-body-dark">ГАЛЕРЕЯ</p>
        <h2 className="mcu-h2 mcu-body-dark mt-3">
          Мероприятия, которые мы создали
        </h2>
        <p className="mcu-body mcu-body-dark mx-auto mt-4 max-w-lg">
          Свыше 2400 событий за 16 лет — свадьбы, корпоративы, банкеты и
          масштабные проекты.
        </p>
      </div>

      <div
        ref={viewportRef}
        className="mcu-embla mcu-photo-filmstrip w-full"
        aria-roledescription="carousel"
        aria-label="Фотогалерея мероприятий Interfood"
        onMouseEnter={stopAuto}
        onMouseLeave={startAuto}
      >
        <div className="mcu-embla__container">
          {MCU_PHOTO_SLIDES.map((slide, i) => (
            <div
              key={slide.src}
              className={cn(
                "mcu-embla__slide",
                i === selectedIndex && "is-selected",
              )}
              style={{ width: slide.width }}
              role="group"
              aria-roledescription="slide"
              aria-label={`Слайд ${i + 1} из ${TOTAL}`}
            >
              <div className="mcu-photo-slide-inner">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 768px) 85vw, 480px"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="mcu-embla__arrow mcu-embla__arrow--prev"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Предыдущий слайд"
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="mcu-embla__arrow mcu-embla__arrow--next"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Следующий слайд"
        >
          <ArrowRight size={22} aria-hidden="true" />
        </button>
      </div>

      <div className="mcu-embla__dots mcu-embla__dots--on-dark mt-10">
        {dots.map((i) => (
          <button
            key={i}
            type="button"
            className={cn("mcu-embla__dot", i === selectedIndex && "is-selected")}
            onClick={() => scrollTo(i)}
            aria-label={`Перейти к слайду ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default McuPhotoFilmstrip;
