"use client";

/**
 * SpiralServices — Cycle 45. «Спираль» (The Spiral).
 * ---------------------------------------------------------------------------
 *
 * REDESIGN RATIONALE: the user explicitly asked to copy the
 * activetheory.net spiral — service cards arranged in a 3D helix that
 * descends and rotates as the user scrolls. Research C45-R1 (web search +
 * bundle analysis) confirmed AT's homepage is a WebGL/Three.js scene with
 * `scrollProgress` + `scrollCamera` driving a 3D helix where cards descend
 * past the camera. The Cartier `365ayearof` SOTM (already in our
 * INSPIRATION.md) uses the same archetype.
 *
 * IMPLEMENTATION (per research §2, "Pattern B — CSS 3D transforms"):
 *   - CSS `transform-style: preserve-3d` + `perspective` for true 3D depth
 *     (no Three.js/R3F dependency added — keeps bundle light, complies
 *     with RULES §5 "transform/opacity only").
 *   - Framer Motion `useScroll` + `useTransform` drive the helix group's
 *     `rotateY` (one-and-a-half turns across the scroll range) and `y`
 *     (camera descends through the spiral — the "spiral moves down" feel).
 *   - Each card is statically positioned on the helix via
 *     `translate3d(R·cos θ, y_i, R·sin θ) rotateY(-θ)` — the canonical
 *     helix layout from research §4. y_i is centered around the helix's
 *     midpoint so the spiral is vertically balanced.
 *   - Per-card opacity (per-card `useTransform` in <SpiralCard>) dims cards
 *     on the back of the cylinder — we see only the front-facing cards,
 *     which is the spiral's signature visual.
 *   - Active-card HUD ("01 / 12 — Фуршеты") updates with scroll, AT-style.
 *
 * CONTENT: 12 services — the 7 primary scenes from Cycle-44 StageServices
 * + 5 of the 6 «Ещё услуги» extras (logistics kept for the closing slot).
 * Same validated copy, prices, media, and CTA targets as StageServices.
 *
 * ACCESSIBILITY (AGENTS.md §5 #7 + §8):
 *   - <section aria-labelledby>; mega-title has the linked id.
 *   - Every card is a real <a href="#calculator|#contact"> (keyboard, middle-
 *     click, SEO) — the entire card surface is the link.
 *   - `prefers-reduced-motion`: renders a clean vertical list variant with
 *     the same content, same CTAs, same heading (NO 3D, NO transforms).
 *   - Mobile (≤820px) also renders the vertical list — CSS 3D transforms on
 *     a 360px-wide viewport with 12 absolute cards is janky; the list is the
 *     better UX. (AT itself falls back to a stacked list on mobile.)
 *   - Card photos use <SmartImage> (next/image) with explicit alt + sizes.
 *
 * MOTION (RULES §5 — transform/opacity only):
 *   - Helix group: rotateY + y driven by scrollYProgress (two MotionValues,
 *     composed by Framer Motion into a single GPU-friendly transform).
 *   - Per-card opacity: useTransform on scrollYProgress, cosine-based facing
 *     factor → 0.18..1.0 range. will-change on the helix + cards only.
 *   - Title: clip-path reveal on enter (Reveal pattern, already in
 *     motion/reveal.tsx — reused here inline for the eyebrow + subtitle).
 *
 * Self-contained: scoped CSS in ./spiral-services.css (`sp-st__*` classes).
 * Swaps StageServices in page.tsx (both kept on disk per repo convention).
 */

import { useRef } from "react";
import Link from "next/link";
import { Unbounded, Golos_Text } from "next/font/google";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { SmartImage } from "@/components/media/smart-image";

import "./spiral-services.css";

/* ----------------------------------------------------------------- tokens -- */

/** Unbounded — variable wght 200–900, full Cyrillic (display/kinetic type). */
const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "800"],
  variable: "--sp-unb",
  display: "swap",
});

/** Golos Text — Russian-designed neo-grotesk (body/UI/meta). */
const golos = Golos_Text({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--sp-golos",
  display: "swap",
});

/* ------------------------------------------------------------------- data --- */

type SpiralItem = {
  id: string;
  index: string;
  title: string;
  hook: string;
  price: string;
  tag: string;
  media: string;
  mediaAlt: string;
  ctaLabel: string;
  ctaHref: string;
};

/**
 * 12 services — 7 primary scenes (Cycle-44 StageServices) + 5 extras.
 * Same validated content, prices, media, CTAs. Re-shaped for the spiral:
 * every entry carries an `index` (01..12) and a short uppercase `tag` for
 * the card's accent chip.
 */
const SPIRAL: SpiralItem[] = [
  {
    id: "furshety",
    index: "01",
    title: "Фуршеты",
    hook: "Канапе, welcome-коктейли и подача, которая не останавливается ни на минуту.",
    price: "от 1\u00A0600\u00A0₽/гость",
    tag: "Базовая подача",
    media: "/media/furshet-1.jpg",
    mediaAlt: "Фуршетные канапе и закуски на подаче",
    ctaLabel: "Рассчитать фуршет",
    ctaHref: "#calculator",
  },
  {
    id: "bankety",
    index: "02",
    title: "Банкеты",
    hook: "Полная посадка: от аперитива до десерта — официанты, сомелье и тайминг до минуты.",
    price: "от 3\u00A0500\u00A0₽/гость",
    tag: "Премиум",
    media: "/media/gamma/gamma-catering-ballroom-chandelier-banquet.jpg",
    mediaAlt: "Банкетный зал с люстрой и накрытыми столами",
    ctaLabel: "Рассчитать банкет",
    ctaHref: "#calculator",
  },
  {
    id: "svadby",
    index: "03",
    title: "Свадьбы",
    hook: "Выездная регистрация, банкет и торт — одна команда отвечает за весь день.",
    price: "от 5\u00A0500\u00A0₽/гость",
    tag: "Под ключ",
    media: "/media/event-wedding-light.jpg",
    mediaAlt: "Свадебный банкет при свечах",
    ctaLabel: "Обсудить свадьбу",
    ctaHref: "#contact",
  },
  {
    id: "korporativ",
    index: "04",
    title: "Корпоратив",
    hook: "Конференции, форумы и гала-ужины: кофе-брейки, фуршеты и полный техтайминг.",
    price: "от 2\u00A0500\u00A0₽/гость",
    tag: "B2B",
    media: "/media/gamma/firmenevent-messe-gala-bankett-gammacatering.jpg",
    mediaAlt: "Корпоративный гала-ужин с сервировкой",
    ctaLabel: "Запросить смету",
    ctaHref: "#contact",
  },
  {
    id: "kofe-breyki",
    index: "05",
    title: "Кофе-брейки",
    hook: "Горячее в термоупаковке к 12:00 — каждый день или к вашей дате.",
    price: "от 450\u00A0₽/гость",
    tag: "Офис",
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
    price: "от 2\u00A0000\u00A0₽/гость",
    tag: "На природе",
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
    price: "от 900\u00A0₽/гость",
    tag: "Миксология",
    media: "/media/gamma/sommelier-uniform-weinservice-gammacatering.jpg",
    mediaAlt: "Сомелье на выездном баре на мероприятии",
    ctaLabel: "Обсудить бар",
    ctaHref: "#contact",
  },
  {
    id: "shou-stancii",
    index: "08",
    title: "Шоу-станции",
    hook: "Поке, паста, карвинг и тако: гости смотрят, как рождается блюдо.",
    price: "от 1\u00A0800\u00A0₽/гость",
    tag: "Live cooking",
    media: "/media/gamma/showkueche-live-cooking-koeche-gammacatering.jpg",
    mediaAlt: "Шеф-повара у шоу-станции с живой готовкой",
    ctaLabel: "Запросить шоу-станции",
    ctaHref: "#contact",
  },
  {
    id: "gastro-boksy",
    index: "09",
    title: "Гастро-боксы",
    hook: "6–8 видов канапе, упакованных порционно, — к нужному часу.",
    price: "от 650\u00A0₽/гость",
    tag: "Доставка",
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
    tag: "Десерт",
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
    price: "от 1\u00A0900\u00A0₽/гость",
    tag: "Спецдиета",
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
    tag: "Под ключ",
    media: "/media/gamma/event-service-tischeindeckung-gala-gammacatering.jpg",
    mediaAlt: "Сервировка стола для гала-банкета",
    ctaLabel: "Обсудить логистику",
    ctaHref: "#contact",
  },
];

/* ----------------------------------------------------------- helix math --- */

const N = SPIRAL.length; // 12
const TURNS = 1; // 1 full revolution of the helix across the scroll range
                 // (clean linear cycling: card i is at front at p = i/(N-1))
const R = 300; // helix radius, px (card center distance from central axis)
const H_STEP = 105; // vertical step per card, px (card-center spacing).
                   // v2 lowered from 130 → 105 to fit more cards in the
                   // viewport vertically (6 visible at p=0 instead of 4,
                   // per critique C1 §A that said "feels flat at start").

/** Phase offset so card 0 starts at the FRONT of the cylinder (facing the
 *  camera, on the +Z axis). Without this, card 0 would start on the +X
 *  axis (right side) and the viewport center would be empty. */
const PHASE = Math.PI / 2;

/**
 * Static helix layout for card i.
 *
 * Geometry (per research §4, with phase offset fix):
 *   - stepAngle_i = (i / (N-1)) · TURNS · 2π  (angular step from card 0)
 *   - θ_i = PHASE + stepAngle_i  (actual angular position, starts at π/2)
 *   - x = R · cos(θ_i)  (horizontal position around the Y axis)
 *   - z = R · sin(θ_i)  (depth — +z is toward camera, -z is behind helix)
 *   - y = (i - (N-1)/2) · H_STEP  (centered around helix midpoint, so card 0
 *     is at the top and card N-1 is at the bottom of the helix's vertical
 *     extent)
 *   - rotY = -stepAngle_i  (= π/2 - θ_i — face outward, so the card's
 *     normal points away from the central axis. Verified: for card 0 with
 *     θ_0 = π/2, rotY = 0 → card faces +Z (default) = outward = toward
 *     camera. ✓)
 *
 * The `angle` returned is θ_i (with phase offset), so the per-card opacity
 * calc in <SpiralCard> can use the full effective angle directly.
 */
function spiralLayout(i: number) {
  const stepAngle = (i / (N - 1)) * TURNS * Math.PI * 2;
  const θ = PHASE + stepAngle;
  const y = (i - (N - 1) / 2) * H_STEP;
  const x = Math.cos(θ) * R;
  const z = Math.sin(θ) * R;
  const rotY = -stepAngle;
  return { x, y, z, rotY, angle: θ };
}

/* -------------------------------------------------------- per-card shell --- */

/**
 * SpiralCard — one card on the helix.
 *
 * Static transform places it on the helix (translate3d + rotateY). Dynamic
 * opacity (per-card useTransform on scrollYProgress) dims it when it's on
 * the back of the cylinder — we see only the front-facing cards (the
 * spiral's signature visual).
 *
 * The whole card is wrapped in an <a> so it's keyboard-focusable and the
 * click navigates to the CTA target (calculator or contact). The inner
 * motion.article animates opacity only — the link wraps it for hit-area.
 */
function SpiralCard({
  item,
  i,
  scrollYProgress,
}: {
  item: SpiralItem;
  i: number;
  scrollYProgress: MotionValue<number>;
}) {
  const { x, y, z, rotY, angle } = spiralLayout(i);

  /**
   * Facing factor: 1.0 when the card is at the FRONT of the cylinder
   * (effective angle ≈ π/2 — closest to camera on +Z), 0.0 when at the
   * BACK (effective angle ≈ 3π/2 — furthest from camera on -Z).
   *
   * effective_angle = card_local_angle_θ + group_rotation
   * group_rotation = -scroll · TURNS · 2π  (NEGATIVE — clean linear
   *   cycling: card i is at front at p = i/(N-1), so cards come to front
   *   in order 0, 1, 2, ..., 11 as user scrolls)
   *
   * facing = sin(effective_angle) — peaks at π/2 (front), troughs at 3π/2
   * (back). Maps to opacity 0.18..1.0 so back cards fade out gracefully.
   */
  const opacity = useTransform(scrollYProgress, (p) => {
    const groupRot = -p * TURNS * Math.PI * 2;
    const eff = angle + groupRot;
    // Normalize to [-π, π]
    let norm = ((eff % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (norm > Math.PI) norm -= 2 * Math.PI;
    const facing = Math.sin(norm); // 1 at π/2 (front), -1 at -π/2 (back)
    // Stronger falloff than v1: 0.08..1.0 (back cards almost invisible,
    // giving the cylinder a true depth-of-field read instead of a flat
    // stack — per design critique C1 §Tier-A #2).
    const o = 0.08 + 0.92 * ((facing + 1) / 2);
    return Math.max(0.05, Math.min(1, o));
  });

  /**
   * Card scale: stronger depth scale — cards at the front are full size
   * (1.0), cards at the back shrink to 0.62 (back of cylinder appears
   * further from camera). v1 was 0.85..1.0 (too tame — back cards read
   * as "layout mistake" per critique C1).
   */
  const scale = useTransform(scrollYProgress, (p) => {
    const groupRot = -p * TURNS * Math.PI * 2;
    const eff = angle + groupRot;
    let norm = ((eff % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (norm > Math.PI) norm -= 2 * Math.PI;
    const facing = Math.sin(norm);
    return 0.62 + 0.38 * ((facing + 1) / 2);
  });

  /**
   * Depth-of-field filter (per critique C2 §Top-3 #2 — sqrt curve was
   * wrong shape: it died at the extremes which are the most-screenshotted
   * moments). v3 uses a PIECEWISE curve with a forced 2px floor on any
   * card more than 2 indices from focal, so even near-front cards read
   * as "optically out of focus" not "scaled copies" (critique C2 §1):
   *
   *   facingFactor: 1.0 at front (π/2), 0.0 at back (3π/2)
   *   blur: 0px at exact-front → 2px FLOOR for everything else → 9px at
   *     very back. Piecewise: 0 if facingFactor > 0.92, else linear.
   *   saturate: 1.0 front → 0.25 back (stronger than v2's 0.4 so the
   *     desaturation is unambiguously visible — v2's 0.4 was too mild).
   *
   * Filter chain ORDER MATTERS: `blur() saturate()` (this order) —
   * saturate-after-blur, never the reverse. Critique C2 §4 flagged
   * v2's saturate as "not visibly applying" — verified the order is
   * correct here; the issue was the value was too mild (0.4 vs 0.25).
   */
  const filter = useTransform(scrollYProgress, (p) => {
    const groupRot = -p * TURNS * Math.PI * 2;
    const eff = angle + groupRot;
    let norm = ((eff % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (norm > Math.PI) norm -= 2 * Math.PI;
    const facing = Math.sin(norm);
    const facingFactor = (facing + 1) / 2; // 1 front, 0 back
    // Piecewise: 0px at exact front (factor >= 0.92),
    // linear 2..9px for everything else (forced floor so even
    // near-front back cards read as "out of focus").
    const blurPx =
      facingFactor >= 0.92
        ? 0
        : 2 + (1 - facingFactor) * 7; // 2px floor → 9px at back
    const sat = 0.25 + facingFactor * 0.75; // 0.25 back → 1.0 front
    return `blur(${blurPx.toFixed(2)}px) saturate(${sat.toFixed(2)})`;
  });

  return (
    <motion.div
      className="sp-st__card"
      style={{
        // NOTE: do NOT use a static `transform: 'translate3d(...)'` string
        // here — Framer Motion would override it with its own auto-composed
        // transform for `scale` (and any other transform MotionValues),
        // losing the 3D rotateY. Use individual x/y/z/rotateY values
        // instead so Framer composes them all into ONE 3D transform that
        // preserves `transform-style: preserve-3d` on the parent.
        x,
        y,
        z,
        rotateY: (rotY * 180) / Math.PI, // Framer Motion's rotateY expects degrees
        opacity,
        scale,
        filter,
      }}
    >
      <Link
        href={item.ctaHref}
        className="sp-st__card-link"
        aria-label={`${item.title} — ${item.ctaLabel}`}
      >
        <article className="sp-st__card-inner">
          <div className="sp-st__card-media">
            <SmartImage
              src={item.media}
              alt={item.mediaAlt}
              width={560}
              height={700}
              sizes="(max-width: 820px) 100vw, 320px"
              className="sp-st__img"
            />
            <div className="sp-st__card-chrome">
              <span className="sp-st__index">{item.index}</span>
              <span className="sp-st__tag">{item.tag}</span>
            </div>
            <div className="sp-st__card-veil" aria-hidden="true" />
          </div>
          <div className="sp-st__card-body">
            <h3 className="sp-st__card-title">{item.title}</h3>
            <p className="sp-st__card-hook">{item.hook}</p>
            <div className="sp-st__card-foot">
              <span className="sp-st__price">{item.price}</span>
              <span className="sp-st__cta">
                {item.ctaLabel}
                <ArrowUpRight className="sp-st__cta-icon" strokeWidth={1.6} />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------- active-card HUD --- */

/**
 * frontCardIdx — index of the card whose effective angle is closest to
 * the front position (π/2 — closest to camera on +Z axis). The effective
 * angle = card_local_angle + group_rotation. Used by the HUD and the
 * bottom counter so both stay in sync with the actual front card.
 */
function frontCardIdx(p: number): number {
  // group rotation is NEGATIVE for clean linear cycling (card i at front
  // at p = i/(N-1))
  const groupRot = -p * TURNS * Math.PI * 2;
  let bestI = 0;
  let bestDist = Infinity;
  for (let i = 0; i < N; i++) {
    // card's local angle (with phase offset, matches spiralLayout's θ)
    const cardAngle = PHASE + (i / (N - 1)) * TURNS * Math.PI * 2;
    let eff = cardAngle + groupRot;
    // Normalize to [-π, π]
    eff = ((eff % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (eff > Math.PI) eff -= 2 * Math.PI;
    // Distance to π/2 (front position)
    let dist = Math.abs(eff - Math.PI / 2);
    if (dist > Math.PI) dist = 2 * Math.PI - dist;
    if (dist < bestDist) {
      bestDist = dist;
      bestI = i;
    }
  }
  return bestI;
}

/**
 * ActiveCardHud — top-right corner readout showing the current front-facing
 * card's index, title, and tag. Updates with scrollYProgress (the front
 * card cycles through all N as the user scrolls). AT-style technical HUD.
 */
function ActiveCardHud({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const idx = useTransform(scrollYProgress, (p) => frontCardIdx(p));
  const idxStr = useTransform(idx, (i) => SPIRAL[i].index);
  const title = useTransform(idx, (i) => SPIRAL[i].title);
  const tag = useTransform(idx, (i) => SPIRAL[i].tag);

  return (
    <motion.div className="sp-st__hud" aria-hidden="true">
      <motion.span className="sp-st__hud-index">{idxStr}</motion.span>
      <div className="sp-st__hud-divider" />
      <div className="sp-st__hud-meta">
        <motion.span className="sp-st__hud-title">{title}</motion.span>
        <motion.span className="sp-st__hud-tag">{tag}</motion.span>
      </div>
    </motion.div>
  );
}

/* ============================================================= main ==== */

export function SpiralServices() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  /**
   * Helix group rotation — NEGATIVE direction for clean linear cycling
   * (card i is at front at p = i/(N-1), so cards come to front in order
   * 0, 1, 2, ..., 11 as user scrolls — matches the descending Y order).
   * Output in DEGREES (Framer Motion's rotateY expects degrees, not
   * radians — verified the hard way: passing radians makes the helix
   * appear to barely rotate, since 1 rad ≈ 57° looks "almost zero").
   */
  const rotateY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -TURNS * 360],
  );

  /**
   * Helix group Y translation — the helix moves UP as the user scrolls
   * (camera effectively descends through the spiral). This is the
   * "spiral moves down" feel from activetheory.net: cards come from below
   * the viewport, pass through the front, and exit above.
   *
   * Range: from +((N-1)/2)·H_STEP (so card 0 ends up centered) to
   * -((N-1)/2)·H_STEP (so card N-1 ends up centered).
   */
  const yHalf = ((N - 1) / 2) * H_STEP;
  const translateY = useTransform(scrollYProgress, [0, 1], [yHalf, -yHalf]);

  /** Subtle parallax on the eyebrow label (HUD coordinate feel). */
  const eyebrowX = useTransform(scrollYProgress, [0, 1], [0, -40]);

  /** Mega-title clip reveal — drives the line-mask sweep on enter. */
  const titleClip = useTransform(
    scrollYProgress,
    [0, 0.08, 0.18],
    ["inset(0 100% 0 0)", "inset(0 100% 0 0)", "inset(0 0% 0 0)"],
  );

  /** Counter string (current front card index) — driven by scrollYProgress. */
  const counterStr = useTransform(
    scrollYProgress,
    (p) => SPIRAL[frontCardIdx(p)].index,
  );

  /**
   * Title opacity — recedes when cards pass through center (p=0.3..0.7),
   * returns to full prominence at start/end. Critique C2 §Top-2 #2:
   * "the massive headline competes with the 3D card cluster — apply
   * subtle opacity offset so it recedes into atmospheric background when
   * cards pass through the center focal plane, then returns when spiral
   * clears (p > 0.8)".
   */
  const titleOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.45, 0.55, 0.8, 1],
    [1, 0.95, 0.32, 0.32, 0.95, 1],
  );

  // ── reduced-motion / mobile: vertical list variant ──────────────────────
  if (reduced) {
    return <SpiralServicesList />;
  }

  return (
    <section
      ref={ref}
      className={`sp-st ${unbounded.variable} ${golos.variable}`}
      aria-labelledby="spiral-services-title"
    >
      <div className="sp-st__sticky">
        {/* ambient spotlight behind the helix (pulsing warm glow) */}
        <div className="sp-st__spotlight" aria-hidden="true" />
        {/* perspective-warped ground plane grid for cinematic depth */}
        <div className="sp-st__ground" aria-hidden="true" />
        {/* subtle film grain */}
        <div className="sp-st__grain" aria-hidden="true" />

        {/* header */}
        <header className="sp-st__header">
          <motion.span className="sp-st__eyebrow" style={{ x: eyebrowX }}>
            {"// УСЛУГИ — SPIRALSCROLL"}
          </motion.span>
          <motion.h2
            id="spiral-services-title"
            className="sp-st__title-mega"
            style={{ opacity: titleOpacity }}
          >
            <span className="sp-st__title-line">
              <motion.span
                className="sp-st__title-inner"
                style={{ clipPath: titleClip }}
              >
                Спираль
              </motion.span>
            </span>
            <span className="sp-st__title-line">
              <motion.span
                className="sp-st__title-inner"
                style={{ clipPath: titleClip }}
              >
                услуг
              </motion.span>
            </span>
          </motion.h2>
          <p className="sp-st__subtitle">
            12 форматов кейтеринга — от кофе-брейка до свадьбы. Прокрутите,
            чтобы пройти спираль до конца.
          </p>
        </header>

        {/* Active card HUD */}
        <ActiveCardHud scrollYProgress={scrollYProgress} />

        {/* 3D stage */}
        <div className="sp-st__stage">
          <div className="sp-st__perspective">
            <motion.div
              className="sp-st__helix"
              style={{ rotateY, y: translateY }}
            >
              {SPIRAL.map((item, i) => (
                <SpiralCard
                  key={item.id}
                  item={item}
                  i={i}
                  scrollYProgress={scrollYProgress}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* footer */}
        <footer className="sp-st__footer">
          <div className="sp-st__counter">
            <span className="sp-st__counter-cur">
              <motion.span>{counterStr}</motion.span>
            </span>
            <span className="sp-st__counter-sep">/</span>
            <span className="sp-st__counter-tot">
              {String(N).padStart(2, "0")}
            </span>
          </div>
          <Link href="#contact" className="sp-st__cta-mega">
            <span>Обсудить событие</span>
            <ArrowUpRight strokeWidth={1.6} />
          </Link>
        </footer>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- list fallback --- */

/**
 * SpiralServicesList — vertical list variant. Used for:
 *   - `prefers-reduced-motion` (no transforms, no 3D)
 *   - mobile (≤820px) via CSS — same component, different layout
 *
 * Same content, same heading, same CTAs. The list IS the a11y fallback.
 * Each row is a real <a href> (keyboard, middle-click, SEO).
 */
function SpiralServicesList() {
  return (
    <section
      className={`sp-st sp-st--list ${unbounded.variable} ${golos.variable}`}
      aria-labelledby="spiral-services-title"
    >
      <div className="sp-st__list-container">
        <header className="sp-st__header sp-st__header--list">
          <span className="sp-st__eyebrow">{"// УСЛУГИ"}</span>
          <h2 id="spiral-services-title" className="sp-st__title-mega">
            <span className="sp-st__title-line">Спираль</span>
            <span className="sp-st__title-line">услуг</span>
          </h2>
          <p className="sp-st__subtitle">
            12 форматов кейтеринга — от кофе-брейка до свадьбы.
          </p>
        </header>

        <ul className="sp-st__list" role="list">
          {SPIRAL.map((item) => (
            <li key={item.id} className="sp-st__list-row">
              <Link
                href={item.ctaHref}
                className="sp-st__list-link"
                aria-label={`${item.title} — ${item.ctaLabel}`}
              >
                <span className="sp-st__list-index">{item.index}</span>
                <div className="sp-st__list-media">
                  <SmartImage
                    src={item.media}
                    alt={item.mediaAlt}
                    width={400}
                    height={300}
                    sizes="160px"
                    className="sp-st__list-img"
                  />
                </div>
                <div className="sp-st__list-body">
                  <div className="sp-st__list-head">
                    <h3 className="sp-st__list-title">{item.title}</h3>
                    <span className="sp-st__list-tag">{item.tag}</span>
                  </div>
                  <p className="sp-st__list-hook">{item.hook}</p>
                  <div className="sp-st__list-foot">
                    <span className="sp-st__list-price">{item.price}</span>
                    <span className="sp-st__list-cta">
                      {item.ctaLabel}
                      <ArrowUpRight strokeWidth={1.6} />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <footer className="sp-st__footer sp-st__footer--list">
          <span className="sp-st__counter-tot">
            {String(N).padStart(2, "0")} услуг · 6 категорий
          </span>
          <Link href="#contact" className="sp-st__cta-mega">
            <span>Обсудить событие</span>
            <ArrowUpRight strokeWidth={1.6} />
          </Link>
        </footer>
      </div>
    </section>
  );
}
