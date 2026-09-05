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
 * location.pathname на маунте и скроллит к целевой секции. Первый скролл —
 * СРАЗУ по window.load (81-W2F1: без +300мс паузы — критик F: юзер видел
 * hero до 2.3с), затем максимум 2 коррекции (600/1200мс) добивают дрейф
 * ленивого лэйаута ВЫШЕ цели (§38: одиночный вызов улетал на +862px;
 * коррекции пересчитывают rect, behavior 'auto' — без повторной анимации).
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

/** 81-W2F1 (критик F MEDIUM, прыжок 0.7-2.3с + дрейф ±252px):
 *  РЕТАРГЕТЫ = максимум 2 коррекции после первого скролла. Первая (+600мс)
 *  реагирует на СДВИГ ЦЕЛИ (>100px — ленивые картинки выше дорисовались,
 *  §38), вторая (+1200мс — плавный скролл уже закончился) добивает и случай
 *  «промаха» (|scrollY − desired| > 100). Обе скроллят behavior:'auto' —
 *  мгновенно (повторная анимация с той же цельб бесит, критик F). Сходимость
 *  без перескролла; взаимодействие юзера гасит всё (§35). */
const CORRECTION_DELAYS_MS = [600, 1200] as const;
/** Порог «цель сместилась» / «доехали мимо» — меньше не дёргаем. */
const DRIFT_PX = 100;
/** Порог «юзер уже не на hero» (реставрация скролла back-nav) — не дёргаем. */
const SCROLLY_GUARD_PX = 200;
/** Взаимодействие юзера отменяет ретаргеты (§35). */
const INTERACTION_EVENTS = ["pointerdown", "wheel", "touchstart", "keydown"] as const;

type LenisLike = {
  scrollTo?: (
    target: Element,
    options?: {
      offset?: number;
      duration?: number;
      immediate?: boolean;
      force?: boolean;
    },
  ) => void;
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

function scrollToTarget(
  id: string,
  opts: { reduce: boolean; instant?: boolean },
): void {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  if (typeof lenis?.scrollTo === "function") {
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop || "0") || 0;
    if (opts.instant) {
      /* 81-W2F1: коррекция — без анимации (immediate+force: мимо Lenis-цели,
       * в т.ч. когда внутренний limit устарел — грабля §2/§33). */
      lenis.scrollTo(el, { offset: -margin, immediate: true, force: true });
    } else {
      lenis.scrollTo(el, { offset: -margin, duration: opts.reduce ? 0 : 0.9 });
    }
    return;
  }
  el.scrollIntoView({
    behavior: opts.instant || opts.reduce ? "auto" : "smooth",
    block: "start",
  });
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
    /** Позиция цели в момент первого скролла — база для «цель сместилась». */
    let firstDesired: number | null = null;
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

    /* Первый такт: якорь цели + плавный скролл (reduce → 'auto'). */
    const scrollFirst = () => {
      if (cancelled) return;
      const desired = targetScrollTop(targetId);
      if (desired == null) return;
      /* Back-nav с реставрацией позиции: юзер уже там, где был, —
       * не перетаскиваем его к секции. */
      if (window.scrollY > SCROLLY_GUARD_PX) {
        cancel();
        return;
      }
      scrolledOnce = true;
      firstDesired = desired;
      scrollToTarget(targetId, { reduce });
    };

    /* Коррекции (максимум 2 — 81-W2F1):
     *  - скролл ещё может анимироваться → меряем СДВИГ ЦЕЛИ, а не позицию;
     *  - вторая (после ~0.9с плавного скролла) ловит и промах посадки. */
    const scrollCorrection = (checkOffTarget: boolean) => {
      if (cancelled || !scrolledOnce) return;
      const desired = targetScrollTop(targetId);
      if (desired == null) return;
      const targetMoved =
        firstDesired != null && Math.abs(desired - firstDesired) > DRIFT_PX;
      const offTarget = Math.abs(window.scrollY - desired) > DRIFT_PX;
      if (!targetMoved && !(checkOffTarget && offTarget)) return;
      firstDesired = desired;
      scrollToTarget(targetId, { reduce, instant: true });
    };

    const start = () => {
      if (cancelled) return;
      scrollFirst();
      if (cancelled) return;
      CORRECTION_DELAYS_MS.forEach((d, i) =>
        timers.push(
          window.setTimeout(() => scrollCorrection(i === CORRECTION_DELAYS_MS.length - 1), d),
        ),
      );
    };

    if (document.readyState === "complete") {
      timers.push(window.setTimeout(start, 0));
    } else {
      const onLoad = () => {
        timers.push(window.setTimeout(start, 0));
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
