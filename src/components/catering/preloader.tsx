"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Preloader — LIGHT THEME
 * 
 * 4-panel door preloader with cream/gold colors.
 * Only shows on first visit per session.
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
    const t = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("catering-preloaded", "1");
      setTimeout(() => setDone(true), 900);
    }, 1400);
    return () => clearTimeout(t);
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
            >
              <div className="flex h-full items-center justify-center">
                {i === 1 && (
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <span className="font-display text-3xl md:text-5xl gradient-text">
                      Interfood
                    </span>
                    <span className="mt-2 block font-mono text-xs uppercase tracking-[0.4em] text-gold/60">
                      Кейтеринг
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
