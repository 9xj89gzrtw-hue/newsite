"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Preloader — c98-E: БЕЛЫЙ «МУЗЕЙНЫЙ» ВХОД (прямой запрос владельца:
 * «логотип вращается на белом фоне пока идёт загрузка, индикатор загрузки
 * прямо в логотипе»). Замена дверному таймлайну 81-F1 — философию «CSS
 * первым, JS только чистит» сохраняем, но снятие привязано к РЕАЛЬНОЙ
 * готовности (hero-постер), а не к фиксированному таймлайну:
 *
 * • Вращение бейджа (.pre-logo-spin → @keyframes pre-logo-spin 9s linear
 *   infinite, globals.css) — compositor-only transform; элемент сидит в
 *   SSR-HTML, анимация стартует от первого пейнта, НЕ ждёт гидрации —
 *   «логотип уже крутится», пока грузится JS.
 * • Кольцо прогресса — SVG circle pathLength=1 ВОКРУГ бейджа: до гидрации
 *   стоит на статичных 12% (атрибут stroke-dashoffset в SSR-разметке — нет
 *   прыжков); после гидрации JS пишет style.strokeDashoffset через ref —
 *   БЕЗ ре-рендеров (грабля c85 §2: 259 inline-записей на кадр).
 * • Прогресс честный, с потолком 90% до real-ready: DOM parsed → 35%,
 *   hero-постер complete/load → 60%, window load → 90%, готовность к
 *   снятию → 100% (монотонный max, ниже не опускается).
 * • c118 (ТЗ П2 «фризы при первом открытии»): ready — теперь НЕ голый
 *   load hero-постера, а ВСЕ условия первого экрана:
 *   1) шрифты — await document.fonts.ready (типографика устоялась);
 *   2) hero-кадры ЗАГРУЖЕНЫ И ДЕКОДИРОВАНЫ — img.decode() LCP-картинки
 *      #hero img И видимого слоя hero — постера <video> (тот же кадр, webp;
 *      прогрев через createElement(img)+decode() по тому же URL);
 *   3) один полный rAF-цикл (двойной rAF) после готовности — тяжёлые
 *      скрипты верстки отработали, main thread свободен, первый кадр
 *      контента закоммичен → снятие не совпадает с пиковой нагрузкой.
 * • Снятие = min-show 600мс (от навигации, анти-«вспышка») ∧ (ready ∨
 *   ЖЁСТКИЙ КАП 3.5с — ТЗ П2: страховка 3.5–4с при плохом интернете;
 *   RM-ветка min-show пропускает (мгновенно по ready, без rAF-ожидания).
 *   Выход: класс .pre-done → fade 0.5s + scale 0.98 бейджа, visibility:
 *   hidden с 300мс (тапы сквозь — сразу, pointer-events:none) → DOM-чистка
 *   (unmount) через ~340мс от старта fade — к этому моменту opacity уже
 *   ~5% (easeOutCubic), хвост режется незаметно.
 * • CSS-страховка мёртвого JS: [data-preloader-root] сам гаснет
 *   pre-root-release на 4.2с (globals.css; выше JS-пути 3.5с+0.34с=3.84с —
 *   запас 0.36с при любом взводе) — JS-путь успевает раньше, анимация реально
 *   стреляет только при мёртвой/зависшей гидрации.
 * • Повторный визит за сессию: инлайн-скрипт в начале <body> (layout.tsx)
 *   ставит [data-no-preloader] на <html> до парсинга → CSS
 *   display:none первым же стайл-резолвом. No-JS: noscript-стиль
 *   layout.tsx. sessionStorage «catering-preloaded» — здесь.
 * • prefers-reduced-motion: бейдж СТАТИЧЕН (CSS гасит вращение), кольцо
 *   остаётся (не vestibular-триггер), снятие мгновенно по ready — JS
 *   пропускает min-show (arm с wait=0, c98-FIX1 — теперь честно) и fade
 *   (setDone напрямую, без .pre-done).
 * • Перф: только transform/opacity/stroke-dashoffset; оверлей непрозрачный
 *   белый поверх, hero <Image priority> грузится ПАРАЛЕЛЬНО под ним —
 *   LCP-путь не блокируется. Логотип — сырой 41KB PNG (unoptimized:
 *   /_next/image-раундтрип пережил бы прелоадер). Никаких шрифтов/GIF/видео.
 */
export function Preloader() {
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    /* Session-флаг для СЛЕДУЮЩЕЙ навигации (повторный визит прячется
       инлайн-скриптом layout.tsx + [data-no-preloader] ещё до гидрации).
       RM-юзер тоже «потребил» вход — флаг ставим во всех ветках. */
    try {
      sessionStorage.setItem("catering-preloaded", "1");
    } catch {
      /* Safari private mode — молча (как в инлайн-гейте layout.tsx). */
    }

    /* RM: снятие мгновенно по ready — без min-show и без fade-класса
       (CSS RM-блок уже погасил вращение и transition-плавность). */
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ── Прогресс: монотонный max, потолок 0.9 до real-ready ── */
    let progress = 0.12; /* SSR-старт кольца (stroke-dashoffset .88) */
    const applyProgress = (target: number) => {
      const v = Math.min(1, Math.max(progress, target));
      if (v === progress) return;
      progress = v;
      /* ref-запись inline-style поверх SSR-атрибута — ноль ре-рендеров */
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = (1 - v).toFixed(3);
      }
    };

    const cleanups: Array<() => void> = [];
    const on = (
      target: EventTarget,
      type: string,
      fn: () => void,
    ) => {
      target.addEventListener(type, fn, { once: true });
      cleanups.push(() => target.removeEventListener(type, fn));
    };

    /* DOM parsed → 35% (гидрация всегда после DCL — ветка на всякий случай) */
    if (document.readyState !== "loading") applyProgress(0.35);
    else on(document, "DOMContentLoaded", () => applyProgress(0.35));

    /* ── Снятие: min-show 600мс (ОТ НАВИГАЦИИ — performance.now) ∧ ready ∨
       кап 3.0с (тоже от навигации: поздняя гидрация не продлевает оверлей). ── */
    const MIN_SHOW = 600;
    const HARD_CAP = 3500; /* c118: 3.0 → 3.5с (ТЗ П2: коридор 3.5–4с) */
    let removed = false;
    let removeTimer: number | undefined;
    const remove = () => {
      if (removed) return;
      removed = true;
      if (reduce) {
        setDone(true); /* RM: мгновенно, без fade */
        return;
      }
      rootRef.current?.classList.add("pre-done");
      /* DOM-чистка через 340мс от старта fade: visibility:hidden уже
         сработал (300мс), opacity ~5% — хвост transition не виден. */
      removeTimer = window.setTimeout(() => setDone(true), 340);
    };
    const arm = () => {
      applyProgress(1); /* real-ready → кольцо до упора */
      /* c98-FIX1 (критик1 #8, NIT→FIX): RM — честное «мгновенное снятие по
       * ready»: wait=0. Не-зеро-таймер сохранён для обычного пути
       * (анти-«вспышка»). */
      const wait = reduce ? 0 : Math.max(0, MIN_SHOW - performance.now());
      const fire = () => {
        removeTimer = window.setTimeout(remove, wait);
      };
      if (reduce) {
        fire();
        return;
      }
      /* c118 (ТЗ П2.1.3): один полный rAF-цикл после готовности —
       * браузер закоммитил кадр с контентом, инициализация тяжёлых
       * скриптов (Lenis/framer/IO-гейты) отработала, main thread
       * свободен: снятие оверлея не совпадает с пиком нагрузки
       * (анти-«фриз первого кадра»). */
      requestAnimationFrame(() => {
        requestAnimationFrame(fire);
      });
    };

    /* ── c118 (ТЗ П2.1): ready = ШРИФТЫ ∧ ДЕКОДИРОВАННЫЕ кадры hero ── */
    /* 1) Шрифты первого экрана — document.fonts.ready. */
    const fontsP = document.fonts.ready.then(
      () => {},
      () => {},
    );

    /* 2) LCP-картинка hero (#hero img, под видео-слоем): load → decode.
       Error постера = complete → тоже ready (не виснем на битой картинке). */
    const heroImg = document.querySelector(
      "#hero img",
    ) as HTMLImageElement | null;
    const heroP: Promise<void> = heroImg
      ? new Promise<void>((res) => {
          if (heroImg.complete) res();
          else {
            on(heroImg, "load", res);
            on(heroImg, "error", res);
          }
        }).then(() => {
          applyProgress(0.6); /* +25% — LCP-кадр на месте */
          /* c118: complete ≠ декодирован — доводим до битмапа (GPU),
             иначе первый показ совпадал бы с синхронным декодом (фриз). */
          return heroImg.decode().then(
            () => {},
            () => {},
          );
        })
      : new Promise<void>((res) => {
          /* Нет #hero (напр. /admin) — фолбэк window load. */
          if (document.readyState === "complete") res();
          else on(window, "load", res);
        });

    /* 3) ВИДИМЫЙ слой hero — постер <video> (webp того же кадра, над
       LCP-картинкой): его загрузку из DOM не дождаться —
       прогрев через createElement(img) по ТОМУ ЖЕ URL (кэш/инфлайт)
       + decode() — битмап готов до снятия оверлея. */
    const heroVideo = document.querySelector(
      "#hero video",
    ) as HTMLVideoElement | null;
    const posterUrl = heroVideo?.getAttribute("poster");
    const posterP: Promise<void> = posterUrl
      ? new Promise<void>((res) => {
          const probe = document.createElement("img");
          on(probe, "error", res);
          probe.src = posterUrl;
          probe.decode().then(
            () => res(),
            () => res(),
          );
        })
      : Promise.resolve();

    /* arm() — единственный путь к 100% (жёсткий кап ниже — страховка). */
    Promise.all([fontsP, heroP, posterP]).then(arm, arm);

    /* window load → 90% (потолок до real-ready: arm() единственный путь к 1) */
    const onLoad = () => applyProgress(0.9);
    if (document.readyState === "complete") onLoad();
    else on(window, "load", onLoad);

    /* ЖЁСТКИЙ КАП: зависший запрос не вешает белый экран навсегда. */
    const capDelay = Math.max(0, HARD_CAP - performance.now());
    const cap = window.setTimeout(remove, capDelay);

    return () => {
      cleanups.forEach((fn) => fn());
      window.clearTimeout(cap);
      if (removeTimer !== undefined) window.clearTimeout(removeTimer);
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      data-preloader-root
      role="status"
      aria-label="Загрузка сайта"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-white"
    >
      {/* Центр-кластер: SVG-гейдж (кольцо прогресса r=47, stroke 2.5) с
          вращающимся бейджем внутри (диаметр 64 из 100 юнитов viewBox) +
          caption. Кольцо стартует со static 12% (dashoffset-атрибут ниже),
          JS двигает его ref-записями — разметка не меняется после гидрации
          (SSR-паритет). */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg
            viewBox="0 0 100 100"
            className="block size-[176px] md:size-[208px]"
            aria-hidden="true"
          >
            {/* След колец — тёплый полутон на белом, не спорит с бейджем */}
            <circle
              className="pre-ring-track"
              cx="50"
              cy="50"
              r="47"
              fill="none"
              strokeWidth="2.5"
            />
            {/* Прогресс: pathLength=1 → dasharray 1; видимо 1−offset долей
                дуги; rotate(-90) — старт с 12 часов, по ходу часов. Цвет —
                фирменный --gold (globals.css :root), transition 0.3s — в
                .pre-ring (globals.css, c98-E). */}
            <circle
              ref={ringRef}
              className="pre-ring"
              cx="50"
              cy="50"
              r="47"
              fill="none"
              strokeWidth="2.5"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={0.88}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          {/* Бейдж-обёртка владеет scale-выходом (0.98 при .pre-done);
              вращение — на самом img (.pre-logo-spin): transform-свойства
              не конфликтуют (урок c81 — масштаб и поворот на разных узлах). */}
          <div className="pre-logo-wrap absolute inset-0 flex items-center justify-center">
            <Image
              src="/brand/logo-256.png"
              alt=""
              width={256}
              height={256}
              priority
              unoptimized
              className="pre-logo-spin size-[64%]"
            />
          </div>
        </div>
        {/* Caption — мелкий tracking-широкий, спокойный тёплый графит на
            белом (.pre-caption, контраст 5.7:1); Karla уже в head (tott-body),
            новых шрифтовых запросов прелоадер не создаёт. */}
        <span className="pre-caption tott-body mt-6 text-[11px] font-bold uppercase tracking-[0.35em]">
          NILOV&nbsp;CATERING
        </span>
      </div>
    </div>
  );
}
