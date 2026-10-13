import { normalizePhone } from "@/lib/phone";

/**
 * c95 (1-d): клиентский сабмит лида на РЕАЛЬНЫЙ бэкенд.
 *
 * Сайт — статический экспорт на PHP-хостинге (SpaceWeb): до c95 все формы
 * «отправлялись» через mailto (открытие почтового клиента). Теперь рядом со
 * статикой живёт same-origin PHP-эндпоинт POST /api/lead.php (public/api —
 * в проде отдаётся Apache напрямую, мимо Next), который складывает заявку в
 * server-data/leads.json + уведомляет владельца (Telegram/mail).
 *
 * Контракт эндпоинта (фиксирован, см. public/api/lead.php):
 *   POST /api/lead.php
 *   Content-Type: application/json
 *   X-Requested-With: XMLHttpRequest   ← нестандартный заголовок как
 *     CSRF-щит (кросс-доменный fetch потребует preflight, который наш
 *     сервер не разрешает; дублирует проверку Origin на сервере).
 *     c98-A: сервер принимает и БЕЗ XRW, если Origin ∈ allowlist —
 *     это открывает дорогу sendBeacon при закрытии вкладки.
 *   body: { name: 1..100, phone, email?, comment? ≤2000,
 *           source: "calculator"|"contact"|"footer", consent: true,
 *           clientId (UUID v4, c98-A идемпотентность),
 *           honeypot?, elapsedMs?, payload (small snapshot) }
 *   200 {ok:true,id[,dedupe:true]} | 400 {ok:false,error:"validation"} |
 *   429 {ok:false,error:"rate",retryAfterSec} |
 *   500 {ok:false,error:"delivery"} | сеть/таймаут.
 *
 * c98-A — Outbox (гарантия доставки при сбое сети/закрытии вкладки/деплое
 * в момент отправки; паттерн transactional-outbox/localStorage-queue):
 *  - до отправки заявка кладётся в localStorage 'catering-lead-outbox';
 *  - успех (ok:true или dedupe:true) → запись удаляется;
 *  - провал (сеть/таймаут/5xx) → запись остаётся, tries++;
 *  - при следующей загрузке сайта (не админка) через 1.5с записи старше
 *    20с с tries<3 переотправляются — С ТЕМ ЖЕ clientId, сервер дедупит;
 *    c98-FIX2: инициализацию вызывает LeadOutboxResender из КОРНЕВОГО
 *    layout — на любой странице, не только на главной (см. ниже);
 *  - при pagehide во время in-flight отправки — дублирующий sendBeacon
 *    (идемпотентность сервера гасит дубль);
 *  - записи старше 7 дней удаляются (cap 10, старейшие вытесняются).
 *
 * Таймаут — AbortSignal.timeout(12000) (как в прежнем fetch-коде формы,
 * K4-F1): мёртвый upstream не подвешивает кнопку «Отправляем…» навсегда.
 *
 * Ошибки НЕ бросаем: любой сбой возвращаем дискриминированным union —
 * вызывающая форма решает сама (у нас — прозрачный mailto-фолбэк, UX
 * деградирует ровно к поведению до c95).
 */

/** Данные лида из формы (без анти-спам-полей — их добавляет submitLead). */
export type LeadPayload = {
  name: string;
  phone: string;
  email?: string;
  comment?: string;
  source: "calculator" | "contact" | "footer";
  /** Произвольный снимок контекста (выбранный формат/гости/пакет…) — держать маленьким. */
  payload?: Record<string, unknown>;
};

/**
 * Результат сабмита. `network` — нет связи/таймаут/не-JSON/неожиданный
 * статус (всё, что не 200/400/429); `server` — 429 (сервер жив, просит
 * подождать — с retryAfterSec); `validation` — 400 (данные отвергнуты).
 */
export type LeadResult =
  | { ok: true; id: string }
  | { ok: false; reason: "network" | "server" | "validation"; retryAfterSec?: number; queued?: boolean };

/** Полный аргумент submitLead: данные формы + анти-спам-поля. */
export type LeadSubmitArgs = LeadPayload & {
  /** Согласие 152-ФЗ — сервер требует true. */
  consent: boolean;
  /** Honeypot-значение (заполненное ≠ пустое = бот). */
  honeypot?: string;
  /** Мс от показа формы до сабмита (мгновенный POST ≈ бот). */
  elapsedMs?: number;
};

/* --------------------------------------------------- outbox (c98-A, браузер) */

const OUTBOX_KEY = "catering-lead-outbox";
const OUTBOX_CAP = 10;
/** Максимум авто-резендов одной записи; дальше — ждём нового действия юзера. */
const OUTBOX_MAX_TRIES = 3;
/** Запись моложе 20с не резендим: возможно, отправка ещё идёт в этой вкладке. */
const OUTBOX_MIN_AGE_MS = 20_000;
/** Записи старше 7 дней считаются безнадёжными — чистим. */
const OUTBOX_TTL_MS = 7 * 24 * 3600 * 1000;

type OutboxEntry = {
  clientId: string;
  /** Полные аргументы сабмита ( resend = обычная отправка). */
  payload: LeadSubmitArgs;
  ts: number;
  tries: number;
};

// Accessing the localStorage getter can itself throw (blocked storage,
// private browsing, embedded previews). Storage is optional, the form is not.
const isBrowser = typeof window !== "undefined";

/** Не админка: на /admin outbox не живёт (не таскаем данные форм по панели). */
const isPublicPage = (): boolean =>
  isBrowser && !window.location.pathname.startsWith("/admin");

/** crypto.randomUUID с фолбэком для старых браузеров (8-64 hex, валиден сервером). */
function makeClientId(): string {
  if (isBrowser && typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      /* ниже — фолбэк */
    }
  }
  let s = "";
  for (let i = 0; i < 32; i++) {
    s += Math.floor(Math.random() * 16).toString(16);
  }
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

function readOutbox(): OutboxEntry[] {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(OUTBOX_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (e): e is OutboxEntry =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as OutboxEntry).clientId === "string" &&
        Number.isFinite((e as OutboxEntry).ts) &&
        Number.isInteger((e as OutboxEntry).tries) &&
        (e as OutboxEntry).tries >= 0 &&
        typeof (e as OutboxEntry).payload === "object" &&
        (e as OutboxEntry).payload !== null &&
        typeof (e as OutboxEntry).payload.phone === "string" &&
        typeof (e as OutboxEntry).payload.name === "string" &&
        ["calculator", "contact", "footer"].includes((e as OutboxEntry).payload.source) &&
        (e as OutboxEntry).payload.consent === true,
    );
  } catch {
    return []; // битый localStorage/квота — outbox не должен ломать отправку
  }
}

function writeOutbox(entries: OutboxEntry[]): boolean {
  if (!isBrowser) return false;
  try {
    window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(entries.slice(-OUTBOX_CAP)));
    return true;
  } catch {
    /* квота/приватный режим — молча: основная отправка важнее */
    return false;
  }
}

/** Положить заявку в outbox ДО отправки (даже крэш вкладки не теряет её). */
function outboxAdd(entry: OutboxEntry): boolean {
  if (!isBrowser) return false;
  const entries = readOutbox();
  entries.push(entry);
  // cap + чистка протухших: старейшие вытесняются
  const now = Date.now();
  const fresh = entries.filter((e) => now - e.ts < OUTBOX_TTL_MS);
  return writeOutbox(fresh.slice(-OUTBOX_CAP));
}

function outboxRemove(clientId: string): void {
  if (!isBrowser) return;
  const entries = readOutbox().filter((e) => e.clientId !== clientId);
  writeOutbox(entries);
}

function outboxBumpTries(clientId: string): void {
  if (!isBrowser) return;
  const entries = readOutbox();
  for (const e of entries) {
    if (e.clientId === clientId) e.tries += 1;
  }
  writeOutbox(entries);
}

/* ------------------------------------------------------ низкоуровневый POST */

/** Признак «сейчас есть in-flight отправка» — для sendBeacon на pagehide. */
const inFlight = new Map<string, Record<string, unknown>>();

/**
 * POST /api/lead.php с телом (включая clientId). Возвращает дискриминированный
 * LeadResult; не бросает исключений. Используется и формами (submitLead),
 * и авто-резендом outbox — одна сеть, один контракт.
 */
async function postLead(bodyObj: Record<string, unknown>): Promise<LeadResult> {
  let body: string;
  try {
    body = JSON.stringify(bodyObj);
  } catch {
    return { ok: false, reason: "network" };
  }

  let res: Response;
  // AbortSignal.timeout is unavailable in older Safari releases. Use the
  // ubiquitous AbortController rather than silently skipping the POST.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    res = await fetch("/api/lead.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body,
      /* K4-F1 (наследие прежнего fetch-кода): мёртвый upstream не вешает
       * форму навсегда; DOMException TimeoutError уходит в общий catch. */
      signal: controller.signal,
    });
    return await readLeadResponse(res);
  } catch {
    /* Сеть/таймаут/DNS. */
    return { ok: false, reason: "network" };
  } finally {
    clearTimeout(timeout);
  }
}

async function readLeadResponse(res: Response): Promise<LeadResult> {
  /* 400 — данные отвергнуты валидацией сервера (не ретраить вслепую). */
  if (res.status === 400) return { ok: false, reason: "validation" };

  /* 429 — rate limit: сервер жив, но просит подождать. retryAfterSec
   * берём из JSON-тела, фолбэк — заголовок Retry-After (сек). */
  if (res.status === 429) {
    let retryAfterSec: number | undefined;
    try {
      const data = (await res.json()) as { retryAfterSec?: unknown };
      if (typeof data?.retryAfterSec === "number" && data.retryAfterSec > 0) {
        retryAfterSec = Math.ceil(data.retryAfterSec);
      }
    } catch {
      // не-JSON-тело — попробуем заголовок
    }
    if (retryAfterSec === undefined) {
      const ra = Number(res.headers.get("Retry-After"));
      if (Number.isFinite(ra) && ra > 0) retryAfterSec = Math.ceil(ra);
    }
    return retryAfterSec === undefined
      ? { ok: false, reason: "server" }
      : { ok: false, reason: "server", retryAfterSec };
  }

  /* Всё прочее (включая 500 delivery и не-JSON 200) → network:
   * вызывающая форма уходит в mailto-фолбэк, лид не теряется. */
  if (res.status !== 200) return { ok: false, reason: "network" };
  try {
    const data = (await res.json()) as { ok?: unknown; id?: unknown };
    if (data?.ok === true) {
      /* id может прийти строкой (CUID) или числом (легаси) — приводим к
       * string; прочий шейп не должен ломать успех (пустой id = заявка
       * принята, номер не показываем). */
      const id =
        typeof data.id === "number"
          ? String(data.id)
          : typeof data.id === "string"
            ? data.id
            : "";
      return { ok: true, id };
    }
  } catch {
    // не-JSON — ниже
  }
  return { ok: false, reason: "network" };
}

/* --------------------------------------------------------- авто-резенд (c98) */

/**
 * Резенд записей outbox: возраст >20с, tries<3. Тот же clientId — сервер
 * отвечает dedupe:true, дублей не создаёт. Вызывается один раз через 1.5с
 * после загрузки модуля (client-side only, не в админке).
 */
async function outboxFlush(): Promise<void> {
  if (!isPublicPage()) return;
  const now = Date.now();
  const entries = readOutbox();
  // чистка протухших — даже без отправки
  const fresh = entries.filter((e) => now - e.ts < OUTBOX_TTL_MS);
  if (fresh.length !== entries.length) writeOutbox(fresh);
  const due = fresh.filter(
    (e) => now - e.ts > OUTBOX_MIN_AGE_MS && e.tries < OUTBOX_MAX_TRIES,
  );
  for (const e of due) {
    /* c98-FIX3 (критик 7 MAJOR «заявка-зомби»): outbox хранит СЫРОЙ payload
     * (первая отправка шла с normalizePhone(p.phone), а в outbox лёг p) —
     * резенд гонял телефон с точками/скобками, который сервер отвергает
     * 400-validation. Плюс отсутствовала validation-ветка (как в submitLead):
     * ретраить навсегда отвергнутые данные бессмысленно. Нормализуем телефон
     * при резенде + 400 → чистим запись. */
    const result = await postLead({
      ...e.payload,
      phone: normalizePhone(e.payload.phone),
      clientId: e.clientId,
    });
    /* `!== false`-паттерн (tsconfig strict:false — truthiness не сужает
     * union, см. submitLead/postLead). */
    if (result.ok !== false) {
      outboxRemove(e.clientId); // доставлена (в т.ч. dedupe) — чистим
    } else if (result.reason === "validation") {
      /* Сервер твёрдо отверг данные (формат) — ретраи бесполезны. */
      outboxRemove(e.clientId);
    } else {
      outboxBumpTries(e.clientId);
    }
  }
}

/**
 * c98-FIX2 (критик5 MINOR-5 + NIT-8): авто-резенд outbox + pagehide-beacon —
 * теперь ЯВНАЯ идемпотентная инициализация, а НЕ side-effect импорта модуля.
 * Прежде таймер/листенер вешались при ЗАГРУЗКЕ модуля, а грузился он только
 * на страницах с формами (главная: hacc-booking) — «резенд при следующем
 * визите» означал «при следующем визите НА ГЛАВНУЮ»: заявка, застрявшая в
 * outbox у пользователя, пришедшего с поиска прямо на /offer, не доезжала.
 * Инициализацию теперь вызывает микро-компонент LeadOutboxResender из
 * КОРНЕВОГО layout (все публичные страницы + /admin — там outboxFlush/
 * beacon сами уходят по isPublicPage()-гейту). Guard-флаг на window (не в
 * модуле): дублирование модуля в двух чанках (будущие dynamic import'ы)
 * не даст двух таймеров и двух beacon'ов (tries++ не задваивается).
 * Повторные вызовы — no-op.
 */
export function resendPendingLeads(): void {
  if (!isBrowser) return;
  const w = window as Window & { __nilovLeadOutboxInit?: boolean };
  if (w.__nilovLeadOutboxInit) return;
  w.__nilovLeadOutboxInit = true;

  /* Авто-резенд при загрузке: записи старше 20с (с прошлой сессии/вкладки)
   * догоняем. setTimeout, а не сразу — не спорим с загрузкой страницы. */
  try {
    window.setTimeout(() => void outboxFlush(), 1500);
  } catch {
    /* не должно случаться, но outbox не имеет права ломать загрузку */
  }

  /* sendBeacon при закрытии вкладки: если отправка ещё in-flight, шлём
   * дублирующий beacon (сервер дедупит по clientId — дубля не будет).
   * Beacon не умеет кастомных заголовков — сервер c98-A принимает
   * same-origin Origin без X-Requested-With. */
  window.addEventListener(
    "pagehide",
    () => {
      if (inFlight.size === 0 || !isPublicPage()) return;
      // Each active request needs its own beacon. Using the last outbox entry
      // lost concurrent submissions and did not work with blocked storage.
      for (const bodyObj of inFlight.values()) {
        try {
          navigator.sendBeacon(
            "/api/lead.php",
            new Blob([JSON.stringify(bodyObj)], { type: "application/json" }),
          );
        } catch {
          /* старый браузер без sendBeacon — основная отправка ещё может успеть */
        }
      }
    },
    { passive: true },
  );
}

/* --------------------------------------------------------------- публичное API */

/**
 * Отправить лид на /api/lead.php. Никогда не бросает исключений —
 * любой сбой (включая отсутствие AbortSignal.timeout в старом браузере)
 * схлопывается в {ok:false, reason:"network"}.
 *
 * c98-A: перед отправкой заявка регистрируется в localStorage-outbox с
 * уникальным clientId; успех вычищает запись, провал оставляет её для
 * авто-резенда при следующей загрузке. Внешний контракт (типы аргумента
 * и результата) не изменился — формы не требуют правок.
 */
export async function submitLead(p: LeadSubmitArgs): Promise<LeadResult> {
  /* Тело запроса собираем заранее (JSON.stringify не бросает на нашем
   * shape; undefined-поля выпадают из JSON автоматически). Телефон —
   * через единый сайтовый normalizePhone (src/lib/phone.ts): сервер
   * получает канонический +7XXXXXXXXXX, сырую строку не отправляем.
   * c98-A: elapsedMs НЕ подменяем нулём — отсутствующее поле сервер
   * больше не считает ловушкой (старый бандл с `?? 0` губил заявки). */
  const clientId = makeClientId();
  const bodyObj: Record<string, unknown> = {
    clientId,
    name: p.name,
    phone: normalizePhone(p.phone),
    email: p.email || undefined,
    comment: p.comment || undefined,
    source: p.source,
    consent: p.consent,
    honeypot: p.honeypot || undefined,
    elapsedMs: typeof p.elapsedMs === "number" && p.elapsedMs > 0 ? p.elapsedMs : undefined,
    payload: p.payload ?? {},
  };

  /* Заявка сначала «на бумаге» (outbox), потом в сеть — крэш вкладки
   * в момент fetch больше не теряет лида. */
  const persisted = outboxAdd({ clientId, payload: p, ts: Date.now(), tries: 0 });

  inFlight.set(clientId, bodyObj);
  try {
    const result = await postLead(bodyObj);
    /* `!== false`, а не `if (result.ok)`: tsconfig проекта strict:false —
     * truthiness-сужение тут не работает (паттерн из hacc-booking c95). */
    if (result.ok !== false) {
      /* ok:true или dedupe:true (оба выглядят как {ok:true,id}) — доставлено. */
      outboxRemove(clientId);
    } else if (result.reason === "validation") {
      /* 400-validation ретраить бессмысленно (сервер твёрдо отверг
       * данные) — запись чистим, не копим мусор. */
      outboxRemove(clientId);
    } else {
      /* Сеть/таймаут/5xx/429 — запись остаётся в outbox для авто-резенда
       * (tries++; после 3 неудач не таскаем — владелец увидит через mailto
       * при следующей попытке юзера). */
      outboxBumpTries(clientId);
    }
    return result.ok === false
      ? { ...result, queued: persisted && result.reason !== "validation" }
      : result;
  } finally {
    inFlight.delete(clientId);
  }
}
