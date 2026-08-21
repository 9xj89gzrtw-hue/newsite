import { Suspense } from "react";
import { SiteHeader } from "@/components/catering/site-header";
import { CepEggHero } from "@/components/catering/cep-egg-hero";
import { CepClientMarquee } from "@/components/catering/cep-client-marquee";
import { CepSimpleBrilliant } from "@/components/catering/cep-simple-brilliant";
import { CepRedStats } from "@/components/catering/cep-red-stats";
import { CepWhyUs } from "@/components/catering/cep-why-us";
import { CepEditorialDivider } from "@/components/catering/cep-editorial-divider";
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
import { CepTestimonialsHeader } from "@/components/catering/cep-testimonials-header";
import { CepTestimonialsCarousel } from "@/components/catering/cep-testimonials-carousel";
import { CepProcess } from "@/components/catering/cep-process";
import { CepLocationsStrip } from "@/components/catering/cep-locations-strip";
import { CepInstagramGrid } from "@/components/catering/cep-instagram-grid";
import { QuoteBand } from "@/components/catering/quote-band";
import { Calculator } from "@/components/catering/calculator";
import { Faq } from "@/components/catering/faq";
import { Contact } from "@/components/catering/contact";
import { SocialHandle } from "@/components/catering/social-handle";
import { SiteFooter } from "@/components/catering/site-footer";
import { BackToTop } from "@/components/catering/back-to-top";

// Cycle 27 — Creative Edge Parties (creativeedgeparties.com) editorial layer.
//
// CLIENT JOURNEY LOGIC (luxury catering — "Еда как искусство"):
//
//  ── ACT I: BRAND PROMISE & POSITIONING (CEP editorial opening) ──
//   1. CepEggHero          — full-bleed egg photo + 244px stacked headline
//                            "ЕДА / ПРЕЖДЕ ВСЕГО." + locations strip. No CTAs —
//                            luxury restraint. Emotional brand promise + the
//                            chicken-and-egg riddle (food IS the brand).
//   2. CepClientMarquee    — "ИЗБРАННЫЕ КЛИЕНТЫ" — 17 RU corporate giants
//                            scrolling with red bullets + edge-fade mask.
//                            Social proof: who already trusts us.
//   3. CepSimpleBrilliant  — "ПРОСТО / И БЛЕСТЯЩЕ." 200px headline over 0.5×
//                            slow-mo food b-roll. Brand positioning insistence.
//   4. CepRedStats         — #FF360A band: 16+ / 2400+ / 180 000+. The ONLY
//                            color-as-bg moment — credibility punch.
//   5. CepWhyUs            — 4 value props (creativity / immersion / food /
//                            execution). Why we're different.
//   6. CepEditorialDivider — full-bleed photo breather (no text). Visual rest
//                            between the heavy type sections.
//
//  ── ACT II: WHO WE ARE & WHAT WE OFFER (existing editorial depth) ──
//   7. EditorialIntro      — painterly bloom intro pause.
//   8. About               — count-up stats + brand story (credibility depth).
//   9. Manifesto           — signature pinned «ПИР» scroll wow (strongest wow).
//  10. ChefPortrait        — humanize: who's the chef? (Дмитрий Нилов).
//  11. Menu                — 7 menu types interactive list + PDF.
//  12. TastingMenuExperience — 5-course editorial tasting menu (desire).
//  13. SustainabilityStrip — local · seasonal · no semi-finished (why us).
//  14. ServicesOverview    — 4 service categories (what we do).
//  15. McuPhotoFilmstrip   — event photos (social proof, auto-advancing).
//  16. McuVenues           — where we work (3 venue cards).
//
//  ── ACT III: PROOF & PROCESS (CEP trust + conversion setup) ──
//  17. CepTestimonialsHeader — massive «ОТЗЫВЫ» headline (130px).
//  18. CepTestimonialsCarousel — auto-scroll peeking, no controls, 5 RU
//                            testimonials on cream cards. Subtle + elegant.
//  19. CepProcess          — 01 МЕЧТА / 02 СОЗДАНИЕ / 03 НАСЛАЖДЕНИЕ.
//                            How we work — the creative edge.
//  20. CepLocationsStrip   — full-bleed dim photo + city strip
//                            "САНКТ-ПЕТЕРБУРГ | МОСКВА | ВСЯ РОССИЯ".
//  21. CepInstagramGrid    — 3×3 IG grid with Reel play icons (follow along).
//
//  ── ACT IV: CONVERSION (commit → resolve → contact) ──
//  22. QuoteBand           — solid bordeaux single-quote trust beat.
//  23. Calculator          — interactive price calculator (commit moment).
//  24. Faq                 — resolve objections before the form.
//  25. Contact             — lead form → POST /api/lead.
//  26. SocialHandle        — giant @nilov_catering closer.
//  27. SiteFooter + BackToTop.
//
// CEP signature moments layered on top:
//  - Neutra2Display-Light self-hosted fonts (244px hero H1, -2% tracking)
//  - Black/cream/red palette — red used as section bg exactly ONCE (stats)
//  - Egg-photo hero with stacked aphorism headline (chicken-and-egg riddle)
//  - Edge-fade client marquee with red bullets
//  - 200px headline over 0.5× slow-mo video
//  - Auto-scrolling testimonial carousel (peeking, no controls)
//  - 3-step numbered process (01/02/03)
//  - Full-screen overlay menu (54px staggered items) — via SiteHeader
//  - Outline-only red CTA buttons (transparent bg, square corners)
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

      {/* ── ACT I: BRAND PROMISE & POSITIONING ── */}

      {/* 1. CepEggHero — CEP signature egg hero. Full-bleed egg photo bg +
          244px stacked headline "ЕДА / ПРЕЖДЕ ВСЕГО." + locations strip.
          No CTAs — luxury restraint. The chicken-and-egg riddle as brand
          thesis (food IS the brand, food comes first). */}
      <CepEggHero />

      {/* 2. CepClientMarquee — "ИЗБРАННЫЕ КЛИЕНТЫ" 17 RU corporate giants
          (СБЕР • ГАЗПРОМ • ЯНДЕКС • …) scrolling with red bullets + edge-fade
          mask. Social proof immediately after the brand promise. */}
      <CepClientMarquee />

      {/* 3. CepSimpleBrilliant — "ПРОСТО / И БЛЕСТЯЩЕ." 200px headline over
          0.5× slow-mo food b-roll. Brand positioning insistence — a film
          title card moment. */}
      <CepSimpleBrilliant />

      {/* 4. CepRedStats — #FF360A band, 3 giant white numbers (16+ / 2400+ /
          180 000+). The ONLY place color is used as a section bg — pops so
          hard it becomes the brand visual signature. Count-up on scroll. */}
      <CepRedStats />

      {/* 5. CepWhyUs — "ПОЧЕМУ МЫ?" 4 value props in a row (creativity /
          immersion / food / execution). No body copy — restraint. */}
      <CepWhyUs />

      {/* 6. CepEditorialDivider — full-bleed photo breather. No text. Visual
          rest between the heavy type sections of Act I and Act II. */}
      <CepEditorialDivider />

      {/* ── ACT II: WHO WE ARE & WHAT WE OFFER ── */}

      {/* 7. EditorialIntro — Ridgewells painterly bloom intro (10-layer
          radial-gradient "digital watercolor"). Editorial pause bridging
          Act I → Act II. */}
      <EditorialIntro />

      {/* 8. About — count-up statistics (16+ лет, 2400+ событий, 14 поваров)
          + brand story. Credibility depth after the CEP punch. */}
      <About />

      {/* 9. Manifesto — signature pinned scroll moment «ПИР» (Cycle 16 wow).
          The strongest existing wow — food photos clipped through SVG letters. */}
      <Manifesto />

      {/* 10. ChefPortrait — Salt Block chef-driven brand DNA. Humanizes the
          brand: who's the chef? (Дмитрий Нилов + Great Vibes signature). */}
      <ChefPortrait />

      {/* 11. Menu — 7 menu types with interactive list + real dishes + PDF.
          What we concretely offer. */}
      <Menu />

      {/* 12. TastingMenuExperience — Salt Block 5-course editorial list on
          espresso bg with honey gold accents. Desire / showcase. */}
      <TastingMenuExperience />

      {/* 13. SustainabilityStrip — Salt Block "Clean Catering" voice: local
          farmers / seasonal / no semi-finished. Why us, quietly. */}
      <SustainabilityStrip />

      {/* 14. ServicesOverview — Ridgewells two-up 50/50 split. 4 service
          categories with hover-zoom images. What services we provide. */}
      <ServicesOverview />

      {/* 15. McuPhotoFilmstrip — variable-width centerMode filmstrip,
          auto-advances every 3.5s, pause-on-hover. Event photos (proof). */}
      <McuPhotoFilmstrip />

      {/* 16. McuVenues — 3 square (1:1) venue cards with hover-zoom. Where
          we work. */}
      <McuVenues />

      {/* ── ACT III: PROOF & PROCESS ── */}

      {/* 17. CepTestimonialsHeader — massive «ОТЗЫВЫ» headline (130px) on
          cream. CEP's "just the word, massive" pattern. */}
      <CepTestimonialsHeader />

      {/* 18. CepTestimonialsCarousel — auto-scrolling, peeking next card, NO
          arrows/dots, infinite loop. 5 RU testimonials on cream cards. So
          subtle it looks like one continuous editorial spread. */}
      <CepTestimonialsCarousel />

      {/* 19. CepProcess — "ТВОРЧЕСКИЙ ПОДХОД" 3-step process: 01 МЕЧТА /
          02 СОЗДАНИЕ / 03 НАСЛАЖДЕНИЕ. How we work — the creative edge. */}
      <CepProcess />

      {/* 20. CepLocationsStrip — full-bleed dim photo + "INTERFOOD CATERING"
          wordmark + "САНКТ-ПЕТЕРБУРГ | МОСКВА | ВСЯ РОССИЯ" city strip.
          Magazine colophon feel. */}
      <CepLocationsStrip />

      {/* 21. CepInstagramGrid — "СЛЕДИТЕ ЗА НАМИ" 3×3 grid with Reel play
          icons. Follow-along social proof. */}
      <CepInstagramGrid />

      {/* ── ACT IV: CONVERSION ── */}

      {/* 22. QuoteBand — Ridgewells solid bordeaux single-quote moment with
          tinted-cream headline + oversized gold quote mark. Premium trust
          beat before the calculator. */}
      <QuoteBand />

      {/* 23. Calculator — interactive price calculator (nuqs state). User
          has read all brand proof → ready to commit. Sits right before FAQ
          + Contact so the lead form follows naturally. */}
      <Suspense fallback={null}>
        <Calculator />
      </Suspense>

      {/* 24. Faq — catering questions + accordion. Resolves objections
          before the contact form. */}
      <Faq />

      {/* 25. Contact — form → POST /api/lead → Prisma Lead → toast. The
          final CTA. */}
      <Contact />

      {/* 26. SocialHandle — giant @nilov_catering closer (Cycle 21). */}
      <SocialHandle />

      <SiteFooter />
      {/* Back-to-top button (appears on scroll > 500px). */}
      <BackToTop />
    </main>
  );
}
