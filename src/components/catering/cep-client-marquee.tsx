import type { ReactNode } from "react";

/**
 * CepClientMarquee — Creative Edge Parties "SELECT CLIENTS" marquee (Cycle 27).
 *
 * Black band replicating CEP's homepage §6.3 marquee block: edge-fade mask
 * (`--marquee-fade-mask`) + red bullet separators (`#FF360A`) between 17
 * luxury/corporate client names. Pure CSS animation — no hooks, no JS — so
 * this stays a Server Component.
 *
 * Adapted for the RU market: invented plausible premium RU corporate clients
 * (СБЕР, ГАЗПРОМ, ЯНДЕКС, …) since we cannot use Hermès/Chanel/etc. Mirrors
 * CEP's "HERMÈS • CHANEL • PATEK PHILIPPE • …" pattern.
 *
 * Loop geometry: the track translates 0 → -50% (defined by
 * `@keyframes cep-marquee-scroll` in globals.css). For a seamless -50% loop
 * the track must contain exactly 2× duplicated content (one "set" + one
 * clone). The second set is `aria-hidden` so screen readers don't read the
 * list twice.
 *
 * Pause on hover: `group-hover:[animation-play-state:paused]` on the track
 * via a Tailwind arbitrary variant — no JS state required.
 *
 * @see /home/z/my-project/creativeedge-analysis.md §6.3 (Marquee)
 */

const CLIENTS = [
  "СБЕР",
  "ГАЗПРОМ",
  "ЯНДЕКС",
  "ВТБ",
  "ЛУКОЙЛ",
  "РОСНЕФТЬ",
  "МТС",
  "АЭРОФЛОТ",
  "ТИНЬКОФФ",
  "ОЗОН",
  "ВКЛАД",
  "МАГНИТ",
  "X5 GROUP",
  "СЕВЕРСТАЛЬ",
  "НОРНИКЕЛЬ",
  "АЛРОСА",
  "РОСТЕЛЕКОМ",
] as const;

/**
 * Single set of clients — each name in `.cep-marquee-item` (white, 17px)
 * followed by a red bullet separator (`.cep-marquee-bullet`). The last
 * bullet is included so the wrap-around to the duplicate set looks
 * seamless.
 *
 * @param ariaHidden — when true, marks the entire set decorative (used for
 *   the duplicate clone so screen readers don't read the list twice).
 */
function ClientSet({ ariaHidden = false }: { ariaHidden?: boolean }): ReactNode {
  return (
    <span className="flex items-center" aria-hidden={ariaHidden || undefined}>
      {CLIENTS.map((name, i) => (
        <span key={`${name}-${i}`} className="flex items-center">
          <span className="cep-marquee-item text-white">{name}</span>
          <span className="cep-marquee-bullet" aria-hidden="true">
            •
          </span>
        </span>
      ))}
    </span>
  );
}

export function CepClientMarquee() {
  return (
    <section
      data-header-theme="dark"
      aria-label="Избранные клиенты"
      className="cep-section-black group w-full overflow-hidden py-10 md:py-12"
    >
      {/* Eyebrow — mirrors CEP's "SELECT CLIENTS" left-aligned in the band. */}
      <div className="mb-6 px-8 md:px-14">
        <p className="cep-eyebrow text-white/60">ИЗБРАННЫЕ КЛИЕНТЫ</p>
      </div>

      {/* Edge-fade mask + horizontally-scrolling track. */}
      <div className="cep-marquee-mask">
        <div className="cep-marquee-track group-hover:[animation-play-state:paused]">
          {/* Set 1 — accessible to screen readers. */}
          <ClientSet />
          {/* Set 2 — duplicate clone for seamless -50% loop. Hidden from AT. */}
          <ClientSet ariaHidden />
        </div>
      </div>
    </section>
  );
}

export default CepClientMarquee;
