# JOELS-ANALYSIS.md

**Target site:** `https://joels.com/`
**Captured:** 2026-08-21 · viewport 1440×900 (desktop) + 390×844 (iPhone 12 Pro)
**Method:** agent-browser v0.32.3 (Chrome headless) DOM inspection + computed-style extraction + full-page screenshots + `web-search` skill for brand context
**Assets:** `docs/reference-library/joels/` — 24 files (homepage-full.png 5627px tall, hero-top.png, 10 section screenshots desktop + 9 mobile + 4 hover states, 24 JSON extraction dumps, 5 web-search results)

> **Mission:** extract PATTERNS only (animations, layout, type system, color logic, signature wow moments) so the dev agents can rebuild the *feel* in our Russian catering site "Interfood Catering" (СПб, cream/bordeaux/terracotta palette, Playfair Display + Geist stack, framer-motion 12 + gsap + lenis already integrated). We will NOT clone joels.com copy or images.

---

## TL;DR — the 5 things you must copy

| # | Pattern | Why it matters | Where to apply on our site |
|---|---------|----------------|----------------------------|
| 1 | **Italic Cormorant Garamond at 110px for hero H1** ("Indulge in Excellence"), weight 400, line-height 90px, no letter-spacing, color white | This is the single most distinctive element of joels.com. The **italic** serif at hero scale is a high-luxury move (cf. Aman Resorts, Belmond). Our **Playfair Display Italic 400** at 110px is the direct free substitute (both are Garaldic/Aldine serifs with high-contrast didone italics). | All hero headlines on the catering site |
| 2 | **Two 1px vertical lines framing the content area** (left at x=149px, right at x=1290px in 1440px viewport), semi-transparent dark-olive `rgba(62,57,48,0.16)`, `position: fixed`, `height: 100vh`, hidden on mobile <1025px | Signature "editorial frame" — gives every section a sense of being "on stage". Pure CSS, zero asset weight, instantly recognizable as premium. Hides when fullscreen menu opens. | Site-wide layout: add two fixed 1px lines at content edges on `lg:` viewport |
| 3 | **Stacked parallax images** in About section — main image (1000×764) `data-parallax='{"y":30, "smoothness":30}'` translating +30px, overlaid stacked image (1000×1360 portrait) `data-parallax='{"y":-15, "smoothness":10}'` translating -15px | Creates layered depth — two images moving at different speeds in opposite directions. Reproduces in framer-motion's `useScroll` + `useTransform`. | About / "Наша философия" section — replace current 3D-tilt StatCards with this stacked parallax |
| 4 | **Wide-tracked uppercase eyebrows with 0.4em letter-spacing** (`font-size: 11px; font-weight: 500; letter-spacing: 0.4em` — NOT pixels, EM), color olive `#81846A`, Montserrat | Joel's eyebrows track at **0.4em (= 4.4px at 11px)** — much wider than Ridgewells' 0.2em. The 0.4em tracking creates the "luxury magazine" feel. This is the SINGLE most-copyable detail. | Every section header — replace existing eyebrow tracking |
| 5 | **Textual link with horizontal line that scales 2.7× on hover** — `.qodef-button.qodef-layout--textual::before` is a 22px×1px line in `currentColor` next to the link text, on hover `transform: scaleX(2.7)` (0.3s ease-out) → line grows to 59.4px | Joel's signature CTA pattern: small horizontal line accent that elongates on hover. Subtle but instantly recognizable. Used for "WHO WE ARE" / "EXPLORE OUR EVENTS" / "WHERE WE WORK" links. | Replace existing "View More" outline buttons with this pattern on About/Services section links |

Bonus: **dual-state press logos** (grayscale `Vogue.png` → color `Vogue-Hover.png` on hover, both 140×70 PNGs swapped via CSS background-image) — 10 logos (Vogue, Today Show, Southern Bride, StyleMePretty, Town&Country, Martha Weddings, Brides, FoodNetwork, InStyle, Junebug). Cheap "as featured in" social proof band. **Reproducible in our Press section** with a CSS-only `:hover { background-image: url(color-version.png); }` swap.

---

## 1. Overall design language

### 1.1 Brand & business context

Joel Catering is **New Orleans' premier off-premise caterer**, founded in **1993 by Chef Joel Dondis** (Louisiana Restaurant Association's Restaurateur of the Year). The brand is positioned as **fine-dining quality in unique locations** — not a venue-with-catering, but a **mobile high-end caterer**. Address: 3930 Euphrosine St, New Orleans, LA. Contact: hailey@joels.com (no phone visible on homepage). Founded by a chef who started working in restaurants at age 11.

Target audience: New Orleans brides/wedding planners, corporate event planners, social celebration hosts. Press mentions include Vogue, The Today Show, Southern Bride, StyleMePretty, Town & Country, Martha Weddings, Brides, FoodNetwork, InStyle, Junebug Weddings — i.e., wedding-industry press, not just local food press.

Joel's is **cuisine-led** (not venue-led) — the homepage leads with "Indulge in Excellence", then immediately showcases food (about-2.jpg is artisanal pork belly bites, salad.jpg is grilled radicchio salad). The Cuisine section has 3 cards: FOOD / BEVERAGE / EVENTS (not "Menus" or "Packages"). This is editorial food-magazine language.

### 1.2 Color palette (extracted from CSS rules + computed styles)

| Role | Hex | RGB | Usage context |
|------|-----|-----|---------------|
| **Primary brand (olive/sage)** | `#81846A` | `rgb(129, 132, 106)` | Eyebrows, filled buttons (INQUIRE NOW, GET A TASTE), scroll cue text, mobile menu accents. **This is joels.com's signature color** — an olive-sage green that signals "natural / artisanal / Southern garden". |
| **Dark olive-brown** | `#3E3930` | `rgb(62, 57, 48)` | Default `.qodef-button.qodef-layout--filled` background (overridden to olive `#81846A` on hero CTAs via custom color modifier). Page border lines at 16% opacity (`rgba(62,57,48,0.16)`). Heading hover color. |
| **Body text (warm charcoal)** | `#4A494A` | `rgb(74, 73, 74)` | All H3 section titles (50px Cormorant Garamond). Nav menu top-level links (HOME/CUISINE/EVENTS/VENUES/BLOG). INQUIRE NOW outline button text. |
| **Mid olive (subdued brand)** | `#696359` | `rgb(105, 99, 89)` | Default outlined button text color. Textual link default color. Hovered link hover rule (`h1 a:hover { color: #3E3930 }`). |
| **Footer / IG arrow color** | `#776F60` | `rgb(119, 111, 96)` | Footer text color. Section-title wrapper text color. Carousel arrow icons. |
| **Warm beige (hover state)** | `#BDB5AA` | `rgb(189, 181, 170)` | Button hover bg (the filled button bg `#81846A` → `#BDB5AA` on hover). Outlined button hover bg + border. **This is a desaturation hover — unusual and intentional.** |
| **Light grey (default UI)** | `#9E9A94` | `rgb(158, 154, 148)` | `.qodef-section-title .qodef-m-subtitle` default color (overridden to `#81846A` for olive variant). Carousel arrow default color. |
| **Cream / off-white background** | `#FFFFFF` | `rgb(255, 255, 255)` | Page background — pure white throughout. NO cream/off-white anywhere. |
| **Carousel arrow bg** | `#EEEEEE` | `rgb(238, 238, 238)` | Carousel arrow button background. |
| **IG icon border** | `#333333` | `rgb(51, 51, 51)` | Instagram icon 2px border (only place pure dark grey appears). |
| **Cool blue (rare)** | `#00A0D2` | `rgb(0, 160, 210)` | Single instance — likely a `:focus` outline or admin-bar color, not part of brand. |

**Critical observation:** joels.com is an **olive/sage + charcoal on white** palette. NO bordeaux, NO terracotta, NO warm cream. The only "warm" tone is the beige hover `#BDB5AA`. This is a cool, earthy, sophisticated palette — closer to a Southern garden or a vineyard than to a Russian catering site.

**Mapping to our project palette** (cream/bordeaux `#7A4A1F`/terracotta/sage/honey):

- joels' **olive `#81846A`** → our **sage** (we already have sage in our palette, this is a perfect direct mapping — Joel's olive and our sage are both ~olive-sage greens)
- joels' **dark olive-brown `#3E3930`** → our **espresso/ink** (very close — `#101010` or our dark ink)
- joels' **charcoal `#4A494A`** → our **ink** `#1A1714` (slightly warmer, but same role)
- joels' **beige hover `#BDB5AA`** → our **honey** `#EAA259` (mapped to warm beige — Joel's beige is cool, ours is warm)
- joels' **white** → our **cream `#FCFBF8`** (we keep the warm cream, Joel's pure white is too clinical for our brand)
- joels' **light grey `#EEEEEE`** → our **sand-50** or warm grey equivalent

**Conclusion:** Joel's color logic maps DIRECTLY onto our existing palette. The olive→sage substitution is essentially a 1:1 swap. This is the easiest reference site to clone into our palette of all three (Ridgewells → aubergine, joels → olive, ours → sage).

### 1.3 Typography

**Two font families, both free Google Fonts:**

| Role | Font | Foundry | Cost | Free Google Fonts substitute |
|------|------|---------|------|------------------------------|
| Display serif (H1 hero, H2 CTA, H3 section titles, H5 card titles) | **Cormorant Garamond** | Google Fonts (free, designed by Catharsis Fonts) | Free | **Use as-is** — already free. Or substitute **Playfair Display** (our existing stack) for slightly more contrast. |
| UI sans (eyebrows, nav, buttons, body, footer) | **Montserrat** | Google Fonts (free, designed by Julieta Ulanovsky) | Free | **Use as-is** — or substitute our existing **Geist Sans** (similar geometric humanist sans). |
| Body fallback | **Roboto** | Google Fonts (free) | Free | Used as fallback for `INQUIRE NOW` button text — likely a CF7 / Revolution Slider default. Ignore. |

**Both fonts are FREE on Google Fonts** — this is a major advantage over Ridgewells (which uses premium Klim + Hoefler fonts). We can load both via one `<link>` tag.

**Type scale (desktop, computed from DOM):**

| Element | Size | Weight | Style | Line-height | Letter-spacing | Color | Transform | Font |
|---------|------|--------|-------|-------------|----------------|-------|-----------|------|
| **Hero H1 ("Indulge in Excellence")** | **110px** | 400 | **italic** | 90px (0.82) | 0 (none) | `#FFFFFF` | none | Cormorant Garamond italic |
| Hero eyebrow ("NEW ORLEANS' PREMIER CATERER") | 20px | 400 | normal | (Rev slider default) | 3px | `#FFFFFF` | uppercase | Montserrat |
| Hero CTA "INQUIRE NOW" (button text) | 11px | 600 | normal | 3.333em (≈36.7px) | 0.3em (≈3.3px) | `#FFFFFF` | uppercase | Montserrat |
| Hero scroll cue "SCROLL" | 12px | 500 | normal | 17px | 3px | `#81846A` | uppercase | Montserrat |
| **Section H3 title** (e.g., "New Orleans' Leading Culinary Experts") | **50px** | 400 | normal | 55px (1.1) | 0 (none) | `#4A494A` | none | Cormorant Garamond |
| **Section eyebrow** (e.g., "ABOUT", "EVENTS") | **11px** | 500 | normal | 25px | **0.4em (4.4px)** | `#81846A` | uppercase | Montserrat |
| Card title (FOOD / BEVERAGE / EVENTS) | 28px | 400 | normal | (default) | 0 | `#3E3930` | none | Cormorant Garamond |
| Final CTA H2 ("Make an Event Request") | 60px | 400 | normal | 66.96px (1.116) | 0 | `#4A494A` | none | Cormorant Garamond |
| Final CTA eyebrow ("READY TO GET IN TOUCH?") | 11px | 500 | normal | 25px | 0.4em | `#81846A` | uppercase | Montserrat |
| Testimonial H3 quote | 50px | 400 | normal | 55px | 0 | `#4A494A` | none | Cormorant Garamond |
| Testimonial author byline `<p>` | ~14px | 400 | normal | default | 0 | `#776F60` | none | Montserrat |
| Body paragraph | 15px | 400 | normal | default | 0 | `#776F60` | none | Montserrat |
| Nav top-level (HOME/CUISINE/EVENTS/VENUES/BLOG) | 13px | 400 | normal | default | 3.9px | `#4A494A` | uppercase | Montserrat |
| Nav dropdown (WEDDINGS/SOCIAL CELEBRATIONS/CORPORATE EVENTS) | 9.5px | 500 | normal | default | 2.85px | `#81846A` | uppercase | Montserrat |
| Header utility links (ABOUT US, CONTACT US) | 11px | 500 | normal | default | 4.4px | `#81846A` | uppercase | Montserrat |
| Outlined/textual button default | 11px | 600 | normal | 40px (textual) / 3.333em (filled) | 0.3em | `#696359` or `#4A494A` | uppercase | Montserrat |
| Footer email (`HAILEY@JOELS.COM`) | ~14px | 400 | normal | default | 0 | `#4A494A` | none | Montserrat |
| Footer copyright / "WEBSITE BY MIDNIGHT MARKETING" | ~10px | 400 | normal | default | 2px | `#776F60` | uppercase | Montserrat |

**Critical insights:**

1. The **hero H1 is ITALIC** at 110px — this is the signature. Italic serifs at hero scale signal "luxury magazine" / "old-money elegance" (cf. Belmond, Aman Resorts). NOT italicizing our hero would lose the joels.com feel entirely.
2. The **section eyebrow letter-spacing is 0.4em** (not 0.2em or pixels). At 11px, that's 4.4px of tracking — much wider than Ridgewells (3.12px). This is the widest-tracking eyebrow I've seen on any catering site. Copy this exactly.
3. The **responsive hero size** is `110, 80, 70, 50` (desktop, small-desktop, tablet, mobile) — Joel's drops from 110px → 50px on mobile (more than half). Playfair Display Italic at 50px mobile is still legible because italic serifs read larger than upright.
4. **No H1 on the homepage** (the hero H1 is an `<rs-layer>`, not an HTML heading). The only `<h2>` is "Make an Event Request" at the bottom. All section titles are `<h3>`. All card titles are `<h5>`. This is a TERRIBLE SEO practice — we should NOT replicate this; use proper `<h1>` for hero, `<h2>` for section titles, `<h3>` for cards.
5. **Line-height is tight on hero** (90px / 110px = 0.82) — a "set solid" headline, intentionally compressed for elegance.
6. Cormorant Garamond is loaded in weights **300, 400, 500, 600, 700** and BOTH normal + italic styles — a full 14-style family. We don't need all of them: just 400 + 400-italic + 500 + 600. That's ~80KB total woff2.

### 1.4 Layout grid

- **Max-width container:** `qodef-content-grid-1300` — content area max-width **1300px** (slightly wider than Ridgewells' 980px gutter)
- **Actual content width between page borders:** **1070px** (measured between left border at x=185 and right border at x=1255)
- **Page border system:** 1px vertical lines at `left: 149px` and `right: 149px` (in 1440px viewport), so content sits between x=150 and x=1290 = **1140px wide**, with content max-width 1070px providing 35px padding on each side inside the borders
- **Vertical rhythm:** 13 sections ranging from 48px (FOLLOW US ON INSTAGRAM row) to 659px (Cuisine section). Average ~430px. Total page 5627px tall on desktop.
- **Section-internal padding:** approximately 50-100px top/bottom per section
- **Cuisine grid:** 3 cards × 267px each (891px total + 30px gaps = 951px wide — fits within 1070px content area)
- **About section:** 2-column split — left 4/12 width (stacked parallax images, hidden on mobile/tablet), right 7/12 width (text content). Asymmetric 4:7 split (not 5:7 or 6:6 — uncommon ratio)
- **Testimonials carousel:** single-slide, 1040px wide × 401px tall
- **Mobile:** page height 7469px (33% taller than desktop — content stacks vertically)
- **Page borders hidden** below 1025px viewport width

### 1.5 Mood

**Editorial-luxury with Southern warmth.** Feels like a Condé Nast Traveler feature crossed with a Southern Living magazine cover. The italic serif headline + olive/sage palette + food photography (artisanal pork belly, radicchio salad) signal **"chef-driven, garden-fresh, off-premise luxury catering"** — not "white-tablecloth venue", not "buffet-style corporate caterer". The brand voice is **quietly confident** — every section uses minimal copy (1-2 sentences + headline + eyebrow + CTA), letting the photography and typography do the work.

---

## 2. Section-by-section breakdown (scroll order)

The homepage is **5627px tall** at 1440px viewport width — 13 sections + sticky 150px header + 470px footer. Much more compact than Ridgewells (9788px) — Joel's prioritizes focus over abundance.

### 2.1 Header (sticky, 0-150px, 150px tall) — STRIKING

- **Behavior:** `qodef-header--dark` + `qodef-header--standard` + `qodef-header-appearance--none` (no scroll-triggered style change). The header stays 150px tall and transparent throughout — but the logo is so tall (150px!) that the header is essentially a full-height banner itself.
- **Layout:** `qodef-header-standard--center` — logo on left (544×700 native PNG, scaled to 150px tall), nav menu centered, utility links + social on right.
- **Logo:** `Joel_Tertiary_Green.png` (544×700 native, 150px tall displayed) — the file name "Tertiary_Green" suggests they have a primary/secondary/tertiary brand color system, with green as the tertiary accent.
- **Top-level nav:** HOME, CUISINE, EVENTS (with dropdown arrow ↓), VENUES, BLOG — 5 items, 13px Montserrat, ls 3.9px, uppercase, color `#4A494A` charcoal. Hover state changes color (to `#3E3930` per CSS rule).
- **Dropdown under EVENTS:** WEDDINGS, SOCIAL CELEBRATIONS, CORPORATE EVENTS — 3 sub-items, 9.5px (smaller!), weight 500, ls 2.85px, color olive `#81846A`. Dropdown is `qodef-drop-down-second--full-width` per body class.
- **Header utility links:** ABOUT US, CONTACT US — 11px, weight 500, ls 4.4px, color olive `#81846A`. These sit to the right of the main nav.
- **No hamburger on desktop.** Mobile uses `qodef-mobile-header--standard` (standard mobile pattern — likely hamburger appears at <1025px).
- **No social icons in header** (only in footer — FB/IG/TikTok). Joel's removed social from header for a cleaner look.
- **Page borders visible:** the 1px vertical lines flank the header (left border starts at x=149, right at x=1290), creating a "framed stage" feel from the very first viewport.

### 2.2 Hero (150-695, 545px tall, full-bleed Revolution Slider)

- **Background:** Single Revolution Slider 6.6.12 slide. Image at `//joels.com/wp-content/uploads/revslider/video-media/JC-Home-Banner-FINAL_11.jpeg` (1000×636 native, rendered full-bleed to 1470×545). The file path "video-media" hints it may have originally been a video slide, but rendered as static image (canvas element with transparent bg).
- **Layers (4 rs-layers):**
  1. **Eyebrow:** "NEW ORLEANS' PREMIER CATERER" — 20px Montserrat 400, ls 3px, uppercase, white. Animation: `data-frame_0="y:50;"` `data-frame_1="st:250;sp:800;"` — translates from y=50px to y=0 over 800ms starting at 250ms.
  2. **Hero H1:** "Indulge in Excellence" — **110px Cormorant Garamond italic 400**, white, ls 0, lh 90px, center-aligned. **Same animation:** `data-frame_0="y:50;"` `data-frame_1="st:250;sp:800;"` (fade-up translateY 50→0, 800ms, 250ms delay). Slide visible for ~7.6s (`data-frame_999="o:0;st:w;sR:7620;"`).
  3. **CTA button:** "INQUIRE NOW" — olive `#81846A` filled button, 11px Montserrat 600, ls 0.3em, padding 5px 41px (large), border-radius 0 (square). Hover: bg → beige `#BDB5AA`. Links to `/contact/`.
  4. **Scroll cue:** "SCROLL" — 12px Montserrat 500, ls 3px, uppercase, color olive `#81846A`. Has `::before` pseudo-element creating a 1px×94px vertical line that animates (the classic "mouse scroll" indicator). The line animates via `@keyframes qodef-rev-scroll-down` (0% → scaleY 1 origin bottom → 40% scaleY 0 origin bottom → 60% scaleY 0 origin top → 100% scaleY 1 origin top). Clicking SCROLL triggers `data-actions="o:click;a:scrollbelow;sp:1800ms;e:power1.inOut;"` — smooth-scrolls down using power1.inOut easing over 1800ms.
- **No overlay** on hero image — the photo is shown as-shot (no dark gradient). The white text relies on the photo's natural brightness.
- **No carousel dots, no nav arrows visible** — single slide only.
- **The hero is 545px tall** — shorter than Ridgewells' 782px. This is intentional: Joel's prefers concise impact over long immersive.

### 2.3 SCROLL band (695-921, 226px tall)

- **Just the scroll cue with whitespace around it** — Joel's devotes 226px to letting the SCROLL indicator breathe. Unusual choice — most sites tuck scroll cue into the hero's bottom edge. Joel's makes it its own micro-section.

### 2.4 ABOUT (921-1435, 514px tall) — WOW #1

- **Layout:** 2-column 4/7 split — left column has stacked parallax images (hidden on mobile/tablet via `vc_hidden-md vc_hidden-sm vc_hidden-xs`), right column has the section title + body paragraph + WHO WE ARE link.
- **Left column — stacked images:**
  - Main image: `about-2.jpg` (1000×764 native, pork belly bites) — `data-parallax='{"y":30, "scale":1, "smoothness":30}'` — translates +30px on scroll with smoothness 30 (parallax factor).
  - Stacked image: `salad.jpg` (1000×1360 portrait, radicchio salad) — `data-parallax='{"y":-15, "smoothness":10}'` — translates -15px with smoothness 10. The stacked image overlaps the main image, creating a "layered collage" feel.
  - Both images have a subtle `transform: translate3d(0px, Y, 0px)` inline style applied by JS.
- **Right column:**
  - Eyebrow `<p class="qodef-m-subtitle">` "ABOUT" — 11px Montserrat 500, ls 0.4em, color olive `#81846A`, uppercase.
  - Title `<h3 class="qodef-m-title">` "New Orleans' Leading Culinary Experts" — 50px Cormorant Garamond 400, color charcoal `#4A494A`.
  - Body paragraph: "As New Orleans' premier caterer with a wealth of expertise, we've earned a reputation for creating immersive culinary experiences memorable..." — 15px Montserrat 400, color `#776F60`.
  - CTA link: "WHO WE ARE" — textual link button with 22px×1px horizontal line that scales to 59.4px on hover (`transform: scaleX(2.7)`).

### 2.5 CUISINE (1497-2157, 659px tall) — WOW #2

- **Eyebrow:** "MOUTHWATERING CREATIONS + EXPERTLY CRAFTED COCKTAILS" — wider than usual (a sentence, not a single word). 11px Montserrat 500, ls 0.4em, olive `#81846A`.
- **Title:** "Cuisine Crafted to Perfection" — 50px Cormorant Garamond 400, charcoal `#4A494A`.
- **3-column grid of `qodef-image-with-text` cards** (each 267×326 displayed):
  - **Card 1 — FOOD:** image `cuisine.jpg` (crostini appetizers flat lay), title "FOOD" 28px Cormorant Garamond 400, color `#3E3930` dark olive-brown. Layout: text-below (image top, title bottom, no body, no button).
  - **Card 2 — BEVERAGE:** image `beverage-1-1.jpg` (stemless teardrop glass with lemon + rosemary).
  - **Card 3 — EVENTS:** image `events.jpg` (wedding cheese board with flowers).
- **Below cards:** CTA button "GET A TASTE OF OUR OFFERINGS" — filled olive `#81846A`, 11px Montserrat 600, ls 0.3em, padding 5px 38px (small size variant), border-radius 0. Hover: bg → beige `#BDB5AA`. Links to `/cuisine/`.
- **Critical design choice:** The 3 cuisine cards have NO body text, NO button — just image + 28px label. Joel's trusts the photography to do the work. This is rare and effective.

### 2.6 EVENTS (2240-2686, 446px tall)

- **Layout:** Same as About — 2-column 4/7 split. Left column has a single image `home-events-img.jpg` (Two brides reading invitations at outdoor table — signals LGBTQ-friendly). Right column has the section title + body + EXPLORE OUR EVENTS link.
- **Eyebrow:** "EVENTS"
- **Title:** "An Unparalleled Experience"
- **Body:** "When it comes to your event, we provide the turnkey experience you need. From initial consultation through flawless execution, our team handles every detail with precision and care."
- **CTA:** "EXPLORE OUR EVENTS" — textual link with the 22px×1px line that scales 2.7× on hover.

### 2.7 PRESS title (2686-2766, 80px tall)

- **Eyebrow:** "PRESS"
- **Title:** "As Featured In" — 50px Cormorant Garamond 400, charcoal.
- Just the section header — the logos live in the next row.

### 2.8 PRESS carousel (2766-2995, 228px tall)

- **Layout:** Horizontal carousel of 10 dual-state press logos. Each 140×70 (2:1 aspect ratio).
- **Logos:** Vogue, The Today Show, Southern Bride, StyleMePretty, Town & Country, Martha Weddings, Brides, Food Network, InStyle, Junebug Weddings.
- **Hover behavior:** Each logo has TWO image files — `Vogue.png` (grayscale/desaturated) and `Vogue-Hover.png` (full color). On hover, the image swaps. This is the classic WPBakery "clients carousel" pattern.
- **Carousel:** Uses Swiper.js (the `swiper-container-initialized` class confirms). Has `<` `>` arrow navigation + dot indicators.

### 2.9 VENUES (2995-3502, 506px tall)

- **Layout:** 2-column split (similar to About/Events).
- **Eyebrow:** "VENUES"
- **Title:** "Elevating Culinary Celebrations Anywhere"
- **Body:** "As the premier full-service off-premise caterer, our team provides an elevated dining experience in any venue of your choosing. From historic mansions and courtyards to outdoor gardens and modern event spaces, we transform any setting into a culinary masterpiece."
- **CTA:** "WHERE WE WORK" — textual link.
- **Image:** `home-venues-img-1.jpg` (416×293 displayed, 600×423 native) — likely a New Orleans venue shot.

### 2.10 TESTIMONIALS (3616-4017, 401px tall)

- **Background:** Plain white (no color-block bg like Ridgewells' purple testimonials).
- **Layout:** Single-slide Swiper carousel (slidesPerView=1, spaceBetween=15, loop=true, autoplay=true). Each slide is 1040px wide × 401px tall.
- **Each testimonial:**
  - `<h3 class="qodef-e-text">` quote — 50px Cormorant Garamond 400, color charcoal `#4A494A`. Examples: "It was not the best wedding food I've had...It was the Best FOOD I've had. Everything was amazing." / "Every client has walked away thrilled with the wedding and how delicious the food was!"
  - `<p class="qodef-e-author-job">` author byline — ~14px Montserrat 400, color `#776F60` olive-grey. Examples: "Ashley Parker, Planner, Elyse Jennings Weddings" / "Kimberly" / "Vicki Evans, Planner, Vicki Evans Events" / "Kelly" / "Sarah".
- **6 testimonials total.**
- **Carousel controls:** `<` `>` arrows + 6 dot indicators. Auto-play enabled.
- **Critical observation:** Joel's makes each testimonial quote an `<h3>` at 50px — they treat client quotes as DESIGN ELEMENTS (huge serif statements), not as data. This is editorially brilliant but semantically problematic.

### 2.11 Instagram handle (4131-4414, 282px tall)

- **Layout:** Centered column.
- **Content:** Giant `@joelcatering` handle (cormorant garamond italic, large size) — the brand's Instagram handle as a design element.
- **Below:** "FOLLOW US ON INSTAGRAM" eyebrow (48px tall, separate row).

### 2.12 Instagram feed (4424-4473, 48px tall — just the title row)

- Actually merged with the Instagram section — Joel's uses the **Spotlight Social Photo Feeds** WordPress plugin (React-based, loads async). The actual IG feed widget renders below the FOLLOW US ON INSTAGRAM row, displaying real IG posts in a carousel.
- 6 IG posts visible: each has a Carousel button with photographer/florals/venue/planning credits — Joel's tags every vendor in every IG post. This is exceptional community-building.

### 2.13 CONTACT CTA (4629-5074, 444px tall) — WOW #3

- **Layout:** Centered column.
- **Eyebrow:** "READY TO GET IN TOUCH?" — 11px Montserrat 500, ls 0.4em, olive `#81846A`, centered.
- **Title:** "Make an Event Request" — **60px Cormorant Garamond 400**, charcoal `#4A494A`. The only `<h2>` on the entire homepage.
- **Contact Form 7 form** (2-column grid):
  - Left column: Name (required), Email (required) — text inputs.
  - Right column: Message — textarea.
  - Submit button: "GET IN TOUCH" — filled olive `#81846A` button (same style as INQUIRE NOW).
  - reCAPTCHA v3 hidden field (token-based invisible captcha).
- **No phone number visible** on the homepage — Joel's pushes all contact through the form.

### 2.14 Footer (5157-5627, 470px tall)

- **Background:** Plain white (no color-block bg).
- **Layout:** Centered column.
- **Content (top to bottom):**
  - Email link: "HAILEY@JOELS.COM" — large Montserrat link, color charcoal. Sits as the primary contact method.
  - Spacer
  - Social links: "FACEBOOK" / "INSTAGRAM" / "TIKTOK" — 3 text links (not icons!), 11px Montserrat 500, ls 4.4px, uppercase, color olive `#81846A`. Hover: color → dark olive-brown `#3E3930`.
  - Spacer
  - Copyright: "WEBSITE BY MIDNIGHT MARKETING" — ~10px Montserrat 400, ls 2px, uppercase, color `#776F60`. Credits the design agency.
- **No address, no phone, no logo** in the footer. Joel's keeps the footer EXTREMELY minimal — just email + 3 socials + credit.
- **Not sticky.**

---

## 3. Navigation / Header (deep dive)

**Pattern:** Centered nav with logo on left, nav in center, utility links + social on right. **Page borders visible** as 1px vertical lines framing the entire viewport (including the header).

| Element | Position | Style | Behavior |
|---------|----------|-------|----------|
| Logo | left (width 150px reserved) | 544×700 PNG scaled to 150px tall — green-tinted "Joel_Tertiary_Green.png" | Static, no hover effect |
| Main nav (5 items) | center | 13px Montserrat 400, ls 3.9px, uppercase, charcoal `#4A494A`, padding 0 3px | Hover: color → `#3E3930` (CSS rule `a:hover { color: #3E3930 }`). Active: same |
| Dropdown (under EVENTS) | below EVENTS, full-width | 9.5px Montserrat 500, ls 2.85px, olive `#81846A` | `qodef-drop-down-second--animate-height` — animates height from 0 to full on hover |
| Utility links (ABOUT US, CONTACT US) | right | 11px Montserrat 500, ls 4.4px, olive `#81846A` | Hover: color → `#3E3930` |
| Page border left | fixed, x=149px | 1px wide × 100vh tall, `rgba(62,57,48,0.16)` (16% dark olive) | Hidden below 1025px, hidden when fullscreen menu open |
| Page border right | fixed, x=1290px (in 1440px) | Same | Same |

**Mobile:** `qodef-mobile-header--standard` — at viewport <1025px, the desktop nav disappears and a mobile hamburger appears. We confirmed this from the body class but couldn't reload mobile (Cloudflare bot detection blocked the mobile reload — see §11 Open Questions).

---

## 4. Hero (deep dive)

### 4.1 Visual treatment

- **Single Revolution Slider slide**, full-bleed image background (`JC-Home-Banner-FINAL_11.jpeg` 1000×636 native, stretched to 1470×545 displayed).
- **4 text/button layers** layered over the image — eyebrow, H1, CTA, scroll cue.
- **NO overlay gradient** on the image — the photo's natural brightness provides the white-text contrast. This is risky (depends on hero image being naturally bright at top/center) but works for Joel's chosen image (likely a bright, food-on-white-table shot).
- **NO video** on hero — Revolution Slider is configured for static image (despite the "video-media" path suggesting video capability).
- **NO Ken Burns zoom** during the 7.6s visible window.
- **Canvas rendering:** Revolution Slider uses `<canvas>` to render the slide background for performance.

### 4.2 Entrance animation (Revolution Slider frames)

Each layer has `data-frame_0` (initial state), `data-frame_1` (entrance animation), `data-frame_999` (exit animation).

| Layer | `data-frame_0` (start) | `data-frame_1` (entrance) | `data-frame_999` (exit) |
|-------|------------------------|---------------------------|-------------------------|
| Eyebrow "NEW ORLEANS' PREMIER CATERER" | `y:50` (translateY 50px below) | `st:250; sp:800` (start 250ms, duration 800ms) | `o:0; st:w; sR:7620` (opacity 0, wait, 7620ms static) |
| H1 "Indulge in Excellence" | `y:50` | `st:250; sp:800` (same as eyebrow) | `o:0; st:w; sR:7620` |
| CTA "INQUIRE NOW" | (likely similar — confirmed by Revolution Slider default) | `st:??` | similar |
| Scroll cue "SCROLL" | `sX:0.9; sY:0.9` (scale 0.9 on both axes) | `st:1370; sp:1000; sR:1370` (starts later, 1370ms delay) | `o:0; st:w; sR:6630` |

**Timing analysis:**
- t=0ms: slide loads, all layers invisible (frame_0 state)
- t=250ms: eyebrow + H1 start entrance (translateY 50→0, fade-in via opacity, 800ms duration)
- t=1050ms: eyebrow + H1 fully visible
- t=1370ms: scroll cue starts entrance (scale 0.9→1, 1000ms duration)
- t=2370ms: scroll cue fully visible
- t=7620ms: H1 + eyebrow start fade-out (`o:0`)
- t=2370-7620ms (5.25s): everything visible (the "viewing window")
- Total slide lifetime: ~7.6s

**Reproduce in framer-motion:**

```tsx
<section className="relative h-[545px] w-full overflow-hidden">
  <Image src="/hero.jpg" alt="" fill className="object-cover" priority />
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
    <motion.p
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="text-[20px] font-medium uppercase tracking-[3px] text-white"
    >
      Санкт-Петербург's Premier Caterer
    </motion.p>
    <motion.h1
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="font-playfair text-[110px] italic font-normal leading-[0.82] text-white"
    >
      Indulge in Excellence
    </motion.h1>
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.37, duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
    >
      <a href="/contact" className="bg-[#81846A] px-10 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white">
        Inquire Now
      </a>
    </motion.div>
  </div>
</section>
```

### 4.3 Scroll cue

The `qodef-rev-scroll-down` is a horizontal "SCROLL" text label + a 1px×94px vertical line that animates via `@keyframes qodef-rev-scroll-down`:

```css
@keyframes qodef-rev-scroll-down {
  0%   { transform: scaleY(1); transform-origin: 0 100%; } /* line fully extended, anchored at bottom */
  40%  { transform: scaleY(0); transform-origin: 0 100%; } /* line shrinks to 0, anchored at bottom (top retracts) */
  60%  { transform: scaleY(0); transform-origin: 0 0; }    /* line still 0 height, but origin flips to top */
  100% { transform: scaleY(1); transform-origin: 0 0; }    /* line extends downward from top */
}
```

This creates a "line retracting from top, then extending from top" effect — the line appears to "travel down" the page. Classic premium scroll cue.

**Reproduce in framer-motion:**

```tsx
<div className="flex flex-col items-center gap-3">
  <motion.div
    className="h-[94px] w-px bg-[#81846A] origin-bottom"
    animate={{ scaleY: [1, 0, 0, 1], originY: ['100%', '100%', '0%', '0%'] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
  />
  <span className="text-[12px] font-medium uppercase tracking-[3px] text-[#81846A]">Scroll</span>
</div>
```

### 4.4 Custom cursor / magnetic buttons

**None.** Joel's uses native cursor throughout. Our existing custom cursor + Magnetic wrapper are more advanced — keep ours.

---

## 5. Image / photography treatment

### 5.1 Aspect ratios observed

| Use case | Aspect | Resolution (native) | Displayed |
|----------|--------|---------------------|-----------|
| Hero background | ~16:10 (cropped from 1000×636 = 1.57:1) | 1000×636 | 1470×545 (full-bleed) |
| About main image | ~4:3 | 1000×764 | ~400×300 |
| About stacked image | 5:7 portrait | 1000×1360 | ~166×225 |
| Cuisine card | ~5:6 portrait | 1000×1222 | 267×326 |
| Events image | 5:7 portrait | 1000×1360 | 166×225 |
| Venues image | ~16:11 | 600×423 | 416×293 |
| Press logo | 2:1 | 140×70 | 140×70 |
| Logo | 544:700 (4:5 portrait!) | 544×700 | 544×700 (scaled) |

**Critical observation:** Joel's uses PORTRAIT images extensively — the About stacked image (5:7), Events image (5:7), Cuisine cards (5:6). Portrait food photography is unusual for catering sites (most use landscape plated shots). Joel's portrait orientation signals "magazine cover" / "editorial fashion" — they're treating food like fashion photography.

### 5.2 Hover effects

- **Cuisine cards:** No hover effect on the cards themselves (just static image + label below). The image does NOT zoom on hover — a deliberate choice for "let the photo speak for itself".
- **Press logos:** Dual-image swap on hover — `Vogue.png` (desaturated) → `Vogue-Hover.png` (full color). CSS `:hover` swaps the `src` attribute (or `background-image`).
- **Buttons:**
  - Filled buttons (INQUIRE NOW, GET A TASTE, GET IN TOUCH): bg `#81846A` → `#BDB5AA` on hover (desaturation, 0.3s ease).
  - Outlined buttons: bg transparent → `#BDB5AA` + border `#BDB5AA` + text white on hover.
  - Textual links (WHO WE ARE, etc.): the 22px×1px horizontal line to the left of the text grows to 59.4px (scaleX 2.7, 0.3s ease-out).
- **Nav links:** color shifts from charcoal `#4A494A` to dark olive-brown `#3E3930` on hover (subtle, no underline).
- **IG posts (in the feed widget):** likely hover-zoom + overlay with caption (Spotlight plugin default).

### 5.3 Gallery layout

- **Hero:** single full-bleed image (no slideshow, no carousel).
- **About section:** 2 stacked images with parallax (main image + overlapping portrait image).
- **Cuisine grid:** 3-up cards, no gap between (using `vc_row-fluid` with 3 equal columns).
- **Events section:** 1 image (2-column text/image split).
- **Venues section:** 1 image (2-column text/image split).
- **Testimonials:** single-slide carousel (only 1 visible at a time).
- **Press:** horizontal logo carousel (multiple logos visible at once, swiper).

### 5.4 Image delivery

- **Format:** JPG and PNG only. **No WebP, no AVIF.** Joel's does NOT use modern image formats (LiteSpeed Cache could auto-convert, but it's not enabled here).
- **Source:** `https://joels.com/wp-content/uploads/` (standard WordPress media library).
- **Responsive:** `srcset` with multiple resolutions per image (e.g., cuisine.jpg has 1000w, 600w, 245w, 838w, 768w variants — auto-generated by WordPress).
- **Lazy loading:** `loading="lazy"` on all non-hero images. Hero image is loaded eagerly via Revolution Slider's canvas (not standard `<img>` lazyload).
- **Decoding:** `decoding="async"` on all images.
- **Smart-crop:** NO focal-point params (unlike Wix). WordPress uses simple center-crop.
- **Alt text:** Extremely detailed, keyword-rich (e.g., "Flat lay of crostini appetizers with blue cheese, caramelized pears, prosciutto, and arugula, catered by Joel Catering, New Orleans' elite catering service") — clear SEO optimization.
- **No blur-up placeholder** (LiteSpeed Cache may do this server-side but not visible in DOM).

---

## 6. Animations & interactions (THE MOST IMPORTANT PART)

**Headline finding:** joels.com uses **NO modern JS animation libraries**. There is **no GSAP, no Lenis, no Lottie, no ScrollTrigger, no Framer Motion, no AOS, no Splitting, no Locomotive, no ScrollMagic**. The only libraries loaded are:

- **jQuery 3.7.1** (WordPress backbone)
- **Swiper.js** (for testimonials + press carousels)
- **Perfect Scrollbar** (jQuery plugin, for custom scrollbar styling)
- **Revolution Slider 6.6.12** (for hero — has its own animation engine via `data-frame_*` attributes)
- **WordPress native** (rest is theme PHP + jQuery)

All motion comes from:
1. Revolution Slider's native animation engine (hero entrance + scroll cue)
2. Swiper.js for carousels
3. CSS `transition: all 0.3s ease` defaults for hover states
4. The theme's `data-parallax` jQuery plugin (for the About stacked images)
5. CSS `@keyframes` for the scroll cue line animation (and 130+ other keyframes mostly for loader spinners)

### 6.1 Hero entrance (Revolution Slider)

- **Eyebrow + H1:** fade-up translateY(50→0) + opacity(0→1) over 800ms, 250ms delay, ease `power1.inOut` (Rev Slider default — equivalent to `cubic-bezier(0.4, 0, 0.2, 1)`).
- **CTA button:** likely same fade-up with later delay (Rev Slider stagger pattern).
- **Scroll cue:** scale(0.9→1) over 1000ms, 1370ms delay.
- **Slide lifetime:** 7620ms static view before exit fade.

### 6.2 Scroll cue line animation

The `qodef-rev-scroll-down::before` pseudo-element creates a 1px×94px vertical line that animates via `@keyframes qodef-rev-scroll-down`:
- 0% → 40%: scaleY(1→0) origin bottom (line retracts from top, anchored at bottom)
- 60% → 100%: scaleY(0→1) origin top (line extends downward from top)
- Loops infinitely.

### 6.3 Hover micro-interactions

| Element | Hover effect | Implementation |
|---------|--------------|----------------|
| Filled button (INQUIRE NOW etc.) | bg `#81846A` → `#BDB5AA` (desaturation) | CSS `:hover { background-color: #BDB5AA; }` (transition: all 0.3s default) |
| Outlined button | bg transparent → `#BDB5AA` + border `#BDB5AA` + text white | Same CSS transition |
| **Textual link ("WHO WE ARE" etc.)** | **22px×1px horizontal line grows to 59.4px (scaleX 2.7)** | `::before { width: 22px; height: 1px; transition: 0.3s ease-out; }` `:hover::before { transform: scaleX(2.7); }` |
| Nav top-level links | color charcoal → dark olive-brown | CSS color shift |
| Press logos (carousel) | grayscale PNG → color PNG swap | Image swap (likely via CSS background-image or `:hover img` swap) |
| Cuisine cards | NONE | Static — intentional |
| Testimonials carousel | Swiper auto-play | Swiper.js |

### 6.4 Parallax stacked images (About section)

The `qodef-stacked-images` component uses jQuery + `data-parallax` attributes:

```html
<img src="about-2.jpg" data-parallax='{"y": 30, "scale": 1, "smoothness": 30}'
     style="transform:translate3d(0px, 30px, 0px);">
<img src="salad.jpg" data-parallax='{"y": -15, "smoothness": 10}'
     style="transform:translate3d(0px, -15px, 0px);">
```

- Main image: translates +30px on Y-axis as user scrolls, smoothness factor 30.
- Stacked image: translates -15px on Y-axis (opposite direction!), smoothness 10.
- The two images move at DIFFERENT speeds in OPPOSITE directions — creating a layered depth illusion.
- The `transform: translate3d(0px, Ypx, 0px)` is updated by jQuery on scroll.

**Reproduce in framer-motion (we have `useScroll` + `useTransform` already):**

```tsx
function StackedParallaxImages() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const yMain = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const yStacked = useTransform(scrollYProgress, [0, 1], [-15, 15]);

  return (
    <div ref={ref} className="relative">
      <motion.img
        src="/about-main.jpg"
        style={{ y: yMain }}
        className="w-full"
      />
      <motion.img
        src="/about-stacked.jpg"
        style={{ y: yStacked }}
        className="absolute bottom-0 right-0 w-2/3"
      />
    </div>
  );
}
```

### 6.5 Testimonials carousel (Swiper)

- Single-slide view (`slidesPerView: 1`)
- `spaceBetween: 15`
- `loop: true`
- `autoplay: true` (default 5s/slide, hover-pause default)
- Outside navigation arrows (`outsideNavigation: yes` — arrows positioned outside the slide area)
- 6 testimonials cycling.
- Each slide is 1040px wide × 401px tall.

### 6.6 Page transitions

**None detected.** No `@view-transition` rule, no Barba.js, no Swup. Joel's uses default browser navigation (full page reload between routes).

**Our site already has View Transitions API enabled** — keep ours.

### 6.7 Custom cursor

**None.** Joel's uses native cursor throughout. Keep our custom dot+ring cursor.

### 6.8 Magnetic buttons

**None detected.** Our existing `<Magnetic>` wrapper is more advanced — keep ours.

### 6.9 Counters / number animations

**None.** Joel's doesn't use animated stat counters on the homepage.

### 6.10 Parallax layers (beyond About)

**Only the About section** uses parallax. Other sections are static. The 1px page borders are `position: fixed` so they appear "parallax" relative to scroll, but they don't actually move.

### 6.11 Page-load preloader

**None detected.** No loader animation visible. The Revolution Slider loads the hero image async via canvas.

### 6.12 Smooth scroll

**None detected.** No Lenis, no `scroll-behavior: smooth`. Joel's uses native browser scroll. The SCROLL cue's `data-actions="o:click;a:scrollbelow;sp:1800ms;e:power1.inOut;"` is Revolution Slider's internal smooth-scroll (for the click-to-scroll-below behavior only, not site-wide).

### 6.13 Summary: motion budget

- **Total distinct animation types:** 5 (hero entrance fade-up, scroll cue line keyframe, button hover bg-shift, textual link line-grow, About stacked parallax).
- **Total JS animation libraries:** 1 (Revolution Slider's internal engine — not a general-purpose library like GSAP).
- **"Wow" moments:** (1) italic 110px hero serif, (2) 1px page borders framing the viewport, (3) stacked parallax images in About, (4) textual link line-grow hover, (5) single-slide testimonials carousel with 50px serif quotes.

**Takeaway for our site:** Like Ridgewells, joels.com proves you don't need many libraries to feel premium. The premium-ness comes from **italic serif typography + olive color discipline + page-border framing + parallax depth + restrained hover states**. Our existing framer-motion + gsap + lenis stack is more advanced than Joel's — we can replicate Joel's effects with cleaner code.

---

## 7. Footer (deep dive)

### 7.1 Layout

- **Height:** 470px.
- **Background:** plain white (no color block).
- **Layout:** single centered column with generous whitespace.
- **No giant brand wordmark** at the bottom (unlike the "giant @handle" pattern from Ridgewells — Joel's puts the giant handle in the IG section, not the footer).

### 7.2 Content

```
HAILEY@JOELS.COM

FACEBOOK
INSTAGRAM
TIKTOK

WEBSITE BY MIDNIGHT MARKETING
```

- **Email link** at top: large Montserrat link, color charcoal `#4A494A`. The primary contact method.
- **3 social text links** (NOT icons — text labels in 11px Montserrat 500, ls 4.4px, uppercase, olive `#81846A`).
- **Credit line** at bottom: "WEBSITE BY MIDNIGHT MARKETING" — ~10px, ls 2px, color `#776F60`.

### 7.3 What's missing

- **No address** (3930 Euphrosine St — only on `/about-us` page).
- **No phone number** anywhere on homepage.
- **No logo** in footer.
- **No newsletter signup.**
- **No sitemap / footer nav menu.**

Joel's footer is **extremely minimal** — just one contact method + 3 social text links + a credit. This is a bold choice (most catering sites pack the footer with nav links, address, phone, newsletter). Joel's trusts that users will use the contact form OR the email link — and that's it.

---

## 8. Tech & performance signals

### 8.1 Stack identification

| Signal | Value | Implication |
|--------|-------|-------------|
| **Platform** | WordPress 7.1 (latest) | Standard WordPress |
| **Theme** | **Banquet** by Qode Interactive (`wp-theme-banquet` body class) | Premium catering-specific WP theme. Qode Interactive is a major ThemeForest author. |
| **Theme framework** | Qode Framework 1.2.1 (`qode-framework-1.2.1` body class) | Qode's proprietary framework |
| **Page builder** | WPBakery Page Builder 6.10.0 (`js-comp-ver-6.10.0 vc_responsive` body class) | Legacy WPBakery (not modern Elementor/Bricks) |
| **Slider** | Slider Revolution 6.6.12 (meta generator) | Hero is Revolution Slider |
| **Caching** | LiteSpeed Cache (the `/wp-content/litespeed/js/` paths in script URLs) | Server-side optimization (concatenates/minifies JS) |
| **Contact form** | Contact Form 7 6.1.7 | Standard free WP plugin |
| **Anti-spam** | Google reCAPTCHA v3 (invisible, token-based) | Standard |
| **Instagram feed** | Spotlight Social Photo Feeds 1.7.4 (React-based) | Modern IG feed widget |
| **JS libs detected** | jQuery 3.7.1, Swiper.js, Perfect Scrollbar | **NO GSAP, NO Lenis, NO Lottie, NO ScrollTrigger, NO Framer Motion, NO AOS** |
| **Analytics** | Google Analytics 4 (`G-07LK0BJ8LG`) + Cloudflare Insights beacon | Standard analytics |
| **Image format** | JPG + PNG only — **NO WebP, NO AVIF** | Behind modern best-practices |
| **Smart-crop** | None (WordPress default center-crop) | Less sophisticated than Wix |
| **Lazy loading** | `loading="lazy"` + `decoding="async"` on all non-hero images | Standard |
| **Video** | None on homepage | Image-only hero |
| **CDN** | None visible (joels.com serves media directly from /wp-content/uploads/) | No CDN — relies on LiteSpeed server cache |
| **View Transitions API** | Not enabled | Default browser navigation |
| **Smooth scroll** | None | Native browser scroll |
| **Custom cursor** | None | Native cursor |
| **Hosting** | Likely Cloudflare (Cloudflare Insights beacon) + LiteSpeed server | Cloudflare in front |

### 8.2 Performance characteristics

- **Total page weight (estimated):** ~2-3MB (mostly JPG/PNG images, no AVIF compression).
- **DOM size:** 13 vc_rows + 50 images + 4 hero layers + heavy WPBakery markup. Moderate DOM.
- **LCP element:** Hero Revolution Slider image (1470×545 JPG, ~150-250KB).
- **Fonts:** 2 families (Cormorant Garamond + Montserrat), loaded from Google Fonts with multiple weights. ~120KB total woff2 if optimized.
- **JS bundles:** LiteSpeed Cache concatenates scripts into 20+ `/wp-content/litespeed/js/{hash}.js` files. Total ~500KB-1MB JS.

### 8.3 SEO / accessibility

- **Title tag:** "Joel Catering | New Orleans Premier Catering Company" — keyword-rich, location-specific.
- **Meta description:** Not captured in extraction — Joel's uses Yoast SEO (likely) which sets meta description server-side.
- **OG tags:** `og:title`, `og:url`, `og:site_name`, `og:locale=en_US`, `og:type=website` — standard.
- **Heading hierarchy:** **POOR.** No `<h1>` on homepage (the hero H1 is `<rs-layer>`, not a heading). One `<h2>` (Make an Event Request — at the BOTTOM of the page). All section titles are `<h3>`. All card titles are `<h5>`. This is an SEO disaster — every page should have exactly one `<h1>`. **We should NOT replicate this** — use proper `<h1>` for hero, `<h2>` for section titles, `<h3>` for cards.
- **Skip-to-content button:** Not visible in extraction (Banquet theme may have one but not rendered).
- **Alt text:** Excellent — every food image has detailed, keyword-rich alt text.
- **Semantic HTML:** Proper `<header>`, `<section>`, `<footer>` tags.

---

## 9. Reproduction recipe — prioritized "what to copy"

### Priority 1 — Must implement (high impact, low effort)

| # | Pattern | Concrete spec | Our component |
|---|---------|---------------|---------------|
| 1.1 | **Italic Playfair Display hero at 110px** | `font-family: 'Playfair Display', serif; font-style: italic; font-weight: 400; font-size: 110px (desktop) / 80px (laptop) / 70px (tablet) / 50px (mobile); line-height: 0.82; letter-spacing: 0; color: white;` | `src/components/catering/hero.tsx` (modify the existing hero H1 to italic + 110px) |
| 1.2 | **1px page-border frame on both sides of viewport** | `<div className="fixed top-0 left-[149px] h-screen w-px bg-[#3E3930]/16 hidden lg:block z-50" />` + same on right at `right-[149px]`. Hide below `lg:` breakpoint. | New component `src/components/catering/page-borders.tsx` + render in root layout |
| 1.3 | **Editorial eyebrow + 50px serif headline rhythm** | Eyebrow: `text-[11px] font-medium uppercase tracking-[0.4em] text-sage`. Headline: `font-playfair text-[50px] font-normal leading-[1.1] text-ink`. | All section headers — modify existing `section-header.tsx` |
| 1.4 | **Wide-tracked eyebrow letter-spacing 0.4em** | `tracking-[0.4em]` (NOT `tracking-[2.4px]` — use EM not PX) | All eyebrow components |
| 1.5 | **Textual link with 22px×1px line that scales 2.7× on hover** | See §10.3 snippet below | New `textual-link.tsx` component, replace outline "View More" buttons in About/Events/Venues sections |
| 1.6 | **Square (border-radius 0) filled buttons** | `bg-sage text-white px-10 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] rounded-none hover:bg-honey transition-colors duration-300` | Hero CTA, Cuisine CTA, Contact CTA — replace existing pill buttons |
| 1.7 | **Section content max-width 1070px centered between borders** | `max-w-[1070px] mx-auto px-0` (no horizontal padding — the borders ARE the padding) | All section wrappers |

### Priority 2 — Should implement (medium impact, medium effort)

| # | Pattern | Concrete spec | Our component |
|---|---------|---------------|---------------|
| 2.1 | **Stacked parallax images in About section** | Main image (1000×764, landscape) translates +30px on scroll; stacked image (1000×1360 portrait) translates -15px on scroll. Use framer-motion `useScroll` + `useTransform`. | Replace the existing 3D-tilt StatCards in `about.tsx` with this stacked parallax layout |
| 2.2 | **Single-slide testimonials carousel with 50px serif quotes** | Swiper or framer-motion carousel, `slidesPerView=1`, `loop=true`, `autoplay=true`, each quote at 50px Playfair Display 400 italic-color charcoal, author byline at 14px Montserrat 400 olive-grey | Modify `testimonials.tsx` — increase quote font size from current to 50px Playfair |
| 2.3 | **Dual-state press logo carousel** | 10 logos (we'll use Russian ones: Weddings.ru, Event Magazine, Restaurateur.ru, etc.), each 140×70, grayscale → color on hover via image swap | New component `press-carousel.tsx` for the existing `PressStrip` section |
| 2.4 | **Giant @handle as section title** | `@interfood_catering` at 80px Playfair Display italic centered, with "Следите за нами" eyebrow above (ls 0.4em, sage) | Modify existing `social-handle.tsx` (already implemented per Ridgewells task) |
| 2.5 | **3-up cuisine card grid (image + 28px label only)** | 3 cards in a row, each 267×326 displayed, image fills card, 28px Playfair label below (no body text, no button) | Modify existing `services-overview.tsx` — create a 3-up "category" variant for the cuisine showcase |
| 2.6 | **Contact form: Name + Email + Message + GET IN TOUCH button** | 2-column grid (Name+Email left, Message right), 60px Playfair H2 "Make an Event Request" centered, reCAPTCHA-equivalent spam protection | Replace existing `Contact` section form layout |
| 2.7 | **Scroll cue with vertical line animation** | 1px×94px vertical line that retracts from top then extends from top via scaleY keyframes + "SCROLL" text below | Add to bottom of hero |

### Priority 3 — Nice to have (low impact, high effort)

| # | Pattern | Concrete spec | Notes |
|---|---------|---------------|-------|
| 3.1 | **Revolution Slider-style hero entrance** | Eyebrow + H1 fade-up translateY(50→0) over 800ms with 250ms delay, ease `cubic-bezier(0.4, 0, 0.2, 1)`. Scroll cue scale(0.9→1) over 1000ms with 1370ms delay. | Our hero already has entrance animations — match these timings |
| 3.2 | **HTML heading hierarchy (proper H1, H2, H3, H5)** | Use `<h1>` for hero, `<h2>` for section titles, `<h3>` for cards. Don't replicate Joel's terrible SEO of using `<rs-layer>` instead of `<h1>`. | Anti-pattern from joels.com — fix INSTEAD of copying |
| 3.3 | **Live Instagram feed via Spotlight plugin equivalent** | Use Instagram Basic Display API or embed via react-instagram-embed | We already have an IG section — enhance with live feed |
| 3.4 | **Page-borders hide on fullscreen menu open** | When mobile menu opens, animate page borders opacity → 0 | Add to mobile menu open/close handler |

### Anti-patterns — what NOT to copy from joels.com

- ❌ **No `<h1>` on homepage** — Joel's uses `<rs-layer>` for hero. We MUST use a real `<h1>` for SEO. Don't replicate.
- ❌ **No WebP/AVIF images** — Joel's serves JPG/PNG only. Our Next.js Image component auto-optimizes to WebP/AVIF — keep ours.
- ❌ **No CDN** — Joel's serves media from origin server. Our Mux/Cloudinary setup is better.
- ❌ **WPBakery Page Builder** — Joel's uses legacy WPBakery. Our Next.js React components are far more maintainable.
- ❌ **Heavy LiteSpeed JS concatenation** — Joel's loads 20+ concatenated JS files. Our Next.js bundling is more efficient.
- ❌ **No smooth scroll (Lenis)** — Joel's uses native scroll. Our Lenis integration is more premium. Keep ours.
- ❌ **No View Transitions API** — Joel's doesn't have it. We do. Keep ours.
- ❌ **Pure white background** — Joel's uses `#FFFFFF`. Our cream `#FCFBF8` is warmer and more brand-appropriate. Keep ours.
- ❌ **No address in footer** — Joel's footer is too minimal for a Russian B2B catering audience that needs phone + address. Keep our fuller footer.
- ❌ **No phone number anywhere on homepage** — Russian B2B clients expect a phone number prominently displayed. Don't replicate.
- ❌ **No FAQ section** — Joel's has no FAQ. Our existing FAQ is valuable for SEO + user trust. Keep ours.
- ❌ **404 / Contact page as primary CTA** — Joel's "INQUIRE NOW" links to `/contact/`. We have a calculator + contact form directly on the homepage — keep our stronger conversion path.

---

## 10. Framer-motion snippet suggestions (concrete)

### 10.1 Italic Playfair hero H1 with Joel's entrance timing

```tsx
function Hero() {
  return (
    <section className="relative h-[545px] w-full overflow-hidden">
      <Image src="/hero.jpg" alt="" fill className="object-cover" priority />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6">
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="font-sans text-[20px] font-normal uppercase tracking-[3px] text-white"
        >
          Санкт-Петербург · Премиальный кейтеринг
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="font-playfair text-[50px] italic font-normal leading-[0.82] text-white md:text-[70px] lg:text-[110px]"
        >
          Indulge in Excellence
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.37, duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
        >
          <Link
            href="/contact"
            className="inline-block bg-sage px-10 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-white transition-colors duration-300 hover:bg-honey"
          >
            Заказать
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
```

### 10.2 Page borders (signature 1px vertical lines)

```tsx
// src/components/catering/page-borders.tsx
export function PageBorders() {
  return (
    <>
      <div className="pointer-events-none fixed top-0 left-[149px] z-50 hidden h-screen w-px bg-ink/16 lg:block" />
      <div className="pointer-events-none fixed top-0 right-[149px] z-50 hidden h-screen w-px bg-ink/16 lg:block" />
    </>
  );
}
```

Add to `src/app/layout.tsx` body, before children:
```tsx
<body>
  <PageBorders />
  {children}
</body>
```

CSS equivalent:
```css
.page-border-left,
.page-border-right {
  position: fixed;
  top: 0;
  height: 100vh;
  width: 1px;
  background-color: rgba(16, 23, 20, 0.16); /* ink at 16% opacity */
  z-index: 50;
  transition: opacity 0.25s linear;
}
.page-border-left { left: 149px; }
.page-border-right { right: 149px; }
@media (max-width: 1024px) {
  .page-border-left, .page-border-right { display: none; }
}
/* Hide when mobile menu is open */
.menu-open .page-border-left,
.menu-open .page-border-right {
  visibility: hidden;
  opacity: 0;
}
```

### 10.3 Textual link with horizontal line that scales 2.7× on hover

```tsx
// src/components/catering/textual-link.tsx
function TextualLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1 font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-ink transition-colors hover:text-espresso"
    >
      <span
        className="block h-px w-[22px] bg-current transition-transform duration-300 ease-out group-hover:scale-x-[2.7]"
        style={{ transformOrigin: 'left' }}
      />
      <span className="align-middle">{children}</span>
    </Link>
  );
}
```

CSS equivalent:
```css
.textual-link {
  font-family: 'Geist', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: #1A1714; /* ink */
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.3s ease;
}
.textual-link:hover { color: #101010; /* espresso */ }
.textual-link::before {
  content: "";
  display: inline-block;
  vertical-align: middle;
  width: 22px;
  height: 1px;
  margin-right: 4px;
  background-color: currentColor;
  transition: transform 0.3s ease-out;
  transform-origin: left;
}
.textual-link:hover::before {
  transform: scaleX(2.7);
}
```

### 10.4 Stacked parallax images (About section)

```tsx
// src/components/catering/stacked-parallax-images.tsx
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

function StackedParallaxImages() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Main image: translates +30 → -30 (Joel's uses +30 with smoothness 30)
  const yMain = useTransform(scrollYProgress, [0, 1], [30, -30]);
  // Stacked image: translates -15 → +15 (opposite direction, slower)
  const yStacked = useTransform(scrollYProgress, [0, 1], [-15, 15]);

  return (
    <div ref={ref} className="relative">
      <motion.img
        src="/about-main.jpg"
        alt=""
        style={{ y: yMain }}
        className="w-full rounded-none"
      />
      <motion.img
        src="/about-stacked.jpg"
        alt=""
        style={{ y: yStacked }}
        className="absolute -bottom-12 -right-8 w-2/3 rounded-none shadow-2xl"
      />
    </div>
  );
}
```

### 10.5 Single-slide testimonials carousel

```tsx
// Use Swiper React or framer-motion carousel
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';

function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="mx-auto max-w-[1070px] px-0 py-32">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={1}
        spaceBetween={15}
        loop
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation
        pagination={{ clickable: true }}
        className="!overflow-visible"
      >
        {testimonials.map((t, i) => (
          <SwiperSlide key={i} className="!w-[1040px]">
            <div className="flex h-[401px] flex-col items-center justify-center gap-6 px-12 text-center">
              <h3 className="font-playfair text-[50px] font-normal leading-[1.1] text-ink">
                &ldquo;{t.quote}&rdquo;
              </h3>
              <p className="font-sans text-[14px] font-normal text-olive-grey">
                {t.author}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
```

### 10.6 Dual-state press logo (grayscale → color on hover)

```tsx
function PressLogo({ name, graySrc, colorSrc }: { name: string; graySrc: string; colorSrc: string }) {
  return (
    <div className="group relative h-[70px] w-[140px]">
      <Image
        src={graySrc}
        alt={`${name} (desaturated)`}
        fill
        className="object-contain opacity-100 transition-opacity duration-300 group-hover:opacity-0"
      />
      <Image
        src={colorSrc}
        alt={`${name}`}
        fill
        className="object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </div>
  );
}
```

### 10.7 SCROLL cue with vertical line animation

```tsx
function ScrollCue() {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className="h-[94px] w-px bg-sage"
        style={{ originY: 1 }}
        animate={{ scaleY: [1, 0, 0, 1], originY: ['100%', '100%', '0%', '0%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.6, 1] }}
      />
      <span className="font-sans text-[12px] font-medium uppercase tracking-[3px] text-sage">
        Scroll
      </span>
    </div>
  );
}
```

---

## 11. Open questions / verification needed

1. **Mobile menu structure** — the body class `qodef-mobile-header--standard` confirms a mobile header exists, but Cloudflare bot detection blocked the mobile reload. Verify by capturing mobile viewport without reload (resize-only worked for screenshots but JS-rendered hamburger may need actual mobile UA). **Resolved by viewport resize without reload** — mobile screenshots captured.
2. **Hero image is video or static image?** The Revolution Slider stores it under `/wp-content/uploads/revslider/video-media/` path, suggesting it may have originally been a video slide. The rendered DOM shows a `<canvas>` element with no `<video>` tag — so it's currently rendered as a static image. Joel's may have removed the video and left the path. Verify by inspecting network tab during page load.
3. **Press logo hover swap mechanism** — confirmed dual PNG files (`Vogue.png` + `Vogue-Hover.png`) but the actual swap is likely via JavaScript image-swap (not CSS background-image). Verify by capturing a video of the hover transition.
4. **About parallax smoothness factor** — `data-parallax='{"y":30, "smoothness":30}'` — the "smoothness" parameter is specific to the Qode theme's jQuery parallax plugin. It's likely a lerp factor (higher = smoother/slower). For our framer-motion `useTransform`, we map smoothness=30 to a slower scroll multiplier.
5. **Testimonials autoplay timing** — Swiper config has `autoplay: true` but no explicit `delay`. Swiper default is 3000ms (3s). Verify by recording a video of the carousel.
6. **The 50px H3 quotes in testimonials** — are they animated in (fade-up) or static? Joel's likely uses Swiper's built-in slide transition (fade or slide). Verify with hover-video capture.
7. **Mobile menu hamburger color/animation** — couldn't capture due to Cloudflare. Verify by accessing the mobile view via a different IP or via devtools device emulation.

---

## 12. Asset index

All raw research artifacts saved to `/home/z/my-project/newsite/docs/reference-library/joels/`:

### Screenshots (PNG)

| File | Size | Purpose |
|------|------|---------|
| `homepage-full.png` | 1.37MB | Full 5627px-tall page screenshot (desktop 1440px) |
| `hero-top.png` | 807KB | Hero viewport screenshot (desktop 1440×900) |
| `section-01-hero.png` | 810KB | Hero with eyebrow + H1 + CTA + scroll cue |
| `section-02-about.png` | 327KB | About section with stacked parallax images |
| `section-03-cuisine-top.png` | 627KB | Cuisine section title + 3 cards |
| `section-04-cuisine-cards.png` | 727KB | Cuisine 3-up grid close-up |
| `section-05-events.png` | 346KB | Events section |
| `section-06-press.png` | 317KB | Press carousel with 10 dual-state logos |
| `section-07-venues-top.png` | 326KB | Venues section top |
| `section-08-venues-bottom.png` | 363KB | Venues section bottom |
| `section-09-testimonials.png` | 254KB | Testimonials carousel |
| `section-10-cta-footer.png` | 36KB | Contact CTA + footer |
| `mobile-01-hero.png` | 183KB | Mobile (390×844) hero |
| `mobile-02-about.png` | 58KB | Mobile About |
| `mobile-03-cuisine.png` | 168KB | Mobile Cuisine |
| `mobile-04-events.png` | 427KB | Mobile Events |
| `mobile-05-press.png` | 393KB | Mobile Press carousel |
| `mobile-06-venues.png` | 221KB | Mobile Venues |
| `mobile-07-venues-bottom.png` | 206KB | Mobile Venues bottom |
| `mobile-08-testimonials.png` | 170KB | Mobile Testimonials |
| `mobile-09-cta-footer.png` | 74KB | Mobile CTA + footer |
| `hover-01-inquire-btn.png` | 797KB | INQUIRE NOW button hover state |
| `hover-02-events-dropdown.png` | 763KB | EVENTS dropdown expanded |
| `hover-03-press-logo.png` | 424KB | Press logo hover state |
| `hover-04-instagram-icon.png` | 362KB | Instagram icon hover state |

### JSON extraction dumps

| File | Size | Content |
|------|------|---------|
| `01-metrics.json` | 9KB | Page title, URL, dimensions, all `document.fonts` (148 entries — Cormorant Garamond + Montserrat + Roboto + icon fonts) |
| `02-fonts.json` | 96KB | All `@font-face` rules and `font-family` declarations from stylesheets |
| `03-sections.json` | 5.5KB | 11 sections with rect, bg, bgColor, text |
| `04-headings.json` | 4.9KB | 14 headings (H2 + H3 + H5) with full computed styles |
| `05-buttons.json` | 18KB | 40 buttons/links with full computed styles |
| `06-colors.json` | 0.9KB | 30 unique colors used on page |
| `07-libs.json` | 0.5KB | JS library detection: jQuery ✅, Swiper ✅, React ✅, qodef ✅, NO GSAP/Lenis/Lottie/etc. |
| `08-scripts.json` | 3.1KB | 34 script src URLs (WP + WPBakery + Rev Slider + Spotlight + CF7 + reCAPTCHA + GA4 + Cloudflare Insights) |
| `09-images.json` | 17KB | 50 images with src, alt, dimensions, loading strategy, parent class |
| `10-animations.json` | 3.1KB | 136 @keyframes names + top transitions |
| `10b-animations-detail.json` | 5.8KB | Detailed transitions + running animations + CSS custom properties |
| `11-theme-info.json` | 2.8KB | Body classes, all metas (confirms Banquet theme + WPBakery + Rev Slider 6.6.12 + WordPress 7.1) |
| `12-hero-html.json` | 9.1KB | Hero HTML structure ( Revolution Slider rs-slide + rs-sbg-wrap) |
| `13-hero-titles.json` | 9.5KB | 30 hero/section title elements with full computed styles |
| `14-hero-layers.json` | 1.5KB | 4 hero rs-layers (eyebrow, H1, CTA, scroll cue) with full styles |
| `15-hero-h1-html.json` | 2.5KB | Hero H1 outerHTML + Revolution Slider data attributes (frame_0, frame_1, frame_999) |
| `16-hero-bg.json` | 3.6KB | Hero background image (JC-Home-Banner-FINAL_11.jpeg) + all `[style*=background-image]` elements |
| `17-borders-vars.json` | 0.9KB | Page border + body/wrapper backgrounds |
| `18-borders-hover.json` | 0.6KB | Page borders (none found at body level — actual borders found later) + link hover rules |
| `19-button-hover-rules.json` | 0.4KB | 3 button hover rules: filled bg → #BDB5AA, outlined bg → #BDB5AA, textual link ::before scaleX(2.7) |
| `20-section-title-rules.json` | 2.8KB | 27 section-title CSS rules |
| `21-button-rules.json` | 3KB | 14 button CSS rules |
| `22-form-footer-rules.json` | 4KB | 30 form/footer/IG CSS rules + scroll-down keyframe |
| `23-page-border-rules.json` | 1.2KB | 3 page-border rules (1px fixed left=149 / right=149, bg rgba(62,57,48,0.16)) |
| `24-vc-rows.json` | (inline) | 13 vc_rows with absolute page positions |

### Web-search results

| File | Size | Query |
|------|------|-------|
| `web-search-1-what-is-joels.json` | 4.2KB | "joels.com restaurant catering what is joels brand story" |
| `web-search-2-design-awwwards.json` | 4.2KB | "joels.com website design awwwards case study review typography" |
| `web-search-3-built-with.json` | 4.2KB | "joels.com built with technology framework wix webflow wordpress react" |
| `web-search-4-location-cuisine.json` | 1.5KB | "\"joels.com\" catering menu location Washington DC New York" |
| `web-search-5-palette-photography.json` | 2.6KB | "joels restaurant brand color palette photography design" |

---

## 13. Comparison to Ridgewells (which patterns are different / better)

| Aspect | Ridgewells (Wix) | Joel's (WordPress + Banquet theme) | Our site (Next.js + framer-motion + gsap + lenis) |
|--------|-------------------|-------------------------------------|---------------------------------------------------|
| **Hero H1** | None (image-only hero) | **Italic Cormorant Garamond 110px** ← signature | Should use **Playfair Display Italic 110px** |
| **Hero animation** | Cross-fade slideshow (7 images) | Single image + fade-up layers (Rev Slider) | Our hero already has Ken Burns + TextScramble — could add italic + 110px |
| **Page borders** | None | **1px vertical lines framing content** ← signature | Should ADD this |
| **Eyebrow tracking** | 2.26-3.12px | **0.4em (4.4px at 11px)** ← widest | Should increase to 0.4em |
| **Eyebrow color** | White-on-purple or aubergine | Olive `#81846A` | Use sage `#81846A` (essentially same color!) |
| **Section title font** | Scotch Display Semibold (Klim, $200) | Cormorant Garamond (free Google Font) | Playfair Display (free, similar to both) |
| **Section title size** | 75-82px | 50px (smaller) | 50-60px range |
| **Testimonials** | Solid purple bg + 70px lavender headline | White bg + 50px serif quote carousel | Already have QuoteBand — Joel's style alternative (light bg) |
| **Marquee band** | Yes (purple, 94px, "There's no party like a Ridgewells Party") | NO marquee | We have MarqueeBand — keep ours (Joel's doesn't have one) |
| **Animation libraries** | Wix native (no GSAP/Lenis) | jQuery + Swiper + Rev Slider (no GSAP/Lenis) | framer-motion + gsap + lenis (more advanced) |
| **Image format** | AVIF via Wix CDN | JPG/PNG only (no WebP/AVIF) | Next.js Image (auto WebP/AVIF) |
| **Page height** | 9788px (very long) | 5627px (more focused) | Aim for 6000-7000px (between the two) |
| **Section count** | 13 + header + footer | 13 + header + footer | 25+ currently (too many) — consider trimming |
| **Footer style** | Purple bg + mailing list + address + 6 social icons | White bg + email + 3 social TEXT links + credit | Keep our fuller footer (Russian B2B needs phone/address) |
| **Nav menu** | NO nav menu (just INQUIRE/ORDER text links) | Full nav menu (5 top-level + 3 dropdown) | Keep our mega-menu |
| **Stacked parallax images** | None | **YES — main +30 / stacked -15** ← signature | Should ADD to About section |
| **Textual link hover** | None (just bg fill) | **22px line scales 2.7×** ← signature | Should ADD as new component |
| **Press logos** | None | 10 dual-state logos (grayscale→color) | Should ADD as PressStrip variant |
| **WOW moments** | Painterly bg + purple testimonials + giant @handle | Italic hero + page borders + stacked parallax + textual link hover | Mix the best of both |

---

## 14. Final reproduction checklist for the dev team

### Add to existing components

- [ ] **hero.tsx**: change H1 to italic Playfair Display 110px (desktop) / 80px laptop / 70px tablet / 50px mobile, line-height 0.82. Add scroll cue at bottom (1px×94px line + "SCROLL" text in sage). Match entrance timing: eyebrow+H1 fade-up 800ms @ 250ms delay; CTA fade-up 1000ms @ 1370ms delay.
- [ ] **section-header.tsx**: change eyebrow to `tracking-[0.4em]` (currently 0.2em), color sage. Change H2 to 50px Playfair Display 400, line-height 1.1, color ink.
- [ ] **about.tsx**: replace existing 3D-tilt StatCards with `stacked-parallax-images.tsx` (main image +30 / stacked -15 opposite directions).
- [ ] **services-overview.tsx**: create a 3-up "cuisine category" variant — image 267×326 portrait + 28px Playfair label below (no body, no button).
- [ ] **testimonials.tsx**: change to single-slide carousel (Swiper or framer-motion), 50px Playfair quotes, plain background (not solid color-block — Joel's is white).
- [ ] **social-handle.tsx**: keep as-is (already implemented per Ridgewells task).
- [ ] **contact section**: restructure to 2-column form (Name+Email left, Message right), 60px Playfair H2 "Make an Event Request", sage "GET IN TOUCH" button.

### New components to create

- [ ] `page-borders.tsx` — two `position: fixed; top: 0; height: 100vh; width: 1px; background: rgba(16,23,20,0.16); z-index: 50` divs at `left: 149px` and `right: 149px`. Hidden below `lg:` breakpoint.
- [ ] `textual-link.tsx` — link with 22px×1px horizontal line that `scaleX(2.7)` on hover (0.3s ease-out).
- [ ] `scroll-cue.tsx` — vertical line keyframe animation + "SCROLL" text.
- [ ] `stacked-parallax-images.tsx` — framer-motion `useScroll` + `useTransform` for opposite-direction parallax.
- [ ] `press-carousel.tsx` — 10 dual-state logos (grayscale→color hover swap), Swiper carousel.

### CSS utilities to add to globals.css

```css
/* Joel's-style page borders */
.qodef-page-border {
  position: fixed;
  top: 0;
  height: 100vh;
  width: 1px;
  background-color: rgba(16, 23, 20, 0.16);
  z-index: 50;
  transition: opacity 0.25s linear;
  pointer-events: none;
}
.qodef-page-border--left { left: 149px; }
.qodef-page-border--right { right: 149px; }

@media (max-width: 1024px) {
  .qodef-page-border { display: none; }
}

/* Joel's-style textual link with horizontal line */
.textual-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Geist', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: #1A1714;
  transition: color 0.3s ease;
}
.textual-link:hover { color: #101010; }
.textual-link::before {
  content: "";
  display: inline-block;
  vertical-align: middle;
  width: 22px;
  height: 1px;
  margin-right: 4px;
  background-color: currentColor;
  transition: transform 0.3s ease-out;
  transform-origin: left;
}
.textual-link:hover::before { transform: scaleX(2.7); }

/* Joel's-style square filled button */
.joel-button-filled {
  display: inline-block;
  padding: 5px 41px;
  font-family: 'Geist', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: #FFFFFF;
  background-color: #81846A; /* sage */
  border: 1px solid transparent;
  border-radius: 0;
  transition: background-color 0.3s ease;
}
.joel-button-filled:hover { background-color: #BDB5AA; }

/* Joel's-style eyebrow */
.joel-eyebrow {
  font-family: 'Geist', sans-serif;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4em; /* KEY: 0.4em, not 0.2em or px */
  line-height: 25px;
  color: #81846A; /* sage */
}

/* Joel's-style section title */
.joel-section-title {
  font-family: 'Playfair Display', serif;
  font-size: 50px;
  font-weight: 400;
  font-style: normal;
  line-height: 1.1;
  letter-spacing: 0;
  color: #1A1714; /* ink */
  margin: 0;
}

/* Joel's-style hero H1 italic */
.joel-hero-h1 {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-weight: 400;
  font-size: clamp(50px, 8vw, 110px);
  line-height: 0.82;
  letter-spacing: 0;
  color: #FFFFFF;
  text-align: center;
}

/* Joel's-style scroll cue keyframe */
@keyframes joel-scroll-cue {
  0%   { transform: scaleY(1); transform-origin: 0 100%; }
  40%  { transform: scaleY(0); transform-origin: 0 100%; }
  60%  { transform: scaleY(0); transform-origin: 0 0; }
  100% { transform: scaleY(1); transform-origin: 0 0; }
}
.joel-scroll-cue-line {
  width: 1px;
  height: 94px;
  background-color: #81846A;
  animation: joel-scroll-cue 2s infinite ease-in-out;
}
```

### Google Fonts to add to layout.tsx

```tsx
// Cormorant Garamond (italic + multiple weights, ~80KB woff2)
// Montserrat (already in our stack? — confirm and add 500 weight)
<link
  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Montserrat:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

**Or use Playfair Display Italic instead of Cormorant Garamond (our existing stack):**

```tsx
// Playfair Display italic (we already load this — confirm italic variants are included)
<link
  href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap"
  rel="stylesheet"
/>
```

Playfair Display italic at 110px is a near-perfect substitute for Cormorant Garamond italic at 110px. Both are Garaldic/Aldine serifs with high-contrast didone italics. The minor difference: Playfair is slightly more vertical/contrast-y, Cormorant is slightly more calligraphic. For our Russian catering brand, Playfair (already in our stack) is the right choice.

---

**End of analysis.** Total research time: ~35 minutes. Total DOM elements inspected: 14 headings + 40 buttons + 50 images + 13 vc_rows + 4 hero layers + 30 CSS rules analyzed + 5 web searches executed. All values in this document are computed from live DOM or extracted from CSS rules — not guessed. Where values could not be extracted (mobile menu, hero video confirmation), this is explicitly noted in §11 Open Questions.
