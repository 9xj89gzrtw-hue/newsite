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
 *    формулировки — как в исторической строке, байт-идентично);
 *  - public/llms-full.txt (c99) — полная LLM-форма фактов генерируется
 *    ЦЕЛИКОМ: ценовые секции — из menu.json, абзац фактов — из llms.txt
 *    (один источник правды), остальное — статический шаблон (FAQ/контакты/
 *    реквизиты зеркалят page.tsx и lib/config.ts). Идемпотентно, без дат.
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

/* ----------------------------------------------------- 4) llms-full.txt */

/** c99 (R1 §4 / чек-лист Е-26): полная LLM-форма фактов — llmstxt.org
 *  (llms.txt = карта, llms-full.txt = развёрнутый фактаж для agentic-
 *  краулеров и ИИ-ассистентов; SE Ranking 11.2025: эффекта на цитируемость
 *  нет, но безвредно — Яндекс сам публикует llms-full для своей справки).
 *  Ценовые секции — производные menu.json (как строка цен llms.txt):
 *  публикация из админки обновляет файл на каждом build — split-brain цен
 *  исключён (урок c89-W1). Абзац «Ключевые факты» извлекается из llms.txt
 *  (один источник правды). FAQ — 1-в-1 из faqJsonLd src/app/page.tsx,
 *  контакты/реквизиты — из lib/config.ts (CONTACTS/LEGAL_INFO): правки
 *  этих источников — синхронно с шаблоном ниже. Идемпотентно, без дат. */

type FullDish = { name: string; weight?: string };
type FullPackage = {
  name: string;
  pricePerGuest: number;
  description?: string;
  dishes?: FullDish[];
};
type FullMenuType = {
  id: string;
  label: string;
  perGuest: number;
  calcPerGuest?: number;
  description?: string;
  packages?: FullPackage[];
  included?: string[];
};
type FullAddon = { id: string; label: string; price?: number; percent?: number };
type FullServicePanel = { id: string; label: string; priceLabel: string };

const fullMenu = JSON.parse(menuRaw) as {
  menuTypes: FullMenuType[];
  addons: FullAddon[];
  servicePanels: FullServicePanel[];
  minOrder: Record<string, number>;
};

/** NBSP (U+00A0) в priceLabel/текстах меню → обычный пробел: LLM-
 *  токенизаторы читают NBSP внутри чисел как мусорный символ. */
const nbspToSpace = (s: string): string => s.replace(/\u00A0/g, " ");

/* Абзац фактов — из llms.txt (тот же текст, что уже выверен владельцем).
 * Гейт «ровно одна строка» — как у ценовой строки выше. */
const factLines = lines.filter((l) => l.startsWith("Ключевые факты:"));
if (factLines.length !== 1) {
  console.error(
    `✗ llms.txt: ожидался ровно один абзац «Ключевые факты:», найдено ${factLines.length} — llms-full.txt не собран.`,
  );
  process.exit(1);
}
const factsParagraph = factLines[0];

/* Заголовок формата: цена калькулятора (calcPerGuest ?? perGuest) —
 * та же логика, что у ценовой строки llms.txt и меты («доставка закусок —
 * от 1 200 ₽», а не каталог-минимум à la carte). Для snack-box добавляем
 * честную оговорку про обе цены (каталог vs смета «всё включено»). */
const menuSections = fullMenu.menuTypes
  .map((t) => {
    const out: string[] = [];
    const price = t.calcPerGuest ?? t.perGuest;
    out.push(`### ${t.label} — от ${fmt(price)} ₽/чел`);
    if (t.description) out.push(nbspToSpace(t.description));
    if (t.calcPerGuest != null && t.calcPerGuest !== t.perGuest) {
      const min = fullMenu.minOrder[t.id] ?? 0;
      out.push(
        `Каталог — наборы à la carte от ${fmt(t.perGuest)} ₽/чел; смета «всё включено» в калькуляторе — от ${fmt(t.calcPerGuest)} ₽/чел (минимальный заказ ${fmt(min)} ₽, заказ принимается за 48 часов).`,
      );
    }
    const pkgs = t.packages ?? [];
    if (pkgs.length > 0) {
      out.push("");
      out.push("Пакеты:");
      for (const p of pkgs) {
        const head = `- **${p.name} — ${fmt(p.pricePerGuest)} ₽/чел.**`;
        out.push(p.description ? `${head} ${nbspToSpace(p.description)}` : head);
        for (const d of p.dishes ?? []) {
          out.push(`  - ${nbspToSpace(d.name)}${d.weight ? ` — ${d.weight}` : ""}`);
        }
      }
    }
    if (t.included && t.included.length > 0) {
      out.push("");
      out.push(`Входит во все пакеты: ${t.included.map(nbspToSpace).join("; ")}.`);
    }
    return out.join("\n");
  })
  .join("\n\n");

const addonsLines = fullMenu.addons
  .map((a) =>
    a.percent != null
      ? `- ${a.label} — +${a.percent}% от подытога меню`
      : `- ${a.label} — от ${fmt(a.price ?? 0)} ₽`,
  )
  .join("\n");

const minOrderLines = Object.entries(fullMenu.minOrder)
  .map(([id, sum]) => {
    const t = fullMenu.menuTypes.find((m) => m.id === id);
    return `- ${t ? t.label : id} — ${fmt(sum)} ₽`;
  })
  .join("\n");

const serviceLines = fullMenu.servicePanels
  .map((s) => `- ${s.label} — ${nbspToSpace(s.priceLabel)}`)
  .join("\n");

/* FAQ — 1-в-1 из faqJsonLd src/app/page.tsx (Google-гайдлайн: разметка
 * зеркалит видимый FAQ; меняем синхронно с секцией EaFaqAccordion). */
const FAQ_FULL: Array<[string, string]> = [
  ["От скольких гостей вы принимаете заказ?", "От одного. Ужин на двоих, семейное торжество, банкет на пятьсот человек — обсудим формат, соберём меню под повод и площадку."],
  ["За сколько дней нужно бронировать?", "Свадьбы и большие банкеты лучше бронировать за несколько недель — успеем собрать меню, смету и команду. Корпоративные и семейные форматы — за несколько дней. А если срочно — просто позвоните, постараемся выручить."],
  ["Что входит в стоимость?", "Еда, доставка по городу в пределах КАД (загородные форматы — по области, зону подтвердим при заказе), сервировка, посуда и текстиль, повар и официанты на площадке, лёгкое цветочное сопровождение столов. Не входит аренда площадки, алкоголь и музыка — с ними поможем организовать."],
  ["Учтёте аллергии и особые диеты?", "Да. Вегетарианское, веганское, безглютеновое, халяль, кошер — адаптируем меню. Аллергии просим сообщить при заказе, кухня учтёт их в каждом блюде."],
  ["Как проходит оплата?", "Предоплата при подтверждении заказа, финальный расчёт — до события. Для юридических лиц работаем по безналичному расчёту. Точные условия фиксируем в договоре."],
  ["С чего начать?", "Оставьте заявку или позвоните. Обсудим повод и формат, предложим меню, пришлём смету. Дальше — договор, и в день события на вашей площадке работает наша команда."],
];

const faqLines = FAQ_FULL.map(([q, a]) => `### ${q}\n\n${a}`).join("\n\n");

const llmsFull = `# NILOV CATERING

> Премиальный кейтеринг полного цикла в Санкт-Петербурге — «Нилов Кейтеринг» (nilov catering, домен nilovcatering.ru). С 2007 года — 2400+ мероприятий и 120 000+ гостей: фуршеты, банкеты, свадьбы, корпоративы, кофе-брейки, выездное барбекю и доставка закусок. «Еда как искусство» — выездной ресторан с поварами и официантами на вашей площадке.

${factsParagraph}

${priceLine}

## Меню и пакеты

Все цены — за человека; «от» = минимальный пакет формата. Состав позиций и граммовки каждой подачи — как в каталоге сайта; данные обновляются при публикации меню.

${menuSections}

## Допуслуги

${addonsLines}

## Минимальные суммы заказа

${minOrderLines}

## Услуги и поводы

${serviceLines}

## О компании

- [Страница «О компании»](https://nilovcatering.ru/about): год основания (2007), 2400+ мероприятий, 120 000+ гостей, основатель Дмитрий Нилов, ИП Нилова А.Д., география — Санкт-Петербург и Ленинградская область, форматы с ценами «от» — каноническая страница фактов для цитирования.

## Частые вопросы

${faqLines}

## Контакты

- Телефон: +7 (911) 941-72-05 (tel:+79119417205); Telegram и WhatsApp — на этот же номер
- Мессенджер «Макс»: +7 (911) 826-39-26
- Email: dmitry_nilov@mail.ru
- Офис: Санкт-Петербург, ул. Полевая Сабировская, 45, к. 1 (карта: https://yandex.ru/maps/-/CTHo6Xkp)
- Заявки принимаем круглосуточно; заказы — от одного гостя; срочные заказы — решаем по звонку

## Реквизиты

- ИП Нилова Анастасия Дмитриевна
- ОГРНИП 325784700453130; ИНН 781442293901
- Юридический адрес: 197345, г. Санкт-Петербург, ул. Мебельная, д. 45, корп. 2, литера А, кв. 407
- Банк: АО «ТБанк» (БИК 044525974), р/с 40802810200009199197, к/с 30101810145250000974

## Документы

- [Публичная оферта](https://nilovcatering.ru/offer): условия оказания кейтеринговых услуг — перечень услуг, стоимость и порядок расчётов, сроки, расторжение договора, реквизиты ИП.
- [Политика конфиденциальности](https://nilovcatering.ru/privacy): порядок обработки персональных данных в соответствии с 152-ФЗ.
- [Пользовательское соглашение](https://nilovcatering.ru/terms): правила использования сайта и порядок заключения договора на кейтеринговые услуги.

## Соцсети и каналы

- [Instagram](https://www.instagram.com/nilov_catering): фотоотчёты с мероприятий и Reels (принадлежит Meta — признанной экстремистской и запрещённой в РФ).
- [ВКонтакте](https://vk.com/nilovcatering): сообщество компании, новости и кейсы.
- [Telegram-канал](https://t.me/nilov_catering): новости и фотоотчёты компании.
- [Telegram-чат](https://t.me/+79119417205): прямая переписка с менеджером (номер +7 (911) 941-72-05).
- [WhatsApp](https://wa.me/79119417205): быстрый расчёт и бронирование (номер +7 (911) 941-72-05).
- [YouTube](https://youtube.com/@nilovcatering): видео с мероприятий.
- [Макс](https://max.ru/u/f9LHodD0cOLcnReQpyQHwFiG5c5jpXP58e8Ni38wbQC2lpDWdSCYkXsZ8ak): переписка с менеджером (номер +7 (911) 826-39-26).

---

Краткая карта сайта — [llms.txt](https://nilovcatering.ru/llms.txt). Файл генерируется сборкой из единого источника данных меню (src/data/menu.json); цены соответствуют калькулятору на сайте.
`;

writeFileSync(join(PUBLIC_DIR, "llms-full.txt"), llmsFull);

console.log(
  `✓ public/data/menu.json + media-manifest.json (${mediaFiles.length} файлов) сгенерированы; строка цен llms.txt обновлена (${parts.length} форматов); llms-full.txt сгенерирован (${fullMenu.menuTypes.length} форматов меню, ${FAQ_FULL.length} вопросов).`,
);
