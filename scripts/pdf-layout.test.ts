import { beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { MENU_TYPES, formatRUB } from "../src/lib/pricing";

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

  /* c106: книжная структура каталога — обложка, «Содержание» на стр. 2,
     каждый формат и каждый тариф с новой страницы; номера оглавления
     сходятся с фактическими страницами пакетов. */
  test("catalog: TOC on page 2, every package starts on its own page", () => {
    const file = resolve(root, "public/menu-pdf/menu-all.pdf");
    const info = spawnSync("pdfinfo", [file], { encoding: "utf8" });
    expect(info.status).toBe(0);
    const pages = Number(info.stdout.match(/Pages:\s+(\d+)/)?.[1]);

    const pageText: string[] = [];
    for (let p = 1; p <= pages; p++) {
      const r = spawnSync("pdftotext", ["-f", String(p), "-l", String(p), file, "-"], { encoding: "utf8" });
      pageText.push(r.stdout);
    }
    const normPages = pageText.map(textKey);

    /* обложка: титул; стр. 2 — оглавление со всеми форматами */
    expect(normPages[0]).toContain(textKey("ПОЛНЫЙ КАТАЛОГ МЕНЮ"));
    expect(normPages[1]).toContain(textKey("СОДЕРЖАНИЕ"));
    for (const menu of MENU_TYPES) {
      expect(normPages[1]).toContain(textKey(menu.label));
    }

    /* фактическая страница каждого пакета — по первому блюду; поиск
       монотонно вперёд (защита от дублей имён блюд между пакетами) */
    const flat: { menuId: string; pkgName: string; page: number }[] = [];
    let searchFrom = 2; /* 0-based: пропускаем обложку и оглавление */
    for (const menu of MENU_TYPES) {
      for (const pkg of menu.packages) {
        const key = textKey(pkg.dishes[0].name);
        const idx = normPages.findIndex((t, i) => i >= searchFrom && t.includes(key));
        expect(idx).toBeGreaterThanOrEqual(2);
        flat.push({ menuId: menu.id, pkgName: pkg.name, page: idx + 1 });
        searchFrom = idx + 1;
      }
    }
    /* каждый следующий тариф — строго на новой странице */
    for (let i = 1; i < flat.length; i++) {
      expect(flat[i].page).toBeGreaterThan(flat[i - 1].page);
    }
    /* первый пакет формата делит страницу с шапкой-главой (название капсом) */
    for (const menu of MENU_TYPES) {
      const first = flat.find((f) => f.menuId === menu.id)!;
      expect(normPages[first.page - 1]).toContain(textKey(menu.label.toUpperCase()));
    }

    /* оглавление: строки с номерами сходятся с фактом (-layout: номер
       страницы — последняя цифра визуальной строки; перенос строки
       склеивается в буфер) */
    const tocRaw = spawnSync(
      "pdftotext", ["-layout", "-f", "2", "-l", "2", file, "-"],
      { encoding: "utf8" },
    ).stdout;
    const rows: { label: string; page: number }[] = [];
    let buf = "";
    for (const raw of tocRaw.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) continue;
      buf = buf ? buf + " " + line : line;
      const m = /(\d+)\s*$/.exec(buf);
      if (m) {
        rows.push({ label: buf.slice(0, m.index).trim(), page: Number(m[1]) });
        buf = "";
      }
    }
    const expected: { key: string; page: number; price?: string }[] = [];
    for (const menu of MENU_TYPES) {
      expected.push({
        key: textKey(menu.label),
        page: flat.find((f) => f.menuId === menu.id)!.page,
      });
      for (const pkg of menu.packages) {
        expected.push({
          key: textKey(pkg.name),
          page: flat.find((f) => f.menuId === menu.id && f.pkgName === pkg.name)!.page,
          /* c106-fix: в строке тарифа — цена ПАКЕТА, не формата */
          price: textKey(formatRUB(pkg.pricePerGuest)),
        });
      }
    }
    expect(rows.length).toBe(expected.length);
    for (let i = 0; i < expected.length; i++) {
      expect(textKey(rows[i].label)).toContain(expected[i].key);
      expect(rows[i].page).toBe(expected[i].page);
      if (expected[i].price) {
        expect(textKey(rows[i].label)).toContain(expected[i].price);
      }
    }
  });
});
