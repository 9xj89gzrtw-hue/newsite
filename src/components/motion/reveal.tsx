"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion"; /* 81-F4 [P7,
  бандл-дедуп]: раньше импорт шёл из второго пакета motion (re-export
  того же API при установленном framer-motion@12) — это второй экземпляр
  того же рантайма анимации в бандле (дубль чанков). Экспорты,
  используемые здесь (motion, useReducedMotion), идентичны в обоих. */
import * as React from "react";

type RevealProps = {
  children: React.ReactNode;
  /** Delay in seconds before the reveal starts. */
  delay?: number;
  /** Y-offset in px the element travels from. */
  y?: number;
  className?: string;
  /** Trigger once vs. every time it enters the viewport. */
  once?: boolean;
};

/**
 * Fade + rise on scroll-into-view. The workhorse micro-interaction for the
 * whole site. Respects `prefers-reduced-motion` (renders children static).
 *
 * Uses `framer-motion` — единая моушн-библиотека сайта (81-F4: дедуп,
 * раньше этот файл единственный тянул второй пакет-двойник).
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  once = true,
}: RevealProps) {
  const reduce = useReducedMotion();
  // C62 hydration-safety: branch the tree only after mount (SSR/client parity
  // on the first render; reduce swaps in post-hydration — legal).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (mounted && reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1], // easeOutExpo-ish
      }}
    >
      {children}
    </motion.div>
  );
}
