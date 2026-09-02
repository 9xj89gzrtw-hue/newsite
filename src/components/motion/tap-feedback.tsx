"use client";

import { useEffect } from "react";
import "./wow.css";

/**
 * TapFeedback — мобильный тап-отклик (Task ID: 1-c2, тач-приоритет).
 *
 * (a) CSS-часть (wow.css, импорт выше): на @media (pointer: coarse)
 *     интерактивные элементы (button, a, [role="button"], summary) при
 *     :active сжимаются scale(0.96) за 100ms ease-out. Только :active —
 *     hover не трогаем; элементы с framer-инлайн-transform не
 *     затрагиваются (инлайн сильнее селектора, конфликт исключён);
 *     opt-out — атрибут data-no-tap; reduce-motion гейтится в media.
 *
 * (b) useHapticFeedback — хук лёгкой вибрации: единый document-level
 *     passive-capture pointerup: если pointerType === "touch" и тап попал
 *     в button/a/[role="button"] → navigator.vibrate?.(8). Feature-detect
 *     ("vibrate" in navigator) — на iOS Safari хука нет вообще, слушатель
 *     не вешается (тихий скип по спецификации Vibration API).
 *
 * Монтирование хука — РОВНО ОДИН РАЗ на страницу: сейчас в
 * GgVideoShowcase (client-компонент, грузится на главной). НЕ дублировать
 * в других местах — слушатель document-level.
 */
export function useHapticFeedback(): void {
  useEffect(() => {
    // feature detect: без Vibration API (iOS Safari) слушатель не нужен
    if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;

    const onPointerUp = (e: PointerEvent): void => {
      if (e.pointerType !== "touch") return; // только тапы пальцем
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest("button, a, [role='button']")) {
        try {
          // 8ms — почти незаметный «клик» тактильного отклика
          navigator.vibrate?.(8);
        } catch {
          /* некоторые браузеры кидают на vibrate — тихо пропускаем */
        }
      }
    };

    document.addEventListener("pointerup", onPointerUp, {
      passive: true,
      capture: true,
    });
    return () => {
      document.removeEventListener("pointerup", onPointerUp, { capture: true });
    };
  }, []);
}

export default useHapticFeedback;
