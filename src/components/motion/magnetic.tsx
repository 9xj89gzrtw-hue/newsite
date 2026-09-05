"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Magnetic — wraps a child and translates it toward the cursor on mousemove
 * (desktop / fine-pointer only). Spring-smoothed for a luxurious "alive" feel.
 *
 * GATES (c83-F1): reduce-motion и fine-pointer ((hover: hover) and
 * (pointer: fine)) проверяются ЗДЕСЬ — тач/coarse и reduce получают plain
 * div (тот же className, без обработчиков; SSR-рендер = plain, desktop
 * флипается после маунта). Потребителю внешний гейт не нужен.
 *
 * Apply ONLY to 2–4 primary CTAs — never everywhere (kills the effect).
 *
 * Reference: Olivier Larose magnetic-button tutorial, Awwwards signature interaction.
 */
export function Magnetic({
  children,
  strength = 0.3,
  className,
}: {
  children: ReactNode;
  /** 0.2 = subtle, 0.35 = strong. Default 0.3. */
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // C62 hydration-safety: branch the tree only after mount — reduce flips
  // post-hydration (legal), a direct branch mismatches SSR vs client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // c83-F1 (критик-P1, MAJOR): fine-pointer гейт (паттерн site-header.tsx).
  // На тач/coarse-поинтерах тап эмулирует mousemove — CTA пружинно срывался
  // с места при клике. SSR/гидрация = false (обе ветки рендерят plain-div
  // без обработчиков); desktop-магнит включается только после маунта.
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFinePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.3 });

  // Plain-ветка: та же div-обёртка (className держит layout потребителей),
  // но без motion-значений и mousemove/mouseleave-обработчиков. Условия:
  // до маунта (SSR/гидрация — совпадение веток, грабля §34), reduce-motion,
  // не-fine-pointer (тач). reduce читается ТОЛЬКО после маунта — на сервере
  // он false, прямой ветвь дал бы mismatch.
  if (!mounted || !finePointer || reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
