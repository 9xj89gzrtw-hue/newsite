import type { MetadataRoute } from "next";
import { SITE_URL_BASE } from "@/lib/site-config";

/**
 * Task 1-b (cycle-71): явный Allow для AI-краулеров и ассистентов
 * (GEO/LLM-видимость, research R2). Каждая запись в `rules` = отдельная
 * User-agent-группа в robots.txt (Next не склеивает разные userAgent).
 * Хост-директиву Яндекса НЕ добавляем — официально устарела.
 */
const AI_AGENTS = [
  // OpenAI
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  // Anthropic
  "ClaudeBot",
  "Claude-User",
  "anthropic-ai",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Google AI (не влияет на обычный поиск)
  "Google-Extended",
  // Apple (Siri/Apple Intelligence)
  "Applebot-Extended",
  // Amazon (Alexa)
  "Amazonbot",
  // Common Crawl (данные для многих LLM)
  "CCBot",
  // ByteDance
  "Bytespider",
  // Meta
  "meta-externalagent",
  // DuckDuckGo (DuckAssist)
  "DuckAssistBot",
  // Mistral
  "MistralAI-User",
  // Классические поисковики — тоже явно (зеркально R2-списку)
  "Googlebot",
  "Bingbot",
  "YandexBot",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Каждому AI-боту — своя группа с явным Allow: /
      ...AI_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
      })),
      // Общее правило для всех остальных: /api/ — служебные эндпоинты форм.
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL_BASE}/sitemap.xml`,
  };
}
