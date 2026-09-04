"use client";

import { useEffect } from "react";

/**
 * VanityUrlScroll — 81-F2 (критик B MAJOR + ресёрч 81-R1/P2).
 *
 * ПРОБЛЕМА: vanity-URL /menu /events /contacts /contact /calculator
 * обслуживаются next.config.ts-rewritами на «/#anchor» — но hash-фрагмент
 * НЕ доходит до сервера и НЕ попадает в location браузера (rewrite
 * прозрачен: URL остаётся /menu, hash пуст). Юзер приезжает на главную
 * с scrollY=0 и видит hero, цель кампании — ниже фолда.
 *
 * РЕШЕНИЕ (81-R1/P2, вариант «б»): клиентский компонент читает
 * location.pathname на маунте и скроллит к целевой секции. Гейт на
 * window.load + 300мс (ждём первых картинок), затем ретаргеты — ленивые
 * медиа ВЫШЕ цели дрейфуют и сдвигают её (§38: одиночный вызов улетал
 * на +862px; такты пересчитывают rect каждый раз, сходимость ≤ 85px).
 *
 * ПРАВИЛА (грабли, отработанные в прошлых циклах):
 *  - location.hash уже есть (переход по якорной ссылке, /#calculator) —
 *    нативный якорный переход главный, НЕ вмешиваемся;
 *  - Lenis перебивает программные smooth-скроллы (§33) → скролл через
 *    window.__lenis, фоллбек — scrollIntoView;
 *  - прелоадер запирает скролл ~0.9с (§45) — первый такт может быть
 *    проглочен; ретаргеты 650/1250мс добивают;
 *  - юзер, начавший взаимодействие (wheel/touch/keydown/pointerdown) или
 *    уже уехавший со скроллом (реставрация back-nav > 200px), не
 *    дёргается (§35 interaction-маркеры);
 *  - reduced-motion → behavior 'auto' (и Lenis-путь с duration 0);
 *  - offset = scroll-margin-top цели (84px у section[id], 96px у
 *    .hb-zone) — читается из computed style, не хардкодится.
 *
 * ПОДКЛЮЧЕНИЕ: компонент НЕ импортирован в page.tsx — его монтирует
 * отдельный агент волны (см. worklog 81-F2: «готов к подключению»).
 * Рендерит null — только эффект, ноль DOM.
 */

/** vanity-path → id целевой секции. /events → карусель: якоря #events
 *  на странице НЕТ (finding критика B) — реальный id секции видео. */
const VANITY_TARGETS: Readonly<Record<string, string>> = {
  "/menu": "menu",
  "/events": "events-video-carousel",
  "/contacts": "contact",
  "/contact": "contact",
  "/calculator": "calculator",
};

/** Задержка ПОСЛЕ window.load — первые картинки успевают декодироваться. */
const LOAD_DELAY_MS = 300;
/** Ретаргеты после первого скролла: ленивый лэйаут дрейфует (§38). */
const RETARGET_DELAYS_MS = [650, 1250] as const;
/** Сходимость: цель уже в кадре с допуском — повторный скролл не нужен. */
const CONVERGENCE_PX = 60;
/** Порог «юзер уже не на hero» (реставрация скролла back-nav) — не дёргаем. */
const SCROLLY_GUARD_PX = 200;
/** Взаимодействие юзера отменяет ретаргеты (§35). */
const INTERACTION_EVENTS = ["pointerdown", "wheel", "touchstart", "keydown"] as const;

type LenisLike = {
  scrollTo?: (target: Element, options?: { offset?: number; duration?: number }) => void;
};

function getLenis(): LenisLike | undefined {
  return (window as unknown as { __lenis?: LenisLike }).__lenis;
}

/** Абсолютная позиция скролла цели с учётом её scroll-margin-top. */
function targetScrollTop(id: string): number | null {
  const el = document.getElementById(id);
  if (!el) return null;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop || "0") || 0;
  return top - margin;
}

function scrollToTarget(id: string, reduce: boolean): void {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  if (typeof lenis?.scrollTo === "function") {
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop || "0") || 0;
    lenis.scrollTo(el, { offset: -margin, duration: reduce ? 0 : 0.9 });
    return;
  }
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

export function VanityUrlScroll() {
  useEffect(() => {
    /* Дубли-защита: hash уже есть — нативный якорный переход (или
     * hash-навигация hacc-booking #contact) отвечает за позицию. */
    if (window.location.hash) return;

    const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
    const targetId = VANITY_TARGETS[pathname];
    if (!targetId) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    let scrolledOnce = false;
    const timers: number[] = [];
    const listeners: Array<[string, () => void]> = [];

    const cancel = () => {
      cancelled = true;
    };
    INTERACTION_EVENTS.forEach((ev) => {
      const fn = () => cancel();
      window.addEventListener(ev, fn, { passive: true, capture: true });
      listeners.push([ev, fn]);
    });

    const scrollNow = () => {
      if (cancelled) return;
      const desired = targetScrollTop(targetId);
      if (desired == null) return;
      if (!scrolledOnce) {
        /* Back-nav с реставрацией позиции: юзер уже там, где был, —
         * не перетаскиваем его к секции. Только для ПЕРВОГО такта. */
        if (window.scrollY > SCROLLY_GUARD_PX) {
          cancel();
          return;
        }
        scrolledOnce = true;
      } else if (Math.abs(window.scrollY - desired) <= CONVERGENCE_PX) {
        /* Сошлись — дальнейшие ретаргеты не нужны. */
        cancel();
        return;
      }
      scrollToTarget(targetId, reduce);
    };

    const start = () => {
      if (cancelled) return;
      scrollNow();
      RETARGET_DELAYS_MS.forEach((d) =>
        timers.push(window.setTimeout(scrollNow, d)),
      );
    };

    if (document.readyState === "complete") {
      timers.push(window.setTimeout(start, LOAD_DELAY_MS));
    } else {
      const onLoad = () => {
        timers.push(window.setTimeout(start, LOAD_DELAY_MS));
      };
      window.addEventListener("load", onLoad, { once: true });
      listeners.push(["load", onLoad]);
    }

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      listeners.forEach(([ev, fn]) =>
        window.removeEventListener(ev, fn, { capture: true } as EventListenerOptions),
      );
    };
  }, []);

  return null;
}

export default VanityUrlScroll;
