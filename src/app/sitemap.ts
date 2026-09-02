import type { MetadataRoute } from "next";
import { SITE_URL_BASE } from "@/lib/site-config";

/**
 * Task 1-b (cycle-71): домен — из site-config.ts (единый источник фактов).
 *
 * F2 (K3-MINOR): lastmod — ФИКСИРОВАННЫЕ даты последнего контентного
 * изменения каждого роута (по git-истории), а НЕ new Date() при генерации.
 * «Вечно свежий» lastmod (= время каждого билда) поисковики игнорируют
 * как шумный сигнал — фиксированная честная дата восстанавливает
 * доверие к полю. Даты:
 *   /        — 2026-09-02 (f13e273, c71-w1: перевод FAQ-схемы на главную)
 *   /offer   — 2026-09-02 (f13e273: метаданные W1)
 *   /privacy — 2026-09-02 (f13e273: метаданные W1)
 *   /terms   — 2026-09-02 (f13e273: метаданные W1)
 * Правило для будущих волн: тронул видимый контент роута — обнови
 * соответствующую константу ниже.
 */
const LAST_UPDATE = {
  home: "2026-09-02",
  legal: "2026-09-02",
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  // Task 1-b (cycle-71): домен — из site-config.ts (единый источник фактов).
  const base = SITE_URL_BASE;
  return [
    { url: `${base}/`, lastModified: LAST_UPDATE.home, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/privacy`, lastModified: LAST_UPDATE.legal, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/offer`, lastModified: LAST_UPDATE.legal, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: LAST_UPDATE.legal, changeFrequency: "yearly", priority: 0.3 },
  ];
}
