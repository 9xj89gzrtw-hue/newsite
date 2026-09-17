/**
 * menu-schema (c95 / Task 1-a) — контракт единого источника меню/цен
 * src/data/menu.json. Схема ШАРИТСЯ между админ-панелью (/admin — проверка
 * черновика до коммита) и сборочным гейтом (scripts/validate-menu.ts),
 * поэтому живёт в src/lib без клиентских/серверных зависимостей.
 *
 * Данные из этого JSON читают сайт, калькулятор и PDF (через lib/pricing.ts)
 * — одна точка правды, расхождения цен между блоками невозможны by design.
 */
import { z } from "zod";

/* ---------------------------------------------------------------- helpers */

const NonEmptyString = z
  .string()
  .min(1, "строка не может быть пустой");

const PositiveInt = z
  .number()
  .int("ожидалось целое число")
  .positive("ожидалось число больше нуля");

/** c95-W2-E MINOR-4: верхние границы цен/гостей — паритет с PHP-валидацией
 *  (иначе в чек уезжают 12-значные числа после опечатки в админке). */
const PriceInt = PositiveInt.max(1_000_000, "цена недопустимо велика (максимум 1 000 000)");
const GuestsInt = PositiveInt.max(10_000, "число гостей недопустимо велико (максимум 10 000)");

/* ----------------------------------------------------------------- shapes */

export const DishSchema = z.object({
  /** Название позиции меню (для каталога, калькулятора и PDF-сметы). */
  name: NonEmptyString.max(300, "название блюда длиннее 300 символов"),
  /** Граммовка/объём подачи («35 г» | «300 мл» | «1 шт»). */
  weight: NonEmptyString.optional(),
});

export const MenuPackageSchema = z.object({
  /** «Базовый» | «Стандарт» | «Премиум» (или название набора для snack-box). */
  name: NonEmptyString,
  pricePerGuest: PriceInt,
  description: NonEmptyString,
  /** Путь в /media (опционально — не у всех пакетов есть фото). */
  photo: NonEmptyString.optional(),
  dishes: z
    .array(DishSchema)
    .min(1, "в пакете должен быть хотя бы один dish")
    .max(60, "в пакете больше 60 dishes"),
});

export const MenuTypeSchema = z.object({
  id: NonEmptyString,
  label: NonEmptyString,
  short: NonEmptyString,
  /** Минимальная цена формата в каталоге. */
  perGuest: PriceInt,
  /** Единая цена формата в КАЛЬКУЛЯТОРЕ, если отличается от каталогной
   *  (доставка закусок: каталог — от 660 ₽ по пакетам, калькулятор —
   *  от 1 200 ₽/чел «всё включено»). */
  calcPerGuest: PriceInt.optional(),
  /** c86: ограничений по числу гостей нет — поле для совместимости (у
   *  всех типов единица, «могут заказать хоть от одного человека»). */
  minGuests: GuestsInt,
  /** "/чел" (по умолчанию) | "за набор". */
  priceUnit: NonEmptyString.optional(),
  description: NonEmptyString,
  /** Что входит во все пакеты формата (обслуживание, посуда, доставка…). */
  included: z.array(NonEmptyString),
  packages: z
    .array(MenuPackageSchema)
    .min(1, "у формата должен быть хотя бы один пакет")
    .max(6, "у формата больше 6 пакетов"),
});

export const AddonSchema = z
  .object({
    id: NonEmptyString,
    label: NonEmptyString,
    /** c94: фиксированная МИНИМАЛЬНАЯ цена — везде печатается с предлогом
     *  «от» (финальная зависит от события). */
    price: PositiveInt.optional(),
    /** c94: надбавка в ПРОЦЕНТАХ от подытога меню (аренда оборудования/
     *  мебели масштабируется с событием). */
    percent: z
      .number()
      .int("процент должен быть целым")
      .min(1, "процент должен быть не меньше 1")
      .max(200, "процент должен быть не больше 200")
      .optional(),
  })
  .refine(
    (a) => (a.price !== undefined) !== (a.percent !== undefined),
    { message: "у допуслуги должно быть РОВНО одно из полей price | percent" },
  );

export const ServicePanelSchema = z.object({
  /** id плитки главы «Каталог услуг» (hacc-services) — мэтчинг по id. */
  id: NonEmptyString,
  /** Заголовок плитки. */
  label: NonEmptyString,
  /** Цена плитки целиком («от 5 500 ₽», NBSP внутри). */
  priceLabel: NonEmptyString,
});

export const MenuDataSchema = z
  .object({
    /** Версия схемы — инкремент при несовместимых изменениях. */
    version: PositiveInt,
    menuTypes: z
      .array(MenuTypeSchema)
      .min(1, "нужен хотя бы один формат меню")
      .max(12, "форматов меню больше 12"),
    addons: z.array(AddonSchema),
    /** Минимальные суммы заказа по форматам — ключи = id форматов. */
    minOrder: z.record(z.string().min(1, "пустой ключ minOrder"), PositiveInt),
    servicePanels: z
      .array(ServicePanelSchema)
      .max(12, "плиток услуг (servicePanels) больше 12"),
  })
  .superRefine((data, ctx) => {
    /* id форматов — уникальны (калькулятор находит тип по id). */
    const ids = data.menuTypes.map((t) => t.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: "custom",
        message: "id форматов меню (menuTypes) должны быть уникальными",
        path: ["menuTypes"],
      });
    }
    /* minOrder ↔ menuTypes: точное соответствие в обе стороны —
       калькулятор клампит чек по MIN_ORDER[тип]. */
    const idSet = new Set(ids);
    for (const key of Object.keys(data.minOrder)) {
      if (!idSet.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: `в minOrder есть формат «${key}», отсутствующий в menuTypes`,
          path: ["minOrder", key],
        });
      }
    }
    for (const id of ids) {
      if (!(id in data.minOrder)) {
        ctx.addIssue({
          code: "custom",
          message: `формату «${id}» не задан минимальный заказ (minOrder)`,
          path: ["minOrder", id],
        });
      }
    }
    /* id плиток услуг — уникальны (цена подставляется по id). */
    const panelIds = data.servicePanels.map((p) => p.id);
    if (new Set(panelIds).size !== panelIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "id плиток услуг (servicePanels) должны быть уникальными",
        path: ["servicePanels"],
      });
    }
  });

export type MenuData = z.infer<typeof MenuDataSchema>;
export type Dish = z.infer<typeof DishSchema>;
export type MenuPackage = z.infer<typeof MenuPackageSchema>;
export type MenuType = z.infer<typeof MenuTypeSchema>;
export type Addon = z.infer<typeof AddonSchema>;
export type ServicePanel = z.infer<typeof ServicePanelSchema>;

/**
 * Валидация menu.json с человекочитаемыми ошибками (RU, максимум 20 строк).
 * Используется и админкой (пред-коммит проверка черновика), и сборочным
 * гейтом scripts/validate-menu.ts (билд падает до next build).
 */
export function validateMenuData(
  data: unknown,
): { ok: true; data: MenuData } | { ok: false; errors: string[] } {
  const result = MenuDataSchema.safeParse(data);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  const errors: string[] = [];
  for (const issue of result.error.issues) {
    if (errors.length >= 20) {
      errors.push("…и ещё ошибки (показаны первые 20)");
      break;
    }
    const path = issue.path.length > 0 ? issue.path.join(".") : "(корень)";
    errors.push(`${path}: ${issue.message}`);
  }
  return { ok: false, errors };
}
