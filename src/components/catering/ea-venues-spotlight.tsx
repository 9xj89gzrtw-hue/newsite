"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ClipPathReveal } from "@/components/motion/clip-path-reveal";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";

/**
 * EaVenuesSpotlight — Cycle 28 + Task 6-a (SHOWPIECE).
 *
 * TRANSFORMED from a 3-up static card grid into a Sondaven-style pinned
 * horizontal-scroll map section (`pin_vector` pattern). User scrolls
 * vertically; the section pins (CSS sticky) and the row of venue cards
 * slides horizontally across a stylized SVG travel-map backdrop with
 * pulsing location pins. Theme flips to espresso for the duration of
 * the pin so the cream/gold card text pops.
 *
 * Three-element pin (Lando Norris `pin-spacer / pin-sticky / pin-wrap`):
 *   <section h-[300vh]>              pin-spacer (scroll distance)
 *     <div sticky top-0 h-screen>    pin-sticky (stays pinned)
 *       <motion.div style={{ x }}>    pin-wrap (translates -66% horizontally)
 *         <svg map/> + <VenueCard/> × 3
 *       </motion.div>
 *     </div>
 *   </section>
 *
 * `useScroll({ target: sectionRef, offset: ['start start', 'end end'] })`
 * drives `x` from 0% → -66% (3 cards × 44vw = 132vw row → -66% reveals all).
 *
 * Per-card subtle scale (1.0 → 1.03 → 1.0) as it passes through viewport
 * center — the Sondaven "card focus on center" effect.
 *
 * Reduced motion: renders the original 3-up cream grid (preserves all
 * content + accessibility).
 *
 * @see docs/SONDAVEN-WOW-RESEARCH.md §Effect #3 (PinnedHorizontalMap)
 * @see docs/EA-ANALYSIS.md §3.9, §3.10, §3.11, §4 wow #5 (EA origin)
 */

type Venue = {
  /** `/public/media/...` path — already exists in repo. */
  src: string;
  /** Descriptive alt text for screen readers (Russian). */
  alt: string;
  /** Venue name (Playfair Display, white on photo scrim). */
  name: string;
  /** Capacity tag — Barlow Semi Condensed Bold uppercase, cream/85. */
  capacity: string;
  /** Short district / neighborhood tag (appended to capacity with ·). */
  district: string;
  /**
   * Travel-planner label (Sondaven `pin_vector` signature) — gold
   * uppercase Barlow. Conveys the geographic reach narrative:
   * SPb studio → Moscow via Sapsan → all-Russia traveling team.
   */
  travel: string;
};

const VENUES: Venue[] = [
  {
    src: "/media/event-01.png",
    alt: "Ленэкспо — крупнейший выставочный зал Санкт-Петербурга, банкеты до 1200 гостей.",
    name: "Ленэкспо",
    capacity: "1200 ГОСТЕЙ",
    district: "Васильевский остров",
    travel: "Санкт-Петербург · студия",
  },
  {
    src: "/media/event-05.jpg",
    alt: "Ташир Плаза — корпоративная банкетная площадка на 350 гостей в деловом центре.",
    name: "Ташир Плаза",
    capacity: "350 ГОСТЕЙ",
    district: "Адмиралтейский",
    travel: "Москва · 4 ч на Сапсане",
  },
  {
    src: "/media/event-09.jpg",
    alt: "Усадьба «Коттедж» — загородный банкетный комплекс в Курортном районе, 180 гостей.",
    name: "Усадьба «Коттедж»",
    capacity: "180 ГОСТЕЙ",
    district: "Курортный район",
    travel: "Вся Россия · выездная команда",
  },
];

/** Map dot positions in % of row width — aligns with each card's center. */
const DOT_POSITIONS = [16.66, 50, 83.33] as const;
/** Cyrillic travel-planner pin labels (СПб / МСК / RU). */
const PIN_LABELS = ["СПб", "МСК", "RU"] as const;
/** Local class for the dark-bg headline (Playfair + cream + size). */
const HEADLINE_CLASS = "ea-venues-spotlight__headline";

export function EaVenuesSpotlight() {
  const reduce = useReducedMotion();
  if (reduce) return <StaticVenues />;
  return <PinnedVenues />;
}

/* ============================ PINNED VERSION ============================ */

/**
 * PinnedVenues — Sondaven `pin_vector` horizontal-scroll section.
 *
 * `data-theme-flip="espresso"` lives on the inner sticky div (NOT the
 * outer 300vh section) because ThemeFlipProvider's IntersectionObserver
 * fires on a central 20% rootMargin band. The sticky div stays at
 * viewport-top for the entire pin duration so its middle (50vh) sits in
 * that band throughout — the espresso theme holds for the whole pin,
 * not just the middle 33%. (Putting the flip on the 300vh outer section
 * would cause the theme to flip ON at 33% of the pin and OFF at 67%,
 * producing a jarring double-flip mid-scroll.)
 */
function PinnedVenues() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Row slides from 0% → -66% (3 cards × 44vw row → -66% reveals all 3).
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66%"]);

  return (
    <section
      ref={sectionRef}
      aria-label="Где мы работаем"
      className="relative h-[300vh]"
    >
      <div
        className="sticky top-0 h-screen overflow-hidden"
        data-theme-flip="espresso"
      >
        {/* Vertical layout: headline (top) | card row (middle, flex-1) | bottom link */}
        <div className="flex h-full flex-col">
          {/* Headline area (fixed height) */}
          <div className="pointer-events-none flex h-[14vh] flex-col items-center justify-center px-4 text-center">
            <motion.p
              className="ea-eyebrow mb-2"
              style={{ color: "var(--gold)" }}
              initial={{ opacity: 0, y: 16 }}
              // NOTE: `animate` (not `whileInView`) — the eyebrow sits inside a
              // position:sticky pinned container. framer-motion's IntersectionObserver
              // (which powers whileInView) gives unreliable results for children of
              // sticky elements (they appear "always in viewport" once pinned, so the
              // -80px root margin never triggers the enter callback reliably).
              // `animate` fires on mount with a small delay so the headline area
              // reveals cleanly once the pinned section mounts.
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            >
              ПЛОЩАДКИ · ИЗБРАННОЕ
            </motion.p>
            <SplitTextReveal
              as="h2"
              mode="words"
              className={HEADLINE_CLASS}
              duration={0.8}
              stagger={0.08}
            >
              Где мы работаем
            </SplitTextReveal>
          </div>

          {/* Card row + map background (lockstep horizontal scroll) */}
          <motion.div
            className="relative flex flex-1 w-max items-center"
            style={{ x }}
          >
            {/* Map background — SVG dashed route + 3 pulsing dots + Cyrillic labels. */}
            <MapBackground />

            {/* Venue cards */}
            {VENUES.map((v, i) => (
              <VenueCard
                key={v.name}
                venue={v}
                i={i}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </motion.div>

          {/* Bottom link (fixed height) */}
          <div className="flex h-[10vh] items-center justify-center">
            <a
              href="#contact"
              className="ea-text-link"
              style={{ color: "var(--cream)" }}
            >
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
      </div>

      {/* Inline styles for the dark-bg headline (Playfair Display + cream +
          EA-size tokens). Kept local to this component (data-theme-flip
          swaps --foreground to cream site-wide mid-pin; we want the
          headline cream regardless, plus the EA Playfair font + sizing). */}
      <style>{`
        .${HEADLINE_CLASS} {
          font-family: var(--ea-font-display);
          font-weight: 400;
          font-size: clamp(2rem, 4.5vw, 3.25rem);
          line-height: 1.08;
          letter-spacing: -0.018em;
          color: var(--cream);
          text-align: center;
          margin: 0;
        }
      `}</style>
    </section>
  );
}

/* ============================ MAP BACKGROUND ============================ */

/**
 * MapBackground — SVG dashed route + 3 location dots with pulsing rings +
 * Cyrillic labels (СПб / МСК / RU). Decorative (`aria-hidden`), 40% opacity
 * so cards remain the focus. Moves in lockstep with the cards (placed
 * inside the same motion.div as the row).
 *
 * - SVG `<line>` with `vectorEffect="non-scaling-stroke"` for a crisp
 *   2px dashed route regardless of viewport scaling.
 * - HTML divs for the dots (perfect circles — no SVG `preserveAspectRatio`
 *   ellipse distortion).
 * - Pulsing rings via framer-motion `animate={{ scale: 1→3, opacity: 0.6→0 }}`
 *   with staggered delays (0/0.4s/0.8s) — the Sondaven `map-w_pin` signature.
 */
function MapBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    >
      {/* Dashed route line */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ opacity: 0.4 }}
      >
        <line
          x1={DOT_POSITIONS[0]}
          y1="50"
          x2={DOT_POSITIONS[2]}
          y2="50"
          stroke="var(--gold)"
          strokeWidth="2"
          strokeDasharray="8 6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Dots + pulsing rings (HTML divs — perfect circles, no SVG distortion) */}
      {DOT_POSITIONS.map((pct, i) => (
        <div
          key={`dot-${pct}`}
          className="absolute"
          style={{
            left: `${pct}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.7,
          }}
        >
          <div className="relative h-2.5 w-2.5">
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: "var(--gold)" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: "var(--gold)" }}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeOut",
              }}
            />
          </div>
        </div>
      ))}

      {/* Cyrillic travel-planner labels above each dot */}
      {DOT_POSITIONS.map((pct, i) => (
        <div
          key={`label-${pct}`}
          className="absolute"
          style={{
            left: `${pct}%`,
            top: "22%",
            transform: "translateX(-50%)",
            opacity: 0.55,
          }}
        >
          <span
            style={{
              fontFamily: "var(--ea-font-eyebrow)",
              fontWeight: 700,
              fontSize: "0.7rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--gold)",
              whiteSpace: "nowrap",
            }}
          >
            {PIN_LABELS[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ============================== VENUE CARD ============================== */

function VenueCard({
  venue,
  i,
  scrollYProgress,
}: {
  venue: Venue;
  i: number;
  scrollYProgress: MotionValue<number>;
}) {
  // Subtle 1.0 → 1.03 → 1.0 scale as the card passes through viewport center.
  // Per-card slice: [i/3, (i+0.5)/3, (i+1)//3] → 3 evenly-spaced focus peaks.
  const scale = useTransform(
    scrollYProgress,
    [i / 3, (i + 0.5) / 3, (i + 1) / 3],
    [1, 1.03, 1],
  );

  return (
    <motion.article
      className="relative z-10 flex h-full w-[80vw] shrink-0 items-center px-4 md:w-[60vw] lg:w-[44vw]"
      style={{ scale }}
    >
      <ClipPathReveal
        direction="alternate"
        index={i}
        duration={1.1}
        className="h-full w-full"
      >
        <div
          className="relative h-full w-full overflow-hidden"
          style={{
            borderRadius: "4px",
            boxShadow: "0 30px 80px -30px rgba(0,0,0,0.6)",
          }}
        >
          <Image
            src={venue.src}
            alt={venue.alt}
            fill
            sizes="(max-width:768px) 80vw, (max-width:1024px) 60vw, 44vw"
            className="object-cover"
          />

          {/* Gradient scrim — bottom-up dark wash behind the caption. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0) 65%)",
            }}
          />

          {/* Caption panel — overlaid on the photo bottom. */}
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            {/* Travel-time label — gold uppercase Barlow. */}
            <p
              className="mb-3"
              style={{
                fontFamily: "var(--ea-font-eyebrow)",
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--gold)",
              }}
            >
              {venue.travel}
            </p>

            {/* Capacity + district — cream uppercase Barlow. */}
            <p
              className="mb-3"
              style={{
                fontFamily: "var(--ea-font-eyebrow)",
                fontWeight: 700,
                fontSize: "0.8125rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--cream)",
                opacity: 0.85,
              }}
            >
              {venue.capacity} · {venue.district}
            </p>

            {/* Venue name — Playfair Display, white. */}
            <h3
              className="mb-5"
              style={{
                fontFamily: "var(--ea-font-display)",
                fontWeight: 400,
                fontSize: "clamp(1.75rem, 2.6vw, 2.5rem)",
                lineHeight: 1.1,
                color: "#FFFFFF",
              }}
            >
              {venue.name}
            </h3>

            {/* "Смотреть события →" gold link. */}
            <a
              href="#ea-events-portfolio"
              className="inline-flex items-center gap-2"
              style={{
                color: "var(--gold)",
                fontFamily: "var(--ea-font-eyebrow)",
                fontWeight: 700,
                fontSize: "0.8125rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Смотреть события
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
        </div>
      </ClipPathReveal>
    </motion.article>
  );
}

/* ============================ STATIC FALLBACK ============================ */

/**
 * StaticVenues — original 3-up cream grid (the pre-transformation layout).
 * Rendered under `prefers-reduced-motion: reduce`. All content +
 * accessibility preserved (venue photos, names, capacities, district tags,
 * "Смотреть события" hover links, "Смотреть все 60+ площадок" bottom link).
 */
function StaticVenues() {
  return (
    <section
      aria-label="Площадки — избранное"
      className="ea-section ea-section--cream"
    >
      <div className="ea-container ea-container--wide">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="ea-eyebrow mb-3">ПЛОЩАДКИ · ИЗБРАННОЕ</p>
          <h2 className="ea-section-h2">
            Где мы <i>работаем</i>.
          </h2>
        </div>

        {/* 3-up full-bleed 16:10 venue cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {VENUES.map((v) => (
            <article
              key={v.name}
              className="group relative overflow-hidden focus-within:outline-none"
              style={{
                aspectRatio: "16 / 10",
                borderRadius: "4px",
                boxShadow: "var(--ea-shadow-cream)",
              }}
            >
              {/* Full-bleed image — scale(1.05) on hover over 700ms. */}
              <Image
                src={v.src}
                alt={v.alt}
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] group-focus-within:scale-[1.05]"
              />

              {/* Bottom gradient overlay. */}
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
                <p
                  className="mb-2"
                  style={{
                    fontFamily: "var(--ea-font-eyebrow)",
                    fontWeight: 700,
                    fontSize: "0.8125rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--ea-cream)",
                    opacity: 0.9,
                  }}
                >
                  {v.capacity} · {v.district}
                </p>
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
                <a
                  href="#ea-events-portfolio"
                  className="mt-3 inline-flex items-center gap-2 opacity-0 transition-opacity duration-500 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto"
                  style={{ color: "var(--ea-red)" }}
                >
                  <span
                    style={{
                      fontFamily: "var(--ea-font-eyebrow)",
                      fontWeight: 700,
                      fontSize: "0.8125rem",
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
            </article>
          ))}
        </div>

        {/* Bottom-of-section link → #contact */}
        <div className="mt-12 flex justify-center">
          <a href="#contact" className="ea-text-link">
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
