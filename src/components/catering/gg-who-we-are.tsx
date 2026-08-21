"use client";

/**
 * GgWhoWeAre — ggcatering.com "Who We Are" pattern, adapted to interfood.
 *
 * Editorial section composed of:
 *  - Background image collage (yellow triangle + two catering photos + lime circle)
 *  - Vertical-line eyebrow that grows from 0 → 80px when scrolled into view
 *  - Tagline ("Кто мы")
 *  - Massive rotating adjectives (Poppins semibold, vertical word-cycle wow effect)
 *  - Manifesto paragraph (Russian)
 *  - Three count-up stat cells (years on market, events delivered, retention %)
 *
 * Respects `prefers-reduced-motion`:
 *   - rotating adjective is frozen on the first word
 *   - count-up snaps to final value
 *   - vertical line is shown without transition
 *
 * Uses the `.gg-*` CSS tokens defined in the
 * "Cycle 22 — Global Gourmet (ggcatering.com) Style Module" block of globals.css.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

/* ------------------------------------------------------------------ */
/* Rotating adjective — vertical word-cycle wow effect                  */
/* ------------------------------------------------------------------ */

function GgRotatingAdjective({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % words.length), 2400);
    return () => clearInterval(id);
  }, [reduce, words.length]);

  return (
    <span className="gg-rotating-text-wrap block min-h-[1em]">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[idx]}
          initial={{ y: reduce ? 0 : "60%", opacity: reduce ? 1 : 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: reduce ? 0 : "-60%", opacity: reduce ? 1 : 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="gg-rotating-text-track block gg-italic text-[var(--gg-charcoal-dark)]"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          {words[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Stat cell — count-up when scrolled into view                        */
/* ------------------------------------------------------------------ */

function GgStat({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const reduce = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(count, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
    });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [inView, value, reduce, count, rounded]);

  return (
    <div>
      <div
        className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--gg-charcoal-dark)]"
        style={{ fontFamily: "var(--font-poppins)" }}
      >
        <span ref={ref}>
          {display.toLocaleString("ru-RU")}
          {suffix}
        </span>
      </div>
      <div className="gg-tagline mt-2">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main section                                                        */
/* ------------------------------------------------------------------ */

const ADJECTIVES = [
  "сочные",
  "инстаграмные",
  "сочные",
  "осознанные",
  "игристые",
  "люксовые",
  "вкуснейшие",
  "нежные",
  "трендовые",
  "оригинальные",
  "вкусные",
  "восхитительные",
  "утончённые",
  "беспрецедентные",
  "забавные",
  "дерзкие",
  "яркие",
  "амброзийные",
  "острые",
  "волнительные",
  "индивидуальные",
  "сочные",
] as const;

export default function GgWhoWeAre() {
  const lineRef = useRef<HTMLSpanElement>(null);
  const lineInView = useInView(lineRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.classList.toggle("is-in", lineInView);
    }
  }, [lineInView]);

  return (
    <section
      id="gg-who-we-are"
      className="relative w-full bg-white py-12 text-[var(--gg-charcoal-dark)] lg:py-16 overflow-hidden"
    >
      {/* ---------------------------------------------------------- */}
      {/* Background image collage — absolute, behind content         */}
      {/* ---------------------------------------------------------- */}
      <div
        className="pointer-events-none absolute inset-0 z-0 grid grid-cols-5 grid-rows-4 opacity-60"
        aria-hidden="true"
      >
        {/* Light-yellow triangle SVG (top-left) */}
        <div className="relative col-start-1 row-start-1">
          <svg
            className="absolute h-full w-full text-[var(--gg-light-yellow)]"
            viewBox="0 0 256 221"
            fill="none"
            aria-hidden="true"
          >
            <path d="M0 0L256 221H0L0 0Z" fill="currentColor" />
          </svg>
        </div>

        {/* Two large catering images as collage */}
        <div className="relative col-start-2 col-span-2 row-start-1 row-span-3 overflow-hidden">
          <Image
            src="/media/gamma-private-event.webp"
            alt="Частное торжество от Interfood Catering"
            fill
            sizes="40vw"
            className="object-contain"
          />
        </div>
        <div className="relative col-start-4 col-span-2 row-start-2 row-span-3 overflow-hidden">
          <Image
            src="/media/ridgewells-servers.webp"
            alt="Сервировка стола официантами Interfood"
            fill
            sizes="40vw"
            className="object-contain"
          />
        </div>

        {/* Lime circle SVG */}
        <div className="col-start-1 row-start-3 flex items-center justify-center">
          <svg
            className="h-28 w-28 text-[var(--gg-lime)]"
            viewBox="0 0 128 128"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="64" cy="64" r="64" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Foreground content                                          */}
      {/* ---------------------------------------------------------- */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        {/* Vertical line + tagline */}
        <div className="relative mb-8 pt-24">
          <span
            ref={lineRef}
            className="gg-vertical-line"
            aria-hidden="true"
          />
          <h2 className="gg-tagline">Кто мы</h2>
        </div>

        {/* Massive rotating adjectives */}
        <div
          className="text-4xl leading-tight font-semibold sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          <GgRotatingAdjective words={[...ADJECTIVES]} />
          <span className="mt-3 block text-[var(--gg-ash)]">
            кейтеринг для тех, кто любит еду
          </span>
        </div>

        {/* Short manifesto paragraph */}
        <p
          className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[var(--gg-charcoal-dark)]/80 md:text-lg"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          Interfood Catering — это команда шеф-поваров, кондитеров и сомелье,
          создающих выездные банкеты, фуршеты и корпоративные ужины с 2014 года.
          Мы превращаем еду в эмоцию, а событие — в ритуал.
        </p>

        {/* Stat counter row */}
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-6 md:gap-8">
          <GgStat value={11} suffix=" лет" label="Опыт на рынке СПб" />
          <GgStat value={2400} suffix="+" label="Событий под ключ" />
          <GgStat value={98} suffix="%" label="Возвращаются снова" />
        </div>
      </div>
    </section>
  );
}
