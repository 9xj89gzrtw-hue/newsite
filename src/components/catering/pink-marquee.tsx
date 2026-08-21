import { Fragment } from "react";

/**
 * PinkMarquee — Concept-Catering.de pink band with infinite marquee.
 *
 * Pattern source: concept-catering.de "text-scroling-section" — a ~83px-tall
 * solid pink band with a horizontal infinite marquee of service keywords in
 * white ultra-bold condensed all-caps (Barlow Semi Condensed), separated by
 * darker-pink • dots.
 *
 * Implementation:
 *   - .cc-marquee-track (globals.css) animates translateX 0 → -50% linearly.
 *   - MarqueeRow is rendered twice → -50% translate loops seamlessly.
 *   - Per-instance speed via --cc-marquee-duration CSS var (default 18s).
 *   - reverse=true plays the track backwards (.cc-reverse class).
 *   - prefers-reduced-motion handled by CSS @media query in globals.css
 *     (animation: none) — no JS needed, so this stays a Server Component.
 */

const KEYWORDS = [
  "Фуршет",
  "Банкет",
  "Кофе-брейк",
  "Барбекю",
  "Свадьбы",
  "Корпоративы",
  "Доставка",
  "Гриль",
  "Винная карта",
  "Сезонные меню",
];

function MarqueeRow() {
  return (
    <div
      className="flex items-center gap-6 pr-6 whitespace-nowrap md:gap-8 md:pr-8"
      aria-hidden="true"
    >
      {KEYWORDS.map((kw, i) => (
        <Fragment key={i}>
          <span className="font-barlow text-lg font-bold uppercase tracking-wider text-white md:text-2xl">
            {kw}
          </span>
          <span className="text-lg text-cc-dark/50 md:text-2xl" aria-hidden="true">•</span>
        </Fragment>
      ))}
    </div>
  );
}

export function PinkMarquee({
  speed = 18,
  reverse = false,
}: {
  /** Marquee loop duration in seconds (lower = faster). */
  speed?: number;
  /** Reverse direction. */
  reverse?: boolean;
}) {
  return (
    <section
      aria-label="Направления кейтеринга Interfood"
      className="overflow-hidden bg-cc-pink py-5 md:py-6"
    >
      <div
        className={`cc-marquee-track ${reverse ? "cc-reverse" : ""}`}
        style={{ ["--cc-marquee-duration" as string]: `${speed}s` } as React.CSSProperties}
      >
        <MarqueeRow />
        <MarqueeRow />
      </div>
    </section>
  );
}
