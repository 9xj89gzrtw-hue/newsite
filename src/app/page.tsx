import { Suspense } from "react";
import { SiteHeader } from "@/components/catering/site-header";
import { Hero } from "@/components/catering/hero";
import { MarqueeBand } from "@/components/catering/marquee-band";
import { LogoMarquee } from "@/components/catering/logo-marquee";
import { About } from "@/components/catering/about";
import { Manifesto } from "@/components/catering/manifesto";
import { Process } from "@/components/catering/process";
import { Menu } from "@/components/catering/menu";
import { PromoBanner } from "@/components/catering/promo-banner";
import { Services } from "@/components/catering/services";
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
import { SiteFooter } from "@/components/catering/site-footer";
import { BackToTop } from "@/components/catering/back-to-top";

// Make this page dynamic to avoid SSR issues with window access in client components
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main id="main-content" role="main" className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />
      <Hero />
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
      {/* Services: 4-up image-card grid + modal */}
      <Services />
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
      {/* Awards strip — premium trust signals before footer */}
      <AwardsStrip />
      <Contact />
      <SiteFooter />
      {/* Back-to-top button (appears on scroll > 500px) */}
      <BackToTop />
    </main>
  );
}
