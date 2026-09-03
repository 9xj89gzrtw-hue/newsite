"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { loadMetrika } from "@/lib/analytics";

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
 * is filled.
 *
 * F4 / K1 MINOR (cycle-71 рестайл «палитра-энтропия»): красная рамка +
 * красные ссылки на тёмно-золотом сайте → бренд-рестайл в золото/тёмное:
 * рамка #C9A227, тёмная espresso-панель rgba(10,9,8,.97), ссылки золотые
 * (#C9A227 = 8.38:1 на панели; hover #E5C76B = 12.27:1), solid-кнопка —
 * золотая заливка с espresso-текстом (8.22:1), outline-кнопки — крем на
 * тёмном (18.65:1). Дисклеймер 10.5px → 12px (мобайл) / 13px (sm) — K2
 * «cookie-дисклеймер 10.5px». Логика консента НЕ тронута: 3 ключа
 * localStorage, 14-дневный re-prompt, console.info при accepted.
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
 *   - "Accept all" enables analytics — W3 (cycle-71): Yandex.Metrika now
 *     actually loads via lib/analytics.ts loadMetrika() (env-gated, noop
 *     without NEXT_PUBLIC_YANDEX_METRIKA_ID; the Cycle-28 console.log stub
 *     is retired). Reload with a live accepted-choice also loads it on mount.
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
// ~43px → 44px при 12px-тексте (инлайн-бокс 12px + 2×16px паддинг);
// визуальный размер строки не меняется (-my-4 компенсирует).
// F4: ссылки — золото на тёмной панели (#C9A227 = 8.38:1, hover #E5C76B
// = 12.27:1); было var(--ea-red) #E71D3A на чёрном ≈ 3.9:1 FAIL.
const LINK_CLASS =
  "no-underline text-[#C9A227] transition-colors hover:text-[#E5C76B] hover:underline focus-visible:underline py-4 -my-4";
// Outline-кнопки — крем на тёмной панели (18.65:1) — уже в бренде.
const BTN_OUTLINE_CLASS =
  "border border-[var(--ea-cream)] bg-transparent text-[var(--ea-cream)] hover:bg-white/10 focus-visible:bg-white/10";
// F4: solid-кнопка — золотая заливка + espresso-текст (8.22:1; белый на
// золоте = 2.42:1 FAIL, поэтому текст тёмный); hover — плотнее-золото
// #B08D22 (6.33:1). Была красная заливка с крем-текстом.
const BTN_SOLID_CLASS =
  "border border-[#C9A227] bg-[#C9A227] text-[#0A0908] hover:border-[#B08D22] hover:bg-[#B08D22] focus-visible:border-[#B08D22] focus-visible:bg-[#B08D22]";

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

/**
 * W3 / K6-CRITICAL: живой (не просроченный) consent именно на
 * АНАЛИТИЧЕСКУЮ категорию — только «Принять все» (KEYS.accepted).
 * «Только необходимые»/«Отклонить» метрику НЕ включают.
 */
function hasActiveAnalyticsConsent(): boolean {
  try {
    const raw = window.localStorage.getItem(KEYS.accepted);
    return !!raw && !isExpired(parseStamp(raw));
  } catch {
    return false; // localStorage unavailable — не включаем метрику.
  }
}

export function EaCookieBanner() {
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  /* C75: ref на панель баннера — источник замера --cookie-banner-h. */
  const bannerRef = useRef<HTMLDivElement>(null);

  // Mount: clear stale (>14 days) choices, then decide whether to show.
  // W3 / K6-CRITICAL: консент на аналитику выдан ранее (не просрочен) →
  // грузим Метрику сразу, не дожидаясь повторного показа баннера
  // (баннер при живом выборе не показывается вовсе). Без env-ID и это
  // loadMetrika — безопасный noop.
  useEffect(() => {
    clearStaleChoices();
    setVisible(!hasActiveChoice());
    if (hasActiveAnalyticsConsent()) loadMetrika();
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

  /* C75 (§43, "числа-замеры живут в коде, а не в комментариях"): высота
   * баннера ИЗМЕРЯЕТСЯ, а не хардкодится. Причина: хардкод Cycle-70
   * «мобайл 96px» протух после роста контента — реальный баннер 390×844
   * стал 150px, body padding 108px накрывал телефон футера и FAB
   * (−42px/−34px, замер agent-browser + VLM: номер телефона под панелью).
   * --cookie-banner-h питает body padding и лифт phone-FAB в globals.css.
   * rect.height (border-box) уже включает внутренний env(safe-area-
   * inset-bottom) баннера — отдельный env() не нужен. ResizeObserver
   * перемеряет при пере-переносе строк (поворот, resize, свап шрифта).
   * Класс cookie-banner-open и эта переменная ставятся в ОДНОМ коммите
   * эффектов — прыгающего кадра между классом и числом нет. */
  useEffect(() => {
    /* Гвард visible: AnimatePresence держит панель живой ~0.4s ВЫХОДНОЙ
     * анимации после setVisible(false) — ref ещё не пуст, и без гварда
     * эффект пере-поставил бы переменную ПОСЛЕ cleanup, оставляя её
     * висеть навсегда (замер C75: varGone=false после «Отклонить»). */
    if (!visible) return;
    const el = bannerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const root = document.documentElement;
    const apply = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) root.style.setProperty("--cookie-banner-h", `${Math.ceil(h)}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--cookie-banner-h");
    };
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
      // W3 / K6-CRITICAL: реальный загрузчик Яндекс.Метрики вместо
      // console.log-заглушки (Cycle 28 «TBD»). Скрипт ставится ТОЛЬКО
      // здесь и при живом консенте на монте (см. выше) — до «Принять
      // все» ноль сторонних запросов. Без env-ID — noop (см. analytics.ts).
      loadMetrika();
      console.info(
        "[ea-cookie-banner] analytics consent granted — Yandex.Metrika loader invoked",
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
          ref={bannerRef}
          role="region"
          aria-label="Уведомление об использовании cookies"
          data-component="ea-cookie-banner"
          /* Cycle 39 fix: docked to the BOTTOM — previously top-0 z-60 exactly
             covered the sticky header (nav/phone/CTA invisible until consent).
             F4: тёмная espresso-панель бренда + золотая рамка (была чёрная с
             красной рамкой — K1 «вне бренда»); backdrop-контент под ней
             просвечивает на 3% — безопасно, панель остаётся ~непрозрачной. */
          className="fixed inset-x-0 bottom-0 z-[80] w-full"
          style={{
            background: "rgba(10, 9, 8, 0.97)",
            borderTop: "1px solid #C9A227",
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
              className="m-0 max-w-[68ch] text-[12px] leading-snug sm:text-[13px]"
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
              {/* F4: применяю осиротевшие (C59) BTN_*_CLASS — дизайн-интент
                  докстринга «один акцент: filled Accept + outline остальные»
                  не рендерился вовсе (замер: все 3 кнопки прозрачные без рамок).
                  Теперь: outline-крем × 2 + золотая заливка у «Принять все». */}
              <button
                type="button"
                onClick={() => decide("rejected")}
                style={BTN_BASE_STYLE}
                className={`${BTN_OUTLINE_CLASS} px-2.5 py-2 text-[12px] sm:px-4 sm:text-[13px]`}
              >
                Отклонить
              </button>
              <button
                type="button"
                onClick={() => decide("essential")}
                style={BTN_BASE_STYLE}
                className={`${BTN_OUTLINE_CLASS} px-2.5 py-2 text-[12px] sm:px-4 sm:text-[13px]`}
              >
                <span className="sm:hidden">Необходимые</span>
                <span className="hidden sm:inline">Только необходимые</span>
              </button>
              <button
                type="button"
                onClick={() => decide("accepted")}
                style={BTN_BASE_STYLE}
                className={`${BTN_SOLID_CLASS} px-2.5 py-2 text-[12px] sm:px-4 sm:text-[13px]`}
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
