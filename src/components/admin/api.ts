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
}

export interface AdminSettings {
  notifyEmail: string;
  tgChatId: string;
  tgApiBase: string;
  botTokenSet: boolean;
  botTokenMasked: string;
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
  patch: { read?: boolean; archived?: boolean },
): Promise<boolean> {
  const r = await adminApi("lead-update", {
    method: "POST",
    body: { id, ...patch },
  });
  return r.status === 200 && r.body?.ok === true;
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
        botTokenSet: s.botTokenSet === true,
        botTokenMasked: String(s.botTokenMasked ?? ""),
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

export async function apiTgCheck(
  token?: string,
  opts: Pick<AdminApiOptions, "base" | "headers"> = {},
): Promise<
  { ok: true; botName: string; botUsername: string } | { ok: false; error: string }
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
    };
  }
  return { ok: false, error: String(r.body?.error ?? "network") };
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
): Promise<{ ok: boolean; error?: string; retryAfterSec?: number }> {
  const r = await adminApi("tg-test", {
    method: "POST",
    body: chatId ? { chatId } : {},
  });
  if (r.body && r.body.ok === true) return { ok: true };
  return {
    ok: false,
    error: String(r.body?.error ?? "network"),
    retryAfterSec: r.body?.retryAfterSec
      ? Number(r.body.retryAfterSec)
      : undefined,
  };
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
      return { status: 200, body: { ok: true } };
    }
    case "lead-delete": {
      const id = String(body.id ?? "");
      const idx = mockLeads.findIndex((l) => l.id === id);
      if (idx === -1) return { status: 404, body: { error: "not_found" } };
      mockLeads.splice(idx, 1);
      return { status: 200, body: { ok: true } };
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
        return { status: 200, body: { ok: true } };
      }
      return { status: 200, body: { ok: true, settings: { ...mockSettings } } };
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
  botTokenSet: false,
  botTokenMasked: "",
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
  },
  {
    id: "lead-1003",
    ts: unix(95),
    read: true,
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
];
