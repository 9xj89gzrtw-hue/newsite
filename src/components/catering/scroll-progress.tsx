import "@/components/motion/c74-kinetic.css";

/**
 * ScrollProgress — Cycle 74 «Kinetic September 2026» (E1).
 *
 * Полоса прогресса чтения — ЧИСТЫЙ CSS scroll-driven animation
 * (`animation-timeline: scroll(root)`, Josh Comeau 04.2026 / MDN):
 * ноль JavaScript-кадров, ноль листенеров, работает на десктопе
 * и на touch-скролле одинаково (нативный таймлайн следует реальному
 * scrollTop, Lenis пишет настоящий scroll — таймлайн это видит).
 *
 * Server Component: разметка одна, вся логика — в c74-kinetic.css.
 * Деградации (CSS-гварды, см. файл): prefers-reduced-motion, браузеры
 * без animation-timeline, печать → полоса не рендерится вовсе.
 *
 * z-90 — над sticky-хедером (z-50): полоса 2px лежит на верхней кромке
 * хедера, как на joshwcomeau.com; aria-hidden — чистая декорация.
 */
export function ScrollProgress() {
  return <div className="scroll-progress" aria-hidden="true" />;
}

export default ScrollProgress;
