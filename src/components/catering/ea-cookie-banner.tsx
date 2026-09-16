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
 *   - AnimatePresence + motion.div rises from below (y: 24 → 0, 400ms
 *     ease-out); fade-out on dismiss. prefers-reduced-motion → opacity only.
 *   - role="region" + aria-label="Cookie consent". NOT a dialog and NOT
 *     modal: NO focus trap — Tab moves through the links/buttons and
 *     continues into the page naturally (FIX-5, WCAG 2.1.2 / W1-D F5).
 *     Escape NOT bound. Body scroll NOT locked.
 *   - "Accept all" enables analytics — W3 (cycle-71): Yandex.Metrika now
 *     actually loads via lib/analytics.ts loadMetrika() (env-gated, noop
 *     without NEXT_PUBLIC_YANDEX_METRIKA_ID; the Cycle-28 console.log stub
 *     is retired). Reload with a live accepted-choice also loads it on mount.
 *
 * 81-F2 (критики A+B CRITICAL, редизайн компакта): полноширинная полоса
 *   внизу перекрывала нижние ~25% hero-CTA и строку футера до accept — и на
 *   автоскролле формы могла накрыть CTA «Далее». Теперь — компактная
 *   карточка (≤340px) внизу-слева, на мобиле — по центру с меньшей высотой
 *   (замер 390×844: ≤140px, отступ от низа 16px + safe-area). Дизайн — в
 *   стилистике системы: espresso-панель, золотая рамка, скруглённые углы,
 *   мягкая тень. Логика консента, ключи, 14-дневный re-prompt, loadMetrika,
 *   класс cookie-banner-open и замер --cookie-banner-h НЕ тронуты
 *   (globals.css-хуки body padding/FAB-лифта продолжают работать на живой
 *   высоте карточки — замер C75 идёт по этому же элементу).
 *
 * 81-W2F1 (критик F HIGH, перекрытие hero-CTA): карточка на bottom-16
 *   накрывала CTA «Оставить заявку» (y 763-807) и «Листайте» до решения
 *   юзера. На мобиле карточка ПОДНИМАЕТСЯ над нижней док-зоной (bottom =
 *   100px + safe-area): CTA, scroll-cue, phone-FAB и sticky-bar
 *   калькулятора остаются достижимыми. --cookie-banner-h теперь пишется
 *   как ЭФФЕКТИВНЫЙ нижний след (innerHeight − rect.top): лифты FAB
 *   (globals.css) и sticky-bar продолжают работать корректно — они
 *   поднимают элементы НАД реальной геометрией карточки. Кнопки 11 → 12px
 *   (критик E K2, читаемость); на 340px-карточке ряд из 3 кнопок при 12px
 *   переносится (flex-wrap, «Принять все» — на своей строке) — высота
 *   карточки ~156px, CTA по-прежнему вне пересечения. sm+ — без изменений.
 *
 * z-[80] (Cycle 39 bottom-dock keeps the sticky header visible; above
 * site-header z-50 + announcement-bar z-55, below the mobile-menu overlay
 * which renders later in the DOM so stacks above naturally).
 *
 * c84-F1 (волна-1 критиков M1-D1/M2-№1/№3, СИСТЕМНЫЙ корень): подъём на
 *   140px сам стал проблемой — карточка с 2-рядными кнопками (161px, ≤375)
 *   накрывала eyebrow hero, CTA видео-блока, чекбоксы аддонов, поля даты;
 *   «лифтованный» телефон-FAB (translateY −297px) висел посреди экрана
 *   поверх H1/H2. НОВЫЙ контракт нижней док-зоны: баннер на мобиле —
 *   САМЫЙ НИЖНИЙ элемент (bottom 16px + safe-area); всё что конфликтует
 *   снизу — гасим на время баннера (cue уже скрыт visibility-правилом,
 *   FAB скрывается opacity-правилом вместо лифта — globals.css).
 *   Десктоп: карточка переезжает в ПРАВЫЙ нижний угол — контент секций
 *   выровнен слева, первый визит больше не срезает CTA (замер M2 d1440:
 *   −15px/31% высоты «Смотреть меню»). --cookie-banner-h не меняется.
 *
 * c85-A (жалоба владельца: «файлы куки вообще в другой стилистике,
 *   исправь, сделай в стилистике сайта»): визуал переведён со тёмной
 *   espresso-панели на «бумажную редакционную карточку» светлых секций
 *   сайта — крем --ea-cream, espresso-чернила, золото:
 *   - карточка: крем-фон, рамка espresso/12% + золотая кромка 2px сверху,
 *     радиус 10px, мягкая тень (никакого глассморфизма);
 *   - заголовок-мини: Marck Script «cookies» 20px, наклон −6° — тот же
 *     рукописный акцент, что «food as art» на hero (Prata-заголовок в
 *     карточке 340-370px читался бы тяжелее скрипта);
 *   - текст 13px/espresso-80 (≈10.8:1 на креме), leading-snug;
 *   - кнопки: outline espresso (рамка espresso/35, ховер — инверсия:
 *     заливка espresso + крем-текст), «Принять все» — золотая заливка
 *     #C9A227 с espresso-текстом 8.22:1, приподнята мягкой золотой тенью;
 *     капс 13px (c89: 12 → 13px — читаемость для пожилых), трекинг 0.03em,
 *     высота 44px; на мобиле ряд переносится flex-wrap (≤2 ряда,
 *     карта ≤190px) — бюджет в комментарии BTN_BASE_STYLE;
 *   - ссылки «Политика»/«Условия»: espresso-текст (18.32:1) с золотой
 *     нитью-подчёркиванием (чистое золото текстом на креме = 2.22:1 FAIL —
 *     поэтому золото только в декоративной нити, hover углубляет её).
 *   Логика НЕ тронута: KEYS/localStorage, loadMetrika, ResizeObserver +
 *   --cookie-banner-h, body.cookie-banner-open, safe-area, role/aria,
 *   decide(). Классы .cookie-cta-solid/.cookie-cta-outline (globals.css)
 *   сохранены: slide-fill espresso + золотой текст на ховере (8.22:1) —
 *   та же инверсия, что у hcta-btn шапки, поверх золотой заливки кнопки.
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
// W2-FIX: py-4 (компенсация -my-4) — тач-таргет ссылки ~44px при 12px-тексте.
// c85-A: ссылки на КРЕМОВОЙ карточке — espresso-текст (18.32:1 на креме #F7F5F5 (замер c85-A))
// + золотая нить-подчёркивание (декоративная: золото текстом на креме =
// 2.22:1 FAIL 1.4.3 — поэтому цвет текста espresso, золото только в нити);
// hover углубляет нить в #8A6D1F и утолщает до 2px. Прежний вариант —
// золотой текст на тёмной панели — был корректен для espresso-фона.
const LINK_CLASS =
  "text-[#0A0908] underline decoration-[#C9A227] decoration-1 underline-offset-[3px] transition-colors hover:decoration-[#8A6D1F] hover:decoration-2 focus-visible:decoration-[#8A6D1F] focus-visible:decoration-2 py-4 -my-4";
// c85-A: outline-кнопки — канон светлых секций: текст espresso на креме
// (18.27:1), рамка espresso/35, ховер — ИНВЕРСИЯ (заливка espresso +
// крем-текст 18.32:1), как у hcta-btn шапки. .cookie-cta-outline
// (globals.css) докрашивает рамку в золото на ховере — цвет-состояние,
// transform-free, гейт (hover:hover).
const BTN_OUTLINE_CLASS =
  "cookie-cta-outline border border-[rgba(10,9,8,0.35)] bg-transparent text-[#0A0908] hover:bg-[#0A0908] hover:text-cream hover:border-[#C9A227] focus-visible:bg-[#0A0908] focus-visible:text-cream focus-visible:border-[#C9A227]";
// c85-A: solid-кнопка — акцент сайта: золотая заливка #C9A227 +
// espresso-текст (8.22:1; белый на золоте = 2.42:1 FAIL, поэтому текст
// тёмный), приподнята мягкой золотой тенью (BTN_SOLID_STYLE ниже).
// c83-D: .cookie-cta-solid (globals.css) — slide-fill по механике
// .hcta-btn (site-header.css): ::after espresso-заливка едет снизу
// 360ms EASE [0.22,1,0.36,1], текст → золото #C9A227 (8.22:1 на espresso),
// рамка → espresso — ТА ЖЕ ховер-инверсия, что у кнопок сайта.
// absolute ::after — layout/44px/wrap не меняются. Tailwind hover:bg/border
// остаются фолбэком под заливкой; фокус — :focus-visible-ветка класса.
const BTN_SOLID_CLASS =
  "cookie-cta-solid border border-[#C9A227] bg-[#C9A227] text-[#0A0908] hover:border-[#B08D22] hover:bg-[#B08D22] focus-visible:border-[#B08D22] focus-visible:bg-[#B08D22]";

const BTN_BASE_STYLE: CSSProperties = {
  fontFamily: "var(--ea-font-eyebrow)",
  fontWeight: 700,
  /* c89 (читаемость для пожилых): капс 13px + трекинг 0.03em (было 12px).
     Бюджет ряда: при 13px max-content кнопок ≈ 99+123+110 (12px-замер
     c85-A ×1.083) + 2×8 gap = 348px > 332-334px контента карты даже на
     ≥390px — один ряд из трёх больше НЕ влезает: flex-wrap переносит
     «Принять все» полной строкой, ≤2 ряда (высота карты перемеряется
     ResizeObserver'ом — лифты FAB/sticky-bar едут по реальной геометрии,
     --cookie-banner-h остаётся честным). Тач-таргет 44px (WCAG 2.5.5 /
     Apple HIG). */
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  lineHeight: 1,
  borderRadius: 10,
  cursor: "pointer",
  transition:
    "background-color 200ms ease, border-color 200ms ease, color 200ms ease",
  /* FIX-5 (W1-D NIT): тач-таргет 40 → 44px (WCAG 2.5.5 / Apple HIG).
     c85-A: minWidth = max-content (inline-стиль сильнее Tailwind-класса —
     min-w-max не мог его перебить, flex-1 сжимал «Необходимые» до 77px
     при min-content 111px → текст-оверфлоу, замер btnfit.cjs): кнопка
     никогда не уже своего текста (подписи 92-114px, замер) — тач-таргет
     44px выполняется автоматически; нехватка ряда → перенос, не скважок. */
  minHeight: 44,
  minWidth: "max-content",
};

// c85-A: «Принять все» чуть приподнята над рядом — мягкая золотая тень
// (только тень, transform-free — канон ховеров сайта).
const BTN_SOLID_STYLE: CSSProperties = {
  ...BTN_BASE_STYLE,
  boxShadow: "0 6px 16px -8px rgba(201, 162, 39, 0.65)",
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
    /* 81-W2F1: переменная — ЭФФЕКТИВНЫЙ нижний след карточки (не голая
     * высота): на мобиле карточка поднята на 100px от низа (hero-CTA
     * fix), и нижние док-системы (FAB-лифт globals.css, sticky-bar
     * --hbooking-cookie-h) должны поднимать элементы НАД РЕАЛЬНОЙ
     * геометрией — то есть до ВЕРХА карточки. innerHeight − rect.top
     * даёт ровно это и остаётся корректным для десктопа (bottom-6:
     * след = высота + 24px отступа). */
    const apply = () => {
      const rect = el.getBoundingClientRect();
      if (rect.height > 0) {
        const footprint = Math.max(0, Math.ceil(window.innerHeight - rect.top));
        root.style.setProperty("--cookie-banner-h", `${footprint}px`);
      }
    };
    apply();
    /* Входная анимация (y: 24 → 0, transform) НЕ триггерит ResizeObserver
     * (border-box не меняется) — перемеряем после её завершения, иначе
     * след зависает на 24px выше реального. Однократный таймер. */
    const settle = window.setTimeout(apply, 500);
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      window.clearTimeout(settle);
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
    : { opacity: 0, y: 24 };
  const animate = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0 };
  const exit = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 24 };
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
          /* 81-F2: компактная карточка вместо полноширинной полосы.
             c84-F1: мобайл — bottom 16px + safe-area (САМЫЙ низ док-зоны:
             cue скрыт visibility-правилом, FAB скрыт opacity-правилом —
             пока баннер открыт, никто под ним не конфликтует; после
             решения всё возвращается). Десктоп — ПРАВЫЙ нижний угол
             (bottom-6 right-6): контент секций выровнан слева (CTA
             видео-блока, чек-панель) — первый визит больше не накрывает
             интерактив (замер M2: −15px CTA «Смотреть меню» на d1440). */
          className="fixed z-[80] inset-x-4 bottom-[calc(16px+env(safe-area-inset-bottom,0px))] sm:inset-x-auto sm:bottom-6 sm:left-auto sm:right-6"
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
        >
          {/* c85-A: «бумажная редакционная карточка» светлых секций сайта —
              кремовая бумага, espresso-чернила, тонкая рамка espresso/12%
              + золотая кромка 2px сверху, радиус 10px, мягкая тень.
              Было: тёмная espresso-панель с золотой рамкой (глассморфная
              тяжесть на hero). Максимальная ширина ≤370px; на мобиле —
              inset-x-4 (позиционирование — на внешнем motion.div, см.
              докстринг контракта док-зоны). */}
          <div
            className="mx-auto flex max-w-[358px] sm:max-w-[370px] flex-col rounded-[10px] px-3 pt-3 pb-3 sm:px-4 sm:pt-3.5 sm:pb-4"
            style={{
              background: "var(--ea-cream, #F7F5F1)",
              border: "1px solid rgba(10, 9, 8, 0.12)",
              borderTop: "2px solid #C9A227",
              color: "#0A0908",
              boxShadow:
                "0 16px 40px -16px rgba(10, 9, 8, 0.3), 0 4px 12px -8px rgba(10, 9, 8, 0.18)",
            }}
          >
            {/* Заголовок-мини — рукописный акцент бренда: Marck Script
                «cookies» с наклоном −6° (приём «food as art» на hero);
                наклон на внутреннем span, чтобы не конфликтовать с
                line-box'ом. Не заголовок-элемент: регион уже несёт
                aria-label, структуру документа не загрязняем. */}
            <p
              className="m-0 mb-0.5 text-[20px] leading-none"
              style={{
                fontFamily: "var(--font-marck), var(--font-script), cursive",
                fontWeight: 400,
                color: "#0A0908",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transform: "rotate(-6deg)",
                  transformOrigin: "center",
                }}
              >
                cookies
              </span>
            </p>
            <p
              className="m-0 text-[13px] leading-snug"
              style={{
                fontFamily: "var(--ea-font-body)",
                color: "rgba(10, 9, 8, 0.8)",
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
            {/* Кнопки: c89 — кегль 13px (читаемость для пожилых): ряд из
                трёх НЕ влезает одной строкой даже на ≥390px (бюджет — в
                комментарии BTN_BASE_STYLE) — flex-wrap переносит
                («Принять все» приезжает полной строкой, ≤2 ряда).
                whitespace-nowrap — «ПРИНЯТЬ ВСЕ» не рвётся в 2 строки
                внутри кнопки. Один акцент: золотая заливка только у
                «Принять все» — restraint-принцип докстринга. */}
            <div className="mt-2 flex flex-row flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => decide("rejected")}
                style={BTN_BASE_STYLE}
                className={`${BTN_OUTLINE_CLASS} flex-1 whitespace-nowrap px-1 py-2 text-[13px]`}
              >
                Отклонить
              </button>
              <button
                type="button"
                onClick={() => decide("essential")}
                style={BTN_BASE_STYLE}
                className={`${BTN_OUTLINE_CLASS} flex-1 whitespace-nowrap px-1 py-2 text-[13px]`}
              >
                Необходимые
              </button>
              <button
                type="button"
                onClick={() => decide("accepted")}
                style={BTN_SOLID_STYLE}
                className={`${BTN_SOLID_CLASS} flex-1 whitespace-nowrap px-1 py-2 text-[13px]`}
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
