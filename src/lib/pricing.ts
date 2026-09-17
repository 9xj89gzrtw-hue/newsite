/**
 * Menu packages — REAL data from interfood-catering.ru menu pages.
 * Each menu type has 2-3 packages (price tiers) with real dishes and weights.
 * "Включено" applies to all packages (service, tableware, floristics, delivery).
 *
 * c95 (Task 1-a): данные меню/цен переехали в src/data/menu.json — ЕДИНЫЙ
 * источник, который правится админ-панелью (/admin → api/admin.php → GitHub)
 * и читается сайтом, калькулятором и PDF. Этот файл — типизированная витрина
 * над JSON: MENU_TYPES / ADDONS / MIN_ORDER / SERVICE_PANELS ниже —
 * производные от menu.json. Порядок массивов = порядок в JSON: калькулятор
 * адресует пакеты индексом pkgIdx (порядок packages менять нельзя).
 * Контракт JSON — zod-схема src/lib/menu-schema.ts + сборочный гейт
 * scripts/validate-menu.ts.
 */
import menuData from "@/data/menu.json";

export type Dish = {
  name: string;
  weight?: string; // "35 г" | "150 г" | "300 мл"
};

export type MenuPackage = {
  name: string; // "Базовый" | "Стандарт" | "Премиум"
  pricePerGuest: number;
  description: string;
  dishes: Dish[];
  photo?: string;
};

export type MenuType = {
  id: string;
  label: string;
  short: string;
  perGuest: number; // min price
  // c89: единая цена формата в КАЛЬКУЛЯТОРЕ, если отличается от
  // каталогной (доставка закусок: каталог — от 660 ₽ по пакетам,
  // калькулятор — от 1 200 ₽/чел «всё включено»).
  calcPerGuest?: number;
  // c86: ограничений по числу гостей нет — поле остаётся для совместимости,
  // у всех типов единица (владелец: «могут заказать хоть от одного человека»)
  minGuests: number;
  priceUnit?: string; // "/чел" (default) | "за набор"
  description: string;
  packages: MenuPackage[];
  included: string[]; // what's included in all packages
};

export type Addon = {
  id: string;
  label: string;
  /** c94: фиксированная МИНИМАЛЬНАЯ цена — везде печатается с предлогом
   *  «от» (финальная зависит от события: шеф-повар/бар/шоу-станция/
   *  флористика — от состава и площадки). */
  price?: number;
  /** c94 (заказчик): надбавка в ПРОЦЕНТАХ от подытога меню — аренда
   *  оборудования/мебели масштабируется с событием (недочёт «фуршет на
   *  200 человек, а мебели на 15 000 ₽»). База — только меню
   *  (гости × цена/чел): без других допуслуг и без клампа MIN_ORDER —
   *  прогноз предсказуем и растёт ровно с числом гостей. */
  percent?: number;
};

/** c95: плитка услуги главы «Каталог услуг» (hacc-services) — цена берётся
 *  из menu.json по id плитки (компонент больше не хардкодит строки цен). */
export type ServicePanel = {
  id: string;
  /** Заголовок плитки («Свадьбы», «Корпоратив», …). */
  label: string;
  /** Цена плитки целиком: «от 5 500 ₽» (разделители тысяч — NBSP). */
  priceLabel: string;
};

/** c95: форматы меню из src/data/menu.json (порядок = порядок JSON —
 *  pkgIdx калькулятора адресует packages по индексу). */
export const MENU_TYPES = menuData.menuTypes as MenuType[];

/** c95: допуслуги из menu.json — equipment/furniture процентом от подытога
 *  меню, chef/show/bar/floristics фикс-минимумом «от» (см. addonAmount). */
export const ADDONS = menuData.addons as Addon[];

/**
 * c89: минимальные суммы заказа по форматам (владелец):
 * фуршет/банкет/вегетарианское/барбекю — 85 000 ₽, кофе-брейк — 50 000 ₽,
 * доставка закусок — 17 400 ₽ (заказ минимум за 48 часов). В калькуляторе
 * чек не может опуститься ниже минимума формата (см. calcTotal).
 */
export const MIN_ORDER = menuData.minOrder as Record<string, number>;

/** c95: цены плиток «Каталога услуг» — из menu.json (servicePanels),
 *  мэтчинг по id плитки; единая точка правды с калькулятором и каталогом. */
export const SERVICE_PANELS = menuData.servicePanels as ServicePanel[];

/** c94: сумма допуслуги для текущего подытога меню. Процентные (аренда)
 *  считаются от подытога и растут вместе с событием, фиксированные — их
 *  минимум «от». ЕДИНАЯ точка правды для карточек, чека, лида и calcTotal
 *  (split-brain цен запрещён — урок c89 W1). */
export function addonAmount(a: Addon, menuSubtotal: number): number {
  return a.percent != null
    ? Math.round((menuSubtotal * a.percent) / 100)
    : (a.price ?? 0);
}

/** c94: допуслуга одной строкой для лида/сводки шага 2 —
 *  «Аренда мебели (+20% ≈ 88 000 ₽)» / «Выезд шеф-повара (от 28 000 ₽)»:
 *  менеджер видит базу расчёта, а не голый список названий. */
export function addonNote(a: Addon, menuSubtotal: number): string {
  return a.percent != null
    ? `${a.label} (+${a.percent}% ≈ ${formatRUB(addonAmount(a, menuSubtotal))})`
    : `${a.label} (от ${formatRUB(a.price ?? 0)})`;
}

/**
 * c89: сезонный коэффициент ×1,15 УДАЛЁН по указанию владельца
 * («Сезонный коэффициент вообще убрать»). seasonMultiplier оставлен как
 * no-op-заглушка, чтобы старые импорты не роняли сборку; calcTotal всегда
 * считает без надбавки.
 */
export function seasonMultiplier(_dateStr: string): number {
  return 1;
}

/**
 * c84-B (задача 1): pkgIdx — 0-based индекс пакета в packages выбранного
 * типа. Опционален: без него (все прежние вызовы) = min-пакет (packages[0]
 * == t.perGuest во всех данных). Индекс клампится в валидный диапазон —
 * URL-мусор (?pkg=-3, ?pkg=99) не роняет расчёт. perGuest в ответе — цена
 * ВЫБРАННОГО пакета (чек/строка «N гостей × X ₽» печатает её же);
 * pkgName — для чека и текста лида (null быть не может — packages всегда
 * непустые, но тип поля честный optional для будущих типов без пакетов).
 * c89: для snack-box калькулятор игнорирует пакеты (единая цена
 * t.calcPerGuest) и применяет MIN_ORDER — total не ниже минимума формата,
 * ниже минимума чек печатает строку «Минимальный заказ» с недостающей
 * суммой (доставка закусок — честный «докрут» до 17 400 ₽).
 */
export function calcTotal(
  typeId: string,
  guests: number,
  addonIds: string[],
  dateStr: string,
  pkgIdx = 0,
): {
  perGuest: number;
  subtotal: number;
  addonsTotal: number;
  season: number;
  total: number;
  pkgName?: string;
  minOrder: number;
  belowMinBy: number;
} {
  const t = MENU_TYPES.find((m) => m.id === typeId) ?? MENU_TYPES[0];
  /* c86: минимумов гостей больше нет — расчёт от фактического числа
     (защита только от мусора: как минимум один гость, максимум —
     верхняя граница шкалы ×2). */
  const g = Math.min(999, Math.max(1, Math.trunc(guests)));
  /* c89: snack-box в калькуляторе — без выбора пакета, единая цена. */
  const flat = t.calcPerGuest != null;
  const clampedIdx = Math.max(0, Math.min(Math.trunc(pkgIdx), t.packages.length - 1));
  const pkg = flat ? undefined : t.packages[clampedIdx];
  const perGuest = flat ? (t.calcPerGuest as number) : pkg ? pkg.pricePerGuest : t.perGuest;
  const subtotal = perGuest * g;
  /* c94: аренда — процент от подытога меню (addonAmount), фикс-услуги —
     минимум «от»; итог по-прежнему клампится снизу MIN_ORDER. */
  const addonsTotal = ADDONS.filter((a) => addonIds.includes(a.id)).reduce(
    (s, a) => s + addonAmount(a, subtotal),
    0,
  );
  const season = seasonMultiplier(dateStr);
  const raw = subtotal + addonsTotal;
  /* c89: минимальный заказ формата — чек не ниже минимума (доставка
     закусок 17 400 ₽; банкетные форматы 85 000 ₽; кофе-брейк 50 000 ₽). */
  const minOrder = MIN_ORDER[t.id] ?? 0;
  const total = Math.max(Math.round(raw), minOrder);
  const belowMinBy = raw < minOrder ? minOrder - Math.round(raw) : 0;
  return {
    perGuest,
    subtotal,
    addonsTotal,
    season,
    total,
    pkgName: pkg?.name,
    minOrder,
    belowMinBy,
  };
}

export function formatRUB(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * c95 (Task 1-a): ценовые фрагменты для меты layout.tsx — «от 1 200 ₽ /
 * 900 ₽ / 2 450 ₽ / 4 470 ₽» в description и JSON-LD собираются из menu.json
 * (те же поля, что печатает калькулятор: snack-box — calcPerGuest,
 * остальные — perGuest). НЕ formatRUB: историческая мета набрана
 * ОБЫЧНЫМИ пробелами (не NBSP) — байт-идентичный вывод обязательный
 * гейт этой задачи. Источник значений — ЕДИНЫЙ menu.json.
 */
export function metaPriceFragments(): {
  snackBox: string;
  coffeeBreak: string;
  buffet: string;
  banquet: string;
} {
  /* Обычный пробел как разделитель тысяч (не NBSP от Intl) — см. докблок. */
  const fmt = (n: number): string =>
    n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const byId = (id: string): MenuType => {
    const t = MENU_TYPES.find((m) => m.id === id);
    if (!t) {
      throw new Error(`metaPriceFragments: формат «${id}» не найден в menu.json`);
    }
    return t;
  };
  const snackBox = byId("snack-box");
  return {
    snackBox: fmt(snackBox.calcPerGuest ?? snackBox.perGuest),
    coffeeBreak: fmt(byId("coffee-break").perGuest),
    buffet: fmt(byId("buffet").perGuest),
    banquet: fmt(byId("banquet").perGuest),
  };
}
