"use client";

import * as React from "react";

/**
 * SdZoomFallback — C79 «Mobile Motion».
 * ---------------------------------------------------------------------------
 * [data-sd-zoom] — нативный CSS scroll-driven zoom (globals.css:
 * `animation: sd-zoom-in; animation-timeline: view(); animation-range:
 * entry 0% entry 100%`). Chromium и Safari 26+ его играют; iOS Safari ≤18
 * и Firefox — НЕТ: фото-полосы входят без движения, на мобильной половине
 * трафика эффекта просто нет.
 *
 * Этот компонент — JS-фоллбек ДЛЯ НЕ-ПОДДЕРЖИВАЮЩИХ: та же шкала
 * 1.08→1.0 по entry-прогрессу, rAF-батч, transform-only. Браузеры с
 * поддержкой view() уходят на первом же эффекте — CSS ведёт один, двойной
 * анимации нет (замер: CSS.supports совпадает с @supports-гейтом CSS).
 *
 * PERF (§43): слушатель scroll (passive) существует ТОЛЬКО пока секция в
 * зоне видимости ±20% (IntersectionObserver снимает его вне зоны);
 * внутри — ≤1 rAF на событие скролла и ≤1 getBoundingClientRect на кадр;
 * в покое — ноль слушателей, ноль rAF. reduce-motion → статика (как CSS).
 *
 * Обёртка — absolute inset-0 (размерный контейнер для fill-детей);
 * масштаб пишется на ПЕРВОМ ПОТОМКЕ [data-sd-zoom] (не на обёртке —
 * у обёртки трансформ трогать нельзя: она размерный якорь).
 */

export function SdZoomFallback({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Поддерживающие view() — CSS-анимация уже на элементе; не дублируем.
    if (window.CSS?.supports?.("animation-timeline: view()")) return;

    const target =
      (wrap.querySelector("[data-sd-zoom]") as HTMLElement | null) ??
      (wrap.firstElementChild as HTMLElement | null);
    if (!target) return;

    let raf = 0;
    let active = false;

    /** Entry-прогресс 0..1: 0 — верх фото на нижней кромке вьюпорта,
     *  1 — фото полностью вошло (низ ниже кромки). Зеркалит CSS
     *  animation-range: entry 0% → entry 100%. */
    const apply = () => {
      raf = 0;
      const r = wrap.getBoundingClientRect(); // ≤1 rect/кадр
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / Math.max(r.height, 1)));
      target.style.transform = `scale(${(1.08 - 0.08 * p).toFixed(4)})`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((en) => en.isIntersecting);
        if (visible && !active) {
          active = true;
          window.addEventListener("scroll", onScroll, { passive: true });
          onScroll(); // начальная позиция без ожидания скролла
        } else if (!visible && active) {
          active = false;
          window.removeEventListener("scroll", onScroll);
          if (raf) {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        }
      },
      { rootMargin: "20% 0px" }, // включаемся чуть заранее — вход не пропускаем
    );
    io.observe(wrap);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      target.style.transform = "";
    };
  }, []);

  return (
    <div ref={wrapRef} className={className ?? "absolute inset-0"}>
      {children}
    </div>
  );
}

export default SdZoomFallback;
