/**
 * Central site configuration — company info, domain, legal entity.
 *
 * Hosting-agnostic: works on Vercel, Timeweb (Node.js), or any Node host.
 * Set NEXT_PUBLIC_SITE_URL env var to the production domain.
 *
 * Russian legislation compliance (152-ФЗ, ЗОПП, ФЗ "О рекламе"):
 * - Company legal name + ИНН/ОГРН must be in footer (placeholder until client provides real)
 * - Privacy policy + public offer required
 * - Consent to process personal data required on lead form
 */

export const SITE_CONFIG = {
  // Brand — Sopranos Catering (Michigan, USA) — copied per user request 2026-08-20
  brandName: "Soprano's Catering",
  brandNameFull: "Soprano's Catering",
  brandShort: "Soprano's",
  slogan: "Made with Love",

  // Domain — set via env (Timeweb/Vercel/any host)
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://newsite-three-kappa.vercel.app",

  // Hosting target — informational, drives deployment docs
  hosting: (process.env.HOSTING_TARGET || "vercel") as "vercel" | "timeweb" | "self-hosted",

  // Localization — English (US), Sopranos is Michigan-based
  locale: "en_US",
  language: "en",
  currency: "USD",
  timezone: "America/Detroit",
} as const;

/**
 * Legal entity info — Sopranos Catering (Michigan).
 * Source: sopranoscatering.com footer.
 */
export const LEGAL_INFO = {
  legalForm: "LLC",
  legalName: "Soprano's Catering LLC",
  ogrn: "",
  inn: "",
  registeredAt: "",
  // Address for legal correspondence — Sopranos Catering Michigan
  legalAddress: "17600 Clinton River Road, Clinton Township, MI 48038",
  legalEmail: "info@sopranoscatering.com",
  dataOfficer: "Soprano's Catering",
};

/**
 * Contacts — public-facing. Sopranos Catering Michigan.
 */
export const CONTACTS = {
  phone: "1 (800) WE-CATER",
  phoneHref: "tel:+18009322837",
  whatsapp: "",
  whatsappHref: "",
  telegram: "",
  telegramHref: "",
  instagram: "@sopranoscatering",
  instagramHref: "https://www.instagram.com/sopranoscatering",
  vk: "",
  vkHref: "",
  city: "Clinton Township, MI",
  email: "info@sopranoscatering.com",
};

/**
 * Analytics — Yandex.Metrika (Russian, 152-ФЗ-compliant if data stays in RF).
 * Loaded ONLY after cookie consent (see CookieConsent component).
 * Tag number set via NEXT_PUBLIC_YANDEX_METRIKA env var.
 */
export const ANALYTICS = {
  yandexMetrikaId: process.env.NEXT_PUBLIC_YANDEX_METRIKA || "",
};
