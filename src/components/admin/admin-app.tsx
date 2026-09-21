/**
 * c95 (Task 1-b) — основная оболочка админки (фаза «app»):
 * состояние MenuData + черновик + публикация (save → poll статуса сборки),
 * навигация (сайдбар на десктопе / нижний таб-бар + «Ещё» на мобиле),
 * sticky-бар «Опубликовать изменения», баннер статуса публикации,
 * обработка 409-конфликта и ошибок валидации со скроллом к полю.
 */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  ExternalLink,
  Inbox,
  Info,
  LayoutGrid,
  Loader2,
  LogOut,
  MoreHorizontal,
  Settings as SettingsIcon,
  Sparkles,
  UploadCloud,
  UtensilsCrossed,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { validateMenuData, type MenuData } from "@/lib/menu-schema";
import { formatRUB } from "@/lib/pricing";
import {
  apiGetData,
  apiGetLeads,
  apiGetSettings,
  apiLeadDelete,
  apiLeadUpdate,
  apiLeadsReadAll,
  apiLogout,
  apiSaveMenu,
  apiStatus,
  disableMockMode,
  DRAFT_KEY,
  isVercelMirror,
  type AdminSettings,
  type Lead,
} from "./api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { MenuEditor, plural } from "./menu-editor";
import {
  AddonsEditor,
  MinOrderEditor,
  ServicePanelsEditor,
} from "./simple-editors";
import { LeadsView } from "./leads-view";
import { SettingsView } from "./settings-view";

export type SectionId =
  | "menu"
  | "addons"
  | "minorder"
  | "panels"
  | "leads"
  | "settings";

const NAV: { id: SectionId; label: string; shortLabel: string; icon: typeof Inbox }[] = [
  { id: "menu", label: "Меню и цены", shortLabel: "Меню", icon: UtensilsCrossed },
  { id: "addons", label: "Допуслуги", shortLabel: "Допуслуги", icon: Sparkles },
  { id: "minorder", label: "Минимальные заказы", shortLabel: "Мин. заказ", icon: Banknote },
  { id: "panels", label: "Цены на плитках услуг", shortLabel: "Плитки", icon: LayoutGrid },
  { id: "leads", label: "Заявки", shortLabel: "Заявки", icon: Inbox },
  { id: "settings", label: "Настройки", shortLabel: "Настройки", icon: SettingsIcon },
];

const MOBILE_PRIMARY: SectionId[] = ["menu", "addons", "leads", "settings"];

type PubState =
  | { phase: "idle" }
  | { phase: "saving" }
  | {
      phase: "building";
      commitSha: string;
      htmlUrl?: string;
      startedAt: number;
    }
  | { phase: "success"; htmlUrl?: string }
  | { phase: "failure"; htmlUrl?: string }
  /* 4-F2: публикация вытеснена более новой (конкурирующий publish отменил
   * идущий деплой) — терминальное состояние для этого sha. */
  | { phase: "cancelled"; htmlUrl?: string }
  | { phase: "unknown" };

interface Draft {
  menu: MenuData;
  savedAt: number;
}

function readDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { menu?: MenuData; savedAt?: number };
    if (!parsed || typeof parsed !== "object" || !parsed.menu) return null;
    return { menu: parsed.menu, savedAt: Number(parsed.savedAt ?? 0) };
  } catch {
    return null;
  }
}

/* ==================================================================== app */

export function AdminApp({
  mock,
  onLoggedOut,
}: {
  mock: boolean;
  onLoggedOut: () => void;
}) {
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [menu, setMenu] = useState<MenuData | null>(null);
  /** Снимок меню с сервера — dirty = текущий объект отличен по ссылке. */
  const [serverMenu, setServerMenu] = useState<MenuData | null>(null);
  const [sha, setSha] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [section, setSection] = useState<SectionId>("menu");
  const [refreshingLeads, setRefreshingLeads] = useState(false);
  /** c96: массовая отметка «прочитано». */
  const [readingAll, setReadingAll] = useState(false);
  /** c96: подтверждение публикации со сводкой изменений. */
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [draftOffer, setDraftOffer] = useState<Draft | null>(null);
  const [pub, setPub] = useState<PubState>({ phase: "idle" });
  const [validErrors, setValidErrors] = useState<string[] | null>(null);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  /* Dirty — сравнение по СОДЕРЖИМОМУ (не по ссылке): правка, возвращённая
   * вручную к серверному значению, честно гасит «несохранённые изменения».
   * Мемоизация — stringify только при смене объекта (~1мс на ~50КБ меню). */
  const menuJson = useMemo(() => (menu ? JSON.stringify(menu) : ""), [menu]);
  const serverJson = useMemo(
    () => (serverMenu ? JSON.stringify(serverMenu) : ""),
    [serverMenu],
  );
  const dirty = loadState === "ready" && menuJson !== "" && menuJson !== serverJson;

  const update = useCallback((fn: (m: MenuData) => MenuData) => {
    setMenu((prev) => (prev ? fn(prev) : prev));
  }, []);

  /* ------------------------------------------------------------ загрузка */

  const loadApp = useCallback(async () => {
    setLoadState("loading");
    const [dataR, leadsR, settingsR] = await Promise.all([
      apiGetData(),
      apiGetLeads(),
      apiGetSettings(),
    ]);
    if (dataR.ok !== true) {
      setLoadState("error");
      toast.error(
        dataR.reason === "github"
          ? "GitHub недоступен — попробуйте обновить через минуту"
          : "Не удалось загрузить данные — попробуйте ещё раз",
      );
      return;
    }
    setMenu(dataR.data.menu);
    setServerMenu(dataR.data.menu);
    setSha(dataR.data.sha);
    if (leadsR.ok === true) {
      setLeads(leadsR.data.leads);
      setLeadsTotal(leadsR.data.total);
    }
    if (settingsR.ok === true) setSettings(settingsR.data);
    setLoadState("ready");

    const draft = readDraft();
    if (draft && JSON.stringify(draft.menu) !== JSON.stringify(dataR.data.menu)) {
      setDraftOffer(draft);
    } else if (draft) {
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    /* 4-F2: на зеркале Vercel панель не грузится вообще (карточка-заглушка
     * ниже) — ни одного API-вызова. */
    if (isVercelMirror()) return;
    void loadApp();
  }, [loadApp]);

  /* ------------------------------------------------- автосохранение черновика */

  useEffect(() => {
    if (loadState !== "ready" || !menu) return;
    const t = setTimeout(() => {
      try {
        if (dirty) {
          window.localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({ menu, savedAt: Date.now() }),
          );
        } else if (!draftOffer) {
          window.localStorage.removeItem(DRAFT_KEY);
        }
      } catch {
        /* приватный режим — молча */
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [menu, dirty, loadState, draftOffer]);

  /* c96: гарда закрытия вкладки с несохранёнными правками — как в почте:
   * браузер спросит подтверждение, черновик при этом уже автосохранён. */
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  /* ---------------------------------------------------------- заявки 60с */

  useEffect(() => {
    if (isVercelMirror()) return; /* 4-F2: зеркало — без API-вызовов */
    const i = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      const r = await apiGetLeads();
      if (r.ok === true) {
        setLeads(r.data.leads);
        setLeadsTotal(r.data.total);
      }
    }, 60_000);
    return () => clearInterval(i);
  }, []);

  const refreshLeads = async () => {
    setRefreshingLeads(true);
    const r = await apiGetLeads();
    setRefreshingLeads(false);
    if (r.ok === true) {
      setLeads(r.data.leads);
      setLeadsTotal(r.data.total);
      toast.success("Заявки обновлены");
    }
  };

  /* c102: мини-CRM — патч лида расширен статусом воронки, заметкой и
   * архивом; оптимистично + откат при сбое (как было c96 для read). */
  const patchLead = async (
    id: string,
    patch: { read?: boolean; archived?: boolean; status?: string; note?: string | null },
  ) => {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    const ok = await apiLeadUpdate(id, patch);
    if (!ok) {
      setLeads(prev);
      toast.error("Не удалось сохранить — попробуйте ещё раз");
    }
  };

  const deleteLead = async (id: string) => {
    const ok = await apiLeadDelete(id);
    if (ok) {
      setLeads((ls) => ls.filter((l) => l.id !== id));
      setLeadsTotal((t) => Math.max(0, t - 1));
      toast.success("Заявка удалена");
    } else {
      toast.error("Не удалось удалить — попробуйте ещё раз");
    }
  };

  /** c96: «Прочитать все» — один запрос, затем обновление списка. */
  const readAllLeads = async () => {
    setReadingAll(true);
    const r = await apiLeadsReadAll();
    setReadingAll(false);
    if (r.ok === true) {
      setLeads((ls) => ls.map((l) => ({ ...l, read: true })));
      toast.success(
        r.updated ? `Отмечено прочитанными: ${r.updated}` : "Непрочитанных не было",
      );
    } else {
      toast.error("Не удалось — попробуйте ещё раз");
    }
  };

  /* ------------------------------------------------------------ публикация */

  const onSavedOk = (commitSha: string, htmlUrl?: string) => {
    setServerMenu(menu);
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setPub({ phase: "building", commitSha, htmlUrl, startedAt: Date.now() });
    toast.success("Изменения отправлены — сайт пересобирается");
  };

  const scrollToFirstError = (errors: string[]) => {
    const first = errors[0] ?? "";
    let target: SectionId | null = null;
    let el: Element | null = null;
    if (first.startsWith("menuTypes")) {
      target = "menu";
      const m = first.match(/^menuTypes\.(\d+)/);
      if (m) el = document.querySelector(`[data-mt-idx="${m[1]}"]`);
    } else if (first.startsWith("addons")) {
      target = "addons";
      const m = first.match(/^addons\.(\d+)/);
      if (m) el = document.querySelector(`[data-addon-idx="${m[1]}"]`);
    } else if (first.startsWith("minOrder")) {
      target = "minorder";
    } else if (first.startsWith("servicePanels")) {
      target = "panels";
      const m = first.match(/^servicePanels\.(\d+)/);
      if (m) el = document.querySelector(`[data-panel-idx="${m[1]}"]`);
    }
    if (target) setSection(target);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        else window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  };

  const publish = async () => {
    if (!menu || pub.phase === "saving") return;
    const v = validateMenuData(menu);
    if (v.ok !== true) {
      setValidErrors(v.errors);
      toast.error(
        `Проверьте поля — ${v.errors.length} ${plural(v.errors.length, "ошибка", "ошибки", "ошибок")} в меню`,
      );
      scrollToFirstError(v.errors);
      return;
    }
    setValidErrors(null);
    /* c96: перед публикацией — сводка изменений (что именно уйдёт на сайт). */
    setConfirmOpen(true);
  };

  const doPublish = async () => {
    setConfirmOpen(false);
    if (!menu || pub.phase === "saving") return;
    setPub({ phase: "saving" });
    const r = await apiSaveMenu(
      menu,
      sha || undefined,
      "Обновление меню из админ-панели",
    );
    if (r.ok === true) {
      setSha(r.commitSha);
      onSavedOk(r.commitSha, r.htmlUrl);
      return;
    }
    setPub({ phase: "idle" });
    if (r.reason === "conflict") {
      setConflictOpen(true);
      return;
    }
    if (r.reason === "validation") {
      const errors = r.errors ?? ["Меню не прошло проверку на сервере"];
      setValidErrors(errors);
      scrollToFirstError(errors);
      toast.error("Меню не прошло проверку — см. список ошибок");
      return;
    }
    toast.error(
      r.reason === "github"
        ? "GitHub недоступен — попробуйте через минуту"
        : "Не удалось сохранить — проверьте интернет",
    );
  };

  const conflictReload = async () => {
    setConflictOpen(false);
    const d = await apiGetData();
    if (d.ok !== true) {
      toast.error("Не удалось загрузить свежие данные — попробуйте ещё раз");
      return;
    }
    setMenu(d.data.menu);
    setServerMenu(d.data.menu);
    setSha(d.data.sha);
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    toast.success("Загружена версия с сервера");
  };

  const conflictKeepMine = async () => {
    if (!menu) return;
    setConflictOpen(false);
    setPub({ phase: "saving" });
    const d = await apiGetData();
    if (d.ok !== true) {
      setPub({ phase: "idle" });
      toast.error("Не удалось загрузить свежую версию — попробуйте ещё раз");
      return;
    }
    setSha(d.data.sha);
    const r = await apiSaveMenu(menu, d.data.sha, "Обновление меню из админ-панели");
    if (r.ok === true) {
      setSha(r.commitSha);
      onSavedOk(r.commitSha, r.htmlUrl);
    } else if (r.reason === "conflict") {
      setPub({ phase: "idle" });
      toast.error("Кто-то снова опубликовал правки — обновите страницу");
    } else {
      setPub({ phase: "idle" });
      toast.error("Не удалось сохранить — попробуйте ещё раз");
    }
  };

  /* поллинг статуса сборки (шаг 5с). 4-F2: потолок поднят 6 → 10 минут —
   * реальный деплой c95 замерен в 6м23с: старого потолка не хватало,
   * поллинг сдавался раньше сборки. */
  useEffect(() => {
    if (pub.phase !== "building") return;
    let cancelled = false;
    const interval = setInterval(async () => {
      if (cancelled) return;
      if (Date.now() - pub.startedAt > 10 * 60_000) {
        setPub({ phase: "unknown" });
        return;
      }
      const r = await apiStatus(pub.commitSha);
      if (cancelled) return;
      if (r.ok === true && r.data.state === "success") {
        setPub({ phase: "success", htmlUrl: r.data.htmlUrl ?? pub.htmlUrl });
        const d = await apiGetData();
        if (cancelled || d.ok !== true) return;
        /* владелец мог продолжить правки, пока шла сборка — не затираем их:
         * обновляем только sha; снимок сервера заменяем лишь при чистом стейте */
        setSha(d.data.sha);
        if (!dirty) {
          setMenu(d.data.menu);
          setServerMenu(d.data.menu);
        }
        return;
      }
      if (r.ok === true && r.data.state === "failure") {
        setPub({ phase: "failure", htmlUrl: r.data.htmlUrl ?? pub.htmlUrl });
        return;
      }
      /* 4-F2: 'cancelled' — эту публикацию вытеснила более новая
       * (конкурирующий publish отменил идущий деплой). Терминально
       * для ЭТОГО sha: эффект выше не перезапустится (phase больше
       * не «building»), ничего не дозапрашиваем — новая публикация
       * пойдёт собственным циклом. */
      if (r.ok === true && r.data.state === "cancelled") {
        setPub({ phase: "cancelled", htmlUrl: r.data.htmlUrl ?? pub.htmlUrl });
      }
    }, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pub, dirty]);

  /* ----------------------------------------------------------------- logout */

  const doLogout = async () => {
    setLogoutOpen(false);
    setMoreOpen(false);
    await apiLogout();
    onLoggedOut();
  };

  const requestLogout = () => {
    if (dirty) setLogoutOpen(true);
    else void doLogout();
  };

  /* ------------------------------------------------------------------ render */

  const unread = leads.filter((l) => !l.read).length;
  const activeNav = NAV.find((n) => n.id === section);

  /* 4-F2: зеркало Vercel (*.vercel.app) — вместо панели карточка со ссылкой
   * на основной домен: /api/* там закрыты редиректом, логин и публикация
   * невозможны (раньше владелец видел бесконечный экран входа с «нет
   * связи»). Возврат стоит ПОСЛЕ всех хуков — хуки всегда вызываются в
   * одном порядке; эффекты выше погашены isVercelMirror — ни одного
   * API-вызова (apiSession на зеркале тоже не ходит в сеть, см. api.ts). */
  if (isVercelMirror()) {
    return <VercelMirrorNotice />;
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* ── сайдбар (десктоп) ─────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border-line/70 bg-parchment/60 lg:flex">
        <div className="px-5 pt-6 pb-4">
          <p className="font-serif text-[21px] leading-none font-medium text-ink">
            nilov catering<span className="text-gold">.</span>
          </p>
          <p className="mt-1 text-[11px] tracking-[0.18em] text-ink-soft/70 uppercase">
            панель управления
          </p>
          {mock ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-gold/15 text-[10px] tracking-wider text-ink">
                демо-режим
              </Badge>
              <button
                type="button"
                onClick={() => {
                  disableMockMode();
                  window.location.reload();
                }}
                className="text-[11px] text-ink-soft/80 underline decoration-dotted underline-offset-2 hover:text-ink"
              >
                выйти из демо
              </button>
            </div>
          ) : null}
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Разделы">
          {NAV.map((n) => (
            <SideNavItem
              key={n.id}
              item={n}
              active={section === n.id}
              unread={n.id === "leads" ? unread : 0}
              onClick={() => setSection(n.id)}
            />
          ))}
        </nav>
        <div className="space-y-1 p-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[14px] text-ink-soft transition-colors hover:bg-accent hover:text-ink"
          >
            <ExternalLink className="size-4" /> Открыть сайт
          </a>
          <button
            type="button"
            onClick={requestLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] text-ink-soft transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4" /> Выйти
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* ── верхний бар ──────────────────────────────────────────────── */}
        <header className="sticky top-0 z-20 border-b border-border-line/70 bg-background/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4 lg:h-16">
            <span className="font-serif text-[18px] font-medium text-ink lg:hidden">
              nilov<span className="text-gold">.</span>
            </span>
            <h1 className="flex-1 truncate text-[15px] font-medium text-ink-soft">
              {activeNav?.label}
            </h1>
            {dirty ? (
              <span className="hidden items-center gap-1.5 text-[12.5px] text-ink-soft sm:inline-flex">
                <span className="size-2 rounded-full bg-gold" />
                Есть несохранённые изменения
              </span>
            ) : null}
            <Button
              type="button"
              className="hidden h-11 rounded-xl bg-gradient-to-r from-gold to-terracotta px-5 text-[14px] font-semibold text-white shadow-md shadow-gold/25 hover:opacity-95 lg:inline-flex"
              disabled={pub.phase === "saving" || !menu}
              onClick={publish}
            >
              {pub.phase === "saving" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UploadCloud className="size-4" />
              )}
              Опубликовать изменения
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 pt-5 pb-44 lg:pb-12">
          {/* черновик */}
          {draftOffer ? (
            <Card className="mb-4 rounded-2xl border-gold/40 bg-gold/[0.06] shadow-none">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[14px] leading-relaxed text-ink">
                  Есть несохранённые правки от{" "}
                  <strong>
                    {new Date(draftOffer.savedAt).toLocaleString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>
                  .
                </p>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    className="h-11 rounded-xl text-[14px]"
                    onClick={() => {
                      setMenu(draftOffer.menu);
                      setDraftOffer(null);
                      toast.success("Черновик восстановлен");
                    }}
                  >
                    Продолжить правки
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl text-[14px]"
                    onClick={() => {
                      try {
                        window.localStorage.removeItem(DRAFT_KEY);
                      } catch {
                        /* ignore */
                      }
                      setDraftOffer(null);
                    }}
                  >
                    Отменить черновик
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <PublishBanner pub={pub} onClose={() => setPub({ phase: "idle" })} />
          {validErrors ? <ValidationErrors errors={validErrors} onClose={() => setValidErrors(null)} /> : null}

          {loadState === "loading" ? <AppSkeleton /> : null}
          {loadState === "error" ? (
            <Card className="rounded-2xl border-border-line/80 shadow-none">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <AlertTriangle className="size-10 text-ink-soft/40" />
                <p className="text-[15px] font-medium text-ink">
                  Не удалось загрузить данные
                </p>
                <Button
                  type="button"
                  className="h-11 rounded-xl text-[14px]"
                  onClick={() => void loadApp()}
                >
                  Попробовать ещё раз
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {loadState === "ready" && menu ? (
            <>
              {section === "menu" ? <MenuEditor menu={menu} update={update} /> : null}
              {section === "addons" ? <AddonsEditor menu={menu} update={update} /> : null}
              {section === "minorder" ? <MinOrderEditor menu={menu} update={update} /> : null}
              {section === "panels" ? <ServicePanelsEditor menu={menu} update={update} /> : null}
              {section === "leads" ? (
                <LeadsView
                  leads={leads}
                  total={leadsTotal}
                  menu={menu}
                  onPatch={patchLead}
                  onDelete={deleteLead}
                  onReadAll={readAllLeads}
                  readingAll={readingAll}
                  onRefresh={refreshLeads}
                  refreshing={refreshingLeads}
                />
              ) : null}
              {section === "settings" && settings ? (
                <SettingsView
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              ) : null}
              {section === "settings" && !settings ? (
                <p className="text-sm text-ink-soft">
                  Настройки не загрузились — обновите страницу.
                </p>
              ) : null}
            </>
          ) : null}
        </main>
      </div>

      {/* ── нижний док (мобайл): sticky-бар публикации + таб-бар ─────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col lg:hidden">
        {dirty && loadState === "ready" ? (
          <div className="border-t border-border-line/70 bg-background/95 px-4 pt-3 pb-2 backdrop-blur">
            <Button
              type="button"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-gold to-terracotta text-[15px] font-semibold text-white shadow-md shadow-gold/25 hover:opacity-95"
              disabled={pub.phase === "saving" || !menu}
              onClick={publish}
            >
              {pub.phase === "saving" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UploadCloud className="size-4" />
              )}
              Опубликовать изменения
            </Button>
            <p className="mt-1.5 text-center text-[11.5px] text-ink-soft/80">
              есть несохранённые изменения
            </p>
          </div>
        ) : null}
        <nav
          className="flex border-t border-border-line/70 bg-parchment/85 pb-[env(safe-area-inset-bottom)] backdrop-blur"
          aria-label="Разделы"
        >
          {NAV.filter((n) => MOBILE_PRIMARY.includes(n.id)).map((n) => (
            <MobileNavItem
              key={n.id}
              item={n}
              active={section === n.id}
              unread={n.id === "leads" ? unread : 0}
              onClick={() => {
                setSection(n.id);
              }}
            />
          ))}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex h-16 flex-1 flex-col items-center justify-center gap-1",
                  !MOBILE_PRIMARY.includes(section) ? "text-gold" : "text-ink-soft",
                )}
                aria-label="Ещё разделы"
              >
                <MoreHorizontal className="size-5" />
                <span className="text-[10px] leading-none font-medium">Ещё</span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="rounded-t-3xl px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              <SheetHeader className="pb-1">
                <SheetTitle className="text-left font-serif text-lg">
                  Все разделы
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-1" data-lenis-prevent>
                {NAV.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={cn(
                      "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px]",
                      section === n.id
                        ? "bg-gold/12 font-medium text-ink"
                        : "text-ink",
                    )}
                    onClick={() => {
                      setSection(n.id);
                      setMoreOpen(false);
                    }}
                  >
                    <n.icon
                      className={cn(
                        "size-4",
                        section === n.id ? "text-gold" : "text-ink-soft",
                      )}
                    />
                    {n.label}
                    {n.id === "leads" && unread > 0 ? (
                      <Badge className="ml-auto rounded-full bg-gold px-2 text-[11px] text-white">
                        {unread}
                      </Badge>
                    ) : null}
                  </button>
                ))}
                <Separator className="my-2" />
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] text-ink"
                >
                  <ExternalLink className="size-4 text-ink-soft" /> Открыть сайт
                </a>
                <button
                  type="button"
                  onClick={requestLogout}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] text-destructive"
                >
                  <LogOut className="size-4" /> Выйти
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>

      {/* ── диалоги ────────────────────────────────────────────────────── */}

      {/* c96: подтверждение публикации со сводкой «что именно изменится» */}
      {/* c97: computeMenuDiff — только при открытом диалоге (иначе считался
          на каждый рендер админки); + защита от пакетов без dishes */}
      <PublishConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        diff={confirmOpen && menu && serverMenu ? computeMenuDiff(serverMenu, menu) : []}
        busy={pub.phase === "saving"}
        onConfirm={() => void doPublish()}
      />

      <AlertDialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              Данные на сервере изменились
            </AlertDialogTitle>
            <AlertDialogDescription>
              Публикация была с другого устройства. Обновить и перезалить ваши
              правки?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:items-stretch">
            <AlertDialogAction
              className="h-11 rounded-xl sm:mr-0"
              onClick={(e) => {
                e.preventDefault();
                void conflictReload();
              }}
            >
              Перезагрузить с сервера
            </AlertDialogAction>
            <AlertDialogAction
              className="h-11 rounded-xl bg-gradient-to-r from-gold to-terracotta font-semibold text-white shadow-md shadow-gold/25 hover:opacity-95 sm:mr-0"
              onClick={(e) => {
                e.preventDefault();
                void conflictKeepMine();
              }}
            >
              Сохранить мои правки поверх
            </AlertDialogAction>
            <AlertDialogCancel className="mt-1 h-11 rounded-xl">
              Отмена
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              Выйти из панели?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Есть несохранённые изменения — они останутся в черновике на этом
              устройстве и будут предложены при следующем входе.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-11 rounded-xl">
              Остаться
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-11 rounded-xl"
              onClick={(e) => {
                e.preventDefault();
                void doLogout();
              }}
            >
              Выйти
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------------------------------------------------------ nav pieces */

function SideNavItem({
  item,
  active,
  unread,
  onClick,
}: {
  item: (typeof NAV)[number];
  active: boolean;
  unread: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-1.5 text-left text-[14px] transition-colors",
        active
          ? "bg-gold/12 font-medium text-ink"
          : "text-ink-soft hover:bg-accent hover:text-ink",
      )}
    >
      <item.icon className={cn("size-4 shrink-0", active ? "text-gold" : "")} />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {unread > 0 ? (
        <Badge className="shrink-0 rounded-full bg-gold px-2 text-[11px] text-white">
          {unread}
        </Badge>
      ) : null}
    </button>
  );
}

function MobileNavItem({
  item,
  active,
  unread,
  onClick,
}: {
  item: (typeof NAV)[number];
  active: boolean;
  unread: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-16 flex-1 flex-col items-center justify-center gap-1",
        active ? "text-gold" : "text-ink-soft",
      )}
    >
      <item.icon className="size-5" />
      <span
        className={cn(
          "text-[10px] leading-none",
          active ? "font-semibold" : "font-medium",
        )}
      >
        {item.shortLabel}
      </span>
      {unread > 0 ? (
        <span className="absolute top-2.5 right-1/2 translate-x-4 rounded-full bg-gold px-1.5 py-px text-[10px] leading-none font-semibold text-white tabular-nums">
          {unread}
        </span>
      ) : null}
    </button>
  );
}

/* --------------------------------------------------------- publish banner */

function PublishBanner({
  pub,
  onClose,
}: {
  pub: PubState;
  onClose: () => void;
}) {
  if (pub.phase === "idle" || pub.phase === "saving") {
    if (pub.phase === "saving") {
      return (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border-line/70 bg-accent/50 px-4 py-3 text-[14px] text-ink">
          <Loader2 className="size-4 animate-spin text-gold" />
          Сохранение…
        </div>
      );
    }
    return null;
  }
  if (pub.phase === "building") {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-gold/40 bg-gold/[0.07] px-4 py-3 text-[14px] text-ink">
        <Loader2 className="size-4 animate-spin text-gold" />
        <span className="min-w-0 flex-1">
          Публикация… идёт сборка сайта (~2–4 мин)
        </span>
        {pub.htmlUrl ? (
          <a
            href={pub.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center gap-1 text-[13px] font-medium text-gold underline decoration-gold/40 underline-offset-2"
          >
            Ход сборки <ExternalLink className="size-3.5" />
          </a>
        ) : null}
      </div>
    );
  }
  if (pub.phase === "success") {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-600/30 bg-emerald-50 px-4 py-3 text-[14px] text-emerald-900">
        <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
        <span className="min-w-0 flex-1 font-medium">
         Опубликовано! Обновите страницу сайта
        </span>
        {pub.htmlUrl ? (
          <a
            href={pub.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center gap-1 text-[13px] font-medium text-emerald-800 underline underline-offset-2"
          >
            Сборка <ExternalLink className="size-3.5" />
          </a>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          aria-label="Скрыть"
          className="-m-1 flex size-9 items-center justify-center rounded-full text-emerald-800/70 hover:bg-emerald-100"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }
  if (pub.phase === "failure") {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-[14px] text-ink">
        <XCircle className="size-5 shrink-0 text-destructive" />
        <span className="min-w-0 flex-1">
          Сборка не удалась —{" "}
          {pub.htmlUrl ? (
            <a
              href={pub.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-destructive underline decoration-destructive/40 underline-offset-2"
            >
              нажмите, чтобы увидеть журнал
            </a>
          ) : (
            "попробуйте опубликовать ещё раз"
          )}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Скрыть"
          className="-m-1 flex size-9 items-center justify-center rounded-full text-ink-soft/70 hover:bg-destructive/10"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }
  if (pub.phase === "cancelled") {
    /* 4-F2: вытеснена более новой публикацией — информационное сообщение
     * (не ошибка): ждать завершения новой публикации. */
    return (
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border-line/70 bg-accent/50 px-4 py-3 text-[14px] text-ink">
        <Info className="size-5 shrink-0 text-ink-soft/70" />
        <span className="min-w-0 flex-1">
          Публикация отменена — её заменила более новая. Дождитесь завершения
          новой публикации.
        </span>
        {pub.htmlUrl ? (
          <a
            href={pub.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center gap-1 text-[13px] font-medium text-ink-soft underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            Ход сборки <ExternalLink className="size-3.5" />
          </a>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          aria-label="Скрыть"
          className="-m-1 flex size-9 items-center justify-center rounded-full text-ink-soft/70 hover:bg-accent"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }
  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border-line/70 bg-accent/50 px-4 py-3 text-[14px] text-ink-soft">
      <AlertTriangle className="size-4 text-ink-soft/60" />
      <span className="min-w-0 flex-1">
        Статус сборки неизвестен — обновите страницу сайта через пару минут.
      </span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Скрыть"
        className="-m-1 flex size-9 items-center justify-center rounded-full text-ink-soft/70 hover:bg-accent"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function ValidationErrors({
  errors,
  onClose,
}: {
  errors: string[];
  onClose: () => void;
}) {
  return (
    <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3.5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-ink">
            Меню не прошло проверку — исправьте:
          </p>
          <ul className="mt-1.5 space-y-1">
            {errors.map((e, i) => (
              <li key={i} className="text-[13px] leading-snug text-ink-soft">
                {e}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Скрыть ошибки"
          className="-m-1 flex size-9 shrink-0 items-center justify-center rounded-full text-ink-soft/70 hover:bg-destructive/10"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

/* --------------------------------------------------- 4-F2: mirror notice */

/** Карточка вместо панели на зеркале Vercel (*.vercel.app): /api/* там
 *  закрыты редиректом 302→/404 (PHP не исполняется) — вход и публикация
 *  невозможны, ведём на основной домен. Центрирована, в стиле LoginScreen. */
function VercelMirrorNotice() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-serif text-[34px] leading-none font-medium text-ink">
            nilov catering<span className="text-gold">.</span>
          </p>
          <p className="mt-2 text-[11px] tracking-[0.22em] text-ink-soft/70 uppercase">
            панель управления
          </p>
        </div>
        <Card className="rounded-2xl border-border-line/80 shadow-sm">
          <CardContent className="p-6 text-center">
            <p className="text-[15px] leading-relaxed text-ink">
              Админ-панель работает только на основном домене — откройте{" "}
              <a
                href="https://nilovcatering.ru/admin"
                className="font-medium text-gold underline decoration-gold/40 underline-offset-2"
              >
                https://nilovcatering.ru/admin
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- skeleton */

function AppSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <Skeleton className="h-8 w-56 rounded-xl" />
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}

/* ------------------------------------------------- c96: сводка изменений */

/**
 * Diff «сервер → черновик» простыми словами для владельца: что уйдёт на
 * сайт после публикации. Возвращает список строк (цены, составы,
 * добавления/удаления). Фиксирует только значимое для сайта — цены,
 * названия, составы; правки описаний схлопываются в одну строку.
 */
export function computeMenuDiff(server: MenuData, draft: MenuData): string[] {
  const out: string[] = [];
  const S = JSON.stringify(server);
  const D = JSON.stringify(draft);

  const sById = new Map(server.menuTypes.map((t) => [t.id, t]));
  const dById = new Map(draft.menuTypes.map((t) => [t.id, t]));

  for (const t of draft.menuTypes) {
    const s = sById.get(t.id);
    if (!s) {
      out.push(`Новый формат: «${t.label}» (от ${formatRUB(t.perGuest)})`);
      continue;
    }
    if (s.label !== t.label) out.push(`«${s.label}» → «${t.label}»`);
    if (s.perGuest !== t.perGuest) {
      out.push(`«${t.label}»: цена «от» ${formatRUB(s.perGuest)} → ${formatRUB(t.perGuest)}`);
    }
    if ((s.calcPerGuest ?? null) !== (t.calcPerGuest ?? null)) {
      const a = s.calcPerGuest ?? s.perGuest;
      const b = t.calcPerGuest ?? t.perGuest;
      if (a !== b) {
        out.push(`«${t.label}»: цена калькулятора ${formatRUB(a)} → ${formatRUB(b)}`);
      }
    }
    if (s.minGuests !== t.minGuests) {
      out.push(`«${t.label}»: мин. гостей ${s.minGuests} → ${t.minGuests}`);
    }
    const sm = server.minOrder[s.id];
    const dm = draft.minOrder[t.id];
    if (sm !== dm) {
      out.push(`«${t.label}»: мин. заказ ${formatRUB(sm ?? 0)} → ${formatRUB(dm ?? 0)}`);
    }
    const sPkg = new Map(s.packages.map((p) => [p.name, p]));
    for (const p of t.packages) {
      const sp = sPkg.get(p.name);
      const where = `«${t.label}» · ${p.name}`;
      if (!sp) {
        out.push(`${where}: новый пакет (${formatRUB(p.pricePerGuest)}/гость)`);
        continue;
      }
      if (sp.pricePerGuest !== p.pricePerGuest) {
        out.push(`${where}: ${formatRUB(sp.pricePerGuest)} → ${formatRUB(p.pricePerGuest)}`);
      }
      if ((sp.dishes?.length ?? 0) !== (p.dishes?.length ?? 0)) {
        out.push(`${where}: блюд ${sp.dishes?.length ?? 0} → ${p.dishes?.length ?? 0}`);
      }
    }
    for (const p of s.packages) {
      if (!t.packages.some((p2) => p2.name === p.name)) {
        out.push(`«${t.label}»: удалён пакет «${p.name}»`);
      }
    }
  }
  for (const t of server.menuTypes) {
    if (!dById.has(t.id)) out.push(`Удалён формат «${t.label}»`);
  }

  const sAdd = new Map(server.addons.map((a) => [a.id, a]));
  for (const a of draft.addons) {
    const sa = sAdd.get(a.id);
    if (!sa) {
      out.push(`Новая допуслуга: «${a.label}»`);
      continue;
    }
    if ((sa.price ?? null) !== (a.price ?? null) && (sa.price ?? a.price) !== undefined) {
      out.push(`Допуслуга «${a.label}»: ${formatRUB(sa.price ?? 0)} → ${formatRUB(a.price ?? 0)}`);
    }
    if ((sa.percent ?? null) !== (a.percent ?? null)) {
      out.push(`Допуслуга «${a.label}»: ${sa.percent ?? 0}% → ${a.percent ?? 0}%`);
    }
  }
  for (const a of server.addons) {
    if (!draft.addons.some((x) => x.id === a.id)) {
      out.push(`Удалена допуслуга «${a.label}»`);
    }
  }

  const sPan = new Map(server.servicePanels.map((p) => [p.id, p]));
  for (const p of draft.servicePanels) {
    const sp = sPan.get(p.id);
    if (sp && sp.priceLabel !== p.priceLabel) {
      out.push(`Плитка «${p.label}»: цена «${sp.priceLabel}» → «${p.priceLabel}»`);
    }
  }

  /* всё, что не попало в явные категории (описания, «что входит», фото) */
  if (S === D) return out;
  if (out.length === 0) {
    out.push("Правки в описаниях и прочих полях (цены не менялись)");
  }
  return out;
}

function PublishConfirmDialog({
  open,
  onOpenChange,
  diff,
  busy,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  diff: string[];
  busy: boolean;
  onConfirm: () => void;
}) {
  const MAX = 30;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif">
            Опубликовать изменения?
          </AlertDialogTitle>
          <AlertDialogDescription>
            После публикации сайт, калькулятор и PDF обновятся автоматически —
            обычно это занимает 3–7 минут.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p className="text-[13.5px] font-medium text-ink">Что изменится:</p>
        <div
          data-lenis-prevent
          className="max-h-64 overflow-y-auto rounded-xl border border-border-line/70 bg-parchment/40 p-3"
        >
          {diff.length === 0 ? (
            <p className="text-[13.5px] text-ink-soft">Правки в описаниях и прочих полях</p>
          ) : (
            <ul className="space-y-1">
              {diff.slice(0, MAX).map((line, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[13px] leading-relaxed text-ink"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                  <span>{line}</span>
                </li>
              ))}
              {diff.length > MAX ? (
                <li className="pt-1 text-[12.5px] text-ink-soft/80">
                  …и ещё {diff.length - MAX}
                </li>
              ) : null}
            </ul>
          )}
        </div>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="h-11 rounded-xl">
            {busy ? "Публикую…" : "Отмена"}
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-11 rounded-xl bg-gradient-to-r from-gold to-terracotta font-semibold text-white shadow-md shadow-gold/25 hover:opacity-95"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            <UploadCloud className="size-4" />
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Опубликовать
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
