"use client";

/**
 * HaccServices — «Каталог услуг» (Cycle 49)
 * ---------------------------------------------------------------------------
 * Full redesign of the services section as a horizontal accordion copied
 * from gammacatering.com ("Erlebnisse" haccordion) and improved beyond it.
 *
 * gamma mechanics (reverse-engineered, research/gamma-haccordion-research.md):
 *  - rack = flex row; each item flex-basis = closed spine width, flex-grow
 *    0→1 opens it (transition .62s easeInOutSine);
 *  - the spine (vertical title) is absolutely positioned at the item's left
 *    edge and widens a little when open;
 *  - the open panel stays in-flow with margin-left = open-spine width and a
 *    JS-measured FIXED px width → the panel never reflows during the flex
 *    animation, it is simply un-clipped left→right (the wipe reveal);
 *  - `.is-resizing` guard disables transitions for 140ms around resize.
 *
 * upgrades over gamma (see AGENTS.md §22 for the full list):
 *  1. 12 panels vs gamma's 4 — a real catalog with prices, hooks and CTAs;
 *  2. inert + delayed visibility on closed panels → no Tab focus leak
 *     (gamma has this bug live);
 *  3. prefers-reduced-motion: instant transitions, no autoplay, no Ken Burns;
 *  4. autoplay with a progress line — pauses on hover/tab-hidden/out-of-view,
 *     stops permanently after the first manual interaction OR focus;
 *  5. hover-intent opening (380ms, fine pointers, ≥1024px) + click anywhere;
 *  6. staggered content entrance (tag → title/media → foot), transform+opacity
 *     only (RULES §5);
 *  7. Ken Burns "exhale" on the open photo (scale 1.09 → 1 over 7s);
 *  8. Marck Script handwritten titles tilted −6° — Cyrillic-capable analog of
 *     gamma's Adobe Handwriting signature;
 *  9. mobile (<1024px): gamma's vertical stack — grid-template-rows 0fr→1fr
 *     collapse, script titles on the bars, plus→× icon with REAL toggle-close
 *     (gamma's × is a lie: tapping the open bar is a no-op), scrollIntoView
 *     on open after the animation settles;
 * 10. accordion ARIA (h3 > button aria-expanded/aria-controls, panel
 *     role=region), arrow/Home/End keyboard nav, visible focus;
 * 11. full-bleed rack (edge-to-edge like gamma), print styles (all panels
 *     expanded), forced-colors borders, WCAG-AA text contrast.
 *
 * Self-contained: scoped CSS in ./hacc-services.css + EA shared utilities.
 * The orchestrator places <HaccServices /> in page.tsx (position #6).
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MousePointer2, Plus } from "lucide-react";

import { SmartImage } from "@/components/media/smart-image";
import "./hacc-services.css";

/* ------------------------------------------------------------------ config */

const EASE = [0.22, 1, 0.36, 1] as const;
/** One autoplay cycle — kept in sync with the CSS progress line via an
 *  inline `animationDuration` (single source of truth, no magic dupe). */
const AUTOPLAY_MS = 6500;
/** Baymard: hover-intent delay avoids flicker when sweeping across spines. */
const HOVER_INTENT_MS = 380;
const DESKTOP_MQ = "(min-width: 1024px)";

/**
 * Tiny 8×8 SVG placeholder (base64) — soft parchment wash before the photo
 * loads (SmartImage rule: placeholder="blur" when blurDataURL is provided).
 */
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNGNUZFRUUyIi8+PC9zdmc+";

/* ----------------------------------------------------------------- content */

interface HaccService {
  id: string;
  index: string;
  title: string;
  hook: string;
  /** «от 1 600 ₽» — units live in `priceLabel` so the price itself stays bold */
  price: string;
  priceLabel: string;
  tag: string;
  /** warm per-service tint — 6 distinct families cycling over 12 panels
   *  (cycle-2 critique: 12 near-identical tints read as "paint chips") */
  tint: string;
  media: string;
  mediaAlt: string;
  ctaLabel: string;
  ctaHref: string;
}

/**
 * 12 services — validated copy carried over from Cycle 45 SpiralServices;
 * media upgraded to 2048px sources (cycle-2 critique C4: the old 484×726
 * thumbnails were mushy on retina). Tints: 6 distinct warm editorial
 * families (cream / blush / sage / honey / ember / rose), no blue.
 */
const SERVICES: HaccService[] = [
  {
    id: "furshety",
    index: "01",
    title: "Фуршеты",
    hook: "Канапе, welcome-коктейли и подача, которая не останавливается ни на минуту.",
    price: "от 1\u00A0600\u00A0₽",
    priceLabel: "за гостя",
    tag: "Базовая подача",
    tint: "#F5EEE2",
    media: "/media/gamma/c49-furshet-hires.jpg",
    mediaAlt: "Фуршетные закуски и канапе на подаче",
    ctaLabel: "Рассчитать фуршет",
    ctaHref: "#calculator",
  },
  {
    id: "bankety",
    index: "02",
    title: "Банкеты",
    hook: "Полная посадка: от аперитива до десерта — официанты, сомелье и тайминг до минуты.",
    price: "от 3\u00A0500\u00A0₽",
    priceLabel: "за гостя",
    tag: "Премиум",
    tint: "#F6E0DB",
    media: "/media/gamma/c49-banket-hires.jpg",
    mediaAlt: "Банкетный ужин в зале с полным накрытием столов",
    ctaLabel: "Рассчитать банкет",
    ctaHref: "#calculator",
  },
  {
    id: "svadby",
    index: "03",
    title: "Свадьбы",
    hook: "Выездная регистрация, банкет и торт — одна команда отвечает за весь день.",
    price: "от 5\u00A0500\u00A0₽",
    priceLabel: "за гостя",
    tag: "Под ключ",
    tint: "#E6EBDF",
    media: "/media/gamma/c49-svadby-hires.webp",
    mediaAlt: "Свадебный банкет с сервировкой и декором",
    ctaLabel: "Обсудить свадьбу",
    ctaHref: "#contact",
  },
  {
    id: "korporativ",
    index: "04",
    title: "Корпоратив",
    hook: "Конференции, форумы и гала-ужины: кофе-брейки, фуршеты и полный техтайминг.",
    price: "от 2\u00A0500\u00A0₽",
    priceLabel: "за гостя",
    tag: "B2B",
    tint: "#F6E9C9",
    media: "/media/gamma/c49-korporativ-hires.webp",
    mediaAlt: "Корпоративный гала-ужин с сервировкой",
    ctaLabel: "Запросить смету",
    ctaHref: "#contact",
  },
  {
    id: "kofe-breyki",
    index: "05",
    title: "Кофе-брейки",
    hook: "Горячее в термоупаковке к 12:00 — каждый день или к вашей дате.",
    price: "от 450\u00A0₽",
    priceLabel: "за гостя",
    tag: "Офис",
    tint: "#F4DECD",
    media: "/media/menu-coffee-break.jpg",
    mediaAlt: "Кофе-брейк с выпечкой и горячими напитками",
    ctaLabel: "Заказать кофе-брейк",
    ctaHref: "#calculator",
  },
  {
    id: "barbekyu",
    index: "06",
    title: "Барбекю",
    hook: "Рибай и овощи с мангала — живой огонь и ароматы, которые собирают гостей.",
    price: "от 2\u00A0000\u00A0₽",
    priceLabel: "за гостя",
    tag: "На природе",
    tint: "#F3E3E8",
    media: "/media/talkofthetown/talkofthetown-section-paella-station.jpg",
    mediaAlt: "Гриль-станция с живым огнём на мероприятии",
    ctaLabel: "Рассчитать барбекю",
    ctaHref: "#calculator",
  },
  {
    id: "bar",
    index: "07",
    title: "Выездной бар",
    hook: "Коктейли, моктейли и винная подача: бармены, лёд, бокалы и настроение.",
    price: "от 900\u00A0₽",
    priceLabel: "за гостя",
    tag: "Миксология",
    tint: "#F5EEE2",
    media: "/media/gamma/c49-bar-hires.webp",
    mediaAlt: "Аперитив и винная подача на выездном баре",
    ctaLabel: "Обсудить бар",
    ctaHref: "#contact",
  },
  {
    id: "shou-stancii",
    index: "08",
    title: "Шоу-станции",
    hook: "Поке, паста, карвинг и тако: гости смотрят, как рождается блюдо.",
    price: "от 1\u00A0800\u00A0₽",
    priceLabel: "за гостя",
    tag: "Live cooking",
    tint: "#F6E0DB",
    media: "/media/gamma/c49-shou-hires.webp",
    mediaAlt: "Шеф-повара у шоу-станции с презентацией блюд",
    ctaLabel: "Запросить шоу-станции",
    ctaHref: "#contact",
  },
  {
    id: "gastro-boksy",
    index: "09",
    title: "Гастро-боксы",
    hook: "6–8 видов канапе, упакованных порционно, — к нужному часу.",
    price: "от 650\u00A0₽",
    priceLabel: "за гостя",
    tag: "Доставка",
    tint: "#E6EBDF",
    media: "/media/menu-snack-box.jpg",
    mediaAlt: "Гастро-боксы с порционными закусками",
    ctaLabel: "Заказать боксы",
    ctaHref: "#calculator",
  },
  {
    id: "torty",
    index: "10",
    title: "Торты на заказ",
    hook: "Ярусы, текстуры, сезонные ягоды: торт как архитектура.",
    price: "от 4\u00A0500\u00A0₽",
    priceLabel: "за торт",
    tag: "Десерт",
    tint: "#F6E9C9",
    media: "/media/concorde-dessert.jpg",
    mediaAlt: "Многоярусный свадебный торт с ягодами",
    ctaLabel: "Обсудить торт",
    ctaHref: "#contact",
  },
  {
    id: "veg-halal",
    index: "11",
    title: "Вегетарианское и халяль",
    hook: "Сертифицированные поставки и овощи как главные герои.",
    price: "от 1\u00A0900\u00A0₽",
    priceLabel: "за гостя",
    tag: "Спецдиета",
    tint: "#F4DECD",
    media: "/media/ridgewells-veg-mosaic.jpg",
    mediaAlt: "Овощная мозаика вегетарианского меню",
    ctaLabel: "Запросить меню",
    ctaHref: "#contact",
  },
  {
    id: "logistika",
    index: "12",
    title: "Логистика под ключ",
    hook: "Посуда, мебель, текстиль, декор: привезли — сервировали — забрали.",
    price: "под проект",
    priceLabel: "оценка за 1 день",
    tag: "Под ключ",
    tint: "#F3E3E8",
    media: "/media/gamma/c49-logistika-hires.webp",
    mediaAlt: "Сервировка и логистика крупного мероприятия",
    ctaLabel: "Обсудить логистику",
    ctaHref: "#contact",
  },
];

const N = SERVICES.length;

/* -------------------------------------------------------------- component */

export function HaccServices() {
  const baseId = useId();

  const rackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const spineRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * One panel open at a time (gamma exclusivity) — but `null` (all closed)
   * is allowed on mobile via toggle-close, where the × icon promises it.
   * SSR renders #1 open — matches the client's initial state.
   */
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  /** autoplay lives until the first manual interaction or focus (WCAG 2.2.2) */
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [docHidden, setDocHidden] = useState(false);
  const [inView, setInView] = useState(false);
  /** ≥1024px — autoplay is desktop-only: on mobile the expanding panel
   *  shifts layout ~500px under a reading user every cycle (cycle-3 MAJOR) */
  const [isDesktop, setIsDesktop] = useState(false);
  /** ≥1024px + fine pointer → hover-intent opening is allowed */
  const [desktopFine, setDesktopFine] = useState(false);

  const prefersReduced = useReducedMotion();

  /* mirror frequently-read values into refs for stable closures ---------- */
  const openIndexRef = useRef<number | null>(openIndex);
  useEffect(() => {
    openIndexRef.current = openIndex;
  }, [openIndex]);

  const paused = hovering || focusWithin || docHidden || !inView;
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  /* desktop media queries (width for autoplay, width+pointer for hover) -- */
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const fine = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const update = () => {
      setIsDesktop(mq.matches);
      setDesktopFine(fine.matches);
    };
    update();
    mq.addEventListener("change", update);
    fine.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      fine.removeEventListener("change", update);
    };
  }, []);

  /* ── gamma's panel-width measurement (JS px, no reflow mid-animation) ── */
  useEffect(() => {
    const rack = rackRef.current;
    if (!rack) return;
    let raf = 0;
    let timer = 0;
    let prevW = -1;

    const measure = () => {
      const cs = getComputedStyle(rack);
      const spine = parseFloat(cs.getPropertyValue("--hacc-spine")) || 0;
      const spineOpen = parseFloat(cs.getPropertyValue("--hacc-spine-open")) || 0;
      const gap = parseFloat(cs.getPropertyValue("--hacc-gap")) || 0;
      const w = rack.clientWidth - (N - 1) * (spine + gap) - spineOpen;
      rack.style.setProperty("--hacc-panel-w", `${Math.max(w, 0)}px`);
    };

    const onResize = () => {
      // layout-affecting only on the desktop rack
      if (!window.matchMedia(DESKTOP_MQ).matches) return;
      rack.classList.add("is-resizing");
      measure();
      window.clearTimeout(timer);
      timer = window.setTimeout(() => rack.classList.remove("is-resizing"), 140);
    };

    measure();
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? -1;
      if (w === prevW) return; // ignore height-only (mobile expand) events
      prevW = w;
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(onResize);
    });
    ro.observe(rack);
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  /* ── autoplay: advance every AUTOPLAY_MS while visible & not paused ──── */
  const nextAtRef = useRef(0);
  const remainingRef = useRef(AUTOPLAY_MS);

  useEffect(() => {
    if (prefersReduced || !playing || !isDesktop || openIndex === null) return;
    nextAtRef.current = Date.now() + AUTOPLAY_MS;
    remainingRef.current = AUTOPLAY_MS;

    const tick = () => {
      const now = Date.now();
      if (pausedRef.current) {
        nextAtRef.current = now + remainingRef.current;
        return;
      }
      if (now >= nextAtRef.current) {
        remainingRef.current = AUTOPLAY_MS;
        nextAtRef.current = now + AUTOPLAY_MS;
        setOpenIndex((i) => (i === null ? 0 : (i + 1) % N));
      } else {
        remainingRef.current = nextAtRef.current - now;
      }
    };
    const iv = window.setInterval(tick, 250);
    return () => window.clearInterval(iv);
  }, [prefersReduced, playing, isDesktop, openIndex]);

  /* ── visibility: IntersectionObserver + document visibilitychange ────── */
  useEffect(() => {
    const rack = rackRef.current;
    if (!rack) return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { threshold: 0.3 },
    );
    io.observe(rack);
    const onVis = () => setDocHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  /* ── open(): the single interaction entry point ──────────────────────── */
  const scrollTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(scrollTimer.current), []);

  const open = useCallback(
    (i: number, manual: boolean) => {
      if (i < 0 || i >= N) return;
      if (manual) setPlaying(false);
      if (openIndexRef.current === i) {
        // Mobile: the × icon promises a toggle — close the panel (gamma's
        // own × is a no-op lie). Desktop has no × affordance, so it stays
        // exclusive-always-open like gamma.
        if (
          typeof window !== "undefined" &&
          !window.matchMedia(DESKTOP_MQ).matches
        ) {
          setOpenIndex(null);
        }
        return;
      }
      setOpenIndex(i);
      // mobile: bring the freshly-opened item into view (gamma behaviour,
      // refined — scroll-margin-top on the item respects the sticky header).
      // Wait for the 520ms grid-rows animation to FINISH first: scrolling
      // mid-animation targets a stale position (the closing panel above is
      // still collapsing) and overshoots by the remaining delta.
      if (
        typeof window !== "undefined" &&
        !window.matchMedia(DESKTOP_MQ).matches &&
        !prefersReduced
      ) {
        window.clearTimeout(scrollTimer.current);
        scrollTimer.current = window.setTimeout(() => {
          itemRefs.current[i]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 600);
      }
    },
    [prefersReduced],
  );

  /* ── hover-intent (fine pointer, desktop): open after 380ms dwell ────── */
  const hoverTimer = useRef(0);
  const onSpineEnter = useCallback(
    (i: number) => {
      if (!desktopFine || prefersReduced) return;
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = window.setTimeout(() => {
        if (i !== openIndexRef.current) open(i, false);
      }, HOVER_INTENT_MS);
    },
    [desktopFine, prefersReduced, open],
  );
  const clearHoverIntent = useCallback(() => {
    window.clearTimeout(hoverTimer.current);
  }, []);
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  /* ── keyboard: arrows wrap, Home/End jump (gamma model, extended) ────── */
  const onRackKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const idx = Number(
        (e.target as HTMLElement).closest<HTMLElement>("[data-spine-index]")
          ?.dataset.spineIndex ?? -1,
      );
      if (idx < 0) return;
      let target = -1;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          target = (idx + 1) % N;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          target = (idx - 1 + N) % N;
          break;
        case "Home":
          target = 0;
          break;
        case "End":
          target = N - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      spineRefs.current[target]?.focus();
    },
    [],
  );

  const panelId = (i: number) => `${baseId}-panel-${SERVICES[i].id}`;
  const spineId = (i: number) => `${baseId}-spine-${SERVICES[i].id}`;

  const autoplayOn = playing && !prefersReduced && isDesktop && openIndex !== null;

  /* ─────────────────────────────────────────────────────────────── render */

  return (
    <section
      id="services"
      aria-labelledby="hacc-heading"
      className="hacc ea-section ea-section--cream"
    >
      {/* section head stays inside the site grid; the rack below goes
          full-bleed edge-to-edge — exactly like gamma's haccordion */}
      <div className="ea-container ea-container--wide">
        <motion.div
          className="hacc__head"
          initial={prefersReduced ? false : { opacity: 0, y: 26 }}
          whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="hacc__head-text">
            <span className="ea-eyebrow">Услуги · 12 форматов</span>
            <h2 id="hacc-heading" className="ea-section-h2">
              {"Меню события начинается с "}
              <i className="ea-italic-fragment">формата</i>
              {"."}
            </h2>
            <p className="hacc__lede">
              От кофе-брейка на двадцать персон до свадьбы на пятьсот гостей:
              раскройте формат — увидите кухню, команду и цену за гостя.
            </p>
          </div>
          <span className="hacc__hint" aria-hidden="true">
            <MousePointer2 aria-hidden="true" />
            Щёлкните по корешку — формат раскроется
          </span>
        </motion.div>
      </div>

      {/* — — — — — — the rack: 12 vertical spines + one open panel — — — */}
      <motion.div
        ref={rackRef}
        className="hacc__rack"
        role="group"
        aria-label="12 форматов кейтеринга — раскройте формат"
        data-autoplay={autoplayOn ? "on" : "off"}
        data-paused={paused ? "true" : "false"}
        initial={prefersReduced ? false : { opacity: 0, x: 64 }}
        whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.08 }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => {
          setHovering(false);
          clearHoverIntent();
        }}
        onFocus={() => {
          setFocusWithin(true);
          // WCAG 2.2.2: once the user engages with the keyboard, the
          // rotation stops for good — no silent autoplay under their hands.
          setPlaying(false);
        }}
        onBlur={() => setFocusWithin(false)}
        onKeyDown={onRackKeyDown}
      >
        {SERVICES.map((s, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={s.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={"hacc__item" + (isOpen ? " is-open" : "")}
              style={{ backgroundColor: s.tint }}
            >
              {/* — — — spine: the vertical "корешок" click target — — */}
              <h3 className="hacc__spine-heading">
                <button
                  type="button"
                  ref={(el) => {
                    spineRefs.current[i] = el;
                  }}
                  id={spineId(i)}
                  data-spine-index={i}
                  className="hacc__spine"
                  aria-expanded={isOpen}
                  aria-controls={panelId(i)}
                  aria-label={
                    isOpen
                      ? `${s.title} — открыто`
                      : `Раскрыть формат — ${s.title}`
                  }
                  onClick={() => open(i, true)}
                  onMouseEnter={() => onSpineEnter(i)}
                  onMouseLeave={clearHoverIntent}
                >
                  <span className="hacc__num" aria-hidden="true">
                    {s.index}
                  </span>
                  <span className="hacc__spine-title">
                    <span className="hacc__spine-title-text">{s.title}</span>
                  </span>
                  {/* plus icon — mobile bars only (CSS hides on desktop) */}
                  <span className="hacc__spine-plus" aria-hidden="true">
                    <Plus />
                  </span>
                  {/* autoplay progress — open spine only, CSS-driven; the
                      inline duration keeps CSS and JS clocks in sync */}
                  {autoplayOn && isOpen ? (
                    <span
                      className="hacc__spine-progress"
                      key={`progress-${openIndex}`}
                      /* single source of truth for both clocks — the CSS var
                         cascades into the ::after fill animation */
                      style={
                        {
                          "--hacc-autoplay-ms": `${AUTOPLAY_MS}ms`,
                        } as CSSProperties
                      }
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              </h3>

              {/* — — — open panel: fixed-width, clipped while closed — — */}
              <div
                id={panelId(i)}
                className="hacc__open"
                role="region"
                aria-labelledby={spineId(i)}
                inert={!isOpen}
              >
                <div className="hacc__body">
                  {/* head row: tag · handwritten title · price */}
                  <div className="hacc__row-head">
                    <span className="hacc__tag">{s.tag}</span>
                    <p className="hacc__title">{s.title}</p>
                    <span className="hacc__price">
                      <small>{s.priceLabel}</small>
                      {s.price}
                    </span>
                  </div>

                  {/* media with Ken Burns exhale. `loading` follows the
                      open state: closed panels stay lazy (nothing to see
                      inside a 36px clipped spine), the open panel loads
                      eagerly so the photo is there the moment the wipe
                      reveals it — never a black frame. */}
                  <figure className="hacc__media">
                    <SmartImage
                      src={s.media}
                      alt={s.mediaAlt}
                      fill
                      blurDataURL={BLUR_DATA_URL}
                      sizes="(max-width: 1023px) 100vw, 62vw"
                      loading={isOpen ? "eager" : "lazy"}
                      className="hacc__img"
                    />
                  </figure>

                  {/* foot row: hook + CTA */}
                  <div className="hacc__row-foot">
                    <p className="hacc__hook">{s.hook}</p>
                    <Link
                      href={s.ctaHref}
                      className="ea-outline-btn hacc__cta"
                      aria-label={`${s.ctaLabel} — ${s.title}`}
                    >
                      {s.ctaLabel}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}

export default HaccServices;
