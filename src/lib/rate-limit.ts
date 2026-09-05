import type { NextRequest } from "next/server";

/**
 * 81-F4 [SEC2, W1-c]: token-bucket rate-limiter in-memory, zero-deps
 * (паттерн 81-R1/P5 — beenotung/token-bucket.ts + freecodecamp Jan 2026).
 *
 * Модель: Map<key, {tokens, last}>. «Ленивый» refill — БЕЗ таймеров и
 * interval-ов: бакет пополняется только в момент обращения, по времени,
 * прошедшему с прошлого обращения (elapsedMin × refillPerMin). Это
 * приложение — single-instance (standalone, один node-процесс), поэтому
 * in-memory Map корректен; для multi-instance нужен Redis/Durable Object.
 *
 * Ограничение: module-state живёт до перезагрузки процесса (dev hot-reload
 * роута сбрасывает Map — приемлемо: лимит защищает от всплеска, а не
 * вечная квота).
 */

interface Bucket {
  /** Доступные токены (float, ≤ capacity). */
  tokens: number;
  /** Момент последнего обращения (Date.now()) — точка отсчёта refill. */
  last: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Порог памяти: Map не может расти бесконечно (каждый уникальный
 * ip+route — ключ). При превышении удаляем САМЫЕ СТАРЫЕ ключи.
 *
 * «Самые старые» = наименее недавно активные: каждый успешный/отклонённый
 * touch перемещает ключ в конец Map (delete+set — Map хранит порядок
 * вставки), поэтому начало итерации — кандидаты на evict.
 */
const MAX_KEYS = 1000;

export interface RateLimitOptions {
  /** Ёмкость бакета — максимально Burst запросов подряд. */
  capacity: number;
  /** Скорость пополнения: токенов в минуту. */
  refillPerMin: number;
}

export interface RateLimitResult {
  /** false → запрос исчерпал бакет, отдать 429. */
  ok: boolean;
  /** Сколько секунд ждать до следующей попытки (для Retry-After). ≥1. */
  retryAfterSec: number;
}

/**
 * Проверить и списать один токен. Возвращает {ok, retryAfterSec}.
 *
 * Порядок: сначала ленивый refill (min(capacity, tokens + elapsed×rate)),
 * затем попытка списать 1 токен. Отказ НЕ списывает токен, но фиксирует
 * момент обращения (last) — время между отказами тоже копится в refill.
 *
 * Пример (lead: capacity 5, refill 3/мин): 5 POST подряд — ок, 6-й — 429
 * c Retry-After ~20с (1/3 минуты до следующего токена).
 */
export function rateLimit(
  key: string,
  { capacity, refillPerMin }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (existing === undefined) {
    evictIfNeeded();
    buckets.set(key, { tokens: capacity - 1, last: now });
    return { ok: true, retryAfterSec: 0 };
  }

  // Ленивый refill: время, прошедшее с прошлого обращения, конвертируем
  // в токены (без таймеров — вся математика только на месте).
  const elapsedMin = (now - existing.last) / 60_000;
  const tokens = Math.min(capacity, existing.tokens + elapsedMin * refillPerMin);

  // Touch: перемещаем ключ в конец Map (LRU-семантика для evict).
  buckets.delete(key);

  if (tokens >= 1) {
    buckets.set(key, { tokens: tokens - 1, last: now });
    return { ok: true, retryAfterSec: 0 };
  }

  // Отказ: токенов < 1 — считаем, сколько ждать до целого токена.
  const retryAfterSec = Math.max(
    1,
    Math.ceil(((1 - tokens) / refillPerMin) * 60),
  );
  buckets.set(key, { tokens, last: now });
  return { ok: false, retryAfterSec };
}

/** Держим Map ≤ MAX_KEYS: при достижении порога удаляем старейшие записи. */
function evictIfNeeded() {
  if (buckets.size < MAX_KEYS) return;
  const excess = buckets.size - MAX_KEYS + 1;
  let evicted = 0;
  for (const oldest of buckets.keys()) {
    if (evicted >= excess) break;
    buckets.delete(oldest);
    evicted++;
  }
}

/**
 * IP клиента для ключа лимита (и consentIp в 152-ФЗ-proof — см. роуты).
 *
 * 81-W2F3 [G MAJOR #2 «XFF-спуфинг»]: доверие к x-forwarded-for зависит
 * от модели шлюза деплоя, слепо брать первый элемент небезопасно:
 *  - ЭТОТ прод (self-hosted за Caddy-шлюзом): reverse_proxy настроен
 *    `header_up X-Forwarded-For {remote_host}` — шлюз ПЕРЕЗАПИСЫВАЕТ
 *    клиентский XFF значением TCP remote host; спуф стирается, в заголовке
 *    ровно ОДНА доверительная запись → берём ПЕРВУЮ (= единственную).
 *    (Прямые запросы к Next без шлюза — dev/localhost: заголовков нет,
 *    см. fallback "local" ниже.)
 *  - Vercel (process.env.VERCEL === "1" — ставит сама платформа):
 *    платформа ДОБАВЛЯЕТ реальный IP подключившегося к СУЩЕСТВУЮЩЕМУ
 *    (клиент-контролируемому) XFF — все записи, кроме последней,
 *    спуфаемы клиентом → берём ПОСЛЕДНЮЮ запись (ближайший прокси).
 * С одиночным XFF обе ветки дают один и тот же результат.
 * fallback x-real-ip, затем константа "local" (прямые запросы без
 * прокси — dev/localhost; все они делят один бакет, что корректно).
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const entries = forwarded
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const entry =
      process.env.VERCEL === "1"
        ? entries[entries.length - 1]
        : entries[0];
    if (entry) return entry;
  }
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "local";
}

/** Тест-хук: сброс состояния (используется только из проверок). */
export function __resetRateLimitsForTests() {
  buckets.clear();
}
