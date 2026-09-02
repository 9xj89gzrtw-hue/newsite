"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type ClipDirection = "top" | "right" | "bottom" | "left" | "alternate";

interface ClipPathRevealProps {
  children: React.ReactNode;
  /**
   * Which side the clip opens from. `alternate` cycles through
   * `[bottom, left, top, right]` using `index % 4` (Sondaven directional
   * reveal pattern).
   *
   * @default 'bottom'
   */
  direction?: ClipDirection;
  /** Delay in seconds before the reveal begins. @default 0 */
  delay?: number;
  /** Reveal duration in seconds. @default 0.9 */
  duration?: number;
  /** Used only when `direction='alternate'` to pick a side. */
  index?: number;
  /** Trigger once vs. every time it enters the viewport. @default true */
  once?: boolean;
  className?: string;
}

/**
 * Порядок сторон для `direction='alternate'` — индекс % 4 задаёт сторону
 * входа (паттерн Sondaven: чередование направлений в каскаде карточек).
 */
const ALTERNATE_CYCLE = [
  "bottom",
  "left",
  "top",
  "right",
] as const satisfies readonly Exclude<ClipDirection, "alternate">[];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * ClipPathReveal — направленный photo-reveal (имя историческое: компонент
 * начинал с `clip-path: inset(...)`, см. git-историю и §34 ниже; сегодня
 * маска заменена на opacity + направленный y/x-сдвиг — имя сохранено ради
 * стабильности импортов у 7 потребителей). Внутренний слой доводит образ
 * зумом 1.15 → 1.0 — премиальный «Sondaven push-out»-приём.
 *
 * АКТУАЛЬНАЯ механика (K4, cycle-71 F3 — комментарии синхронизированы
 * с кодом; прежний комментарий врал про «imperative animate + useInView,
 * НЕ whileInView» — код всегда использовал whileInView):
 * - внешний `motion.div`: `whileInView` анимирует opacity 0→1 + y (±40px,
 * по направлению bottom/top) или x (±40px, left/right), viewport
 *   `{ once, margin: "-80px" }`;
 * - внутренний `motion.div`: `whileInView` масштаб 1.15 → 1 тем же
 *   transition (duration/delay/EASE [0.22, 1, 0.36, 1]).
 * - `framer-motion` (единая моушн-библиотека сайта — как magnetic.tsx,
 *   cursor.tsx, delivery-block.tsx; motion/react × framer-motion
 *   микса нет — контексты не конфликтуют).
 * - transform / opacity only — GPU-композит, никогда не трогает layout
 *   (RULES §5).
 * - `prefers-reduced-motion`: дети в простом `<div>`, без зума и сдвига.
 * - `relative h-full w-full` на внутреннем зум-слое — чтобы `fill`-дети
 *   (next/image `fill`, абсолютные оверлеи) наследовали высоту внешней
 *   обёртки И видели позиционированного родителя (иначе next/image
 *   предупреждает "parent with invalid position: static" и схлопывается).
 * - will-change НЕ ставим (§34 / K4 F3): постоянный `will-change: transform`
 *   на ~20 инстансах держал лишние композит-слои, а в C34 ещё и убивал
 *   `background-attachment: fixed` у потомков (transform-предок =
 *   containing block). Браузер сам промоутит слой на время transform-
 *   анимации — ручного хинта не нужно (замеров, требующих его, нет).
 */
export function ClipPathReveal({
  children,
  direction = "bottom",
  delay = 0,
  duration = 0.9,
  index,
  once = true,
  className,
}: ClipPathRevealProps) {
  const reduce = useReducedMotion();
  // C62 hydration-safety: branch the tree on reduce ONLY after mount —
  // useReducedMotion() is false at SSR and true on a reduce-user's first
  // client render; a direct branch caused a hydration mismatch (React
  // regenerated the whole page tree). First client render must match SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const resolvedDir: Exclude<ClipDirection, "alternate"> =
    direction === "alternate"
      ? ALTERNATE_CYCLE[(index ?? 0) % ALTERNATE_CYCLE.length]
      : direction;

  if (mounted && reduce) {
    return <div className={className}>{children}</div>;
  }

  const transition = { duration, delay, ease: EASE };

  // Directional y-offset — gives each direction a subtle directional feel
  // even without clip-path (top reveals from above, bottom from below, etc.).
  // Pairs with the inner scale 1.15 → 1.0 zoom for the premium Sondaven-style
  // "image pushing forward" reveal.
  const dirOffset =
    resolvedDir === "top" ? 40 : resolvedDir === "bottom" ? -40 : 0;
  const dirX =
    resolvedDir === "left" ? 40 : resolvedDir === "right" ? -40 : 0;

  return (
    <motion.div
      className={cn("relative", className)}
      initial={{ opacity: 0, y: dirOffset, x: dirX }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={transition}
    >
      {/* Inner zoom-reveal: child scales 1.15 → 1.0 over the same duration
          for the premium "image pushing out of the mask" feel (Sondaven
          pairs a scale zoom with every photo reveal).

          `relative h-full w-full`: the `relative` is REQUIRED so that
          next/image `fill` children see a positioned parent (otherwise Next
          warns "parent with invalid position: static" and the image
          collapses to 0 height). `h-full w-full` propagates the outer
          wrapper's height down so `fill` children fill the reveal area. */}
      <motion.div
        className="relative h-full w-full"
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once, margin: "-80px" }}
        transition={transition}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
