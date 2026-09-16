"use client";

import jsPDF from "jspdf";
import {
  MENU_TYPES,
  formatRUB,
  type Dish,
  type MenuType,
  type MenuPackage,
} from "@/lib/pricing";
import { CONTACTS } from "@/lib/config";

/**
 * PDF-меню/каталог — печатная версия блока «Меню» (Cycle 61 → редизайн c85-C).
 * ---------------------------------------------------------------------------
 * Дизайн-язык c85-C = бренд сайта (espresso/крем/золото, Prata + Marck Script):
 *  - крем-бумага #F7F5F1 на каждом листе, чернила espresso #161312,
 *    золото #C9A227 — линии, капс-подписи и акценты, #0A0908 — CTA-блок;
 *  - первая страница: espresso-полоса 36 мм («nilov catering» Prata 22 pt
 *    крем + золотая линия-отступ + «food as art» Marck Script золотом)
 *    + ЭМБЛЕМА КОМПАНИИ (c93: белая версия колец, правый край полосы),
 *    под ней «МЕНЮ — {ТАРИФ}» Prata 15 pt + «Санкт-Петербург · {дата}»;
 *  - категории: золотая капс-подпись 10 pt с трекингом + волосяная линия
 *    espresso/15; блюда — единая сетка (координаты в DISH): имя Roboto-Bold
 *    10.5 слева, граммовка Roboto-Regular 10.5 по правому краю, между ними
 *    точечный лидер espresso/25 (в данных нет цен за блюдо — правой колонкой
 *    служит граммовка; описание-if-any идёт курсивной подстрокой);
 *  - «Включено в любой пакет» — рамка золотом 0.8 pt, пункты в 2 колонки,
 *    рукописная галочка золотом (та же кривая, что HandCheck на сайте);
 *  - футер каждой страницы: линия espresso/15, слева «nilov catering ·
 *    Санкт-Петербург», справа телефон + домен, по центру «стр. N из M»;
 *    страницы продолжения — малая эмблема (чёрная версия) в правом
 *    верхнем углу (c93); последняя страница — CTA-блок «Соберите смету
 *    за 1 минуту» (espresso #0A0908, телефон золотом), прижатый к низу
 *    над футером.
 *
 * Поток (flow engine, наследие c61/c84): контент течёт сверху вниз; перед
 * каждым блоком — бюджет страницы; «сироты» запрещены: заголовок категории
 * не остаётся без двух блюд, «включено» не отрывается от последнего пакета
 * (перенос парой). Ничего не режется молча (дефект C60-PDF: блюда терялись).
 *
 * c84-C: per-tariff PDF — generateMenuPdf(typeId, pkgIdx); кэш fetch шрифтов
 * модульный, addFont — на каждый doc (баг двойной генерации, см. ниже).
 *
 * Шрифты: Roboto (текст) + Marck Script (рукописные акценты) + Prata
 * (заголовки/бренд) — все с кириллицей, лежат в /public/fonts.
 */

const PAGE = {
  w: 210,
  h: 297,
  mL: 15,
  mR: 15,
  get contentW() {
    return this.w - this.mL - this.mR; // 180 мм
  },
  /** Высота бренд-полосы на первой странице (требование: 34–40 мм). */
  bandH: 36,
  /** Нижняя граница контента: ниже — футер (линия 282.5, текст 287). */
  bottom: 277,
};

/** Верх контента на страницах продолжения (под колонтитулом 13–15.5). */
const CONTENT_TOP = 23;

/** Сплошные печатные эквиваленты бренд-палитры c85 (альфа нет — печать). */
const C = {
  cream: [247, 245, 241] as [number, number, number], // #F7F5F1 — бумага
  espresso: [22, 19, 18] as [number, number, number], // #161312 — чернила/полоса
  deep: [10, 9, 8] as [number, number, number], // #0A0908 — CTA-блок
  gold: [201, 162, 39] as [number, number, number], // #C9A227 — линии/на тёмном
  goldText: [154, 122, 25] as [number, number, number], // капс-подписи на креме (~3.5:1)
  soft: [101, 99, 97] as [number, number, number], // ≈ espresso/65 — описания
  faint: [146, 145, 143] as [number, number, number], // ≈ espresso/45 — служебное
  line: [213, 212, 211] as [number, number, number], // ≈ espresso/15 — волосяные
  dots: [191, 190, 189] as [number, number, number], // ≈ espresso/25 — лидеры
  onDarkMuted: [181, 179, 175] as [number, number, number], // крем/70 на espresso
};

/* Домен для колонтитулов/CTA: CONTACTS (lib/config) хранит телефон и email,
   но не домен; SITE_URL — временный Vercel-деплой. c94 (заказчик): публичный
   домен компании — nilovcatering.ru (в колонтитулах PDF оставался прежний
   interfood-catering.ru — найден владельцем при вычитке). */
const SITE_DOMAIN = "nilovcatering.ru";

/* c84-C (баг, пойманный bun-верификацией): addFileToVFS пишет в ГЛОБАЛЬНЫЙ
   VFS jsPDF, но addFont регистрирует шрифт В ЭКЗЕМПЛЯРЕ документа. Прежний
   флаг fontsLoaded кэшировал «шрифты загружены» на модуль — второй документ
   того же процесса (повторный клик по «Каталог в PDF», per-tariff PDF после
   каталога) оставался БЕЗ кириллических шрифтов (замер: 8KB без шрифтов
   против 139KB). Теперь кэшируется ТОЛЬКО fetch (модульный Promise), а
   регистрация addFont выполняется на каждый doc. Ошибка сети сбрасывает
   кэш — повторный клик retry'ит честно. */
let fontsFetch: Promise<
  [ArrayBuffer, ArrayBuffer, ArrayBuffer, ArrayBuffer, ArrayBuffer]
> | null = null;

async function loadFonts(doc: jsPDF): Promise<void> {
  const toBase64 = (buf: ArrayBuffer) => {
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++)
      binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };
  if (!fontsFetch) {
    fontsFetch = Promise.all([
      fetch("/fonts/Roboto-Regular.ttf").then((r) => r.arrayBuffer()),
      fetch("/fonts/Roboto-Bold.ttf").then((r) => r.arrayBuffer()),
      fetch("/fonts/Roboto-Italic.ttf").then((r) => r.arrayBuffer()),
      fetch("/fonts/MarckScript-Regular.ttf").then((r) => r.arrayBuffer()),
      fetch("/fonts/Prata-Regular.ttf").then((r) => r.arrayBuffer()),
    ]).catch((err) => {
      fontsFetch = null; // allow retry on next click
      throw err;
    });
  }
  const [robotoR, robotoB, robotoI, marck, prata] = await fontsFetch;
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
}

/* c93: эмблема компании в каждом PDF. Обе версии — PNG 480×558 с
   прозрачностью (кольца + «NILOV CATERING · St. Petersburg»): белая —
   на espresso-полосу 1-й страницы, чёрная — в колонтитул страниц
   продолжения. Кэш — как у шрифтов (модульный Promise, ошибка сети
   сбрасывает); jsPDF 4.x дедуплицирует повторные addImage — файл
   растёт только на одну копию PNG. */
const EMBLEM = {
  srcW: 480,
  srcH: 558,
  bandH: 26, // большая эмблема в бренд-полосе (полоса 36 мм, поля по 5)
  contH: 8, // малая эмблема страниц продолжения (над линией колонтитула)
  gap: 5, // воздух между эмблемой и соседним элементом
  w(h: number) {
    return (h * this.srcW) / this.srcH;
  },
};

let logosFetch: Promise<[string, string]> | null = null;

async function fetchPngDataUrl(url: string): Promise<string> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  const buf = await r.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++)
    binary += String.fromCharCode(bytes[i]);
  return "data:image/png;base64," + btoa(binary);
}

function loadLogos(): Promise<[string, string]> {
  if (!logosFetch) {
    logosFetch = Promise.all([
      fetchPngDataUrl("/brand/emblem-white-480.png"),
      fetchPngDataUrl("/brand/emblem-black-480.png"),
    ]).catch((err) => {
      logosFetch = null; // allow retry on next click
      throw err;
    });
  }
  return logosFetch;
}

/* ────────────────────────────────────────────────────────── shared utils */

function hairline(
  doc: jsPDF,
  x1: number,
  y: number,
  x2: number,
  color: [number, number, number] = C.line,
  w = 0.2,
) {
  doc.setDrawColor(...color);
  doc.setLineWidth(w);
  doc.line(x1, y, x2, y);
}

/** Точечный лидер «блюдо . . . . граммовка» — espresso/25. */
function dottedLeader(
  doc: jsPDF,
  x1: number,
  y: number,
  x2: number,
  color: [number, number, number] = C.dots,
) {
  if (x2 - x1 < 5) return;
  doc.setDrawColor(...color);
  doc.setLineWidth(0.25);
  doc.setLineDashPattern([0.35, 0.85], 0);
  doc.line(x1, y, x2, y);
  doc.setLineDashPattern([], 0);
}

/** «от одного гостя»: единица везде — гость (c86: обеды в офис удалены
 *  из каталога, «за порцию» больше не встречается). */
function unitFor(m: MenuType): string {
  void m;
  return "за гостя";
}

/** «7 позиций» / «21 позиция» / «3 позиции» — счётчик состава. */
function positionsWord(n: number): string {
  const d10 = n % 10;
  const d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return "позиция";
  if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return "позиции";
  return "позиций";
}

/** «7 каталогов» / «2 каталога» — счётчик каталогов в титульной подстроке. */
function catalogsWord(n: number): string {
  const d10 = n % 10;
  const d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return "каталог";
  if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return "каталога";
  return "каталогов";
}

const MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

/** «10 сентября 2025» — дата генерации без канцелярского «г.». */
function genDate(): string {
  const d = new Date();
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}`;
}

/* ── латинские слаги для имён файлов (nilov-catering-…-menu.pdf) ────────── */

const TYPE_SLUGS: Record<string, string> = {
  buffet: "buffet",
  banquet: "banquet",
  "snack-box": "snack-box",
  "coffee-break": "coffee-break",
  vegetarian: "vegetarian",
  bbq: "bbq",
};

const PKG_SLUGS: Record<string, string> = {
  "Базовый": "basic",
  "Стандарт": "standard",
  "Премиум": "premium",
  "Расширенный": "extended",
};

const CYR_SLUG: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e",
  ю: "yu", я: "ya",
};

function typeSlug(m: MenuType): string {
  const known = TYPE_SLUGS[m.id];
  if (known) return known;
  return m.id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("-");
}

function pkgSlug(pkg: MenuPackage): string {
  const known = PKG_SLUGS[pkg.name];
  if (known) return known;
  let out = "";
  for (const ch of pkg.name.toLowerCase()) {
    const c = CYR_SLUG[ch];
    if (c !== undefined) out += c;
    else if (/[a-z0-9]/.test(ch)) out += ch;
    else out += "-";
  }
  const slug = out.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

/** Человекочитаемые имена: nilov-catering-catalog.pdf /
 *  nilov-catering-banquet-premium-menu.pdf / nilov-catering-buffet-menu.pdf. */
function fileNameFor(types: MenuType[], pkg?: MenuPackage): string {
  if (types.length > 1) return "nilov-catering-catalog.pdf";
  const t = typeSlug(types[0]).toLowerCase();
  return pkg
    ? `nilov-catering-${t}-${pkgSlug(pkg).toLowerCase()}-menu.pdf`
    : `nilov-catering-${t}-menu.pdf`;
}

/* ─────────────────────────────────────────────────────── entry */

export async function buildMenuCatalogDoc(
  typeId = "all",
  pkgIdx?: number,
): Promise<jsPDF> {
  const types =
    typeId === "all" ? MENU_TYPES : MENU_TYPES.filter((m) => m.id === typeId);
  if (types.length === 0) throw new Error("no menus for typeId=" + typeId);

  /* c84-C: один тариф — pkgIdx осмыслен только для одиночного типа
     ("all" + pkgIdx игнорируется: у каталогов разные наборы пакетов) */
  const single = types.length === 1 ? types[0] : undefined;
  const pkg =
    single !== undefined &&
    pkgIdx !== undefined &&
    pkgIdx >= 0 &&
    pkgIdx < single.packages.length
      ? single.packages[pkgIdx]
      : undefined;
  if (single !== undefined && pkgIdx !== undefined && pkg === undefined) {
    throw new Error(
      `no package #${pkgIdx} in menu "${single.id}" (of ${single.packages.length})`,
    );
  }

  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  await loadFonts(doc);
  /* c93: логотип компании — в каждый PDF. Сбой загрузки (сеть) НЕ валит
     генерацию: логотип декоративен, меню без него валидно. */
  let logoWhite: string | null = null;
  let logoBlack: string | null = null;
  try {
    [logoWhite, logoBlack] = await loadLogos();
  } catch {
    /* тихо деградируем — кнопка не должна ломаться из-за декора */
  }
  doc.setFont("Roboto");
  doc.setLineJoin("round");
  doc.setLineCap("round");

  doc.setProperties({
    title:
      pkg && single
        ? `Меню «${single.label}» — пакет «${pkg.name}» — nilov catering`
        : "Каталог меню — nilov catering",
    subject: "Кейтеринг полного цикла · Санкт-Петербург",
    author: "nilov catering",
    creator: "nilov catering",
  });

  paintCream(doc);

  if (pkg && single) {
    /* c85-C: документ одного тарифа — титул → лид типа → капс «состав
       пакета» → блюда → «включено» → приписка условий + CTA. 3-c: цена
       с «от» — единая рамка честной цены, как у табов на сайте */
    const price = `от ${formatRUB(pkg.pricePerGuest)} ${unitFor(single)}`;
    let title = `МЕНЮ — ${single.label.toUpperCase()} · ${pkg.name.toUpperCase()}`;
    /* c86: гостевых минимумов нет — подпись без порога, состав согласуем
       под любое число гостей (владелец: принимаем заказ от одного гостя). */
    let subline =
      `Санкт-Петербург · ${genDate()} · состав согласуем под событие` +
      ` · принимаем заказ от одного гостя`;
    /* длинные пары («Доставка закусок · Горячее (3 шашлычка)» + цена)
       не влезают в строку титула — тариф уходит в подстроку */
    doc.setFont("Prata", "normal");
    doc.setFontSize(15);
    const tw = doc.getTextWidth(title);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(11);
    const pw = doc.getTextWidth(price);
    if (tw + pw + 12 > PAGE.contentW) {
      title = `МЕНЮ — ${single.label.toUpperCase()}`;
      subline = `Санкт-Петербург · ${genDate()} · пакет «${pkg.name}» · состав согласуем под событие`;
    }
    let y = drawTitleBlock(doc, { title, price, subline, logoWhite });
    y = drawSinglePackage(doc, single, pkg, y);
    drawClosing(doc, y);
  } else if (types.length > 1) {
    /* полный каталог: титул → секции всех типов потоком → CTA */
    let y = drawTitleBlock(doc, {
      title: "ПОЛНЫЙ КАТАЛОГ МЕНЮ",
      subline: `Санкт-Петербург · ${genDate()} · ${MENU_TYPES.length} ${catalogsWord(MENU_TYPES.length)} — от канапе до мангала`,
      logoWhite,
    });
    types.forEach((menu, i) => {
      y = drawCatalogSection(doc, menu, i === 0 ? y : y + 8);
    });
    drawClosing(doc, y);
  } else {
    /* одиночный тип без пакета (легаси-вызов menu.tsx) */
    const m = types[0];
    let y = drawTitleBlock(doc, {
      title: `МЕНЮ — ${m.label.toUpperCase()}`,
      price: `от ${formatRUB(m.perGuest)} ${unitFor(m)}`,
      subline: `Санкт-Петербург · ${genDate()}`,
      logoWhite,
    });
    y = drawCatalogSection(doc, m, y);
    drawClosing(doc, y);
  }

  drawPageFooters(doc, logoBlack);
  return doc;
}

export async function generateMenuPdf(
  typeId: string,
  pkgIdx?: number,
): Promise<void> {
  const types =
    typeId === "all" ? MENU_TYPES : MENU_TYPES.filter((m) => m.id === typeId);
  if (types.length === 0) return;

  /* c84-C: битый индекс — молча не генерируем «не то» (UI клампит,
     сюда попадаем только при рассинхроне данных) */
  if (
    types.length === 1 &&
    pkgIdx !== undefined &&
    (pkgIdx < 0 || pkgIdx >= types[0].packages.length)
  ) {
    return;
  }

  const doc = await buildMenuCatalogDoc(typeId, pkgIdx);

  const pkg =
    types.length === 1 &&
    pkgIdx !== undefined &&
    pkgIdx >= 0 &&
    pkgIdx < types[0].packages.length
      ? types[0].packages[pkgIdx]
      : undefined;

  doc.save(fileNameFor(types, pkg));
}

/* ────────────────────────────────────── страница: фон/полоса/титул/футер */

/** Крем-бумага #F7F5F1 во всю страницу — до любого контента. */
function paintCream(doc: jsPDF) {
  doc.setFillColor(...C.cream);
  doc.rect(0, 0, PAGE.w, PAGE.h, "F");
}

/** Бренд-полоса первой страницы: espresso 36 мм + золотые детали +
 *  эмблема компании (c93). logoWhite == null → вёрстка до-c93. */
function drawBrandBand(doc: jsPDF, logoWhite: string | null) {
  doc.setFillColor(...C.espresso);
  doc.rect(0, 0, PAGE.w, PAGE.bandH, "F");

  // бренд — Prata, крем
  doc.setTextColor(...C.cream);
  doc.setFont("Prata", "normal");
  doc.setFontSize(22);
  doc.text("nilov catering", PAGE.mL, 15.5);

  // золотая линия-отступ под брендом
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.35);
  doc.line(PAGE.mL, 20.5, PAGE.mL + 52, 20.5);

  // c93: эмблема — правый край полосы, по центру высоты (поля 5 мм)
  let scriptRight = PAGE.w - PAGE.mR;
  if (logoWhite) {
    const w = EMBLEM.w(EMBLEM.bandH);
    doc.addImage(
      logoWhite,
      "PNG",
      PAGE.w - PAGE.mR - w,
      (PAGE.bandH - EMBLEM.bandH) / 2,
      w,
      EMBLEM.bandH,
    );
    // рукописный акцент уходит левее эмблемы, 5 мм воздуха
    scriptRight = PAGE.w - PAGE.mR - w - EMBLEM.gap;
  }

  // рукописный акцент — Marck Script золотом, справа ниже
  doc.setFont("Marck", "normal");
  doc.setFontSize(13);
  doc.setTextColor(...C.gold);
  doc.text("food as art", scriptRight, 30.5, { align: "right" });

  // золотая кромка низа полосы
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.5);
  doc.line(0, PAGE.bandH, PAGE.w, PAGE.bandH);
}

/** Титульный блок первой страницы (под полосой). Возвращает y контента. */
function drawTitleBlock(
  doc: jsPDF,
  opts: { title: string; price?: string; subline: string; logoWhite?: string | null },
): number {
  drawBrandBand(doc, opts.logoWhite ?? null);

  doc.setFont("Prata", "normal");
  doc.setFontSize(15);
  doc.setTextColor(...C.espresso);
  doc.text(opts.title, PAGE.mL, 48);

  if (opts.price) {
    doc.setFont("Roboto", "bold");
    doc.setFontSize(11);
    doc.text(opts.price, PAGE.w - PAGE.mR, 48, { align: "right" });
  }

  doc.setFont("Roboto", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.soft);
  doc.text(opts.subline, PAGE.mL, 55);

  return 62;
}

/** Колонтитул страницы-продолжения. */
function drawContinuationHeader(doc: jsPDF, label: string) {
  doc.setFont("Roboto", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.faint);
  doc.setCharSpace(0.5);
  doc.text(label.toUpperCase(), PAGE.mL, 13);
  doc.setCharSpace(0);
  hairline(doc, PAGE.mL, 15.5, PAGE.w - PAGE.mR, C.line, 0.2);
}

/** Новая страница потока: крем + (опц.) колонтитул продолжения. */
function addContentPage(doc: jsPDF, contLabel: string | null): number {
  doc.addPage();
  paintCream(doc);
  if (contLabel) drawContinuationHeader(doc, contLabel);
  return CONTENT_TOP;
}

function makeEnsure(doc: jsPDF, cur: { y: number }, contLabel: string) {
  return (h: number) => {
    if (cur.y + h > PAGE.bottom) cur.y = addContentPage(doc, contLabel);
  };
}

/** Футер каждой страницы: линия + бренд/город слева, стр. N из M по центру,
 *  телефон + домен справа. c93: на страницах продолжения (≥2) — малая
 *  эмблема компании в правом верхнем углу (на 1-й — большая в полосе). */
function drawPageFooters(doc: jsPDF, logoBlack: string | null) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    if (i > 1 && logoBlack) {
      const w = EMBLEM.w(EMBLEM.contH);
      doc.addImage(
        logoBlack,
        "PNG",
        PAGE.w - PAGE.mR - w,
        6,
        w,
        EMBLEM.contH,
      );
    }
    hairline(doc, PAGE.mL, 282.5, PAGE.w - PAGE.mR, C.line, 0.2);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.faint);
    doc.text(`nilov catering · ${CONTACTS.city}`, PAGE.mL, 287);
    doc.text(`стр. ${i} из ${total}`, PAGE.w / 2, 287, { align: "center" });
    doc.text(
      `${CONTACTS.phone} · ${SITE_DOMAIN}`,
      PAGE.w - PAGE.mR,
      287,
      { align: "right" },
    );
  }
}

/* ─────────────────────────────────────────────── категория (золото-капс) */

const CAT = {
  base: 4, // базовая линия капс-подписи от y
  lineAt: 7.5, // волосяная линия под подписью
  descBase: 12.5, // первая строка описания
  descLH: 3.8, // межстрочное описание
  after: 6, // отбивка до контента
};

function categoryHeaderH(doc: jsPDF, desc: string): number {
  if (!desc) return CAT.lineAt + 5;
  doc.setFont("Roboto", "italic");
  doc.setFontSize(8.5);
  const lines: string[] = doc.splitTextToSize(desc, PAGE.contentW);
  return CAT.descBase + (lines.length - 1) * CAT.descLH + CAT.after;
}

/** Золотая капс-подпись 10 pt с трекингом + линия espresso/15 + описание. */
function drawCategoryHeader(
  doc: jsPDF,
  y: number,
  caps: string,
  rightCaps: string,
  desc: string,
): number {
  doc.setFont("Roboto", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.goldText);
  doc.setCharSpace(1);
  doc.text(caps, PAGE.mL, y + CAT.base);
  doc.setCharSpace(0);
  /* правая капс-подпись — БЕЗ трекинга: jsPDF align:"right" + charSpace
     сдвигает строку вправо за поля (замер c85-C: конец на 200.6 мм при
     поле 195 мм) — выравнивание по правому краю точное только без Tc */
  if (rightCaps) {
    doc.setFontSize(9);
    doc.setTextColor(...C.espresso);
    doc.text(rightCaps, PAGE.w - PAGE.mR, y + CAT.base, { align: "right" });
  }

  hairline(doc, PAGE.mL, y + CAT.lineAt, PAGE.w - PAGE.mR, C.line, 0.25);

  if (desc) {
    doc.setFont("Roboto", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.soft);
    const lines: string[] = doc.splitTextToSize(desc, PAGE.contentW);
    doc.text(lines, PAGE.mL, y + CAT.descBase);
  }
  return y + categoryHeaderH(doc, desc);
}

/* ─────────────────────────────────────────────────── пакет: шапка + блюда */

const PKG = {
  base: 4.8, // базовая линия имени пакета от y
  descBase: 10, // первая строка описания пакета
  descLH: 3.7,
  after: 4.5, // отбивка до первого блюда
};

function packageIntroH(doc: jsPDF, pkg: MenuPackage): number {
  doc.setFont("Roboto", "italic");
  doc.setFontSize(8.5);
  const lines: string[] = doc.splitTextToSize(
    pkg.description,
    PAGE.contentW - 34,
  );
  return PKG.descBase + (lines.length - 1) * PKG.descLH + PKG.after;
}

/** Имя пакета (Prata 13) + цена за гостя справа + описание курсивом. */
function drawPackageIntro(
  doc: jsPDF,
  menu: MenuType,
  pkg: MenuPackage,
  y: number,
): number {
  doc.setFont("Prata", "normal");
  doc.setFontSize(13);
  doc.setTextColor(...C.espresso);
  doc.text(pkg.name, PAGE.mL, y + PKG.base);

  doc.setFont("Roboto", "bold");
  doc.setFontSize(10.5);
  doc.text(
    /* 3-c: «от» у каждой ступени — как в табах меню на сайте */
    `от ${formatRUB(pkg.pricePerGuest)} ${unitFor(menu)}`,
    PAGE.w - PAGE.mR,
    y + PKG.base,
    { align: "right" },
  );

  doc.setFont("Roboto", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.soft);
  const lines: string[] = doc.splitTextToSize(
    pkg.description,
    PAGE.contentW - 34,
  );
  doc.text(lines, PAGE.mL, y + PKG.descBase);
  return y + packageIntroH(doc, pkg);
}

/** Единая сетка блюд (координаты посчитаны один раз, c85-C):
 *  имя Roboto-Bold 10.5 слева (перенос по nameW), граммовка Roboto-Regular
 *  10.5 по правому краю, точечный лидер espresso/25 между ними. */
const DISH = {
  base: 3.9, // базовая линия первой строки от y
  lineH: 4.5, // межстрочный шаг
  gap: 2.1, // отбивка до следующего блюда
  valW: 22, // резерв правой колонки под граммовку
  lead: 3, // воздух вокруг лидера
  get nameW() {
    return PAGE.contentW - this.valW - this.lead * 2; // 150 мм
  },
};

function dishRowH(doc: jsPDF, dish: Dish): number {
  doc.setFont("Roboto", "bold");
  doc.setFontSize(10.5);
  const lines: string[] = doc.splitTextToSize(dish.name, DISH.nameW);
  return DISH.base + (lines.length - 1) * DISH.lineH + DISH.gap;
}

function drawDish(doc: jsPDF, dish: Dish, y: number): number {
  doc.setFont("Roboto", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...C.espresso);
  const lines: string[] = doc.splitTextToSize(dish.name, DISH.nameW);
  const base = y + DISH.base;
  doc.text(lines, PAGE.mL, base);

  if (dish.weight) {
    const firstW = doc.getTextWidth(lines[0]);
    doc.setFont("Roboto", "normal");
    const valW = doc.getTextWidth(dish.weight);
    doc.text(dish.weight, PAGE.w - PAGE.mR, base, { align: "right" });
    dottedLeader(
      doc,
      PAGE.mL + firstW + DISH.lead,
      base - 0.9,
      PAGE.w - PAGE.mR - valW - DISH.lead,
    );
  }
  return y + DISH.base + (lines.length - 1) * DISH.lineH + DISH.gap;
}

/* ───────────────────────────────────────── «Включено в любой пакет» */

const INCL = {
  pad: 5.5, // внутренний отступ рамки
  titleBase: 8.5, // базовая линия заголовка
  itemsBase: 14.5, // первая строка пунктов
  colGap: 8, // промежуток колонок
  checkPad: 6.2, // отступ текста от галочки
  itemLH: 3.7,
  itemGap: 1.7,
  padBottom: 6,
  get colW() {
    return (PAGE.contentW - this.pad * 2 - this.colGap) / 2; // 80.5 мм
  },
};

/** Пункты → 2 колонки, жадная балансировка по числу строк. */
function includedColumns(doc: jsPDF, items: string[]): [string[], string[]] {
  doc.setFont("Roboto", "normal");
  doc.setFontSize(8.5);
  const lineCounts = items.map((it) => {
    const lines: string[] = doc.splitTextToSize(
      it,
      INCL.colW - INCL.checkPad,
    );
    return lines.length;
  });
  let bestK = 0;
  let bestDiff = Infinity;
  for (let k = 0; k <= items.length; k++) {
    const h1 = lineCounts.slice(0, k).reduce((s, n) => s + n, 0);
    const h2 = lineCounts.slice(k).reduce((s, n) => s + n, 0);
    const diff = Math.abs(h1 - h2);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestK = k;
    }
  }
  return [items.slice(0, bestK), items.slice(bestK)];
}

function includedBoxH(doc: jsPDF, items: string[]): number {
  const [c1, c2] = includedColumns(doc, items);
  const colH = (col: string[]) => {
    let s = 0;
    for (const it of col) {
      const lines: string[] = doc.splitTextToSize(
        it,
        INCL.colW - INCL.checkPad,
      );
      s += lines.length * INCL.itemLH + INCL.itemGap;
    }
    return s - INCL.itemGap;
  };
  return INCL.itemsBase + Math.max(colH(c1), colH(c2), 0) + INCL.padBottom;
}

/** Рамка золотом 0.8 pt: заголовок капс + пункты в 2 колонки с галочками. */
function drawIncluded(doc: jsPDF, items: string[], y: number): number {
  const h = includedBoxH(doc, items);
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.8);
  doc.rect(PAGE.mL, y, PAGE.contentW, h);

  doc.setFont("Roboto", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...C.goldText);
  doc.setCharSpace(0.9);
  doc.text("ВКЛЮЧЕНО В ЛЮБОЙ ПАКЕТ", PAGE.mL + INCL.pad, y + INCL.titleBase);
  doc.setCharSpace(0);

  const [c1, c2] = includedColumns(doc, items);
  const drawCol = (col: string[], x: number) => {
    let cy = y + INCL.itemsBase;
    for (const it of col) {
      drawHandCheck(doc, x, cy, C.gold);
      doc.setFont("Roboto", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.espresso);
      const lines: string[] = doc.splitTextToSize(
        it,
        INCL.colW - INCL.checkPad,
      );
      doc.text(lines, x + INCL.checkPad, cy);
      cy += lines.length * INCL.itemLH + INCL.itemGap;
    }
  };
  drawCol(c1, PAGE.mL + INCL.pad);
  drawCol(c2, PAGE.mL + INCL.pad + INCL.colW + INCL.colGap);
  return y + h + 4.5;
}

/** Галочка «от руки» — та же кривая, что HandCheck SVG на сайте (16×16). */
function drawHandCheck(
  doc: jsPDF,
  x: number,
  baselineY: number,
  color: [number, number, number] = C.espresso,
) {
  const s = 0.32; // 16u → ~5 мм
  const ox = x;
  const oy = baselineY - 4.8; // верх рамки галочки
  const p = (ux: number, uy: number): [number, number] => [
    ox + ux * s,
    oy + uy * s,
  ];
  doc.setDrawColor(...color);
  doc.setLineWidth(0.5);
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

/* ─────────────────────────────────────────── финал: приписка + CTA-блок */

/** Приписка условий (цены за гостя, включённые официанты, минимальные
    заказы форматов) + CTA «Соберите смету за 1 минуту», прижатый к низу. */
function drawClosing(doc: jsPDF, y0: number) {
  let y = y0 + 2;
  const ctaH = 24;
  const yCta = PAGE.bottom - ctaH - 3.5;
  doc.setFont("Roboto", "italic");
  doc.setFontSize(7.5);
  /* 3-c: сезонный коэффициент отменён — вместо него честные условия.
     Шрифт/кегль выставлены ДО splitTextToSize (перенос считается по
     ним); длинная строка минимумов честно бьётся на несколько строк */
  const lines = [
    "Цены — за одного гостя. Официанты входят в стоимость пакетов.",
    "Минимальный заказ: фуршет, банкет, вегетарианское и барбекю — 85 000 ₽, кофе-брейк — 50 000 ₽, доставка закусок — 17 400 ₽ (заказ принимается за 48 часов).",
  ].flatMap((t) => doc.splitTextToSize(t, PAGE.contentW));
  const blockH = (lines.length - 1) * 3.4;
  if (y + 4.5 + blockH > yCta - 6) {
    doc.addPage();
    paintCream(doc);
    y = CONTENT_TOP;
  }
  doc.setTextColor(...C.faint);
  lines.forEach((line, i) => {
    doc.text(line, PAGE.mL, y + 4 + i * 3.4);
  });
  drawCta(doc, yCta);
}

function drawCta(doc: jsPDF, y: number) {
  doc.setFillColor(...C.deep);
  doc.rect(PAGE.mL, y, PAGE.contentW, 24, "F");

  doc.setFont("Prata", "normal");
  doc.setFontSize(13);
  doc.setTextColor(...C.cream);
  doc.text("Соберите смету за 1 минуту", PAGE.mL + 8, y + 10);

  doc.setFont("Roboto", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...C.gold);
  doc.text(CONTACTS.phone, PAGE.w - PAGE.mR - 8, y + 10, { align: "right" });

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.onDarkMuted);
  doc.text(CONTACTS.email, PAGE.mL + 8, y + 17.5);
  doc.text(SITE_DOMAIN, PAGE.w - PAGE.mR - 8, y + 17.5, { align: "right" });
}

/* ────────────────────────────────────────────────── секции-потоки */

/** Документ одного тарифа: лид типа → капс «состав пакета» → блюда → рамка. */
function drawSinglePackage(
  doc: jsPDF,
  menu: MenuType,
  pkg: MenuPackage,
  y0: number,
): number {
  const cur = { y: y0 };
  const contLabel = `${menu.label} · ${pkg.name}`;
  const ensure = makeEnsure(doc, cur, contLabel);

  // лид — описание типа события (контекст для клиента)
  doc.setFont("Roboto", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(...C.soft);
  const typeLines: string[] = doc.splitTextToSize(
    menu.description,
    PAGE.contentW - 18,
  );
  ensure(3.5 + typeLines.length * 4.1 + 4);
  doc.text(typeLines, PAGE.mL, cur.y + 3.5);
  cur.y += 3.5 + typeLines.length * 4.1 + 5.5;

  // капс «состав пакета» + описание пакета под линией
  cur.y = drawCategoryHeader(
    doc,
    cur.y,
    "СОСТАВ ПАКЕТА",
    "",
    pkg.description,
  );

  for (const dish of pkg.dishes) {
    ensure(dishRowH(doc, dish));
    cur.y = drawDish(doc, dish, cur.y);
  }
  cur.y += 2;

  const inclH = includedBoxH(doc, menu.included);
  ensure(inclH + 4.5);
  return drawIncluded(doc, menu.included, cur.y);
}

/** Секция каталога: капс-категория → пакеты (Prata-шапки + блюда) → рамка.
 *  onlyPkg — c84-C фильтр одного пакета (per-tariff внутри каталога). */
function drawCatalogSection(
  doc: jsPDF,
  menu: MenuType,
  y0: number,
  onlyPkg?: number,
): number {
  const cur = { y: y0 };
  const selPkg = onlyPkg !== undefined ? menu.packages[onlyPkg] : undefined;
  const contLabel = selPkg ? `${menu.label} · ${selPkg.name}` : menu.label;
  const ensure = makeEnsure(doc, cur, contLabel);

  /* widow-гвард категории: заголовок + шапка первого пакета + 2 блюда
     держатся вместе — категория не остаётся сиротой внизу страницы */
  const catH = categoryHeaderH(doc, menu.description);
  const first = selPkg ?? menu.packages[0];
  const first2 = first.dishes
    .slice(0, 2)
    .reduce((s, d) => s + dishRowH(doc, d), 0);
  if (cur.y + catH + packageIntroH(doc, first) + first2 > PAGE.bottom) {
    cur.y = addContentPage(doc, null); // чистая страница: категория сама себя называет
  }

  cur.y = drawCategoryHeader(
    doc,
    cur.y,
    menu.label.toUpperCase(),
    `ОТ ${formatRUB(menu.perGuest)} ${unitFor(menu).toUpperCase()}`,
    menu.description,
  );

  menu.packages.forEach((pkg, idx) => {
    if (onlyPkg !== undefined && idx !== onlyPkg) return;
    const hdrH = packageIntroH(doc, pkg);
    const dishesH = pkg.dishes.reduce((s, d) => s + dishRowH(doc, d), 0);

    /* «включено» не отрывается от последнего пакета: если пакет + рамка
       не помещаются на остатке, но помещаются на свежей странице —
       переносим их ВМЕСТЕ (страница не рвётся на 3 строки + рамка) */
    const isLast = onlyPkg !== undefined || idx === menu.packages.length - 1;
    if (isLast) {
      const inclH = includedBoxH(doc, menu.included);
      const needed = hdrH + dishesH + 3.5 + inclH + 4.5;
      if (
        cur.y + needed > PAGE.bottom &&
        needed <= PAGE.bottom - CONTENT_TOP &&
        cur.y > CONTENT_TOP + 6
      ) {
        cur.y = addContentPage(doc, contLabel);
      }
    }

    // шапка пакета не отрывается от первых двух блюд
    ensure(hdrH + first2);

    cur.y = drawPackageIntro(doc, menu, pkg, cur.y);
    for (const dish of pkg.dishes) {
      ensure(dishRowH(doc, dish));
      cur.y = drawDish(doc, dish, cur.y);
    }
    cur.y += 3.5;
  });

  const inclH = includedBoxH(doc, menu.included);
  ensure(inclH + 4.5);
  return drawIncluded(doc, menu.included, cur.y);
}
