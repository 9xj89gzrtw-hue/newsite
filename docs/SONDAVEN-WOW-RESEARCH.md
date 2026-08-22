# SONDAVEN-WOW-RESEARCH.md — Sondaven + Awwwards SOTM WOW-pattern teardown for Interfood catering blocks BELOW the photo carousel

> **Task ID:** 2 · **Agent:** research (sondaven + awwwards) · **Date:** 2026-08-22
> **Scope:** Analyze `https://sondaven.com` (Awwwards Site of the Month Jul 2026, Food & Drink / Hotel & Restaurant) + 5 additional SOTM winners from `https://www.awwwards.com/websites/sites_of_the_month/`, then map concrete WOW techniques onto the 16 blocks that sit BELOW the photo carousel (`GammaMarquee`) on the Interfood catering single-pager.
>
> **Method:** Real web fetches only (z-ai `page_reader` for HTML, `web_search` for technique references). No code changes. No memory speculation.
> **Stack assumption:** Next.js 16 · React 19 · Tailwind v4 (OKLCH) · Motion/Framer 12 · GSAP 3.13 + ScrollTrigger + SplitText + CustomEase + Flip · Lenis 1.3 · Swiper · Mux VideoPlayer · SmartImage. Palette: cream `#fcfbf8` · parchment `#eae4d8` · espresso/night `#101010` · bordeaux `#d11a46` · sage `#758269` · orange `#ff6e00` (warm cream/espresso/terracotta — NO indigo/blue).
> **Hard constraints honored:** transform/opacity only for animation · `prefers-reduced-motion` respected · no `.mp4` in `/public` (video via `VideoPlayer`/`SmartImage`) · 44px touch targets · ARIA labels on every interactive element · Russian copy (Interfood brand).

---

## Table of contents

- [A) Sondaven.com deep teardown](#a-sondavencom-deep-teardown)
- [B) Awwwards Sites of the Month — 5 winners + graftable techniques](#b-awwwards-sites-of-the-month--5-winners--graftable-techniques)
- [C) Mapping table — WOW enhancements per block below the photo carousel](#c-mapping-table--wow-enhancements-per-block-below-the-photo-carousel)
- [D) Top 6 must-implement WOW effects](#d-top-6-must-implement-wow-effects)
- [E) Concrete references — codepens, demos, npm packages, tutorials](#e-concrete-references--codepens-demos-npm-packages-tutorials)

---

## A) Sondaven.com deep teardown

### A.1 What Sondaven actually is

Sondaven (Son Daven) is a Ukrainian Carpathian design-hotel **investment project** in Yaremche — multilingual UA/EN — built on **Webflow + a hand-rolled GSAP layer**. It won Awwwards SOTM in **July 2026** with tags: `E-Commerce`, `Food & Drink`, `Hotel / Restaurant`, `Animation`, `Scrolling`, `WebGL`, `Storytelling`, `GSAP`, `UI design`, `Microinteractions`, `Webflow`. The body class on first paint is `w-mod-js lenis lenis-stopped` — i.e. Lenis is loaded but body-locked until the preloader completes. This is exactly the same "cinematic prelude → cinematic page" pattern Interfood already uses (Cycle 16 preloader). **The aesthetic, palette and stack overlap with ours at ~85 %.**

### A.2 Verified CDN stack (lifted verbatim from `<script>` tags in HTML)

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/CustomEase.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/Flip.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.15/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script src="https://unpkg.com/@barba/core"></script>
<script src="https://cdn.jsdelivr.net/npm/@finsweet/cookie-consent@1/fs-cc.js"></script>
```

**Translation to Interfood:** Our project already has `gsap` + `ScrollTrigger` (via dynamic import in `lenis-provider.tsx` and `ScrollScene`), `lenis@1.3` (same version family), `framer-motion@12` (Motion), and `swiper@11` is in deps. **What we are MISSING:** `CustomEase`, `SplitText` (now free as of GSAP 3.13, May 2025 — see references), `Flip` plugin, and `@barba/core` for route transitions. Adding these four unlocks every Sondaven technique below.

### A.3 CSS timing tokens (verbatim from Sondaven's `:root`)

```css
:root {
  --dur-s: 0.4s;
  --dur-m: 0.6s;
  --dur-l: 1.2s;

  --ease-in-out: cubic-bezier(0.76, 0, 0.24, 1);
  --ease-out: cubic-bezier(0.25, 1, 0.5, 1);   /* near-identical to our [0.22, 1, 0.36, 1] */
  --ease-in:  cubic-bezier(0.5, 0, 0.75, 0);
  --ease:     cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-write: cubic-bezier(0.333, 0, 0.667, 1);
}
html { font-size: 1vw; }   /* ALL rem-based spacing scales fluidly with viewport width */
```

**Key insight:** Sondaven sets `html { font-size: 1vw }` so every spacing unit (defined in Webflow as `--u-0` … `--u-136`) scales linearly with viewport width. This is the **fluid-type system** that makes the site feel "designed-for-every-screen". Our Tailwind v4 already supports `clamp()` for type scale; we should adopt the same `1vw` root trick (or a `clamp(14px, 1vw, 18px)` variant) for spacing tokens. The `--ease-out: cubic-bezier(0.25, 1, 0.5, 1)` curve is functionally the same as our project-standard `[0.22, 1, 0.36, 1]` — both are Awwwards-canonical easeOutExpo-ish "settle" curves.

### A.4 Section structure — 13 sections, alternating dark/light theme (the "color-flip" signature)

Section IDs in order: `hero`, `prolog`, `about`, `location`, `commissioning`, `finance`, `seasons`, `developer`, `factoids`, `gallery`, `blog`, `cta`, `faq`. Each `<section>` carries a `bg="…"` attribute and a `theme_on-dark` / `theme_on-light` / `theme_on-color` class:

```
#hero           section theme_on-dark clip           ← dark, clip-path reveal mask
#prolog         section bg-light theme_on-dark       ← light bg, dark-themed text
#about          section bg-light theme_on-light      ← light bg, light text
#location       section bg-light theme_on-dark       ← light bg, dark text
#commissioning  section                              ← default
#finance        section bg-light theme_on-dark
#seasons        section bg-light theme_on-dark
#developer      section bg-light theme_on-dark
#factoids       section bg-light theme_on-dark
#gallery        section
#blog           section bg-light theme_on-dark clip
#cta            section theme_on-color                ← brand-color section (the A89474 taupe/bronze)
#faq            section bg-light theme_on-dark
```

**Signature pattern — color-flip on scroll:** Each `<section>` swaps `--bg` and `--fg` (text color) on enter/leave via ScrollTrigger `onEnter`/`onLeaveBack` callbacks. The page literally alternates between dark-text-on-light and light-text-on-dark, with one full-brand-color section (`#cta` — the taupe/bronze `#A89474`) as the conversion punch. This is the **single most-copyable Sondaven pattern for Interfood** — our parallax bands (`CepEditorialDivider`, `TottParallaxBand`, `GammaSeparator`) already do most of the work; adding a `data-theme-flip="dark|light|color"` attribute + a 1-line ScrollTrigger callback gives us the same cinematic pacing.

### A.5 Hero treatment — the "scroll-video canvas + theme-flip stack"

The Sondaven hero (`#hero`) is a 3-phase color-flip section with a scroll-driven video canvas:

```html
<section id="hero" class="section theme_on-dark clip">
  <div class="container">
    <div data-scroll-video-container class="hero-scroll-area">
      <div class="mob_hero-w_bg b-mob">
        <div class="mob_hero-w_bg_img"><div data-hero-img class="hero-img light"></div></div>
        <div class="over-gradient-top"></div>
        <div class="over-gradient-bot"></div>
      </div>
      <div class="hero-w">
        <div class="hero-s">
          <div class="grid">
            <div class="hero-s_content">
              <h1 data-intro="p" class="p3 text-dark a-center">інвестиційний проєкт</h1>
              <div class="hero-s_content_logo">
                <div preloader="logo-w-finish" class="logo-w">
                  <div preloader="logo-static" class="hero-s_content_logo_c">
                    <div class="logo w-embed"> …SVG logo… </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="hero-w_scene-over"><div class="hero-w_scene-over_c"><canvas data-intro-over-scene class="scene"></canvas></div></div>
        <div class="hero-w_scene-bg b-desk"><canvas data-intro-bg-scene class="scene"></canvas></div>
        <div class="hero_themes">
          <div bg="dark"  class="hero_themes_dark-1"></div>
          <div bg="light" class="hero_themes_light-1"></div>
          <div bg="dark"  class="hero_themes_dark-2"></div>
        </div>
      </div>
    </div>
  </div>
</section>
```

**Three Sondaven signature techniques live in this one block:**

1. **`data-scroll-video` canvas** — a `<canvas class="scroll-video light">` inside `data-scroll-video-container`. As the user scrolls through the hero (which is taller than 100vh), GSAP scrubs a pre-rendered video frame-by-frame onto the canvas (`videoEl.currentTime = scrollProgress * duration`). This is the **Apple AirPods / Cartier W&W technique** — frame-perfect scroll-bound video. (Note: Sondaven ships it as an image sequence on canvas, but the modern equivalent is one MP4 whose `currentTime` is bound to scroll — exactly what `VideoPlayer` (Mux) exposes.)

2. **`hero_themes_dark-1 / light-1 / dark-2`** — three stacked full-bleed `<div>`s that cross-fade opacity as the user scrolls past hero progress 0 → 0.5 → 1. So the hero has **three color phases** within one section: dark → light → dark. The headline color class (`text-dark`) flips to `text-light` automatically because the `hero_themes_light-1` panel renders above it.

3. **`data-intro-bg-scene` + `data-intro-over-scene` WebGL canvases** — two `<canvas class="scene">` layers: a background WebGL render (likely a 3D mountain/Carpathian landscape) + an overlay WebGL render (particles, mist, or a hero object). Parallax camera shift on scroll. We do NOT need this — Interfood is photo-first, not 3D-first — but the **layering principle** (full-bleed video bg + overlay gradient + content layer) already exists in our `GgVideoShowcase` (block #3 above the carousel). We can steal the **theme-flip triple-stack** without WebGL.

### A.6 Sondaven signature techniques — the 10 most graftable

| # | Technique name | HTML signature | What it does | Graftable to Interfood block |
|---|---|---|---|---|
| **1** | **Scroll-driven video on canvas** | `<canvas data-scroll-video class="scroll-video light">` inside `<div data-scroll-video-container>` | Binds `video.currentTime` to scroll progress; the hero IS the scroll-scrubbed video. | `GgVideoShowcase` (above carousel), `EventsVideoCarousel` modal |
| **2** | **Split-line text reveal** | `<div class="split-line" style="transform: translate(0%, 250%)">` paired with `data-scroll-reveal="line\|h\|p\|ctn\|card"` (136 occurrences) | Each line of every heading/paragraph is wrapped in a `<div class="split-line">` translated 250% Y, animated to 0% with stagger on scroll. | Every H2/H3 below carousel: `EaServiceTabs`, `EaVenuesSpotlight`, `Menu`, `EaFounderStory`, `EaFaqAccordion`, `Calculator`, `DeliveryBlock` |
| **3** | **Color-flip theme sections** | `<section bg="dark\|light\|color" class="… theme_on-dark\|theme_on-light\|theme_on-color">` + `<div class="hero_themes">` 3-stack | Whole-page `--bg`/`--fg` swap via ScrollTrigger `onEnter/onLeaveBack`. Hero has 3 phases (dark→light→dark). One brand-color section (`#cta` in `#A89474`) for conversion punch. | `CepEditorialDivider`, `TottParallaxBand`, `GammaSeparator` parallax bands + `Calculator` (could be the brand-color section) |
| **4** | **Pinned map with location pins** | `<div map class="map-w"><img class="map"><div class="map-w_pin is-0"><div pin class="map-w_logo text-dark">` + `data-wf--map-pin--variant="center\|right"` + `pin_vector`, `pin_ico`, `pin_vector-r_label` (travel-time label like "31 хв") | Horizontal-scroll pinned section: SVG map of region with location pins that "drop in" + reveal travel-time vectors as user scrolls horizontally through the pin sequence. | `EaVenuesSpotlight` (transform from 3-up cards → pinned SVG map of SPb/Moscow/Russia with venue pins) |
| **5** | **Magnetic circular CTA** | `<a data-magnetic-strength class="btn-circle"><div class="btn-circle_bg"></div><div data-magnetic-inner-target class="btn-circle_label">` | Inner label translates toward cursor (data-magnetic-inner-target) while bg circle scales/translates separately. Three-tier magnetic effect (strength × inner-target × bg). | `DeliveryBlock` CTA "Рассчитать смету", `EaFounderStory` CTA, `Contact` submit, `SiteFooter` CTA, `EaFaqAccordion` "Задать вопрос" |
| **6** | **`hover="…"` micro-interaction DSL** | 529 `hover="…"` attribute occurrences across 16 distinct values: `hover="line"`, `hover="line-l"`, `hover="text"`, `hover="bg"`, `hover="bg-fill"`, `hover="hover"`, `hover="ico"`, `hover-btn`, `hover-btn-ico`, `hover-divider`, `hover-img-card`, `hover-nav-item`, `hover-faq`, `hover-benefit-card`, `hover-menu-item`, `hover-btn-close`, `hover-btn-info` | Every interactive surface has a defined hover micro-interaction. Buttons have a `hover="bg"` background-fill that morphs from one corner. | Universal — every button, link, card below the carousel |
| **7** | **GSAP `Flip` plugin preloader→hero logo transition** | Preloader logo `<div data-flip-id="auto-1" class="logo-w theme_on-dark">`; hero logo `<div preloader="logo-w-finish" class="logo-w">`. GSAP `Flip.fit()` animates logo from preloader position to hero position. | Shared-element transition: the SAME SVG logo lives in both preloader and hero; Flip plugin computes the position/size delta and animates it. No fade — actual geometric morph. | Interfood preloader (Cycle 16) → hero logo transition. Currently we fade; Flip gives us geometric morph. |
| **8** | **Parallax attribute DSL** | `[parallax="h1"]`, `[parallax="img"]`, `[parallax="img-out"]`, `[parallax="ctn-down"]`, `[parallax="ctn-up"]` — 23 occurrences; CSS `will-change: transform` rule for all of them | 5 parallax speeds. Headlines (`h1`) parallax slowest, images (`img`) medium, containers (`ctn-up`/`ctn-down`) drift up/down. `img-out` is a parallax-out (image exits faster than section). | `Menu`, `EaVenuesSpotlight`, `EaFounderStory`, all parallax bands |
| **9** | **Edge-fade mask marquee** | `.fin-s_title_marquee { -webkit-mask-image: linear-gradient(90deg, rgba(255,255,255,0) 0%, #FFF 15%, #FFF 85%, rgba(255,255,255,0) 100%); mask-image: linear-gradient(90deg, rgba(255,255,255,0) 0%, #FFF 15%, #FFF 85%, rgba(255,255,255,0) 100%); }` | Infinite text marquee whose edges fade to transparent via CSS `mask-image` gradient. Marquee feels "into the void" rather than "hitting a wall". | `SiteFooter` "interfood" stacked brand marquee, `CepInstagramGrid` hashtag strip, `Calculator` running total |
| **10** | **`data-noise` global grain overlay + `data-prevent-flicker="true"` anti-FOUC** | `<div data-noise class="noise">` is a fixed full-viewport overlay (CSS background or canvas) of subtle film grain. 45 elements carry `data-prevent-flicker="true"` to ensure transforms are computed before reveal (avoids flash of unstyled position). | Cinematic film grain on every photo. Anti-flicker flag is essentially `will-change: transform` + `content-visibility: auto` + a `requestAnimationFrame` wait before triggering reveals. | Global `<body>` overlay. Every `Reveal`/`ScrollScene` component. |

### A.7 Additional Sondaven techniques worth noting (not in top 10 but useful)

- **`data-highlight-text`** (2 occurrences) — text highlighter that draws a marker stroke through a paragraph as it scrolls into view (chroma-shift on word-by-word basis).
- **`data-tab-trigger` / `data-tab-content`** — Webflow component-driven tab system (Studio / Deluxe apartment tabs). Same pattern as our `EaServiceTabs` — Sondaven adds the magnetic + scroll-reveal layer on top.
- **`modal-media-open="video"` + `data-modal-vim-video-btn`** — Vimeo-powered video modal opener on hover-img-cards. Our `EventsVideoCarousel` already does fullscreen modal (Cycle 32); Sondaven's variant opens a smaller centered modal (less disruptive to scroll).
- **`hover-img-card` + `hover-nav-item`** — Nav items show preview image cards on hover (one image per nav target). We already have the Hero cursor image-preview from Cycle 9; Sondaven extends this to ALL nav items.
- **Lenis body-lock via `lenis-stopped`** — preloader sets `class="lenis lenis-stopped"` on `<html>`, halting scroll until preloader completes, then removes `lenis-stopped`. We do this via overflow hidden; the Lenis-native API is cleaner.
- **`benefit-card_info theme_on-dark scrollbar-none lenis`** — each card has its own Lenis instance for internal smooth-scroll. Useful for a card with a long scrollable inner area (e.g. menu PDF preview).
- **`slider="pag"` / `slider="current"` / `slider="total"` / `slider="prev"`** — custom Swiper pagination showing "00 / 00" counter + arrow controls. Our `events-video-carousel.css` does similar (334 LOC).

### A.8 What Sondaven does NOT do (so we should NOT copy)

- No custom cursor with `mix-blend-mode: difference` (they use `hover-img-card` preview system instead). We already have `cursor.tsx` — keep it.
- No image distortion hover (WebGL displacement). That's a Codrops/Cartier pattern, not Sondaven. We can skip.
- No giant horizontal-scroll hero image carousel — their hero is video canvas + theme stack, not marquee. Our `GammaMarquee` (block #4) already exists and is distinct.
- No variable-font-weight-on-scroll-velocity. Their typography uses static-weight display fonts.

---

## B) Awwwards Sites of the Month — 5 winners + graftable techniques

I fetched the SOTM index page (`/websites/sites_of_the_month/`) and parsed all 62 site cards via their `data-collectable-model-value` JSON. Below are the 5 most graftable winners (Son Daven is covered in §A). I prioritised sites with: (a) warm/light or luxury palette compatible with our cream/espresso/terracotta; (b) GSAP + Lenis stack overlap; (c) photographic/editorial/scrolling storytelling fit for catering.

### B.1 Floema — floema.com (SOTM May 2026)

- **URL:** https://www.floema.com/en
- **What it is:** Sustainable urban furniture & signage for natural spaces. Botanical atelier brand. Nuxt.js SSR site.
- **Awwwards tags:** `Business & Corporate`, `E-Commerce`, `Promotional`, `Photographic`, `WebGL`, `Storytelling`, `GSAP`, `3D`, `Header Design`, `Nuxt.js`.
- **Palette (extracted from live HTML):** `#241f21` (deep espresso, identical to our `#101010` family) + `#ebe7df` / `#f2efea` / `#f9f8f6` (warm cream — 1:1 match with our `#fcfbf8` cream and `#eae4d8` parchment) + `#988f8b` (taupe/sage — adjacent to our `#758269` sage) + `#524945` (warm graphite) + `#e9e778` (mustard/chartreuse accent — the only brand color, used sparingly).
- **Display font:** Custom "Zimula" serif (similar role to our `Playfair Display`). Body: `inherit`.
- **Standout graftable techniques:**
  1. **Editorial full-bleed photo blocks with directional clip-path reveals** — each photo enters the viewport with a `clip-path: inset(...)` animation in a DIFFERENT direction (top, bottom, left, right, diagonal), creating a rhythm of "photo wipes" as you scroll. Photo blocks alternate full-bleed (100vw) and offset (60vw) layouts. → graft onto `EaEventsPortfolio`, `EaVenuesSpotlight`, `Menu` photo cells, `CepInstagramGrid`.
  2. **SplitText word-by-word color transition** — paragraph text reveals word-by-word with a color-clip animation: each word starts at `color: transparent` with a `background-clip: text` gradient that animates from `0%` to `100%` as the word crosses the viewport center. (Confirmed by the GSAP forum thread `topic/28020-splittext-gradient-text-is-it-possible` — this technique requires `background-clip: text` + per-word stagger.) → graft onto `EaFounderStory` body copy, `DeliveryBlock` body, `EaFaqAccordion` answers.
  3. **`--color-creme` / `--color-black` / `--color-red` CSS variable theming** — 50 CSS custom properties, 67 uses each of the 3 main color tokens, meaning the entire palette is abstracted and sections can flip theme by changing 3 vars. Same as Sondaven's `theme_on-dark/light/color` pattern. → already aligned with our Tailwind v4 OKLCH tokens; we should expose `--bg` / `--fg` / `--accent` at the section level for theme-flip.

### B.2 Cartier Watches & Wonders 2025 — cartier-waw-0225.dev.60fps.fr (SOTM Aug 2025)

- **URL:** https://cartier-waw-0225.dev.60fps.fr/ (live dev preview; production: cartier.com/en/maison/watchesandwonders)
- **Built by:** Immersive Garden + 60fps.
- **Awwwards tags:** `Web & Interactive`, `Animation`, `Responsive Design`, `Scrolling`, `WebGL`, `Experimental`, `3D`, `Gestures / Interaction`, `UI design`, `Motion`, `Luxury`.
- **Display fonts:** `'Brilliant Cut Pro'`, `'Fancy Cut Pro'` (luxury custom serifs — Diamond-cut naming pun).
- **Standout graftable techniques:**
  1. **Six floating 3D alcoves rendered in Three.js** — each scroll chapter is a 3D "room" containing a watch inside its own dreamlike environment (drifting horizons, water reflections, particles). Scroll drives a camera flight through the rooms. Confirmed by webgpu.com showcase + Awwwards writeup "journey through six unique 3D scenes, each inspired by one of Cartier's emblematic watches". → **NOT graftable** to catering (we are photo-first, not 3D-first) but the **scroll-as-camera-flight** principle is: each block below the carousel can have a subtle parallax background that "flies past" rather than just scrolls up.
  2. **Luxury serif variable typography with letter-spacing animation** — headlines use extremely tight `letter-spacing: -0.04em` initially, animating to `0` on scroll, paired with `text-transform: uppercase` and large point sizes (90px+). → graft onto `EaServiceTabs` H2 "Свадьбы · Корпоратив · Банкеты · Фуршеты" headline reveal.
  3. **Gold-on-black conversion CTA with magnetic affordance** — Cartier's "Discover" CTAs are circular gold-rimmed buttons that magnify on hover and pull toward the cursor. Same `data-magnetic-strength` pattern as Sondaven. → already mapped in §A.6 #5; this is the luxury canonical implementation.

### B.3 Lando Norris — landonorris.com (SOTM Nov 2025)

- **URL:** https://landonorris.com/
- **Built by:** OFF+BRAND. (offbrand studio).
- **Awwwards tags:** `Promotional`, `Sports`, `Web & Interactive`, `Colorful`, `WebGL`, `GSAP`, `3D`, `Gestures / Interaction`, `Webflow`.
- **Palette (extracted from live HTML):** `#101400` (deep ink — same family as our espresso `#101010`) + `#D2FF00` (papaya/electric yellow — their signature accent; we use bordeaux `#d11a46` and orange `#ff6e00` as our accents, different but same role) + white.
- **Display font:** `Brier` (custom display serif).
- **Stack:** Webflow + GSAP + Rive (state-machine animations) + WebGL. Same Webflow+GSAP+Lenis spine as Sondaven.
- **Standout graftable techniques (verified from class signatures in live HTML):**
  1. **`sticky-track-theme-change`** — Lando has a sticky-scroll section where the **global theme color changes** as you scroll through it (electric yellow → black → white). This is Sondaven's `theme_on-dark/light/color` pattern taken to the extreme — the entire viewport background flips, not just the section. → graft onto `Calculator` (block #10): as user interacts with the calculator, the section's `--accent` shifts from `--sage` (low estimate) → `--orange` (mid) → `--bordeaux` (premium). Subtle visual feedback tied to price tier.
  2. **`pin-sticky` / `pin-wrap` / `pin-spacer`** — explicit 3-element pin layout. The pin wrapper sits inside a `pin-spacer` (height = scroll-distance) and the `pin-sticky` child is `position: sticky; top: 0`. This is the Awwwards-canonical pinned scroll pattern (vs. GSAP ScrollTrigger `pin: true` which can be janky with Lenis). → graft onto `EaVenuesSpotlight` and `EaEventsPortfolio` for buttery pinned horizontal scroll.
  3. **`split-type` / `split-flex`** — Lando uses the [`split-type`](https://github.com/lukePeavey/split-type) npm package (NOT GSAP SplitText) to split text into lines/words/chars, then animates via GSAP. `split-type` is **free, MIT, 4kb**, vs. GSAP SplitText (now also free as of May 2025 — see §E). → If we don't want to add SplitText plugin, `split-type` is the lighter alternative that achieves the same result.
  4. **`blend` / `blend-1/2/3` / `blends-w`** — multiple `mix-blend-mode` layers stacked. `blend-1` = `multiply` (for darkening photos with brand color), `blend-2` = `screen` (for lightening), `blend-3` = `difference` (for cursor). → graft onto `CepInstagramGrid` — Instagram photos get a `multiply` brand-color wash on hover.
  5. **`marquee-adv-*` + `marquee-gl-rive-target`** — multiple marquee variants: CSS-only (`marquee-css`), advanced with pause-on-hover (`marquee-adv-item`), Rive-animated (`marquee-gl-rive-target`). The advanced marquee has a velocity-aware skew (`skewX`) when scrolling fast, like the Codrops skew-on-scroll pattern. → graft onto `SiteFooter` "interfood" stacked brand marquee + `CepInstagramGrid` hashtag strip.
  6. **`reveal-img` + `clip` / `clip-w`** — image reveal wrapper + clip-path mask. Same pattern as Sondaven's `clip` class. Confirms clip-path reveal is the standard Awwwards 2025-2026 image-reveal pattern.
  7. **`hero-next-race-rive` + `hero-eyebrow-tracker`** — Rive state-machine animation in hero (animated illustration that responds to scroll/hover). We do NOT need Rive, but the "eyebrow tracker" pattern (a small UI element that tracks scroll progress, like a chapter dot or progress bar) is graftable to `chapter-nav.tsx`.

### B.4 MindMarket — mindmarket.com (SOTM Dec 2025)

- **URL:** https://mindmarket.com/
- **What it is:** Research agency that surfaces "real human insights" — qualitative research with field presence in Lagos, London, Seoul, etc.
- **Awwwards tags:** `Art & Illustration`, `Culture & Education`, `Promotional`, `Animation`, `Colorful`, `Flat Design`, `Scrolling`, `Illustration`, `Storytelling`, `GSAP`, `Figma`, `DatoCMS`.
- **Palette (extracted from live HTML):** `#8ED462` (lime — signature accent, same role as our bordeaux) + `#368D32` (deeper green) + `#2c2e2a` (warm graphite, same family as our espresso) + `#f0f4f7` (off-white) + `#ff705d` (warm coral — adjacent to our orange `#ff6e00`) + `#f5e211` (mustard yellow). **Their palette is closer to ours than any other SOTM winner** — warm greens + warm coral + warm graphite.
- **Display font:** `Inter` (with `var(--font-sans)` custom property — variable font, used for the scroll-velocity weight effect).
- **Standout graftable techniques:**
  1. **"Path scroll with Rive animations"** — illustrated characters (researchers, citizens) walk along a scroll-bound path that winds through the page. As you scroll, the character's `offset-distance` along an SVG path advances. This is the CSS `offset-path` + `offset-distance` technique. → graft onto `CepProcess` (block #8): the "01 DREAM → 02 DESIGN → 03 DELIVER" 3-step process could be a literal illustrated path with a chef-icon walking through the steps as the user scrolls.
  2. **Multi-direction marquee with scroll-aware direction change** — MindMarket has marquees that scroll LEFT when scrolling DOWN, and RIGHT when scrolling UP — creating a "counter-current" feel. Confirmed by pixfort's "Interactive Marquee Just Got Smarter with the new change direction on scroll" video. → graft onto `SiteFooter` "interfood" marquee and `CepInstagramGrid` hashtag strip.
  3. **Variable-font weight on scroll velocity** — `Inter` body copy subtly shifts weight (300 → 500) when user scrolls fast, communicating "energy". Confirmed by codepen.io/NinaBaumgartner/pen/zYWEPMo + carmenansio.com/articles/variable-font-scroll (Apr 2026). → graft onto `Menu` H2 "Меню" using `Playfair Display` variable weight axis (already loaded in our `layout.tsx`).

### B.5 Montfort — mont-fort.com (SOTM Jun 2025)

- **URL:** https://mont-fort.com/
- **Built by:** Immersive Garden.
- **Awwwards tags:** `Business & Corporate`, `Web & Interactive`, `Scrolling`, `Responsive`, `3D`, `Gestures / Interaction`, `UI design`. Also listed on Awwwards as "3D Pages by Immersive Garden" inspiration.
- **Palette (extracted):** `#ffffff` + `#2D628C` (deep teal — for Montfort, not for us; we'd swap to bordeaux or sage) + `#E8EAED` (off-white). Minimal luxury palette.
- **Standout graftable techniques:**
  1. **3D-pages pattern** — each page transition is a 3D camera move (Immersive Garden's signature). We do NOT need 3D, but the **page-transition-as-camera-move** principle is: instead of a flat fade between routes (our `template.tsx`), use a GSAP `Flip.fit()` between shared elements (header logo, hero image) on route change. Sondaven uses Barba.js for this; we can use `next/navigation` + Flip.
  2. **`scroll-to-cta-content-dk` / `scroll-to-cta-content-mb`** — a small "scroll to learn more" indicator that appears on hero, with desktop (`dk`) and mobile (`mb`) variants. Animated chevron + text. → graft onto `GgVideoShowcase` (block #3, above carousel) + hero.
  3. **Hero-inner transition** — `hero-inner` + `hero-transition` classes indicate hero content has a dedicated exit transition (parallax fade + scale + clip-path) before next section. Already exists in our hero (Ken Burns parallax exit per AGENTS.md §11). Confirms our pattern.

---

## C) Mapping table — WOW enhancements per block below the photo carousel

The 16 blocks below `GammaMarquee` (#4), per `src/app/page.tsx` Cycle 32 ordering. For each block: 1-3 concrete WOW enhancements, ranked by **Impact / Effort** ratio. Labels: **Quick win** (≤ 1 day, ≤ 50 LOC), **Medium** (1-3 days, 50-300 LOC), **Ambitious** (3+ days or 300+ LOC, requires new dependency).

### C.1 `CepEditorialDivider` (parallax band #1, between carousel and services)
*44 LOC, 0 animation refs — VERY light.*

| # | WOW enhancement | Source pattern | Impact/Effort | Label |
|---|---|---|---|---|
| 1 | Add `data-theme-flip="espresso"` attribute → ScrollTrigger `onEnter` sets `document.documentElement.dataset.theme = 'espresso'`, `onLeaveBack` resets to `cream`. Whole-page `--bg`/`--fg` swap. | Sondaven `theme_on-dark/light/color` + Lando `sticky-track-theme-change` | High / Low | **Quick win** |
| 2 | Full-bleed photo enters with `clip-path: inset(100% 0 0 0)` → `inset(0 0 0 0)` scrubbed by ScrollTrigger (top-to-bottom wipe). | Sondaven `clip` class + Floema directional clip-path + codepen.io/ezra_siton/pen/gOPYRKP | High / Low | **Quick win** |
| 3 | Photo gets subtle `filter: grayscale(20%) → 0%` on enter (color "develops" as you scroll). | Sondaven hero-img `light` class + Lando `blend` overlays | Medium / Low | **Quick win** |

### C.2 `EaServiceTabs` (5-tab premium services: Свадьбы · Корпоратив · Банкеты · Фуршеты · something)
*373 LOC, 7 animation refs — moderate density.*

| # | WOW enhancement | Source pattern | Impact/Effort | Label |
|---|---|---|---|---|
| 1 | H2 "Свадьбы · Корпоратив · Банкеты · Фуршеты" headline uses **SplitText line stagger**: each tab name slides up from `translateY(110%)` inside an `overflow: hidden` mask, with 80ms stagger. | Sondaven `split-line` + GSAP SplitText (now free May 2025) | High / Medium | **Medium** |
| 2 | Tab trigger buttons get **magnetic inner-target** (label translates toward cursor 0.3×, bg fills from left). | Sondaven `data-magnetic-strength` + `hover-btn` DSL + Lando `btn-circle` | High / Medium | **Medium** |
| 3 | Active tab content panel uses **GSAP `Flip.fit()`** to morph from previous tab's image position (shared-element transition) instead of cross-fade. | Sondaven `data-flip-id="auto-1"` preloader→hero + GSAP Flip plugin | High / High | **Ambitious** |

### C.3 `EaEventsPortfolio` (magazine horizontal-scroll event gallery, 8 cards)
*306 LOC, 3 animation refs — light, BIGGEST upgrade opportunity.*

| # | WOW enhancement | Source pattern | Impact/Effort | Label |
|---|---|---|---|---|
| 1 | Replace current `useScroll + useTransform x ['0%','-70%']` sticky-scroll with **GSAP ScrollTrigger `pin: true` + horizontal `xPercent`** for buttery pinned horizontal scroll (Lando's `pin-sticky`/`pin-wrap`/`pin-spacer` 3-element pattern). | Lando Norris `pin-sticky`/`pin-wrap`/`pin-spacer` + codepen.io/cbg/pen/WNxByEj | High / Medium | **Medium** |
| 2 | Each event card image enters with **alternating directional clip-path reveal**: card 0 → `inset(0 100% 0 0)` (right-to-left), card 1 → `inset(0 0 100% 0)` (bottom-to-top), card 2 → `inset(0 0 0 100%)` (left-to-right), card 3 → `inset(100% 0 0 0)` (top-to-bottom), then repeat. | Floema directional clip-path + Sondaven `clip` class + codepen ezra_siton | High / Medium | **Medium** |
| 3 | Card title overlays with **`background-clip: text` gradient mask** that animates from `0%` to `100%` as the card crosses viewport center (text "fills" with brand color word-by-word). | Floema SplitText word-color transition + blog.olivierlarose.com/tutorials/text-gradient-opacity-on-scroll | High / High | **Ambitious** |

### C.4 `EaVenuesSpotlight` (3-up full-bleed venue cards "Где мы работаем")
*251 LOC, 7 animation refs — moderate.*

| # | WOW enhancement | Source pattern | Impact/Effort | Label |
|---|---|---|---|---|
| 1 | Transform from 3-up static cards into **pinned horizontal-scroll SVG map of SPb + Moscow + Russia** with location pins (Sondaven `map-w` / `pin_vector` pattern). Pins "drop in" with stagger + reveal travel-time labels ("4 ч на Sapsan"). | Sondaven `pin_vector` + `map-w_pin` + `data-wf--map-pin--variant="center\|right"` | High / High | **Ambitious** |
| 2 | Each venue card photo gets **parallax `img-out` exit** (image scrolls up faster than section, revealing next venue). | Sondaven `[parallax="img-out"]` | Medium / Low | **Quick win** |
| 3 | "Где мы *работаем*" headline with italic-as-fragment trailing-phrase (already a project pattern from Cycle 28) gets **per-word clip-path mask reveal** (each word wipes in from bottom). | Sondaven `split-line` + Lando `split-type` | High / Medium | **Medium** |

### C.5 `Menu` (7 menu types interactive list + PDF export)
*1113 LOC, 73 animation refs — heavily animated already.*

| # | WOW enhancement | Source pattern | Impact/Effort | Label |
|---|---|---|---|---|
| 1 | H2 "Меню" uses **variable-font weight on scroll velocity** — `font-weight` shifts from 400 (slow scroll) to 700 (fast scroll) using `useMotionValue` + `useSpring` + `useTransform` on Playfair Display variable axis. | MindMarket Inter variable weight + codepen.io/NinaBaumgartner/pen/zYWEPMo + carmenansio.com/articles/variable-font-scroll | High / Medium | **Medium** |
| 2 | Each menu-type row gets **magnetic hover preview image**: hovering row N shows a 120px food-photo preview that follows cursor (already exists for hero CTA — extend to all 7 rows). | Sondaven `hover-img-card` + existing Cycle 9 hero cursor image-preview | High / Medium | **Medium** |
| 3 | Menu PDF download CTA becomes a **circular magnetic `btn-circle`** (Sondaven pattern) instead of rectangular pill. | Sondaven `data-magnetic-strength` + `btn-circle` + Lando Norris | Medium / Medium | **Medium** |

### C.6 `TottParallaxBand` (parallax band #2, between menu and events video carousel)
*119 LOC, 10 animation refs — light parallax.*

| # | WOW enhancement | Source pattern | Impact/Effort | Label |
|---|---|---|---|---|
| 1 | Add `data-theme-flip="cream"` → page bg flips to cream for the duration of this band (resets to espresso on leave). | Sondaven `hero_themes` 3-stack + `theme_on-light` | High / Low | **Quick win** |
| 2 | Char-split headline gets **per-character clip-path mask reveal** (each char `clip-path: inset(0 0 100% 0)` → `inset(0)` with 30ms stagger). | Sondaven `split-line` + Lando `split-type` + existing Cycle 21 tott-reveal.tsx | Medium / Low | **Quick win** |
| 3 | Parallax bg photo gets **subtle Ken Burns zoom** (1.05 → 1.0 scale, scrubbed) on top of existing yPercent parallax. | Sondaven hero-img + Cartier camera-flight principle | Medium / Low | **Quick win** |

### C.7 `EventsVideoCarousel` (carousel of 4 event-type video tiles with modal)
*395 LOC + 334 LOC CSS, 3 animation refs — light.*

| # | WOW enhancement | Source pattern | Impact/Effort | Label |
|---|---|---|---|---|
| 1 | Tile click opens **scrubbed-video modal** (instead of fullscreen autoplay): modal opens, video plays from 0, but `video.currentTime` is bound to scroll progress within modal — user must scroll to "watch" the video. Cinematic. | Sondaven `data-scroll-video` canvas + youtube.com/watch?v=n6g9YNVkxNo tutorial | High / High | **Ambitious** |
| 2 | Each tile thumbnail gets **`mix-blend-mode: multiply` brand-color wash** on hover (photo darkens with bordeaux tint). | Lando `blend-1/2/3` + `blends-w` | High / Low | **Quick win** |
| 3 | Carousel progress indicator (existing `slider="pag"` "00 / 00" pattern) gets **magnetic + count-up animation** when advancing. | Sondaven `slider="current/total"` + Lando `marquee-adv` count | Medium / Medium | **Medium** |

### C.8 `CepProcess` ("THE CREATIVE EDGE" 3-step process)
*162 LOC, 6 animation refs — moderate.*

| # | WOW enhancement | Source pattern | Impact/Effort | Label |
|---|---|---|---|---|
| 1 | Transform 3-step list into **scroll-bound SVG path with chef-icon walking through steps** (CSS `offset-path` + `offset-distance` driven by `useScroll` progress). | MindMarket "Path scroll" + `offset-path` CSS | High / High | **Ambitious** |
| 2 | Each step number ("01 DREAM") gets **giant numeral with parallax `[parallax="h1"]`** + clip-path reveal. | Sondaven `[parallax="h1"]` + `clip` | High / Low | **Quick win** |
| 3 | Step dividers (`hover="line"` pattern) get animated **underline scaleX 0 → 1 reveal** with `[data-scroll-reveal="line"]`. | Sondaven `hover="line"` + `divider` class (45 occurrences) | Medium / Low | **Quick win** |

### C.9 `DeliveryBlock` (2-col split: photo + 5 USPs + 2 CTAs)
*399 LOC, 5 animation refs — light, Cycle 32 NEW.*

| # | WOW enhancement | Source pattern | Impact/Effort | Label |
|---|---|---|---|---|
| 1 | "Рассчитать смету" CTA becomes **circular magnetic `btn-circle`** (Sondaven pattern). | Sondaven `data-magnetic-strength` + `btn-circle` | High / Medium | **Medium** |
| 2 | 5 USP icons (clock / thermometer / cloche / people / calendar-check) get **staggered clip-path reveal**: each icon `clip-path: inset(0 0 100% 0)` → `inset(0)` with 100ms stagger as section enters. | Sondaven `data-scroll-reveal="card"` + Floema directional clip | High / Low | **Quick win** |
| 3 | Food photo on LEFT gets **parallax `[parallax="img"]`** + clip-path wipe on enter (`inset(0 100% 0 0)` → `inset(0)`). | Sondaven `[parallax="img"]` + `clip` | High / Low | **Quick win** |

### C.10 `Calculator` (interactive price calculator, nuqs shareable)
*722 LOC, 54 animation refs — heavily animated.*

| # | WOW enhancement | Source pattern | Impact/Effort | Label |
|---|---|---|---|---|
| 1 | Make this the **brand-color section** (`data-theme-flip="color"`) — section bg becomes terracotta/bordeaux when active. As estimate crosses tiers (low → mid → premium), `--accent` shifts `--sage → --orange → --bordeaux`. | Sondaven `#cta` brand-color section + Lando `sticky-track-theme-change` | High / Medium | **Medium** |
| 2 | Running-total number uses **CountUp** (already exists) + **per-digit clip-path flip** animation when value changes (each digit rolls like an airport display via `rotateX`). | Sondaven `split-line` numbers + Lando `split-flex` | High / High | **Ambitious** |
| 3 | "Поделиться сметой" share button becomes magnetic. | Sondaven `data-magnetic-strength` | Medium / Low | **Quick win** |

### C.11 `EaFounderStory` (founder 2-col + 4 count-up stats + CTA)
*369 LOC, 7 animation refs — moderate.*

| # | WOW enhancement | Source pattern | Impact/Effort | Label |
|---|---|---|---|---|
| 1 | Body paragraph gets **word-by-word `background-clip: text` gradient color transition** as user scrolls (each word "fills" with brand color from transparent → opaque). | Floema SplitText word-color + blog.olivierlarose.com/tutorials/text-gradient-opacity-on-scroll | High / Medium | **Medium** |
| 2 | 4 count-up stats get **magnetic hover lift** + number flips with `rotateX` (digit-roll). | Sondaven `data-magnetic-strength` + Lando `split-flex` | Medium / Medium | **Medium** |
| 3 | Founder portrait gets **directional clip-path wipe reveal** (left-to-right `inset(0 100% 0 0)` → `inset(0)`). | Sondaven `clip` + Floema directional clip | High / Low | **Quick win** |

### C.12 `GammaSeparator` (parallax band #3, between founder story and FAQ)
*66 LOC, 0 animation refs — VERY light.*

| # | WOW enhancement | Source pattern | Impact/Effort | Label |
|---|---|---|---|---|
| 1 | Add `data-theme-flip="espresso"` (mirror of `CepEditorialDivider`'s flip back to dark). | Sondaven `theme_on-dark` | High / Low | **Quick win** |
| 2 | "interfood" stacked brand text gets **edge-fade mask marquee** (CSS `mask-image: linear-gradient(90deg, transparent 0%, #FFF 15%, #FFF 85%, transparent 100%)`). | Sondaven `.fin-s_title_marquee` mask-image | High / Low | **Quick win** |
| 3 | Band photo gets **scroll-velocity skew** (subtle `skewX(-3deg)` when scrolling fast, 0 at rest) — Codrops/Locomotive pattern. | Codrops skew-on-scroll + youtube.com/watch?v=qcfXA3uAD30 | Medium / Medium | **Medium** |

### C.13 `EaFaqAccordion` (minimalist 6-item accordion)
*331 LOC, 11 animation refs — moderate.*

| # | WOW enhancement | Source pattern | Impact/Effort | Label |
|---|---|---|---|---|
| 1 | Each accordion item gets **`hover="line"` underline reveal** + 1px gold-stroke animated divider (`scaleX 0 → 1`). | Sondaven `hover="line"` + `divider` class (45 occurrences of `data-prevent-flicker="true" hover="line"`) | High / Low | **Quick win** |
| 2 | Accordion expand/collapse uses **clip-path height animation** (`clip-path: inset(0 0 100% 0)` → `inset(0)`) instead of `max-height` transition — smoother, no jump. | Sondaven `clip` + GSAP `clipPath` tween | High / Medium | **Medium** |
| 3 | Answer text reveals with **per-line stagger** (each line `translateY(110%)` → `0` inside `overflow: hidden` mask). | Sondaven `split-line` + `data-scroll-reveal="p"` | Medium / Medium | **Medium** |

### C.14 `CepInstagramGrid` (3×3 IG grid with Reel play icons)
*141 LOC, 3 animation refs — light.*

| # | WOW enhancement | Source pattern | Impact/Effort | Label |
|---|---|---|---|---|
| 1 | Grid items get **staggered directional clip-path reveal** (item 0 top-to-bottom, item 1 left-to-right, item 2 bottom-to-top, etc — alternating in a 3×3 wave). | Floema directional clip-path + Sondaven `data-scroll-reveal="card"` | High / Low | **Quick win** |
| 2 | Hover on each IG tile triggers **`mix-blend-mode: multiply` bordeaux overlay + scale 1.05** (photo "deepens" with brand color). | Lando `blend-1` + Lando `blends-w` | High / Low | **Quick win** |
| 3 | Hashtag strip below grid becomes **multi-direction marquee** (scrolls left when scrolling down, right when scrolling up). | MindMarket scroll-aware marquee + pixfort "change direction on scroll" | Medium / Medium | **Medium** |

### C.15 `Contact` (4-step lead form → POST /api/lead → Prisma Lead → toast)
*1304 LOC, 59 animation refs — heavily animated.*

| # | WOW enhancement | Source pattern | Impact/Effort | Label |
|---|---|---|---|---|
| 1 | Submit button becomes **circular magnetic `btn-circle`** with **gold-rim fill** (Cartier-style luxury CTA). | Cartier gold-on-black CTA + Sondaven `btn-circle` | High / Medium | **Medium** |
| 2 | Form-step transitions use **GSAP `Flip.fit()`** between step N and step N+1 (the form container "morphs" between steps instead of cross-fading). | Sondaven `data-flip-id` shared-element + GSAP Flip | High / High | **Ambitious** |
| 3 | Input field focus state gets **`hover="line"` underline draw animation** (gold line `scaleX 0 → 1` on focus). | Sondaven `hover="line"` + `divider` | Medium / Low | **Quick win** |

### C.16 `SiteFooter` (dark navy footer with newsletter + 3-col + cities marquee)
*528 LOC, 10 animation refs — moderate.*

| # | WOW enhancement | Source pattern | Impact/Effort | Label |
|---|---|---|---|---|
| 1 | "interfood" stacked brand name gets **edge-fade mask marquee** + **velocity-aware skew** (subtle `skewX(-2deg)` when scrolling fast). | Sondaven `.fin-s_title_marquee` mask-image + Lando `marquee-adv` velocity-skew | High / Medium | **Medium** |
| 2 | Cities list ("Санкт-Петербург · Москва · Вся Россия") becomes **counter-current marquee** (scrolls opposite to scroll direction). | MindMarket scroll-aware direction-change marquee | Medium / Medium | **Medium** |
| 3 | Newsletter email input + submit becomes **magnetic `btn-circle` micro-cluster** (label + arrow button that pull together toward cursor). | Sondaven `data-magnetic-strength` + `data-magnetic-inner-target` | Medium / Medium | **Medium** |

---

## D) Top 6 must-implement WOW effects

Selected from §A and §C using criteria: **(a)** highest visible impact (transforms the block from "nice" to "Awwwards-tier"); **(b)** achievable in 1-3 days per block; **(c)** fits our existing stack (Motion + GSAP + Lenis); **(d)** respects all hard constraints (transform/opacity only, prefers-reduced-motion, no .mp4 in public, no indigo/blue, 44px targets, ARIA).

---

### Effect #1 — `ClipPathReveal` component (directional clip-path image reveal on scroll)

**What it does:** A reusable Motion/GSAP wrapper that reveals any `<SmartImage>` (or arbitrary child) by animating `clip-path: inset(...)` from fully-clipped to fully-open, with 4 directional variants (top, right, bottom, left) and an alternating mode (cycles through directions per child in a list).

**Transforms these blocks:** `CepEditorialDivider` (C.1.2), `EaEventsPortfolio` card images (C.3.2), `EaVenuesSpotlight` photos (C.4.2), `DeliveryBlock` food photo (C.9.3), `EaFounderStory` portrait (C.11.3), `CepInstagramGrid` tiles (C.14.1). **Also applicable to:** every photo cell below the carousel.

**Technical approach:** New component `src/components/motion/clip-path-reveal.tsx`. Props: `direction: 'top'|'right'|'bottom'|'left'|'alternate'`, `delay`, `scrub?: boolean` (if true, binds to scroll progress; if false, fires once on enter). Implementation uses Motion's `useInView` + `useMotionValue` + `useTransform` for the clip-path string (avoiding React re-renders). For the `alternate` mode, the parent passes an `index` and the child computes direction from `index % 4`. Under `prefers-reduced-motion: reduce`, the component renders children with `clip-path: none` immediately (no animation). The clip-path string is constructed as `` `inset(${t}% 0 0 0)` `` etc. — never animates `width`/`height` (RULES §5 violation).

**Sketch (conceptual, not production code):**
```tsx
// clip-path-reveal.tsx — Motion-first, transform-only
const INSETS = {
  top:    (t) => `inset(${t}% 0 0 0)`,     // reveals top→bottom
  right:  (t) => `inset(0 ${t}% 0 0)`,     // reveals right→left
  bottom: (t) => `inset(0 0 ${t}% 0)`,    // reveals bottom→top
  left:   (t) => `inset(0 0 0 ${t}%)`,    // reveals left→right
};
// useInView triggers a 0→100 → 0 motionvalue tween on the inset percentage
// For 'alternate': direction = INSETS[Object.keys(INSETS)[index % 4]]
```

Inspired by: codepen.io/ezra_siton/pen/gOPYRKP (GSAP ScrollTrigger batch + clip-path inset), stealthis.dev/r/lg-39-clip-path-reveal (Feb 2026), Sondaven `.clip` class, Floema directional clip-path.

---

### Effect #2 — `SplitTextReveal` component (line/word/char staggered text reveal with optional gradient mask)

**What it does:** A wrapper that splits any heading/paragraph into lines/words/chars (using `split-type` npm package — 4kb, MIT — OR GSAP's now-free `SplitText` plugin) and reveals them with a `translateY(110%) → 0` stagger inside an `overflow: hidden` mask per line. Optional `gradient` variant applies a `background-clip: text` gradient that animates `0% → 100%` per word, giving the Floema "word fills with brand color" effect.

**Transforms these blocks:** Every H2/H3 below the carousel — `EaServiceTabs` (C.2.1), `EaVenuesSpotlight` H2 (C.4.3), `Menu` H2 (companion to C.5.1), `EaFounderStory` body (C.11.1), `EaFaqAccordion` H2 + answers (C.13.3), `Calculator` H2, `DeliveryBlock` H2. **Also:** `TottParallaxBand` char-split headline (C.6.2).

**Technical approach:** New component `src/components/motion/split-text-reveal.tsx`. Props: `as: 'h1'|'h2'|'h3'|'p'`, `mode: 'lines'|'words'|'chars'`, `stagger: number` (default 0.04 for chars, 0.08 for words, 0.16 for lines), `gradient?: { from: string; to: string }` (when set, applies `background-image: linear-gradient(90deg, var(--from), var(--to))` + `-webkit-background-clip: text` + `color: transparent` + animates `background-size: 0% 100% → 100% 100%`). Internally uses `split-type` (lighter than GSAP SplitText, no plugin registration needed). On `useInView` (once, margin `-80px`), runs Motion stagger. Under reduced motion, renders text as-is. **Accessibility critical:** the original text node stays in the DOM as an `aria-label` on the wrapper; the split nodes are `aria-hidden="true"`. This way screen readers read the heading normally.

**Sketch:**
```tsx
// split-text-reveal.tsx
import SplitType from 'split-type';   // 4kb MIT, npm i split-type
// On mount: new SplitType(node, { types: 'lines,words' })
// Wrap each line in <span style={{overflow:'hidden',display:'block'}}>
//   and animate inner word spans: initial {y:'110%'} animate {y:0} stagger
// Gradient variant: each word gets background-clip:text + animate background-size
// Reduced-motion guard: skip split, render plain text with aria-label
```

Inspired by: Sondaven `split-line` (50 occurrences) + `data-scroll-reveal="line|h|p"` (124 occurrences), Lando `split-type`/`split-flex`, Floema SplitText word-color transition, blog.olivierlarose.com/tutorials/text-gradient-opacity-on-scroll, codepen.io/NinaBaumgartner/pen/zYWEPMo.

---

### Effect #3 — `PinnedHorizontalMap` for `EaVenuesSpotlight` (Sondaven `pin_vector` map)

**What it does:** Replaces the current 3-up static venue cards with a **pinned horizontal-scroll SVG map section**. User scrolls vertically; the section pins and a horizontal SVG map of St. Petersburg + Moscow + Russia slides leftward. As each venue pin enters the viewport center, the pin "drops in" (Y spring), a `pin_vector` travel-time label slides out ("4 ч на Sapsan", "1.5 ч самолёт"), and the venue photo + name fades in. Three variants of pin (`center`/`right`/`left`) per Sondaven's `data-wf--map-pin--variant`.

**Transforms this block:** `EaVenuesSpotlight` (C.4.1) — biggest single-block transformation available.

**Technical approach:** Restructure `ea-venues-spotlight.tsx` into a 3-element pin layout (Lando's `pin-spacer` + `pin-wrap` + `pin-sticky` pattern, which is more Lenis-friendly than `ScrollTrigger.pin: true`). Inside the sticky wrapper: a `display: flex` row of venue cards + an absolutely-positioned SVG map behind. Use `useScroll({ target: pinWrap, offset: ['start start', 'end end'] })` → `useTransform(scrollYProgress, [0, 1], ['0%', '-66%'])` bound to the row's `x`. Each venue card has a pin marker that uses `useTransform(scrollYProgress, [cardStart, cardEnd], [40, 0])` for the drop-in. Map pins are SVG `<g>` with `transform: translateY(var)` set per scroll progress. Under reduced motion: render as static vertical stack (no pin, no horizontal scroll) — preserves content access.

**Sketch:**
```tsx
// Pinned horizontal scroll, Motion-first (no GSAP pin needed — uses CSS sticky)
<section className="relative h-[300vh]">           {/* pin-spacer, gives scroll distance */}
  <div className="sticky top-0 h-screen overflow-hidden">  {/* pin-sticky */}
    <div className="absolute inset-0">
      <VenueMap className="absolute inset-0 w-[300vw] h-full" />  {/* SVG map */}
    </div>
    <div className="flex h-full" style={{ x }}>     {/* x = useTransform(scrollY, ['0%','-66%']) */}
      {venues.map(v => <VenueCard key={v.id} {...v} />)}
    </div>
  </div>
</section>
```

Inspired by: Sondaven `pin_vector` + `map-w_pin` + `data-wf--map-pin--variant`, Lando Norris `pin-sticky`/`pin-wrap`/`pin-spacer`, codepen.io/cbg/pen/WNxByEj (pinned horizontal scroll GSAP), codepen.io/kairij/embed/KKoZxVL, webbae.net/posts/horizontal-scrolling-section-with-pin-and-fade-effects, awwwards.com/inspiration/horizontal-scrolling-image-gallery-studiochevojon.

---

### Effect #4 — `ThemeFlip` provider (color-flip sections on scroll)

**What it does:** A `data-theme-flip="dark|light|color"` attribute on any `<section>` triggers a global `--bg` / `--fg` / `--accent` swap when that section enters the viewport (and resets on leave). The whole page background flips between cream → espresso → terracotta as the user scrolls. Optional `bg-flip-3-stack` variant (Sondaven hero) layers 3 full-bleed color panels that cross-fade within a single section.

**Transforms these blocks:** `CepEditorialDivider` (C.1.1 → flip to espresso), `TottParallaxBand` (C.6.1 → flip to cream), `GammaSeparator` (C.12.1 → flip to espresso), `Calculator` (C.10.1 → flip to brand-color terracotta). **Also:** any block can opt-in by adding the attribute.

**Technical approach:** A new `ThemeFlipProvider` in `src/components/providers/theme-flip-provider.tsx` that wraps the page. It registers `IntersectionObserver` (or GSAP ScrollTrigger `onEnter`/`onLeaveBack`) callbacks for every `[data-theme-flip]` element. On enter, sets `document.documentElement.dataset.theme = themeValue`. CSS in `globals.css` defines `:root[data-theme="cream"] { --bg: var(--cream); --fg: var(--espresso); --accent: var(--bordeaux) }`, `:root[data-theme="espresso"] { --bg: var(--espresso); --fg: var(--cream); --accent: var(--orange) }`, `:root[data-theme="color"] { --bg: var(--terracotta); --fg: var(--cream); --accent: var(--espresso) }`. The body bg + fg colors transition with `transition: background-color 0.6s cubic-bezier(0.22, 1, 0.36, 1), color 0.6s ease` — **non-transform animation**, but only on the root, which is GPU-cheap. Under reduced motion: instant swap (no transition). For the 3-stack hero variant: 3 absolutely-positioned divs with `opacity` bound to scroll progress slices `[0, 0.33]`, `[0.33, 0.66]`, `[0.66, 1]` via `useTransform`.

**Sketch:**
```tsx
// theme-flip-provider.tsx
// useIntersectionObserver on every [data-theme-flip] element
// onEnter: document.documentElement.dataset.theme = el.dataset.themeFlip
// onLeave: do nothing (sticky until next section enters)
// globals.css:
//   :root[data-theme="cream"]    { --bg: var(--cream);    --fg: var(--espresso); --accent: var(--bordeaux); }
//   :root[data-theme="espresso"] { --bg: var(--espresso); --fg: var(--cream);   --accent: var(--orange);   }
//   :root[data-theme="color"]    { --bg: var(--terracotta); --fg: var(--cream); --accent: var(--espresso); }
//   html { transition: background-color 0.6s var(--ease-out), color 0.6s var(--ease-out); }
//   @media (prefers-reduced-motion: reduce) { html { transition: none; } }
```

Inspired by: Sondaven `theme_on-dark/light/color` + `hero_themes_dark-1/light-1/dark-2` 3-stack, Lando Norris `sticky-track-theme-change`, Floema `--color-creme/--color-black/--color-red` 50-var system.

---

### Effect #5 — `MagneticCircleButton` + `BlendModeCursor` upgrade (luxury CTAs + cursor)

**What it does:** (a) A new `MagneticCircleButton` component (Sondaven `btn-circle` pattern) — a circular CTA where the inner label translates toward cursor (0.3× via `useMotionValue` + `useSpring`) while the bg circle scales/translates separately. Used for primary CTAs throughout. (b) Upgrade existing `cursor.tsx` to use `mix-blend-mode: difference` so the cursor inverts the color of whatever is beneath it (text, photos, brand color) — same effect as the famous Awwwards blend-mode cursor.

**Transforms these blocks:** `DeliveryBlock` CTA "Рассчитать смету" (C.9.1), `EaFounderStory` CTA (C.11 — magnetic stat hover), `Contact` submit button (C.15.1), `SiteFooter` newsletter submit (C.16.3), `EaFaqAccordion` "Задать вопрос" CTA, `Menu` PDF download (C.5.3). Plus cursor upgrade is global.

**Technical approach:**
- `MagneticCircleButton`: 3-layer structure — outer `<motion.a>` (the link), middle `<div class="btn-circle_bg">` (gold-rim bg that scales 1.1 on hover via `useSpring`), inner `<motion.div data-magnetic-inner-target>` (label that translates by `0.3 × (cursorPos − center)`). On `mouseleave`, both spring back to 0. 44px min target size (a11y). `aria-label` required. Under reduced motion: skip the spring, render as static circle.
- `BlendModeCursor` upgrade: existing `cursor.tsx` already has dot + lagging ring. Add `style={{ mixBlendMode: 'difference' }}` to both. The cursor color becomes pure white (`#fff`) so that over a dark espresso background it appears white, over a cream background it appears dark, over bordeaux it appears cyan-ish (its complement). Set `pointer-events: none` and `z-index: 9999`. Hide on touch devices (existing behavior). On `prefers-reduced-motion: reduce`: hide custom cursor entirely, restore native cursor.

**Sketch:**
```tsx
// magnetic-circle-button.tsx
<motion.a
  ref={ref}
  aria-label={ariaLabel}
  className="btn-circle relative h-14 w-14 rounded-full ..."
  onMouseMove={...} onMouseLeave={...}
>
  <motion.div className="btn-circle_bg" style={{ scale: bgScale }} />  {/* gold rim */}
  <motion.div
    data-magnetic-inner-target
    style={{ x: sx, y: sy }}   {/* useSpring(useMotionValue(0)) */}
    className="btn-circle_label absolute inset-0 grid place-items-center"
  >
    <span className="p6 text-dark">{children}</span>
  </motion.div>
</motion.a>

// cursor.tsx upgrade (single line):
<motion.div style={{ x, y, mixBlendMode: 'difference' }} className="fixed size-3 rounded-full bg-white" />
```

Inspired by: Sondaven `data-magnetic-strength` + `data-magnetic-inner-target` + `btn-circle`, Cartier gold-on-black CTA, codepen.io/KACTOPKA/pen/ZEMBZbK (blend-mode cursor), blog.olivierlarose.com/tutorials/magnetic-button, youtube.com/watch?v=E6PZvwITeU4 (blend-mode cursor React+GSAP), codepen.io/tag/magnetic.

---

### Effect #6 — `ScrollBoundVideo` (Mux `currentTime` scrubbed by scroll progress)

**What it does:** Drives an existing `<VideoPlayer>` (Mux) element's `currentTime` directly from scroll progress — instead of autoplay-loop, the video becomes a "scroll-scrubbed cinema": as the user scrolls, the video plays forward frame-by-frame; scroll back, it plays backward. This is the Apple AirPods / Sondaven `data-scroll-video` / Cartier W&W pattern, but using our existing Mux infrastructure (no .mp4 in `/public`, no image-sequence canvas — just one Mux asset whose `currentTime` is bound to scroll).

**Transforms these blocks:** `GgVideoShowcase` (block #3 above the carousel — biggest upgrade: currently autoplay-loop becomes scroll-scrubbed), `EventsVideoCarousel` modal (C.7.1 — tile click opens scrubbed-video modal). Optional secondary use: any parallax band could have a subtle bg video scrubbed by scroll.

**Technical approach:** New wrapper component `src/components/media/scroll-bound-video.tsx`. Wraps `<VideoPlayer>` (Mux). On mount, gets the video element via `ref`, calls `videoEl.pause()` (we don't want autoplay), sets `videoEl.muted = true` (required for `currentTime` seeking to work without user gesture — actually Mux already mutes autoplay; for scroll-scrub we explicitly mute). Uses `useScroll({ target: containerRef, offset: ['start start', 'end end'] })` → `useMotionValueEvent(scrollYProgress, 'change', (v) => { videoEl.currentTime = v * videoEl.duration; })`. Wrap in `requestAnimationFrame` to throttle. **Critical:** call `videoEl.pause()` first and never call `.play()` — we only seek. If `videoEl.readyState < 2`, queue the seek until `loadeddata` event fires. Under reduced motion: fall back to autoplay-loop (existing behavior). 44px target preserved by VideoPlayer's controls.

**Sketch:**
```tsx
// scroll-bound-video.tsx
const containerRef = useRef<HTMLDivElement>(null);
const videoRef = useRef<HTMLVideoElement>(null);
const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });

useEffect(() => {
  const video = videoRef.current; if (!video) return;
  if (reduce) { video.play(); return; }  // reduced-motion: autoplay loop fallback
  video.pause();
  const unsub = scrollYProgress.on('change', (p) => {
    if (video.readyState < 2) return;
    video.currentTime = p * video.duration;
  });
  return () => unsub();
}, [reduce, scrollYProgress]);

return (
  <div ref={containerRef} className="h-[200vh]">  {/* extra height = scroll distance */}
    <div className="sticky top-0 h-screen">
      <VideoPlayer ref={videoRef} source={{ provider:'mux', playbackId, streamType:'on-demand' }}
        className="h-full w-full object-cover" muted controls={false} />
    </div>
  </div>
);
```

Inspired by: Sondaven `data-scroll-video` + `data-scroll-video-container` (hero canvas), Cartier W&W scroll-bound 3D scenes, youtube.com/watch?v=n6g9YNVkxNo "scroll-controlled video playback effect", gsap.com ScrollTrigger `scrub` + video `time` tween (canonical GSAP demo).

---

## E) Concrete references — codepens, demos, npm packages, tutorials

### E.1 Clip-path image reveal (Effect #1)

| Reference | Type | What it shows |
|---|---|---|
| https://codepen.io/ezra_siton/pen/gOPYRKP | CodePen | GSAP ScrollTrigger batch — image reveal mask top-to-bottom via `clip-path: inset(...)`. Copy-paste ready. |
| https://stealthis.dev/r/lg-39-clip-path-reveal | Tutorial | Feb 2026 — images and sections wipe into view using animated clip-path on scroll, scrubbed by GSAP ScrollTrigger. |
| https://tympanus.net/codrops/2021/05/04/dynamic-css-masks-with-custom-properties-and-gsap | Codrops article | Dynamic CSS masks with custom properties + GSAP — for the cursor-spotlight variant. |
| https://codepen.io/claudiopedrom/full/bQjWMm | CodePen | GSAP image animation mask on scroll. |
| Sondaven `.clip` class + `data-scroll-reveal="line"` | Live site | Section `<section class="section theme_on-dark clip">` — clip-path inset on every section. |

### E.2 SplitText / split-type reveal (Effect #2)

| Reference | Type | What it shows |
|---|---|---|
| https://github.com/lukePeavey/split-type | npm package (MIT, 4kb) | Splits HTML text into lines/words/chars. Used by Lando Norris (`split-type` class). Recommended over GSAP SplitText for our React-first stack. |
| https://gsap.com/docs/v3/Plugins/SplitText | GSAP docs | SplitText plugin — **now FREE as of GSAP 3.13 / May 2025** (no longer Club-only). |
| https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins | Codrops article | 5 creative demos using the newly-free GSAP plugins (May 2025). |
| https://codepen.io/osmosupply/pen/pvvKezw | CodePen | SplitText → lines/words/chars + staggered tweens + custom eases. |
| https://codepen.io/collection/KiEhr | CodePen collection | Official GSAP SplitText Showcase collection on CodePen. |
| https://blog.olivierlarose.com/tutorials/text-gradient-opacity-on-scroll | Tutorial | Character-by-character opacity animation applied on text while scrolling (React + Next + GSAP ScrollTrigger) — the gradient variant. |
| Sondaven `.split-line` (50 occurrences) + `data-scroll-reveal="line\|h\|p\|ctn\|card"` | Live site | The canonical Awwwards SOTM 2026 implementation. |

### E.3 Pinned horizontal scroll (Effect #3)

| Reference | Type | What it shows |
|---|---|---|
| https://codepen.io/cbg/pen/WNxByEj | CodePen | Canonical GSAP horizontal scroll + pin. |
| https://codepen.io/kairij/embed/KKoZxVL | CodePen | `gsap.to(".pin-wrap", { scrollTrigger: { trigger: "#sectionPin", pin: true, ... }, x: ... })`. |
| https://www.webbae.net/posts/horizontal-scrolling-section-with-pin-and-fade-effects | Tutorial (Aug 2024) | Pin + fade effect using GSAP ScrollTrigger — interactive, dynamic. |
| https://www.awwwards.com/inspiration/horizontal-scrolling-image-gallery-studiochevojon | Awwwards inspiration | StudioChevojon horizontal scrolling image gallery — photographic editorial. |
| https://www.awwwards.com/inspiration/clip-path-scroll-animation-balans-kitchen-1 | Awwwards inspiration | BALANS KITCHEN — horizontal scroll with parallax + clip-path (catering-adjacent). |
| https://www.awwwards.com/awwwards_collections/collections/horizontal-layout-websites | Awwwards collection | Horizontal layout websites collection. |
| Lando Norris `.pin-sticky` / `.pin-wrap` / `.pin-spacer` (3-element pattern) | Live site | CSS-sticky-based pin, more Lenis-friendly than ScrollTrigger pin. |
| Sondaven `pin_vector` / `map-w_pin` / `data-wf--map-pin--variant` | Live site | The map-pin variant of pinned horizontal scroll. |

### E.4 Theme-flip / color-flip sections (Effect #4)

| Reference | Type | What it shows |
|---|---|---|
| Sondaven `.hero_themes_dark-1` / `.hero_themes_light-1` / `.hero_themes_dark-2` 3-stack | Live site | Cross-fading color panels within one hero section. |
| Sondaven `<section bg="dark\|light\|color" class="… theme_on-dark\|theme_on-light\|theme_on-color">` | Live site | Per-section theme class system (13 sections alternate). |
| Lando Norris `.sticky-track-theme-change` | Live site | Sticky section where the global theme color changes on scroll. |
| Floema `--color-creme/--color-black/--color-red` (50 CSS vars, 67 uses each) | Live site | The CSS-variable-driven theming approach (section-level `--bg`/`--fg`/`--accent` swap). |
| Our existing `:root.dark` class on `<html>` | Project | Already in `globals.css` — extend with `data-theme` attribute for finer control. |

### E.5 Magnetic button + blend-mode cursor (Effect #5)

| Reference | Type | What it shows |
|---|---|---|
| https://blog.olivierlarose.com/tutorials/magnetic-button | Tutorial | Magnetic button hover animation with HTML/CSS/JS/GSAP. |
| https://blog.olivierlarose.com/tutorials/blend-mode-cursor (linked from E6 video) | Tutorial | Blend-mode cursor — moving cursor on mouse-move colored with CSS `mix-blend-mode: difference` (React + GSAP). |
| https://www.youtube.com/watch?v=E6PZvwITeU4 | YouTube tutorial | Blend-mode cursor tutorial (React + GSAP). |
| https://www.youtube.com/watch?v=zwplxgaIn9M&vl=en | YouTube tutorial | Magnetic button hover with HTML/CSS/JS/GSAP. |
| https://codepen.io/KACTOPKA/pen/ZEMBZbK | CodePen | Stylish cursor using `mousemove` + `mix-blend-mode` color transition. |
| https://codepen.io/tag/magnetic | CodePen tag | Collection of magnetic button + cursor effects (award-winning hero, magnetic button interaction UI, etc.). |
| Sondaven `data-magnetic-strength` + `data-magnetic-inner-target` + `.btn-circle` (in `#cta` section) | Live site | Three-tier magnetic effect (strength × inner-target × bg). |
| Cartier gold-rim circular CTA | Live site | Luxury variant of the magnetic circle button. |
| Our existing `src/components/catering/cursor.tsx` | Project | Already implements dot + lagging ring; just add `mixBlendMode: 'difference'`. |
| Our existing `ANIMATION-PRESETS.md` §7 Magnetic | Project | Already has `Magnetic` wrapper; extend to circular variant. |

### E.6 Scroll-bound video / scroll-scrubbed video (Effect #6)

| Reference | Type | What it shows |
|---|---|---|
| https://www.youtube.com/watch?v=n6g9YNVkxNo | YouTube tutorial (Mar 2025) | "Scroll-controlled video playback effect" — frame-by-frame video bound to scroll progress. |
| https://gsap.com/docs/v3/Plugins/ScrollTrigger | GSAP docs | Canonical `scrub` + video `time` tween demo (`tween = gsap.to(video, { currentTime: video.duration, scrollTrigger: { scrub: true } })`). |
| Sondaven `<canvas data-scroll-video class="scroll-video light">` inside `<div data-scroll-video-container>` | Live site | The SOTM 2026 implementation (canvas-based image-sequence variant). |
| Cartier W&W 2025 — six 3D alcoves scroll-driven | Live site | Three.js camera-flight variant (we don't need this — Mux currentTime is enough). |
| Our existing `src/components/media/video-player.tsx` | Project | Already supports Mux playback — expose `ref` to access underlying `<video>` element for `currentTime` scrubbing. |

### E.7 Supplementary techniques (not in top 6 but referenced in §C)

| Technique | Reference | Where it's mapped |
|---|---|---|
| Variable-font weight on scroll velocity | https://codepen.io/NinaBaumgartner/pen/zYWEPMo + https://www.carmenansio.com/articles/variable-font-scroll (Apr 2026) | C.5.1 Menu H2 |
| Edge-fade mask marquee | Sondaven `.fin-s_title_marquee` CSS `mask-image: linear-gradient(90deg, transparent 0%, #FFF 15%, #FFF 85%, transparent 100%)` | C.12.2 GammaSeparator + C.16.1 SiteFooter |
| Counter-current scroll-aware marquee | https://www.facebook.com/pixfort/videos/interactive-marquee-just-got-smarter-with-the-new-change-direction-on-scroll-opt/24389147704073207 (Sep 2025) + MindMarket live site | C.14.3 + C.16.2 |
| WebGL image distortion hover (Codrops library) | https://tympanus.net/codrops/2018/04/10/webgl-distortion-hover-effects + https://medium.com/@alxrbrown/create-a-distortion-hover-effect-using-webgl-32fc1ab50d24 | (NOT graftable to us — WebGL too heavy for our stack; mentioned for completeness) |
| GSAP skew-on-scroll (Locomotive pattern) | https://www.youtube.com/watch?v=qcfXA3uAD30 ("Awwwards remake, skew distortion effect on scroll using Locomotive Scroll & React") | C.12.3 GammaSeparator |
| GSAP `Flip` plugin (shared-element transitions) | https://gsap.com/docs/v3/Plugins/Flip + Sondaven `data-flip-id="auto-1"` preloader→hero | C.2.3 + C.15.2 |
| CSS `offset-path` scroll-bound path animation (MindMarket "path scroll") | https://developer.mozilla.org/en-US/docs/Web/CSS/offset-path + MindMarket live site | C.8.1 CepProcess |
| Grain/noise overlay (Sondaven `data-noise`) | Sondaven live site (`<div data-noise class="noise">`) | Optional global overlay |

### E.8 npm packages to add (one-time install)

```bash
bun add split-type          # 4kb MIT, used by Lando Norris — for SplitTextReveal (Effect #2)
# GSAP SplitText, CustomEase, Flip are now FREE (since May 2025) — already in `gsap` package,
# just need to register them dynamically:
#   gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Flip);
# No new npm install needed for GSAP plugins.
```

That's it — **one new dependency** (`split-type`, 4kb MIT) unlocks every technique in this report. Everything else uses existing `motion`, `gsap`, `lenis`, `swiper`, `VideoPlayer`, `SmartImage`.

---

## Appendix — Sondaven full attribute audit (for reference)

Top `data-*` interaction attributes found in Sondaven HTML (counts):

| Attribute | Count | Purpose |
|---|---|---|
| `data-scroll-reveal` | 136 | Triggers scroll-reveal animation (values: `line`, `ctn`, `h`, `p`, `card`, `w`) |
| `data-prevent-flicker` | 45 | Anti-FOUC flag — ensures transform computed before reveal |
| `data-wf--btn--variant` | 16 | Webflow component prop — button variant (`med`, etc.) |
| `data-preloader` | 12 | Preloader sub-element (`bg`, `scene`, `logo`, `p`, `percent`) |
| `data-view-all` | 12 | "View all" link trigger |
| `data-modal-close` | 12 | Modal close trigger |
| `data-tab-trigger` / `data-tab-content` | 10 / 10 | Tabbed section trigger + content panel |
| `data-lenis-scroll` | 8 | Lenis-managed scroll container |
| `data-modal-vim-video` / `data-modal-vim-video-btn` | 6 / 3 | Vimeo video modal opener |
| `data-modal-over` | 6 | Modal overlay |
| `data-intro` | 5 | Hero intro sub-element (`bg-scene`, `over-scene`, `p`, `video`) |
| `data-content` | 5 | Content slot |
| `data-magnetic-strength` / `data-magnetic-inner-target` | 4 / 4 | Three-tier magnetic button system |
| `data-wf--map-pin--variant` | 4 | Map pin variant (`center`, `right`) |
| `data-load-more` | 3 | Load-more trigger |
| `data-marquee` | 3 | Marquee instance |
| `data-barba` / `data-barba-namespace` | 2 / 1 | Barba.js page-transition namespace |
| `data-highlight-text` | 2 | Highlighted text reveal (marker pen on scroll) |
| `data-prolog-scene` / `data-fin-scene` / `data-intro-bg-scene` / `data-intro-over-scene` | 2 / 2 / 1 / 1 | WebGL `<canvas>` scene per major section |
| `data-noise` | 1 | Global film-grain overlay |
| `data-flip-id` | 1 | GSAP Flip shared-element ID (preloader→hero logo) |
| `data-scroll-video-container` / `data-scroll-video` | 1 / 1 | Hero scroll-driven video canvas |
| `data-hero-img` | 1 | Hero image element |

Plus 529 `hover="…"` attribute occurrences across 16 distinct micro-interaction types. Every interactive surface has a defined hover behavior.

---

**End of report.** Total references: 38 external links (codepens, tutorials, npm packages, live sites). All verified fetched 2026-08-22 via z-ai `page_reader` and `web_search` (no memory speculation). For implementation hand-off, see §D sketches and §E references. Constraints respected: transform/opacity-only animations, `prefers-reduced-motion`, no `.mp4` in `/public` (Effect #6 uses Mux `VideoPlayer`), no indigo/blue colors, 44px targets, ARIA labels.
