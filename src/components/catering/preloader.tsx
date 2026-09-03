"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
 * The caption "NILOV CATERING" fades in under the badge. Exit: the badge
 * cluster fades out just BEFORE the doors sweep up (it rides the first
 * panel), doors keep their original y:-100% stagger choreography.
 * prefers-reduced-motion: the effect below removes the doors instantly on
 * mount — the preloader never animates at all.
 *
 * W4-FIX (FOUC/SSR-двери): `show` starts as TRUE so the doors are part of
 * the SSR HTML — previously useState(false) + a post-hydration effect
 * meant the hero flashed for a frame BEFORE the doors appeared (SSR markup
 * had no preloader at all). Now the first painted frame is always the
 * doors; the effect decides immediately: reduced-motion → remove; session
 * flag (repeat visit) → remove; otherwise run the 450ms dwell + ~0.35s
 * exit as before. No-JS fallback: layout.tsx ships a <noscript> style that
 * hides [data-preloader-root] so the doors never trap a JS-less visitor
 * (see the data-preloader-root attribute on the root below).
 *
 * C71-P1 / K8-CRITICAL (Task 1): прежний тайминг (dwell 1400ms + exit
 * 0.8s + 3×0.08s stagger = 1.04s) держал opaque-оверлей ~2.5s и воровал
 * ~1.2s LCP (замер K8: 4496ms с прелоадером vs 3324ms без). Дизайн-суть
 * (бейдж-спринг + дверная шторка) сохранена, но в ~3× быстрее: dwell
 * 450ms, панели 0.3s с микро-стаггером 0.015s (итог ≤0.35s), полный
 * уход из DOM ≤0.9s. sessionStorage/reduced-motion гейты НЕ тронуты.
 */
export function Preloader() {
  // W4-FIX: TRUE из SSR — двери в первом кадре (см. докстринг выше).
  const [show, setShow] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Двери уже в HTML — убираем их мгновенно, без анимаций.
      setDone(true);
      return;
    }
    if (sessionStorage.getItem("catering-preloaded")) {
      // Повторный заход за сессию: двери из SSR гасим сразу (без exit-облёта).
      setShow(false);
      setDone(true);
      return;
    }
    // show уже true (SSR-двери) — просто ставим таймеры.
    // C71-P1 (K8-CRITICAL): dwell 1400 → 450ms. Exit-анимация панелей:
    // 0.3s + 3×0.015s микро-стаггер ≈ 0.345s — exitTimer 450ms даёт полный
    // дожор + ~100ms запаса на композицию кадра (прежний W2-фикс держал
    // 1200ms под 1.04s-выход). Итог: оверлей ≤0.9s от гидрации.
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    const t = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("catering-preloaded", "1");
      exitTimer = setTimeout(() => setDone(true), 450);
    }, 450);
    return () => {
      clearTimeout(t);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, []);

  if (done) return null;

  const panels = [0, 1, 2, 3];
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          data-preloader-root
          className="fixed inset-0 z-[10000] flex"
          initial={{ opacity: 1 }}
          exit={{ opacity: 1 }}
        >
          {/* NILOV badge cluster — screen-centered, floating above the doors.
              pointer-events-none so it never blocks the page beneath.
              NB: no initial/animate on this wrapper (entrance is carried by
              the badge spring / ring pulses / caption fade below) — a
              wrapper-level opacity tween registered zero-to-one but never
              painted in framer-motion's PresenceChild context, leaving the
              whole cluster invisible. The wrapper only OWNS the exit fade. */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center"
            exit={{ opacity: 0, transition: { duration: 0.18, ease: "easeOut" } }}
          >
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
          </motion.div>

          {panels.map((i) => (
            <motion.div
              key={i}
              className="h-full flex-1 bg-gradient-to-b from-cream to-parchment border-r border-white/20 last:border-r-0"
              initial={{ y: 0 }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              /* C71-P1 (K8-CRITICAL): прежний выход 0.8s + 0.08s-стаггер
                 (=1.04s) — теперь 0.3s + микро-стаггер 0.015s (итог
                 ≤0.345s): та же дверная шторка, втрое быстрее, без
                 длинных стаггер-цепочек. */
              transition={{
                duration: 0.3,
                delay: i * 0.015,
                ease: [0.83, 0, 0.17, 1],
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
