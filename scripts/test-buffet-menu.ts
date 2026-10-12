import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateMenuData } from "../src/lib/menu-schema";

// Regression for the four buffet menus in the owner's source PDF.
// Run with: bun scripts/test-buffet-menu.ts
const raw = JSON.parse(
  readFileSync(resolve(import.meta.dir, "../src/data/menu.json"), "utf8"),
);
const validated = validateMenuData(raw);
assert.ok(validated.ok, "Menu data must satisfy the shared website/admin schema");
if (!validated.ok) process.exit(1);

const buffet = validated.data.menuTypes.find((menu) => menu.id === "buffet");
assert.ok(buffet, "Buffet format must exist");
assert.deepEqual(
  buffet.packages.map((pkg) => pkg.pricePerGuest),
  [2450, 2950, 3950, 5350],
  "The PDF specifies four separate buffet menus in this order",
);
assert.equal(new Set(buffet.packages.map((pkg) => pkg.name)).size, 4);
assert.equal(buffet.perGuest, 2450, "The starting price must remain unchanged");

const third = buffet.packages[2];
const fourth = buffet.packages[3];
assert.match(third.description, /700 г/);
assert.match(fourth.description, /750 г/);
for (const expected of ["Пармская ветчина", "буженина", "Брусничное", "Морковное"]) {
  assert.ok(third.dishes.some((dish) => dish.name.includes(expected)), expected);
}
for (const expected of ["Утиная грудка", "ростбиф", "Морской гребешок", "Копчёный угорь", "Нисуаз", "раковыми шейками", "филе-миньон", "гратен"]) {
  assert.ok(fourth.dishes.some((dish) => dish.name.includes(expected)), expected);
}
assert.equal(third.dishes.filter((dish) => dish.name.startsWith("Горячая закуска на выбор:")).length, 2);
assert.equal(fourth.dishes.filter((dish) => dish.name.startsWith("Горячая закуска на выбор:")).length, 3);
assert.equal(third.dishes.filter((dish) => dish.name.startsWith("Гарнир на выбор:")).length, 2);
assert.equal(fourth.dishes.filter((dish) => dish.name.startsWith("Гарнир на выбор:")).length, 2);
assert.deepEqual(third.dishes.slice(-3).map((dish) => dish.weight), ["300 мл", "200 мл", "200 мл"]);
assert.deepEqual(fourth.dishes.slice(-3).map((dish) => dish.weight), ["250 мл", "150 мл", "150 мл"]);

console.log("✓ Four buffet menus match the PDF: prices, distinct dishes, choices and drink volumes");
