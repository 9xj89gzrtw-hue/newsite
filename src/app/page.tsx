import { Suspense } from "react";
import { SiteHeader } from "@/components/catering/site-header";
import { CepEggHero } from "@/components/catering/cep-egg-hero";
import { CepClientMarquee } from "@/components/catering/cep-client-marquee";
import { CepSimpleBrilliant } from "@/components/catering/cep-simple-brilliant";
import { CepRedStats } from "@/components/catering/cep-red-stats";
import { CepWhyUs } from "@/components/catering/cep-why-us";
import { CepEditorialDivider } from "@/components/catering/cep-editorial-divider";
import { EditorialIntro } from "@/components/catering/editorial-intro";
import { EaFounderStory } from "@/components/catering/ea-founder-story";
import { Manifesto } from "@/components/catering/manifesto";
import { EaChefQuote } from "@/components/catering/ea-chef-quote";
import { ChefPortrait } from "@/components/catering/chef-portrait";
import { Menu } from "@/components/catering/menu";
import { TastingMenuExperience } from "@/components/catering/tasting-menu-experience";
import { EaTastingCta } from "@/components/catering/ea-tasting-cta";
import { SustainabilityStrip } from "@/components/catering/sustainability-strip";
import { EaServicesGrid } from "@/components/catering/ea-services-grid";
import { ServicesOverview } from "@/components/catering/services-overview";
import { EaEventsPortfolio } from "@/components/catering/ea-events-portfolio";
import { EaVenuesSpotlight } from "@/components/catering/ea-venues-spotlight";
import { EaVenueNetwork } from "@/components/catering/ea-venue-network";
import { CepTestimonialsHeader } from "@/components/catering/cep-testimonials-header";
import { CepTestimonialsCarousel } from "@/components/catering/cep-testimonials-carousel";
import { EaNamedTestimonials } from "@/components/catering/ea-named-testimonials";
import { CepProcess } from "@/components/catering/cep-process";
import { EaCapabilityStrip } from "@/components/catering/ea-capability-strip";
import { CepLocationsStrip } from "@/components/catering/cep-locations-strip";
import { EaPressStrip } from "@/components/catering/ea-press-strip";
import { CepInstagramGrid } from "@/components/catering/cep-instagram-grid";
import { EaPhilosophyQuote } from "@/components/catering/ea-philosophy-quote";
import { Calculator } from "@/components/catering/calculator";
import { EaFaqAccordion } from "@/components/catering/ea-faq-accordion";
import { Contact } from "@/components/catering/contact";
import { EaFinalCta } from "@/components/catering/ea-final-cta";
import { SiteFooter } from "@/components/catering/site-footer";
import { BackToTop } from "@/components/catering/back-to-top";

// Cycle 28 — Elegant Affairs (elegantaffairscaterers.com) editorial layer.
//
// STRATEGY: EA's brand is luxury but site is mid-market WordPress (composite 3.8/10
// per DESIGN-CRITIQUE.md). Their STRENGTH is CONTENT ARCHITECTURE — founder-forward
// About, named-institution testimonials, 60-venue partner network, named-celebrity
// client list, capability-as-brand-proof, mid-page tasting CTA. Cycle 28 grafts
// EA's content patterns onto Interfood's already-cinematic editorial design
// (CEP/Salt Block/Ridgewells/MCulinary layers from Cycles 21/24/25/26/27).
//
// 14 new `ea-*` components + 3 scoped CSS files (~3800 LOC). EA's signature red
// #E71D3A used as a SECONDARY accent (after CEP #FF360A + Salt Block honey) — only
// in eyebrows, arrows, quote marks, dividers, hover states. Pure-black bookends
// (philosophy quote + final CTA) for cinematic drama. Blush #F1ECEC surfaces for
// founder story + tasting CTA. Italic-as-fragment trailing-phrase device on every
// H2 (EA signature): "Откройте нашу *историю*." / "Им важно было *безупречно*." / etc.
//
// CLIENT JOURNEY LOGIC (luxury catering — "Еда как искусство"):
//
//  ── ACT I: BRAND PROMISE & POSITIONING (CEP editorial opening — Cycle 27) ──
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
//  ── ACT II: WHO WE ARE & WHAT WE OFFER (founder-forward + services depth) ──
//   7. EditorialIntro      — painterly bloom intro pause (Ridgewells Cycle 24).
//   8. EaFounderStory      — REPLACES About. Founder-forward editorial 2-col
//                            (photo left, story + 4 stats + CTA right). Italic
//                            fragment "история" + named milestones (СБЕР, ГАЗПРОМ,
//                            ЯНДЕКС partnerships). EA §3.9 pattern.
//   9. Manifesto           — signature pinned «ПИР» scroll wow (Cycle 16). The
//                            strongest existing wow — food photos clipped through
//                            SVG letters.
//  10. EaChefQuote         — NEW. Full-bleed chef photo + giant red Playfair
//                            italic quote mark + quote about food as ritual.
//                            Humanize the chef between Manifesto + ChefPortrait.
//  11. ChefPortrait        — Salt Block chef-driven brand DNA (Дмитрий Нилов +
//                            Great Vibes signature).
//  12. Menu                — 7 menu types interactive list + PDF.
//  13. TastingMenuExperience — Salt Block 5-course editorial list on espresso bg.
//  14. EaTastingCta        — NEW mid-page "Book a Tasting" CTA. 4:5 photo +
//                            "Хотите попробовать *до* заказа?" + 6 блюд за 45 мин,
//                            3500₽ → #contact. Converts after desire.
//  15. SustainabilityStrip — local · seasonal · no semi-finished (why us).
//  16. EaServicesGrid      — NEW. 4-col minimal services teaser (Свадьбы /
//                            Корпоратив / Банкеты / Фуршеты) above ServicesOverview.
//  17. ServicesOverview    — Ridgewells 4-category 50/50 split with hover-zoom.
//  18. EaEventsPortfolio   — REPLACES McuPhotoFilmstrip. Magazine horizontal
//                            scroll gallery (8 cards, scroll-snap, auto-advance
//                            4.5s, pause on hover, NO Embla — pure CSS+JS).
//  19. EaVenuesSpotlight   — REPLACES McuVenues. 3 full-bleed 16:10 venue cards
//                            with hover zoom + bottom overlay panel.
//  20. EaVenueNetwork      — NEW. Magazine partner-network directory — 5 district
//                            groups × 6 venues = 30 + sticky featured 4:5 hero
//                            card. EA's strongest B2B credibility asset (§2.5).
//
//  ── ACT III: PROOF & PROCESS (CEP trust + EA institutional) ──
//  21. CepTestimonialsHeader — massive «ОТЗЫВЫ» headline (130px).
//  22. CepTestimonialsCarousel — auto-scroll peeking anonymous testimonials.
//  23. EaNamedTestimonials  — NEW. Named-institution testimonials grid (4 cards
//                            with NAME + ROLE + ORGANIZATION: Яндекс, СБЕР,
//                            Гинза, ТД Северная Звезда). EA §3.11 pattern.
//  24. CepProcess          — "ТВОРЧЕСКИЙ ПОДХОД" 01 МЕЧТА / 02 СОЗДАНИЕ / 03 НАСЛАЖДЕНИЕ.
//  25. EaCapabilityStrip   — NEW. Black-bg capability-as-brand-proof strip — 5
//                            unusual capabilities (Аварийный 24/7 / Полевая кухня /
//                            Шатёр-монтаж / Видео-трансляция / Сцена и свет). EA
//                            "Disaster Relief" nav-item pattern.
//  26. CepLocationsStrip   — "САНКТ-ПЕТЕРБУРГ | МОСКВА | ВСЯ РОССИЯ".
//  27. EaPressStrip        — NEW. Restored standalone 8-publication press strip
//                            (Resto.ru · Афиша · The Village · Собака.ru · Time
//                            Out · Forbes · Ресторановед · Gastronomika).
//  28. CepInstagramGrid    — 3×3 IG grid with Reel play icons.
//
//  ── ACT IV: CONVERSION (minimal dramatic — EA bookends) ──
//  29. EaPhilosophyQuote   — REPLACES QuoteBand. Pure-black bg + giant red
//                            Playfair italic quote mark + «Еда — это не логистика.
//                            Это *ритуал*.» cinematic drama before the calculator.
//  30. Calculator          — interactive price calculator (commit moment).
//  31. EaFaqAccordion      — REPLACES Faq. Minimalist single-column 6-item
//                            accordion (no tabs, no search, no feedback).
//  32. Contact             — lead form → POST /api/lead → Prisma Lead → toast.
//  33. EaFinalCta          — REPLACES SocialHandle. Pure-black "Обсудим *событие*?"
//                            + 2-CTA pair + 3-line contact strip. The final closer.
//
// EA signature moments layered on top:
//  - Italic-as-fragment trailing-phrase device on every H2 (red italic word)
//  - Pure-black bookend sections (philosophy quote + final CTA) for drama
//  - Red #E71D3A as secondary accent (quote marks, eyebrows, arrows, dividers)
//  - Blush #F1ECEC premium surfaces (founder story, tasting CTA, venue network)
//  - Founder-forward About (named chef + named milestones + named partnerships)
//  - Named-institution testimonials (NAME + ROLE + ORGANIZATION on each card)
//  - 60-venue partner-network directory (magazine layout, sticky hero card)
//  - Capability-as-brand-proof strip (unusual capabilities signal range)
//  - Mid-page tasting CTA (converts after desire, before calculator)
//  - Minimalist single-column FAQ accordion (EA restraint)
//  - Single-line top-anchored cookie banner (replaces glassmorphism card)
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

      {/* 8. EaFounderStory — Cycle 28 REPLACES About (was 430-line
          glassmorphism maximalism). Founder-forward editorial 2-col: photo
          LEFT, story + 4 stats + CTA RIGHT (offset down 80px desktop).
          Italic-as-fragment "Откройте нашу *историю*." + named milestones
          (СБЕР, ГАЗПРОМ, ЯНДЕКС partnerships). EA §3.9 pattern. */}
      <EaFounderStory />

      {/* 9. Manifesto — signature pinned scroll moment «ПИР» (Cycle 16 wow).
          The strongest existing wow — food photos clipped through SVG letters. */}
      <Manifesto />

      {/* 10. EaChefQuote — Cycle 28 NEW. Full-bleed chef photo + giant red
          Playfair italic quote mark + quote "Еда — это не логистика. Это
          ритуал…". Humanize the chef between Manifesto's word wow and
          ChefPortrait's biographical detail. */}
      <EaChefQuote />

      {/* 11. ChefPortrait — Salt Block chef-driven brand DNA. Humanizes the
          brand: who's the chef? (Дмитрий Нилов + Great Vibes signature). */}
      <ChefPortrait />

      {/* 12. Menu — 7 menu types with interactive list + real dishes + PDF.
          What we concretely offer. */}
      <Menu />

      {/* 13. TastingMenuExperience — Salt Block 5-course editorial list on
          espresso bg with honey gold accents. Desire / showcase. */}
      <TastingMenuExperience />

      {/* 14. EaTastingCta — Cycle 28 NEW mid-page "Book a Tasting" CTA.
          Blush bg + 4:5 photo LEFT + "Хотите попробовать *до* заказа?" RIGHT.
          6 блюд за 45 мин, 3500₽/чел, returns при заказе от 50 гостей →
          #contact. Converts after desire, before calculator. */}
      <EaTastingCta />

      {/* 15. SustainabilityStrip — Salt Block "Clean Catering" voice: local
          farmers / seasonal / no semi-finished. Why us, quietly. */}
      <SustainabilityStrip />

      {/* 16. EaServicesGrid — Cycle 28 NEW. 4-col minimal services teaser
          (Свадьбы / Корпоратив / Банкеты / Фуршеты) above the deeper
          ServicesOverview. EA §3.11 category-card pattern, minimal. */}
      <EaServicesGrid />

      {/* 17. ServicesOverview — Ridgewells two-up 50/50 split. 4 service
          categories with hover-zoom images. What services we provide. */}
      <ServicesOverview />

      {/* 18. EaEventsPortfolio — Cycle 28 REPLACES McuPhotoFilmstrip (was
          Embla filmstrip, broken under React 19). Magazine horizontal-scroll
          gallery: 8 event cards (4:5 portrait), scroll-snap-x mandatory,
          auto-advance 4.5s, pause on hover, NO Embla — pure CSS+JS. */}
      <EaEventsPortfolio />

      {/* 19. EaVenuesSpotlight — Cycle 28 REPLACES McuVenues (was 3 square
          1:1 cards). 3 full-bleed 16:10 venue cards with hover zoom (scale
          1.05) + bottom overlay panel slides up on hover. EA §3.9 HQ-as-venue
          callout pattern. */}
      <EaVenuesSpotlight />

      {/* 20. EaVenueNetwork — Cycle 28 NEW. Magazine partner-network directory:
          5 district groups × 6 venues = 30 venues + sticky featured 4:5 hero
          card. EA's strongest B2B credibility asset (BRAND-CONTEXT §2.5). */}
      <EaVenueNetwork />

      {/* ── ACT III: PROOF & PROCESS ── */}

      {/* 21. CepTestimonialsHeader — massive «ОТЗЫВЫ» headline (130px) on
          cream. CEP's "just the word, massive" pattern. */}
      <CepTestimonialsHeader />

      {/* 22. CepTestimonialsCarousel — auto-scrolling, peeking next card, NO
          arrows/dots, infinite loop. Anonymous social proof. */}
      <CepTestimonialsCarousel />

      {/* 23. EaNamedTestimonials — Cycle 28 NEW. Named-institution
          testimonials grid (4 cards with NAME + ROLE + ORGANIZATION: Анна
          Морозова/Яндекс, Игорь Власов/СБЕР, Мария Кутузова/Гинза, Дмитрий
          Соколов/ТД Северная Звезда). EA §3.11 named-credibility pattern. */}
      <EaNamedTestimonials />

      {/* 24. CepProcess — "ТВОРЧЕСКИЙ ПОДХОД" 3-step process: 01 МЕЧТА /
          02 СОЗДАНИЕ / 03 НАСЛАЖДЕНИЕ. How we work — the creative edge. */}
      <CepProcess />

      {/* 25. EaCapabilityStrip — Cycle 28 NEW. Black-bg capability-as-brand-
          proof strip — 5 unusual capabilities (Аварийный 24/7 / Полевая кухня /
          Шатёр-монтаж / Видео-трансляция / Сцена и свет). EA "Disaster Relief"
          nav-item pattern — signalling "we can do anything". */}
      <EaCapabilityStrip />

      {/* 26. CepLocationsStrip — full-bleed dim photo + "INTERFOOD CATERING"
          wordmark + "САНКТ-ПЕТЕРБУРГ | МОСКВА | ВСЯ РОССИЯ" city strip.
          Magazine colophon feel. */}
      <CepLocationsStrip />

      {/* 27. EaPressStrip — Cycle 28 NEW. Standalone 8-publication press
          strip (Resto.ru · Афиша Daily · The Village · Собака.ru · Time Out ·
          Forbes · Ресторановед · Gastronomika). Text-only Playfair italic
          logos + small taglines. Restored per AGENTS.md §17 TODO. */}
      <EaPressStrip />

      {/* 28. CepInstagramGrid — "СЛЕДИТЕ ЗА НАМИ" 3×3 grid with Reel play
          icons. Follow-along social proof. */}
      <CepInstagramGrid />

      {/* ── ACT IV: CONVERSION ── */}

      {/* 29. EaPhilosophyQuote — Cycle 28 REPLACES QuoteBand. Pure-black bg
          + giant red Playfair italic quote mark + «Еда — это не логистика.
          Это *ритуал*…» cinematic trust beat before the calculator. EA §4.5
          italic-as-fragment device. */}
      <EaPhilosophyQuote />

      {/* 30. Calculator — interactive price calculator (nuqs state). User
          has read all brand proof → ready to commit. Sits right before FAQ
          + Contact so the lead form follows naturally. */}
      <Suspense fallback={null}>
        <Calculator />
      </Suspense>

      {/* 31. EaFaqAccordion — Cycle 28 REPLACES Faq. Minimalist single-column
          6-item accordion (no tabs, no search, no feedback widgets). EA
          restraint — the typography IS the design. Resolves objections
          before the contact form. */}
      <EaFaqAccordion />

      {/* 32. Contact — form → POST /api/lead → Prisma Lead → toast. The
          final CTA. */}
      <Contact />

      {/* 33. EaFinalCta — Cycle 28 REPLACES SocialHandle. Pure-black dramatic
          closer: "Обсудим *событие*?" + 2-CTA pair (Рассчитать стоимость +
          Написать письмо) + 3-line contact strip (TEЛ · POChTA · city). EA
          §3.14 footer pattern, transposed to a hero-scale CTA. */}
      <EaFinalCta />

      <SiteFooter />
      {/* Back-to-top button (appears on scroll > 500px). */}
      <BackToTop />
    </main>
  );
}
