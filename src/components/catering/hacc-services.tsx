"use client";

/**
 * HaccServices — «Каталог услуг» (Cycle 52: two six-spine racks)
 * ---------------------------------------------------------------------------
 * User verdict after three passes: the SOLID tint spines read better than
 * the filmstrip experiment (reverted), and 12 spines crowd the composition —
 * so the catalog splits into TWO racks of six, the second below the first:
 *
 *   Rack A «Форматы события»        01–06  (фуршеты → барбекю)
 *   Rack B «К любому формату»        07–12  (бар → логистика)
 *
 * Six spines per rack give the open panel ~71% of the rack width —
 * gamma-grade cinema (the 12-spine rack could only reach 67% while keeping
 * the spines readable). Each rack is a full gamma haccordion on its own.
 *
 * gamma mechanics (research/gamma-haccordion-research.md), per rack:
 *  - flex-basis = closed spine width, flex-grow 0→1 opens (620ms easeInOutSine)
 *  - spine (vertical title) absolute at the item's left, widens when open
 *  - open panel: JS-measured FIXED px width → zero reflow mid-animation
 *  - .is-resizing guard around resize measurement
 *  - full-bleed rack (edge-to-edge like gamma)
 *  - exclusivity: one panel always open (mobile: real toggle-close —
 *    gamma's × is a no-op lie)
 *  - inert + delayed visibility on closed panels → no Tab focus leak
 *
 * Two-rack focus model (the only genuinely new machinery):
 *  - each rack owns its openIndex; opening in B never disturbs A
 *  - ONE rack plays at a time — the FOCUSED rack. Focus follows hover /
 *    click / keyboard, and scroll (IO hysteresis: a rack takes focus when
 *    visibly dominant; manual focus wins for 2.5s so scrolling past a rack
 *    the user is reading can't steal it back)
 *  - section-level ambient tint wash + live counter HUD mirror the focused
 *    rack's open panel (global index 01–12)
 *
 * Carried over from cycles 49–51: hover-intent opening (380ms, fine
 * pointers), staggered entrances per rack, spring mouse-parallax on the
 * open photo, magnetic CTA + arrow, script-title settle, perpetual Ken
 * Burns drift + unifying color grade, autoplay progress line (desktop,
 * focused rack only, stops after the first manual engagement — WCAG 2.2.2),
 * full prefers-reduced-motion, print styles, forced-colors.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { ArrowUpRight, MousePointer2, Plus } from "lucide-react";

import { SmartImage } from "@/components/media/smart-image";
import { Magnetic } from "@/components/motion/magnetic";
import "./hacc-services.css";

/* ------------------------------------------------------------------ config */

const EASE = [0.22, 1, 0.36, 1] as const;
/** One autoplay cycle — synced with the CSS progress line via a cascading
 *  custom property (single source of truth, no magic dupe). */
const AUTOPLAY_MS = 6500;
/** Baymard: hover-intent delay avoids flicker when sweeping across spines. */
const HOVER_INTENT_MS = 380;
const DESKTOP_MQ = "(min-width: 1024px)";
/** Manual focus suppresses scroll-based focus switching for this long. */
const FOCUS_STICKY_MS = 2500;
/** IO hysteresis: a rack must beat the other by this ratio to take focus. */
const FOCUS_RATIO_EDGE = 0.15;

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
  /** warm per-service tint — 6 distinct families cycling over 12 panels */
  tint: string;
  media: string;
  mediaAlt: string;
  ctaLabel: string;
  ctaHref: string;
}

/**
 * 12 services — validated copy carried over from Cycle 45 SpiralServices;
 * 2048px media (cycle-49). The split is semantic, not arbitrary: rack A is
 * event FORMATS (what kind of event), rack B is SERVICES & extras (what we
 * additionally deliver at any event).
 */
const SERVICES: HaccService[] = [
  {
    id: "furshety",
    index: "01",
    title: "Фуршеты",
    hook: "Канапе — тёплыми, коктейли — ледяными: подача не прерывается весь вечер.",
    price: "от 1\u00A0600\u00A0₽",
    priceLabel: "за гостя",
    tag: "Классическая подача",
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
    hook: "От аперитива до десерта вечер идёт по нотам — горячее подают горячим.",
    price: "от 3\u00A0500\u00A0₽",
    priceLabel: "за гостя",
    tag: "Полная посадка",
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
    hook: "От утреннего кофе до ночного торта — весь день ведёт одна команда.",
    price: "от 5\u00A0500\u00A0₽",
    priceLabel: "за гостя",
    tag: "Под ключ",
    tint: "#E6EBDF",
    media: "/media/c53/svadby.webp",
    mediaAlt: "Свадебный банкет при свечах с сервировкой столов",
    ctaLabel: "Обсудить свадьбу",
    ctaHref: "#contact",
  },
  {
    id: "korporativ",
    index: "04",
    title: "Корпоратив",
    hook: "Кофе — к первому перерыву, гала-ужин — к финалу: тайминг сходится до минуты.",
    price: "от 2\u00A0500\u00A0₽",
    priceLabel: "за гостя",
    tag: "B2B",
    tint: "#F6E9C9",
    media: "/media/gamma/c49-korporativ-hires.webp",
    mediaAlt: "Корпоративный гала-ужин с сервировкой",
    ctaLabel: "Получить смету",
    ctaHref: "#contact",
  },
  {
    id: "kofe-breyki",
    index: "05",
    title: "Кофе-брейки",
    hook: "Выпечка ещё тёплая, кофе пахнет на весь этаж — к нужному часу.",
    price: "от 450\u00A0₽",
    priceLabel: "за гостя",
    tag: "Офис",
    tint: "#F4DECD",
    media: "/media/c53/kofe-stol.webp",
    mediaAlt: "Кофе-брейк: круассаны, пирог и кофе с латте-артом",
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
    media: "/media/c55/barbekyu.webp",
    mediaAlt: "Стейк на кости жарится на живых углях",
    ctaLabel: "Рассчитать барбекю",
    ctaHref: "#calculator",
  },
  {
    id: "bar",
    index: "07",
    title: "Выездной бар",
    hook: "Шейкер звенит, бокалы ледяные — бар живёт до последнего тоста.",
    price: "от 900\u00A0₽",
    priceLabel: "за гостя",
    tag: "Миксология",
    tint: "#F5EEE2",
    media: "/media/c57/c57-bar.webp",
    mediaAlt: "Bartender preparing a craft cocktail at a well-stocked mobile bar with bottles, fresh fruit garnishes, and a smoke infuser in use",
    ctaLabel: "Обсудить бар",
    ctaHref: "#contact",
  },
  {
    id: "shou-stancii",
    index: "08",
    title: "Шоу-станции",
    hook: "Кухня выходит к столу: паста в облаке пара, карвинг под ножом шефа.",
    price: "от 1\u00A0800\u00A0₽",
    priceLabel: "за гостя",
    tag: "Живая кухня",
    tint: "#F6E0DB",
    media: "/media/c57/c57-shou.webp",
    mediaAlt: "Chef in hat and white jacket placing food into a demonstration oven while guests watch from the background",
    ctaLabel: "Обсудить станции",
    ctaHref: "#contact",
  },
  {
    id: "gastro-boksy",
    index: "09",
    title: "Гастро-боксы",
    hook: "Банкет, который помещается в коробке, — каждому гостю лично.",
    price: "от 650\u00A0₽",
    priceLabel: "за гостя",
    tag: "Доставка",
    tint: "#E6EBDF",
    media: "/media/c57/c57-boksy.webp",
    mediaAlt: "Table display of small clear catering boxes filled with crackers, grapes, cheese, and assorted snacks",
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
    media: "/media/c55/tort.webp",
    mediaAlt: "Двухъярусный торт с клубникой, малиной и ежевикой",
    ctaLabel: "Обсудить торт",
    ctaHref: "#contact",
  },
  {
    id: "veg-halal",
    index: "11",
    title: "Вегетарианское и халяль",
    hook: "Сертификат — на халяль, сезонные овощи — в главную роль.",
    price: "от 1\u00A0900\u00A0₽",
    priceLabel: "за гостя",
    tag: "Особые меню",
    tint: "#F4DECD",
    media: "/media/ridgewells-veg-mosaic.jpg",
    mediaAlt: "Овощная мозаика вегетарианского меню",
    ctaLabel: "Получить меню",
    ctaHref: "#contact",
  },
  {
    id: "logistika",
    index: "12",
    title: "Логистика под ключ",
    hook: "Посуда, мебель, текстиль, декор: привезли — сервировали — забрали.",
    price: "под проект",
    priceLabel: "смета за один день",
    tag: "Всё, кроме еды",
    tint: "#F3E3E8",
    media: "/media/c57/c57-logistika.webp",
    mediaAlt: "Banquet hall set up for a wedding reception with rows of white-tableclothed tables, place settings, and a chandelier overhead",
    ctaLabel: "Обсудить логистику",
    ctaHref: "#contact",
  },
];

/** The semantic split: event formats vs services & extras. */
const GROUPS: { label: string }[] = [
  { label: "Форматы события" },
  { label: "К любому формату" },
];

const GROUP_SIZE = 6;

/* ----------------------------------------------------------- rack (6 items) */

interface HaccRackProps {
  /** The six services this rack owns. */
  items: HaccService[];
  /** Global index of items[0] (0 for rack A, 6 for rack B). */
  offset: number;
  /** Group label — used for the rack's aria-label. */
  groupLabel: string;
  /** Only the focused rack autoplays / shows its progress line. */
  focused: boolean;
  /** Global autoplay liveness — dies on the first manual engagement. */
  playing: boolean;
  docHidden: boolean;
  reduced: boolean | null;
  /** Report the rack's open panel (global index, or null = all closed). */
  onOpen: (globalIndex: number | null) => void;
  /** Hover — shifts focus to this rack (autoplay keeps living). */
  onHoverRack: () => void;
  /** Click / keyboard focus — shifts focus AND stops autoplay (WCAG 2.2.2). */
  onEngageRack: () => void;
}

function HaccRack({
  items,
  offset,
  groupLabel,
  focused,
  playing,
  docHidden,
  reduced,
  onOpen,
  onHoverRack,
  onEngageRack,
}: HaccRackProps) {
  const baseId = useId();

  const rackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const spineRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const N = items.length;

  /** One panel open at a time (gamma exclusivity); null = all closed
   *  (mobile toggle-close only). SSR renders #1 open — matches client. */
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [inView, setInView] = useState(false);
  /** ≥1024px + fine pointer → hover-intent opening + parallax allowed */
  const [desktopFine, setDesktopFine] = useState(false);
  /** ≥1024px → autoplay allowed (mobile layout-shift guard) */
  const [isDesktop, setIsDesktop] = useState(false);

  const paused = hovering || focusWithin || docHidden || !inView || !focused;

  /* mirror frequently-read values into refs for stable closures ---------- */
  const openIndexRef = useRef<number | null>(openIndex);
  useEffect(() => {
    openIndexRef.current = openIndex;
  }, [openIndex]);

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
  }, [N]);

  /* report the open panel to the section (ambient + counter mirror it) --- */
  useEffect(() => {
    onOpen(openIndex === null ? null : offset + openIndex);
  }, [openIndex, offset, onOpen]);

  /* ── visibility for autoplay pausing ─────────────────────────────────── */
  useEffect(() => {
    const rack = rackRef.current;
    if (!rack) return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { threshold: 0.25 },
    );
    io.observe(rack);
    return () => io.disconnect();
  }, []);

  /* ── autoplay: the FOCUSED rack advances every AUTOPLAY_MS while in
     view and not paused. Unfocused racks freeze — one thing moves at a
     time (premium restraint). ──────────────────────────────────────────── */
  const nextAtRef = useRef(0);
  const remainingRef = useRef(AUTOPLAY_MS);

  useEffect(() => {
    if (reduced || !playing || !focused || !isDesktop || openIndex === null)
      return;
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
  }, [reduced, playing, focused, isDesktop, openIndex, N]);

  /* ── open(): the single interaction entry point ──────────────────────── */
  const scrollTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(scrollTimer.current), []);

  const open = useCallback(
    (i: number, manual: boolean) => {
      if (i < 0 || i >= N) return;
      if (manual) onEngageRack();
      if (openIndexRef.current === i) {
        // Mobile: the × icon promises a toggle — close the panel (gamma's
        // own × is a no-op lie). Desktop stays exclusive-always-open.
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
      // refined). Wait for the 520ms grid-rows animation to FINISH first:
      // scrolling mid-animation targets a stale position and overshoots.
      if (
        typeof window !== "undefined" &&
        !window.matchMedia(DESKTOP_MQ).matches &&
        !reduced
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
    [reduced, onEngageRack, N],
  );

  /* ── hover-intent (fine pointer, desktop): open after 380ms dwell ────── */
  const hoverTimer = useRef(0);
  const onSpineEnter = useCallback(
    (i: number) => {
      if (!desktopFine || reduced) return;
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = window.setTimeout(() => {
        if (i !== openIndexRef.current) open(i, false);
      }, HOVER_INTENT_MS);
    },
    [desktopFine, reduced, open],
  );
  const clearHoverIntent = useCallback(() => {
    window.clearTimeout(hoverTimer.current);
  }, []);
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  /* ── spring mouse-parallax on this rack's open photo ─────────────────── */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const parallaxX = useSpring(px, { stiffness: 140, damping: 22, mass: 0.6 });
  const parallaxY = useSpring(py, { stiffness: 140, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (!desktopFine || reduced) {
      px.set(0);
      py.set(0);
    }
  }, [desktopFine, reduced, px, py]);

  const onRackMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!desktopFine || reduced) return;
      const idx = openIndexRef.current;
      if (idx === null) return;
      const item = itemRefs.current[idx];
      if (!item) return;
      const r = item.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      px.set(Math.max(-0.6, Math.min(0.6, nx)) * 20);
      py.set(Math.max(-0.6, Math.min(0.6, ny)) * 12);
    },
    [desktopFine, reduced, px, py],
  );

  /* ── keyboard: arrows wrap within THIS rack, Home/End jump ──────────── */
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
    [N],
  );

  const panelId = (i: number) => `${baseId}-panel-${items[i].id}`;
  const spineId = (i: number) => `${baseId}-spine-${items[i].id}`;

  const autoplayOn = focused && playing && !reduced && isDesktop && openIndex !== null;

  /* choreographed entrance — this rack's spines cascade (40ms stagger) -- */
  const rackVariants = reduced
    ? undefined
    : {
        hidden: { opacity: 0 },
        show: { opacity: 1 },
      };
  const itemVariants = reduced
    ? undefined
    : {
        hidden: { opacity: 0, y: 36 },
        show: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: { duration: 0.65, ease: EASE, delay: 0.06 + i * 0.045 },
        }),
      };

  /* ─────────────────────────────────────────────────────────────── render */

  return (
    <motion.div
      ref={rackRef}
      className="hacc__rack"
      role="group"
      aria-label={`${groupLabel} — форматы кейтеринга`}
      data-autoplay={autoplayOn ? "on" : "off"}
      data-paused={paused ? "true" : "false"}
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "show"}
      viewport={{ once: true, margin: "-60px" }}
      variants={rackVariants}
      onMouseMove={onRackMouseMove}
      onMouseEnter={() => {
        setHovering(true);
        onHoverRack();
      }}
      onMouseLeave={() => {
        setHovering(false);
        clearHoverIntent();
        px.set(0);
        py.set(0);
      }}
      onFocus={() => {
        setFocusWithin(true);
        // WCAG 2.2.2: keyboard engagement stops the rotation for good.
        onEngageRack();
      }}
      onBlur={() => setFocusWithin(false)}
      onKeyDown={onRackKeyDown}
    >
      {items.map((s, k) => {
        const isOpen = openIndex === k;
        return (
          <motion.div
            key={s.id}
            ref={(el) => {
              itemRefs.current[k] = el;
            }}
            className={"hacc__item" + (isOpen ? " is-open" : "")}
            style={
              {
                backgroundColor: s.tint,
                "--hacc-item-tint": s.tint,
              } as CSSProperties
            }
            variants={itemVariants}
            custom={k}
          >
            {/* — — — spine: the vertical "корешок" click target — — */}
            <h3 className="hacc__spine-heading">
              <button
                type="button"
                ref={(el) => {
                  spineRefs.current[k] = el;
                }}
                id={spineId(k)}
                data-spine-index={k}
                className="hacc__spine"
                aria-expanded={isOpen}
                aria-controls={panelId(k)}
                aria-label={
                  isOpen
                    ? `${s.title} — открыто`
                    : `Раскрыть формат — ${s.title}`
                }
                onClick={() => open(k, true)}
                onMouseEnter={() => onSpineEnter(k)}
                onMouseLeave={clearHoverIntent}
              >
                {/* cycle-55: spine numbers REMOVED — the user asked twice
                    what they're for; the honest answer was "nothing". The
                    rack labels name the groups; the titles sell the service. */}
                <span className="hacc__spine-title">
                  <span className="hacc__spine-title-text">{s.title}</span>
                </span>
                {/* plus icon — mobile bars only (CSS hides on desktop) */}
                <span className="hacc__spine-plus" aria-hidden="true">
                  <Plus />
                </span>
                {/* autoplay progress — focused rack's open spine only; the
                    inline duration var keeps CSS and JS clocks in sync */}
                {autoplayOn && isOpen ? (
                  <span
                    className="hacc__spine-progress"
                    key={`progress-${openIndex}`}
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
              id={panelId(k)}
              className="hacc__open"
              role="region"
              aria-labelledby={spineId(k)}
              inert={!isOpen}
            >
              <div className="hacc__body">
                {/* head row: tag · handwritten title · price */}
                <div className="hacc__row-head">
                  <span className="hacc__tag">{s.tag}</span>
                  <p className="hacc__title">{s.title}</p>
                  <span className="hacc__price">
                    {s.price}
                    <small>{s.priceLabel}</small>
                  </span>
                </div>

                {/* media with perpetual Ken Burns drift. `loading` follows
                    the open state: closed panels stay lazy (nothing to see
                    inside a clipped spine), the open panel loads eagerly so
                    the photo is there the moment the wipe reveals it. */}
                <figure className="hacc__media">
                  {/* parallax bleed wrapper — larger than the figure so the
                      spring translate never reveals the tint at the edges */}
                  <motion.div
                    className="hacc__media-inner"
                    style={{ x: parallaxX, y: parallaxY }}
                  >
                    <SmartImage
                      src={s.media}
                      alt={s.mediaAlt}
                      fill
                      blurDataURL={BLUR_DATA_URL}
                      sizes="(max-width: 1023px) 100vw, 64vw"
                      loading={isOpen ? "eager" : "lazy"}
                      className="hacc__img"
                    />
                  </motion.div>
                </figure>

                {/* foot row: hook + magnetic CTA */}
                <div className="hacc__row-foot">
                  <p className="hacc__hook">{s.hook}</p>
                  <Magnetic className="hacc__cta-wrap" strength={0.25}>
                    <Link
                      href={s.ctaHref}
                      className="ea-outline-btn hacc__cta"
                      aria-label={`${s.ctaLabel} — ${s.title}`}
                    >
                      {s.ctaLabel}
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </Magnetic>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────── the section */

export function HaccServices() {
  const prefersReduced = useReducedMotion();

  /** Which rack is "live" (autoplay + ambient + counter mirror it). */
  const [focusedRack, setFocusedRack] = useState(0);
  /** Each rack's open panel as a GLOBAL service index (null = all closed). */
  const [openByRack, setOpenByRack] = useState<(number | null)[]>([
    0,
    GROUP_SIZE,
  ]);
  /** Autoplay liveness — dies on the first manual engagement (WCAG 2.2.2). */
  const [playing, setPlaying] = useState(true);
  const [docHidden, setDocHidden] = useState(false);

  const groupRefs = [
    useRef<HTMLDivElement | null>(null),
    useRef<HTMLDivElement | null>(null),
  ];
  const ratioRef = useRef([0, 0]);
  const manualUntilRef = useRef(0);

  /* document visibility — pause everything when the tab is hidden -------- */
  useEffect(() => {
    const onVis = () => setDocHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  /* scroll-based focus: the visibly dominant rack takes focus (with
     hysteresis), unless the user manually focused one recently ---------- */
  useEffect(() => {
    const ios = groupRefs.map((ref, gi) => {
      const io = new IntersectionObserver(
        (entries) => {
          ratioRef.current[gi] = entries[0]?.intersectionRatio ?? 0;
          if (Date.now() < manualUntilRef.current) return;
          const [ra, rb] = ratioRef.current;
          const dominant = rb > ra + FOCUS_RATIO_EDGE ? 1 : ra > rb + FOCUS_RATIO_EDGE ? 0 : null;
          if (dominant !== null) setFocusedRack(dominant);
        },
        { threshold: [0, 0.15, 0.3, 0.5, 0.7, 0.9] },
      );
      if (ref.current) io.observe(ref.current);
      return io;
    });
    return () => ios.forEach((io) => io.disconnect());
  }, []);

  /* stable handlers per rack --------------------------------------------- */
  const handleHover = useCallback((gi: number) => {
    manualUntilRef.current = Date.now() + FOCUS_STICKY_MS;
    setFocusedRack(gi);
  }, []);

  const handleEngage = useCallback((gi: number) => {
    manualUntilRef.current = Date.now() + FOCUS_STICKY_MS;
    setFocusedRack(gi);
    setPlaying(false);
  }, []);

  const handleOpen = useCallback((gi: number, globalIndex: number | null) => {
    setOpenByRack((prev) =>
      prev[gi] === globalIndex
        ? prev
        : prev.map((v, i) => (i === gi ? globalIndex : v)),
    );
  }, []);

  const makeOnOpen = (gi: number) => (globalIndex: number | null) =>
    handleOpen(gi, globalIndex);
  const makeOnHover = (gi: number) => () => handleHover(gi);
  const makeOnEngage = (gi: number) => () => handleEngage(gi);

  /** The focused rack's open panel — drives the ambient wash + counter. */
  const activeIndex = openByRack[focusedRack] ?? null;

  /* ─────────────────────────────────────────────────────────────── render */

  return (
    <section
      id="services"
      aria-labelledby="hacc-heading"
      className="hacc ea-section ea-section--cream"
    >
      {/* ambient tint wash — the section bg glows with the FOCUSED rack's
          open panel tint. 12 stacked layers, opacity-only transitions. */}
      <div className="hacc__ambient" aria-hidden="true">
        {SERVICES.map((s, i) => (
          <span
            key={s.id}
            className="hacc__ambient-layer"
            style={{
              backgroundColor: s.tint,
              opacity: activeIndex === i ? 0.34 : 0,
            }}
          />
        ))}
      </div>

      {/* section head stays inside the site grid; the racks below go
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
            <span className="ea-eyebrow">Форматы и сервисы</span>
            <h2 id="hacc-heading" className="ea-section-h2">
              {"Сначала формат. "}
              <i className="ea-italic-fragment">Потом меню.</i>
            </h2>
            <p className="hacc__lede">
              От кофе-брейка на двадцать персон до свадьбы на пятьсот гостей:
              раскройте формат — увидите меню, команду и цену за гостя.
            </p>
          </div>
          {/* cycle-54: the big 01/12 counter is GONE — it ticked far from
              where the eye reads (700px above rack B) and duplicated the
              spine indices; pure decoration with no job. The hint stays. */}
          <div className="hacc__meta">
            <span className="hacc__hint" aria-hidden="true">
              <MousePointer2 aria-hidden="true" />
              Троньте корешок — формат развернётся
            </span>
          </div>
        </motion.div>
      </div>

      {/* — — — two racks of six: formats, then services & extras — — — */}
      {GROUPS.map((g, gi) => (
        <div
          className="hacc__group"
          key={g.label}
          ref={groupRefs[gi]}
          onMouseEnter={() => handleHover(gi)}
          onFocusCapture={() => handleEngage(gi)}
        >
          <div className="ea-container ea-container--wide">
            <p className="hacc__rack-label">{g.label}</p>
          </div>
          <HaccRack
            items={SERVICES.slice(gi * GROUP_SIZE, gi * GROUP_SIZE + GROUP_SIZE)}
            offset={gi * GROUP_SIZE}
            groupLabel={g.label}
            focused={focusedRack === gi}
            playing={playing}
            docHidden={docHidden}
            reduced={prefersReduced}
            onOpen={makeOnOpen(gi)}
            onHoverRack={makeOnHover(gi)}
            onEngageRack={makeOnEngage(gi)}
          />
        </div>
      ))}
    </section>
  );
}

export default HaccServices;
