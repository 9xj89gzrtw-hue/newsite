import type { Metadata, Viewport } from "next";
import { Oswald, Karla, Great_Vibes, Playfair_Display } from "next/font/google";
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

// Sopranos Catering typography — Oswald (display/condensed uppercase),
// Karla (body, humanist sans), Great Vibes (script accent for "Welcome to").
// All loaded via next/font/google — self-hosted at runtime, no external requests.
const oswald = Oswald({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

const karla = Karla({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
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
      
    ],
    apple: "/apple-touch-icon.png",
  },
  title: {
    default: "Soprano's Catering — Premier Catering Service for Southeast Michigan",
    template: "%s | Soprano's Catering",
  },
  description:
    "Soprano's caters to all of Southeast Michigan for weddings, corporate events, and social events large and small. From hand-picking our own produce at Eastern Market to making our own salad dressing — Soprano's does everything the old world way.",
  keywords: [
    "catering",
    "Michigan catering",
    "Southeast Michigan catering",
    "wedding catering Michigan",
    "corporate catering Detroit",
    "Clinton Township catering",
    "Soprano's Catering",
    "Eastern Market",
    "party trays",
    "drop off catering",
  ],
  authors: [{ name: "Soprano's Catering" }],
  alternates: { canonical: "/", languages: { "en-US": "/", "x-default": "/" } },
  openGraph: {
    title: "Soprano's Catering — Premier Catering Service for Southeast Michigan",
    description:
      "From hand-picking our own produce directly from Eastern Market, to making our own salad dressing, Soprano's does everything the old world way. Weddings, corporate events, social events.",
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Soprano's Catering",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Soprano's Catering — Michigan premier catering service" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Soprano's Catering — Premier Catering Service for Southeast Michigan",
    description: "From hand-picking our own produce at Eastern Market to making our own salad dressing — Soprano's does everything the old world way.",
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

/** JSON-LD structured data for Google (LocalBusiness + CateringService) */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CateringService",
  "@id": siteUrl + "#organization",
  name: "Soprano's Catering",
  alternateName: "Sopranos Catering",
  description: "Premier catering service for Southeast Michigan. From hand-picking our own produce directly from Eastern Market, to making our own salad dressing, Soprano's does everything the old world way.",
  url: siteUrl,
  image: siteUrl + "/og-image.jpg",
  logo: siteUrl + "/logo.svg",
  telephone: CONTACTS.phone,
  email: CONTACTS.email,
  priceRange: "$$$",
  currenciesAccepted: "USD",
  paymentAccepted: "Cash, Credit Card, Check",
  sameAs: [
    "https://www.instagram.com/sopranoscatering",
    "https://www.facebook.com/sopranoscatering",
  ],
  address: {
    "@type": "PostalAddress",
    addressCountry: "US",
    addressRegion: "MI",
    addressLocality: "Clinton Township",
    postalCode: "48038",
    streetAddress: "17600 Clinton River Road",
  },
  geo: { "@type": "GeoCoordinates", latitude: 42.5867, longitude: -82.8821 },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      opens: "09:00", closes: "18:00",
    },
  ],
  areaServed: { "@type": "State", name: "Michigan" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect hints for external domains */}
        <link rel="preconnect" href="https://www.instagram.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${oswald.variable} ${karla.variable} ${greatVibes.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <a href="#main-content" className="skip-link">
          Skip to content
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
        <CookieConsent />
        <NuqsAdapter>
          <LenisProvider>{children}</LenisProvider>
        </NuqsAdapter>
        <Toaster />
        <noscript>
          <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
            <h1>Soprano's Catering.</h1>
            <p>This site requires JavaScript to be enabled.</p>
            <p style={{ marginTop: '1rem' }}>Call us: <a href="tel:+18009322837">1 (800) WE-CATER</a></p>
          </div>
        </noscript>
      </body>
    </html>
  );
}
