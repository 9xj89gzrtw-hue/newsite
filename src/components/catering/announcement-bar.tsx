"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";

/**
 * AnnouncementBar — dismissible seasonal top bar (Salt Block pattern).
 *
 * Sits at the very top of the viewport as the first child of the fixed
 * <header>. Solid dark band (bg-ink) so it reads against any hero background.
 * Dismissal persisted to localStorage for 7 days.
 *
 * Respects prefers-reduced-motion via the global animation override.
 */
const STORAGE_KEY = "announcement-dismissed-until";
const DISMISS_DAYS = 7;

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const until = raw ? Number(raw) : 0;
      if (!until || Date.now() > until) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable — show by default.
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000),
      );
    } catch {
      // ignore — non-critical.
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          className="relative z-[55] flex items-center justify-center gap-3 bg-ink px-10 py-2.5 text-center text-cream"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Sparkles className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
          <p className="text-xs font-medium tracking-wide text-cream/90 md:text-sm">
            <span className="hidden sm:inline">Сезонные свадебные меню 2026 — </span>
            <a
              href="#menu"
              className="font-semibold text-gold underline underline-offset-2 hover:text-peach transition-colors"
            >
              смотреть меню →
            </a>
          </p>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Закрыть объявление"
            className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-cream/60 transition-colors hover:bg-white/10 hover:text-cream"
          >
            <X className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
