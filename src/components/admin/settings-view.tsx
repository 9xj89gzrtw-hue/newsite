/**
 * c95 (Task 1-b) — раздел «Настройки»: email для уведомлений, мастер
 * Telegram (токен → чат → тест), продвинутый tgApiBase, смена пароля.
 *
 * c96: Telegram-мастер научился переживать блокировку api.telegram.org
 * с РФ-хостингов (март 2026): сетевая ошибка теперь объясняет причину и
 * ведёт владельца к решению — собственное зеркало на Cloudflare Worker
 * (инструкция + код прямо в интерфейсе, кнопка «Скопировать код»),
 * поле для URL зеркала с повторной проверкой токена, отображение
 * активной базы (tgWorkingBase, запоминается сервером).
 */
"use client";

import { useEffect, useState } from "react";
import {
  AtSign,
  BarChart3,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  LifeBuoy,
  Loader2,
  Lock,
  MessageCircle,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  apiChangePassword,
  apiMailLog,
  apiMailTest,
  apiSaveSettings,
  apiTgCheck,
  apiTgDiscover,
  apiTgTest,
  type AdminSettings,
  type MailLogEntry,
  type MailTestResult,
  type TgChat,
  type TgTriedBase,
} from "./api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { METRICA_ID } from "@/lib/analytics";
import {
  FieldLabel,
  HintText,
  SectionHeader,
  TextAreaField,
  TextField,
} from "./ui-bits";

export function SettingsView({
  settings,
  onSettingsChange,
}: {
  settings: AdminSettings;
  onSettingsChange: (s: AdminSettings) => void;
}) {
  return (
    <section className="space-y-6">
      <SectionHeader
        title="Настройки"
        description="Куда приходят уведомления о заявках и безопасность панели."
      />
      <EmailCard settings={settings} onSettingsChange={onSettingsChange} />
      <TelegramCard settings={settings} onSettingsChange={onSettingsChange} />
      <AnalyticsCard settings={settings} onSettingsChange={onSettingsChange} />
      <PasswordCard />
    </section>
  );
}

/* ------------------------------------------------------------------ email */

const TRANSPORT_LABELS: Record<string, string> = {
  smtp: "SMTP",
  mail: "почта хостинга",
  "mail-fallback": "почта хостинга (SMTP не сработал)",
  none: "не отправлено",
};

function transportLabel(t: string | null | undefined): string {
  return (t && TRANSPORT_LABELS[t]) || t || "—";
}

function EmailCard({
  settings,
  onSettingsChange,
}: {
  settings: AdminSettings;
  onSettingsChange: (s: AdminSettings) => void;
}) {
  const [email, setEmail] = useState(settings.notifyEmail);
  const [saving, setSaving] = useState(false);

  /* c97: тест письма + журнал отправок */
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<MailTestResult | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [logEntries, setLogEntries] = useState<MailLogEntry[]>([]);

  /* c97: SMTP-блок */
  const [smtpOpen, setSmtpOpen] = useState(false);
  const [smtpHost, setSmtpHost] = useState(settings.smtpHost);
  const [smtpPort, setSmtpPort] = useState(settings.smtpPort === null ? "" : String(settings.smtpPort));
  const [smtpUser, setSmtpUser] = useState(settings.smtpUser);
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpSaving, setSmtpSaving] = useState(false);

  useEffect(() => setEmail(settings.notifyEmail), [settings.notifyEmail]);
  useEffect(() => setSmtpHost(settings.smtpHost), [settings.smtpHost]);
  useEffect(() => setSmtpUser(settings.smtpUser), [settings.smtpUser]);
  useEffect(
    () => setSmtpPort(settings.smtpPort === null ? "" : String(settings.smtpPort)),
    [settings.smtpPort],
  );

  const save = async () => {
    setSaving(true);
    const r = await apiSaveSettings({ notifyEmail: email.trim() });
    setSaving(false);
    if (r.ok === true) {
      onSettingsChange({ ...settings, notifyEmail: email.trim() });
      toast.success("Email для уведомлений сохранён");
    } else {
      toast.error(
        r.error === "validation"
          ? "Похоже, это не email — проверьте адрес"
          : "Не удалось сохранить — попробуйте ещё раз",
      );
    }
  };

  const sendTest = async () => {
    setTesting(true);
    setTestResult(null);
    const r = await apiMailTest(testTo.trim() || undefined);
    setTesting(false);
    setTestResult(r);
    if (r.ok) {
      toast.success(`Тестовое письмо отправлено на ${r.to}`);
    }
    if (logOpen) void loadLog();
  };

  const loadLog = async () => {
    setLogLoading(true);
    const r = await apiMailLog(10);
    setLogLoading(false);
    setLogEntries(r.entries);
  };

  const toggleLog = () => {
    const next = !logOpen;
    setLogOpen(next);
    if (next && logEntries.length === 0) void loadLog();
  };

  const saveSmtp = async () => {
    const host = smtpHost.trim();
    const user = smtpUser.trim();
    const port = smtpPort.trim() === "" ? null : Number(smtpPort.trim());
    if (host === "" && user === "" && smtpPass === "") {
      // полное отключение SMTP
      setSmtpSaving(true);
      const r = await apiSaveSettings({ smtpHost: null, smtpUser: null, smtpPass: "", clearSmtpPass: true });
      setSmtpSaving(false);
      if (r.ok === true) {
        onSettingsChange({ ...settings, smtpHost: "", smtpUser: "", smtpSet: false, smtpPassMasked: "" });
        toast.success("SMTP отключён — письма идут через почту хостинга");
      } else {
        toast.error("Не удалось сохранить — попробуйте ещё раз");
      }
      return;
    }
    if (host !== "" && !user) {
      toast.error("Укажите email ящика (логин SMTP)");
      return;
    }
    if (user && !host) {
      toast.error("Укажите сервер SMTP (для SpaceWeb — smtp.spaceweb.ru)");
      return;
    }
    if (port !== null && (!Number.isInteger(port) || port < 1 || port > 65535)) {
      toast.error("Порт — число от 1 до 65535 (обычно 465)");
      return;
    }
    setSmtpSaving(true);
    const r = await apiSaveSettings({
      smtpHost: host === "" ? null : host,
      smtpUser: user === "" ? null : user,
      smtpPort: port,
      ...(smtpPass.trim() !== "" ? { smtpPass: smtpPass } : {}),
    });
    setSmtpSaving(false);
    if (r.ok === true) {
      const patch: Partial<AdminSettings> = { smtpHost: host, smtpUser: user, smtpPort: port };
      if (smtpPass.trim() !== "") {
        patch.smtpPassMasked =
          smtpPass.trim().slice(0, 2) + "••••" + smtpPass.trim().slice(-2);
      }
      if (host && user && (smtpPass.trim() !== "" || settings.smtpPassMasked)) {
        patch.smtpSet = true;
      }
      onSettingsChange({ ...settings, ...patch } as AdminSettings);
      setSmtpPass("");
      toast.success("SMTP-настройки сохранены — отправьте тестовое письмо");
    } else {
      toast.error(
        r.error === "validation" ? "Проверьте поля — похоже, в них опечатка" : "Не удалось сохранить — попробуйте ещё раз",
      );
    }
  };

  return (
    <Card className="rounded-2xl border-border-line/80 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-center gap-2.5">
          <AtSign className="size-5 text-gold" />
          <h3 className="font-serif text-[19px] font-medium text-ink">
            Email для уведомлений
          </h3>
        </div>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
          На этот адрес приходят письма о каждой новой заявке с сайта. Клиенту,
          оставившему свой email, автоматически отправляется подтверждение
          с копией расчёта.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <TextField
              value={email}
              onChange={setEmail}
              placeholder="zakaz@nilovcatering.ru"
              inputMode="email"
              type="email"
              autoComplete="email"
            />
          </div>
          <Button
            type="button"
            className="h-11 rounded-xl px-6 text-[14px]"
            disabled={saving || email.trim() === settings.notifyEmail}
            onClick={save}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Сохранить
          </Button>
        </div>

        {/* c97: тест почты */}
        <div className="mt-4 rounded-xl border border-border-line/70 bg-parchment/30 p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink/10 text-ink">
              <Send className="size-3.5" />
            </span>
            <h4 className="text-[14px] font-semibold text-ink">Проверка почты</h4>
          </div>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
            Отправим тестовое письмо тем же каналом, что и уведомления о
            заявках. Оставьте поле пустым — отправим на email уведомлений.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <TextField
                value={testTo}
                onChange={setTestTo}
                placeholder={settings.notifyEmail || "кому отправить тест"}
                inputMode="email"
                type="email"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl text-[14px]"
              disabled={testing}
              onClick={sendTest}
            >
              {testing ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Отправить тест
            </Button>
          </div>
          {testResult ? (
            <div
              className={cn(
                "mt-3 rounded-lg p-3 text-[13px] leading-relaxed",
                testResult.ok
                  ? "bg-gold/10 text-ink"
                  : "bg-destructive/10 text-ink",
              )}
            >
              {testResult.ok ? (
                <>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Check className="size-4 text-gold" />
                    Письмо передано сервером ({transportLabel(testResult.transport)}) на {testResult.to}.
                  </span>{" "}
                  Проверьте ящик — если письма нет, загляните в папку «Спам»
                  и отметьте его «не спам»; если и там нет — настройте SMTP ниже.
                </>
              ) : (
                <>
                  <span className="font-medium">Отправка не удалась.</span>{" "}
                  {testResult.detail || errorText(testResult.error)}
                </>
              )}
            </div>
          ) : null}
        </div>

        {/* c97: журнал отправок */}
        <div className="mt-4 border-t border-border-line/60 pt-2">
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-between gap-2 py-1 text-left text-[13.5px] font-medium text-ink-soft"
            aria-expanded={logOpen}
            onClick={toggleLog}
          >
            Последние отправки писем
            <ChevronDown
              className={cn("size-4 shrink-0 transition-transform", logOpen && "rotate-180")}
            />
          </button>
          {logOpen ? (
            <div className="pb-2">
              {logLoading ? (
                <p className="flex items-center gap-2 py-2 text-[13px] text-ink-soft">
                  <Loader2 className="size-4 animate-spin" /> Загружаем журнал…
                </p>
              ) : logEntries.length === 0 ? (
                <p className="py-2 text-[12.5px] text-ink-soft/80">
                  Пока ничего не отправлялось — отправьте тестовое письмо.
                </p>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full border-separate border-spacing-0 text-[12.5px]">
                    <tbody>
                      {logEntries.map((e, i) => (
                        <tr key={i} className="align-top">
                          <td className="whitespace-nowrap py-1.5 pr-3 text-ink-soft/70">
                            {e.ts ? formatMailDate(e.ts) : "—"}
                          </td>
                          <td className="py-1.5 pr-3 text-ink">
                            {e.subject}
                            <span className="block text-[11.5px] text-ink-soft/70">
                              {e.to} · {contextLabel(e.context)}
                              {e.attach > 0 ? ` · вложение: ${e.attach}` : ""}
                            </span>
                            {e.detail ? (
                              <span className="mt-0.5 block max-w-72 text-[11.5px] leading-snug text-ink-soft/70">
                                {e.detail}
                              </span>
                            ) : null}
                          </td>
                          <td className="whitespace-nowrap py-1.5 text-right">
                            {e.ok ? (
                              <span className="inline-flex items-center gap-1 font-medium text-ink">
                                <Check className="size-3.5 text-gold" /> ок
                              </span>
                            ) : (
                              <span className="font-medium text-destructive">
                                сбой
                                {e.error ? (
                                  <span className="block max-w-48 font-normal text-[11.5px] leading-snug text-destructive/80">
                                    {e.error}
                                  </span>
                                ) : null}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-2 text-[12px] text-ink-soft/70">
                «ок» = сервер принял письмо к доставке. Если письмо не пришло,
                проверьте папку «Спам» или настройте SMTP ниже.
              </p>
            </div>
          ) : null}
        </div>

        {/* c97: SMTP */}
        <div className="mt-2 border-t border-border-line/60 pt-2">
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-between gap-2 py-1 text-left text-[13.5px] font-medium text-ink-soft"
            aria-expanded={smtpOpen}
            onClick={() => setSmtpOpen((v) => !v)}
          >
            Надёжная доставка: SMTP-ящик сайта {settings.smtpSet ? "· включён" : ""}
            <ChevronDown
              className={cn("size-4 shrink-0 transition-transform", smtpOpen && "rotate-180")}
            />
          </button>
          {smtpOpen ? (
            <div className="pb-2">
              {settings.smtpSet ? (
                <p className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-gold/10 px-2.5 py-1.5 text-[12.5px] font-medium text-ink">
                  <ShieldCheck className="size-4 text-gold" />
                  Письма подписаны вашим ящиком {settings.smtpUser || settings.smtpHost} —
                  надёжная доставка, не спам
                </p>
              ) : (
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft/80">
                  Без SMTP письма отправляет сам хостинг — Gmail и Mail.ru
                  иногда кладут их в спам. Настроив SMTP-ящик, вы получаете
                  подписанные письма, которые доходят надёжно (5 минут
                  один раз).
                </p>
              )}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="smtp-host">Сервер SMTP</FieldLabel>
                  <TextField
                    id="smtp-host"
                    value={smtpHost}
                    onChange={setSmtpHost}
                    placeholder="smtp.spaceweb.ru"
                    inputMode="url"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="smtp-port" hint="обычно 465">Порт</FieldLabel>
                  <TextField
                    id="smtp-port"
                    value={smtpPort}
                    onChange={setSmtpPort}
                    placeholder="465"
                    inputMode="decimal"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="smtp-user">Ящик (логин)</FieldLabel>
                  <TextField
                    id="smtp-user"
                    value={smtpUser}
                    onChange={setSmtpUser}
                    placeholder="noreply@nilovcatering.ru"
                    inputMode="email"
                    type="email"
                  />
                </div>
                <div>
                  <FieldLabel
                    htmlFor="smtp-pass"
                    hint={settings.smtpPassMasked ? `сохранён ${settings.smtpPassMasked}` : undefined}
                  >
                    Пароль
                  </FieldLabel>
                  <TextField
                    id="smtp-pass"
                    value={smtpPass}
                    onChange={setSmtpPass}
                    placeholder={settings.smtpPassMasked ? "оставьте пустым, чтобы не менять" : "пароль ящика"}
                    type="password"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  className="h-11 rounded-xl px-6 text-[14px]"
                  disabled={smtpSaving}
                  onClick={saveSmtp}
                >
                  {smtpSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                  Сохранить SMTP
                </Button>
                <p className="text-[12.5px] leading-relaxed text-ink-soft/80">
                  Как создать ящик: панель SpaceWeb → «Почта» → «Ящики» →
                  «Создать» (например, <code>noreply@nilovcatering.ru</code>)
                  → пароль из панели вставьте сюда. Отправитель писем станет
                  этим ящиком — письма подписаны DKIM и не попадают в спам.
                </p>
              </div>

              {/* c98-A: письма на Gmail/Яндекс — пароль приложения */}
              <div className="mt-4 rounded-xl border border-border-line/70 bg-parchment/30 p-4">
                <h4 className="text-[13.5px] font-semibold text-ink">
                  Хотите отправлять с Gmail или Яндекс-почты?
                </h4>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft/90">
                  Обычный пароль не подойдёт — нужен «пароль приложения»
                  (специальный для программ). Настраивается один раз:
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border-line/70 bg-background p-3">
                    <p className="text-[12.5px] font-semibold text-ink">Gmail</p>
                    <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-[12px] leading-relaxed text-ink-soft">
                      <li>Аккаунт Google → Безопасность → включите 2-шаговую проверку.</li>
                      <li>Там же → «Пароли приложений» → создайте (для «Почта»).</li>
                      <li>Сюда: сервер <code>smtp.gmail.com</code>, порт <code>465</code>,
                        ящик — ваш Gmail, пароль — 16 символов из пароля приложения.</li>
                    </ol>
                  </div>
                  <div className="rounded-lg border border-border-line/70 bg-background p-3">
                    <p className="text-[12.5px] font-semibold text-ink">Яндекс</p>
                    <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-[12px] leading-relaxed text-ink-soft">
                      <li>Яндекс ID → Безопасность → включите «Пароли приложений».</li>
                      <li>Создайте пароль приложения (для «почты»).</li>
                      <li>Сюда: сервер <code>smtp.yandex.ru</code>, порт <code>465</code>,
                        ящик — ваш Яндекс-логин, пароль приложения. Отправитель
                        (From) должен совпадать с логином.</li>
                    </ol>
                  </div>
                </div>
                <p className="mt-2.5 text-[12px] leading-relaxed text-ink-soft/80">
                  Текущий канал (через хостинг) уже работает — если письмо
                  «не пришло», проверьте папку «Спам». SMTP добавит к письмам
                  DKIM-подпись выбранного провайдера.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

/** c97: короткие подписи ошибок теста почты. */
function errorText(error: string | null): string {
  switch (error) {
    case "no_recipient":
      return "Укажите адрес получателя или заполните «Email для уведомлений» выше.";
    case "mail_disabled":
      return "Хостинг запретил отправку писем — настройте SMTP ниже, это решит проблему.";
    case "mail_failed":
      return "Хостинг не принял письмо (sendmail). Настройка SMTP ниже обычно решает это.";
    case "rate":
      return "Слишком много тестов — подождите немного и попробуйте снова.";
    default:
      return "Сервер не смог отправить письмо. Настройка SMTP ниже обычно решает это.";
  }
}

/** c97: подпись контекста в журнале почты. */
function contextLabel(ctx: string): string {
  switch (ctx) {
    case "lead-owner":
      return "уведомление вам";
    case "lead-client":
      return "подтверждение клиенту";
    case "test":
      return "тест";
    default:
      return ctx;
  }
}

/** c97: дата для журнала почты (UNIX-секунды → ru-RU). */
function formatMailDate(ts: number): string {
  const d = new Date(ts > 1e12 ? ts : ts * 1000);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* --------------------------------------------------------------- telegram */

const CHAT_TYPE_LABELS: Record<string, string> = {
  private: "личный чат",
  group: "группа",
  supergroup: "группа",
  channel: "канал",
};

/** Код зеркала для Cloudflare Worker (research/c96/tg-api-worker.js). */
const WORKER_CODE = `// tg-api-proxy — зеркало Telegram Bot API для вашего сайта.
// Вставьте этот код целиком в Cloudflare Worker (см. шаги ниже).

const BOT_PREFIX = ''; // можно вписать начало своего токена: '/bot123456789:AA'

const BOT_API_PATH  = /^\\/bot[^/]+\\/[A-Za-z0-9_]+$/;
const BOT_FILE_PATH = /^\\/file\\/bot[^/]+\\/.+$/;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Проверка живости: откройте корень воркера в браузере
    if (url.pathname === '/') {
      return Response.json({ ok: true, result: 'tg-api-proxy is running' });
    }

    const isBotPath = BOT_API_PATH.test(url.pathname) || BOT_FILE_PATH.test(url.pathname);
    const prefixOk = !BOT_PREFIX
      || url.pathname.startsWith(BOT_PREFIX)
      || url.pathname.startsWith('/file' + BOT_PREFIX);
    if (!isBotPath || !prefixOk) {
      return Response.json({ ok: false, error_code: 404, description: 'Not Found' }, { status: 404 });
    }

    // Пересылаем запрос на api.telegram.org как есть
    url.hostname = 'api.telegram.org';
    url.protocol = 'https:';
    url.port = '';

    try {
      const resp = await fetch(new Request(url.toString(), request));
      return new Response(resp.body, {
        status: resp.status,
        statusText: resp.statusText,
        headers: resp.headers,
      });
    } catch (e) {
      return Response.json(
        { ok: false, error_code: 502, description: 'Failed to connect to Telegram API: ' + (e && e.message) },
        { status: 502 },
      );
    }
  },
};
`;

function describeTried(tried: TgTriedBase[] | undefined): string {
  if (!tried || tried.length === 0) return "";
  return tried
    .map((t) => `${t.base} — ${t.error || "нет ответа"} (код ${t.status})`)
    .join("; ");
}

function TelegramCard({
  settings,
  onSettingsChange,
}: {
  settings: AdminSettings;
  onSettingsChange: (s: AdminSettings) => void;
}) {
  const [token, setToken] = useState("");
  const [tokenBusy, setTokenBusy] = useState(false);
  const [botInfo, setBotInfo] = useState<{ name: string; username: string } | null>(null);
  const [tokenError, setTokenError] = useState("");
  /** c96: сетевой сбой — показываем блок «что делать» с инструкцией. */
  const [networkFail, setNetworkFail] = useState(false);
  const [triedInfo, setTriedInfo] = useState("");

  const [discovering, setDiscovering] = useState(false);
  const [chats, setChats] = useState<TgChat[] | null>(null);
  const [chatHint, setChatHint] = useState("");
  const [selectedChat, setSelectedChat] = useState(settings.tgChatId);

  const [testing, setTesting] = useState(false);
  const [testDone, setTestDone] = useState(false);

  const [apiBase, setApiBase] = useState(settings.tgApiBase);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [apiBaseBusy, setApiBaseBusy] = useState(false);

  /** c96: поле «вставьте адрес зеркала» в блоке сетевой ошибки. */
  const [mirrorUrl, setMirrorUrl] = useState(settings.tgApiBase);
  const [mirrorBusy, setMirrorBusy] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setSelectedChat(settings.tgChatId), [settings.tgChatId]);
  useEffect(() => setApiBase(settings.tgApiBase), [settings.tgApiBase]);

  /* шаг 1 — токен */
  const runCheck = async (tokenValue: string) => {
    setTokenBusy(true);
    setTokenError("");
    setBotInfo(null);
    setNetworkFail(false);
    setTriedInfo("");
    const r = await apiTgCheck(tokenValue.trim());
    setTokenBusy(false);
    if (r.ok !== true) {
      if (r.error === "unauthorized") {
        setTokenError(
          "Telegram не принял токен — проверьте, что скопировали его целиком.",
        );
        return;
      }
      /* c96-CRIT-A: нет токена вообще (ввели пусто и в настройках пусто) —
       * не выдаём «сетевой сбой», а просим ввести токен. */
      if (r.error === "no_token") {
        setTokenError("Сначала вставьте токен бота — он от BotFather.");
        return;
      }
      /* network (или иная транспортная ошибка всех баз) — объясняем. */
      setNetworkFail(true);
      setTriedInfo(describeTried(r.tried));
      return;
    }
    setBotInfo({ name: r.botName, username: r.botUsername });
    if (r.base && r.base !== "https://api.telegram.org") {
      toast.success(`Подключено через зеркало ${r.base}`);
    }
    // токен проверен → сразу сохраняем, чтобы шаг «Найти чат» работал
    const save = await apiSaveSettings({ tgBotToken: tokenValue.trim() });
    if (save.ok) {
      onSettingsChange({
        ...settings,
        botTokenSet: true,
        botTokenMasked:
          tokenValue.trim().slice(0, 8) + "…" + tokenValue.trim().slice(-4),
      });
      toast.success("Токен сохранён — бот подключён");
    } else {
      toast.error("Токен проверен, но не сохранился — попробуйте ещё раз");
    }
  };

  const checkToken = () => void runCheck(token);

  /** c96: сохранить адрес зеркала и сразу перепроверить токен. */
  const saveMirrorAndRecheck = async () => {
    const url = mirrorUrl.trim().replace(/\/+$/, "");
    if (url !== "" && !url.startsWith("https://")) {
      toast.error("Адрес должен начинаться с https://");
      return;
    }
    setMirrorBusy(true);
    const r = await apiSaveSettings({ tgApiBase: url });
    if (!r.ok) {
      setMirrorBusy(false);
      toast.error("Не удалось сохранить адрес — попробуйте ещё раз");
      return;
    }
    onSettingsChange({ ...settings, tgApiBase: url });
    setApiBase(url);
    toast.success("Адрес зеркала сохранён — проверяем связь…");
    const tokenValue = token.trim() || undefined;
    setMirrorBusy(false);
    await runCheck(tokenValue ?? "");
  };

  /* шаг 2 — чат */
  const discover = async () => {
    setDiscovering(true);
    setChats(null);
    setChatHint("");
    const r = await apiTgDiscover();
    setDiscovering(false);
    if (r.ok !== true) {
      toast.error(
        r.error === "network"
          ? "Хостинг по-прежнему не может связаться с Telegram — настройте зеркало в шаге 1"
          : "Не удалось получить список чатов — попробуйте ещё раз",
      );
      return;
    }
    setChats(r.chats);
    if (r.chats.length === 0) {
      setChatHint(
        r.hint ??
          "Бот ещё не получал сообщений. Напишите ему любое сообщение (например, «Привет») и нажмите «Найти чат» ещё раз.",
      );
    }
  };

  const selectChat = async (chat: TgChat) => {
    setSelectedChat(chat.id);
    const r = await apiSaveSettings({ tgChatId: chat.id });
    if (r.ok === true) {
      onSettingsChange({ ...settings, tgChatId: chat.id });
      toast.success(`Чат выбран: ${chat.name}`);
    } else {
      toast.error("Не удалось сохранить чат — попробуйте ещё раз");
    }
  };

  /* шаг 3 — тест */
  const sendTest = async () => {
    setTesting(true);
    setTestDone(false);
    const r = await apiTgTest(settings.tgChatId || selectedChat || undefined);
    setTesting(false);
    if (r.ok === true) {
      setTestDone(true);
      toast.success("Тестовое сообщение отправлено — проверьте Telegram");
    } else {
      toast.error(
        r.retryAfterSec
          ? `Слишком часто — подождите ${r.retryAfterSec} c и повторите`
          : r.error === "unauthorized"
            ? "Токен не принят — проверьте его в шаге 1"
            : r.error === "network"
              ? "Хостинг не смог отправить — настройте зеркало в шаге 1"
              : "Не удалось отправить — проверьте токен и чат",
      );
    }
  };

  const clearToken = async () => {
    const r = await apiSaveSettings({ clearBotToken: true });
    if (r.ok === true) {
      onSettingsChange({
        ...settings,
        botTokenSet: false,
        botTokenMasked: "",
        tgChatId: "",
      });
      setToken("");
      setBotInfo(null);
      setChats(null);
      setTestDone(false);
      toast.success("Telegram-бот отключён");
    }
  };

  const saveApiBase = async () => {
    setApiBaseBusy(true);
    const r = await apiSaveSettings({ tgApiBase: apiBase.trim() });
    setApiBaseBusy(false);
    if (r.ok === true) {
      onSettingsChange({ ...settings, tgApiBase: apiBase.trim() });
      toast.success("Адрес API-сервера сохранён");
    } else {
      toast.error("Не удалось сохранить — попробуйте ещё раз");
    }
  };

  const copyWorkerCode = async () => {
    try {
      await navigator.clipboard.writeText(WORKER_CODE);
      setCopied(true);
      toast.success("Код скопирован — вставьте его в редактор воркера");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Не удалось скопировать — выделите код вручную");
    }
  };

  return (
    <Card className="rounded-2xl border-border-line/80 shadow-none">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="size-5 text-gold" />
            <h3 className="font-serif text-[19px] font-medium text-ink">
              Уведомления в Telegram
            </h3>
          </div>
          {settings.botTokenSet ? (
            <Badge className="rounded-full bg-gold/15 text-[11.5px] text-ink">
              бот подключён{settings.botTokenMasked ? ` (${settings.botTokenMasked})` : ""}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="rounded-full border-border-line text-[11.5px] text-ink-soft"
            >
              не настроено
            </Badge>
          )}
        </div>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
          Заявки будут приходить сообщением от вашего бота — быстрее и надёжнее
          почты. Настройка занимает пару минут, шаг за шагом.
        </p>

        {/* шаг 1 */}
        <Step n={1} title="Создайте бота и подключите токен" done={settings.botTokenSet}>
          <ol className="list-decimal space-y-1 pl-5 text-[13.5px] leading-relaxed text-ink-soft">
            <li>
              Откройте в Telegram{" "}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-gold underline decoration-gold/40 underline-offset-2"
              >
                @BotFather
              </a>
            </li>
            <li>Отправьте команду /newbot, следуйте подсказкам</li>
            <li>Скопируйте токен — выглядит как 123456789:ABCdef…</li>
          </ol>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <TextField
                value={token}
                onChange={setToken}
                placeholder="123456789:ABCdef…"
                type="password"
                autoComplete="off"
              />
            </div>
            <Button
              type="button"
              className="h-11 rounded-xl px-5 text-[14px]"
              disabled={tokenBusy || (token.trim().length === 0 && !settings.botTokenSet)}
              onClick={checkToken}
            >
              {tokenBusy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Проверить токен"
              )}
            </Button>
          </div>
          {botInfo ? (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-gold/10 px-2.5 py-1.5 text-[13px] font-medium text-ink">
              <Check className="size-4 text-gold" /> {botInfo.name} (@
              {botInfo.username})
            </p>
          ) : null}
          {tokenError ? (
            <p className="mt-2 text-[13px] text-destructive">{tokenError}</p>
          ) : null}

          {/* c96: сетевой сбой — объяснение + путь к решению */}
          {networkFail ? (
            <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-[14px] leading-relaxed font-medium text-ink">
                Хостинг не смог связаться с Telegram
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                Это не проблема вашего интернета или токена: с марта 2026
                api.telegram.org блокируется для серверов в России, а сайт
                размещён на российском хостинге. Лечится своим «зеркалом» —
                бесплатно, за 5–10 минут, без сервера и карты.
              </p>
              {triedInfo ? (
                <p className="mt-2 rounded-lg bg-background/70 p-2 font-mono text-[11px] leading-relaxed break-words text-ink-soft/80">
                  Попытки: {triedInfo}
                </p>
              ) : null}
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <div className="flex-1">
                  <TextField
                    value={mirrorUrl}
                    onChange={setMirrorUrl}
                    placeholder="https://nilov-tg.ваш-поддомен.workers.dev"
                    inputMode="url"
                  />
                </div>
                <Button
                  type="button"
                  className="h-11 rounded-xl px-5 text-[14px]"
                  disabled={mirrorBusy}
                  onClick={saveMirrorAndRecheck}
                >
                  {mirrorBusy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-4" />
                  )}
                  Сохранить и проверить
                </Button>
              </div>
              <button
                type="button"
                className="mt-3 flex min-h-11 w-full items-center gap-2 text-left text-[13.5px] font-medium text-gold"
                aria-expanded={guideOpen}
                onClick={() => setGuideOpen((v) => !v)}
              >
                <LifeBuoy className="size-4 shrink-0" />
                Пошаговая инструкция: развернуть зеркало
                <ChevronDown
                  className={cn(
                    "ml-auto size-4 shrink-0 transition-transform",
                    guideOpen && "rotate-180",
                  )}
                />
              </button>
              {guideOpen ? (
                <div className="mt-2 space-y-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                  <ol className="list-decimal space-y-1.5 pl-5">
                    <li>
                      Зайдите на{" "}
                      <a
                        href="https://dash.cloudflare.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-gold underline decoration-gold/40 underline-offset-2"
                      >
                        dash.cloudflare.com <ExternalLink className="size-3" />
                      </a>{" "}
                      и зарегистрируйтесь (email и пароль; бесплатно)
                    </li>
                    <li>
                      В меню слева — <strong>Workers &amp; Pages</strong> →{" "}
                      <strong>Create</strong> → <strong>Create Worker</strong>
                    </li>
                    <li>
                      Дайте имя, например <code>nilov-tg</code> → нажмите{" "}
                      <strong>Deploy</strong>
                    </li>
                    <li>
                      Нажмите <strong>Edit code</strong>, удалите содержимое
                      редактора и вставьте код ниже (кнопка «Скопировать код»)
                      → снова <strong>Deploy</strong>
                    </li>
                    <li>
                      Скопируйте адрес воркера вида{" "}
                      <code>https://nilov-tg.ваm.subdomain.workers.dev</code> —
                      откройте его в браузере: должно быть{" "}
                      <code>{`{"ok":true…}`}</code>
                    </li>
                    <li>
                      Вставьте адрес в поле выше и нажмите «Сохранить и
                      проверить» — проверка токена пойдёт через зеркало
                    </li>
                  </ol>
                  <div className="rounded-xl border border-border-line/70 bg-background">
                    <div className="flex items-center justify-between gap-2 border-b border-border-line/70 px-3 py-2">
                      <span className="font-mono text-[11.5px] text-ink-soft">
                        worker.js
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-lg px-3 text-[12px]"
                        onClick={copyWorkerCode}
                      >
                        {copied ? (
                          <>
                            <Check className="size-3.5" /> Скопировано
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" /> Скопировать код
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="max-h-64 overflow-auto p-3 font-mono text-[11px] leading-relaxed text-ink-soft">
                      {WORKER_CODE}
                    </pre>
                  </div>
                  <p className="text-[12.5px] text-ink-soft/80">
                    Воркер — это крошечная бесплатная программа Cloudflare:
                    сайт отправляет ему запрос, а он пересылает его в Telegram
                    и возвращает ответ. Токен видите только вы. 100 000
                    запросов в сутки бесплатно — для заявок хватит на
                    десятилетия. Если Cloudflare недоступен, тот же код можно
                    развернуть на Deno Deploy — сообщите разработчику.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </Step>

        {/* шаг 2 */}
        <Step
          n={2}
          title="Выберите чат для уведомлений"
          done={Boolean(settings.tgChatId)}
          disabled={!settings.botTokenSet}
        >
          <p className="text-[13.5px] leading-relaxed text-ink-soft">
            Напишите вашему боту любое сообщение (например, «Привет») — так он
            узнает чат — затем нажмите кнопку.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 h-11 rounded-xl text-[14px]"
            disabled={discovering || !settings.botTokenSet}
            onClick={discover}
          >
            {discovering ? <Loader2 className="size-4 animate-spin" /> : null}
            Найти чат
          </Button>
          {chatHint ? (
            <p className="mt-2 rounded-lg bg-accent/70 p-2.5 text-[13px] leading-relaxed text-ink-soft">
              {chatHint}
            </p>
          ) : null}
          {chats && chats.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => selectChat(chat)}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2 text-left transition-colors",
                    selectedChat === chat.id
                      ? "border-gold bg-gold/10"
                      : "border-border-line bg-background hover:border-gold/50",
                  )}
                >
                  <span className="text-[14px] font-medium text-ink">
                    {chat.name}
                  </span>
                  <span className="text-[12px] text-ink-soft">
                    {CHAT_TYPE_LABELS[chat.type] ?? chat.type}
                    {selectedChat === chat.id ? " · выбран" : ""}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
          {settings.tgChatId ? (
            <p className="mt-2 text-[12.5px] text-ink-soft/80">
              Текущий чат: id {settings.tgChatId}
            </p>
          ) : null}
        </Step>

        {/* шаг 3 */}
        <Step
          n={3}
          title="Проверьте доставку"
          done={testDone}
          disabled={!settings.tgChatId}
        >
          <p className="text-[13.5px] leading-relaxed text-ink-soft">
            Отправим тестовое сообщение в выбранный чат — убедитесь, что оно
            пришло в ваш Telegram.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 h-11 rounded-xl text-[14px]"
            disabled={testing || !settings.tgChatId}
            onClick={sendTest}
          >
            {testing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Отправить тест
          </Button>
          {testDone ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink">
              <Check className="size-4 text-gold" /> Сообщение доставлено
            </p>
          ) : null}
        </Step>

        {settings.botTokenSet ? (
          <div className="mt-4 border-t border-border-line/60 pt-3">
            <Button
              type="button"
              variant="ghost"
              className="h-11 rounded-xl text-[13px] text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={clearToken}
            >
              <Trash2 className="size-4" /> Отключить бота
            </Button>
          </div>
        ) : null}

        {/* дополнительно */}
        <div className="mt-4 border-t border-border-line/60 pt-2">
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-between gap-2 py-1 text-left text-[13.5px] font-medium text-ink-soft"
            aria-expanded={advancedOpen}
            onClick={() => setAdvancedOpen((v) => !v)}
          >
            Дополнительно: свой API-сервер Telegram (если основной недоступен)
            <ChevronDown
              className={cn(
                "size-4 shrink-0 transition-transform",
                advancedOpen && "rotate-180",
              )}
            />
          </button>
          {advancedOpen ? (
            <div className="pb-2">
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft/80">
                Основной api.telegram.org иногда недоступен с хостинга — укажите
                адрес своего зеркала (Cloudflare Worker, см. шаг 1). Пустое
                поле = только основной сервер.
              </p>
              {settings.tgWorkingBase ? (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-gold/10 px-2.5 py-1.5 text-[12.5px] font-medium text-ink">
                  <ShieldCheck className="size-4 text-gold" />
                  Сейчас уведомления уходят через: {settings.tgWorkingBase}
                </p>
              ) : null}
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <div className="flex-1">
                  <TextField
                    value={apiBase}
                    onChange={setApiBase}
                    placeholder="https://api.telegram.org"
                    inputMode="url"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl text-[14px]"
                  disabled={apiBaseBusy || apiBase.trim() === settings.tgApiBase}
                  onClick={saveApiBase}
                >
                  {apiBaseBusy ? <Loader2 className="size-4 animate-spin" /> : null}
                  Сохранить
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function Step({
  n,
  title,
  done,
  disabled,
  children,
}: {
  n: number;
  title: string;
  done?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mt-4 rounded-xl border border-border-line/70 bg-parchment/30 p-4",
        disabled && "opacity-50",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold",
            done ? "bg-gold text-white" : "bg-ink/10 text-ink",
          )}
        >
          {done ? <Check className="size-3.5" /> : n}
        </span>
        <h4 className="text-[14px] font-semibold text-ink">{title}</h4>
      </div>
      <fieldset disabled={disabled} className="min-w-0">
        {children}
      </fieldset>
    </div>
  );
}

/* ------------------------------------------------------------- analytics */

/**
 * c99-C — карточка «Аналитика»: счётчики и пиксели меняет владелец сам,
 * без передеплоя. Сайт читает значения РАНТАЙМ через /api/vars.php
 * (кеш 5 мин) после cookie-consent — 152-ФЗ соблюдён: до согласия
 * ноль сторонних запросов. Все значения публичны (ID счётчиков и так
 * видны в исходнике страницы) — секретов нет, отдаются без масок.
 */
function AnalyticsCard({
  settings,
  onSettingsChange,
}: {
  settings: AdminSettings;
  onSettingsChange: (s: AdminSettings) => void;
}) {
  const [metrikaId, setMetrikaId] = useState(settings.metrikaId);
  const [webvisor, setWebvisor] = useState(settings.metrikaWebvisor);
  const [clickmap, setClickmap] = useState(settings.metrikaClickmap);
  const [gaId, setGaId] = useState(settings.gaId);
  const [customHead, setCustomHead] = useState(settings.customHeadHtml);
  const [saving, setSaving] = useState(false);

  useEffect(() => setMetrikaId(settings.metrikaId), [settings.metrikaId]);
  useEffect(() => setWebvisor(settings.metrikaWebvisor), [settings.metrikaWebvisor]);
  useEffect(() => setClickmap(settings.metrikaClickmap), [settings.metrikaClickmap]);
  useEffect(() => setGaId(settings.gaId), [settings.gaId]);
  useEffect(() => setCustomHead(settings.customHeadHtml), [settings.customHeadHtml]);

  // локальная нормализация = серверная (admin.php): UI никогда не
  // показывает как «сохранённое» то, что сервер обратит в null
  // c99-fix (критик E2-m6): «мусор с цифрами» (abc / 12) — красная рамка,
  // а не молчаливая серая кнопка (раньше metrikaOk был true при пустых
  // digits — владельец не понимал, почему сохранить нельзя)
  const metrikaRaw = metrikaId.trim();
  const metrikaDigits = metrikaId.replace(/\D+/g, "");
  const metrikaOk = metrikaRaw === "" || /^[0-9]{5,10}$/.test(metrikaDigits);
  const gaTrim = gaId.trim();
  const gaOk = gaTrim === "" || /^G-[A-Z0-9]{4,12}$/i.test(gaTrim);

  const dirty =
    metrikaDigits !== settings.metrikaId ||
    webvisor !== settings.metrikaWebvisor ||
    clickmap !== settings.metrikaClickmap ||
    gaTrim.toUpperCase() !== settings.gaId ||
    customHead !== settings.customHeadHtml;

  const save = async () => {
    // пре-валидация на клиенте: сервер аналитику нормализует молча (мусор
    // → null, ответ 200) — без этой проверки владелец считал бы «настроено»,
    // а на деле счётчик выключен
    if (!metrikaOk) {
      toast.error("Номер счётчика — 5–10 цифр (например 112532826)");
      return;
    }
    if (!gaOk) {
      toast.error("Google Analytics ID выглядит не так — формат G-XXXXXXXXXX");
      return;
    }
    if (customHead.length > 8000) {
      toast.error("Дополнительный код — до 8000 символов");
      return;
    }
    setSaving(true);
    const r = await apiSaveSettings({
      metrikaId: metrikaDigits === "" ? null : metrikaDigits,
      metrikaWebvisor: webvisor,
      metrikaClickmap: clickmap,
      gaId: gaTrim === "" ? null : gaTrim.toUpperCase(),
      customHeadHtml: customHead === "" ? null : customHead,
    });
    setSaving(false);
    if (r.ok === true) {
      const gaSaved = gaTrim === "" ? "" : gaTrim.toUpperCase();
      onSettingsChange({
        ...settings,
        metrikaId: metrikaDigits,
        metrikaWebvisor: webvisor,
        metrikaClickmap: clickmap,
        gaId: gaSaved,
        customHeadHtml: customHead,
      });
      toast.success(
        "Аналитика сохранена — сайт подхватит новые настройки в течение 5 минут",
      );
    } else {
      toast.error(
        r.error === "validation"
          ? "Проверьте поля — например, код без «</textarea» и до 8000 символов"
          : "Не удалось сохранить — попробуйте ещё раз",
      );
    }
  };

  const envHint =
    METRICA_ID === ""
      ? "сейчас ID из деплоя не задан — без своего номера счётчик не работает"
      : `сейчас используется ID из деплоя: ${METRICA_ID}`;

  return (
    <Card className="rounded-2xl border-border-line/80 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="size-5 text-gold" />
          <h3 className="font-serif text-[19px] font-medium text-ink">
            Аналитика
          </h3>
        </div>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
          Счётчики посещаемости и рекламные пиксели. Сайт применяет их сам,
          без пересборки — изменения подхватываются в течение 5 минут,
          только после согласия посетителя на cookies (152-ФЗ).
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="an-metrika" hint="цифры">
              Счётчик Яндекс.Метрики (ID)
            </FieldLabel>
            <TextField
              id="an-metrika"
              value={metrikaId}
              onChange={setMetrikaId}
              placeholder="например 112532826"
              inputMode="numeric"
              className={cn(!metrikaOk && "border-destructive")}
            />
            <HintText>Оставьте пустым — {envHint}.</HintText>
          </div>
          <div>
            <FieldLabel htmlFor="an-ga" hint="вид G-XXXXXXXXXX">
              Google Analytics 4 (ID)
            </FieldLabel>
            <TextField
              id="an-ga"
              value={gaId}
              onChange={setGaId}
              placeholder="G-ABCD12345"
              className={cn(!gaOk && "border-destructive")}
            />
            <HintText>
              Пусто — Google Analytics не подключается. Создаётся в GA4:
              «Администратор → Потоки данных».
            </HintText>
          </div>
        </div>

        <div className="mt-2 grid gap-1 sm:grid-cols-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 py-1">
            <Checkbox
              checked={webvisor}
              onCheckedChange={(v) => setWebvisor(v === true)}
              aria-label="Вебвизор (запись сессий)"
            />
            <span className="text-[14px] leading-snug text-ink">
              Вебвизор — запись сессий посетителей
            </span>
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 py-1">
            <Checkbox
              checked={clickmap}
              onCheckedChange={(v) => setClickmap(v === true)}
              aria-label="Клик-карта"
            />
            <span className="text-[14px] leading-snug text-ink">
              Клик-карта — карта кликов по страницам
            </span>
          </label>
        </div>

        <div className="mt-4">
          <FieldLabel htmlFor="an-custom" hint="до 8000 символов">
            Дополнительный код (пиксели, Roistat, Top100…)
          </FieldLabel>
          <TextAreaField
            id="an-custom"
            value={customHead}
            onChange={setCustomHead}
            placeholder="<script>… код пикселя из рекламного кабинета …</script>"
            rows={5}
            className="font-mono text-[13px]"
          />
          <HintText>
            Вставьте код целиком — он добавляется в &lt;head&gt; сайта и
            запускается после согласия посетителя на cookies. Яндекс.Метрика
            и GA4 настраиваются выше, сюда — всё остальное.
          </HintText>
        </div>

        <Button
          type="button"
          className="mt-3 h-11 rounded-xl px-6 text-[14px]"
          disabled={saving || !dirty}
          onClick={save}
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          Сохранить
        </Button>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------------------------------------- password */

function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (next.length < 8) {
      setError("Новый пароль — минимум 8 символов");
      return;
    }
    if (next !== confirm) {
      setError("Пароли не совпадают — проверьте ещё раз");
      return;
    }
    setBusy(true);
    const r = await apiChangePassword(current, next);
    setBusy(false);
    if (r.ok === true) {
      toast.success("Пароль изменён");
      setCurrent("");
      setNext("");
      setConfirm("");
      return;
    }
    if (r.reason === "bad_password") setError("Текущий пароль неверен");
    else if (r.reason === "validation") setError("Новый пароль — минимум 8 символов");
    else if (r.reason === "locked")
      setError(`Слишком много попыток — подождите ${Math.ceil((r.retryAfterSec ?? 3600) / 60)} мин`);
    else setError("Не удалось изменить пароль — попробуйте ещё раз");
  };

  return (
    <Card className="rounded-2xl border-border-line/80 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-center gap-2.5">
          <Lock className="size-5 text-gold" />
          <h3 className="font-serif text-[19px] font-medium text-ink">
            Смена пароля
          </h3>
        </div>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
          Пароль от панели. Минимум 8 символов.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <FieldLabel htmlFor="pw-current">Текущий пароль</FieldLabel>
            <Input
              id="pw-current"
              type="password"
              value={current}
              autoComplete="current-password"
              onChange={(e) => setCurrent(e.target.value)}
              className="h-11 rounded-xl text-[15px]"
            />
          </div>
          <div>
            <FieldLabel htmlFor="pw-new">Новый пароль</FieldLabel>
            <Input
              id="pw-new"
              type="password"
              value={next}
              autoComplete="new-password"
              onChange={(e) => setNext(e.target.value)}
              className="h-11 rounded-xl text-[15px]"
            />
          </div>
          <div>
            <FieldLabel htmlFor="pw-confirm">Ещё раз</FieldLabel>
            <Input
              id="pw-confirm"
              type="password"
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => setConfirm(e.target.value)}
              className="h-11 rounded-xl text-[15px]"
            />
          </div>
        </div>
        {error ? (
          <p className="mt-2 text-[13px] text-destructive">{error}</p>
        ) : null}
        <Button
          type="button"
          className="mt-3 h-11 rounded-xl px-6 text-[14px]"
          disabled={busy || !current || !next || !confirm}
          onClick={submit}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          Изменить пароль
        </Button>
      </CardContent>
    </Card>
  );
}
