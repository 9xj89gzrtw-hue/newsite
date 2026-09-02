/**
 * Task 1-b (cycle-71): единый источник фактов для SEO/LLM-разметки.
 *
 * ДО этого домен был размазан по robots.ts / sitemap.ts / JSON-LD layout.tsx
 * через SITE_CONFIG.url (@/lib/config). При переезде на собственный домен
 * меняется ОДНА строка ниже (или env NEXT_PUBLIC_SITE_URL — тот же ключ,
 * что читает SITE_CONFIG, поэтому компоненты и SEO-файлы не разъедутся).
 *
 * Все значения выверены по фактическому коду (Task 1-b, верификация):
 *  - телефон  — CONTACTS в lib/config.ts, JSON-LD layout.tsx, /offer (реквизиты);
 *  - соцсети  — site-footer.tsx (VK/MAX/Instagram/Telegram/WhatsApp) + JSON-LD sameAs;
 *  - год 2007 — JSON-LD foundingDate, hacc-booking («с 2007 года»), site-footer
 *    («2 400+ мероприятий с 2007 года»), ea-founder-story (FOUNDER_YEARS, динамически);
 *  - цены/минимумы форматов — src/lib/pricing.ts (MENU_TYPES), их читает
 *    калькулятор hacc-booking.tsx.
 */

/** Канонический домен сайта. Env-override — для деплоя на кастомный домен. */
export const SITE_URL: string =
  process.env.NEXT_PUBLIC_SITE_URL || "https://newsite-three-kappa.vercel.app";

/** SITE_URL без хвостового слэша — база для склейки абсолютных ссылок
 *  (robots.ts, sitemap.ts, llms.txt, JSON-LD @id/image/logo). */
export const SITE_URL_BASE: string = SITE_URL.replace(/\/$/, "");

/** Телефон в формате E.164 — для JSON-LD `telephone` и tel:-ссылок. */
export const PHONE_E164 = "+79119417205" as const;

/** Телефон в человеческом формате — для видимых текстов. */
export const PHONE_PRETTY = "+7 (911) 941-72-05" as const;

/** Email компании (CONTACTS.email / LEGAL_INFO.legalEmail — один и тот же). */
export const EMAIL = "interfood-catering@yandex.ru" as const;

/** Год основания (foundingDate в JSON-LD, «с 2007 года» на сайте). */
export const FOUNDED_YEAR = 2007 as const;

/** Проведено мероприятий — счётчик из ea-founder-story / site-footer. */
export const EVENTS_DONE = 2400 as const;

/** Гостей накормлено — счётчик из ea-founder-story (STATS: 120 000+). */
export const GUESTS_SERVED = 120000 as const;

/**
 * Соцсети компании (все — из site-footer.tsx / CONTACTS / JSON-LD sameAs).
 * MAX — пятая иконка футера (max.ru/nilovcatering), включена для полноты.
 */
export const SOCIALS = {
  instagram: "https://www.instagram.com/nilov_catering",
  vk: "https://vk.com/nilovcatering",
  telegram: "https://t.me/+79119417205",
  whatsapp: "https://wa.me/79119417205",
  max: "https://max.ru/nilovcatering",
} as const;

export type Socials = typeof SOCIALS;

/** Абсолютный URL от корня сайта: abs("/offer") → "https://…/offer". */
export function absUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL_BASE}${p === "/" ? "" : p}`;
}
