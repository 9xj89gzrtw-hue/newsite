import type { Metadata, Viewport } from "next";
import { Playfair_Display, Barlow_Semi_Condensed, Karla, Prata, Marck_Script } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LenisProvider } from "@/components/catering/lenis-provider";
import { CustomCursor } from "@/components/catering/cursor";
import { Preloader } from "@/components/catering/preloader";
import { EaCookieBanner } from "@/components/catering/ea-cookie-banner";
import { GrainOverlay } from "@/components/catering/grain";
import { ScrollProgress } from "@/components/catering/scroll-progress";
import { MicroDelights } from "@/components/motion/micro-delights";
import { VerticalBrandLabel } from "@/components/catering/vertical-brand-label";
import { ThemeFlipProvider } from "@/components/providers/theme-flip-provider";
import { NuqsAdapter } from "nuqs/adapters/next";
import { CONTACTS } from "@/lib/config";
import {
  SITE_URL,
  PHONE_E164,
  EMAIL,
  FOUNDED_YEAR,
  SOCIALS,
} from "@/lib/site-config";

/*
 * F2 (cycle-71, K1-CRITICAL + K3-MAJOR): консолидация шрифтов 12 → 5 семейств.
 * next/font-загрузка осталась ТОЛЬКО у пятёрки:
 *   Prata, Playfair Display, Barlow Semi Condensed, Karla, Marck Script.
 * Убраны из загрузки: Oswald, Montserrat, Lato, Great Vibes,
 * Nothing You Could Do, Neutra2Display-Light, Neutra2Text_book
 * (−90 @font-face из отдаваемого CSS, было 159 с учётом fallback-фейсов).
 *
 * Их CSS-переменные остаются живыми через АЛИАСЫ на <html> в globals.css
 * (блок «F2 FONT CONSOLIDATION») — дюжины компонентов продолжают ссылаться
 * на прежние переменные, не требуя правок в самих компонентах:
 *   --font-display (Oswald)          → Barlow Semi Condensed (condensed caps)
 *   --font-poppins (Montserrat)       → Barlow Semi Condensed
 *   --font-lato (Lato)                → Karla (humanist body)
 *   --font-script (Great Vibes)       → Marck Script (кириллический скрипт)
 *   --font-nothing (Nothing You Could Do) → Marck Script
 *   --font-neutra-display (Neutra2Display) → Playfair Display (крупные лейблы
 *                                          «СЛЕДИТЕ ЗА НАМИ» и др.)
 *   --font-neutra-text (Neutra2Text)  → Karla
 * Скриптовые замены: «food as art» и «Сделано с любовью» — Marck Script.
 *
 * Preload остаётся ТОЛЬКО у Prata — wordmark hero (LCP-текст). Прежние
 * preload-ы Nothing You Could Do и Lato ушли вместе с их загрузкой.
 */

// — Playfair Display: editorial display-serif с полной кириллицей (H2/H3,
//   «СЛЕДИТЕ ЗА НАМИ», ex-Neutra2Display-слоты).
//   C74 (E2, kinetic typography): weight "variable" вместо массива статиков.
//   ЗАМЕР (research/c74-mobile.mjs, §43): Google и для статик-запросов
//   отдавал VF-файлы — сеть до/после ИДЕНТИЧНА (18 файлов, 331 856 Б);
//   переключение схлопывает 33 @font-face-декларации в 9 (8 VF-сабсетов
//   roman+italic + fallback) и объявляет ось weight 400 900 → чистая
//   интерполяция font-variation-settings 'wght' (.kinetic-h2,
//   c74-kinetic.css). Вид по умолчанию не меняется: VF wght 400 ==
//   прежняя статика 400.
const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "cyrillic"],
  weight: "variable",
  style: ["normal", "italic"],
  /* Не LCP-критичен. */
  preload: false,
});

// — Barlow Semi Condensed: ultra-bold condensed all-caps (eyebrow-система,
//   ex-Oswald/ex-Montserrat-слоты).
const barlow = Barlow_Semi_Condensed({
  variable: "--font-barlow",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: false,
});

// — Karla: humanist body-sans (латиница; кириллица — через metric-fallback
//   в системный sans, как и было до консолидации).
const karla = Karla({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

// — Prata: display-serif hero-вордмарка (латиница).
const prata = Prata({
  variable: "--font-prata",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  /* hero wordmark — preload ОСТАВЛЕН (LCP-критичный). */
});

// — Marck Script: рукописный скрипт с ПОЛНОЙ кириллицей — единственный
//   скрипт сайта (ex-Great Vibes / ex-Nothing You Could Do).
const marck = Marck_Script({
  variable: "--font-marck",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400"],
  display: "swap",
  preload: false,
});

// Task 1-b (cycle-71): домен — из единого источника фактов site-config.ts
// (при переезде на свой домен правится одна строка там / env NEXT_PUBLIC_SITE_URL).
const siteUrl = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  title: {
    default: "nilov catering — Кейтеринг в Санкт-Петербурге от 650 ₽/чел",
    template: "%s | nilov catering",
  },
  /* F2 (K3-MINOR): 192 → 152 симв. — ключи сохранены: «кейтеринг Санкт-Петербург",
   * цены-ЦИ (2450/4470/900/650), телефон. Усечение хвоста «Рассчитайте стоимость
   * онлайн за 30 секунд» — CTA-фраза дублирована в title. */
  description:
    "Кейтеринг в Санкт-Петербурге: фуршет от 2450 ₽, банкет от 4470 ₽, кофе-брейк от 900 ₽, обед в офис от 650 ₽/чел. Смета за 30 секунд: +7 (911) 941-72-05.",
  keywords: [
    "кейтеринг",
    "кейтеринг СПб",
    "кейтеринг Санкт-Петербург",
    "фуршет",
    "банкет",
    "выездной ресторан",
    "nilov catering",
  ],
  authors: [{ name: "nilov catering" }],
  /* F2 (K3-NIT): hreflang убран — сайт одноязычный (ru), languages был
   * объявлен только на главной (на /offer /privacy /terms его нет) —
   * по гайдлайну одноязычному сайту hreflang не нужен. Canonical остаётся. */
  alternates: { canonical: "/" },
  openGraph: {
    title: "nilov catering — Кейтеринг в Санкт-Петербурге",
    description:
      "Выездной кейтеринг полного цикла. Видео, фото, интерактивный калькулятор стоимости.",
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "nilov catering",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "nilov catering — круглый бейдж, кейтеринг Санкт-Петербурга" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "nilov catering — Кейтеринг в Санкт-Петербурге",
    description: "Выездной кейтеринг полного цикла. Рассчитайте стоимость онлайн.",
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  /* F2 (K2-MINOR): viewportFit: "cover" — оживляет уже написанные в CSS
   * env(safe-area-inset-*) отступы (до этого без viewport-fit они были
   * нулевыми/инертными). */
  viewportFit: "cover",
  /* C71: унификация с manifest.json (#0A0908) и палитрой сайта —
   * light-хром = крем дизайн-системы #F7F5F5 (было #F9FAFB — чужой тон),
   * dark-хром = брендовый espresso #0A0908 (было #1F2937 — ink-серый). */
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0908" },
  ],
};

/** JSON-LD structured data for Yandex/Google (LocalBusiness + FoodEstablishment).
 * FIX-3 (история): "CateringService" не существует в schema.org — валидаторы
 * Google/Yandex отвергают тип.
 * Task 1-b (cycle-71): тип из ТЗ "CateringBusiness" ТОЖЕ не существует —
 * живая проверка https://schema.org/CateringBusiness → 404 (как и у
 * несуществующих терминов; контроль: FoodEstablishment/LocalBusiness → 200).
 * Валидный максимум специфичности для кейтеринга — пара
 * ["FoodEstablishment", "LocalBusiness"]: FoodEstablishment уточняет
 * LocalBusiness, LocalBusiness даёт локальные поля (geo, openingHours).
 * Телефон приведён к E.164 (+79119417205), домен/соцсети/год — из site-config.ts. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["FoodEstablishment", "LocalBusiness"],
  "@id": siteUrl + "#organization",
  name: "nilov catering",
  alternateName: "NILOV CATERING",
  description: "«Еда как искусство» — выездной кейтеринг полного цикла в Санкт-Петербурге. Фуршет от 2450₽, банкет от 4470₽, кофе-брейк от 900₽, обеды в офис от 650₽ за человека.",
  url: siteUrl,
  image: siteUrl + "/og-image.jpg",
  logo: siteUrl + "/brand/logo-512.png",
  telephone: PHONE_E164,
  email: EMAIL,
  priceRange: "₽₽₽",
  currenciesAccepted: "RUB",
  paymentAccepted: "Наличные, Безналичный расчёт, Банковский перевод",
  sameAs: [
    SOCIALS.instagram,
    SOCIALS.whatsapp,
    SOCIALS.vk,
    SOCIALS.telegram,
    /* F2 (K3-MINOR): max.ru/nilovcatering УДАЛЁН из sameAs — живой curl даёт
     * 404, профиль не существует (мёртвая ссылка в разметке — анти-сигнал
     * для валидаторов). Остальные 4 ссылки sameAs честные (vk/t.me/wa.me/ig
     * отвечают 200/302). */
  ],
  /* Task 1-b: только форматы, реально представленные на сайте
   * (hacc-services: Фуршеты/Банкеты/Свадьбы/Корпоратив/Кофе-брейки/Барбекю/
   * Выездной бар/Шоу-станции/Гастро-боксы/Торты на заказ/Вегетарианское и
   * халяль + услуги из /offer: шоколадные фонтаны, выездная регистрация,
   * обеды в офис). Ничего не выдумано. */
  knowsAbout: [
    "Фуршеты",
    "Банкеты",
    "Свадебный кейтеринг",
    "Корпоративный кейтеринг",
    "Кофе-брейки",
    "Выездное барбекю",
    "Обеды в офис",
    "Доставка закусок (гастро-боксы)",
    "Выездной бар",
    "Шоу-станции",
    "Торты на заказ",
    "Вегетарианское меню",
    "Халяль",
    "Шоколадные фонтаны",
    "Выездная регистрация",
  ],
  /* Кухня — по фактическому меню: оливье/борщ/винегрет/буженина (русская),
   * брускетты/нисуаз/песто/пармская ветчина/дорада (европейская). */
  servesCuisine: ["Русская", "Европейская"],
  address: {
    "@type": "PostalAddress",
    addressCountry: "RU",
    addressRegion: "Санкт-Петербург",
    addressLocality: "Санкт-Петербург",
    // Cycle 65: публичный адрес офиса обновлён (Полевая-Сабировская, 45к1);
    // индекс 191186 относился к Б. Морской — убран, чтобы не врать в разметке
    // (не выдумываем новый до подтверждения владельцем). Координаты — из
    // короткой ссылки владельца https://yandex.ru/maps/-/CTHo6Xkp.
    streetAddress: "ул. Полевая-Сабировская, 45к1",
  },
  geo: { "@type": "GeoCoordinates", latitude: 59.994868, longitude: 30.275093 },
  /* F2 (K3-MINOR): openingHoursSpecification УДАЛЁН — на сайте видимых
   * часов нет («Отвечаем в любое время», заявки круглосуточно), контакт-часы
   * удалены владельцем ещё в cycle 65. Оставалась 3-я версия правды
   * (schema Пн–Пт 09–19 / страница / llms.txt «заявки круглосуточно)» —
   * единственный честный источник: llms.txt. postalCode в PostalAddress
   * НЕ добавлен: индекс 191186 в коде относится к юр-адресу (Б. Морская 18,
   * LEGAL_INFO.legalAddress в lib/config.ts), а публичный офис —
   * Полевая-Сабировская 45к1; подставлять чужой индекс = врать. */
  founder: { "@type": "Person", name: "Нилов Дмитрий Игоревич" },
  foundingDate: `${FOUNDED_YEAR}`,
  areaServed: [
    { "@type": "City", name: "Санкт-Петербург" },
    { "@type": "AdministrativeArea", name: "Ленинградская область" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Cycle 49 (font-fix): next/font variable classes live on <html> (= :root)
  // so that :root-level custom properties in globals.css (e.g.
  // --ea-font-display: var(--font-serif)) can resolve them. Declared on
  // <body> they were invisible to :root → every var(--ea-font-*) fell back
  // to ui-sans-serif site-wide. They cascade to <body> unchanged.
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${playfair.variable} ${barlow.variable} ${karla.variable} ${prata.variable} ${marck.variable}`}
    >
      <head>
        {/* F2 (K4-MAJOR .js-gate): САМЫЙ РАННИЙ инлайн-скрипт — синхронно,
            до отрисовки body, ставит класс `js` на <html>. Без JS класс не
            ставится и CSS-правило `html:not(.js) [style*="opacity:0"]` в
            globals.css раскрывает framer-инициализации (161 инлайн
            opacity:0 в SSR-HTML — иначе no-JS посетитель видит пустую
            страницу). С JS правило не срабатывает — ноль влияния на обычных
            юзеров. CSP разрешает 'unsafe-inline'; расхождение className
            при гидрации глушит suppressHydrationWarning на <html>. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        {/* F2 (K3-NIT): preconnect к instagram/yandex УДАЛЁН — страница не
            тянет с них ресурсов на первом пейнте (фото/шрифты/видео —
            self-hosted; яндекс-карта лениво грузится по скроллу уже после
            handshake). Оставшийся preload — бейдж прелоадера. */}
        {/* Task 6-D: preloader badge must be pixel-ready within its 1.4s
            life on a cold first visit — start fetching the 41KB PNG at HTML
            parse time, before the hero media saturates the connection pool. */}
        <link rel="preload" as="image" href="/brand/logo-256.png" />
      </head>
      <body className="antialiased bg-background text-foreground">
        <a href="#main-content" className="skip-link">
          Перейти к содержанию
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Task 1-b (cycle-71): FAQPage JSON-LD перенесён в src/app/page.tsx —
            гайдлайн Google: разметка FAQ допустима только на странице с
            ВИДИМЫМ FAQ-контентом (EaFaqAccordion есть на главной, на
            /offer /privacy /terms его нет). Здесь остаётся только
            организация (FoodEstablishment + LocalBusiness). */}
        <Preloader />
        {/* W4-FIX: прелоадер теперь рендерит двери уже в SSR-HTML (FOUC-фикс).
            Без JS они закрыли бы сайт навсегда — глушим корень прелоадера
            noscript-стилем, чтобы no-JS посетитель сразу видел страницу. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: "[data-preloader-root]{display:none!important}",
            }}
          />
        </noscript>
        <CustomCursor />
        {/* C74 E1: нативная CSS полоса прогресса чтения (scroll-driven,
            zero JS) — деградации в c74-kinetic.css. */}
        <ScrollProgress />
        {/* C78: скрытые микровзаимодействия (двойной тап-искры [data-spark],
            3-тап-яйцо [data-egg] с салютом+тостом, tilt [data-tilt]).
            Рендерит null — только document-делегация, см. micro-delights.tsx. */}
        <MicroDelights />
        <GrainOverlay />
        <VerticalBrandLabel />
        <EaCookieBanner />
        <NuqsAdapter>
          <LenisProvider>
            {/* ThemeFlipProvider — observes [data-theme-flip] sections and
                swaps the global --background/--foreground/--accent CSS vars
                on <html> via the data-theme attribute (cinematic color-flip
                on scroll). Innermost provider — wraps the page content so
                it can see all mounted sections. */}
            <ThemeFlipProvider defaultTheme="cream">
              {children}
            </ThemeFlipProvider>
          </LenisProvider>
        </NuqsAdapter>
        <Toaster />
        <noscript>
          <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
            {/* F2 (K3-MAJOR): было <h1>nilov catering.</h1> — дубль H1 на
                КАЖДОЙ странице (wordmark в hero — первый H1). <strong> даёт
                тот же визуальный вес без второй H1 в семантике. */}
            <strong>nilov catering.</strong>
            <p>Для работы сайта необходимо включить JavaScript.</p>
            <p style={{ marginTop: '1rem' }}>Позвоните: <a href={CONTACTS.phoneHref}>{CONTACTS.phone}</a></p>
          </div>
        </noscript>
      </body>
    </html>
  );
}
