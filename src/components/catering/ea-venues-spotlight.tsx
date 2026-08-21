"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/**
 * EaVenuesSpotlight — Cycle 28, Task 4-D.
 *
 * REPLACES McuVenues (mculinary 3-up square 1:1 cream cards) in the client
 * journey. Full-bleed 16:10 venue cards in a 3-column grid with hover
 * effects + named venue + capacity.
 *
 * EA design language grafted:
 *  - §3.9 (HQ / TwoFortyThirty as venue callout — full-bleed photo +
 *    venue name + capacity + "see all events at this venue" link).
 *  - §3.10 / §3.11 ("Let's Party / Our Events" 3-column event-card grid
 *    with hover-zoom `transform: scale(1.1)` + bottom dark overlay panel
 *    + white uppercase H4 venue category).
 *  - Italic-as-fragment trailing phrase ("Где мы <i>работаем</i>.") —
 *    EA's signature H2 device (§4 wow moment #5).
 *  - Eyebrow + H2 + bottom ea-text-link rhythm.
 *
 * Palette: `--ea-cream` (#F7F5F5) section bg. `--ea-red` accent on the
 * per-card "Смотреть события →" hover-link. `--ea-shadow-cream` shadow
 * on each card. White-on-dark caption (Playfair Display + Barlow Semi
 * Condensed Bold). Italic fragment in `--ea-red`.
 *
 * Component is self-contained — uses shared EA utility classes from
 * globals.css (.ea-section, .ea-section--cream, .ea-container,
 * .ea-container--wide, .ea-eyebrow, .ea-section-h2, .ea-text-link,
 * .ea-text-link__arrow) + Tailwind classes + inline styles for the
 * card-specific aspect-ratio, border-radius, gradient overlay, and
 * per-element typography.
 *
 * Animation: framer-motion `whileInView` fade-up reveal on the eyebrow,
 * H2, and each card (stagger 0.08s). `useReducedMotion()` short-circuits
 * to `initial={false}` (no animation, content visible on mount). CSS
 * `@media (prefers-reduced-motion: reduce)` global rule disables the
 * hover-zoom transform on the image (handled by the absence of the
 * Tailwind `transition-transform` class — the transform still applies
 * but without smooth motion).
 *
 * Card structure:
 *  <article.group relative overflow-hidden aspect-16/10 radius-4 shadow>
 *    <Image fill object-cover group-hover:scale-[1.05] />
 *    <div absolute inset-0 gradient(rgba(0,0,0,0)→rgba(0,0,0,0.75)) />
 *    <div absolute inset-x-0 bottom-0 p-5 group-hover:-translate-y-2>
 *      <p capacity tag (Barlow uppercase 0.75rem cream/85)>
 *      <h3 venue name (Playfair 1.5rem white)>
 *      <a see-more link (Barlow 0.75rem red, opacity-0 → group-hover:opacity-100)>
 *    </div>
 *  </article>
 *
 * @see docs/EA-ANALYSIS.md §3.9, §3.10, §3.11, §4 wow #5
 * @see docs/CYCLE-28-COMPONENT-AUDIT.md §3.1.7 (mcu-venues RESTYLE brief),
 *      §7.4 (ea-venues-spotlight spec)
 * @see docs/reference-library/elegant-affairs/BRAND-CONTEXT.md §2.5
 *      (60-venue partner network page — EA's strongest B2B credibility asset)
 */

type Venue = {
  /** `/public/media/...` path — already exists in repo. */
  src: string;
  /** Descriptive alt text for screen readers (Russian). */
  alt: string;
  /** Venue name (Playfair Display 1.5rem, white). */
  name: string;
  /** Capacity tag — Barlow Semi Condensed Bold uppercase 0.75rem, cream/85. */
  capacity: string;
  /** Short district / neighborhood tag (appended to capacity with · separator). */
  district: string;
};

const VENUES: Venue[] = [
  {
    src: "/media/event-01.png",
    alt: "Ленэкспо — крупнейший выставочный зал Санкт-Петербурга, банкеты до 1200 гостей.",
    name: "Ленэкспо",
    capacity: "1200 ГОСТЕЙ",
    district: "Васильевский остров",
  },
  {
    src: "/media/event-05.jpg",
    alt: "Ташир Плаза — корпоративная банкетная площадка на 350 гостей в деловом центре.",
    name: "Ташир Плаза",
    capacity: "350 ГОСТЕЙ",
    district: "Адмиралтейский",
  },
  {
    src: "/media/event-09.jpg",
    alt: "Усадьба «Коттедж» — загородный банкетный комплекс в Курортном районе, 180 гостей.",
    name: "Усадьба «Коттедж»",
    capacity: "180 ГОСТЕЙ",
    district: "Курортный район",
  },
];

type RevealProps = { delay: number };

export function EaVenuesSpotlight() {
  const reduce = useReducedMotion();

  /** Reveal-on-scroll helper — fade-up + 0.08s stagger per child. */
  const reveal = ({ delay }: RevealProps) =>
    reduce
      ? { initial: false as const, whileInView: undefined }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.7, delay, ease: "easeOut" as const },
        };

  return (
    <section
      aria-label="Площадки — избранное"
      className="ea-section ea-section--cream"
    >
      <div className="ea-container ea-container--wide">
        {/* Header */}
        <div className="mb-14 text-center">
          <motion.p className="ea-eyebrow mb-3" {...reveal({ delay: 0 })}>
            ПЛОЩАДКИ · ИЗБРАННОЕ
          </motion.p>
          <motion.h2 className="ea-section-h2" {...reveal({ delay: 0.08 })}>
            Где мы <i>работаем</i>.
          </motion.h2>
        </div>

        {/* 3-up full-bleed 16:10 venue cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {VENUES.map((v, i) => (
            <motion.article
              key={v.name}
              className="group relative overflow-hidden focus-within:outline-none"
              style={{
                aspectRatio: "16 / 10",
                borderRadius: "4px",
                boxShadow: "var(--ea-shadow-cream)",
              }}
              {...reveal({ delay: 0.16 + i * 0.08 })}
            >
              {/* Full-bleed image — scale(1.05) on hover over 700ms. */}
              <Image
                src={v.src}
                alt={v.alt}
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] group-focus-within:scale-[1.05]"
              />

              {/* Bottom gradient overlay (rgba(0,0,0,0) → rgba(0,0,0,0.75)).
                  Acts as the contrast scrim behind the caption text. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0) 65%)",
                }}
              />

              {/* Bottom caption panel — slides up 8px on hover/focus. */}
              <div className="absolute inset-x-0 bottom-0 p-5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2 group-focus-within:-translate-y-2">
                {/* Capacity + district tag — Barlow Semi Condensed Bold
                    uppercase 0.75rem, cream @ 85% opacity. */}
                <p
                  className="mb-2"
                  style={{
                    fontFamily: "var(--ea-font-eyebrow)",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--ea-cream)",
                    opacity: 0.85,
                  }}
                >
                  {v.capacity} · {v.district}
                </p>

                {/* Venue name — Playfair Display 1.5rem white. */}
                <h3
                  style={{
                    fontFamily: "var(--ea-font-display)",
                    fontWeight: 400,
                    fontSize: "1.5rem",
                    lineHeight: 1.15,
                    color: "#FFFFFF",
                  }}
                >
                  {v.name}
                </h3>

                {/* "Смотреть события →" red text-link — fades in on hover/focus.
                    pointer-events-none by default so the invisible link
                    doesn't capture stray clicks; re-enabled on hover and
                    on focus-within so keyboard tab → link becomes visible
                    AND clickable. */}
                <a
                  href="#ea-venue-network"
                  className="mt-3 inline-flex items-center gap-2 opacity-0 transition-opacity duration-500 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto"
                  style={{ color: "var(--ea-red)" }}
                >
                  <span
                    style={{
                      fontFamily: "var(--ea-font-eyebrow)",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                    }}
                  >
                    Смотреть события
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M4 12h14M14 6l6 6-6 6" />
                  </svg>
                </a>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Bottom-of-section — single ea-text-link → #ea-venue-network
            (the next section in the client journey, EaVenueNetwork). */}
        <div className="mt-12 flex justify-center">
          <a href="#ea-venue-network" className="ea-text-link">
            Смотреть все 60+ площадок
            <svg
              className="ea-text-link__arrow"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M4 12h14M14 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

export default EaVenuesSpotlight;
