"use client";

/**
 * McuTestimonials — Cycle 25.
 *
 * Single-slide testimonial carousel — replicates mculinary.com's Swiper
 * testimonials (1 slide per view, autoplay 5000ms, disableOnInteraction true,
 * does NOT pause on hover). Big serif quote-mark above text, Playfair italic
 * author signature.
 *
 * Self-contained: defines a local TESTIMONIALS array (premium Russian catering
 * client testimonials). The integrator may choose between this file and the
 * existing testimonials.tsx (which is a different layout).
 *
 * Section: cream + linen-paper texture (matches mculinary testimonials bg).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import EmblaCarousel from "embla-carousel";
import type { EmblaCarouselType } from "embla-carousel";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const AUTOPLAY_DELAY = 5000;

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  rating: number;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Interfood Catering организовали наш корпоратив на 350 персон безупречно — от дегустации до финальной подачи. Гости до сих пор вспоминают тот вечер.",
    author: "Анна Соколова",
    role: "HR-директор, ООО «Спортинг»",
    rating: 5,
  },
  {
    quote:
      "Заказывали свадебный банкет на 120 гостей. Каждое блюдо — произведение искусства. Официанты работали как часы.",
    author: "Михаил и Екатерина",
    role: "Свадьба, июль 2025",
    rating: 5,
  },
  {
    quote:
      "Фуршет на открытии выставки — 600 гостей за 2 часа. Логистика, подача, вкус — всё на высшем уровне.",
    author: "Дмитрий Орлов",
    role: "Организатор, «День поля 2025»",
    rating: 5,
  },
  {
    quote:
      "Кейтеринг для делегации 80 человек. Премиальная подача, внимание к деталям, диетические меню. Вернёмся обязательно.",
    author: "Елена Воронова",
    role: "АО «ДеЛаваль»",
    rating: 5,
  },
];

export function McuTestimonials() {
  const reduced = useReducedMotion() ?? false;

  // Direct Embla init (bypasses the embla-carousel-react wrapper).
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [emblaApi, setEmblaApi] = useState<EmblaCarouselType | undefined>();

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const api = EmblaCarousel(vp, { loop: true, align: "center" }, []);
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

  // Pause autoplay when section leaves the viewport.
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

  // Manual autoplay (stopOnInteraction: true → stops after manual nav).
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

  useEffect(() => {
    if (!emblaApi || reduced) return;
    if (sectionInView) startAuto();
    else stopAuto();
    return () => stopAuto();
  }, [emblaApi, reduced, sectionInView, startAuto, stopAuto]);

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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const dots = scrollSnaps.length
    ? Array.from({ length: scrollSnaps.length }, (_, i) => i)
    : Array.from({ length: TESTIMONIALS.length }, (_, i) => i);

  return (
    <section
      ref={sectionRef}
      className="mcu-section-cream-texture py-24"
      aria-label="Отзывы клиентов"
    >
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-14 text-center">
          <span
            className="mcu-eyebrow"
            style={{ color: "var(--mcu-gold)" }}
          >
            ОТЗЫВЫ
          </span>
          <h2 className="mcu-h2 mt-3" style={{ color: "var(--mcu-espresso)" }}>
            Что говорят наши клиенты
          </h2>
        </div>

        <div className="relative">
          <div className="mcu-embla" ref={viewportRef}>
            <div className="mcu-embla__container">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={`${t.author}-${i}`}
                  className="mcu-embla__slide"
                  style={{ flexBasis: "100%" }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Отзыв ${i + 1} из ${TESTIMONIALS.length}`}
                >
                  <div className="px-4 text-center md:px-12">
                    <span className="mcu-quote-mark" aria-hidden="true">
                      &ldquo;
                    </span>
                    <div
                      className="mb-6 flex justify-center gap-1"
                      aria-label={`Оценка ${t.rating} из 5`}
                    >
                      {Array.from({ length: t.rating }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className="h-5 w-5 fill-[var(--mcu-gold)] text-[var(--mcu-gold)]"
                        />
                      ))}
                    </div>
                    <blockquote
                      className="mcu-h3 mb-8 italic"
                      style={{
                        color: "var(--mcu-espresso)",
                        lineHeight: 1.5,
                      }}
                    >
                      {t.quote}
                    </blockquote>
                    <p className="mcu-card-title italic">{t.author}</p>
                    <p className="mcu-eyebrow mt-2 text-ink-soft">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="mcu-embla__arrow mcu-embla__arrow--prev"
            onClick={scrollPrev}
            aria-label="Предыдущий отзыв"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="mcu-embla__arrow mcu-embla__arrow--next"
            onClick={scrollNext}
            aria-label="Следующий отзыв"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className={cn("mcu-embla__dots")}>
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
      </div>
    </section>
  );
}

export default McuTestimonials;
