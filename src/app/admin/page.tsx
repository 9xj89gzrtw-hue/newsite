"use client";

/**
 * c95 (Task 1-b) — страница админ-панели (final: out/admin.html).
 *
 * Машина состояний: loading → login → app.
 *  - mount: GET session (401 → экран входа);
 *  - login: POST пароль (401 «Неверный пароль», 429 «подождите N сек»);
 *  - 401 от любого действия в приложении → CustomEvent 'nilov-admin-unauth'
 *    (api.ts) → возврат на экран входа + тост «Сессия истекла».
 *
 * Нейтрализация глобальных слоёв сайта (прелоадер, кастомный курсор, зерно,
 * вертикальный лейбл, полоса прогресса, cookie-баннер) — инлайн-скрипт
 * ставит html[data-admin-page] ДО гидрации + CSS `body:has(.admin-root)`
 * как без-JS страховка. globals.css НЕ трогаем (публичный сайт не затронут).
 *
 * ?mock=1 → localStorage 'nilov-admin-mock' — api.ts отвечает
 * реалистичными фейковыми данными (сквозной e2e без PHP на dev-сервере).
 *
 * c96 (ФИКС СКРОЛЛА): раньше здесь поллился __lenis.stop() — stop() в
 *  lenis блокирует скролл наглухо (preventDefault wheel + overflow:hidden
 *  через класс lenis-stopped), из-за чего владелец не мог прокрутить панель
 *  вниз. Теперь Lenis вообще не создаётся на /admin (см. lenis-provider.tsx,
 *  isAdmin-гард), а ниже — CSS-страховка: даже если lenis-классы каким-то
 *  образом остались на <html>, скролл админки всё равно живой.
 */
import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { AdminApp } from "@/components/admin/admin-app";
import { apiLogin, apiSession, enableMockMode, isMockMode } from "@/components/admin/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/** Скрыть слои сайта, вредные панели; вернуть системный курсор. */
const ADMIN_NEUTRALIZE_CSS = `
html[data-admin-page] [data-preloader-root],
body:has(.admin-root) [data-preloader-root],
html[data-admin-page] .vertical-brand-label,
body:has(.admin-root) .vertical-brand-label,
html[data-admin-page] .scroll-progress,
body:has(.admin-root) .scroll-progress,
html[data-admin-page] [data-component="ea-cookie-banner"],
body:has(.admin-root) [data-component="ea-cookie-banner"],
html[data-admin-page] body > div[class*="z-[9999]"],
body:has(.admin-root) > div[class*="z-[9999]"],
html[data-admin-page] body > div[class*="z-[100]"],
body:has(.admin-root) > div[class*="z-[100]"] { display: none !important; }
@media (pointer: fine) {
  html[data-admin-page] body.catering-cursor,
  html[data-admin-page] body.catering-cursor *,
  body:has(.admin-root).catering-cursor,
  body:has(.admin-root).catering-cursor * { cursor: revert !important; }
  html[data-admin-page] body.catering-cursor a,
  html[data-admin-page] body.catering-cursor button,
  html[data-admin-page] body.catering-cursor [role="button"],
  html[data-admin-page] body.catering-cursor label,
  html[data-admin-page] body.catering-cursor select,
  body:has(.admin-root).catering-cursor a,
  body:has(.admin-root).catering-cursor button,
  body:has(.admin-root).catering-cursor [role="button"],
  body:has(.admin-root).catering-cursor label,
  body:has(.admin-root).catering-cursor select { cursor: pointer !important; }
  html[data-admin-page] body.catering-cursor input,
  html[data-admin-page] body.catering-cursor textarea,
  body:has(.admin-root).catering-cursor input,
  body:has(.admin-root).catering-cursor textarea { cursor: text !important; }
}
.admin-root { cursor: revert; }
.admin-root a { cursor: pointer; }
.admin-root button, .admin-root [role="button"], .admin-root label { cursor: pointer; }
.admin-root input, .admin-root textarea { cursor: text; }
/* c96: страховка скролла — классы остановленного Lenis не должны гасить
   прокрутку админки, даже если залетели на <html> до гидрации. */
html[data-admin-page].lenis-stopped,
html[data-admin-page].lenis-locked,
html[data-admin-page].lenis,
html.lenis-stopped:has(body .admin-root) { overflow: auto !important; }
`;

type Phase = "loading" | "login" | "app";

export default function AdminPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [mock, setMock] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.adminPage = "1";
    if (new URLSearchParams(window.location.search).get("mock") === "1") {
      enableMockMode();
    }
    setMock(isMockMode());
    let cancelled = false;
    void apiSession().then((r) => {
      if (!cancelled) setPhase(r.ok ? "app" : "login");
    });
    const onUnauth = () => setPhase("login");
    window.addEventListener("nilov-admin-unauth", onUnauth);
    /* c96: Lenis здесь больше не останавливаем (stop() глушил скролл
     *  наглухо) — провайдер просто не создаёт его на /admin. Если на
     *  странице почему-то остался живой инстанс (устаревший кэш бандла),
     *  разрушаем целиком: destroy() снимает listeners и lenis-классы. */
    const w = window as unknown as { __lenis?: { destroy: () => void } };
    if (w.__lenis) {
      try {
        w.__lenis.destroy();
      } catch {
        /* ignore */
      }
      delete w.__lenis;
    }
    return () => {
      cancelled = true;
      window.removeEventListener("nilov-admin-unauth", onUnauth);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ADMIN_NEUTRALIZE_CSS }} />
      {/* Синхронный инлайн-скрипт: флаг на <html> до гидрации — глобальные
          слои (прелоадер и др.) гаснут CSS'ом с первого кадра. */}
      <script
        dangerouslySetInnerHTML={{
          __html: 'document.documentElement.dataset.adminPage="1"',
        }}
      />
      <div
        id="main-content"
        className="admin-root min-h-svh bg-background text-foreground antialiased"
      >
        {phase === "loading" ? <BootScreen /> : null}
        {phase === "login" ? (
          <LoginScreen mock={mock} onLogin={() => setPhase("app")} />
        ) : null}
        {phase === "app" ? (
          <AdminApp mock={mock} onLoggedOut={() => setPhase("login")} />
        ) : null}
      </div>
    </>
  );
}

/* --------------------------------------------------------------- boot/login */

function BootScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background">
      <p className="font-serif text-2xl font-medium text-ink">
        nilov catering<span className="text-gold">.</span>
      </p>
      <Loader2 className="size-6 animate-spin text-gold" aria-label="Загрузка" />
      <span className="sr-only">Загрузка панели…</span>
    </div>
  );
}

function LoginScreen({ mock, onLogin }: { mock: boolean; onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError("");
    const r = await apiLogin(password);
    setBusy(false);
    if (r.ok === true) {
      toast.success("Добро пожаловать!");
      onLogin();
      return;
    }
    if (r.reason === "bad_password") setError("Неверный пароль");
    else if (r.reason === "locked")
      setError(
        `Слишком много попыток, подождите ${r.retryAfterSec ?? 60} сек`,
      );
    else setError("Нет связи с сервером — проверьте интернет");
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-serif text-[34px] leading-none font-medium text-ink">
            nilov catering<span className="text-gold">.</span>
          </p>
          <p className="mt-2 text-[11px] tracking-[0.22em] text-ink-soft/70 uppercase">
            панель управления
          </p>
        </div>

        <Card className="rounded-2xl border-border-line/80 shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={submit} noValidate>
              <div className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-ink-soft">
                <Lock className="size-3.5 text-gold" /> Пароль администратора
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                autoFocus
                aria-invalid={Boolean(error)}
                aria-label="Пароль администратора"
                className="h-12 rounded-xl text-[16px]"
              />
              {error ? (
                <p role="alert" className="mt-2 text-[13px] text-destructive">
                  {error}
                </p>
              ) : null}
              <Button
                type="submit"
                className="mt-4 h-12 w-full rounded-xl bg-gradient-to-r from-gold to-terracotta text-[15px] font-semibold text-white shadow-md shadow-gold/25 hover:opacity-95"
                disabled={busy || !password}
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                Войти
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-5 text-center text-[13px] leading-relaxed text-ink-soft/80">
          {mock
            ? "Демо-режим: пароль admin, данные не изменяются."
            : "Панель для изменения меню, цен и чтения заявок."}
        </p>
      </div>
    </div>
  );
}
