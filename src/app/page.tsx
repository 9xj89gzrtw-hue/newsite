import { Suspense } from "react";
import { SiteHeader } from "@/components/catering/site-header";
import { Hero } from "@/components/catering/hero";
import { MarqueeBand } from "@/components/catering/marquee-band";
import { About } from "@/components/catering/about";
import { Manifesto } from "@/components/catering/manifesto";
import { Menu } from "@/components/catering/menu";
import { PromoBanner } from "@/components/catering/promo-banner";
import { Services } from "@/components/catering/services";
import { SnackBoxDelivery } from "@/components/catering/snack-box-delivery";
import { EventsGallery } from "@/components/catering/events-gallery";
import { VideoEvents } from "@/components/catering/video-events";
import { Calculator } from "@/components/catering/calculator";
import { InstagramVideo } from "@/components/catering/instagram-video";
import { Testimonials } from "@/components/catering/testimonials";
import { Faq } from "@/components/catering/faq";
import { Contact } from "@/components/catering/contact";
import { SiteFooter } from "@/components/catering/site-footer";
import { BackToTop } from "@/components/catering/back-to-top";

export default function Home() {
  return (
    <main id="main-content" role="main" className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />
      <Hero />
      <MarqueeBand />
      <About />
      {/* Manifesto: signature pinned scroll moment — «Манифест-as-Window» */}
      <Manifesto />
      {/* Menu: tabs + interactive list + real dishes + inline PDF download */}
      <Menu />
      <PromoBanner />
      {/* Services: 4-up image-card grid + modal */}
      <Services />
      {/* Snack-box delivery: standalone service with price list */}
      <SnackBoxDelivery />
      {/* Photo events gallery */}
      <EventsGallery />
      {/* Video events */}
      <VideoEvents />
      {/* Calculator uses nuqs (useSearchParams) — must be in <Suspense> */}
      <Suspense fallback={null}>
        <Calculator />
      </Suspense>
      <InstagramVideo />
      {/* Testimonials: real client reviews + trust badges */}
      <Testimonials />
      {/* FAQ: frequently asked questions about catering */}
      <Faq />
      <Contact />
      <SiteFooter />
      {/* Back-to-top button (appears on scroll > 500px) */}
      <BackToTop />
    </main>
  );
}
