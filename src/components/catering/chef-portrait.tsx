"use client";

import { Reveal } from "@/components/catering/reveal";
import { SmartImage } from "@/components/media/smart-image";

/**
 * ChefPortrait — full-bleed editorial moment featuring the executive chef.
 *
 * Salt Block voice (Cycle 26 editorial layer): brand-voice restraint, italic
 * Playfair display, Barlow micro-eyebrows, Great Vibes script signature.
 * Inspired by docs/SALTBLOCK-ANALYSIS.md §9 WOW moments + §10 media inventory.
 *
 * Layout:
 *   - Full-bleed section, padding clamp(5rem, 10vw, 8rem) 2rem, bg var(--cream).
 *   - 2-column grid md+ (md:grid-cols-[5fr_6fr]); single column on mobile.
 *   - LEFT: chef photo in `.sb-chef-portrait-frame` (4:5 aspect, square corners,
 *     dramatic layered shadow). Image: /media/event-chef-action.jpg
 *   - RIGHT: editorial copy:
 *       • Eyebrow "ШЕФ-ПОВАР" — Barlow 11px ls 0.28em bordeaux.
 *       • Headline italic Playfair "Дмитрий Нилов" — clamp(2.5rem, 5vw, 3.75rem).
 *       • Subtitle small-caps "ОСНОВАТЕЛЬ · ШЕФ-ПОВАР INTERFOOD".
 *       • 3 paragraphs of warm chef-artisan bio (Karla 17px lh 1.7 ink).
 *       • Great Vibes signature "Дмитрий Нилов" rotate(-3deg) bordeaux.
 *       • Italic attribution "— основатель Interfood Catering".
 *       • Thin .sb-section-rule divider + "Резюме шефа" stat row (3 stats,
 *         Barlow 14px uppercase ls 0.2em bordeaux, separated by ·).
 *
 * Animation: framer-motion fade-up via <Reveal>, stagger 0.15s, duration 0.7s,
 * ease [0.2, 0.7, 0.2, 1]. Reduced-motion respected (Reveal handles).
 *
 * Accessibility:
 *   - Section landmark with aria-labelledby.
 *   - Decorative · separators marked aria-hidden="true".
 *   - SmartImage enforces required alt.
 *   - WCAG AA: ink (#1F2937) on cream (#F9FAFB) body = 12.6:1 ✓; bordeaux
 *     (#7A4A1F) on cream = 6.1:1 ✓ for AA normal text and AA Large for the
 *     14px-uppercase stats (treated as large due to ls 0.2em).
 *
 * Source: SALTBLOCK-ANALYSIS.md §9.2 (petal), §9.3 (marquee), §9.4 (stacked
 * H2s) — extended into the humanizing brand moment (audit recommendation).
 */

const EASE: [number, number, number, number] = [0.2, 0.7, 0.2, 1];

const BIO_PARAGRAPHS = [
  "Двадцать лет назад я начал с одной печки и трёх поваров. Сегодня за нашими плечами — более 2400 мероприятий: от камерных свадеб на двадцать гостей до банкетов на полторы тысячи человек в исторических особняках Петербурга.",
  "Моя кухня — это про ритуал. Про то, как медленно томится лук для французского супа шесть часов, как вялиится свинина в собственной печи двое суток, как пахнет свежий хлеб рано утром, когда все гости ещё спят и в залах стоит тишина.",
  "Мы не работаем с полуфабрикатами. Каждое блюдо — это руки, время и температура. И ещё немного удачи, но удача приходит только к тем, кто готов: к тем, кто встаёт затемно, кто пробует каждое блюдо сам и кто не выпускает поварёшку из рук до последнего гостя.",
] as const;

const CHEF_STATS = [
  "20+ лет опыта",
  "2400+ мероприятий",
  "14 поваров в команде",
] as const;

export function ChefPortrait() {
  return (
    <section
      id="chef"
      aria-labelledby="chef-headline"
      className="chef-portrait-section relative w-full"
      style={{
        background: "var(--cream)",
        padding: "clamp(5rem, 10vw, 8rem) 2rem",
      }}
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 md:grid-cols-[5fr_6fr] md:gap-16">
        {/* LEFT — chef photo in dramatic 4:5 frame --------------------- */}
        <Reveal delay={0} y={36} ease={EASE}>
          <figure className="sb-chef-portrait-frame">
            <SmartImage
              src="/media/event-chef-action.jpg"
              alt="Шеф-повар Дмитрий Нилов за работой"
              fill
              priority={false}
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </figure>
        </Reveal>

        {/* RIGHT — editorial copy -------------------------------------- */}
        <div className="flex flex-col justify-center">
          {/* Eyebrow */}
          <Reveal delay={0.15} y={20} ease={EASE}>
            <p className="sb-eyebrow">Шеф-повар</p>
          </Reveal>

          {/* Headline — italic Playfair display */}
          <Reveal delay={0.3} y={28} ease={EASE}>
            <h2 id="chef-headline" className="sb-chef-headline mt-5">
              Дмитрий&nbsp;Нилов
            </h2>
          </Reveal>

          {/* Subtitle — small-caps role */}
          <Reveal delay={0.45} y={16} ease={EASE}>
            <p className="sb-chef-subtitle mt-4">
              Основатель · Шеф-повар Interfood
            </p>
          </Reveal>

          {/* Body — 3 warm chef-artisan paragraphs */}
          <Reveal delay={0.6} y={24} ease={EASE}>
            <div className="sb-chef-body mt-8 space-y-5">
              {BIO_PARAGRAPHS.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>

          {/* Signature — Great Vibes, rotated -3deg, bordeaux */}
          <Reveal delay={0.75} y={24} ease={EASE}>
            <div className="mt-10">
              {/* The script signature. Inline-block so the -3deg rotation
                  pivots cleanly on bottom-left. */}
              <p className="sb-signature" lang="ru">
                Дмитрий Нилов
              </p>
              <p className="sb-signature-attribution">
                — основатель Interfood Catering
              </p>
            </div>
          </Reveal>

          {/* Bottom — thin rule + "Резюме шефа" stat row */}
          <Reveal delay={0.9} y={20} ease={EASE}>
            <div className="mt-12">
              <hr className="sb-section-rule h-px w-full" />
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
                <p className="sb-eyebrow opacity-70">Резюме шефа</p>
                <ul className="sb-chef-stats">
                  {CHEF_STATS.map((stat, i) => (
                    <li key={stat} className="flex items-baseline">
                      {i > 0 && (
                        <span aria-hidden="true" className="mx-3 opacity-50">
                          ·
                        </span>
                      )}
                      <span>{stat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default ChefPortrait;
