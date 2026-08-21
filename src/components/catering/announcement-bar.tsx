"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

/**
 * AnnouncementBar — Salt Block dismissible seasonal top bar (Cycle 26 refurb).
 *
 * Salt Block pattern (docs/SALTBLOCK-ANALYSIS.md §9.4 + §13.6 — P1 wow
 * moment, "dismissible announcement bar with future-dated scarcity"):
 * a slim dark band pinned to the very top of the viewport with future-dated
 * scarcity copy. Dismissal persisted to localStorage with a 14-day expiry —
 * recomputed from the stored timestamp on every mount so a stale dismissal
 * re-shows the bar automatically.
 *
 * Tokens (Cycle 26 Salt Block palette expansion, globals.css :root):
 *   bg     = var(--espresso)   #1A1B1A  — deep coffee-black, warmer than --night
 *   text   = var(--cream)      #F9FAFB  — same paper cream used everywhere
 *   accent = var(--honey)      #E0A94E  — warm amber for the → arrow + hover
 *
 * `data-tone="dark"` exposes the variant for downstream CSS overrides.
 *
 * Animation (RULES §5): only transform/opacity — no width/height/top/left.
 * Slide-down uses y translate (-20 → 0) + opacity fade. Respects
 * prefers-reduced-motion via the global override + an explicit gate (skip
 * the motion wrapper and render statically when reduced, avoiding SSR/CSR
 * hydration mismatch from useReducedMotion returning null on server).
 */
const STORAGE_KEY = "sb-announcement-dismissed-v1";
const DISMISS_DAYS = 14;
const DISMISS_MS = DISMISS_DAYS * 24 * 60 * 60 * 1000;

// Future-dated scarcity copy (per Task 6-B spec):
//   prefix  = "Бронирование на сезон 2026–2027 уже открыто"
//   cta     = "посмотреть калькулятор →"
// Click target: #calculator (verified present on page.tsx via calculator.tsx).
const COPY_PREFIX = "Бронирование на сезон 2026–2027 уже открыто";
const COPY_CTA = "посмотреть калькулятор →";
const CTA_HREF = "#calculator";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  // Track mount to gate rendering of the reduced-motion variant —
  // avoids SSR/CSR hydration mismatch (useReducedMotion returns null on SSR,
  // then a boolean on client; rendering the reduced-branch during initial
  // hydration causes a mismatch because server renders the AnimatePresence path).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const dismissedAt = raw ? Number(raw) : 0;
      if (!dismissedAt || Date.now() - dismissedAt > DISMISS_MS) {
        // No prior dismissal OR dismissal expired (> 14 days) → show.
        if (dismissedAt) {
          window.localStorage.removeItem(STORAGE_KEY);
        }
        setVisible(true);
      } else {
        setVisible(false);
      }
    } catch {
      // localStorage unavailable — show by default.
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore — non-critical.
    }
  };

  // Reduced-motion path: render statically (no slide-down animation).
  if (mounted && prefersReducedMotion) {
    return visible ? (
      <div
        data-component="sb-announcement-bar"
        data-tone="dark"
        role="status"
        aria-live="polite"
        className="relative z-[55] flex items-center justify-center gap-2 px-10 py-2.5 text-center"
        style={{
          backgroundColor: "var(--espresso)",
          color: "var(--cream)",
        }}
      >
        <p className="text-xs font-medium tracking-wide md:text-sm">
          <span className="hidden sm:inline">{COPY_PREFIX} — </span>
          <a
            href={CTA_HREF}
            className="font-semibold underline underline-offset-2 transition-colors"
            style={{ color: "var(--honey)" }}
          >
            {COPY_CTA}
          </a>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Закрыть объявление"
          className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-white/10 min-h-[44px] min-w-[44px]"
          style={{ color: "color-mix(in srgb, var(--cream) 60%, transparent)" }}
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
          data-component="sb-announcement-bar"
          data-tone="dark"
          role="status"
          aria-live="polite"
          className="relative z-[55] overflow-hidden"
          style={{
            backgroundColor: "var(--espresso)",
            color: "var(--cream)",
          }}
          initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-center gap-2 px-10 py-2.5 text-center">
            <p className="text-xs font-medium tracking-wide md:text-sm">
              <span className="hidden sm:inline">{COPY_PREFIX} — </span>
              <a
                href={CTA_HREF}
                className="font-semibold underline underline-offset-2 transition-colors"
                style={{ color: "var(--honey)" }}
              >
                {COPY_CTA}
              </a>
            </p>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Закрыть объявление"
              className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-white/10 min-h-[44px] min-w-[44px]"
              style={{
                color: "color-mix(in srgb, var(--cream) 60%, transparent)",
              }}
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AnnouncementBar;
