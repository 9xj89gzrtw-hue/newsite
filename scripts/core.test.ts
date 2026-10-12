import { describe, expect, test } from "bun:test";
import { calcTotal, MENU_TYPES, ADDONS, MIN_ORDER, addonAmount } from "../src/lib/pricing";
import { normalizePhone } from "../src/lib/phone";
import { validateMenuData } from "../src/lib/menu-schema";
import menu from "../src/data/menu.json";

describe("calculator", () => {
  for (const type of MENU_TYPES) {
    for (const [index, pkg] of type.packages.entries()) {
      test(`${type.id} / ${pkg.name}: correct price and minimum`, () => {
        const price = type.calcPerGuest ?? pkg.pricePerGuest;
        const quote = calcTotal(type.id, 40, [], "", index);
        expect(quote.perGuest).toBe(price);
        expect(quote.total).toBe(Math.max(price * 40, MIN_ORDER[type.id]));
        expect(calcTotal(type.id, 1, [], "", index).total).toBe(Math.max(price, MIN_ORDER[type.id]));
      });
    }
  }
  test("invalid numeric input cannot produce NaN or Infinity", () => {
    for (const guests of [NaN, Infinity, -Infinity, -1, 0, 0.5, 100000]) {
      for (const pkg of [NaN, Infinity, -Infinity, -1, 100000]) {
        const quote = calcTotal("unknown", guests, [], "", pkg);
        expect(Number.isFinite(quote.total)).toBe(true);
        expect(quote.total).toBeGreaterThanOrEqual(MIN_ORDER.buffet);
      }
    }
  });
  test("addons use menu subtotal; repeated selections do not double-charge", () => {
    const ids = ADDONS.map((a) => a.id);
    const quote = calcTotal("buffet", 50, [...ids, ...ids, "unknown"], "2026-12-31", 3);
    expect(quote.addonsTotal).toBe(ADDONS.reduce((s, a) => s + addonAmount(a, 5350 * 50), 0));
    expect(quote.season).toBe(1);
  });
});

describe("phone normalization", () => {
  for (const [input, output] of [
    ["8 (911) 941-72-05", "+79119417205"],
    ["911.941.72.05", "+79119417205"],
    ["+7 911 941 7205", "+79119417205"],
    ["+1 (303) 555-0199", "+13035550199"],
    ["+44.20.7946.0958", "+442079460958"],
    ["123abc4567890", "123abc4567890"],
    ["", ""],
  ]) {
    test(input || "empty", () => expect(normalizePhone(input)).toBe(output));
  }
});

describe("menu schema", () => {
  test("current menu is valid", () => expect(validateMenuData(menu).ok).toBe(true));
  const cases: [string, (draft: typeof menu) => void][] = [
    ["missing root addons", (d) => { delete (d as Partial<typeof menu>).addons; }],
    ["missing description", (d) => { delete (d.menuTypes[0].packages[0] as { description?: string }).description; }],
    ["duplicate addons", (d) => { d.addons.push(structuredClone(d.addons[0])); }],
    ["duplicate panels", (d) => { d.servicePanels.push(structuredClone(d.servicePanels[0])); }],
    ["duplicate formats", (d) => { d.menuTypes.push(structuredClone(d.menuTypes[0])); }],
    ["missing minimum", (d) => { delete (d.minOrder as Record<string, number>).buffet; }],
    ["extra minimum", (d) => { (d.minOrder as Record<string, number>).unknown = 1000; }],
    ["zero minimum", (d) => { d.minOrder.buffet = 0; }],
    ["excessive package price", (d) => { d.menuTypes[0].packages[0].pricePerGuest = 100001; }],
    ["whitespace name", (d) => { d.menuTypes[0].packages[0].name = "   "; }],
    ["long description", (d) => { d.menuTypes[0].description = "x".repeat(501); }],
  ];
  for (const [name, mutate] of cases) {
    test(name, () => {
      const draft = structuredClone(menu);
      mutate(draft);
      expect(validateMenuData(draft).ok).toBe(false);
    });
  }
});
