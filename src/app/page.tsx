import { Suspense } from "react";
import { SiteHeader } from "@/components/catering/site-header";
import { McuVideoHero } from "@/components/catering/mcu-video-hero";
import { McuMarqueeBand } from "@/components/catering/mcu-marquee-band";
import { About } from "@/components/catering/about";
import { McuPhotoFilmstrip } from "@/components/catering/mcu-photo-filmstrip";
import { Manifesto } from "@/components/catering/manifesto";
import { McuServicesCarousel } from "@/components/catering/mcu-services-carousel";
import { McuCtaBand } from "@/components/catering/mcu-cta-band";
import { Menu } from "@/components/catering/menu";
import { McuVideoEvents } from "@/components/catering/mcu-video-events";
import { McuVenues } from "@/components/catering/mcu-venues";
import { Calculator } from "@/components/catering/calculator";
import { McuTestimonials } from "@/components/catering/mcu-testimonials";
import { McuInstagram } from "@/components/catering/mcu-instagram";
import { Faq } from "@/components/catering/faq";
import { Contact } from "@/components/catering/contact";
import { SocialHandle } from "@/components/catering/social-handle";
import { SiteFooter } from "@/components/catering/site-footer";
import { BackToTop } from "@/components/catering/back-to-top";

// Cycle 25 — mculinary.com editorial layer.
// Curated from 30+ overlapping wow-sections (Cycles 16-24) down to a cohesive
// mculinary-inspired flow: navy + cream + gold premium catering. Hero swapped
// to mculinary video; auto-advancing carousels (photos / services / videos)
// added; testimonials + instagram rebuilt in mculinary style. Strongest
// existing sections (About count-up, Manifesto ПИР, Menu, Calculator, Contact)
// retained as informational anchors.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main
      id="main-content"
      role="main"
      tabIndex={-1}
      className="flex min-h-screen flex-col bg-cream outline-none"
    >
      <SiteHeader />

      {/* McuVideoHero — mculinary.com cinematic autoplay video hero
          (navy overlay + oversized Playfair "Еда как искусство" + gold CTA). */}
      <McuVideoHero />

      {/* McuMarqueeBand — slow infinite auto-scroll band (gold ✦ separators). */}
      <McuMarqueeBand />

      {/* About — count-up statistics (16 лет, 2400+ событий…). Kept as the
          informational anchor after the hero (mculinary places stats here too). */}
      <About />

      {/* McuPhotoFilmstrip — variable-width centerMode filmstrip, auto-advances
          every 3.5s, pause-on-hover. 18 event photos from mculinary. */}
      <McuPhotoFilmstrip />

      {/* Manifesto — signature pinned scroll moment «ПИР» (Cycle 16 wow). */}
      <Manifesto />

      {/* McuServicesCarousel — 3-up autoplay (5s, pause-on-hover) services
          with hover-zoom + dots. Replaces the older Services grid. */}
      <McuServicesCarousel />

      {/* Navy chapter-divider CTA band (magazine-style section break). */}
      <McuCtaBand
        eyebrow="ГОТОВЫ НАЧАТЬ?"
        title="Обсудим ваше мероприятие"
        href="#calculator"
        cta="Рассчитать стоимость"
      />

      {/* Menu — 7 menu types with interactive list + real dishes + PDF. */}
      <Menu />

      {/* McuVideoEvents — autoplay-muted-loop video cards carousel (4.5s
          auto-advance). Portrait 9:16 cards on navy-deep bg. */}
      <McuVideoEvents />

      {/* McuVenues — 3 square (1:1) venue cards with hover-zoom. */}
      <McuVenues />

      {/* Second chapter-divider CTA band — different copy. */}
      <McuCtaBand
        eyebrow="СВАДЬБЫ И КРУПНЫЕ СОБЫТИЯ"
        title="Кейтеринг под вашу площадку"
        href="#contact"
        cta="Связаться"
      />

      {/* Calculator uses nuqs (useSearchParams) — must be in <Suspense>. */}
      <Suspense fallback={null}>
        <Calculator />
      </Suspense>

      {/* McuTestimonials — single-slide autoplay (5s, stops on interaction)
          with big gold quote-mark + 5★ rating. Replaces old testimonials. */}
      <McuTestimonials />

      {/* McuInstagram — 6×2 grid of Instagram tiles on navy bg. */}
      <McuInstagram />

      {/* FAQ — catering questions + accordion. */}
      <Faq />

      {/* Contact — form → POST /api/lead → Prisma Lead → toast. */}
      <Contact />

      {/* SocialHandle — giant @nilov_catering closer (Cycle 21). */}
      <SocialHandle />

      <SiteFooter />
      {/* Back-to-top button (appears on scroll > 500px). */}
      <BackToTop />
    </main>
  );
}
