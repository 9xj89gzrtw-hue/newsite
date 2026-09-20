/**
 * c99 (Task 1) — генератор PDF-меню для EMAIL-вложений (public/menu-pdf/).
 *
 * ЗАЧЕМ: подтверждение клиенту теперь уходит с PDF-меню ЕГО тарифа
 * (lead.php → mail_send(..., $attachments)). Браузерный jsPDF-конвейер
 * (src/lib/pdf-client.ts, кнопки «Скачать меню») недоступен серверному
 * PHP — поэтому артефакты генерируются ЗДЕСЬ, в build-цепочке (как
 * gen-static-data.ts), из ТОГО ЖЕ источника src/data/menu.json и ТОГО ЖЕ
 * лэйаут-кода buildMenuCatalogDoc: сайт и письмо неотличимы.
 *
 * КАК: jsPDF работает и в Node/bun (там нет только doc.save-браузерных
 * вызовов — мы их не трогаем, вместо save пишем doc.output). Единственная
 * browser-зависимость pdf-client.ts — fetch() ОТНОСИТЕЛЬНЫХ URL шрифтов
 * и эмблем (/fonts/..., /brand/...): до вызова генераторов патчим
 * globalThis.fetch на чтение файлов из public/ (динамический import —
 * гарантия, что патч стоит раньше любого вызова).
 *
 * АРТЕФАКТЫ (public/menu-pdf/ — в .gitignore, всегда пересобираются):
 *  - menu-{typeId}-{pkgIdx}.pdf — по одному на каждый пакет каждого
 *    формата (17 шт: 3+3+4+3+2+2) — «его тариф» из калькулятора;
 *  - menu-all.pdf — полный каталог (fallback: заявка без тарифа —
 *    контактная форма/подвал — клиент всё равно получает меню);
 *  - manifest.json — карта для lead.php: typeId+pkgIdx → файл + имена
 *    вложения (ASCII-транслит для filename= и кириллица для
 *    filename*=UTF-8'' — RFC 6266, читается во всех почтовых клиентах).
 *
 * НЕидемпотентность (c99-fix, критик crit3-1.5): PDF меняется на КАЖДОМ
 * прогоне — jsPDF пишет посекундный /CreationDate и случайный /ID (замер:
 * два прогона в одну секунду отличаются 61 байтом), плюс genDate() в
 * титуле. Поэтому public/menu-pdf/ в .gitignore, CI собирает вложения
 * заново. Стабильна только manifest.json (без дат). Детерминизм при
 * необходимости: doc.setCreationDate(new Date(0)) + setFileId() — не
 * включено осознанно (одинаковые байты = ложное чувство «не менялось»
 * при изменившемся menu.json).
 *
 * Запуск: bun scripts/gen-menu-pdfs.ts (в npm-скрипте build — до next
 * build, чтобы файлы попали в статический экспорт out/).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const PUBLIC_DIR = join(ROOT, "public");
const OUT_DIR = join(PUBLIC_DIR, "menu-pdf");
const MENU_SRC = join(ROOT, "src", "data", "menu.json");

/* --------------------------- 1) fetch-патч: public/ как корень ---------- */

type FetchLike = typeof globalThis.fetch;
const realFetch: FetchLike = globalThis.fetch;

const patchedFetch: FetchLike = (async (input, init) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : (input as Request | undefined)?.url;
  /* Относительные «сайтовые» URL (/fonts/..., /brand/...) — файлы из
   * public/. Прочие (http/https, data:) — оригинальный fetch. */
  if (typeof url === "string" && url.startsWith("/") && !url.startsWith("//")) {
    const filePath = join(PUBLIC_DIR, url);
    const data = readFileSync(filePath); // файла нет → бросится → генерация
    // упадёт громко (шрифты критичны; эмблемы в pdf-client деградируют тихо)
    return new Response(new Uint8Array(data), {
      status: 200,
      headers: { "Content-Type": "application/octet-stream" },
    });
  }
  return realFetch(input as Parameters<FetchLike>[0], init);
}) as FetchLike;

globalThis.fetch = patchedFetch;

/* btoa в bun глобален — pdf-client.ts его использует для base64; на всякий
 * случай страховки не нужно (bun >= 1.0), проверено локальным прогоном. */

/* --------------------------- 2) генерация ------------------------------- */

interface MenuPackageJson {
  name: string;
}
interface MenuTypeJson {
  id: string;
  label: string;
  packages: MenuPackageJson[];
}

const menu = JSON.parse(readFileSync(MENU_SRC, "utf8")) as {
  menuTypes: MenuTypeJson[];
};

/** Транслитерация ru→lat для ASCII-filename вложения (filename=).
 *  Схема — «съедобная» для почтовых клиентов и глаз (ГОСТ 7.97 без
 *  апострофов: yu/ya/cz→ch, «ъ/ь» опускаются). */
function translit(s: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
    я: "ya",
  };
  let out = "";
  for (const ch of s.toLowerCase()) {
    out += map[ch] ?? ch;
  }
  return out
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** Имя вложения ASCII (filename= — фолбэк старых клиентов). */
function asciiFileName(label: string, pkgName: string | null): string {
  const l = translit(label);
  const p = pkgName ? "-" + translit(pkgName) : "";
  return `nilov-catering-menu-${l}${p}.pdf`;
}

/** Имя вложения кириллицей (filename*=UTF-8'' — RFC 6266). */
function utf8FileNameStar(label: string, pkgName: string | null): string {
  const base = pkgName
    ? `nilov-catering-меню-${label}-${pkgName}.pdf`
    : `nilov-catering-меню-${label}.pdf`;
  return encodeURIComponent(base);
}

interface ManifestEntry {
  typeId: string;
  pkgIdx: number | null;
  file: string;
  /** Человекочитаемо для админки/журналов: «Фуршет · Премиум». */
  label: string;
  /** filename= (ASCII-фолбэк). */
  fileName: string;
  /** filename*=UTF-8''<percent-encoded> (кириллица). */
  fileNameStar: string;
}

async function main(): Promise<void> {
  /* Динамический import ПОСЛЕ fetch-патча (ESM-хоистинг не подвластен
   * телу модуля, но вызовы fetch внутри pdf-client происходят только в
   * рантайме функций — патч успевает всегда; динамический import —
   * дополнительная гарантия порядка). */
  const { buildMenuCatalogDoc } = await import("../src/lib/pdf-client.ts");

  mkdirSync(OUT_DIR, { recursive: true });

  const entries: ManifestEntry[] = [];
  let generated = 0;

  for (const type of menu.menuTypes) {
    for (let pkgIdx = 0; pkgIdx < type.packages.length; pkgIdx++) {
      const pkg = type.packages[pkgIdx];
      const doc = await buildMenuCatalogDoc(type.id, pkgIdx);
      const file = `menu-${type.id}-${pkgIdx}.pdf`;
      writeFileSync(
        join(OUT_DIR, file),
        new Uint8Array(doc.output("arraybuffer")),
      );
      generated++;
      entries.push({
        typeId: type.id,
        pkgIdx,
        file,
        label: `${type.label} · ${pkg.name}`,
        fileName: asciiFileName(type.label, pkg.name),
        fileNameStar: utf8FileNameStar(type.label, pkg.name),
      });
    }
  }

  /* Полный каталог — fallback для заявок без тарифа. */
  const allDoc = await buildMenuCatalogDoc("all");
  writeFileSync(
    join(OUT_DIR, "menu-all.pdf"),
    new Uint8Array(allDoc.output("arraybuffer")),
  );
  generated++;
  entries.push({
    typeId: "all",
    pkgIdx: null,
    file: "menu-all.pdf",
    label: "Полный каталог меню",
    fileName: asciiFileName("полный-каталог", null),
    fileNameStar: utf8FileNameStar("полный-каталог", null),
  });

  const manifest = {
    /* Дата генерации = дата, впечатанная в титулы PDF (genDate()) —
     * манифест и файлы согласованы; прогоны одного дня идентичны. */
    version: 1,
    entries,
  };
  writeFileSync(
    join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );

  console.log(
    `gen-menu-pdfs: ${generated} PDF (${entries.length} записей манифеста) → public/menu-pdf/`,
  );
}

main().catch((err) => {
  console.error("gen-menu-pdfs FAILED:", err);
  process.exit(1);
});
