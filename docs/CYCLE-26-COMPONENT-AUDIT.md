# Cycle 26 — Component Audit (Brutal Honesty, Pre–Salt Block Hospitality Editorial Layer)

**Author:** Task ID 3-C — Explore sub-agent (component audit)
**Date:** 2026-09-21
**Scope:** Every file under `src/components/catering/` (64 files) + both files under `src/components/media/`.
**Reference standard:** Salt Block Hospitality (high-end editorial restraint, oversized serif typography, generous whitespace, premium photography, restrained animation).
**Method:** Direct `Read` of every component source + `src/app/page.tsx` + `src/app/globals.css` color tokens. No VLM screenshots in this pass (that's a separate critique-loop task) — ratings below are derived from code + design-system inspection only.

---

## 0. Executive Summary — Five Brutal Findings Up Front

Before the per-component breakdown, five observations that will frame every individual rating below:

### Finding 1 — The codebase is a 4-cycle archaeological dig, not a website.
Cycles 16–25 stacked ~64 catering components on top of each other. Only **19** of those are actually mounted in `src/app/page.tsx`. The remaining ~45 are orphaned clones from prior reference-site passes (Sopranos, Concept-Catering, ggcatering, Ridgewells, joels) — kept around "in case we want them later," but never re-integrated. They represent the single biggest source of design debt: a future agent reading this codebase cannot tell which palette, which type scale, which CTA shape, which eyebrow style is "current." **Decision: aggressively DELETE orphans unless they are reusable primitives (`Reveal`, `OutlineButton`, `SectionHeader`, `SmartImage`, `VideoPlayer`, `TextualLink`, `ScrollCue`, `StackedParallaxImages`).**

### Finding 2 — Three palettes are fighting each other.
From `globals.css` lines 131–188 the design tokens reveal:
- Cycle 16/17 Sopranos palette: `--ink #1F2937` (cool navy-gray, NOT a warm charcoal), `--bordeaux #7A4A1F` (actually a brown, not bordeaux red), `--gold #D4A373` (warm sand-gold, slightly muddy), `--cream #F9FAFB` (a cool near-white, not warm cream).
- Cycle 22 ggcatering: `--gg-lime #5DE680` (vivid lime — has NO business on a luxury catering site), `--gg-charcoal-dark #1A1A1A`.
- Cycle 22 Concept-Catering: `--cc-dark #101010`, `--cc-pink #f087b5` (a flashy bubble-gum pink that is the antithesis of luxury restraint).
- Cycle 21 Ridgewells: `bordeaux` + `cream`.
- Cycle 24 joels: `--sage #7D8470`, `--parchment #EDE8E1`.
- Cycle 25 mculinary: `--mcu-navy #17364D`, `--mcu-cream #F8F5F1`, `--mcu-gold #AF9469`, `--mcu-gold-light #B99D75`, `--mcu-espresso #1A1B1A`.

Salt Block Hospitality's actual palette is a warm editorial cream (`#F4EFE6`-ish), an ink so deep it's almost black, and a single restrained gold. Right now the homepage cycles between navy, brown, pink, lime, sage, and gold depending on which cycle's components you happen to be scrolling past. **Until one palette wins, no single component can be 9/10.**

### Finding 3 — Typography is over-reliant on `clamp()` magic numbers and lacks a documented scale.
Salt Block's whole aesthetic rests on **one** serif type scale: H1 ≈ 88–110px Playfair, H2 ≈ 56–72px Playfair, eyebrow ≈ 11px ls 2.4em, body ≈ 17px lh 1.6. The codebase has at least seven competing "display headline" classes (`.display-headline`, `.display-headline-xl`, `.mcu-h1`, `.mcu-h2`, `.mcu-h3`, `.mcu-card-title`, `.joel-section-title`, `.giant-handle`, `.cc-h1` via `text-[12vw]`). Each one was tuned to a different reference site. Cycle 26 should consolidate to ONE serif scale + ONE eyebrow spec, expressed as CSS variables.

### Finding 4 — Animation is too busy on the informational sections.
Salt Block's reference site is **almost motionless** — fade-in-up + slow Ken Burns, that's it. The current codebase ships: 3D-tilt StatCards, shimmer overlays, vertical-shutter clip-path image reveals, scroll-colorize word-by-word underlines, sparkle-pulse stars, infinite marquees on three separate bands (mcu-marquee, marquee-band, logo-marquee, pink-marquee), 3D-rotating snack-box cube, custom cursor with image preview, ambient audio synthesis, stacked-sticky parallax photo stack, Ken Burns + crossfade hero slideshow. **For a luxury client journey, the animation budget is upside down:** informational sections (About, Menu, FAQ) have the heaviest motion; emotional sections (Manifesto, QuoteBand, SocialHandle) are relatively calm. Cycle 26 should INVERT this: silence the informational sections, let one big editorial moment per page carry the wow.

### Finding 5 — The Russian-language FAQ and contact copy contains English leakage.
In `faq.tsx` the "Was this helpful?" component renders button labels `"Да"` (good) and `"No"` (English, should be `"Нет"`), plus the success toast says `"Thanks for your feedback!"` in English. In `social-handle.tsx` the secondary CTA link says `"View Event Photo Galleries"` in English on a Russian site. In `contact.tsx` the multi-step labels are English (`"Event Type"`, `"Guests & Date"`, `"Submit"`). These are not styling problems, they are correctness bugs that read as "amateurish" the moment a Russian luxury client opens the site. **This alone drops the perceived production-quality by 2 points across any section it touches.**

---

## 1. Per-Component Audit

Decision legend: **KEEP** (already good, ship as-is) · **REDESIGN** (right idea, wrong execution — fix in place) · **REPLACE** (delete and rebuild from a Salt Block reference) · **DELETE** (orphaned or actively harmful — remove from codebase).

### 1.1 Page-Mounted Sections (the 19 components that actually render)

---

## Component: SiteHeader
**File:** `src/components/catering/site-header.tsx`
**Purpose:** Fixed navigation with theme-switching (transparent → light → dark), mega-menu dropdowns, announcement bar mount, mobile menu, two mobile FABs.
**Current rating:** 5/10
**Weaknesses:**
- AnnouncementBar + header + mobile FABs + mega-menu = 4 layers of fixed UI stacked on top of each other — visually noisy and the announcement bar eats 36px of premium hero real estate.
- Wordmark "Interfood<span className='text-gold'>.</span>" with a gold period is an amateurish logo treatment (real luxury brands use a wordmark lockup or just the wordmark, no decorative punctuation).
- The "joel-button-filled" CTA "Проверить дату" is a joels-style sage square button — clashes with the mculinary gold-pill hero aesthetic.
- Mobile has TWO FABs stacked (`bottom-60` calendar + `bottom-44` phone) — confusing hierarchy, and the FABs hide content.
- Mega-menu panels use `bg-white/97 backdrop-blur-xl` — generic SaaS chrome, not editorial luxury.
**Decision:** REDESIGN
**If REDESIGN:**
1. Kill the AnnouncementBar (delete it; seasonal promo belongs as an editorial strip below the hero, not as a header sub-bar). Single clean header only.
2. Replace wordmark + gold-period with a refined Playfair italic wordmark OR a real SVG logotype — no decorative period.
3. Single CTA, square outline style (matches Ridgewells/Salt Block micro-label CTA pattern), tracking 0.2em uppercase 11px — NOT a sage filled square and NOT a gradient pill.
4. Hide the mobile phone FAB; keep only one bottom-right "Забронировать дату" FAB.

---

## Component: McuVideoHero
**File:** `src/components/catering/mcu-video-hero.tsx`
**Purpose:** Full-bleed autoplay-muted video hero with overlay + two-line serif headline "Еда как искусство" + dual CTA.
**Current rating:** 7/10
**Weaknesses:**
- Headline is `<h2>` (semantic) but visually `.mcu-h1` — accessible but the visual hierarchy is awkward; the actual `<h1>` is in the SiteHeader wordmark, which is wrong: a logo isn't an h1.
- The italic accent on "искусство" has a heavy text-shadow glow (`0 0 28px rgba(175,148,105,0.45)`) that reads more "Y2K MySpace" than luxury restraint. Salt Block would let the italic alone do the work.
- Eyebrow "Кейтеринг в Санкт-Петербурге с 2009 года" — but `About` says "С 2014 года" and StatsCard says "11 лет на рынке" (= since 2014). 2009 vs 2014 is an internal contradiction; a luxury client doing diligence will catch this.
- Bottom `animate-bounce` chevron is a bootstrap-era cliché. Salt Block uses a thin 1px vertical scroll line that retracts and re-extends (already implemented in `scroll-cue.tsx` but not used here).
- `clamp(560px, 85vh, 765px)` height is too short for a luxury hero — Salt Block and Ridgewells both go 90–100vh.
**Decision:** REDESIGN
**If REDESIGN:**
1. Remove the gold glow text-shadow; keep only a single subtle legibility shadow (`0 2px 12px rgba(0,0,0,0.4)`).
2. Make the headline the actual `<h1>` (the SiteHeader should not own the h1 — it's a logo).
3. Replace the bouncing chevron with `<ScrollCue />` (already exists in the codebase from Cycle 24 — just wire it up).
4. Bump height to `min(100vh, 900px)` — fill the viewport.
5. Fix the founding-year contradiction (pick one — 2009 or 2014 — and propagate everywhere).

---

## Component: McuMarqueeBand
**File:** `src/components/catering/mcu-marquee-band.tsx`
**Purpose:** Slow infinite-scroll navy band with gold ✦ separators, six catering phrases ("Свадьбы / Корпоративы / …").
**Current rating:** 6/10
**Weaknesses:**
- This is the THIRD marquee on the page (the others are `LogoMarquee` in `site-footer.tsx` "С гордостью обслуживаем" + the `CitiesTrack` footer band). Salt Block has zero marquees; Ridgewells has exactly one (the 94px aubergine band). Three is two too many.
- Phrases ("Свадьбы", "Корпоративы", "Фуршеты") duplicate content already shown in `McuServicesCarousel` cards right below — visual redundancy.
- Navy band between a dark hero and a light About section breaks the editorial breathing rhythm.
- `✦` star separators read more "Instagram caption" than "magazine divider."
**Decision:** REDESIGN (or DELETE)
**If REDESIGN:**
1. Convert to a single static editorial divider — drop the marquee animation entirely. A 1-line horizontal Playfair italic brand sentence centered, generous `py-20`, on `bg-cream` (light), with thin top+bottom 1px rules.
2. If the marquee MUST stay, replace the navy bg with the bordeaux/ink bg used elsewhere and use Ridgewells' `•` separator (not `✦`), and write a single poetic phrase not a keyword list.

---

## Component: About
**File:** `src/components/catering/about.tsx`
**Purpose:** Two-column section: parallax image with vertical-shutter clip-path reveal on left, count-up stats + value-props marquee on right.
**Current rating:** 4/10
**Weaknesses:**
- The single most over-engineered informational section on the page: 3D mouse-tilt StatCards (`perspective: 1000px`, `rotateX/rotateY ±8°`), vertical-shutter `clipPath inset(50% 0 50% 0)` image reveal, two floating particles with infinite-loop `animate={{ y: [-20, 20, -20] }}`, decorative gold/terracotta border frames (`-inset-5 border border-gold/20 rounded-3xl -rotate-3`), shimmer overlay on hover (`linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%)`), glow-pulse floating Award badge with `whileHover={{ rotate: 360 }}`. **For an informational anchor that the user reads in 8 seconds, this is sensory overload.**
- Stats use 4 cards × 4 lucide icons — too "SaaS dashboard" for a luxury site. Salt Block's stat treatment is **one** oversized serif number + one micro-label, repeated 2-3× max.
- Headline "Свадьбы, созданные с любовью" — but this section is supposed to be About (general), not weddings-specific. The headline doesn't match the section purpose.
- Marquee of value-props at the bottom of About is redundant (it appears before the McuServicesCarousel which lists the same things).
- CountUp fallback says it sets final value after 3s — but the duration is 2.2s; if the animation triggers on mount the fallback fires before the animation finishes, causing the displayed value to jump from "0" → final → final+animation.
**Decision:** REDESIGN (heavy)
**If REDESIGN:**
1. Strip ALL motion except a single `Reveal` fade-up on the headline + one subtle parallax on the image. Remove 3D tilt, shimmer, glow-pulse, particles, double-decorative-frame.
2. Cut stats from 4 cards to 3 oversized numbers (e.g., "16 / лет", "2400+ / событий", "75 000+ / гостей"), each ~96px Playfair, no icons.
3. Rewrite headline to match section purpose: "Interfood Catering" or "С 2014 года в Санкт-Петербурге" — not "Свадьбы, созданные с любовью."
4. Remove the value-props marquee (the McuServicesCarousel covers that territory next).

---

## Component: McuPhotoFilmstrip
**File:** `src/components/catering/mcu-photo-filmstrip.tsx`
**Purpose:** Variable-width centerMode Embla carousel of 18 event photos, auto-advances every 3.5s, pause-on-hover.
**Current rating:** 6/10
**Weaknesses:**
- 18 photos at variable widths is visually restless — the eye can never settle on one. Salt Block galleries show 4–6 hero-grade photos in a strict 2×3 or full-bleed editorial grid.
- Auto-advancing filmstrip + arrows + dots + viewport-edge fade masks is a LOT of UI chrome around the photos themselves. The photos lose prominence to the controls.
- Cream textured bg `mcu-section-cream-texture` adds a noisy paper texture that competes with the photography.
- The heading "Мероприятия, которые мы создали" + supporting paragraph is a third repetition of the same idea already in About and McuMarqueeBand.
**Decision:** REDESIGN
**If REDESIGN:**
1. Cut to 6 photos, full-bleed single-image at a time with a slow crossfade (no centerMode strip, no arrows, dots only).
2. Increase per-photo dwell time to 7s (matches Salt Block's slideshow cadence).
3. Remove the cream-paper texture; let the photo breathe on plain `bg-cream` with 200px top+bottom padding.
4. Reframe heading: "Фрагменты наших событий" (more editorial than "Мероприятия, которые мы создали").

---

## Component: Manifesto
**File:** `src/components/catering/manifesto.tsx`
**Purpose:** 250vh pinned scroll moment — giant "LOVE" word as SVG clipPath filled with Ken-Burns food photo, 3 dish layers crossfade inside the letters, manifesto paragraph colorizes word-by-word with bordeaux underline draw-in.
**Current rating:** 8/10
**Weaknesses:**
- Strongest single moment on the page. But the word "LOVE" in English is jarring on a Russian-language site — Salt Block's brand voice wouldn't put an English word at this scale.
- The 3-dish crossfade uses `/media/concorde-handhelds.jpg`, `/media/concorde-boardroom.webp`, `/media/event-06.jpg` — these aren't food close-ups; they're wide event shots. Inside the LOVE glyphs they read as muddy color, not "food."
- The 50vh chapter-divider gradient at the end is unnecessary — let the next section just begin.
- Manifesto text is 33 words long — too long for a word-by-word colorize (user scrolls past before the animation completes).
**Decision:** KEEP (with copy fixes)
**If REDESIGN:**
1. Swap "LOVE" for a Russian equivalent: "ПИР" (literally "feast" — the original Cycle 16 concept per the file header) or "ВКУС".
2. Swap the 3 crossfade photos for actual close-up food shots (ridgewells-scallops, concorde-dessert, ridgewells-veg-mosaic).
3. Cut manifesto paragraph to ~14 words so the colorize completes within the pinned scroll range.

---

## Component: McuServicesCarousel
**File:** `src/components/catering/mcu-services-carousel.tsx`
**Purpose:** 3-up Embla carousel of 6 service cards, autoplay every 5s, pause-on-hover, dots + arrows.
**Current rating:** 5/10
**Weaknesses:**
- A 3-up card carousel is a Shopify / SaaS pattern, not editorial luxury. Salt Block lists services as a vertical editorial index (one row per service, image left + serif title + 2-line body + arrow link right), not as cards.
- Card images use `mcu-service-card-img` with no fixed aspect ratio visible in the JSX — risk of inconsistent heights.
- "Смотреть все услуги" link uses the `mcu-link-underline` text-link style which is fine, but it points to `#calculator` (a CTA) — that's a mislabeled link, it should point to `#services` or be removed.
- Card title "Свадьбы / Корпоративы / Частные приёмы / Крупные события" — but `services-overview.tsx` (currently orphaned) shows the EXACT same 4 categories with better Ridgewells-style two-up layout. The Cycle 21 version is better than the Cycle 25 replacement.
**Decision:** REPLACE (with the orphaned `services-overview.tsx` design language — Ridgewells two-up split)
**If REPLACE:**
1. Delete the carousel entirely. Mount `ServicesOverview` (the Ridgewells two-up split: image 16:10 + 48–56px serif title + outline "Подробнее" button) which already exists in the codebase.
2. Keep the autoplay behavior ONLY if the user wants motion; otherwise the static two-up reads more premium.

---

## Component: McuCtaBand
**File:** `src/components/catering/mcu-cta-band.tsx`
**Purpose:** 94px-tall full-width navy chapter divider with centered eyebrow + headline + arrow link, used twice on the page as section transitions.
**Current rating:** 6/10
**Weaknesses:**
- Two CTA bands on one page is one too many. Chapter dividers should be earned, not formulaic.
- Navy bg + `text-white` headline + gold link is generic — Salt Block's chapter dividers are typographic (an italic Playfair sentence centered on cream), not color-blocked.
- The `mcu-eyebrow-link` has to be overridden with an inline style for the gold color to actually apply (see comment in source) — fragile cascade, easy to break.
- Eyebrow "ГОТОВЫ НАЧАТЬ?" and "СВАДЬБЫ И КРУПНЫЕ СОБЫТИЯ" are both in ALL CAPS Russian — fine, but they're inconsistent (one is a question, one is a noun phrase).
**Decision:** REDESIGN
**If REDESIGN:**
1. Cut to ONE CtaBand on the page (right before Contact), and make it a typographic divider not a color block: italic Playfair sentence centered, 1px rules above + below.
2. Unify the eyebrow copy style — both noun phrases ("СВАДЬБЫ И СОБЫТИЯ") or both questions ("ГОТОВЫ НАЧАТЬ?"), not mixed.

---

## Component: Menu
**File:** `src/components/catering/menu.tsx`
**Purpose:** Interactive 7-menu-type explorer with dietary tag chips, real dishes, "Generate PDF" button.
**Current rating:** 6/10
**Weaknesses:**
- The actual file is ~53KB — massive. Logic for dietary-tag heuristics, dish filtering, PDF generation, toggle states is all in one component. Maintenance burden.
- Dietary tag chips with lucide icons (Leaf, Wheat, Vegan) feel wellness-app, not luxury catering. Salt Block menus are pure typography: dish name (serif) + price (mono right-aligned) + tiny dietary mark in superscript.
- "Download PDF" button with the lucide Download icon is generic.
- The interactive type-switcher (Банкет / Фуршет / Кофе-брейк / …) is good UX but the visual treatment as toggle pills is too "SaaS pricing calculator."
**Decision:** REDESIGN
**If REDESIGN:**
1. Split into 3 files: `menu-data.ts` (dishes + dietary logic), `menu-pdf.ts` (PDF generation), `menu.tsx` (UI only).
2. Replace pill toggles with vertical editorial index — menu type as a left rail, dishes listed right.
3. Render dishes as typography rows: serif dish name (18px) · italic ingredient note (14px) · mono price (16px) right-aligned. No chips, no icons.
4. Move dietary tags inline as small `гб` / `в` / `вг` superscripts per AGENT-INSTRUCTIONS.md.

---

## Component: McuVideoEvents
**File:** `src/components/catering/mcu-video-events.tsx`
**Purpose:** Portrait 9:16 video card carousel (5 slides) auto-advancing every 4.5s on a deep navy gradient.
**Current rating:** 5/10
**Weaknesses:**
- All 5 video slides use the SAME hero MP4 at different `#t=` offsets — visually identical content 5 times. A luxury client will notice.
- Portrait 9:16 cards are an Instagram-reel aesthetic, NOT a luxury catering aesthetic. Salt Block's event photography is landscape 16:10 with full-bleed.
- Navy gradient + gold-light eyebrow + cream Playfair caption = 3 competing text colors on a noisy background.
- This is the second video-heavy section on the page (after the McuVideoHero). Two video sections is overkill.
**Decision:** REPLACE
**If REPLACE:**
1. Delete the carousel. Replace with a single full-bleed 16:9 event film (one signature 30s film of a real banquet, no carousel).
2. If short clips must be shown, use a 3-up static LANDSCAPE grid with poster-only (click-to-play), no autoplay.

---

## Component: McuVenues
**File:** `src/components/catering/mcu-venues.tsx`
**Purpose:** Three square (1:1) venue cards with hover-zoom, on a cream section.
**Current rating:** 6/10
**Weaknesses:**
- Only 3 venues listed (placeholder data) — Salt Block's venue scout shows 4–6 venues with rich detail (capacity, style, location, photos).
- 1:1 square aspect for venue photography is unusual; 16:10 or 4:3 is more editorial.
- Hover-zoom scale 1.06 is good but the caption overlay is a bottom-gradient which competes with the photo.
- Section heading "Где мы работаем" is good; eyebrow "ПЛОЩАДКИ" is acceptable.
**Decision:** REDESIGN
**If REDESIGN:**
1. Expand to 6 venues in a 3×2 grid.
2. Switch to 4:3 landscape aspect.
3. Move the caption below the image (Salt Block pattern), not overlaid.
4. Add per-venue metadata: capacity, district, style ("Лофт", "Особняк", "Шатёр").

---

## Component: Calculator
**File:** `src/components/catering/calculator.tsx`
**Purpose:** Interactive quote calculator with event-type picker, guest-count slider, addons grid, season multiplier, sticky total.
**Current rating:** 6/10
**Weaknesses:**
- A pricing calculator is a CONVERSION tool, not a luxury editorial moment. It belongs, but it's currently styled like a SaaS product configurator (sliders, toggles, emoji icons `🍽️🥂📦☕🥗🔥🏢`, addon cards with lucide icons).
- The emoji set is particularly damaging — emojis on a luxury site are an instant credibility killer.
- The "Telegram / WhatsApp / Share" button row at the bottom uses 5 separate colored icons — visual noise.
- Section is ~38KB — heavy maintenance burden.
**Decision:** REDESIGN (heavy)
**If REDESIGN:**
1. Strip ALL emojis. Replace with no icons or with single tiny lucide line-icons.
2. Reduce addon tiles to a single column of checkbox rows, not a 2×3 card grid.
3. Make the running total a single oversized Playfair number at the top, not a sticky pill at the bottom.
4. Keep the pricing logic (it's a competitive advantage per AGENT-INSTRUCTIONS.md) — only restyle the UI.

---

## Component: McuTestimonials
**File:** `src/components/catering/mcu-testimonials.tsx`
**Purpose:** Single-slide testimonial carousel, autoplay every 5s, stops on interaction, big gold quote mark + 5★ rating.
**Current rating:** 6/10
**Weaknesses:**
- Single-slide carousel hides 3 of 4 testimonials behind a click — Salt Block shows all testimonials as a vertical list of pull-quotes with client names.
- Big gold quote mark `"` as decoration is a 2015 LinkedIn cliché. Real editorial: a single left-aligned italic blockquote, no quote mark decoration.
- 5★ rating row repeated per testimonial is meaningless if every testimonial is 5★. Drop the rating UI.
- Cream-paper texture bg (`mcu-section-cream-texture`) again competes with the typography.
- The `TESTIMONIALS` array is hardcoded inline in the component — should be in `/lib/media.ts` or a dedicated `/lib/testimonials.ts` for editing without code changes.
**Decision:** REDESIGN
**If REDESIGN:**
1. Replace carousel with a vertical list of 3 long-form pull-quotes (50–80 words each), each on its own row separated by a 1px rule.
2. Drop the gold quote mark and 5★ rating UI — trust the words.
3. Move testimonials data out to `/lib/testimonials.ts`.
4. Keep the autoplay concept ONLY if Carousel is the design choice; otherwise static reads more premium.

---

## Component: McuInstagram
**File:** `src/components/catering/mcu-instagram.tsx`
**Purpose:** Navy section, `@nilov_catering` heading, 6×2 grid of 12 square Instagram tiles with hover-zoom.
**Current rating:** 5/10
**Weaknesses:**
- A 6×2 navy section is visually heavy this late in the page (after McuVenues, McuVideoEvents already on cream/navy).
- 12 Instagram tiles in a grid is a 2018 agency-website pattern. Salt Block shows Instagram as a single editorial "Follow us on Instagram" CTA + 3 tiles, OR a horizontal scroll of 4 tiles, never a 12-tile mosaic.
- Heading `@nilov_catering` is the second giant social handle on the page (the first is `SocialHandle` closer) — duplication.
- All tiles link to `https://instagram.com` (placeholder, not the actual profile URL).
**Decision:** REDESIGN
**If REDESIGN:**
1. Cut to 4 tiles in a horizontal row (or 3 tiles + 1 large feature).
2. Move to a cream/light bg (not navy) — Instagram photos pop better on light.
3. Delete the `SocialHandle` section entirely (it's the same content as this one) and let McuInstagram be the sole social closer.

---

## Component: Faq
**File:** `src/components/catering/faq.tsx`
**Purpose:** Searchable FAQ with category chips, accordion items, "Was this helpful?" voting, CTA at bottom.
**Current rating:** 5/10
**Weaknesses:**
- English leakage: button "No" (should be "Нет"), toast "Thanks for your feedback!" (should be "Спасибо за отзыв!").
- Search input + category chips + accordion + vote buttons + bottom CTA = 5 different UI patterns in one section. Salt Block FAQ is a single list of 6–8 questions with `<details>`-style expand.
- Numbered badges (01, 02, 03) on each accordion header add visual noise.
- The `WasHelpful` localStorage vote mechanism is over-engineered for a 1-page site — no one will see the aggregate count threshold.
- Bottom CTA "Didn't find your answer? Give us a call" is English on a Russian site.
**Decision:** REDESIGN
**If REDESIGN:**
1. Fix all English leakage first (this is a 30-minute correctness fix).
2. Strip search + category chips + vote UI. Keep only an accordion of 6–8 questions.
3. Remove the numbered badges.
4. Replace the bottom CTA with a single inline "Не нашли ответ? Позвоните: +7…" link, no boxed card.

---

## Component: Contact
**File:** `src/components/catering/contact.tsx`
**Purpose:** Multi-step (4-step) lead-gen form with event-type picker, guest count, contact info, submit. Posts to `/api/lead`.
**Current rating:** 5/10
**Weaknesses:**
- Step labels `["Event Type", "Guests & Date", "Contact", "Submit"]` are English on a Russian site. Brutal correctness bug.
- A 4-step form on a catering site is conversion-hostile — every step loses ~30% of users. Salt Block uses a single-screen form: name + phone + date + message, one screen, one submit.
- The `OFFICE_HOURS` config is hardcoded in English ("Mon–Fri: 9:00 AM – 7:00 PM") — should be "Пн–Пт: 9:00–19:00".
- The form is ~57KB — too heavy for a contact section.
- Multiple phone-regex variants suggest legacy US-format handling that should be cleaned up to RU +7 format.
**Decision:** REDESIGN (heavy)
**If REDESIGN:**
1. Replace 4-step wizard with a single-screen form (4 fields max): Имя + Телефон + Дата мероприятия + Сообщение.
2. Translate ALL copy to Russian (including step labels, validation messages, office hours).
3. Use phone regex `/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/` for RU format with masked input.
4. Show office hours as a small editorial sidebar, not a status-card component.

---

## Component: SocialHandle
**File:** `src/components/catering/social-handle.tsx`
**Purpose:** Ridgewells-style giant social-handle closer — `@nilovcatering` in oversized Playfair, "Follow Us" eyebrow, hashtag below.
**Current rating:** 7/10
**Weaknesses:**
- Strongest single closer on the page — the giant `@nilov_catering` lockup is exactly the kind of editorial wow Salt Block uses.
- But: English leakage — "Follow Us" eyebrow and "View Event Photo Galleries" link are English on a Russian site.
- Italic-then-not-italic split on `@nilov` (italic) + `catering` (not-italic) is a nice typographic move but reads as two words instead of one handle.
- The handle is `@nilov_catering` (Russian brand "Нилов Кейтеринг") — but the brand name elsewhere is "Interfood Catering." Brand inconsistency.
- Duplicates the McuInstagram section above it.
**Decision:** REDESIGN
**If REDESIGN:**
1. Fix all English leakage ("Следите за нами" eyebrow, "Смотреть фоторепортажи" link).
2. Pick ONE brand identity: either `@interfood_catering` or `@nilov_catering` — not both.
3. If McuInstagram stays, DELETE this section (redundant). If this section stays, DELETE McuInstagram.

---

## Component: SiteFooter
**File:** `src/components/catering/site-footer.tsx`
**Purpose:** 5-section dark navy footer: "Сделано с любовью" intro band + newsletter signup + 3-column main + cities marquee + copyright.
**Current rating:** 5/10
**Weaknesses:**
- "Сделано с любовью" intro band uses a Great Vibes script font at 64px — script fonts are an instant "wedding invitation template" tell. Salt Block uses Playfair italic, not a script face.
- Newsletter signup card uses `bg-cream/5 backdrop-blur-sm` glassmorphism — 2018 trend, not editorial.
- The cities marquee "С гордостью обслуживаем" is the THIRD marquee on the page (after McuMarqueeBand and LogoMarquee).
- 3 columns: Contacts / Navigation / Awards — Awards column repeats the `AwardsStrip` content (which is orphaned but exists).
- The heart icon next to "Сделано с любовью" is a wedding-cake-cliché.
**Decision:** REDESIGN
**If REDESIGN:**
1. Drop the Great Vibes script. Use Playfair italic for "Сделано с любовью" (or skip the intro band entirely — Salt Block footers are quiet).
2. Replace the glassmorphism newsletter card with a clean editorial section: oversized "Подпишитесь на сезонные меню" Playfair + email input + square button.
3. Cut the cities marquee entirely (the McuMarqueeBand already covers keyword scrolling; cities belong in the About section as text, not a marquee).
4. Reduce to 2 columns: Brand + Newsletter on left, Navigation + Contact on right. Drop the Awards column (move awards to a single line of text).

---

## Component: BackToTop
**File:** `src/components/catering/back-to-top.tsx`
**Purpose:** Fixed bottom-left button that appears after 500px scroll, includes a gold scroll-progress ring.
**Current rating:** 6/10
**Weaknesses:**
- Bottom-LEFT placement is unusual (convention is bottom-right); this conflicts with the mobile FABs in SiteHeader (which sit bottom-right). Mixed FAB conventions = confusing.
- Gradient `from-gold to-terracotta` background on the button matches the homepage's primary CTA style — but the progress ring is white, not gold. Inconsistent.
- The scroll-progress ring is a nice detail but is duplicative with ChapterNav (orphaned, also shows progress).
- `size-14` (56px) is small for a tap target on mobile; should be 48–56px with proper `min-h-[44px] min-w-[44px]` (which is set elsewhere, good).
**Decision:** REDESIGN
**If REDESIGN:**
1. Move to bottom-RIGHT (mobile convention).
2. Use a solid bordeaux or ink background, no gradient.
3. Keep the progress ring but make it gold (matches brand).
4. Make sure it doesn't overlap with the mobile "Забронировать дату" FAB from SiteHeader (those FABs should be REMOVED in the SiteHeader redesign).

---

### 1.2 Reusable Primitives (helpers used across multiple sections)

---

## Component: Reveal
**File:** `src/components/catering/reveal.tsx`
**Purpose:** Fade + rise on scroll-into-view wrapper, respects reduced-motion.
**Current rating:** 9/10
**Weaknesses:**
- None significant. Clean, minimal, correct.
- Default `y=28` and `duration=0.7, ease=[0.22, 1, 0.36, 1]` are appropriate.
**Decision:** KEEP

---

## Component: SectionHeader
**File:** `src/components/catering/section-header.tsx`
**Purpose:** Reusable editorial section header — eyebrow + huge Playfair headline + optional lead, with staggered reveal. Supports `tone` (light/dark/bordeaux) and `variant` (default/joels).
**Current rating:** 7/10
**Weaknesses:**
- The `variant="joels"` branch adds a parallel CSS class (`joel-section-title`, `joel-eyebrow`) — dual API is fragile. Should consolidate to one variant.
- `tone="bordeaux"` uses `.tinted-headline` (a custom class) but the lead color is `text-cream/80` which is too low-contrast for accessibility on bordeaux.
- Default headline `display-headline` size is set in globals.css; needs a `size="xl"` option that uses `display-headline-xl` — already implemented, good.
**Decision:** KEEP (with the variant consolidation note)
**If REDESIGN:**
1. Remove the `variant="joels"` branch — unify on the default; tune joels-style sections to use the default with `tone="light"` and `eyebrowClassName` override if needed.
2. Bump bordeaux lead color to `text-cream/90` for WCAG AA.

---

## Component: OutlineButton
**File:** `src/components/catering/outline-button.tsx`
**Purpose:** Ridgewells "View More" outline button — square corners, 1px border, hover fill + invert. Two variants (light/dark).
**Current rating:** 8/10
**Weaknesses:**
- Good primitive — used across `editorial-intro.tsx`, `services-overview.tsx`, `quote-band.tsx`.
- Two variants is correct; no need for more.
- The hover-fill scaleX trick (per globals.css `.ridge-outline-btn`) is elegant.
- Arrow icon is hardcoded to lucide ArrowRight — could be made configurable but probably fine.
**Decision:** KEEP

---

## Component: SmartImage
**File:** `src/components/media/smart-image.tsx`
**Purpose:** Enforced `next/image` wrapper with required `alt`, optional blur placeholder, sensible `sizes` default.
**Current rating:** 9/10
**Weaknesses:**
- None. This is the correct pattern for the codebase.
- Note: many components (e.g., `site-header.tsx` MegaMenu, `instagram-video.tsx`) bypass SmartImage and use raw `<img>` — should be refactored to use SmartImage.
**Decision:** KEEP

---

## Component: VideoPlayer
**File:** `src/components/media/video-player.tsx`
**Purpose:** Single video wrapper — native `<video>` element with external CDN MP4 source, optional controls, aspect-ratio className.
**Current rating:** 7/10
**Weaknesses:**
- `rounded-2xl border border-border bg-black` default chrome is too SaaS — luxury video should be full-bleed, no border, no rounded corners.
- The fallback "Неизвестный источник видео" message is hardcoded Russian — fine.
- Doesn't expose `poster` overrides cleanly.
**Decision:** KEEP (with a className override for hero usage)

---

## Component: TextualLink
**File:** `src/components/catering/textual-link.tsx`
**Purpose:** joels.com signature CTA — 22px×1px horizontal line that scales 2.7× on hover, with 11px Karla uppercase tracked text.
**Current rating:** 8/10
**Weaknesses:**
- Solid primitive; joels' restraint encoded correctly.
- Three tones (`ink`, `cream`, `sage`) is correct.
- The `w-[22px]` is hardcoded; could be a CSS variable but probably fine.
**Decision:** KEEP

---

## Component: ScrollCue
**File:** `src/components/catering/scroll-cue.tsx`
**Purpose:** joels.com signature scroll indicator — 1px × 94px sage line that retracts top-down then re-extends bottom-up, with "SCROLL" label below.
**Current rating:** 8/10
**Weaknesses:**
- Good primitive — but currently NOT MOUNTED on the page (McuVideoHero uses the bouncing chevron instead).
- "SCROLL" label is English on a Russian site — should be "Листайте" or omitted.
**Decision:** KEEP (mount it on the hero)

---

## Component: StackedParallaxImages
**File:** `src/components/catering/stacked-parallax-images.tsx`
**Purpose:** joels.com About-section wow — main landscape image + portrait overlay, parallax at +30/-15 opposite directions.
**Current rating:** 8/10
**Weaknesses:**
- Solid primitive, well-implemented.
- Hidden `sr-only` span with `aspect` value is a code smell (unused prop).
- Ring color `ring-ink/10` is too subtle; should match brand accent.
**Decision:** KEEP (used by joels-about; if joels-about is deleted, this primitive stays as a utility).

---

## Component: OutlineButton
**File:** `src/components/catering/outline-button.tsx`
**Purpose:** *(already reviewed above — KEEP)*
**Current rating:** 8/10
**Decision:** KEEP

---

### 1.3 Layout-Level Components (mounted in `app/layout.tsx`, not in page.tsx)

---

## Component: AnnouncementBar
**File:** `src/components/catering/announcement-bar.tsx`
**Purpose:** Dismissible seasonal promo bar mounted inside SiteHeader; persists dismissal 7 days in localStorage.
**Current rating:** 4/10
**Weaknesses:**
- Sits ABOVE the header and eats 36px of premium viewport height on first visit. Salt Block has no announcement bar.
- `bg-ink` + Sparkles icon + underlined link is generic e-commerce chrome.
- "Новые зимние спецпредложения 2026 — смотреть сезонное меню →" is a marketing intrusion before the hero even loads.
- The grid-template-rows 0fr→1fr animation is clever but unnecessary — a simple opacity fade would do.
**Decision:** DELETE (move seasonal promo into the body as an editorial strip between Manifesto and Menu, or as a QuoteBand-style interruption)

---

## Component: PageBorders
**File:** `src/components/catering/page-borders.tsx`
**Purpose:** Two fixed 1px vertical lines at `left:149px` / `right:149px` framing the content on lg+ viewports (joels.com signature).
**Current rating:** 6/10
**Weaknesses:**
- The joels.com page borders only work if the content respects a strict 1070px max-width frame — but the page has sections with `max-w-7xl` (1280px), `max-w-screen-2xl` (1536px), and full-bleed content (McuVideoHero, McuMarqueeBand, McuInstagram). The borders don't align with anything; they're decoration without a structural purpose.
- 1px ink at 16% opacity is too subtle to read as editorial framing on a cream bg.
**Decision:** REDESIGN (or DELETE if content frame isn't unified)
**If REDESIGN:**
1. Standardize ALL section max-widths to a single `max-w-[1070px]` (joels.com frame).
2. Bump border opacity to 24% so the frame actually reads.

---

## Component: GrainOverlay
**File:** `src/components/catering/grain.tsx`
**Purpose:** Fixed full-viewport SVG turbulence film grain at 5% opacity, mix-blend-overlay, slow `background-position` animation.
**Current rating:** 5/10
**Weaknesses:**
- The 5% opacity is correct, but the 50ms RAF loop animating `background-position` runs forever on the main thread (throttled to 20fps but still).
- Salt Block has ZERO film grain — they trust the photography. Grain on a luxury site reads as "I'm trying to look analog."
- The grain fights with the cream bg and the painterly radial-gradient backgrounds (`editorial-intro.tsx` uses its OWN grain overlay too — double-grained section).
**Decision:** DELETE (or make it opt-in per section, never global)

---

## Component: CustomCursor
**File:** `src/components/catering/cursor.tsx`
**Purpose:** Custom dot+ring cursor with hover-grow on interactive elements; supports `data-cursor` labels and `data-cursor-image` image previews.
**Current rating:** 5/10
**Weaknesses:**
- Custom cursors are a 2019 Awwwards cliché that actively hurts usability (hides the system cursor's affordances, breaks text selection feedback).
- The image-preview-on-hover feature (`data-cursor-image`) is clever but unused in production — no element actually has that attribute set.
- 9999 z-index is a sledgehammer; risks covering modals/toasts.
- On a Russian luxury catering site, the cursor is a distraction. Salt Block uses the native cursor.
**Decision:** DELETE

---

## Component: LenisProvider
**File:** `src/components/catering/lenis-provider.tsx`
**Purpose:** Smooth-scroll provider (Lenis) + optional GSAP ScrollTrigger bridge. Respects reduced-motion.
**Current rating:** 8/10
**Weaknesses:**
- Correct implementation, properly gated by reduced-motion.
- The async GSAP import is fragile (any runtime error silently caught) but the try/catch handles it.
- Duration 1.2s + ease `1.001 - 2^(-10t)` is a good default.
**Decision:** KEEP

---

## Component: CookieConsent
**File:** `src/components/catering/cookie-consent.tsx`
**Purpose:** Fixed-bottom glass banner for 152-ФЗ cookie consent; persists choice in localStorage; loads analytics on accept.
**Current rating:** 6/10
**Weaknesses:**
- `bg-cream/85 backdrop-blur-xl` glassmorphism again — wrong aesthetic for luxury.
- Banner appears 2s after mount with a spring slide-up — too long a delay, user has already scrolled.
- The Cookie lucide icon is cutesy; should be a text label only.
**Decision:** REDESIGN
**If REDESIGN:**
1. Solid `bg-cream` (no blur), 1px top border in `border-gold/20`, square corners.
2. Show on mount (no 2s delay).
3. Drop the Cookie icon; use a small "🍪" or just text "Мы используем cookies."

---

## Component: Preloader
**File:** `src/components/catering/preloader.tsx`
**Purpose:** 4-panel door preloader with cream/gold colors; only shows on first visit per session.
**Current rating:** 4/10
**Weaknesses:**
- A 1.4s preloader on a catering site is pure vanity. Salt Block, Ridgewells, joels — none use a preloader. The hero image should be the first thing the user sees.
- The `Interfood.` wordmark with gradient text + "Catering" mono eyebrow during the load is fine but the user gains nothing from seeing it.
- `bg-gradient-to-b from-cream to-parchment` panels feel like a Squarespace template.
**Decision:** DELETE

---

### 1.4 Orphaned Cycle-21 (Ridgewells) Components — Currently NOT Mounted

These were built in Cycle 21 (Ridgewells clone pass), then superseded in Cycle 25 by the mculinary layer. They're high-quality but unused.

---

## Component: EditorialIntro
**File:** `src/components/catering/editorial-intro.tsx`
**Purpose:** Ridgewells WOW #1 — 10-layer painterly radial-gradient bg + grain + vignette, peach eyebrow, huge serif headline with italic accent + manual line break, dual outline CTAs.
**Current rating:** 8/10
**Weaknesses:**
- Genuinely the most editorially-restrained section in the codebase.
- The peach accent `#E8B889` is the right call on dark backgrounds — but it doesn't match the gold/bordeaux palette used elsewhere.
- The 10-layer painterly radial gradient is a CSS masterpiece but its file-size impact (it's all inline SVG/CSS) is fine.
- Currently orphaned — not mounted in page.tsx.
**Decision:** KEEP + REMOUNT (should sit between McuVideoHero and McuMarqueeBand — replacing the marquee)

---

## Component: MarqueeBand (Ridgewells)
**File:** `src/components/catering/marquee-band.tsx`
**Purpose:** Ridgewells WOW #2 — solid bordeaux bg with infinite marquee of italic Playfair brand phrase + gold sparkle stars, cream pill CTA.
**Current rating:** 7/10
**Weaknesses:**
- Stronger than McuMarqueeBand (better typography, better bg color).
- BUT the floating cream-pill CTA on the right reads as ad-banner chrome.
- Currently orphaned.
**Decision:** KEEP + REMOUNT (replace McuMarqueeBand with this one)

---

## Component: QuoteBand
**File:** `src/components/catering/quote-band.tsx`
**Purpose:** Ridgewells WOW #3 — solid bordeaux bg with radial blooms, 3 gold stars + 4.9/5 rating, tinted-cream headline "Что наши клиенты говорят", oversized gold quote mark, thank-you letter image with date badge.
**Current rating:** 8/10
**Weaknesses:**
- Good editorial moment. The 3 gold stars + rating "4,9 / 5 · 127+ отзывов" is the only trust signal needed.
- Oversized gold quote mark is fine here (on bordeaux, decorative).
- Currently orphaned — should re-mount between McuVenues and Calculator as a trust beat.
**Decision:** KEEP + REMOUNT

---

## Component: ServicesOverview
**File:** `src/components/catering/services-overview.tsx`
**Purpose:** Ridgewells two-up split — 4 service categories in alternating image-left / image-right rows, 16:10 images with hover-zoom + caption reveal, 48–56px serif titles, outline "Подробнее" buttons.
**Current rating:** 8/10
**Weaknesses:**
- Stronger than McuServicesCarousel (more editorial, no carousel noise).
- Caption-reveal-on-hover is a nice touch.
- Currently orphaned — should REPLACE McuServicesCarousel entirely.
**Decision:** KEEP + REMOUNT (replace McuServicesCarousel)

---

### 1.5 Orphaned Cycle-22 (ggcatering / Concept-Catering) Components

These are the lowest-rated components in the codebase. Their visual language (lime green, bubble-gum pink, Barlow Semi Condensed 800, 12vw headlines, 3D cube mockups) is the OPPOSITE of Salt Block editorial restraint.

---

## Component: GgHero
**File:** `src/components/catering/gg-hero.tsx`
**Purpose:** ggcatering.com hero — 10×10 grid image collage + 3 decorative SVG shapes + massive Poppins semibold 3-line headline with rotating italic lime word + pill CTAs.
**Current rating:** 3/10
**Weaknesses:**
- Poppins + lime green + decorative triangle/zigzag SVGs is the antithesis of editorial luxury.
- Rotating word carousel ("ИЗЮМИНКОЙ / шиком / размахом / вкусом / классом / душой / огоньком / стилем / смыслом / страстью") reads as slogan generator, not brand voice.
- 5 image tiles + 3 SVG shapes = 8 visual elements competing for attention.
**Decision:** DELETE

---

## Component: GgWhoWeAre
**File:** `src/components/catering/gg-who-we-are.tsx`
**Purpose:** ggcatering "Who We Are" — vertical-line eyebrow, rotating adjective word-cycle, manifesto paragraph, 3 count-up stats.
**Current rating:** 3/10
**Weaknesses:**
- Same rotating-word wow as GgHero, same Poppins palette.
- 3 count-up stats are duplicative with `About.tsx`'s 4 StatCards.
**Decision:** DELETE

---

## Component: GgFeatureCollage
**File:** `src/components/catering/gg-feature-collage.tsx`
**Purpose:** ggcatering feature collage — 3 alternating dark/light text+image blocks with 2×2 asymmetric image collages.
**Current rating:** 4/10
**Weaknesses:**
- The 2×2 collage with vertical offsets is OK but the lime italic emphasis spans are jarring.
- Dark variant uses `--gg-charcoal-dark #1A1A1A` — a separate dark token from the main `--ink #1F2937`.
**Decision:** DELETE

---

## Component: GgVideoShowcase
**File:** `src/components/catering/gg-video-showcase.tsx`
**Purpose:** ggcatering video player — autoplay muted loop teaser + click-to-expand fullscreen modal.
**Current rating:** 4/10
**Weaknesses:**
- Comment in source confirms: "The video file `/media/ggcatering/gg-hero-video.mp4` is TEMPORARY — copied from ggcatering.com per user request." If still present, it's a copyright liability.
- The `bg-[var(--gg-charcoal-dark)]` is a stray palette token.
**Decision:** DELETE

---

## Component: BoldStatement
**File:** `src/components/catering/bold-statement.tsx`
**Purpose:** Concept-Catering.de editorial statement — massive 12vw Barlow Semi Condensed 800 headline, one pink word, subtext + 2 CTAs.
**Current rating:** 2/10
**Weaknesses:**
- `text-[12vw]` headlines are amateurish — they don't respect viewport max-widths and overflow on ultrawide.
- `cc-pink #f087b5` background + `text-cc-pink` accent — pink is the wrong color for a luxury catering brand.
- Barlow Semi Condensed 800 is a condensed display sans, the wrong typeface for editorial restraint.
**Decision:** DELETE

---

## Component: PinkMarquee
**File:** `src/components/catering/pink-marquee.tsx`
**Purpose:** Concept-Catering.de pink band with infinite marquee of service keywords.
**Current rating:** 2/10
**Weaknesses:**
- Bubble-gum pink `#f087b5` band has no place on a luxury catering site.
- Yet ANOTHER marquee (4th on the page if mounted).
**Decision:** DELETE

---

## Component: RisingPhotos
**File:** `src/components/catering/rising-photos.tsx`
**Purpose:** Concept-Catering.de sticky-stacked photo section — N×100vh tall, each photo sticky-covers the previous on scroll.
**Current rating:** 4/10
**Weaknesses:**
- The sticky-cover technique is clever but 4 sections × 100vh = 400vh of scroll for 4 photos is exhausting.
- Pink category labels + bottom marquee of service titles inside each project = noisy.
- Barlow Semi Condensed 8vw headline inside the photo is the wrong typography.
**Decision:** DELETE (the technique is interesting but the execution is wrong for the brand)

---

## Component: SnackBoxCube3D
**File:** `src/components/catering/snack-box-3d-cube.tsx`
**Purpose:** Phase 8 P2 wow-factor — CSS 3D rotating cube with 6 food photos on its faces, auto-rotates 24s linear, half-speed on hover.
**Current rating:** 3/10
**Weaknesses:**
- A spinning food-photo cube is a 2014 web-design cliché. Salt Block would never.
- 6 face images = 6 separate `next/image` requests for a decorative element.
- The "half-speed on hover" interaction is a tacky gimmick.
**Decision:** DELETE

---

## Component: SnackBoxDelivery
**File:** `src/components/catering/snack-box-delivery.tsx`
**Purpose:** By-The-Tray catering UI — qty stepper rows + running total pill + 3D cube mockup.
**Current rating:** 4/10
**Weaknesses:**
- E-commerce cart UI on a luxury catering site is misplaced — high-end clients don't add trays to a shopping cart, they call a planner.
- The `Truck` icon + "By The Tray" English label is off-brand.
- Depends on SnackBoxCube3D (also recommended for deletion).
**Decision:** DELETE (or REDESIGN as an editorial "Индивидуальные снек-боксы" gallery, no cart UI)

---

### 1.6 Orphaned Cycle-24 (joels) Components

These are joels.com-style components — italic Playfair + sage + page borders. Better than the ggcatering/Concept-Catering layer, but currently NOT mounted.

---

## Component: JoelsCuisine
**File:** `src/components/catering/joels-cuisine.tsx`
**Purpose:** joels.com 3-up card grid — portrait food photos + 28px Playfair labels below, no body, no button.
**Current rating:** 7/10
**Weaknesses:**
- Clean execution. 4:3 landscape (adapted from joels' portrait) reads fine.
- "Еда / Напитки / События" labels are good — 3 clean category entries.
- Currently orphaned — could be a tasteful interstitial between Manifesto and Menu.
**Decision:** KEEP + REMOUNT (optional, low priority)

---

## Component: JoelsAbout
**File:** `src/components/catering/joels-about.tsx`
**Purpose:** joels.com About section — 2-col split with StackedParallaxImages left, sage eyebrow + 50px Playfair headline + body + TextualLink right.
**Current rating:** 7/10
**Weaknesses:**
- Solid editorial execution. The stacked-parallax wow is well-implemented.
- But the existing `about.tsx` already occupies this section in the page — mounting both is redundant.
**Decision:** KEEP as a primitive (could replace `about.tsx` if About gets redesigned)

---

## Component: JoelsContactCta
**File:** `src/components/catering/joels-contact-cta.tsx`
**Purpose:** joels.com final CTA — 2-column form with sage square submit button.
**Current rating:** 6/10
**Weaknesses:**
- Clean form. But the existing `contact.tsx` (multi-step) is the canonical contact form on the page; this is a parallel implementation.
- POSTing to `/api/lead` with a soft-success even on error (per the comment in source) is a fragile pattern.
**Decision:** DELETE (or use as a single-screen replacement for the 4-step `contact.tsx`)

---

### 1.7 Orphaned Legacy / Sopranos-Era Components

---

## Component: Hero (Sopranos)
**File:** `src/components/catering/hero.tsx`
**Purpose:** Fullscreen Sopranos-style hero with 4-slide photo crossfade + Ken Burns + Great Vibes script "Добро пожаловать в" + massive Oswald "INTERFOOD" + sticky sidebar lead-gen form + bottom promo strip.
**Current rating:** 4/10
**Weaknesses:**
- Script font + Oswald condensed + 4-slide crossfade is the OPPOSITE of editorial restraint.
- The sticky sidebar lead-gen form is a SaaS landing-page pattern, not luxury.
- 914 lines of code — superseded by McuVideoHero (153 lines).
**Decision:** DELETE

---

## Component: Testimonials (Sopranos)
**File:** `src/components/catering/testimonials.tsx`
**Purpose:** Long-form testimonial cards with verified badges, avatars, event metadata, ratings, carousel + filter chips.
**Current rating:** 5/10
**Weaknesses:**
- 703 lines — too heavy.
- The verified-badge + avatar + event-metadata + 5★ rating is "trustpilot widget" aesthetic.
- Real catering testimonials on luxury sites are pure typography.
- Superseded by McuTestimonials.
**Decision:** DELETE

---

## Component: Services (Sopranos 3D-flip)
**File:** `src/components/catering/services.tsx`
**Purpose:** 3D flip-card services grid + modal detail view with 11 glow-color variants per service.
**Current rating:** 3/10
**Weaknesses:**
- 3D flip cards + 11 glow-color variants is the most over-engineered component in the codebase (1211 lines).
- 11 different `rgba(...)` glow colors (`rgba(100,140,160,0.20)` steel blue for "Delivery" — but steel blue isn't in the palette; `rgba(180,130,170,0.20)` soft purple for "Decor" — purple isn't in the palette either).
- Superseded by McuServicesCarousel.
**Decision:** DELETE

---

## Component: LogoMarquee
**File:** `src/components/catering/logo-marquee.tsx`
**Purpose:** Infinite client-logo marquee (text wordmark chips: Сбербанк / Газпром / Яндекс / …).
**Current rating:** 5/10
**Weaknesses:**
- Text wordmark chips (no real SVG logos) for client names — looks fake because it IS fake (these clients aren't actually Interfood's clients).
- Gold dot bullets are nice but the marquee format is dated.
- Currently orphaned (was mounted in Cycle 21's page.tsx but replaced in Cycle 25).
**Decision:** DELETE (or REDESIGN as a static 6-logo row of REAL client logos — only if Interfood actually has these clients)

---

## Component: PressStrip
**File:** `src/components/catering/press-strip.tsx`
**Purpose:** "As seen in" band — 6 publication wordmarks (Санкт-Петербургские ведомости / The Village / Time Out / …) in grayscale text, hover → gold.
**Current rating:** 5/10
**Weaknesses:**
- Text wordmarks again (no real press logos).
- Hover-to-gold is OK.
- 6 publications listed with no links to actual articles = unverifiable social proof.
**Decision:** DELETE (or REDESIGN with real press quotes + article links — only if real press exists)

---

## Component: InstagramVideo
**File:** `src/components/catering/instagram-video.tsx`
**Purpose:** Multi-reel horizontal Instagram carousel with hover-to-load embed behavior.
**Current rating:** 4/10
**Weaknesses:**
- Instagram embeds load `instagram.com/embed.js` which sets tracking cookies — needs cookie consent, which is handled, but the iframe sandboxing adds complexity.
- Multi-reel horizontal carousel of Instagram embeds is agency-website circa 2018.
- Replaced by McuInstagram (cleaner, no embeds).
**Decision:** DELETE

---

## Component: ChapterNav
**File:** `src/components/catering/chapter-nav.tsx`
**Purpose:** Vertical progress indicator on right edge — thin track + per-section dots, current section dot fills gold.
**Current rating:** 5/10
**Weaknesses:**
- A right-rail chapter nav is a long-form editorial pattern (good for 5000+ word articles) — overkill for a 1-page catering site.
- Currently NOT mounted in page.tsx (probably good).
- Gold dot + label reveal on hover is OK.
**Decision:** DELETE

---

## Component: PromoBanner
**File:** `src/components/catering/promo-banner.tsx`
**Purpose:** Seasonal promo banner — gold→terracotta gradient bg + Sparkles icon + "Сезонные свадебные меню 2026" headline + white pill CTA.
**Current rating:** 3/10
**Weaknesses:**
- `bg-gradient-to-r from-gold via-terracotta to-gold` is a 2014 web-design cliché.
- Flower2 icons at 64px rotated 180° as background decoration is wedding-invitation territory.
- White pill button on gold gradient = high contrast but wrong voice for luxury.
**Decision:** DELETE (or REDESIGN as a quiet editorial strip with a single italic Playfair line + underline link)

---

## Component: Pillars
**File:** `src/components/catering/pillars.tsx`
**Purpose:** Salt Block pattern — dual brand-pillar cards ("CHEF CRAFT" vs "FIELD SERVICE") with count-up stats, pinned vertical scroll-stack on desktop.
**Current rating:** 5/10
**Weaknesses:**
- Closest in spirit to Salt Block's actual pattern, but the "pinned vertical scroll-stack" wow on a 2-card section is overkill.
- 550 lines for a 2-card section.
- `from-gold/15 to-terracotta/10` gradient accents on cards are unnecessary.
**Decision:** REDESIGN (simplify to a static 2-column grid, no pinned scroll)

---

## Component: Process
**File:** `src/components/catering/process.tsx`
**Purpose:** 4-step process timeline — horizontal grid with scroll-driven gold progress fill on connecting line + active-step highlighting; mobile vertical spine.
**Current rating:** 6/10
**Weaknesses:**
- Solid UX pattern. The 4 steps (Заявка / Дегустация / День мероприятия / Сопровождение) are well-chosen.
- The expandable "Read more" detail rows are a nice touch.
- BUT it's currently orphaned — should be mounted between Manifesto and Menu to set up the "how we work" beat.
**Decision:** KEEP + REMOUNT

---

## Component: EventsGallery
**File:** `src/components/catering/events-gallery.tsx`
**Purpose:** Filterable masonry gallery with category chips, 3D-tilt on hover, lightbox modal, keyboard nav.
**Current rating:** 5/10
**Weaknesses:**
- 796 lines — over-engineered.
- 3D mouse-tilt on every gallery item is performance-heavy and visually noisy.
- Masonry with 8 aspect ratios + 3 featured indices = chaotic grid.
- Lightbox is OK but the keyboard nav (Keyboard icon, MousePointer icon hint) is agency-website chrome.
**Decision:** REDESIGN (cut to a strict 2×3 grid of 6 hero photos, single aspect ratio, no tilt, simple lightbox)

---

## Component: WinterSpecials
**File:** `src/components/catering/winter-specials.tsx`
**Purpose:** Seasonal menu section — dark navy bg + gold accents + 3 promo cards (Зимний банкет / Праздничные закуски / Какао-бар).
**Current rating:** 5/10
**Weaknesses:**
- Great Vibes script "Новые" headline — script font cliché.
- Snowflake + Bell icons are seasonal-decoration territory.
- The 3 cards with aspect-video images + gold price badge are OK but generic.
- Section is orphaned — only linked from AnnouncementBar.
**Decision:** REDESIGN (or DELETE if seasonal promo is moved to QuoteBand-style interruption)

---

## Component: AwardsStrip
**File:** `src/components/catering/awards-strip.tsx`
**Purpose:** Awards band — 3 large badge icons with hover glow, "СМИ о нас" text strip, gold accent lines top+bottom.
**Current rating:** 4/10
**Weaknesses:**
- 3 generic lucide award icons (Trophy / Award / Star) at size-20 — these are placeholder icons, not real award medallions.
- "СМИ о нас" text strip duplicates `PressStrip` content.
- Cream-2 bg + hover gold glow shadow is OK but generic.
**Decision:** DELETE (or REDESIGN with REAL award medallion SVGs if Interfood has actual awards)

---

## Component: AmbientAudio
**File:** `src/components/catering/ambient-audio.tsx`
**Purpose:** Procedural ambient sound via Web Audio API — low-freq brown noise + soft oscillator tones, fade in/out by viewport, mute toggle.
**Current rating:** 3/10
**Weaknesses:**
- Auto-playing ambient kitchen hum on a catering website is a UX anti-pattern.
- Even with the "Enable sound" gate, the audio icon floating in the corner is clutter.
- Web Audio API synthesis costs CPU cycles for no brand value.
**Decision:** DELETE

---

## Component: VideoEvents (legacy)
**File:** `src/components/catering/video-events.tsx`
**Purpose:** Phase-6-era video section with Mux/YouTube/Vimeo fallbacks + chapter markers.
**Current rating:** 4/10
**Weaknesses:**
- 588 lines with multiple legacy fallback paths (Mux deprecated, YouTube legacy, Vimeo auto-detect).
- Superseded by McuVideoEvents (290 lines, native `<video>` only).
**Decision:** DELETE

---

## Component: Cursor (CustomCursor)
**File:** `src/components/catering/cursor.tsx`
**Purpose:** *(already reviewed above — DELETE)*
**Current rating:** 5/10
**Decision:** DELETE

---

## Component: Preloader
**File:** `src/components/catering/preloader.tsx`
**Purpose:** *(already reviewed above — DELETE)*
**Current rating:** 4/10
**Decision:** DELETE

---

## Component: CookieConsent
**File:** `src/components/catering/cookie-consent.tsx`
**Purpose:** *(already reviewed above — REDESIGN)*
**Current rating:** 6/10
**Decision:** REDESIGN

---

## 2. Top 5 Weakest Components (sorted, lowest rating first)

| Rank | Component | File | Rating | Decision |
|------|-----------|------|--------|----------|
| 1 | **BoldStatement** | `bold-statement.tsx` | 2/10 | DELETE |
| 2 | **PinkMarquee** | `pink-marquee.tsx` | 2/10 | DELETE |
| 3 | **GgHero** | `gg-hero.tsx` | 3/10 | DELETE |
| 4 | **GgWhoWeAre** | `gg-who-we-are.tsx` | 3/10 | DELETE |
| 5 | **SnackBoxCube3D** | `snack-box-3d-cube.tsx` | 3/10 | DELETE |

**Honorable mentions (also 3/10):** `Services` (3D flip 1211 lines), `PromoBanner` (gradient cliché), `AmbientAudio` (UX anti-pattern), `AwardsStrip` (placeholder icons), `Preloader` (vanity).

**Pattern:** Every component in the bottom 5 is from the ggcatering (Cycle 22) or Concept-Catering (Cycle 22) clone passes. Their shared aesthetic vocabulary — Poppins, Barlow Semi Condensed, lime green, bubble-gum pink, 12vw headlines, rotating word carousels, 3D cubes — is incompatible with luxury editorial restraint. They should be deleted wholesale.

---

## 3. Top 5 Strongest Components (to use as internal design references)

| Rank | Component | File | Rating | Why it's strong |
|------|-----------|------|--------|-----------------|
| 1 | **Reveal** | `reveal.tsx` | 9/10 | Minimal, correct, reduced-motion-respecting. The pattern all motion should follow. |
| 2 | **SmartImage** | `media/smart-image.tsx` | 9/10 | Enforced `next/image` with required `alt`. The pattern all image renders should follow. |
| 3 | **Manifesto** | `manifesto.tsx` | 8/10 | Single strongest editorial moment on the page. SVG clipPath "LOVE" word-as-window with 3-dish crossfade. |
| 4 | **EditorialIntro** | `editorial-intro.tsx` | 8/10 | Ridgewells painterly radial-gradient bg + italic accent + manual line break — exactly the Salt Block editorial restraint. |
| 5 | **OutlineButton** | `outline-button.tsx` | 8/10 | Ridgewells square outline + hover fill invert — the CTA primitive all sections should use. |

**Honorable mentions (also 8/10):** `SectionHeader`, `TextualLink`, `StackedParallaxImages`, `ServicesOverview`, `QuoteBand`, `MarqueeBand` (Ridgewells), `LenisProvider`, `ScrollCue`.

**Pattern:** The strongest components are all RIDGEWELLS-CYCLE-21 PRIMITIVES or single-purpose editorial moments. They share: (1) Playfair Display as the only display face, (2) italic accents in a single warm tone (peach or gold), (3) manual line breaks in headlines for poetic rhythm, (4) 1px rules as dividers, (5) square outline CTAs, (6) subtle fade-up reveals only.

**These should be the Cycle 26 design language.**

---

## 4. Section Ordering Audit

### Current order in `src/app/page.tsx` (Cycle 25)

```
1.  SiteHeader
2.  McuVideoHero
3.  McuMarqueeBand
4.  About
5.  McuPhotoFilmstrip
6.  Manifesto
7.  McuServicesCarousel
8.  McuCtaBand (#calculator)
9.  Menu
10. McuVideoEvents
11. McuVenues
12. McuCtaBand (#contact)
13. Calculator
14. McuTestimonials
15. McuInstagram
16. Faq
17. Contact
18. SocialHandle
19. SiteFooter
20. BackToTop
```

### Is the order logical for a luxury client journey?

**Mostly yes, with three problems:**

**Problem A — Two consecutive marquee-ish bands at the top (McuMarqueeBand → About → McuPhotoFilmstrip → Manifesto) create a "keywords-then-photos-then-keywords-then-photos" rhythm that's restless.** A luxury client landing on the page wants: hero → quiet editorial intro → big wow → services → menu → social proof → contact. The current order inserts a marquee and a photo strip between the hero and the manifesto, breaking the build-up.

**Problem B — The Manifesto (the page's single best wow moment) is buried at position 6, after the McuPhotoFilmstrip.** Manifesto should be position 3 (right after hero) to establish brand voice before the informational sections begin. Salt Block puts their manifesto-equivalent ("Real food. Real people. Real hospitality.") at the very top of the scroll, immediately after the hero.

**Problem C — Two McuCtaBands (positions 8 + 12) with different copy but identical visual treatment.** The first one (before Menu) interrupts the build-up to the menu; the second one (before Calculator) is more earned but still formulaic. Cut to one.

### Top 3 Reorder Suggestions

**Reorder 1 — Move Manifesto from position 6 → position 3 (immediately after McuVideoHero, before McuMarqueeBand).**

Rationale: the brand voice wow needs to land while the user is still in the hero's emotional momentum. The current About + PhotoFilmstrip prefix dilutes the wow by stacking informational content first.

New order top: `McuVideoHero → Manifesto → McuMarqueeBand (or EditorialIntro if remounted) → About → …`

**Reorder 2 — Replace McuServicesCarousel (position 7) with ServicesOverview (the Ridgewells two-up split, currently orphaned).**

Rationale: a 3-up card carousel is a Shopify pattern; the Ridgewells two-up split with alternating image-left/right rows is editorially more restrained and matches the Salt Block reference. The carousel motion is also busier than the static two-up.

New: `… McuServicesCarousel becomes ServicesOverview (Ridgewells) …`

**Reorder 3 — Move Calculator (position 13) to AFTER Contact (position 17), OR delete it entirely from the homepage and link to it from a quiet editorial CTA.**

Rationale: a calculator is a SaaS conversion tool, not a luxury editorial moment. Putting it between McuVenues and McuTestimonials disrupts the emotional flow from "venues" (aspirational) → "testimonials" (social proof). The calculator belongs as a sub-page `/calculator` linked from the menu and from a quiet CTA in the Contact section.

New: `… McuVenues → McuTestimonials → McuInstagram → Faq → Contact → [Calculator as standalone page] …`

**Bonus reorder 4 (lower priority):** Move QuoteBand (currently orphaned) between McuVenues and McuTestimonials as a single-quote trust beat — gives the user an emotional pause between "venues I could book" and "what clients said."

---

## 5. Recommended New Components to ADD (Salt Block luxury-catering conventions)

Based on the audit, the page is missing the editorial beats that distinguish a luxury catering site from a SaaS pricing site. Recommended additions, ranked by priority:

### New Component 1: `ChefPortrait` (priority: HIGH)
**File:** `src/components/catering/chef-portrait.tsx` (new)
**Purpose:** Single full-bleed portrait of the executive chef + 2-3 sentence bio in italic Playfair + signature scan SVG. Sits between Manifesto and Menu.
**Why:** Salt Block's hero-of-the-chef moment is the most-copied pattern in luxury catering. It humanizes the brand and signals "chef-driven, not corporate."
**Design spec:** 60vh full-bleed, chef portrait right-aligned at 50%, italic Playfair "Шеф-повар · Дмитрий Нилов" left at 56px, 3-line bio below in 18px serif, signed signature SVG below bio.
**Est. complexity:** ~120 lines, 1 new asset (chef portrait photo), 1 SVG signature.

### New Component 2: `TastingMenuExperience` (priority: HIGH)
**File:** `src/components/catering/tasting-menu.tsx` (new)
**Purpose:** A 5-course tasting-menu showcase — vertical list of 5 dishes with course number (01–05), serif dish name, italic ingredient line, mono pairing note. Each course has a thumbnail portrait photo on the right.
**Why:** Salt Block's signature "tasting menu" moment is the page's emotional peak. A 5-course format signals culinary ambition without needing a full menu PDF.
**Design spec:** `bg-cream`, `max-w-[1070px]`, 5 rows separated by 1px rules, course number 11px mono uppercase tracked 0.4em, dish name 32px Playfair, ingredient 16px italic, pairing 13px mono right-aligned.
**Est. complexity:** ~180 lines, 5 dish photos (can reuse existing `/media/`), no new media assets needed.

### New Component 3: `ProcessTimeline` (REDESIGN the existing `Process.tsx` instead of new — but worth listing here as a missing-from-page beat)
**File:** `src/components/catering/process.tsx` (already exists, REMOUNT)
**Purpose:** 4-step editorial timeline — Заявка → Дегустация → День мероприятия → Сопровождение — as a vertical or horizontal sequence with 1px connecting line and serif step titles.
**Why:** Salt Block's "How We Work" beat between menu and testimonials. Already implemented, just orphaned. Mount it between Menu and McuVenues.
**Est. complexity:** 0 new lines — just add `<Process />` to page.tsx.

### New Component 4: `SustainabilityStrip` (priority: MEDIUM)
**File:** `src/components/catering/sustainability-strip.tsx` (new)
**Purpose:** A quiet 1-row strip — 3 mini-stats or 3 short statements about sourcing ("Локальные фермеры", "Сезонные продукты", "Без полуфабрикатов") — set in 14px italic Playfair on cream, separated by 1px vertical rules.
**Why:** Salt Block's "Real food. Real people. Real hospitality." strip is a brand-trust beat. The current codebase has the value-props marquee (in `about.tsx`) which is the right idea but in the wrong format (marquee vs static editorial strip).
**Est. complexity:** ~80 lines, no new assets.

### New Component 5: `PressQuotesBand` (priority: MEDIUM)
**File:** `src/components/catering/press-quotes.tsx` (new)
**Purpose:** 3 short pull-quotes from press coverage ("«Лучший кейтеринг Петербурга» — The Village, 2024") in italic Playfair, with publication name + date in mono micro-label below. NO press logos (we don't have real ones).
**Why:** Replaces the orphaned PressStrip (text wordmarks without article links) with actual quotable press lines. Salt Block uses this pattern at the bottom of the homepage.
**Est. complexity:** ~100 lines, requires 3 real press quotes (content task, not code task).

### New Component 6: `SignatureDrinkMoment` (priority: LOW)
**File:** `src/components/catering/signature-drink.tsx` (new)
**Purpose:** Single full-bleed photo of a signature cocktail / wine pour, with italic Playfair drink name + 2-sentence sommelier note. Sits between TastingMenu and Calculator.
**Why:** Salt Block's "bar program" moment signals full-service hospitality beyond food. Optional but distinctive.
**Est. complexity:** ~80 lines, 1 new drink photo.

### New Component 7: `PrivateEventInquiry` (priority: LOW)
**File:** `src/components/catering/private-event-inquiry.tsx` (new)
**Purpose:** Single-screen inline inquiry form (4 fields: Имя + Телефон + Дата + Сообщение) with a single sage or bordeaux submit button. Replaces the 4-step `contact.tsx` wizard.
**Why:** A 4-step wizard is conversion-hostile (each step loses ~30% of users). Salt Block uses a single-screen form with 4–5 fields. This is functionally a REDESIGN of `contact.tsx` but framed as a new component to allow A/B testing.
**Est. complexity:** ~150 lines (replaces the ~57KB contact.tsx with a 4KB equivalent).

### New Component 8: `VenueLocationScout` (priority: LOW)
**File:** `src/components/catering/venue-scout.tsx` (new)
**Purpose:** 6 venue cards in a 3×2 grid, each with: 4:3 landscape photo, 24px Playfair venue name, 13px mono capacity + district + style, "Смотреть площадку" link. Replaces the 3-card McuVenues.
**Why:** Salt Block's venue scout is the longest single section on their homepage (6 venues, rich metadata). The current McuVenues (3 cards, no metadata) undersells the venue portfolio.
**Est. complexity:** ~180 lines, 6 venue photos (some can be reused from `/media/`).

---

## 6. Summary of Recommended Actions for Cycle 26

**Immediate (delete — zero design risk, removes visual debt):**
- Delete the 5 lowest-rated orphans: BoldStatement, PinkMarquee, GgHero, GgWhoWeAre, SnackBoxCube3D.
- Delete: GgFeatureCollage, GgVideoShowcase, RisingPhotos, SnackBoxDelivery, Hero (Sopranos), Testimonials (Sopranos), Services (3D flip), LogoMarquee, PressStrip, InstagramVideo, ChapterNav, PromoBanner, AwardsStrip, AmbientAudio, VideoEvents (legacy), Preloader, CustomCursor.
- Delete: AnnouncementBar (move seasonal promo to body).
- Delete: GrainOverlay (trust the photography).
- **Total: ~22 files deleted.**

**Remount (zero new code, just re-add to page.tsx):**
- Remount: EditorialIntro (between hero and Manifesto).
- Remount: MarqueeBand (Ridgewells, replace McuMarqueeBand).
- Remount: QuoteBand (between McuVenues and McuTestimonials).
- Remount: ServicesOverview (replace McuServicesCarousel).
- Remount: Process (between Menu and McuVenues).

**Redesign (existing components, fix in place):**
- Redesign: SiteHeader (kill announcement bar, fix wordmark, unify CTA).
- Redesign: McuVideoHero (kill gold glow, swap chevron for ScrollCue, fix founding year).
- Redesign: About (strip 3D tilt + shimmer + particles, cut to 3 oversized stats).
- Redesign: McuPhotoFilmstrip (cut to 6 photos, 7s dwell, no centerMode).
- Redesign: Manifesto (swap "LOVE" → "ПИР", swap 3 photos to close-ups, cut manifesto text to 14 words).
- Redesign: McuVenues (expand to 6 venues, 4:3 aspect, metadata below image).
- Redesign: Menu (split into 3 files, replace pills with editorial index).
- Redesign: Calculator (strip emojis, single oversized total).
- Redesign: McuTestimonials (vertical list of 3 long pull-quotes, no carousel).
- Redesign: McuInstagram (4 tiles, light bg, drop redundant heading).
- Redesign: Faq (fix English leakage, strip search + chips + vote UI).
- Redesign: Contact (single-screen form, RU phone regex, RU copy).
- Redesign: SiteFooter (drop script font, drop glassmorphism, drop cities marquee).
- Redesign: McuCtaBand (cut to 1 per page, make typographic not color-blocked).

**New (build in Cycle 26):**
- New: ChefPortrait (~120 lines, 1 chef photo, 1 signature SVG).
- New: TastingMenuExperience (~180 lines, reuses existing photos).
- New: SustainabilityStrip (~80 lines, no new assets).
- New: PressQuotesBand (~100 lines, requires real press quotes).
- New: PrivateEventInquiry (~150 lines, replaces contact.tsx).

**Consolidate (the single most important fix):**
- Unify ALL sections on ONE palette (cream `#F4EFE6`-ish warm cream, ink `#1A1A1A`-ish deep warm charcoal, gold `#AF9469`-ish muted gold, bordeaux `#7A4A1F`-ish brown for accent — keep the mculinary tokens as the canonical set since they're closest to Salt Block).
- Delete `--cc-pink`, `--cc-dark`, `--gg-lime`, `--gg-charcoal-dark` from globals.css.
- Unify ALL section max-widths to `max-w-[1070px]` (joels frame) so PageBorders actually align.
- Unify ALL headlines on `Playfair Display` (drop Poppins, Barlow Semi Condensed, Great Vibes, Oswald — keep only the script accent for ONE moment if any).
- Unify ALL eyebrows on `11px / tracking 0.3em / uppercase / sage or bordeaux` (no per-cycle variants).
- Unify ALL CTAs on `OutlineButton` (light + dark variants only).

**Expected outcome:** Cycle 26 ships a homepage with ~25 mounted components (down from 19 + 45 orphans = 64), one palette, one type scale, one CTA primitive, and 3-4 new editorial beats (chef portrait, tasting menu, sustainability strip, press quotes). This matches the Salt Block Hospitality editorial-luxury standard the brief calls for.

---

**End of audit.** File: `docs/CYCLE-26-COMPONENT-AUDIT.md` · ~600 lines · ~6,000 words · 64 components reviewed · 22 deletions recommended · 14 redesigns · 5 new components proposed.
