/**
 * gen-lqip.ts — генератор LQIP-карты (24px WebP data-URI) для фото в тёмных
 * рамках. c117 (владелец: «сначала чёрный прямоугольник, потом фото» —
 * основатель; задача: вычистить аналогичные по всему сайту).
 *
 * Источники-потребители карты (src/lib/lqip.ts):
 *   - spiral-services.tsx  — .sp-card__media / .sp-lcard__media (#0e0b09)
 *   - ea-careers-block.tsx — .ea-careers__image-frame (#0E0907, blurDataURL)
 *
 * Запуск: bun scripts/gen-lqip.ts (sharp уже в дереве Next.js).
 * Перезапускать при смене/добавлении фото в этих блоках — карта коммитится
 * (data-URI по ~0.5КБ, суммарно <8КБ бандла; конвенция: генераторы
 * data-driven, выход детерминирован).
 */
import sharp from "sharp";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/** Потребители карты: компонент → список путей (public/**). */
const TARGETS: Record<string, string[]> = {
  "spiral-services.tsx (.sp-card__media / .sp-lcard__media, #0e0b09)": [
    "/media/furshet-1.jpg",
    "/media/gamma/gamma-catering-ballroom-chandelier-banquet.jpg",
    "/media/event-wedding-light.jpg",
    "/media/gamma/firmenevent-messe-gala-bankett-gammacatering.jpg",
    "/media/menu-coffee-break.jpg",
    "/media/talkofthetown/talkofthetown-section-paella-station.jpg",
    "/media/gamma/sommelier-uniform-weinservice-gammacatering.jpg",
    "/media/gamma/showkueche-live-cooking-koeche-gammacatering.jpg",
    "/media/menu-snack-box.jpg",
    "/media/concorde-dessert.jpg",
    "/media/ridgewells-veg-mosaic.jpg",
    "/media/gamma/event-service-tischeindeckung-gala-gammacatering.jpg",
  ],
  "ea-careers-block.tsx (.ea-careers__image-frame, #0E0907)": [
    "/media/concept-crew.jpg",
  ],
};

const root = resolve(import.meta.dir, "..");

async function lqipDataUri(absPath: string): Promise<string> {
  const buf = await sharp(absPath)
    .resize({ width: 24 }) // 24px — genug для blur-подложки, <1КБ
    .webp({ quality: 45 })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

const entries: string[] = [];
for (const [consumer, paths] of Object.entries(TARGETS)) {
  for (const p of paths) {
    const abs = resolve(root, `public${p}`);
    let uri: string;
    try {
      uri = await lqipDataUri(abs);
    } catch {
      console.error(`✗ LQIP: файл не читается — ${p} (потребитель: ${consumer})`);
      process.exit(1);
    }
    entries.push(`  ${JSON.stringify(p)}: ${JSON.stringify(uri)},`);
    console.log(`✓ ${p} → ${uri.length} симв.`);
  }
}

const out = `/* СГЕНЕРИРОВАНО scripts/gen-lqip.ts — не редактировать руками.
 * c117: LQIP-заглушки (24px WebP data-URI) для фото в тёмных рамках —
 * пока ленивый кадр грузится, рамка показывает мягкое размытое фото,
 * а не жёсткий чёрный (#0e0b09/#0E0907). Регенерация: bun scripts/gen-lqip.ts
 * (при смене фото в spiral-services / ea-careers-block). */
export const LQIP: Record<string, string> = {
${entries.join("\n")}
};
`;

const outPath = resolve(root, "src/lib/lqip.ts");
mkdirSync(dirname(outPath), { recursive: true });
// preserve if file had trailing content pattern
writeFileSync(outPath, out);
console.log(`→ src/lib/lqip.ts (${entries.length} записей, ${out.length} байт)`);

// самопроверка: каждый ключ читается из public/
for (const p of Object.values(TARGETS).flat()) {
  readFileSync(resolve(root, `public${p}`)); // throw если файла нет
}
console.log("✓ все пути существуют в public/");
