"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   VelocitySkew — Cycle 71 (Task 1-c1). «Живой материал» на скролле:
   полосы/контент чуть «запинаются» (skewY) при быстрой прокрутке и упруго
   возвращаются, когда скролл останавливается. Классический velocity-приём
   Awwwards (useScroll → useVelocity → useSpring → skew), R1-report §4.

   Архитектура (§35-дисциплина MotionValue): НОЛЬ setState на кадр —
   одна цепочка MotionValue (scrollY → velocity → spring → clamped deg),
   подписки framer'а пишут transform напрямую в DOM.

   Грабли, учтённые здесь:
   - §34: useReducedMotion() = hydration-мина при ветвлении дерева → SSR и
     первый клиентский рендер идентичны (motion.div со skewY-MotionValue,
     значение 0 = тождественный transform); reduce-ветка снимает MotionValue
     из style ТОЛЬКО пост-монт (settled-гейт, как reveal.tsx:32-35).
   - §34 (fixed-attachment): НЕ вешать на предков слоёв с
     background-attachment: fixed. Обёртка tott-фото живёт на coarse-указателе,
     где fixed-attachment и так выключен CSS-фоллбэком; десктоп-фото не трогаем.
   - Кламп жёсткий: ±4° fine pointer / ±3° coarse или <768px — тонко-
     премиально, не цирк. transform-only (GPU, RULES §5).
   ═══════════════════════════════════════════════════════════════════════════ */

/** px/сек скролла, при которой fine-указатель достигает клампа ±maxDeg.
 * Замер: флик колесом ~2000–4000 px/s, мобильный momentum ~3000–6000 px/s —
 * 3000 px/s = полный наклон только на действительно быстрой прокрутке. */
const FULL_VELOCITY_PX_S = 3000;
/** Фиксированный масштаб px/s → градусы (maxDeg / FULL_VELOCITY_PX_S). */
const DEG_PER_PX_S = 4 / FULL_VELOCITY_PX_S;
/** Пружина возврата: упруго, без колебаний (R1-report: stiffness 300 / damping 50). */
const SPRING = { stiffness: 300, damping: 50 } as const;
/** coarse-указатель ИЛИ узкий экран → мягче кламп (мобильный вау-приоритет,
 * но осторожнее амплитуда — заповедь «тонко-премиально»). */
const COARSE_MQ = "(pointer: coarse), (max-width: 767px)";

/**
 * useVelocitySkewDeg — живой MotionValue угла наклона (deg), следящий за
 * скоростью скролла страницы. Возвращает 0 в покое (SSR/статика), клампнутые
 * ±maxDeg / ±maxDegCoarse в движении. Экспортирован отдельно: тот же value
 * можно вплести в уже существующий style (tott-фото: y + skewY одним
 * transform-ом), не заводя лишнюю обёртку.
 */
export function useVelocitySkewDeg(
  maxDeg = 4,
  maxDegCoarse = 3,
): MotionValue<number> {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, SPRING);

  // Текущий кламп — тоже MotionValue: кламп живёт ВНУТРИ трансформера,
  // поэтому смена coarse→fine перевооружает кламп без пересоздания подписок.
  const maxMV = useMotionValue(maxDeg);
  React.useEffect(() => {
    const mq = window.matchMedia(COARSE_MQ);
    const update = () => maxMV.set(mq.matches ? maxDegCoarse : maxDeg);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [maxDeg, maxDegCoarse, maxMV]);

  // Мульти-вход: пересчёт при изменении ЛЮБОГО входа (velocity или клампа) —
  // гарантия motion API, закрытых состояний в замыкании нет.
  return useTransform([smooth, maxMV], (values: number[]) => {
    const [v, max] = values;
    const raw = -v * DEG_PER_PX_S; // вниз → отрицательный наклон (канон приёма)
    return Math.min(max, Math.max(-max, raw));
  });
}

interface VelocitySkewProps {
  children: React.ReactNode;
  className?: string;
  /** Статические стили обёртки (height/позиционирование) — мерджатся со skewY. */
  style?: React.CSSProperties;
  /** Кламп наклона (°) для fine-pointer. @default 4 */
  maxDeg?: number;
  /** Кламп наклона (°) для coarse-указателя / <768px. @default 3 */
  maxDegCoarse?: number;
}

/**
 * VelocitySkew — обёртка (div), наклоняющая детей по скорости скролла.
 * SSR-safe: серверный HTML без трансформа (значение 0 = тождество).
 * prefers-reduced-motion → обёртка рендерится без skewY (settled-гейт §34).
 */
export function VelocitySkew({
  children,
  className,
  style,
  maxDeg = 4,
  maxDegCoarse = 3,
}: VelocitySkewProps) {
  const reduce = useReducedMotion();
  // §34: первый клиентский рендер = SSR (skewY на месте, значение 0);
  // снятие MotionValue — только пост-гидрации.
  const mounted = useMounted();
  const reduceSettled = mounted && !!reduce;

  const skewY = useVelocitySkewDeg(maxDeg, maxDegCoarse);

  return (
    <motion.div
      data-velocity-skew=""
      className={cn(className)}
      style={reduceSettled ? style : { ...style, skewY }}
    >
      {children}
    </motion.div>
  );
}

export default VelocitySkew;
