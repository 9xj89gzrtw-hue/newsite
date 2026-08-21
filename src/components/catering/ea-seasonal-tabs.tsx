"use client";

/**
 * EaSeasonalTabs — Cycle 28 (EA editorial layer)
 * ------------------------------------------------
 * 5-tab seasonal menu rotation. Fills P0-2 gap (per
 * docs/WOLFGANG-PUCK-DESIGN-ANALYSIS.md §15): Interfood has no seasonal content
 * rotation. Mirrors Wolfgang Puck Catering's seasonal-tabs mechanic (5 tabs:
 * Summer/Spring/Fall/Winter/Awards) — adapted to Interfood's Russian seasonal
 * calendar: `Лето · Осень · Зима · Весна · Праздничная`. The Праздничная
 * (Holiday/New-Year season, Nov–Jan) tab is Russia's biggest catering peak —
 * the conversion hook that mirrors WP's "Awards" 5th-tab invention.
 *
 * DESIGN (per docs/WOLFGANG-PUCK-DESIGN-ANALYSIS.md §5 + §15 P0-2):
 *  - Section bg: cream (var(--cream)) with a subtle painterly radial bloom
 *    (light, mirrors .painterly-bg-warm — uses only EA blush tokens, no new
 *    accent surfaces introduced).
 *  - Eyebrow: "Сезонность · Меню сезона" (Barlow Semi Condensed Bold,
 *    uppercase, tracked, red #E71D3A).
 *  - H2 with italic-as-fragment: "Меню, которое меняется вместе с «сезоном»."
 *    (Playfair Display — via shared `.ea-section-h2` token).
 *  - Lead paragraph (1 sentence, ink/70): "Каждый сезон — новые продукты,
 *    новые блюда, новые идеи для вашего стола."
 *  - Tab row: 5 tabs horizontal, Barlow Semi Condensed Bold uppercase. Active
 *    tab = red underline + ink; inactive = ink/50. Mobile → horizontal
 *    scroll-snap.
 *  - Праздничная tab: subtle gold accent on active state (premium conversion
 *    window) — kept within the 3-color discipline via the existing `--gold`
 *    token (no NEW accent introduced).
 *  - Tab panel: 2-col (image LEFT 50%, content RIGHT 50%). Image: SmartImage
 *    with blur placeholder, seasonal dish photo. Content: H3 seasonal menu
 *    title (Playfair ~1.8rem), 2-sentence copy with SPECIFIC seasonal
 *    ingredients (white asparagus, porcini, pumpkin, berries, Olivier,
 *    herring under fur coat, etc.), a "3 блюда сезона" list (3 dish names with
 *    red square bullets), CTA `Смотреть меню` → href="#menu" (the existing
 *    Menu section — id verified in `menu.tsx`).
 *  - ARIA tabs pattern (WAI-ARIA APG): role=tablist/tab/tabpanel, aria-selected,
 *    aria-controls, aria-labelledby, arrow-key nav (Left/Right), Home/End,
 *    roving tabindex, 44px touch targets. Automatic activation (selection
 *    follows focus).
 *  - Motion: AnimatePresence cross-fade + slight y on tab switch (mode="wait",
 *    duration 0.4, EASE=[0.22,1,0.36,1]). Tabs + header fade-up on scroll-in.
 *    Respects `useReducedMotion`.
 *
 * Self-contained: scoped CSS in `./ea-seasonal-tabs.css`. No edits to
 * globals.css, page.tsx, or any other catering/*.tsx file.
 */

import { useCallback, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { SmartImage } from "@/components/media/smart-image";
import "./ea-seasonal-tabs.css";

/** EA Easing — quiet cubic-bezier used across the editorial layer. */
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Tiny shared blur placeholder — a soft cream SVG data URL. SmartImage sets
 * `placeholder="blur"` when `blurDataURL` is provided (see smart-image.tsx).
 */
const BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><rect width='8' height='8' fill='#F1ECEC'/></svg>",
  );

type SeasonId = "summer" | "autumn" | "winter" | "spring" | "holiday";

type Season = {
  id: SeasonId;
  /** Tab label (displayed uppercase via CSS). */
  label: string;
  /** Panel H3 title, e.g. "Летнее меню". */
  title: string;
  /** 2-sentence copy describing the season's produce/dishes. */
  copy: string;
  /** 3 dish names rendered as a list with red square bullets. */
  dishes: readonly [string, string, string];
  /** SmartImage src — seasonal dish photo (existing /media asset). */
  image: string;
  /** SmartImage alt text (Russian, descriptive). */
  alt: string;
};

/**
 * 5 canonical Interfood seasons — match the brief's spec:
 * `Лето · Осень · Зима · Весна · Праздничная`. Each carries SPECIFIC Russian
 * seasonal ingredients (white asparagus, porcini, pumpkin, berries, Olivier,
 * herring under fur coat, etc.) so the copy is credible — not generic.
 *
 * Order chosen to mirror the natural "current season first" feel while keeping
 * Праздничная last (the conversion hook + visual climax with the gold accent).
 */
const SEASONS: readonly Season[] = [
  {
    id: "summer",
    label: "Лето",
    title: "Летнее меню",
    copy: "Ягоды, зелень и лёгкие закуски. Холодные супы, гриль на углях и свежие салаты с локальных ферм.",
    dishes: [
      "Холодный гаспачо с базиликом",
      "Канапе с камамбером и инжиром",
      "Гриль-овощи с дымком",
    ],
    image: "/media/ridgewells-scallops.jpg",
    alt: "Летняя закуска из морепродуктов на банкетной тарелке — Interfood Catering",
  },
  {
    id: "autumn",
    label: "Осень",
    title: "Осеннее меню",
    copy: "Белые грибы, тыква, корнеплоды. Густые крем-супы, жаркое и десерты с грецким орехом и мёдом.",
    dishes: [
      "Крем-суп из белых грибов",
      "Тыква с козьим сыром",
      "Яблочный тарт татен",
    ],
    image: "/media/ridgewells-veg-mosaic.jpg",
    alt: "Осенняя овощная мозаика из сезонных корнеплодов и грибов — Interfood Catering",
  },
  {
    id: "winter",
    label: "Зима",
    title: "Зимнее меню",
    copy: "Сытные горячие блюда и классика русского застолья. Дичь, наваристые бульоны и тёплые пироги.",
    dishes: ["Борщ с пампушками", "Жаркое из лосятины", "Расстегаи с рыбой"],
    image: "/media/menu-banquet.jpg",
    alt: "Зимний банкетный стол с горячими блюдами русской кухни — Interfood Catering",
  },
  {
    id: "spring",
    label: "Весна",
    title: "Весеннее меню",
    copy: "Молодая спаржа, первый редис, черемша. Лёгкие салаты, нежные крем-супы и десерты с первым мёдом.",
    dishes: [
      "Белая спаржа на пару",
      "Салат с черемшой и козьим сыром",
      "Творожный десерт с мёдом",
    ],
    image: "/media/menu-vegetarian.jpg",
    alt: "Весеннее вегетарианское блюдо со свежей спаржей и редисом — Interfood Catering",
  },
  {
    id: "holiday",
    label: "Праздничная",
    title: "Праздничное меню",
    copy: "Новогодние корпоративы, юбилеи и зимние торжества. Оливье, сельдь под шубой, шампанские пирамиды и авторские десерты с золотом.",
    dishes: [
      "Оливье с перепелиной икрой",
      "Сельдь под шубой (авторская)",
      "Пирамида из шампанского",
    ],
    image: "/media/event-09.jpg",
    alt: "Новогодний корпоратив — праздничный банкетный стол с сервировкой — Interfood Catering",
  },
] as const;

const SEASON_IDS = SEASONS.map((s) => s.id);

/** Shared ID roots — single-instance component, IDs are stable. */
const TAB_ID = (id: SeasonId) => `ea-seasonal-tab-${id}`;
const PANEL_ID = "ea-seasonal-panel";

export function EaSeasonalTabs() {
  const reduce = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = useCallback((index: number) => {
    const last = SEASON_IDS.length - 1;
    const safe = index < 0 ? 0 : index > last ? last : index;
    tabRefs.current[safe]?.focus();
  }, []);

  const handleTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      const last = SEASON_IDS.length - 1;
      let next = activeIndex;
      switch (e.key) {
        case "ArrowRight":
        case "Right": // legacy IE
          next = activeIndex === last ? 0 : activeIndex + 1;
          break;
        case "ArrowLeft":
        case "Left": // legacy IE
          next = activeIndex === 0 ? last : activeIndex - 1;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = last;
          break;
        default:
          return; // do not preventDefault for unknown keys
      }
      e.preventDefault();
      setActiveIndex(next);
      // All 5 tabs are always rendered — refs are stable, so we can focus
      // synchronously without waiting for the next paint.
      focusTab(next);
    },
    [activeIndex, focusTab],
  );

  const active = SEASONS[activeIndex];

  return (
    <section
      id="ea-seasonal-tabs"
      aria-labelledby="ea-seasonal-tabs-headline"
      className="ea-seasonal ea-section ea-section--cream"
    >
      {/* Subtle painterly radial bloom (light, mirroring .painterly-bg-warm).
          Uses only EA blush tokens — no new accent surface introduced. */}
      <div className="ea-seasonal__bloom" aria-hidden="true" />

      <div className="ea-container ea-container--wide ea-seasonal__inner">
        {/* — Header — */}
        <motion.header
          className="ea-seasonal__head"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="ea-eyebrow">Сезонность · Меню сезона</span>
          <h2
            id="ea-seasonal-tabs-headline"
            className="ea-section-h2 ea-seasonal__h2"
          >
            {"Меню, которое меняется вместе с "}
            <i className="ea-italic-fragment">сезоном</i>
            {"."}
          </h2>
          <p className="ea-seasonal__lead">
            Каждый сезон — новые продукты, новые блюда, новые идеи для вашего
            стола.
          </p>
        </motion.header>

        {/* — Tab list — */}
        <motion.div
          className="ea-seasonal__tabs-wrap"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        >
          <div
            role="tablist"
            aria-label="Меню сезона — выберите вкладку"
            aria-orientation="horizontal"
            className="ea-seasonal__tablist"
          >
            {SEASONS.map((season, i) => {
              const isActive = i === activeIndex;
              const isHoliday = season.id === "holiday";
              const className = [
                "ea-seasonal__tab",
                isActive ? "ea-seasonal__tab--active" : "",
                isHoliday ? "ea-seasonal__tab--holiday" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={season.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  role="tab"
                  id={TAB_ID(season.id)}
                  aria-selected={isActive}
                  aria-controls={PANEL_ID}
                  tabIndex={isActive ? 0 : -1}
                  className={className}
                  onClick={() => setActiveIndex(i)}
                  onKeyDown={handleTabKeyDown}
                  type="button"
                >
                  {season.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* — Tab panel — AnimatePresence cross-fades panels on tab switch. */}
        <div
          id={PANEL_ID}
          role="tabpanel"
          aria-labelledby={TAB_ID(active.id)}
          tabIndex={0}
          className="ea-seasonal__panel"
        >
          <AnimatePresence mode="wait">
            <motion.article
              key={active.id}
              className="ea-seasonal__panel-grid"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {/* LEFT — seasonal dish image (50%) */}
              <div className="ea-seasonal__media">
                <SmartImage
                  src={active.image}
                  alt={active.alt}
                  fill
                  blurDataURL={BLUR_DATA_URL}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="ea-seasonal__img"
                />
              </div>

              {/* RIGHT — content (50%) */}
              <div className="ea-seasonal__content">
                <h3 className="ea-seasonal__title">{active.title}</h3>
                <p className="ea-seasonal__copy">{active.copy}</p>

                <div className="ea-seasonal__dishes">
                  <span className="ea-seasonal__dishes-label">
                    3 блюда сезона
                  </span>
                  <ul className="ea-seasonal__dishes-list">
                    {active.dishes.map((dish) => (
                      <li key={dish} className="ea-seasonal__dish">
                        <span
                          className="ea-seasonal__dish-marker"
                          aria-hidden="true"
                        />
                        <span className="ea-seasonal__dish-text">{dish}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="#menu"
                  className="ea-text-link ea-seasonal__cta"
                  aria-label={`Смотреть меню — ${active.title}`}
                >
                  Смотреть меню
                  <svg
                    className="ea-text-link__arrow"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M4 12h15M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default EaSeasonalTabs;
