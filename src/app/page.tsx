import { Suspense } from "react";
import { SiteHeader } from "@/components/catering/site-header";
import { Hero } from "@/components/catering/hero";
import { WinterSpecials } from "@/components/catering/winter-specials";
import { EditorialIntro } from "@/components/catering/editorial-intro";
import { MarqueeBand } from "@/components/catering/marquee-band";
import { LogoMarquee } from "@/components/catering/logo-marquee";
import { About } from "@/components/catering/about";
import { Manifesto } from "@/components/catering/manifesto";
import { Process } from "@/components/catering/process";
import { Menu } from "@/components/catering/menu";
import { PromoBanner } from "@/components/catering/promo-banner";
import { ServicesOverview } from "@/components/catering/services-overview";
import { Services } from "@/components/catering/services";
import { QuoteBand } from "@/components/catering/quote-band";
import { Pillars } from "@/components/catering/pillars";
import { SnackBoxDelivery } from "@/components/catering/snack-box-delivery";
import { EventsGallery } from "@/components/catering/events-gallery";
import { VideoEvents } from "@/components/catering/video-events";
import { Calculator } from "@/components/catering/calculator";
import { InstagramVideo } from "@/components/catering/instagram-video";
import { Testimonials } from "@/components/catering/testimonials";
import { PressStrip } from "@/components/catering/press-strip";
import { AwardsStrip } from "@/components/catering/awards-strip";
import { Faq } from "@/components/catering/faq";
import { Contact } from "@/components/catering/contact";
import { SocialHandle } from "@/components/catering/social-handle";
import { SiteFooter } from "@/components/catering/site-footer";
import { BackToTop } from "@/components/catering/back-to-top";

// Make this page dynamic to avoid SSR issues with window access in client components
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main id="main-content" role="main" tabIndex={-1} className="flex min-h-screen flex-col bg-cream outline-none">
      <SiteHeader />
      {/* Hero — Sopranos full-viewport photo slider + Eastern Market story + sticky Check Your Date */}
      <Hero />
      {/* WinterSpecials — Sopranos "NEW WINTER SPECIALS" dark navy band (Cycle 22) */}
      <WinterSpecials />
      {/* EditorialIntro — Ridgewells WOW #1: painterly radial-gradient intro */}
      <EditorialIntro />
      {/* MarqueeBand — solid-bordeaux infinite marquee */}
      <MarqueeBand />
      {/* Infinite client-logo marquee (Gamma / Creative Edge pattern) */}
      <LogoMarquee />
      <About />
      {/* Manifesto: signature pinned scroll moment — «Манифест-as-Window» */}
      <Manifesto />
      {/* Process: emotional timeline 01→04 (Creative Edge pattern) */}
      <Process />
      {/* Menu: tabs + interactive list + real dishes + inline PDF download */}
      <Menu />
      <PromoBanner />
      {/* ServicesOverview — Ridgewells two-up 50/50 editorial grid (Cycle 21) */}
      <ServicesOverview />
      {/* Services: 4-up image-card grid + modal (existing 3D interactive) */}
      <Services />
      {/* QuoteBand — Ridgewells WOW #3: solid-bordeaux client quote */}
      <QuoteBand />
      {/* Pillars: dual brand-pillar section (Salt Block pattern) */}
      <Pillars />
      {/* Snack-box delivery: standalone service with price list */}
      <SnackBoxDelivery />
      {/* Photo events gallery — filterable by category + lightbox */}
      <EventsGallery />
      {/* Video events */}
      <VideoEvents />
      {/* Calculator uses nuqs (useSearchParams) — must be in <Suspense> */}
      <Suspense fallback={null}>
        <Calculator />
      </Suspense>
      <InstagramVideo />
      {/* Press strip: "As seen in" publications (trust signal — 94% adoption) */}
      <PressStrip />
      {/* Testimonials: carousel with auto-play + trust badges */}
      <Testimonials />
      {/* FAQ: frequently asked questions about catering */}
      <Faq />
      {/* Awards strip — real Sopranos badges (Cycle 22) */}
      <AwardsStrip />
      <Contact />
      {/* SocialHandle — Ridgewells giant @nilov_catering closer (Cycle 21) */}
      <SocialHandle />
      <SiteFooter />
      {/* Back-to-top button (appears on scroll > 500px) */}
      <BackToTop />
    </main>
  );
}
