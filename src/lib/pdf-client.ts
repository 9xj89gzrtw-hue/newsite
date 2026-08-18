"use client";

import jsPDF from "jspdf";
import { MENU_TYPES, formatRUB, type MenuType, type MenuPackage } from "@/lib/pricing";
import { CONTACTS } from "@/lib/config";

/**
 * Client-side PDF generation — editorial, two-column, minimal.
 * Inspired by Ridgewells/Salza: whitespace, serif hierarchy, no photos.
 * jsPDF + embedded Roboto TTF (Cyrillic support).
 */

const PAGE = {
  w: 210,
  h: 297,
  marginL: 25,
  marginR: 25,
  marginT: 30,
  marginB: 25,
  colGap: 8,
  get contentW() {
    return this.w - this.marginL - this.marginR;
  },
  get colW() {
    return (this.contentW - this.colGap) / 2;
  },
};

const C = {
  bordeaux: [209, 26, 70] as [number, number, number],
  ink: [38, 38, 38] as [number, number, number],
  inkSoft: [120, 120, 120] as [number, number, number],
  inkMid: [80, 80, 80] as [number, number, number],
  cream: [252, 251, 248] as [number, number, number],
  moss: [29, 40, 32] as [number, number, number],
  peach: [252, 178, 107] as [number, number, number],
  divider: [200, 200, 200] as [number, number, number],
  dividerLight: [230, 230, 230] as [number, number, number],
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
  const [regular, bold, italic] = await Promise.all([
    fetch("/fonts/Roboto-Regular.ttf").then((r) => r.arrayBuffer()),
    fetch("/fonts/Roboto-Bold.ttf").then((r) => r.arrayBuffer()),
    fetch("/fonts/Roboto-Italic.ttf").then((r) => r.arrayBuffer()),
  ]);
  doc.addFileToVFS("Roboto-Regular.ttf", toBase64(regular));
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFileToVFS("Roboto-Bold.ttf", toBase64(bold));
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  doc.addFileToVFS("Roboto-Italic.ttf", toBase64(italic));
  doc.addFont("Roboto-Italic.ttf", "Roboto", "italic");
  fontsLoaded = true;
}

export async function generateMenuPdf(typeId: string): Promise<void> {
  const types =
    typeId === "all" ? MENU_TYPES : MENU_TYPES.filter((m) => m.id === typeId);
  if (types.length === 0) return;

  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  await loadFonts(doc);
  doc.setFont("Roboto");

  let firstPage = true;

  if (types.length > 1) {
    drawCover(doc);
    firstPage = false;
  }

  for (const menu of types) {
    if (!firstPage) doc.addPage();
    firstPage = false;
    drawMenuPage(doc, menu);
  }

  const filename =
    types.length > 1
      ? "Catalog-Interfood-Catering.pdf"
      : `Menu-${types[0].label}-Interfood.pdf`;
  doc.save(filename);
}

// ─── Cover ────────────────────────────────────────────────────────────
function drawCover(doc: jsPDF) {
  // Full dark bg
  doc.setFillColor(...C.moss);
  doc.rect(0, 0, PAGE.w, PAGE.h, "F");

  // Thin bordeaux line top-left
  doc.setDrawColor(...C.bordeaux);
  doc.setLineWidth(0.6);
  doc.line(PAGE.marginL, 55, PAGE.marginL + 35, 55);

  // Eyebrow
  doc.setTextColor(...C.peach);
  doc.setFontSize(8);
  doc.setFont("Roboto", "normal");
  doc.text(`КАТАЛОГ · ${new Date().getFullYear()}`, PAGE.marginL, 62);

  // Title — large, airy
  doc.setTextColor(...C.cream);
  doc.setFontSize(52);
  doc.setFont("Roboto", "bold");
  doc.text("Interfood", PAGE.marginL, 95);
  doc.setFillColor(...C.bordeaux);
  doc.circle(PAGE.marginL + 88, 91, 2.5, "F");

  // Subtitle — italic, breathing
  doc.setTextColor(160, 155, 145);
  doc.setFontSize(13);
  doc.setFont("Roboto", "italic");
  doc.text("Кейтеринг полного цикла · Санкт-Петербург", PAGE.marginL, 110);

  // Menu types — vertical list with prices, lots of whitespace
  doc.setFontSize(10);
  doc.setFont("Roboto", "normal");
  doc.setTextColor(180, 180, 180);
  const startY = 145;
  MENU_TYPES.forEach((m, i) => {
    const y = startY + i * 10;
    // Dot
    doc.setFillColor(...C.bordeaux);
    doc.circle(PAGE.marginL + 1, y - 1.5, 0.8, "F");
    // Label
    doc.setTextColor(...C.cream);
    doc.setFontSize(11);
    doc.setFont("Roboto", "normal");
    doc.text(m.label, PAGE.marginL + 6, y);
    // Price — right aligned, muted
    doc.setTextColor(140, 140, 140);
    doc.setFontSize(9);
    doc.text(`от ${formatRUB(m.perGuest)} ${m.priceUnit ?? "/чел"}`, PAGE.marginL + 90, y);
    // Dotted leader line
    doc.setDrawColor(...C.dividerLight);
    doc.setLineWidth(0.2);
    const labelW = doc.getTextWidth(m.label);
    const priceW = doc.getTextWidth(`от ${formatRUB(m.perGuest)} ${m.priceUnit ?? "/чел"}`);
    const lineStart = PAGE.marginL + 6 + labelW + 3;
    const lineEnd = PAGE.marginL + 90 - priceW - 3;
    if (lineEnd > lineStart) {
      doc.setLineDashPattern([0.5, 1], 0);
      doc.line(lineStart, y - 1.5, lineEnd, y - 1.5);
      doc.setLineDashPattern([], 0);
    }
  });

  // Bottom accent
  doc.setDrawColor(...C.peach);
  doc.setLineWidth(0.3);
  doc.line(PAGE.marginL, 255, PAGE.marginL + 60, 255);

  // Contacts — minimal, bottom
  doc.setTextColor(...C.peach);
  doc.setFontSize(9);
  doc.setFont("Roboto", "bold");
  doc.text(CONTACTS.phone, PAGE.marginL, 263);

  doc.setTextColor(160, 160, 160);
  doc.setFontSize(8);
  doc.setFont("Roboto", "normal");
  doc.text(`${CONTACTS.email}  ·  ${CONTACTS.city}`, PAGE.marginL, 269);
  doc.text("interfood-catering.ru", PAGE.marginL, 274);
}

// ─── Menu page ───────────────────────────────────────────────────────
function drawMenuPage(doc: jsPDF, menu: MenuType) {
  let y = PAGE.marginT;
  const priceUnit = menu.priceUnit ?? "/чел";
  const pageNum = MENU_TYPES.indexOf(menu) + 1;

  // ── Top bar ──
  doc.setTextColor(...C.inkSoft);
  doc.setFontSize(7);
  doc.setFont("Roboto", "normal");
  doc.text(`INTERFOOD CATERING`, PAGE.marginL, y);
  doc.text(`СТР. ${String(pageNum).padStart(2, "0")} / ${MENU_TYPES.length}`, PAGE.w - PAGE.marginR, y, { align: "right" });

  // Thin line
  doc.setDrawColor(...C.dividerLight);
  doc.setLineWidth(0.2);
  doc.line(PAGE.marginL, y + 2, PAGE.w - PAGE.marginR, y + 2);
  y += 12;

  // ── Title block ──
  doc.setTextColor(...C.bordeaux);
  doc.setFontSize(7);
  doc.setFont("Roboto", "normal");
  doc.text("МЕНЮ", PAGE.marginL, y);
  y += 8;

  doc.setTextColor(...C.ink);
  doc.setFontSize(36);
  doc.setFont("Roboto", "bold");
  doc.text(menu.label, PAGE.marginL, y);
  y += 4;

  // Price — right of title, muted
  doc.setTextColor(...C.bordeaux);
  doc.setFontSize(10);
  doc.setFont("Roboto", "bold");
  doc.text(
    `от ${formatRUB(menu.perGuest)} ${priceUnit}`,
    PAGE.w - PAGE.marginR,
    y - 2,
    { align: "right" },
  );
  y += 10;

  // Italic description — lots of air
  doc.setTextColor(...C.inkSoft);
  doc.setFontSize(10);
  doc.setFont("Roboto", "italic");
  const descLines = doc.splitTextToSize(menu.description, PAGE.contentW - 40);
  doc.text(descLines, PAGE.marginL, y);
  y += descLines.length * 4.5 + 8;

  // Divider
  doc.setDrawColor(...C.divider);
  doc.setLineWidth(0.3);
  doc.line(PAGE.marginL, y, PAGE.w - PAGE.marginR, y);
  y += 8;

  // ── Packages — two-column flow ──
  const colH = PAGE.h - PAGE.marginB - y - 10; // available height
  const col1X = PAGE.marginL;
  const col2X = PAGE.marginL + PAGE.colW + PAGE.colGap;

  let colY1 = y;
  let colY2 = y;
  let useCol2 = false;

  for (let i = 0; i < menu.packages.length; i++) {
    const pkg = menu.packages[i];
    const targetY = useCol2 ? colY2 : colY1;
    const x = useCol2 ? col2X : col1X;

    const result = drawPackageColumn(doc, pkg, x, targetY, PAGE.colW, priceUnit, i + 1);

    if (useCol2) {
      colY2 = result.endY + 6;
    } else {
      colY1 = result.endY + 6;
    }

    // Switch to col 2 after first package if it fit, or if next won't fit in col 1
    if (!useCol2 && i === 0 && colY1 < PAGE.h - PAGE.marginB - 40) {
      useCol2 = true;
    }
    // If col 2 is full, start new page and go back to col 1
    if (useCol2 && colY2 > PAGE.h - PAGE.marginB - 30) {
      drawFooter(doc);
      doc.addPage();
      y = PAGE.marginT;
      colY1 = y;
      colY2 = y;
      useCol2 = false;
    }
  }

  // ── Included block — bottom of page ──
  const finalY = Math.max(colY1, colY2);
  if (finalY < PAGE.h - PAGE.marginB - 35) {
    drawIncluded(doc, menu, finalY + 5);
  } else {
    drawFooter(doc);
    doc.addPage();
    drawIncluded(doc, menu, PAGE.marginT);
  }

  drawFooter(doc);
}

function drawPackageColumn(
  doc: jsPDF,
  pkg: MenuPackage,
  x: number,
  y: number,
  w: number,
  priceUnit: string,
  pkgNum: number,
): { endY: number } {
  // Package name — large serif
  doc.setTextColor(...C.ink);
  doc.setFontSize(14);
  doc.setFont("Roboto", "bold");
  doc.text(pkg.name, x, y);
  y += 3;

  // Price — right aligned, bordeaux
  doc.setTextColor(...C.bordeaux);
  doc.setFontSize(10);
  doc.setFont("Roboto", "bold");
  doc.text(`${formatRUB(pkg.pricePerGuest)} ${priceUnit}`, x + w, y - 1, {
    align: "right",
  });
  y += 5;

  // Description — italic, muted
  doc.setTextColor(...C.inkSoft);
  doc.setFontSize(8);
  doc.setFont("Roboto", "italic");
  const descLines = doc.splitTextToSize(pkg.description, w);
  doc.text(descLines, x, y);
  y += descLines.length * 3.5 + 4;

  // Thin divider under package header
  doc.setDrawColor(...C.dividerLight);
  doc.setLineWidth(0.2);
  doc.line(x, y, x + w, y);
  y += 5;

  // Dishes — clean list, no boxes, just name + dotted leader + weight
  doc.setFontSize(8.5);
  doc.setFont("Roboto", "normal");
  pkg.dishes.forEach((dish, i) => {
    if (y > PAGE.h - PAGE.marginB - 15) return; // page safety

    // Number — tiny, muted
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(6.5);
    doc.text(String(i + 1).padStart(2, "0"), x, y);

    // Dish name
    doc.setTextColor(...C.inkMid);
    doc.setFontSize(8.5);
    doc.setFont("Roboto", "normal");
    const nameLines = doc.splitTextToSize(dish.name, w - 6);
    doc.text(nameLines, x + 5, y);

    // Weight — right aligned
    if (dish.weight) {
      doc.setTextColor(160, 160, 160);
      doc.setFontSize(7);
      doc.text(dish.weight, x + w, y, { align: "right" });
    }

    y += Math.max(nameLines.length * 3.8, 4.5);
  });

  return { endY: y };
}

function drawIncluded(doc: jsPDF, menu: MenuType, y: number) {
  // Divider
  doc.setDrawColor(...C.divider);
  doc.setLineWidth(0.3);
  doc.line(PAGE.marginL, y, PAGE.w - PAGE.marginR, y);
  y += 6;

  // Header
  doc.setTextColor(...C.bordeaux);
  doc.setFontSize(7);
  doc.setFont("Roboto", "bold");
  doc.text("ВКЛЮЧЕНО ВО ВСЕ ПАКЕТЫ", PAGE.marginL, y);
  y += 5;

  // Items — two columns, clean
  const half = Math.ceil(menu.included.length / 2);
  const col1Items = menu.included.slice(0, half);
  const col2Items = menu.included.slice(half);

  doc.setFontSize(8.5);
  doc.setFont("Roboto", "normal");
  doc.setTextColor(...C.inkMid);

  col1Items.forEach((item, i) => {
    doc.text(`·  ${item}`, PAGE.marginL, y + i * 5);
  });
  col2Items.forEach((item, i) => {
    doc.text(`·  ${item}`, PAGE.marginL + PAGE.colW + PAGE.colGap, y + i * 5);
  });

  y += Math.max(col1Items.length, col2Items.length) * 5 + 5;
}

function drawFooter(doc: jsPDF) {
  const y = PAGE.h - 12;

  doc.setDrawColor(...C.dividerLight);
  doc.setLineWidth(0.2);
  doc.line(PAGE.marginL, y, PAGE.w - PAGE.marginR, y);

  doc.setTextColor(...C.inkSoft);
  doc.setFontSize(7);
  doc.setFont("Roboto", "normal");
  doc.text("Interfood Catering · Санкт-Петербург", PAGE.marginL, y + 4);
  doc.text(
    `${CONTACTS.phone}  ·  ${CONTACTS.email}`,
    PAGE.w - PAGE.marginR,
    y + 4,
    { align: "right" },
  );
}
