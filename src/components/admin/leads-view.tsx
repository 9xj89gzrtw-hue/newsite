/**
 * c95 (Task 1-b) — раздел «Заявки»: список новых сверху, карточка лида
 * (дата, имя, телефон tel:, email mailto:, бейдж источника, комментарий,
 * чипы payload с расшифровкой), прочитано/удаление, ручное + автообновление
 * (60с при видимой вкладке).
 */
"use client";

import { useState } from "react";
import {
  Check,
  Inbox,
  Loader2,
  Mail,
  Phone,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { formatRUB } from "@/lib/pricing";
import type { MenuData } from "@/lib/menu-schema";
import type { Lead } from "./api";
import { apiLeadDelete, apiLeadUpdate } from "./api";
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
import { SectionHeader } from "./ui-bits";

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
    push("Событие", payload.eventType);
    used.add("eventType");
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
  onRefresh,
  refreshing,
}: {
  leads: Lead[];
  total: number;
  menu: MenuData | null;
  onPatch: (id: string, patch: { read?: boolean }) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const unread = leads.filter((l) => !l.read).length;
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteLead = leads.find((l) => l.id === deleteId);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader
          title="Заявки"
          description={
            total === 0
              ? "Заявки с сайта будут появляться здесь."
              : `Всего ${total}. Непрочитанных: ${unread}.`
          }
        />
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
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
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
  onPatch: (id: string, patch: { read?: boolean }) => void;
  onDelete: () => void;
}) {
  const { chips, rest } = payloadChips(lead.payload, menu);
  return (
    <Card
      className={cn(
        "rounded-2xl border shadow-none transition-colors",
        lead.read
          ? "border-border-line/70 bg-background"
          : "border-gold/40 bg-gold/[0.045]",
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
              <Badge
                variant="outline"
                className="rounded-full border-border-line text-[11px] text-ink-soft"
              >
                {SOURCE_LABELS[lead.source] ?? lead.source}
              </Badge>
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

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <a
            href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
            className="inline-flex min-h-11 items-center gap-2.5 rounded-xl border border-border-line bg-background px-3.5 text-[15px] font-medium text-ink transition-colors hover:border-gold/50 hover:text-gold"
          >
            <Phone className="size-4 shrink-0 text-gold" />
            {lead.phone}
          </a>
          {lead.email ? (
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex min-h-11 items-center gap-2.5 rounded-xl border border-border-line bg-background px-3.5 text-[15px] text-ink transition-colors hover:border-gold/50 hover:text-gold"
            >
              <Mail className="size-4 shrink-0 text-gold" />
              {lead.email}
            </a>
          ) : null}
        </div>

        {lead.comment ? (
          <p className="mt-3 rounded-xl bg-accent/50 p-3 text-[14px] leading-relaxed whitespace-pre-wrap text-ink">
            {lead.comment}
          </p>
        ) : null}

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
              <p key={r.key} className="text-[11.5px] text-ink-soft/70">
                {r.key}: {r.value}
              </p>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
