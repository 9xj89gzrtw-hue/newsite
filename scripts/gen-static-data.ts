/**
 * c95 (Task 1-a) — генератор публичных артефактов данных из единого
 * источника src/data/menu.json. Запуск: `bun scripts/gen-static-data.ts`
 * (в npm-скрипте build — до next build, чтобы артефакты попали в
 * статический экспорт out/).
 *
 * Артефакты (public/data/ — в .gitignore, всегда пересобираются):
 *  - public/data/menu.json — байт-в-байт копия src/data/menu.json
 *    (рантайм-потребители: будущая админ-панель /admin для диффа черновика);
 *  - public/data/media-manifest.json — { "files": ["/media/…", …] }:
 *    рекурсивный листинг public/media, только картинки/видео, URL,
 *    отсортированные лексикографически. Без таймстампа — генерация
 *    ИДЕМПОТЕНТНА (повторный запуск не меняет файлы → чистый git diff);
 *  - public/llms.txt — строка «Форматы и цены «от»:» перегенерируется из
 *    menu.json (те же значения, что у калькулятора и меты; порядок и
 *    формулировки — как в исторической строке, байт-идентично).
 */
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const PUBLIC_DIR = join(ROOT, "public");
const DATA_DIR = join(PUBLIC_DIR, "data");
const MEDIA_DIR = join(PUBLIC_DIR, "media");
const LLMS_PATH = join(PUBLIC_DIR, "llms.txt");
const MENU_SRC = join(ROOT, "src", "data", "menu.json");

/** Разделитель тысяч — ОБЫЧНЫЙ пробел (историческая типографика llms.txt
 *  и меты; NBSP от Intl дал бы байт-расхождение — c95-гейт идентичности). */
const fmt = (n: number): string =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/* ----------------------------------------------------- 1) public/data/menu */

mkdirSync(DATA_DIR, { recursive: true });
const menuRaw = readFileSync(MENU_SRC, "utf8");
writeFileSync(join(DATA_DIR, "menu.json"), menuRaw);

const menu = JSON.parse(menuRaw) as {
  menuTypes: Array<{
    id: string;
    label: string;
    perGuest: number;
    calcPerGuest?: number;
  }>;
  minOrder: Record<string, number>;
};

/* --------------------------------------------------- 2) media-manifest.json */

const MEDIA_EXTS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
  ".mp4",
  ".svg",
]);

function walk(dir: string, out: string[] = []): string[] {
  const entries = readdirSync(dir);
  entries.sort();
  for (const name of entries) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      walk(p, out);
    } else if (MEDIA_EXTS.has(extname(name).toLowerCase())) {
      out.push("/" + relative(PUBLIC_DIR, p).split(sep).join("/"));
    }
  }
  return out;
}

const mediaFiles = walk(MEDIA_DIR).sort();
writeFileSync(
  join(DATA_DIR, "media-manifest.json"),
  JSON.stringify({ files: mediaFiles }, null, 2) + "\n",
);

/* ------------------------------------------------------------ 3) llms.txt */

/** Строка цен форматов: порядок и формулировки — исторические (сверено
 *  байт-в-байт с прежним захардкоженным текстом llms.txt). «выездное
 *  барбекю» и «кофе-брейк» — литеральные формулировки строки, не label. */
const LLMS_FORMAT_ORDER: Array<{ id: string; phrase: string }> = [
  { id: "buffet", phrase: "фуршет" },
  { id: "banquet", phrase: "банкет" },
  { id: "bbq", phrase: "выездное барбекю" },
  { id: "vegetarian", phrase: "вегетарианское" },
  { id: "coffee-break", phrase: "кофе-брейк" },
  { id: "snack-box", phrase: "доставка закусок" },
];

/** Хвост строки после списка форматов — литеральный (не ценовые данные). */
const LLMS_TAIL =
  "; принимаем заказы от одного гостя. В стоимость входит: еда, " +
  "доставка в пределах КАД, сервировка, посуда и текстиль, повар и " +
  "официанты на месте, лёгкое цветочное сопровождение. Не входит: аренда " +
  "площадки, алкоголь, музыка, расширенная флористика — поможем " +
  "организовать по запросу.";

const byId = new Map(menu.menuTypes.map((t) => [t.id, t]));

const parts: string[] = [];
for (const { id, phrase } of LLMS_FORMAT_ORDER) {
  const t = byId.get(id);
  if (!t) continue; // формата нет в menu.json — строку не ломаем
  if (id === "snack-box") {
    /* Единая цена калькулятора + минимальный заказ формата (48 часов —
       литеральная оговорка владельца из исторической строки). */
    const price = t.calcPerGuest ?? t.perGuest;
    parts.push(
      `${phrase} — от ${fmt(price)} ₽/чел (минимальный заказ ${fmt(menu.minOrder[id] ?? 0)} ₽, заказ принимается за 48 часов)`,
    );
  } else {
    parts.push(`${phrase} — от ${fmt(t.perGuest)} ₽/чел`);
  }
}
/* Будущие форматы (добавленные через админку) — дефолтной формулировкой. */
for (const t of menu.menuTypes) {
  if (!LLMS_FORMAT_ORDER.some((f) => f.id === t.id)) {
    parts.push(`${t.label.toLowerCase()} — от ${fmt(t.perGuest)} ₽/чел`);
  }
}

const priceLine = `Форматы и цены «от»: ${parts.join("; ")}${LLMS_TAIL}`;

const llms = readFileSync(LLMS_PATH, "utf8");
const lines = llms.split("\n");
let replaced = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith("Форматы и цены «от»:")) {
    lines[i] = priceLine;
    replaced++;
  }
}
if (replaced !== 1) {
  console.error(
    `✗ llms.txt: ожидалась ровно одна строка «Форматы и цены «от»:», найдено ${replaced} — файл не изменён.`,
  );
  process.exit(1);
}
writeFileSync(LLMS_PATH, lines.join("\n"));

console.log(
  `✓ public/data/menu.json + media-manifest.json (${mediaFiles.length} файлов) сгенерированы; строка цен llms.txt обновлена (${parts.length} форматов).`,
);
