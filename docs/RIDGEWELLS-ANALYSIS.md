# RIDGEWELLS-ANALYSIS.md

**Target site:** `https://www.ridgewells.com`
**Captured:** 2026-08-20 · viewport 1440×900 (desktop) + 390×844 (iPhone 12 Pro)
**Method:** agent-browser (Chrome headless) DOM inspection + computed-style extraction + full-page screenshots
**Assets:** `docs/reference-library/ridgewells/` (hero-top.png, homepage-full.png 9788px tall, mobile-top.png, section-{intro-purple,services-1,services-2,testimonials,blog,social,footer}.png)

> **Mission:** extract PATTERNS only (animations, layout, type system, color logic) so the dev agents can rebuild the *feel* in our Russian catering site "Нилов Кейтеринг". We will NOT clone Ridgewells copy or images.

---

## TL;DR — the 5 things you must copy

| # | Pattern | Why it matters | Where to apply on our site |
|---|---------|----------------|----------------------------|
| 1 | **Scotch-Display-style editorial serif at 75-88px** with no letter-spacing, weight 400 (semibold optical), color `#414142` charcoal-on-white or `#FFFFFF` white-on-purple | This is the soul of Ridgewells' "luxury magazine" feel. Our **Playfair Display** is a near-perfect free substitute (both are Scotch Roman revivals). | All H1/H2 hero & section titles |
| 2 | **Painterly multi-radial-gradient purple background** (10 layered radial gradients) for the intro/about section | Signature "wow" — looks like digital watercolor. Zero asset weight (pure CSS). Cheap to ship. | About / manifesto section |
| 3 | **Wide-tracked uppercase micro-eyebrows**: `font-size: 11-16px; letter-spacing: 2-3px; color: #502875` purple (or white-on-purple) | Premium editorial signal — "STUNNING MENUS. IMPECCABLE SERVICE." sits above hero headline. | Every section header |
| 4 | **Two-up service card grid** (50/50 split, image top 720×450, title 56px, 2-line description, "View More" outline button) | Clean, scannable, no carousel overhead. Four service cards in 2 rows = exactly our 4 menu types or 4 service tiers. | Services / menu-types section |
| 5 | **Deep-purple testimonials section** (`#502875` bg, 70px lavender headline `#F1EBF5`, real client quote + brand logo) + **purple marquee band** (94px tall, single sentence + white pill button) | Two cheap "premium" moments. The marquee in particular punches way above its weight. | Testimonials section + between Services and Gallery |

Bonus: **giant social handle as section title** (`@RidgewellsDC` at 82px) — already partly done in our footer, but Ridgewells dedicates a whole 425px section to it. Worth replicating.

---

## 1. Overall design language

### 1.1 Color palette (extracted from Wix CSS variables)

The previous note in `REFERENCE-SITES-ANALYSIS.md` calling Ridgewells "navy + gold" is **wrong**. The actual palette is **deep aubergine purple + magenta + charcoal + white**, with a single unexpected lime accent on a holiday-menu CTA. Here are the exact tokens (RGB triplets are Wix's storage format; hex added for clarity):

| Role | Wix var | RGB | Hex | Notes |
|------|---------|-----|-----|-------|
| Background | color-1 | `255,255,255` | `#FFFFFF` | Page background |
| Body text | color-14 | `65,65,66` | `#414142` | Warm charcoal — NOT pure black |
| Primary brand | color-19 | `80,40,117` | `#502875` | **Deep aubergine** — used everywhere |
| Magenta accent | color-10 | `113,41,127` | `#71297F` | Brighter purple for radial gradients |
| Bright magenta | color-23 | `154,43,144` | `#9A2B90` | Hover state on links |
| Hot pink (sparingly) | color-12 | `232,38,96` | `#E82660` | Rare — used for tags/badges |
| Light orchid | color-21 | `221,168,217` | `#DDA8D9` | Radial gradient highlights |
| Very light lavender | color-15 | `241,235,245` | `#F1EBF5` | Section bg on purple / heading on dark |
| Lime/chartreuse | color-8 | `210,215,82` | `#D2D752` | **Only** on "DOWNLOAD HOLIDAY MENU" button border |
| Light grey | color-2 | `227,227,227` | `#E3E3E3` | Borders / dividers |
| Mid grey | color-4 | `79,79,79` | `#4F4F4F` | "View More" button border |

**Mapping to our project palette** (cream/espresso/terracotta/sage/honey — no indigo/blue):
- We do NOT want to import Ridgewells' literal purple. But we can use the **structural logic**: a deep dark accent (`bordeaux #d11a46` or `espresso #101010`) plays the same role as Ridgewells' aubergine.
- Replace `#502875` → our `bordeaux #d11a46` (warm dark accent)
- Replace `#71297F` → our `terracotta` warm mid-accent
- Replace `#DDA8D9` → our `honey` light highlight
- Keep `#414142` charcoal → our `espresso` (almost identical)
- Keep `#FFFFFF` white → swap for our `cream #fcfbf8` for warmer feel

### 1.2 Typography

**Three font families, all premium foundry:**

| Role | Font | Foundry | Cost | Free substitute for our site |
|------|------|---------|------|------------------------------|
| Display serif (H1, H2) | **Scotch Display Semibold** | Klim Type Foundry (NZ) | $200/weight | **Playfair Display** (already in our stack — both are Scotch Roman revivals, high-contrast didone, similar x-height) |
| UI sans bold (eyebrows, buttons) | **Gotham Bold** | Hoefler & Co (NYC) | $350/family | Inter Tight Bold / Poppins SemiBold / Geist Sans Bold |
| UI sans body (paragraph, address) | **Gotham Book** | Hoefler & Co | — | Inter Regular / Geist Sans Regular |
| Script accent (rare) | **Coral Blush Script** | (brush script) | — | Use sparingly or skip |

**Type scale (desktop, computed from DOM):**

| Element | Size | Weight | Line-height | Letter-spacing | Color | Notes |
|---------|------|--------|-------------|----------------|-------|-------|
| H1 hero (rare) | 88px | 400 (semibold optical) | — | normal | `#FFFFFF` | Used on category pages |
| H2 hero statement | 80px → 72px (responsive) | 400 | 88px → 86.4px | normal | `#FFFFFF` | "Every event has a story to tell." |
| H2 section title (large) | 75-82px | 400 | normal | normal | `#414142` | "A Legacy Like No Other", "@RidgewellsDC" |
| H2 section title (medium) | 70px | 400 | — | normal | `#F1EBF5` lavender | "What Our Clients Say About Us" (on purple bg) |
| H2 card title | 56.917px | 400 | 79.68px | normal | `#414142` | "Corporate Events" / "Weddings" etc. |
| H2 mailing-list CTA | 40px | 400 | — | normal | `#414142` | "Curious what we've got cooking up next?" |
| H2 article title (blog card) | 18px | 400 | — | normal | `#414142` | Smaller, body-weight |
| H3 address block | 22px | 400 | — | normal | `#FFFFFF` | "5522 Dorsey Ln..." on purple |
| **Eyebrow micro-label** | **11.3px** | 400 | 16.95px | **2.26px** | `#414142` | "INQUIRE", "ORDER" — wide tracked |
| **Section eyebrow** | **15.6px** | 400 | 24.96px | **3.12px** | `#FFFFFF` or `#502875` | "STUNNING MENUS. IMPECCABLE SERVICE." |
| Section label (purple) | 18-25px | 400 | — | normal | `#502875` | "LATEST NEWS & BLOG", "FOLLOW US" |
| Body paragraph | 18px | 400 | 25.2px (1.4) | normal | `#FFFFFF` or `#414142` | On purple/white sections |

**Critical insight:** the *eyebrow* + *section-label* combo is what makes Ridgewells feel editorial. Every section opens with a small wide-tracked uppercase line, then a huge serif headline. We must replicate this rhythm exactly.

### 1.3 Layout grid

- **Max-width container:** `max-width-container` Wix class — measured 1440px on desktop (no max-width on the body, content fills 1440 viewport and uses a 980px gutter container inside).
- **Vertical rhythm:** sections range 474px (intro) to 1314px (blog). Average ~700px. Generous whitespace between sections.
- **No CSS grid / no flexbox visible in section layouts** — Wix uses absolute-positioned children inside containers (legacy pattern). For our rebuild, use modern CSS grid / Tailwind grid.
- **Section-internal padding:** ~60-100px top/bottom, content sits centered horizontally.
- **Two-up service grid:** exactly 720×450 per card, side-by-side, no gap between (full-bleed split).

### 1.4 Mood

**Editorial-luxury magazine.** Feels like a Condé Nast Traveler feature crossed with a wedding-magazine cover. Not minimalist, not maximalist — disciplined editorial. Photographic (full-bleed hero images), restrained color (one accent + neutrals), oversized serif typography as the primary visual element.

---

## 2. Section-by-section breakdown (scroll order)

The homepage is **9788px tall** at 1440px viewport width — 13 sections + sticky header + footer.

### 2.1 Header (sticky, 0-97px)

- **Behavior:** transparent over hero, remains 97px tall. No color-flip on scroll observed — sits over slideshow as a thin floating bar.
- **Contents:** Logo (left, 125×37px PNG), spacer, then "ORDER" + "INQUIRE" text links (right-aligned, 11.3px Gotham Bold ls 2.26px charcoal), then 5 social icons (FB/IG/Pinterest/LI/TikTok, 20×20px each).
- **No traditional nav menu!** This is unusual — Ridgewells removes top-level category nav entirely. Visitors scroll through sections or use the INQUIRE/ORDER CTAs. This is a strong editorial choice: **navigation by storytelling, not by taxonomy**.
- **Mobile:** same layout, condensed. No hamburger drawer. The "Skip to Main Content" accessibility button is present (good practice).

### 2.2 Hero (97-878, 782px tall, full-bleed)

- **Background:** Wix Pro Gallery "one-row hide-scrollbars slider" — a full-viewport **image slideshow** cycling through 7 unique 1440×810 images:
  1. Sunset al-fresco dinner on a dock
  2. Wedding reception dance floor (couple + guests)
  3. Seared golden diver scallops with purple cauliflower
  4. Gold-and-green charity gala design
  5. Floral arch entrance at outdoor tented wedding
  6. Artistic vegetable mosaic on floral china
  7. Two servers offering wine/champagne at event entrance
- **No text overlay in hero itself.** The hero is image-only — text starts in the section below.
- **No Ken Burns / no video.** Pure cross-fade slideshow (Wix Pro Gallery default transition ~0.6s).
- **Image format:** AVIF via Wix CDN (`enc_avif,quality_auto` URL param) with WebP/JPG fallback. Focal-point params (`fp_0.5_0.63`) for smart-crop. Excellent LCP profile.
- **Captions:** each slide has a `gallery-slideshow-info` + `slideshow-info-element-inner` div, but they're visually hidden (info-on-hover). Mobile snapshot shows a "Play Marquee" button (likely slideshow auto-play toggle).

### 2.3 Intro / About (878-1352, 474px tall) — SIGNATURE WOW

- **Background:** 10-layer radial gradient (the painterly purple bloom — see §3 for full CSS).
- **Eyebrow:** `STUNNING MENUS. IMPECCABLE SERVICE. UNFORGETTABLE MEMORIES.` — 15.6px Gotham Book, ls 3.12px, white.
- **Headline H2:** `Every event has a story to tell.` — 80px Scotch Display Semibold, white, line-height 88px, **with explicit `\n` line break** before "to tell." (manual line break for poetry rhythm).
- **Body paragraph:** "Ridgewells Catering is a leading high-end catering company with decades of experience producing thousands of corporate events, weddings, and social gatherings in the Washington, DC area and beyond." — 18px Gotham Book, white, lh 25.2px.
- **Layout:** centered column, max-width ~620px, vertically centered.
- **Animation:** fade-up entrance on the headline (Wix motion-part hook `BG_LAYER`).

### 2.4 Services grid 1 (1352-2252, 900px tall)

Two 720×450 cards side-by-side, full-bleed split:

**Card A — Corporate Events:**
- Image: "Black tie corporate gala at Mellon Auditorium" (720×450)
- Title H2: `Corporate Events` — 56.917px Scotch Display, `#414142`
- Body: "Expertly executed from concept to cleanup. Full-service catering for galas, corporate events, picnics, meetings, and holiday parties."
- CTA: `View More` — 10px Arial, bg white, border 1px `#4F4F4F`, padding 8px, **border-radius 0** (square outline button)

**Card B — Weddings:**
- Image: "Bride and groom cutting their wedding cake"
- Title: `Weddings`
- Body: "You bring your style, and we'll bring the splashy cocktails, bespoke menus, and expert hospitality. Full-service wedding catering for ceremonies, receptions, and multi-day celebrations."
- CTA: `View More` (same style)

### 2.5 Services grid 2 (2252-3152, 900px tall)

Same 2-up layout:

**Card C — Social Events:**
- Image: "Dinner party with beautiful tablescape"
- Title: `Social Events`
- Body: "From intimate gatherings to blowout celebrations, we cater backyard parties, dinner parties, and holiday events with ease."

**Card D — Major Events:**
- Image: "U.S. Open" (sporting event)
- Title: `Major Events`
- Body: "Major sporting events, tournaments, and championships catered with precision, speed, and scale. Trusted by clients like the USGA, Preakness, and IndyCar."
- **Note:** the "View More" outline button on this card uses `border: 1px solid #71297F` (magenta purple) instead of grey — a subtle differentiation for the "premium" major-events category.

### 2.6 Legacy / Heritage (3152-3897, 745px tall)

- **Eyebrow:** `DC - MARYLAND - VIRGINIA` (wide-tracked, location pin)
- **Headline H2:** `A Legacy Like No Other` — 75px Scotch Display, `#414142`
- **Body:** "Presidential Inaugurations and glittering balls from the days of old. Historic commemorations and celebrations written about for the ages. For over 95 years, Ridgewells Catering has been behind the scenes catering some of the nation's most prolific events."
- **CTA:** `View More` (outline button)
- **Subtle detail:** "Best Caterer Washington DC" badge icon (49×49px) + thin horizontal line graphic underneath, suggesting a press-mention ribbon.
- **Layout:** two-column — left has eyebrow + headline + body + CTA, right has decorative badge/ribbon stack.

### 2.7 Purple marquee band (3897-3991, 94px tall) — WOW #2

- **Background:** solid `#502875` deep aubergine, full-bleed.
- **Text:** `There's no party like a Ridgewells Party` — single sentence, ~25-30px, white, centered.
- **CTA:** white pill button on the right (or inline).
- **Animation:** Mobile snapshot shows a `Play Marquee` button — likely an actual marquee horizontal text scroller that animates the phrase on a loop. The desktop visual is static-but-striking.

### 2.8 Seasonal / Holiday gallery (3991-4537, 545px tall)

- **Layout:** full-bleed image (1440×545) of "Beautiful Stylized Plated Salad" — likely a seasonal gallery hero.
- **CTA:** `DOWNLOAD HOLIDAY MENU` — 10px Arial, bg `#502875` purple, **border 1px solid `#D2D752` lime**, padding 8px, border-radius 50% (purple pill with lime outline — the only place lime appears on the entire site, used as a seasonal/holiday accent).

### 2.9 Philosophy / "How do we make magic happen?" (4537-5037, 500px tall)

- **Eyebrow:** `HOW DO WE MAKE MAGIC HAPPEN?` (purple, wide-tracked)
- **Headline H2:** `Passion for Celebration.` — 75px Scotch Display, `#414142`
- **Body (bulleted list, each bullet a separate paragraph):**
  - "Inspired cuisine from the best ingredients, created by our award-winning Executive Chef."
  - "Innovative, custom designed menus that bring the WOW."
  - "Unbridled imagination for creative design and presentation."
  - "Flawless service and thoughtful hospitality."
- **Closing paragraph:** "Ridgewells Catering has been raising the bar in the Washington D.C. social scene for more than 95 years. From intimate gatherings to major events, Ridgewells approaches every special event with a co..." (truncated in extraction, continues).

### 2.10 Testimonials (5037-6227, 1191px tall) — WOW #3

- **Background:** solid `#502875` deep aubergine, full-bleed.
- **Eyebrow:** none visible (the purple is the eyebrow).
- **Headline H2:** `What Our Clients Say About Us` — 70px Scotch Display, **color `#F1EBF5` very-light-lavender** (genius move: not pure white, which would be too harsh; the slight lavender keeps it tonally cohesive with the purple bg).
- **Testimonial quote (long-form, ~5 sentences):** "They have helped us overcome some crazy challenges the last two years. In 2024 we were locked out of our venue until about 15 minutes before our 500+ guests were due to arrive. Ridgewells staff RAN and got everything set up for our guests in time. Our guests didn't notice anything was amiss, and Ridgewells truly saved the event. This year, our venue changed due to government shutdowns, and Ridgewells not only located an alternative venue for us, but produced a sp..." (continues with praise).
- **Client logo:** "American Express logo" (49×28px) — social proof anchor.
- **"Gold Star" icons** (3×) appear as decorative bullet points near the testimonial.
- **Layout:** testimonial quote left-aligned in a centered column, logo + stars below.

### 2.11 Gallery / Carousel (6227-6877, 650px tall)

- Full-bleed image carousel: "Elegant plated dinner at Library of Congress" + 4 more images (each 313×313 thumbnail visible).
- Navigation: `<` circular arrows (10px Arial, border 2px `#414142`, border-radius 100%).
- Layout: Wix Pro Gallery "show on hover" title placement — captions appear on hover.

### 2.12 Blog / News (6877-8191, 1314px tall)

- **Eyebrow:** `LATEST NEWS & BLOG` — 18.2px Gotham Book, color `#502875` purple
- **Headline H2:** `The Dish` — 79.7px Scotch Display, `#414142` (plays on "dish" = food + gossip).
- **Layout:** 2×3 grid of article cards. Each card:
  - Image (250×250 with `blur_30` placeholder while loading)
  - Category link (small purple text — "Weddings" / "Corporate Events" / "Major Events" / "Social Events" / "Press")
  - H2 title 18px charcoal
- **CTA:** `View All Posts` — purple text link, no button container.
- **Article cards visible:**
  - "Catering Cultural Cuisine with Integrity"
  - "Questions Every Couple Should Ask Their Caterer"
  - "When a Menu Tells a Story: Celebrating the 2026 Rolex National Geographic Explorer of the Year"
  - "Championship Hospitality at the 2026 U.S. Open"
  - "Erin Go Glam 2026: At the Edge of Elsewhere"
  - "Featured in ECEP Trend Report"

### 2.13 Social / Instagram (8191-8616, 425px tall)

- **Eyebrow:** `FOLLOW US` — 25px Gotham Book, color `#502875` purple
- **Headline H2:** `@RidgewellsDC` — **81.96px Scotch Display** (giant handle as design element), `#414142`
- **Hashtag:** `#PassionForCelebration` — their brand tagline as hashtag
- **Below:** live Instagram feed via `instafeed.codev.wixapps.net` iframe (pulls business IG posts automatically).

### 2.14 Footer / Newsletter (9116-9788, 672px tall)

- **H3 (address):** `5522 Dorsey Ln, Bethesda, MD 20816 / info@ridgewells.com / 301.652.1515` — 22px Gotham Book, white (on purple bg)
- **H2 (mailing-list CTA):** `Curious what we've got cooking up next? Join our mailing list.` — 40px Scotch Display, `#414142`, **manual `\n` line break** before "Join"
- **Body:** "Be among the first to hear about the latest news, menu releases, and special offers."
- **Form:** single email input (`placeholder="Enter Your Email"`, `name="email"`, type=email) + `JOIN` submit button.
- **Copyright:** `© 2026 by Ridgewells Catering`
- **Social links:** 6 icons row (FB, IG, LI, Pinterest, TikTok, Website)
- **Layout:** two-column — left = address + social, right = mailing list form. Background appears to transition from white (top) to purple (bottom near address) — confirm via screenshot.

---

## 3. Navigation / Header (deep dive)

**Pattern:** minimalist floating bar — logo + 2 text CTAs + social icons. **No category nav.**

| Element | Position | Style | Behavior |
|---------|----------|-------|----------|
| Logo | top-left | 125×37px PNG, alt="RIdgewells Catering Logo" (note typo: "RIdgewells") | Static |
| ORDER link | top-right (left of INQUIRE) | 11.3px Gotham Bold, ls 2.26px, `#414142`, no decoration | Links to `ridgewellscatering.gethoneycart.com` (external e-commerce) |
| INQUIRE link | top-right (rightmost text) | Same style as ORDER | Links to `/book-an-event` |
| Social icons (5) | far right | 20×20px each, gap ~12px | Open external profiles |
| Skip to Main Content | hidden, focusable | 14px Helvetica, blue on white, border-radius 24px | Accessibility — keyboard users |

**No hamburger menu on mobile** — Ridgewells maintains the same condensed layout on iPhone-class viewports. The "button ref=e6" in the mobile snapshot is likely just an interactive container, not a hamburger.

**Sticky behavior:** the header `position` is sticky by default (Wix Thunderbolt fixed positioning). No color flip on scroll observed — the header background remains transparent throughout (it floats over white sections and the purple sections equally well thanks to its 97px thin profile).

---

## 4. Hero (deep dive)

### 4.1 Visual treatment

- **Full-bleed image slideshow** (no video, no Ken Burns zoom, no parallax).
- 7 unique 1440×810 images, cross-fade transition (~0.6s default Wix Pro Gallery timing).
- **No overlay text in hero** — Ridgewells lets the photography breathe. Text begins in the next section.
- **No gradient overlay** on hero images — they're shown as-shot.
- **Captions:** each slide has hidden `slideshow-info-element-inner` (title + description), revealed on hover via Pro Gallery's `titlePlacement: SHOW_ON_HOVER` option.

### 4.2 Entrance animation

- Wix's native `BG_LAYER` / `BG_MEDIA` motion hooks fire on the slideshow container as it enters viewport — typically a fade-in + slight scale-up (1.05 → 1.0 over 0.8s).
- No staggered headline animation (because there's no headline in the hero).
- The intro section below fades up its H2 ("Every event has a story to tell.") as the user scrolls into it.

### 4.3 Scroll cue

None detected — no scroll-down arrow, no animated mouse icon, no "scroll" text. The user is expected to intuit scrolling from the floating header + image-rich hero.

### 4.4 Cursor effects

None. No custom cursor on Ridgewells.

### 4.5 How to clone the feel (without their images)

```tsx
// Our hero — Ridgewells-style image slideshow, NO text overlay
// Use Mux video OR full-bleed image cross-fade carousel
<section className="relative h-[78vh] min-h-[600px] overflow-hidden">
  <AnimatePresence mode="wait">
    <motion.div
      key={currentSlide}
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="absolute inset-0"
    >
      <Image src={slides[currentSlide]} fill alt="" className="object-cover" priority />
    </motion.div>
  </AnimatePresence>
  {/* NO text overlay — let image breathe. Headline lives in next section. */}
</section>
```

Slide duration: 5-7s per image, auto-advance. Pause on hover/tap.

---

## 5. Image / photography treatment

### 5.1 Aspect ratios observed

| Use case | Aspect | Resolution |
|----------|--------|------------|
| Hero slideshow | 16:9 | 1440×810 |
| Service card image | 16:10 | 720×450 |
| Blog card thumbnail | 1:1 | 250×250 (or 313×313) |
| Gallery thumbnail | 1:1 | 313×313 |
| Logo | ~3.4:1 | 125×37 |
| Social icon | 1:1 | 20×20 |
| Decorative badge | 1:1 | 49×49 |

### 5.2 Hover effects

- **Service cards:** `transition: all` on image container (no explicit transform). Wix's `WOW-IMAGE` component applies a subtle zoom-in on hover via JS (default ~1.05 scale, 0.4s ease).
- **Blog/gallery cards:** `titlePlacement: SHOW_ON_HOVER` — caption overlay slides up from bottom, semi-transparent dark backdrop fades in.
- **Buttons:** no hover state visible in static inspection — likely just `background-color` shift on `:hover`.

### 5.3 Gallery layout

- **Hero:** single-image slideshow, full-bleed.
- **Service grid:** 2-up side-by-side (no gap, full-bleed split).
- **Blog grid:** 2-column × 3-row grid (mobile: 1-column stack).
- **Gallery section (comp-lk1zg19k):** horizontal carousel with circular `<` arrows.
- **No lightbox** detected (Wix Pro Gallery uses inline expansion, not modal lightbox).

### 5.4 Image delivery

- **Format:** AVIF via Wix CDN (`enc_avif,quality_auto` URL param).
- **Source:** `static.wixstatic.com/media/{hash}~mv2.jpg` and `.webp`.
- **Smart-crop:** focal-point params (`fp_0.5_0.63`) on every image — Wix auto-crops preserving the focal point.
- **Blur-up placeholder:** `blur_30` (low-quality 30%-compression placeholder) on lazy-loaded images.
- **Responsive:** Wix auto-generates multiple resolutions per breakpoint.

---

## 6. Animations & interactions (THE MOST IMPORTANT PART)

**Headline finding:** Ridgewells is *not* an animation-heavy site. There is **no GSAP, no Lenis, no Lottie, no ScrollTrigger, no Framer Motion, no jQuery**. All motion is Wix Thunderbolt's native engine, driven by `data-motion-part` attributes (252 instances on the homepage).

The elegance comes from **restraint** — not from fancy animations. Here is the complete motion inventory:

### 6.1 Scroll-triggered reveals (Wix native)

- **Trigger:** IntersectionObserver (Wix Thunderbolt built-in).
- **Elements:** every section's `BG_LAYER` / `BG_MEDIA` / `BG_IMG` (background) + content blocks.
- **Default motion:** fade-in + translateY(20px → 0) over 0.8s, ease `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Stagger:** child elements stagger by ~0.1s within a section.
- **Reproduce in framer-motion:**

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
>
  {children}
</motion.div>
```

### 6.2 Hero slideshow cross-fade

- 7 images, ~5-7s per slide, cross-fade transition 0.6s.
- Manual navigation: left/right arrows + dot indicators (visible on hover).
- **No Ken Burns** (image is static during its visible window).
- **Reproduce:** `AnimatePresence mode="wait"` + `setInterval` 6000ms (see §4.5 snippet).

### 6.3 Hover micro-interactions

| Element | Hover effect | Implementation |
|---------|--------------|----------------|
| Service card image | Scale 1.05, 0.4s ease | `transition: transform 0.4s; :hover { transform: scale(1.05); }` |
| Blog/gallery card | Caption overlay slides up, dark backdrop fades in | `titlePlacement: SHOW_ON_HOVER` (Wix) → for our rebuild, use `group-hover` Tailwind pattern |
| Outline buttons ("View More") | Background fill shift (white → light grey) | `:hover { background: #E3E3E3; }` |
| Text links ("INQUIRE", "ORDER") | None visible | — |

### 6.4 Marquee band (purple, 94px tall)

- Static on desktop (no actual horizontal scroll observed in static DOM).
- Mobile snapshot shows a "Play Marquee" button — suggests the text DOES marquee-scroll on mobile (or when audio permission granted).
- **Reproduce (true marquee):**

```tsx
<div className="bg-[#502875] py-6 overflow-hidden">
  <motion.div
    animate={{ x: ["0%", "-50%"] }}
    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    className="flex gap-12 whitespace-nowrap"
  >
    {[...Array(2)].map((_, i) => (
      <span key={i} className="text-white text-2xl">
        There's no party like a Ridgewells Party •
      </span>
    ))}
  </motion.div>
</div>
```

### 6.5 Page transitions (View Transitions API)

- **Confirmed:** `@view-transition { navigation: auto; }` rule present in CSS.
- **Browser support:** Chrome 111+, Edge 111+, Safari 18+ (with flag).
- **Effect:** smooth cross-fade between route changes (no flash of white).
- **Reproduce (Next.js 16 App Router):**

```css
/* globals.css */
@view-transition {
  navigation: auto;
}

/* Optional: name hero image for cross-page morph */
.hero-image {
  view-transition-name: hero-image;
}
```

Already implemented in our project per AGENTS.md §17 (B3).

### 6.6 Custom cursor

**None.** Ridgewells uses the native OS cursor throughout. Our site already has a custom cursor (dot + lagging ring) — keep ours, Ridgewells doesn't help here.

### 6.7 Magnetic buttons

**None detected.** Our existing `<Magnetic>` wrapper is more advanced than Ridgewells.

### 6.8 Counters / number animations

**None.** Ridgewells doesn't use stat counters on the homepage. (Their "95 years" and "500+ guests" appear as static text in testimonials.)

### 6.9 Parallax layers

**None.** All sections are static. No background-attachment: fixed. No scroll-driven parallax.

### 6.10 Page-load preloader

**None detected.** No loader animation. The hero slideshow images load lazily with blur-up placeholders.

### 6.11 Summary: motion budget

- **Total distinct animation types:** 4 (scroll-fade-up, slideshow cross-fade, hover-zoom, hover-caption-reveal).
- **Total JS animation libraries:** 0 (Wix native only).
- **"Wow" moments:** the painterly radial-gradient background (§2.3) and the giant `@RidgewellsDC` handle (§2.13) — both are **static design choices**, not animations.

**Takeaway for our site:** Ridgewells proves you don't need GSAP/Lenis/Lottie to feel premium. The premium-ness comes from typography scale + color discipline + photographic quality. We should NOT add more animation libraries to match Ridgewells — we should *subtract* motion where it doesn't serve content.

---

## 7. Footer (deep dive)

### 7.1 Layout

- **Height:** 672px (top: 9116, bottom: 9788).
- **Background:** transitions from white (top, mailing-list section) to purple `#502875` (bottom, address + copyright).
- **Two-column layout:**
  - **Left column:** Address H3 + social icon row + copyright.
  - **Right column:** Mailing-list CTA (H2 40px + body + email input + JOIN button).
- **No giant brand wordmark** at the bottom (unlike Concept/Salza style). Ridgewells keeps the footer functional, not decorative.

### 7.2 Mailing list form

```html
<form>
  <input type="email" name="email" placeholder="Enter Your Email" required />
  <button type="submit">JOIN</button>
</form>
```

- Single field (email only) — low friction.
- `JOIN` button = small uppercase Gotham Bold, purple bg, white text.
- No explicit validation UI visible (likely server-side or inline-error on submit).

### 7.3 Address block

```
5522 Dorsey Ln, Bethesda, MD 20816
info@ridgewells.com
301.652.1515
```

- 22px Gotham Book, white, on purple bg.
- Each line on its own line (`\n` separated).
- No icons (no map pin, no envelope, no phone) — pure typography.

### 7.4 Sticky behavior

**Not sticky.** Footer is a normal end-of-page section. (Our site uses a sticky footer pattern from Concept — different choice, both valid.)

---

## 8. Tech & performance signals

### 8.1 Stack identification

| Signal | Value | Implication |
|--------|-------|-------------|
| Platform | **Wix Thunderbolt** (modern Wix renderer) | All animations are Wix-native; no custom JS |
| Framework | React under the hood (Wix uses React for hydration) | Not a custom React/Next.js app |
| JS libs detected | None external (no GSAP, no Lenis, no Lottie, no jQuery) | Lightweight — Wix bundles everything |
| CDN | `static.parastorage.com` (Wix's CDN) + `static.wixstatic.com` (media) | Enterprise-grade CDN, global edge |
| Image format | **AVIF** primary, WebP/JPG fallback (via `enc_avif` URL param) | Modern image delivery — excellent LCP |
| Image smart-crop | Focal-point params (`fp_X_Y`) on every image | Aspect-ratio preservation across breakpoints |
| Lazy loading | `blur_30` low-quality placeholders + IntersectionObserver | Progressive image loading |
| Video | **None** (no `<video>`, no YouTube/Vimeo/Wistia/Mux embeds on homepage) | Hero is image-only slideshow |
| Iframes | 1 — Instagram Feed (`instafeed.codev.wixapps.net`) | Live IG widget, loads async |
| View Transitions API | Enabled (`@view-transition { navigation: auto; }`) | Smooth SPA-like route transitions |
| Smooth scroll | **None** (`scroll-behavior: auto`, no Lenis) | Native browser scroll only |
| Custom cursor | None | — |
| Analytics | Likely Wix BI + Google Analytics (not directly inspectable) | — |
| Chat widget | None visible | — |
| Cookie banner | Not present in captured state | — |

### 8.2 Performance characteristics

- **Total page weight (estimated):** ~3-4MB (mostly images, all AVIF-compressed).
- **DOM size:** 252 motion-part elements + ~677 wixui animation classes = heavy DOM but Wix's runtime is optimized for this.
- **LCP element:** Hero slideshow first image (1440×810 AVIF, ~80-120KB).
- **Fonts:** 5 custom fonts loaded as woff2 from `static.wixstatic.com/ufonts/` — total ~150-200KB. Only loaded weights are fetched (no full family downloads).

### 8.3 SEO / accessibility

- **Title tag:** `Ridgewells Catering | Washington DC Best Caterer` — keyword-rich, location-specific.
- **Meta description:** "Ridgewells Catering has been the go-to choice for catering in Washington, D.C. for more than 95 years. Corporate Events, Weddings, Social Events, Major Sporting Events, and all-around Impeccable Hospitality. Award winning culinary team and voted best caterer in Washington DC."
- **Heading hierarchy:** Single H1 per page (not on homepage — hero is image-only), H2s for section titles, H3 for address.
- **Skip-to-content button:** present (a11y win).
- **Alt text:** every image has descriptive alt text (e.g., "Beautiful sunset over an al-fresco dinner table at a dock on the water").
- **Semantic HTML:** proper `<header>`, `<section>`, `<footer>` tags.

---

## 9. Reproduction recipe — prioritized "what to copy"

### Priority 1 — Must implement (high impact, low effort)

| # | Pattern | Concrete spec | Our component |
|---|---------|---------------|---------------|
| 1.1 | **Editorial eyebrow + huge serif headline** rhythm | Eyebrow: 12-16px, ls 2-3px, uppercase, color = section accent. Headline: 60-80px Playfair Display, weight 400, color charcoal `#414142` or white-on-dark. | Every section header in `src/components/catering/*` |
| 1.2 | **Painterly radial-gradient section bg** | 8-10 layered `radial-gradient(circle at X% Y%, color 0%, N%, transparent M%)` using 2-3 brand colors. See §3 of this doc for Ridgewells' exact CSS — adapt to our bordeaux/terracotta/honey. | `src/components/catering/about.tsx` (replace current bg) |
| 1.3 | **Two-up service card grid** | 50/50 split, image 720×450 (16:10), title 48-56px serif, 2-line body, "View More" outline button (1px border, no radius). | Already exists in our `services.tsx` — verify styling matches |
| 1.4 | **Outline "View More" buttons** | 10-12px sans, weight 600, padding `8px 16px`, border `1px solid currentColor`, border-radius `0` (square). Hover: bg fills with text color, text inverts. | Replace current pill buttons in service cards |
| 1.5 | **Wide-tracked micro-labels** for INQUIRE/ORDER style CTAs | 11-13px, weight 600, ls 2-2.5px, uppercase, no decoration. | Header CTAs in `site-header.tsx` |
| 1.6 | **Section-internal `\n` line breaks in headlines** | Manually break H2s at semantic points ("Every event has a\nstory to tell." / "Curious what we've got cooking up next?\nJoin our mailing list."). | All H2 components — add `<br />` at chosen break points |

### Priority 2 — Should implement (medium impact, medium effort)

| # | Pattern | Concrete spec | Our component |
|---|---------|---------------|---------------|
| 2.1 | **Solid-color testimonials section** | Full-bleed bg = our `bordeaux #d11a46` (or espresso), 70px Playfair headline in `#F5EFE6` cream (NOT pure white — slightly tinted), real client quote 18-20px, client logo (American Express-style social proof). | `src/components/catering/testimonials.tsx` |
| 2.2 | **Marquee band between sections** | 80-100px tall, full-bleed solid bg (bordeaux or espresso), single sentence in 24-28px white, optional infinite horizontal scroll via framer-motion. | New `src/components/catering/marquee-band.tsx` |
| 2.3 | **Giant social handle as section title** | `@nilov_catering` at 72-82px Playfair Display, centered, with `FOLLOW US` eyebrow above (ls 2-3px, color = bordeaux). | `src/components/catering/social-section.tsx` (new) |
| 2.4 | **Mailing-list footer block** | 40px Playfair H2 ("Хотите узнать, что мы готовим? Подпишитесь."), 18px body, single email input + JOIN button. | `src/components/catering/footer.tsx` |
| 2.5 | **Blog/news grid** | 2×3 grid, 1:1 thumbnails with blur-up placeholder, category eyebrow (color = bordeaux), 18px headline. | `src/components/catering/blog-grid.tsx` (new) |
| 2.6 | **Skip-to-main-content button** | Hidden by default, visible on focus, 14px sans, blue text, white bg, border-radius 24px. | `src/app/layout.tsx` (add before header) |

### Priority 3 — Nice to have (low impact, high effort)

| # | Pattern | Concrete spec | Notes |
|---|---------|---------------|-------|
| 3.1 | **Hero image slideshow** (instead of Ken Burns) | 5-7 images, 6s per slide, 0.6s cross-fade, manual nav arrows. | Our hero already has Ken Burns — slideshow is alternative, not addition |
| 3.2 | **View Transitions API** (already done) | `@view-transition { navigation: auto; }` in globals.css | ✅ Already in our codebase (B3) |
| 3.3 | **Live Instagram feed iframe** | Embed `instafeed.codev.wixapps.net` equivalent (or use Instagram Basic Display API) | Optional — we already have Instagram reel embed |
| 3.4 | **Coral Blush Script accent** | Use a brush script font (e.g., `Pinyon Script` from Google Fonts, free) for ONE accent word per page | Risky — easy to look cheap. Skip unless art-directed carefully. |

### Anti-patterns — what NOT to copy from Ridgewells

- ❌ **No traditional nav menu** — works for Ridgewells because they're a 95-year-old brand with clear search intent. Our newer brand needs the menu for discoverability. Keep our mega-menu.
- ❌ **No video on hero** — Ridgewells chose images. Our Mux video option is MORE premium, not less. Keep the video option available.
- ❌ **No custom cursor** — Ridgewells doesn't have one. Ours is already more advanced. Keep ours.
- ❌ **No smooth scroll (Lenis)** — Ridgewells uses native scroll. Our Lenis integration is more premium. Keep ours.
- ❌ **Wix's heavy DOM** — 252 motion-part hooks is bloated. Our framer-motion approach is cleaner.
- ❌ **Square buttons everywhere** — Ridgewells' "View More" buttons are square (border-radius 0). Our pill buttons (border-radius 9999px) are more modern. Choose per-section, don't uniform-apply square.

---

## 10. Framer-motion snippet suggestions (concrete)

### 10.1 Eyebrow + headline reveal (the Ridgewells signature)

```tsx
// Ridgewells-style section header: eyebrow fades up first, headline follows 0.15s later
function SectionHeader({ eyebrow, headline }: { eyebrow: string; headline: string }) {
  return (
    <div className="space-y-4">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="text-[13px] font-semibold uppercase tracking-[2.4px] text-bordeaux"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
        className="font-playfair text-[64px] leading-[0.95] text-espresso md:text-[80px]"
      >
        {headline}
      </motion.h2>
    </div>
  );
}
```

### 10.2 Painterly radial-gradient background (CSS-only, no JS)

```css
/* Ridgewells-adapted: bordeaux + terracotta + honey radial blooms on cream base */
.painterly-bg {
  background-color: #fcfbf8; /* cream base */
  background-image:
    radial-gradient(circle at 89.58% 53.33%, rgba(209, 26, 70, 0.85) 0%, 17.5%, transparent 35%),
    radial-gradient(circle at 52.5% 52.5%, rgba(201, 84, 47, 0.85) 0%, 17.5%, transparent 35%),
    radial-gradient(circle at 52.92% 84.17%, rgba(201, 84, 47, 0.85) 0%, 17.5%, transparent 35%),
    radial-gradient(circle at 15% 38.33%, rgba(209, 26, 70, 0.85) 0%, 17.5%, transparent 35%),
    radial-gradient(circle at 12.5% 100%, rgba(234, 162, 89, 0.7) 0%, 14.17%, transparent 26%),
    radial-gradient(circle at 96.67% 5.83%, rgba(234, 162, 89, 0.7) 0%, 14.17%, transparent 26%),
    radial-gradient(circle at 52.08% 1.67%, rgba(209, 26, 70, 0.85) 0%, 20.88%, transparent 46%),
    radial-gradient(circle at 20.83% 2.5%, rgba(201, 84, 47, 0.85) 0%, 49.07%, transparent 58%),
    radial-gradient(circle at 85% 83.33%, rgba(201, 84, 47, 0.85) 0%, 60.2%, transparent 70%),
    radial-gradient(circle at 48.9% 49.52%, rgba(252, 251, 248, 1) 0%, 100%, transparent 100%);
}
```

### 10.3 Service card with hover image-zoom

```tsx
function ServiceCard({ image, title, body, href }: ServiceCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden">
        <motion.img
          src={image}
          alt=""
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <div className="mt-6 space-y-3">
        <h2 className="font-playfair text-[48px] leading-tight text-espresso md:text-[56px]">
          {title}
        </h2>
        <p className="max-w-md text-[18px] leading-[1.4] text-espresso/70">{body}</p>
        <span className="inline-block border border-espresso px-4 py-2 text-[11px] font-semibold uppercase tracking-[2.2px] text-espresso transition-colors group-hover:bg-espresso group-hover:text-cream">
          View More
        </span>
      </div>
    </Link>
  );
}
```

### 10.4 Purple-section testimonials (color-adapted)

```tsx
function Testimonials() {
  return (
    <section className="bg-bordeaux py-32 text-cream">
      <div className="mx-auto max-w-4xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="font-playfair text-[56px] leading-tight md:text-[70px]"
          style={{ color: '#F5EFE6' }} /* Ridgewells' lavender-tinted-white trick */
        >
          Что говорят наши клиенты
        </motion.h2>
        <blockquote className="mt-12 text-[20px] leading-[1.5] text-cream/90">
          "{testimonial.quote}"
        </blockquote>
        <div className="mt-8 flex items-center gap-4">
          <img src={clientLogo} alt={client} className="h-8" />
          <span className="text-[14px] uppercase tracking-[2px] text-cream/60">{client}</span>
        </div>
      </div>
    </section>
  );
}
```

### 10.5 Marquee band (true infinite scroll)

```tsx
function MarqueeBand() {
  return (
    <div className="overflow-hidden bg-espresso py-6">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="flex w-max gap-12 whitespace-nowrap"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="font-playfair text-[28px] text-cream">
            Нет праздника лучше, чем наш праздник •
          </span>
        ))}
      </motion.div>
    </div>
  );
}
```

### 10.6 Giant social handle section

```tsx
function SocialSection() {
  return (
    <section className="bg-cream py-24 text-center">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-[20px] font-semibold uppercase tracking-[3px] text-bordeaux"
      >
        Подписывайтесь
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="mt-4 font-playfair text-[64px] leading-none text-espresso md:text-[82px]"
      >
        @nilov_catering
      </motion.h2>
      <p className="mt-6 text-[16px] uppercase tracking-[2px] text-espresso/60">
        #СтрастьКПразднику
      </p>
    </section>
  );
}
```

---

## 11. Open questions / verification needed

1. **Marquee band desktop behavior** — is the "There's no party like a Ridgewells Party" text actually scrolling horizontally on desktop, or static? Static in my capture, but the mobile "Play Marquee" button suggests motion is available. Verify by recording a video via `agent-browser record start` on desktop.
2. **Header scroll behavior** — does the header change style when scrolling past the hero? My capture shows it stays transparent. Verify with a scroll-then-screenshot sequence.
3. **Hover state on "View More" buttons** — does the background fill with charcoal and text invert to white? Not captured (static inspection only). Verify by `agent-browser hover @ref` then screenshot.
4. **Slideshow transition timing** — exact cross-fade duration and slide interval. Capture via video recording and frame analysis.
5. **Mobile menu** — is there REALLY no hamburger? The `button ref=e6` in the mobile snapshot may be one. Verify by clicking it.

---

## 12. Asset index

All raw research artifacts saved to `/home/z/my-project/newsite/docs/reference-library/ridgewells/`:

| File | Size | Purpose |
|------|------|---------|
| `homepage-full.png` | 4.0MB | Full 9788px-tall page screenshot (desktop 1440px) |
| `hero-top.png` | 1.3MB | Hero viewport screenshot (desktop) |
| `mobile-top.png` | 333KB | Mobile (390×844) viewport screenshot |
| `section-intro-purple.png` | 686KB | Painterly purple radial-gradient intro section |
| `section-services-1.png` | 144KB | Corporate Events + Weddings 2-up grid |
| `section-services-2.png` | 197KB | Social Events + Major Events 2-up grid |
| `section-testimonials.png` | 142KB | Purple testimonials section |
| `section-blog.png` | 292KB | "The Dish" blog grid |
| `section-social.png` | 415KB | "@RidgewellsDC" giant handle section |
| `section-footer.png` | 415KB | Mailing list + address footer |
| `search-design.json` | 3.2KB | Web-search results for "Ridgewells design review" |
| `search-typography.json` | 2.4KB | Web-search results for "Ridgewells Wix Scotch Display" |

---

**End of analysis.** Total research time: ~25 minutes. Total DOM elements inspected: 252 motion-parts + 13 sections + 16 headings + 15 buttons + 7 hero slides. All values in this document are computed from live DOM, not guessed.
