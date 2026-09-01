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
 * prefers-reduced-motion: the gate below returns early — the preloader
 * never renders at all (unchanged behavior).
 */
export function Preloader() {
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (sessionStorage.getItem("catering-preloaded")) {
      setDone(true);
      return;
    }
    setShow(true);
    // W2-FIX: внутренний таймер cleanup + 900 → 1200ms. Exit-анимация
    // панелей: 0.8s + 3×0.08s stagger = 1.04s — при 900ms последняя дверь
    // обрывалась на полёте (AnimatePresence вырезал её раньше конца).
    // 1200ms даёт полный дожор + 160ms запас на композицию кадра.
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    const t = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("catering-preloaded", "1");
      exitTimer = setTimeout(() => setDone(true), 1200);
    }, 1400);
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
            exit={{ opacity: 0, transition: { duration: 0.25, ease: "easeOut" } }}
          >
            <div className="relative flex items-center justify-center">
              {/* Gold pulse rings — expand from the badge edge, 2 staggered
                  cycles each (transform/opacity only). */}
              {[0, 1].map((r) => (
                <motion.span
                  key={r}
                  className="absolute inset-0 rounded-full border-[1.5px] border-[#D4A574]"
                  aria-hidden
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: [0.95, 1.12, 1.8], opacity: [0, 0.7, 0] }}
                  transition={{
                    duration: 0.55,
                    repeat: 2,
                    delay: 0.35 + r * 0.15,
                    ease: "easeOut",
                    times: [0, 0.2, 1],
                  }}
                />
              ))}
              {/* The round NILOV badge — black circle, white letters, gold
                  arcs. Spring entrance: scale 0.6→1, rotate -8°→0, light
                  bounce. `unoptimized`: the preloader lives 1.4s — the
                  /_next/image optimizer round-trip (slow on first, cold
                  request) could outlive it and leave empty doors; the raw
                  256px PNG is only 41KB, so it is served as-is. */}
              <motion.div
                initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                  delay: 0.15,
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
            {/* Caption — spaced caps, gold, fades in after the badge lands. */}
            <motion.span
              className="tott-body mt-5 text-[11px] font-700 uppercase tracking-[0.35em] text-gold/70"
              style={{ fontWeight: 700 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
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
              transition={{
                duration: 0.8,
                delay: i * 0.08,
                ease: [0.83, 0, 0.17, 1],
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
