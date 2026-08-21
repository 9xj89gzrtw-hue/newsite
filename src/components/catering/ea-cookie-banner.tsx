"use client";

import { useEffect, useRef, useState } from "react";
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
 *   - role="region" + aria-label="Cookie consent". Focus trap inside the
 *     banner; Tab cycles within text links + buttons. Escape NOT bound
 *     (not modal). Body scroll NOT locked.
 *   - "Accept all" enables analytics — actual Yandex.Metrika loading is
 *     handled elsewhere; this stub just console.logs (per Cycle 28 spec §4).
 *
 * z-[60] matches the existing cookie-consent.tsx pattern (above site-header
 * z-50 + announcement-bar z-55, below the mobile-menu overlay which renders
 * later in the DOM so stacks above naturally).
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
const LINK_CLASS =
  "no-underline text-[var(--ea-red)] transition-colors hover:text-[var(--ea-red-deep)] hover:underline focus-visible:underline";
const BTN_OUTLINE_CLASS =
  "border border-[var(--ea-cream)] bg-transparent text-[var(--ea-cream)] hover:bg-white/10 focus-visible:bg-white/10";
const BTN_SOLID_CLASS =
  "border border-[var(--ea-red)] bg-[var(--ea-red)] text-[var(--ea-cream)] hover:border-[var(--ea-red-deep)] hover:bg-[var(--ea-red-deep)] focus-visible:border-[var(--ea-red-deep)] focus-visible:bg-[var(--ea-red-deep)]";

const BTN_BASE_STYLE: CSSProperties = {
  fontFamily: "var(--ea-font-eyebrow)",
  fontWeight: 700,
  fontSize: "0.75rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  lineHeight: 1,
  padding: "0.5em 1em",
  borderRadius: 0,
  cursor: "pointer",
  transition:
    "background-color 200ms ease, border-color 200ms ease, color 200ms ease",
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
  const bannerRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLAnchorElement>(null);

  // Mount: clear stale (>14 days) choices, then decide whether to show.
  useEffect(() => {
    clearStaleChoices();
    setVisible(!hasActiveChoice());
  }, []);

  // Autofocus the first text link when the banner appears (after the
  // enter-animation finishes; instant for reduced-motion users).
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(
      () => firstFocusRef.current?.focus(),
      prefersReducedMotion ? 0 : 350,
    );
    return () => clearTimeout(t);
  }, [visible, prefersReducedMotion]);

  // Focus trap inside the banner — Tab cycles within text links + buttons.
  useEffect(() => {
    if (!visible || !bannerRef.current) return;
    const node = bannerRef.current;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = node.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusable.length < 2) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    node.addEventListener("keydown", handler);
    return () => node.removeEventListener("keydown", handler);
  }, [visible]);

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
    : { opacity: 0, y: -100 };
  const animate = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0 };
  const exit = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: -100 };
  const transition = prefersReducedMotion
    ? { duration: 0.3 }
    : { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={bannerRef}
          role="region"
          aria-label="Cookie consent"
          data-component="ea-cookie-banner"
          className="fixed inset-x-0 top-0 z-[60] w-full"
          style={{
            background: "rgba(0, 0, 0, 0.96)",
            borderBottom: "1px solid var(--ea-red)",
            color: "var(--ea-cream)",
          }}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
        >
          <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-3 px-6 py-3 sm:flex-row sm:items-center sm:gap-6 md:px-12">
            <p
              className="m-0 max-w-[68ch] leading-relaxed"
              style={{
                fontFamily: "var(--ea-font-body)",
                fontSize: "0.8125rem",
                color: "color-mix(in srgb, var(--ea-cream) 85%, transparent)",
              }}
            >
              Мы используем cookies для аналитики и улучшения сервиса.{" "}
              <a
                ref={firstFocusRef}
                href={LINK_PRIVACY_HREF}
                target="_blank"
                rel="noopener"
                className={LINK_CLASS}
              >
                Политика конфиденциальности
              </a>{" "}
              и{" "}
              <a
                href={LINK_TERMS_HREF}
                target="_blank"
                rel="noopener"
                className={LINK_CLASS}
              >
                Условия
              </a>{" "}
              — по ссылкам.
            </p>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:gap-2 md:gap-3">
              <button
                type="button"
                onClick={() => decide("rejected")}
                style={BTN_BASE_STYLE}
                className={BTN_OUTLINE_CLASS}
              >
                Отклонять
              </button>
              <button
                type="button"
                onClick={() => decide("essential")}
                style={BTN_BASE_STYLE}
                className={BTN_OUTLINE_CLASS}
              >
                Только необходимые
              </button>
              <button
                type="button"
                onClick={() => decide("accepted")}
                style={BTN_BASE_STYLE}
                className={BTN_SOLID_CLASS}
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
