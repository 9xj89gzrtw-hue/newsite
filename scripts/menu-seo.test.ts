import { describe, expect, test } from "bun:test";
import { menuStructuredData, jsonLdText } from "../src/lib/menu-seo";
import { MENU_TYPES } from "../src/lib/pricing";

describe("Menu SEO stays synchronized with the actual catalog", () => {
  test("every category, package, dish and weight is represented", () => {
    const menu = menuStructuredData();
    expect(menu.hasMenuSection).toHaveLength(MENU_TYPES.length);
    for (const [i, type] of MENU_TYPES.entries()) {
      const section = menu.hasMenuSection[i];
      expect(section.name).toBe(type.label);
      expect(section.hasMenuSection).toHaveLength(type.packages.length);
      for (const [j, pkg] of type.packages.entries()) {
        const tier = section.hasMenuSection[j];
        expect(tier.description).toContain(String(pkg.pricePerGuest));
        expect(tier.hasMenuItem.map((dish) => dish.name)).toEqual(pkg.dishes.map((dish) => dish.name));
        for (const [k, dish] of pkg.dishes.entries()) {
          if (dish.weight) expect(tier.hasMenuItem[k].description).toContain(dish.weight);
          expect(tier.hasMenuItem[k]).not.toHaveProperty("offers");
        }
      }
    }
  });
  test("authored HTML cannot terminate JSON-LD script", () => {
    const value = { name: "</script><script>alert('x')</script> &" };
    const encoded = jsonLdText(value);
    expect(encoded).not.toContain("<");
    expect(JSON.parse(encoded)).toEqual(value);
  });
});
