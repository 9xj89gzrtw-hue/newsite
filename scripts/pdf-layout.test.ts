import { beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { MENU_TYPES } from "../src/lib/pricing";

const root = resolve(import.meta.dir, "..");
beforeAll(() => {
  const result = spawnSync(process.execPath, ["scripts/gen-menu-pdfs.ts"], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
}, 60_000);

const textKey = (value: string) => value.replace(/\s+/g, "");
describe("A4 menu PDF layout", () => {
  for (const menu of MENU_TYPES) {
    for (const [i, pkg] of menu.packages.entries()) {
      test(`${menu.id}/${i}: one page, no lost dishes or conditions`, () => {
        const file = resolve(root, `public/menu-pdf/menu-${menu.id}-${i}.pdf`);
        const info = spawnSync("pdfinfo", [file], { encoding: "utf8" });
        expect(info.status).toBe(0);
        expect(info.stdout).toMatch(/Pages:\s+1\b/);
        const content = spawnSync("pdftotext", [file, "-"], { encoding: "utf8" });
        expect(content.status).toBe(0);
        const normalized = textKey(content.stdout);
        for (const dish of pkg.dishes) expect(normalized).toContain(textKey(dish.name));
        expect(normalized).toContain(textKey("Минимальный заказ"));
        expect(normalized).toContain(textKey("nilovcatering.ru"));
      });
    }
  }
  test("catalog cannot end with an isolated conditions-only page", () => {
    const file = resolve(root, "public/menu-pdf/menu-all.pdf");
    const info = spawnSync("pdfinfo", [file], { encoding: "utf8" });
    const pages = Number(info.stdout.match(/Pages:\s+(\d+)/)?.[1]);
    const text = spawnSync("pdftotext", ["-f", String(pages), "-l", String(pages), file, "-"], { encoding: "utf8" });
    const last = MENU_TYPES.at(-1)!.packages.at(-1)!;
    expect(textKey(text.stdout)).toContain(textKey(last.dishes.at(-1)!.name));
    expect(textKey(text.stdout)).toContain(textKey("Минимальный заказ"));
  });
});
