"use client";

/**
 * EaServiceTabs — Cycle 29 (EA editorial layer · P0-1)
 * ------------------------------------------------------
 * Tabbed service module. REPLACES `EaServicesGrid + ServicesOverview` (the
 * two separate grid sections, Cycle 28 §16-17) with ONE premium ARIA-tabs
 * interface: 5 service categories × { image + headline + body + 4-feature
 * bullet list + contextual CTA }. Click a tab → the panel swaps in place
 * (cross-fade + slight y, no scroll, no layout shift).
 *
 * Why: cuts ~1800 px of scroll, gives each Interfood service a full panel +
 * service-context-specific CTA (P0-4: «ЗАКАЗАТЬ СВАДЬБУ» / «ЗАКАЗАТЬ
 * КОРПОРАТИВ» / etc., NOT generic «ОБСУДИТЬ»). Pattern lifted from
 * Wolfgang Puck Catering's tabbed service module (per
 * docs/WOLFGANG-PUCK-DESIGN-ANALYSIS.md §4 + §15 P0-1), adapted to Interfood's
 * EA editorial layer (blush bg, italic-as-fragment, Barlow eyebrow, Playfair
 * H2, red square bullets, red pill CTA).
 *
 * Tabs: Свадьбы · Корпоратив · Банкеты · Фуршеты · Выездной Шеф
 *
 * Accessibility (WAI-ARIA Tabs pattern — APG-compliant):
 *  - `role="tablist"` on the row container.
 *  - `role="tab"` + `aria-selected` + `aria-controls` on each tab button.
 *  - `role="tabpanel"` + `aria-labelledby` + `tabindex="0"` on the panel.
 *  - Roving tabindex: active tab is `tabindex=0`, inactive are `tabindex=-1`.
 *  - ArrowLeft/ArrowRight = move focus + activate next/prev tab (wrap-around).
 *  - Home/End = focus + activate first/last tab.
 *  - 44px min touch-target on tabs and CTAs (AGENTS.md §5 #7).
 *
 * Motion (AGENTS.md §5 #5 — transform/opacity only):
 *  - `motion.div` fade-up reveal on the section head on scroll-in.
 *  - `AnimatePresence mode="wait"` cross-fade (opacity + 12 px y) on tab
 *    swap — duration 0.4s, EA easing.
 *  - `useReducedMotion` honoured: when reduced, instant swap, no motion
 *    (AnimatePresence is bypassed entirely — just a plain div).
 *
 * Self-contained: scoped CSS in `./ea-service-tabs.css`. No edits to
 * globals.css, no edits to any other catering/*.tsx file. The orchestrator
 * (NOT this file) is responsible for swapping EaServicesGrid + ServicesOverview
 * calls in `page.tsx`.
 */

import { useCallback, useId, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { SmartImage } from "@/components/media/smart-image";
import { MEDIA } from "@/lib/media";

import "./ea-service-tabs.css";

/** EA easing — quiet cubic-bezier used across the editorial layer. */
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Tiny 8×8 SVG blush placeholder (base64-encoded). Used as the SmartImage
 * `blurDataURL` so a soft cream wash renders before the photo loads.
 * Solid `#F1ECEC` (var(--ea-blush)) matches the section bg.
 */
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNGMUVDRUMiLz48L3N2Zz4=";

type ServiceTab = {
  /** Stable id — used as a React key + DOM id fragment. */
  id: string;
  /** Tab label (rendered in uppercase via CSS). */
  label: string;
  /** Image src — uses existing MEDIA registry (no new assets). */
  imageSrc: string;
  /** Image alt — original copy, descriptive of Interfood service. */
  imageAlt: string;
  /** H3 panel headline. */
  title: string;
  /** 2-sentence body. */
  body: string;
  /** Exactly 4 feature bullets. */
  features: [string, string, string, string];
  /** Contextual CTA label (verbatim from P0-4 mapping). */
  ctaLabel: string;
  /** CTA href — `#calculator` for the first 4 tabs, `#contact` for chef. */
  ctaHref: string;
};

/**
 * 5 canonical Interfood service categories. Original Interfood copy in
 * Russian (premium-but-warm tone, "Еда как искусство" voice).
 *
 * Image mapping (per task spec — uses existing /public/media assets):
 *  1. Свадьбы        → MEDIA.menu.banquet (concorde-boardroom.webp)
 *  2. Корпоратив     → MEDIA.events[1]   (event-02.jpg — "Корпоратив в офисе")
 *  3. Банкеты        → MEDIA.events[2]   (event-03.jpg — "Банкет на корабле")
 *  4. Фуршеты        → MEDIA.menu.buffet (concorde-handhelds.jpg)
 *  5. Выездной Шеф   → /media/event-chef-action.jpg
 */
const TABS: ServiceTab[] = [
  {
    id: "weddings",
    label: "Свадьбы",
    imageSrc: MEDIA.menu.banquet,
    imageAlt:
      "Свадебный банкет — сервированный стол с сезонными блюдами Interfood",
    title: "Свадебный банкет под ключ",
    body: "Авторское меню и безупречная сервировка для вашего дня. Welcome-зона, банкетные столы и сезонные блюда — под ключ.",
    features: [
      "Индивидуальное меню",
      "Welcome-зона с канапе",
      "Сервировка под концепцию",
      "Официанты и сомелье",
    ],
    ctaLabel: "Заказать свадьбу",
    ctaHref: "#calculator",
  },
  {
    id: "corporate",
    label: "Корпоратив",
    imageSrc: MEDIA.events[1]?.src ?? "/media/event-02.jpg",
    imageAlt: "Корпоративное мероприятие в офисе — кейтеринг Interfood",
    title: "Корпоративный кейтеринг полного цикла",
    body: "Галá-ужины, презентации, новогодние вечера и пикники. Сервис, который формирует имидж бренда.",
    features: [
      "Тайминг под программу",
      "Кофе-брейки и фуршеты",
      "Брендирование подачи",
      "Команда на площадке",
    ],
    ctaLabel: "Заказать корпоратив",
    ctaHref: "#calculator",
  },
  {
    id: "banquets",
    label: "Банкеты",
    imageSrc: MEDIA.events[2]?.src ?? "/media/event-03.jpg",
    imageAlt: "Банкет на корабле — кейтеринг Interfood на нестандартной площадке",
    title: "Банкеты на 50–500 гостей",
    body: "Торжества на 50–500 гостей: юбилеи, годовщины, конференции и церемонии награждения. Полный цикл — от меню до подачи.",
    features: [
      "Меню из 7 типов",
      "Дегустация до заказа",
      "Аренда оборудования",
      "Флористика в подарок",
    ],
    ctaLabel: "Заказать банкет",
    ctaHref: "#calculator",
  },
  {
    id: "buffets",
    label: "Фуршеты",
    imageSrc: MEDIA.menu.buffet,
    imageAlt: "Фуршетные канапе и закуски — мобильная подача Interfood",
    title: "Фуршет — приём на ногах",
    body: "Канапе, бьюти-зона, кофе-брейки — лёгкий формат для приёма на ногах и деловых встреч.",
    features: [
      "Канапе и брускетты",
      "Горячие закуски",
      "Фуршетные столы",
      "Мобильная подача",
    ],
    ctaLabel: "Заказать фуршет",
    ctaHref: "#calculator",
  },
  {
    id: "private-chef",
    label: "Выездной Шеф",
    imageSrc: "/media/event-chef-action.jpg",
    imageAlt:
      "Выездной шеф-повар Interfood готовит на площадке — открытая кухня",
    title: "Ресторан у вас дома или в офисе",
    body: "Шеф-повар приезжает к вам: готовка на площадке, авторская подача, интерактив с гостями. Ресторан у вас дома или в офисе.",
    features: [
      "Готовка на площадке",
      "Авторская подача",
      "Интерактив с гостями",
      "Сомелье-сопровождение",
    ],
    ctaLabel: "Выездной шеф к вам",
    ctaHref: "#contact",
  },
];

/**
 * EaServiceTabs — the tabbed service module.
 *
 * The whole section is a single landmark (`<section aria-labelledby>`). The
 * tablist sits below the section head; below it sits the active panel. The
 * panel is single-slot — we render only the active tab's content and let
 * AnimatePresence handle the cross-fade.
 */
export function EaServiceTabs() {
  const reduce = useReducedMotion();
  // Stable id base — guarantees uniqueness if multiple instances ever render.
  const baseId = useId();
  const [activeIndex, setActiveIndex] = useState(0);

  const active = TABS[activeIndex];

  /** Build stable DOM ids from the section's useId base + tab id. */
  const tabId = (i: number) => `${baseId}-tab-${TABS[i].id}`;
  const panelId = `${baseId}-panel`;

  /** Activate a tab by index. */
  const activate = useCallback(
    (i: number) => {
      if (i < 0 || i >= TABS.length) return;
      setActiveIndex(i);
    },
    [],
  );

  /**
   * Keyboard navigation per WAI-ARIA Tabs APG:
   *  - ArrowLeft/ArrowRight  → move focus + activate adjacent tab (wrap).
   *  - Home/End              → move focus + activate first/last tab.
   *
   * Activation-on-focus is the recommended pattern for tabbed content that
   * swaps in place (pre-grid-of-tabs). With roving tabindex, focusing a tab
   * automatically makes it the only keyboard-reachable one.
   */
  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const last = TABS.length - 1;
      let next = activeIndex;
      switch (e.key) {
        case "ArrowRight":
          next = (activeIndex + 1) % TABS.length;
          break;
        case "ArrowLeft":
          next = (activeIndex - 1 + TABS.length) % TABS.length;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = last;
          break;
        default:
          return; // don't preventDefault on keys we don't handle.
      }
      e.preventDefault();
      activate(next);
      // Move DOM focus to the newly-active tab (roving tabindex).
      requestAnimationFrame(() => {
        const el = document.getElementById(tabId(next));
        el?.focus();
      });
    },
    [activeIndex, activate, tabId],
  );

  return (
    <section
      id="ea-service-tabs"
      aria-labelledby="ea-service-tabs-headline"
      className="ea-svc-tabs ea-section ea-section--blush"
    >
      <div className="ea-container ea-container--wide">
        {/* — — — — Section head: eyebrow + H2 with italic-as-fragment — — — — */}
        <motion.div
          className="ea-svc-tabs__head"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="ea-eyebrow">Услуги · Полный цикл</span>
          <h2
            id="ea-service-tabs-headline"
            className="ea-section-h2 ea-svc-tabs__h2"
          >
            {"Что входит в "}
            <i className="ea-italic-fragment">наш кейтеринг</i>
            {"."}
          </h2>
        </motion.div>

        {/* — — — — Tablist (ARIA: role=tablist) — — — — */}
        <div
          className="ea-svc-tabs__tablist"
          role="tablist"
          aria-label="Категории услуг Interfood Catering"
          aria-orientation="horizontal"
          onKeyDown={onKeyDown}
        >
          {TABS.map((tab, i) => {
            const selected = i === activeIndex;
            return (
              <button
                key={tab.id}
                id={tabId(i)}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                className="ea-svc-tabs__tab"
                onClick={() => activate(i)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* — — — — Panel (ARIA: role=tabpanel) — — — — */}
        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={tabId(activeIndex)}
          tabIndex={0}
          className="ea-svc-tabs__panel"
        >
          {reduce ? (
            // Reduced motion — render the active panel directly (no
            // AnimatePresence, no motion wrappers). Instant swap.
            <PanelBody key={active.id} tab={active} />
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <PanelBody tab={active} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * PanelBody — the inner 2-col layout shared by both the motion + reduced-motion
 * renders. Pulled out so the cross-fade wrapper can stay a single motion.div.
 */
function PanelBody({ tab }: { tab: ServiceTab }) {
  return (
    <div className="ea-svc-tabs__grid">
      {/* LEFT — image (55% desktop, full width mobile) ------------------ */}
      <figure className="ea-svc-tabs__media" aria-label={tab.imageAlt}>
        <SmartImage
          src={tab.imageSrc}
          alt={tab.imageAlt}
          fill
          blurDataURL={BLUR_DATA_URL}
          sizes="(max-width: 768px) 100vw, 55vw"
          className="ea-svc-tabs__img"
        />
      </figure>

      {/* RIGHT — text column (45% desktop) ------------------------------- */}
      <div className="ea-svc-tabs__content">
        <h3 className="ea-svc-tabs__title">{tab.title}</h3>
        <p className="ea-svc-tabs__body">{tab.body}</p>

        <ul className="ea-svc-tabs__features" aria-label={`Что входит — ${tab.label}`}>
          {tab.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>

        <Link href={tab.ctaHref} className="ea-svc-tabs__cta">
          {tab.ctaLabel}
        </Link>
      </div>
    </div>
  );
}

export default EaServiceTabs;
