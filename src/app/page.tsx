import { Suspense } from "react";
import { SiteHeader } from "@/components/catering/site-header";
import { TottHero } from "@/components/catering/tott-hero";
import { GgVideoShowcase } from "@/components/catering/gg-video-showcase";
import { GammaMarquee } from "@/components/catering/gamma-marquee";
import { HaccServices } from "@/components/catering/hacc-services";
import { HaccMenu } from "@/components/catering/hacc-menu";
import { TottParallaxBand } from "@/components/catering/tott-parallax-band";
import { EventsVideoCarousel } from "@/components/catering/events-video-carousel";
import { HaccBooking } from "@/components/catering/hacc-booking";
import { TiltedAccent } from "@/components/catering/tilted-accent";
import { EaFounderStory } from "@/components/catering/ea-founder-story";
import { GammaSeparator } from "@/components/catering/gamma-separator";
import { EaFaqAccordion } from "@/components/catering/ea-faq-accordion";
import { CepInstagramGrid } from "@/components/catering/cep-instagram-grid";
import { SiteFooter } from "@/components/catering/site-footer";
/* c89 (3-g): BackToTop ВОЗВРАЩЁН в рендер — владелец: «нет кнопки
   (стрелочки наверх)... приходится все заново наверх пролистывать».
   Fixed bottom-LEFT (телефон-FAB — bottom-right), z-50 над мобильным
   sticky-баром (z-40, hacc-booking.css); скрытие <1024px снято в
   globals.css. Сам компонент не менялся (золотое кольцо прогресса). */
import { BackToTop } from "@/components/catering/back-to-top";
/* c98-FIX1 (критик 3 MINOR): дубль ScrollProgress — компонент рендерился
   ОДНОВРЕМЕННО в layout.tsx (C74, все страницы) и здесь (c84-A) — два
   идентичных fixed-дива с идеальным перекрытием. Снята копия ЗДЕСЬ:
   layout-версия покрывает и главную, и /offer /privacy /terms (текстовые
   страницы с длинной прокруткой — там полоса полезнее всего). */
/* 81-F2b: vanity-URL /menu /events /contacts /calculator приезжают на
   главную через next.config-rewritы с scrollY=0 (hash до браузера не
   доходит) — клиентский скроллер ведёт к целевой секции (см. докстринг
   компонента). Рендерит null, ноль DOM, ноль layout-влияния. */
import { VanityUrlScroll } from "@/components/vanity-scroll";

// Cycle 32 — Simplified 15-section catering site restructure.
//
// STRATEGY: The user explicitly requested a streamlined, conversion-focused
// structure inspired by gammacatering.com, joels.com, mculinary.com and
// ggcatering.com. All editorial experiments (CEP/Salt Block/Ridgewells/MCulinary/
// EA/TOTT/Gamma cycles 21-31) are condensed into a single coherent narrative:
// hero → header → video → photo marquee → parallax band → services → menu →
// founder story → parallax band → events video carousel → calculator+form →
// FAQ → instagram → footer. Two parallax photo bands (GammaSeparator,
// TottParallaxBand) bridge the major acts for cinematic pacing. c89 (3-g):
// CepProcess («Как мы работаем») снят с рендера; founder story перенесён
// сразу под меню («Не нашли нужное?»).
//
// SECTION ORDER (c89/3-g: приведён к ФАКТИЧЕСКОМУ рендеру — CepProcess
// «Как мы работаем» СНЯТ с рендера по указанию владельца, EaFounderStory
// перенесён из акта IV сразу под финальный блок меню «Не нашли нужное?»;
// прежние правки списка: c83-D, Task 2-a):
//
//   ── ACT I: BRAND PROMISE (hero → header → video → marquee) ──
//    1. TottHero              — full-viewport bg video + "Interfood." wordmark
//    2. SiteHeader            — sticky nav, scrolls up with hero, sticks at top:0
//    3. GgVideoShowcase       — ggcatering.com-style 16:9 video block:
//                               looping muted autoplay mp4 + "Кейтеринг как
//                               *искусство*" overlay + Play pill + 2 CTAs.
//    4. GammaMarquee          — infinite horizontal photo marquee (36 real
//                               owner photos, c88 — c89: 8 кадров снял
//                               владелец; CSS-keyframes -50% seam loop).
//    5. GammaSeparator        — PARALLAX BAND. Full-bleed separator photo +
//                               tilted "interfood" Marck Script watermark.
//                               Task 2-a: moved here from the founder→FAQ gap.
//
//   ── ACT II: WHAT WE OFFER (services → menu → founder story) ──
//    6. HaccServices          — gamma-style horizontal accordion «Каталог
//                               услуг» (6 форматов + цены, c89/3-b; Ken
//                               Burns exhale).
//    7. HaccMenu              — меню-каталог в той же hacc-идиоме (корешки,
//                               тинты, Marck Script, табы пакетов); финальный
//                               блок секции — «Не нашли нужное?».
//    8. EaFounderStory        — founder-forward 2-col About: история кухни
//                              + цитата основателя + CTA (c86-C: числа убраны).
//                              c89/3-g: ПЕРЕНЕСЁН сюда из акта IV — «Главу 6
//                              перенести сразу под "не нашли нужное?"»
//                              (владелец); глава перенумерована 06 → 04.
//
//   ── ACT III: GALLERY (parallax band → events video carousel) ──
//    9. TottParallaxBand      — PARALLAX BAND. CSS-parallax bg + char-split
//                               headline + "bon appétit" script. Cinematic
//                               pause before the events gallery (c89: сидит за
//                               founder story, который теперь замыкает акт II).
//   10. EventsVideoCarousel   — карусель 4 видео-тизеров (сток-b-roll «Кухня
//                               в движении», c36; c87 ошибочно сняла с рендера
//                               — c88 вернула). Модалка полного видео, снап,
//                               автопрокрутка 5с, паузы hover/focus.
//
//   ── ACT IV: CONVERSION (booking → FAQ → instagram → footer) ──
//   11. HaccBooking           — Cycle 64 «СМЕТА-ЧЕК INTERFOOD»: merged
//                              calculator + lead form + contacts in one
//                              receipt scene (nuqs state, POST /api/lead).
//                              Anchors: #calculator (section top), #lead-form
//                              (form zone), #contact (contacts zone at the
//                              section bottom — c89).
//   12. EaFaqAccordion        — minimalist 6-item accordion (resolves
//                              objections). Глава 06 (c89).
//   13. CepInstagramGrid      — 3×3 IG grid with Reel play icons (social
//                              proof). Глава 07 (c89).
//   14. BackToTop             — floating ↑ button (fixed bottom-left, gold
//                              progress ring). c89/3-g: ВОЗВРАЩЁН — Task 2-a
//                              снимал его за компанию с FAB/рельсом глав;
//                              владелец попросил стрелку наверх обратно.
//   15. SiteFooter            — dark navy footer with newsletter + 3-col +
//                              cities marquee.
//
// PARALLAX BAND PLACEMENT (per user: "между некоторыми блоками можно оставить
// классные фотки с параллакс эффектом, которые уже есть"):
//   - GammaSeparator       between #4 photo marquee and #6 services — visual
//                          breather (Task 2-a: moved from the founder→FAQ gap,
//                          replacing CepEditorialDivider in this slot)
//   - TottParallaxBand    between #8 founder story and #10 events video
//                          carousel — cinematic pause (c89: сдвинута за
//                          founder story, который теперь сидит под меню)
//
// REMOVED (per user: "остальное убрать с сайта") — these 30+ components remain
// on disk for reference but are no longer rendered:
//   CepEggHero, CepClientMarquee, CepRedStats, CepWhyUs, CepSimpleBrilliant,
//   CepTestimonialsHeader, CepTestimonialsCarousel, EditorialIntro, Manifesto,
//   EaChefQuote, ChefPortrait, TastingMenuExperience, EaSeasonalTabs,
//   EaTastingCta, SustainabilityStrip, EaServicesGrid, ServicesOverview,
//   GammaAccordion, GammaHaccordion, EaVenueNetwork, EaNamedTestimonials,
//   EaCapabilityStrip, CepLocationsStrip (subsumed by EaVenuesSpotlight),
//   EaPressStrip, EaCareersBlock, EaPhilosophyQuote, EaFinalCta,
//   TottBestCatering, DeliveryBlock (компонент и якорные ссылки — на диске,
//   в рендере его нет; конверсию ведут HaccBooking и хедер/футер CTAs).
//
// REMOVED in Task 2-a (user cleanup, files stay on disk per repo convention):
//   CepEditorialDivider — the parallax band below the photo carousel was
//   replaced by GammaSeparator (moved up from the founder→FAQ gap);
//   BackToTop — floating ↑ button dropped together with the ambient-audio
//   FAB and the chapter-nav scroll rail in layout.tsx (fewer floating
//   overlays over the content). c89/3-g: BackToTop ВОЗВРАЩЁН (владелец
//   попросил стрелку наверх) — см. №14 ниже.
//
// REMOVED in c89/3-g (files stay on disk per repo convention):
//   CepProcess — «КАК МЫ РАБОТАЕМ» compact 4-step strip (бывш. №10) снят
//   с рендера по указанию владельца; главы перенумерованы: 01 услуги,
//   02 меню, 03 история основателя (под «Не нашли нужное?»), 04 видео-
//   карусель, 05 смета-чек,
//   06 FAQ, 07 инстаграм.
//
// F2 (cycle-71, K4-MAJOR): `export const dynamic = "force-dynamic"` УДАЛЁН.
// Витрина полностью статична: все компоненты — клиентские, серверных
// запросов/Prisma в дереве страницы нет, nuqs-стейта хватает Suspense.
// force-dynamic глушил HTML-кэш на проде (no-store) — каждый запрос
// обходился полным SSR. Теперь страница пререндерится и кэшируется.

/* Task 1-b (cycle-71): FAQPage JSON-LD перенесён ИЗ layout.tsx — гайдлайн
 * Google: схема FAQ должна жить на странице с ВИДИМЫМ FAQ-контентом
 * (EaFaqAccordion — секция 12 этой страницы; на /offer /privacy /terms
 * видимого FAQ нет). Тексты 1-в-1 зеркалят FAQ_ITEMS из
 * ea-faq-accordion.tsx (Cycle 39). */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "От скольких гостей вы принимаете заказ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "От одного. Ужин на двоих, семейное торжество, банкет на пятьсот человек — обсудим формат, соберём меню под повод и площадку.",
      },
    },
    {
      "@type": "Question",
      name: "За сколько дней нужно бронировать?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Свадьбы и большие банкеты лучше бронировать за несколько недель — успеем собрать меню, смету и команду. Корпоративные и семейные форматы — за несколько дней. А если срочно — просто позвоните, постараемся выручить.",
      },
    },
    {
      "@type": "Question",
      name: "Что входит в стоимость?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Еда, доставка по городу в пределах КАД (загородные форматы — по области, зону подтвердим при заказе), сервировка, посуда и текстиль, повар и официанты на площадке, лёгкое цветочное сопровождение столов. Не входит аренда площадки, алкоголь и музыка — с ними поможем организовать.",
      },
    },
    {
      "@type": "Question",
      name: "Учтёте аллергии и особые диеты?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Да. Вегетарианское, веганское, безглютеновое, халяль, кошер — адаптируем меню. Аллергии просим сообщить при заказе, кухня учтёт их в каждом блюде.",
      },
    },
    {
      "@type": "Question",
      name: "Как проходит оплата?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Предоплата при подтверждении заказа, финальный расчёт — до события. Для юридических лиц работаем по безналичному расчёту. Точные условия фиксируем в договоре.",
      },
    },
    {
      "@type": "Question",
      name: "С чего начать?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Оставьте заявку или позвоните. Обсудим повод и формат, предложим меню, пришлём смету. Дальше — договор, и в день события на вашей площадке работает наша команда.",
      },
    },
  ],
};

/* 81-F3 (S1, критик C — MAJOR): SSR-shell конверс-блока. HaccBooking обязан
 * жить в Suspense (nuqs useQueryState) — при СТАТИЧЕСКОМ пререндере проде
 * fallback={null} оставлял в SSR-HTML пустоту: якоря #calculator/#contact
 * (шапка/футер/privacy/offer/llms.txt) и H2 секции отсутствовали в сыром
 * HTML. Фикс — паттерн Next.js Streaming-гайда (81-R1/P4): серверный
 * статичный фоллбэк-шелл с НОСИТЕЛЯМИ ЯКОРЕЙ + реальным заголовком (1:1
 * разметка живого виджета — TiltedAccent + H2 + лид) + скелет-плашки
 * размерами ≈ виджет (замеры :3001: hb-grid 926px @1280, contacts ~750px;
 * десктоп-стрейч правой колонки — грид-стрейч).
 *
 * Ключевое решение (координация с 81-F2, хозяином hacc-booking.tsx):
 * якоря живут В ФОЛЛБЭКЕ, а не в постоянной обёртке ВНЕ Suspense —
 * hacc-booking.tsx рендерит СОБСТВЕННУЮ <section id="calculator"> (не мой
 * файл, «рендерится как раньше»); постоянная внешняя обёртка с id давала бы
 * ДУБЛЬ id после гидрации. React заменяет фоллбэк на виджет одним коммитом
 * — якорь #calculator/#contact существует и в SSR-HTML (фоллбэк), и после
 * гидрации (живой виджет), ни в один момент двух экземпляров нет. Нюанс
 * верификации: dev :3001 рендерит динамически (Suspense не срабатывает,
 * виджет в SSR-HTML всегда); фоллбэк проверялся временным прямым рендером
 * (research/f3/) — прод-проверка сырого HTML за оркестратором (ребилд :3002
 * в этой сессии запрещён).
 *
 * c89 (3-g): #contact переехал на зону КОНТАКТОВ ВНИЗУ секции (ContactsZone
 * виджета; зона формы теперь #lead-form, открывается CTA калькулятора) —
 * якорь-держатель в шелле сидит у нижних плашек, 1:1 с новой геометрией
 * виджета.
 */
function HaccBookingShell() {
  return (
    <section
      id="calculator"
      data-header-theme="light"
      aria-labelledby="hbooking-heading"
      data-stage="calc"
      className="hbooking ea-section ea-section--cream section-light relative"
    >
      <div className="ea-container ea-container--wide">
        {/* Шапка — 1:1 с живым виджетом (hacc-booking.tsx: hb-head):
            одинаковая разметка/классы => свап фоллбэка не двигает
            заголовок (зона текста — CLS=0), SSR-HTML получает H2+лид.
            c85: глава 05 — зеркалит живой виджет (единая нумерация). */}
        <div className="hb-head">
          <span className="ea-chapter" aria-hidden="true">Глава 05</span>
          <TiltedAccent text="смета-чек" size="clamp(1.1rem, 1.8vw, 1.55rem)" />
          <h2 id="hbooking-heading" className="ea-section-h2">
            {/* c93 (заказчик): «Соберите банкет» → «Соберите меню» —
               зеркало живого виджета (hacc-booking.tsx), 1:1. */}
            {"Соберите меню. "}
            <i className="ea-italic-fragment hb-h2-line">Чек напечатается сразу.</i>
          </h2>
          <p className="hb-lede">
            Выберите формат и гостей — смета-чек напечатается рядом.
            Ещё выбираете формат? Оставьте заявку — подберём и посчитаем вместе.
          </p>
        </div>

        {/* Сцена-скелет: серо-кремовые плашки (декоративны — aria-hidden).
            Левая колонка — контроловые блоки (тип/гости/дата), правая —
            панель смета-чека (на xl растягивается грид-стрейчем, как живой
            sticky-чек). Высоты подобраны под замеры живого грида. */}
        <div className="hb-grid" aria-hidden="true">
          <div className="flex flex-col gap-8">
            <div className="h-64 md:h-[320px] rounded-2xl bg-cep-cream-warm ring-1 ring-ink/10" />
            <div className="h-48 md:h-[230px] rounded-2xl bg-cep-cream-warm ring-1 ring-ink/10" />
            <div className="h-32 md:h-[150px] rounded-2xl bg-cep-cream-warm ring-1 ring-ink/10" />
          </div>
          <div className="h-[480px] rounded-3xl bg-cep-cream-warm ring-1 ring-ink/10 md:h-[620px] xl:h-auto" />
        </div>

        {/* c89 (3-g): якорь #contact живёт на зоне КОНТАКТОВ внизу секции
            (ContactsZone виджета; зона формы — #lead-form). Держатель —
            пустой div.hb-zone (scroll-margin-top: 96px, как у живой зоны)
            стоит прямо перед нижними плашками — 1:1 с геометрией виджета.
            После гидрации заменяется живым div#contact — дубля id нет
            (фоллбэк уходит целиком). */}
        <div id="contact" className="hb-zone" />

        {/* Низ секции — контакты/карта: грубые плашки ≈ 750px живой зоны. */}
        <div className="mt-16 md:mt-24" aria-hidden="true">
          <div className="h-40 rounded-2xl bg-cep-cream-warm ring-1 ring-ink/10 md:h-48" />
          <div className="mt-6 h-[320px] rounded-3xl bg-cep-cream-warm ring-1 ring-ink/10 md:h-[380px]" />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main
      id="main-content"
      role="main"
      tabIndex={-1}
      className="flex min-h-screen flex-col bg-cream outline-none"
    >
      {/* c98-FIX1: ScrollProgress снят отсюда (дубль с layout.tsx — см.
          импорт-блок); полоса живёт в layout и покрывает эту страницу. */}

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

      {/* 4. GammaMarquee — Cycle 31 · Cycle 88: 36 реальных фото владельца
             (Яндекс.Диск, конвейер c87 — webp q82, честные alt, лого-кропы;
             c89: 8 кадров сняты владельцем) вместо 14 стоковых gamma-кадров
             — по указанию владельца «наши фотки» именно сюда, сразу за
             «Кейтеринг как искусство».
             Бесконечная горизонтальная лента (CSS-keyframes -50% seam loop +
             WAAPI playbackRate, дети задублированы для бесшовного цикла),
             тайлы единой высоты с пропорцией самого кадра («правда фото»),
             цикл 137с (c89/3-a) ≈ прежние ~115 px/s. Pure photo scroll — no
             text overlay, per gamma. The first wow photo moment after the
             video block. */}
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
             5 vertical spines in a flex rack (c89/3-b: 12 панелей схлопнуты
             в 6 форматов) — the exact gamma mechanics
             (flex-grow 0→1 transition, spine widens when open, JS-fixed
             panel width so content never reflows mid-animation, is-resizing
             guard) — reverse-engineered in
             research/gamma-haccordion-research.md.

             UPGRADES over gamma: 6 форматов (c89/3-b) vs their 4 (prices,
             hooks, per-service warm tints), inert + delayed visibility on
             closed panels (fixes gamma's live Tab-focus-leak bug), full
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
          (hacc-механика: корешки, тинты, Marck Script, табы пакетов).
          Финальный блок секции — «Не нашли нужное?» (Task 7-E). */}
      <HaccMenu />

      {/* 8. EaFounderStory — Cycle 28 founder-forward 2-col About: photo LEFT,
              story + founder quote + CTA RIGHT (c86-C: строка чисел убрана).
              Italic-as-fragment "Накрываем *ваш* стол." c89/3-g: ПЕРЕНЕСЁН
              сюда (бывш. №15, акт IV) — «Главу 6 перенести сразу под "не
              нашли нужное?"» (владелец): сидит сразу за финальным блоком
              HaccMenu, до параллакс-ленты. Глава 06 → 04 (c89). */}
      <EaFounderStory />

      {/* 9. TottParallaxBand — PARALLAX BAND. Talk of the Town CSS-parallax bg
             (background-attachment:fixed) + char-split headline reveal + "bon
             appétit" script accent. Editorial pause bridging Act II → Act III
             (c89/3-g: теперь за founder story — тот замыкает акт II под
             меню). */}
      <TottParallaxBand />

      {/* ── ACT III: GALLERY ── */}

      {/* 10. EventsVideoCarousel — Cycle 32. RESTORED in Cycle 36 · Cycle 88
             (c87 по ошибке подменила её фото-галереей EaEventsPortfolio —
             видео-карусель вернули на место; реальные фото переехали в
             GammaMarquee №4 — с c89 их 36, EaEventsPortfolio остаётся на
             диске по конвенции репо). Carousel of 4
             event-type video tiles with looping muted autoplay teasers + caption
             panel + center play-pill CTA that opens a fullscreen modal with the
             full unmuted video + controls. Magazine scroll-snap-x mandatory pattern,
             5s auto-advance, pause-on-hover, ESC closes the modal. Sits between
             TottParallaxBand (the editorial pause) and HaccBooking (the
             receipt/calculator scene) — a cinematic trust beat showing the food
             in motion. */}
      <EventsVideoCarousel />

      {/* ── ACT IV: CONVERSION ── */}

      {/* 11. HaccBooking — Cycle 64 «СМЕТА-ЧЕК INTERFOOD». Объединяет бывшие
              Calculator (14) и Contact (19) в одну сцену-предмет: слева — сбор
              банкета (тип события / слайдер гостей с одометром / дата), справа —
              красная панель с живым бумажным смета-чеком (itemized-строки,
              spring-итог; c89: сезонная строка ×1.15 УДАЛЕНА — calcTotal без
              надбавки) + магнитная CTA. Хендофф: чек сжимается в карточку-шапку,
              под контролами раскрывается 2-шаговая форма (контакты → отправка)
              с prefill из nuqs-стейта → POST /api/lead → штамп + tear-off +
              конфетти. Низ секции — контакты-зона: бейдж «Отвечаем в любое
              время», быстрые ссылки, ленивая Яндекс-карта. Якоря (c89):
              id="calculator" (секция), id="lead-form" (зона формы),
              id="contact" (зона контактов внизу секции) — на #calculator
              смотрят конверс-CTA (шапка «Заказать», hacc-services,
              hacc-menu, gg-video-showcase), на #contact — «Контакты»
              шапки/футера, privacy/offer. Спека: research/c64/SPEC.md; дизайн:
              research/c64/RESEARCH-DESIGN.md. Компонент обязан жить в
              Suspense (требование nuqs useQueryState). 81-F3 (S1): fallback —
              серверный SSR-shell (HaccBookingShell выше): якоря + H2 + скелет
              в статичном HTML пререндера, виджет гидрируется как раньше.
              Старые Calculator/Contact остаются на диске (конвенция репо),
              НЕ рендерятся. */}
      <Suspense fallback={<HaccBookingShell />}>
        <HaccBooking />
      </Suspense>

      {/* 12. EaFaqAccordion — Cycle 28 minimalist single-column 6-item accordion
              (no tabs, no search, no feedback). EA restraint — the typography IS
              the design. Resolves objections after the booking scene (c89/3-g:
              founder story уехал под меню, FAQ остался перед инстаграмом).
              Глава 07 → 06 (c89). */}
      <EaFaqAccordion />

      {/* 13. CepInstagramGrid — "СЛЕДИТЕ ЗА НАМИ" 3×3 grid with Reel play icons.
              Follow-along social proof. Глава 08 → 07 (c89, 3-f). */}
      <CepInstagramGrid />

      {/* 14. BackToTop — c89/3-g: ВОЗВРАЩЁН (Task 2-a снимал — см. докблок
              импорта): плавающая ↑-кнопка, fixed bottom-LEFT + золотое кольцо
              прогресса скролла; на <1024px больше НЕ прячется (правило скрытия
              убрано из globals.css) — владелец листает с телефона. */}
      <BackToTop />

      {/* 15. SiteFooter — dark navy footer with newsletter + 3-col + cities marquee.
              Полные реквизиты/соцсети — здесь (HaccBooking дублирует только
              быстрые CTA-контакты, SPEC §2.10). */}
      <SiteFooter />

      {/* Task 1-b (cycle-71): FAQPage JSON-LD (перенос из layout.tsx) —
          schema живёт там, где есть видимый FAQ-контент (секция 12,
          EaFaqAccordion выше). Server component — рендер в SSR-HTML. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 81-F2b: vanity-URL-скроллер (см. импорт выше) — самый конец
          страницы: событие монтируется после всех секций, к моменту
          effect-тактов DOM-дерево готово, getElementById находит цель. */}
      <VanityUrlScroll />
    </main>
  );
}
