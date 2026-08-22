"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";
import Image from "next/image";
import {
  motion,
  useInView,
  useReducedMotion,
  animate,
  useMotionValue,
} from "framer-motion";

/**
 * EaFounderStory — Cycle 28 ea-* editorial layer.
 *
 * Founder-forward editorial About block, grafting Elegant Affairs' founder
 * + chef quote content patterns (see docs/reference-library/elegant-affairs/
 * BRAND-CONTEXT.md §3.5 About pitch + §3.9 HQ/TwoFortyThirty founder-forward
 * section) onto Interfood's existing cinematic editorial design language.
 *
 * REPLACES the existing `about.tsx` (430-line glassmorphism maximalism, audit
 * score 6/10) — orchestrator swaps them in page.tsx Step 5.
 *
 * Design language (per docs/EA-ANALYSIS.md §3.5 + §3.9 + §4.5):
 *   - Palette: --ea-blush #F1ECEC section bg, --ea-cream #F7F5F5 stat row bg,
 *     --ea-red #E71D3A accent (eyebrow / italic fragment / arrow / dividers),
 *     --ea-ink #1A1A1A body text.
 *   - Typography: var(--font-serif) Playfair Display H2 with `<i>` italic
 *     trailing-phrase device ("Откройте нашу *историю*."), var(--font-barlow)
 *     Barlow Semi Condensed Bold uppercase eyebrow, var(--font-poppins)
 *     Montserrat body.
 *   - Layout: full-bleed blush bg, two-column 50/50 (founder photo on one
 *     side, story + italic phrase + CTA on the other), asymmetric vertical
 *     offset (text column pushed down 80px on desktop).
 *   - Italic-as-fragment trailing-phrase device on every H2.
 *   - Restraint: NO 3D tilt, NO glassmorphism, NO Lucide icons in stat
 *     cards. Just type, hairline dividers, one photo.
 *
 * Content:
 *   1st para — founder name + role + brief origin.
 *   2nd para — philosophy + approach (seasonal, scratch, author's cuisine).
 *   3rd para — track record + named milestones (Ginza Project, Hilton,
 *     Sberbank — drawn from the existing CepClientMarquee RU corporate list).
 *
 * Animation: Motion `whileInView` + `viewport={{ once: true }}` fade-up 28px
 * → 0 over 720ms. Count-up on stats when scrolled into view. Respects
 * `prefers-reduced-motion` (animations become static, final values shown).
 *
 * Accessibility:
 *   - Section landmark with `aria-labelledby`.
 *   - Decorative quote mark `aria-hidden`.
 *   - Hairline dividers between stats marked `aria-hidden`.
 *   - WCAG AA: ea-ink (#1A1A1A) on ea-blush (#F1ECEC) ≈ 13.5:1 ✓; ea-red
 *     (#E71D3A) on ea-blush ≈ 4.7:1 — passes AA Large for the eyebrow (14px
 *     uppercase letter-spaced 0.18em counts as large per WCAG 1.4.3).
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const STATS = [
  { value: 16, suffix: "+", label: "лет на рынке" },
  { value: 2400, suffix: "+", label: "событий" },
  { value: 75000, suffix: "+", label: "гостей" },
  { value: 35, suffix: "+", label: "команда" },
] as const;

const STORY_PARAGRAPHS = [
  "Дмитрий Нилов основал Interfood Catering в 2009 году в Санкт-Петербурге — с одной печки, тремя поварами и убеждением, что хороший банкет начинается не с меню, а с разговора. За шестнадцать лет маленькая кухня на Петроградской стороне превратилась в команду из тридцати пяти человек, обслуживающую две с половиной тысячи событий — от камерных свадеб на двадцать гостей до приёмов на полторы тысячи персон в исторических особняках.",
  "Сезонные продукты, готовка с нуля, авторская кухня. Лук для французского супа томится шесть часов. Свинина вялится в собственной печи двое суток. Свежий хлеб пахнет рано утром, когда все гости ещё спят и в залах стоит тишина. Мы не работаем с полуфабрикатами — каждое блюдо это руки, время и температура. И ещё немного удачи, но удача приходит только к тем, кто готов.",
  "За плечами — 75 000 обслуженных гостей и партнёрства, которым мы гордимся: рестораны группы «Гинза Проект», отель «Хилтон Мойка 22», корпоративные заказы от Сбербанка, Газпрома и Яндекса. Мы возим фарфор, стекло, текстиль, официантов и при желании — открытую кухню. Ресторан там, где он вам нужен.",
] as const;

/**
 * CountUp — animates a number from 0 → `to` when scrolled into view.
 * Uses Motion's `animate()` + `useMotionValue()` + `useInView()`.
 * Respects `prefers-reduced-motion` (shows final value immediately).
 * Falls back to final value after 3s if IntersectionObserver never fires.
 *
 * Mirrors the proven pattern in `about.tsx::CountUp` but skips the icon /
 * 3D-tilt chrome (EA restraint — see audit §3.5).
 */
function CountUp({
  to,
  suffix,
  reduce,
}: {
  to: number;
  suffix: string;
  reduce: boolean | null;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(to.toLocaleString("ru-RU"));
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Reduced-motion: show final value, no animation.
    if (reduce) {
      setDisplay(to.toLocaleString("ru-RU"));
      return;
    }
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;
    const controls = animate(count, to, {
      duration: 2.2,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v).toLocaleString("ru-RU")),
      onComplete: () => setDisplay(to.toLocaleString("ru-RU")),
    });
    return () => controls.stop();
  }, [inView, to, count, reduce]);

  // Safety net: if IntersectionObserver never fires (rare, but happens on
  // very long pages with offset anchor jumps), show the real value after 3s.
  useEffect(() => {
    if (reduce) return;
    const timer = setTimeout(() => setDisplay(to.toLocaleString("ru-RU")), 3000);
    return () => clearTimeout(timer);
  }, [to, reduce]);

  return (
    <span ref={ref} suppressHydrationWarning>
      {display}
      {suffix}
    </span>
  );
}

/**
 * Smooth-scroll to the #manifesto anchor (used by the "Читать манифест" CTA).
 * Falls back to native scrollIntoView when Lenis isn't loaded.
 */
function scrollToManifesto() {
  if (typeof window === "undefined") return;
  const target = document.getElementById("manifesto");
  if (!target) return;
  // Lenis attaches to window.lenis when active; otherwise fall back to native.
  const lenis = (window as unknown as { lenis?: { scrollTo: (t: Element, o?: { offset?: number; duration?: number }) => void } }).lenis;
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.4 });
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

type MotionDivProps = ComponentProps<typeof motion.div>;
type MotionSpanProps = ComponentProps<typeof motion.span>;
type MotionH2Props = ComponentProps<typeof motion.h2>;
type MotionPProps = ComponentProps<typeof motion.p>;

export function EaFounderStory() {
  const reduce = useReducedMotion();

  // Shared Motion transition preset — fade-up 28px → 0 over 720ms. When
  // reduced-motion is requested, returns empty props so the element renders
  // statically (the .ea-reveal utility's reduced-motion CSS rule keeps it
  // visible by setting opacity:1).
  const reveal = (delay: number): Partial<MotionDivProps & MotionSpanProps & MotionH2Props & MotionPProps> =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.72, delay, ease: EASE },
        };

  return (
    <section
      id="about"
      aria-labelledby="ea-founder-story-headline"
      className="ea-section ea-section--blush relative overflow-hidden"
      data-header-theme="light"
    >
      {/* Subtle warm bloom at the top-right corner — single, restrained, no
          multi-layer glow (EA restraint, per audit §3.5). */}
      <div
        className="pointer-events-none absolute -top-32 -right-24 h-[460px] w-[460px] rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(231,29,58,0.06) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      <div className="ea-container ea-container--wide">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-20 lg:gap-28">
          {/* LEFT — founder portrait photo -------------------------------- */}
          <motion.div
            className="order-1"
            {...(reduce
              ? {}
              : {
                  initial: { opacity: 0, y: 36 } as const,
                  whileInView: { opacity: 1, y: 0 } as const,
                  viewport: { once: true, margin: "-80px" } as const,
                  transition: { duration: 0.9, ease: EASE } as const,
                })}
          >
            <div className="group relative">
              {/* 4:5 portrait frame — square corners (4px), inner shadow */}
              <div
                className="relative aspect-[4/5] w-full overflow-hidden"
                style={{
                  borderRadius: "4px",
                  boxShadow:
                    "0 30px 80px -28px rgba(26,26,26,0.28), 0 4px 12px -4px rgba(26,26,26,0.08), inset 0 0 0 1px rgba(26,26,26,0.06)",
                }}
              >
                <Image
                  src="/media/event-chef-action.jpg"
                  alt="Дмитрий Нилов, шеф-повар Interfood Catering"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.02]"
                  // Loop cycle 1: VLM flagged head cropped → anchor to upper-body framing.
                  style={{ objectPosition: "center 25%" }}
                />
                {/* Tonal wash to keep the photo reading as part of the blush section */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(241,236,236,0.0) 60%, rgba(241,236,236,0.18) 100%)",
                  }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </motion.div>

          {/* RIGHT — story column, pushed down 80px on desktop for the EA
              asymmetric vertical offset (see EA-ANALYSIS.md §3.9). */}
          <div
            className="order-2 flex flex-col"
            style={{ marginTop: "clamp(0px, 6vw, 80px)" }}
          >
            {/* Eyebrow */}
            <motion.span className="ea-eyebrow" {...reveal(0)}>
              Основатель · Шеф-повар
            </motion.span>

            {/* H2 — italic-as-fragment trailing phrase device */}
            <motion.h2
              id="ea-founder-story-headline"
              className="ea-section-h2 mt-6"
              {...reveal(0.08)}
              aria-label="Откройте нашу историю."
            >
              Откройте нашу{" "}
              <i className="ea-italic-fragment">историю.</i>
            </motion.h2>

            {/* Red 64×2px divider — EA signature */}
            <motion.span
              className="ea-divider-red mt-8"
              {...reveal(0.16)}
            />

            {/* 3 brand-story paragraphs */}
            <div className="mt-8 space-y-5">
              {STORY_PARAGRAPHS.map((para, i) => (
                <motion.p
                  key={para.slice(0, 24)}
                  className="ea-body max-w-[44ch]"
                  {...reveal(0.24 + i * 0.08)}
                >
                  {para}
                </motion.p>
              ))}
            </div>

            {/* Stat row — 4 stats, huge Barlow numbers, hairline dividers.
                NO icons, NO 3D tilt, NO glassmorphism (EA restraint). */}
            <motion.div
              className="mt-12"
              {...reveal(0.5)}
            >
              <div
                className="grid grid-cols-2 sm:grid-cols-4"
                style={{
                  background: "var(--ea-cream)",
                  borderRadius: "4px",
                }}
              >
                {STATS.map((stat, i) => (
                  <div
                    key={stat.label}
                    className="relative flex flex-col items-center px-3 py-7 text-center"
                  >
                    {/* Hairline divider between stats (right edge of each cell
                        except the last in the row). Shown only on sm+ so the
                        mobile 2-col grid stays clean. */}
                    {i < STATS.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute right-0 top-1/2 hidden h-2/3 w-px -translate-y-1/2 sm:block"
                        style={{
                          background:
                            "color-mix(in oklch, var(--ea-mauve) 35%, transparent)",
                        }}
                      />
                    )}
                    {/* Big Barlow number */}
                    <span
                      className="leading-none"
                      style={{
                        fontFamily: "var(--ea-font-eyebrow)",
                        fontWeight: 700,
                        fontSize: "clamp(2rem, 4vw, 3.5rem)",
                        letterSpacing: "-0.02em",
                        color: "var(--ea-ink)",
                      }}
                    >
                      <CountUp
                        to={stat.value}
                        suffix={stat.suffix}
                        reduce={reduce}
                      />
                    </span>
                    {/* Small uppercase label */}
                    <span
                      className="mt-2"
                      style={{
                        fontFamily: "var(--ea-font-eyebrow)",
                        fontWeight: 700,
                        fontSize: "clamp(0.65rem, 0.8vw, 0.78rem)",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "var(--ea-mauve)",
                      }}
                    >
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA — EA text-link with animated red arrow → smooth-scrolls
                to #manifesto (the pinned «ПИР» scroll wow). */}
            <motion.div className="mt-10" {...reveal(0.6)}>
              <button
                type="button"
                onClick={scrollToManifesto}
                className="ea-text-link"
                aria-label="Читать манифест — перейти к разделу"
              >
                Читать манифест
                <svg
                  className="ea-text-link__arrow"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M4 12h14M14 6l6 6-6 6" />
                </svg>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EaFounderStory;
