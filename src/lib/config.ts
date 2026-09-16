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
  // Brand — ребрендинг 3-A: Interfood → nilov catering (wordmark-стиль
  // со строчной буквы и золотой точкой; brandNameFull — юридическое имя,
  // не трогать).
  brandName: "nilov catering.",
  brandNameFull: "Интерфуд Кейтеринг (NILOV CATERING)",
  brandShort: "nilov catering",
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
  // c89: смена юрлица по реквизитам владельца — ИП Нилова Анастасия
  // Дмитриевна (замена ИП Нилова Д.И.). Документы /offer /privacy /terms
  // читают этот же источник.
  legalName: "Нилова Анастасия Дмитриевна",
  // Реквизиты от владельца (c89; ОГРНИП 3-25-78-… — регистрация 2025):
  ogrn: "325784700453130",
  inn: "781442293901",
  registeredAt: "",
  // Address for legal correspondence (ЗОПП ст. 8 + 152-ФЗ — full postal address)
  legalAddress:
    "197345, г. Санкт-Петербург, ул. Мебельная, д. 45, корп. 2, литера А, кв. 407",
  legalEmail: "dmitry_nilov@mail.ru",
  dataOfficer: "Нилова Анастасия Дмитриевна",
  // c89: банковские реквизиты (р/с в АО «ТБанк») — блок в подвале сайта.
  bank: {
    name: "АО «ТБанк»",
    inn: "7710140679",
    bik: "044525974",
    account: "40802810200009199197",
    corrAccount: "30101810145250000974",
    address: "127287, г. Москва, ул. Хуторская 2-я, д. 38А, стр. 26",
  },
} as const;

/**
 * Contacts — public-facing. Used across hero/contact/footer.
 * Sourced from the original interfood-catering.ru/contacts page.
 */
export const CONTACTS = {
  // 3-A: телефон владельца +7 (911) 941-72-05 (был +7 (812) 919-59-11)
  phone: "+7 (911) 941-72-05",
  phoneHref: "tel:+79119417205",
  whatsapp: "+7 911 941-72-05",
  whatsappHref: "https://wa.me/79119417205",
  telegram: "+7 911 941-72-05",
  telegramHref: "https://t.me/+79119417205",
  // c89: Telegram-КАНАЛ компании (нашёл веб-поиском, 200 OK) — отдельная
  // строка «Телеграм канал» в соцсетях; личный чат выше остаётся в «Напишите нам».
  telegramChannel: "@nilov_official",
  telegramChannelHref: "https://t.me/nilov_official",
  instagram: "@nilov_catering",
  instagramHref: "https://www.instagram.com/nilov_catering",
  vk: "nilovcatering",
  vkHref: "https://vk.com/nilovcatering",
  // 3-A: MAX-мессенджер (max.ru). c89: профиль max.ru/nilovcatering
  // НЕ существует (curl 404, проверено снова) — до уточнения владельцем
  // ссылки ведут на max.ru; номер Макса +7 (911) 826-39-26 показывается текстом.
  max: "Макс",
  maxHref: "https://max.ru",
  maxPhone: "+7 (911) 826-39-26",
  // c89: SMS-канал — на основной номер компании.
  sms: "+7 911 941-72-05",
  smsHref: "sms:+79119417205",
  // c89: видео-соцсети (владелец дал YouTube; Rutube-канал не найден —
  // ведёт на поиск Rutube по бренду, ждём точный URL от владельца).
  youtube: "@nilovcatering",
  youtubeHref: "https://youtube.com/@nilovcatering",
  rutube: "nilov catering",
  rutubeHref: "https://rutube.ru/search/?query=nilov+catering",
  city: "Санкт-Петербург",
  // c89: почта/фактический адрес по указанию владельца.
  email: "dmitry_nilov@mail.ru",
  // Cycle 65 + c89: публичный фактический адрес офиса — витринный, для людей
  // (юридический — в LEGAL_INFO). Ссылка на Яндекс.Карты сохранена.
  address: "ул. Полевая Сабировская, 45, к. 1, Санкт-Петербург",
  addressHref: "https://yandex.ru/maps/-/CTHo6Xkp",
} as const;

/**
 * Analytics — Yandex.Metrika (Russian, 152-ФЗ-compliant if data stays in RF).
 * Loaded ONLY after cookie consent (ea-cookie-banner → lib/analytics.ts).
 *
 * W3 / K6-CRITICAL (cycle-71): ЕДИНЫЙ источник ID для всего сайта — эта
 * константа (её читает src/lib/analytics.ts). Ключи: приоритет —
 * NEXT_PUBLIC_YANDEX_METRIKA_ID, легаси-синоним NEXT_PUBLIC_YANDEX_METRIKA.
 */
export const ANALYTICS = {
  // W3 / K6-CRITICAL (cycle-71): приоритет — канонический ключ
  // NEXT_PUBLIC_YANDEX_METRIKA_ID (инструкция «как включить» — в докблоке
  // src/lib/analytics.ts); NEXT_PUBLIC_YANDEX_METRIKA — легаси-синоним,
  // чтобы уже настроенные деплой-конфиги не отвалились. ПУСТО (по
  // умолчанию) = аналитика выключена: loadMetrika/trackGoal — noop,
  // ноль сторонних запросов, ноль ошибок.
  yandexMetrikaId:
    process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID ||
    process.env.NEXT_PUBLIC_YANDEX_METRIKA ||
    "", /* W3-SPY-TEMP откачен после V3-верификации: по умолчанию выкл (noop) */
} as const;
