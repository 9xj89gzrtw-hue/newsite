"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "./reveal";

/**
 * TastingMenuExperience — Salt Block-style 5-course editorial tasting menu.
 *
 * Cycle 26 — Salt Block editorial layer. Inspired by SaltBlock Hospitality's
 * testimonials section being a solid-color wow with big-type quotes, we render
 * this 5-course degustation menu as a dramatic dark `--mcu-espresso` band with
 * honey-gold (#D4A373) accents and Playfair Display cream headlines.
 *
 * Layout: max-w-[1070px] mx-auto vertical list of 5 rows. Each row is a
 * 3-column grid: course number (Barlow Semi Condensed 48/700 gold) | dish name
 * (Playfair 28/500 cream) + italic Karla ingredient line (16px, opacity 0.65) |
 * pairing note (Barlow 12px uppercase ls 0.18em gold opacity 0.5). Rows are
 * separated by 1px OKLCH color-mix rules between cream and ink.
 *
 * Reduced-motion: rows render statically without stagger when the user has
 * prefers-reduced-motion enabled.
 */

interface Course {
  num: string;
  title: string;
  subtitle: string;
  pairing: string;
}

const COURSES: Course[] = [
  {
    num: "01",
    title: "Подача первая: Пробуждение",
    subtitle:
      "Карпаччо из говядины Black Angus с трюфельным маслом и слайсами пармезана",
    pairing: "ВИНО: Бароло 2017",
  },
  {
    num: "02",
    title: "Подача вторая: Лес",
    subtitle:
      "Тёплый салат с лесными грибами, козьим сыром и медовым уксусом",
    pairing: "ВИНО: Пино Нуар 2019",
  },
  {
    num: "03",
    title: "Подача третья: Море",
    subtitle: "Конфи из сибаса с соусом бер-блан и икрой минтая",
    pairing: "ВИНО: Совиньон Блан 2020",
  },
  {
    num: "04",
    title: "Подача четвёртая: Огород",
    subtitle:
      "Ризотто с весенним горошком, мятой и выдержанным пармезаном 24 месяца",
    pairing: "ВИНО: Гевюрцтраминер 2019",
  },
  {
    num: "05",
    title: "Подача пятая: Финал",
    subtitle:
      "Десерт «Персик Мельба» с ванильным кремом и малиновым кули",
    pairing: "НАПИТОК: просекко брют",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

/** Shared OKLCH color-mix rule between cream and ink — subtle warm divider. */
const sectionRuleBorder: React.CSSProperties = {
  borderTop: "1px solid color-mix(in oklch, var(--cream) 12%, var(--ink))",
};

/** Single tasting-menu row with staggered reveal + reduced-motion respect. */
function TastingRow({ course, index }: { course: Course; index: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={reduce ? undefined : { duration: 0.6, delay: index * 0.12, ease: EASE }}
      className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-3 py-8 md:grid-cols-[88px_1fr_auto] md:gap-x-10 md:py-10"
      style={sectionRuleBorder}
    >
      {/* Col 1 — course number (Barlow Semi Condensed 32/700, honey gold) */}
      <span
        className="font-barlow text-gold"
        style={{
          fontSize: "32px",
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "-0.01em",
        }}
      >
        {course.num}
      </span>

      {/* Col 2 — dish name (Playfair 28/500 cream) + ingredient italic */}
      <div className="min-w-0">
        <h3
          className="font-serif text-cream"
          style={{
            fontSize: "28px",
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        >
          {course.title}
        </h3>
        <p
          className="mt-2 italic text-cream"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "16px",
            lineHeight: 1.5,
            opacity: 0.65,
          }}
        >
          {course.subtitle}
        </p>
      </div>

      {/* Col 3 — pairing note (Barlow 12px uppercase ls 0.18em, cream 85%) */}
      <span
        className="font-barlow text-cream/85 md:whitespace-nowrap md:text-right"
        style={{
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          opacity: 0.85,
          alignSelf: "baseline",
        }}
      >
        {course.pairing}
      </span>
    </motion.li>
  );
}

export function TastingMenuExperience() {
  const reduce = useReducedMotion();

  return (
    <section
      id="tasting"
      aria-labelledby="tasting-headline"
      data-header-theme="dark"
      className="grain relative overflow-hidden bg-mcu-espresso text-cream"
      style={{ padding: "clamp(5rem, 10vw, 8rem) 2rem" }}
    >
      {/* Soft honey radial glow at the top — Salt Block "solid color + subtle
          depth" treatment, mirroring our winter-specials pattern. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% -5%, rgba(212,163,115,0.10) 0%, transparent 60%)",
        }}
      />
      {/* Top decorative gold hairline (editorial "rule of thirds" cue) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/45 to-transparent"
      />
      {/* Bottom decorative gold hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/30 to-transparent"
      />

      <div className="relative mx-auto max-w-[1070px]">
        {/* Section header */}
        <header className="text-center">
          <Reveal delay={0.05}>
            <p
              className="font-barlow text-gold"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              Сезонное дегустационное меню
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <h2
              id="tasting-headline"
              className="mt-5 font-serif italic text-cream"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 500,
                lineHeight: 1.02,
                letterSpacing: "-0.015em",
              }}
            >
              Пять подач.
              <br />
              Одна история.
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <p
              className="mx-auto mt-6 text-cream"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "16px",
                lineHeight: 1.65,
                opacity: 0.7,
                maxWidth: "65ch",
              }}
            >
              Авторская дегустация, выстроенная вокруг сезонного продукта. Каждая
              подача — отдельный акт, объединённый одной идеей: еда как ритуал.
            </p>
          </Reveal>
        </header>

        {/* 5-course vertical list */}
        <ul className="mt-16 md:mt-20">
          {COURSES.map((course, i) => (
            <TastingRow key={course.num} course={course} index={i} />
          ))}
        </ul>

        {/* Footer seasonal note */}
        <Reveal delay={0.6}>
          <p
            className="mx-auto mt-12 text-center italic text-cream"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              lineHeight: 1.6,
              opacity: 0.6,
              maxWidth: "38rem",
            }}
          >
            Меню меняется каждые шесть недель, следуя за сезоном. Полное
            дегустационное меню — от 8 500 ₽/чел.
          </p>
        </Reveal>

        {/* Optional: reduced-motion inline fallback element so the note is
            always visible even if Reveal is short-circuited. */}
        {reduce && null}
      </div>
    </section>
  );
}
