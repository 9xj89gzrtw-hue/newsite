"use client";

import { Reveal } from "./reveal";

/**
 * LogoMarquee — infinite client-logo marquee (Gamma / Creative Edge pattern).
 *
 * Rendered as text-wordmark chips (the client list is brand names without
 * vector logos). The track is duplicated so the CSS keyframe can loop seamlessly
 * (translateX 0 → -50%). Pause-on-hover. Respects prefers-reduced-motion via
 * the global animation-duration override in globals.css.
 */
const CLIENTS = [
  "Сбербанк",
  "Газпром нефть",
  "Ленэнерго",
  "Bayer",
  "Porsche Russia",
  "L'Oréal",
  "Sanofi",
  "Nestlé",
  "Danone",
  "Bosch",
  "Siemens",
  "IKEA",
];

export function LogoMarquee() {
  // Duplicate the list so the marquee can loop without a visible jump.
  const track = [...CLIENTS, ...CLIENTS];

  return (
    <section
      aria-label="Клиенты, которые нам доверяют"
      data-header-theme="light"
      className="relative border-y border-border-line bg-cream py-10 md:py-14"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <p className="mb-7 text-center font-mono text-xs uppercase tracking-[0.35em] text-ink/70">
            Нам доверяют лидеры рынка
          </p>
        </Reveal>
      </div>

      {/* Marquee viewport — gradient fade on both edges */}
      <div
        className="marquee-pause relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        }}
      >
        <ul
          className="marquee-track-logos flex w-max items-center gap-12 pr-12 md:gap-16 md:pr-16"
          aria-hidden="true"
        >
          {track.map((name, i) => (
            <li
              key={`${name}-${i}`}
              className="flex shrink-0 items-center gap-3 font-display text-lg text-ink/70 transition-colors duration-300 hover:text-gold md:text-2xl"
            >
              <span
                aria-hidden="true"
                className="inline-block size-1.5 rounded-full bg-gold/50"
              />
              <span className="whitespace-nowrap font-medium tracking-tight">
                {name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
