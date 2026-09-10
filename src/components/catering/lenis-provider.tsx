"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { useLiteDevice } from "@/hooks/use-lite-device";
import { isLiteDevice, subscribeLiteDevice } from "@/lib/lite-device";

/**
 * Smooth-scroll provider (Lenis) with GSAP ScrollTrigger bridge.
 * Respects prefers-reduced-motion (native scroll then).
 *
 * c84 (Impl-D, lite-режим): useLiteDevice() === true → Lenis НЕ
 * инициализируется вовсе — сайт живёт на нативном скролле. Экономится
 * постоянный rAF-луп (60fps) + динамический импорт gsap/ScrollTrigger.
 * window.__lenis тогда не существует: все программные скроллы сайта идут
 * по нативным фоллбекам (проверено c84-D грепом: hacc-menu.tsx:615,
 * site-header.tsx:472/543, hacc-booking.tsx:1110/2454/2553,
 * ea-founder-story.tsx:282, vanity-scroll.tsx:108 — у КАЖДОГО вызова
 * __lenis есть else-ветка scrollIntoView/window.scrollTo).
 *
 * Гидро-паритет: init и lite-детект живут в useEffect — SSR рендерит
 * детей без скролл-библиотеки в обоих режимах. lite поднимается ПОСЛЕ
 * монтирования (useLiteDevice): если Lenis уже успел создаться,
 * пересборка эффекта гасит rAF, снимает __lenis и destroy() (даунгрейд
 * односторонний — из lite назад Lenis не поднимается, lib/lite-device).
 *
 * c84-F1 (критик P1-D2, MINOR «gsap 116KB качается в эконом-режиме»):
 * mount-race — эффект стартовал с lite=false (хук ещё не флипнулся) и
 * успевал new Lenis() + import("gsap") до пересборки. Фикс: СИНХРОННЫЙ
 * isLiteDevice() ПЕРВОЙ строкой эффекта (модуль-кэш lib/lite-device
 * вычислен к этому моменту) — в lite-ветке ни Lenis, ни байт gsap не
 * запрашиваются вовсе.
 *
 * c84-F1 (критик P1-D1): этот же эффект ставит html.lite-device — класс
 * для CSS-гейтов дорогих растровых анимаций футера (globals.css, конец
 * файла: marquee-logos/fw-shimmer/vbl-shimmer/grain — A/B замер P1:
 * футер 12–24fps → 60.1 при отключении). Ставится при lite И снимается
 * при анмаунте; reduced-motion отдельным классом НЕ дублируется — его
 * CSS-гварды уже существуют.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lite = useLiteDevice();

  /* c84-F1: html.lite-device — CSS-гейт растровых анимаций (см. докстринг).
     Эффект без deps: класс живёт пока живёт провайдер (layout) — при
     lite-даунгрейде по ходу сессии (connection.change) useLiteDevice
     перезапускает init-эффект, а класс уже стоит. */
  useEffect(() => {
    const root = document.documentElement;
    if (isLiteDevice()) root.classList.add("lite-device");
    const unsub = subscribeLiteDevice(() => root.classList.add("lite-device"));
    return () => {
      unsub();
      root.classList.remove("lite-device");
    };
  }, []);

  useEffect(() => {
    /* c84-F1 (P1-D2): синхронный детект ДО любого new/import — в lite
       ни Lenis, ни gsap-байты не запрашиваются (было: 116KB gzip
       качались в Data Saver из-за mount-race хука). */
    if (
      typeof window === "undefined" ||
      isLiteDevice() ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      lite
    ) {
      return;
    }
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    /* C61: глобальный хук для программных скроллов блоков — Lenis.scrollTo
       корректно гасит колесную инерцию (голый window.scrollTo(smooth)
       Lenis перебивает своим таргетом, грабля §2) */
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    let off = () => {};
    /* c84-D: disposed-гейт — динамический import может резолвнуться уже
       ПОСЛЕ cleanup (lite-даунгрейд на маунте / анмаунт): без гейта мост
       повесил бы scroll-листенер на destroy()-нутый инстанс. */
    let disposed = false;
    (async () => {
      try {
        const gsapMod = await import("gsap");
        const stMod = await import("gsap/ScrollTrigger");
        if (disposed) return;
        const gsap = gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        lenis.on("scroll", ScrollTrigger.update);
        off = () => lenis.off("scroll", ScrollTrigger.update);
      } catch {
        /* GSAP optional */
      }
    })();

    return () => {
      disposed = true;
      off();
      cancelAnimationFrame(raf);
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
      lenis.destroy();
    };
  }, [lite]);

  return <>{children}</>;
}
