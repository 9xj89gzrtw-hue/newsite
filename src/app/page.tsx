import { Suspense } from "react";
import { SiteHeader } from "@/components/catering/site-header";
import { TottHero } from "@/components/catering/tott-hero";
import { GgVideoShowcase } from "@/components/catering/gg-video-showcase";
import { GammaMarquee } from "@/components/catering/gamma-marquee";
import { HaccServices } from "@/components/catering/hacc-services";
import { HaccMenu } from "@/components/catering/hacc-menu";
import { TottParallaxBand } from "@/components/catering/tott-parallax-band";
import { EventsVideoCarousel } from "@/components/catering/events-video-carousel";
import { CepProcess } from "@/components/catering/cep-process";
import { HaccBooking } from "@/components/catering/hacc-booking";
import { EaFounderStory } from "@/components/catering/ea-founder-story";
import { GammaSeparator } from "@/components/catering/gamma-separator";
import { EaFaqAccordion } from "@/components/catering/ea-faq-accordion";
import { CepInstagramGrid } from "@/components/catering/cep-instagram-grid";
import { SiteFooter } from "@/components/catering/site-footer";

// Cycle 32 — Simplified 17-section catering site restructure.
//
// STRATEGY: The user explicitly requested a streamlined, conversion-focused
// structure inspired by gammacatering.com, joels.com, mculinary.com and
// ggcatering.com. All editorial experiments (CEP/Salt Block/Ridgewells/MCulinary/
// EA/TOTT/Gamma cycles 21-31) are condensed into a single coherent narrative:
// hero → header → video → photo carousel → services → events → where-we-work →
// menu → events video carousel → algorithm → delivery → calculator → about →
// FAQ → instagram → form → footer. Two parallax photo bands (GammaSeparator,
// TottParallaxBand) bridge the major acts for cinematic pacing.
//
// SECTION ORDER (per task spec, "остальное убрать с сайта"):
//
//   ── ACT I: BRAND PROMISE (hero → header → video → carousel) ──
//    1. TottHero              — full-viewport bg video + "Interfood." wordmark
//    2. SiteHeader            — sticky nav, scrolls up with hero, sticks at top:0
//    3. GgVideoShowcase       — NEW. ggcatering.com-style 16:9 video block:
//                               looping muted autoplay mp4 + "Кейтеринг как
//                               *искусство*" overlay + Play pill + 2 CTAs.
//    4. GammaMarquee          — infinite horizontal photo marquee (14 portrait photos).
//    5. GammaSeparator        — PARALLAX BAND. Full-bleed separator photo + tilted
//                               "interfood" Marck Script watermark. Task 2-a: moved
//                               here from the founder→FAQ gap — user swapped the
//                               photo band below the carousel for this one.
//
//   ── ACT II: WHAT WE OFFER (services → events → venues → menu) ──
//    6. EaServiceTabs        — 5-tab premium services (Свадьбы · Корпоратив ·
//                               Банкеты · Фуршеты · Выездной Шеф) with contextual CTAs.
//    7. EaEventsPortfolio    — magazine horizontal-scroll event gallery (8 cards).
//    8. EaVenuesSpotlight    — 3-up full-bleed venue cards "Где мы *работаем*."
//    9. Menu                  — 7 menu types interactive list + PDF export.
//   10. TottParallaxBand      — PARALLAX BAND. CSS-parallax bg + char-split headline
//                               + "bon appétit" script. Cinematic pause before the
//                               events video carousel.
//
//   ── ACT III: PROCESS & LOGISTICS (video carousel → algorithm → delivery) ──
//   11. EventsVideoCarousel  — NEW. Carousel of 4 event-type video tiles with
//                               looping muted autoplay teasers + fullscreen click-to-play
//                               modal. Magazine scroll-snap pattern, 5s auto-advance.
//   12. CepProcess           — Cycle 63. «КАК МЫ РАБОТАЕМ» compact 4-step strip:
//                               scroll-drawn red progress rail, sequential step
//                               activation, ink-fill outline numerals.
//   13. DeliveryBlock        — NEW. 2-col split: delivery photo + 5 USPs + 2 CTAs.
//                               "Кейтеринг, который *доставляют*." bridges logistics
//                               into the conversion flow.
//
//   ── ACT IV: CONVERSION (booking → about → FAQ → instagram → footer) ──
//   14. HaccBooking          — Cycle 64 «СМЕТА-ЧЕК INTERFOOD»: merged calculator
//                              + lead form + contacts in one receipt scene (nuqs state,
//                              POST /api/lead). Anchors: #calculator (section top),
//                              #contact (form zone).
//   15. EaFounderStory       — founder-forward 2-col About + 3 count-up stats + CTA.
//                              Task 2-a: followed directly by FAQ (the separator
//                              band between them moved up to section 5).
//   16. EaFaqAccordion       — minimalist 6-item accordion (resolves objections).
//   17. CepInstagramGrid     — 3×3 IG grid with Reel play icons (social proof).
//   18. SiteFooter           — dark navy footer with newsletter + 3-col + cities marquee.
//
// PARALLAX BAND PLACEMENT (per user: "между некоторыми блоками можно оставить
// классные фотки с параллакс эффектом, которые уже есть"):
//   - GammaSeparator       between #4 photo marquee and #5 services — visual
//                          breather (Task 2-a: moved from the founder→FAQ gap,
//                          replacing CepEditorialDivider in this slot)
//   - TottParallaxBand    between #8 menu and #9 events video carousel — cinematic pause
//
// REMOVED (per user: "остальное убрать с сайта") — these 30+ components remain
// on disk for reference but are no longer rendered:
//   CepEggHero, CepClientMarquee, CepRedStats, CepWhyUs, CepSimpleBrilliant,
//   CepTestimonialsHeader, CepTestimonialsCarousel, EditorialIntro, Manifesto,
//   EaChefQuote, ChefPortrait, TastingMenuExperience, EaSeasonalTabs,
//   EaTastingCta, SustainabilityStrip, EaServicesGrid, ServicesOverview,
//   GammaAccordion, GammaHaccordion, EaVenueNetwork, EaNamedTestimonials,
//   EaCapabilityStrip, CepLocationsStrip (subsumed by EaVenuesSpotlight),
//   EaPressStrip, EaCareersBlock, EaPhilosophyQuote, EaFinalCta, TottBestCatering.
//
// REMOVED in Task 2-a (user cleanup, files stay on disk per repo convention):
//   CepEditorialDivider — the parallax band below the photo carousel was
//   replaced by GammaSeparator (moved up from the founder→FAQ gap);
//   BackToTop — floating ↑ button dropped together with the ambient-audio
//   FAB and the chapter-nav scroll rail in layout.tsx (fewer floating
//   overlays over the content).
export const dynamic = "force-dynamic";

/* Task 1-b (cycle-71): FAQPage JSON-LD перенесён ИЗ layout.tsx — гайдлайн
 * Google: схема FAQ должна жить на странице с ВИДИМЫМ FAQ-контентом
 * (EaFaqAccordion — секция 16 этой страницы; на /offer /privacy /terms
 * видимого FAQ нет). Тексты 1-в-1 зеркалят FAQ_ITEMS из
 * ea-faq-accordion.tsx (Cycle 39). */
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
        text: "Еда, доставка, сервировка, посуда, текстиль, повар и официанты на месте, а также лёгкое цветочное сопровождение на столах (как во всех пакетах меню); доставка в пределах КАД — за КАД по договорённости. Не входит: аренда площадки, алкоголь, музыка и расширенное флористическое оформление — поможем организовать по запросу.",
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

export default function Home() {
  return (
    <main
      id="main-content"
      role="main"
      tabIndex={-1}
      className="flex min-h-screen flex-col bg-cream outline-none"
    >
      {/* W4-AUDIT NOTE: espresso theme-flip (GammaSeparator) остаётся скрытым
          под bg-cream — секции сидят на захардкоженном --ea-cream с тёмным
          текстом, раскрытие флипа = отдельная дизайн-задача (риск контраста).
          Решение: не трогать в этой сессии. */}
      {/* ── ACT I: BRAND PROMISE ── */}

      {/* 1. TottHero — Cycle 30 Talk of the Town hero graft. Full-viewport
             background VIDEO (mculinary crostini food) + 5px white border frame +
             top-left stack: Prata "Interfood." wordmark + Nothing-You-Could-Do
             "food as art" script. SiteHeader sits in normal flow AFTER this 100vh
             hero, scrolls up with it, and sticks at top:0 with translucent white bg. */}
      <TottHero />

      {/* 2. SiteHeader — rendered AFTER TottHero so it starts below the fold
             (not visible at scrollY=0), scrolls up naturally with the hero, and
             sticks at top:0 via position:sticky when scrolled past. */}
      <SiteHeader />

      {/* 3. GgVideoShowcase — Cycle 32 NEW. ggcatering.com signature video block.
             16:9 aspect-ratio section (~720px tall at desktop) with looping muted
             autoplay MP4 + dark gradient overlay + editorial text overlay
             (eyebrow "НАШ ПОДХОД" → H2 "Кейтеринг как *искусство*" → subtitle →
             2 CTAs "Смотреть меню" + "Рассчитать стоимость"). A centered "Play" pill
             toggles mute/controls on the same <video> element. The first big wow
             moment after the hero, positioned exactly where ggcatering places theirs
             (right after their hero + "Who we are" intro). */}
      <GgVideoShowcase />

      {/* 4. GammaMarquee — Cycle 31. gammacatering.com signature infinite
             horizontal photo marquee (GSAP xPercent:-50, repeat:-1, children
             duplicated for seamless loop). 14 portrait food/event photos. Pure
             photo scroll — no text overlay, per gamma. The first wow photo moment
             after the video block. */}
      <GammaMarquee />

      {/* 5. GammaSeparator — PARALLAX BAND. Cycle 31 gammacatering.com signature
             full-bleed separator image between major sections (their
             `.full-width-image.has-fixed-ratio` pattern). Pure visual rest — no
             CTAs, no body copy, just the cinematic photo + centered -6° handwritten
             "interfood" watermark (gamma's signature "tilted text effect") +
             espresso theme-flip while the band is in view. Task 2-a: moved here
             from the founder→FAQ gap — same full-bleed photo pause before Act II's
             services rack that CepEditorialDivider used to provide. */}
      <GammaSeparator />

      {/* ── ACT II: WHAT WE OFFER ── */}

      {/* 6. HaccServices — Cycle 49 NEW «Каталог услуг». Full redesign per
             user request: copy the gammacatering.com horizontal accordion
             ("Erlebnisse" haccordion) and make it better. One open panel +
             11 vertical spines in a flex rack — the exact gamma mechanics
             (flex-grow 0→1 transition, spine widens when open, JS-fixed
             panel width so content never reflows mid-animation, is-resizing
             guard) — reverse-engineered in
             research/gamma-haccordion-research.md.

             UPGRADES over gamma: 12 panels vs their 4 (prices, hooks,
             per-service warm tints), inert + delayed visibility on closed
             panels (fixes gamma's live Tab-focus-leak bug), full
             prefers-reduced-motion support, autoplay with progress line
             (pauses on hover/focus/hidden/out-of-view, stops after manual
             interaction), hover-intent opening (380ms, fine pointers),
             staggered content entrance + Ken Burns photo exhale
             (transform/opacity only), Marck Script handwritten titles
             tilted −6° (Cyrillic analog of gamma's Adobe Handwriting),
             mobile vertical stack with grid-rows 0fr→1fr + plus→× icons.

             Replaces Cycle 45-48 SpiralServices (kept on disk per repo
             convention). */}
      <HaccServices />

      {/* 7. Menu — Cycle 58: каталог меню в гамма-стиле блока услуг
          (hacc-механика: корешки, тинты, Marck Script, табы пакетов). */}
      <HaccMenu />

      {/* 8. TottParallaxBand — PARALLAX BAND. Talk of the Town CSS-parallax bg
             (background-attachment:fixed) + char-split headline reveal + "bon
             appétit" script accent. Editorial pause bridging Act II → Act III. */}
      <TottParallaxBand />

      {/* ── ACT III: PROCESS ── */}

      {/* 9. EventsVideoCarousel — Cycle 32. RESTORED in Cycle 36. Carousel of 4
             event-type video tiles with looping muted autoplay teasers + caption
             panel + center play-pill CTA that opens a fullscreen modal with the
             full unmuted video + controls. Magazine scroll-snap-x mandatory pattern,
             5s auto-advance, pause-on-hover, ESC closes the modal. Sits between
             TottParallaxBand (the editorial pause) and CepProcess (the "how we
             work" algorithm) — a cinematic trust beat showing the food in motion. */}
      <EventsVideoCarousel />

      {/* 10. CepProcess — Cycle 63. «КАК МЫ РАБОТАЕМ» — compact 4-step strip
              (ЗАЯВКА / СОЗВОН / НАКРЫВАЕМ / УБИРАЕМ): scroll-drawn red progress
              rail, sequential node/step activation, ink-fill outline numerals. */}
      <CepProcess />

      {/* ── ACT IV: CONVERSION ── */}

      {/* 14. HaccBooking — Cycle 64 «СМЕТА-ЧЕК INTERFOOD». Объединяет бывшие
              Calculator (14) и Contact (19) в одну сцену-предмет: слева — сбор
              банкета (тип события / слайдер гостей с одометром / дата), справа —
              красная панель с живым бумажным смета-чеком (itemized-строки,
              spring-итог, честная сезонная строка ×1.15) + магнитная CTA.
              Хендофф: чек сжимается в карточку-шапку, под контролами раскрывается
              2-шаговая форма (контакты → отправка) с prefill из nuqs-стейта →
              POST /api/lead → штамп + tear-off + конфетти. Низ секции —
              контакты-зона: live-бейдж Открыто/Закрыто (Europe/Moscow), быстрые
              ссылки, ленивая Яндекс-карта. Якоря: id="calculator" (секция) и
              id="contact" (зона формы) — на них смотрят шапка, футер, hacc-services,
              hacc-menu, delivery-block, privacy/offer, gg-video-showcase.
              Спека: research/c64/SPEC.md; дизайн: research/c64/RESEARCH-DESIGN.md.
              Компонент обязан жить в Suspense (требование nuqs useQueryState).
              Старые Calculator/Contact остаются на диске (конвенция репо),
              НЕ рендерятся. */}
      <Suspense fallback={null}>
        <HaccBooking />
      </Suspense>

      {/* 15. EaFounderStory — Cycle 28 founder-forward 2-col About: photo LEFT,
              story + 3 count-up stats + CTA RIGHT. Italic-as-fragment "Откройте
              нашу *историю*." + named milestones (СБЕР, ГАЗПРОМ, ЯНДЕКС partnerships). */}
      <EaFounderStory />

      {/* 16. EaFaqAccordion — Cycle 28 minimalist single-column 6-item accordion
              (no tabs, no search, no feedback). EA restraint — the typography IS
              the design. Resolves objections before the contact form.
              Task 2-a: follows the founder block directly — the GammaSeparator
              band that used to sit between them now lives at section 5. */}
      <EaFaqAccordion />

      {/* 17. CepInstagramGrid — "СЛЕДИТЕ ЗА НАМИ" 3×3 grid with Reel play icons.
              Follow-along social proof. */}
      <CepInstagramGrid />

      {/* 18. SiteFooter — dark navy footer with newsletter + 3-col + cities marquee.
              Полные реквизиты/соцсети — здесь (HaccBooking дублирует только
              быстрые CTA-контакты, SPEC §2.10). Task 2-a: BackToTop (бывш. №20)
              удалён — плавающая ↑-кнопка больше не рендерится (компонент остался
              на диске). */}
      <SiteFooter />

      {/* Task 1-b (cycle-71): FAQPage JSON-LD (перенос из layout.tsx) —
          schema живёт там, где есть видимый FAQ-контент (секция 16,
          EaFaqAccordion выше). Server component — рендер в SSR-HTML. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}
