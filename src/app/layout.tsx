import type { Metadata, Viewport } from "next";
import { Oswald, Karla, Great_Vibes, Playfair_Display, Barlow_Semi_Condensed, Montserrat, Prata, Nothing_You_Could_Do, Lato, Marck_Script } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LenisProvider } from "@/components/catering/lenis-provider";
import { CustomCursor } from "@/components/catering/cursor";
import { Preloader } from "@/components/catering/preloader";
import { EaCookieBanner } from "@/components/catering/ea-cookie-banner";
import { GrainOverlay } from "@/components/catering/grain";
import { VerticalBrandLabel } from "@/components/catering/vertical-brand-label";
import { ThemeFlipProvider } from "@/components/providers/theme-flip-provider";
import { NuqsAdapter } from "nuqs/adapters/next";
import { SITE_CONFIG, LEGAL_INFO, CONTACTS } from "@/lib/config";

/*
 * W3-FIX (LCP): next/font по умолчанию ставит rel=preload на КАЖДЫЙ woff2
 * (39 файлов ≈ 1МБ) — все они конкурируют с hero-медиа за первые байты
 * соединения. Preload оставлен ТОЛЬКО шрифтам первого экрана (hero):
 *   - Prata                — wordmark hero (LCP-текст);
 *   - Nothing You Could Do — script «food as art» (hero-оверлей);
 *   - Lato                 — eyebrow/scroll подписи hero.
 * Все остальные — preload: false: шрифты НЕ удаляются и грузятся тем же
 * CSS-ом с display:swap (визуал не меняется), просто по мере надобности,
 * а не на старте. Oswald (wordmark футера — ниже fold) тоже без preload.
 */

// Sopranos Catering typography — Oswald (display/condensed uppercase),
// Karla (body, humanist sans), Great Vibes (script accent for "Welcome to").
// All loaded via next/font/google — self-hosted at runtime, no external requests.
const oswald = Oswald({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
  /* W3-FIX: wordmark футера — ниже fold, preload не нужен. */
  preload: false,
});

const karla = Karla({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  /* W3-FIX: body-фолбэк, не LCP-критичен. */
  preload: false,
});

const greatVibes = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  /* W3-FIX: акценты ниже fold. */
  preload: false,
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  /* W3-FIX: не LCP-критичен. */
  preload: false,
});

// Concept-Catering.de aesthetic — Barlow Semi Condensed (ultra-bold condensed
// all-caps for the dark "wow" layer: bold-statement, pink-marquee, rising-photos).
const barlow = Barlow_Semi_Condensed({
  variable: "--font-barlow",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  /* W3-FIX: тёмный «wow»-слой ниже fold. */
  preload: false,
});

// Global Gourmet (ggcatering.com) — Montserrat as Poppins-replacement.
// Poppins on Google Fonts does NOT ship a Cyrillic subset, so for the Russian
// interfood site we substitute Montserrat — a geometric sans nearly identical
// to Poppins in x-height/letterforms, but with full Cyrillic + italic coverage.
// Variable name `--font-poppins` is kept for CSS compat with gg-* components.
const poppins = Montserrat({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  /* W3-FIX: gg-секции ниже fold. */
  preload: false,
});

// Cycle 27 — Creative Edge Parties (creativeedgeparties.com) self-hosted
// Neutraface 2 fonts (downloaded from their Squarespace CDN). These carry the
// brand identity: Neutra2Display-Light for ALL headings (uppercase, tight -2%
// tracking, hero H1 at ~244px), Neutra2Text_Book for body copy. NOTE: these
// are Latin-only faces (no Cyrillic) — used for the CEP English-language
// signature headlines ("THE EGG", "SIMPLE & BRILLIANT", "WHY US?"). Russian
// copy in the same sections falls back to Montserrat (geometric, matching
// x-height) via the .cep-ru utility class.
const neutraDisplay = localFont({
  src: "../../public/fonts/Neutra2Display-Light.woff2",
  variable: "--font-neutra-display",
  display: "swap",
  /* W3-FIX: CEP-заголовки ниже fold. */
  preload: false,
});

const neutraText = localFont({
  src: "../../public/fonts/Neutra2Text_book.woff2",
  variable: "--font-neutra-text",
  display: "swap",
  /* W3-FIX: CEP-текст ниже fold. */
  preload: false,
});

// ===== TALK OF THE TOWN (talkofthetownatlanta.com) FONTS — Cycle 30 =====
// Reference site uses 3 Google Fonts (all weight 400):
//   - Prata              → display serif (h1/h2, logo wordmark). Latin-only.
//   - Nothing You Could Do → script accent (hero overlay tagline). Latin-only.
//   - Lato               → body + nav menu. next/font Lato ships latin/latin-ext
//                          only (no Cyrillic subset), so Russian glyphs fall back
//                          through .tott-body's chain to Karla (full Cyrillic) —
//                          Latin runs (logo, English accents) render in Lato.
// Prata carries the editorial elegance of their burgundy+olive brand;
// Nothing You Could Do delivers the handwritten script-accent wow (their
// hero overlay "bacon & bluecheese tartlet"); Lato gives the clean nav/body.
// Latin-only faces (Prata, Nothing You Could Do) are used for English accent
// phrases; Russian copy falls back to Playfair (display) / Karla (body) which
// both ship full Cyrillic coverage.
const prata = Prata({
  variable: "--font-prata",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  /* W3-FIX: hero wordmark — preload ОСТАВЛЕН (LCP-критичный). */
});

const nothingYouCouldDo = Nothing_You_Could_Do({
  variable: "--font-nothing",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  /* W3-FIX: script «food as art» на hero — preload ОСТАВЛЕН. */
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin", "latin-ext"],
  /* W3-FIX: 300 исключён — НЕ ИСПОЛЬЗУЕТСЯ нигде (tott-body/site-header/
     tott-cta-btn/tott-eyebrow/spiral — только 400 и 700; все прочие
     font-weight:300 в проекте — Karla/Barlow/IBM Plex Mono/Montserrat,
     не Lato). Без него preload-набор Lato = 4 файла (400/700 × latin/
     latin-ext) вместо 6. Если 300 когда-нибудь понадобится — верни вес,
     файл подтянется CSS-ом (просто без preload). */
  weight: ["400", "700"],
  display: "swap",
  /* W3-FIX: eyebrow/scroll hero — preload ОСТАВЛЕН. */
});

// Marck Script — Cyrillic-capable handwritten script (task v5). Nothing You
// Could Do (the reference site's script font) is Latin-only and CANNOT
// render Cyrillic, so "Лучший кейтеринг Санкт-Петербурга" would fall back to
// the browser's generic `cursive` (Comic-Sans-like) — which is why the user
// saw "вообще никакого шрифта нету". Marck Script is a casual handwritten
// brush script with FULL Cyrillic support, the closest visual analog to
// Nothing You Could Do for Russian text. Used via `.tott-script-ru` helper.
const marck = Marck_Script({
  variable: "--font-marck",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400"],
  display: "swap",
  /* W3-FIX: ru-скрипт акценты ниже fold. */
  preload: false,
});

const siteUrl = SITE_CONFIG.url;

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
  description:
    "«Еда как искусство» — выездной кейтеринг полного цикла в СПб. Фуршет от 2450₽, банкет от 4470₽, кофе-брейк от 900₽, обеды в офис от 650₽ за человека. Рассчитайте стоимость онлайн за 30 секунд.",
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
  alternates: { canonical: "/", languages: { "ru-RU": "/", "x-default": "/" } },
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9FAFB" },
    { media: "(prefers-color-scheme: dark)", color: "#1F2937" },
  ],
};

/** JSON-LD structured data for Yandex/Google (LocalBusiness + CateringService) */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CateringService",
  "@id": siteUrl + "#organization",
  name: "nilov catering",
  alternateName: "NILOV CATERING",
  description: "«Еда как искусство» — выездной кейтеринг полного цикла в Санкт-Петербурге. Фуршет от 2450₽, банкет от 4470₽, кофе-брейк от 900₽, обеды в офис от 650₽ за человека.",
  url: siteUrl,
  image: siteUrl + "/og-image.jpg",
  logo: siteUrl + "/brand/logo-512.png",
  telephone: CONTACTS.phone,
  email: CONTACTS.email,
  priceRange: "₽₽₽",
  currenciesAccepted: "RUB",
  paymentAccepted: "Наличные, Безналичный расчёт, Банковский перевод",
  sameAs: [
    "https://www.instagram.com/nilov_catering",
    "https://wa.me/79119417205",
    "https://vk.com/nilovcatering",
    "https://t.me/+79119417205",
  ],
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
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      opens: "09:00", closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "10:00", closes: "16:00",
    },
  ],
  founder: { "@type": "Person", name: "Нилов Дмитрий Игоревич" },
  foundingDate: "2007",
  areaServed: [
    { "@type": "City", name: "Санкт-Петербург" },
    { "@type": "AdministrativeArea", name: "Ленинградская область" },
  ],
};

/** Cycle 39: FAQPage structured data — mirrors FAQ_ITEMS from
 *  ea-faq-accordion.tsx so search engines can render rich FAQ snippets. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Какой минимальный заказ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Банкеты — от 30 гостей, фуршеты — от 20, кофе-брейки — от 15, барбекю — от 20, обеды в офис — от 10. Для меньших форматов есть доставка закусок в индивидуальной упаковке.",
      },
    },
    {
      "@type": "Question",
      name: "За сколько дней нужно бронировать?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Свадьбы и банкеты — за 14–30 дней. Корпоративные обеды — за 3 рабочих дня. Срочные заказы (24 часа) — возможны с наценкой 25%.",
      },
    },
    {
      "@type": "Question",
      name: "Что входит в стоимость?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Еда, доставка, сервировка, посуда, текстиль, повар и официанты на месте, а также лёгкое цветочное сопровождение на столах. Не входит: аренда площадки, алкоголь, музыка и расширенное флористическое оформление — поможем организовать по запросу.",
      },
    },
    {
      "@type": "Question",
      name: "Можете учесть аллергии и диеты?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Да. Вегетарианское, веганское, безглютеновое, халяль, кошер — без доплат. Специфические аллергии просим сообщить за 7 дней.",
      },
    },
    {
      "@type": "Question",
      name: "Как происходит оплата?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Предоплата 30% при подтверждении заказа, окончательный расчёт — не позднее 3 дней до мероприятия (условия публичной оферты). Работаем с юр. лицами по безналичному расчёту.",
      },
    },
    {
      "@type": "Question",
      name: "Есть ли дегустация перед заказом?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Да. Запишитесь на приватную дегустацию в нашей студии на Петроградке. Шесть блюд из вашего будущего меню за 45 минут — 3500 ₽/чел. Сумма возвращается при заказе от 50 гостей.",
      },
    },
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
      className={`${oswald.variable} ${karla.variable} ${greatVibes.variable} ${playfair.variable} ${barlow.variable} ${poppins.variable} ${neutraDisplay.variable} ${neutraText.variable} ${prata.variable} ${nothingYouCouldDo.variable} ${lato.variable} ${marck.variable}`}
    >
      <head>
        {/* Preconnect hints for external domains */}
        <link rel="preconnect" href="https://www.instagram.com" />
        <link rel="preconnect" href="https://yandex.ru" />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
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
            <h1>nilov catering.</h1>
            <p>Для работы сайта необходимо включить JavaScript.</p>
            <p style={{ marginTop: '1rem' }}>Позвоните: <a href={CONTACTS.phoneHref}>{CONTACTS.phone}</a></p>
          </div>
        </noscript>
      </body>
    </html>
  );
}
