"use client";

/**
 * GammaHaccordion — Cycle 31 NEW
 * ---------------------------------------------------------------------
 * gammacatering.com signature horizontal accordion (blocks that fold
 * horizontally). 4 experience categories side-by-side: ONE open wide
 * (flex-grow 4) + 3 narrow vertical spines (flex-grow 1). Click a spine
 * → it opens, the others fold closed. Tinted bg per category — the user's
 * explicit favourite "blocks that fold horizontally" pattern from gamma.
 *
 * Replaces a static "4 cards" grid with an interactive fold. This is
 * gamma's strongest "experiences" pattern — copied 1:1 in spirit + layout
 * (HTML structure: `haccordion__item` × { `haccordion__open` body +
 * `haccordion__spine` vertical-title click target }).
 *
 * 4 Russian categories:
 *   1. Свадьбы    (Weddings)          tint: warm rose  rgba(214,40,96,0.08)
 *   2. Корпоратив (Corporate)         tint: cool blue   rgba(36,64,117,0.08)
 *   3. Банкеты    (Banquets / Large)   tint: deep gold  rgba(139,90,30,0.10)
 *   4. Фуршеты    (Private/Reception) tint: warm cream rgba(180,90,40,0.08)
 *
 * Default open: item #1 (Свадьбы) — the gamma default + the most-booked
 * Interfood category (per AGENTS.md §4 service-tier ordering).
 *
 * Layout:
 *  - DESKTOP (≥1024px): flex row, 70vh tall (min 520 / max 720). Open item
 *    flex-grow 4, closed items flex-grow 1. Spine is vertical (writing-mode
 *    vertical-rl + rotate(180deg) so the title reads bottom-to-top, gamma
 *    signature). Open panel inside the open item shows head (teaser1 +
 *    big title + teaser2) + image (next/image, fills media area) + CTA
 *    button. Smooth transition on flex-grow only — content swaps
 *    instantly (matches gamma behaviour).
 *  - MOBILE (<1024px): vertical stack — container flex-direction column,
 *    each item flex-direction column, spine becomes a horizontal 88px
 *    header bar (writing-mode horizontal-tb). Open panel appears below
 *    the spine when open.
 *
 * Accessibility (WAI-ARIA + gamma's actual JS):
 *  - role="button" on spine + tabindex=0 + aria-expanded + aria-controls.
 *  - Enter / Space → activate the clicked spine.
 *  - ArrowRight / ArrowDown → move focus to next CLOSED spine (skip the
 *    open one, since clicking the open spine's own spine is a no-op).
 *  - ArrowLeft  / ArrowUp   → move focus to prev CLOSED spine.
 *  - prefers-reduced-motion → instant flex change (no transition).
 *
 * Self-contained: scoped CSS in `./gamma-haccordion.css`. Reuses EA shared
 * utility classes (`.ea-eyebrow`, `.ea-section-h2`, `.ea-italic-fragment`,
 * `.ea-container--wide`) + EA design tokens (--ea-cream, --ea-ink,
 * --ea-red, --ea-font-display, --ea-font-eyebrow, --ea-font-body). No
 * edits to globals.css. The orchestrator (NOT this file) is responsible
 * for placing `<GammaHaccordion />` in `page.tsx`.
 *
 * Source ref:
 *  - docs/advanced-technical/site_21_gamma.html lines 373-440 (HTML)
 *  - docs/advanced-technical/site_21_gamma.html lines 1938-1984 (JS —
 *    open/close + arrow-key focus-skip behaviour)
 */

import { useCallback, useId, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import "./gamma-haccordion.css";

/** EA easing — quiet cubic-bezier used across the editorial layer. */
const EASE = [0.22, 1, 0.36, 1] as const;

type HaccordionItem = {
  /** Stable id — used for React keys + DOM id fragments. */
  id: string;
  /** Category label — rendered in the spine (vertical / horizontal on mobile). */
  label: string;
  /** Tinted background colour for the whole item (per task spec). */
  tint: string;
  /** Small eyebrow teaser above the title (Russian, gamma's "Small and Special"). */
  teaser1: string;
  /** Big Playfair title inside the open panel. */
  title: string;
  /** Small eyebrow teaser below the title (gamma's "End to end Service"). */
  teaser2: string;
  /** Image src — uses gamma's own experience photos downloaded to /media/gamma/. */
  imageSrc: string;
  /** Image alt — original Interfood copy, descriptive of the event type. */
  imageAlt: string;
  /** CTA button label. */
  ctaLabel: string;
  /** CTA href — `#calculator` for all 4 (the catering estimator). */
  ctaHref: string;
};

/**
 * 4 canonical Interfood event categories, mapped 1:1 to gamma's 4 experience
 * tiles. Order: Weddings → Corporate → Banquets → Private. The first item
 * (Свадьбы) opens by default (gamma default + Interfood's most-booked tier).
 *
 * Image assets — downloaded from gammacatering.com (per Task 1 worklog):
 *   1. gamma-catering-erlebnis-hochzeiten.jpg          (Weddings)
 *   2. gamma-catering-erlebnis-corporate-events.jpg      (Corporate)
 *   3. gammacatering-grossanlaesse.jpg                   (Banquets / Large)
 *   4. gamma-catering-erlebnis-privat-events.webp        (Private — original
 *      was a WebP without an extension; renamed for next/image compatibility).
 *
 * Tints (per task spec — verbatim rgba values):
 *   1. Свадьбы    rgba(214, 40, 96, 0.08)  — warm rose
 *   2. Корпоратив rgba(36, 64, 117, 0.08)  — cool blue
 *   3. Банкеты    rgba(139, 90, 30, 0.10)  — deep gold
 *   4. Фуршеты    rgba(180, 90, 40, 0.08)  — warm cream
 */
const ITEMS: HaccordionItem[] = [
  {
    id: "weddings",
    label: "Свадьбы",
    tint: "rgba(214, 40, 96, 0.08)",
    teaser1: "Самый красивый день",
    title: "Свадьбы",
    teaser2: "Под ключ сервис",
    imageSrc: "/media/gamma/gamma-catering-erlebnis-hochzeiten.jpg",
    imageAlt:
      "Свадебный банкет — сервировка и сезонные блюда Interfood на свадьбе",
    ctaLabel: "Смотреть",
    ctaHref: "#calculator",
  },
  {
    id: "corporate",
    label: "Корпоратив",
    tint: "rgba(36, 64, 117, 0.08)",
    teaser1: "Где вкус встречает дело",
    title: "Корпоратив",
    teaser2: "Под ключ сервис",
    imageSrc: "/media/gamma/gamma-catering-erlebnis-corporate-events.jpg",
    imageAlt:
      "Корпоративный гала-ужин — кейтеринг Interfood на корпоративном мероприятии",
    ctaLabel: "Смотреть",
    ctaHref: "#calculator",
  },
  {
    id: "banquets",
    label: "Банкеты",
    tint: "rgba(139, 90, 30, 0.10)",
    teaser1: "В большом масштабе",
    title: "Банкеты",
    teaser2: "Под ключ сервис",
    imageSrc: "/media/gamma/gammacatering-grossanlaesse.jpg",
    imageAlt:
      "Большой банкет на 500+ гостей — кейтеринг Interfood в крупном масштабе",
    ctaLabel: "Смотреть",
    ctaHref: "#calculator",
  },
  {
    id: "private",
    label: "Фуршеты",
    tint: "rgba(180, 90, 40, 0.08)",
    teaser1: "Камерно и особено",
    title: "Фуршеты",
    teaser2: "Под ключ сервис",
    imageSrc: "/media/gamma/gamma-catering-erlebnis-privat-events.webp",
    imageAlt:
      "Камерный фуршет — приём на ногах с канапе и закусками от Interfood",
    ctaLabel: "Смотреть",
    ctaHref: "#calculator",
  },
];

/**
 * GammaHaccordion — the horizontal accordion section.
 *
 * Single landmark `<section aria-labelledby>` containing the section
 * header + the 4-item accordion. State is just `openIndex` (default 0).
 * No layout shift on hydration — SSR renders item #1 open by default,
 * matching the client useState initial value.
 */
export function GammaHaccordion() {
  const reduce = useReducedMotion();
  /** Stable id base — guarantees uniqueness if multiple instances ever render. */
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState(0);

  /** Build stable DOM ids from the section's useId base + item id. */
  const panelId = (i: number) => `${baseId}-panel-${ITEMS[i].id}`;
  const spineId = (i: number) => `${baseId}-spine-${ITEMS[i].id}`;

  /** Open an item by index. No-op if out of range. */
  const open = useCallback((i: number) => {
    if (i < 0 || i >= ITEMS.length) return;
    setOpenIndex(i);
  }, []);

  /**
   * Keyboard nav — gamma's actual behaviour (lines 1970-1982):
   *  - Enter / Space     → activate (open) this spine.
   *  - ArrowRight / Down  → focus next CLOSED spine (skip the open one).
   *  - ArrowLeft  / Up    → focus prev CLOSED spine (skip the open one).
   *
   * Skipping the open item is important: clicking the open item's spine is
   * a no-op (it's already open), so we move past it to the next meaningful
   * target. On mobile, ArrowDown/Up act as Right/Left because the spines
   * stack vertically.
   */
  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      const last = ITEMS.length - 1;
      const isHorizontalKey =
        e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowUp";
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(currentIndex);
        return;
      }
      if (!isHorizontalKey) return;
      e.preventDefault();
      const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
      let next = currentIndex;
      for (let step = 0; step < ITEMS.length; step++) {
        next = (next + dir + ITEMS.length) % ITEMS.length;
        if (next === currentIndex) break; // wrapped all the way around
        if (next !== openIndex) {
          // Found a closed spine — focus it.
          const el = document.getElementById(spineId(next));
          el?.focus();
          return;
        }
      }
      // All other spines are open (only 1 spine can be open at a time, so
      // this branch is theoretically unreachable — but kept as a safety net).
      void last;
    },
    [open, openIndex, spineId],
  );

  return (
    <section
      id="gamma-haccordion"
      aria-labelledby="gamma-haccordion-headline"
      className="gamma-hacc-section ea-section--cream"
    >
      <div className="ea-container ea-container--wide">
        {/* — — — — Section head: eyebrow "ОПЫТ" + H2 with italic-as-fragment — — — — */}
        <motion.div
          className="gamma-hacc-section__head"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="ea-eyebrow">ОПЫТ</span>
          <h2
            id="gamma-haccordion-headline"
            className="ea-section-h2 gamma-hacc-section__h2"
          >
            {"Опыт мероприятий "}
            {"для каждого "}
            <i className="ea-italic-fragment">формата</i>
            {"."}
          </h2>
        </motion.div>

        {/* — — — — Horizontal accordion (blocks that fold horizontally) — — — — */}
        <div
          className="gamma-hacc"
          role="group"
          aria-label="4 формата мероприятий — Свадьбы, Корпоратив, Банкеты, Фуршеты"
        >
          {ITEMS.map((item, i) => {
            const isOpen = i === openIndex;
            return (
              <div
                key={item.id}
                className={
                  "gamma-hacc__item" +
                  (isOpen ? " gamma-hacc__item--open" : "")
                }
                style={{ backgroundColor: item.tint }}
                data-haccordion-item
              >
                {/* — — — — Open panel (body: head + media + cta) — — — — */}
                <div
                  id={panelId(i)}
                  className="gamma-hacc__open"
                  hidden={!isOpen}
                  aria-hidden={!isOpen}
                >
                  {/* Head: teaser1 / title / teaser2 (horizontal row) */}
                  <div className="gamma-hacc__head">
                    <p className="gamma-hacc__teaser">{item.teaser1}</p>
                    <h3 className="gamma-hacc__title">{item.title}</h3>
                    <p className="gamma-hacc__teaser gamma-hacc__teaser--end">
                      {item.teaser2}
                    </p>
                  </div>

                  {/* Media: large image fills the open panel's middle */}
                  <figure
                    className="gamma-hacc__media"
                    aria-label={item.imageAlt}
                  >
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      sizes="(max-width: 1023px) 100vw, 50vw"
                      className="gamma-hacc__img object-cover"
                    />
                  </figure>

                  {/* CTA — outline button reusing EA's red accent + slide-up fill */}
                  <div className="gamma-hacc__cta-row">
                    <Link
                      href={item.ctaHref}
                      className="ea-outline-btn"
                      aria-label={`${item.ctaLabel} — ${item.label}`}
                    >
                      {item.ctaLabel}
                    </Link>
                  </div>
                </div>

                {/* — — — — Spine (vertical-title click target — ALWAYS visible) — — — — */}
                <button
                  type="button"
                  id={spineId(i)}
                  role="button"
                  className="gamma-hacc__spine"
                  aria-expanded={isOpen}
                  aria-controls={panelId(i)}
                  aria-label={
                    isOpen
                      ? `${item.label} — открыто`
                      : `Открыть категорию — ${item.label}`
                  }
                  onClick={() => open(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                >
                  <span
                    className="gamma-hacc__spine-index"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="gamma-hacc__spine-title">{item.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default GammaHaccordion;
