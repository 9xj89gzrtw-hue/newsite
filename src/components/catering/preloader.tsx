"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Preloader — LIGHT THEME
 *
 * 4-panel door preloader with cream/gold colors.
 * Only shows on first visit per session.
 *
 * Task 6-D (nilov rebrand): the text wordmark center is replaced by the
 * round NILOV badge — black circle on cream doors (max contrast). Entrance:
 * spring scale 0.6→1 + rotate -8°→0 with a light bounce, followed by two
 * gold pulse rings expanding from the badge edge (scale + opacity only —
 * no layout-affecting properties, per AGENTS.md animation rules).
 * The caption "NILOV CATERING" fades in under the badge.
 *
 * ══ 81-F1 (performance fixer, критик 81-W1-D): ВЫХОД ДВЕРЕЙ — CSS-ТАЙМЛАЙН,
 * не framer-after-hydration. Прежний механизм держал opaque-двери до
 * гидрации + 450ms dwell + 345ms exit — на медленном мобиле это 8-9s
 * поверх LCP. Теперь:
 *   • панели (.pre-panel, keyframes pre-panel-exit в globals.css) уходят
 *     шторкой вверх через 0.45s от загрузки стилей (0.3s +
 *     var(--i)*0.015s микро-стаггер — хореография та же);
 *   • бейдж-кластер (.pre-cluster) растворяется fade-out 0.18s на 0.45s;
 *   • корень [data-preloader-root] в 0.82s уходит из потока событий
 *     (visibility/pointer-events) — тапы сквозь оверлей свободны ДО
 *     JS-чистки; итог: hero открыт ≤0.8s от первого кадра БЕЗ JavaScript;
 *   • ЭТОТ компонент после гидрации только ЧИСТИТ DOM (setDone ~1.2s от
 *     монта — страховка от вечного z-10000 слоя) и ставит sessionStorage.
 *     Двери он БОЛЬШЕ НЕ ДЕРЖИТ — show-стейт/AnimatePresence не нужны.
 *   • Вход бейджа/колец/caption остался на framer (декор, не блокирует
 *     LCP): при поздней гидрации они просто не успевают появиться —
 *     кластер уже растворён CSS. Входы БЕЗ exit-пропов (выход — CSS).
 *   • Повторный визит за сессию: инлайн-скрипт в начале <body>
 *     (layout.tsx) ставит [data-no-preloader] на <html> до парсинга
 *     дверей → CSS глушит их display:none первым же стайл-резолвом.
 *   • prefers-reduced-motion: display:none из CSS — двери не красятся
 *     вовсе (раньше убирались на гидрации); no-JS: noscript-стиль
 *     layout.tsx (см. data-preloader-root на корне ниже).
 */
export function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Reduced-motion: CSS уже погасил двери (display:none) — чистим DOM.
      setDone(true);
      return;
    }
    // Session-флаг для СЛЕДУЮЩЕЙ навигации (повторный визит прячется
    // инлайн-скриптом layout.tsx + CSS [data-no-preloader] ещё до гидрации).
    sessionStorage.setItem("catering-preloaded", "1");
    // Страховка-DOM-чистка: двери уже ушли CSS-таймлайном (≤0.8s от paint),
    // корень вне потока событий с 0.82s — здесь только убираем слой из DOM.
    const t = setTimeout(() => setDone(true), 1200);
    return () => clearTimeout(t);
  }, []);

  if (done) return null;

  const panels = [0, 1, 2, 3];
  return (
    <div data-preloader-root className="fixed inset-0 z-[10000] flex">
      {/* NILOV badge cluster — screen-centered, floating above the doors.
          pointer-events-none so it never blocks the page beneath.
          NB: no entrance on this wrapper (carried by the badge spring /
          ring pulses / caption fade below); the wrapper only OWNS the CSS
          exit fade (.pre-cluster — см. globals.css, 81-F1). */}
      <div className="pre-cluster pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Gold pulse rings — expand from the badge edge, 2 staggered
              cycles each (transform/opacity only). C71-P1: тайминги
              сжаты под 450ms-долл (0.55/0.35+r*0.15 → 0.3/0.12+r*0.08). */}
          {[0, 1].map((r) => (
            <motion.span
              key={r}
              className="absolute inset-0 rounded-full border-[1.5px] border-[#D4A574]"
              aria-hidden
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: [0.95, 1.12, 1.8], opacity: [0, 0.7, 0] }}
              transition={{
                duration: 0.3,
                repeat: 2,
                delay: 0.12 + r * 0.08,
                ease: "easeOut",
                times: [0, 0.2, 1],
              }}
            />
          ))}
          {/* The round NILOV badge — black circle, white letters, gold
              arcs. Spring entrance: scale 0.6→1, rotate -8°→0, light
              bounce. C71-P1: пружина жёстче (260/18 → 320/22) и старт
              раньше (0.15 → 0.05) — бейдж успевает «приземлиться» внутри
              450ms-долла. `unoptimized`: the preloader lives <0.5s — the
              /_next/image optimizer round-trip (slow on first, cold
              request) could outlive it and leave empty doors; the raw
              256px PNG is only 41KB, so it is served as-is. */}
          <motion.div
            initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 22,
              delay: 0.05,
            }}
          >
            <Image
              src="/brand/logo-256.png"
              alt="Логотип nilov catering — круглый бейдж"
              width={256}
              height={256}
              priority
              unoptimized
              className="size-[120px] md:size-[150px]"
            />
          </motion.div>
        </div>
        {/* Caption — spaced caps, gold, fades in after the badge lands.
            C71-P1: delay 0.55 → 0.2, duration 0.5 → 0.3 (вписывается в
            450ms-долл вместе со спрингом бейджа). */}
        <motion.span
          className="tott-body mt-5 text-[11px] font-700 uppercase tracking-[0.35em] text-gold/70"
          style={{ fontWeight: 700 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          NILOV&nbsp;CATERING
        </motion.span>
      </div>

      {/* Door panels — 81-F1: ВЫХОД на CSS (.pre-panel → pre-panel-exit
          0.3s cubic-bezier(.83,0,.17,1), delay calc(.45s + var(--i)*.015s),
          fill both — см. globals.css). Тот же градиент/бордюры/стаггер,
          что и раньше; --i — микро-стаггер панелей (0/1/2/3). */}
      {panels.map((i) => (
        <div
          key={i}
          className="pre-panel h-full flex-1 bg-gradient-to-b from-cream to-parchment border-r border-white/20 last:border-r-0"
          style={{ "--i": i } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
