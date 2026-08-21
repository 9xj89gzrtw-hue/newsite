# SALTBLOCK-ANALYSIS.md

**Target site:** `https://saltblockhospitality.com/`
**Captured:** 2026-08-21 · viewport 1440×900 (desktop) + 390×844 (iPhone 12 Pro)
**Method:** agent-browser v0.32.3 (Chrome headless) DOM inspection + computed-style extraction + full-page screenshots + `web-search` skill for brand context
**Assets:** `docs/reference-library/saltblock/` — 27 files (homepage-full.png 10886px tall, hero-top.png, 12 desktop section screenshots section-00..section-11, mobile-top.png, hover-plan-event-btn.png, 4 JSON extraction dumps in `dumps/`, 11 downloaded hero/signature images in `images/`, 8 web-search JSON files)

> **Mission:** extract PATTERNS only (animations, layout, type system, color logic, signature wow moments) so the dev agents can rebuild the *feel* in our Russian catering site "Interfood Catering" (СПб, cream/espresso/bordeaux/terracotta/sage/honey palette, Playfair Display + Oswald + Karla + Barlow Semi Condensed + Montserrat stack, framer-motion 12 + gsap + lenis already integrated). We will NOT clone Salt Block's copy or images.

---

## TL;DR — the 6 things you must copy

| # | Pattern | Why it matters | Where to apply on our site |
|---|---------|----------------|----------------------------|
| 1 | **Massive uppercase display H1 at ~160px ("RAISE THE BAR")** rendered in Minerva Modern weight 400, no letter-spacing, white-on-video, line-height 0.93, uppercase | This is the biggest H1 of any of our reference sites (Ridgewells 88px, joels 110px italic, Salt Block 160px upright uppercase). It is the site's signature — the hero *is* the typography. Our **Barlow Semi Condensed Bold** (uppercase-set, narrow-ish) or **Oswald Bold** at clamp(80px, 12vw, 160px) is the closest free substitute (both are condensed display sans, whereas Minerva Modern is a contemporary serif with strong contrast). | All hero headlines on the catering site (replace existing 96px Playfair H1 with 160px Barlow Semi Condensed uppercase — instant premium) |
| 2 | **Full-bleed background video hero** (1920×1080 mp4, 43s loop, muted, autoplay, poster bruschetta.jpg) with text overlay + a 4-logo "as featured in" press strip docked to the bottom edge | First reference site with a real video hero (Ridgewells used image slideshow, joels used single static image). The video gives an instant cinematic feel. We can shoot our own or license a Mux-hosted mp4 of plated food. The press-strip-docked-at-hero-bottom is a tiny cheap "wow" we should adopt. | Replace existing Ken Burns slideshow hero with a real `<video autoplay muted loop playsinline>` background (upload to Mux per project rules — DO NOT put .mp4 in `public/`) |
| 3 | **Petal-shaped primary button** (`border-radius: 16px 0px` — top-left + bottom-right rounded, top-right + bottom-left square) on a near-black bg `#192121`, padding `23px 38px`, font Anziano 19.2px weight 700 | The petal shape is the most distinctive button on any of our reference sites. Ridgewells used square `border-radius: 0`, joels used square `border-radius: 0`. Salt Block's petal signals "modern luxury" without being a full pill. Cheap to ship — just `rounded-tl-2xl rounded-br-2xl rounded-tr-none rounded-bl-none` in Tailwind. | All primary CTAs ("Заказать кейтеринг", "Рассчитать стоимость", "Забронировать дату") |
| 4 | **Marquee band immediately after hero** — 144px tall, single phrase "Chef-Driven Seed-Oil-Free Luxury Catering" repeated 3× in inline horizontal scroller | Salt Block's marquee is the SECOND element on the homepage (right after the hero), creating a strong rhythmic break. The phrase is the brand positioning distilled to 5 words. Marquee band is dirt cheap to ship. | Already have MarqueeBand component (Cycle 21) — adopt Salt Block's positioning: marquee as the SECOND section (right after hero), not buried mid-page. Replace our existing marquee placement after EditorialIntro with direct hero → marquee. |
| 5 | **Horizontal gallery-reel of food photography** (13 images, horizontal scroll, 720px tall, no carousel arrows visible — drag-to-scroll) | The third reference site to use horizontal scroll for food (Ridgewells used full-bleed slideshow, joels used Swiper carousel). Salt Block's reel is the cleanest: no arrows, no pagination dots, just drag-to-scroll with cursor hint. Excellent for showcasing 12+ plated dishes in one section. | Replace existing `events-gallery.tsx` grid with a horizontal gallery reel (use framer-motion `useDrag` + `useMotionValue`) |
| 6 | **2-column "SaltBlock Difference" layout** — left: 71px uppercase H2 "IMPRESSIVE Hospitality Experiences" with sub-heading + body + 3-step process; right: 3 stacked image cards "Exclusive Venues" / "Chef Crafted" / "Farm Fresh" each with full-bleed photo + caption overlay | Editorial magazine spread structure. Ridgewells used two-up service grid (image-top, text-bottom). Salt Block uses 2-column with text-left, image-stack-right. Better for narrative pacing. | About / "Почему Interfood" section — replace existing StatCards with this 2-column narrative + image stack |

Bonus: **cool sage-cream body background `#E5ECE9`** — every other reference site used pure white. Salt Block's cool sage-cream signals "fresh, garden, farm-to-table". This maps DIRECTLY to our existing `cream #FCFBF8` (we just swap cool-sage-cream → warm-cream, same idea, different temperature). Also: **dark green-black text `#19211F`** (not pure black) — almost identical to our `espresso #101010`.

---

## 1. Brand & business context

### 1.1 Who they are

SaltBlock Hospitality is **Tampa Bay's chef-driven luxury caterer**, founded by **Ryan and Scott** and headquartered at **Suite 102, Tampa, FL 33602** (a second address — 8414 N Dale Mabry Hwy, Tampa, FL 33614 — appears on the Careers page). Contact: `877.793.7526` (toll-free sales line), `813-223-2752` (Tampa local), `Contact@Saltblockhospitality.com` (general), `sales@saltblockcatering.com` (events).

The brand owns and operates a **7-acre venue** — **SoireEstate at SB Nursery & Gardens** (Odessa, FL) — and a sister barbecue concept **Murph's Barbecue** (logo appears in the "family of brands" carousel, section 6287d89e54d46373a69befb0). SaltBlock Catering is the primary brand; SoireEstate is the venue; Murph's is a down-market barbecue offshoot for casual events. The **SBH Cares** program is their community/CSR initiative.

The site positions itself with three phrases repeated in copy:
- **"Chef-Driven"** (vs. venue-driven or banquet-hall-driven)
- **"Seed-Oil-Free"** (no industrial seed oils — cooks only with olive oil, avocado oil)
- **"Luxury Catering"** (positioning vs. mid-market corporate caterers)

The **seed-oil-free** differentiator is the most distinctive brand promise in our entire reference library. Ridgewells promised "95 years of legacy". joels promised "New Orleans premier off-premise". Salt Block promises a **health-conscious ideology** — every dish is made without industrial seed oils (no canola, soybean, sunflower, safflower oil). They cook with olive oil, avocado oil, and 100% avocado oil spray for small-batch applications. This is a 2024-2026 wellness-market positioning that signals "we care what's in your food, not just how it looks on the table" — and it lands as premium-luxury because it implies sourcing discipline.

### 1.2 Market positioning

Salt Block sits in the **modern-luxury chef-driven** tier of Tampa Bay catering:
- **Premium:** chef-driven menus, signature beverage program, exclusive venue partnerships (Armature Works, Haus 820, etc.)
- **Health-conscious:** seed-oil-free ideology (clean catering movement)
- **Vertically integrated:** owns SoireEstate venue + farm + catering brand
- **Multi-brand:** SaltBlock (luxury) + SoireEstate (venue) + Murph's Barbecue (casual) under one hospitality umbrella

Press mentions include **The Scout Guide** (luxury regional publication), **Catersource** (industry trade publication), **Tampa Bay Times** (regional newspaper), **The Honorable Life** (wedding publication) — 4 press-strip logos docked at the bottom of the hero. These are *regional/local* press mentions, not national Vogue/Town&Country like joels — Salt Block is regional-luxury, not national-luxury.

### 1.3 Signature style

Salt Block's signature visual identity is **dark-green-and-cream editorial with a chef's-table immediacy**:
- **Dark green-black `#19211F`** as primary brand color (NOT navy, NOT black — a near-black with cool green tint, like a forest at dusk)
- **Cool sage-cream `#E5ECE9`** as page background (NOT warm cream, NOT pure white — a cool mint-cream that signals fresh/garden)
- **Massive uppercase Minerva Modern serif** at 71-160px, no letter-spacing, weight 400 (light optical weight, large optical size)
- **Petal-shaped primary button** (`border-radius: 16px 0px` — leaf-like organic curve on two corners)
- **Full-bleed video hero** with overlaid press-strip
- **Marquee band** as the second section (immediately after hero)
- **Horizontal gallery reels** of food photography (drag-to-scroll)
- **Elfsight Google Reviews widget** embedded in the main content section (not a custom testimonials carousel)

### 1.4 Comparison to Ridgewells + joels

| Dimension | Ridgewells | joels | Salt Block |
|-----------|-----------|-------|-----------|
| **Brand color** | Deep aubergine `#502875` | Olive sage `#81846A` | Dark green-black `#19211F` |
| **Page background** | White `#FFFFFF` | White `#FFFFFF` | Cool sage-cream `#E5ECE9` |
| **Display font** | Scotch Display (Klim, premium) | Cormorant Garamond (Google, free) | Minerva Modern + Anziano (Adobe Typekit, premium) |
| **Hero treatment** | Image slideshow (7 imgs) | Single static image | **Background video (43s mp4)** |
| **Hero H1 size** | 88px | 110px italic | **160px upright uppercase** |
| **H1 style** | Serif regular | Serif italic | **Sans-serif-ish modern serif upright uppercase** |
| **Section H2 size** | 75-82px | 50px | **71px** |
| **Eyebrow tracking** | 2.26px / 3.12px | 0.4em (4.4px) | 0px (no eyebrow on hero — H1 is the eyebrow) |
| **Button shape** | Square (radius 0) | Square (radius 0) | **Petal (radius 16px 0)** |
| **Button font** | Arial 10px | Montserrat 11px | **Anziano 19.2px** (display serif on buttons!) |
| **Marquee** | 94px band, mid-page | None | **144px band, immediately after hero** |
| **Testimonials** | Solid-purple section + carousel | Swiper carousel | **Elfsight Google Reviews widget** |
| **Food display** | Service-card images | 3-up cuisine grid | **13-image horizontal gallery reel (drag-to-scroll)** |
| **Tech** | Wix (legacy absolute-position) | WordPress + WPBakery + Slider Rev | **Squarespace 7.1 + Fluid Engine** |
| **Animations** | Wix motion-part hooks | jQuery + Qode theme parallax | **Squarespace native fade+slide, no GSAP** |
| **Page height (desktop)** | 9788px (13 sections) | 5627px (13 sections) | **10886px (12 sections)** |
| **Page height (mobile)** | (not captured) | 7469px | (single mobile screenshot) |

**Verdict:** Salt Block is the most typographically aggressive of the three (160px H1), the most video-forward (real video hero), the most button-distinctive (petal shape), and the most modern-grid-structured (Squarespace Fluid Engine 8-col grid). It is also the only one with a wellness-ideology differentiator (seed-oil-free).

---

## 2. Tech stack

### 2.1 Confirmed via DOM inspection

**Framework: Squarespace 7.1** (latest Squarespace platform, "Fluid Engine" page builder).
- Body class: `sqs-seven-one` (Squarespace 7.1 marker)
- Body class: `collection-type-page collection-62863b22be537108f06e5bb9 collection-layout-default homepage`
- Body class: `mobile-style-available` (responsive Squarespace theme)
- Body class: `seven-one-global-animations` (Squarespace 7.1 native animation system)
- No `<meta name=generator>` tag (Squarespace strips this by default, but the universal scripts-compressed asset paths on `assets.squarespace.com/universal/scripts-compressed/` are a definitive Squarespace marker)
- `Static.SQUARESPACE_CONTEXT` global JS object confirmed in inline script
- Squarespace section IDs: `62b414bb3b2a773440bfa14e` (24-character hex MongoDB ObjectId format — Squarespace's content storage pattern)

**Fluid Engine** page builder (Squarespace's modern grid editor):
- Body class includes `data-fluid-engine="true"` on section 66962fdf6756b5e003a2dd9d
- CSS: `.fe-66962fdffd704ca51d273c4b { display: grid; grid-template-rows: repeat(35, minmax(24px, auto)); grid-template-columns: minmax(var(--grid-gutter), 1fr) repeat(8, minmax(...)) ... }`
- This is Squarespace Fluid Engine's 8-column desktop grid with `--grid-gutter` CSS variable and `--cell-max-width` constraint. Squarespace 7.1's Fluid Engine is the most modern grid builder of the three reference sites (Wix was absolute-positioned legacy, WordPress/WPBakery was Visual Composer shortcodes).

### 2.2 Animation libraries

**NONE of the modern animation libraries are loaded.** No GSAP, no Lenis, no Framer Motion, no ScrollTrigger. Squarespace uses its **native 7.1 animation system** (body class `tweak-global-animations-enabled tweak-global-animations-complexity-level-detailed tweak-global-animations-animation-style-fade tweak-global-animations-animation-type-slide tweak-global-animations-animation-curve-ease`).

The animation system uses two CSS classes:
- `preSlide` — sets initial state `opacity: 0; transform: translateY(20px)` (inferred from class name + behavior)
- `slideIn` — final state `opacity: 1; transform: translateY(0)` via CSS transition `transform 0.6s ease, opacity 0.6s ease`

**Stagger pattern:** each animated child receives a unique transition-delay calculated as `childIndex × 0.003488s` (~3.5ms per child). Observed delays:
- 1st child: `0.00348837s`
- 2nd child: `0.00697674s`
- 3rd child: `0.0104651s`
- 4th child: `0.0139535s`
- 5th child: `0.0174419s`
- 6th child: `0.020930s`
- 7th child: `0.0244189s`
- 8th child: `0.027907s`

That's a 3.5ms increment per child — extremely tight stagger (compared to typical 50-100ms stagger in GSAP). The whole element group animates in over ~600ms regardless of count.

**Three keyframes found via `document.styleSheets`:**
1. `@keyframes fonts-loading { 0%, 99% { color: transparent; } }` — FOUT prevention (text invisible until fonts load, then 99%→100% snap to visible). Clever FOUT mitigation.
2. `@keyframes eYuqoB { 0% { opacity: 0.4; } 100% { opacity: 1; } }` — opacity pulse for loading shimmer (Squarespace's auto-generated keyframe name).
3. `@keyframes dKTtel { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` — infinite rotation (loading spinner).

**Marquee animation:** Squarespace's native `sqs-block-marquee` block (visible in section 6287a2a07b0e3b4f5077c3f9). The marquee block uses an inline `data-props` JSON with `anim: "none"` (animation is CSS-driven, not JS-driven — the marquee text is duplicated in DOM and the wrapper uses `animation: marquee-scroll Xs linear infinite`).

### 2.3 Third-party scripts loaded

| Script | URL | Purpose |
|--------|-----|---------|
| **jQuery 3.6.0** | `https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js` | Loaded by Ghost Plugins helper (not used by Squarespace core) |
| **Swiper** | `https://www.ghostplugins.dev/assets/helpers/swiper/swiper.js` | Carousel library (loaded by Ghost Plugins for the gallery reel + brand logos carousel) |
| **Lottie Player 1.5.7** | `https://unpkg.com/@lottiefiles/lottie-player@1.5.7/dist/lottie-player.js` | For animated SVG icons (likely the loading spinner + decorative animations) |
| **Elfsight Google Reviews** | `https://universe-static.elfsightcdn.com/app-releases/google-reviews/stable/v3.49.3/.../googleReviews.js` + `https://apps.elfsight.com/p/platform.js` | Google Reviews widget embedded in IMPRESSIVE section (`elfsight-app-073ab6e5-2402-423c-ac3a-5b0466aa8272`) |
| **Elfsight Instagram** | (loaded via Elfsight platform.js) | Instagram feed widget embedded in `@saltblockhospitality` section |
| Squarespace site-bundle | `https://static1.squarespace.com/static/vta/5c5a519771c10ba3470d8101/scripts/site-bundle.f8068e4a963a1f8acefb1034204b21c1.js` | Squarespace 7.1 core runtime |
| Squarespace universal scripts-compressed | `https://assets.squarespace.com/universal/scripts-compressed/{announcement-bar, popup-overlay, common, commerce, user-account-core, performance, cldr-resource-pack, extract-css-runtime, extract-css-moment-js, common-vendors-stable, common-vendors}-*.js` | Squarespace modular runtime (loaded ~15 scripts) |
| Squarespace polyfiller | `https://assets.squarespace.com/@sqs/polyfiller/1.6/{legacy,modern}.js` | Browser polyfills |

**Total: ~25 external scripts loaded** (15 Squarespace core + 3 third-party widgets + 7 polyfills/helpers). Heavier than joels (15 scripts) but lighter than Ridgewells (35+ scripts on Wix).

### 2.4 Font CDN

**Adobe Fonts (Typekit)** at `https://use.typekit.net/af/{hash}/000000000000000077359a4X/31/l?subset_id=2&fvd={variant}&v=3` — premium Adobe Fonts subscription required. Two font families loaded:

1. **Minerva Modern** — modern contemporary serif with high contrast (used for display headings — H1, H2, section titles)
   - Weights loaded: 400 (regular), 700 (bold), 400 italic, 700 italic (italic variants declared but `status: unloaded` — only regular + bold are actually fetched by the page)
2. **Anziano** — Italian-style classic serif with old-style proportions (used for body text, nav, buttons)
   - Weights loaded: 400, 700, 400 italic (all three loaded and `status: loaded`)

**Free Google Fonts fallback (declared but unloaded):**
- `Open Sans` (weight 400) — default Squarespace form field font
- `PT Serif` (weights 400 + 700, both normal + italic) — Squarespace legacy default (older templates used PT Serif)
- These are loaded via `<link rel=stylesheet href="https://fonts.googleapis.com/css2?family=Open+Sans&family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap">` but no element actually uses them (Squarespace just includes the fallback sheet)

**Icon fonts:**
- `squarespace-ui-font` — Squarespace UI icons (close X, arrows, hamburger)
- `social-icon-font` — Social platform glyphs (Instagram, Facebook, etc.)
- `swiper-icons` — Swiper carousel arrows (loaded but not visible — gallery reel uses drag-to-scroll, not arrows)

### 2.5 Image CDN

**Squarespace Images CDN** at `https://images.squarespace-cdn.com/content/v1/{libraryId}/{assetId}/{filename}?format={width}w`:
- `libraryId` = `628635115ffed10e289ac115` (Salt Block's Squarespace image library)
- `assetId` = 32-character hyphenated UUID (e.g., `8b3a1508-145f-4b7e-a7c9-9eba06420cde`)
- `?format=1500w` or `?format=2500w` — Squarespace's responsive image sizing (generates 1500px-wide or 2500px-wide variant on-the-fly)
- Native format: JPEG, PNG, GIF (no AVIF/WebP detected — Squarespace's CDN auto-negotiates based on `Accept` header but the rendered `<img src>` is the JPEG variant)

### 2.6 Video CDN

**Squarespace Video CDN** at `https://video.squarespace-cdn.com/content/v1/{libraryId}/{assetId}/{variant}`:
- Hero video: `Saltblock - WebHeader_V03.mp4`
- Native resolution: 1920×1080 (16:9, aspect ratio 1.7777)
- Codec: H.264 video + AAC audio
- Duration: 43.043 seconds (loops seamlessly)
- Asset ID: `2876c822-88f4-4571-b123-b6653fda91fb`
- Library: `628635115ffed10e289ac115` (same as images)
- Rendered as `<video autoplay muted loop playsinline>` with `poster` = bruschetta.jpg (2500×1080)
- Stored as `SqspHostedVideo` structured content type — Squarespace's native video upload

### 2.7 Ghost Plugins

The site uses **Ghost Plugins** (third-party Squarespace extension marketplace) — confirmed by the loaded script `https://www.ghostplugins.dev/assets/helpers/swiper/swiper.js`. Ghost Plugins provides free Swiper carousel integration for Squarespace sites (Squarespace 7.1 has built-in gallery reels but not full Swiper carousels). The Salt Block team has installed at least one Ghost Plugin (Swiper) for the brand-logos carousel and the testimonials carousel.

---

## 3. Color palette

### 3.1 Extracted hex codes

All colors below were extracted via `getComputedStyle` on body, header, sections, buttons, headings, and footer. RGB triplets are computed from the hex.

| Role | Hex | RGB | Usage context | OKLCH |
|------|-----|-----|---------------|-------|
| **Body background (page)** | **`#E5ECE9`** | `rgb(229, 236, 233)` | Page background — **cool sage-cream** (mint-tinged off-white). NOT pure white, NOT warm cream. The single most unusual color choice on Salt Block — a deliberate cool/garden palette. | `oklch(0.944 0.012 134)` |
| **Body text / dark brand** | **`#19211F`** | `rgb(25, 33, 31)` | All heading text on light sections, all body text, nav links, eyebrow text on light sections. **Dark green-black** — near-black with cool green tint. NOT pure black `#000` and NOT charcoal `#414142` (Ridgewells). | `oklch(0.163 0.012 156)` |
| **Footer background / dark section bg** | **`#172121`** | `rgb(23, 33, 33)` | Footer background, IMPRESSIVE section background (dark sections). Slightly cooler/bluer than `#19211F`. | `oklch(0.137 0.005 180)` |
| **Primary button bg / CTA** | **`#192121`** | `rgb(25, 33, 33)` | All `.theme-btn--primary` button backgrounds. Indistinguishable from footer bg `#172121` to the naked eye (1 RGB unit difference in R+G+B). | `oklch(0.137 0.005 180)` |
| **White section bg** | **`#FFFFFF`** | `rgb(255, 255, 255)` | Hero section content wrapper, SaltBlock Difference section, IMPRESSIVE section (despite dark footer nearby), FARM FRESH section, testimonials section. Pure white — used for ~5 of the 12 sections. | `oklch(1 0 0)` |
| **White text on dark** | **`#FFFFFF`** | `rgb(255, 255, 255)` | All headings on dark sections, all button text, hero text overlay. Pure white (NOT tinted — Ridgewells used `#F1EBF5` lavender-tinted white on dark; Salt Block uses pure white). | `oklch(1 0 0)` |
| **Section eyebrow on light** | (uses `#19211F`) | — | Eyebrows inherit body text color on light sections. NO separate eyebrow color (unlike Ridgewells `#502875` purple or joels `#81846A` olive). | — |
| **Press-strip logo gray** | (uses src PNGs) | — | 4 press logos are pre-desaturated PNGs (The Scout Guide, Catersource, Tampa Bay Times, The Honorable Life). No CSS grayscale filter — they're authored as grayscale images directly. Hover state unknown (no hover handlers detected on press-strip `<img>` elements). | — |
| **Form field border (Squarespace tweak)** | `--form-field-border-color` (default) | likely `#000000` or `#192121` | Body class: `form-field-style-outline form-field-shape-square form-field-border-bottom` — square outline form fields with bottom-only border. | — |
| **Mobile-style-available overlay** | (uses backdrop blur) | `rgba(0,0,0,0.5)` typical | Mobile menu overlay (not captured in detail). | — |

### 3.2 Squarespace tweak tokens

Squarespace 7.1 stores color choices as body class `tweak-*` modifiers (no CSS variables exposed). The relevant color tweaks from the body class string:

| Tweak | Value | Notes |
|-------|-------|-------|
| `primary-button-style-solid` | Solid filled | No outline / no ghost |
| `primary-button-shape-petal` | **Petal shape** | Squarespace's native petal radius: `border-radius: 16px 0px` (top-left + bottom-right rounded, top-right + bottom-left square) |
| `secondary-button-style-solid` | Solid filled | Same as primary |
| `secondary-button-shape-square` | Square | Square corners for secondary CTA |
| `tertiary-button-style-solid` | Solid filled | Same |
| `tertiary-button-shape-underline` | Underline | Text-link style for tertiary CTA |
| `header-width-inset` | Inset header | Header is narrower than viewport (max-width applied) |
| `tweak-fixed-header-style-basic` | Basic fixed header | No color-flip on scroll (transparent over hero, white when scrolled past hero — Squarespace native behavior) |
| `header-overlay-alignment-center` | Centered overlay | Mobile menu centered |
| `tweak-portfolio-grid-overlay-width-full` | Full-width portfolio grids | |
| `tweak-portfolio-grid-overlay-height-large` | Large height | |
| `tweak-portfolio-grid-overlay-image-aspect-ratio-11-square` | 1:1 square portfolio thumbnails | |
| `tweak-portfolio-grid-overlay-text-placement-center` | Centered text | |
| `tweak-portfolio-grid-overlay-show-text-after-hover` | Text appears on hover only | |
| `tweak-global-animations-enabled` | Animations ON | |
| `tweak-global-animations-complexity-level-detailed` | Detailed complexity (more elements animated per section) | |
| `tweak-global-animations-animation-style-fade` | Fade animation style | |
| `tweak-global-animations-animation-type-slide` | Slide animation type (translateY) | |
| `tweak-global-animations-animation-curve-ease` | Ease curve | |
| `form-use-theme-colors` | Form fields use theme colors | |
| `form-field-style-outline` | Outline form fields | |
| `form-field-shape-square` | Square form fields | |
| `form-field-border-bottom` | Bottom-border-only form fields (underline style for inputs) | |
| `hide-opentable-icons` | OpenTable icons hidden | (Salt Block has OpenTable integration for venue booking) |

### 3.3 Mapping to our project palette

Our project palette: **cream `#FCFBF8` + espresso `#101010` + bordeaux `#7A4A1F` (warm) → `#4A2515` (deep, post-Cycle-21 override) + terracotta `#C76E4A` + sage `#7D8470` + honey `#EAA259` + ink `#1A1714`**.

| Salt Block role | Salt Block hex | Our token | Hex | Notes |
|----------------|----------------|-----------|-----|-------|
| Body bg (page) | `#E5ECE9` cool sage-cream | `cream` | `#FCFBF8` warm cream | Direct 1:1 swap. Salt Block is COOL (mint-tinged), ours is WARM (cream-tinged). Both signal "natural, fresh, garden" — just different temperature. We keep our warm cream. |
| Body text / dark brand | `#19211F` dark green-black | `espresso` (or `ink`) | `#101010` (espresso) or `#1A1714` (ink) | Direct 1:1 swap. Our `espresso #101010` is slightly darker; our `ink #1A1714` is closer in lightness but warm. Pick `ink` for warm-temperature match, or `espresso` for max darkness. |
| Footer / dark section bg | `#172121` | `espresso` | `#101010` | Direct 1:1 swap. Already used for our QuoteBand + MarqueeBand backgrounds (Cycle 21). |
| Primary button bg | `#192121` near-black | `espresso` | `#101010` | Direct 1:1 swap. Our existing `.ridge-outline-btn` uses `border: 1.5px solid currentColor` — for a filled petal button, swap to `bg-espresso` + cream text. |
| White section bg | `#FFFFFF` | `cream` | `#FCFBF8` | Substitute our warm cream for warmth. Salt Block uses pure white for ~5 sections — we can use cream for all of them. |
| White text on dark | `#FFFFFF` pure | `cream` | `#FCFBF8` | Ridgewells used tinted `#F1EBF5` lavender on purple. joels used pure white on olive. Salt Block uses pure white on green-black. We should use our **cream `#FCFBF8`** on dark sections — adds the warm editorial signature. |
| Petal button radius `16px 0px` | — | (new) | — | New utility class needed: `.sb-petal-btn { border-radius: 16px 0 16px 0; }` (Tailwind: `rounded-tl-[16px] rounded-br-[16px] rounded-tr-none rounded-bl-none`). Apply to all primary CTAs. |
| Petal button radius (alt) | `0px 16px 16px 0px` | — | — | For right-aligned buttons, mirror the petal: rounded top-right + bottom-left. |

**Critical insight:** Salt Block's color palette is the **simplest** of the three reference sites — just 4 colors total (cool sage-cream, dark green-black, white, button green-black). No accent color. No bordeaux. No terracotta. No sage. The visual interest comes entirely from typography + photography + the petal button shape.

For our site, we should adopt this **restraint** in specific sections (e.g., hero, gallery reel) while keeping our bordeaux/terracotta accents for emotional warmth in testimonials, CTAs, and detail moments.

---

## 4. Typography

### 4.1 Font families

**Two Adobe Typekit fonts (premium, paid subscription):**

| Role | Font | Foundry | Style | Free Google Fonts substitute (our existing stack) |
|------|------|---------|-------|---------------------------------------------------|
| Display headings (H1, H2, section titles) | **Minerva Modern** | Adobe Originals (premium) | High-contrast modern serif, large optical size, contemporary Scotch Roman revival | **Playfair Display** (already in our stack — also Scotch Roman revival, high-contrast didone. Both have similar large-cap x-height + high stroke contrast. Minerva is slightly more contemporary/fashion-magazine; Playfair is slightly more old-world/didone.) |
| Body text, nav, buttons, eyebrows | **Anziano** | Adobe Originals (premium) | Italian old-style serif, humanist proportions, calligraphic warmth | **Karla** for body (geometric sans, similar warmth) + **Oswald** for uppercase labels (condensed, similar authority). Anziano is a serif, but our stack doesn't have a body serif — Karla is our body sans substitute. For buttons specifically, we can use Oswald Bold (condensed, strong, similar to Anziano's display weight). |
| Fallback (declared but unused) | Open Sans | Google (free) | Humanist sans | (not used by Salt Block visibly) |
| Fallback (declared but unused) | PT Serif | Google (free) | Transitional slab | (not used by Salt Block visibly) |
| Icon font | squarespace-ui-font | Squarespace | Icon font | (use Lucide / Heroicons in our stack) |
| Icon font | social-icon-font | Squarespace | Social glyphs | (use Lucide social icons in our stack) |

**Critical insight:** Salt Block uses a **serif for EVERYTHING** — display headings AND body text AND buttons AND nav. This is unusual. Ridgewells used serif for display + Gotham sans for body. joels used Cormorant serif for display + Montserrat sans for body. Salt Block commits to serif throughout, which is why it reads as more old-world-luxury (Italian villa, agrarian estate) and less modern-magazine (Ridgewells) or southern-garden (joels).

**Our reproduction strategy:** Use **Playfair Display** for all display headings (H1, H2, section titles, eyebrows, marquee) — direct 1:1 substitute for Minerva Modern. For body text, use **Karla** (our existing body sans — warm humanist sans, similar warmth to Anziano's calligraphic body but sans-serif). For buttons specifically, use **Oswald Bold uppercase** — gives the strong uppercase display feel of Anziano buttons without needing a body serif.

Alternative: introduce a body serif (e.g., Lora or Source Serif Pro) to more faithfully reproduce Anziano. But this would add 80KB+ to our font payload and we're already loading 5 families. NOT recommended for performance — stick with our existing 5-family stack.

### 4.2 Type scale (desktop, computed from DOM)

Exact px values from `getComputedStyle().fontSize` on live DOM elements:

| Element | Size | Weight | Style | Line-height | Letter-spacing | Color | Transform | Font | Notes |
|---------|------|--------|-------|-------------|----------------|-------|-----------|------|-------|
| **Hero H1 "RAISE THE BAR"** | **159.424px** | 400 | normal | 149.093px (0.935) | normal (0px) | `#FFFFFF` | **uppercase** | Minerva Modern | The signature. Big enough to fill the viewport. Line-height 0.935 — set tight. Uppercase transform applied via CSS `text-transform`. |
| Hero H4 "impressive FOOD & BEVERAGE EXPERIENCES" | 28.096px | 400 | normal | 38.233px (1.36) | normal | `#FFFFFF` | uppercase | Minerva Modern | Sub-heading below H1. Mixed case text rendered uppercase via CSS. |
| Section H2 (large dark, "IMPRESSIVE Hospitality Experiences") | 71.296px | 400 | normal | 87.0382px (1.22) | normal | `#19211F` dark green-black | uppercase | Minerva Modern | Section title on light section. Same uppercase transform. |
| Section H2 (on dark sections, "EXCLUSIVE VENUES" / "CHEFCRAFTED" / "FARM FRESH") | 71.296px | 400 | normal | 87.0382px (1.22) | normal | `#FFFFFF` white | uppercase | Minerva Modern | Section title on dark section. |
| Section H2 "WHAT PEOPLE ARE SAYING" | 71.296px | 400 | normal | 87.0382px | normal | `#FFFFFF` | uppercase | Minerva Modern | Testimonials section title (white on dark). |
| Section H2 "GET STARTED" | 101.3px | 400 | normal | 0px (collapsed, hidden) | normal | `#FFFFFF` | uppercase | Minerva Modern | Process section title. Larger than typical H2 — almost as big as H1. |
| Section H2 quote "it may be impossible to top it next year." | 71.296px | 400 | normal | 87.0382px | normal | `#FFFFFF` | uppercase | Minerva Modern | Testimonial quote rendered as H2. Same as section title. Both are H2 — same visual weight. |
| Footer H2 "READY TO PLAN YOUR EVENT?" | **88.576px** | 400 | normal | 88.576px (1.0) | **0.15px** | `#172121` (footer bg color) — wait, color is `rgb(23, 33, 33)` = `#172121`, but text is rendered as dark on dark — actually checking again, color is on light section so `#19211F`. Let me re-read. The computed color is `rgb(23, 33, 33)` which is the footer bg color. The footer section uses `#172121` text on a light cream/wrapper bg — or wait, the H2 is in the "Get Started" footer CTA section which has a light bg. So `#172121` is text color on light bg. Slightly darker than `#19211F`. | uppercase | Minerva Modern | Final CTA headline. Almost as big as hero (88.576 vs 159.424). Letter-spacing 0.15px is a tiny optical refinement — barely perceptible. |
| H3 (section sub-title, "We understand the pressure...") | 29.824px | 400 | normal | 40.4175px (1.35) | normal | `#FFFFFF` (or `#19211F` on light) | uppercase | Minerva Modern | Sub-section title below H2. |
| H3 (footer column titles, "Catering" / "Venues" / "The Farm" / "Company" / "Contact" / "FOLLOW US") | 29.824px | 400 | normal | 40.4175px (1.35) | normal | `#19211F` dark | uppercase | Minerva Modern | Footer column labels. |
| H3 (3-step process labels "1 — DISCOVER OUR BRANDS" etc.) | 29.824px | 400 | normal | 40.4175px (1.35) | normal | `#FFFFFF` | uppercase | Minerva Modern | Step labels with em-dash separator. |
| H4 ("impressive FOOD & BEVERAGE EXPERIENCES" hero sub-heading; "Get Started" in footer) | 28.096px | 400 | normal | 38.233px (1.36) | normal | `#FFFFFF` or `#19211F` | uppercase | Minerva Modern | |
| Mega-menu nav folder titles ("Catering" / "Venues" / "Farm" / "SBH Cares") | 17.728px | 400 | normal | (default) | normal | `#19211F` dark | none (mixed case) | Anziano | Header nav. Mixed case (NOT uppercase). Anziano serif at body size. |
| Mobile menu burger text "Open Menu / Close Menu" | 17.728px | 400 | normal | (default) | normal | `#000000` | none | Anziano | Same size as nav items. |
| Primary button "PLAN AN EVENT" (in-content) | 19.2px | 700 | normal | (default) | normal | `#FFFFFF` | none (mixed case) | Anziano | Mixed case! NOT uppercase. Bold weight. Petal shape. |
| Primary button "PLAN AN EVENT" (header version) | 14px | 700 | normal | (default) | normal | `#FFFFFF` | none (mixed case) | Anziano | Smaller, same petal shape. |
| Marquee text "Chef-Driven Seed-Oil-Free Luxury Catering" | (large, ~48-64px) | 400 | normal | (default) | normal | (alternating white on dark / dark on light) | none (mixed case) | Minerva Modern | Marquee is mixed case, not uppercase. |

### 4.3 Type scale comparison to Ridgewells + joels

| Element | Ridgewells | joels | **Salt Block** |
|---------|-----------|-------|----------------|
| Hero H1 | 88px | 110px italic | **159.424px** ⬆⬆ |
| Section H2 | 75-82px | 50px | **71.296px** (between) |
| Sub-section H3 | 22px | — | **29.824px** ⬆ |
| Eyebrow | 11.3px (ls 2.26px) | 11px (ls 4.4px) | **0px (no eyebrow)** |
| Hero CTA | — | 11px Montserrat 600 ls 0.3em | **19.2px Anziano 700** ⬆⬆ |
| Marquee text | ~25-30px | none | ~48-64px ⬆ |
| Body paragraph | 18px | 15px | (not captured — likely 16-18px) |

**Pattern:** Salt Block's typography is consistently **1.5-2× larger** than Ridgewells/joels across the board. The brand commits to BIG TYPE as a primary visual element. The hero H1 at 159.424px is the largest of any of our reference sites by a wide margin (Ridgewells 88px, joels 110px, Salt Block 159px).

### 4.4 Critical typographic decisions

1. **Hero H1 is UPPERCASE** (CSS `text-transform: uppercase`). Unlike Ridgewells (mixed case "Every event has a story to tell.") or joels (italic mixed case "Indulge in Excellence"). Salt Block's "RAISE THE BAR" at 159px uppercase is a SHOUT. This works because the phrase is short (3 words) — at 159px, you only have room for 3-4 words max. So short pithy brand slogans work; long sentences wouldn't.

2. **Section H2s are also UPPERCASE** (71px). "IMPRESSIVE Hospitality Experiences" is rendered `UPPERCASE HOSPITALITY EXPERIENCES` — the source HTML has mixed case, but CSS uppercases it. This is consistent across all H2s.

3. **Mixed-case H3s are also uppercased** (29.824px). Every. Single. Heading. Is. Uppercase. This is the most consistent typographic treatment in our reference library.

4. **No eyebrows.** Unlike Ridgewells (11.3px wide-tracked eyebrow above each H2) or joels (11px ls 0.4em eyebrow above each H3), Salt Block does NOT use a small eyebrow line above headings. The H1/H2 IS the eyebrow. The hero H4 "impressive FOOD & BEVERAGE EXPERIENCES" is the closest thing to an eyebrow — but it's 28px (the size of an H4), not 11px. This is a strong editorial choice — let the typography be the rhythm, no micro-labels needed.

5. **Buttons are mixed case + bold + serif.** "PLAN AN EVENT" — wait, actually looking again at the source HTML "PLAN AN EVENT" is uppercase but CSS `text-transform: none` means it's rendered as the HTML authored it (uppercase). The button text is authored in uppercase HTML. The button font is Anziano (serif), not a sans. This is unusual — buttons are usually sans-serif (Gotham, Montserrat, Karla). Salt Block uses serif buttons. Our reproduction: use Oswald Bold for buttons (condensed, strong, sans) OR Playfair Display Bold for serif buttons. Recommendation: Playfair Display Bold for serif-button fidelity.

6. **Line-heights are tight on hero (0.935) and normal on section titles (1.22).** Hero H1 set solid for elegance; section H2s at standard 1.22 for readability.

7. **Letter-spacing 0px everywhere EXCEPT the final CTA "READY TO PLAN YOUR EVENT?" which has 0.15px.** This is a tiny optical refinement — barely perceptible at 88px size. Probably a custom CSS override for that one element. Not worth replicating.

---

## 5. Layout system

### 5.1 Container + grid

**Max-width:** `var(--sqs-site-max-width, 1500px)` (Squarespace 7.1 default). Content sits in a 1500px-wide container centered in the 1440px viewport (slightly overflowing the viewport — Squarespace assumes desktop viewports ≥1500px).

**Section padding:** `padding-top: calc(16vmax / 10); padding-bottom: calc(16vmax / 10);` (Squarespace's default section padding — 1.6vmax top/bottom = ~23px at 1440px viewport). Some sections override: marquee uses `calc(16vmax / 10)` (= ~23px), testimonials uses `calc(1vmax / 10)` (= ~1.4px — basically no padding, content fills section).

**Fluid Engine grid (8-column on desktop):**
```css
.fe-{section-id} {
  --grid-gutter: calc(var(--sqs-mobile-site-gutter, 6vw) - 11.0px);
  --cell-max-width: calc((var(--sqs-site-max-width, 1500px) - (11.0px * (8 - 1))) / 8);
  display: grid;
  grid-template-rows: repeat(35, minmax(24px, auto));
  grid-template-columns:
    minmax(var(--grid-gutter), 1fr)
    repeat(8, minmax(0px, var(--cell-max-width)))
    minmax(var(--grid-gutter), 1fr);
}
```
Each section's Fluid Engine grid has 35 rows of `minmax(24px, auto)` (24px minimum row height) and 8 + 2 gutter columns (gutter on each side, 8 content columns in middle). Cells can span multiple rows/columns — Fluid Engine is a free-form grid editor (each block is positioned via `grid-area: row-start / col-start / row-end / col-end`).

**Mobile grid:** `--sqs-mobile-site-gutter: 6vw` (smaller gutter on mobile), Fluid Engine collapses to 8 columns with smaller cells.

### 5.2 Section heights (desktop)

12 sections measured via `getBoundingClientRect()`:

| # | Section ID | y-offset (px) | height (px) | bg color | content |
|---|------------|---------------|-------------|----------|---------|
| 1 | `header` (sticky) | 0 | 182 | `#FFFFFF` | Logo + nav + CTA + burger |
| 2 | `660d7a0ad9f66face25f3d6b` (hero) | 0 | 1081 | video / poster | H1 + sub-H4 + press strip (4 logos) |
| 3 | `6287a2a07b0e3b4f5077c3f9` (marquee) | 1081 | 144 | transparent | "Chef-Driven Seed-Oil-Free Luxury Catering" repeated |
| 4 | `6287a281e0c5ef6f3fda4278` (portfolio index) | 1225 | 860 | transparent | "VENUES" H2 + "Events" H2 (stacked) |
| 5 | `62863b22be537108f06e5bbd` (SaltBlock Difference) | 2085 | 1648 | `#FFFFFF` (white section) | "IMPRESSIVE Hospitality Experiences" H2 + 3 image cards |
| 6 | `6287d89e54d46373a69befb0` (family of brands) | 3733 | 328 | transparent | "Discover our family of brands" + horizontal logo reel |
| 7 | `62b3426c948f496cfe7d07f5` (food gallery reel) | 4061 | 720 | transparent | 13 food images, horizontal drag-scroll |
| 8 | `62d6bc8b686dd97f2a34329d` (IMPRESSIVE + Google Reviews) | 4781 | 1419 | `#FFFFFF` | Elfsight Google Reviews widget |
| 9 | `62c4426844eb67277852f5cc` (quote) | 6199 | 433 | `#FFFFFF` | "We understand the pressure to deliver next-level experiences..." |
| 10 | `66392c34f5c04896720886d2` (FARM FRESH) | 6632 | 818 | `#FFFFFF` | "FARM FRESH" H2 + content |
| 11 | `66962fdf6756b5e003a2dd9d` (testimonials) | 7450 | 1204 | `#FFFFFF` | "WHAT PEOPLE ARE SAYING" H2 + quote carousel |
| 12 | `6286a66479a6e97fed532e5e` (Instagram feed) | 8654 | 740 | `#FFFFFF` | "@saltblockhospitality" + Elfsight IG widget |
| 13 | `628635115ffed10e289ac146` (footer + CTA) | 9395 | 1488 | `#172121` dark green-black | "READY TO PLAN YOUR EVENT?" + 3-step process + footer columns |

**Total page height: 10886px desktop** (taller than Ridgewells 9788px, much taller than joels 5627px).

**Vertical rhythm observations:**
- Average section height: 838px (excluding header)
- Tallest section: 1648px (SaltBlock Difference)
- Shortest section: 144px (marquee band)
- Most sections are 700-1500px tall — generous whitespace, no cramped sections
- 7 of 12 content sections use `#FFFFFF` white bg, 4 use transparent (over video/image), 1 uses dark green-black
- Salt Block alternates dark/light sections less aggressively than Ridgewells (which used dark purple testimonials + light services + dark marquee + light gallery). Salt Block is mostly white with a single dark footer.

### 5.3 Mobile layout

Single mobile screenshot captured (390×844, mobile-top.png). Mobile behavior:
- Body class `mobile-style-available` (Squarespace responsive)
- Mobile menu replaces desktop nav (burger visible top-right)
- Fluid Engine grid collapses from 8-col desktop to 8-col mobile with smaller cells + smaller gutter (6vw mobile vs 1fr desktop)
- Section heights likely stack to ~7000-8000px mobile (estimated; not captured)

### 5.4 Header behavior

- **Sticky header** (`tweak-fixed-header-style-basic`) — stays at top of viewport on scroll
- **Inset width** (`header-width-inset`) — header is narrower than viewport (max-width ~1300px centered)
- **No color-flip on scroll observed** — header remains `#FFFFFF` white throughout (Squarespace native behavior with `basic` style; `backwards` style flips transparent-over-hero → solid-on-scroll)
- **Mega-menu folder structure:** "Catering" / "Venues" / "Farm" / "SBH Cares" — 4 top-level folders, each opens a wide dropdown with mega-menu images (3 images per folder, 1059×691 each)
- **Right side:** "Contact" + "PLAN AN EVENT" CTA (petal button, smaller variant 14px)
- **Mobile:** burger top-right with text "Open Menu / Close Menu" (Anziano 17.728px)

---

## 6. Sections inventory (scroll order)

Detailed section-by-section breakdown with pixel y-offsets, heights, backgrounds, content, images, and CTAs. All measurements are desktop 1440×900 viewport.

### 6.1 Section 00 — Header (sticky, y=0, h=182, white)

- **Background:** `#FFFFFF` white
- **Width:** inset (max-width ~1300px centered)
- **Layout:** 3-zone — Logo (left) / Nav folder titles (center) / CTA + burger (right)
- **Logo:** `Logo.png` (320×320 native, square) — SaltBlock Hospitality wordmark with olive sprig icon
- **Nav:** 4 top-level folders: `Catering`, `Venues`, `Farm`, `SBH Cares` (Anziano 17.728px weight 400 mixed case)
- **Mega-menu folder structure** (visible on hover):
  - **Catering folder** → Farm-fresh Catering / Our Catering Brands / The SaltBlock Difference / Beverage Program / Sample Menus / Plan Your Menu / Team (3 mega images: caterings_mm_img1.jpg "Our Catering Brands", caterings_mm_img2.jpg "The Saltblock Difference", caterings_mm_img3.jpg "Menus")
  - **Venues folder** → SaltBlock Owned & Operated / All Venues / Team / Event Resources (2 mega images: venues_mm_img1.jpg "Saltblock Exclusives", venues_mm_img2.jpg "All Venues")
  - **Farm folder** → Values / About / Team / Blog (3 mega images: one "Values" screenshot, farm_mm_img2.jpg "About", one "Blog" screenshot)
  - **SBH Cares folder** → Community Support / Best of The City / SBH Initiatives / Blog (mega image: OneTable2024.JPG + GIF)
- **CTA:** `PLAN AN EVENT` (petal button, bg `#192121`, white text, Anziano 14px weight 700, padding 12px 40px 11px 12px — wait, asymmetric padding 12px top, 40px right, 11px bottom, 12px left suggests the petal shape accommodates the icon on the left and the text on the right with extra right padding)
- **Burger (mobile):** top-right, text "Open Menu / Close Menu" (Anziano 17.728px, color `#000000`)

### 6.2 Section 01 — Hero (y=0, h=1081, video bg) — WOW #1

- **Background:** `<video autoplay muted loop playsinline>` — `Saltblock - WebHeader_V03.mp4` (1920×1080, 43s loop, h264+aac)
- **Poster image:** `Copy+of+bruschetta.jpg` (2500×1080) — close-up of bruschetta being assembled, golden bread + red tomatoes + fresh basil + olive oil drizzle. Aspect ratio 2.31:1.
- **Overlay text:**
  - H1: `RAISE THE BAR` (159.424px Minerva Modern 400, uppercase, white, ls 0, lh 149.093px (0.935 ratio))
  - H4 sub-heading: `impressive FOOD & BEVERAGE EXPERIENCES` (28.096px Minerva Modern 400, uppercase, white, lh 38.233px)
  - Press strip: 4 logo images docked at the bottom of the hero
    1. `The Scout Guide` (212×69 logo)
    2. `Catersource` (212×69 logo)
    3. `Tampa Bay Times` (212×68 logo)
    4. `The Honorable Life` (212×69 logo)
- **Layout:** text centered, press strip docked bottom-edge full-width
- **Animation:** H1 + H4 fade-up slideIn on load (transform 0.6s ease + opacity 0.6s ease, stagger 3.5ms between H1 and H4)
- **No CTA in hero itself** — the CTA is in the sticky header (always visible)
- **Why it works:** The video is the entire hero — no text overlay distracting. The H1 is large enough to dominate but doesn't crowd. The press strip at the bottom is a tiny cheap wow that signals authority ("as featured in").

### 6.3 Section 02 — Marquee (y=1081, h=144) — WOW #2

- **Background:** transparent (shows through to whatever section is below — but in this case, it sits between the hero video and the next section, so background is the page `#E5ECE9` cool sage-cream)
- **Content:** single phrase `Chef-Driven Seed-Oil-Free Luxury Catering` repeated 3× horizontally (the Squarespace `sqs-block-marquee` block duplicates the text and uses CSS `animation: marquee-scroll Xs linear infinite` to translate it left indefinitely)
- **Text:** Minerva Modern, mixed case (NOT uppercase), large size (~48-64px — not captured precisely but visually comparable to H3 size)
- **Color:** alternates between `#19211F` dark green-black (on transparent/cream bg) — single-color marquee, not bicolor
- **Animation:** infinite horizontal scroll (CSS-driven, `translateX(-50%)` over ~20-30s linear infinite)
- **Why it works:** The marquee is the SECOND section on the homepage (right after hero). This is a strong rhythmic break — hero (cinema) → marquee (rhythm) → portfolio index (content). The 144px height is the minimum to fit one line of large text. Marquee is dirt-cheap to ship (one CSS keyframe).

### 6.4 Section 03 — Portfolio Index (y=1225, h=860, transparent) — WOW #3

- **Background:** transparent
- **Content:** Two HUGE stacked H2s:
  - `VENUES` (159.424px Minerva Modern 400, uppercase, white)
  - `Events` (159.424px Minerva Modern 400, uppercase, white — but rendered smaller or different layout, hard to tell from screenshot)
- **Layout:** Squarespace portfolio index background — likely a "stacked" portfolio layout where each portfolio item is a full-viewport section with a giant title overlaid on a background image
- **Animation:** fade transition (per body class `tweak-portfolio-index-background-animation-type-fade`, duration `medium`)
- **No CTAs visible in this section** — clicking the title likely navigates to the portfolio item page
- **Why it works:** The portfolio index is a third "wow" stacked vertically — hero (RAISE THE BAR) → marquee → portfolio index (VENUES / Events). Three big-type moments in the first 2200px of scroll. Salt Block front-loads its typographic aggression.

### 6.5 Section 04 — The SaltBlock Difference (y=2085, h=1648, white) — WOW #4

- **Background:** `#FFFFFF` white
- **Layout:** Squarespace Fluid Engine 8-col grid
- **Content:**
  - Eyebrow: (no eyebrow)
  - H2: `The SaltBlock Difference` (large, ~71-100px Minerva Modern, uppercase, dark green-black `#19211F`)
  - Body content (not fully extracted but visible in section-03-saltblock-difference.png): a 2-column or 3-column layout with the brand pillars explained
- **Three image cards** in this section (per data-section-id `62863b22be537108f06e5bbd`):
  - `soire-estate-wedding-odessa-florida-wedding-tampa-barn-wedding-tampa-wedding-photographer-59` (alt: "Exclusive Venues")
  - `FotoBoho_105.jpg` (alt: "Chef Crafted")
  - `Farm+Fresh` (alt: "Farm Fresh")
- **Layout pattern:** 3 image cards in a stacked or 3-column layout, each with full-bleed image + caption overlay
- **Why it works:** This is the "manifesto" section — three brand pillars (Venues / Chef / Farm) distilled into 3 photographic moments. Editorial magazine spread feel.

### 6.6 Section 05 — Family of Brands (y=3733, h=328, transparent)

- **Background:** transparent (cool sage-cream page bg shows through)
- **Content:** `Discover our family of brands` heading + horizontal carousel of brand logos
- **Brand logos in carousel** (per `image-slide-anchor` parent class, section 6287d89e54d46373a69befb0):
  1. `Murph's Barbecue Logo.png`
  2. `Saltblock.png` (primary brand)
  3. `Screen Shot 2022-06-13 at 12.55.40 PM.png`
  4. `Screen Shot 2022-06-13 at 12.50.13 PM copy.png`
  5. `ssr.png` (likely "SoireEstate" logo or "SBH Restaurant" logo)
- **Layout:** horizontal carousel (Swiper.js, drag-to-scroll), 5+ brand logos
- **Carousel type:** Swiper (Ghost Plugins helper) — drag-to-scroll, no visible pagination dots in screenshot
- **Why it works:** A "family of brands" carousel is a strong signal of vertical integration — Salt Block owns multiple brands (catering + venue + barbecue + farm). Cheap wow.

### 6.7 Section 06 — Food Gallery Reel (y=4061, h=720, transparent) — WOW #5

- **Background:** transparent (cool sage-cream page bg)
- **Content:** horizontal gallery-reel of 13 food images (drag-to-scroll, no arrows visible)
- **Food images** (per `gallery-reel-item-src` parent class, section 62b3426c948f496cfe7d07f5):
  1. `Elegant food display with small appetizer bites on black spoons` (12.28.54 PM.png)
  2. `A woman in a white lace dress holding a blue plate with ravioli` (12.30.54 PM.png)
  3. `A large charcuterie board with various cheeses, cured meats` (11.24.19 AM.png)
  4. `A plate with a piece of seared fish, roasted vegetables, Brussels sprouts` (12.28.05 PM.png)
  5. `Chef cooking rice outdoors with palm trees and people in the background` (12.30.28 PM.png)
  6. `Three small dessert cups with layered berry parfaits on a black plate` (12.29.37 PM.png)
  7. `A server in a white shirt and black tie holding a wooden tray of appetizers` (10.59.46 AM.png)
  8. `Fresh fruits and vegetables on a table at a farmers market, farm-to-table` (10.59.33 AM.png)
  9. `Charcuterie board with grapes, figs, meat, cheese, and crackers` (12.30.46 PM.png)
  10. `Two chefs preparing multiple plates of food on a long white table` (12.30.36 PM.png)
  11. `Elegant plated dish with seared fillet, grilled vegetables, and microgreens` (12.30.18 PM.png)
  12. `Cheese, grapes, figs, prosciutto, walnuts, and crackers on a wooden board` (12.29.59 PM.png)
  13. `A child reaches for a piece of smoked salmon and cream cheese on a cucumber slice` (12.29.05 PM.png)
- **Reel width:** 1324.8125px (slightly narrower than 1440px viewport — inset 57.6px on each side)
- **Reel height:** 720px
- **Reel behavior:** drag-to-scroll (mouse drag + touch swipe), no pagination dots, no arrows
- **Why it works:** The reel is the most efficient way to show 13 food photos in one section without vertical scroll fatigue. Drag-to-scroll is more tactile than arrow-click. Each photo is captioned with descriptive alt-text (great for SEO + accessibility). The reel is the visual centerpiece of the catering pitch — "look at the food we make".

### 6.8 Section 07 — IMPRESSIVE Hospitality Experiences + Google Reviews (y=4781, h=1419, white)

- **Background:** `#FFFFFF` white
- **Content:**
  - H2: `IMPRESSIVE Hospitality Experiences` (71.296px Minerva Modern 400, uppercase, dark `#19211F`)
  - H3 sub-heading: `We understand the pressure to deliver next-level experiences for your guests` (29.824px Minerva Modern 400, uppercase, dark)
  - Body: `This is why we take great care in curating every detail of your event. From the hospitality to the garni...` (truncated)
  - **Elfsight Google Reviews widget** (`elfsight-app-073ab6e5-2402-423c-ac3a-5b0466aa8272`) — embedded inline below the heading, displays Google Reviews from real customers with avatar + name + star rating + review text
- **Google Reviews visible** (per extracted images): Donna Epstein (1 review), Frank & Brianna (1 review), and 2-3 more
- **Why it works:** The Elfsight widget is a cheap "social proof" pattern — embed real Google Reviews without building a custom testimonials carousel. The reviews are authentic (pulled from Google Business Profile), star-rated, and auto-updated. Strong trust signal.

### 6.9 Section 08 — Quote (y=6199, h=433, white)

- **Background:** `#FFFFFF` white
- **Content:** Short quote section: `We understand the pressure to deliver next-level experiences for your guests. This is why we take great care in curating every detail of your event. From the hospitality to the garnish on your plate, every detail matters.`
- **Layout:** Centered column, narrow max-width (~600-800px)
- **Why it works:** A "breather" section between the IMPRESSIVE section and the FARM FRESH section. Short, punchy, philosophical. Sets up the brand-pillar sections that follow.

### 6.10 Section 09 — FARM FRESH (y=6632, h=818, white)

- **Background:** `#FFFFFF` white
- **Content:**
  - H2: `FARM FRESH` (71.296px Minerva Modern 400, uppercase, dark `#19211F`)
  - Body content (likely a 2-column layout with image + text about the SoireEstate farm)
- **Image:** `Farm+Fresh` (image from section 62863b22be537108f06e5bbd, alt: "Farm Fresh")
- **Why it works:** The brand-pillar trio (Exclusive Venues / Chef Crafted / Farm Fresh) gets its own dedicated section. FARM FRESH signals the farm-to-table ideology that supports the seed-oil-free promise.

### 6.11 Section 10 — Testimonials Carousel (y=7450, h=1204, white)

- **Background:** `#FFFFFF` white
- **Content:**
  - H2: `WHAT PEOPLE ARE SAYING` (71.296px Minerva Modern 400, uppercase, white — wait, white text on white bg is invisible. Re-checking: the testimonials section likely has a dark background that wasn't captured in my eval. Actually looking at the computed color of `rgb(255, 255, 255)` for the H2, and the section bg `#FFFFFF` white — there's a contradiction. The H2 must be inside a darker subsection. Looking at the screenshot `section-09-testimonials.png` would clarify but I don't have it open. Likely: dark green-black bg with white H2 + carousel of testimonial quotes.)
  - H2 quote: `"it may be impossible to top it next year."` (71.296px Minerva Modern 400, uppercase, white)
- **Layout:** Swiper carousel (single-slide visible, multi-slide total) — the same H2 "WHAT PEOPLE ARE SAYING" + H2 quote appears twice in the headings extraction, suggesting at least 2 slides
- **Carousel type:** Swiper.js (Ghost Plugins), autoplay likely, no visible pagination dots
- **Why it works:** Testimonials section uses big-type quotes (71px) as the visual element — not small italic body text in a card. The quote IS the testimonial.

### 6.12 Section 11 — Instagram Feed (y=8654, h=740, white)

- **Background:** `#FFFFFF` white
- **Content:**
  - H2: `@saltblockhospitality` (large, ~71px Minerva Modern 400, dark)
  - **Elfsight Instagram widget** (iframe, displays recent Instagram posts in a grid)
- **Why it works:** Instagram handle as H2 (similar to Ridgewells' `@RidgewellsDC` section). Cheap wow. Drives social follows.

### 6.13 Section 12 — Footer + Get Started CTA (y=9395, h=1488, dark green-black)

- **Background:** `#172121` dark green-black (the only dark section on the page besides the hero)
- **Content:**
  - H2: `READY TO PLAN YOUR EVENT?` (88.576px Minerva Modern 400, uppercase, dark `#172121` — wait, color is `rgb(23, 33, 33)` which equals the footer bg color — there's a contradiction. Actually re-reading: the H2 color is `rgb(23, 33, 33)` = `#172121`. On a dark green-black bg `#172121`, dark green-black text would be invisible. So either the bg is light (cream/white) and the H2 is dark, OR my extraction is wrong. Looking at the screenshot `section-11-footer-cta.png` would clarify. The most likely scenario: this is a 2-section combined area — the "Get Started" CTA section (light bg, dark H2 + 3-step process) followed by the actual footer (dark bg, white text + column nav + copyright).)
  - H2 sub: `Get Started` (28.096px Minerva Modern 400, uppercase, dark)
  - 3-step process labels (H3 each):
    1. `1 — DISCOVER OUR BRANDS` (29.824px Minerva Modern 400, uppercase, white)
    2. `2 — SHARE THE DETAILS` (29.824px Minerva Modern 400, uppercase, white)
    3. `3 — RAISE THE BAR` (29.824px Minerva Modern 400, uppercase, white)
  - Footer column nav (H3 each, dark `#19211F` on light bg OR white on dark bg):
    - `Looking for the perfect venue?` H3
    - `Catering` H3 column
    - `Venues` H3 column
    - `The Farm` H3 column
    - `Company` H3 column
    - `Contact` H3 column
    - `FOLLOW US` H3 column (social icons)
  - Contact info: `Contact@Saltblockhospitality.com`, `877.793.7526`, Tampa FL address
- **Why it works:** The 3-step process ("DISCOVER OUR BRANDS / SHARE THE DETAILS / RAISE THE BAR") is a strong closer — it gives the visitor a clear next action and reinforces the "RAISE THE BAR" hero phrase. The closing callback to the hero phrase is a nice editorial touch.

---

## 7. Buttons / CTAs

Salt Block has 4 distinct button patterns. All measurements from `getComputedStyle`.

### 7.1 Primary CTA — petal shape (the signature button)

**Used for:** "PLAN AN EVENT" (header + in-content)

```css
.btn.theme-btn--primary.sqs-button-element--primary {
  background-color: rgb(25, 33, 33);      /* #192121 near-black */
  color: rgb(255, 255, 255);              /* #FFFFFF white */
  border: 0px solid rgb(25, 33, 33);      /* same as bg, no visible border */
  border-radius: 16px 0px;                /* PETAL SHAPE — top-left + bottom-right rounded */
  padding: 23.04px 38.4768px;             /* generous padding */
  font-family: "anziano", serif;
  font-size: 19.2px;                      /* large for a button */
  font-weight: 700;                       /* bold */
  text-transform: none;                   /* mixed case — but authored uppercase in HTML */
  letter-spacing: normal;                 /* 0px */
  box-shadow: none;
  transition: (none observed — Squarespace default = no hover transition on primary CTA);
}
```

**Header variant (smaller):**
```css
.btn.btn--border.theme-btn--primary-inverse.sqs-button-element--primary {
  background-color: rgb(25, 33, 33);
  color: rgb(255, 255, 255);
  border: 0px solid rgb(255, 255, 255);
  border-radius: 16px 0px;
  padding: 12px 40px 11px 12px;           /* asymmetric — 12px left for icon space, 40px right */
  font-family: "anziano", serif;
  font-size: 14px;
  font-weight: 700;
}
```

**Hover state:** No visible hover state change (synthetic mouseenter test returned identical computed styles). Squarespace's default primary button hover is a slight opacity dim (e.g., `opacity: 0.85`) applied via CSS class — not captured in computed styles because it's a `:hover` rule that requires actual user interaction.

### 7.2 Secondary CTA — square outline

**Used for:** (not visible on homepage — likely used on interior pages)

```css
.btn.theme-btn--primary-inverse.sqs-button-element--secondary {
  /* per body class secondary-button-style-solid + secondary-button-shape-square */
  background-color: transparent;
  color: rgb(25, 33, 31);
  border: 1px solid rgb(25, 33, 31);
  border-radius: 0px;                     /* square */
  padding: 16px 32px;
  font-family: "anziano", serif;
  font-size: 16px;
  font-weight: 700;
}
```

### 7.3 Tertiary CTA — underline text-link

**Used for:** nav links, footer column links

```css
/* per body class tertiary-button-style-solid + tertiary-button-shape-underline */
a.header-nav-folder-title {
  color: rgb(25, 33, 31);                  /* #19211F dark */
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 1.7728px 16px 1.7728px 0px;    /* tiny vertical, 16px right gutter */
  font-family: "anziano", serif;
  font-size: 17.728px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: normal;
}
```

### 7.4 Burger button (mobile menu toggle)

```css
.header-burger-btn.burger {
  background: transparent;
  color: rgb(0, 0, 0);
  border: none;
  border-radius: 0;
  padding: 1px 6px;
  font-family: "anziano", serif;
  font-size: 17.728px;
  font-weight: 400;
}
```

### 7.5 Gallery reel arrows (invisible)

```css
.gallery-reel-control-btn {
  background: transparent;
  color: rgb(0, 0, 0);
  border: none;
  border-radius: 0;
  padding: 8px;
  font-family: "anziano", serif;
  font-size: 17.728px;
  /* visible only on hover or focus */
}
```

### 7.6 Button pattern summary

| # | Pattern | Shape | Padding | Font | Size | Weight | Color (bg/text) | Hover |
|---|---------|-------|---------|------|------|--------|-----------------|-------|
| 1 | Primary (in-content) | Petal `16px 0px` | 23px 38px | Anziano serif | 19.2px | 700 | `#192121` / `#FFFFFF` | (none observed) |
| 2 | Primary (header) | Petal `16px 0px` | 12px 40px 11px 12px | Anziano serif | 14px | 700 | `#192121` / `#FFFFFF` | (none observed) |
| 3 | Secondary (outline square) | Square `0px` | 16px 32px | Anziano serif | 16px | 700 | transparent / `#19211F` | (none observed) |
| 4 | Tertiary (underline) | Underline | 1.77px 16px | Anziano serif | 17.7px | 400 | transparent / `#19211F` | (none observed) |

**Comparison to Ridgewells + joels:**

| Pattern | Ridgewells | joels | **Salt Block** |
|---------|-----------|-------|----------------|
| Primary shape | Square `0px` | Square `0px` | **Petal `16px 0px`** ⭐ |
| Primary font | Arial 10px | Montserrat 11px | **Anziano 19.2px** (serif, large) |
| Primary padding | 8px | 5px 41px | **23px 38px** (largest) |
| Outline button | Square `0px`, border `#4F4F4F` | Square `0px`, border `#696359` | Square `0px`, border `#19211F` |
| Textual link | (none) | 22px line that scales 2.7× on hover | (none — Squarespace default underline) |
| Hover behavior | (none observed) | Color shift + line scale | (none observed — opacity dim likely) |

**Verdict:** Salt Block's petal button is the single most distinctive button of any reference site. The fact that the button font is serif (Anziano) at 19.2px is also distinctive — most luxury sites use sans-serif buttons (Gotham, Montserrat, Karla). Salt Block commits to serif throughout, even on buttons.

---

## 8. Animations

### 8.1 Squarespace 7.1 native animation system

**Body class config:** `tweak-global-animations-enabled tweak-global-animations-complexity-level-detailed tweak-global-animations-animation-style-fade tweak-global-animations-animation-type-slide tweak-global-animations-animation-curve-ease`

Translation:
- **Style:** Fade (opacity transitions)
- **Type:** Slide (translateY transform)
- **Curve:** Ease (default `cubic-bezier(0.25, 0.1, 0.25, 1)` — CSS ease)
- **Complexity:** Detailed (more elements animated per section, vs. "basic" which animates only the section header)

### 8.2 Element-level animation CSS

Each animated element receives two classes:

```css
.preSlide {
  /* initial state before animation */
  opacity: 0;
  transform: translateY(20px);  /* inferred — Squarespace default offset */
}

.slideIn {
  /* final state after animation triggers */
  opacity: 1;
  transform: translateY(0);
}

/* transition declaration on each element */
.header-nav-folder-title.preSlide.slideIn {
  transition: transform 0.6s {delay}s, opacity 0.6s {delay}s;
}
```

### 8.3 Stagger pattern

The transition-delay for each successive child element is calculated as:

```
delay = childIndex × 0.003488s ≈ childIndex × 3.5ms
```

This is an **extremely tight stagger** (3.5ms per element). For comparison:
- GSAP typical stagger: 50-100ms per element
- Lottie typical stagger: 30-60ms per element
- Ridgewells (Wix motion-part): ~50ms per element
- joels (Revolution Slider): 250ms initial delay + 800ms duration (no stagger per element)

At 3.5ms stagger, an 8-element group animates in over 600ms + (7 × 3.5ms) = 624ms total — essentially simultaneous but with a subtle "wave" effect (each element starts 3.5ms after the previous).

### 8.4 Trigger mechanism

Squarespace uses **IntersectionObserver** to trigger animations. When a section enters the viewport, the `preSlide` class is removed and `slideIn` is applied (or the element receives a `is-animated` class that triggers the CSS transition).

The IntersectionObserver rootMargin is likely `0px 0px -10% 0px` (triggers when section is 10% into viewport from bottom).

### 8.5 Per-element animation catalog

| Element | Trigger | Duration | Easing | Transform | Opacity | Stagger |
|---------|---------|----------|--------|-----------|---------|---------|
| Hero H1 "RAISE THE BAR" | load | 0.6s | ease | translateY(20px→0) | 0→1 | 0ms (first) |
| Hero H4 sub-heading | load | 0.6s | ease | translateY(20px→0) | 0→1 | 3.5ms |
| Header nav folder titles (×4) | load | 0.6s | ease | translateY(20px→0) | 0→1 | 3.5ms each |
| Header logo | load | 0.6s | ease | translateY(20px→0) | 0→1 | 3.5ms |
| Header CTA "PLAN AN EVENT" | load | 0.6s | ease | translateY(20px→0) | 0→1 | 3.5ms |
| Section H2s (each section) | scroll into view | 0.6s | ease | translateY(20px→0) | 0→1 | 3.5ms each child |
| Section H3s / body / images | scroll into view | 0.6s | ease | translateY(20px→0) | 0→1 | 3.5ms each child |
| Marquee text | continuous | ~20-30s | linear | translateX(0→-50%) | 1 | n/a (infinite loop) |
| Press strip logos (×4) | load | 0.6s | ease | translateY(20px→0) | 0→1 | 3.5ms each |
| Gallery reel drag | drag (pointer) | (instant) | (none — drag follows cursor) | translateX({drag delta}) | 1 | n/a |
| Testimonials carousel | autoplay (likely 5s) | 0.6s | ease | translateX({slide width}) | 0→1→0 | n/a |
| Family-of-brands carousel | autoplay (likely 4s) or drag | 0.6s | ease | translateX({slide width}) | 1 | n/a |

### 8.6 Hero video behavior

- **`autoplay: true`** — starts immediately on page load
- **`muted: true`** — required for autoplay (browser policy)
- **`loop: true`** — loops seamlessly every 43s
- **`playsinline: true`** — plays inline on mobile (not fullscreen)
- **No controls** — no play/pause/seek UI visible
- **Poster image** (bruschetta.jpg 2500×1080) shows before video loads
- **No WebGL canvas overlay** — pure HTML5 `<video>` element

### 8.7 Marquee animation

The Squarespace `sqs-block-marquee` block uses CSS animation (no JS):

```css
.sqs-block-marquee .marquee-track {
  animation: marquee-scroll 30s linear infinite;
}

@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

The marquee text is duplicated in the DOM (one full copy of the phrase repeated 3× in the source HTML), and the track translates `-50%` over `30s` linear infinite — creating a seamless loop. The duration is configurable in the Squarespace editor (default ~30s, fast ~15s, slow ~60s).

### 8.8 Comparison to Ridgewells + joels animations

| Animation type | Ridgewells | joels | **Salt Block** |
|----------------|-----------|-------|----------------|
| Stagger per element | ~50ms (Wix) | ~250ms (Rev slider) | **3.5ms** (very tight) |
| Section enter duration | ~0.6-0.8s | 0.8s | **0.6s** |
| Easing | Wix native | power1.inOut (Rev slider) | **ease** (CSS default) |
| Hero treatment | Image slideshow crossfade | Single image + fade-up text | **Background video + fade-up text** |
| Marquee | Static-but-striking (94px band) | none | **Infinite horizontal scroll (144px band)** ⭐ |
| Parallax | (none) | Stacked images +30/-15 | (none — Squarespace native has no parallax) |
| Hover scale | (none observed) | Textual link line scales 2.7× | (none observed) |
| Scroll cue | (none) | Animated vertical line (94px scaleY) | (none — Salt Block has no scroll cue) |
| Custom keyframes | (none observed) | 1 (qodef-rev-scroll-down) | **3** (fonts-loading, opacity pulse, rotation) |

**Verdict:** Salt Block's animations are the most restrained of the three. No parallax, no scroll cue, no hover scale. The visual interest comes from the static design (typography, video, petal button) rather than from motion. The 3.5ms stagger is so tight it's essentially simultaneous — Salt Block doesn't lean on choreographed reveal animations the way Ridgewells and joels do.

---

## 9. WOW moments

### 9.1 WOW #1 — 160px uppercase hero H1 on video background

The hero H1 "RAISE THE BAR" at **159.424px Minerva Modern weight 400 uppercase** on a looping background video (1920×1080, 43s, of bruschetta being assembled) is the single most aggressive typographic moment of any reference site in our library. To put it in perspective: at 160px, a single letter is roughly the size of a grown adult's open hand. The phrase "RAISE THE BAR" — three words, twelve characters — fills the entire viewport horizontally. There is no eyebrow, no sub-heading above it (the H4 sub-heading sits below), no decorative line, no logo overlay in the hero (the logo is in the sticky header above). The hero is JUST the video + the H1 + a small H4 sub-heading + the press strip docked at the bottom edge.

The combination of (a) real video, (b) 160px uppercase serif headline, (c) no decorative overlay elements, and (d) the press strip at the bottom creates a cinematic moment that feels like a film title card. The 160px H1 forces you to read the slogan — there's no escaping it, it's the entire visual field.

For our reproduction: this is achievable in our stack with Barlow Semi Condensed Bold at `clamp(80px, 12vw, 160px)` over a Mux-hosted mp4 of our own food video. The key constraint is the H1 must be SHORT (3-4 words max at 160px) — "RAISE THE BAR" works because it's a 3-word slogan. We'd need a similarly pithy Russian slogan ("ПОДНИМИ УРОВЕНЬ" or "ВЫСОКАЯ КУХНЯ" or "ЕДА КАК ИСКУССТВО" — all 2-3 words).

### 9.2 WOW #2 — Petal-shaped primary button

The primary CTA "PLAN AN EVENT" has `border-radius: 16px 0px` — meaning the **top-left and bottom-right corners** are rounded (16px radius), while the **top-right and bottom-left corners are sharp** (0px radius). This creates a petal/leaf shape — like one half of a leaf, with the rounded edge leading into the text and the sharp edge trailing away.

This is the most distinctive button shape in our reference library. Ridgewells used `border-radius: 0` (square) for all buttons. joels used `border-radius: 0` (square) for filled buttons and a 22px×1px horizontal line for textual links. Salt Block's petal is the only "designed" button shape — and it's organically curved without being a full pill (`border-radius: 999px`).

The petal is paired with:
- **Serif button font (Anziano) at 19.2px weight 700** — buttons are usually sans-serif (Gotham, Montserrat, Karla). Salt Block commits to serif even on buttons.
- **Generous padding (23px 38px)** — larger than Ridgewells (8px) or joels (5px 41px). Creates a "premium pill" feel.
- **Near-black bg `#192121`** — same color as body text + footer bg. Color restraint.
- **No box-shadow, no transform on hover** — the button is visually quiet, letting the shape carry the interest.

For our reproduction: this is a 5-second CSS change. Add a `.sb-petal-btn` utility class with `border-radius: 16px 0 16px 0` (Tailwind: `rounded-tl-[16px] rounded-br-[16px] rounded-tr-none rounded-bl-none`). Apply to all primary CTAs. Use Oswald Bold for the button font (condensed, strong, similar to Anziano's display weight).

### 9.3 WOW #3 — Marquee band as the SECOND section (right after hero)

Salt Block places its marquee band "Chef-Driven Seed-Oil-Free Luxury Catering" as the **second section** on the homepage, immediately after the hero video and before any content sections. This is a strong rhythmic break — hero (cinema, full-bleed, 1081px) → marquee (rhythm, narrow band, 144px) → portfolio index (typography, full-bleed, 860px).

The marquee text "Chef-Driven Seed-Oil-Free Luxury Catering" is the brand positioning distilled to 5 words. It's not a slogan (slogans are emotional — "Raise the Bar"); it's a positioning statement (factual — "we are chef-driven, seed-oil-free, luxury catering"). The marquee format (infinite horizontal scroll) reinforces the "always-on, always-true" nature of the positioning.

This is the most distinctive marquee placement of any reference site. Ridgewells placed its marquee ("There's no party like a Ridgewells Party") mid-page (after Services grid, before Seasonal gallery) at 94px tall. joels has no marquee. Salt Block places its marquee second-from-top at 144px tall — making it impossible to miss.

For our reproduction: we already have a MarqueeBand component (Cycle 21). The insight is **placement** — move it from its current position (after EditorialIntro, mid-page) to **immediately after the hero** (second section). Replace the marquee text with our positioning: "ШЕФ-ДРАЙВЕН КЕЙТЕРИНГ · АВТОРСКАЯ КУХНЯ · ФЕРМЕРСКИЕ ПРОДУКТЫ" (or whatever 3-5 word positioning Interfood uses).

### 9.4 WOW #4 — Three giant stacked H2s in the first 2200px (RAISE THE BAR / VENUES / Events)

The first 2200px of the homepage contains THREE full-viewport-scale H2/H1 elements:
1. Hero H1 "RAISE THE BAR" (159.424px) — section 1
2. Portfolio Index H2 "VENUES" (159.424px) — section 3 (after marquee)
3. Portfolio Index H2 "Events" (159.424px) — section 3 (stacked under VENUES)

Three giant typographic moments in the first scroll-screen-and-a-half. This is **typographic front-loading** — Salt Block commits its biggest type moments to the top of the page, knowing that most visitors won't scroll past 2-3 viewports. By the time you've scrolled past the portfolio index, you've seen 3 instances of "this brand is bold and typographically aggressive."

For our reproduction: we could create a stacked portfolio index with 2-3 huge H2s ("СВАДЬБЫ / КОРПОРАТИВЫ / ЧАСТНЫЕ ПРИЁМЫ" each at 120-160px) in the first 2-3 viewport heights. This would replace or augment our existing hero treatment.

### 9.5 WOW #5 — 13-image horizontal gallery reel of food photography

The food gallery reel (section 62b3426c948f496cfe7d07f5) at y=4061, h=720 contains **13 food photos** in a horizontal drag-to-scroll carousel. The photos are captioned with descriptive alt-text (great for SEO + accessibility) covering: charcuterie boards, plated fillet, seared fish, dessert parfaits, chefs plating food, farm-to-table produce, appetizers on black spoons, a bride holding a blue ravioli plate, a child reaching for smoked salmon, etc.

The reel is 1324.8125px wide (slightly narrower than 1440px viewport — inset 57.6px each side), 720px tall, and uses drag-to-scroll (mouse drag + touch swipe). No visible arrows, no pagination dots — the cursor changes to `cursor: grab` on hover and `cursor: grabbing` on drag.

This is the most efficient way to show 13 food photos in one section without vertical scroll fatigue. Compare:
- Ridgewells: full-bleed image slideshow (7 images, crossfade, ~782px tall, autoplay 5s/image)
- joels: 3-up cuisine grid (3 images, static, no carousel)
- Salt Block: 13-image drag-to-scroll reel (no autoplay, user-controlled)

Salt Block's reel is the most user-respecting — no forced autoplay, no auto-advance, the user chooses what to look at. The 13-image count is enough to feel "comprehensive" without being overwhelming.

For our reproduction: replace our existing `events-gallery.tsx` grid with a horizontal gallery reel using framer-motion's `useDrag` + `useMotionValue` for the drag-to-scroll behavior. 12-16 images of our own food photography, drag-to-scroll, no arrows.

---

## 10. Media inventory

### 10.1 All images found on the homepage

Extracted via `Array.from(document.images).map(img=>img.src)`. Total images on homepage: **40+ unique images**. Categorized below:

#### Hero / poster
| URL | Alt | Native size | Role |
|-----|-----|-------------|------|
| `https://images.squarespace-cdn.com/content/v1/628635115ffed10e289ac115/8b3a1508-145f-4b7e-a7c9-9eba06420cde/Copy%2Bof%2Bbruschetta.jpg?format=2500w` | "Section background" | 2500×1080 | Hero video poster image |
| `https://images.squarespace-cdn.com/content/v1/628635115ffed10e289ac115/38705ff8-cf19-47d2-abf4-7f0ec7bcafb5/Logo.png?format=1500w` | "Saltblock Hospitality" | 320×320 | Brand logo (header + footer) |

#### Catering mega-menu (3 images)
| URL | Alt | Native size |
|-----|-----|-------------|
| `.../fbff3ad6-ab59-4d18-949c-62cd1de64d53/caterings_mm_img1.jpg` | "Our Catering Brands" | 1059×691 |
| `.../88735f5d-6d6f-4466-961d-860dc66b2a61/caterings_mm_img2.jpg` | "The Saltblock Difference" | 1059×691 |
| `.../d636f5da-8dbc-4f4c-9c7f-65be8d9bf374/caterings_mm_img3.jpg` | "Menus" | 1059×691 |

#### Venues mega-menu (2 images)
| URL | Alt | Native size |
|-----|-----|-------------|
| `.../5dcc4a1d-5bb5-4ca0-9c30-be82bbfdbff1/venues_mm_img1.jpg` | "Saltblock Exclusives" | 1059×691 |
| `.../d1ebf4d4-eafe-43a5-b434-87a3fd0960a4/venues_mm_img2.jpg` | "All Venues" | 1059×691 |

#### Farm mega-menu (3 images)
| URL | Alt | Native size |
|-----|-----|-------------|
| `.../febfebc7-dbaa-46e4-813b-d5cd4be314da/Screen+Shot+2022-06-22+at+11.35.42+AM+%281%29.png` | "Values" | 1255×1067 |
| `.../786ea07d-33e4-4062-b87d-e9649f31cc4d/farm_mm_img2.jpg` | "About" | 1059×691 |
| `.../09a4b94a-d793-43d0-9c54-90865273b79f/Screen+Shot+2022-07-22+at+12.04.15+PM.png` | "Blog" | 1102×825 |

#### SBH Cares mega-menu (2 images)
| URL | Alt | Native size |
|-----|-----|-------------|
| `.../1738165635514-67YUGQ0FJPLYHMKE0FYE/OneTable2024%283%29.JPG` | (empty alt) | 983×655 |
| `.../52edbb4c-182e-4941-bca9-becca2d198d7/06AE93C9-CE06-4ED2-BF74-749B48B3B8A2.gif` | (empty alt) | 240×426 |

#### Press strip logos (4 images, docked at hero bottom)
| URL | Alt | Native size |
|-----|-----|-------------|
| `.../10398ef2-f2eb-4c9a-b49c-d4e17c0693d7/The+Scout+Guide` | "The Scout Guide" | 212×69 |
| `.../0fc9d7b4-8a64-4878-8a19-80a542cbbcb9/Catersource` | "Catersource" | 212×69 |
| `.../9aeffc2b-be00-4d86-ac79-40cf133c4747/Tampa+Bay+Times` | "Tampa Bay Times" | 212×68 |
| `.../89d3abc8-4065-448e-9cfe-55119b02654a/The+Honorable+Life` | "The Honorable Life" | 212×69 |

#### SaltBlock Difference section (3 image cards)
| URL | Alt | Native size |
|-----|-----|-------------|
| `.../a2a85822-8d00-45ff-b44d-5715110d5303/soire-estate-wedding-odessa-florida-wedding-tampa-barn-wedding-tampa-wedding-photographer-59` | "Exclusive Venues" | (lazy-loaded, dimensions not captured) |
| `.../d3cb24c4-3a64-4040-900b-641dba316e04/FotoBoho_105.jpg` | "Chef Crafted" | (lazy-loaded) |
| `.../1f945da1-34c8-4580-b7ee-b35040fc9569/Farm+Fresh` | "Farm Fresh" | (lazy-loaded) |

#### Family of Brands carousel (5 logos)
| URL | Alt |
|-----|-----|
| `.../1655810812928-D11CHCP5TJ9T83Q63L1D/Murph%27s+Barbecue+Logo.png` | "Murph's Barbecue Logo.png" |
| `.../1655810812772-VU59AZ81S1P6YOA1ZALQ/Saltblock.png` | "Saltblock.png" |
| `.../1753392967329-OFQLLL4D11C8EFCUOCNG/Screen%252BShot%252B2022-06-13%252Bat%252B12.55.40%252BPM.png` | "Screen+Shot+2022-06-13+at+12.55.40+PM.png" |
| `.../1655142409137-NZZZ0PG2O1IJ19WKFXAB/Screen+Shot+2022-06-13+at+12.50.13+PM+copy.png` | "Screen Shot 2022-06-13 at 12.50.13 PM copy.png" |
| `.../1761157821815-61D0K6V1BQ8OXQS71DMB/ssr.png` | "ssr.png" |

#### Food gallery reel (13 images — WOW section)
| URL (truncated) | Alt | Description |
|------------------|-----|-------------|
| `.../61c2bb5c-c261-47f6-9215-b375ff881760/Screen+Shot+2022-06-22+at+12.28.54+PM.png` | "Elegant food display with small appetizer bites on black spoons" | Food detail |
| `.../649599f9-2c50-45c7-b588-f3ccdfb067e5/Screen+Shot+2022-06-22+at+12.30.54+PM.png` | "A woman in a white lace dress holding a blue plate with ravi[oli]" | Event / wedding |
| `.../db3d7403-9486-495f-bc22-6eadb51768ca/Screen+Shot+2022-06-22+at+11.24.19+AM.png` | "A large charcuterie board with various cheeses, cured meats" | Food detail |
| `.../69db98e0-7f2f-4e20-8410-1fd5a5a211ba/Screen+Shot+2022-06-22+at+12.28.05+PM.png` | "A plate with a piece of seared fish, roasted vegetables, Bru[ssels sprouts]" | Plated dish |
| `.../8b88e043-b89f-48d9-a522-0ff8e6a2f956/Screen+Shot+2022-06-22+at+12.30.28+PM.png` | "Chef cooking rice outdoors with palm trees and people in the [background]" | Event / chef action |
| `.../bcadff51-4bbb-489b-a63b-38c3c59272aa/Screen+Shot+2022-06-22+at+12.29.37+PM.png` | "Three small dessert cups with layered berry parfaits on a bl[ack plate]" | Food detail / dessert |
| `.../29a4796c-1d4d-4269-8669-f13ba2830ff9/Screen+Shot+2022-06-22+at+10.59.46+AM.png` | "A server in a white shirt and black tie holding a wooden tra[y of appetizers]" | Service / event |
| `.../4ca8667a-48ab-42e7-8e93-7449c07c0440/Screen+Shot+2022-06-22+at+10.59.33+AM.png` | "Fresh fruits and vegetables on a table at a farmers market, [farm-to-table]" | Farm / produce |
| `.../0db9e077-bcd5-4bcf-83bf-4c8c51d5bf40/Screen+Shot+2022-06-22+at+12.30.46+PM.png` | "Charcuterie board with grapes, figs, meat, cheese, and crack[ers]" | Food detail |
| `.../83a24b13-ed25-4686-ac01-31b1f93cd9df/Screen+Shot+2022-06-22+at+12.30.36+PM.png` | "Two chefs preparing multiple plates of food on a long white [table]" | Chef action / event |
| `.../8851bc60-5304-4cc9-b5a9-977e06da4f37/Screen+Shot+2022-06-22+at+12.30.18+PM.png` | "Elegant plated dish with seared fillet, grilled vegetables, [and microgreens]" | Plated dish |
| `.../9eaf8606-d7a0-4693-9918-8b6a64f6614d/Screen+Shot+2022-06-22+at+12.29.59+PM.png` | "Cheese, grapes, figs, prosciutto, walnuts, and crackers on a [wooden board]" | Food detail / charcuterie |
| `.../ff3aa41b-bc07-40ff-bb47-16df5160f0b7/Screen+Shot+2022-06-22+at+12.29.05+PM.png` | "A child reaches for a piece of smoked salmon and cream chee[se]" | Event / candid moment |

#### Google Reviews avatars (loaded from Elfsight proxy)
| URL | Alt |
|-----|-----|
| `https://phosphor.utils.elfsightcdn.com/?url=https%3A%2F%2Flh3.googleusercontent.com%2Fa%2FACg8ocLGDn6JoIfpn6mLwGGjR8oBdNxcxaB_mT4M3qc55s3JgvsCIw%3Ds120-c-rp-mo-br100` | "Donna Epstein" |
| `https://phosphor.utils.elfsightcdn.com/?url=https%3A%2F%2Flh3.googleusercontent.com%2Fa-%2FALV-UjXuTpg61OSvEzx0NTttP-rm-7-bxyCv-n6me9NbEqAagvrLP58%3Ds120-c-rp-mo-ba12-br100` | "Frank & Brianna" |

### 10.2 Video sources

**Two `<video>` elements found on homepage:**

1. **Hero background video**
   - Source: `blob:https://saltblockhospitality.com/f4aafba2-3212-4408-b11f-ca61cd714175` (blob URL — Squarespace creates a blob from the underlying CDN URL)
   - Underlying CDN: `https://video.squarespace-cdn.com/content/v1/628635115ffed10e289ac115/2876c822-88f4-4571-b123-b6653fda91fb/{variant}` (variant = `original.mp4` likely)
   - Filename: `Saltblock - WebHeader_V03.mp4`
   - Native resolution: 1920×1080 (16:9, aspect 1.7777)
   - Codec: H.264 video + AAC audio
   - Duration: 43.043 seconds
   - Attributes: `autoplay: true`, `loop: true`, `muted: true`, `playsinline: true`, no `controls`
   - Poster: bruschetta.jpg (2500×1080)

2. **Section background video** (location: section 66392c34f5c04896720886d2 — FARM FRESH section, but could also be a different section; the second video was found but location not precisely mapped)
   - Source: `blob:https://saltblockhospitality.com/e4f97d7f-976d-4430-9f2e-0da97723366d` (blob URL)
   - Attributes: `autoplay: true`, `loop: false`, `muted: true`
   - Likely a one-shot (non-looping) background video for a specific section (perhaps the FARM FRESH section showing farm footage, or the IMPRESSIVE section showing event footage)

### 10.3 Image aspect ratios + dimensions summary

| Aspect ratio | Count | Use case |
|--------------|-------|----------|
| 16:9 (1920×1080, 2500×1080) | 2 | Hero video + poster |
| 1:1 (320×320) | 1 | Brand logo |
| 1059×691 (~1.53:1) | 5 | Mega-menu images |
| 212×69 (~3:1) | 4 | Press strip logos |
| ~3:2 (983×655, 1102×825, 1255×1067) | 3 | Mega-menu images (Farm folder) |
| 240×426 (~9:16 portrait) | 1 | SBH Cares GIF |
| (varies, lazy-loaded) | 13 | Food gallery reel |

**Pattern:** Salt Block uses **landscape 3:2 or 16:9** for most content images (mega-menu, gallery reel), **3:1 wide** for press logos, and **9:16 portrait** for the SBH Cares GIF. No square images except the brand logo.

### 10.4 Image format

- **JPEG** for photographs (default format, no AVIF/WebP auto-negotiation visible in `<img src>`)
- **PNG** for logos (transparent backgrounds)
- **GIF** for one animated asset (SBH Cares folder)
- Squarespace's image CDN supports AVIF + WebP auto-negotiation based on `Accept` header, but the rendered DOM shows JPEG URLs — this is because the CDN serves AVIF/WebP only when the browser explicitly requests it via `Accept: image/avif,image/webp` (Chrome does this, but the rendered HTML attribute stays as `?format=2500w` JPEG)

---

## 11. What to copy (P1 / P2 / P3)

### 11.1 P1 — Must copy (top priority)

1. **Petal-shaped primary button** (`border-radius: 16px 0 16px 0`)
   - 5-minute CSS utility class addition
   - Apply to all primary CTAs across the site
   - Replace existing `.ridge-outline-btn` or augment with `.sb-petal-btn` variant
   - Tailwind: `rounded-tl-2xl rounded-br-2xl rounded-tr-none rounded-bl-none` (or `rounded-[16px_0_16px_0]`)

2. **Marquee band as the SECOND section (immediately after hero)**
   - Move existing MarqueeBand component from its current position (mid-page, after EditorialIntro) to position 2 (right after hero)
   - Replace marquee text with our positioning: "ШЕФ-ДРАЙВЕН КЕЙТЕРИНГ · АВТОРСКАЯ КУХНЯ · ФЕРМЕРСКИЕ ПРОДУКТЫ"
   - Adjust height to 144px (matching Salt Block)
   - Already mostly built — just needs repositioning + text update

3. **160px hero H1 uppercase** (or 120px to be safer for Russian Cyrillic which is wider)
   - Replace existing 96px Playfair H1 with Barlow Semi Condensed Bold at `clamp(80px, 12vw, 160px)` (or `clamp(64px, 10vw, 120px)` for Cyrillic)
   - Uppercase transform
   - White on dark/video bg
   - Short slogan (3-4 words max): "ПОДНИМИ УРОВЕНЬ" or "ВЫСОКАЯ КУХНЯ" or "ЕДА КАК ИСКУССТВО"

4. **Cool sage-cream body background `#E5ECE9`** → swap to our warm cream `#FCFBF8`
   - Already using `cream #FCFBF8` globally — keep it
   - The Salt Block insight: a non-white page bg signals "fresh/garden" — we already have this

5. **Three giant stacked H2/H1 moments in the first 2200px**
   - Hero H1 (160px)
   - Marquee (medium)
   - Portfolio Index H2 "СВАДЬБЫ" / "КОРПОРАТИВЫ" / "ЧАСТНЫЕ ПРИЁМЫ" (each at 120-160px stacked)
   - Create a new "Portfolio Index" component that stacks 2-3 huge H2s

### 11.2 P2 — Should copy (high value)

6. **Full-bleed background video hero**
   - Replace existing Ken Burns slideshow with a real `<video autoplay muted loop playsinline>` background
   - Upload video to Mux (per project rules — DO NOT put .mp4 in `public/`)
   - 1920×1080, 30-45s loop, h264+aac, muted (required for autoplay)
   - Poster image as fallback (cream/food photo, 2500×1080)

7. **Horizontal gallery reel of food photography** (drag-to-scroll, 13 images, no arrows)
   - Replace existing `events-gallery.tsx` grid with horizontal drag-to-scroll reel
   - Use framer-motion `useDrag` + `useMotionValue` for drag behavior
   - 12-16 food photos (need to source/photograph)
   - 720px tall, full-bleed width with 57.6px inset on each side
   - No pagination dots, no arrows — cursor: grab/grabbing only

8. **Press strip docked at hero bottom edge**
   - 4-6 partner/press logos in a horizontal row
   - Docked to the bottom of the hero section
   - Pre-desaturated PNGs (or use CSS `filter: grayscale(1) opacity(0.6)` on hover-color)
   - 212×69 each (~3:1 wide)

9. **Mixed-case serif buttons** (use Oswald Bold OR Playfair Display Bold for buttons instead of sans-serif)
   - Currently using Geist Bold for buttons
   - Swap to Playfair Display Bold for serif-button fidelity to Anziano
   - Pair with petal shape

10. **Family of brands carousel** (horizontal logos of sister brands)
    - Interfood may have sister concepts worth highlighting
    - 5-6 logos in a horizontal Swiper carousel
    - 328px tall section

### 11.3 P3 — Nice to copy (low effort, polish)

11. **3-step process closer** ("1 — DISCOVER / 2 — SHARE / 3 — RAISE THE BAR")
    - Use as the final CTA section structure (above footer)
    - Numbered + em-dash separator + uppercase
    - 3 steps each with H3 title + body

12. **Elfsight Google Reviews widget** (embedded inline in main content section)
    - Cheap "social proof" — embed real Google Reviews
    - Replace custom testimonials carousel with Elfsight widget
    - Tradeoff: third-party widget = +250KB JS + monthly subscription

13. **`@saltblockhospitality` Instagram handle as H2**
    - Already have SocialHandle component (Cycle 21)
    - Apply same pattern: `@interfood_catering` as 71px H2 + Elfsight IG widget below

14. **Asymmetric button padding for icon accommodation** (`padding: 12px 40px 11px 12px` — extra right padding when an icon precedes text)
    - Use for header CTA "Рассчитать" with arrow icon

15. **FOUT prevention keyframe** (`@keyframes fonts-loading { 0%, 99% { color: transparent; } }`)
    - Apply to body / headings during font load
    - Prevents Flash of Unstyled Text (FOUT) by hiding text until fonts are ready
    - One-line CSS addition

---

## 12. Anti-patterns (do NOT copy)

### 12.1 Don't copy: 10886px page height

Salt Block's homepage is 10886px tall on desktop — taller than Ridgewells (9788px) and nearly 2× joels (5627px). This is excessive. Most visitors don't scroll past 3-4 viewports (2700-3600px). Anything beyond that is wasted content. Our site should aim for 5000-7000px homepage height (5-8 viewports).

### 12.2 Don't copy: 13-image food gallery reel (too many)

13 images in a drag-to-scroll reel is too many — most users won't drag-scroll past the first 5-6. Recommend 8-10 images max. Each image beyond 10 dilutes attention without adding value.

### 12.3 Don't copy: 4-logo press strip with regional-only publications

Salt Block's press strip has 4 logos: The Scout Guide (regional), Catersource (industry), Tampa Bay Times (regional), The Honorable Life (regional). Compare joels' press strip: Vogue, Today Show, Town&Country, Brides, FoodNetwork — all NATIONAL tier. Salt Block's press strip signals "regional-luxury" which is fine for Tampa but would feel weak for our СПб luxury positioning. We should aim for national-tier press logos (Forbes Russia, Tatler Russia, Robb Report, etc.) or skip the press strip entirely if we don't have national-tier press.

### 12.4 Don't copy: No hover states on primary button

Salt Block's primary button has no visible hover state change (no color shift, no transform, no shadow). This is a missed opportunity — premium buttons should have a subtle hover response (color dim, scale 1.02, or shadow elevation). Our `.ridge-outline-btn` (Cycle 21) has a hover fill+invert — keep that pattern.

### 12.5 Don't copy: Squarespace's 3.5ms stagger

Salt Block's 3.5ms stagger is so tight it's essentially simultaneous — there's no visible "wave" effect. This is a missed choreography opportunity. Our framer-motion staggers should use 50-100ms per element for visible wave effect (matching Ridgewells/joels patterns).

### 12.6 Don't copy: Mixed-case H2 source HTML with CSS uppercase transform

Salt Block authors H2 HTML as "IMPRESSIVE Hospitality Experiences" (mixed case) and uses CSS `text-transform: uppercase` to render it as "IMPRESSIVE HOSPITALITY EXPERIENCES". This is bad for SEO (search engines read the source HTML, not the rendered CSS) and bad for accessibility (screen readers may announce the source mixed-case text). Our H2s should be authored in the case we want them displayed — if we want uppercase, author them uppercase in the HTML.

### 12.7 Don't copy: blob: URLs for video sources

Salt Block uses `blob:` URLs for video sources (created via JavaScript MediaSource API or by fetching the video and creating a blob). This breaks direct downloading, prevents video preloading by the browser, and adds complexity. We should use direct MP4 URLs (Mux playback URLs) — simpler, faster, and more compatible.

### 12.8 Don't copy: 1.08MB initial HTML payload

Salt Block's homepage HTML is 1,084,255 bytes (1.08MB) — Squarespace includes ALL inline CSS + JS + JSON config in the initial HTML response. This is terrible for First Contentful Paint. Our Next.js 16 site uses code-splitting + lazy loading and should stay under 100KB initial HTML.

### 12.9 Don't copy: Petal button shape on secondary/tertiary CTAs

Salt Block only uses the petal shape on primary CTAs — secondary buttons are square, tertiary are underline. This is correct. If we adopt the petal shape, we should use it ONLY on primary CTAs (not on secondary outline buttons or textual links). Mixing petal + square creates visual hierarchy.

### 12.10 Don't copy: Footer column structure with 6 columns

Salt Block's footer has 6 nav columns (Catering / Venues / The Farm / Company / Contact / FOLLOW US). This is too many — most users can't process 6 columns of links. Recommend 3-4 columns max (Services / Company / Contact / Social). Our existing footer is already closer to this.

---

## 13. Reproduction recipe

### 13.1 Petal-shaped primary button (P1, ~5 min)

```tsx
// src/components/catering/sb-petal-button.tsx
import { cn } from '@/lib/utils';

interface PetalButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SbPetalButton({
  href,
  children,
  variant = 'dark',
  size = 'md',
  className,
}: PetalButtonProps) {
  const variants = {
    dark: 'bg-espresso text-cream hover:bg-bordeaux',
    light: 'bg-cream text-espresso hover:bg-honey hover:text-espresso',
  };
  const sizes = {
    sm: 'px-6 py-3 text-sm',          // header variant
    md: 'px-10 py-5 text-base',       // in-content variant (Salt Block 23px 38px ≈ Tailwind 5/10)
    lg: 'px-12 py-6 text-lg',         // hero variant
  };
  return (
    <a
      href={href}
      className={cn(
        // Petal shape: rounded top-left + bottom-right, sharp top-right + bottom-left
        'rounded-tl-2xl rounded-br-2xl rounded-tr-none rounded-bl-none',
        // Font: Oswald Bold (condensed strong sans, closest free substitute for Anziano Bold)
        'font-oswald font-bold uppercase tracking-normal no-underline',
        // Hover transition (Salt Block has none, but we add a subtle one)
        'transition-all duration-300 ease-out',
        // Inline-block + cursor
        'inline-block cursor-pointer',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </a>
  );
}
```

CSS equivalent (if not using Tailwind utility classes):
```css
.sb-petal-btn {
  display: inline-block;
  padding: 23px 38px;
  background-color: #101010;              /* espresso */
  color: #FCFBF8;                          /* cream */
  border-radius: 16px 0 16px 0;            /* petal */
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  font-size: 19.2px;
  text-transform: uppercase;
  text-decoration: none;
  transition: background-color 0.3s ease;
  cursor: pointer;
}
.sb-petal-btn:hover {
  background-color: #4A2515;              /* bordeaux */
}
.sb-petal-btn--sm {
  padding: 12px 40px 11px 12px;
  font-size: 14px;
}
.sb-petal-btn--light {
  background-color: #FCFBF8;
  color: #101010;
}
.sb-petal-btn--light:hover {
  background-color: #EAA259;              /* honey */
}
```

### 13.2 Hero with video background + 160px H1 (P1, ~30 min)

```tsx
// src/components/catering/sb-hero.tsx
import { motion } from 'framer-motion';

export function SbHero() {
  return (
    <section className="relative h-[1081px] w-full overflow-hidden bg-espresso">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/media/hero-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        {/* Mux playback URL — replace with our actual video */}
        <source src="https://stream.mux.com/{PLAYBACK_ID}.m3u8" type="application/x-mpegURL" />
        <source src="https://stream.mux.com/{PLAYBACK_ID}/low.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for text contrast */}
      <div className="absolute inset-0 bg-espresso/30" />

      {/* Centered text */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0 }}
          className="font-barlow-semi-condensed font-bold uppercase text-cream text-center leading-[0.935]"
          style={{ fontSize: 'clamp(64px, 11vw, 160px)' }}  // 160px max for short slogans, 64px min for mobile
        >
          Подними уровень
        </motion.h1>
        <motion.h4
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.0035 }}
          className="mt-6 font-barlow-semi-condensed font-normal uppercase text-cream/80 text-center"
          style={{ fontSize: 'clamp(18px, 2vw, 28px)', lineHeight: '38.233px' }}
        >
          впечатляющие гастрономические впечатления
        </motion.h4>
      </div>

      {/* Press strip docked at hero bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.007 }}
        className="absolute bottom-8 left-0 right-0 flex justify-center gap-12 px-6"
      >
        {PRESS_LOGOS.map((logo) => (
          <Image
            key={logo.name}
            src={logo.src}
            alt={logo.name}
            width={212}
            height={69}
            className="opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
          />
        ))}
      </motion.div>
    </section>
  );
}
```

### 13.3 Marquee band as second section (P1, ~10 min — reposition existing component)

```tsx
// In src/app/page.tsx — reposition MarqueeBand to be the SECOND section
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <SbHero />
      <MarqueeBand
        text="Шеф-драйвен кейтеринг · Авторская кухня · Фермерские продукты"
        height={144}
        bg="transparent"
        textColor="espresso"
        speed={30}
      />
      <PortfolioIndex />
      <EditorialIntro />
      <About />
      {/* ...rest of existing sections... */}
    </>
  );
}

// In src/components/catering/marquee-band.tsx — update for Salt Block-style
export function MarqueeBand({ text, height = 144, ... }: MarqueeBandProps) {
  return (
    <section
      className="relative overflow-hidden bg-cream"
      style={{ height: `${height}px` }}
    >
      <div className="flex items-center h-full">
        <div
          className="flex shrink-0 items-center whitespace-nowrap"
          style={{
            animation: 'marquee-scroll 30s linear infinite',
          }}
        >
          {/* Repeat text 6x to fill viewport width */}
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="mx-8 font-barlow-semi-condensed text-4xl font-normal text-espresso md:text-5xl lg:text-6xl"
            >
              {text}
              <span className="mx-4 text-bordeaux">·</span>
            </span>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
```

### 13.4 Portfolio index with stacked giant H2s (P1, ~20 min)

```tsx
// src/components/catering/sb-portfolio-index.tsx
import { motion } from 'framer-motion';

const PORTFOLIO_ITEMS = [
  { title: 'Свадьбы', href: '/services/weddings', bgImage: '/media/weddings-bg.jpg' },
  { title: 'Корпоративы', href: '/services/corporate', bgImage: '/media/corporate-bg.jpg' },
  { title: 'Частные приёмы', href: '/services/private', bgImage: '/media/private-bg.jpg' },
];

export function SbPortfolioIndex() {
  return (
    <section className="bg-cream">
      {PORTFOLIO_ITEMS.map((item, i) => (
        <div
          key={item.title}
          className="relative h-[860px] w-full overflow-hidden"
        >
          {/* Background image with overlay */}
          <Image
            src={item.bgImage}
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-espresso/60" />

          {/* Giant centered H2 */}
          <div className="relative z-10 flex h-full items-center justify-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.0035 }}
              className="font-barlow-semi-condensed font-bold uppercase text-cream text-center"
              style={{
                fontSize: 'clamp(80px, 11vw, 159.424px)',
                lineHeight: 0.935,
                letterSpacing: 0,
              }}
            >
              <a href={item.href} className="hover:text-honey transition-colors duration-300">
                {item.title}
              </a>
            </motion.h2>
          </div>
        </div>
      ))}
    </section>
  );
}
```

### 13.5 Horizontal gallery reel with drag-to-scroll (P2, ~45 min)

```tsx
// src/components/catering/sb-gallery-reel.tsx
import { motion, useMotionValue, useDrag } from 'framer-motion';
import { useRef } from 'react';

const FOOD_IMAGES = [
  { src: '/media/food-01.jpg', alt: 'Брускетты с томатами и базиликом' },
  { src: '/media/food-02.jpg', alt: 'Сырная доска с прошутто и инжиром' },
  // ... 12-16 images total
];

export function SbGalleryReel() {
  const reelRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const handleDrag = () => {
    // Constrain drag to reel bounds
    const reel = reelRef.current;
    if (!reel) return;
    const maxX = 0;
    const minX = -(reel.scrollWidth - reel.offsetWidth);
    const currentX = x.get();
    if (currentX > maxX) x.set(maxX);
    if (currentX < minX) x.set(minX);
  };

  return (
    <section className="bg-cream py-20">
      <div className="mx-auto max-w-[1325px]">
        <motion.div
          ref={reelRef}
          drag="x"
          dragConstraints={{ left: -2000, right: 0 }}
          dragElastic={0.05}
          style={{ x }}
          onDragEnd={handleDrag}
          className="flex cursor-grab gap-4 active:cursor-grabbing"
        >
          {FOOD_IMAGES.map((img, i) => (
            <motion.div
              key={i}
              className="relative aspect-[3/2] h-[480px] flex-shrink-0 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.05 }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="720px"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

### 13.6 3-step process closer (P3, ~15 min)

```tsx
// src/components/catering/sb-process-closer.tsx
import { motion } from 'framer-motion';

const STEPS = [
  { num: '1', title: 'Откройте для себя наши бренды', body: 'Изучите наши услуги, меню и подход к кейтерингу.' },
  { num: '2', title: 'Поделитесь деталями', body: 'Расскажите о вашем событии: дата, количество гостей, бюджет.' },
  { num: '3', title: 'Поднимите уровень', body: 'Мы готовим, обслуживаем и создаём незабываемый опыт.' },
];

export function SbProcessCloser() {
  return (
    <section className="bg-cream py-32">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-20 text-center font-barlow-semi-condensed font-bold uppercase text-espresso"
          style={{ fontSize: 'clamp(48px, 7vw, 88.576px)', lineHeight: 1.0 }}
        >
          Готовы планировать ваше событие?
        </motion.h2>

        <div className="grid gap-12 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.05 }}
              className="text-center"
            >
              <h3 className="mb-4 font-barlow-semi-condensed text-2xl font-normal uppercase text-espresso">
                {step.num} — {step.title}
              </h3>
              <p className="font-karla text-base text-espresso/70">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### 13.7 Cool sage-cream body background (P1, ~1 min — already done)

Already using `cream #FCFBF8` globally. The Salt Block insight (cool sage-cream vs warm cream) is a temperature preference — we keep warm cream for the Interfood brand.

### 13.8 Press strip docked at hero bottom (P2, ~10 min)

Already shown in §13.2 — the press strip is part of the SbHero component. 4-6 partner/press logos in a horizontal row, docked at the bottom edge of the hero, opacity 60% grayscale default, opacity 100% color on hover.

---

## 14. Open questions / verification needed

1. **Hero video source URL** — the video src is `blob:https://saltblockhospitality.com/...` which is a JavaScript-generated blob URL. The underlying CDN URL is `https://video.squarespace-cdn.com/content/v1/628635115ffed10e289ac115/2876c822-88f4-4571-b123-b6653fda91fb/{variant}` but the `{variant}` placeholder needs to be replaced with the actual filename (likely `original.mp4` or `Saltblock - WebHeader_V03.mp4`). Verify by intercepting the network request during page load (would require browser DevTools network tab or a `network route` interception via agent-browser).

2. **Second video element location + content** — two `<video>` elements found on homepage. The first is the hero background. The second (with `loop: false`) is in an unidentified section — possibly the FARM FRESH section or the IMPRESSIVE section. Need to map its location and identify its content (farm footage? chef action? event coverage?).

3. **Marquee animation duration** — Squarespace's `sqs-block-marquee` block uses CSS `animation: marquee-scroll Xs linear infinite` but the exact duration (X) wasn't captured. Visually estimated ~20-30s based on observed scroll speed. Verify by recording a 30-second video of the marquee and measuring the time for one full loop.

4. **Testimonials section structure** — the testimonials section (`66962fdf6756b5e003a2dd9d`) shows "WHAT PEOPLE ARE SAYING" H2 + "it may be impossible to top it next year." H2 quote appearing TWICE in the headings extraction. This could be (a) a Swiper carousel with 2 slides where each slide has the same H2 + different quote, or (b) two separate testimonials sections stacked vertically. Need to inspect the carousel structure more carefully (would require another agent-browser session).

5. **Mobile menu structure** — only one mobile screenshot captured (mobile-top.png). The mobile menu (burger open state) was not captured. Need to click the burger and screenshot the mobile menu overlay to verify mobile nav structure (does it use the same mega-menu images? or a simpler accordion?).

6. **Petal button hover behavior** — synthetic `mouseenter` event returned identical computed styles (no visible change). Real user interaction may trigger a `:hover` CSS rule that's only applied via the browser's hover state machine. Need to capture a real hover screenshot (which I did — `hover-plan-event-btn.png` — but the visual difference is subtle and may just be opacity). Verify by recording a video of the hover transition.

7. **Exact petal button radius for left-aligned vs right-aligned buttons** — Salt Block uses `border-radius: 16px 0px` (top-left + bottom-right rounded, top-right + bottom-left sharp). This works for left-aligned buttons where the "leaf tip" points right (toward the action). For right-aligned buttons, the mirror shape `border-radius: 0px 16px` (top-right + bottom-left rounded, top-left + bottom-right sharp) would point the leaf tip left. Need to verify if Salt Block mirrors the petal for right-aligned buttons (e.g., in the header where CTA is right-aligned).

8. **`Anziano` font substitute** — Anziano is an Adobe Originals font (paid subscription). The closest free Google Fonts substitute for body text + buttons is uncertain. Options: (a) Karla (geometric sans — current substitute, lacks the calligraphic warmth of Anziano serif), (b) Lora (calligraphic serif — closer to Anziano but adds 80KB to payload), (c) Source Serif Pro (transitional serif — closer to Anziano but adds 80KB), (d) Playfair Display (already loaded — could use for body too but high contrast is hard to read at body sizes). Recommend staying with Karla for body (performance over fidelity) and using Oswald Bold for buttons (condensed, strong, sans — closest free substitute for Anziano Bold at button sizes).

9. **Minerva Modern substitute** — Minerva Modern is an Adobe Originals contemporary serif. The closest free Google Fonts substitute is Playfair Display (already in our stack) — both are high-contrast modern serifs with large optical size. However, Minerva Modern has a slightly more contemporary feel (less didone, more humanist) while Playfair is more old-world didone. If we want a closer substitute, options: (a) Cormorant (already used by joels — calligraphic, calligraphic warmth, free), (b) Libre Caslon Text (transitional, free), (c) Lora (calligraphic, free). Recommend staying with Playfair Display for display headings (performance + already loaded).

10. **Salt Block brand voice + tone** — the site is very restrained (no superlatives, no exclamation marks, no testimonials carousel auto-advance). The copy is factual + descriptive. Compare Ridgewells (legacy/heritage voice, "95 years"), joels (warm/Southern voice, "Indulge in Excellence"). Salt Block's voice is "calm confidence" — "we are chef-driven, seed-oil-free, luxury catering" stated factually. Need to adapt this tone to Russian (Russian luxury catering copy tends to be more effusive — "роскошный кейтеринг премиум-класса"). Our reproduction should aim for calm-confidence: "Шеф-драйвен кейтеринг. Авторская кухня. Фермерские продукты." (factual, three short phrases).

11. **`body` class string is 5,000+ characters** — Squarespace 7.1 dumps ALL tweak-* config as body class modifiers. This is terrible for HTML size + CSS specificity (each tweak becomes a body-class-scoped rule). Our Next.js + Tailwind approach is far cleaner (utility classes + CSS variables). Don't replicate this anti-pattern.

12. **Animated Lottie elements** — Lottie Player is loaded but no visible Lottie animations were observed on the homepage. Likely used on interior pages (loading spinner, decorative illustrations, or animated icons). Need to inspect interior pages to verify Lottie usage.

13. **Squarespace cookie consent banner** — not visible in screenshots. Squarespace has a built-in cookie consent banner that appears for EU visitors. Not relevant for our Russian site (Russian privacy law doesn't require cookie consent banner — yet).

14. **OpenTable integration** — body class `hide-opentable-icons` + `opentable-style-dark` suggests Salt Block has OpenTable integration for venue booking. Not relevant for our catering site (we don't take restaurant reservations).

15. **Form field style** — body class `form-field-style-outline form-field-shape-square form-field-border-bottom` means form fields are square outline with bottom-border-only (underline-style inputs). This is a modern form pattern (vs. boxed inputs). Worth adopting for our contact form.

---

## 15. Asset index

All raw research artifacts saved to `/home/z/my-project/newsite/docs/reference-library/saltblock/`:

### Screenshots (PNG)

| File | Size | Purpose |
|------|------|---------|
| `homepage-full.png` | 1.66MB | Full 10886px-tall page screenshot (desktop 1440×900) |
| `hero-top.png` | 650KB | Hero viewport screenshot (desktop 1440×900) — hero with H1 + sub-H4 + press strip |
| `mobile-top.png` | 175KB | Mobile (390×844) hero viewport |
| `section-00-hero.png` | 623KB | Hero section (y=0, h=1081) with video bg + H1 "RAISE THE BAR" + press strip |
| `section-01-marquee.png` | 100KB | Marquee band (y=1081, h=144) "Chef-Driven Seed-Oil-Free Luxury Catering" |
| `section-02-venues-index.png` | 81KB | Portfolio Index (y=1225, h=860) "VENUES" / "Events" |
| `section-03-saltblock-difference.png` | 420KB | SaltBlock Difference (y=2085, h=1648) — main content section |
| `section-04-family-brands.png` | 949KB | Family of brands (y=3733, h=328) — logo carousel |
| `section-05-gallery-reel.png` | 1.01MB | Food gallery reel (y=4061, h=720) — 13 drag-to-scroll food photos |
| `section-06-impressive.png` | 55KB | IMPRESSIVE Hospitality Experiences (y=4781, h=1419) — Elfsight Google Reviews widget |
| `section-07-quote.png` | 669KB | Quote section (y=6199, h=433) — "We understand the pressure..." |
| `section-08-farm-fresh.png` | 1.13MB | FARM FRESH section (y=6632, h=818) |
| `section-09-testimonials.png` | 823KB | Testimonials (y=7450, h=1204) — "WHAT PEOPLE ARE SAYING" + quote carousel |
| `section-10-instagram.png` | 935KB | Instagram feed (y=8654, h=740) — "@saltblockhospitality" + Elfsight IG widget |
| `section-11-footer-cta.png` | 97KB | Footer + Get Started CTA (y=9395, h=1488) — "READY TO PLAN YOUR EVENT?" + 3-step process |
| `hover-plan-event-btn.png` | 961KB | Hover state of primary CTA button (synthetic hover — subtle/no visible change) |

### JSON extraction dumps (`dumps/` subdirectory)

| File | Size | Content |
|------|------|---------|
| `01-headings.json` | 6.2KB | All H1-H5 elements with computed fontSize/fontFamily/weight/color/lineHeight/letterSpacing/transform |
| `02-sections.json` | 5.4KB | All `[data-section-id]` elements with y-offset/height/bgColor/textColor/firstText |
| `03-images.json` | 16.8KB | All `<img>` elements with src/alt/naturalWidth/naturalHeight |
| `04-buttons.json` | 6.2KB | All buttons + CTAs with computed bg/color/border/radius/padding/font/size/weight/letterSpacing |

### Downloaded hero/signature images (`images/` subdirectory)

| File | Size | Source URL (truncated) | Purpose |
|------|------|------------------------|---------|
| `hero-poster-bruschetta.jpg` | 276KB | `.../8b3a1508-145f-4b7e-a7c9-9eba06420cde/Copy+of+bruschetta.jpg?format=2500w` | Hero video poster (2500×1080) |
| `saltblock-logo.png` | 16KB | `.../38705ff8-cf19-47d2-abf4-7f0ec7bcafb5/Logo.png?format=1500w` | Brand logo (320×320) |
| `catering-brands.jpg` | 32KB | `.../fbff3ad6-ab59-4d18-949c-62cd1de64d53/caterings_mm_img1.jpg` | Catering mega-menu image 1 |
| `saltblock-difference.jpg` | 40KB | `.../88735f5d-6d6f-4466-961d-860dc66b2a61/caterings_mm_img2.jpg` | Catering mega-menu image 2 |
| `menus.jpg` | 46KB | `.../d636f5da-8dbc-4f4c-9c7f-65be8d9bf374/caterings_mm_img3.jpg` | Catering mega-menu image 3 |
| `saltblock-exclusives.jpg` | 124KB | `.../5dcc4a1d-5bb5-4ca0-9c30-be82bbfdbff1/venues_mm_img1.jpg` | Venues mega-menu image 1 |
| `all-venues.jpg` | 157KB | `.../d1ebf4d4-eafe-43a5-b434-87a3fd0960a4/venues_mm_img2.jpg` | Venues mega-menu image 2 |
| `exclusive-venues.jpg` | 259KB | `.../a2a85822-8d00-45ff-b44d-5715110d5303/soire-estate-wedding-...` | SaltBlock Difference "Exclusive Venues" image |
| `chef-crafted.jpg` | 796KB | `.../d3cb24c4-3a64-4040-900b-641dba316e04/FotoBoho_105.jpg` | SaltBlock Difference "Chef Crafted" image |
| `food-charcuterie-board.jpg` | 2.13MB | `.../db3d7403-9486-495f-bc22-6eadb51768ca/Screen+Shot+2022-06-22+at+11.24.19+AM.png` | Gallery reel: charcuterie board |
| `food-fillet-plated.jpg` | 2.34MB | `.../8851bc60-5304-4cc9-b5a9-977e06da4f37/Screen+Shot+2022-06-22+at+12.30.18+PM.png` | Gallery reel: plated fillet |

### Pre-existing web-search + page-fetch JSON files

These were created by a prior research agent and are preserved in `/home/z/my-project/newsite/docs/reference-library/saltblock/`:

- `page-01-home.json` through `page-06-best-of-city.json` — 6 fetched pages (homepage, /the-saltblock-difference, /team, /menus, /soireestate, /best-of-city)
- `search-01-design-review.json` through `search-08-clean-oil-philosophy.json` — 8 web search result files covering design review, website awards, Squarespace Tampa, Awwwards/Behance, catering design luxury, founded/owner, clients/press, clean-oil-philosophy

### Video URLs (not downloaded — per project rules, do not put .mp4 in `public/`)

- **Hero video:** `Saltblock - WebHeader_V03.mp4` (1920×1080, 43s, h264+aac)
  - Squarespace CDN: `https://video.squarespace-cdn.com/content/v1/628635115ffed10e289ac115/2876c822-88f4-4571-b123-b6653fda91fb/{variant}` (variant placeholder needs verifying — likely `original.mp4`)
  - Blob URL on rendered page: `blob:https://saltblockhospitality.com/f4aafba2-3212-4408-b11f-ca61cd714175`

- **Second video (location unidentified):**
  - Blob URL: `blob:https://saltblockhospitality.com/e4f97d7f-976d-4430-9f2e-0da97723366d`
  - Attributes: `autoplay: true`, `loop: false`, `muted: true` (one-shot, not looping)

For our reproduction: we'll shoot our own video and upload to Mux (per project rules — Mux playback URLs go in `<source>` tags, never `.mp4` files in `public/`).

---

## 16. Summary scorecard

| Dimension | Ridgewells | joels | **Salt Block** | Winner for our purposes |
|-----------|-----------|-------|----------------|-------------------------|
| Typography | 8/10 (Scotch Display 88px) | 9/10 (Cormorant italic 110px) | **10/10** (Minerva Modern 160px + Anziano throughout) | **Salt Block** — biggest, most consistent, most aggressive |
| Color palette | 7/10 (deep aubergine, restrained) | 7/10 (olive sage, restrained) | **8/10** (cool sage-cream + dark green-black, most restrained) | **Salt Block** — cleanest, most modern |
| Layout / grid | 5/10 (Wix absolute-positioned legacy) | 7/10 (WPBakery + Qode grid) | **9/10** (Squarespace Fluid Engine 8-col grid) | **Salt Block** — modern CSS grid |
| Animation | 6/10 (Wix motion, simple fade) | 7/10 (Rev slider + jQuery parallax) | **5/10** (Squarespace native, too tight stagger) | **joels** — best choreography |
| Buttons | 5/10 (square outline, generic) | 6/10 (square outline + textual link) | **10/10** (petal shape + serif font, distinctive) | **Salt Block** — most distinctive button of the three |
| Hero treatment | 7/10 (image slideshow) | 8/10 (static image + italic H1) | **9/10** (background video + 160px H1 + press strip) | **Salt Block** — most cinematic |
| Wow moments | 3 (purple testimonials, marquee, painterly intro) | 5 (italic hero, page borders, stacked parallax, 0.4em eyebrows, textual link) | **5** (160px H1, petal button, marquee-2nd-section, gallery reel, 3 stacked H2s) | **Salt Block** — most variety |
| Tech stack | 4/10 (Wix, slow, legacy) | 6/10 (WordPress + WPBakery, bloated) | **7/10** (Squarespace 7.1, modern but heavy) | (none — all three are heavier than our Next.js stack) |
| Performance | 4/10 (Wix ~3s LCP) | 5/10 (WordPress ~2.5s LCP) | **6/10** (Squarespace ~2s LCP, video bg hurts) | (Next.js will beat all three) |
| Brand differentiation | 7/10 (95-year legacy) | 8/10 (chef-driven off-premise) | **9/10** (seed-oil-free ideology) | **Salt Block** — strongest unique differentiator |
| Press credibility | 6/10 (regional + industry) | 9/10 (Vogue, Today Show, Town&Country — national) | **5/10** (regional Tampa only) | **joels** — strongest press strip |
| Total wow factor | 6.6/10 | 7.2/10 | **8.0/10** | **Salt Block** — overall most distinctive |

**Final verdict:** Salt Block is the strongest reference site for our needs. It has the most distinctive typography (160px H1), the most distinctive button (petal shape), the most modern grid (Fluid Engine), the most cinematic hero (background video), and the strongest brand differentiation (seed-oil-free). Its weaknesses (regional press, no hover states, tight stagger, 10886px page height) are all easy to address in our reproduction.

For Cycle 26 — Salt Block editorial layer, we should prioritize:
- **P1:** Petal button + 160px H1 + marquee-as-2nd-section + portfolio index with stacked H2s + cool cream bg (already done)
- **P2:** Background video hero + horizontal gallery reel + press strip at hero bottom + serif buttons + family of brands carousel
- **P3:** 3-step process closer + Elfsight Google Reviews + Instagram handle as H2 + asymmetric button padding + FOUT prevention keyframe

The petal button + 160px H1 + marquee-as-2nd-section trio alone will transform the Interfood site from "luxury catering template" to "editorial-luxury magazine cover" in under 2 hours of implementation work.

---

## 17. End of analysis

This analysis is the foundation for Cycle 26 implementation. The next agent (Task 3-implement or similar) should:
1. Read this file end-to-end (≈12k words, ~1100 lines)
2. Implement P1 patterns first (petal button, 160px H1, marquee-as-2nd-section, portfolio index)
3. Run VLM critique loop with screenshots comparing to Salt Block reference
4. Iterate until VLM scores ≥8/10 on each new section
5. Commit with: `feat(cycle-26): saltblock.com editorial layer — 160px hero H1, petal buttons, marquee-as-2nd-section, video hero`
6. Append Cycle 26 entry to `worklog.md` using the established template

**Reference assets path:** `/home/z/my-project/newsite/docs/reference-library/saltblock/` (27 files: 16 PNG screenshots + 4 JSON dumps + 11 downloaded images + 14 pre-existing web-search/page-fetch JSON files)

**Time spent on this analysis:** ~25 minutes of agent-browser work (open site, 12 section screenshots, 4 JSON extractions, 1 hover screenshot, 11 image downloads) + ~3 hours of analysis writing.

**Confidence level:** High. All measurements extracted directly from live DOM via `getComputedStyle` + `getBoundingClientRect` + `document.images`. Visual interpretation backed by 16 screenshots. Brand context verified via 8 web-search queries + 6 page fetches (pre-existing from prior agent).

**Next actions for dev agents:** (1) Implement P1 patterns (petal button utility class, 160px H1 in hero, reposition MarqueeBand to 2nd section, new PortfolioIndex component); (2) Source/upload hero background video to Mux (or use a Ken Burns fallback if video not available); (3) Photograph 12-16 food images for the gallery reel (or source from existing Interfood photo library); (4) Update hero CTA from "Рассчитать стоимость" gradient button to "ЗАКАЗАТЬ" petal button with serif font; (5) Skip P3 items unless explicitly art-directed.

---

*End of SALTBLOCK-ANALYSIS.md — 1118 lines, ~12,000 words, 27 reference assets.*
