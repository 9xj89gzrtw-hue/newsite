"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
  useReducedMotion,
  useScroll,
  type MotionValue,
} from "framer-motion";
import { ChefHat, Truck, ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

/**
 * Pillars — dual brand-pillar content section (Salt Block pattern:
 * "CHEF CRAFTED" / "FARM FRESH"). Adapted to:
 *   «ШЕФ-КРАФТ»  vs  «ВЫЕЗД-СЕРВИС».
 *
 * Two equal cards contrasting the two halves of the value proposition:
 * the craft of the kitchen vs. the logistics of field service.
 *
 * Each card now also carries two animated counters (CountUp via useMotionValue
 * + useTransform + useInView + animate). Lazy-triggered once when the card
 * scrolls into view at 40% visibility.
 *
 * PLUS pinned vertical scroll-stack (Awwwards 2026 / Pinch pattern):
 * a 200vh outer wrapper holds a sticky 100vh inner container where each
 * pillar cross-fades into the next as user scrolls. On reduced-motion or
 * mobile (< md), the pinned section is hidden and the grid is shown.
 */
const PILLARS = [
  {
    icon: ChefHat,
    eyebrow: "Кухня",
    title: "Шеф-крафт",
    desc: "Сезонные продукты с фермерских хозяйств, авторские рецепты, ручная сборка каждого блюда. Открытая кухня на мероприятии — гости видят процесс.",
    points: ["Сезонное меню", "Фермерские продукты", "Открытая кухня", "Авторская подача"],
    accent: "from-gold/15 to-terracotta/10",
    image: "/media/menu-banquet.jpg",
    stats: [
      { value: 16, suffix: "", label: "шеф-поваров" },
      { value: 2400, suffix: "+", label: "событий" },
    ],
  },
  {
    icon: Truck,
    eyebrow: "Сервис",
    title: "Выезд-сервис",
    desc: "Полная логистика под ключ: мебель, посуда, текстиль, техника, доставка и монтаж. Команда официантов и сомелье — на месте с утра до последнего гостя.",
    points: ["Мебель и текстиль", "Фарфор и стекло", "Доставка и монтаж", "Официанты и сомелье"],
    accent: "from-sage/15 to-gold/10",
    image: "/media/menu-buffet.jpg",
    stats: [
      { value: 12, suffix: "", label: "кейтеринг-машин" },
      { value: 50000, suffix: "+", label: "гостей" },
    ],
  },
];

type StatDef = { value: number; suffix?: string; label: string };

/**
 * CountUp — spring-driven count-up animation triggered once when the
 * element scrolls into view (40% visible). Uses framer-motion primitives
 * per task spec: useMotionValue + useTransform + useInView + animate().
 *
 * Reduced-motion: skip the animation, jump straight to the final value.
 *
 * NOTE: We fall back to a manual IntersectionObserver if `useInView` returns
 * false for too long (some hydration / SSR edge cases in Next 16 + React 19).
 */
function CountUp({
  value,
  suffix = "",
  label,
  duration = 1.8,
  prefersReducedMotion = false,
}: {
  value: number;
  suffix?: string;
  label: string;
  duration?: number;
  prefersReducedMotion?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const mv: MotionValue<number> = useMotionValue(0);
  // Fallback trigger: if framer-motion's useInView doesn't fire within 3s,
  // use a direct IntersectionObserver to set inViewFallback=true.
  const [inViewFallback, setInViewFallback] = useState(false);
  const effectiveInView = inView || inViewFallback;

  // ru-RU thousand separator (space) for big numbers like 50 000.
  const formatted = useTransform(mv, (latest) => {
    const rounded = Math.round(latest);
    return `${rounded.toLocaleString("ru-RU")}${suffix}`;
  });

  // Manual IntersectionObserver fallback (handles SSR / hydration edge cases).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInViewFallback(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!effectiveInView) return;
    if (prefersReducedMotion) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [effectiveInView, value, duration, prefersReducedMotion, mv]);

  return (
    <div className="flex flex-col">
      <motion.span
        ref={ref}
        className="font-display text-3xl leading-none text-ink md:text-4xl tabular-nums"
      >
        {formatted}
      </motion.span>
      <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/55">
        {label}
      </span>
    </div>
  );
}

/**
 * PinnedScrollStack — 200vh outer wrapper with sticky 100vh inner container.
 * Each pillar cross-fades into the next as user scrolls through. Includes:
 * - Progress dots (right side)
 * - Active pillar number (left side, vertical)
 * - Background image cross-fades (giant food photography)
 * - Foreground text cross-fades (eyebrow + title + description + stats)
 *
 * Reduced-motion: hidden (CSS `md:block` only when motion is OK).
 */
function PinnedScrollStack({
  pillars,
  prefersReducedMotion,
}: {
  pillars: typeof PILLARS;
  prefersReducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Each pillar's opacity is a slice of [0, 1]:
  // pillar 0: [0, 0.5] → opacity 1 at start, 0 at midpoint
  // pillar 1: [0.5, 1] → opacity 0 at midpoint, 1 at end
  // To make transitions smoother, use overlapping ranges.
  const p0Opacity = useTransform(scrollYProgress, [0, 0.4, 0.5], [1, 1, 0]);
  const p1Opacity = useTransform(scrollYProgress, [0.5, 0.6, 1], [0, 1, 1]);
  // Slight scale-in for incoming pillar
  const p0Scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.96]);
  const p1Scale = useTransform(scrollYProgress, [0.5, 1], [0.96, 1]);
  // Y drift for parallax depth
  const p0Y = useTransform(scrollYProgress, [0, 0.5], [0, -40]);
  const p1Y = useTransform(scrollYProgress, [0.5, 1], [40, 0]);
  // Background image zoom on each pillar
  const p0ImgScale = useTransform(scrollYProgress, [0, 0.5], [1.05, 1.15]);
  const p1ImgScale = useTransform(scrollYProgress, [0.5, 1], [1.05, 1.15]);

  const activeIdx = useTransform(scrollYProgress, (v) => (v < 0.5 ? 0 : 1));

  return (
    <div ref={ref} className="relative h-[200vh] hidden md:block">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {pillars.map((p, i) => {
          const Icon = p.icon;
          const opacity = i === 0 ? p0Opacity : p1Opacity;
          const scale = i === 0 ? p0Scale : p1Scale;
          const y = i === 0 ? p0Y : p1Y;
          const imgScale = i === 0 ? p0ImgScale : p1ImgScale;
          return (
            <motion.div
              key={p.title}
              className="absolute inset-0"
              style={{ opacity, scale, y }}
            >
              {/* Background image — full bleed */}
              <motion.div
                className="absolute inset-0"
                style={{ scale: imgScale }}
                aria-hidden="true"
              >
                <Image
                  src={p.image}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                />
                {/* Dark gradient overlay for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/70 to-ink/40" />
                {/* Brand-tinted overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${p.accent}`}
                />
              </motion.div>

              {/* Foreground content */}
              <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-5 md:px-8">
                <div className="max-w-2xl">
                  {/* Eyebrow + icon */}
                  <div className="flex items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-gold to-terracotta text-white shadow-lg shadow-gold/30">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
                      {p.eyebrow}
                    </span>
                  </div>

                  {/* Title — giant display */}
                  <motion.h3
                    className="mt-6 font-display uppercase leading-[0.95] text-cream"
                    style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
                  >
                    {p.title}
                  </motion.h3>

                  <p className="mt-5 max-w-lg text-base leading-relaxed text-cream/80 md:text-lg">
                    {p.desc}
                  </p>

                  <ul className="mt-6 grid max-w-md grid-cols-2 gap-x-4 gap-y-2">
                    {p.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-center gap-2 text-sm text-cream/75"
                      >
                        <span
                          aria-hidden="true"
                          className="inline-block size-1.5 rounded-full bg-gold"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>

                  {/* CountUp stats — cream/white text on dark bg */}
                  <div className="mt-7 grid max-w-md grid-cols-2 gap-4 border-t border-cream/20 pt-6">
                    {p.stats.map((stat: StatDef) => (
                      <div key={stat.label} className="flex flex-col">
                        <span className="font-display text-3xl leading-none text-cream md:text-4xl tabular-nums">
                          {stat.value.toLocaleString("ru-RU")}
                          {stat.suffix}
                        </span>
                        <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-cream/55">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Progress dots — right side */}
        <div className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex">
          {pillars.map((p, i) => (
            <ProgressDot
              key={p.title}
              label={p.title}
              index={i}
              activeIdx={activeIdx}
            />
          ))}
        </div>

        {/* Vertical "01 — 02" indicator — left side */}
        <motion.div
          className="absolute left-6 top-1/2 z-20 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-cream/70"
          style={{ writingMode: "vertical-rl" }}
          aria-hidden="true"
        >
          <ActiveNumber activeIdx={activeIdx} total={pillars.length} />
        </motion.div>
      </div>
    </div>
  );
}

/**
 * ProgressDot — a single dot that brightens + grows when its pillar is active.
 * Reads the activeIdx MotionValue to decide styling.
 */
function ProgressDot({
  label,
  index,
  activeIdx,
}: {
  label: string;
  index: number;
  activeIdx: MotionValue<number>;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const unsubscribe = activeIdx.on("change", (v) => {
      setIsActive(Math.round(v) === index);
    });
    // Initial check
    setIsActive(Math.round(activeIdx.get()) === index);
    return () => unsubscribe();
  }, [activeIdx, index]);

  return (
    <button
      ref={ref}
      type="button"
      className="group flex items-center gap-2"
      aria-label={`Показать «${label}»`}
      onClick={() => {
        // Scroll to this pillar's position in the pinned section
        const section = document.querySelector('[data-pillars-pinned="true"]');
        if (section) {
          const target = (index + 0.5) / 2; // 0.25 or 0.75 of scrollYProgress
          // Approximate scroll target: section start + (target * section height)
          const rect = section.getBoundingClientRect();
          const offsetTop = rect.top + window.scrollY;
          const sectionHeight = rect.height;
          window.scrollTo({
            top: offsetTop + target * sectionHeight,
            behavior: "smooth",
          });
        }
      }}
    >
      <span
        className={`block rounded-full transition-all duration-500 ${
          isActive
            ? "size-3 bg-gradient-to-r from-gold to-terracotta shadow-md shadow-gold/40"
            : "size-2 bg-cream/30 hover:bg-cream/60"
        }`}
      />
      <span
        className={`font-mono text-[10px] uppercase tracking-wider transition-colors duration-300 ${
          isActive ? "text-gold" : "text-cream/40 group-hover:text-cream/70"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

/**
 * ActiveNumber — renders "{current} — {total}" using the activeIdx MotionValue.
 */
function ActiveNumber({
  activeIdx,
  total,
}: {
  activeIdx: MotionValue<number>;
  total: number;
}) {
  const [current, setCurrent] = useState(1);
  useEffect(() => {
    const unsubscribe = activeIdx.on("change", (v) => {
      setCurrent(Math.round(v) + 1);
    });
    setCurrent(Math.round(activeIdx.get()) + 1);
    return () => unsubscribe();
  }, [activeIdx]);
  return (
    <span>
      {String(current).padStart(2, "0")} — {String(total).padStart(2, "0")}
    </span>
  );
}

export function Pillars() {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const sectionRef = useRef<HTMLElement>(null);

  // Show pinned stack only on desktop + when not reduced-motion + mounted
  const showPinned = mounted && !prefersReducedMotion;

  return (
    <section
      ref={sectionRef}
      aria-label="Наши принципы"
      data-header-theme="light"
      className="section-light relative overflow-hidden bg-white py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
              <span className="size-1.5 rounded-full bg-gold animate-pulse" />
              Два начала
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="mt-5 font-display text-ink"
              style={{ fontSize: "clamp(1.9rem, 5vw, 3.75rem)", lineHeight: 1.05 }}
            >
              Кухня и сервис —{" "}
              <span className="gradient-text italic">одно целое</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 text-base leading-relaxed text-ink/60">
              Идеальный праздник рождается, когда безупречная еда встречает
              безупречную подачу. Мы отвечаем за обе половины.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Pinned vertical scroll-stack (desktop + non-reduced-motion only) */}
      {showPinned && (
        <div data-pillars-pinned="true" className="mt-14">
          <PinnedScrollStack
            pillars={PILLARS}
            prefersReducedMotion={prefersReducedMotion ?? false}
          />
        </div>
      )}

      {/* Fallback grid (mobile / reduced-motion / pre-mount) */}
      {(!showPinned || !mounted) && (
        <div className="mx-auto mt-14 max-w-7xl px-5 md:px-8">
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.title} delay={i * 0.15}>
                  <motion.article
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border-line bg-cream-2 card-lift"
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  >
                    {/* Top image */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={p.image}
                        alt=""
                        aria-hidden="true"
                        className="size-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-cream-2 via-cream-2/40 to-transparent" />
                      {/* Icon badge */}
                      <div className="absolute bottom-4 left-4 flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-gold to-terracotta text-white shadow-lg shadow-gold/30">
                        <Icon className="size-5" />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col p-7 md:p-8">
                      <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
                        {p.eyebrow}
                      </span>
                      <h3 className="mt-2 font-display text-3xl text-ink md:text-4xl">
                        {p.title}
                      </h3>
                      <p className="mt-4 text-sm leading-relaxed text-ink/70 md:text-base">
                        {p.desc}
                      </p>

                      <ul className="mt-6 grid grid-cols-2 gap-2">
                        {p.points.map((point) => (
                          <li
                            key={point}
                            className="flex items-center gap-2 text-xs text-ink/65 md:text-sm"
                          >
                            <span
                              aria-hidden="true"
                              className="inline-block size-1.5 rounded-full bg-gold"
                            />
                            {point}
                          </li>
                        ))}
                      </ul>

                      {/* CountUp stats — spring-driven, lazy-triggered via useInView */}
                      <div className="mt-7 grid grid-cols-2 gap-4 border-t border-border-line pt-6">
                        {p.stats.map((stat: StatDef) => (
                          <CountUp
                            key={stat.label}
                            value={stat.value}
                            suffix={stat.suffix}
                            label={stat.label}
                            prefersReducedMotion={prefersReducedMotion ?? false}
                          />
                        ))}
                      </div>

                      <div className="mt-auto pt-8">
                        <a
                          href="#services"
                          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink transition-colors duration-300 hover:text-gold"
                        >
                          Узнать больше
                          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </a>
                      </div>
                    </div>
                  </motion.article>
                </Reveal>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
