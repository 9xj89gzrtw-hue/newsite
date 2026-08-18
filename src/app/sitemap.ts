import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_CONFIG.url.replace(/\/$/, "");
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/offer`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
