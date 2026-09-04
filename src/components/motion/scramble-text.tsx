"use client";

import * as React from "react";
import { useInView, useReducedMotion } from "framer-motion"; /* C71-P1 (K8, Task 6): было "motion/react" — унификация на единый пакет. */
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   ScrambleText — Cycle 71 (Task 1-c1). Перебор символов на eyebrow-лейблах:
   надзаголовок при входе во вьюпорт «собирается» из случайных символов и
   резолвится слева-направо (motion.dev ScrambleText-приём, R1-report §3).

   Дисциплина (грабля R1/§35): НИКАКОГО setState на кадр — тик пишет
   ref.textContent напрямую (DOM-мутация вне ведения React: vdom-текст не
   меняется, ре-рендер родителя ничего не перезапишет), в конце цикла узел
   возвращается к финальному тексту.

   Параметры (R1-спецификация): интервал ~48ms, общая длительность ≤600ms,
   пул ~12 глифов «nilovcatering×—•» (бренд-алфавит), пробелы не перебираются
   (каркас строки стабилен, длина строки не меняется — ноль layout-джиттера
   по количеству символов).

   A11y (81-F3, критик A2 / Lighthouse aria-prohibited-attr): доступный
   текст — sr-only-твин ВНУТРИ носителя; видимый (перебираемый) узел —
   aria-hidden. Прежний aria-label на <span>/<p> (generic/paragraph —
   роли без naming) был запрещённым атрибутом WAI-ARIA; теперь имя
   элемента/семантического родителя (напр. h2) вычисляется из реального
   текст-содержимого (та же модель, что split-text-reveal.tsx).

   SSR/reduce: серверный HTML = финальный текст (перебор — только
   пост-гидрационная мутация в effect); prefers-reduced-motion → эффект
   пропускается, текст сразу финальный. Старт — после document.fonts.ready
   (подмена глифов до готовности шрифта дёргает метрики строки).
   ═══════════════════════════════════════════════════════════════════════════ */

type As = "span" | "p" | "div";

interface ScrambleTextProps {
  /** Финальный текст (plain string — перебор посимвольный). */
  children: string;
  /** Тег-носитель. @default 'span' */
  as?: As;
  className?: string;
  /** Интервал тика перебора, ms. @default 48 */
  stepMs?: number;
  /** Общая длительность, ms (жёсткий потолок 600 — SPEC R1). @default 460 */
  durationMs?: number;
  /** Пул символов для перебора. @default "nilovcatering×—•" */
  pool?: string;
  /** Задержка перед стартом, ms (пауза на вход reveal-каскада секции). @default 0 */
  delayMs?: number;
}

/** Бренд-алфавит пула: латиница вордмарка + типографские знаки (~12 глифов). */
const DEFAULT_POOL = "nilovcatering×—•";

export function ScrambleText({
  children,
  as = "span",
  className,
  stepMs = 48,
  durationMs = 460,
  pool = DEFAULT_POOL,
  delayMs = 0,
}: ScrambleTextProps) {
  const reduce = useReducedMotion();
  const textRef = React.useRef<HTMLSpanElement | null>(null);
  const inView = useInView(textRef, { once: true });

  React.useEffect(() => {
    const node = textRef.current;
    // reduce / no-JS / SSR: финальный текст уже в DOM — ничего не делаем.
    if (!node || !inView || reduce) {
      return;
    }

    const text = children;
    const len = text.length;
    if (len === 0) {
      return;
    }
    // SPEC: общий потолок 600ms; пол не ниже ~260ms, чтобы короткие лейблы
    // не «мигали» одним тиком.
    const total = Math.min(600, Math.max(260, durationMs));

    let elapsed = 0;
    let interval: ReturnType<typeof setInterval> | null = null;
    let startTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const stop = () => {
      if (interval !== null) {
        clearInterval(interval);
        interval = null;
      }
    };

    const tick = () => {
      elapsed += stepMs;
      const progress = Math.min(1, elapsed / total);
      const resolved = Math.round(progress * len);
      let out = "";
      for (let i = 0; i < len; i++) {
        const ch = text[i];
        // Резолв слева-направо; пробелы — каркас, их не перебираем.
        out +=
          i < resolved || ch === " "
            ? ch
            : pool[(Math.random() * pool.length) | 0];
      }
      node.textContent = out;
      if (progress >= 1) {
        node.textContent = text;
        stop();
      }
    };

    // Старт: задержка (кадр для reveal-каскада родителя) → шрифты готовы →
    // первый тик сразу (взрыв шума), дальше интервал.
    const begin = () => {
      if (cancelled) {
        return;
      }
      tick();
      interval = setInterval(tick, stepMs);
    };
    startTimer = setTimeout(() => {
      void document.fonts.ready.then(begin);
    }, delayMs);

    return () => {
      cancelled = true;
      stop();
      if (startTimer !== null) {
        clearTimeout(startTimer);
      }
      // Прерванный перебор (unmount/remount/смена children) — вернуть
      // канонический текст, узел не должен остаться «в шуме».
      node.textContent = text;
    };
  }, [inView, reduce, children, stepMs, durationMs, pool, delayMs]);

  const Tag = as as React.ElementType;
  return (
    <Tag className={cn(className)}>
      {/* 81-F3 (A2): sr-only-твин — доступный текст живёт в содержимом
          (aria-label на generic/paragraph запрещён); визуальный
          скрамбл-узел — aria-hidden, как раньше. */}
      <span className="sr-only">{children}</span>
      <span ref={textRef} aria-hidden="true">
        {children}
      </span>
    </Tag>
  );
}

export default ScrambleText;
