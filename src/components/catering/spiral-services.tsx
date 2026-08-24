"use client";

/**
 * SpiralServices — «Спираль» v6 (rework per user critique).
 * ---------------------------------------------------------------------------
 *
 * USER FEEDBACK (cycle 46 → 47): "on the reference site the spiral GOES DOWN
 * and you can SEE it's a spiral; here you can't see it, and there were way
 * more effects; mobile doesn't work at all."
 *
 * v6 fixes all three:
 *
 * 1) THE SPIRAL MUST BE VISIBLE.
 *    - Back cards no longer fade to 4% — floor is ~12–16% with blur: the
 *      corkscrew SHAPE is readable at every scroll position.
 *    - Camera TILTS DOWN (world rotateX ≈ +12°): we look INTO the spiral
 *      from slightly above, seeing the helix descend below the front card —
 *      the "spiral moves down" reads instantly.
 *    - A luminous DOTTED TRAIL traces the helix path (two tracks: outer at
 *      1.16·R, inner at 0.68·R) winding between the cards.
 *    - An axis light column marks the vertical axis the spiral spins around.
 *
 * 2) MORE EFFECTS.
 *    - Giant ghost counter (01→12) stroked behind the cards, pulsing on
 *      every change; mega serif «Услуги» reveals top-center on entry.
 *    - Intro spin-in: on first view the helix rotates +46° and rises from
 *      below while fading in (skipped if reloaded mid-section).
 *    - Ambient gold-dust particles (24, deterministic seed — SSR-safe).
 *    - Vertical ticks rail (12 ticks) on the right; active tick glows red.
 *    - Cards breathe (slow per-card float); front card has red rim light;
 *      counter bumps on change; mouse parallax on desktop.
 *
 * 3) MOBILE GETS THE REAL 3D SPIRAL.
 *    - No more list fallback on small screens (list only for
 *      prefers-reduced-motion). Responsive geometry: fewer turns (1.2),
 *      tighter radius (≤0.6·vw·), capped blur (5px) for mobile GPUs.
 *
 * Engine unchanged in spirit: ONE rAF loop owns everything; cards sit on
 * the classic carousel chain rotateY(θi)·translateZ(R)·translateY(−i·pitch);
 * the group descends + rotates so card i is front-center exactly at
 * p = i/(N−1). Active index = round(p·(N−1)) (position-based, no ties).
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

const N = SERVICES.length; // 12 cards
const FINE_POINTER = "(pointer: fine)";
const LIST_MODE = "(prefers-reduced-motion: reduce)";
const MOBILE_W = 820;
const DOT_SUBS = 6; // trail dots per card step
const DOT_COUNT = (N - 1) * DOT_SUBS + 1; // 67
const TURNS_DESKTOP = 1.6; // neighbours 48° apart — bright enough to read
const TURNS_MOBILE = 1.3; // tighter spiral so neighbours stay on-screen
const INTRO_MS = 1500;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const fract = (v: number) => v - Math.floor(v);
// deterministic pseudo-random (same on SSR + client — no hydration mismatch)
const seed = (n: number) => fract(Math.sin(n * 12.9898) * 43758.5453);

/* ambient gold-dust particles — module-level constant, SSR-safe */
const PARTICLES = Array.from({ length: 24 }, (_, i) => {
  const r1 = seed(i * 3 + 1);
  const r2 = seed(i * 3 + 2);
  const r3 = seed(i * 3 + 3);
  const r4 = seed(i * 7 + 11);
  const r5 = seed(i * 13 + 5);
  return {
    x: 4 + r1 * 92, // left %
    y: 8 + r2 * 84, // top %
    s: 2 + Math.round(r3 * 2.5), // px
    dx: Math.round((r4 - 0.5) * 130), // drift x
    dy: Math.round((r5 - 0.5) * 100), // drift y
    dur: 16 + r1 * 20, // s
    delay: r2 * 22, // s
    op: 0.22 + r3 * 0.4,
  };
});

/* -------------------------------------------------------------- component --- */

export function SpiralServices() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const megaRef = useRef<HTMLSpanElement | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const nameRef = useRef<HTMLSpanElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLSpanElement | null>(null);
  const tickRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [isMotion, setIsMotion] = useState(true);

  // 3D stage for everyone except reduced-motion users (mobile included).
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
    const section = sectionRef.current;
    const world = worldRef.current;
    if (!section || !world) return;

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
    let firstFrame = true;
    let last = performance.now();
    let p = 0; // smoothed progress
    let pT = 0; // target progress
    let vh = window.innerHeight;
    let pitch = 0; // vertical distance between consecutive cards, px
    let radius = 0; // helix radius, px
    let stepDeg = 0; // degrees between consecutive cards
    let totalRot = 0; // total world rotation across the scroll range
    let worldScale = 1; // camera pull-back: shrinks the helix so MORE
    // cards fit on screen at once (spiral stays readable)
    let mx = 0;
    let my = 0;
    let smx = 0;
    let smy = 0;
    let lastIdx = -1;
    let introT0 = -1; // -1 pending, >=0 running, -2 done/skipped

    /* layout(): derive helix geometry from the real rendered section so
       CSS height and JS motion can never drift apart. */
    const layout = () => {
      vh = window.innerHeight;
      const mob = window.innerWidth <= MOBILE_W;
      const H = section.offsetHeight;
      pitch = Math.max(120, (H - vh) / (N - 1));
      radius = mob
        ? Math.max(210, Math.min(340, window.innerWidth * 0.6))
        : Math.max(280, Math.min(430, window.innerWidth * 0.27));
      worldScale = mob ? 0.92 : 0.84;
      const turns = mob ? TURNS_MOBILE : TURNS_DESKTOP;
      stepDeg = (turns * 360) / N;
      totalRot = stepDeg * (N - 1);

      cards.forEach((card, i) => {
        card.style.transform =
          `translate(-50%, -50%) ` +
          `rotateY(${(i * stepDeg).toFixed(3)}deg) ` +
          `translateZ(${radius.toFixed(1)}px) ` +
          `translateY(${(-i * pitch).toFixed(1)}px)`;
      });
      // dotted trail tracing the helix: outer ring outside the cards,
      // inner ring inside — together they read as a tunnel/corkscrew.
      dots.forEach((dot, j) => {
        const k = j / DOT_SUBS;
        const ang = k * stepDeg;
        const outer = j % 2 === 0;
        const r = outer ? radius * 1.16 : radius * 0.68;
        dot.classList.toggle("sp__dot--outer", outer);
        dot.classList.toggle("sp__dot--inner", !outer);
        dot.style.transform =
          `translate(-50%, -50%) ` +
          `rotateY(${ang.toFixed(3)}deg) ` +
          `translateZ(${r.toFixed(1)}px) ` +
          `translateY(${(-k * pitch).toFixed(1)}px)`;
      });
    };

    const onMouse = (e: MouseEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };

    const pulse = (el: HTMLElement) => {
      el.animate(
        [
          { opacity: 0.25, transform: "translate(-50%, -50%) scale(1.05)" },
          { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
        ],
        { duration: 700, easing: "cubic-bezier(.2,.7,.2,1)" }
      );
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!inView) return;

      const rect = section.getBoundingClientRect();
      const total = rect.height - vh;
      if (total <= 0) return;
      pT = clamp01(-rect.top / total);
      if (firstFrame) {
        // never animate from 0 when the page loads mid-section
        p = pT;
        firstFrame = false;
      }
      p += (pT - p) * (1 - Math.exp(-dt * 7.5));

      smx += (mx - smx) * (1 - Math.exp(-dt * 5));
      smy += (my - smy) * (1 - Math.exp(-dt * 5));

      // intro spin-in (first time the section becomes visible near its top)
      let introE = 1;
      if (introT0 >= 0) {
        introE = easeOutCubic(clamp01((now - introT0) / INTRO_MS));
        if (introE >= 1) introT0 = -2;
      }

      const mob = window.innerWidth <= MOBILE_W;
      const rot = -p * totalRot + (1 - introE) * 46;
      const ty = p * (N - 1) * pitch + (1 - introE) * vh * 0.55;
      // camera looks INTO the spiral from slightly above (base tilt +12°);
      // worldScale pulls the camera back so several cards are visible at once
      world.style.transform =
        `scale3d(${worldScale.toFixed(3)}, ${worldScale.toFixed(3)}, ${worldScale.toFixed(3)}) ` +
        `translate3d(0, ${ty.toFixed(2)}px, 0) ` +
        `rotateX(${(12 + smy * 2.4).toFixed(3)}deg) ` +
        `rotateY(${(rot + smx * 2.6).toFixed(3)}deg)`;

      const descent = (N - 1) * pitch;
      for (let i = 0; i < N; i++) {
        const alpha = ((i * stepDeg + rot) * Math.PI) / 180;
        const f = Math.cos(alpha); // 1 front … −1 back
        const wyEff =
          (-i * pitch + ty) * worldScale; // on-screen height vs camera axis
        // wide visibility band: full within 0.5vh, fades to zero at ~1.35vh
        const vfade = 1 - clamp01((Math.abs(wyEff) - vh * 0.5) / (vh * 0.85));
        // VISIBLE corkscrew: back floor 21%, neighbours ~55–65%, front 100%
        const fade = 0.21 + 0.79 * Math.pow(Math.max(0, f), 1.5);
        const op = Math.max(0, fade * vfade * introE);
        let blur = Math.pow(1 - Math.max(0, f), 1.25) * 7.5;
        if (mob) blur = Math.min(blur, 5);
        const br = 0.5 + 0.5 * Math.pow(Math.max(0, f), 1.3);
        const sat = 0.55 + 0.45 * Math.max(0, f);
        const filt =
          `blur(${blur.toFixed(2)}px) brightness(${br.toFixed(3)}) ` +
          `saturate(${sat.toFixed(3)})`;
        fronts[i].style.opacity = op.toFixed(3);
        fronts[i].style.filter = filt;
        backs[i].style.opacity = op.toFixed(3);
        backs[i].style.filter = filt;
      }

      // Active card = nearest the camera axis center. Card i sits
      // dead-center exactly at p = i/(N−1) — unambiguous by construction.
      const bestI = Math.max(0, Math.min(N - 1, Math.round(p * (N - 1))));

      if (bestI !== lastIdx) {
        lastIdx = bestI;
        cards.forEach((c, i) => c.classList.toggle("is-front", i === bestI));
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
        if (nameRef.current)
          nameRef.current.textContent = SERVICES[bestI].title;
        if (ghostRef.current) {
          ghostRef.current.textContent = SERVICES[bestI].index;
          pulse(ghostRef.current);
        }
      }
      if (barRef.current)
        barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      if (hintRef.current)
        hintRef.current.style.opacity = clamp01(1 - pT * 24).toFixed(2);
      if (megaRef.current)
        megaRef.current.style.transform = `translate3d(0, ${(
          p * descent * 0.06
        ).toFixed(1)}px, 0)`;
    };

    layout();
    section.classList.add("is-live");

    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries[0]?.isIntersecting ?? true;
        inView = vis;
        if (vis && introT0 === -1) {
          // start the intro only when arriving from above the section;
          // a mid-section reload (pT > 0.03) skips straight to the end state
          const r = section.getBoundingClientRect();
          const t = r.height - window.innerHeight;
          const p0 = t > 0 ? clamp01(-r.top / t) : 0;
          introT0 = p0 < 0.03 ? performance.now() : -2;
        }
      },
      { rootMargin: "25% 0px" }
    );
    io.observe(section);

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(layout);
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
      cards.forEach((c) => {
        c.style.transform = "";
        c.classList.remove("is-front");
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

  const cardLabel = (s: SpiralItem) => `${s.title} — ${s.ctaLabel}`;

  return (
    <section
      ref={sectionRef}
      id="services"
      className="sp"
      aria-labelledby="sp-title"
    >
      {/* ── 3D stage (desktop AND mobile; reduced-motion falls back) ── */}
      <div className="sp__stage">
        {/* background scene */}
        <div className="sp__spot" aria-hidden="true" />
        <div className="sp__grain" aria-hidden="true" />

        {/* ambient gold-dust particles */}
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

        {/* axis light column — marks the vertical axis the spiral spins on */}
        <div className="sp__axis" aria-hidden="true" />

        {/* giant ghost counter behind the cards */}
        <div ref={ghostRef} className="sp__ghost" aria-hidden="true">
          01
        </div>

        {/* eyebrow + mega title */}
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

        {/* the helix: cards + dotted trail */}
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
              {/* back slab: what you see when the card is on the far side
                  of the cylinder — a dark panel with the ghost index, so
                  the back half of the helix reads as elegant panels
                  instead of mirrored text */}
              <div className="sp-card__back" aria-hidden="true">
                <span className="sp-card__back-num">{s.index}</span>
                <span className="sp-card__back-brand">Interfood</span>
              </div>
            </a>
          ))}
        </div>

        {/* vignette above cards — edges melt into darkness */}
        <div className="sp__vignette" aria-hidden="true" />

        {/* ticks rail — 12 progress markers */}
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

        {/* HUD — technical readout */}
        <div className="sp__hud" aria-hidden="true">
          <div className="sp__hud-left">
            <div className="sp__counter">
              <span ref={counterRef} className="sp__counter-cur">
                01
              </span>
              <span className="sp__counter-sep">/</span>
              <span className="sp__counter-total">12</span>
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
