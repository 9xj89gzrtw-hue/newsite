"use client";

/**
 * SpiralServices — «Спираль» v5 (full rewrite).
 * ---------------------------------------------------------------------------
 *
 * WHY THE REWRITE: v2–v4 (Cycle 45) rendered broken — cards scattered,
 * text skewed unreadable, transform conflicts between Framer Motion and
 * CSS. Root causes: (1) Framer `useTransform` writing `transform` on the
 * same elements that also carried static CSS 3D transforms, (2) helix
 * math mixing cos/sin placement with a separate rotateY phase, (3) 988
 * lines of CSS fighting itself. This version is a clean-room rewrite.
 *
 * ARCHITECTURE (bulletproof by construction):
 *   - ONE rAF loop owns ALL animation. It reads scroll once per frame
 *     (`getBoundingClientRect` on the section — no offsetTop walking),
 *     lerps progress for buttery trailing motion, and writes:
 *       • `transform` on the single `.sp__world` group,
 *       • `opacity` + `filter` on each card's INNER wrapper (depth cues).
 *     No Framer Motion. No CSS transitions on 3D elements. No conflicts.
 *   - Cards are positioned ONCE per layout on the classic 3D-carousel
 *     chain: `translate(-50%,-50%) rotateY(θi) translateZ(R) translateY(yi)`
 *     which places card i on a vertical helix of radius R, facing outward,
 *     at height −i·pitch (the helix ascends; the world descends on scroll,
 *     so the spiral visually MOVES DOWN past the camera — per user brief).
 *   - Group transform per frame: `translate3d(0, ty, 0) rotateY(rot)` where
 *     ty = p·(N−1)·pitch and rot = −p·(N−1)·Δθ. Card i is dead-center
 *     facing the camera exactly when p = i/(N−1) — perfect sync of
 *     descent + rotation. This is the activetheory.net archetype.
 *   - Depth cues per frame from world angle α = θi + rot:
 *       frontness f = cos α  →  opacity, blur, brightness, saturate.
 *     Cards on the back of the cylinder dim to ~4% (ghost spiral receding
 *     into the dark — AT's signature), the front card is tack sharp.
 *   - Real z-buffering: `transform-style: preserve-3d` on the world; the
 *     group carries NO overflow/filter/opacity (flattening hazards), those
 *     live on inner wrappers only.
 *   - Mouse parallax (±1.5°) on pointer:fine devices — subtle life.
 *   - HUD: mono-style counter `01 / 12` + active service name + progress
 *     bar, updated only on index change (no layout thrash).
 *   - Mobile ≤820px / prefers-reduced-motion: CSS swaps the 3D stage for
 *     a clean editorial list (IO-revealed). No JS branching → no hydration
 *     mismatch.
 *
 * CONTENT: 12 services — validated copy, prices, media, CTAs (unchanged).
 * A11Y: <section aria-labelledby>; cards are real <a> links; HUD duplicated
 * info is aria-hidden; images carry alt text.
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
const TURNS = 2; // helix windings across the whole scroll range
const STEP_DEG = (TURNS * 360) / N; // 60° between consecutive cards
const TOTAL_ROT = STEP_DEG * (N - 1); // total world rotation, degrees
const FINE_POINTER = "(pointer: fine)";
const LIST_MODE = "(max-width: 820px), (prefers-reduced-motion: reduce)";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* -------------------------------------------------------------- component --- */

export function SpiralServices() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const megaRef = useRef<HTMLSpanElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const nameRef = useRef<HTMLSpanElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLSpanElement | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);

  // Track list/desktop mode so the rAF loop boots only when needed.
  useEffect(() => {
    const mq = window.matchMedia(LIST_MODE);
    const update = () => setIsDesktop(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Reveal-on-scroll for the list variant (mobile / reduced motion).
  useEffect(() => {
    if (isDesktop) return;
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
  }, [isDesktop]);

  /* ------------------------------------------------- the one rAF engine --- */
  useEffect(() => {
    if (!isDesktop) return;
    const section = sectionRef.current;
    const world = worldRef.current;
    if (!section || !world) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLAnchorElement[];
    const inners = cards
      .map((c) => c.firstElementChild as HTMLElement | null)
      .filter(Boolean) as HTMLElement[];
    if (cards.length !== N) return;

    let raf = 0;
    let running = false;
    let inView = true;
    let firstFrame = true;
    let last = performance.now();
    let p = 0; // smoothed progress
    let pT = 0; // target progress
    let vh = window.innerHeight;
    let pitch = 0; // vertical distance between consecutive cards, px
    let radius = 0; // helix radius, px
    let mx = 0;
    let my = 0;
    let smx = 0;
    let smy = 0;
    let lastIdx = -1;

    /* layout(): derive helix geometry from the real rendered section so
       CSS height and JS motion can never drift apart. */
    const layout = () => {
      vh = window.innerHeight;
      const H = section.offsetHeight;
      pitch = Math.max(120, (H - vh) / (N - 1));
      radius = Math.max(300, Math.min(500, window.innerWidth * 0.31));
      cards.forEach((card, i) => {
        card.style.transform =
          `translate(-50%, -50%) ` +
          `rotateY(${(i * STEP_DEG).toFixed(3)}deg) ` +
          `translateZ(${radius.toFixed(1)}px) ` +
          `translateY(${(-i * pitch).toFixed(1)}px)`;
      });
    };

    const onMouse = (e: MouseEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
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

      const rot = -p * TOTAL_ROT;
      const ty = p * (N - 1) * pitch;
      world.style.transform =
        `translate3d(0, ${ty.toFixed(2)}px, 0) ` +
        `rotateX(${(-smy * 1.6).toFixed(3)}deg) ` +
        `rotateY(${(rot + smx * 2.2).toFixed(3)}deg)`;

      const descent = (N - 1) * pitch;
      for (let i = 0; i < N; i++) {
        const alpha = ((i * STEP_DEG + rot) * Math.PI) / 180;
        const f = Math.cos(alpha); // 1 front … −1 back
        const wy = -i * pitch + ty; // card height relative to camera axis
        const vfade = 1 - Math.min(1, Math.abs(wy) / (vh * 0.58));
        // steep falloff: neighbors at 60° drop to ~⅓ brightness/opacity,
        // back-of-cylinder ghosts at ~4% — the AT depth signature
        const fade = f > 0 ? 0.05 + 0.95 * Math.pow(f, 2.4) : 0.04;
        const op = Math.max(0, fade * vfade);
        const blur = Math.max(0, Math.pow(1 - f, 1.4) * 11);
        const br = 0.3 + 0.7 * Math.pow(Math.max(0, f), 1.5);
        const sat = 0.42 + 0.58 * Math.pow(Math.max(0, f), 1.3);
        const el = inners[i];
        el.style.opacity = op.toFixed(3);
        el.style.filter =
          `blur(${blur.toFixed(2)}px) brightness(${br.toFixed(3)}) ` +
          `saturate(${sat.toFixed(3)})`;
      }

      // Active card = the one nearest the camera axis center. Card i sits
      // dead-center exactly at p = i/(N−1), so rounding smoothed progress
      // is unambiguous — unlike angle argmax, which ties after 1+ turns.
      const bestI = Math.max(0, Math.min(N - 1, Math.round(p * (N - 1))));

      if (bestI !== lastIdx) {
        lastIdx = bestI;
        cards.forEach((c, i) => c.classList.toggle("is-front", i === bestI));
        if (counterRef.current)
          counterRef.current.textContent = SERVICES[bestI].index;
        if (nameRef.current)
          nameRef.current.textContent = SERVICES[bestI].title;
      }
      if (barRef.current)
        barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      if (hintRef.current)
        hintRef.current.style.opacity = clamp01(1 - pT * 24).toFixed(2);
      if (megaRef.current)
        megaRef.current.style.transform = `translate3d(0, ${(
          p * descent * 0.1
        ).toFixed(1)}px, 0)`;

      // stop burning cycles when parked at either end
      if (!running && Math.abs(pT - p) < 0.0005 && (pT === 0 || pT === 1)) {
        // still keep the loop for mouse parallax — cheap enough.
      }
    };

    layout();
    section.classList.add("is-live");

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: "40% 0px" }
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
      inners.forEach((el) => {
        el.style.opacity = "";
        el.style.filter = "";
      });
    };
  }, [isDesktop]);

  /* ------------------------------------------------------------- markup --- */

  const cardLabel = (s: SpiralItem) => `${s.title} — ${s.ctaLabel}`;

  return (
    <section
      ref={sectionRef}
      id="services"
      className="sp"
      aria-labelledby="sp-title"
    >
      {/* ── 3D stage (desktop, motion allowed) ── */}
      <div className="sp__stage">
        {/* background scene: spotlight, grain, mega title */}
        <div className="sp__spot" aria-hidden="true" />
        <div className="sp__grain" aria-hidden="true" />
        <div className="sp__vignette" aria-hidden="true" />
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

        {/* the helix */}
        <div ref={worldRef} className="sp__world">
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
            </a>
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

      {/* ── list variant (mobile / reduced motion) ── */}
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
