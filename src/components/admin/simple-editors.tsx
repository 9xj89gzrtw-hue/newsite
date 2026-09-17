/**
 * c95 (Task 1-b) — компактные разделы редактора:
 *  - «Допуслуги» (2): фиксированная цена XOR процент от сметы;
 *  - «Минимальные заказы» (3): по текущим форматам меню;
 *  - «Цены на плитках услуг» (4): label + priceLabel (свободный текст).
 */
"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { formatRUB } from "@/lib/pricing";
import type { Addon, MenuData, ServicePanel } from "@/lib/menu-schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DeleteButton,
  FieldLabel,
  HintText,
  MoveButtons,
  NumberField,
  SectionHeader,
  TextField,
} from "./ui-bits";
import type { UpdateMenu } from "./menu-editor";
import { plural } from "./menu-editor";

/* ---------------------------------------------------------------- addons */

const MAX_ADDONS = 20;

export function AddonsEditor({ menu, update }: { menu: MenuData; update: UpdateMenu }) {
  const setAddon = (i: number, patch: Partial<Addon>) =>
    update((m) => ({
      ...m,
      addons: m.addons.map((a, j) => (j === i ? { ...a, ...patch } : a)),
    }));

  const moveAddon = (i: number, dir: -1 | 1) =>
    update((m) => {
      const j = i + dir;
      if (j < 0 || j >= m.addons.length) return m;
      const addons = m.addons.slice();
      [addons[i], addons[j]] = [addons[j], addons[i]];
      return { ...m, addons };
    });

  const addAddon = () =>
    update((m) =>
      m.addons.length >= MAX_ADDONS
        ? m
        : {
            ...m,
            addons: [
              ...m.addons,
              { id: `addon-${Date.now().toString(36)}`, label: "Новая допуслуга", price: 5000 },
            ],
          },
    );

  return (
    <section>
      <SectionHeader
        title="Допуслуги"
        description="Аренда оборудования, мебели, выезд шефа — всё, что добавляется к смете в калькуляторе."
      />
      <Card className="rounded-2xl border-border-line/80 shadow-none">
        <CardContent className="divide-y divide-border-line/60 p-0">
          {menu.addons.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-soft">
              Допуслуг нет — смета будет состоять только из меню.
            </p>
          ) : (
            menu.addons.map((a, i) => (
              <div key={a.id + i} data-addon-idx={i} className="flex flex-wrap items-end gap-3 p-4">
                <div className="min-w-40 flex-1">
                  <FieldLabel htmlFor={`addon-${i}-label`}>Название</FieldLabel>
                  <TextField
                    id={`addon-${i}-label`}
                    value={a.label}
                    onChange={(v) => setAddon(i, { label: v })}
                    placeholder="Аренда оборудования"
                  />
                </div>
                <div>
                  <FieldLabel>Тип цены</FieldLabel>
                  <div
                    className="flex overflow-hidden rounded-xl border border-border-line bg-background"
                    role="group"
                    aria-label="Тип цены допуслуги"
                  >
                    <button
                      type="button"
                      className={cn(
                        "h-11 px-4 text-[14px] font-medium transition-colors",
                        a.price !== undefined
                          ? "bg-gold text-white"
                          : "text-ink-soft hover:bg-accent",
                      )}
                      aria-pressed={a.price !== undefined}
                      onClick={() =>
                        setAddon(i, {
                          price: a.price ?? Math.round((a.percent ?? 10) * 1000),
                          percent: undefined,
                        })
                      }
                    >
                      Фикс. цена
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "h-11 px-4 text-[14px] font-medium transition-colors",
                        a.percent !== undefined
                          ? "bg-gold text-white"
                          : "text-ink-soft hover:bg-accent",
                      )}
                      aria-pressed={a.percent !== undefined}
                      onClick={() =>
                        setAddon(i, {
                          percent: a.percent ?? 10,
                          price: undefined,
                        })
                      }
                    >
                      % от сметы
                    </button>
                  </div>
                </div>
                <div className="w-32">
                  <FieldLabel htmlFor={`addon-${i}-value`}>
                    {a.percent !== undefined ? "Процент" : "Цена «от»"}
                  </FieldLabel>
                  {a.percent !== undefined ? (
                    <NumberField
                      id={`addon-${i}-value`}
                      value={a.percent}
                      onChange={(percent) => setAddon(i, { percent })}
                      onClear={() => setAddon(i, { percent: 1 })}
                      suffix="%"
                    />
                  ) : (
                    <NumberField
                      id={`addon-${i}-value`}
                      value={a.price}
                      onChange={(price) => setAddon(i, { price })}
                      suffix="₽"
                    />
                  )}
                </div>
                <div className="flex items-center gap-1 pb-0.5">
                  <MoveButtons
                    label={`Допуслуга «${a.label}»`}
                    onUp={() => moveAddon(i, -1)}
                    onDown={() => moveAddon(i, 1)}
                    upDisabled={i === 0}
                    downDisabled={i === menu.addons.length - 1}
                  />
                  <DeleteButton
                    label={`Удалить «${a.label}»`}
                    onClick={() =>
                      update((m) => ({
                        ...m,
                        addons: m.addons.filter((_, j) => j !== i),
                      }))
                    }
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      <Button
        type="button"
        variant="outline"
        className="mt-4 h-12 w-full rounded-xl border-dashed text-[15px]"
        disabled={menu.addons.length >= MAX_ADDONS}
        onClick={addAddon}
      >
        <Plus className="size-4" /> Добавить допуслугу
        {menu.addons.length >= MAX_ADDONS ? ` (максимум ${MAX_ADDONS})` : ""}
      </Button>
      <HintText>
        Процент считается от подытога меню и растёт с числом гостей — так
        стоимость аренды масштабируется с событием. Фиксированная цена везде
        печатается с предлогом «от».
      </HintText>
    </section>
  );
}

/* -------------------------------------------------------------- min order */

export function MinOrderEditor({ menu, update }: { menu: MenuData; update: UpdateMenu }) {
  return (
    <section>
      <SectionHeader
        title="Минимальные заказы"
        description="Смета в калькуляторе не может быть меньше этой суммы для выбранного формата."
      />
      <Card className="rounded-2xl border-border-line/80 shadow-none">
        <CardContent className="divide-y divide-border-line/60 p-0">
          {menu.menuTypes.map((t) => (
            <div
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink">{t.label}</p>
                <p className="text-xs text-ink-soft/80">
                  id: {t.id} · {t.packages.length}{" "}
                  {plural(t.packages.length, "пакет", "пакета", "пакетов")}
                </p>
              </div>
              <div className="w-44">
                <NumberField
                  value={menu.minOrder[t.id] ?? 0}
                  onChange={(v) =>
                    update((m) => ({
                      ...m,
                      minOrder: { ...m.minOrder, [t.id]: v },
                    }))
                  }
                  suffix="₽"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <HintText>
        Форматы берутся из раздела «Меню и цены» — новый формат появится здесь
        автоматически.
      </HintText>
    </section>
  );
}

/* --------------------------------------------------------- service panels */

const MAX_PANELS = 12;
const RUB = "\u00A0₽"; // неразрывный пробел + рубль

export function ServicePanelsEditor({ menu, update }: { menu: MenuData; update: UpdateMenu }) {
  const labelRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setPanel = (i: number, patch: Partial<ServicePanel>) =>
    update((m) => ({
      ...m,
      servicePanels: m.servicePanels.map((p, j) =>
        j === i ? { ...p, ...patch } : p,
      ),
    }));

  const insertRub = (i: number) => {
    const el = labelRefs.current[i];
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const value = el.value.slice(0, start) + RUB + el.value.slice(end);
    setPanel(i, { priceLabel: value });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + RUB.length, start + RUB.length);
    });
  };

  return (
    <section>
      <SectionHeader
        title="Цены на плитках услуг"
        description="Каталог услуг на главной («Свадьбы», «Корпоративы»…): заголовок и цена плитки."
      />
      <Card className="rounded-2xl border-border-line/80 shadow-none">
        <CardContent className="divide-y divide-border-line/60 p-0">
          {menu.servicePanels.map((p, i) => (
            <div key={p.id + i} data-panel-idx={i} className="flex flex-wrap items-end gap-3 p-4">
              <div className="min-w-40 flex-1">
                <FieldLabel htmlFor={`panel-${i}-label`}>Заголовок</FieldLabel>
                <TextField
                  id={`panel-${i}-label`}
                  value={p.label}
                  onChange={(v) => setPanel(i, { label: v })}
                  placeholder="Свадьбы"
                />
              </div>
              <div className="min-w-44 flex-1">
                <FieldLabel
                  htmlFor={`panel-${i}-price`}
                  hint="формат «от 5 500 ₽»"
                >
                  Цена (текст)
                </FieldLabel>
                <div className="flex gap-2">
                  <Input
                    ref={(el) => {
                      labelRefs.current[i] = el;
                    }}
                    id={`panel-${i}-price`}
                    type="text"
                    value={p.priceLabel}
                    placeholder="от 5 500 ₽"
                    className="h-11 rounded-xl text-[15px]"
                    onChange={(e) => setPanel(i, { priceLabel: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 shrink-0 rounded-xl px-3 text-[13px] tabular-nums"
                    onClick={() => insertRub(i)}
                    title="Вставить неразрывный пробел и ₽ в позицию курсора"
                  >
                    ₽&nbsp;␣
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-1 pb-0.5">
                <MoveButtons
                  label={`Плитка «${p.label}»`}
                  onUp={() =>
                    update((m) => {
                      const j = i - 1;
                      if (j < 0) return m;
                      const servicePanels = m.servicePanels.slice();
                      [servicePanels[i], servicePanels[j]] = [
                        servicePanels[j],
                        servicePanels[i],
                      ];
                      return { ...m, servicePanels };
                    })
                  }
                  onDown={() =>
                    update((m) => {
                      const j = i + 1;
                      if (j >= m.servicePanels.length) return m;
                      const servicePanels = m.servicePanels.slice();
                      [servicePanels[i], servicePanels[j]] = [
                        servicePanels[j],
                        servicePanels[i],
                      ];
                      return { ...m, servicePanels };
                    })
                  }
                  upDisabled={i === 0}
                  downDisabled={i === menu.servicePanels.length - 1}
                />
                <DeleteButton
                  label={`Удалить плитку «${p.label}»`}
                  onClick={() =>
                    update((m) => ({
                      ...m,
                      servicePanels: m.servicePanels.filter((_, j) => j !== i),
                    }))
                  }
                />
              </div>
            </div>
          ))}
          {menu.servicePanels.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-soft">
              Плиток нет — цены в «Каталоге услуг» на главной не подставятся.
            </p>
          ) : null}
        </CardContent>
      </Card>
      <Button
        type="button"
        variant="outline"
        className="mt-4 h-12 w-full rounded-xl border-dashed text-[15px]"
        disabled={menu.servicePanels.length >= MAX_PANELS}
        onClick={() =>
          update((m) =>
            m.servicePanels.length >= MAX_PANELS
              ? m
              : {
                  ...m,
                  servicePanels: [
                    ...m.servicePanels,
                    {
                      id: `panel-${Date.now().toString(36)}`,
                      label: "Новая услуга",
                      priceLabel: "от 5 500\u00A0₽",
                    },
                  ],
                },
          )
        }
      >
        <Plus className="size-4" /> Добавить плитку
        {menu.servicePanels.length >= MAX_PANELS ? ` (максимум ${MAX_PANELS})` : ""}
      </Button>
      <HintText>
        Кнопка «₽␣» вставляет рубль с неразрывным пробелом — цена не разрывается
        при переносе строки. <Badge variant="outline" className="mx-0.5 align-baseline">от 5&thinsp;500&nbsp;₽</Badge>
        — так это выглядит на сайте.
      </HintText>
    </section>
  );
}
