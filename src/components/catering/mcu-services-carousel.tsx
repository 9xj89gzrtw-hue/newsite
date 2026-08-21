"use client";

/**
 * mculinary.com services carousel — 3-up autoplay cards.
 *
 * Auto-advances every 5000ms (matches mculinary). 3 slides desktop / 2 tablet
 * / 1 mobile. Pause-on-hover + pause-when-offscreen. Dots + arrows.
 *
 * Implementation (Cycle 25 critique-loop):
 *  - Manual setInterval autoplay (the embla-carousel-autoplay plugin had a
 *    timing issue with React 19 + Next 16). Manual interval is bulletproof.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import EmblaCarousel from "embla-carousel";
import type { EmblaCarouselType } from "embla-carousel";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { MCU_SERVICES } from "@/lib/mculinary-media";

const AUTOPLAY_DELAY = 5000;
const TOTAL = MCU_SERVICES.length;

export function McuServicesCarousel() {
  const reduce = useReducedMotion();

  // Direct Embla init (bypasses the embla-carousel-react wrapper — its
  // useState-setter-as-ref-callback doesn't fire reliably in React 19 + Next 16).
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

  return (
    <section
      ref={sectionRef}
      className="bg-white py-20 md:py-24"
      aria-label="Услуги кейтеринга"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <div className="max-w-xl">
            <p className="mcu-eyebrow mcu-body-dark">УСЛУГИ</p>
            <h2 className="mcu-h2 mcu-body-dark mt-3">
              Кейтеринг под ваше событие
            </h2>
            <p className="mcu-body mcu-body-dark mt-4 max-w-md">
              Полный спектр кейтеринговых решений: от авторских свадеб до
              корпоративных банкетов и ежедневных обедов в офис.
            </p>
          </div>
          <a href="#calculator" className="mcu-link-underline mcu-body-dark">
            Смотреть все услуги
          </a>
        </div>

        <div
          ref={viewportRef}
          className="mcu-embla mcu-services-carousel"
          aria-roledescription="carousel"
          aria-label="Услуги кейтеринга Interfood"
          onMouseEnter={stopAuto}
          onMouseLeave={startAuto}
        >
          <div className="mcu-embla__container">
            {MCU_SERVICES.map((service, i) => (
              <div
                key={service.src}
                className="mcu-embla__slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`Слайд ${i + 1} из ${TOTAL}`}
              >
                <article className="mcu-service-card group">
                  <div className="mcu-service-card-img">
                    <Image
                      src={service.src}
                      alt={service.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-3 p-6">
                    <h3 className="mcu-card-title mcu-body-dark">
                      {service.title}
                    </h3>
                    <p className="text-sm text-ink-soft">{service.subtitle}</p>
                    <a
                      href={service.href}
                      className="mcu-eyebrow-link mcu-body-dark mt-2"
                    >
                      Подробнее{" "}
                      <span className="mcu-arrow" aria-hidden="true">
                        →
                      </span>
                    </a>
                  </div>
                </article>
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

        <div className="mcu-embla__dots">
          {scrollSnaps.map((_, i) => (
            <button
              key={i}
              type="button"
              className={cn(
                "mcu-embla__dot",
                i === selectedIndex && "is-selected",
              )}
              onClick={() => scrollTo(i)}
              aria-label={`Слайд ${i + 1}`}
              aria-current={i === selectedIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default McuServicesCarousel;
