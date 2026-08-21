import { Suspense } from "react";
import { SiteHeader } from "@/components/catering/site-header";
import { McuVideoHero } from "@/components/catering/mcu-video-hero";
import { McuMarqueeBand } from "@/components/catering/mcu-marquee-band";
import { EditorialIntro } from "@/components/catering/editorial-intro";
import { About } from "@/components/catering/about";
import { Manifesto } from "@/components/catering/manifesto";
import { ChefPortrait } from "@/components/catering/chef-portrait";
import { Menu } from "@/components/catering/menu";
import { TastingMenuExperience } from "@/components/catering/tasting-menu-experience";
import { SustainabilityStrip } from "@/components/catering/sustainability-strip";
import { ServicesOverview } from "@/components/catering/services-overview";
import { McuPhotoFilmstrip } from "@/components/catering/mcu-photo-filmstrip";
import { McuVenues } from "@/components/catering/mcu-venues";
import { QuoteBand } from "@/components/catering/quote-band";
import { McuTestimonials } from "@/components/catering/mcu-testimonials";
import { McuInstagram } from "@/components/catering/mcu-instagram";
import { Faq } from "@/components/catering/faq";
import { Calculator } from "@/components/catering/calculator";
import { Contact } from "@/components/catering/contact";
import { SocialHandle } from "@/components/catering/social-handle";
import { SiteFooter } from "@/components/catering/site-footer";
import { BackToTop } from "@/components/catering/back-to-top";

// Cycle 26 — Salt Block Hospitality editorial layer.
//
// Client journey logic (luxury catering):
//  1. Hero (160px H1 + petal CTA + docked press strip) → emotional brand promise
//  2. MarqueeBand (7× repeating phrase) → brand positioning insistence
//  3. EditorialIntro (painterly bloom) → editorial pause, "Every event has a story"
//  4. About (count-up stats) → credibility (16+ лет, 2400+ событий)
//  5. Manifesto (pinned "ПИР" scroll wow) → signature brand moment
//  6. ChefPortrait → humanize the brand — who's the chef?
//  7. Menu (7 menu types) → what we offer
//  8. TastingMenuExperience (5-course premium) → desire / showcase
//  9. SustainabilityStrip → why us: local · seasonal · no semi-finished
// 10. ServicesOverview (Ridgewells two-up) → what services we provide
// 11. McuPhotoFilmstrip → event photos (social proof)
// 12. McuVenues → where we work
// 13. QuoteBand (solid bordeaux testimonial) → premium trust beat
// 14. McuTestimonials → social proof carousel
// 15. McuInstagram → social gallery proof
// 16. Calculator → interactive price calculator (commit moment)
// 17. Faq → resolve objections
// 18. Contact → lead form (final CTA)
// 19. SocialHandle → giant @nilov_catering closer
// 20. SiteFooter + BackToTop
//
// Salt Block wow moments layered on top:
//  - 160px uppercase Playfair H1 (Salt Block signature)
//  - Petal-shaped CTAs (border-radius: 16px 0)
//  - Press strip docked at hero bottom edge ("as featured in")
//  - 7× repeating marquee brand phrase insistence
//  - ChefPortrait moment (Salt Block's chef-driven brand DNA)
//  - TastingMenuExperience editorial list (Salt Block menu page pattern)
//  - SustainabilityStrip (Salt Block's "Clean Catering, Without Compromise" voice)
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

      {/* 1. McuVideoHero — Salt Block WOW trio: 160px uppercase Playfair H1
          "ЕДА КАК ИСКУССТВО" on looping video bg + petal CTA + docked press
          strip at hero bottom edge ("as featured in" with 6 RU press logos). */}
      <McuVideoHero />

      {/* 2. McuMarqueeBand — Salt Block WOW #3: marquee as 2nd section, 7×
          repeating brand positioning phrases (ШЕФ-ДРАЙВЕН · АВТОРСКАЯ ·
          ФЕРМЕРСКИЕ · СВАДЬБЫ · С 2009 ГОДА · САНКТ-ПЕТЕРБУРГ) on espresso bg
          with honey ✦ separators. Pure CSS animation, ~32s linear infinite. */}
      <McuMarqueeBand />

      {/* 3. EditorialIntro — Ridgewells painterly bloom intro (10-layer
          radial-gradient "digital watercolor"). Salt Block has no equivalent,
          but this is the editorial pause that bridges hero → about. Kept. */}
      <EditorialIntro />

      {/* 4. About — count-up statistics (16+ лет, 2400+ событий, 14 поваров).
          Informational anchor. Salt Block does the same — credibility stats
          immediately after the brand intro. */}
      <About />

      {/* 5. Manifesto — signature pinned scroll moment «ПИР» (Cycle 16 wow).
          The strongest existing wow — keeps its place mid-page. */}
      <Manifesto />

      {/* 6. ChefPortrait — Salt Block chef-driven brand DNA. Full-bleed 4:5
          portrait + italic Playfair "Дмитрий Нилов" + Great Vibes signature
          SVG + 3-paragraph bio. Humanizes the brand after the manifesto. */}
      <ChefPortrait />

      {/* 7. Menu — 7 menu types with interactive list + real dishes + PDF.
          Salt Block's /menus page pattern adapted as a single-section grid. */}
      <Menu />

      {/* 8. TastingMenuExperience — Salt Block WOW: 5-course editorial
          tasting-menu list on espresso bg with honey gold accents + cream
          typography. Course number / dish name / pairing note columns. */}
      <TastingMenuExperience />

      {/* 9. SustainabilityStrip — Salt Block's "Clean Catering, Without
          Compromise" voice. 3 quiet statements (Локальные фермеры /
          Сезонные продукты / Без полуфабрикатов) with editorial restraint. */}
      <SustainabilityStrip />

      {/* 10. ServicesOverview — Ridgewells two-up 50/50 split (replaces the
          weaker 3-up McuServicesCarousel). 4 service categories with
          hover-zoom images + serif titles + outline buttons. */}
      <ServicesOverview />

      {/* 11. McuPhotoFilmstrip — variable-width centerMode filmstrip,
          auto-advances every 3.5s, pause-on-hover. Event photos. */}
      <McuPhotoFilmstrip />

      {/* 12. McuVenues — 3 square (1:1) venue cards with hover-zoom. */}
      <McuVenues />

      {/* 13. QuoteBand — Ridgewells WOW #3: solid bordeaux single-quote
          moment with tinted-cream headline + oversized gold quote mark.
          Premium trust beat before the testimonials carousel. */}
      <QuoteBand />

      {/* 14. McuTestimonials — single-slide autoplay (5s, stops on
          interaction) with big gold quote-mark + 5★ rating. */}
      <McuTestimonials />

      {/* 15. McuInstagram — 6×2 grid of Instagram tiles on navy bg. */}
      <McuInstagram />

      {/* 16. Calculator — interactive price calculator (nuqs state). User
          has read all brand proof → ready to commit. Sits right before FAQ
          + Contact so the lead form follows naturally. */}
      <Suspense fallback={null}>
        <Calculator />
      </Suspense>

      {/* 17. Faq — catering questions + accordion. Resolves objections
          before the contact form. */}
      <Faq />

      {/* 18. Contact — form → POST /api/lead → Prisma Lead → toast. */}
      <Contact />

      {/* 19. SocialHandle — giant @nilov_catering closer (Cycle 21). */}
      <SocialHandle />

      <SiteFooter />
      {/* Back-to-top button (appears on scroll > 500px). */}
      <BackToTop />
    </main>
  );
}
