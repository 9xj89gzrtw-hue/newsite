"use client";

/**
 * SpiralServices — «Спираль» v7 (reverse-engineered from activetheory.net).
 * ---------------------------------------------------------------------------
 *
 * USER FEEDBACK (cycle 47): "двигаются не в ту сторону; не видно что это
 * спираль, карточки исчезают вдалеке; вообще не похоже на тот сайт;
 * на мобильном криво. Запускай критиков и исправляй прежде чем показывать."
 *
 * FIX = exact recipe extracted from AT's production bundle (app.js):
 *
 *   WorkItems.positionViews():
 *     step  = 50° desktop / 35° mobile
 *     yStep = 0.12·min(7,count)   (≈0.22·R — tight corkscrew)
 *     card i: x = R·cos(θ), z = R·sin(θ), y = y₀ − yStep·i,
 *             θ -= step per card, cards lookAt(2×position) → face OUTWARD
 *     camera target i: at 2×card position (OUTSIDE the cylinder),
 *             quaternion = card's → camera looks INWARD through the card
 *     camera lerps between targets with scrollProgress
 *     camera y: −= smoothStep(0,.15,p)  += smoothStep(1,.85,p)  (dip/rise)
 *
 * THE THREE FUNDAMENTAL FIXES vs v6:
 *   1. DIRECTION: camera DESCENDS the helix as you scroll → new cards
 *      enter from BOTTOM-RIGHT depth, old exit TOP-LEFT (was inverted).
 *      CSS Y is down, so cards sit at +i·pitch and the world follows the
 *      inverse camera transform W = Tz(k)·Rx·Ry(−θc)·T(−C).
 *   2. NOTHING DISAPPEARS: camera is OUTSIDE the cylinder looking in —
 *      the whole coil stays in front of the camera, receding into depth
 *      behind the front card. No vertical fade, no hard opacity floor.
 *      Cards only ever leave via the screen edges, like AT.
 *   3. AT GEOMETRY: 50° steps (35° mobile), pitch 0.22·R-ish tight coil,
 *      front card pushed to z' = +0.12R (k = 1.12R) so it renders ~natural
 *      size while far-side cards shrink to ~52% — real depth, mild cues.
 *
 * Engine: ONE rAF loop owns everything; smoothed scroll progress p;
 * intro sweep-in; mouse parallax; HUD counter = round(p·(N−1)).
 */

import { useEffect, useRef, useState } from "react";
import "./spiral-services.css";

/* -------------------------------------------------------------- content --- */

interface SpiralItem {
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
}

const SERVICES: SpiralItem[] = [
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

/* ------------------------------------------------------------ helix math --- */
/* AT recipe: step 50°/35°, tight pitch, camera outside at 2R looking in. */

const N = SERVICES.length; // 12 cards
const TOTAL_LABEL = String(N).padStart(2, "0");
const FINE_POINTER = "(pointer: fine)";
const LIST_MODE = "(prefers-reduced-motion: reduce)";
const MOBILE_W = 820;
const DOT_SUBS = 8; // trail dots per card step
const DOT_COUNT = (N - 1) * DOT_SUBS + 1; // 89
const INTRO_MS = 1600;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const fract = (v: number) => v - Math.floor(v);
// deterministic pseudo-random (SSR-safe)
const seed = (n: number) => fract(Math.sin(n * 12.9898) * 43758.5453);

const PARTICLES = Array.from({ length: 22 }, (_, i) => {
  const r1 = seed(i * 3 + 1);
  const r2 = seed(i * 3 + 2);
  const r3 = seed(i * 3 + 3);
  const r4 = seed(i * 7 + 11);
  const r5 = seed(i * 13 + 5);
  return {
    x: 4 + r1 * 92,
    y: 8 + r2 * 84,
    s: 2 + Math.round(r3 * 2.5),
    dx: Math.round((r4 - 0.5) * 130),
    dy: Math.round((r5 - 0.5) * 100),
    dur: 16 + r1 * 20,
    delay: r2 * 22,
    op: 0.2 + r3 * 0.35,
  };
});

/* -------------------------------------------------------------- component --- */

export function SpiralServices() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const megaRef = useRef<HTMLSpanElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const nameRef = useRef<HTMLSpanElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLSpanElement | null>(null);
  const tickRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [isMotion, setIsMotion] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia(LIST_MODE);
    const update = () => setIsMotion(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Reveal-on-scroll for the reduced-motion list variant.
  useEffect(() => {
    if (isMotion) return;
    const list = sectionRef.current?.querySelector(".sp-list");
    if (!list) return;
    const items = Array.from(list.querySelectorAll(".sp-lcard"));
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isMotion]);

  /* ------------------------------------------------- the one rAF engine --- */
  useEffect(() => {
    if (!isMotion) return;
    // Guard against the stale-true first render for reduced-motion users
    // (prevents engine mount→teardown flash before the mq state lands).
    if (window.matchMedia(LIST_MODE).matches) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const world = worldRef.current;
    if (!section || !stage || !world) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLAnchorElement[];
    const fronts = cards
      .map((c) => c.querySelector<HTMLElement>(".sp-card__inner"))
      .filter(Boolean) as HTMLElement[];
    const backs = cards
      .map((c) => c.querySelector<HTMLElement>(".sp-card__back"))
      .filter(Boolean) as HTMLElement[];
    const dots = dotRefs.current.filter(Boolean) as HTMLSpanElement[];
    const ticks = tickRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (cards.length !== N || fronts.length !== N || backs.length !== N)
      return;

    let raf = 0;
    let inView = true;
    let armed = false; // first IntersectionObserver callback received
    let firstFrame = true;
    let last = performance.now();
    let p = 0;
    let pT = 0;
    let vh = window.innerHeight;
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    let R = 400; // helix radius, px
    let pitch = 170; // vertical step between cards, px
    let step = 50; // degrees between cards
    let camR = 800; // camera orbit radius = 2R
    let k = 450; // screen-space push: front card to z' = k − R
    let maxBlur = 4.5;
    let mx = 0;
    let my = 0;
    let smx = 0;
    let smy = 0;
    let lastIdx = -1;
    let introT0 = -1;
    // per-card write cache (quantized) — skip unchanged style writes
    const lastFilt: string[] = new Array(N).fill("");
    const lastOp: number[] = new Array(N).fill(-1);
    const backShown: boolean[] = new Array(N).fill(false);

    /* layout(): AT geometry. Section height is DERIVED from pitch so CSS
       and JS can never drift. Camera = inverse transform of an orbiting
       viewer at 2R that looks inward through the front card. */
    const layout = () => {
      vh = window.innerHeight;
      const w = window.innerWidth;
      const mob = w <= MOBILE_W;
      // short-landscape phones (e.g. 844×390): desktop width but phone height
      const short = vh <= 520;
      if (mob || short) {
        R = Math.max(190, Math.min(310, w * (short ? 0.4 : 0.52)));
        pitch = R * 0.5;
        step = 30;
        k = R;
        maxBlur = 3.5;
      } else {
        R = Math.max(330, Math.min(470, w * 0.3));
        pitch = R * 0.34;
        step = 40;
        k = R;
        maxBlur = 6;
      }
      camR = R * 2;
      // FOV calibration: P≈1.7R ≈ 92° horizontal — wide like AT but not
      // fisheye; neighbours at 40° stay ~2/3 width, far side ~half,
      // giving the tunnel falloff without crushing cards into slivers
      stage.style.perspective = `${(mob || short ? R * 1.9 : R * 1.7).toFixed(0)}px`;
      // stage height from the SAME viewport model as the runway math —
      // avoids the iOS large-vh vs innerHeight split (critic 2.1)
      stage.style.height = `${vh}px`;
      // runway: one viewport + full camera descent + small lead in/out
      section.style.height = `${(
        vh + (N - 1) * pitch + vh * 0.22
      ).toFixed(0)}px`;

      cards.forEach((card, i) => {
        card.style.transform =
          `translate(-50%, -50%) ` +
          `rotateY(${(i * step).toFixed(3)}deg) ` +
          `translateZ(${R.toFixed(1)}px) ` +
          `translateY(${(i * pitch).toFixed(1)}px)`;
      });
      dots.forEach((dot, j) => {
        const f = j / DOT_SUBS;
        dot.style.transform =
          `translate(-50%, -50%) ` +
          `rotateY(${(f * step).toFixed(3)}deg) ` +
          `translateZ(${(R * 0.92).toFixed(1)}px) ` +
          `translateY(${(f * pitch).toFixed(1)}px)`;
      });
    };

    const onMouse = (e: MouseEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Re-schedule only while visible — the loop pauses off-screen and
      // is restarted from the IntersectionObserver (critic 3.3).
      if (inView) raf = requestAnimationFrame(frame);
      else {
        raf = 0;
        return;
      }
      // Suppress the first frame until the observer has armed the intro
      // state — prevents the assembled→vanish flash on #services loads.
      if (!armed) return;

      const rect = section.getBoundingClientRect();
      const total = rect.height - vh;
      if (total <= 0) return;
      pT = clamp01(-rect.top / total);
      if (firstFrame) {
        p = pT;
        firstFrame = false;
      }
      p += (pT - p) * (1 - Math.exp(-dt * 11));

      smx += (mx - smx) * (1 - Math.exp(-dt * 5));
      smy += (my - smy) * (1 - Math.exp(-dt * 5));

      let introE = 1;
      if (introT0 >= 0) {
        introE = easeOutCubic(clamp01((now - introT0) / INTRO_MS));
        if (introE >= 1) introT0 = -2;
      }

      /* camera path (AT): orbit angle + descent, both linear in p,
         plus the smoothStep dip/rise at the ends, plus intro sweep. */
      const descent = (N - 1) * pitch;
      const thC =
        step * (N - 1) * p - (1 - introE) * 42;
      const dip = R * 0.12 * (smooth(0, 0.15, p) - smooth(0.85, 1, p));
      const yC =
        descent * p + dip - (1 - introE) * vh * 0.5;

      const cx = camR * Math.sin((thC * Math.PI) / 180);
      const cz = camR * Math.cos((thC * Math.PI) / 180);

      /* world = inverse camera: push to screen (k), camera tilt (mouse),
         camera yaw (−θc), camera translation (−C). */
      const tilt = 3 + smy * 2.2;
      world.style.transform =
        `translate3d(0, 0, ${k.toFixed(1)}px) ` +
        `rotateX(${(-tilt).toFixed(3)}deg) ` +
        `rotateY(${(-thC + smx * 2.4).toFixed(3)}deg) ` +
        `translate3d(${(-cx).toFixed(1)}px, ${(-yC).toFixed(1)}px, ${(
          -cz
        ).toFixed(1)}px)`;

      /* depth cues — MINIMAL (AT-style): perspective scale IS the depth;
         dimming stays subtle so the whole coil reads on the dark stage.
         Writes are quantized and cached — skip unchanged cards (3.2). */
      for (let i = 0; i < N; i++) {
        const d = ((i * step - thC) * Math.PI) / 180;
        const f = Math.cos(d); // 1 front … −1 far side
        const nf = Math.max(0, f);
        const op = Math.round((0.8 + 0.2 * Math.pow(nf, 1.1)) * introE * 200) / 200;
        const blur = Math.round(Math.min(1.75, Math.pow(1 - nf, 1.3) * 1.9) * 4) / 4;
        const br = Math.round((0.88 + 0.12 * nf) * 100) / 100;
        const sat = Math.round((0.85 + 0.15 * nf) * 100) / 100;
        if (op !== lastOp[i] || blur > 0 || f > 0.9) {
          const filt =
            blur <= 0.01
              ? `brightness(${br}) saturate(${sat})`
              : `blur(${blur.toFixed(2)}px) brightness(${br}) saturate(${sat})`;
          if (filt !== lastFilt[i]) {
            fronts[i].style.filter = filt;
            lastFilt[i] = filt;
          }
          fronts[i].style.opacity = op.toFixed(3);
          lastOp[i] = op;
        }
        // back slabs are only visible when the card is on the far side —
        // write their styles then, and clear once when it comes around.
        const showBack = f < 0.1;
        if (showBack || backShown[i]) {
          backs[i].style.opacity = op.toFixed(3);
          backs[i].style.filter = lastFilt[i];
          backShown[i] = showBack;
        }
      }

      const bestI = Math.max(0, Math.min(N - 1, Math.round(p * (N - 1))));
      if (bestI !== lastIdx) {
        lastIdx = bestI;
        cards.forEach((c, i) => {
          c.classList.toggle("is-front", i === bestI);
          // only the front card joins the tab order (critic 4.1)
          c.tabIndex = i === bestI ? 0 : -1;
        });
        ticks.forEach((t, i) => t.classList.toggle("is-on", i === bestI));
        if (counterRef.current) {
          counterRef.current.textContent = SERVICES[bestI].index;
          counterRef.current.animate(
            [
              { transform: "scale(1)" },
              { transform: "scale(1.06)", offset: 0.4 },
              { transform: "scale(1)" },
            ],
            { duration: 420, easing: "ease-out" }
          );
        }
        if (nameRef.current) nameRef.current.textContent = SERVICES[bestI].title;
      }
      if (barRef.current)
        barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      if (hintRef.current)
        hintRef.current.style.opacity = clamp01(1 - pT * 18).toFixed(2);
      // mega title fades out as the spiral takes over (AT scroll text)
      if (megaRef.current) {
        const mOp = clamp01(1 - smooth(0.06, 0.24, p));
        megaRef.current.style.opacity = mOp.toFixed(3);
        megaRef.current.style.transform = `translate3d(0, ${(
          -p *
          vh *
          0.08
        ).toFixed(1)}px, 0)`;
      }
    };

    layout();
    section.classList.add("is-live");

    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries[0]?.isIntersecting ?? true;
        inView = vis;
        if (!armed) {
          armed = true;
          const r = section.getBoundingClientRect();
          const t = r.height - window.innerHeight;
          const p0 = t > 0 ? clamp01(-r.top / t) : 0;
          introT0 = p0 < 0.06 ? performance.now() : -2;
        }
        // pause/resume the rAF loop at the visibility boundary (3.3)
        if (vis && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        } else if (!vis && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "25% 0px" }
    );
    io.observe(section);

    let resizeRaf = 0;
    const onResize = () => {
      // Dead-band: only relayout on real size changes — mobile URL-bar
      // collapses (small height deltas) must not re-derive the runway
      // mid-scroll (critic 2.1/2.2).
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (Math.abs(w - lastW) < 1 && Math.abs(h - lastH) < 150) return;
      lastW = w;
      lastH = h;
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        layout();
        firstFrame = true; // re-sync p to the new geometry (2.4)
      });
    };

    const fine = window.matchMedia(FINE_POINTER).matches;
    if (fine) window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      if (fine) window.removeEventListener("mousemove", onMouse);
      section.classList.remove("is-live");
      section.style.height = "";
      stage.style.perspective = "";
      stage.style.height = "";
      world.style.transform = "";
      cards.forEach((c) => {
        c.style.transform = "";
        c.classList.remove("is-front");
        c.tabIndex = 0;
      });
      dots.forEach((d) => (d.style.transform = ""));
      fronts.forEach((el) => {
        el.style.opacity = "";
        el.style.filter = "";
      });
      backs.forEach((el) => {
        el.style.opacity = "";
        el.style.filter = "";
      });
    };
  }, [isMotion]);

  /* ------------------------------------------------------------- markup --- */

  const cardLabel = (s: SpiralItem) =>
    `${s.title}. ${s.price} за услугу. ${s.ctaLabel}`;

  return (
    <section
      ref={sectionRef}
      id="services"
      className="sp"
      aria-labelledby="sp-title"
    >
      {/* ── 3D stage (desktop AND mobile; reduced-motion falls back) ── */}
      <div ref={stageRef} className="sp__stage">
        <div className="sp__spot" aria-hidden="true" />
        <div className="sp__grain" aria-hidden="true" />

        <div className="sp__dust" aria-hidden="true">
          {PARTICLES.map((pt, i) => (
            <span
              key={i}
              className="sp__p"
              style={
                {
                  left: `${pt.x}%`,
                  top: `${pt.y}%`,
                  width: `${pt.s}px`,
                  height: `${pt.s}px`,
                  "--dx": `${pt.dx}px`,
                  "--dy": `${pt.dy}px`,
                  "--po": pt.op,
                  animationDuration: `${pt.dur}s`,
                  animationDelay: `${-pt.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <p className="sp__eyebrow" aria-hidden="true">
          <span className="sp__eyebrow-num">02</span>
          <span className="sp__eyebrow-line" />
          <span>Форматы мероприятий</span>
        </p>
        <h2 id="sp-title" className="sp__mega">
          <span ref={megaRef} className="sp__mega-word">
            Услуги
          </span>
        </h2>

        {/* the helix: dotted trail + cards (camera orbits outside at 2R) */}
        <div ref={worldRef} className="sp__world">
          {Array.from({ length: DOT_COUNT }).map((_, j) => (
            <span
              key={`dot-${j}`}
              ref={(el) => {
                dotRefs.current[j] = el;
              }}
              className={
                j % DOT_SUBS === 0 ? "sp__dot sp__dot--node" : "sp__dot"
              }
              aria-hidden="true"
            />
          ))}
          {SERVICES.map((s, i) => (
            <a
              key={s.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="sp-card"
              href={s.ctaHref}
              aria-label={cardLabel(s)}
            >
              <div className="sp-card__inner">
                <div className="sp-card__float">
                  <div className="sp-card__media">
                    <img
                      className="sp-card__img"
                      src={s.media}
                      alt={s.mediaAlt}
                      loading={i < 3 ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <span className="sp-card__tag">{s.tag}</span>
                  </div>
                  <div className="sp-card__body">
                    <div className="sp-card__row">
                      <span className="sp-card__index">{s.index}</span>
                      <span className="sp-card__rule" aria-hidden="true" />
                    </div>
                    <h3 className="sp-card__title">{s.title}</h3>
                    <p className="sp-card__hook">{s.hook}</p>
                    <div className="sp-card__foot">
                      <span className="sp-card__price">{s.price}</span>
                      <span className="sp-card__cta">
                        {s.ctaLabel}
                        <svg
                          viewBox="0 0 16 16"
                          width="12"
                          height="12"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 8h11M9 4l4 4-4 4"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* back slab — what the camera sees when the card is on the
                  far side of the cylinder (faces outward = away from us) */}
              <div className="sp-card__back" aria-hidden="true">
                <span className="sp-card__back-num">{s.index}</span>
                <span className="sp-card__back-brand">Interfood</span>
              </div>
            </a>
          ))}
        </div>

        <div className="sp__vignette" aria-hidden="true" />

        <div className="sp__ticks" aria-hidden="true">
          {SERVICES.map((s, i) => (
            <span
              key={s.id}
              ref={(el) => {
                tickRefs.current[i] = el;
              }}
              className={i === 0 ? "sp__tick is-on" : "sp__tick"}
            />
          ))}
        </div>

        <div className="sp__hud" aria-hidden="true">
          <div className="sp__hud-left">
            <div className="sp__counter">
              <span ref={counterRef} className="sp__counter-cur">
                01
              </span>
              <span className="sp__counter-sep">/</span>
              <span className="sp__counter-total">{TOTAL_LABEL}</span>
            </div>
            <span ref={nameRef} className="sp__hud-name">
              {SERVICES[0].title}
            </span>
          </div>
          <div className="sp__hud-right">
            <span ref={hintRef} className="sp__hint">
              Листайте вниз
              <span className="sp__hint-dot" />
            </span>
            <div className="sp__track">
              <div ref={barRef} className="sp__bar" />
            </div>
          </div>
        </div>
      </div>

      {/* ── list variant (reduced motion only) ── */}
      <div className="sp-list">
        <div className="sp-list__head">
          <p className="sp__eyebrow sp-list__eyebrow">
            <span className="sp__eyebrow-num">02</span>
            <span className="sp__eyebrow-line" />
            <span>Форматы мероприятий</span>
          </p>
          <h2 className="sp-list__title">Услуги</h2>
          <p className="sp-list__sub">
            Двенадцать форматов — от кофе-брейка до свадьбы под ключ.
          </p>
        </div>
        <div className="sp-list__grid">
          {SERVICES.map((s) => (
            <a key={s.id} className="sp-lcard" href={s.ctaHref}>
              <div className="sp-lcard__media">
                <img
                  src={s.media}
                  alt={s.mediaAlt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="sp-lcard__body">
                <span className="sp-lcard__index">{s.index}</span>
                <h3 className="sp-lcard__title">{s.title}</h3>
                <p className="sp-lcard__hook">{s.hook}</p>
                <div className="sp-lcard__foot">
                  <span className="sp-lcard__price">{s.price}</span>
                  <span className="sp-lcard__cta">{s.ctaLabel} →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
