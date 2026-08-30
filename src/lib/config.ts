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
  // Brand
  brandName: "Interfood.",
  brandNameFull: "Интерфуд Кейтеринг (NILOV CATERING)",
  brandShort: "Interfood",
  slogan: "Кейтеринг, в котором чувствуют",

  // Domain — set via env (Timeweb/Vercel/any host)
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://newsite-three-kappa.vercel.app",

  // Hosting target — informational, drives deployment docs
  hosting: (process.env.HOSTING_TARGET || "vercel") as "vercel" | "timeweb" | "self-hosted",

  // Russian localization
  locale: "ru_RU",
  language: "ru",
  currency: "RUB",
  timezone: "Europe/Moscow",
} as const;

/**
 * Legal entity info — REQUIRED by 152-ФЗ (data processing) and ЗОПП (consumer protection).
 * MUST be visible in footer. Replace placeholders with real data from client.
 * Get from: ЕГРЮЛ / ЕГРИП (egrul.nalog.ru), company registration docs.
 */
export const LEGAL_INFO = {
  legalForm: "ИП",
  legalName: "Нилов Дмитрий Игоревич",
  // Реальные реквизиты (ЕГРИП, rusprofile.ru/egrul.nalog.ru):
  ogrn: "314784710400402",
  inn: "781433059704",
  // Дата регистрации: 14.04.2014
  registeredAt: "14 апреля 2014 г.",
  // Address for legal correspondence (ЗОПП ст. 8 + 152-ФЗ — full postal address)
  // Индекс 191186 по официальной базе Почты России для дома 18.
  legalAddress: "191186, г. Санкт-Петербург, ул. Большая Морская, д. 18, офис 33",
  legalEmail: "interfood-catering@yandex.ru",
  dataOfficer: "Нилов Дмитрий Игоревич",
};

/**
 * Contacts — public-facing. Used across hero/contact/footer.
 * Sourced from the original interfood-catering.ru/contacts page.
 */
export const CONTACTS = {
  phone: "+7 (812) 919-59-11",
  phoneHref: "tel:+78129195911",
  whatsapp: "+7 911 941-72-05",
  whatsappHref: "https://wa.me/79119417205",
  telegram: "+7 911 941-72-05",
  telegramHref: "https://t.me/+79119417205",
  instagram: "@nilov_catering",
  instagramHref: "https://www.instagram.com/nilov_catering",
  vk: "nilovcatering",
  vkHref: "https://vk.com/nilovcatering",
  city: "Санкт-Петербург",
  email: "interfood-catering@yandex.ru",
  // Cycle 65: публичный адрес офиса (владелец: «в контактах адрес другой —
  // Полевая-Сабировская 45к1»). ЮРИДИЧЕСКИЙ адрес для документов — LEGAL_INFO
  // (не трогать): здесь — только витринный адрес для людей.
  address: "ул. Полевая-Сабировская, 45к1, Санкт-Петербург",
  addressHref: "https://yandex.ru/maps/-/CTHo6Xkp",
};

/**
 * Analytics — Yandex.Metrika (Russian, 152-ФЗ-compliant if data stays in RF).
 * Loaded ONLY after cookie consent (see CookieConsent component).
 * Tag number set via NEXT_PUBLIC_YANDEX_METRIKA env var.
 */
export const ANALYTICS = {
  yandexMetrikaId: process.env.NEXT_PUBLIC_YANDEX_METRIKA || "",
};
