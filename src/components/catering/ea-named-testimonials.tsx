"use client";

/**
 * EaNamedTestimonials — Cycle 28, Task 4-C.
 *
 * Elegant Affairs graft: "named-institution testimonials" (DESIGN-CRITIQUE
 * recommendation #2 — named, attributable client testimonials with NAME +
 * TITLE + ORGANIZATION, e.g. "Sarah Mitchell, Director of Events,
 * Morgan Stanley"). EA's strongest content pattern — institutional
 * credibility, NOT anonymous "happy couple" praise.
 *
 * SUPPLEMENTS the existing CepTestimonialsCarousel (Cycle 27 —
 * anonymous-style auto-advancing slider). This new block is intentionally
 * STATIC (no carousel, no auto-scroll) — a static grid of named cards is
 * more credible than a slider for institutional proof. EA pattern.
 *
 * Design language:
 *  - Section bg --ea-cream (#F7F5F5) + .ea-container (1280px narrow).
 *  - White cards with 1px hairline mauve border, padding 2.5rem.
 *  - Top: red 2px × 40px divider + small "ОТЗЫВ" eyebrow (mauve).
 *  - Quote: Playfair Display italic (--ea-font-display), 1.125rem, ink.
 *  - Footer: bold name (Barlow Semi Condensed Bold) + role/org line
 *    (Montserrat 0.875rem, mauve).
 *  - Below grid: thin centered strip with 4 more institutional client
 *    names in a row, mauve uppercase Barlow, separated by red • bullets.
 *  - Reveal-on-scroll with stagger (delay = i × 0.08s). Reduced-motion →
 *    no offset, no transition.
 *
 * Self-contained — uses shared EA utility classes from globals.css
 * (.ea-section, .ea-section--cream, .ea-container, .ea-eyebrow,
 * .ea-section-h2, .ea-italic-fragment) + Tailwind classes + inline
 * styles for component-specific typography.
 */

import { Fragment } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type Testimonial = {
  /** Bold display name (Barlow Semi Condensed Bold). */
  name: string;
  /** Role line, e.g. "Директор по маркетингу". */
  role: string;
  /** Organisation, e.g. "Яндекс". */
  org: string;
  /** 3–4 sentence RU testimonial — institutional scenario + specific praise. */
  quote: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Анна Морозова",
    role: "Директор по маркетингу",
    org: "Яндекс",
    quote:
      "Команда Interfood Catering провела наш корпоративный ужин на четыреста человек без единого сбоя. Каждое блюдо вышло ровно по таймингу, сомелье предложил безупречные пары к каждому курсу, а хостес запоминали имена гостей с первого захода. Коллеги ушли впечатлёнными — а мы получили благодарностей больше, чем за любой предыдущий корпоратив.",
  },
  {
    name: "Игорь Власов",
    role: "Президент",
    org: "СБЕР КОРПОРАТИВ",
    quote:
      "Ежегодный партнёрский приём в «Ленэкспо» на тысячу двести персон — задача, в которой любая мелочь становится катастрофой. Шеф лично представил дегустационное меню за три недели до события, мы внесли восемь правок — все учли без спора. Вечер прошёл в абсолютной тишине со стороны сервиса, что и есть высшая оценка работы команды.",
  },
  {
    name: "Мария Кутузова",
    role: "Управляющая",
    org: "Ginza Project",
    quote:
      "Открытие нового отеля — это всегда стресс: триста пятьдесят гостей, пресса, региональные власти. Interfood выдержали и трёх уточнений по численности за неделю до события, и запрос на поздний ночной сервис после официальной части. Подача в двадцать три тридцать вышла такой же горячей и красивой, как и в начале вечера.",
  },
  {
    name: "Дмитрий Соколов",
    role: "Владелец",
    org: "ТД «Северная Звезда»",
    quote:
      "Свадьба дочери в нашей загородной усадьбе на сто восемьдесят гостей — событие, которое я доверил только своим. Шеф приехал лично за неделю, обошёл кухню, обсудил продукты с хозяйкой сада. Вечером гости вставали, чтобы поблагодарить кухню лично — для меня это была лучшая оценка работы команды.",
  },
];

/** Strip of additional institutional client names below the cards grid. */
const CLIENT_NAMES = [
  "ПАО «Газпром»",
  "РЖД",
  "ЛУКОЙЛ",
  "Норникель",
] as const;

/** Hairline border colour used on testimonial cards (1px mauve @ 25%). */
const HAIRLINE = "color-mix(in oklch, var(--ea-mauve) 25%, transparent)";
const HAIRLINE_SOFT = "color-mix(in oklch, var(--ea-mauve) 18%, transparent)";

export function EaNamedTestimonials() {
  const reduceMotion = useReducedMotion();

  const cardVariants: Variants = {
    hidden: reduceMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 28 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reduceMotion
        ? { duration: 0 }
        : {
            duration: 0.7,
            delay: i * 0.08,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          },
    }),
  };

  return (
    <section
      className="ea-section ea-section--cream"
      aria-label="Отзывы институциональных клиентов"
    >
      <div className="ea-container">
        {/* Section header */}
        <div className="mb-12 flex flex-col items-start gap-5 md:mb-16">
          <span className="ea-eyebrow">
            Отзывы · Институциональные клиенты
          </span>
          <h2 className="ea-section-h2 max-w-[18ch]">
            Им важно было <i>безупречно</i>.
          </h2>
        </div>

        {/* 4-card grid (2×2 desktop, 1-col mobile) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={t.name}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10% 0px" }}
              custom={i}
              className="flex flex-col bg-white"
              style={{
                border: `1px solid ${HAIRLINE}`,
                padding: "2.5rem",
              }}
            >
              {/* Top: red 2px × 40px divider */}
              <span
                aria-hidden
                style={{
                  display: "block",
                  width: "40px",
                  height: "2px",
                  background: "var(--ea-red)",
                }}
              />

              {/* "ОТЗЫВ" eyebrow in mauve */}
              <span
                style={{
                  fontFamily: "var(--ea-font-eyebrow)",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--ea-mauve)",
                  marginTop: "1rem",
                }}
              >
                Отзыв
              </span>

              {/* Quote — Playfair italic */}
              <p
                style={{
                  fontFamily: "var(--ea-font-display)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "1.125rem",
                  lineHeight: 1.6,
                  color: "var(--ea-ink)",
                  marginTop: "1.25rem",
                }}
              >
                {t.quote}
              </p>

              {/* Footer block — name + role/org */}
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "1.75rem",
                  borderTop: `1px solid ${HAIRLINE_SOFT}`,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--ea-font-eyebrow)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    letterSpacing: "0.02em",
                    color: "var(--ea-ink)",
                  }}
                >
                  {t.name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--ea-font-body)",
                    fontSize: "0.875rem",
                    color: "var(--ea-mauve)",
                    marginTop: "0.3rem",
                  }}
                >
                  {t.role}, {t.org}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Client names strip — centered row, red • bullets */}
        <div
          className="mt-14 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 md:mt-16"
          style={{
            borderTop: `1px solid ${HAIRLINE_SOFT}`,
            paddingTop: "2rem",
          }}
        >
          {CLIENT_NAMES.map((name, i) => (
            <Fragment key={name}>
              {i > 0 && (
                <span
                  aria-hidden
                  style={{
                    color: "var(--ea-red)",
                    fontSize: "0.85rem",
                    lineHeight: 1,
                  }}
                >
                  •
                </span>
              )}
              <span
                style={{
                  fontFamily: "var(--ea-font-eyebrow)",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--ea-mauve)",
                }}
              >
                {name}
              </span>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EaNamedTestimonials;
