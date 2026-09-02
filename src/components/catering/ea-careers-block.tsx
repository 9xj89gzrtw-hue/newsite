"use client";

import { useRef } from "react";
import type { ComponentProps } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { SmartImage } from "@/components/media/smart-image";
import "./ea-careers-block.css";

/**
 * EaCareersBlock — Cycle 28 ea-* editorial layer.
 *
 * First-class careers / recruitment section. Fills gap P0-3 (nilov catering
 * has NO careers section in the 33-section homepage flow — see
 * docs/WOLFGANG-PUCK-DESIGN-ANALYSIS.md §8 + §15). Catering is labor-
 * intensive — the company operates in SPb + Moscow + All-Russia, so
 * recruitment traffic could equal inquiry traffic in volume. This block
 * elevates recruitment to a first-class homepage conversion path,
 * mirroring how Wolfgang Puck Catering places "Now Hiring in a City Near
 * You" in the homepage flow between the World strip and the Footer.
 *
 * Adaptation of Wolfgang Puck's "Now Hiring" alternating CTA block to
 * nilov catering's EA editorial language:
 *   - Espresso dark surface (#1A1411 — warm coffee-black, slightly warmer
 *     than the pure-black bookend sections [29] philosophy quote + [33]
 *     final CTA — gives the dark beat a roasted warmth).
 *   - Cream text, EA red accents (#E71D3A — eyebrow, divider, bullets,
 *     stat numbers, primary CTA fill).
 *   - Italic-as-fragment trailing-phrase H2: "Работайте с *лучшими*."
 *     ("лучшими" italic + red — EA signature typographic device per
 *     EA-ANALYSIS.md §4.5).
 *   - 3 benefit bullets with red square markers.
 *   - CTA pair: primary `ОТКЛИКНУТЬСЯ` (solid red, white text → #contact)
 *     + secondary `СМОТРЕТЬ ВАКАНСИИ` (cream-outline, cream text →
 *     #contact, fills cream on hover with text flipping to espresso).
 *   - Stat strip: 3 inline stats (180+ команда / 16+ лет на рынке /
 *     2 400+ событий) with red numbers and thin red vertical dividers —
 *     reuses the numbers from CepRedStats + EaFounderStory for cross-
 *     section numeric consistency.
 *
 * Layout: full-bleed espresso section, 2-col 50/50 grid.
 *   - Desktop: text LEFT, image RIGHT. This mirrors the L-R-L-R
 *     alternating image rhythm — EaFounderStory photo LEFT [8],
 *     ChefPortrait photo LEFT [11], EaTastingCta photo LEFT [14] — so
 *     this block flips photo to the RIGHT to break the monotony.
 *   - Mobile: text first (DOM-order), image below (16:10 aspect,
 *     full-width). No `order` flip needed — DOM order produces the
 *     correct stack.
 *
 * Animation:
 *   - Image parallax-y on scroll (framer-motion `useScroll` on the
 *     section ref + `useTransform` mapping scroll progress [0, 1] →
 *     translateY ["-5%", "5%"]). The parallax layer is scaled 116%
 *     (inset: -8%) so the translate stays covered. Disabled under
 *     `prefers-reduced-motion` (no `style.y` passed — image sits static).
 *   - Text + stats fade-up 28px → 0 over 720ms with 80ms stagger on
 *     scroll-in (Motion `whileInView`, `viewport={{ once: true }}`).
 *   - Subtle hover zoom (1.04) on the image — applies to the `<img>`
 *     inside the parallax layer so it doesn't conflict with the parallax
 *     transform on the parent.
 *
 * Accessibility:
 *   - `<section aria-labelledby="ea-careers-block-headline">` landmark.
 *   - `data-header-theme="dark"` so the sticky site header flips to its
 *     light-on-dark variant while this section is in view.
 *   - Decorative bloom + hairlines + bullets + stat dividers marked
 *     `aria-hidden="true"`.
 *   - SmartImage enforces required `alt` (Russian, descriptive).
 *   - WCAG AA contrast: cream #F7F5F5 on espresso #1A1411 ≈ 14:1 ✓;
 *     cream/82 on espresso ≈ 11.5:1 ✓; cream/60 on espresso ≈ 8.4:1 ✓;
 *     EA red #E71D3A on espresso ≈ 5.0:1 — passes AA Large for the
 *     14px+ uppercase letter-spaced eyebrow + 2.1rem stat numbers
 *     (both qualify as large text per WCAG 1.4.3).
 *   - Touch targets ≥ 44px: both CTAs use `padding: 1.1em 2.4em` + explicit
 *     `min-height: 44px`.
 *   - Reduced-motion: parallax disabled, reveal animations become static
 *     (final state shown via scoped CSS `opacity: 1 !important`), hover
 *     zoom disabled.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Benefit bullets — original nilov catering copy, Russian only. */
const BENEFITS = [
  "Обучение у шеф-повара — от баз до авторской кухни",
  "События уровня Сбербанка, Яндекса и Газпрома в портфолио",
  "Гибкий график, сезонные проекты и рост внутри команды",
] as const;

/** Stat strip — reuses numbers from CepRedStats + EaFounderStory for
 *  cross-section numeric consistency (180+ команда · 16+ лет · 2 400+ событий). */
const STATS = [
  { num: "180+", label: "команда" },
  { num: "16+", label: "лет на рынке" },
  /* «2\u00A0400+» — неразрывный пробел: число не рвётся на переносе,
     формат тысяч единый с футером и строкой доверия (W1-A, nit о разнобое). */
  { num: "2\u00A0400+", label: "событий" },
] as const;

type MotionDivProps = ComponentProps<typeof motion.div>;
type MotionSpanProps = ComponentProps<typeof motion.span>;
type MotionH2Props = ComponentProps<typeof motion.h2>;
type MotionPProps = ComponentProps<typeof motion.p>;
type MotionLiProps = ComponentProps<typeof motion.li>;

export function EaCareersBlock() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax: drive the image's Y translate by the section's scroll
  // progress (start entering at the bottom → fully leaving at the top).
  // Reduced-motion: we skip the `style.y` prop entirely below, so the
  // parallax layer sits at translateY(0) — no motion.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  // Shared reveal-on-enter preset — fade-up 28px → 0 over 720ms with delay.
  // When reduced-motion is requested, returns `{}` so Motion renders the
  // element statically (scoped CSS keeps it visible via opacity:1 !important).
  const reveal = (
    delay: number,
  ): Partial<
    MotionDivProps & MotionSpanProps & MotionH2Props & MotionPProps & MotionLiProps
  > =>
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
      ref={sectionRef}
      id="careers"
      data-header-theme="dark"
      aria-labelledby="ea-careers-block-headline"
      className="ea-section ea-careers relative overflow-hidden"
    >
      {/* Warm red bloom — barely-there painterly depth on the espresso bg. */}
      <div className="ea-careers__bloom" aria-hidden="true" />

      {/* Top + bottom hairline rules — EA editorial divider discipline. */}
      <div
        className="ea-careers__hairline ea-careers__hairline--top"
        aria-hidden="true"
      />
      <div
        className="ea-careers__hairline ea-careers__hairline--bot"
        aria-hidden="true"
      />

      <div className="ea-container ea-container--wide">
        <div className="ea-careers__grid">
          {/* LEFT — text column ------------------------------------- */}
          <div className="ea-careers__text">
            <motion.span
              className="ea-eyebrow ea-careers__eyebrow"
              {...reveal(0)}
            >
              Команда · Карьера
            </motion.span>

            <motion.h2
              id="ea-careers-block-headline"
              className="ea-careers__h2"
              {...reveal(0.08)}
            >
              Работайте с <i className="ea-italic-fragment">лучшими</i>.
            </motion.h2>

            <motion.span
              className="ea-divider-red ea-careers__divider"
              {...reveal(0.16)}
            />

            <motion.p className="ea-careers__lead" {...reveal(0.24)}>
              nilov catering — это команда из 180+ поваров, официантов и
              организаторов. Мы растём и ищем людей, для которых еда — это
              призвание.
            </motion.p>

            <ul className="ea-careers__benefits">
              {BENEFITS.map((benefit, i) => (
                <motion.li
                  key={benefit}
                  className="ea-careers__benefit"
                  {...reveal(0.32 + i * 0.08)}
                >
                  <span className="ea-careers__bullet" aria-hidden="true" />
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>

            <motion.div className="ea-careers__cta-row" {...reveal(0.6)}>
              <Link
                href="#contact"
                className="ea-solid-btn ea-careers__btn-primary"
                aria-label="Откликнуться на вакансию — форма заявки"
              >
                Откликнуться
              </Link>
              <Link
                href="#contact"
                className="ea-careers__btn-outline"
                aria-label="Смотреть вакансии — форма заявки"
              >
                Смотреть вакансии
              </Link>
            </motion.div>

            {/* Stat strip — 3 inline stats, red numbers, red dividers.
                `aria-label` describes the row; no role=list (each stat is a
                pair of value + label, not a single list item). */}
            <motion.div
              className="ea-careers__stats"
              {...reveal(0.7)}
              aria-label={`Ключевые цифры nilov catering: 180+ команда, 16+ лет на рынке, 2\u00A0400+ событий`}
            >
              {STATS.map((stat, i) => (
                <div key={stat.label} className="ea-careers__stat">
                  <span className="ea-careers__stat-num">{stat.num}</span>
                  <span className="ea-careers__stat-label">{stat.label}</span>
                  {i < STATS.length - 1 && (
                    <span
                      className="ea-careers__stat-divider"
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — image column with parallax-y --------------------- */}
          <motion.div
            className="ea-careers__image-wrap"
            initial={reduce ? false : { opacity: 0, y: 36 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <div className="ea-careers__image-frame">
              {/* Parallax layer — scaled 116% (inset: -8%) so translateY
                  ±5% stays covered. Acts as the positioning context for
                  SmartImage `fill`. Reduced-motion: no `style.y` → static. */}
              <motion.div
                className="ea-careers__image-parallax"
                style={reduce ? undefined : { y: imageY }}
              >
                <SmartImage
                  src="/media/concept-crew.jpg"
                  alt="Команда поваров nilov catering за работой — приготовление блюд на выездном мероприятии"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="ea-careers__image"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default EaCareersBlock;
