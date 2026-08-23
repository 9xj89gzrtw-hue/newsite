"use client";

/**
 * AtServices — Cycle 37. Services block restyled after activetheory.net/work.
 * ---------------------------------------------------------------------------
 *
 * REFERENCE (researched via headless browser + bundle analysis, see
 * worklog.md Cycle 37 §research): Active Theory /work is a WebGL scene with:
 *   - near-black background (#000, corners #070d0d, faint teal core glow),
 *   - UPPERCASE technical typography (NB Architekt Std; light mega-headings,
 *     tracking 0.1em on small labels),
 *   - a DOM "terminal" filter ("What are you looking for?" + "-> websites"
 *     links, cyan #00ffff accents, blinking block caret),
 *   - a typographic list where each entry carries its own accent `uiColor`,
 *   - hover complex: #c6c6c6 -> #fff, translateX(10px), text-shadow glow,
 *     underline collapse, all on cubic-bezier(.17,.4,.02,.99) ~0.4s,
 *   - decode/scramble text reveal (tail filled with random DIGITS),
 *   - media preview crossfade on hover (500ms easeOutSine, 300ms delay),
 *   - staggered entrances (1200ms easeOutQuint, 200ms stagger).
 *
 * This component reproduces that language with house stack (framer-motion +
 * scoped CSS + SmartImage), for the 18 Interfood services (content source:
 * docs/SERVICES-CONTENT.md, same data as the Cycle-35 EaServices grid).
 *
 * LAYOUT
 *   ┌ head ─────────────────────────────────────────────┐
 *   │ "// ЧТО МЫ ДЕЛАЕМ"      │ terminal filter          │
 *   │ УСЛУГИ  (mega mono)     │ ЧТО ВЫ ИЩЕТЕ? ▌          │
 *   │ decode subtitle         │ -> все  -> корпоратив …  │
 *   │                         │ [ поиск-пилюля ]         │
 *   ├ body (lg+: 7/5 split) ──┴──────────────────────────┤
 *   │ 01 КОФЕ-БРЕЙКИ   …meta → │ ┌─ sticky preview 4:5 ┐ │
 *   │ 02 КОНФЕРЕНЦИИ  …meta → │ │ crossfade + uiColor │ │
 *   │ …                        │ │ glow + scramble cap │ │
 *   ├ foot ────────────────────────────────────────────┤
 *   │ 18 УСЛУГ · 5 КАТЕГОРИЙ     [ ОБСУДИТЬ СОБЫТИЕ ↗ ] │
 *   └──────────────────────────────────────────────────┘
 *
 * Accessibility (AGENTS.md §5 #7):
 *   - section aria-labelledby; terminal = role="radiogroup" with roving
 *     tabindex + Arrow/Home/End keys (WAI-APG radio group pattern);
 *   - every row is a REAL <a href="#contact"> (keyboard / middle-click / SEO);
 *   - focus mirrors hover: focusing a row updates the preview;
 *   - scrambled text is aria-hidden; real text duplicated in .sr-only;
 *   - preview aside is aria-hidden (purely decorative duplicate);
 *   - live region announces result count; empty state offers a mailto CTA;
 *   - 44px+ touch targets (rows are ~84px tall, options padded);
 *   - prefers-reduced-motion: scramble/blink/crossfade/stagger disabled.
 *
 * Motion (RULES §5 — transform/opacity only; color/text-shadow are paint):
 *   - decode reveal: rAF scramble, digits charset, duration
 *     clamp(len*34, 400, 1200)ms — AT's loader/terminal feel;
 *   - rows: opacity+y stagger 40ms capped 400ms, exit 250ms, AT bezier;
 *   - preview: AnimatePresence sync crossfade 500ms + 120ms delay
 *     (easeOutSine approximation) with per-item uiColor glow;
 *   - terminal options: AT hover complex on cubic-bezier(.17,.4,.02,.99).
 *
 * Self-contained: scoped CSS in ./at-services.css (`at-svc__*` classes only).
 * No edits to globals.css or sibling components. The orchestrator swaps the
 * <EaServices /> call in page.tsx for <AtServices />.
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { IBM_Plex_Mono } from "next/font/google";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { SmartImage } from "@/components/media/smart-image";

import "./at-services.css";

/**
 * IBM Plex Mono — full Cyrillic subset, technical grotesk that stands in for
 * Active Theory's NB Architekt Std terminal voice. Scoped to this section via
 * the `--at-mono` variable (applied on the <section> root below).
 */
const plexMono = IBM_Plex_Mono({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin", "cyrillic"],
  variable: "--at-mono",
  display: "swap",
});

/** Active Theory chat/links easing — cubic-bezier(.17,.4,.02,.99). */
const EASE_AT = [0.17, 0.4, 0.02, 0.99] as const;
/** easeOutQuart approximation for the accent line sweep. */
const EASE_QUART = [0.165, 0.84, 0.44, 1] as const;
/** easeOutSine approximation for the preview crossfade. */
const EASE_SINE = [0.26, 0.53, 0.14, 0.96] as const;

type CategoryId = "all" | "corporate" | "private" | "buffet" | "special" | "logistics";

interface AtServiceItem {
  id: string;
  title: string;
  category: Exclude<CategoryId, "all">;
  tagline: string;
  minOrder: string;
  image: string;
  imageAlt: string;
  /** Active Theory `uiColor` — per-item accent tinting hover glow + preview. */
  ui: string;
}

/**
 * 18 services — identical content to Cycle-35 EaServices (source:
 * docs/SERVICES-CONTENT.md), re-shaped for the AT list format: every entry
 * gets a preview photo (existing /public/media assets, no new downloads) and
 * a food-derived accent color (warm palette — house rule: no blue/indigo).
 */
/**
 * Cycle 40: service → menu-type mapping for the contact-form prefill.
 * Clicking a service row dispatches catering:calc-lead so the form's
 * event-type chip is pre-selected (same mechanism as the calculator CTA).
 * Services without a natural menu counterpart navigate without a type.
 */
const SERVICE_TO_MENU_TYPE: Record<string, string> = {
  "coffee-breaks": "coffee-break",
  "snack-delivery": "snack-box",
  bbq: "bbq",
  "office-lunch": "office-lunch",
  vegetarian: "vegetarian",
  conferences: "banquet",
  presentations: "buffet",
  "ny-corporate": "banquet",
  "private-events": "banquet",
  "mobile-banquet": "banquet",
};

const SERVICES: AtServiceItem[] = [
  // ── corporate ───────────────────────────────────────────────────────
  {
    id: "coffee-breaks",
    title: "Кофе-брейки",
    category: "corporate",
    tagline: "Три паузы за день конференции — эспрессо, выпечка и минута тишины.",
    minOrder: "от 15 человек",
    image: "/media/menu-coffee-break.jpg",
    imageAlt: "Кофе-брейк: кофе, круассаны и мини-десерты на станции",
    ui: "#d9a05b",
  },
  {
    id: "conferences",
    title: "Конференции",
    category: "corporate",
    tagline: "Кейтеринг, который не отвлекает от повестки.",
    minOrder: "от 30 человек",
    image: "/media/concorde-boardroom.webp",
    imageAlt: "Сервированный стол переговорной комнаты на конференции",
    ui: "#e3b25c",
  },
  {
    id: "presentations",
    title: "Презентации",
    category: "corporate",
    tagline: "Сервировка, которая работает на ваш продукт.",
    minOrder: "от 20 человек",
    image: "/media/concorde-handhelds.jpg",
    imageAlt: "Официант с подносом канапе на презентации",
    ui: "#eac476",
  },
  {
    id: "office-lunch",
    title: "Обеды в офис",
    category: "corporate",
    tagline: "Горячее в термоупаковке к 12:00. Без полуфабрикатов.",
    minOrder: "от 10 порций",
    image: "/media/menu-office-lunch.jpg",
    imageAlt: "Корпоративные обеды в индивидуальной упаковке",
    ui: "#ce8f45",
  },
  {
    id: "ny-corporate",
    title: "Новогодний корпоратив",
    category: "corporate",
    tagline: "Ёлка, текстиль, посуда, официанты. Забираем хлопоты — оставляем праздник.",
    minOrder: "от 30 человек",
    image: "/media/gamma/gamma-catering-ballroom-chandelier-banquet.jpg",
    imageAlt: "Банкетный зал с люстрами под новогодний корпоратив",
    ui: "#e05c5c",
  },
  // ── private ─────────────────────────────────────────────────────────
  {
    id: "private-events",
    title: "Частные мероприятия",
    category: "private",
    tagline: "Камерный формат, где каждое блюдо — разговор шефа с вами.",
    minOrder: "от 20 человек",
    image: "/media/gamma/gamma-catering-erlebnis-privat-events.webp",
    imageAlt: "Камерное частное мероприятие с авторской сервировкой",
    ui: "#e5a0a8",
  },
  {
    id: "mobile-banquet",
    title: "Выездной банкет",
    category: "private",
    tagline: "Ресторанная подача там, где вам удобно — от особняка до шатра в лесу.",
    minOrder: "от 30 человек",
    image: "/media/banket-1.jpg",
    imageAlt: "Выездной банкет: сервированный стол с фарфором и свечами",
    ui: "#e2725b",
  },
  {
    id: "mobile-restaurant",
    title: "Выездной ресторан",
    category: "private",
    tagline: "Открытая кухня: гости видят, как шеф заканчивает блюдо.",
    minOrder: "от 40 человек",
    image: "/media/gamma/showkueche-live-cooking-koeche-gammacatering.jpg",
    imageAlt: "Шеф-повара за открытой кухней на мероприятии",
    ui: "#ed6a45",
  },
  {
    id: "custom-cakes",
    title: "Торты на заказ",
    category: "private",
    tagline: "Торт как архитектура: ярусы, текстуры, сезонные ягоды.",
    minOrder: "от 1.5 кг",
    image: "/media/concorde-dessert.jpg",
    imageAlt: "Авторский многоярусный десерт с ягодами",
    ui: "#e9a9be",
  },
  // ── buffet ──────────────────────────────────────────────────────────
  {
    id: "snack-delivery",
    title: "Доставка закусок",
    category: "buffet",
    tagline: "Фирменные ланч-боксы: 6–8 видов канапе, упакованных порционно.",
    minOrder: "от 10 человек",
    image: "/media/menu-snack-box.jpg",
    imageAlt: "Ланч-боксы с канапе и мини-закусками",
    ui: "#d4a373",
  },
  {
    id: "bbq",
    title: "Барбекю",
    category: "buffet",
    tagline: "Гриль на углях. Стейки рибай, овощи с мангала, фирменные маринады.",
    minOrder: "от 20 человек",
    image: "/media/talkofthetown/talkofthetown-section-paella-station.jpg",
    imageAlt: "Гриль-станция с открытым огнём на мероприятии",
    ui: "#e1582f",
  },
  {
    id: "chocolate-fountain",
    title: "Шоколадный фонтан",
    category: "buffet",
    tagline: "Бельгийский кувертюр и 6 видов дипов. Фокус-точка фуршета.",
    minOrder: "от 40 человек",
    image: "/media/talkofthetown/talkofthetown-section-sweet-treats.jpg",
    imageAlt: "Десертная станция: сладости и угощения на шпажках",
    ui: "#c08552",
  },
  {
    id: "champagne-pyramid",
    title: "Пирамиды из шампанского",
    category: "buffet",
    tagline: "Каскад бокалов, по которому льётся игристое.",
    minOrder: "от 50 бокалов",
    image: "/media/gamma/sommelier-uniform-weinservice-gammacatering.jpg",
    imageAlt: "Сомелье наливает игристое в каскад бокалов",
    ui: "#f2d377",
  },
  // ── special ─────────────────────────────────────────────────────────
  {
    id: "vegetarian",
    title: "Вегетарианское",
    category: "special",
    tagline: "Меню без мяса, но не «без». Овощи как главные герои.",
    minOrder: "от 15 человек",
    image: "/media/cutandtaste-artichoke.webp",
    imageAlt: "Артишок крупным планом — овощ как главный герой подачи",
    ui: "#a3b86c",
  },
  {
    id: "halal",
    title: "Халяль",
    category: "special",
    tagline: "Сертифицированные поставки. Уважение к традиции — без компромиссов по вкусу.",
    minOrder: "от 20 человек",
    image: "/media/ridgewells-veg-mosaic.jpg",
    imageAlt: "Мозаика овощных закусок премиальной подачи",
    ui: "#7fb069",
  },
  // ── logistics ───────────────────────────────────────────────────────
  {
    id: "mobile-registration",
    title: "Выездная регистрация",
    category: "logistics",
    tagline: "Сервировка церемонии бракосочетания. Тонкий момент — тонкая работа.",
    minOrder: "от 15 человек",
    image: "/media/event-wedding-light.jpg",
    imageAlt: "Выездная церемония регистрации при вечернем свете",
    ui: "#e7b7be",
  },
  {
    id: "equipment-rental",
    title: "Аренда оборудования",
    category: "logistics",
    tagline: "Посуда, мебель, текстиль, шатры. Привозим — забираем.",
    minOrder: "от 1 позиции",
    image: "/media/gamma/event-service-tischeindeckung-gala-gammacatering.jpg",
    imageAlt: "Гала-сервировка: фарфор, стекло и текстиль на столе",
    ui: "#bfa07e",
  },
  {
    id: "hall-decoration",
    title: "Оформление зала",
    category: "logistics",
    tagline: "Флористика, текстиль, свет, декор. При банкете — до 4 композиций в подарок.",
    minOrder: "от 1 зоны",
    image: "/media/gamma/hochzeit-tischdekoration-zitronen-gedeck-gammacatering.jpg",
    imageAlt: "Оформление зала: флористика и текстиль на столах",
    ui: "#e1969e",
  },
];

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "all", label: "все" },
  { id: "corporate", label: "корпоратив" },
  { id: "private", label: "частные" },
  { id: "buffet", label: "фуршет" },
  { id: "special", label: "спецменю" },
  { id: "logistics", label: "логистика" },
];

/** Uppercase RU label per category for the row meta column. */
const CATEGORY_META: Record<Exclude<CategoryId, "all">, string> = {
  corporate: "Корпоратив",
  private: "Частные",
  buffet: "Фуршет",
  special: "Спецменю",
  logistics: "Логистика",
};

const countIn = (cat: Exclude<CategoryId, "all">) =>
  SERVICES.filter((s) => s.category === cat).length;

/* ──────────────────────────────────────────────────────────────────────── */
/* Decode / scramble — Active Theory's signature text reveal. Tail of the   */
/* string fills with random DIGITS while the head reveals left→right.       */
/* ──────────────────────────────────────────────────────────────────────── */

function useScramble(text: string, play = true) {
  const [out, setOut] = useState(text);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !play) {
      setOut(text);
      return;
    }
    // AT charset: digits only (their loader/terminal scramble).
    const CHARS = "0123456789";
    const dur = Math.min(1200, Math.max(400, text.length * 34));
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const revealed = Math.floor(p * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        // Spaces and separators stay put so word shapes read through.
        s +=
          i < revealed || c === " " || c === "/" || c === "-" || c === "·"
            ? c
            : CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setOut(s);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setOut(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, play, reduce]);

  return out;
}

/**
 * Scrambled line with an a11y mirror: the animated span is aria-hidden and a
 * visually-hidden span carries the real text (mirrors AT's GLA11y layer).
 */
function ScrambleText({
  text,
  play = true,
  className,
}: {
  text: string;
  play?: boolean;
  className?: string;
}) {
  const scrambled = useScramble(text, play);
  return (
    /* Cycle 39 a11y fix: aria-label on the wrapper replaces the sr-only
       mirror — previously the accessible name concatenated the mirror +
       the scrambled layer ("УСЛУГИУСЛУГИ"). */
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{scrambled}</span>
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Preview — sticky portrait panel (lg+). AnimatePresence crossfade between */
/* the previous and next image, each layer carrying its own uiColor glow.   */
/* Decorative only: the rows themselves carry all semantics.                */
/* ──────────────────────────────────────────────────────────────────────── */

function Preview({ active, index, total }: { active: AtServiceItem; index: number; total: number }) {
  return (
    <aside className="at-svc__preview" aria-hidden="true">
      <div className="at-svc__preview-frame">
        {/* AT glass edge — thin white hairline, like their WorkPane border. */}
        <span className="at-svc__preview-edge" />
        <AnimatePresence initial={false}>
          <motion.div
            key={active.id}
            className="at-svc__preview-layer"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.5, delay: 0.12, ease: EASE_SINE },
            }}
            exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeIn" } }}
          >
            {/* Per-item uiColor glow — the AT "panel lights up in its hue". */}
            <span
              className="at-svc__preview-glow"
              style={{ background: active.ui }}
            />
            <SmartImage
              src={active.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="at-svc__preview-img"
              /* priority: the preview aside is display:none below lg — a lazy
                 image inside it never loads there and audits flag it as
                 broken (naturalWidth=0). One ~80 KB asset, eager is cheap. */
              priority
            />
            {/* Bottom readability block — AT's #060606 card backing. */}
            <span className="at-svc__preview-shade" />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="at-svc__preview-caption" style={{ "--ui": active.ui } as CSSProperties}>
        <span className="at-svc__preview-num">
          {"/// "}
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <ScrambleText
          text={active.title.toUpperCase()}
          className="at-svc__preview-title"
        />
        <p className="at-svc__preview-tagline">{active.tagline}</p>
        <span className="at-svc__preview-min">{"// "}{active.minOrder}</span>
      </div>
    </aside>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/* AtServices                                                                */
/* ──────────────────────────────────────────────────────────────────────── */

export function AtServices() {
  const h2Id = useId();
  const listId = useId();
  const askId = useId();
  const reduce = useReducedMotion();

  const [cat, setCat] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const headRef = useRef<HTMLDivElement>(null);
  const headInView = useInView(headRef, { once: true, margin: "-120px" });

  /** Terminal filter: category AND title/tagline substring. */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SERVICES.filter(
      (s) =>
        (cat === "all" || s.category === cat) &&
        (!q ||
          s.title.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q)),
    );
  }, [cat, query]);

  /** Active preview item — hover/focus target, else first visible row. */
  const active = visible.find((s) => s.id === activeId) ?? visible[0];
  const activeIndex = active ? visible.indexOf(active) : -1;

  // Drop a stale active target when the filter hides it (AT: carousel always
  // shows the nearest panel — here, the first visible row).
  useEffect(() => {
    if (active && active.id !== activeId) setActiveId(active.id);
  }, [active, activeId]);

  /* Roving tabindex for the radio group (WAI-APG): arrows/Home/End. */
  const onOptionsKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const keysNext = ["ArrowRight", "ArrowDown"];
      const keysPrev = ["ArrowLeft", "ArrowUp"];
      if (![...keysNext, ...keysPrev, "Home", "End"].includes(e.key)) return;
      e.preventDefault();
      const i = CATEGORIES.findIndex((c) => c.id === cat);
      let next = i;
      if (e.key === "Home") next = 0;
      else if (e.key === "End") next = CATEGORIES.length - 1;
      else if (keysNext.includes(e.key)) next = (i + 1) % CATEGORIES.length;
      else if (keysPrev.includes(e.key))
        next = (i - 1 + CATEGORIES.length) % CATEGORIES.length;
      setCat(CATEGORIES[next].id);
      // Move focus to the newly selected radio (roving tabindex).
      requestAnimationFrame(() => {
        headRef.current
          ?.querySelector<HTMLButtonElement>(
            `[data-cat="${CATEGORIES[next].id}"]`,
          )
          ?.focus();
      });
    },
    [cat],
  );

  return (
    <section
      id="services"
      aria-labelledby={h2Id}
      data-header-theme="dark"
      className={`at-svc ${plexMono.variable}`}
    >
      {/* AT scene vignette — near-black with a faint teal core breath. */}
      <span className="at-svc__vignette" aria-hidden="true" />

      <div className="at-svc__wrap">
        {/* ── HEAD: mega title + terminal filter ─────────────────────── */}
        <div className="at-svc__head" ref={headRef}>
          <motion.div
            className="at-svc__head-left"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: EASE_AT }}
          >
            <p className="at-svc__eyebrow">
              <span className="at-svc__eyebrow-cy" aria-hidden="true">{"//"}</span>{" "}
              ЧТО МЫ ДЕЛАЕМ
            </p>
            <h2 id={h2Id} className="at-svc__h2">
              {/* AT decode reveal on the mega heading (plays once in view). */}
              <ScrambleText text="УСЛУГИ" play={headInView} />
            </h2>
            <ScrambleText
              text="КАТЕРИНГ / БАНКЕТЫ / ФУРШЕТЫ / ЛОГИСТИКА"
              play={headInView}
              className="at-svc__sub"
            />
          </motion.div>

          {/* Terminal — the AT /work "What are you looking for?" filter. */}
          <motion.div
            className="at-svc__term"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.12, ease: EASE_AT }}
          >
            <p className="at-svc__term-q">
              <ScrambleText text="ЧТО ВЫ ИЩЕТЕ?" play={headInView} />
              <span className="at-svc__caret" aria-hidden="true" />
            </p>
            <div
              className="at-svc__term-opts"
              role="radiogroup"
              aria-label="Категория услуг"
              onKeyDown={onOptionsKey}
            >
              {CATEGORIES.map((c) => {
                const isSel = cat === c.id;
                const n =
                  c.id === "all"
                    ? SERVICES.length
                    : countIn(c.id as Exclude<CategoryId, "all">);
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={isSel}
                    tabIndex={isSel ? 0 : -1}
                    data-cat={c.id}
                    className={`at-svc__opt${isSel ? " is-sel" : ""}`}
                    onClick={() => setCat(c.id)}
                  >
                    <span className="at-svc__opt-arrow" aria-hidden="true">
                      {"->"}
                    </span>
                    <span className="at-svc__opt-label">{c.label}</span>
                    <span className="at-svc__opt-count" aria-hidden="true">
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="at-svc__ask">
              <input
                id={askId}
                type="search"
                className="at-svc__ask-input"
                placeholder="СПРОСИТЕ ОБ УСЛУГЕ..."
                aria-label="Поиск услуги по названию"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setQuery("")}
              />
            </div>
            <p className="at-svc__hint" aria-live="polite">
              {"// "}
              {visible.length} / {SERVICES.length}
            </p>
          </motion.div>
        </div>

        {/* ── BODY: typographic list + sticky preview ─────────────────── */}
        <div className="at-svc__body">
          <motion.ul
            id={listId}
            className="at-svc__list"
            aria-label="Услуги Interfood"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE_AT }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((s, i) => (
                <motion.li
                  key={s.id}
                  layout={!reduce}
                  className="at-svc__row"
                  style={{ "--ui": s.ui } as CSSProperties}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.4,
                      delay: Math.min(i * 0.04, 0.4),
                      ease: EASE_AT,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                    transition: { duration: 0.25, ease: "easeIn" },
                  }}
                >
                  <a
                    href="#contact"
                    className="at-svc__row-link"
                    aria-label={`Обсудить: ${s.title} — ${s.minOrder}`}
                    onFocus={() => setActiveId(s.id)}
                    onMouseEnter={() => setActiveId(s.id)}
                    onClick={() => {
                      const typeId = SERVICE_TO_MENU_TYPE[s.id];
                      if (typeId && typeof window !== "undefined") {
                        window.dispatchEvent(
                          new CustomEvent("catering:calc-lead", {
                            detail: { typeId },
                          }),
                        );
                      }
                    }}
                  >
                    <span className="at-svc__row-index" aria-hidden="true">
                      {"//"}
                      {String(SERVICES.indexOf(s) + 1).padStart(2, "0")}
                    </span>
                    <span className="at-svc__row-main">
                      <span className="at-svc__row-title">{s.title}</span>
                      <span
                        className="at-svc__row-tagline"
                        data-cat-min={`${CATEGORY_META[s.category]} · ${s.minOrder}`}
                      >
                        {s.tagline}
                      </span>
                    </span>
                    <span className="at-svc__row-meta">
                      <span className="at-svc__row-cat">
                        {CATEGORY_META[s.category]}
                      </span>
                      <span className="at-svc__row-min">{s.minOrder}</span>
                    </span>
                    <span className="at-svc__row-arrow" aria-hidden="true">
                      <ArrowUpRight strokeWidth={1.5} />
                    </span>
                  </a>
                  {/* Accent sweep — AT underline that draws in the item hue. */}
                  <span className="at-svc__row-line" aria-hidden="true" />
                </motion.li>
              ))}
            </AnimatePresence>

            {visible.length === 0 && (
              <li className="at-svc__empty">
                <span className="at-svc__empty-arrow" aria-hidden="true">
                  {"->"}
                </span>
                {cat !== "all" && query.trim() ? (
                  <>
                    В КАТЕГОРИИ{" "}
                    «{CATEGORIES.find((x) => x.id === cat)?.label.toUpperCase()}»{" "}
                    НИЧЕГО НЕ НАЙДЕНО ПО ЗАПРОСУ «{query.trim().toUpperCase()}» —{" "}
                    <button
                      type="button"
                      className="at-svc__empty-link"
                      onClick={() => {
                        setCat("all");
                        setQuery("");
                      }}
                    >
                      СБРОСИТЬ ФИЛЬТРЫ
                    </button>
                  </>
                ) : query.trim() ? (
                  <>
                    ПО ЗАПРОСУ «{query.trim().toUpperCase()}» НИЧЕГО НЕ НАЙДЕНО —{" "}
                    <button
                      type="button"
                      className="at-svc__empty-link"
                      onClick={() => setQuery("")}
                    >
                      ОЧИСТИТЬ ПОИСК
                    </button>
                  </>
                ) : (
                  <>
                    НИЧЕГО НЕ НАЙДЕНО —{" "}
                    <a href="#contact" className="at-svc__empty-link">
                      НАПИШИТЕ НАМ
                    </a>
                    , ПРИДУМАЕМ
                  </>
                )}
              </li>
            )}
          </motion.ul>

          {active && (
            <Preview active={active} index={activeIndex} total={visible.length} />
          )}
        </div>

        {/* ── FOOT: stats + glass CTA pill ───────────────────────────── */}
        <motion.div
          className="at-svc__foot"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE_AT }}
        >
          <p className="at-svc__stat">
            18 УСЛУГ · 5 КАТЕГОРИЙ · САНКТ-ПЕТЕРБУРГ И ОБЛАСТЬ
          </p>
          <Link href="#contact" className="at-svc__pill">
            ОБСУДИТЬ СОБЫТИЕ
            <ArrowUpRight strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
