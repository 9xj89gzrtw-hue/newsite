import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LenisProvider } from "@/components/catering/lenis-provider";
import { CustomCursor } from "@/components/catering/cursor";
import { AmbientAudio } from "@/components/catering/ambient-audio";
import { Preloader } from "@/components/catering/preloader";
import { CookieConsent } from "@/components/catering/cookie-consent";
import { GrainOverlay } from "@/components/catering/grain";
import { ChapterNav } from "@/components/catering/chapter-nav";
import { NuqsAdapter } from "nuqs/adapters/next";
import { SITE_CONFIG, LEGAL_INFO, CONTACTS } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
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
    default: "Interfood Catering — Кейтеринг в Санкт-Петербурге от 2450₽/чел",
    template: "%s | Interfood Catering",
  },
  description:
    "«Еда как искусство» — выездной кейтеринг полного цикла в СПб. Фуршет, банкет, кофе-брейк, барбекю от 2450₽/чел. Рассчитайте стоимость онлайн за 30 секунд.",
  keywords: [
    "кейтеринг",
    "кейтеринг СПб",
    "кейтеринг Санкт-Петербург",
    "фуршет",
    "банкет",
    "выездной ресторан",
    "Interfood",
    "nilov catering",
  ],
  authors: [{ name: "Interfood Catering" }],
  alternates: { canonical: "/", languages: { "ru-RU": "/", "x-default": "/" } },
  openGraph: {
    title: "Interfood Catering — Кейтеринг в Санкт-Петербурге",
    description:
      "Выездной кейтеринг полного цикла. Видео, фото, интерактивный калькулятор стоимости.",
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "Interfood Catering",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Interfood Catering — банкет в Санкт-Петербурге" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interfood Catering — Кейтеринг в Санкт-Петербурге",
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
    { media: "(prefers-color-scheme: light)", color: "#fcfbf8" },
    { media: "(prefers-color-scheme: dark)", color: "#101010" },
  ],
};

/** JSON-LD structured data for Yandex/Google (LocalBusiness + Restaurant) */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CateringService",
  "@id": siteUrl + "#organization",
  name: "Interfood Catering",
  alternateName: "NILOV CATERING",
  description: "«Еда как искусство» — выездной кейтеринг полного цикла в Санкт-Петербурге. Фуршет, банкет, кофе-брейк, барбекю от 2450₽/чел.",
  url: siteUrl,
  logo: siteUrl + "/logo.svg",
  image: siteUrl + "/og-image.jpg",
  telephone: CONTACTS.phone,
  email: CONTACTS.email,
  priceRange: "₽₽₽",
  currenciesAccepted: "RUB",
  paymentAccepted: "Наличные, Безналичный расчёт, Банковский перевод",
  sameAs: [
    "https://www.instagram.com/interfood.catering",
    "https://wa.me/79119417205",
    "https://vk.com/interfood",
  ],
  address: {
    "@type": "PostalAddress",
    addressCountry: "RU",
    addressRegion: "Санкт-Петербург",
    addressLocality: "Санкт-Петербург",
    postalCode: "197198",
    streetAddress: "ул. Большая Морская, д. 18, офис 33",
  },
  geo: { "@type": "GeoCoordinates", latitude: 59.939495, longitude: 30.315785 },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      opens: "09:00", closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00", closes: "16:00",
    },
  ],
  founder: { "@type": "Person", name: "Нилов Дмитрий Игоревич" },
  foundingDate: "2014-04-14",
  areaServed: { "@type": "City", name: "Санкт-Петербург" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Preconnect hints for external domains */}
        <link rel="preconnect" href="https://www.instagram.com" />
        <link rel="preconnect" href="https://yandex.ru" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <a href="#main-content" className="skip-link">
          Перейти к содержанию
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Preloader />
        <CustomCursor />
        <AmbientAudio />
        <GrainOverlay />
        <ChapterNav />
        <NuqsAdapter>
          <LenisProvider>{children}</LenisProvider>
        </NuqsAdapter>
        <CookieConsent />
        <Toaster />
        <noscript>
          <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
            <h1>Interfood.</h1>
            <p>Для работы сайта необходимо включить JavaScript.</p>
            <p style={{ marginTop: '1rem' }}>Позвоните: <a href="tel:+78129195911">+7 (812) 919-59-11</a></p>
          </div>
        </noscript>
      </body>
    </html>
  );
}
