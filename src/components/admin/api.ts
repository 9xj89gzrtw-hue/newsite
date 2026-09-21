/**
 * c95 (Task 1-b) — API-клиент админ-панели.
 *
 * Все запросы идут на единый эндпоинт `/api/admin.php?action=…`
 * (см. public/api/README.md — контракт, 67/67 smoke-тестов).
 *
 * Особенности:
 *  - Каждый запрос (включая GET) несёт `X-Requested-With: XMLHttpRequest`
 *    (require_same_origin в PHP пропускает GET и без него, но шлём везде —
 *    единообразие и страховка).
 *  - 401 (кроме ожидаемых login/session) → CustomEvent `nilov-admin-unauth`
 *    на window: страница переключается на экран входа, тост «Сессия истекла».
 *  - Сетевой сбой → тост «Нет связи с сервером», статус 0 (не бросаем).
 *  - `base` (опционально) — переопределение origin для тестов
 *    (`bun test` против локального PHP `php -S 127.0.0.1:3007`); в браузере
 *    всегда same-origin ('' по умолчанию, NEXT_PUBLIC_ADMIN_API_BASE — запасной
 *    вариант для нестандартных зеркал).
 *  - MOCK-режим (`?mock=1` на /admin → localStorage 'nilov-admin-mock';
 *    4-F2: активируется ТОЛЬКО на localhost/127.0.0.1 — на проде/зеркале
 *    флаг не ставится и авто-стирается):
 *    полностью эмулирует API реалистичными данными — сквозной e2e UI
 *    на dev-сервере Next (PHP там не исполняется). Меню для мока —
 *    динамический импорт src/data/menu.json (отдельный чанк, не грузится
 *    в проде без мока).
 */
import { toast } from "sonner";
import type { MenuData } from "@/lib/menu-schema";

/* ------------------------------------------------------------------ config */

const envBase =
  typeof process !== "undefined" &&
  process.env &&
  process.env.NEXT_PUBLIC_ADMIN_API_BASE
    ? String(process.env.NEXT_PUBLIC_ADMIN_API_BASE)
    : "";

/** База URL API ('' = same-origin, как в проде). */
export const API_BASE = envBase;

export const MOCK_FLAG_KEY = "nilov-admin-mock";
const MOCK_SESSION_KEY = "nilov-admin-mock-session";
export const DRAFT_KEY = "nilov-admin-draft-v1";

/** 4-F2 (критик D, MINOR «?mock=1 залипает в localStorage»): демо-режим
 *  разрешён ТОЛЬКО на localhost/127.0.0.1. На любом другом хосте (прод
 *  nilovcatering.ru, зеркало *.vercel.app) флаг не ставится и, если залип
 *  с прошлого визита, стирается при первой же проверке — прод не может
 *  незаметно оказаться в демо. */
function isLocalHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

export function enableMockMode(): void {
  if (!isLocalHost()) {
    /* не localhost — флаг не ставим, залипший стираем */
    disableMockMode();
    return;
  }
  try {
    window.localStorage.setItem(MOCK_FLAG_KEY, "1");
  } catch {
    /* private mode — молча */
  }
}

export function isMockMode(): boolean {
  if (typeof window === "undefined") return false;
  if (!isLocalHost()) {
    /* safety-авточистка: чужой хост никогда не отвечает моком */
    try {
      window.localStorage.removeItem(MOCK_FLAG_KEY);
    } catch {
      /* ignore */
    }
    return false;
  }
  try {
    return window.localStorage.getItem(MOCK_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export function disableMockMode(): void {
  try {
    window.localStorage.removeItem(MOCK_FLAG_KEY);
    window.sessionStorage.removeItem(MOCK_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/** 4-F2: зеркало Vercel (*.vercel.app) — /api/* там закрыты редиректом
 *  302→/404 (vercel.json), PHP не исполняется: логин и публикация
 *  невозможны. Функция (а не модульная константа) — вызывается где нужно
 *  и легко тестируется; host не меняется без полной перезагрузки страницы. */
export function isVercelMirror(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.host.endsWith(".vercel.app")
  );
}

/* ------------------------------------------------------------------- types */

export interface Lead {
  id: string;
  /** UNIX-секунды от PHP time() (или строка — на случай будущего формата). */
  ts: number | string;
  read: boolean;
  archived?: boolean;
  source: string;
  name: string;
  phone: string;
  email?: string;
  comment?: string;
  payload?: Record<string, unknown>;
  /** c98-A: ключ идемпотентности (UUID от клиента) — дедуп ретраев. */
  clientId?: string | null;
  /** c98-A: имя backup-файла, если лид записан после битого leads.json. */
  rescuedFrom?: string;
  /** c97: доставлены ли уведомления (TG/почта/клиенту) — после отправки. */
  notify?: LeadNotify;
  /** c102: стадия воронки мини-CRM (нет поля = «новая»); пишется
   *  lead-update'ом или cron'ом (дожим не меняет статус — только маркер). */
  status?: "new" | "contacted" | "agreed" | "lost" | string;
  /** c102: заметка владельца по заявке (≤1000, \n-нормализация на сервере;
   *  null/пусто — очистить). */
  note?: string | null;
  /** c102: когда клиенту ушёл авто-дожим (UNIX-секунды) — письмо-напоминание
   *  отправлено автоматически, повторных не будет. */
  followupTs?: number;
  /** c102: доставлен ли авто-дожим (false = письмо не дошло). */
  followupOk?: boolean;
  /** c102: когда пинговали владельца о зависшей заявке. */
  nudgedTs?: number;
}

export interface AdminSettings {
  notifyEmail: string;
  tgChatId: string;
  tgApiBase: string;
  /** c96: последняя успешная база Bot API (read-only из UI). */
  tgWorkingBase: string;
  botTokenSet: boolean;
  botTokenMasked: string;
  /** c97: SMTP для надёжной доставки почты (SpaceWeb и др.). */
  smtpHost: string;
  smtpPort: number | null;
  smtpUser: string;
  smtpFrom: string;
  smtpSet: boolean;
  smtpPassMasked: string;
  /** c99-C: аналитика — редактируется владельцем без передеплоя. */
  metrikaId: string;
  metrikaWebvisor: boolean;
  metrikaClickmap: boolean;
  gaId: string;
  customHeadHtml: string;
  /** c102: автоматизация — утренняя сводка заявок (дефолт вкл, см. _lib.php). */
  autoDigest: boolean;
  /** c102: автоматизация — авто-дожим клиента через 24ч без статуса. */
  autoFollowup: boolean;
  /** c102: автоматизация — TG-пинг о зависших заявках (дефолт выкл). */
  autoNudge: boolean;
  /** c102: порог «зависла» для пинга, часы (1–24, дефолт 3). */
  autoNudgeHours: number;
  /** c102: выдан ли секретный cron-токен (read-only: меняется cron-token'ом). */
  cronEnabled: boolean;
  /** c102: состояние планировщика — последний запуск/сводка/дожим/пинг
   *  (read-only, пишет cron.php). null = ни одного запуска. */
  cronState?: Record<string, unknown> | null;
}

/** c97: статус доставки уведомлений по заявке (lead.php → leads.json). */
export interface LeadNotify {
  ts: number | string;
  tg: boolean;
  mail: boolean;
  client: boolean | null;
  mailTransport?: string | null;
  /** c99: имя PDF-меню, прикреплённого к письму клиенту (null = без вложения). */
  clientPdf?: string | null;
}

/* 4-F2: 'cancelled' — деплой вытеснен более новой публикацией (конкурирующий
 *  publish отменяет идущий деплой; состояние возвращает admin.php). */
export type BuildState = "unknown" | "building" | "success" | "failure" | "cancelled";

export interface AdminApiOptions {
  method?: "GET" | "POST";
  body?: unknown;
  params?: Record<string, string>;
  signal?: AbortSignal;
  /** Переопределение origin (тесты против локального PHP). */
  base?: string;
  /** Дополнительные заголовки (тесты: Cookie). */
  headers?: Record<string, string>;
  /** 401 — ожидаемый исход (login/session): без события и тоста. */
  expect401?: boolean;
}

export interface ApiResponse {
  status: number;
  body: Record<string, unknown> | null;
  /** Set-Cookie из ответа (тесты). */
  cookies?: string[];
}

/* -------------------------------------------------------------- core fetch */

export async function adminApi(
  action: string,
  opts: AdminApiOptions = {},
): Promise<ApiResponse> {
  if (isMockMode()) return mockApi(action, opts);
  /* 4-F2: на зеркале Vercel в сеть не ходим вовсе — /api/* закрыты
   * редиректом 302→/404. Все вызовы тихо «падают» (статус 0 без тоста),
   * а вместо экрана входа AdminApp показывает карточку-заглушку
   * (см. isVercelMirror в admin-app.tsx). */
  if (isVercelMirror()) return { status: 0, body: null };

  const method = opts.method ?? (opts.body === undefined ? "GET" : "POST");
  const base = opts.base ?? API_BASE;
  const qs = new URLSearchParams({ action, ...(opts.params ?? {}) });
  try {
    const res = await fetch(`${base}/api/admin.php?${qs.toString()}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(opts.headers ?? {}),
      },
      credentials: "same-origin",
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      signal: opts.signal,
    });
    let body: Record<string, unknown> | null = null;
    try {
      body = (await res.json()) as Record<string, unknown>;
    } catch {
      body = null;
    }
    if (res.status === 401 && !opts.expect401) {
      window.dispatchEvent(new CustomEvent("nilov-admin-unauth"));
      toast.error("Сессия истекла — войдите заново");
    }
    const cookies =
      typeof res.headers.getSetCookie === "function"
        ? res.headers.getSetCookie()
        : undefined;
    return { status: res.status, body, cookies };
  } catch (e) {
    if ((e as Error)?.name === "AbortError") throw e;
    toast.error("Нет связи с сервером — проверьте интернет");
    return { status: 0, body: null };
  }
}

/* ------------------------------------------------------ typed action layer */

export async function apiSession(
  opts: Pick<AdminApiOptions, "base" | "headers"> = {},
): Promise<{ ok: boolean }> {
  /* 4-F2: на зеркале «сессию» пропускаем без сети — панель смонтируется
   * и покажет карточку-заглушку (вход там всё равно невозможен). */
  if (isVercelMirror()) return { ok: true };
  const r = await adminApi("session", { ...opts, expect401: true });
  return { ok: r.status === 200 && r.body?.ok === true };
}

export type LoginResult =
  | { ok: true; expiresAt: number }
  | {
      ok: false;
      reason: "bad_password" | "locked" | "network";
      retryAfterSec?: number;
    };

export async function apiLogin(
  password: string,
  opts: Pick<AdminApiOptions, "base" | "headers"> = {},
): Promise<LoginResult> {
  const r = await adminApi("login", {
    method: "POST",
    body: { password },
    expect401: true,
    ...opts,
  });
  if (r.status === 200 && r.body?.ok === true) {
    return { ok: true, expiresAt: Number(r.body.expiresAt ?? 0) };
  }
  if (r.status === 401) return { ok: false, reason: "bad_password" };
  if (r.status === 429) {
    return {
      ok: false,
      reason: "locked",
      retryAfterSec: Number(r.body?.retryAfterSec ?? 60),
    };
  }
  return { ok: false, reason: "network" };
}

export async function apiLogout(
  opts: Pick<AdminApiOptions, "base" | "headers"> = {},
): Promise<void> {
  await adminApi("logout", { method: "POST", ...opts, expect401: true });
}

export interface DataPayload {
  menu: MenuData;
  sha: string;
  repo?: string;
  path?: string;
}

export async function apiGetData(
  opts: Pick<AdminApiOptions, "base" | "headers"> = {},
): Promise<
  { ok: true; data: DataPayload } | { ok: false; reason: "network" | "github" }
> {
  const r = await adminApi("data", opts);
  if (r.status === 200 && r.body?.ok === true && r.body.menu) {
    return {
      ok: true,
      data: {
        menu: r.body.menu as MenuData,
        sha: String(r.body.sha ?? ""),
        repo: r.body.repo ? String(r.body.repo) : undefined,
        path: r.body.path ? String(r.body.path) : undefined,
      },
    };
  }
  return { ok: false, reason: r.status === 502 ? "github" : "network" };
}

export type SaveResult =
  | { ok: true; commitSha: string; htmlUrl?: string }
  | {
      ok: false;
      reason: "conflict" | "validation" | "network" | "github";
      errors?: string[];
    };

export async function apiSaveMenu(
  menu: MenuData,
  sha: string | undefined,
  message?: string,
  opts: Pick<AdminApiOptions, "base" | "headers"> = {},
): Promise<SaveResult> {
  const r = await adminApi("save", {
    method: "POST",
    body: { menu, ...(sha ? { sha } : {}), ...(message ? { message } : {}) },
    ...opts,
  });
  if (r.status === 200 && r.body?.ok === true) {
    return {
      ok: true,
      commitSha: String(r.body.commitSha ?? ""),
      htmlUrl: r.body.htmlUrl ? String(r.body.htmlUrl) : undefined,
    };
  }
  if (r.status === 409) return { ok: false, reason: "conflict" };
  if (r.status === 400) {
    /* сервер отдаёт ОДНУ строку в `detail` (validate_menu возвращает ?string);
     * массив `errors` оставлен как запасной формат */
    let errors: string[] | undefined;
    if (Array.isArray(r.body?.errors)) {
      errors = (r.body?.errors as unknown[]).map(String);
    } else if (typeof r.body?.detail === "string" && r.body.detail) {
      errors = [r.body.detail];
    }
    if (r.body?.error === "github") return { ok: false, reason: "github" };
    return { ok: false, reason: "validation", errors };
  }
  return { ok: false, reason: r.status === 502 ? "github" : "network" };
}

export interface StatusPayload {
  state: BuildState;
  htmlUrl?: string;
  runStartedAt?: string;
  deployedAt?: string;
}

export async function apiStatus(
  sha: string,
  opts: Pick<AdminApiOptions, "base" | "headers"> = {},
): Promise<{ ok: true; data: StatusPayload } | { ok: false }> {
  const r = await adminApi("status", { params: { sha }, ...opts });
  if (r.status === 200 && r.body?.ok === true) {
    return {
      ok: true,
      data: {
        state: (r.body.state as BuildState) ?? "unknown",
        htmlUrl: r.body.htmlUrl ? String(r.body.htmlUrl) : undefined,
        runStartedAt: r.body.runStartedAt
          ? String(r.body.runStartedAt)
          : undefined,
        deployedAt: r.body.deployedAt ? String(r.body.deployedAt) : undefined,
      },
    };
  }
  return { ok: false };
}

export interface LeadsPayload {
  total: number;
  leads: Lead[];
}

export async function apiGetLeads(
  limit = 200,
  opts: Pick<AdminApiOptions, "base" | "headers"> = {},
): Promise<{ ok: true; data: LeadsPayload } | { ok: false }> {
  const r = await adminApi("leads", {
    params: { limit: String(limit) },
    ...opts,
  });
  if (r.status === 200 && r.body?.ok === true && Array.isArray(r.body.leads)) {
    return {
      ok: true,
      data: {
        total: Number(r.body.total ?? 0),
        leads: r.body.leads as Lead[],
      },
    };
  }
  return { ok: false };
}

export async function apiLeadUpdate(
  id: string,
  patch: { read?: boolean; archived?: boolean; status?: string; note?: string | null },
): Promise<boolean> {
  const r = await adminApi("lead-update", {
    method: "POST",
    body: { id, ...patch },
  });
  return r.status === 200 && r.body?.ok === true;
}

/** c102 — секретная ссылка для планировщика хостинга (cron.php?token=…).
 *  Токен возвращается РОВНО ОДИН раз при генерации — сервер его больше
 *  не показывает (cronEnabled в settings — только факт «выдан»); поэтому
 *  UI сразу даёт скопировать URL. revoke=true — отключить (токен = null). */
export async function apiCronToken(revoke = false): Promise<{ ok: boolean; token: string | null }> {
  const r = await adminApi("cron-token", { method: "POST", body: revoke ? { revoke: true } : {} });
  return { ok: r.status === 200 && r.body?.ok === true, token: (r.body?.token as string | null) ?? null };
}

/** c96 — пометить ВСЕ заявки прочитанными одним запросом. */
export async function apiLeadsReadAll(): Promise<{
  ok: boolean;
  updated?: number;
}> {
  const r = await adminApi("leads-read-all", { method: "POST", body: {} });
  if (r.status === 200 && r.body?.ok === true) {
    return { ok: true, updated: Number(r.body.updated ?? 0) };
  }
  return { ok: false };
}

export async function apiLeadDelete(id: string): Promise<boolean> {
  const r = await adminApi("lead-delete", { method: "POST", body: { id } });
  return r.status === 200 && r.body?.ok === true;
}

export async function apiGetSettings(
  opts: Pick<AdminApiOptions, "base" | "headers"> = {},
): Promise<{ ok: true; data: AdminSettings } | { ok: false }> {
  const r = await adminApi("settings", opts);
  if (r.status === 200 && r.body?.ok === true) {
    /* реальный эндпоинт вкладывает поля в `settings` (README/admin.php:384);
     * верхний уровень поддержан для устойчивости к расхождениям */
    const s = (r.body.settings ?? r.body) as Record<string, unknown>;
    return {
      ok: true,
      data: {
        notifyEmail: String(s.notifyEmail ?? ""),
        tgChatId: String(s.tgChatId ?? ""),
        tgApiBase: String(s.tgApiBase ?? ""),
        tgWorkingBase: String(s.tgWorkingBase ?? ""),
        botTokenSet: s.botTokenSet === true,
        botTokenMasked: String(s.botTokenMasked ?? ""),
        smtpHost: String(s.smtpHost ?? ""),
        smtpPort: s.smtpPort === null || s.smtpPort === undefined ? null : Number(s.smtpPort),
        smtpUser: String(s.smtpUser ?? ""),
        smtpFrom: String(s.smtpFrom ?? ""),
        smtpSet: s.smtpSet === true,
        smtpPassMasked: String(s.smtpPassMasked ?? ""),
        // c99-C: аналитика — публичные значения (ID счётчиков), без масок
        metrikaId: String(s.metrikaId ?? ""),
        metrikaWebvisor: s.metrikaWebvisor !== false,
        metrikaClickmap: s.metrikaClickmap !== false,
        gaId: String(s.gaId ?? ""),
        customHeadHtml: String(s.customHeadHtml ?? ""),
        // c102: автоматизация — дефолты зеркалят _lib.php (сводка/дожим вкл,
        // пинг выкл, 3ч), cronState как есть (null = ещё не запускался)
        autoDigest: s.autoDigest !== false,
        autoFollowup: s.autoFollowup !== false,
        autoNudge: s.autoNudge === true,
        autoNudgeHours:
          typeof s.autoNudgeHours === "number" && Number.isFinite(s.autoNudgeHours)
            ? Math.min(24, Math.max(1, Math.round(s.autoNudgeHours)))
            : 3,
        cronEnabled: s.cronEnabled === true,
        cronState: (s.cronState as Record<string, unknown> | null | undefined) ?? null,
      },
    };
  }
  return { ok: false };
}

export type SettingsPatch = {
  notifyEmail?: string;
  tgChatId?: string;
  tgApiBase?: string;
  tgBotToken?: string;
  clearBotToken?: boolean;
  /** c97: SMTP-поля (пустой smtpPass не затирает сохранённый пароль). */
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  smtpPass?: string;
  clearSmtpPass?: boolean;
  smtpFrom?: string | null;
  /** c99-C: аналитика (пустой metrikaId/gaId = вернуться к env деплоя). */
  metrikaId?: string | null;
  metrikaWebvisor?: boolean;
  metrikaClickmap?: boolean;
  gaId?: string | null;
  customHeadHtml?: string | null;
  /** c102: автоматизация. cronEnabled/cronState — READ-ONLY (управляются
   *  только action=cron-token), в патче их не отправляем. */
  autoDigest?: boolean;
  autoFollowup?: boolean;
  autoNudge?: boolean;
  autoNudgeHours?: number;
  /** c102: отозвать cron-токен (планировщик выключается). */
  clearCronToken?: boolean;
};

export async function apiSaveSettings(
  patch: SettingsPatch,
  opts: Pick<AdminApiOptions, "base" | "headers"> = {},
): Promise<{ ok: boolean; error?: string }> {
  const r = await adminApi("settings", { method: "POST", body: patch, ...opts });
  if (r.status === 200 && r.body?.ok === true) return { ok: true };
  if (r.status === 400) {
    return { ok: false, error: String(r.body?.error ?? "validation") };
  }
  return { ok: false };
}

export interface TgTriedBase {
  base: string;
  errno: number;
  error: string;
  status: number;
}

export async function apiTgCheck(
  token?: string,
  opts: Pick<AdminApiOptions, "base" | "headers"> = {},
): Promise<
  | { ok: true; botName: string; botUsername: string; base?: string }
  | { ok: false; error: string; tried?: TgTriedBase[] }
> {
  const r = await adminApi("tg-check", {
    method: "POST",
    body: token ? { token } : {},
    ...opts,
  });
  if (r.body && r.body.ok === true) {
    return {
      ok: true,
      botName: String(r.body.botName ?? ""),
      botUsername: String(r.body.botUsername ?? ""),
      base: r.body.base ? String(r.body.base) : undefined,
    };
  }
  const tried = Array.isArray(r.body?.tried)
    ? (r.body.tried as TgTriedBase[])
    : undefined;
  return { ok: false, error: String(r.body?.error ?? "network"), tried };
}

export interface TgChat {
  id: string;
  name: string;
  type: string;
}

export async function apiTgDiscover(): Promise<
  { ok: true; chats: TgChat[]; hint?: string } | { ok: false; error: string }
> {
  const r = await adminApi("tg-discover", { method: "POST" });
  if (r.body && r.body.ok === true && Array.isArray(r.body.chats)) {
    return {
      ok: true,
      chats: r.body.chats as TgChat[],
      hint: r.body.hint ? String(r.body.hint) : undefined,
    };
  }
  return { ok: false, error: String(r.body?.error ?? "network") };
}

export async function apiTgTest(
  chatId?: string,
): Promise<{
  ok: boolean;
  error?: string;
  retryAfterSec?: number;
  base?: string;
  tried?: TgTriedBase[];
}> {
  const r = await adminApi("tg-test", {
    method: "POST",
    body: chatId ? { chatId } : {},
  });
  if (r.body && r.body.ok === true) {
    return {
      ok: true,
      base: r.body.base ? String(r.body.base) : undefined,
    };
  }
  const tried = Array.isArray(r.body?.tried)
    ? (r.body.tried as TgTriedBase[])
    : undefined;
  return {
    ok: false,
    error: String(r.body?.error ?? "network"),
    retryAfterSec: r.body?.retryAfterSec
      ? Number(r.body.retryAfterSec)
      : undefined,
    tried,
  };
}

/** c97: результат теста почты (тот же канал, что уведомления о заявках). */
export type MailTestResult = {
  ok: boolean;
  to: string;
  transport: string | null;
  error: string | null;
  detail: string | null;
};

export async function apiMailTest(
  to?: string,
): Promise<MailTestResult> {
  const r = await adminApi("mail-test", {
    method: "POST",
    body: to ? { to } : {},
  });
  if (r.status === 400) {
    return {
      ok: false,
      to: to ?? "",
      transport: null,
      error: "no_recipient",
      detail: String(r.body?.detail ?? ""),
    };
  }
  return {
    ok: r.body?.ok === true,
    to: String(r.body?.to ?? to ?? ""),
    transport: r.body?.transport ? String(r.body.transport) : null,
    error: r.body?.error ? String(r.body.error) : null,
    detail: r.body?.detail ? String(r.body.detail) : null,
  };
}

/** c97: запись журнала почты для UI диагностики. */
export interface MailLogEntry {
  ts: number | null;
  to: string;
  context: string;
  subject: string;
  transport: string;
  ok: boolean;
  error: string | null;
  /** c99: кол-во PDF-вложений в письме (0 = без вложения). */
  attach: number;
  /** c99: причина пропуска вложения (attachSkipped) или доп. пояснение. */
  detail: string | null;
}

export async function apiMailLog(
  limit = 10,
): Promise<{ ok: boolean; entries: MailLogEntry[] }> {
  const r = await adminApi("mail-log", {
    method: "GET",
    params: { limit: String(limit) },
  });
  if (r.status === 200 && r.body?.ok === true && Array.isArray(r.body.entries)) {
    return { ok: true, entries: r.body.entries as MailLogEntry[] };
  }
  return { ok: false, entries: [] };
}

/** c98-A: сабмит, пойманный анти-спам ловушкой (honeypot/elapsedMs). */
export interface SpamLogEntry {
  ts: number | null;
  /** 'honeypot' | 'elapsed' */
  reason: string;
  elapsedMs: number | null;
  name: string;
  phone: string;
  email: string | null;
  comment: string | null;
  source: string;
  clientId: string | null;
}

/** c98-A: журнал спам-ловушек — если туда попал реальный клиент, владелец
 *  видит его имя/телефон и может перезвонить (до c98 лид терялся без следа). */
export async function apiSpamLog(
  limit = 5,
): Promise<{ ok: boolean; entries: SpamLogEntry[] }> {
  const r = await adminApi("spam-log", {
    method: "GET",
    params: { limit: String(limit) },
  });
  if (r.status === 200 && r.body?.ok === true && Array.isArray(r.body.entries)) {
    return { ok: true, entries: r.body.entries as SpamLogEntry[] };
  }
  return { ok: false, entries: [] };
}

export type PasswordResult =
  | { ok: true }
  | {
      ok: false;
      reason: "bad_password" | "locked" | "validation" | "network";
      retryAfterSec?: number;
    };

export async function apiChangePassword(
  current: string,
  next: string,
  opts: Pick<AdminApiOptions, "base" | "headers"> = {},
): Promise<PasswordResult> {
  const r = await adminApi("password", {
    method: "POST",
    body: { current, new: next },
    ...opts,
  });
  if (r.status === 200 && r.body?.ok === true) return { ok: true };
  if (r.status === 401) return { ok: false, reason: "bad_password" };
  if (r.status === 429) {
    return {
      ok: false,
      reason: "locked",
      retryAfterSec: Number(r.body?.retryAfterSec ?? 3600),
    };
  }
  if (r.status === 400) return { ok: false, reason: "validation" };
  return { ok: false, reason: "network" };
}

/* --------------------------------------------------------------- mock layer */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let mockSavedAt = 0;
/** Меню, «закоммиченное» через save (мок-аналог GitHub contents). */
let mockSavedMenu: MenuData | null = null;

/* MOCK-ONLY (4-F2): debug-аффорданс состояния 'cancelled' для демо-режима.
 * Публикация, чьё сообщение коммита содержит «тест отмены», на ПЕРВОМ
 * опросе статуса отвечает 'building', на ВТОРОМ — 'cancelled' (вместо
 * success): так баннер отмены можно показать и проверить в демо.
 * Существует ТОЛЬКО здесь, в мок-слое — в проде 'cancelled' приходит из
 * admin.php, когда деплой вытеснен более новой публикацией. Никаких
 * скрытых триггеров — только явная строка в сообщении коммита. */
let mockCancelArmed = false;
let mockStatusPolls = 0;

/* c102 MOCK-ONLY: секретный cron-токен демо-режима. Живёт в памяти модуля
 * (как в проде — в secrets.json): после генерации «не показывается» нигде,
 * кроме одного ответа cron-token; состояние — только cronEnabled=true/false. */
let mockCronToken: string | null = null;
const mockRandomToken = () =>
  Array.from({ length: 32 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

async function mockApi(
  action: string,
  opts: AdminApiOptions,
): Promise<ApiResponse> {
  await sleep(180 + Math.random() * 260);
  const body = (opts.body ?? {}) as Record<string, unknown>;
  const mockSession = () => {
    try {
      return window.sessionStorage.getItem(MOCK_SESSION_KEY) === "1";
    } catch {
      return false;
    }
  };
  switch (action) {
    case "session":
      return mockSession()
        ? {
            status: 200,
            body: { ok: true, expiresAt: Date.now() + 12 * 3600_000 },
          }
        : { status: 401, body: { error: "unauthorized" } };
    case "login": {
      const pw = String(body.password ?? "");
      if (pw !== "admin") return { status: 401, body: { error: "bad_password" } };
      try {
        window.sessionStorage.setItem(MOCK_SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      return {
        status: 200,
        body: { ok: true, expiresAt: Date.now() + 12 * 3600_000 },
      };
    }
    case "logout":
      try {
        window.sessionStorage.removeItem(MOCK_SESSION_KEY);
      } catch {
        /* ignore */
      }
      return { status: 200, body: { ok: true } };
    case "data": {
      // после save мок отдаёт ОПУБЛИКОВАННУЮ версию (как GitHub в проде)
      const menu =
        mockSavedMenu ??
        (structuredClone((await import("@/data/menu.json")).default) as unknown as MenuData);
      return {
        status: 200,
        body: {
          ok: true,
          menu,
          sha: mockSavedAt ? "mock-" + mockSavedAt.toString(36) : "mock-sha-1",
          repo: "9xj89gzrtw-hue/newsite",
          path: "src/data/menu.json",
        },
      };
    }
    case "save": {
      // лёгкая проверка структуры — как настоящий сервер (400 validation)
      const menu = body.menu as MenuData | undefined;
      if (!menu || !Array.isArray(menu.menuTypes) || menu.menuTypes.length === 0) {
        return {
          status: 400,
          body: {
            error: "validation",
            errors: ["menuTypes: нужен хотя бы один формат меню"],
          },
        };
      }
      mockSavedAt = Date.now();
      mockSavedMenu = structuredClone(menu);
      /* MOCK-ONLY (4-F2): вооружение debug-аффорданса — см. объявление
       * mockCancelArmed выше (только «тест отмены» в сообщении коммита). */
      mockCancelArmed =
        typeof body.message === "string" && body.message.includes("тест отмены");
      mockStatusPolls = 0;
      return {
        status: 200,
        body: {
          ok: true,
          commitSha: "mock-" + mockSavedAt.toString(36),
          htmlUrl: "https://github.com/9xj89gzrtw-hue/newsite/actions",
        },
      };
    }
    case "status": {
      const sha = String(opts.params?.sha ?? "");
      if (!sha.startsWith("mock-") || !mockSavedAt) {
        return { status: 200, body: { ok: true, state: "unknown" } };
      }
      mockStatusPolls++;
      /* MOCK-ONLY (4-F2): ветка «тест отмены» — building → cancelled
       * (второй опрос вместо success), чтобы отработать баннер отмены. */
      if (mockCancelArmed) {
        if (mockStatusPolls === 1) {
          return {
            status: 200,
            body: {
              ok: true,
              state: "building",
              htmlUrl: "https://github.com/9xj89gzrtw-hue/newsite/actions",
              runStartedAt: new Date(mockSavedAt).toISOString(),
            },
          };
        }
        return {
          status: 200,
          body: {
            ok: true,
            state: "cancelled",
            htmlUrl: "https://github.com/9xj89gzrtw-hue/newsite/actions",
          },
        };
      }
      const elapsed = Date.now() - mockSavedAt;
      if (elapsed < 3000) {
        return {
          status: 200,
          body: {
            ok: true,
            state: "building",
            htmlUrl: "https://github.com/9xj89gzrtw-hue/newsite/actions",
            runStartedAt: new Date(mockSavedAt).toISOString(),
          },
        };
      }
      return {
        status: 200,
        body: {
          ok: true,
          state: "success",
          htmlUrl: "https://github.com/9xj89gzrtw-hue/newsite/actions",
          deployedAt: new Date(mockSavedAt + 3000).toISOString(),
        },
      };
    }
    case "leads":
      return {
        status: 200,
        body: {
          ok: true,
          total: mockLeads.length,
          leads: mockLeads.map((l) => ({ ...l })),
        },
      };
    case "lead-update": {
      const id = String(body.id ?? "");
      const lead = mockLeads.find((l) => l.id === id);
      if (!lead) return { status: 404, body: { error: "not_found" } };
      if (typeof body.read === "boolean") lead.read = body.read;
      if (typeof body.archived === "boolean") lead.archived = body.archived;
      /* c102: мини-CRM — статус воронки и заметка (как admin.php: валидный
       * статус строкой, note null/"" очищает, \r\n → \n). */
      if (typeof body.status === "string" &&
          ["new", "contacted", "agreed", "lost"].includes(body.status)) {
        lead.status = body.status;
      }
      if (body.note !== undefined) {
        if (body.note === null || body.note === "") lead.note = null;
        else if (typeof body.note === "string" && body.note.length <= 1000) {
          lead.note = body.note.replace(/\r\n?/g, "\n");
        } else {
          return { status: 400, body: { ok: false, error: "validation" } };
        }
      }
      return { status: 200, body: { ok: true } };
    }
    case "lead-delete": {
      const id = String(body.id ?? "");
      const idx = mockLeads.findIndex((l) => l.id === id);
      if (idx === -1) return { status: 404, body: { error: "not_found" } };
      mockLeads.splice(idx, 1);
      return { status: 200, body: { ok: true } };
    }
    case "leads-read-all": {
      let updated = 0;
      for (const l of mockLeads) {
        if (!l.read) {
          l.read = true;
          updated++;
        }
      }
      return { status: 200, body: { ok: true, updated } };
    }
    case "settings": {
      if (opts.method === "POST" || opts.body !== undefined) {
        const b = body;
        if (b.clearBotToken) {
          mockSettings.botTokenSet = false;
          mockSettings.botTokenMasked = "";
          mockSettings.tgChatId = "";
        }
        if (typeof b.tgBotToken === "string" && b.tgBotToken) {
          mockSettings.botTokenSet = true;
          mockSettings.botTokenMasked =
            b.tgBotToken.slice(0, 8) + "…" + b.tgBotToken.slice(-4);
        }
        if (typeof b.tgChatId === "string") mockSettings.tgChatId = b.tgChatId;
        if (typeof b.tgApiBase === "string") mockSettings.tgApiBase = b.tgApiBase;
        if (typeof b.notifyEmail === "string") {
          if (b.notifyEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.notifyEmail)) {
            return { status: 400, body: { error: "validation" } };
          }
          mockSettings.notifyEmail = b.notifyEmail;
        }
        /* c97: SMTP — как в проде (пустой пароль не затирает). */
        if (b.clearSmtpPass) {
          mockSettings.smtpPassMasked = "";
          mockSettings.smtpSet = false;
          mockSettings.smtpHost = "";
          mockSettings.smtpUser = "";
        }
        if (typeof b.smtpHost === "string" || b.smtpHost === null) {
          mockSettings.smtpHost = String(b.smtpHost ?? "");
        }
        if (typeof b.smtpUser === "string" || b.smtpUser === null) {
          mockSettings.smtpUser = String(b.smtpUser ?? "");
        }
        if (typeof b.smtpPort === "number" || b.smtpPort === null) {
          mockSettings.smtpPort = (b.smtpPort as number | null) ?? null;
        }
        if (typeof b.smtpPass === "string" && b.smtpPass) {
          mockSettings.smtpPassMasked = b.smtpPass.slice(0, 2) + "••••" + b.smtpPass.slice(-2);
        }
        mockSettings.smtpSet = Boolean(
          mockSettings.smtpHost && mockSettings.smtpUser && mockSettings.smtpPassMasked,
        );
        /* c99-C: аналитика — как в проде (мягкая нормализация: мусор → ""). */
        if (typeof b.metrikaId === "string" || b.metrikaId === null) {
          const digits = String(b.metrikaId ?? "").replace(/\D+/g, "");
          mockSettings.metrikaId =
            /^[0-9]{5,10}$/.test(digits) ? digits : "";
        }
        if (typeof b.metrikaWebvisor === "boolean") {
          mockSettings.metrikaWebvisor = b.metrikaWebvisor;
        }
        if (typeof b.metrikaClickmap === "boolean") {
          mockSettings.metrikaClickmap = b.metrikaClickmap;
        }
        if (typeof b.gaId === "string" || b.gaId === null) {
          const ga = String(b.gaId ?? "").trim();
          mockSettings.gaId = /^G-[A-Z0-9]{4,12}$/i.test(ga) ? ga.toUpperCase() : "";
        }
        if (typeof b.customHeadHtml === "string" || b.customHeadHtml === null) {
          const ch = String(b.customHeadHtml ?? "");
          /* c99-fix (критик E2-m7): паритет с продом — мок раньше молча
           * резал >8000 и пропускал </textarea (прод отдаёт 400) — демо-
           * режим врал о сохранении, которого не было бы на проде. */
          if (ch.toLowerCase().includes("</textarea")) {
            return {
              status: 400,
              body: { ok: false, error: "validation" },
            };
          }
          if (ch.length > 8000) {
            return {
              status: 400,
              body: { ok: false, error: "validation" },
            };
          }
          mockSettings.customHeadHtml = ch === "" ? "" : ch;
        }
        /* c102: автоматизация — === true → boolean (мок проверяет тип так же
         * строго, как admin.php — «истина» строкой не пройдёт). */
        if (b.autoDigest === true || b.autoDigest === false) {
          mockSettings.autoDigest = b.autoDigest;
        }
        if (b.autoFollowup === true || b.autoFollowup === false) {
          mockSettings.autoFollowup = b.autoFollowup;
        }
        if (b.autoNudge === true || b.autoNudge === false) {
          mockSettings.autoNudge = b.autoNudge;
        }
        if (typeof b.autoNudgeHours === "number" && b.autoNudgeHours >= 1 && b.autoNudgeHours <= 24) {
          mockSettings.autoNudgeHours = Math.round(b.autoNudgeHours);
        } else if (b.autoNudgeHours !== undefined) {
          return {
            status: 400,
            body: { ok: false, error: "validation" },
          };
        }
        /* c102: отзыв токена — планировщик выключается (clearCronToken
         * отправляется ТОЛЬКО намеренно, из карточки «Автоматизация»). */
        if (b.clearCronToken === true) {
          mockCronToken = null;
          mockSettings.cronEnabled = false;
        }
        return { status: 200, body: { ok: true } };
      }
      return { status: 200, body: { ok: true, settings: { ...mockSettings } } };
    }
    case "cron-token": {
      /* c102: как admin.php h_cron_token — {revoke:true} гасит токен
       * (null), иначе генерится новый 32-hex; старые ссылки перестают
       * работать. Токен в ответе — ЕДИНСТВЕННЫЙ раз. */
      if (body.revoke === true) {
        mockCronToken = null;
        mockSettings.cronEnabled = false;
        return { status: 200, body: { ok: true, token: null } };
      }
      mockCronToken = mockRandomToken();
      mockSettings.cronEnabled = true;
      return { status: 200, body: { ok: true, token: mockCronToken } };
    }
    case "tg-check": {
      const token = String(body.token ?? "");
      if (token.length < 20) {
        return { status: 200, body: { ok: false, error: "unauthorized" } };
      }
      return {
        status: 200,
        body: {
          ok: true,
          botName: "Nilov Catering Bot",
          botUsername: "nilov_catering_bot",
          base: mockSettings.tgApiBase || "https://api.telegram.org",
        },
      };
    }
    case "tg-discover":
      return {
        status: 200,
        body: {
          ok: true,
          chats: [
            { id: "123456789", name: "Дмитрий Нилов", type: "private" },
            { id: "-1009876543210", name: "Кейтеринг — рабочие вопросы", type: "group" },
          ],
        },
      };
    case "tg-test":
      return { status: 200, body: { ok: true } };
    case "mail-test":
      return {
        status: 200,
        body: {
          ok: true,
          to: String(body.to ?? mockSettings.notifyEmail),
          transport: mockSettings.smtpSet ? "smtp" : "mail",
          error: null,
          detail: null,
        },
      };
    case "mail-log":
      return {
        status: 200,
        body: {
          ok: true,
          entries: [
            {
              ts: Math.floor(Date.now() / 1000) - 600,
              to: mockSettings.notifyEmail,
              context: "lead-owner",
              subject: "Новая заявка с сайта — Анна Соколова",
              transport: mockSettings.smtpSet ? "smtp" : "mail",
              ok: true,
              error: null,
              attach: 0,
              detail: null,
            },
            {
              ts: Math.floor(Date.now() / 1000) - 3600,
              to: "anna.s@example.com",
              context: "lead-client",
              subject: "Ваша заявка в NILOV CATERING принята",
              transport: "mail",
              ok: false,
              error: "mail() вернула false (sendmail не принял письмо)",
              attach: 1,
              detail: null,
            },
          ],
        },
      };
    case "password": {
      const current = String(body.current ?? "");
      const next = String(body.new ?? "");
      if (!current) return { status: 401, body: { error: "bad_password" } };
      if (next.length < 8) return { status: 400, body: { error: "validation" } };
      return { status: 200, body: { ok: true } };
    }
    default:
      return { status: 404, body: { error: "unknown_action" } };
  }
}

const mockSettings: AdminSettings = {
  notifyEmail: "dmitry_nilov@mail.ru",
  tgChatId: "",
  tgApiBase: "",
  tgWorkingBase: "",
  botTokenSet: false,
  botTokenMasked: "",
  smtpHost: "",
  smtpPort: null,
  smtpUser: "",
  smtpFrom: "",
  smtpSet: false,
  smtpPassMasked: "",
  /* c99-C: аналитика — дефолты как на проде (env-счётчик, Вебвизор вкл). */
  metrikaId: "",
  metrikaWebvisor: true,
  metrikaClickmap: true,
  gaId: "",
  customHeadHtml: "",
  /* c102: автоматизация — дефолты зеркалят _lib.php (сводка/дожим вкл,
   * пинг выкл, 3ч); cronState «крутится» — демо показывает живой вид. */
  autoDigest: true,
  autoFollowup: true,
  autoNudge: false,
  autoNudgeHours: 3,
  cronEnabled: false,
  cronState: {
    lastRunTs: Math.floor(Date.now() / 1000) - 900,
    runs: 42,
  },
};

const now = Date.now();
/** ts как в проде — UNIX-секунды (lead.php: time()). */
const unix = (minutesAgo: number) => Math.floor((now - minutesAgo * 60_000) / 1000);

const mockLeads: Lead[] = [
  {
    id: "lead-1004",
    ts: unix(12),
    read: false,
    source: "calculator",
    name: "Анна Соколова",
    phone: "+7 (921) 845-12-30",
    email: "anna.s@example.com",
    comment:
      "Банкет по итогам года. Важно: у двоих гостей аллергия на орехи.",
    payload: {
      typeId: "banquet",
      guests: 50,
      pkgName: "Классический",
      total: 223_500,
      dateIso: "2026-12-06",
      preferredTime: "18:00",
    },
    notify: {
      ts: unix(12),
      tg: true,
      mail: true,
      client: true,
      mailTransport: "mail",
    },
  },
  {
    id: "lead-1003",
    ts: unix(95),
    read: true,
    status: "contacted",
    note: "Перезвонить после 18:00, просит смету на бар",
    source: "contact",
    name: "Игорь Ветров",
    phone: "+7 (911) 200-84-51",
    email: "",
    comment: "Свадьба в июле, площадка — Павловск. Пришлите смету на 80 гостей.",
    payload: {
      eventType: "Свадьба",
      guests: 80,
      preferredTime: "16:00",
    },
  },
  {
    id: "lead-1002",
    ts: unix(60 * 26),
    read: false,
    status: "agreed",
    source: "calculator",
    name: "Мария Кузнецова",
    phone: "+7 (999) 123-45-67",
    email: "m.kuznetsova@company.ru",
    comment: "",
    payload: {
      typeId: "snack-box",
      guests: 25,
      total: 30_000,
      undecided: true,
      addonIds: ["equipment"],
    },
  },
  {
    /* c102: демо воронки — зависшая заявка: авто-дожим уже ушёл клиенту
     * (followupTs), владельца пинговали (nudgedTs), статус так и не встал. */
    id: "lead-1001",
    ts: unix(60 * 50),
    read: true,
    source: "footer",
    name: "Ольга Руднева",
    phone: "8 (921) 555-04-88",
    email: "olga.r@example.com",
    comment: "Кофе-брейк на конференцию, нужно предложение до пятницы.",
    followupTs: unix(60 * 26),
    followupOk: true,
    nudgedTs: unix(60 * 23),
    payload: {
      typeId: "coffee-break",
      guests: 40,
    },
  },
];
