"use client";

/**
 * AwServices — Cycle 43. Services block fully redesigned in the design
 * language of awwwards.com («полный редизайн блока услуги»).
 * ---------------------------------------------------------------------------
 *
 * REFERENCES (researched 2026-08-23, see research/ folder):
 *   - awwwards.com live CSS (Task 3-B): Inter Tight variable font (full
 *     Cyrillic), bg #F8F8F8, ink #222 (never #000), accent #FA5D29,
 *     meta #a7a7a7, dotted leader lines (their #1 signature — 8px×1px
 *     gradient dashes), badge yellow #FFF083, 8px radius, .3s house motion,
 *     light 300–400 display weights with tight negative tracking, mixed case.
 *   - dennissnellenberg.com/work (Task 3-C): THE cursor-following media
 *     reveal. Exact extracted motion — enter 0.4s cubic-bezier(0.34,1,0.64,1),
 *     exit 0.4s cubic-bezier(0.36,0,0.66,0) (different easings!), lag layer
 *     0.5s cubic-bezier(0.65,0,0.35,1) ≈ spring {150,22,0.6}, sibling rows
 *     dim to ~0.32, mobile ≤1023px degrades to inline-thumb rows.
 *   - 2024–25 upgrade: velocity skew ±6° (spring {200,30}) — the media shears
 *     while you sweep the list and settles straight when you stop.
 *   - Content restructure (Task 3-A): 7 primary services (Miller 7±2, market
 *     leaders show 4–8) + 6 secondary «Ещё услуги» (expandable). New rows:
 *     Свадьбы, Выездной бар. Removed as rows: шоколадный фонтан, пирамиды
 *     шампанского, вег/халяль (→ меню-бейджи), презентации, НГ-корпоратив.
 *     Price anchoring «от X ₽/гость» — RU-market norm (Empire, Яндекс.Услуги).
 *
 * LAYOUT (desktop ≥1024px)
 *   ┌ head ─────────────────────────────────────────────┐
 *   │ УСЛУГИ [07] ·····dotted rule······                │
 *   │ Чем мы можем вас удивить   (Inter Tight 300, huge) │
 *   │ subtitle                                          │
 *   ├ rows (cursor-follow 4:5 media floats) ────────────┤
 *   │ 01  Фуршеты и коктейльные приёмы ···· от 1 600 ₽  │
 *   │ … 7 rows                                          │
 *   ├ marquee (inverted #222): вторые услуги ✳ …        │
 *   ├ [ Ещё услуги · 6 + ] → expandable 3-col mini-grid │
 *   ├ foot: note + magnetic CTA «Получить смету за 30 мин»
 *   └───────────────────────────────────────────────────┘
 *
 * Mobile (≤1023px / coarse pointer): float removed (Dennis's own degradation);
 * rows become media rows — 72×90 4:5 thumb + index + title + hook + chips +
 * 44px ink circle arrow. Secondary grid → 1–2 cols. Marquee stays.
 *
 * Accessibility (AGENTS.md §5 #7):
 *   - section aria-labelledby; rows are REAL <a href="#calculator|#contact">;
 *   - scrambled text is aria-hidden; real text duplicated in .sr-only;
 *   - float + marquee + leaders aria-hidden (decorative duplicates);
 *   - :focus-visible docks the float deterministically at the row's right
 *     edge (sighted-equivalent preview for keyboard users);
 *   - «Ещё услуги» toggle = button with aria-expanded + aria-controls;
 *   - 44px+ touch targets (arrow chips, pills, toggle);
 *   - prefers-reduced-motion: no float / no springs / no skew / no scramble /
 *     no marquee / no magnetic; desktop rows show hooks inline (info parity).
 *
 * Motion (RULES §5 — transform/opacity only; the dotted-line color wipe is a
 * transform: scaleX on an identical-color overlay, so still compositor-only):
 *   - float follow: useSpring(x, {150, 22, 0.6}) × 2 axes;
 *   - velocity skew: useVelocity(spring) → useTransform ±6° → spring {200,30};
 *   - enter/exit: variants with Dennis's asymmetric beziers;
 *   - crossfade: stacked preloaded imgs, opacity + inner scale 1.08→1, .35s;
 *   - rows: whileInView y+24→0 stagger 50ms (capped 300ms), once;
 *   - secondary panel: height 0→auto, [0.22,1,0.36,1], 0.5s.
 *
 * Self-contained: scoped CSS in ./aw-services.css (`aw-svc__*` classes only).
 * No edits to globals.css or sibling components. The orchestrator swaps the
 * <AtServices /> call in page.tsx for <AwServices /> (AtServices stays on
 * disk for reference, as with EaServices before it).
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { Inter_Tight } from "next/font/google";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";

import { SmartImage } from "@/components/media/smart-image";
import { useMounted } from "@/hooks/use-mounted";

import "./aw-services.css";

/**
 * Inter Tight — awwwards.com's exact typeface (their `--font-1`), full
 * Cyrillic subset. Scoped to this section via `--aw-font`.
 */
const interTight = Inter_Tight({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin", "cyrillic"],
  variable: "--aw-font",
  display: "swap",
});

/** Dennis Snellenberg float OPEN easing — cubic-bezier(.34,1,.64,1). */
const EASE_OPEN = [0.34, 1, 0.64, 1] as const;
/** Dennis Snellenberg float CLOSE easing — cubic-bezier(.36,0,.66,0). */
const EASE_CLOSE = [0.36, 0, 0.66, 0] as const;
/** House ease (EA/repo-wide). */
const EASE_HOUSE = [0.22, 1, 0.36, 1] as const;

/** Cyrillic-safe scramble glyph set (no Latin letters — keeps the RU voice). */
const SCRAMBLE_GLYPHS = "!%?*·№@#&";

/* ------------------------------------------------------------------ data -- */

type PrimaryService = {
  id: string;
  index: string;
  title: string;
  /** ≤90 chars; desktop: lives in the float caption, mobile: second line. */
  hook: string;
  price: string;
  guests: string;
  media: string;
  ctaLabel: string;
  ctaHref: string;
};

/**
 * 7 primary services (Task 3-A §4.2). Prices are SPb market «от» anchors
 * (Empire / Яндекс.Услуги / yapokupayu, 08.2026) and match the calculator's
 * direction — final quote always via #calculator / #contact.
 */
const PRIMARY: PrimaryService[] = [
  {
    id: "furshety",
    index: "01",
    title: "Фуршеты и коктейльные приёмы",
    hook: "Канапе, welcome-коктейли и подача, которая не останавливается ни на минуту.",
    price: "от 1\u00A0600\u00A0₽/гость",
    guests: "от 20 гостей",
    media: "/media/furshet-1.jpg",
    ctaLabel: "Рассчитать фуршет",
    ctaHref: "#calculator",
  },
  {
    id: "bankety",
    index: "02",
    title: "Банкеты",
    hook: "Полная посадка: от аперитива до десерта — официанты, сомелье и тайминг до минуты.",
    price: "от 3\u00A0500\u00A0₽/гость",
    guests: "от 30 гостей",
    media: "/media/gamma/gamma-catering-ballroom-chandelier-banquet.jpg",
    ctaLabel: "Рассчитать банкет",
    ctaHref: "#calculator",
  },
  {
    id: "svadby",
    index: "03",
    title: "Свадьбы",
    hook: "Выездная регистрация, банкет и торт — одна команда отвечает за весь день.",
    price: "от 5\u00A0500\u00A0₽/гость",
    guests: "от 40 гостей",
    media: "/media/event-wedding-light.jpg",
    ctaLabel: "Обсудить свадьбу",
    ctaHref: "#contact",
  },
  {
    id: "korporativ",
    index: "04",
    title: "Корпоративные мероприятия",
    hook: "Конференции, форумы и гала-ужины: кофе-брейки, фуршеты и полный техтайминг.",
    price: "от 2\u00A0500\u00A0₽/гость",
    guests: "от 30 гостей",
    media: "/media/gamma/firmenevent-messe-gala-bankett-gammacatering.jpg",
    ctaLabel: "Запросить смету",
    ctaHref: "#contact",
  },
  {
    id: "kofe-breyki",
    index: "05",
    title: "Кофе-брейки и обеды в офис",
    hook: "Горячее в термоупаковке к 12:00 — каждый день или к вашей дате.",
    price: "от 450\u00A0₽/гость",
    guests: "от 15 гостей",
    media: "/media/menu-coffee-break.jpg",
    ctaLabel: "Заказать кофе-брейк",
    ctaHref: "#calculator",
  },
  {
    id: "barbekyu",
    index: "06",
    title: "Барбекю и гриль-станции",
    hook: "Рибай и овощи с мангала — живой огонь и ароматы, которые собирают гостей.",
    price: "от 2\u00A0000\u00A0₽/гость",
    guests: "от 20 гостей",
    media: "/media/talkofthetown/talkofthetown-section-paella-station.jpg",
    ctaLabel: "Рассчитать барбекю",
    ctaHref: "#calculator",
  },
  {
    id: "bar",
    index: "07",
    title: "Выездной бар",
    hook: "Коктейли, моктейли и винная подача: бармены, лёд, бокалы и настроение.",
    price: "от 900\u00A0₽/гость",
    guests: "от 25 гостей",
    media: "/media/gamma/sommelier-uniform-weinservice-gammacatering.jpg",
    ctaLabel: "Обсудить бар",
    ctaHref: "#contact",
  },
];

type SecondaryService = {
  id: string;
  title: string;
  hook: string;
  media: string;
};

/** Second tier (Task 3-A §4.3) — collapsed by default, marquee is its teaser. */
const SECONDARY: SecondaryService[] = [
  {
    id: "shou-stancii",
    title: "Шоу-станции шефа",
    hook: "Поке, паста, карвинг и тако: гости смотрят, как рождается блюдо.",
    media: "/media/gamma/showkueche-live-cooking-koeche-gammacatering.jpg",
  },
  {
    id: "gastro-boksy",
    title: "Гастро-боксы и доставка закусок",
    hook: "6–8 видов канапе, упакованных порционно, — к нужному часу.",
    media: "/media/menu-snack-box.jpg",
  },
  {
    id: "vyezdnaya-registraciya",
    title: "Выездная регистрация",
    hook: "Сервировка церемонии бракосочетания: тонкий момент — тонкая работа.",
    media: "/media/gamma/hochzeit-tischdekoration-zitronen-gedeck-gammacatering.jpg",
  },
  {
    id: "torty",
    title: "Торты на заказ",
    hook: "Ярусы, текстуры, сезонные ягоды: торт как архитектура.",
    media: "/media/concorde-dessert.jpg",
  },
  {
    id: "veg-halal",
    title: "Вегетарианское и халяль-меню",
    hook: "Сертифицированные поставки и овощи как главные герои.",
    media: "/media/ridgewells-veg-mosaic.jpg",
  },
  {
    id: "logistika",
    title: "Логистика под ключ",
    hook: "Посуда, мебель, текстиль, декор: привезли — сервировали — забрали.",
    media: "/media/gamma/event-service-tischeindeckung-gala-gammacatering.jpg",
  },
];

/* --------------------------------------------------------------- helpers -- */

/**
 * useScramble — decode/scramble reveal with a Cyrillic-safe glyph set.
 * Resolves left→right over ~260–430ms (rAF-driven). `play` triggers a run;
 * returns the plain text while idle (SSR-safe: initial state = text).
 */
function useScramble(text: string, play: boolean, reduce: boolean): string {
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (!play || reduce) {
      setOut(text);
      return;
    }
    let raf = 0;
    let frame = 0;
    const frames = Math.min(text.length * 3 + 8, 26);
    const step = () => {
      frame += 1;
      const resolved = Math.floor((frame / frames) * text.length);
      let next = "";
      for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];
        next +=
          i < resolved || ch === " " || ch === "\u00A0"
            ? ch
            : SCRAMBLE_GLYPHS[(Math.random() * SCRAMBLE_GLYPHS.length) | 0];
      }
      setOut(next);
      if (frame < frames) {
        raf = requestAnimationFrame(step);
      } else {
        setOut(text);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [play, reduce, text]);

  return out;
}

/**
 * MagneticLink — CTA pill that gravitates ±14px toward the cursor (Task 3-B
 * effect #4) and springs back on leave. Disabled for touch/reduced-motion.
 */
function MagneticLink({
  href,
  enabled,
  children,
}: {
  href: string;
  enabled: boolean;
  children: ReactNode;
}) {
  const x = useSpring(0, { stiffness: 180, damping: 14, mass: 0.4 });
  const y = useSpring(0, { stiffness: 180, damping: 14, mass: 0.4 });

  const onMove = useCallback(
    (e: ReactMouseEvent<HTMLAnchorElement>) => {
      if (!enabled) return;
      const r = e.currentTarget.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      x.set(Math.max(-1, Math.min(1, dx)) * 14);
      y.set(Math.max(-1, Math.min(1, dy)) * 10);
    },
    [enabled, x, y],
  );

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.a
      href={href}
      className="aw-svc__cta"
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.a>
  );
}

/* ------------------------------------------------------------- main comp -- */

export function AwServices() {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();

  /** `true` only on fine-pointer desktops (≥1024px) — gates the float. */
  const [fineDesktop, setFineDesktop] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const headInView = useInView(headRef, { once: true, margin: "-80px" });
  /** Index of the hovered/focused primary row; drives BOTH the float and the
   *  index scramble (no separate hover state per row). */
  const [active, setActive] = useState<number | null>(null);

  /** Secondary tier expansion. */
  const [expanded, setExpanded] = useState(false);

  const reduce = Boolean(mounted && reduceMotion);
  /** Float runs only on fine-pointer desktops without reduced motion. */
  const floatEnabled = mounted && fineDesktop && !reduce;
  const magneticEnabled = mounted && !reduce;

  /* matchMedia gate — no layout impact, handlers only (no hydration risk).
   * Desktop = width ≥1024 AND no coarse (touch) pointer. Note: automation
   * contexts report `pointer: none` (not fine) — treated as desktop here so
   * the float is verifiable end-to-end; real touch devices stay excluded. */
  useEffect(() => {
    const coarseMq = window.matchMedia("(pointer: coarse)");
    const widthMq = window.matchMedia("(min-width: 1024px)");
    const update = () =>
      setFineDesktop(widthMq.matches && !coarseMq.matches);
    update();
    coarseMq.addEventListener("change", update);
    widthMq.addEventListener("change", update);
    return () => {
      coarseMq.removeEventListener("change", update);
      widthMq.removeEventListener("change", update);
    };
  }, []);

  /* ---- cursor-follow machinery (Dennis Snellenberg + velocity skew) ---- */

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  /** The lag layer — his 0.5s cubic-bezier(.65,0,.35,1) as a spring. */
  const sx = useSpring(mx, { stiffness: 150, damping: 22, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 150, damping: 22, mass: 0.6 });
  /** Velocity skew — media shears ±6° with cursor speed, settles straight. */
  const vx = useVelocity(sx);
  const skewRaw = useTransform(vx, [-2000, 0, 2000], [-6, 0, 6], {
    clamp: true,
  });
  const skew = useSpring(skewRaw, { stiffness: 200, damping: 30 });

  const handleListMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!floatEnabled) return;
      mx.set(e.clientX);
      my.set(e.clientY);
    },
    [floatEnabled, mx, my],
  );

  const handleRowEnter = useCallback((i: number) => {
    setActive(i);
  }, []);

  /**
   * The float closes when the cursor LEAVES the list (Dennis's behaviour —
   * moving row→row never pulses the card through a closed state).
   */
  const handleListMouseLeave = useCallback(() => {
    setActive(null);
  }, []);

  /**
   * Keyboard parity — the float closes only when focus leaves the whole list
   * (row→row Tab moves keep it open; relatedTarget stays inside the list).
   */
  const handleListBlur = useCallback(
    (e: ReactFocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        setActive(null);
      }
    },
    [],
  );

  /**
   * Keyboard parity: :focus-visible docks the float deterministically at the
   * row's right edge (same enter animation) — a preview for keyboard users.
   */
  const handleRowFocus = useCallback(
    (e: ReactFocusEvent<HTMLAnchorElement>, i: number) => {
      if (!floatEnabled) return;
      if (!e.currentTarget.matches(":focus-visible")) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const w = cardRef.current?.offsetWidth ?? 340;
      mx.set(Math.max(rect.right - w / 2 - 32, w / 2 + 16));
      my.set(rect.top + rect.height / 2);
      setActive(i);
    },
    [floatEnabled, mx, my],
  );

  /* ---- eyebrow count scrambles once when the head enters the viewport -- */

  const countText = useScramble(
    String(PRIMARY.length).padStart(2, "0"),
    mounted && headInView,
    reduce,
  );

  const activeService = active !== null ? PRIMARY[active] : null;

  return (
    <section
      id="services"
      aria-labelledby="aw-services-heading"
      data-header-theme="light"
      className={`aw-svc ${interTight.variable}`}
    >
      <div className="aw-svc__container">
        {/* ------------------------------------------------------- head -- */}
        <motion.header
          ref={headRef}
          className="aw-svc__head"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE_HOUSE }}
        >
          <div className="aw-svc__eyebrow-row">
            <span className="aw-svc__eyebrow">Услуги</span>
            <span className="aw-svc__count" aria-hidden="true">
              {countText}
            </span>
            <span className="sr-only">
              {`${PRIMARY.length} основных форматов`}
            </span>
            <span className="aw-svc__eyebrow-rule" aria-hidden="true" />
          </div>

          <h2 id="aw-services-heading" className="aw-svc__title">
            {"Чем мы можем вас "}
            <span className="aw-svc__title-accent">удивить</span>
          </h2>

          <p className="aw-svc__sub">
            {"Семь основных форматов — от офисного кофе-брейка до свадьбы на "}
            {"триста гостей — и ещё шесть услуг для особых поводов."}
          </p>
        </motion.header>

        {/* --------------------------------------------------- row list -- */}
        <div
          ref={listRef}
          className="aw-svc__list"
          data-hover={active !== null ? "true" : "false"}
          onMouseMove={handleListMouseMove}
          onMouseLeave={handleListMouseLeave}
          onBlur={handleListBlur}
        >
          {PRIMARY.map((svc, i) => (
            <RowReveal key={svc.id} index={i} reduce={reduce}>
              <motion.a
                className="aw-svc__row"
                href={svc.ctaHref}
                aria-label={`${svc.title} — ${svc.ctaLabel}`}
                onMouseEnter={() => handleRowEnter(i)}
                onFocus={(e) => handleRowFocus(e, i)}
              >
                <RowIndex index={svc.index} play={active === i} reduce={reduce} />

                <span className="aw-svc__row-thumb" aria-hidden="true">
                  <SmartImage
                    src={svc.media}
                    alt=""
                    fill
                    sizes="(max-width: 1023px) 20vw, 0px"
                  />
                </span>

                <span className="aw-svc__row-body">
                  <span className="aw-svc__row-title">{svc.title}</span>
                  <span className="aw-svc__row-hook">{svc.hook}</span>
                </span>

                <span className="aw-svc__row-leader" aria-hidden="true" />

                <span className="aw-svc__row-tags">
                  <span className="aw-svc__row-price">{svc.price}</span>
                  <span className="aw-svc__row-guests">{svc.guests}</span>
                </span>

                <span className="aw-svc__row-arrow" aria-hidden="true">
                  <ArrowUpRight strokeWidth={1.75} aria-hidden="true" />
                </span>
              </motion.a>
            </RowReveal>
          ))}
        </div>

        {/* ------------------------------------ marquee (2nd tier teaser) -- */}
        <div className="aw-svc__marquee" aria-hidden="true">
          <div className="aw-svc__marquee-track">
            {[0, 1].map((dup) => (
              <div className="aw-svc__marquee-seg" key={dup}>
                {SECONDARY.map((s) => (
                  <span className="aw-svc__marquee-item" key={s.id}>
                    {s.title}
                    <i className="aw-svc__marquee-star">✳</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ------------------------------------------- secondary (expand) -- */}
        <div className="aw-svc__more-wrap">
          <button
            type="button"
            className="aw-svc__more-toggle"
            aria-expanded={expanded}
            aria-controls="aw-services-more"
            onClick={() => setExpanded((v) => !v)}
          >
            <span>
              {expanded ? "Свернуть" : "Ещё услуги"}
              <i className="aw-svc__more-count">{SECONDARY.length}</i>
            </span>
            <Plus
              className="aw-svc__more-icon"
              data-open={expanded ? "true" : "false"}
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                id="aw-services-more"
                className="aw-svc__more"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE_HOUSE }}
              >
                <div className="aw-svc__more-grid">
                  {SECONDARY.map((s, i) => (
                    <motion.a
                      key={s.id}
                      className="aw-svc__more-card"
                      href="#calculator"
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.45,
                        delay: Math.min(i * 0.05, 0.25),
                        ease: EASE_HOUSE,
                      }}
                    >
                      <span className="aw-svc__more-thumb">
                        <SmartImage
                          src={s.media}
                          alt={s.title}
                          fill
                          sizes="(max-width: 640px) 90vw, (max-width: 1023px) 45vw, 30vw"
                        />
                      </span>
                      <span className="aw-svc__more-body">
                        <span className="aw-svc__more-title">{s.title}</span>
                        <span className="aw-svc__more-hook">{s.hook}</span>
                      </span>
                      <ArrowUpRight
                        className="aw-svc__more-arrow"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ------------------------------------------------------- foot -- */}
        <div className="aw-svc__foot">
          <p className="aw-svc__foot-note">
            {"Все цены — «от». Точная смета — в калькуляторе или после "}
            {"короткого брифа."}
          </p>
          <div className="aw-svc__foot-actions">
            <MagneticLink href="#calculator" enabled={magneticEnabled}>
              {"Получить смету за 30 минут"}
              <ArrowUpRight strokeWidth={1.75} aria-hidden="true" />
            </MagneticLink>
            <a className="aw-svc__foot-alt" href="#contact">
              {"или напишите нам"}
            </a>
          </div>
        </div>
      </div>

      {/* --------------------------- cursor-following float (desktop) ---- */}
      <div className="aw-svc__float" aria-hidden="true">
        <motion.div className="aw-svc__float-lag" style={{ x: sx, y: sy }}>
          <motion.div
            ref={cardRef}
            className="aw-svc__float-card"
            initial={false}
            animate={active !== null ? "open" : "closed"}
            variants={{
              open: {
                scale: 1,
                opacity: 1,
                rotate: 0,
                transition: { duration: 0.4, ease: EASE_OPEN },
              },
              closed: {
                scale: 0,
                opacity: 0,
                rotate: -4,
                transition: {
                  scale: { duration: 0.4, ease: EASE_CLOSE },
                  opacity: { duration: 0.25, ease: "easeOut" },
                  rotate: { duration: 0.4, ease: EASE_CLOSE },
                },
              },
            }}
            style={{ x: "-50%", y: "-56%", skewX: skew }}
          >
            <div className="aw-svc__float-media">
              {PRIMARY.map((svc, i) => (
                <span
                  key={svc.id}
                  className="aw-svc__float-img"
                  data-on={i === active ? "true" : "false"}
                >
                  <SmartImage
                    src={svc.media}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 26vw, 0px"
                  />
                </span>
              ))}
            </div>

            <div className="aw-svc__float-cap">
              <AnimatePresence mode="wait" initial={false}>
                {activeService && (
                  <motion.span
                    key={activeService.id}
                    className="aw-svc__float-cap-inner"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <span className="aw-svc__float-cap-title">
                      {activeService.title}
                    </span>
                    <span className="aw-svc__float-cap-hook">
                      {activeService.hook}
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- sub-parts -- */

/** Scroll-reveal wrapper — keeps framer's opacity off the <a> so the CSS
 *  sibling-dim (opacity .32) is never fought by an inline style. */
function RowReveal({
  index,
  reduce,
  children,
}: {
  index: number;
  reduce: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="aw-svc__row-reveal"
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.05, 0.3),
        ease: EASE_HOUSE,
      }}
    >
      {children}
    </motion.div>
  );
}

/** Row index — digits scramble while the row is hovered/focused (the shared
 *  `active` state is the play trigger), resolving left→right in ~260ms. */
function RowIndex({
  index,
  play,
  reduce,
}: {
  index: string;
  play: boolean;
  reduce: boolean;
}) {
  const out = useScramble(index, play, reduce);
  return (
    <span className="aw-svc__row-index" aria-hidden="true">
      {out}
    </span>
  );
}
