"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";

/**
 * EaCookieBanner — Elegant Affairs single-line cookie banner (Cycle 28).
 *
 * Replaces the Cycle 26 glassmorphism CookieConsent (bottom-anchored, gold
 * border, backdrop-blur-xl, spring entrance) per AGENTS.md §17 TODO + audit
 * §3.1.4 (VLM-flagged as visually too heavy on the hero). The EA editorial
 * answer is a single 1px-tall bar pinned to the TOP of the viewport — pure
 * black bg, 1px red bottom border, cream text, 3 small Barlow Semi Condensed
 * Bold uppercase buttons aligned right (EA-ANALYSIS.md §1, §2, §3.15, §5.4).
 * Restraint principle: ONE accent moment per block — only "Accept all"
 * is filled (red bg + red border). Reject + Essential-only are 1px cream
 * outlines on transparent bg.
 *
 * BEHAVIOUR (mirrors announcement-bar.tsx 14-day re-prompt pattern):
 *   - 3 localStorage keys, each suffixed `:YYYY-MM-DD`. On mount, sweep all
 *     3 — if any value's timestamp is older than 14 days, clear it (banner
 *     re-shows). Otherwise hide if ANY active choice exists.
 *   - AnimatePresence + motion.div slide-in from top (y: -100 → 0, 400ms
 *     ease-out); slide-out on dismiss. prefers-reduced-motion → opacity only.
 *   - role="region" + aria-label="Cookie consent". NOT a dialog and NOT
 *     modal: NO focus trap — Tab moves through the links/buttons and
 *     continues into the page naturally (FIX-5, WCAG 2.1.2 / W1-D F5).
 *     Escape NOT bound. Body scroll NOT locked.
 *   - "Accept all" enables analytics — actual Yandex.Metrika loading is
 *     handled elsewhere; this stub just console.logs (per Cycle 28 spec §4).
 *
 * z-[80] (Cycle 39 bottom-dock keeps the sticky header visible; above
 * site-header z-50 + announcement-bar z-55, below the mobile-menu overlay
 * which renders later in the DOM so stacks above naturally).
 */

const DISMISS_DAYS = 14;
const DISMISS_MS = DISMISS_DAYS * 24 * 60 * 60 * 1000;

const KEYS = {
  rejected: "ea-cookie-rejected",
  essential: "ea-cookie-essential",
  accepted: "ea-cookie-accepted",
} as const;

type Choice = keyof typeof KEYS;

const LINK_PRIVACY_HREF = "/privacy";
const LINK_TERMS_HREF = "/terms";

// Tailwind classnames hoisted so AnimatePresence child JSX stays readable.
// W2-FIX: py-2.5 → py-4 (компенсация -my-4) — тач-таргет ссылки
// 39 → ~43px (≥40px; инлайн-бокс даёт content ~11px + 2×16px паддинг)
// при том же визуальном размере текста 10.5px.
const LINK_CLASS =
  "no-underline text-[var(--ea-red)] transition-colors hover:text-[var(--ea-red-deep)] hover:underline focus-visible:underline py-4 -my-4";
const BTN_OUTLINE_CLASS =
  "border border-[var(--ea-cream)] bg-transparent text-[var(--ea-cream)] hover:bg-white/10 focus-visible:bg-white/10";
const BTN_SOLID_CLASS =
  "border border-[var(--ea-red)] bg-[var(--ea-red)] text-[var(--ea-cream)] hover:border-[var(--ea-red-deep)] hover:bg-[var(--ea-red-deep)] focus-visible:border-[var(--ea-red-deep)] focus-visible:bg-[var(--ea-red-deep)]";

const BTN_BASE_STYLE: CSSProperties = {
  fontFamily: "var(--ea-font-eyebrow)",
  fontWeight: 700,
  /* размер/паддинги — классами: на мобильном баннер сжимается в одну
     компактную строку (3 независимых слепых критика C59: на iPhone
     баннер закрывал зону CTA панели меню) */
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  lineHeight: 1,
  borderRadius: 0,
  cursor: "pointer",
  transition:
    "background-color 200ms ease, border-color 200ms ease, color 200ms ease",
  /* FIX-5 (W1-D NIT): тач-таргет 40 → 44px (WCAG 2.5.5 / Apple HIG);
     на 390px все три кнопки остаются в один ряд (замер в worklog). */
  minHeight: 44,
  minWidth: 44,
};

/** Format today's date as YYYY-MM-DD for the localStorage timestamp suffix. */
function todayStamp(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Parse "true:YYYY-MM-DD" → epoch ms (0 if malformed). Permissive: takes
 *  everything after the first colon so the boolean suffix may evolve. */
function parseStamp(value: string): number {
  const idx = value.indexOf(":");
  if (idx < 0) return 0;
  const t = Date.parse(value.slice(idx + 1));
  return Number.isNaN(t) ? 0 : t;
}

function isExpired(stampMs: number): boolean {
  if (!stampMs) return true;
  return Date.now() - stampMs > DISMISS_MS;
}

/** On mount, sweep all 3 keys. Remove any whose timestamp is older than
 *  DISMISS_DAYS so the banner re-shows after the cool-off window expires. */
function clearStaleChoices(): void {
  try {
    (Object.keys(KEYS) as Choice[]).forEach((k) => {
      const raw = window.localStorage.getItem(KEYS[k]);
      if (raw && isExpired(parseStamp(raw))) {
        window.localStorage.removeItem(KEYS[k]);
      }
    });
  } catch {
    // localStorage unavailable — non-critical, banner will show by default.
  }
}

/** True iff any of the 3 keys holds a non-expired choice. */
function hasActiveChoice(): boolean {
  try {
    return (Object.keys(KEYS) as Choice[]).some((k) => {
      const raw = window.localStorage.getItem(KEYS[k]);
      return !!raw && !isExpired(parseStamp(raw));
    });
  } catch {
    return false; // localStorage unavailable → show banner by default.
  }
}

function writeChoice(choice: Choice): void {
  try {
    window.localStorage.setItem(KEYS[choice], `true:${todayStamp()}`);
  } catch {
    // localStorage unavailable — non-critical.
  }
}

export function EaCookieBanner() {
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Mount: clear stale (>14 days) choices, then decide whether to show.
  useEffect(() => {
    clearStaleChoices();
    setVisible(!hasActiveChoice());
  }, []);

  // Cycle 41 / FIX-5: flag on <body> so fixed elements (phone FAB) can
  // shift out of the banner's footprint while it is open and globals.css
  // can reserve bottom padding (footer copyright overlap). Synced to
  // `visible`: previously the class was set once on mount and only the
  // component-unmount cleanup removed it — but this component stays
  // mounted forever (only the inner motion.div unmounts), so the flag
  // (and any CSS hooked on it) stuck on <body> after the visitor made
  // their choice.
  useEffect(() => {
    document.body.classList.toggle("cookie-banner-open", visible);
    return () => document.body.classList.remove("cookie-banner-open");
  }, [visible]);

  // Cycle 40 fix: NO programmatic focus on the first link — it painted a
  // persistent focus ring for every visitor (focus() ≠ :focus-visible).
  // Keyboard users reach the banner naturally via Tab (it's early in DOM
  // order).
  //
  // FIX-5 (W1-D F5, WCAG 2.1.2 «No keyboard trap»): this banner is a
  // NON-modal region, so there is deliberately NO focus trap — the old
  // keydown handler cycled Tab inside the banner forever (Политика →
  // Условия → Принять → Политика). Removed; Tab now leaves the banner in
  // natural DOM order.

  const decide = (choice: Choice) => {
    writeChoice(choice);
    setVisible(false);
    if (choice === "accepted") {
      // Analytics loader hook lives elsewhere (Cycle 28 spec — TBD).
      // For now, just log the consent decision so it's visible in dev.
      console.info(
        "[ea-cookie-banner] analytics consent granted — Yandex.Metrika loader TBD",
      );
    }
  };

  const initial = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 100 };
  const animate = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0 };
  const exit = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 100 };
  const transition = prefersReducedMotion
    ? { duration: 0.3 }
    : { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label="Уведомление об использовании cookies"
          data-component="ea-cookie-banner"
          /* Cycle 39 fix: docked to the BOTTOM — previously top-0 z-60 exactly
             covered the sticky header (nav/phone/CTA invisible until consent). */
          className="fixed inset-x-0 bottom-0 z-[80] w-full"
          style={{
            background: "rgba(0, 0, 0, 0.96)",
            borderTop: "1px solid var(--ea-red)",
            color: "var(--ea-cream)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
        >
          <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-1.5 px-3 py-2 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-3 md:px-12">
            <p
              className="m-0 max-w-[68ch] text-[10.5px] leading-snug sm:text-[13px]"
              style={{
                fontFamily: "var(--ea-font-body)",
                color: "color-mix(in srgb, var(--ea-cream) 85%, transparent)",
              }}
            >
              Мы используем cookies для аналитики. Подробнее:{" "}
              <a
                href={LINK_PRIVACY_HREF}
                target="_blank"
                rel="noopener"
                className={LINK_CLASS}
              >
                Политика
              </a>{" "}
              и{" "}
              <a
                href={LINK_TERMS_HREF}
                target="_blank"
                rel="noopener"
                className={LINK_CLASS}
              >
                Условия
              </a>.
            </p>
            <div className="flex w-full shrink-0 flex-row flex-wrap items-center justify-end gap-1.5 sm:w-auto sm:gap-2 md:gap-3">
              <button
                type="button"
                onClick={() => decide("rejected")}
                style={BTN_BASE_STYLE}
                className="px-2.5 py-2 text-[10.5px] sm:px-4 sm:text-[12px]"
              >
                Отклонить
              </button>
              <button
                type="button"
                onClick={() => decide("essential")}
                style={BTN_BASE_STYLE}
                className="px-2.5 py-2 text-[10.5px] sm:px-4 sm:text-[12px]"
              >
                <span className="sm:hidden">Необходимые</span>
                <span className="hidden sm:inline">Только необходимые</span>
              </button>
              <button
                type="button"
                onClick={() => decide("accepted")}
                style={BTN_BASE_STYLE}
                className="px-2.5 py-2 text-[10.5px] sm:px-4 sm:text-[12px]"
              >
                Принять все
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EaCookieBanner;
