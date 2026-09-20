/**
 * c95 (Task 1-b) — общие поля/контролы админки.
 *
 * Требования задачи: большие тач-таргеты (≥44px), number-инпуты как text
 * с inputMode="decimal" и нормализацией на blur (целое ≥ 0), русский язык,
 * премиальный стиль сайта (крем/золото, rounded-xl, generous spacing).
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ labels */

export function FieldLabel({
  children,
  hint,
  htmlFor,
}: {
  children: React.ReactNode;
  hint?: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 flex items-baseline gap-2 text-[13px] font-medium tracking-wide text-ink-soft"
    >
      <span>{children}</span>
      {hint ? (
        <span className="text-xs font-normal text-ink-soft/70">{hint}</span>
      ) : null}
    </label>
  );
}

/* -------------------------------------------------------------- text field */

export function TextField({
  value,
  onChange,
  placeholder,
  className,
  id,
  autoComplete = "off",
  inputMode,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email" | "url";
  type?: "text" | "password" | "search" | "email";
}) {
  return (
    <Input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      autoComplete={autoComplete}
      inputMode={inputMode}
      onChange={(e) => onChange(e.target.value)}
      className={cn("h-11 rounded-xl text-[15px]", className)}
    />
  );
}

/* ------------------------------------------------------------ number field */

/**
 * Числовой ввод как text (inputMode=decimal): владелец может печатать
 * «2 500,50» — на blur округляем до целого ≥ 0 и отдаём наверх число.
 * Некорректный ввод откатывается к последнему валидному значению.
 */
export function NumberField({
  value,
  onChange,
  onClear,
  placeholder,
  className,
  id,
  suffix,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  /** Присутствует → пустое поле на blur легально (опциональное поле). */
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  id?: string;
  /** Печатная подсказка справа («₽», «₽/чел», «%»). */
  suffix?: string;
}) {
  const [text, setText] = useState(value === undefined ? "" : String(value));
  const lastValid = useRef(value);

  useEffect(() => {
    const v = value === undefined ? "" : String(value);
    if (Number(text.replace(/\s+/g, "").replace(",", ".")) !== value) setText(v);
    lastValid.current = value;
  }, [value]);

  const commit = () => {
    const raw = text.trim();
    if (raw === "") {
      if (onClear) {
        lastValid.current = undefined;
        onClear();
        return;
      }
      // пустое поле = откат к последнему валидному
      setText(lastValid.current === undefined ? "" : String(lastValid.current));
      return;
    }
    const n = Math.round(Number(raw.replace(/\s+/g, "").replace(",", ".")));
    if (!Number.isFinite(n) || n < 0) {
      setText(lastValid.current === undefined ? "" : String(lastValid.current));
      return;
    }
    setText(String(n));
    lastValid.current = n;
    if (n !== value) onChange(n);
  };

  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={text}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className={cn(
          "h-11 rounded-xl text-[15px] tabular-nums",
          suffix && "pr-10",
          className,
        )}
      />
      {suffix ? (
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-ink-soft/60">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------- textarea field */

export function TextAreaField({
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  id?: string;
}) {
  return (
    <Textarea
      id={id}
      value={value}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className={cn("min-h-20 rounded-xl text-[15px] leading-relaxed", className)}
    />
  );
}

/* --------------------------------------------------------------- icon row */

/** Кнопки «вверх/вниз» для переупорядочивания — без dnd, как в ТЗ. */
export function MoveButtons({
  onUp,
  onDown,
  upDisabled,
  downDisabled,
  label,
}: {
  onUp: () => void;
  onDown: () => void;
  upDisabled?: boolean;
  downDisabled?: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 rounded-xl text-ink-soft hover:bg-accent"
        onClick={onUp}
        disabled={upDisabled}
        aria-label={`${label} — переместить выше`}
      >
        <ArrowUp className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 rounded-xl text-ink-soft hover:bg-accent"
        onClick={onDown}
        disabled={downDisabled}
        aria-label={`${label} — переместить ниже`}
      >
        <ArrowDown className="size-4" />
      </Button>
    </div>
  );
}

export function DeleteButton({
  onClick,
  label,
  className,
}: {
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "size-11 rounded-xl text-ink-soft/70 hover:bg-destructive/10 hover:text-destructive",
        className,
      )}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

/* --------------------------------------------------------- string list ed. */

/** Список строк («Что входит») — add/remove/reorder up-down. */
export function StringListEditor({
  items,
  onChange,
  max = 30,
  itemLabel = "пункт",
  addLabel = "Добавить пункт",
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  max?: number;
  itemLabel?: string;
  addLabel?: string;
  placeholder?: string;
}) {
  const setAt = (i: number, v: string) => {
    const next = items.slice();
    next[i] = v;
    onChange(next);
  };
  const removeAt = (i: number) => onChange(items.filter((_, j) => j !== i));
  const moveAt = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input
            type="text"
            value={item}
            placeholder={placeholder}
            onChange={(e) => setAt(i, e.target.value)}
            className="h-11 rounded-xl text-[15px]"
            aria-label={`${itemLabel} ${i + 1}`}
          />
          <MoveButtons
            label={`${itemLabel} ${i + 1}`}
            onUp={() => moveAt(i, -1)}
            onDown={() => moveAt(i, 1)}
            upDisabled={i === 0}
            downDisabled={i === items.length - 1}
          />
          <DeleteButton
            label={`Удалить ${itemLabel} ${i + 1}`}
            onClick={() => removeAt(i)}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full rounded-xl border-dashed text-[14px]"
        disabled={items.length >= max}
        onClick={() => onChange([...items, ""])}
      >
        + {addLabel}
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------- misc bits */

export function HintText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 text-xs leading-relaxed text-ink-soft/80">{children}</p>
  );
}

export function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: React.ReactNode;
}) {
  return (
    <header className="mb-5">
      <h2 className="font-serif text-[26px] leading-tight font-medium text-ink md:text-[30px]">
        {title}
      </h2>
      {description ? (
        <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          {description}
        </p>
      ) : null}
    </header>
  );
}
