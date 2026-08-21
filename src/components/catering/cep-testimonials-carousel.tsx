"use client";

/**
 * CepTestimonialsCarousel — Cycle 27.
 *
 * Replicates creativeedgeparties.com §6.9 testimonials carousel (analysis
 * line 246–266). CEP signature: cream cards on cream bg, peeking the next
 * card, NO arrows/dots, infinite loop, fully auto-advancing. The
 * cream-on-cream subtlety is what makes it feel like one continuous
 * editorial spread.
 *
 * Adaptation: 5 RU catering testimonials written in CEP's grateful-specific
 * voice (mention шеф, подача, вкус, сервис). Card titles are RU event
 * categories. Cyrillic glyphs fall back per-glyph to Montserrat (loaded as
 * --font-poppins) since Neutra2Text_Book is Latin-only.
 *
 * Implementation (per AGENTS.md §14 грабли #8 + Cycle 25 critique-loop):
 *  - Manual setInterval autoplay. The embla-carousel-react v8.6.0 wrapper
 *    is broken under React 19 + Next 16 (its useState-setter-as-ref-callback
 *    never fires, emblaApi stays undefined). Manual interval is bulletproof.
 *  - Duplicated-set technique for seamless infinite loop: render the 5
 *    testimonials × 2 (10 DOM nodes). When index reaches 5, the visual
 *    position shows the duplicate of slides 0/1/2 — identical to index 0.
 *    After the transition completes (750ms), we set noTransition=true +
 *    index=0 (instant invisible reset), then re-enable transition on the
 *    next animation frame.
 *  - Pause-on-hover via onMouseEnter/Leave (sets `paused` state, effect
 *    tears down + re-creates the interval).
 *  - Pause-when-offscreen via IntersectionObserver (perf — section often
 *    sits below the fold).
 *  - Reduced-motion → no interval; slides 0–2 stay statically visible (the
 *    CSS shows 3 cards + peek of 4th by default at desktop, 2 at tablet,
 *    85%-width single card at mobile).
 *  - Accessibility: duplicate slides 5–9 are aria-hidden + tabIndex=-1 so
 *    screen readers hear only the 5 real testimonials (the duplication is
 *    a visual loop trick, not extra content).
 *
 * CSS classes used (defined in globals.css "CREATIVE EDGE PARTIES" layer):
 *  .cep-section-cream    — cream bg + black text
 *  .cep-carousel-viewport — overflow:hidden wrapper
 *  .cep-carousel-track    — flex display, gap: 3.75rem (60px), will-change:transform
 *  .cep-carousel-slide    — flex: 0 0 calc((100% - 7.5rem) / 3); white bg, p-1.9rem,
 *                           aspect-ratio 3/4, flex-col. Responsive: 2-up ≤1024px,
 *                           85%-width single ≤640px.
 *  .cep-eyebrow           — 1.05rem uppercase Neutra2Display (card title + author)
 *  .cep-text              — Neutra2Text_Book body (the quote)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";

const AUTOPLAY_DELAY = 4500; // 4.5s per CEP feel
const TRANSITION_MS = 700; // matches framer-motion editorial ease duration
const RESET_BUFFER_MS = 50; // small grace after transition before snap-reset
const GAP_PX = 60; // matches .cep-carousel-track gap (3.75rem)

type Testimonial = {
  title: string; // event category, e.g. "КОРПОРАТИВНОЕ МЕРОПРИЯТИЕ"
  quote: string; // 2–3 sentence RU client testimonial
  author: string; // name + role
};

const TESTIMONIALS: Testimonial[] = [
  {
    title: "КОРПОРАТИВНОЕ МЕРОПРИЯТИЕ",
    quote:
      "«Интерфуд Кейтеринг» организовали наш годовой корпоратив на 200 гостей безупречно. Каждое блюдо подавали горячим и вкусным, сервировка была безукоризненной. Гости до сих пор вспоминают тот вечер и спрашивают контакты команды.",
    author: "Анна Соколова, HR-директор",
  },
  {
    title: "СВАДЬБА",
    quote:
      "Наша свадьба прошла идеально во многом благодаря шефу и всей команде. Гости не перестают восхищаться и подачей, и вкусом — каждая тарелка выглядела как произведение искусства. Сервис был ровно таким, каким должен быть на празднике: заметным, когда нужно, и незаметным, когда не нужно.",
    author: "Михаил и Екатерина",
  },
  {
    title: "ЮБИЛЕЙ",
    quote:
      "Заказывали кейтеринг на 50-летие мужа. Меню составили творчески, учли все наши пожелания и диетические ограничения гостей. Команда работала быстро, дружелюбно и профессионально — мы просто наслаждались вечером, пока всё крутилось само собой.",
    author: "Елена Воронова",
  },
  {
    title: "ФУРШЕТ",
    quote:
      "Фуршет на открытии выставки получился роскошным. Красивая подача, свежие продукты, оригинальные закуски — гости были впечатлены. Многие подходили уточнить, кто кейтерил. Обязательно обратимся снова для следующих мероприятий.",
    author: "Дмитрий Орлов, организатор",
  },
  {
    title: "ЧАСТНАЯ ВЕЧЕРИНКА",
    quote:
      "Закрытый ужин на 30 персон — всё было изысканно и вкусно. Сервис первого класса: официанты предугадывали каждое желание гостей. Шеф приготовил несколько авторских блюд, которые стали главной темой вечера. Огромное спасибо команде!",
    author: "Игорь Лебедев",
  },
];

const TOTAL = TESTIMONIALS.length;

export function CepTestimonialsCarousel() {
  const mounted = useMounted();
  const reduce = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const slideRef = useRef<HTMLDivElement | null>(null); // first slide, for measurement
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [index, setIndex] = useState(0);
  const [stepPx, setStepPx] = useState(0);
  const [noTransition, setNoTransition] = useState(false);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);

  // --- Measure step (slideWidth + gap) on mount + resize ---
  useEffect(() => {
    const measure = () => {
      const slide = slideRef.current;
      if (!slide) return;
      setStepPx(slide.offsetWidth + GAP_PX);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // --- Pause when offscreen (perf) ---
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // --- Auto-advance (manual setInterval — bulletproof vs. Embla wrapper) ---
  useEffect(() => {
    if (reduce || !mounted || !inView || paused) return;
    intervalRef.current = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, AUTOPLAY_DELAY);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [reduce, mounted, inView, paused]);

  // --- Loop-back: when index reaches TOTAL, the visual position shows
  //     duplicate slides 0/1/2 — identical to index 0. After the transition
  //     settles, snap back to 0 with no transition (invisible reset). ---
  useEffect(() => {
    if (index < TOTAL) return;
    const t = setTimeout(() => {
      setNoTransition(true);
      setIndex(0);
    }, TRANSITION_MS + RESET_BUFFER_MS);
    return () => clearTimeout(t);
  }, [index]);

  // --- Re-enable transition after the snap-reset (two RAFs so the
  //     no-transition state paints before transition is restored). ---
  useEffect(() => {
    if (!noTransition) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setNoTransition(false));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [noTransition]);

  const handleMouseEnter = useCallback(() => setPaused(true), []);
  const handleMouseLeave = useCallback(() => setPaused(false), []);

  // Duplicated set for seamless infinite loop.
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];
  const translateX = -(index * stepPx);

  return (
    <section
      ref={sectionRef}
      aria-label="Отзывы клиентов"
      className="cep-section-cream overflow-hidden py-12 md:py-16"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="cep-carousel-viewport">
        <div
          className="cep-carousel-track"
          style={{
            transform: `translateX(${translateX}px)`,
            transition: noTransition
              ? "none"
              : `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          {doubled.map((t, i) => {
            const isDuplicate = i >= TOTAL;
            return (
              <div
                key={`${t.title}-${i}`}
                ref={i === 0 ? slideRef : undefined}
                className="cep-carousel-slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`Отзыв ${(i % TOTAL) + 1} из ${TOTAL}`}
                aria-hidden={isDuplicate ? "true" : undefined}
                tabIndex={isDuplicate ? -1 : undefined}
              >
                <h3 className="cep-eyebrow mb-4 text-cep-black">{t.title}</h3>
                <p
                  className="cep-text flex-1 text-cep-black"
                  style={{ fontSize: "18px", lineHeight: 1.5 }}
                >
                  {t.quote}
                </p>
                {/* 5★ rating in red — CEP uses red as the only accent.
                    aria-hidden because the rating is decorative; the
                    testimonial voice itself is the proof. */}
                <div
                  className="mt-4 text-cep-red"
                  style={{ fontSize: "16px", letterSpacing: "0.1em" }}
                  aria-hidden="true"
                >
                  ★★★★★
                </div>
                <p className="cep-eyebrow mt-3 text-cep-black/60">{t.author}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CepTestimonialsCarousel;
