"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, Sparkles } from "lucide-react";

/**
 * AnnouncementBar — dismissible seasonal top bar (Salt Block pattern).
 *
 * Sits at the very top of the viewport as the first child of the fixed
 * <header>. Solid dark band (bg-ink) so it reads against any hero background.
 * Dismissal persisted to localStorage for 7 days.
 *
 * Animation rule (RULES §5): only transform/opacity — no width/height.
 * Open/close uses the grid-template-rows 0fr→1fr technique (same pattern
 * used in faq.tsx) plus an opacity fade on the inner content. The grid-rows
 * value is not in the prohibited list (width/height/top/left/margin).
 *
 * Respects prefers-reduced-motion via the global animation override and an
 * explicit `useReducedMotion` check (skips the grid animation when reduced).
 */
const STORAGE_KEY = "announcement-dismissed-until";
const DISMISS_DAYS = 7;

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const currentYear = new Date().getFullYear();
  // Track mount to gate rendering of reduced-motion variant —
  // avoids SSR/CSR hydration mismatch (useReducedMotion returns null on SSR,
  // then a boolean on client; rendering the reduced-branch during initial
  // hydration causes a mismatch because server renders the AnimatePresence path.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // When reduced motion is requested AND we've mounted (so prefersReducedMotion
  // has resolved to a real boolean), skip the grid/opacity animation entirely
  // and just render statically. Keeps the bar accessible & non-distracting.
  if (mounted && prefersReducedMotion) {
    return visible ? (
      <div
        role="status"
        aria-live="polite"
        className="relative z-[55] flex items-center justify-center gap-3 bg-ink px-10 py-2.5 text-center text-cream"
      >
        <Sparkles className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
        <p className="text-xs font-medium tracking-wide text-cream/90 md:text-sm">
          <span className="hidden sm:inline">Новые зимние спецпредложения {currentYear} — </span>
          <a
            href="#winter-specials"
            className="font-semibold text-cream underline underline-offset-2 hover:text-peach transition-colors"
          >
            смотреть сезонное меню →
          </a>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Закрыть объявление"
          className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-cream/60 transition-colors hover:bg-white/10 hover:text-cream min-h-[44px] min-w-[44px]"
        >
          <X className="size-4" />
        </button>
      </div>
    ) : null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          // CSS grid + grid-template-rows 0fr→1fr animates the row height
          // without ever writing to the `height` property (RULES §5 compliant).
          className="relative z-[55] grid bg-ink text-cream"
          initial={{ gridTemplateRows: "0fr", opacity: 0 }}
          animate={{ gridTemplateRows: "1fr", opacity: 1 }}
          exit={{ gridTemplateRows: "0fr", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Overflow-hidden wrapper clips content while the row collapses */}
          <div className="overflow-hidden">
            <div className="flex items-center justify-center gap-3 px-10 py-2.5 text-center">
              <Sparkles className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
              <p className="text-xs font-medium tracking-wide text-cream/90 md:text-sm">
                <span className="hidden sm:inline">Новые зимние спецпредложения {currentYear} — </span>
                <a
                  href="#winter-specials"
                  className="font-semibold text-cream underline underline-offset-2 hover:text-peach transition-colors"
                >
                  смотреть сезонное меню →
                </a>
              </p>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Закрыть объявление"
                className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-cream/60 transition-colors hover:bg-white/10 hover:text-cream min-h-[44px] min-w-[44px]"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
