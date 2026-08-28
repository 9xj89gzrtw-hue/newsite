"use client";

import jsPDF from "jspdf";
import {
  MENU_TYPES,
  formatRUB,
  type MenuType,
  type MenuPackage,
} from "@/lib/pricing";
import { CONTACTS } from "@/lib/config";

/**
 * PDF-каталог — печатная версия блока «Меню» (Cycle 61).
 * ---------------------------------------------------------------------------
 * Дизайн-язык = дизайн-язык сайта (hacc-menu):
 *  - сливочная бумага #F7F5F5, чернила #1A1A1A, красный deep #B91431 (AA на тинтах);
 *  - шапка каждой категории — пастельный тинт панели (как у панели на сайте),
 *    рукописный заголовок Marck Script, цены Roboto Bold;
 *  - блюда — гамма-строки: название + волосяная линейка снизу, вес справа
 *    по правому краю (одноколоночный поток — дисбаланс колонок невозможен);
 *  - «Включено» — галочки от руки (та же кривая, что HandCheck на сайте);
 *  - тёмная мховая обложка со списком каталогов и точечными лидерами.
 *
 * Поток (flow engine): контент течёт сверху вниз; перед каждым блоком
 * проверяем бюджет страницы; не влезает — новая страница с «продолжением»-
 * колонтитулом. Ничего не режется молча (дефект C60-PDF: блюда терялись).
 *
 * Шрифты: Roboto (текст) + Marck Script (рукописные заголовки) +
 * Prata (имена пакетов) — все с кириллицей, лежат в /public/fonts.
 */

const PAGE = {
  w: 210,
  h: 297,
  mL: 22,
  mR: 22,
  get contentW() {
    return this.w - this.mL - this.mR;
  },
  /** Нижняя граница контента (ниже — только футер). */
  bottom: 271,
};

/** rgba(26,26,26,x) поверх бумаги #F7F5F5 → сплошные эквиваленты. */
const C = {
  ink: [26, 26, 26] as [number, number, number],
  soft: [92, 92, 92] as [number, number, number], // ≈ ink/68%
  faint: [150, 150, 150] as [number, number, number],
  line: [199, 199, 199] as [number, number, number], // ≈ ink/22% — волосяные
  lineDark: [168, 168, 168] as [number, number, number],
  red: [185, 20, 49] as [number, number, number], // --ea-red-deep
  cream: [247, 245, 245] as [number, number, number], // --ea-cream
  moss: [29, 40, 32] as [number, number, number],
  mossLine: [86, 96, 88] as [number, number, number],
  peach: [252, 178, 107] as [number, number, number],
  coverMuted: [172, 167, 156] as [number, number, number],
};

let fontsLoaded = false;

async function loadFonts(doc: jsPDF): Promise<void> {
  if (fontsLoaded) return;
  const toBase64 = (buf: ArrayBuffer) => {
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++)
      binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };
  const [robotoR, robotoB, robotoI, marck, prata] = await Promise.all([
    fetch("/fonts/Roboto-Regular.ttf").then((r) => r.arrayBuffer()),
    fetch("/fonts/Roboto-Bold.ttf").then((r) => r.arrayBuffer()),
    fetch("/fonts/Roboto-Italic.ttf").then((r) => r.arrayBuffer()),
    fetch("/fonts/MarckScript-Regular.ttf").then((r) => r.arrayBuffer()),
    fetch("/fonts/Prata-Regular.ttf").then((r) => r.arrayBuffer()),
  ]).catch((err) => {
    fontsLoaded = false; // allow retry on next click
    throw err;
  });
  doc.addFileToVFS("Roboto-Regular.ttf", toBase64(robotoR));
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFileToVFS("Roboto-Bold.ttf", toBase64(robotoB));
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  doc.addFileToVFS("Roboto-Italic.ttf", toBase64(robotoI));
  doc.addFont("Roboto-Italic.ttf", "Roboto", "italic");
  doc.addFileToVFS("MarckScript-Regular.ttf", toBase64(marck));
  doc.addFont("MarckScript-Regular.ttf", "Marck", "normal");
  doc.addFileToVFS("Prata-Regular.ttf", toBase64(prata));
  doc.addFont("Prata-Regular.ttf", "Prata", "normal");
  fontsLoaded = true;
}

/* ────────────────────────────────────────────────────────── shared utils */

function hairline(
  doc: jsPDF,
  x1: number,
  y: number,
  x2: number,
  color: [number, number, number] = C.line,
  w = 0.18,
) {
  doc.setDrawColor(...color);
  doc.setLineWidth(w);
  doc.line(x1, y, x2, y);
}

function dottedLeader(
  doc: jsPDF,
  x1: number,
  y: number,
  x2: number,
  color: [number, number, number] = C.lineDark,
) {
  if (x2 - x1 < 4) return;
  doc.setDrawColor(...color);
  doc.setLineWidth(0.22);
  doc.setLineDashPattern([0.35, 0.85], 0);
  doc.line(x1, y, x2, y);
  doc.setLineDashPattern([], 0);
}

/** «от 20 гостей»: 21/101 → «гостя», остальное → «гостей». */
function guestsWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  return mod10 === 1 && mod100 !== 11 ? "гостя" : "гостей";
}

/** Единица цены — как на сайте (META.priceLabel): «за гостя», у обедов «за порцию». */
function unitFor(m: MenuType): string {
  return m.id === "office-lunch" ? "за порцию" : "за гостя";
}

/* ─────────────────────────────────────────────────────────────── entry */

export async function buildMenuCatalogDoc(typeId = "all"): Promise<jsPDF> {
  const types =
    typeId === "all" ? MENU_TYPES : MENU_TYPES.filter((m) => m.id === typeId);
  if (types.length === 0) throw new Error("no menus for typeId=" + typeId);

  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  await loadFonts(doc);
  doc.setFont("Roboto");
  doc.setLineJoin("round");
  doc.setLineCap("round");

  doc.setProperties({
    title: "Каталог меню — Interfood Catering",
    subject: "Кейтеринг полного цикла · Санкт-Петербург",
    author: "Interfood Catering",
    creator: "interfood-catering.ru",
  });

  if (types.length > 1) {
    drawCover(doc);
    for (const menu of types) {
      doc.addPage();
      drawMenu(doc, menu);
    }
    doc.addPage();
    drawBackCover(doc);
  } else {
    drawMenu(doc, types[0]);
  }

  drawPageFooters(doc, types.length > 1);
  return doc;
}

export async function generateMenuPdf(typeId: string): Promise<void> {
  const types =
    typeId === "all" ? MENU_TYPES : MENU_TYPES.filter((m) => m.id === typeId);
  if (types.length === 0) return;

  const doc = await buildMenuCatalogDoc(typeId);

  const filename =
    types.length > 1
      ? "Catalog-Interfood-Catering.pdf"
      : `Menu-${types[0].label}-Interfood.pdf`;
  doc.save(filename);
}

/* ─────────────────────────────────────────────────────────────── cover */

function drawCover(doc: jsPDF) {
  doc.setFillColor(...C.moss);
  doc.rect(0, 0, PAGE.w, PAGE.h, "F");

  // красная линейка + надзаголовок
  doc.setDrawColor(...C.red);
  doc.setLineWidth(0.8);
  doc.line(PAGE.mL, 52, PAGE.mL + 34, 52);

  doc.setTextColor(...C.peach);
  doc.setFontSize(9);
  doc.setFont("Roboto", "bold");
  doc.text(`КАТАЛОГ МЕНЮ · ${new Date().getFullYear()}`, PAGE.mL, 61);

  // рукописный бренд (шрифт сайта) + красная точка по фактической ширине
  doc.setTextColor(...C.cream);
  doc.setFont("Marck", "normal");
  doc.setFontSize(54);
  doc.text("Interfood", PAGE.mL, 96);
  const brandW = doc.getTextWidth("Interfood");
  doc.setFillColor(...C.red);
  doc.circle(PAGE.mL + brandW + 4.5, 92.5, 1.7, "F");

  doc.setTextColor(...C.coverMuted);
  doc.setFont("Roboto", "italic");
  doc.setFontSize(11.5);
  doc.text("Кейтеринг полного цикла · Санкт-Петербург", PAGE.mL, 110);

  // список каталогов: название ······ цена (цена — по ПРАВОМУ краю)
  const listTop = 142;
  const step = 11.5;
  MENU_TYPES.forEach((m, i) => {
    const y = listTop + i * step;

    doc.setFillColor(...C.red);
    doc.circle(PAGE.mL + 0.8, y - 1.2, 0.75, "F");

    doc.setTextColor(...C.cream);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(11.5);
    doc.text(m.label, PAGE.mL + 6, y);

    const price = `от ${formatRUB(m.perGuest)} ${unitFor(m)}`;
    doc.setTextColor(...C.coverMuted);
    doc.setFontSize(9);
    doc.text(price, PAGE.w - PAGE.mR, y, { align: "right" });

    const labelW = doc.getTextWidth(m.label);
    const priceW = doc.getTextWidth(price);
    dottedLeader(
      doc,
      PAGE.mL + 6 + labelW + 3.5,
      y - 1.2,
      PAGE.w - PAGE.mR - priceW - 3.5,
      C.mossLine,
    );
  });

  // честная приписка о сезонности (как на сайте)
  doc.setTextColor(...C.coverMuted);
  doc.setFont("Roboto", "italic");
  doc.setFontSize(8);
  doc.text(
    "Цены — за одного гостя. В высокий сезон (май–сентябрь, декабрь) действует коэффициент ×1,15.",
    PAGE.mL,
    listTop + MENU_TYPES.length * step + 6,
  );

  // контакты
  doc.setDrawColor(...C.peach);
  doc.setLineWidth(0.4);
  doc.line(PAGE.mL, 254, PAGE.mL + 58, 254);
  doc.setTextColor(...C.peach);
  doc.setFont("Roboto", "bold");
  doc.setFontSize(10);
  doc.text(CONTACTS.phone, PAGE.mL, 262);
  doc.setTextColor(...C.coverMuted);
  doc.setFont("Roboto", "normal");
  doc.setFontSize(8.5);
  doc.text(
    `${CONTACTS.email}  ·  ${CONTACTS.city}  ·  interfood-catering.ru`,
    PAGE.mL,
    269,
  );
}

/* ───────────────────────────────────────────────────── category header */

const BAND_H = 47;

/** Пастельный тинт панели — те же цвета, что у панели категории на сайте. */
const TINTS: Record<string, [number, number, number]> = {
  buffet: [245, 238, 226],
  banquet: [246, 224, 219],
  "snack-box": [230, 235, 223],
  "coffee-break": [244, 222, 205],
  vegetarian: [246, 233, 201],
  bbq: [243, 227, 232],
  "office-lunch": [245, 238, 226],
};

function drawCategoryHeader(doc: jsPDF, menu: MenuType, index: number) {
  const tint = TINTS[menu.id] ?? [245, 238, 226];

  // тинт-полоса во всю ширину листа — как панель категории на сайте
  doc.setFillColor(...tint);
  doc.rect(0, 0, PAGE.w, BAND_H, "F");

  doc.setTextColor(...C.red);
  doc.setFont("Roboto", "bold");
  doc.setFontSize(7.5);
  doc.text(
    `КАТАЛОГ ${String(index + 1).padStart(2, "0")} / ${String(MENU_TYPES.length).padStart(2, "0")}`,
    PAGE.mL,
    16.5,
  );

  // рукописный заголовок (шрифт сайта)
  doc.setTextColor(...C.ink);
  doc.setFont("Marck", "normal");
  doc.setFontSize(30);
  doc.text(menu.label, PAGE.mL, 35.5);

  // цена — по правому краю, на базовой линии заголовка (единица — как на сайте)
  doc.setFont("Roboto", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...C.red);
  doc.text(`от ${formatRUB(menu.perGuest)} ${unitFor(menu)}`, PAGE.w - PAGE.mR, 30, {
    align: "right",
  });
  doc.setFont("Roboto", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.soft);
  doc.text(
    `от ${menu.minGuests} ${guestsWord(menu.minGuests)} · состав согласуем под событие`,
    PAGE.w - PAGE.mR,
    36,
    { align: "right" },
  );

  // описание категории под полосой
  let y = BAND_H + 10;
  doc.setTextColor(...C.soft);
  doc.setFont("Roboto", "italic");
  doc.setFontSize(9.5);
  const descLines = doc.splitTextToSize(menu.description, PAGE.contentW - 30);
  doc.text(descLines, PAGE.mL, y);
  y += descLines.length * 4.4 + 4;
  hairline(doc, PAGE.mL, y, PAGE.w - PAGE.mR, C.line, 0.3);
  return y + 7;
}

/** Колонтитул страницы-продолжения. */
function drawContinuationHeader(doc: jsPDF, menu: MenuType) {
  doc.setTextColor(...C.faint);
  doc.setFont("Roboto", "bold");
  doc.setFontSize(7);
  doc.text(menu.label.toUpperCase(), PAGE.mL, 15);
  doc.text("ПРОДОЛЖЕНИЕ", PAGE.w - PAGE.mR, 15, { align: "right" });
  hairline(doc, PAGE.mL, 18, PAGE.w - PAGE.mR, C.line, 0.25);
}

/* ────────────────────────────────────────────────────── package section */

const ROW_H = 4.7;

function packageHeaderH(doc: jsPDF, pkg: MenuPackage): number {
  const descLines = doc.splitTextToSize(pkg.description, PAGE.contentW - 46);
  // имя(8.5) + описание(3.4/строку) + отбивка(2.5) + линейка→контент(5)
  return 8.5 + descLines.length * 3.4 + 2.5 + 5;
}

function drawMenu(doc: jsPDF, menu: MenuType) {
  const index = MENU_TYPES.indexOf(menu);
  let y = drawCategoryHeader(doc, menu, index);

  const ensure = (h: number) => {
    if (y + h <= PAGE.bottom) return;
    doc.addPage();
    drawContinuationHeader(doc, menu);
    y = 26;
  };

  /** Высота всех блюд пакета — РОВНО та же формула, что при отрисовке:
      базовая линия +3, линейка +1.9, шаг к следующей строке +2.8. */
  const dishesH = (pkg: MenuPackage) =>
    pkg.dishes.reduce((s, d) => {
      const lines: string[] = doc.splitTextToSize(d.name, PAGE.contentW - 20);
      return s + (lines.length - 1) * 3.9 + 7.7;
    }, 0);

  menu.packages.forEach((pkg, pkgIdx) => {
    const headerH = packageHeaderH(doc, pkg);

    // «Включено» идёт сразу за ПОСЛЕДНИМ пакетом: если последний пакет +
    // «включено» не помещаются вместе на остатке страницы, но помещаются
    // на свежей — переносим их ВМЕСТЕ (страница не рвётся на 3 строки +
    // включено, дефект «почти пустой страницы»)
    if (pkgIdx === menu.packages.length - 1) {
      const inclH = 8 + menu.included.length * 5 + 6;
      const needed = headerH + dishesH(pkg) + 4.5 + inclH;
      const freshBudget = PAGE.bottom - 26;
      if (
        y + needed > PAGE.bottom &&
        needed <= freshBudget &&
        y > 30 /* уже рисовали контент на этой странице */
      ) {
        doc.addPage();
        drawContinuationHeader(doc, menu);
        y = 26;
      }
    }

    // заголовок пакета не отрывается от первых двух блюд
    ensure(headerH + 2 * ROW_H + 2);

    // имя пакета (Prata) + цена справа
    doc.setTextColor(...C.ink);
    doc.setFont("Prata", "normal");
    doc.setFontSize(13.5);
    doc.text(pkg.name, PAGE.mL, y + 5);

    doc.setFont("Roboto", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...C.red);
    doc.text(formatRUB(pkg.pricePerGuest), PAGE.w - PAGE.mR, y + 5, {
      align: "right",
    });
    y += 8.5;

    // описание пакета
    doc.setTextColor(...C.soft);
    doc.setFont("Roboto", "italic");
    doc.setFontSize(8);
    const descLines: string[] = doc.splitTextToSize(
      pkg.description,
      PAGE.contentW - 46,
    );
    doc.text(descLines, PAGE.mL, y);
    y += descLines.length * 3.4 + 2.5;
    hairline(doc, PAGE.mL, y, PAGE.w - PAGE.mR, C.lineDark, 0.25);
    y += 5;

    // блюда — гамма-строки
    doc.setFont("Roboto", "normal");
    for (const dish of pkg.dishes) {
      const lines: string[] = doc.splitTextToSize(
        dish.name,
        PAGE.contentW - 20,
      );
      const rowH = (lines.length - 1) * 3.9 + ROW_H;
      ensure(rowH);

      doc.setTextColor(...C.ink);
      doc.setFontSize(9);
      doc.text(lines, PAGE.mL, y + 3);

      if (dish.weight) {
        doc.setTextColor(...C.faint);
        doc.setFontSize(7.5);
        doc.text(dish.weight, PAGE.w - PAGE.mR, y + 3, { align: "right" });
      }

      const ruleY = y + 3 + (lines.length - 1) * 3.9 + 1.9;
      hairline(doc, PAGE.mL, ruleY, PAGE.w - PAGE.mR, C.line, 0.15);
      y = ruleY + 2.8;
    }
    y += 4.5;
  });

  // «включено» — той же кривой, что галочки на сайте
  const inclH = 8 + menu.included.length * 5 + 6;
  ensure(inclH);
  hairline(doc, PAGE.mL, y, PAGE.w - PAGE.mR, C.lineDark, 0.3);
  y += 6.5;
  doc.setTextColor(...C.red);
  doc.setFont("Roboto", "bold");
  doc.setFontSize(7.5);
  doc.text("ВКЛЮЧЕНО ВО ВСЕ ПАКЕТЫ", PAGE.mL, y);
  y += 6;

  doc.setFont("Roboto", "normal");
  doc.setFontSize(9);
  for (const inc of menu.included) {
    doc.setTextColor(...C.ink);
    doc.text(inc, PAGE.mL + 8, y);
    drawHandCheck(doc, PAGE.mL, y);
    y += 5;
  }
}

/** Галочка «от руки» — та же кривая, что HandCheck SVG на сайте (16×16). */
function drawHandCheck(doc: jsPDF, x: number, baselineY: number) {
  const s = 0.34; // 16u → ~5.4mm
  const ox = x;
  const oy = baselineY - 5.2; // верх рамки
  const p = (ux: number, uy: number): [number, number] => [
    ox + ux * s,
    oy + uy * s,
  ];
  doc.setDrawColor(...C.ink);
  doc.setLineWidth(0.55);
  const a = p(2.5, 8.6);
  const b = p(4.6, 10.9);
  const c = p(6.1, 13.0);
  const d = p(9.7, 7.5);
  const e = p(13.9, 2.4);
  doc.line(...a, ...b);
  doc.line(...b, ...c);
  doc.line(...c, ...d);
  doc.line(...d, ...e);
}

/* ─────────────────────────────────────────────────────────── back cover */

function drawBackCover(doc: jsPDF) {
  doc.setFillColor(...C.moss);
  doc.rect(0, 0, PAGE.w, PAGE.h, "F");

  doc.setDrawColor(...C.red);
  doc.setLineWidth(0.8);
  doc.line(PAGE.mL, 96, PAGE.mL + 34, 96);

  // рукописное приглашение — тот же голос, что на обложке
  doc.setTextColor(...C.cream);
  doc.setFont("Marck", "normal");
  doc.setFontSize(30);
  doc.text("Соберём меню под ваше событие", PAGE.mL, 120);

  doc.setTextColor(...C.coverMuted);
  doc.setFont("Roboto", "italic");
  doc.setFontSize(10.5);
  const lines: string[] = doc.splitTextToSize(
    "Заменим блюдо, соберём смешанный уровень, посчитаем банкет на вашу дату — сезонный коэффициент назовём заранее.",
    PAGE.contentW - 40,
  );
  doc.text(lines, PAGE.mL, 132);

  // контакты крупно
  doc.setDrawColor(...C.peach);
  doc.setLineWidth(0.4);
  doc.line(PAGE.mL, 168, PAGE.mL + 58, 168);
  doc.setTextColor(...C.peach);
  doc.setFont("Roboto", "bold");
  doc.setFontSize(16);
  doc.text(CONTACTS.phone, PAGE.mL, 180);
  doc.setTextColor(...C.cream);
  doc.setFontSize(10.5);
  doc.text(CONTACTS.email, PAGE.mL, 190);

  doc.setTextColor(...C.coverMuted);
  doc.setFont("Roboto", "normal");
  doc.setFontSize(9);
  doc.text(
    `${CONTACTS.city}  ·  interfood-catering.ru`,
    PAGE.mL,
    198,
  );

  // подпись бренда внизу — рукописная, как на обложке
  doc.setTextColor(...C.cream);
  doc.setFont("Marck", "normal");
  doc.setFontSize(22);
  doc.text("Interfood", PAGE.mL, 258);
  const brandW = doc.getTextWidth("Interfood");
  doc.setFillColor(...C.red);
  doc.circle(PAGE.mL + brandW + 2.6, 255.5, 1.2, "F");
  doc.setTextColor(...C.coverMuted);
  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);
  doc.text(
    `Каталог меню · ${new Date().getFullYear()}`,
    PAGE.w - PAGE.mR,
    258,
    { align: "right" },
  );
}

/* ────────────────────────────────────────────────────── footers */

function drawPageFooters(doc: jsPDF, hasCover: boolean) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    // у обложки и задней обложки свои подписи
    if (hasCover && (i === 1 || i === total)) continue;

    hairline(doc, PAGE.mL, 279, PAGE.w - PAGE.mR, C.line, 0.2);
    doc.setTextColor(...C.faint);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(7);
    doc.text("Interfood Catering · Санкт-Петербург", PAGE.mL, 284);
    doc.text(
      `${CONTACTS.phone}  ·  ${String(i).padStart(2, "0")} / ${String(total).padStart(2, "0")}`,
      PAGE.w - PAGE.mR,
      284,
      { align: "right" },
    );
  }
}
