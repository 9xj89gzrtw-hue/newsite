"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";
import type { ReactNode } from "react";

/** Cubic-bezier tuple type matching framer-motion's BezierDefinition. */
type Bezier = [number, number, number, number];

/**
 * Fade + rise on scroll-into-view. Respects reduced-motion.
 *
 * HYDRATION-SAFE (c109, паттерн C62/tott-parallax-band): useReducedMotion()
 * возвращает null на SSR и УЖЕ boolean на первом клиентском рендере —
 * ветвление `if (reduce)` в рендере давало hydration-mismatch у гостей с
 * prefers-reduced-motion (сервер: motion.div с initial-стилями, клиент:
 * голый div). Теперь обе стороны первого рендера идентичны (motion-ветка),
 * статика включается ТОЛЬКО после маунта — легальный post-hydration
 * апдейт. reduce-гость видит контент сразу (opacity не анимируется).
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  once = true,
  ease = [0.22, 1, 0.36, 1],
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
  /** Custom easing curve (default = Ridgewells editorial). */
  ease?: Bezier;
}) {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  if (reduce && mounted) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={reduce ? { opacity: 1, y: 0 } : undefined}
      animate={reduce ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once, margin: "-80px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  );
}
