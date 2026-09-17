/**
 * c95 (Task 1-b) — редактор «Меню и цены» (раздел 1 админки).
 *
 * MenuData.menuTypes как сворачиваемые карточки: заголовок = label +
 * «от X ₽/чел» + бейдж минимального заказа; внутри — поля формата,
 * список «что входит» и пакеты (вкладки, 1–6), у пакета — блюда
 * (name + weight) с add/remove/перемещением вверх-вниз (без dnd) и
 * фото с выбором из галереи /data/media-manifest.json.
 *
 * c96 (расширение для владельца):
 *  - поиск по форматам/пакетам/блюдам (найденные карточки раскрываются);
 *  - «Развернуть всё / Свернуть всё»;
 *  - массовое изменение цен (± % с округлением и превью до применения);
 *  - дублирование пакета и блюда;
 *  - счётчик блюд и суммарный вес порций на гостя у каждого пакета;
 *  - сводка сверху: сколько форматов/пакетов/блюд отредактировано.
 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Copy,
  Image as ImageIcon,
  Percent,
  Plus,
  Search,
  UnfoldVertical,
  FoldVertical,
  X,
} from "lucide-react";
import { formatRUB } from "@/lib/pricing";
import type { MenuData, MenuPackage, MenuType } from "@/lib/menu-schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  DeleteButton,
  FieldLabel,
  HintText,
  MoveButtons,
  NumberField,
  SectionHeader,
  StringListEditor,
  TextAreaField,
  TextField,
} from "./ui-bits";

export type UpdateMenu = (fn: (m: MenuData) => MenuData) => void;

/* ------------------------------------------------------------------ header */

export function MenuEditor({ menu, update }: { menu: MenuData; update: UpdateMenu }) {
  const [query, setQuery] = useState("");
  /** Раскрытость карточек: key = type.id. */
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [bulkOpen, setBulkOpen] = useState(false);

  const updateType = (idx: number, patch: Partial<MenuType>) =>
    update((m) => {
      const menuTypes = m.menuTypes.slice();
      menuTypes[idx] = { ...menuTypes[idx], ...patch };
      return { ...m, menuTypes };
    });

  const moveType = (idx: number, dir: -1 | 1) =>
    update((m) => {
      const j = idx + dir;
      if (j < 0 || j >= m.menuTypes.length) return m;
      const menuTypes = m.menuTypes.slice();
      [menuTypes[idx], menuTypes[j]] = [menuTypes[j], menuTypes[idx]];
      return { ...m, menuTypes };
    });

  const removeType = (idx: number) =>
    update((m) => {
      if (m.menuTypes.length <= 1) return m;
      const menuTypes = m.menuTypes.filter((_, i) => i !== idx);
      const minOrder = { ...m.minOrder };
      delete minOrder[m.menuTypes[idx].id];
      return { ...m, menuTypes, minOrder };
    });

  const addType = () =>
    update((m) => {
      const nt: MenuType = {
        id: `format-${Date.now().toString(36)}`,
        label: "Новый формат",
        short: "Короткое описание",
        perGuest: 1000,
        minGuests: 1,
        description: "Опишите формат: для каких событий, что на столах.",
        included: ["Официанты", "Посуда и приборы"],
        packages: [
          {
            name: "Базовый",
            pricePerGuest: 1000,
            description: "Состав пакета",
            dishes: [{ name: "Название блюда", weight: "50 г" }],
          },
        ],
      };
      return {
        ...m,
        menuTypes: [...m.menuTypes, nt],
        minOrder: { ...m.minOrder, [nt.id]: 50_000 },
      };
    });

  /* --- поиск: формат подходит, если совпал он, пакет или блюдо ---------- */
  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    const res: Record<string, boolean> = {};
    for (const t of menu.menuTypes) {
      if (!q) continue;
      const inType =
        t.label.toLowerCase().includes(q) || t.short.toLowerCase().includes(q);
      const inPkg = t.packages.some(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.dishes.some((d) => (d.name ?? "").toLowerCase().includes(q)),
      );
      res[t.id] = inType || inPkg;
    }
    return res;
  }, [menu.menuTypes, q]);

  const searching = q.length > 0;
  const visible = searching
    ? menu.menuTypes.filter((t) => matches[t.id])
    : menu.menuTypes;

  const allOpen =
    menu.menuTypes.length > 0 &&
    menu.menuTypes.every((t) => openMap[t.id] === true);
  const setAll = (v: boolean) => {
    const next: Record<string, boolean> = {};
    for (const t of menu.menuTypes) next[t.id] = v;
    setOpenMap(next);
  };

  /* --- сводка ------------------------------------------------------------ */
  const totalPackages = menu.menuTypes.reduce((n, t) => n + t.packages.length, 0);
  const totalDishes = menu.menuTypes.reduce(
    (n, t) => n + t.packages.reduce((k, p) => k + p.dishes.length, 0),
    0,
  );

  return (
    <section>
      <SectionHeader
        title="Меню и цены"
        description="Форматы меню, пакеты и цены за человека. Изменения публикуются на сайт после нажатия «Опубликовать изменения»."
      />

      {/* c96: панель инструментов — поиск, свёртка, массовые цены */}
      <div className="mb-4 rounded-2xl border border-border-line/70 bg-parchment/40 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft/60" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск: формат, пакет или блюдо…"
              aria-label="Поиск по меню"
              className="h-11 rounded-xl pl-9 text-[15px]"
            />
            {searching ? (
              <button
                type="button"
                aria-label="Очистить поиск"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-ink-soft hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl text-[13.5px]"
              onClick={() => setAll(!allOpen)}
              disabled={searching}
            >
              {allOpen ? (
                <>
                  <FoldVertical className="size-4" /> Свернуть всё
                </>
              ) : (
                <>
                  <UnfoldVertical className="size-4" /> Развернуть всё
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl text-[13.5px]"
              onClick={() => setBulkOpen(true)}
            >
              <Percent className="size-4" /> Изменить цены
            </Button>
          </div>
        </div>
        <p className="mt-2 px-1 text-[12px] text-ink-soft/80">
          {menu.menuTypes.length}{" "}
          {plural(menu.menuTypes.length, "формат", "формата", "форматов")} ·{" "}
          {totalPackages} {plural(totalPackages, "пакет", "пакета", "пакетов")} ·{" "}
          {totalDishes} {plural(totalDishes, "блюдо", "блюда", "блюд")}
          {searching
            ? ` · найдено: ${visible.length} из ${menu.menuTypes.length}`
            : ""}
        </p>
      </div>

      <div className="space-y-3">
        {visible.map((t, i) => (
          <MenuTypeCard
            key={t.id}
            index={menu.menuTypes.indexOf(t)}
            total={menu.menuTypes.length}
            minOrder={menu.minOrder[t.id] ?? 0}
            type={t}
            open={searching ? true : (openMap[t.id] ?? i === 0)}
            onToggle={() => setOpenMap((m) => ({ ...m, [t.id]: !(m[t.id] ?? i === 0) }))}
            onMove={(d) => moveType(menu.menuTypes.indexOf(t), d)}
            onRemove={() => removeType(menu.menuTypes.indexOf(t))}
            onChange={(patch) => updateType(menu.menuTypes.indexOf(t), patch)}
          />
        ))}
        {searching && visible.length === 0 ? (
          <Card className="rounded-2xl border-border-line/80 shadow-none">
            <CardContent className="py-10 text-center">
              <p className="text-[14px] text-ink-soft">
                По запросу «{query.trim()}» ничего не найдено
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-3 h-11 rounded-xl text-[14px]"
                onClick={() => setQuery("")}
              >
                Сбросить поиск
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-4 h-12 w-full rounded-xl border-dashed text-[15px]"
        disabled={menu.menuTypes.length >= 12}
        onClick={addType}
      >
        <Plus className="size-4" /> Добавить формат меню
        {menu.menuTypes.length >= 12 ? " (максимум 12)" : ""}
      </Button>

      <BulkPriceDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        menu={menu}
        update={update}
      />
    </section>
  );
}

/* -------------------------------------------------------------- type card */

function MenuTypeCard({
  index,
  total,
  minOrder,
  type,
  open,
  onToggle,
  onMove,
  onRemove,
  onChange,
}: {
  index: number;
  total: number;
  minOrder: number;
  type: MenuType;
  open: boolean;
  onToggle: () => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onChange: (patch: Partial<MenuType>) => void;
}) {
  const dishes = type.packages.reduce((n, p) => n + p.dishes.length, 0);
  return (
    <Card
      data-mt-idx={index}
      className="overflow-hidden rounded-2xl border-border-line/80 shadow-none"
    >
      <div className="flex items-center gap-1 pr-2 pl-1">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-h-14 flex-1 items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-accent/60"
        >
          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-ink-soft/60 transition-transform",
              open && "rotate-180",
            )}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-serif text-[17px] font-medium text-ink">
              {type.label || "Без названия"}
            </span>
            <span className="block truncate text-[13px] text-ink-soft">
              от {formatRUB(type.perGuest)}
              {type.priceUnit ?? "/чел"} · {type.packages.length}{" "}
              {plural(type.packages.length, "пакет", "пакета", "пакетов")} ·{" "}
              {dishes} {plural(dishes, "блюдо", "блюда", "блюд")}
            </span>
          </span>
          {minOrder > 0 ? (
            <Badge
              variant="outline"
              className="hidden shrink-0 border-gold/40 bg-gold/10 text-[11px] font-medium text-ink sm:inline-flex"
            >
              мин. заказ {formatRUB(minOrder)}
            </Badge>
          ) : null}
        </button>
        <MoveButtons
          label={`Формат «${type.label}»`}
          onUp={() => onMove(-1)}
          onDown={() => onMove(1)}
          upDisabled={index === 0}
          downDisabled={index === total - 1}
        />
        <DeleteButton label={`Удалить формат «${type.label}»`} onClick={onRemove} />
      </div>

      {open ? (
        <CardContent className="border-t border-border-line/70 pt-5 pb-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor={`mt-${index}-label`}>Название</FieldLabel>
              <TextField
                id={`mt-${index}-label`}
                value={type.label}
                onChange={(v) => onChange({ label: v })}
                placeholder="Фуршет"
              />
            </div>
            <div>
              <FieldLabel
                htmlFor={`mt-${index}-short`}
                hint="подпись в каталоге"
              >
                Короткое описание
              </FieldLabel>
              <TextField
                id={`mt-${index}-short`}
                value={type.short}
                onChange={(v) => onChange({ short: v })}
                placeholder="Канапе и брускетты"
              />
            </div>
          </div>

          <div className="mt-4">
            <FieldLabel htmlFor={`mt-${index}-desc`}>Описание</FieldLabel>
            <TextAreaField
              id={`mt-${index}-desc`}
              value={type.description}
              onChange={(v) => onChange({ description: v })}
              placeholder="Для каких событий подходит формат…"
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <FieldLabel htmlFor={`mt-${index}-pg`}>Цена «от»</FieldLabel>
              <NumberField
                id={`mt-${index}-pg`}
                value={type.perGuest}
                onChange={(v) => onChange({ perGuest: v })}
                suffix="₽"
              />
              <HintText>Показывается в каталоге «от … ₽/чел».</HintText>
            </div>
            <div>
              <FieldLabel
                htmlFor={`mt-${index}-calc`}
                hint="если отличается"
              >
                Цена калькулятора
              </FieldLabel>
              <NumberField
                id={`mt-${index}-calc`}
                value={type.calcPerGuest}
                onChange={(v) => onChange({ calcPerGuest: v })}
                onClear={() =>
                  onChange({ calcPerGuest: undefined } as Partial<MenuType>)
                }
                suffix="₽"
                placeholder="как в каталоге"
              />
              <HintText>Единая цена калькулятора, если отличается.</HintText>
            </div>
            <div>
              <FieldLabel htmlFor={`mt-${index}-mg`}>Мин. гостей</FieldLabel>
              <NumberField
                id={`mt-${index}-mg`}
                value={type.minGuests}
                onChange={(v) => onChange({ minGuests: v })}
                suffix="чел"
              />
            </div>
            <div>
              <FieldLabel
                htmlFor={`mt-${index}-unit`}
                hint="«/чел» или «за набор»"
              >
                Единица цены
              </FieldLabel>
              <TextField
                id={`mt-${index}-unit`}
                value={type.priceUnit ?? ""}
                onChange={(v) => onChange({ priceUnit: v || undefined })}
                placeholder="/чел"
              />
            </div>
          </div>

          <div className="mt-5">
            <FieldLabel>Что входит во все пакеты</FieldLabel>
            <StringListEditor
              items={type.included}
              onChange={(included) => onChange({ included })}
              itemLabel="пункт «что входит»"
              addLabel="добавить пункт"
              placeholder="Официанты, посуда, доставка…"
            />
          </div>

          <div className="mt-6">
            <PackagesEditor type={type} onChange={onChange} />
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

/* ------------------------------------------------------------ packages ed */

function PackagesEditor({
  type,
  onChange,
}: {
  type: MenuType;
  onChange: (patch: Partial<MenuType>) => void;
}) {
  const [active, setActive] = useState(String(0));

  useEffect(() => {
    // удаление активной вкладки — переключаемся на первую
    if (Number(active) >= type.packages.length) setActive("0");
  }, [type.packages.length, active]);

  const updatePackage = (pi: number, patch: Partial<MenuPackage>) =>
    onChange({
      packages: type.packages.map((p, i) => (i === pi ? { ...p, ...patch } : p)),
    });

  const addPackage = () => {
    if (type.packages.length >= 6) return;
    const np: MenuPackage = {
      name: `Пакет ${type.packages.length + 1}`,
      pricePerGuest: type.perGuest,
      description: "Состав пакета",
      dishes: [{ name: "Название блюда", weight: "50 г" }],
    };
    onChange({ packages: [...type.packages, np] });
    setActive(String(type.packages.length));
  };

  /** c96: дубликат пакета — вставка после оригинала, лимит 6 соблюдаем. */
  const duplicatePackage = (pi: number) => {
    if (type.packages.length >= 6) return;
    const src = type.packages[pi];
    const copy: MenuPackage = {
      ...structuredClone(src),
      name: `${src.name || "Пакет"} (копия)`,
    };
    const packages = type.packages.slice();
    packages.splice(pi + 1, 0, copy);
    onChange({ packages });
    setActive(String(pi + 1));
  };

  const removePackage = (pi: number) =>
    onChange({ packages: type.packages.filter((_, i) => i !== pi) });

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-ink">Пакеты</h3>
        <span className="text-xs text-ink-soft/80">
          1–6 пакетов · цена за гостя
        </span>
      </div>
      <Tabs value={active} onValueChange={setActive}>
        <div className="flex flex-wrap items-center gap-2">
          <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-xl bg-accent/50 p-1">
            {type.packages.map((p, i) => (
              <TabsTrigger
                key={i}
                value={String(i)}
                className="h-9 min-w-11 rounded-lg px-3 text-[13px] data-[state=active]:bg-background"
              >
                {p.name || `Пакет ${i + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-11 rounded-xl px-3 text-[13px]"
            disabled={type.packages.length >= 6}
            onClick={addPackage}
          >
            <Plus className="size-4" /> Пакет
          </Button>
        </div>
        {type.packages.map((p, pi) => (
          <TabsContent key={pi} value={String(pi)} className="mt-3">
            <PackageEditor
              pkg={p}
              onChange={(patch) => updatePackage(pi, patch)}
              onRemove={type.packages.length > 1 ? () => removePackage(pi) : undefined}
              onDuplicate={() => duplicatePackage(pi)}
              duplicateDisabled={type.packages.length >= 6}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

/** Числовой формат без валюты (для граммов). */
function formatNum(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}

/** Суммарный вес порций на гостя: складываем числа с «г» в поле weight. */
function packageWeightGrams(pkg: MenuPackage): number {
  let total = 0;
  for (const d of pkg.dishes) {
    const m = (d.weight ?? "").match(/(\d+(?:[.,]\d+)?)/);
    if (m && /[гg]/i.test(d.weight ?? "")) {
      const v = Number(m[1].replace(",", "."));
      if (Number.isFinite(v)) total += v;
    }
  }
  return Math.round(total);
}

function PackageEditor({
  pkg,
  onChange,
  onRemove,
  onDuplicate,
  duplicateDisabled,
}: {
  pkg: MenuPackage;
  onChange: (patch: Partial<MenuPackage>) => void;
  onRemove?: () => void;
  onDuplicate: () => void;
  duplicateDisabled?: boolean;
}) {
  const [galleryOpen, setGalleryOpen] = useState(false);

  const setDish = (di: number, patch: Partial<{ name: string; weight: string }>) =>
    onChange({ dishes: pkg.dishes.map((d, i) => (i === di ? { ...d, ...patch } : d)) });

  const moveDish = (di: number, dir: -1 | 1) => {
    const dj = di + dir;
    if (dj < 0 || dj >= pkg.dishes.length) return;
    const dishes = pkg.dishes.slice();
    [dishes[di], dishes[dj]] = [dishes[dj], dishes[di]];
    onChange({ dishes });
  };

  /** c96: дубликат блюда — вставка сразу после оригинала. */
  const duplicateDish = (di: number) => {
    if (pkg.dishes.length >= 60) return;
    const dishes = pkg.dishes.slice();
    dishes.splice(di + 1, 0, { ...dishes[di] });
    onChange({ dishes });
  };

  const grams = packageWeightGrams(pkg);

  return (
    <div className="rounded-2xl border border-border-line/70 bg-parchment/40 p-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <div>
          <FieldLabel>Название пакета</FieldLabel>
          <TextField
            value={pkg.name}
            onChange={(v) => onChange({ name: v })}
            placeholder="Стандарт"
          />
        </div>
        <div>
          <FieldLabel>Цена за гостя</FieldLabel>
          <NumberField
            value={pkg.pricePerGuest}
            onChange={(pricePerGuest) => onChange({ pricePerGuest })}
            suffix="₽"
          />
        </div>
      </div>
      <div className="mt-4">
        <FieldLabel>Описание пакета</FieldLabel>
        <TextAreaField
          value={pkg.description}
          onChange={(v) => onChange({ description: v })}
          rows={2}
        />
      </div>

      <div className="mt-4">
        <FieldLabel hint="фото блюда/сетки">Фото пакета</FieldLabel>
        <div className="flex flex-wrap items-start gap-3">
          {pkg.photo ? (
            <div className="relative">
              <img
                src={pkg.photo}
                alt=""
                className="size-20 rounded-xl border border-border-line object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute -top-2 -right-2 size-8 rounded-full shadow-sm"
                onClick={() => onChange({ photo: undefined })}
                aria-label="Убрать фото"
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex size-20 items-center justify-center rounded-xl border border-dashed border-border-line bg-background/60 text-ink-soft/50">
              <ImageIcon className="size-6" />
            </div>
          )}
          <div className="flex min-w-56 flex-1 flex-col gap-2">
            <TextField
              value={pkg.photo ?? ""}
              onChange={(v) => onChange({ photo: v || undefined })}
              placeholder="/media/foto.webp"
            />
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl text-[14px]"
              onClick={() => setGalleryOpen(true)}
            >
              <Search className="size-4" /> Выбрать из галереи
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <FieldLabel>Блюда</FieldLabel>
          <span className="text-xs text-ink-soft/80">
            {pkg.dishes.length}/60
            {grams > 0
              ? ` · ~${formatNum(grams)} г на гостя`
              : " · вес указывайте в конце названия («35 г»)"}
          </span>
        </div>
        <div className="space-y-2">
          {pkg.dishes.map((d, di) => (
            <div
              key={di}
              className="flex flex-wrap items-center gap-1 sm:flex-nowrap"
            >
              <Input
                type="text"
                value={d.name}
                placeholder="Название блюда"
                aria-label={`Блюдо ${di + 1}`}
                onChange={(e) => setDish(di, { name: e.target.value })}
                className="h-11 min-w-0 flex-1 rounded-xl text-[15px]"
              />
              <Input
                type="text"
                value={d.weight ?? ""}
                placeholder="35 г"
                aria-label={`Вес блюда ${di + 1}`}
                onChange={(e) => setDish(di, { weight: e.target.value })}
                className="h-11 w-full rounded-xl text-[15px] sm:w-24"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 rounded-xl text-ink-soft hover:bg-accent"
                onClick={() => duplicateDish(di)}
                disabled={pkg.dishes.length >= 60}
                aria-label={`Дублировать блюдо ${di + 1}`}
                title="Дублировать блюдо"
              >
                <Copy className="size-4" />
              </Button>
              <MoveButtons
                label={`Блюдо ${di + 1}`}
                onUp={() => moveDish(di, -1)}
                onDown={() => moveDish(di, 1)}
                upDisabled={di === 0}
                downDisabled={di === pkg.dishes.length - 1}
              />
              <DeleteButton
                label={`Удалить блюдо ${di + 1}`}
                onClick={() =>
                  onChange({ dishes: pkg.dishes.filter((_, i) => i !== di) })
                }
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-2 h-11 w-full rounded-xl border-dashed text-[14px]"
          disabled={pkg.dishes.length >= 60}
          onClick={() =>
            onChange({ dishes: [...pkg.dishes, { name: "", weight: "" }] })
          }
        >
          <Plus className="size-4" /> Добавить блюдо
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {onRemove ? (
          <Button
            type="button"
            variant="ghost"
            className="h-11 flex-1 rounded-xl text-[14px] text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onRemove}
          >
            Удалить пакет
          </Button>
        ) : (
          <p className="flex-1 text-center text-xs text-ink-soft/70">
            У формата должен остаться хотя бы один пакет
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl text-[14px]"
          disabled={duplicateDisabled}
          onClick={onDuplicate}
        >
          <Copy className="size-4" /> Дублировать пакет
        </Button>
      </div>

      <MediaPickerDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        current={pkg.photo}
        onSelect={(photo) => onChange({ photo })}
      />
    </div>
  );
}

/* --------------------------------------------------- c96: массовые цены */

/**
 * Диалог массового изменения цен: «все форматы или один» ± % с округлением.
 * Превью показывает старую → новую цену каждой позиции до применения.
 * Ограничения zod-гейта соблюдаются: цены 100..100000, целые.
 */
function BulkPriceDialog({
  open,
  onOpenChange,
  menu,
  update,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  menu: MenuData;
  update: UpdateMenu;
}) {
  const [scope, setScope] = useState<string>("all");
  const [percent, setPercent] = useState(10);
  const [roundTo, setRoundTo] = useState(10);

  useEffect(() => {
    if (open) {
      setScope("all");
      setPercent(10);
      setRoundTo(10);
    }
  }, [open]);

  /* c96: расчёт лёгкий (десятки строк), мемоизация не нужна.
   * c96-CRIT-A: превью и применение считают ОДИНАКОВО — с клампом zod
   * (100..100 000), чтобы «что показали» == «что применилось». */
  const clampPrice = (v: number) => Math.min(100000, Math.max(100, Math.round(v)));
  const applyRound = (v: number) => {
    const step = roundTo > 0 ? roundTo : 1;
    return clampPrice(Math.max(step, Math.round(v / step) * step));
  };

  const targets: { label: string; from: number; to: number }[] = [];
  {
    const types =
      scope === "all" ? menu.menuTypes : menu.menuTypes.filter((_, i) => `t${i}` === scope);
    for (const t of types) {
      targets.push({
        label: `${t.label || "Без названия"} · «от»`,
        from: t.perGuest,
        to: applyRound(t.perGuest * (1 + percent / 100)),
      });
      if (typeof t.calcPerGuest === "number") {
        targets.push({
          label: `${t.label || "Без названия"} · калькулятор`,
          from: t.calcPerGuest,
          to: applyRound(t.calcPerGuest * (1 + percent / 100)),
        });
      }
      t.packages.forEach((p, pi) => {
        targets.push({
          label: `${t.label || "Формат"} · ${p.name || `Пакет ${pi + 1}`}`,
          from: p.pricePerGuest,
          to: applyRound(p.pricePerGuest * (1 + percent / 100)),
        });
      });
    }
  }

  const apply = () => {
    const idxs =
      scope === "all"
        ? menu.menuTypes.map((_, i) => i)
        : menu.menuTypes.map((_, i) => i).filter((i) => `t${i}` === scope);
    update((m) => {
      const menuTypes = m.menuTypes.map((t, i) => {
        if (!idxs.includes(i)) return t;
        const mul = (v: number) => clampPrice(applyRound(v * (1 + percent / 100)));
        return {
          ...t,
          perGuest: mul(t.perGuest),
          calcPerGuest: typeof t.calcPerGuest === "number" ? mul(t.calcPerGuest) : t.calcPerGuest,
          packages: t.packages.map((p) => ({ ...p, pricePerGuest: mul(p.pricePerGuest) })),
        };
      });
      return { ...m, menuTypes };
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border-line/70 px-5 pt-5 pb-4">
          <DialogTitle className="font-serif text-xl font-medium">
            Массовое изменение цен
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            Поднимите или опустите цены сразу по формату или всему меню —
            например, «+10% на всё» к новому сезону.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[55vh] space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <FieldLabel htmlFor="bulk-scope">Кого касается</FieldLabel>
            <select
              id="bulk-scope"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="h-11 w-full rounded-xl border border-border-line bg-background px-3 text-[15px]"
            >
              <option value="all">Все форматы (всё меню)</option>
              {menu.menuTypes.map((t, i) => (
                <option key={t.id} value={`t${i}`}>
                  {t.label || "Без названия"} (от {formatRUB(t.perGuest)})
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="bulk-percent">Изменение, %</FieldLabel>
              <NumberField
                id="bulk-percent"
                value={percent}
                onChange={setPercent}
                suffix="%"
              />
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[-15, -10, -5, 5, 10, 15].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPercent(p)}
                    className={cn(
                      "min-h-9 rounded-lg border px-2.5 text-[13px] transition-colors",
                      percent === p
                        ? "border-gold bg-gold/10 text-ink"
                        : "border-border-line text-ink-soft hover:border-gold/50",
                    )}
                  >
                    {p > 0 ? `+${p}` : p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="bulk-round">Округлять до</FieldLabel>
              <select
                id="bulk-round"
                value={roundTo}
                onChange={(e) => setRoundTo(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-border-line bg-background px-3 text-[15px]"
              >
                <option value={1}>без округления</option>
                <option value={10}>10 ₽</option>
                <option value={50}>50 ₽</option>
                <option value={100}>100 ₽</option>
              </select>
              <HintText>Красивые цены: 2 695 → 2 700 ₽.</HintText>
            </div>
          </div>

          <div>
            <FieldLabel>Предпросмотр</FieldLabel>
            <div className="max-h-52 overflow-y-auto rounded-xl border border-border-line/70 bg-parchment/40">
              <table className="w-full text-[13px]">
                <tbody>
                  {targets.map((t, i) => (
                    <tr key={i} className="border-b border-border-line/40 last:border-0">
                      <td className="px-3 py-2 text-ink-soft">{t.label}</td>
                      <td className="px-2 py-2 text-right whitespace-nowrap text-ink-soft/70">
                        {formatRUB(t.from)}
                      </td>
                      <td className="px-2 py-2 text-ink-soft/50">→</td>
                      <td className="px-3 py-2 text-right font-semibold whitespace-nowrap text-ink">
                        {formatRUB(t.to)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <HintText>
              Минимальные заказы и допуслуги не меняются — только цены за
              гостя. Кнопка «Опубликовать изменения» — как обычно, сверху.
            </HintText>
          </div>
        </div>
        <DialogFooter className="border-t border-border-line/70 px-5 py-4">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl text-[14px]"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              className="h-11 rounded-xl px-6 text-[14px]"
              onClick={apply}
              disabled={targets.length === 0}
            >
              Применить к {targets.length}{" "}
              {plural(targets.length, "цене", "ценам", "ценам")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------------------------------------- media picker */

let manifestCache: string[] | null = null;

function MediaPickerDialog({
  open,
  onOpenChange,
  current,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  current?: string;
  onSelect: (path: string) => void;
}) {
  const [files, setFiles] = useState<string[] | null>(manifestCache);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || files) return;
    let cancelled = false;
    fetch("/data/media-manifest.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { files?: string[] }) => {
        if (cancelled) return;
        manifestCache = Array.isArray(data.files) ? data.files : [];
        setFiles(manifestCache);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, files]);

  useEffect(() => {
    if (open) {
      setQuery("");
      const t = setTimeout(() => searchRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!files) return [];
    const q = query.trim().toLowerCase();
    if (!q) return files;
    /* c95-W2-F: имена файлов в /media — латиница (banket, furshet, svadby…),
     * а владелец ищет по-русски («банкет»). Транслитерируем запрос и ищем
     * оба варианта: «банкет» находит c60-banket-1.webp. */
    const translit = q.replace(/[а-яё]/g, (ch) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
        з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
        п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
        ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
        я: "ya",
      };
      return map[ch] ?? ch;
    });
    return files.filter(
      (f) => f.toLowerCase().includes(q) || f.toLowerCase().includes(translit),
    );
  }, [files, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-3xl">
        <DialogHeader className="space-y-1.5 border-b border-border-line/70 px-5 pt-5 pb-4">
          <DialogTitle className="font-serif text-xl font-medium">
            Галерея фото
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            Поиск по имени файла — нажмите на фото, чтобы выбрать
          </DialogDescription>
          <div className="relative pt-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft/60" />
            <Input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Например: buffet, box, dessert…"
              className="h-11 rounded-xl pl-9"
            />
          </div>
        </DialogHeader>
        <div className="max-h-[55vh] overflow-y-auto p-3">
          {error ? (
            <p className="p-6 text-center text-sm text-ink-soft">
              Галерея недоступна. Проверьте подключение и попробуйте ещё раз.
            </p>
          ) : !files ? (
            <div className="grid grid-cols-3 gap-2 p-1 sm:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-xl bg-accent"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-soft">
              Ничего не найдено
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {filtered.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    onSelect(f);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-xl border-2 transition-transform hover:scale-[1.03]",
                    current === f
                      ? "border-gold ring-2 ring-gold/40"
                      : "border-transparent",
                  )}
                  title={f}
                >
                  <img
                    src={f}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ plural */

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
