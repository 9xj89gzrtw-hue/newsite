"use client";

/**
 * HaccServices — «Каталог услуг» (c89 / Task 3-b: ONE six-spine rack)
 * ---------------------------------------------------------------------------
 * Owner verdict: chapter 01 keeps a SINGLE accordion with six formats —
 * Свадьбы, Корпоратив, Шоу-станции, Выездной бар, Вегетарианское и халяль,
 * Гастро-боксы. Furshety/bankety/kofe-breyki/barbekyu/torty/logistika are
 * dropped from the chapter (those formats live on in the menu catalog &
 * /offer), and the second rack went with them — so the cycle-52 two-rack
 * focus model (focusedRack / scroll-IO hysteresis / openByRack) is deleted
 * too: one rack, one open panel, no focus juggling.
 *
 * Six spines give the open panel ~71% of the rack width — gamma-grade
 * cinema (the old 12-spine rack could only reach 67% while keeping the
 * spines readable).
 *
 * gamma mechanics (research/gamma-haccordion-research.md):
 *  - flex-basis = closed spine width, flex-grow 0→1 opens (620ms easeInOutSine)
 *  - spine (vertical title) absolute at the item's left, widens when open
 *  - open panel: JS-measured FIXED px width → zero reflow mid-animation
 *  - .is-resizing guard around resize measurement
 *  - full-bleed rack (edge-to-edge like gamma)
 *  - exclusivity: one panel always open (mobile: real toggle-close —
 *    gamma's × is a no-op lie)
 *  - inert + delayed visibility on closed panels → no Tab focus leak
 *
 * Carried over from cycles 49–52: hover-intent opening (380ms, fine
 * pointers), staggered entrance, spring mouse-parallax on the open photo,
 * magnetic CTA + arrow, script-title settle, perpetual Ken Burns drift +
 * unifying color grade, autoplay progress line (desktop, stops after the
 * first manual engagement — WCAG 2.2.2), section-level ambient tint wash
 * mirroring the open panel, full prefers-reduced-motion, print styles,
 * forced-colors.
 *
 * C83 (Impl-E): панельный «индекс-поп» — spine-номера удалены владельцем
 * (cycle-55: «зачем?» ×2), счётчик 01/12 — cycle-54, поэтому поп получает
 * слот индекса gamma-раскладки: eyebrow-тег head-row (scale 0.88→1 spring
 * 300/22 + лёгкий y 3px→0, при закрытии — назад; reduce — статика).
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
import { ScrambleText } from "@/components/motion/scramble-text";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";
import { SERVICE_PANELS, type ServicePanel } from "@/lib/pricing";
import "./hacc-services.css";

/* ------------------------------------------------------------------ config */

const EASE = [0.22, 1, 0.36, 1] as const;
/** One autoplay cycle — synced with the CSS progress line via a cascading
 *  custom property (single source of truth, no magic dupe). */
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
  /** warm per-service tint — 6 distinct families, one per panel (c89) */
  tint: string;
  media: string;
  mediaAlt: string;
  ctaLabel: string;
  ctaHref: string;
  /** C71-W3 (K6-CRITICAL): для ctaHref="#calculator" — id формата
   * lib/pricing.ts для преселекта в калькуляторе (иначе дефолт-банкет
   * шокирует ценой +82% после карточки «фуршет от 2 450 ₽»). */
  calcType?: string;
}

/**
 * 6 услуг (c89 / Task 3-b: один аккордеон — только ключевые форматы;
 * фуршеты/банкеты/кофе-брейки/барбекю/торты/логистика остались в
 * меню-каталоге hacc-menu и /offer). Validated copy carried over from
 * Cycle 45 SpiralServices; 2048px media (cycle-49).
 * 4-F2: ЗАГОЛОВКИ плиток (title) — из menu.json (servicePanels[].label,
 * см. panelTitle ниже): их правит админ-панель c95 («Цены на плитках
 * услуг» → поле «Заголовок»). Остальной копирайт (hook/tag/cta/mediaAlt)
 * валидирован и живёт здесь.
 */
/** Калькулятор читает ?type=… через nuqs (подхватывает history.replaceState) —
 *  тот же контракт, что presetCalculator в hacc-menu.tsx: CTA услуг ставит
 *  ?type= (K6-CRITICAL: без преселекта «Рассчитать фуршет» открывал
 *  дефолт-банкет — ценовой шок). c86-E: guests не пресетим — ограничения
 *  по гостям сняты, калькулятор держит свой дефолт. */
function presetCalculator(typeId: string) {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", `/?type=${typeId}#calculator`);
}

/* c95 (Task 1-a): данные плиток — из src/data/menu.json (servicePanels),
 * через SERVICE_PANELS в lib/pricing.ts: та же точка правды, что у
 * калькулятора и каталога. Мэтчинг по id плитки; отсутствие записи —
 * ошибка сборки (fail fast, статику с битой плиткой не собираем).
 *
 * 4-F2 (критик C, M1 — «мёртвое поле админки»): отсюда же берём и
 * ЗАГОЛОВКИ плиток — servicePanels[].label редактируется в админ-панели
 * c95, до фикса эта правка не влияла на сайт (title был захардкожен).
 * Описания, юниты (priceLabel «за гостя»/«за событие»), тинты и медиа
 * остаются захардкоженными — этих полей в JSON нет. */
const PANEL: Record<string, ServicePanel> = Object.fromEntries(
  SERVICE_PANELS.map((p) => [p.id, p]),
);
function panelPrice(id: string): string {
  const panel = PANEL[id];
  if (panel == null) {
    throw new Error(`hacc-services: в menu.json нет servicePanels["${id}"]`);
  }
  return panel.priceLabel;
}
function panelTitle(id: string): string {
  const panel = PANEL[id];
  if (panel == null) {
    throw new Error(`hacc-services: в menu.json нет servicePanels["${id}"]`);
  }
  return panel.label;
}

const SERVICES: HaccService[] = [
  {
    id: "svadby",
    index: "01",
    title: panelTitle("svadby"),
    hook: "От утреннего кофе до ночного торта — весь день ведёт одна команда.",
    price: panelPrice("svadby"),
    priceLabel: "за гостя",
    tag: "Под ключ",
    tint: "#E6EBDF",
    media: "/media/c53/svadby.webp",
    mediaAlt: "Свадебный банкет при свечах с сервировкой столов",
    /* c89 (Task 3-b): #contact уезжает на зону контактов компании —
       конверсионные CTA главы ведут в смета-чек (#calculator). */
    ctaLabel: "Обсудить свадьбу",
    ctaHref: "#calculator",
  },
  {
    id: "korporativ",
    index: "02",
    title: panelTitle("korporativ"),
    hook: "Кофе — к первому перерыву, гала-ужин — к финалу: всё подано вовремя.",
    price: panelPrice("korporativ"),
    priceLabel: "за гостя",
    tag: "Для компаний",
    tint: "#F6E9C9",
    media: "/media/gamma/c49-korporativ-hires.webp",
    mediaAlt: "Корпоративный гала-ужин с сервировкой",
    ctaLabel: "Получить смету",
    ctaHref: "#calculator",
  },
  {
    id: "shou-stancii",
    index: "03",
    title: panelTitle("shou-stancii"),
    hook: "Кухня выходит к столу: паста в облаке пара, карвинг под ножом шефа.",
    price: panelPrice("shou-stancii"),
    priceLabel: "за событие",
    tag: "Живая кухня",
    tint: "#F6E0DB",
    media: "/media/c57/c57-shou.webp",
    mediaAlt: "Повар в колпаке и белой форме достаёт щипцами противень с блюдом из теплового шкафа",
    ctaLabel: "Обсудить станции",
    ctaHref: "#calculator",
  },
  {
    id: "bar",
    index: "04",
    title: panelTitle("bar"),
    hook: "Шейкер звенит, бокалы ледяные — бар живёт до последнего тоста.",
    price: panelPrice("bar"),
    priceLabel: "за событие",
    tag: "Миксология",
    tint: "#F5EEE2",
    media: "/media/c57/c57-bar.webp",
    mediaAlt: "Бармен в белой рубашке направляет дым от дымовой пушки на бокал с красным коктейлем — на стойке бутылки, ягоды и цитрусы",
    ctaLabel: "Обсудить бар",
    ctaHref: "#calculator",
  },
  {
    id: "veg-halal",
    index: "05",
    title: panelTitle("veg-halal"),
    hook: "Сертификат — на халяль, сезонные овощи — в главной роли.",
    /* 3 200 = vegetarian.perGuest (menu.json, c89): то же слово
       «вегетарианское» обязано стоить одинаково во всех блоках (C59/W7) */
    price: panelPrice("veg-halal"),
    priceLabel: "за гостя",
    tag: "Особые меню",
    tint: "#F4DECD",
    media: "/media/ridgewells-veg-mosaic.jpg",
    mediaAlt: "Овощная мозаика вегетарианского меню",
    /* c89: CTA ушёл с #contact в смета-чек; преселект vegetarian держит
       цену панели и калькулятора одинаковой (K6-CRITICAL, см. calcType). */
    ctaLabel: "Получить меню",
    ctaHref: "#calculator",
    calcType: "vegetarian",
  },
  {
    id: "gastro-boksy",
    index: "06",
    title: panelTitle("gastro-boksy"),
    hook: "Банкет, который помещается в коробке, — каждому гостю лично.",
    /* c89/W1-код-критик (MAJOR): цена панели = цена КАЛЬКУЛЯТОРА формата
       (snack-box.calcPerGuest = 1 200 ₽, menu.json) — CTA плитки пресетит
       калькулятор, расхождение цен на одном экране недопустимо (K6-CRITICAL).
       Каталожные пакеты à la carte (от 660 ₽) остаются в меню-каталоге
       (hacc-menu). */
    price: panelPrice("gastro-boksy"),
    priceLabel: "за гостя",
    tag: "Доставка",
    /* c89: #E6EBDF → #F3E3E8 — 6 панелей = 6 семейств тинтов без дублей
       (раньше семьи циклились по 12 панелям). */
    tint: "#F3E3E8",
    media: "/media/c57/c57-boksy.webp",
    mediaAlt: "Прозрачные коробки с закусками: виноград, сыр, оливки, крекеры и макаруны, перевязанные верёвкой",
    ctaLabel: "Заказать боксы",
    ctaHref: "#calculator",
    calcType: "snack-box",
  },
];

/** c89 (Task 3-b): «в главе 1 всего один аккордеон» — единая группа из
 *  шести форматов; второй рэк («К любому формату») и модель фокус-переключения
 *  между рэками удалены вместе с его панелями. */
const RACK_LABEL = "Форматы события";

/* ----------------------------------------------------------- rack (6 items) */

interface HaccRackProps {
  /** The six services this rack owns. */
  items: HaccService[];
  /** Group label — used for the rack's aria-label. */
  groupLabel: string;
  /** Global autoplay liveness — dies on the first manual engagement. */
  playing: boolean;
  docHidden: boolean;
  reduced: boolean | null;
  /** Report the rack's open panel (index, or null = all closed). */
  onOpen: (index: number | null) => void;
  /** Click / keyboard focus — stops autoplay (WCAG 2.2.2). */
  onEngageRack: () => void;
}

function HaccRack({
  items,
  groupLabel,
  playing,
  docHidden,
  reduced,
  onOpen,
  onEngageRack,
}: HaccRackProps) {
  const baseId = useId();
  // C62 hydration-safety: entrance variants serialize into SSR HTML — the
  // reduce branch resolves only after mount (direct branch = mismatch:
  // useReducedMotion() is false at SSR, true on reduce-clients' first render).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduceSettled = mounted && reduced;

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

  const paused = hovering || focusWithin || docHidden || !inView;

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

  /* report the open panel to the section (the ambient wash mirrors it) -- */
  useEffect(() => {
    onOpen(openIndex);
  }, [openIndex, onOpen]);

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

  /* ── autoplay: the rack advances every AUTOPLAY_MS while in view and
     not paused (hover / focus / hidden tab freeze it — premium restraint:
     one thing moves at a time). ───────────────────────────────────────── */
  const nextAtRef = useRef(0);
  const remainingRef = useRef(AUTOPLAY_MS);

  useEffect(() => {
    if (reduced || !playing || !isDesktop || openIndex === null)
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
  }, [reduced, playing, isDesktop, openIndex, N]);

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

  const autoplayOn = playing && !reduced && isDesktop && openIndex !== null;

  /* choreographed entrance — this rack's spines cascade (40ms stagger) --
     c83-F2 (V1b RM): под reduce варианты остаются ОПРЕДЕЛЁННЫМИ (нулевая
     длительность) + рэк получает animate="show" — прежде снятие
     whileInView оставляло залитый в SSR initial opacity:0 навсегда
     (замер: рэк/корешки невидимы под prefers-reduced-motion). */
  const rackVariants = reduceSettled
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0 } } }
    : {
        hidden: { opacity: 0 },
        show: { opacity: 1 },
      };
  const itemVariants = reduceSettled
    ? {
        hidden: { opacity: 0, y: 36 },
        show: { opacity: 1, y: 0, transition: { duration: 0 } },
      }
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
      initial={reduceSettled ? false : "hidden"}
      whileInView={reduceSettled ? undefined : "show"}
      /* c83-F2: под reduce финал приходит через animate (duration 0),
         а не через снятие whileInView — иначе залипание SSR-initial. */
      animate={reduceSettled ? "show" : undefined}
      viewport={{ once: true, margin: "-60px" }}
      variants={rackVariants}
      onMouseMove={onRackMouseMove}
      onMouseEnter={() => setHovering(true)}
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
              {/* Task 5-C: motion.button — whileTap scale 0.98 gives the
                  tactile press feedback the mobile cards asked for
                  (JS-driven transform: no CSS transition conflict with
                  the gamma flex-basis choreography; off under reduce). */}
              <motion.button
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
                whileTap={reduceSettled ? undefined : { scale: 0.98 }}
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
                {/* autoplay progress — the open spine only; the
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
              </motion.button>
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
                  {/* C83 (Impl-E, Task 1) — «индекс-поп» панели: spine-номера
                      удалены владельцем (cycle-55), счётчик — cycle-54, поэтому
                      поп получает ближайший живой слот индекса — eyebrow-тег
                      head-row. Открытие: scale 0.88→1 spring (stiffness 300 /
                      damping 22) + лёгкий y 3px→0; закрытие — назад. Delay
                      0.16s подсаживается в существующий staggered entrance
                      .hacc__body>* (140/220/300ms) — поп виден ровно с
                      появлением head-row. initial={false}: ничего не
                      сериализуется в SSR-анимацией (C62); reduceSettled —
                      identity-таргет с duration 0 (статика, без transform-
                      остатка на открытой панели). Transform-only: flex-grow /
                      autoplay / progress-line / Ken Burns / параллакс не
                      затронуты. */}
                  <motion.span
                    className="hacc__tag"
                    initial={false}
                    animate={
                      reduceSettled
                        ? { scale: 1, y: 0 }
                        : { scale: isOpen ? 1 : 0.88, y: isOpen ? 0 : 3 }
                    }
                    transition={
                      reduceSettled
                        ? { duration: 0 }
                        : {
                            type: "spring",
                            stiffness: 300,
                            damping: 22,
                            delay: isOpen ? 0.16 : 0,
                          }
                    }
                  >
                    {s.tag}
                  </motion.span>
                  <p className="hacc__title">{s.title}</p>
                  <span className="hacc__price">
                    {s.price}
                    <small>{s.priceLabel}</small>
                  </span>
                </div>

                {/* media with perpetual Ken Burns drift. `loading` follows
                    the open state: closed panels stay lazy (nothing to see
                    inside a clipped spine), the open panel loads eagerly so
                    the photo is there the moment the wipe reveals it.
                    Task 5-C: on OPEN the bleed wrapper plays a one-shot Ken
                    Burns zoom (scale 1 → 1.06 over 6s ease-out) on top of
                    the perpetual img drift — transform-only, composes with
                    the x/y parallax springs, initial={false} so nothing
                    serializes into SSR HTML (C62). */}
                <figure className="hacc__media">
                  {/* parallax bleed wrapper — larger than the figure so the
                      spring translate never reveals the tint at the edges */}
                  <motion.div
                    className="hacc__media-inner"
                    style={{ x: parallaxX, y: parallaxY }}
                    initial={false}
                    animate={
                      reduceSettled ? undefined : { scale: isOpen ? 1.06 : 1 }
                    }
                    transition={
                      isOpen && !reduceSettled
                        ? { duration: 6, ease: "easeOut" }
                        : { duration: 0.9, ease: EASE }
                    }
                  >
                    <SmartImage
                      src={s.media}
                      alt={s.mediaAlt}
                      fill
                      blurDataURL={BLUR_DATA_URL}
                      /* 81-W2F2b: было 64vw (=921.6px @1440) — занижало
                         реальный бокс фото панели. Замеры (1440 DPR1,
                         research/w2f2b): видимый figure .hacc__media =
                         920px, но layout-бокс img = figure+24px bleed =
                         944px, в макс. Ken-Burns-дрейфе (scale 1.09) —
                         до 1057px. Ширина панели растёт БЫСТРЕЕ vw
                         (корешки фикс-пиксельные): img-бокс 68.6vw@1280,
                         69.5vw@1440, 71.6vw@1600, 77.3vw@1920. 75vw по
                         лестнице кандидатов (828→1080→1200→1920) даёт
                         828@1024-1279 (как и раньше), 1080@1280-1439
                         (было 828@1280 = 0.94 на дрейф), 1200@1440-1600
                         (было 1080@1600 = 0.89), 1920@≥1698 (без изм.).
                         Retina-десктоп — тот же выбор ×2. Примечание:
                         img.naturalWidth в Chromium для srcset+w-дескрипторов
                         возвращает density-corrected размер (intrinsic×
                         sizes/candidate) — «natural 921» критика E =
                         артефакт, реальный файл 1080 (замер
                         createImageBitmap, research/w2f2b/measure2.json). */
                      sizes="(max-width: 1023px) 100vw, 75vw"
                      /* C71-P1 (K8 MAJOR, Task 4): было loading={isOpen ?
                         "eager" : "lazy"} — дефолт-раскрытая строка
                         сериализовала loading="eager" в SSR, и три
                         ниже-фолдных фото (c49-furshet 87KB + furshet-1
                         26KB + c57-bar 78KB) качались на t≈512ms, конкурируя
                         с hero-LCP (замер K8/DO). Теперь всегда lazy —
                         фото панели грузится по мере входа аккордеона во
                         вьюпорт/раскрытия (приемлемый трейдофф ТЗ), а
                         fetchPriority="low" дополнительно опускает их
                         в приоритетной очереди. */
                      loading="lazy"
                      fetchPriority="low"
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
                      /* C71-W3 (K6-CRITICAL): преселект формата до перехода —
                       * калькулятор (nuqs-хуки) подхватит ?type= из
                       * history.replaceState (контракт hacc-menu). */
                      onClick={
                        s.ctaHref === "#calculator" && s.calcType
                          ? () => presetCalculator(s.calcType as string)
                          : undefined
                      }
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
  // C62 hydration-safety: the head's entrance props serialize into SSR HTML —
  // the reduce branch resolves only after mount (direct branch = mismatch).
  const [headMounted, setHeadMounted] = useState(false);
  useEffect(() => setHeadMounted(true), []);
  const reduceSettled = headMounted && prefersReduced;

  /** The open panel (service index, null = all closed) — drives the
   *  ambient wash. SSR renders #1 open — matches the rack. */
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  /** Autoplay liveness — dies on the first manual engagement (WCAG 2.2.2). */
  const [playing, setPlaying] = useState(true);
  const [docHidden, setDocHidden] = useState(false);

  /* document visibility — pause everything when the tab is hidden -------- */
  useEffect(() => {
    const onVis = () => setDocHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  /* stable handlers ------------------------------------------------------- */
  /** Click / keyboard engagement — autoplay stops for good (WCAG 2.2.2).
   *  c89: без второго рэка фокус-переключение не нужно — engage только
   *  гасит автоплей. */
  const handleEngage = useCallback(() => setPlaying(false), []);

  const handleOpen = useCallback((index: number | null) => {
    setActiveIndex((prev) => (prev === index ? prev : index));
  }, []);

  /* ─────────────────────────────────────────────────────────────── render */

  return (
    <section
      id="services"
      aria-labelledby="hacc-heading"
      className="hacc ea-section ea-section--cream"
    >
      {/* ambient tint wash — the section bg glows with the open panel's
          tint. One layer per service, opacity-only transitions. */}
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

      {/* section head stays inside the site grid; the rack below goes
          full-bleed edge-to-edge — exactly like gamma's haccordion */}
      <div className="ea-container ea-container--wide">
        <motion.div
          className="hacc__head"
          initial={reduceSettled ? false : { opacity: 0, y: 26 }}
          whileInView={reduceSettled ? undefined : { opacity: 1, y: 0 }}
          /* c83-F2 (V1b RM): под reduce финал мгновенно через animate
             (duration 0) — снятие whileInView без animate оставляло
             SSR-стиль opacity:0 навсегда (шапка невидима под RM). */
          animate={reduceSettled ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, margin: "-80px" }}
          transition={reduceSettled ? { duration: 0 } : { duration: 0.7, ease: EASE }}
        >
          <div className="hacc__head-text">
            {/* c85 (понятность): глава 01 — единая нумерация главных глав
                страницы (см. .ea-chapter в globals.css). Decorative. */}
            <span className="ea-chapter" aria-hidden="true">Глава 01</span>
            {/* C71: eyebrow собирается перебором символов (ScrambleText):
                тот же класс/шрифт/цвет. A11y (81-F3): sr-only-твин внутри
                носителя + aria-hidden скрамбл-узел — aria-label на generic-
                ролях запрещён (Lighthouse aria-prohibited-attr). */}
            <ScrambleText className="ea-eyebrow--script" delayMs={150}>
              Форматы и сервисы
            </ScrambleText>
            {/* C71: H2 — слова поднимаются каскадом (SplitTextReveal, дефолты
                SPEC: words / stagger 0.06 / 0.7s / [0.22,1,0.36,1]). Визуальный
                стиль не меняется: те же id/классы, тот же <i>-фрагмент —
                сплит-спаны живут ВНУТРИ h2, курсив-кусок наследует
                .ea-italic-fragment как раньше. */}
            <h2 id="hacc-heading" className="ea-section-h2">
              <SplitTextReveal as="span" mode="words">
                Сначала формат.
              </SplitTextReveal>
              {/* C77 (владелец): «Потом меню.» — на строку ниже — вторая
                  половина афоризма читается как курсивный ответ. <br/>
                  вместо прежнего пробела между спанами. */}
              <br />
              <i className="ea-italic-fragment">
                <SplitTextReveal as="span" mode="words" delay={0.12}>
                  Потом меню.
                </SplitTextReveal>
              </i>
            </h2>
            <p className="hacc__lede">
              {/* c89 (Task 3-b): кофе-брейк покинул главу — диапазон «от … до …»
                  теперь между гастро-боксами (самый доступный формат) и свадьбой. */}
              От гастро-боксов на двадцать персон до свадьбы на пятьсот гостей:
              формат определяет меню, команду и цену за гостя.
            </p>
          </div>
          {/* cycle-54: the big 01/12 counter is GONE — it ticked far from
              where the eye reads (700px above the second rack, back when
              there were two) and duplicated the spine indices; pure
              decoration with no job. The hint stays. */}
          <div className="hacc__meta">
            <span className="hacc__hint" aria-hidden="true">
              <MousePointer2 aria-hidden="true" />
              Троньте корешок — формат развернётся
            </span>
          </div>
        </motion.div>
      </div>

      {/* — — — one rack of six spines — the event formats — — — */}
      <div className="hacc__group" onFocusCapture={handleEngage}>
        <div className="ea-container ea-container--wide">
          <p className="hacc__rack-label">{RACK_LABEL}</p>
        </div>
        <HaccRack
          items={SERVICES}
          groupLabel={RACK_LABEL}
          playing={playing}
          docHidden={docHidden}
          reduced={prefersReduced}
          onOpen={handleOpen}
          onEngageRack={handleEngage}
        />
      </div>
    </section>
  );
}

export default HaccServices;
