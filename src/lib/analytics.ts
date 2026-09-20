/**
 * W3 / K6-CRITICAL (cycle-71): слой веб-аналитики — Яндекс.Метрика.
 * c99-C: переведён с build-time env-ID на РАНТАЙМ-настройки из админки.
 *
 * КАК ЭТО РАБОТАЕТ (c99-C, «владелец меняет аналитику сам»):
 *  - cookie-баннер (после «Принять все» / живого консента) вызывает
 *    loadAnalytics() — ЕДИНСТВЕННУЮ точку входа;
 *  - loadAnalytics() делает fetch('/api/vars.php') — публичный PHP-эндпоинт
 *    читает server-data/settings.json (его пишет владелец в «Настройках»
 *    админки: ID Метрики, Вебвизор, клик-карта, GA4, произвольные пиксели);
 *  - недоступен API/сеть/зеркало Vercel (там /api закрыт редиректом) —
 *    тихий фолбэк на env NEXT_PUBLIC_YANDEX_METRIKA_ID из деплоя
 *    (прод-счётчик 112532826 продолжает работать, если владелец ничего
 *    не настроил);
 *  - 152-ФЗ: до «Принять все» — НОЛЬ сторонних запросов (ни Метрики,
 *    ни GA, ни пикселей; сам vars.php — same-origin, не трекер).
 *
 * БЕЗ ID вообще (и в vars, и в env): каждый вызов — безопасный noop,
 * ни одного сетевого запроса, ни одной ошибки — сайт работает как раньше.
 *
 * Технические решения:
 *  - env-ID читается из ANALYTICS.yandexMetrikaId (lib/config.ts) — единый
 *    источник env-конфигурации; рантайм-ID — из /api/vars.php;
 *  - инъекция — официальный асинхронный сниппет tag.js (mc.yandex.ru;
 *    mjs-варианта на CDN нет — проверено curl в cycle-71);
 *  - инициализация: trackLinks/accurateTrackBounce = true; webvisor и
 *    clickmap — по флагам владельца из vars (дефолт true);
 *  - trackGoal шлёт цели в ТОТ же счётчик, что был инициализирован
 *    (activeMetrikaId), иначе цели улетали бы в env-счётчик мимо нового;
 *  - все вызовы обёрнуты в typeof/try — аналитика не имеет права уронить UI.
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

/* ------------------------------------------------------------------ types */

/** Очередь/интерфейс Яндекс.Метрики (официальный глобальный `ym`). */
type YmFn = ((...args: unknown[]) => void) & {
  /** Буфер команд до загрузки tag.js (внутреннее поле сниппета). */
  a?: unknown[][];
  /** Метка времени инициализации сниппета. */
  l?: number;
};

type WindowWithAnalytics = typeof window & {
  ym?: YmFn;
  /** GA4: очередь событий (официальный сниппет gtag). */
  dataLayer?: unknown[];
  /** GA4: функция-шейм, пушащая в dataLayer. */
  gtag?: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    /** Яндекс.Метрика: стаб-очередь до загрузки tag.js, инстанс — после. */
    ym?: YmFn;
    /** Google Analytics 4 (gtag.js): очередь команд. */
    dataLayer?: unknown[];
    /** Google Analytics 4 (gtag.js): shim до загрузки скрипта. */
    gtag?: (...args: unknown[]) => void;
  }
}

const METRIKA_SRC = "https://mc.yandex.ru/metrika/tag.js";

/** Публичные переменные аналитики из /api/vars.php (после нормализации). */
interface AnalyticsVars {
  metrikaId: string | null;
  webvisor: boolean;
  clickmap: boolean;
  gaId: string | null;
  customHead: string | null;
}

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

/** Защита от повторной инъекции (сколько бы ни вызвали load/loadAnalytics). */
let loadStarted = false;

/**
 * Счётчик, РЕАЛЬНО инициализированный последним loadAnalytics.
 * trackGoal обязан слать цели именно в него — иначе после смены ID
 * владельцем в админке цели уходили бы в старый env-счётчик.
 */
let activeMetrikaId: number | null = null;

/**
 * Стаб-очередь window.ym — дословно из официального сниппета Метрики
 * (m[i].a.push(arguments)); не трогаем, если ym уже есть.
 * c99-fix (критик E2-m1): вынесена из initMetrika — trackGoal создаёт её
 * САМ, если цель пришла до инициализации (async loadAnalytics ещё не
 * дорезолвился): команда буферизуется и уйдёт сразу после загрузки tag.js,
 * а не теряется молча (докстринг trackGoal теперь соответствует коду).
 */
function ensureYmStub(): void {
  const w = window as WindowWithAnalytics;
  if (typeof w.ym === "function") return;
  const stub: YmFn = (...args: unknown[]) => {
    stub.a = stub.a ?? [];
    stub.a.push(args);
  };
  stub.l = 1 * Date.now();
  w.ym = stub;
}

/**
 * Инициализация Метрики под выбранным ID (официальный сниппет,
 * docs: yandex.ru/support/metrica):
 *   1. window.ym = стаб-очередь (команды буферизуются до готовности tag.js);
 *   2. <script async src=tag.js> вставляется перед первым script документа;
 *   3. ym(ID, "init", {…}) — в очередь (исполнится сразу после загрузки).
 */
function initMetrika(id: number, webvisor: boolean, clickmap: boolean): void {
  const w = window as WindowWithAnalytics;

  // (1) Стаб-очередь (общая с trackGoal — буфер команд до загрузки tag.js)
  ensureYmStub();

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

  // (3) init — webvisor/clickmap решает владелец в админке (c99-C,
  //     дефолты true: запись сессий — явное требование владельца).
  //     ecommerce:"dataLayer" передаёт события корзины в dataLayer
  //     (безопасно и при его отсутствии — просто активирует канал).
  w.ym?.(id, "init", {
    clickmap,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor,
    ecommerce: "dataLayer",
  });

  activeMetrikaId = id;
}

/**
 * Нормализация ответа vars.php: сервер уже валидирует, но правила
 * дублируются на клиенте (оборона от битого кеша/зеркала) — в аналитику
 * с мусорным ID не должен попасть ни один запрос.
 */
function parseVars(data: Record<string, unknown>): AnalyticsVars {
  const metrikaId =
    typeof data.metrikaId === "string" && /^[0-9]{5,10}$/.test(data.metrikaId)
      ? data.metrikaId
      : null;
  const gaId =
    typeof data.gaId === "string" && /^G-[A-Z0-9]{4,12}$/i.test(data.gaId)
      ? data.gaId
      : null;
  return {
    metrikaId,
    // «не false» = true: отсутствие поля (старый кеш) → дефолты владельца
    webvisor: data.webvisor !== false,
    clickmap: data.clickmap !== false,
    gaId,
    customHead:
      typeof data.customHead === "string" && data.customHead.trim() !== ""
        ? data.customHead
        : null,
  };
}

/**
 * GA4 (gtag.js) — официальный сниппет Google, адаптированный под TS:
 * dataLayer-шейм + async-скрипт + config. Двойная инициализация
 * невозможна: loadAnalytics идемпотентен (loadStarted).
 */
function initGtag(gaId: string): void {
  const w = window as WindowWithAnalytics;
  w.dataLayer = w.dataLayer ?? [];
  if (typeof w.gtag !== "function") {
    w.gtag = function gtag(...args: unknown[]): void {
      w.dataLayer?.push(args);
    };
  }
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(s);
  w.gtag("js", new Date());
  w.gtag("config", gaId);
}

/**
 * Произвольный код владельца (Roistat, VK-пиксель, Top100, <script>…) —
 * в <head>. innerHTML в отсоединённом div-парсере НЕ исполняет <script>,
 * поэтому скрипты пересоздаются вручную (атрибуты копируются, src/text
 * переносятся) — единственный способ запустить вставленный код.
 * c99-fix (критик E2-m3): вайт-лист тегов — script/meta/link/noscript/style;
 * прочие элементы (div/img/base…) в <head> НЕ попадают (мусор для сниппет-
 * экстракции Яндекса, <base> молча переписал бы относительные URL).
 * Пишет только HMAC-авторизованный владелец — исполняемый JS тут by design.
 */
function initCustomHead(html: string): void {
  const holder = document.createElement("div");
  holder.innerHTML = html; // парсинг БЕЗ вставки в документ → без исполнения
  const HEAD_TAGS = new Set(["META", "LINK", "NOSCRIPT", "STYLE"]);
  Array.from(holder.childNodes).forEach((node) => {
    if (node instanceof HTMLScriptElement) {
      const s = document.createElement("script");
      Array.from(node.attributes).forEach((a) => s.setAttribute(a.name, a.value));
      if (!node.src && node.textContent) s.textContent = node.textContent;
      document.head.appendChild(s);
    } else if (
      node instanceof HTMLElement &&
      HEAD_TAGS.has(node.tagName)
    ) {
      // meta/link/noscript/style — как есть (append перемещает узел)
      document.head.appendChild(node);
    }
    // прочие узлы (текст, div, img, base…) — отброшены
  });
}

/**
 * c99-C — единая точка входа аналитики (вызывает ea-cookie-banner
 * после «Принять все» / при живом консенте). Порядок:
 *   1. fetch('/api/vars.php') — настройки из админки (кеш 5 мин);
 *   2. Метрика: ID из vars, иначе env-фолбэк (прод-счётчик деплоя);
 *   3. GA4 — если gaId задан;
 *   4. произвольные пиксели — если customHead задан;
 * Идемпотентна (loadStarted), НИКОГДА не бросает — аналитика не имеет
 * права уронить сайт. На сервере — noop.
 */
export async function loadAnalytics(): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (loadStarted) return;
  loadStarted = true;

  // (1) рантайм-настройки; любая ошибка (сеть/битый JSON/зеркало) — фолбэк env
  let vars: AnalyticsVars | null = null;
  try {
    const res = await fetch("/api/vars.php", { credentials: "same-origin" });
    if (res.ok) {
      vars = parseVars((await res.json()) as Record<string, unknown>);
    }
  } catch {
    vars = null; // dev-сервер отдаёт PHP исходником → json() бросает → сюда
  }

  // (2)-(4): try ПО ВЕНДОРУ (c99-fix, критик E2-m2): исключение в Метрике
  // (битый DOM/инъекция) не должно глушить GA4 и пиксели владельца —
  // каждый грузится независимо и падает самостоятельно.
  try {
    // (2) Метрика: ID владельца из админки > env из деплоя
    const id = vars?.metrikaId
      ? Number(vars.metrikaId)
      : metricaIdNumber();
    if (Number.isFinite(id) && id > 0) {
      initMetrika(id, vars?.webvisor ?? true, vars?.clickmap ?? true);
    }
  } catch {
    // сайт важнее аналитики
  }
  try {
    // (3) GA4
    if (vars?.gaId) initGtag(vars.gaId);
  } catch {
    // сайт важнее аналитики
  }
  try {
    // (4) произвольные пиксели владельца
    if (vars?.customHead) initCustomHead(vars.customHead);
  } catch {
    // сайт важнее аналитики
  }
}

/* ------------------------------------------------------------------ goals */

/**
 * Отправка цели: ym(ID, "reachGoal", name, params).
 * ID — инициализированный счётчик (activeMetrikaId; c99-C: он может
 * отличаться от env, если владелец сменил счётчик в админке), фолбэк —
 * env-ID, если метрика ещё не грузилась. c99-fix (критик E2-m1): если
 * loadAnalytics ещё не дорезолвился (async fetch vars.php) — создаём
 * стаб-очередь здесь: команда буферизуется и уйдёт сразу после загрузки
 * tag.js (до фикса цель в этом окне терялась молча). Без ID / на
 * сервере — безопасный noop. Ошибки глотаются: аналитика не ломает UI.
 */
export function trackGoal(
  name: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  const id = activeMetrikaId !== null ? activeMetrikaId : metricaIdNumber();
  if (!Number.isFinite(id)) return;
  try {
    ensureYmStub();
    const ym = (window as WindowWithAnalytics).ym;
    if (typeof ym !== "function") return;
    ym(id, "reachGoal", name, params ?? {});
  } catch {
    // noop: даже битый инстанс метрики не должен ронять обработчик клика
  }
}

/* ------------------------------------------------------ anchor click goals */

/**
 * Хосты мессенджеров/соцсетей (ТЗ W3): wa.me, t.me, vk.com, instagram.
 * c92: max.ru ДОБАВЛЕН — владелец дал реальный профиль
 * (max.ru/u/f9LHodD0…), клики по строке «Макс» теперь считаются
 * целью MESSENGER_CLICK (раньше профиль не существовал — F2, cycle-71).
 */
const MESSENGER_HOSTS_RE = /(?:wa\.me|t\.me|vk\.com|instagram\.com|max\.ru)/i;

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
