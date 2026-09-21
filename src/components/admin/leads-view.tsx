/**
 * c95 (Task 1-b) — раздел «Заявки»: список новых сверху, карточка лида
 * (дата, имя, телефон tel:, email mailto:, бейдж источника, комментарий,
 * чипы payload с расшифровкой), прочитано/удаление, ручное + автообновление
 * (60с при видимой вкладке).
 *
 * c102 — МИНИ-CRM: воронка статусов (новая → связались → договорились →
 * отказ) прямо в карточке, быстрые кнопки связи (tel/Telegram/WhatsApp,
 * клик автоматически двигает воронку), заметка владельца, авто-маркеры
 * дожима/напоминания, архив, фильтры-табы + статистика воронки, статус
 * и заметка в CSV-экспорте.
 */
"use client";

import { useEffect, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Check,
  CheckCheck,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Inbox,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RotateCcw,
  Send,
  ShieldAlert,
  StickyNote,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { formatRUB } from "@/lib/pricing";
import type { MenuData } from "@/lib/menu-schema";
import type { Lead, SpamLogEntry } from "./api";
import { apiLeadDelete, apiLeadUpdate, apiSpamLog } from "./api";
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
import { cn } from "@/lib/utils";
import { SectionHeader, TextAreaField } from "./ui-bits";

/** lead.php пишет ts как UNIX-секунды (time()); на случай строки — парсим и её. */
export function formatLeadDate(ts: number | string): string {
  let d: Date;
  if (typeof ts === "number") {
    // секунды (прод) или миллисекунды (защита от будущего формата)
    d = new Date(ts > 1e12 ? ts : ts * 1000);
  } else if (/^\d+$/.test(ts)) {
    const n = Number(ts);
    d = new Date(n > 1e12 ? n : n * 1000);
  } else {
    d = new Date(ts);
  }
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SOURCE_LABELS: Record<string, string> = {
  calculator: "калькулятор",
  contact: "контакты",
  footer: "подвал",
};

/* ------------------------------------------------------- воронка (c102) */

/** Порядок = жизненный цикл заявки; id совпадают с admin.php (status). */
const LEAD_STATUSES = [
  { id: "new", label: "Новая" },
  { id: "contacted", label: "Связались" },
  { id: "agreed", label: "Договорились" },
  { id: "lost", label: "Отказ" },
] as const;

const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  LEAD_STATUSES.map((s) => [s.id as string, s.label]),
);

/** Статус лида: «new» — это ОТСУТСТВИЕ поля в leads.json (как в PHP). */
function leadStatus(l: Lead): string {
  return l.status ?? "new";
}

/** Активная кнопка статуса: «Новая» — золото (перекликается с бейджем
 *  непрочитанной), остальные — фирменные ink/moss/bordeaux, без синего. */
const STATUS_ACTIVE: Record<string, string> = {
  new: "bg-gold text-white",
  contacted: "bg-ink text-parchment",
  agreed: "bg-moss text-white",
  lost: "bg-bordeaux text-white",
};

/** Бейдж статуса в шапке карточки — для беглого сканирования списка. */
const STATUS_BADGE: Record<string, string> = {
  contacted: "border-ink/25 bg-ink/5 text-ink",
  agreed: "border-moss/40 bg-moss/10 text-moss",
  lost: "border-bordeaux/30 bg-bordeaux/5 text-bordeaux",
};

/** Табы-фильтры (порядок = воронка; «Архив» — отдельный карман). */
type LeadsFilter = "all" | "new" | "contacted" | "agreed" | "lost" | "archived";

const FILTERS: { id: LeadsFilter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "new", label: "Новые" },
  { id: "contacted", label: "В работе" },
  { id: "agreed", label: "Договорились" },
  { id: "lost", label: "Отказ" },
  { id: "archived", label: "Архив" },
];

/** Пустые состояния под фильтр — подсказывают СЛЕДУЮЩИЙ шаг воронки,
 *  а не просто «пусто» (владельцу без подсказки непонятно, что делать). */
const EMPTY_BY_FILTER: Record<LeadsFilter, { title: string; text: string; done?: boolean }> = {
  all: {
    title: "Активных заявок нет",
    text: "Новые заявки с сайта появятся здесь автоматически, а обработанные можно убирать в архив.",
  },
  new: {
    title: "Новых нет — всё обработано",
    text: "Как только придёт заявка, она подсветится золотом и попадёт в этот фильтр.",
    done: true,
  },
  contacted: {
    title: "В работе пусто",
    text: "Отметьте заявку «Связались» после первого звонка — она появится здесь.",
  },
  agreed: {
    title: "Договорившихся пока нет",
    text: "Статус «Договорились» ставьте, когда клиент подтвердил формат и дату.",
  },
  lost: {
    title: "Отказов нет",
    text: "Заявки со статусом «Отказ» собираются здесь — иногда стоит вернуться к ним позже.",
  },
  archived: {
    title: "Архив пуст",
    text: "Убирайте сюда закрытые заявки (кнопка с ящиком) — рабочий список останется коротким.",
  },
};

/** c102: телефон → 11 цифр «7…» для t.me/wa.me (зеркало PHP
 *  lead_phone_digits: 8… → 7…, 10 цифр → 7…, прочее → null — тогда
 *  кнопки связи не показываем вовсе, чтобы не вести в никуда). */
function phoneDigits(phone: string): string | null {
  const raw = phone.replace(/\D+/g, "");
  if (raw === "") return null;
  let d = raw;
  if (d.length === 11 && d[0] === "8") d = "7" + d.slice(1);
  else if (d.length === 10) d = "7" + d;
  if (d.length === 11 && d[0] === "7") return d;
  return null;
}

/* ---------------------------------------------------------------- payload */

interface Chip {
  label: string;
  value: string;
  accent?: boolean;
}

function payloadChips(payload: Record<string, unknown> | undefined, menu: MenuData | null): {
  chips: Chip[];
  rest: { key: string; value: string }[];
} {
  if (!payload) return { chips: [], rest: [] };
  const chips: Chip[] = [];
  const rest: { key: string; value: string }[] = [];
  const used = new Set<string>();

  const push = (label: string, value: string, accent = false) =>
    chips.push({ label, value, accent });

  if (payload.undecided === true) {
    push("Подбор", "нужна помощь с подбором", true);
    used.add("undecided");
  }
  if (typeof payload.typeId === "string" && payload.typeId) {
    const t = menu?.menuTypes.find((mt) => mt.id === payload.typeId);
    push("Формат", t ? t.label : payload.typeId);
    used.add("typeId");
  }
  if (typeof payload.pkgName === "string" && payload.pkgName) {
    push("Пакет", payload.pkgName);
    used.add("pkgName");
  }
  if (typeof payload.eventType === "string" && payload.eventType) {
    /* c100: контактная форма шлёт eventType = id типа меню (buffet/…) —
     * показываем русский ярлык, а не сырой id. */
    const t = menu?.menuTypes.find((mt) => mt.id === payload.eventType);
    push("Событие", t ? t.label : payload.eventType);
    used.add("eventType");
  }
  if (typeof payload.typeLabel === "string" && payload.typeLabel) {
    used.add("typeLabel");
  }
  if (typeof payload.eventLabel === "string" && payload.eventLabel) {
    used.add("eventLabel");
  }
  if (typeof payload.guests === "number") {
    push("Гостей", String(payload.guests));
    used.add("guests");
  }
  if (typeof payload.total === "number") {
    push("Расчёт", formatRUB(payload.total));
    used.add("total");
  }
  if (typeof payload.calcTotal === "number") {
    push("Расчёт", formatRUB(payload.calcTotal));
    used.add("calcTotal");
  }
  if (typeof payload.subtotal === "number") {
    push("Меню", formatRUB(payload.subtotal));
    used.add("subtotal");
  }
  if (Array.isArray(payload.addonIds) && payload.addonIds.length > 0) {
    const labels = payload.addonIds
      .map((id) => menu?.addons.find((a) => a.id === id)?.label ?? String(id))
      .join(", ");
    push("Допуслуги", labels);
    used.add("addonIds");
  }
  if (typeof payload.dateIso === "string" && payload.dateIso) {
    const d = new Date(payload.dateIso);
    push(
      "Дата",
      Number.isNaN(d.getTime())
        ? payload.dateIso
        : d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
    );
    used.add("dateIso");
  }
  if (typeof payload.preferredTime === "string" && payload.preferredTime) {
    push("Время", payload.preferredTime);
    used.add("preferredTime");
  }

  for (const [key, value] of Object.entries(payload)) {
    if (used.has(key)) continue;
    if (value === null || value === undefined || value === "") continue;
    let v: string;
    if (typeof value === "object") {
      try {
        v = JSON.stringify(value);
      } catch {
        v = String(value);
      }
    } else {
      v = String(value);
    }
    if (v.length > 160) v = v.slice(0, 157) + "…";
    rest.push({ key, value: v });
  }
  return { chips, rest };
}

/* -------------------------------------------------------------- main view */

export function LeadsView({
  leads,
  total,
  menu,
  onPatch,
  onDelete,
  onReadAll,
  readingAll,
  onRefresh,
  refreshing,
}: {
  leads: Lead[];
  total: number;
  menu: MenuData | null;
  onPatch: (id: string, patch: { read?: boolean; archived?: boolean; status?: string; note?: string | null }) => void;
  onDelete: (id: string) => void;
  /** c96: пометить все прочитанными (одним запросом на сервер). */
  onReadAll: () => void;
  readingAll: boolean;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const unread = leads.filter((l) => !l.read).length;
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<LeadsFilter>("all");
  const deleteLead = leads.find((l) => l.id === deleteId);

  /* c96: статистика — сегодня и за 7 дней (владельцу важно не пропустить).
   * c102: + живая воронка — «в работе»/«договорились» считаем по НЕархивным
   * (архив уже закрыт и воронку не должен раздувать). */
  const tsMs = (l: Lead) =>
    typeof l.ts === "number" ? (l.ts > 1e12 ? l.ts : l.ts * 1000) : 0;
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const todayCount = leads.filter((l) => tsMs(l) >= dayStart.getTime()).length;
  const weekCount = leads.filter((l) => tsMs(l) >= Date.now() - 7 * 86_400_000).length;
  const activeLeads = leads.filter((l) => !l.archived);
  const inWorkCount = activeLeads.filter((l) => leadStatus(l) === "contacted").length;
  const agreedCount = activeLeads.filter((l) => leadStatus(l) === "agreed").length;

  /* c102: табы-фильтры воронки; «Новые» = непрочитанные ИЛИ статус new —
   * заявка, которую открыли, но ещё не обработали, не теряется из виду. */
  const filterCounts: Record<LeadsFilter, number> = {
    all: activeLeads.length,
    new: activeLeads.filter((l) => !l.read || leadStatus(l) === "new").length,
    contacted: activeLeads.filter((l) => leadStatus(l) === "contacted").length,
    agreed: activeLeads.filter((l) => leadStatus(l) === "agreed").length,
    lost: activeLeads.filter((l) => leadStatus(l) === "lost").length,
    archived: leads.filter((l) => l.archived === true).length,
  };

  const visible =
    filter === "archived"
      ? leads.filter((l) => l.archived === true)
      : filter === "all"
        ? activeLeads
        : activeLeads.filter((l) =>
            filter === "new"
              ? !l.read || leadStatus(l) === "new"
              : leadStatus(l) === filter,
          );

  /* c96: экспорт CSV — все загруженные заявки, разделитель «;», BOM для Excel.
   * c96-CRIT-A: экранирование по RFC-4180 (кавычки — удвоением) + защита
   * от формул-инъекций (ячейка, начинающаяся с = + - @, префиксуется «'» —
   * Excel тогда не исполняет её как формулу).
   * c102: + колонки «Статус» (русский ярлык воронки) и «Заметка»
   * (переводы строк → пробел, чтобы не ломать строку CSV). */
  const exportCsv = () => {
    const esc = (v: string) => {
      const safe = /^[=+@\-\t\r]/.test(v) ? `'${v}` : v;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const rows = [
      ["Дата", "Имя", "Телефон", "Email", "Источник", "Статус", "Комментарий", "Заметка", "ID"],
      ...leads.map((l) => [
        formatLeadDate(l.ts),
        l.name,
        l.phone,
        l.email ?? "",
        SOURCE_LABELS[l.source] ?? l.source,
        STATUS_LABELS[leadStatus(l)] ?? leadStatus(l),
        (l.comment ?? "").replace(/[\r\n]+/g, " "),
        (l.note ?? "").replace(/[\r\n]+/g, " "),
        l.id,
      ]),
    ];
    const csv = "\uFEFF" + rows.map((r) => r.map(esc).join(";")).join("\r\n");
    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zayavki-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast.success(`Экспортировано заявок: ${leads.length}`);
    } catch {
      toast.error("Не удалось сформировать CSV — попробуйте ещё раз");
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader
          title="Заявки"
          description={
            total === 0
              ? "Заявки с сайта будут появляться здесь."
              : `Всего ${total} · сегодня ${todayCount} · за 7 дней ${weekCount} · в работе ${inWorkCount} · договорились ${agreedCount}`
          }
        />
        <div className="flex flex-wrap gap-2">
          {unread > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl text-[14px]"
              onClick={onReadAll}
              disabled={readingAll}
            >
              {readingAll ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCheck className="size-4" />
              )}
              Прочитать все
            </Button>
          ) : null}
          {leads.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl text-[14px]"
              onClick={exportCsv}
            >
              <Download className="size-4" /> CSV
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl text-[14px]"
            onClick={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RotateCcw className="size-4" />
            )}
            Обновить
          </Button>
        </div>
      </div>

      {leads.length > 0 ? (
        /* c102: 6 фильтров-воронки; flex-wrap — на мобиле табы складываются
         * в две строки, а не обрезаются (текст ≤13.5px, стиль прежний). */
        <div className="mb-3 inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-border-line/70 bg-parchment/40 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn(
                "min-h-9 rounded-lg px-3 text-[13px] font-medium transition-colors",
                filter === f.id
                  ? "bg-background text-ink shadow-sm"
                  : "text-ink-soft hover:text-ink",
                f.id === "new" && filterCounts.new > 0 && filter !== f.id && "text-gold",
              )}
            >
              {f.label} ({filterCounts[f.id]})
            </button>
          ))}
        </div>
      ) : null}

      {leads.length === 0 ? (
        <Card className="rounded-2xl border-border-line/80 shadow-none">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <Inbox className="size-10 text-ink-soft/40" />
            <p className="text-[15px] font-medium text-ink">Заявок пока нет</p>
            <p className="max-w-sm text-[13px] text-ink-soft">
              Как только посетитель оставит заявку на сайте, она появится здесь
              автоматически.
            </p>
          </CardContent>
        </Card>
      ) : visible.length === 0 ? (
        /* c102: пустое состояние зависит от фильтра — подсказываем следующий
         * шаг воронки (см. EMPTY_BY_FILTER). */
        <Card className="rounded-2xl border-border-line/80 shadow-none">
          <CardContent className="py-12 text-center">
            {EMPTY_BY_FILTER[filter].done ? (
              <CheckCheck className="mx-auto size-10 text-gold" />
            ) : (
              <Inbox className="mx-auto size-10 text-ink-soft/40" />
            )}
            <p className="mt-3 text-[15px] font-medium text-ink">
              {EMPTY_BY_FILTER[filter].title}
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-soft">
              {EMPTY_BY_FILTER[filter].text}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              menu={menu}
              onPatch={onPatch}
              onDelete={() => setDeleteId(lead.id)}
            />
          ))}
        </div>
      )}

      {/* c98-A: сабмиты, пойманные анти-спам ловушками — до c98 они
          умирали молча; реальный клиент мог потеряться без следа. */}
      <SpamTrapCard />

      <AlertDialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              Удалить заявку от {deleteLead?.name || "посетителя"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Заявка будет удалена навсегда — восстановить её не получится.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-11 rounded-xl">Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="h-11 rounded-xl bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setDeleteId(null);
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

/* --------------------------------------------------------------- lead card */

function LeadCard({
  lead,
  menu,
  onPatch,
  onDelete,
}: {
  lead: Lead;
  menu: MenuData | null;
  onPatch: (id: string, patch: { read?: boolean; archived?: boolean; status?: string; note?: string | null }) => void;
  onDelete: () => void;
}) {
  const { chips, rest } = payloadChips(lead.payload, menu);
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  /* c102: заметка свернута по умолчанию; noteDraft !== null = режим
   * правки (null → показываем сохранённый текст + кнопку «Изменить»). */
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState<string | null>(null);

  const st = leadStatus(lead);
  /* Кнопки Telegram/WhatsApp — только для нормализуемого номера
   * (зеркало PHP lead_phone_digits), иначе в мессенджер вести нельзя. */
  const wa = phoneDigits(lead.phone);

  /* c96: копирование телефона — звонить из CRM/мессенджера удобнее. */
  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(lead.phone);
      setCopied(true);
      toast.success("Телефон скопирован");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  /* c102: копирование email — вставить в CRM/почту одним тапом. */
  const copyEmail = async () => {
    if (!lead.email) return;
    try {
      await navigator.clipboard.writeText(lead.email);
      setEmailCopied(true);
      toast.success("Email скопирован");
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  /* c102: звонок/сообщение клиенту автоматом двигает воронку — «новая» →
   * «связались» + прочитано; ссылка при этом работает как обычно
   * (без preventDefault): действие уже состоялось по факту клика. */
  const markContacted = () => {
    if (st === "new") onPatch(lead.id, { read: true, status: "contacted" });
  };

  /* c102: статус ≠ «Новая» заодно помечает прочитанным — после работы
   * со статусами в «Новых» не остаются «мёртвые» заявки. */
  const setStatus = (next: string) => {
    if (next === st) return;
    onPatch(lead.id, next === "new" ? { status: next } : { status: next, read: true });
  };

  /* c102: заметка — тем же оптимистичным onPatch (откат при сбое делает
   * родитель); пустой текст = очистить (сервер превращает "" в null). */
  const saveNote = () => {
    if (noteDraft === null) return;
    onPatch(lead.id, { note: noteDraft });
    setNoteDraft(null);
  };

  const savedNote = lead.note ?? "";

  return (
    <Card
      className={cn(
        "rounded-2xl border shadow-none transition-colors",
        lead.read
          ? "border-border-line/70 bg-background"
          : "border-gold/40 bg-gold/[0.045]",
        /* c102: архив приглушает карточку целиком — визуально «выбыла». */
        lead.archived && "opacity-60",
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-serif text-[19px] leading-snug font-medium text-ink">
                {lead.name || "Без имени"}
              </span>
              {!lead.read ? (
                <Badge className="rounded-full bg-gold text-[11px] text-white">
                  новая
                </Badge>
              ) : null}
              {/* c102: статус воронки в шапке — беглое сканирование списка */}
              {st !== "new" ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full text-[11px] font-normal",
                    STATUS_BADGE[st] ?? "border-border-line text-ink-soft",
                  )}
                >
                  {STATUS_LABELS[st] ?? st}
                </Badge>
              ) : null}
              {lead.archived ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-border-line bg-accent/60 text-[11px] font-normal text-ink-soft"
                >
                  в архиве
                </Badge>
              ) : null}
              <Badge
                variant="outline"
                className="rounded-full border-border-line text-[11px] text-ink-soft"
              >
                {SOURCE_LABELS[lead.source] ?? lead.source}
              </Badge>
              {/* c102: авто-маркеры — чем система уже помогла по этой заявке
                  (дожим клиенту / напоминание владельцу). */}
              {lead.followupTs ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-gold/50 bg-gold/10 text-[11px] font-normal text-ink"
                  title="Письмо-напоминание ушло клиенту автоматически"
                >
                  ✉️ авто-дожим отправлен
                </Badge>
              ) : null}
              {lead.nudgedTs ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-border-line bg-accent/60 text-[11px] font-normal text-ink-soft"
                  title="Система уже напоминала вам об этой заявке"
                >
                  🔔 напоминание было
                </Badge>
              ) : null}
              {/* c98-FIX1 (критик2 #6, MINOR): rescuedFrom — заявка записана
                  ПОВЕРХ битого leads.json (старые данные спасены в
                  leads.corrupt-*.json). До фикса поле существовало только в
                  JSON/интерфейсе — владелец не видел маркер и не знал про
                  аварию хранилища. Тон destructive — сигнал «проверить
                  вручную»; title подсказывает, где искать бэкап. */}
              {lead.rescuedFrom ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-destructive/40 text-[11px] font-normal text-destructive"
                  title={`Данные восстановлены после сбоя хранилища (${lead.rescuedFrom}) — проверьте заявки из бэкапа вручную`}
                >
                  восстановлено после сбоя хранилища
                </Badge>
              ) : null}
            </div>
            <p className="mt-0.5 text-[12.5px] text-ink-soft/80">
              {formatLeadDate(lead.ts)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {lead.read ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-11 rounded-xl px-3 text-[13px]"
                onClick={() => onPatch(lead.id, { read: false })}
              >
                <RotateCcw className="size-4" />
                <span className="hidden sm:inline">Вернуть в новые</span>
                <span className="sm:hidden">В новые</span>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="h-11 rounded-xl bg-gradient-to-r from-gold to-terracotta px-3 text-[13px] font-semibold text-white shadow-md shadow-gold/25 hover:opacity-95"
                onClick={() => onPatch(lead.id, { read: true })}
              >
                <Check className="size-4" /> Прочитано
              </Button>
            )}
            {/* c102: архив — рабочий список держим коротким; удаление
                остаётся отдельным необратимым действием. */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11 rounded-xl text-ink-soft/70 hover:bg-accent hover:text-ink"
              onClick={() => onPatch(lead.id, { archived: !lead.archived })}
              aria-label={lead.archived ? "Вернуть из архива" : "Убрать в архив"}
              title={lead.archived ? "Вернуть из архива" : "Убрать в архив"}
            >
              {lead.archived ? (
                <ArchiveRestore className="size-4" />
              ) : (
                <Archive className="size-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11 rounded-xl text-ink-soft/70 hover:bg-destructive/10 hover:text-destructive"
              onClick={onDelete}
              aria-label="Удалить заявку"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        {/* c102: воронка — 4 статуса одним тапом; активный подсвечен
            (золото для «Новой», ink/moss/bordeaux для остальных). */}
        <div
          role="group"
          aria-label="Статус заявки"
          className="mt-3 flex max-w-full flex-wrap gap-1 rounded-xl border border-border-line/70 bg-parchment/30 p-1"
        >
          {LEAD_STATUSES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStatus(s.id)}
              aria-pressed={st === s.id}
              className={cn(
                "min-h-9 rounded-lg px-3 text-[13px] font-medium transition-colors",
                st === s.id ? STATUS_ACTIVE[s.id] : "text-ink-soft hover:text-ink",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex max-w-full flex-wrap items-center gap-2">
            <a
              href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
              onClick={markContacted}
              className="inline-flex min-h-11 items-center gap-2.5 rounded-xl border border-border-line bg-background px-3.5 text-[15px] font-medium text-ink transition-colors hover:border-gold/50 hover:text-gold"
            >
              <Phone className="size-4 shrink-0 text-gold" />
              {lead.phone}
            </a>
            <button
              type="button"
              onClick={copyPhone}
              aria-label="Скопировать телефон"
              title="Скопировать телефон"
              className="inline-flex size-11 items-center justify-center rounded-xl border border-border-line bg-background text-ink-soft transition-colors hover:border-gold/50 hover:text-gold"
            >
              {copied ? <Check className="size-4 text-gold" /> : <Copy className="size-4" />}
            </button>
            {/* c102: мессенджеры одним тапом — только для нормализуемого
                номера (7…, 11 цифр); клик также двигает воронку. */}
            {wa ? (
              <a
                href={`https://t.me/+${wa}`}
                onClick={markContacted}
                target="_blank"
                rel="noreferrer"
                aria-label="Написать в Telegram"
                title="Написать в Telegram"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border-line bg-background text-ink-soft transition-colors hover:border-gold/50 hover:text-gold"
              >
                <Send className="size-4" />
              </a>
            ) : null}
            {wa ? (
              <a
                href={`https://wa.me/${wa}`}
                onClick={markContacted}
                target="_blank"
                rel="noreferrer"
                aria-label="Написать в WhatsApp"
                title="Написать в WhatsApp"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border-line bg-background text-ink-soft transition-colors hover:border-gold/50 hover:text-gold"
              >
                <MessageCircle className="size-4" />
              </a>
            ) : null}
            {lead.email ? (
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex min-h-11 max-w-full items-center gap-2.5 rounded-xl border border-border-line bg-background px-3.5 text-[15px] text-ink transition-colors hover:border-gold/50 hover:text-gold [overflow-wrap:anywhere]"
              >
                <Mail className="size-4 shrink-0 text-gold" />
                {lead.email}
              </a>
            ) : null}
            {lead.email ? (
              <button
                type="button"
                onClick={copyEmail}
                aria-label="Скопировать email"
                title="Скопировать email"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border-line bg-background text-ink-soft transition-colors hover:border-gold/50 hover:text-gold"
              >
                {emailCopied ? (
                  <Check className="size-4 text-gold" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            ) : null}
          </div>
        </div>

        {lead.comment ? (
          <p className="mt-3 rounded-xl bg-accent/50 p-3 text-[14px] leading-relaxed break-words whitespace-pre-wrap text-ink">
            {lead.comment}
          </p>
        ) : null}

        {/* c102: заметка владельца — сворачиваемый блок; сохранение тем же
            оптимистичным onPatch, при сбое сети родитель вернёт старый текст. */}
        <div className="mt-3 border-t border-border-line/50 pt-2">
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-between gap-2 text-left text-[13.5px] font-medium text-ink-soft"
            aria-expanded={noteOpen}
            onClick={() => {
              const next = !noteOpen;
              setNoteOpen(next);
              if (next && noteDraft === null) setNoteDraft(savedNote);
            }}
          >
            <span className="inline-flex items-center gap-2">
              <StickyNote className="size-4 shrink-0 text-gold" />
              Заметка{lead.note ? " · есть" : ""}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 transition-transform",
                noteOpen && "rotate-180",
              )}
            />
          </button>
          {noteOpen ? (
            <div className="min-w-0 pb-1">
              {noteDraft === null ? (
                <>
                  {savedNote ? (
                    <p className="rounded-xl bg-accent/50 p-3 text-[14px] leading-relaxed break-words whitespace-pre-wrap text-ink">
                      {savedNote}
                    </p>
                  ) : (
                    <p className="py-1 text-[12.5px] leading-relaxed text-ink-soft/80">
                      Заметки ещё нет — запишите детали разговора: что важно
                      клиенту, о чём договорились, когда перезвонить.
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 h-11 rounded-xl text-[13px]"
                    onClick={() => setNoteDraft(savedNote)}
                  >
                    {savedNote ? "Изменить" : "Добавить заметку"}
                  </Button>
                </>
              ) : (
                <>
                  <TextAreaField
                    value={noteDraft}
                    onChange={setNoteDraft}
                    rows={3}
                    className="text-[14px]"
                    placeholder="Что важно клиенту, о чём договорились, когда перезвонить…"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      className="h-11 rounded-xl px-5 text-[14px]"
                      disabled={noteDraft === savedNote || noteDraft.length > 1000}
                      onClick={saveNote}
                    >
                      Сохранить
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-11 rounded-xl text-[13px] text-ink-soft"
                      onClick={() => setNoteDraft(null)}
                    >
                      Отмена
                    </Button>
                    {noteDraft.length > 1000 ? (
                      <span className="text-[12px] text-destructive">
                        до 1000 символов (сейчас {noteDraft.length})
                      </span>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>

        {/* c97: статусы доставки уведомлений (TG/почта/клиенту) */}
        <NotifyBadges lead={lead} />

        {chips.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((c, i) => (
              <Badge
                key={i}
                variant="outline"
                className={cn(
                  "h-auto max-w-full justify-start gap-1 rounded-lg px-2.5 py-1 text-[12px] font-normal",
                  c.accent
                    ? "border-gold/50 bg-gold/10 text-ink"
                    : "border-border-line bg-background text-ink-soft",
                )}
              >
                <span className="font-medium text-ink-soft/70">{c.label}:</span>
                <span className="text-ink">{c.value}</span>
              </Badge>
            ))}
          </div>
        ) : null}

        {rest.length > 0 ? (
          <div className="mt-2 space-y-0.5">
            {rest.map((r) => (
              <p key={r.key} className="break-all text-[11.5px] text-ink-soft/70">
                {r.key}: {r.value}
              </p>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/**
 * c97 — компактные статусы доставки уведомлений по заявке:
 * Telegram / почта владельцу / подтверждение клиенту. Показываются после
 * первой отправки (поле notify появляется в записи лида после уведомлений).
 */
function NotifyBadges({ lead }: { lead: Lead }) {
  const n = lead.notify;
  if (!n) return null;

  const items: { key: string; ok: boolean; label: string; icon: React.ReactNode }[] = [];
  items.push({
    key: "tg",
    ok: n.tg === true,
    label: "Telegram",
    icon: <MessageCircle className="size-3" />,
  });
  items.push({
    key: "mail",
    ok: n.mail === true,
    label: n.mailTransport === "smtp" ? "почта (SMTP)" : "почта",
    icon: <Mail className="size-3" />,
  });
  if (n.client === true || n.client === false) {
    items.push({
      key: "client",
      ok: n.client === true,
      label: "клиенту",
      icon: <Send className="size-3" />,
    });
  }
  const deliveredAny = items.some((i) => i.ok);
  /* c99: имя PDF-меню, ушедшего клиенту во вложении (бейдж после статусов:
   * владелец сразу видит, ЧТО получил клиент — тариф или каталог). */
  const clientPdf = typeof n.clientPdf === "string" && n.clientPdf !== "" ? n.clientPdf : null;

  return (
    <div
      className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border-line/50 pt-2 text-[11.5px] text-ink-soft/70"
      aria-label="Статусы доставки уведомлений"
    >
      <span className="font-medium">Уведомления:</span>
      {items.map((i) => (
        <span
          key={i.key}
          className={cn(
            "inline-flex items-center gap-1",
            i.ok ? "text-ink" : "text-destructive",
          )}
        >
          {i.ok ? (
            <Check className="size-3.5 text-gold" />
          ) : (
            <span className="text-[13px] leading-none">✕</span>
          )}
          {i.icon} {i.label}
        </span>
      ))}
      {clientPdf !== null ? (
        <span
          className="inline-flex items-center gap-1 text-gold"
          title="PDF-меню, прикреплённое к письму клиента"
        >
          <FileText className="size-3" />
          PDF: {clientPdf}
        </span>
      ) : null}
      {!deliveredAny ? (
        <span className="text-destructive">— ни одно не доставлено</span>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------ spam trap (c98-A) */

const SPAM_REASON_LABELS: Record<string, string> = {
  honeypot: "заполнено скрытое поле",
  elapsed: "отправлено мгновенно",
};

/**
 * c98-A — «Ловушка спама»: сабмиты, пойманные honeypot/elapsed-ловушками.
 * Показывается ТОЛЬКО если записи есть: сюда мог попасть реальный клиент
 * (например, старый кэш-бандл без elapsedMs) — владелец проверяет и
 * перезванивает. Данные те же, что у бейджей доставки: мини-таблица.
 */
function SpamTrapCard() {
  const [entries, setEntries] = useState<SpamLogEntry[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  /* Последние 5 — тихая загрузка при появлении раздела «Заявки»;
   * пустой журнал не занимает место (секция не рендерится). */
  useEffect(() => {
    let alive = true;
    setLoading(true);
    void apiSpamLog(5).then((r) => {
      if (alive) setEntries(r.entries);
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return null;
  if (entries.length === 0) return null;

  const showAll = async () => {
    setLoading(true);
    const r = await apiSpamLog(50);
    setEntries(r.entries);
    setLoading(false);
    setExpanded(true);
  };

  return (
    <Card className="mt-6 rounded-2xl border-border-line/80 shadow-none">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <ShieldAlert className="size-4 text-ink-soft" />
          <h3 className="text-[14px] font-semibold text-ink">Ловушка спама</h3>
          <span className="text-[12px] text-ink-soft/70">
            последние {entries.length}
          </span>
        </div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft/80">
          Сюда попадают подозрительные отправки форм. Реальный клиент мог
          попасть по ошибке — проверьте: если это заказчик, просто
          перезвоните ему.
        </p>
        <div className="mt-3 space-y-1.5">
          {entries.map((e, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-soft"
            >
              <span className="text-ink-soft/70">
                {e.ts ? formatLeadDate(e.ts) : "—"}
              </span>
              <Badge
                variant="outline"
                className="rounded-full border-border-line text-[11px] font-normal text-ink-soft"
              >
                {SPAM_REASON_LABELS[e.reason] ?? e.reason}
              </Badge>
              {e.name ? <span className="text-ink">{e.name}</span> : null}
              {e.phone ? (
                <a
                  href={`tel:${e.phone.replace(/[^\d+]/g, "")}`}
                  className="font-medium text-ink hover:text-gold"
                >
                  {e.phone}
                </a>
              ) : null}
              {e.email ? <span>{e.email}</span> : null}
            </div>
          ))}
        </div>
        {!expanded && entries.length >= 5 ? (
          <Button
            type="button"
            variant="outline"
            className="mt-3 h-9 rounded-xl text-[13px]"
            onClick={showAll}
            disabled={loading}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Показать все
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
