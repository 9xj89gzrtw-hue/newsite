/**
 * W3 / K6-CRITICAL (cycle-71): слой веб-аналитики — Яндекс.Метрика.
 *
 * До этого волны: аналитики не было ВООБЩЕ (window.ym = false, cookie-баннер
 * писал console.log-заглушку). Этот модуль — полный каркас с env-гейтом:
 *
 * ┌─ КАК ВКЛЮЧИТЬ ВЛАДЕЛЬЦУ (5 минут) ───────────────────────────────────────┐
 * │ 1. Зарегистрировать счётчик: https://metrika.yandex.ru → «Добавить      │
 * │    счётчик» → получить числовой ID (например 12345678).                 │
 * │    На вкладке «Цели» один раз создать цели с именами из GOALS ниже      │
 * │    (тип «JavaScript-событие», идентификаторы — те же строки).           │
 * │ 2. Прописать в окружении деплоя:                                        │
 * │        NEXT_PUBLIC_YANDEX_METRIKA_ID=12345678                           │
 * │    (старый ключ NEXT_PUBLIC_YANDEX_METRIKA тоже принят как синоним).    │
 * │    Локально — в .env.local; НЕ коммитить секретов тут нет, но и ID     │
 * │    тестового счётчика в git тащить незачем.                             │
 * │ 3. Всё. Скрипт Метрики грузится ТОЛЬКО после «Принять все» в cookie-    │
 * │    баннере (152-ФЗ: до согласия — ноль сторонних запросов).            │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * БЕЗ ID (по умолчанию): каждый вызов — безопасный noop, ни одного сетевого
 * запроса, ни одной ошибки — сайт работает ровно как раньше.
 *
 * Технические решения:
 *  - ID читается из ANALYTICS.yandexMetrikaId (lib/config.ts) — ЕДИНЫЙ
 *    источник env-конфигурации сайта, рядом с доменом/хостингом;
 *  - инъекция — официальный асинхронный сниппет tag.js (mc.yandex.ru;
 *    mjs-варианта на CDN нет — tag.mjs отвечает 404, проверено curl,
 *    поэтому «официальный сниппет» = tag.js + async-загрузка; инъекция
 *    после парсинга HTML неблокирующая, т.е. defer-семантика);
 *  - инициализация: clickmap/trackLinks/accurateTrackBounce = true,
 *    webvisor = false (запись сессий выключена — минимизация PII);
 *  - все вызовы обёрнуты в typeof/try — метрика не имеет права уронить UI.
 */

import { ANALYTICS } from "./config";

/** ID счётчика из env (пустая строка = аналитика выключена). */
export const METRICA_ID: string = ANALYTICS.yandexMetrikaId;

/**
 * Имена целей Метрики (создаются владельцем в интерфейсе Метрики,
 * тип «JavaScript-событие»). snake_case — конвенция reachGoal.
 */
export const GOALS = {
  /** Первое взаимодействие с контролами калькулятора (тип/слайдер/дата). */
  CALC_START: "calc_start",
  /** Клик CTA «Оставить заявку» / раскрытие формы (в т.ч. якорем #contact). */
  FORM_OPEN: "form_open",
  /** Успешный переход «Далее» (шаг 1 → шаг 2). */
  FORM_STEP2: "form_step2",
  /** Успешный сабмит заявки (POST /api/lead → 201). */
  LEAD_SUBMIT: "lead_submit",
  /** Клик по любой ссылке tel:. */
  TEL_CLICK: "tel_click",
  /** Клик по мессенджеру/соцсети (wa.me / t.me / vk.com / instagram). */
  MESSENGER_CLICK: "messenger_click",
  /**
   * Скачивание PDF-каталога. Цель объявлена, но НЕ подключена: кнопка
   * живёт в hacc-menu.tsx (файл другой волны — там одна строка
   * trackGoal(GOALS.PDF_DOWNLOAD) при успехе generateMenuPdf).
   */
  PDF_DOWNLOAD: "pdf_download",
} as const;

export type GoalName = (typeof GOALS)[keyof typeof GOALS];

/* ------------------------------------------------------------------ typеs */

/** Очередь/интерфейс Яндекс.Метрики (официальный глобальный `ym`). */
type YmFn = ((...args: unknown[]) => void) & {
  /** Буфер команд до загрузки tag.js (внутреннее поле сниппета). */
  a?: unknown[][];
  /** Метка времени инициализации сниппета. */
  l?: number;
};

type WindowWithYm = typeof window & { ym?: YmFn };

declare global {
  interface Window {
    /** Яндекс.Метрика: стаб-очередь до загрузки tag.js, инстанс — после. */
    ym?: YmFn;
  }
}

const METRIKA_SRC = "https://mc.yandex.ru/metrika/tag.js";

/** ID валиден, только если это положительное число (env мог прийти битым). */
function metricaIdNumber(): number {
  const n = Number(METRICA_ID);
  return Number.isInteger(n) && n > 0 ? n : NaN;
}

/** Метрика сконфигурирована (env-ID задан и численно валиден)? */
export function isMetrikaConfigured(): boolean {
  return Number.isFinite(metricaIdNumber());
}

/* ------------------------------------------------------------------ loader */

/** Защита от повторной инъекции (сколько бы ни вызвали loadMetrika). */
let loadStarted = false;

/**
 * Загрузка Яндекс.Метрики — вызывается ТОЛЬКО после аналитического consent
 * (ea-cookie-banner: «Принять все» или уже выданный раннее consent).
 *
 * Идемпотентна: повторные вызовы — noop. Без ID — noop без единого
 * побочного эффекта. Официальный сниппет (docs: yandex.ru/support/metrica),
 * адаптированный под TS-инъекцию:
 *   1. window.ym = стаб-очередь (команды буферизуются до готовности tag.js);
 *   2. <script async src=tag.js> вставляется перед первым script документа;
 *   3. ym(ID, "init", {…}) — в очередь (исполнится сразу после загрузки).
 */
export function loadMetrika(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const id = metricaIdNumber();
  if (!Number.isFinite(id)) return; // env-гейт: без ID сайт живёт как раньше
  if (loadStarted) return;
  loadStarted = true;

  const w = window as WindowWithYm;

  // (1) Стаб-очередь — дословно из официального сниппета
  //     (m[i].a.push(arguments)); не трогаем, если ym уже есть.
  if (typeof w.ym !== "function") {
    const stub: YmFn = (...args: unknown[]) => {
      stub.a = stub.a ?? [];
      stub.a.push(args);
    };
    stub.l = 1 * Date.now();
    w.ym = stub;
  }

  // (2) Инъекция скрипта с дедупликацией (официальная проверка document.scripts).
  const alreadyInjected = Array.from(document.scripts).some(
    (s) => s.src === METRIKA_SRC,
  );
  if (!alreadyInjected) {
    const k = document.createElement("script");
    k.async = true;
    k.src = METRIKA_SRC;
    const first = document.getElementsByTagName("script")[0];
    (first?.parentNode ?? document.head).insertBefore(k, first ?? null);
  }

  // (3) init — параметры по ТЗ W3: клики по ссылкам и точный bounce — да,
  //     вебвизор (запись сессий) — нет.
  try {
    w.ym?.(id, "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: false,
    });
  } catch {
    // очередь не должна иметь права падать
  }
}

/* ------------------------------------------------------------------ goals */

/**
 * Отправка цели: ym(ID, "reachGoal", name, params).
 * Без ID / до загрузки метрики / на сервере — безопасный noop.
 * Ошибки глотаются: аналитика не ломает UI.
 */
export function trackGoal(
  name: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  const id = metricaIdNumber();
  if (!Number.isFinite(id)) return;
  const ym = (window as WindowWithYm).ym;
  if (typeof ym !== "function") return;
  try {
    ym(id, "reachGoal", name, params ?? {});
  } catch {
    // noop: даже битый инстанс метрики не должен ронять обработчик клика
  }
}

/* ------------------------------------------------------ anchor click goals */

/**
 * Хосты мессенджеров/соцсетей (ТЗ W3): wa.me, t.me, vk.com, instagram.
 * max.ru НЕ включён: профиль не существует (F2, cycle-71) — цель для
 * мёртвой ссылки не нужна.
 */
const MESSENGER_HOSTS_RE = /(?:wa\.me|t\.me|vk\.com|instagram\.com)/i;

/** Классификация ссылки для document-level click-listener'а. */
export function anchorClickGoal(href: string): {
  goal: GoalName;
  params: Record<string, string>;
} | null {
  if (!href) return null;
  if (href.startsWith("tel:")) {
    return { goal: GOALS.TEL_CLICK, params: { href } };
  }
  if (MESSENGER_HOSTS_RE.test(href)) {
    return { goal: GOALS.MESSENGER_CLICK, params: { href } };
  }
  return null;
}
