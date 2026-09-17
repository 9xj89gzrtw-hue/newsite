import { normalizePhone } from "@/lib/phone";

/**
 * c95 (1-d): клиентский сабмит лида на РЕАЛЬНЫЙ бэкенд.
 *
 * Сайт — статический экспорт на PHP-хостинге (SpaceWeb): до c95 все формы
 * «отправлялись» через mailto (открытие почтового клиента). Теперь рядом со
 * статикой живёт same-origin PHP-эндпоинт POST /api/lead.php (public/api —
 * в проде отдаётся Apache напрямую, мимо Next), который складывает заявку в
 * server-data/leads.json + уведомляет владельца (Telegram/mail).
 *
 * Контракт эндпоинта (фиксирован, см. public/api/lead.php):
 *   POST /api/lead.php
 *   Content-Type: application/json
 *   X-Requested-With: XMLHttpRequest   ← нестандартный заголовок как
 *     CSRF-щит (кросс-доменный fetch потребует preflight, который наш
 *     сервер не разрешает; дублирует проверку Origin на сервере)
 *   body: { name: 1..100, phone, email?, comment? ≤2000,
 *           source: "calculator"|"contact"|"footer", consent: true,
 *           honeypot?, elapsedMs, payload (small snapshot) }
 *   200 {ok:true,id} | 400 {ok:false,error:"validation"} |
 *   429 {ok:false,error:"rate",retryAfterSec} |
 *   500 {ok:false,error:"delivery"} | сеть/таймаут.
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
 * статус (всё, что не 200/400/429); `server` — 429 (сервер жив, просит
 * подождать — с retryAfterSec); `validation` — 400 (данные отвергнуты).
 */
export type LeadResult =
  | { ok: true; id: string }
  | { ok: false; reason: "network" | "server" | "validation"; retryAfterSec?: number };

/** Полный аргумент submitLead: данные формы + анти-спам-поля. */
export type LeadSubmitArgs = LeadPayload & {
  /** Согласие 152-ФЗ — сервер требует true. */
  consent: boolean;
  /** Honeypot-значение (заполненное ≠ пустое = бот). */
  honeypot?: string;
  /** Мс от показа формы до сабмита (мгновенный POST ≈ бот). */
  elapsedMs?: number;
};

/**
 * Отправить лид на /api/lead.php. Никогда не бросает исключений —
 * любой сбой (включая отсутствие AbortSignal.timeout в старом браузере)
 * схлопывается в {ok:false, reason:"network"}.
 */
export async function submitLead(p: LeadSubmitArgs): Promise<LeadResult> {
  /* Тело запроса собираем заранее (JSON.stringify не бросает на нашем
   * shape; undefined-поля выпадают из JSON автоматически). Телефон —
   * через единый сайтовый normalizePhone (src/lib/phone.ts): сервер
   * получает канонический +7XXXXXXXXXX, сырую строку не отправляем. */
  let body: string;
  try {
    body = JSON.stringify({
      name: p.name,
      phone: normalizePhone(p.phone),
      email: p.email || undefined,
      comment: p.comment || undefined,
      source: p.source,
      consent: p.consent,
      honeypot: p.honeypot || undefined,
      elapsedMs: p.elapsedMs ?? 0,
      payload: p.payload ?? {},
    });
  } catch {
    return { ok: false, reason: "network" };
  }

  let res: Response;
  try {
    res = await fetch("/api/lead.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body,
      /* K4-F1 (наследие прежнего fetch-кода): мёртвый upstream не вешает
       * форму навсегда; DOMException TimeoutError уходит в общий catch. */
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    /* Сеть/таймаут/DNS/устаревший браузер без AbortSignal.timeout. */
    return { ok: false, reason: "network" };
  }

  /* 400 — данные отвергнуты валидацией сервера (не ретраить вслепую). */
  if (res.status === 400) return { ok: false, reason: "validation" };

  /* 429 — rate limit: сервер жив, но просит подождать. retryAfterSec
   * берём из JSON-тела, фолбэк — заголовок Retry-After (сек). */
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

  /* Всё прочее (включая 500 delivery и не-JSON 200) → network:
   * вызывающая форма уходит в mailto-фолбэк, лид не теряется. */
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
