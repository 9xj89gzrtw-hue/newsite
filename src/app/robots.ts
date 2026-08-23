import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_CONFIG.url.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
