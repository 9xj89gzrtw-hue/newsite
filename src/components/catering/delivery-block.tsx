"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";
import { TiltedAccent } from "@/components/catering/tilted-accent";
import { ClipPathReveal } from "@/components/motion/clip-path-reveal";
import { MagneticCircleButton } from "@/components/motion/magnetic-circle-button";
import { ArrowRight } from "lucide-react";

/**
 * DeliveryBlock — section #11 of the new site structure.
 *
 * Sits between the Algorithm section (#10) and the Calculator section (#12)
 * in the new client journey. A 2-col split: large food photo on the LEFT
 * (portrait aspect, hover-zoom `scale-[1.03]` over 700ms), content stack on
 * the RIGHT (TiltedAccent + eyebrow + italic-fragment H2 + body + 5 USP
 * bullets with inline SVG icons + 3-city geography row + 2 CTA pills).
 *
 * Data source: docs/service-packages/minimum-requirements.json
 *  - corporate_minimums.by_service_type.drop_off_with_setup:
 *    "15-25 person equivalent" minimum + "30-60 minutes typically" staff
 *    time → maps to the "60 минут" USP (delivery window) + "Минимум 10
 *    гостей" USP (drop-off minimum threshold floor).
 *  - corporate_minimums.by_service_type.full_service_plated_sit_down:
 *    "30-75 person equivalent" + "Service duration typically 4-6 hours" →
 *    supports the body's "корпоративных обедов на 500 гостей" upper bound.
 *  - geographic_delivery_minimums.local_area_within_10_miles:
 *    "Often free over minimum order" → supports the geography row claim.
 *
 * Design language (EA editorial layer grafted onto Interfood's cinematic
 * base — see docs/EA-ANALYSIS.md §3.5 / §4 wow #5):
 *  - var(--ea-cream) (#F7F5F5) full-bleed section bg.
 *  - var(--ea-red) on the H2 italic fragment ("доставляют") — auto-applied by
 *    the global `.ea-section-h2 i` rule.
 *  - var(--gold) on the eyebrow ("ДОСТАВКА КЕТЕРИНГА") and the 5 USP inline
 *    SVG icons (1.5px stroke, 24×24 viewBox, currentColor = gold).
 *  - var(--ink) body text @ 75% opacity, 1rem, line-height 1.7, max-w-md.
 *  - TiltedAccent "доставка" word in Marck Script, tilted -6°, marginalia
 *    above the eyebrow (gamma's signature tilt device — Cycle 31).
 *  - Italic-as-fragment trailing-phrase H2 device: "Кейтеринг, который
 *    <i>доставляют</i>." (EA signature §4 wow #5).
 *  - 2 CTA pills (rounded-full, px-6 py-3): primary solid-ink + white text;
 *    secondary 1px ink-outline + transparent bg + ink text. Both real <a>
 *    links to #contact / #calculator anchors.
 *
 * Animation: framer-motion staggered fade-up reveal on each element
 * (eyebrow → H2 → body → bullets → stats → CTAs), delays 0.08s apart,
 * duration 0.7s, ease [0.22, 1, 0.36, 1]. viewport={{ once: true,
 * margin: "-80px" }}. Respects `prefers-reduced-motion` (motion collapses to
 * `initial: false` so content is visible on mount with no transform).
 *
 * Accessibility:
 *  - Section `aria-label="Доставка кейтеринга"`.
 *  - `data-header-theme="light"` so the sticky header switches to its dark
 *    text variant over this bright cream section.
 *  - TiltedAccent is `aria-hidden` by its own implementation.
 *  - Decorative USP icons are `aria-hidden="true" focusable="false"`.
 *  - Photo alt text describes the scene (Russian, specific to Interfood).
 *  - CTAs are real `<a>` links to in-page anchors (no JS scroll hijacking).
 *
 * @see docs/EA-ANALYSIS.md §3.5 (About pitch) + §4 wow #5 (italic fragment)
 * @see docs/service-packages/minimum-requirements.json (delivery data)
 */

const EASE = [0.22, 1, 0.36, 1] as const;

type Usp = {
  /** Inline SVG fragment — 24×24 viewBox, 1.5px stroke, currentColor gold. */
  icon: ReactNode;
  /** Bold lead phrase (Barlow Semi Condensed Bold). */
  lead: string;
  /** Description following the em-dash. */
  description: string;
};

/**
 * Five USPs — drawn from the JSON's drop_off setup tier, regional minimums,
 * and rush-order policy. Each icon is a minimal line drawing — no fills,
 * no decorative flourishes, just the 1.5px stroke + gold accent that the
 * EA editorial layer reserves for "second-tier" emphasis (after red).
 */
const USP: Usp[] = [
  {
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5v5l3 2" />
      </>
    ),
    lead: "60 минут",
    description:
      "точное окно доставки с уведомлением за 30 минут до прибытия",
  },
  {
    icon: (
      <>
        <rect x="10" y="3" width="4" height="14" rx="2" />
        <circle cx="12" cy="17" r="2.5" />
        <path d="M14.5 6.5h2M14.5 9.5h2M14.5 12.5h2" />
      </>
    ),
    lead: "Горячее / холодное",
    description: "термоупаковка сохраняет температуру 4 часа",
  },
  {
    icon: (
      <>
        <path d="M4 17h16" />
        <path d="M5.5 17a6.5 6.5 0 0 1 13 0" />
        <path d="M12 5.5v2" />
      </>
    ),
    lead: "С сервировкой",
    description: "курьер-официант бесплатно расставит блюда",
  },
  {
    icon: (
      <>
        <circle cx="8" cy="9" r="2.5" />
        <circle cx="16" cy="9" r="2.5" />
        <path d="M3 19c0-3 2-5 5-5s5 2 5 5" />
        <path d="M11 19c0-3 2-5 5-5s5 2 5 5" />
      </>
    ),
    lead: "Минимум 10 гостей",
    description: "заказы от 10 человек, без ограничений по максимуму",
  },
  {
    icon: (
      <>
        <rect x="3.5" y="5" width="17" height="15" rx="2" />
        <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
        <path d="M8.5 14.5l2.5 2.5 4-4.5" />
      </>
    ),
    lead: "В тот же день",
    description: "при заказе до 11:00 возможна доставка в день обращения",
  },
];

const GEOGRAPHY = ["Санкт-Петербург", "Москва", "Вся Россия"] as const;

type RevealProps = { delay: number };

export function DeliveryBlock() {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  // Gate reduced-motion on mount to avoid SSR/CSR hydration mismatch
  // (see AGENTS.md §14 грабли #8 — useReducedMotion returns null on server).
  const reduce = mounted && reduceMotion;

  /**
   * Reveal-on-scroll helper — fade-up 24px → 0, staggered 0.08s between
   * siblings. When reduced-motion is requested, returns `{ initial: false }`
   * so framer-motion skips animation entirely (content visible on mount).
   */
  const reveal = ({ delay }: RevealProps) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 24 } as const,
          whileInView: { opacity: 1, y: 0 } as const,
          viewport: { once: true, margin: "-80px" } as const,
          transition: { duration: 0.7, delay, ease: EASE } as const,
        };

  return (
    <section
      aria-label="Доставка кейтеринга"
      data-header-theme="light"
      className="ea-section ea-section--cream"
    >
      <div className="ea-container ea-container--wide">
        {/* 2-col grid: photo LEFT, content RIGHT on md+. Mobile stacks
            photo on top, content below. The rounded-[4px] clip + overflow
            hidden wraps the photo corners (EA 4px radius convention). */}
        <div className="grid grid-cols-1 overflow-hidden rounded-[4px] md:grid-cols-2">
          {/* LEFT — full-bleed food photo, portrait aspect, hover-zoom on
              the wrapping `group`. Photo is decorative content (not the
              H2's referent) — alt text describes the scene for screen
              readers without claiming it as a heading.

              Cycle 34 (sondaven.com graft): photo now reveals via a
              directional `clip-path: inset()` mask (right→left open) with a
              subtle inner zoom (1.15 → 1.0) — the Sondaven / Floema signature
              photo reveal. Replaces the previous fade-up. The existing
              `group-hover:scale-[1.03]` on the <Image> composes with the
              clip-reveal's inner scale (they stack — reveal scale resolves
              first, then hover scale layers on top). */}
          <ClipPathReveal
            direction="right"
            duration={1.0}
            className="group relative order-1 aspect-[4/5] md:order-1 md:aspect-[3/4]"
          >
            <Image
              src="/media/menu-office-lunch.jpg"
              alt="Корпоративный обед от Interfood Catering — выкладка блюд на столе в офисе, тёплый свет, фарфор, салаты и закуски"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            />
            {/* Subtle tonal wash at the bottom — keeps the photo reading
                as part of the cream section (no harsh edge). Decorative. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(247,245,245,0) 70%, rgba(247,245,245,0.10) 100%)",
              }}
            />
          </ClipPathReveal>

          {/* RIGHT — content stack with its own padded interior (per spec:
              px-6 py-12 on mobile, md:p-16 on desktop). The cream section
              bg shows through so the photo and content read as one block. */}
          <div className="order-2 flex flex-col px-6 py-12 md:order-2 md:p-16">
            {/* TiltedAccent — decorative marginalia above the eyebrow.
                Aria-hidden by its own implementation. */}
            <motion.div className="mb-2" {...reveal({ delay: 0 })}>
              <TiltedAccent text="доставка" />
            </motion.div>

            {/* Eyebrow — Barlow Semi Condensed Bold uppercase 0.85rem gold.
                Overrides the default `.ea-eyebrow` red because the spec
                reserves red for the italic H2 fragment + TiltedAccent
                (so gold carries the eyebrow + icon accent on this section). */}
            <motion.p
              className="ea-eyebrow"
              style={{
                color: "var(--gold)",
                fontSize: "0.85rem",
                letterSpacing: "0.18em",
              }}
              {...reveal({ delay: 0.08 })}
            >
              ДОСТАВКА КЕЙТЕРИНГА
            </motion.p>

            {/* H2 — italic-as-fragment trailing phrase device. The `<i>`
                tag is auto-styled red + italic by the global
                `.ea-section-h2 i` rule in globals.css. */}
            <motion.h2
              className="ea-section-h2 mt-5"
              {...reveal({ delay: 0.16 })}
            >
              Кейтеринг, который <i>доставляют</i>.
            </motion.h2>

            {/* Body paragraph — 1rem, ink @ 75% opacity, line-height 1.7,
                max-w-md so it stays a comfortable reading column. */}
            <motion.p
              className="mt-6"
              style={{
                fontFamily: "var(--ea-font-body)",
                fontSize: "1rem",
                lineHeight: 1.7,
                color: "var(--ink)",
                opacity: 0.75,
                maxWidth: "28rem",
              }}
              {...reveal({ delay: 0.24 })}
            >
              Горячие блюда, красиво упакованные и доставленные к вашему
              столу — в офис, на производство или домой. От фуршетов на 10
              человек до корпоративных обедов на 500 гостей. Собственное
              оборудование для термоупаковки и команда курьеров-официантов.
            </motion.p>

            {/* 5 USPs — each row: 1.5px-stroke gold SVG icon (24×24, shrink-0)
                + a Barlow Semi Condensed Bold lead phrase + em-dash +
                regular-weight description. Staggered 0.08s between rows. */}
            <ul className="mt-8 space-y-4">
              {USP.map((u, i) => (
                <motion.li
                  key={u.lead}
                  className="flex items-start gap-3"
                  {...reveal({ delay: 0.32 + i * 0.08 })}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                    className="mt-[0.15em] shrink-0"
                  >
                    {u.icon}
                  </svg>
                  <p
                    style={{
                      fontFamily: "var(--ea-font-eyebrow)",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      lineHeight: 1.55,
                      letterSpacing: "0.01em",
                      color: "var(--ink)",
                    }}
                  >
                    {u.lead}
                    <span
                      style={{
                        fontFamily: "var(--ea-font-body)",
                        fontWeight: 400,
                        opacity: 0.75,
                      }}
                    >
                      {" — "}
                      {u.description}
                    </span>
                  </p>
                </motion.li>
              ))}
            </ul>

            {/* Geography row — 3 cities, Barlow Semi Condensed Bold
                uppercase 0.75rem, separated by a gold · character. Sits
                below the bullets as a subtle mini-info strip. */}
            <motion.div
              className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-1"
              {...reveal({ delay: 0.8 })}
            >
              {GEOGRAPHY.map((city, i) => (
                <span
                  key={city}
                  style={{
                    fontFamily: "var(--ea-font-eyebrow)",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--ink)",
                    opacity: 0.85,
                  }}
                >
                  {city}
                  {i < GEOGRAPHY.length - 1 && (
                    <span
                      aria-hidden="true"
                      style={{ marginLeft: "0.5rem", color: "var(--gold)" }}
                    >
                      ·
                    </span>
                  )}
                </span>
              ))}
            </motion.div>

            {/* CTAs — 2 pills (rounded-full, px-6 py-3). Primary = solid ink
                bg + white text → #contact. Secondary = 1px ink outline +
                transparent bg + ink text → #calculator. Both are real <a>
                links (no JS), so keyboard nav + middle-click + SEO all work.

                Cycle 34 (sondaven.com graft): a circular magnetic CTA is
                placed alongside the pills — Sondaven `btn-circle` 3-tier
                magnetic (bg scales + inner label translates 0.3× toward
                cursor via spring). The espresso-variant gold-rim circle
                carries the primary "arrow" affordance; the text pills
                remain for explicit Russian CTA copy. */}
            <motion.div
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
              {...reveal({ delay: 0.88 })}
            >
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-center transition-transform duration-200 hover:-translate-y-0.5"
                style={{
                  background: "var(--ink)",
                  color: "var(--ea-white, #FFFFFF)",
                  fontFamily: "var(--ea-font-eyebrow)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  border: "1px solid var(--ink)",
                }}
              >
                Заказать доставку
              </a>
              <a
                href="#calculator"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-center transition-colors duration-200 hover:bg-[color-mix(in_oklch,var(--ink)_6%,transparent)]"
                style={{
                  background: "transparent",
                  color: "var(--ink)",
                  fontFamily: "var(--ea-font-eyebrow)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  border: "1px solid var(--ink)",
                }}
              >
                Рассчитать стоимость
              </a>
              <MagneticCircleButton
                href="#contact"
                ariaLabel="Заказать доставку кейтеринг"
                variant="espresso"
                size={64}
                className="self-start sm:self-center"
              >
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </MagneticCircleButton>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DeliveryBlock;
