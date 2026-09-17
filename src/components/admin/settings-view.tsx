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
  apiSaveSettings,
  apiTgCheck,
  apiTgDiscover,
  apiTgTest,
  type AdminSettings,
  type TgChat,
  type TgTriedBase,
} from "./api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  FieldLabel,
  HintText,
  SectionHeader,
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
      <PasswordCard />
    </section>
  );
}

/* ------------------------------------------------------------------ email */

function EmailCard({
  settings,
  onSettingsChange,
}: {
  settings: AdminSettings;
  onSettingsChange: (s: AdminSettings) => void;
}) {
  const [email, setEmail] = useState(settings.notifyEmail);
  const [saving, setSaving] = useState(false);

  useEffect(() => setEmail(settings.notifyEmail), [settings.notifyEmail]);

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
          На этот адрес приходят письма о каждой новой заявке с сайта.
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
      </CardContent>
    </Card>
  );
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
