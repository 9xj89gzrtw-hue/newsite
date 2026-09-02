import type { MetadataRoute } from "next";
import { SITE_URL_BASE } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  // Task 1-b (cycle-71): домен — из site-config.ts (единый источник фактов).
  const base = SITE_URL_BASE;
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/offer`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
