"use client";

import { useEffect, useRef } from "react";
import "./wow.css";

/**
 * ImageTrail — шлейф фото блюд за пальцем/курсором (fancycomponents-подход
 * из research R1: image trail работает и на touch).
 *
 * ГЛАВНЫЙ МОБИЛЬНЫЙ ВАУ волны 1: свайп/скролл пальцем по секции
 * cep-instagram-grid («СЛЕДИТЕ ЗА НАМИ») оставляет за пальцем шлейф
 * карточек-«искр» с фото блюд. На десктопе то же за мышью.
 *
 * Механика:
 *  - document-level passive-листенеры: pointermove (мышь/перо) + touchmove
 *    (тач — после pointercancel браузер продолжает слать touchmove во время
 *    скролла, поэтому тач слушаем отдельно). НИКАКОГО preventDefault —
 *    нативный скролл не ломается.
 *  - Гейт по getBoundingClientRect секции-хоста: шлейф появляется ТОЛЬКО
 *    внутри секции (не по всей странице).
 *  - Спавн при накопленных ~100px движения: карточка position:fixed (в слое
 *    на <body> — независимо от transform-предков), появление scale 0.6→1 +
 *    rotate ±12°, жизнь ~780ms fade-out.
 *  - Пул из 3 DOM-элементов с реюзом (DOM не растёт), pointer-events:none
 *    на всём трейле — клики по плиткам работают.
 *  - Размер адаптивен источнику ввода: fine-указатель 240×160, coarse
 *    (тач) 156×104.
 *  - Анимация WAAPI (el.animate) — композитор, без rAF-на-элемент.
 *  - prefers-reduced-motion → эффект полностью неактивен.
 *  - SSR-safe: сервер рендерит только скрытый маркер (слой создаётся в
 *    useEffect), гидрация не расходится.
 *
 * Фотографии — производные 480px webp-копии (sharp, §4-конвейер размеров,
 * контент не менялся → VLM-гейт не требуется) утверждённых фото сайта:
 * суммарно ~186KB, лениво прогреваются через IntersectionObserver, когда
 * секция приближается к вьюпорту — мобильный трафик не платит за вау
 * upfront.
 *
 * Размещение: кладётся <ImageTrail /> внутрь секции; хост ищется через
 * closest("section") от скрытого маркера.
 */

/** Пул фото (горизонтальные, 480px webp — кэп DPR 1.5 покрыт). */
const TRAIL_IMAGES = [
  "/media/trail/trail-01.webp",
  "/media/trail/trail-02.webp",
  "/media/trail/trail-03.webp",
  "/media/trail/trail-04.webp",
  "/media/trail/trail-05.webp",
  "/media/trail/trail-06.webp",
  "/media/trail/trail-07.webp",
] as const;

/** Размер пула DOM-карточек (максимум одновременно «живых» элементов). */
const POOL_SIZE = 3;
/** Накопленная дистанция указателя до спавна следующей карточки, px. */
const SPAWN_DISTANCE = 100;
/** Жизнь карточки, ms (700–900). */
const LIFE_MS = 780;

export function ImageTrail() {
  const markerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const host = marker.closest("section");
    if (!host) return;
    // reduce-motion: компонент пассивен — ни слоя, ни листенеров
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Слой на <body>: position:fixed не должен попасть в containing-block
    // трансформированного предка (framer-секции анимируют transform).
    const layer = document.createElement("div");
    layer.className = "it-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    // Пул карточек — реюз, DOM фиксированного размера
    const cards: HTMLImageElement[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const card = document.createElement("img");
      card.className = "it-img";
      card.alt = ""; // декоративная «искра», не контент
      card.decoding = "async";
      card.draggable = false;
      layer.appendChild(card);
      cards.push(card);
    }

    // Прогрев кэша фото, когда секция близка к вьюпорту (~300px запас),
    // чтобы первый спавн не ждал сеть
    let warmed = false;
    const warm = () => {
      if (warmed) return;
      warmed = true;
      for (const src of TRAIL_IMAGES) {
        const preloader = new Image();
        preloader.decoding = "async";
        preloader.src = src;
      }
    };
    const warmIo = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          warm();
          warmIo.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    warmIo.observe(host);

    // --- состояние трекинга ---
    let acc = 0; // накопленная дистанция с прошлого спавна
    let lastX: number | null = null;
    let lastY = 0;
    let spawnCount = 0;

    /* --- кэш геометрии секции (K4, cycle-71 F3: micro-perf) ------------------
       Раньше insideHost звал getBoundingClientRect на КАЖДЫЙ pointermove/
       touchmove — форс-синхронный layout на ровном месте (соседние секции
       анимируют высоту/позиции). Теперь геометрия кэшируется в
       document-координатах (top/bottom + scrollY): вертикальный скролл её
       НЕ инвалидирует — пересчёт по живому window.scrollY (дёшево, без
       layout), а ревалидация по resize/скролл-затиханию (debounce 200ms)
       ловит реальные переверстки (адаптив, аккордеоны выше по потоку).
       Горизонтального скролла на странице нет — left/right
       viewport-стабильны. -------------------------------------------------- */
    let hostLeft = 0;
    let hostRight = 0;
    let hostDocTop = 0;
    let hostDocBottom = 0;
    const measureHost = () => {
      const r = host.getBoundingClientRect();
      hostLeft = r.left;
      hostRight = r.right;
      hostDocTop = r.top + window.scrollY;
      hostDocBottom = r.bottom + window.scrollY;
    };
    measureHost();
    let revalidateTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRevalidate = () => {
      clearTimeout(revalidateTimer);
      revalidateTimer = setTimeout(measureHost, 200);
    };
    window.addEventListener("resize", scheduleRevalidate, { passive: true });
    window.addEventListener("scroll", scheduleRevalidate, { passive: true });

    const insideHost = (x: number, y: number): boolean => {
      const sy = window.scrollY;
      return (
        x >= hostLeft &&
        x <= hostRight &&
        y >= hostDocTop - sy &&
        y <= hostDocBottom - sy
      );
    };

    const spawn = (x: number, y: number, coarse: boolean) => {
      const card = cards[spawnCount % POOL_SIZE] as HTMLImageElement;
      spawnCount += 1;
      // реюз: прервать прошлую анимацию этой карточки (fill:none → стили
      // мгновенно вернутся к базе opacity:0)
      for (const anim of card.getAnimations()) anim.cancel();

      const w = coarse ? 156 : 240;
      const h = coarse ? 104 : 160;
      card.style.width = `${w}px`;
      card.style.height = `${h}px`;
      card.src = TRAIL_IMAGES[spawnCount % TRAIL_IMAGES.length] as string;
      card.setAttribute("data-it-live", "1");

      const angle = Math.random() * 24 - 12; // ±12°
      const tx = x - w / 2;
      const ty = y - h / 2;
      const place = (rot: number, sc: number): string =>
        `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg) scale(${sc})`;

      const anim = card.animate(
        [
          { transform: place(angle - 9, 0.6), opacity: "0" },
          { transform: place(angle, 1), opacity: "1", offset: 0.28 },
          { transform: place(angle, 1), opacity: "1", offset: 0.62 },
          { transform: place(angle, 0.98), opacity: "0" },
        ],
        { duration: LIFE_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
      // после завершения карточка уже невидима (база opacity:0) —
      // снимаем только маркер живости (для отладки/тестов)
      anim.onfinish = () => card.removeAttribute("data-it-live");
    };

    /** Единый трекинг дистанции с гейтом секции. */
    const track = (x: number, y: number, coarse: boolean) => {
      if (!insideHost(x, y)) {
        // вышли из секции — сброс, шлейф не «прыгает» между секциями
        lastX = null;
        acc = 0;
        return;
      }
      if (lastX !== null) {
        acc += Math.hypot(x - lastX, y - lastY);
      }
      lastX = x;
      lastY = y;
      if (acc >= SPAWN_DISTANCE) {
        acc -= SPAWN_DISTANCE;
        spawn(x, y, coarse);
      }
    };

    // мышь/перо — pointermove; тач — touchmove (живёт после pointercancel
    // во время скролла). Оба passive: скролл и клики не блокируются.
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || e.pointerType === "pen") {
        track(e.clientX, e.clientY, false);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) track(t.clientX, t.clientY, true);
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", scheduleRevalidate);
      window.removeEventListener("scroll", scheduleRevalidate);
      clearTimeout(revalidateTimer);
      warmIo.disconnect();
      for (const card of cards) {
        for (const anim of card.getAnimations()) anim.cancel();
      }
      layer.remove();
    };
  }, []);

  // Маркер: невидим, живёт в дереве, чтобы эффект нашёл секцию-хост.
  // Рендерится одинаково на сервере и клиенте — гидрация стабильна.
  return <span ref={markerRef} hidden aria-hidden="true" data-image-trail="" />;
}

export default ImageTrail;
