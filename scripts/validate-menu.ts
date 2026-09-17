/**
 * c95 (Task 1-a) — сборочный гейт единого источника меню/цен.
 * Запуск: `bun scripts/validate-menu.ts` (в npm-скрипте build — ДО next
 * build, чтобы битый menu.json не уезжал в статику; тот же контракт
 * использует админ-панель /admin перед коммитом в GitHub).
 *
 * Проверяет src/data/menu.json zod-схемой src/lib/menu-schema.ts + два
 * прямых sanity-чека (дубли в minOrder и длина названий блюд). Ошибки
 * печатаются на русском, код выхода 1 останавливает сборку.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateMenuData } from "../src/lib/menu-schema";

const menuPath = resolve(import.meta.dir, "../src/data/menu.json");

let raw: string;
try {
  raw = readFileSync(menuPath, "utf8");
} catch {
  console.error(`✗ Не найден ${menuPath} — файл единого источника меню/цен обязателен для сборки.`);
  process.exit(1);
}

let parsed: unknown;
try {
  parsed = JSON.parse(raw);
} catch (e) {
  console.error(`✗ ${menuPath} не парсится как JSON: ${(e as Error).message}`);
  process.exit(1);
}

const result = validateMenuData(parsed);
if (!result.ok) {
  console.error(`✗ menu.json не прошёл валидацию (${result.errors.length}):`);
  for (const line of result.errors) {
    console.error(`  • ${line}`);
  }
  process.exit(1);
}

/* ------------------------------------------------------- sanity-чеки (RU) */

const data = result.data;
const errors: string[] = [];

/* Каждый формат меню должен иметь минимальный заказ (калькулятор клампит
   чек по MIN_ORDER[тип] — см. calcTotal в lib/pricing.ts). */
for (const t of data.menuTypes) {
  if (!(t.id in data.minOrder)) {
    errors.push(`формату «${t.id}» не задан минимальный заказ (minOrder)`);
  }
}

/* Названия блюд печатаются в каталоге и PDF — обрезка молча невозможна. */
for (const [ti, t] of data.menuTypes.entries()) {
  for (const [pi, p] of t.packages.entries()) {
    for (const [di, d] of p.dishes.entries()) {
      if (d.name.length > 300) {
        errors.push(
          `menuTypes[${ti}].packages[${pi}].dishes[${di}].name длиннее 300 символов (${d.name.length})`,
        );
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`✗ menu.json: sanity-чеки не прошли (${errors.length}):`);
  for (const line of errors) {
    console.error(`  • ${line}`);
  }
  process.exit(1);
}

console.log(
  `✓ menu.json валиден: форматов ${data.menuTypes.length}, допуслуг ${data.addons.length}, плиток услуг ${data.servicePanels.length}`,
);
