# Elegant Affairs Caterers — Design & DOM Analysis

> **Source site:** https://elegantaffairscaterers.com/  
> **Task:** Cycle 28 (Interfood) — DOM + visual extraction of `elegantaffairscaterers.com`  
> **Subagent:** Task 2-A (DOM + visual extraction)  
> **Captured viewport:** 1440 × 900 (desktop Chrome 152 via `agent-browser`)  
> **Page weight:** 7,483 px tall, 1,440 px wide (full-page screenshot ~1.3 MB)  
> **Stack observed:** WordPress 6.x + Astra child theme (`elegant-affairs`) + Elementor 4.2.0 + Ultimate Addons for Elementor 1.45 + Gravity Forms + SmashBalloon Instagram Feed 6.11 + YouTube Embed Plus 14.2 + WonderPlugin Slider Lite 14.5

---

## 0. Executive summary

Elegant Affairs (EA) is a New York–based off-premise catering company whose site is the **archetype of editorial luxury-catering design**: a near-monochrome palette (black + white + a single signature red `#E71D3A` + a single mauve `#A18A8A`), a serif body typeface (`Reckless TRIAL`, used at large sizes for both headings and body copy), and an unctuous blush `#F1ECEC` reserved for the two "premium" sections (Secret Ingredient + Blog/Press grid). Almost every button on the page is a **text + animated arrow link** — no fills, no borders, no rounded corners — and every section reveals via Elementor's `fadeInUp` motion preset on scroll. Three signature "wow" moments stand out: the **autoplaying hero background video** (1.4 MB MP4 over a static JPEG poster), the **champagne-gif decoration** that floats under the Secret Ingredient headline, and the **wipe-reveal `.sep_list`** used between the three hero city labels (`NEW YORK CITY · LONG ISLAND · HAMPTONS`) which slides a white pseudo-element away on page-load to expose the labels and dividers in a 4 s linear reveal.

The design system is essentially: **black + white + red, with `Reckless TRIAL` serif doing 90 % of the typographic work and `Domaine Sans Text` reserved for eyebrows, micro-labels and buttons.** The site has *no* heavy GSAP / Lenis / Motion One machinery — all animation is CSS transitions (`all 0.2s linear`, `all 0.3s linear`, `all 4s linear`) and Elementor's built-in `fadeInUp / fadeInDown / fadeInLeft` presets. The whole experience is restrained, hand-crafted, and unapologetically serif.

> **Recommended open-source replacements** (because `Reckless TRIAL` and `Domaine Sans Text` are commercial Klim / Commercial-Type faces):  
> - `Reckless TRIAL` → **Fraunces** (Google Fonts, same high-contrast modern serif with italic personality) or **Cormorant Garamond** as a fallback.  
> - `Domaine Sans Text` → **Inter** (Google Fonts, neutral grotesque) or **DM Sans** for a slightly warmer character.  
> - `Domine` (Elementor default) → unused in render layer (overridden by `reck_reg` / `domanie_reg` `!important` rules) — drop entirely.

---

## Table of contents

1. [Palette](#1-palette)  
2. [Typography](#2-typography)  
3. [Sections catalog](#3-sections-catalog)  
4. [Wow moments](#4-wow-moments)  
5. [Component patterns](#5-component-patterns)  
6. [Header / nav](#6-header--nav)  
7. [Footer](#7-footer)  
8. [Images / video](#8-images--video)  
9. [Animations](#9-animations)  
10. [Mobile responsive behavior](#10-mobile-responsive-behavior)  
11. [Token recommendations](#11-token-recommendations)  
12. [Appendix A — Raw CSS snippets](#appendix-a--raw-css-snippets)  
13. [Appendix B — DOM tree of major sections](#appendix-b--dom-tree-of-major-sections)  
14. [Appendix C — Screenshot inventory](#appendix-c--screenshot-inventory)

---

## 1. Palette

### 1.1 Brand colours (extracted from `post-8.css` Elementor kit + `post-10.css` per-widget overrides + `post-207.css` footer + `post-38.css` header + `theme-style.css`)

| Token name | HEX | OKLCH | RGB | Where used | Source |
|---|---|---|---|---|---|
| **`ea-red`** (signature) | `#E71D3A` | `oklch(58.7% 0.227 16.4)` | 231, 29, 58 | Eyebrows (`OUR FOOD`), arrows in buttons, social icon bg, hover state on links/buttons, footer divider on `Press` page, top notification bar hover bg | `post-8.css` `--e-global-color-fad89c8` + many widget overrides |
| **`ea-pink-red`** (footer divider variant) | `#F00D4D` | `oklch(59.5% 0.244 12.6)` | 240, 13, 77 | Footer divider line under "It's party time" (160 px wide, 2 px solid) | `post-207.css` `--divider-color` of `674d996` |
| **`ea-mauve`** (mute / dividers) | `#A18A8A` | `oklch(63.4% 0.034 0.4)` | 161, 138, 138 | All section dividers (2 px solid), body-link button text, bullet/dot colour in image carousels, journal/press meta text, press card arrow icons | `theme-style.css` + `post-10.css` |
| **`ea-blush`** (premium section bg) | `#F1ECEC` | `oklch(95.5% 0.011 0.06)` | 241, 236, 236 | Secret Ingredient section bg (with right-side JPEG), Blog+Press section bg, custom-post-grid item bg on mobile, footer top-border (2 px) | `post-10.css` `e3c0556`, `7fdde04` + `theme-style.css` `#f1ecec` |
| **`ea-blush-deep`** (journal cat badge) | `#DECBCB` | `oklch(83.7% 0.029 0.4)` | 222, 203, 203 | Journal category badge background (BLOG pill) | `theme-style.css` line 333 |
| **`ea-cream`** (image shadow tint) | `#F7F5F5` | `oklch(96.8% 0.006 0.06)` | 247, 245, 245 | Box-shadow tint `15px 15px 0px 1px #f7f5f5` behind featured-location images | `theme-style.css` line 1141 (mobile `small_show_srv .elementor-image img`) |
| **`ea-black`** | `#000000` | `oklch(0% 0 0)` | 0, 0, 0 | Body text on white sections, hero overlay text on white-on-image, button hover (CTA bg turns black), top notification bar bg, event-card overlay panel bg, `.cus_post_item .pst_badge` bg | many sources |
| **`ea-white`** | `#FFFFFF` | `oklch(100% 0 0)` | 255, 255, 255 | Hero H3 text on dark image, event-card H4 text on black overlay, body text on blush sections, social icon glyph colour, footer background, newsletter form button text | many sources |
| **`ea-peach`** (page transition) | `#FFBC7D` | `oklch(82.8% 0.094 64)` | 255, 188, 125 | Elementor page-transition loader background (only fires on internal nav clicks) | `post-8.css` `e-page-transition{background-color:#FFBC7D;}` |
| **`ea-translucent-off-white`** | `#F8F8F8CF` | `oklch(97.3% 0.003 0.06 / 0.81)` | 248, 248, 248, 0.81 | Elementor global token (probably used in some widget we didn't capture, only in elementor-kit CSS) | `post-8.css` `--e-global-color-11c8d23` |

### 1.2 Elementor kit-level tokens (declared in `post-8.css`, `.elementor-kit-8`)

```css
.elementor-kit-8{
  --e-global-color-primary:    #6EC1E4;   /* sky blue — UN-USED in homepage render */
  --e-global-color-secondary: #54595F;   /* dark slate grey — UN-USED in homepage render */
  --e-global-color-text:      #7A7A7A;   /* medium grey — UN-USED in homepage render */
  --e-global-color-accent:    #61CE70;   /* lime green — UN-USED in homepage render */
  --e-global-color-fad89c8:   #E71D3A;   /* RED — the real accent */
  --e-global-color-11c8d23:   #F8F8F8CF; /* translucent off-white */
  --e-global-typography-primary-font-family:   "Roboto";      weight 600;
  --e-global-typography-secondary-font-family: "Roboto Slab"; weight 400;
  --e-global-typography-text-font-family:      "Roboto";      weight 400;
  --e-global-typography-accent-font-family:    "Roboto";      weight 500;
}
```

> ⚠️ Note the **stark mismatch** between what the kit *declares* (Elementor's default blue/grey/green palette and Roboto family) and what the page *actually renders* (red/black/white with `Reckless TRIAL` + `Domaine Sans Text`). This is because the theme author left Elementor's defaults in place but used **CSS helper classes** — `.reck_reg`, `.reck_med`, `.reck_regitalic`, `.domanie_reg`, `.domanie_med`, `.domanie_bld`, `.domanie_test_med` — applied as Elementor widget "Additional CSS Classes", each of which fires a global `* { font-family: 'Reckless TRIAL' !important; }` rule. So **the kit variables are dead-letter**; the real palette is hardcoded hex in the per-widget CSS in `post-10.css`, `post-38.css`, `post-207.css`.

### 1.3 Where each colour is used (matrix view)

| Usage | Black `#000` | White `#FFF` | Red `#E71D3A` | Pink `#F00D4D` | Mauve `#A18A8A` | Blush `#F1ECEC` | Peach `#FFBC7D` |
|---|---|---|---|---|---|---|---|
| Section background | About, Our Food, Let's Party, Events, HQ (white), Instagram, Footer | HQ, Footer | (top promo bar on hover) | — | — | Secret Ingredient, Blog+Press | (page transition only) |
| Headline H1/H2/H3 | ✓ (most sections) | ✓ (hero H3, event H4 on black) | (eyebrow text only) | — | (eyebrow Our Events) | — | — |
| Body text | ✓ | ✓ (on blush) | — | — | (meta info) | — | — |
| CTA arrow icon | — | — | ✓ (default + hover) | — | (alt colour in some buttons) | — | — |
| CTA text | — | — | (hover) | — | ✓ (default) | — | — |
| CTA bg | (mobile `.catering_menu_btn` red→black on hover) | — | (top bar hover, social icon bg, form submit bg) | — | (transparent `#61CE7000`) | — | — |
| Dividers | — | (event card dividers, 1 px) | (footer divider variant) | (footer divider main) | ✓ (hero, journal, carousel dots) | — | — |
| Footer bg | — | ✓ | — | — | — | (top-border 2 px) | — |
| Newsletter form submit | — | ✓ text | ✓ bg, padding `10px 40px` | — | — | — | — |

---

## 2. Typography

### 2.1 Font families (declared + rendered)

EA self-hosts its fonts in `/wp-content/themes/elegant-affairs/fonts/`. The `@font-face` rules in `theme-style.css` (lines 14–92) declare 7 font files across 2 families:

| Family | Weights / styles available | Local font file path (relative to theme `style.css`) | Render role on homepage |
|---|---|---|---|
| **`Reckless TRIAL`** (Commercial Type / Klim) | Regular (400), Medium (500), Regular Italic | `fonts/RecklessTRIAL-Regular.{eot,woff2,woff,ttf,svg}`<br>`fonts/RecklessTRIAL-Medium.{eot,woff2,woff,ttf,svg}`<br>`fonts/RecklessTRIAL-RegularItalic.{eot,woff2,woff,ttf,svg}` | **Hero H3, About H1, every section H2, footer H2, body copy `<p>` in About/Secret Ingredient/HQ, blog card titles, press card titles, event-card H4 labels, "It's party time" footer headline** |
| **`Domaine Sans Text`** (Klim Type Foundry, NZ) | Regular (400), Bold (700) | `fonts/DomaineSansTextTest-Regular.{eot,woff2,woff,ttf,svg}`<br>`fonts/DomaineSansTextTest-Bold.{eot,woff2,woff,ttf,svg}` | **Nav menu, hero location labels (NYC/LI/Hamptons), `.right_arr_btn` button text, footer H4 (`CONTACT US` / `SUBSCRIBE TO OUR NEWSLETTER`), footer address text, `.catfeat_txt h4` eyebrow on inner pages** |
| **`Domaine Sans Text Test`** (Klim — `Test` variant has slightly different metrics, used for Medium weight) | Medium (500) | `fonts/DomaineSansTextTest-Medium.{eot,woff2,woff,ttf,svg}` | **Eyebrow `OUR FOOD` and `Our New headquarters`** (the only place Medium weight is used) |
| `Roboto` (Elementor Google Font) | 400 / 500 / 700 | `/wp-content/uploads/elementor/google-fonts/css/roboto.css` (1458 lines, all weights) | Declared as the per-widget font-family in `post-10.css` (`elementor-element-b1443de .elementor-heading-title{font-family:"Roboto", Sans-serif...}`) but **OVERRIDDEN at runtime** by `.reck_reg *` and `.domanie_med *` `!important` rules in `theme-style.css`. Effectively **unused in render layer**. |
| `Roboto Slab` | 400 | `/wp-content/uploads/elementor/google-fonts/css/robotoslab.css` (504 lines) | Declared but **unused in render layer** (only as `--e-global-typography-secondary-font-family` token, never applied to any rendered widget on homepage). |
| `Domine` | 400 / 500 / 600 / 700 | `/wp-content/uploads/elementor/google-fonts/css/domine.css` (64 lines) | Used **only on the top promo bar text** "NOW AVAILABLE: Catered Food Delivered!" (Elementor widget `7b22e1b`, post-38.css: `font-family:"Domine", Sans-serif;font-size:24px;font-weight:400;line-height:32px;color:#FFFFFF`). The bar is `display:none` on desktop so most visitors never see it. |
| Font Awesome 5 Free (brands + solid + fontawesome) | 400 / 900 | `/wp-content/plugins/elementor/assets/lib/font-awesome/css/{brands,solid,fontawesome}.min.css?ver=5.15.3` | Used for social icons (Facebook, YouTube, Instagram brand glyphs), mobile menu toggle (eicons), Instagram play-button overlay, arrow SVGs are inline (not FA). |

### 2.2 Helper classes (the actual font-switching mechanism)

From `theme-style.css` lines 98–129:

```css
.reck_reg *            { font-family: 'Reckless TRIAL'!important;       font-weight: normal!important; }
.reck_regitalic *      { font-family: 'Reckless TRIAL'!important;       font-weight: normal!important; font-style: italic; }
.reck_med  *           { font-family: 'Reckless TRIAL'!important;       font-weight: 500!important; }
.domanie_reg *         { font-family: 'Domaine Sans Text'!important;    font-weight: normal!important; }
.domanie_med *,
.domanie_test_med *    { font-family: 'Domaine Sans Text Test'!important; font-weight: 500!important; }
.domanie_bld *         { font-family: 'Domaine Sans Text'!important;    font-weight: bold!important; }
.italic_heading h2 span { font-family: 'Reckless TRIAL'!important;     font-weight: normal!important; font-style: italic; }
```

These classes are applied to Elementor **widgets** (not sections), and they propagate the `font-family` to ALL descendant elements via the `*` universal selector + `!important`. That's why the per-widget CSS in `post-10.css` that says `font-family:"Roboto"` is overridden at runtime — the helper class is closer to the rendered text node and uses `!important`.

### 2.3 Type scale (computed styles + Elementor `post-10.css` declarations)

All sizes below are **desktop (≥1025 px)**. Mobile sizes (≤767 px) are noted in column 8.

| Element | Selector | Font family (rendered) | Size (px) | Weight | Line-height | Letter-spacing | Text-transform | Colour | Mobile size |
|---|---|---|---|---|---|---|---|---|---|
| Hero H3 "Parties are our passion." | `.reck_reg h3` (widget `d0ec9f1`) | Reckless TRIAL | **60** | 400 | 80 | normal | none | `#FFFFFF` | 30 / 40 |
| Hero city label "New york city" | `.domanie_reg h4` (widget `c496145`) | Domaine Sans Text | 18 | 400 (normal) | 24 | normal | UPPERCASE | `#000000` | 14 / 19 |
| Hero city label "Long Island" | `.domanie_reg h4` (widget `53cd874`) | Domaine Sans Text | 18 | 400 | 24 | normal | UPPERCASE | `#000000` | 14 / 19 |
| Hero city label "Hamptons" | `.domanie_reg h4` (widget `14a6267`) | Domaine Sans Text | 18 | 400 | 24 | normal | UPPERCASE | `#000000` | 14 / 19 |
| About H1 "We Offer Full Service Off Premise Catering" | `.reck_reg h1` (widget `617a823`) | Reckless TRIAL | **52** | 400 | 70 | normal | none | `#000000` | 36 / 40 |
| About body `<p>` | `.reck_reg p` (widget `b0e64b3`) | Reckless TRIAL (CSS declares Roboto, overridden) | 20 | 400 | 30 | normal | none | `#000000` | 18 / 26 |
| About button "Discover Locations" | `.right_arr_btn .elementor-button-text` (widget `bc8965c`) | Domaine Sans Text | 18 | 400 | 28 | **1.8 px** | UPPERCASE | `#A18A8A` (default) → `#E71D3A` (hover) | unchanged |
| Our Food eyebrow `OUR FOOD` | `.domanie_med h5` (widget `b1443de`) | Domaine Sans Text Test | 20 | 500 | 27 | **2.0833 px** | UPPERCASE | `#E71D3A` | unchanged |
| Our Food H2 "Cooking is love made visible." | `.reck_reg.sprkl_title h2` (widget `90ac05a`) | Reckless TRIAL | **52** | 400 | 70 | normal | none (italic on `visible.` via `<i>` tag) | `#000000` | 36 / 40 |
| Secret Ingredient H2 "We're your secret ingredient." | `.reck_reg h2` (widget `6103b42`) | Reckless TRIAL | **52** | 400 | 70 | normal | none (italic on `secret ingredient.` via `<i>` tag) | `#000000` | 36 / 40 |
| Secret Ingredient body `<p>` | `.reck_reg p` (widget `1b52691`) | Reckless TRIAL | 20 | 400 | 30 | normal | none | `#000000` | 18 / 26 |
| HQ eyebrow "Our New headquarters" | `.domanie_med h5` (widget `6a0b935`) | Domaine Sans Text Test | 20 | 500 | 27 | **2.0833 px** | UPPERCASE | `#E71D3A` | unchanged |
| HQ H2 "TwoFortyThirty" | `.reck_reg h2` (widget `369fa58d`) | Reckless TRIAL | **52** | 400 | **62** (note: 62, not 70 — tighter) | normal | none | `#000000` | 36 / 40 |
| HQ body `<p>` | `.reck_reg p` (widget `1a231328`) | Reckless TRIAL | 20 | 400 | 30 | normal | none | `#000000` | 18 / 26 |
| HQ button "view more" | `.right_arr_btn .elementor-button-text` (widget `421c314c`) | Domaine Sans Text | 18 | 400 | 28 | 1.8 px | UPPERCASE | `#A18A8A` → `#E71D3A` | unchanged |
| Let's Party H2 "Let's Party" | `.reck_reg.sprkl_title h2` (widget `ed4d114`) | Reckless TRIAL | **52** | 400 | 70 | normal | none | `#000000` | 36 / 40 |
| Our Events eyebrow H2 | `.domanie_reg h2` (widget `c0a3468`) | Domaine Sans Text | 18 | 400 | 28 | **1.8 px** | UPPERCASE | `#A18A8A` | unchanged |
| Event card H4 "weddings" / "CORPORATE" / "PRIVATE PARTIES" | `.reck_reg h4 a` (widgets `d0a8996`, `7b2daf1`, `46526c7`) | Reckless TRIAL | 20 | 400 | 30 | **2 px** | UPPERCASE | `#FFFFFF` (white on black overlay) | unchanged |
| Blog card title | `.blog_item .slide_title a` (shortcode) | Reckless TRIAL | **24** | 400 | 34 | normal | none | `#FFFFFF` (white on image) | 16 / 20 |
| Blog card meta "14 Dec, 2023" + category "Blog" | `.blog_meta_cus span` (inline shortcode CSS) | Domaine Sans Text | 14 | 400 | 30 | **1.4 px** | UPPERCASE | `#A18A8A` | unchanged |
| Press card H2 title | `.cus_post_item .cus_pst_cont h2 a` (inline CSS) | Reckless TRIAL | 22 | 400 | 26 | normal | none | `#000000` → `#E71D3A` on hover | unchanged |
| Press badge (`.pst_badge img`) | inline image | — | — | — | — | — | — | (image-based, `badge-logo.png` 2877 bytes) | — |
| Instagram H2 "A Very Social Life" | `.italic_heading h2` (widget `16cae8f`) | Reckless TRIAL (italic on `Very` span) | **52** | 400 | 70 | normal | none | `#000000` (the `<span>Very</span>` is rendered italic via `.italic_heading h2 span { font-style: italic; }`) | 36 / 40 |
| Footer H2 "It's party time" | `.reck_reg h2` (widget `12b5813`) | Reckless TRIAL | **34** | 400 | 44 | **0.325 px** | none | `#000000` | unchanged |
| Footer H4 "CONTACT US" / "SUBSCRIBE TO OUR NEWSLETTER" | `.domanie_reg h4` (widgets `142f0f9`, `84692de`) | Domaine Sans Text | 20 | 400 | 28 | **2.5 px** | UPPERCASE | `#000000` | unchanged |
| Footer address | `.domanie_reg p` (widgets `785f8a7`, `7ac5223`, `8f92b41`) | Domaine Sans Text | 12 | 400 | 16 | **1.6521127 px** | none | `#000000` | unchanged |
| Top promo bar text "NOW AVAILABLE: Catered Food Delivered!" (hidden on desktop) | `.top_bar_text` (widget `7b22e1b`) | Domine | 24 | 400 | 32 | normal | none | `#FFFFFF` | unchanged |
| Nav menu item | `.elementor-nav-menu--main .elementor-item` | Roboto in CSS, overridden to **Domaine Sans Text** via `.domanie_reg` parent | 14 (declared) → **15 (rendered, body min)** | normal (400) | 19 (declared) / 24 (rendered) | **1.4 px** (declared) / normal (rendered) | UPPERCASE | `#000000` | unchanged |

### 2.4 Italic as a structural device

It's worth dwelling on this: **EA uses italic not as emphasis but as a stylistic alternate for the *last fragment* of a headline**. Every headline that ends with an emotional or evocative phrase renders that phrase in italic — same family, same weight, just `font-style: italic`:

- "Cooking is love made <i>visible.</i>"
- "We're your<br><i>secret ingredient.</i>"
- "A <span>Very</span> Social Life" (italic on the middle word)

The italic is achieved via `<i>` tags inside the Elementor heading widget (literal markup, not via CSS class) or via the `.italic_heading h2 span` rule. This is a **design-system rule worth replicating**: any headline with a final emphasised phrase gets italic on that phrase only.

### 2.5 Type-system summary for the Interfood clone

For the `ea-*` editorial layer in `src/app/globals.css`:

```css
:root {
  --ea-font-display:  "Fraunces", "Reckless TRIAL", Georgia, serif;   /* serif: H1, H2, H3, body */
  --ea-font-sans:     "Inter",    "Domaine Sans Text", system-ui, sans-serif; /* eyebrow / button / micro */
  --ea-font-italic:   "Fraunces Italic", "Reckless TRIAL", Georgia, serif;
}
```

- **H1/H2/H3** → Reckless TRIAL replacement = **Fraunces 400** (with optical sizing enabled, opsz 144 for hero, opsz 24 for body). If we license Reckless, we use it directly.
- **Body `<p>`** → Reckless TRIAL replacement = **Fraunces 400** at 20 px / 30 px line-height.
- **Eyebrow H5 + button text + nav + footer H4 + footer address** → Domaine Sans Text replacement = **Inter 500** (eyebrow) / **Inter 400** (buttons, nav, footer H4).
- **Italic emphasis** → Fraunces Italic for the trailing phrase in headlines.

---

## 3. Sections catalog

The homepage is **14 distinct top-level Elementor sections** stacked top-to-bottom, totalling 7,483 px of scroll at desktop 1440 px. Sections are numbered 0–13 below (the same numbering used by `agent-browser eval` on `.elementor-section.elementor-top-section`).

### 3.1 Section 0 — Top notification bar (`NOW AVAILABLE: Catered Food Delivered!`)

| Property | Value |
|---|---|
| Elementor ID | `81ee4fc` (post-38) |
| Visible height | **0 px** (hidden on desktop via `.elementor-hidden-desktop`) |
| Background colour | `#000000` (black) → on hover `#E71D3A` (red), 0.3 s linear transition |
| Layout | Single full-width row, centered text |
| Text | "NOW AVAILABLE: Catered Food Delivered!" — Domine 24 px / 400 / 32 px line-height / `#FFFFFF` |
| Link target | (link wraps whole bar → not captured, likely to `/catered-food-delivered/` or `/order-online/`) |
| Display rules | Hidden on desktop, tablet, **and** phone (per the `elementor-hidden-desktop elementor-hidden-tablet elementor-hidden-phone` classes). Effectively **never visible** in current production config — likely toggled off but not removed from the page. |

> **Clone decision:** Skip entirely OR implement as a dismissible banner that appears above the header on mobile only (where it might be enabled in production).

---

### 3.2 Section 1 — Header (`Logo + nav menu`)

| Property | Value |
|---|---|
| Elementor ID | `6d5beb8` (post-38) |
| Visible height | **110 px** |
| Background colour | `rgba(0, 0, 0, 0)` (transparent — overlays hero image) |
| Layout | Full-width row, content-middle, `padding: 10px 50px 10px 50px` |
| Logo | `EACateringLogo.svg` (6.8 KB), rendered at **262 × 80 px** (CSS forces `width:240%;height:80px;` on the `<img>`) |
| Nav | 6 items: ABOUT, EVENTS, PRESS, BLOG, CAREERS, CONTACT US — Domaine Sans Text 14 px / 400 / uppercase / 19 px line-height / letter-spacing 1.4 px / colour `#000000` |
| Mega-menu behaviour | ABOUT and EVENTS have sub-menus (see §6 below for full structure) |
| Sticky behaviour | Position: **fixed** (per `.elementor-location-header { position:fixed; top:0; left:0; z-index:999; width:100%; }` in `theme-style.css` line 130) but **transparent on home page top**, then on scroll past hero gains `.sticky_header` class → `background:#fff; box-shadow:0px 0px 5px rgba(0,0,0,0.5); transition:all .2s linear;` |
| Top promo bar visibility | `.sticky_header .top_headr_notifaicatio, body:not(.home) .top_headr_notifaicatio { display:none; }` — promo only shows on home + non-sticky |

> **Note:** The `position:fixed` rule is set on `.elementor-location-header` (the Elementor template part wrapper), but `.header-sec` itself (the inner section) has `position:relative` per the computed style we measured. So the **visual sticky effect comes from a JS-added `.sticky_header` class on the wrapper**, not from CSS positioning. The header actually scrolls with the page until JS detects a scroll threshold and adds the sticky class.

---

### 3.3 Section 2 — Hero (`Parties are our passion.`)

| Property | Value |
|---|---|
| Elementor ID | `ee6e82e` (post-10) |
| Top offset | 0 px |
| Visible height | **650 px** (desktop) / 461 px (tablet, container min-height + bg image at `1000px auto`) / 283 px (mobile, container min-height + bg at `558px auto`, position `top center`, padding `0 15px`) |
| Background | `url("https://elegantaffairscaterers.com/wp-content/uploads/2021/07/hero_img.jpeg")`, position `center center`, no-repeat, `cover` (saved as `/media/ea/ea-hero-bg.jpg`, 80 KB) |
| Layout | Single full-width section, `elementor-section-height-min-height elementor-section-items-middle` — content vertically centred |
| Headline | H3 `Parties are<br>our passion.` rendered as `<h3 class="elementor-heading-title">Parties are<br>our passion.</h3>` — **Reckless TRIAL 60 px / 400 / 80 px line-height / `#FFFFFF`** — note: H3 not H1 (an SEO mistake on EA's part, but visually it's the hero) |
| Eyebrow | none |
| CTA | none |
| Animation | `fadeInDown` on the H3 heading (Elementor built-in animation preset, fires on viewport entry) |
| Screenshot | [`/media/ea/ea-hero-shot.png`](../public/media/ea/ea-hero-shot.png) (585 KB) |

---

### 3.4 Section 3 — Hero continuation (`New york city · Long Island · Hamptons` + hero video)

| Property | Value |
|---|---|
| Elementor ID | `9e33e0e` (post-10) |
| Top offset | 650 px |
| Visible height | **827 px** |
| Background colour | `rgba(0, 0, 0, 0)` (transparent) |
| Layout | Top-level section containing one **inner section** `54b4f48` (full-width, content-middle, column-gap `no`) split into **4 columns × 25 %**: <br>1. (Spacer / empty — H3 sits in section 2 above)<br>2. H4 `New york city` + horizontal divider<br>3. H4 `Long Island` + horizontal divider<br>4. H4 `Hamptons` (no trailing divider)<br>Below the inner section, a hosted HTML5 video widget (`e58bc3d`) plays the background video. |
| City labels | H4 × 3, **Domaine Sans Text 18 px / 400 / 24 px line-height / UPPERCASE / `#000000`** |
| Dividers | `--divider-border-style: solid; --divider-color: #A18A8A; --divider-border-width: 2px;` — Elementor divider widget, view-line, **196 px wide** (computed) |
| Background video | `<video class="elementor-video" src="https://elegantaffairscaterers.com/wp-content/uploads/2021/07/landscape-1.mp4" autoplay loop muted playsinline controlsList="nodownload" />` — 533 KB MP4, **autoplay / loop / muted / playsinline** (mobile-safe), `object-fit: cover`. Saved locally as [`/media/ea/ea-hero-video.mp4`](../public/media/ea/ea-hero-video.mp4). |
| Animation | The `.sep_list` wrapper around the city labels has a CSS wipe-reveal animation — see §4.1 (Wow moment #1) |
| Screenshot | [`/media/ea/ea-section-locations.png`](../public/media/ea/ea-section-locations.png) (210 KB) |

> **Note on the "two heroes" pattern:** EA splits what most sites would do as one hero into **two stacked sections** — Section 2 is the H3 hero text over a static JPEG, Section 3 is the city-selector row plus the autoplaying MP4. This is a clever **progressive-enhancement fallback**: if the video fails to load (slow connection, codec issue), the static JPEG hero from Section 2 still delivers the brand message; Section 3 simply falls back to the (transparent) row of city labels with no video bg.

---

### 3.5 Section 4 — About / Service pitch (`We Offer Full Service Off Premise Catering`)

| Property | Value |
|---|---|
| Elementor ID | `ce53533` (post-10) |
| Top offset | 1,477 px |
| Visible height | **464 px** |
| Background colour | `rgba(0, 0, 0, 0)` (transparent → page bg is white) |
| Layout | Boxed section (max-width 1140 px desktop, 1024 px tablet, 767 px mobile), single column 100 %, content centred |
| Column animation | `animated-slow elementor-invisible` → `fadeInUp` on viewport entry |
| Headline (H1) | `We Offer Full Service Off Premise Catering` — **Reckless TRIAL 52 px / 400 / 70 px line-height / `#000000` / text-align center** |
| Body | `<p>Elegant Affairs offers Full Service Off Premise Catering, for social, corporate, non-profit parties and events in Manhattan, NYC, Long Island, and the Hamptons. Whether you are planning a corporate event in Manhattan, a lavish Long Island mansion wedding, a Hampton's beach soiree, or a private celebration at home, Elegant Affairs is New York's Catering Company of Choice.</p>` — Reckless TRIAL 20 px / 400 / 30 px / `#000000` / centered |
| CTA button | `Discover Locations` — link to `/about/our-venues/` — Domaine Sans Text 18 px / 400 / 28 px / 1.8 px letter-spacing / UPPERCASE / `#A18A8A` (default) → `#E71D3A` (hover) / **transparent bg** (`background-color:#61CE7000`) / padding `12px 24px` / 0 border-radius / arrow icon 25 × 25 px fill `#E71D3A`, rotated 180° (so arrow points right), margin-left 15 px |
| Screenshot | [`/media/ea/ea-section-about.png`](../public/media/ea/ea-section-about.png) (252 KB) |

---

### 3.6 Section 5 — Our Food (`Cooking is love made visible.` + carousel)

| Property | Value |
|---|---|
| Elementor ID | `71d2ba3` (post-10) |
| Top offset | 1,941 px |
| Visible height | **815 px** |
| Background colour | `rgba(0, 0, 0, 0)` (white) |
| Layout | Boxed, single column, content centred |
| Eyebrow (H5) | `OUR FOOD` — Domaine Sans Text Test (Medium) 20 px / 500 / 27 px / **2.0833333 px letter-spacing** / UPPERCASE / `#E71D3A` |
| Headline (H2) | `Cooking is love<br>made <i>visible.</i>` — Reckless TRIAL 52 px / 400 / 70 px / `#000000`, with the word `visible.` in italic via inline `<i>` tag. **Special class `sprkl_title`** applies a CSS `::after` pseudo-element loading `images/sparkles.gif` as a decorative sparkle to the right of the headline. |
| Sparkle decoration | `.sprkl_title .elementor-heading-title::after { content:''; position:absolute; top:-10px; right:-200px; width:100%; height:100px; background:url(images/sparkles.gif) no-repeat; background-size:120px auto; background-position:right center; }` — a 120 × 100 px animated sparkle GIF floats to the right of the headline. (File not downloaded — needs the `images/sparkles.gif` asset from theme folder.) |
| Spacer | 1 × `elementor-widget-spacer` (desktop only, hidden on phone) |
| Carousel | `.our_food_slidr` Swiper (Elementor `image-carousel` widget), 3 slides:<br>1. `E-21-min.jpeg` (alt "Catering Servics") — saved as [`ea-food-1.jpg`](../public/media/ea/ea-food-1.jpg)<br>2. `image4-min-1.jpeg` (alt "Catering Services NYC") — saved as [`ea-food-2.jpg`](../public/media/ea/ea-food-2.jpg)<br>3. `E-7-min-1.jpeg` (alt "fine dining plate") — saved as [`ea-food-3.jpg`](../public/media/ea/ea-food-3.jpg)<br>Settings: `slides_to_show=1`, `navigation=dots`, `autoplay=yes`, `pause_on_hover=yes`, `pause_on_interaction=yes`, `autoplay_speed=5000` ms, `infinite=yes`, `effect=slide`, `speed=500` ms |
| Carousel pagination dots | Custom: 10 × 10 px, border-radius 50 %, `border: 1px solid #A18A8A`, opacity 1, inactive bg `none`, active bg `#A18A8A` (filled mauve). Positioned outside the carousel wrapper, 20 px below. |
| Screenshot | [`/media/ea/ea-section-our-food.png`](../public/media/ea/ea-section-our-food.png) (600 KB) |

---

### 3.7 Section 6 — Secret Ingredient (`We're your secret ingredient.`)

| Property | Value |
|---|---|
| Elementor ID | `e3c0556` (post-10), special class `ing_bx_hm` |
| Top offset | 2,756 px |
| Visible height | **734 px** |
| Background colour | `#F1ECEC` (blush) |
| Background image | `url("https://elegantaffairscaterers.com/wp-content/uploads/2021/07/right-min.jpeg")`, position `top right`, no-repeat, size `45% auto` (so the image is 45 % of the section width, anchored top-right, occupying the right half of the section). Saved as [`/media/ea/ea-secret-ingredient-bg.jpg`](../public/media/ea/ea-secret-ingredient-bg.jpg) (78 KB). |
| Layout | Boxed, single column, content centred. The column itself (`d66445c`) has its own background colour `#FFFFFF` (so the text sits on a white card that overlays the blush section + JPEG). Max-width of the widget-wrap is 900 px (per `.ing_bx_hm .elementor-column > .elementor-widget-wrap { max-width: 900px; position: relative; }`). |
| Headline (H2) | `We're your<br><i>secret ingredient.</i>` — Reckless TRIAL 52 px / 400 / 70 px / `#000000`, italic on `secret ingredient.` via `<i>` |
| Body | `<p>At our establishment, we provide personalized food menus featuring premium ingredients. Our culinary creations are not only delectable but also visually enticing. We take pride in delivering a dining experience that satisfies both the discerning eye and the discerning palate. Our team of seasoned planners will determine the required party rentals and event services needed for each event, and will handle all of the arrangements with detail and precision. Delicious food combined with impeccable service and stylish visual presentation are the three key ingredients to Elegant Affair's success.</p>` — Reckless TRIAL 20 px / 400 / 30 px / `#000000` / centered |
| CTA button | `Our Services` — same style as `Discover Locations` (transparent bg, mauve text + red arrow) |
| Champagne-gif decoration | `.ing_bx_hm .elementor-column > .elementor-widget-wrap::after { content:''; position:absolute; bottom:-50px; left:50px; background:url(images/champagne-2.gif) no-repeat; width:150px; height:160px; background-position:left center; background-size:100% auto; }` — a 150 × 160 px animated champagne-pouring GIF floats in the bottom-left of the white card, partly overflowing below. (File `images/champagne-2.gif` not downloaded — needs the theme asset.) |
| Animation | `fadeInUp` on the column |
| Screenshot | [`/media/ea/ea-section-secret-ingredient.png`](../public/media/ea/ea-section-secret-ingredient.png) (444 KB) |

---

### 3.8 Section 7 — Spacer

| Property | Value |
|---|---|
| Elementor ID | `108b5d4` (post-10) |
| Top offset | 3,490 px |
| Visible height | **88 px** |
| Background colour | transparent (white) |
| Contents | A single `elementor-widget-spacer` (no content, just vertical whitespace) |
| Purpose | Provides breathing room between the blush Secret Ingredient section (which has the champagne-gif overflow) and the white HQ section below. |

---

### 3.9 Section 8 — HQ / TwoFortyThirty

| Property | Value |
|---|---|
| Elementor ID | `4c490f53` (post-10) |
| Top offset | 3,578 px |
| Visible height | **455 px** |
| Background colour | `#FFFFFF` (white) |
| Layout | **2-column 50/50** (boxed, column-gap default): <br>• Left column (`86931c1`, `animated-slow elementor-invisible fadeInUp`): YouTube video widget<br>• Right column (`493df91c`, `animated-slow elementor-invisible fadeInUp`): text content |
| Left column — YouTube video | Elementor `widget-video`, `video_type=youtube`, `youtube_url=https://youtu.be/3vwHEn3AZjs`. Renders an `<iframe src="https://www.youtube.com/embed/3vwHEn3AZjs?controls=0&rel=0&playsinline=0&cc_load_policy=0&autoplay=0&enablejsapi=1&origin=https%3A%2F%2Felegantaffairscaterers.com&widgetid=1&forigin=...">`, 640 × 360 base size, scaled to fill column. **No autoplay** (user must click — YouTube embed default). |
| Right column — Eyebrow (H5) | `Our New headquarters` — Domaine Sans Text Test 20 px / 500 / 27 px / 2.083 px letter-spacing / UPPERCASE / `#E71D3A` |
| Right column — Headline (H2) | `TwoFortyThirty` — Reckless TRIAL 52 px / 400 / **62 px** line-height (note: tighter than other H2s which are 70 px) / `#000000` |
| Right column — Body | `<p>Manhattan's newest, upscale and intimate event space & the first event-industry creative hub.</p>` — Reckless TRIAL 20 px / 400 / 30 px / `#000000` |
| Right column — CTA button | `view more` — link to `/locations/twofortythirty/` — same style as `Discover Locations` (mauve text + red arrow, transparent bg, **padding: 0**). Align-left. |
| Animation | `fadeInUp` on both columns (staggered by Elementor's default 100 ms delay) |
| Screenshot | [`/media/ea/ea-section-hq.png`](../public/media/ea/ea-section-hq.png) (483 KB) |

---

### 3.10 Section 9 — Let's Party / Our Events

| Property | Value |
|---|---|
| Elementor ID | `489b71e` (post-10) |
| Top offset | 4,033 px |
| Visible height | **268 px** |
| Background colour | transparent (white) |
| Layout | Boxed, single column, content centred |
| Headline 1 (H2, `sprkl_title`) | `Let's Party` — Reckless TRIAL 52 px / 400 / 70 px / `#000000`, with sparkles.gif `::after` decoration |
| Headline 2 (H2) | `Our Events` — Domaine Sans Text 18 px / 400 / 28 px / **1.8 px letter-spacing** / UPPERCASE / `#A18A8A` (mauve) — acts as an eyebrow/sub-header under `Let's Party` |
| No CTA | (the CTA is implicit — the events cards below are clickable) |
| Animation | `fadeInUp` on the column |
| Screenshot | [`/media/ea/ea-section-lets-party.png`](../public/media/ea/ea-section-lets-party.png) (1 MB) |

---

### 3.11 Section 10 — Events cards (`weddings · CORPORATE · PRIVATE PARTIES`)

| Property | Value |
|---|---|
| Elementor ID | `1efa720` (post-10), special class `party_hm_sec` |
| Top offset | 4,301 px |
| Visible height | **754 px** |
| Background colour | transparent (white) |
| Layout | Boxed, **3-column × 33 % each** (`elementor-col-33`), content-middle, gap default. Each column is a 438 × 638 px vertical image with an inner-section overlay panel below containing the category label + divider. |
| Column 1 (`ccbf464`) — Weddings | Image: `p1.jpg` (438 × 638, saved as [`ea-events-1.jpg`](../public/media/ea/ea-events-1.jpg), 255 KB) wrapped in `<a href="/weddings/">`. Inner section (`182f9cb`, background `#000000`) below the image, containing: <br>• H4 `<a href="/weddings/">weddings</a>` — Reckless TRIAL 20 px / 400 / 30 px / 2 px letter-spacing / UPPERCASE / `#FFFFFF`<br>• Divider `d1ca28f` — solid white, 1 px border-width |
| Column 2 (`1cef3d9`) — Corporate | Image: `p1-2.jpg` (438 × 638, saved as [`ea-events-2.jpg`](../public/media/ea/ea-events-2.jpg), 254 KB) wrapped in `<a href="/corporate/">`. Inner section (`68183ca`, background `#000000`), containing: <br>• H4 `<a href="/corporate/">CORPORATE</a>`<br>• Divider `079977c` — solid white 1 px |
| Column 3 (`5c3a911`) — Private Parties | Image: `p1-1.jpg` (438 × 638, saved as [`ea-events-3.jpg`](../public/media/ea/ea-events-3.jpg), 258 KB) wrapped in `<a href="/private-parties/">`. **Special: this column has `motion_fx_motion_fx_scrolling=yes`** — Elementor Pro Motion FX scroll animation (image parallaxes/transforms as you scroll past). Inner section (`4bb75dc`, background `#000000`), containing: <br>• H4 `<a href="/private-parties/">PRIVATE PARTIES</a>`<br>• Divider `92f4bb3` — solid white 1 px |
| Hover effect on images | `.cus_post_item .pst_img a img:hover, .feat_artimg img:hover, .party_hm_sec img:hover, .jl_item_img a img:hover { transform: scale(1.1); }` — all event/blog/journal images zoom to 110 % on hover (CSS transition `all 0.2s linear`, overflow hidden on parent) |
| Animation | `fadeInUp` on each column (staggered by Elementor default) |
| Screenshot | [`/media/ea/ea-section-events-cards.png`](../public/media/ea/ea-section-events-cards.png) (890 KB) |

> **Note on Motion FX:** Only column 3 has `motion_fx_motion_fx_scrolling=yes` enabled. Elementor Motion FX is a Pro feature that adds scroll-driven transforms (parallax / vertical / horizontal / opacity / blur). The actual effect on this column is subtle (a small vertical offset on the image as you scroll past). It's CSS-driven (no GSAP) and uses `e-motion-fx.min.css` + an inline JS data-bind.

---

### 3.12 Section 11 — Blog + Press

| Property | Value |
|---|---|
| Elementor ID | `7fdde04` (post-10) |
| Top offset | 5,055 px |
| Visible height | **1,433 px** (tallest section on the page) |
| Background colour | `#F1ECEC` (blush, same as Secret Ingredient) |
| Layout | Boxed, single column 100 %, containing 8 stacked widgets: <br>1. Shortcode widget (`22993d2`) — `blog_grid` with **2 visible blog_item + Load More button** <br>2. Button (`46f3238`, `right_arr_btn nrgtive_top_30`) — `Blog` link, pulled up 30 px and right <br>3. Heading (`45c8923`) — H2 `Press`<br>4. Spacer (`8d17c13`)<br>5. Text editor (`8eb91f4`) — `press_list` with **3 visible cus_post_item + Load More button**<br>6. Button (`264f4c6`) — `Press` link |
| **Blog grid sub-component** | `.blog_grid` shortcode renders 2 `.blog_item` cards. Each card is full-width with the image on top and the meta + title + arrow on a black overlay. <br>Card 1: image `mitzvahthumbnail1-516x335.jpg` (saved as [`ea-hq-blog-mitzvah.jpg`](../public/media/ea/ea-hq-blog-mitzvah.jpg), 36 KB), date `14 Dec, 2023`, category `Blog`, title `Bar/Bat Mitzvah's with Elegant Affairs: Unforgettable Off-Premise Catering Services`, link to `/bar-bat-mitzvahs-with-elegant-affairs-...`.<br>Card 2: image `PennealaVodka_1512x.jpg-516x360.webp` (saved as [`ea-hq-blog-penne.webp`](../public/media/ea/ea-hq-blog-penne.webp), 31 KB), date `01 Dec, 2023`, category `Blog`, title `Unwrap the Joy of Stress-Free Holidays: Elevate Your Celebrations with EA Catering To-Go!`, link to `/unwrap-the-joy-of-stress-free-holidays-...`.<br>Load More button: `<a id="loadMoreBlog" data-page="2" data-url="/wp-admin/admin-ajax.php">Load More</a>` — AJAX-loaded additional posts via admin-ajax. |
| **Blog card title style** | Reckless TRIAL 24 px / 400 / 34 px / `#FFFFFF` (white on dark image overlay) |
| **Blog card meta** | Date + category, Domaine Sans Text 14 px / 400 / 30 px / **1.4 px letter-spacing** / UPPERCASE / `#A18A8A` |
| **Press list sub-component** | `.press_list.load_more_post[data-category=press]` renders 3 `.cus_post_item` cards. Each card has: image with `.pst_badge` overlay (badge-logo.png centered on black 80 px high min-height, max-height 37 px image), then a `.cus_pst_cont` white card with -50 px top margin (so it overlaps the image), containing H2 title + read-more arrow. <br>Press 1: badge + `Screenshot-2022-12-23-at-1.26.47-PM-516x360.png` (saved as [`ea-hq-blog-holiday.png`](../public/media/ea/ea-hq-blog-holiday.png), 291 KB), title `Andrea Correale Shares Holiday Hosting Ideas on Good Day New York`, link to `/andrea-correale-shares-holiday-hosting-ideas-on-good-day-new-york/`.<br>Press 2: badge + `IMG_5343-e1660137715946-516x360.jpeg` (saved as [`ea-hq-blog-cocktail.jpeg`](../public/media/ea/ea-hq-blog-cocktail.jpeg), 57 KB), title `Inside Polo in the Hamptons`, **external link** to `https://theknockturnal.com/inside-saturdays-polo-in-the-hamptons-event/` (opens in new tab, `target=_blank`).<br>Press 3: badge + `IMG_6155-2-516x360.jpg` (saved as [`ea-hq-blog-private.jpg`](../public/media/ea/ea-hq-blog-private.jpg), 30 KB), title `How To Pick the Perfect Grill This Summer`, **external link** to `https://www.realtor.com/advice/home-improvement/sear-baby-sear-how-to-pick-the-perfect-grill-this-summer/` (target=_blank). |
| **Press card title style** | Reckless TRIAL 22 px / 400 / 26 px / `#000000` → `#E71D3A` on hover |
| **Press card image hover** | `transform: scale(1.1)` (same rule as event images) |
| **Press card badge** | `.cus_post_item .pst_img .pst_badge` is a black min-height-80 px flex banner across the top of the image, containing `badge-logo.png` (the EA monogram, saved as [`ea-badge.png`](../public/media/ea/ea-badge.png), 2.8 KB, max-height 37 px, auto-width). |
| Layout (mobile ≤700 px) | `.press_list .cus_post_item { width: 100%; margin-bottom: 30px; }` — stack to single column |
| Animation | `fadeInUp` on the column |
| Screenshot | [`/media/ea/ea-section-blog-press.png`](../public/media/ea/ea-section-blog-press.png) (689 KB) |

---

### 3.13 Section 12 — Instagram (`A Very Social Life`)

| Property | Value |
|---|---|
| Elementor ID | `8c5cbeb` (post-10) |
| Top offset | 6,488 px |
| Visible height | **590 px** |
| Background colour | transparent (white) |
| Layout | Boxed, single column 100 %, content centred. Contains 3 widgets: <br>1. Heading (`16cae8f`, `reck_reg italic_heading`) — H2 `A <span>Very</span> Social Life`<br>2. Button (`a2f76f3`, `right_arr_btn`) — `follow us on instagram` link to `https://www.instagram.com/elegantaffairs1/`, **flex-direction: row-reverse** (so icon appears LEFT of text)<br>3. WP widget text (`db33a9e`) — SmashBalloon Instagram Feed shortcode |
| Headline | `A <span>Very</span> Social Life` — Reckless TRIAL 52 px / 400 / 70 px / `#000000`, with the word `Very` wrapped in `<span>` and rendered **italic** via `.italic_heading h2 span { font-family: 'Reckless TRIAL'!important; font-weight: normal!important; font-style: italic; }` |
| Button | `follow us on instagram` — same `.right_arr_btn` style (mauve text + red arrow), but `flex-direction: row-reverse` puts the arrow icon BEFORE the text (i.e. arrow on left, text on right). The arrow SVG is rotated 180° so visually it still points right. |
| Instagram feed | SmashBalloon `#sb_instagram` div, `sbi_col_6` (6 columns desktop), `sbi_tab_col_2` (2 tablet), `sbi_mob_col_1` (1 mobile), `data-num=6`, `data-imageaspectratio=1:1`, `data-feedid=*1`, `data-cachetime=30`. Renders 6 latest Instagram posts (mix of videos + photos) with `sbi_photo_wrap > a.sbi_photo` containing `<img src="placeholder.png">` (lazy-loaded from `scontent-iad3-1.cdninstagram.com` CDN). Each video item has a `sbi_playbtn` SVG overlay (FA `fa-play` icon, white fill on transparent). Posts link to `https://www.instagram.com/reel/C2s4LwMxLq9/` etc. (open in new tab, `rel="noopener nofollow"`). |
| Image srcset | The SmashBalloon plugin provides `d`, `150`, `320`, `640` size variants per post — the rendered `<img>` uses `placeholder.png` initially and JS swaps in the actual CDN URL after `DOMContentLoaded`. (We did not download IG CDN images — they're temporary signed URLs that expire in 2 weeks.) |
| Animation | `fadeInUp` on the column |
| Screenshot | [`/media/ea/ea-section-instagram.png`](../public/media/ea/ea-section-instagram.png) (567 KB) |

---

### 3.14 Section 13 — Schema JSON-LD (hidden)

| Property | Value |
|---|---|
| Elementor ID | (inline widget, not a top-level section) |
| Top offset | 7,078 px |
| Visible height | **20 px** (just the whitespace around the script tag) |
| Background colour | transparent |
| Contents | `<script type="application/ld+json" class="yoast-schema-graph">` containing the Yoast-generated `CateringService` schema JSON-LD: name, url, logo, sameAs (Facebook, Instagram, YouTube channel URLs). Not visible to humans, parsed by search engines. |

---

### 3.15 Section 14 — Footer (`It's party time`)

| Property | Value |
|---|---|
| Elementor ID | `d96a640` (post-207, the footer template part) |
| Top offset | 7,098 px |
| Visible height | **385 px** |
| Background colour | `#FFFFFF` (white) |
| Border | `border-style: solid; border-width: 2px 0px 0px 0px; border-color: #F1ECEC;` (2 px blush top-border separating footer from Instagram section above) |
| Padding | `80px 0px 80px 0px` (generous top + bottom breathing) |
| Layout | Full-width row, content-top, 3 sub-rows: <br>**Row A** (top): centered H2 `It's party time` + H4 `CONTACT US` button-link + horizontal social-icons row (Facebook, Youtube, Instagram) <br>**Row B** (middle): badge/logo image (`EACateringLogo.svg` repeated from header) on left + 3 address paragraphs (NYC, Glen Cove, Southampton) horizontally arranged + H4 `SUBSCRIBE TO OUR NEWSLETTER` + Gravity Form <br>**Row C** (bottom, if any): footer credits / copyright — not visible in screenshot, likely empty in current config |
| Headline (H2) | `It's party time` — Reckless TRIAL 34 px / 400 / 44 px / **0.325 px letter-spacing** / `#000000` |
| CTA button-link (H4) | `CONTACT US` — link to `/elegantaffairs/contact-us/`, Domaine Sans Text 20 px / 400 / 28 px / **2.5 px letter-spacing** / UPPERCASE / `#000000` |
| Divider | `.elementor-divider-separator` — solid `#F00D4D` (pink-red, NOT the standard `#E71D3A`!), **2 px** border-width, **160 px** wide. Different from the rest of the site's mauve dividers — this is the signature footer divider. |
| Social icons | 3 × `elementor-social-icon` (Facebook, Youtube, Instagram) — 38 × 38 px each, grid-column-gap 20 px, `--grid-template-columns: repeat(0, auto)`, `--icon-size: 19px`. Background `var(--e-global-color-fad89c8)` = `#E71D3A` (red). Icon glyph: white (color `#FFFFFF`, fill `#FFFFFF`). Hover: background stays red, icon color turns black `#000000`. |
| Logo image | `EACateringLogo.svg` (same as header, 6.8 KB) |
| Address 1 (NYC) | `240 West 30th Street`<br>`New York, NY 10001`<br>`Main: 212-991-0078` (the phone number is a `<a href="tel:212-991-0078">` link) — Domaine Sans Text 12 px / 400 / 16 px / **1.6521127 px letter-spacing** / `#000000` / text-align center |
| Address 2 (Glen Cove) | `110 Glen Cove Avenue`<br>`Glen Cove, New York`<br>`Main: 516-676-8500` |
| Address 3 (Southampton) | `230 Elm Street`<br>`Southampton, New York`<br>`Main: 631-509-7310` |
| Newsletter CTA (H4) | `SUBSCRIBE TO OUR NEWSLETTER` — same style as `CONTACT US` H4 |
| Newsletter form | Gravity Forms (`#gform_1`), 3 fields + submit: <br>1. First Name (`input[type=text]`, placeholder `First`)<br>2. Last Name (`input[type=text]`, placeholder `Last`)<br>3. Email (`input[type=email]`, placeholder `Email`)<br>Submit button: `Submit` — `input[type=submit]`, `background-color:#E71D3A`, `color:#FFFFFF`, `padding:10px 40px`, border-radius 0 (sharp corners) — UAEL Gravity Forms styler widget applies these. |
| Animation | None (footer is always rendered, no fade-in) |
| Screenshot | [`/media/ea/ea-section-footer.png`](../public/media/ea/ea-section-footer.png) (554 KB) |

---

## 4. Wow moments

The site has **8** signature design moments worth replicating in the Interfood clone, in roughly descending order of visual impact.

### 4.1 Wow #1 — Hero autoplaying background MP4 over JPEG poster

**What the user sees:** When the homepage loads, the hero shows a static JPEG (`hero_img.jpeg`, a moody table-setting photograph) for ~200 ms, then the MP4 `landscape-1.mp4` (533 KB, no audio, 1440 × 720 ish) fades in and autoplays muted on loop. The hero text `Parties are our passion.` sits in white serif over the video, vertically centred. The whole hero is 650 px tall.

**Technical approach:**
- Elementor `widget-video` with `video_type=hosted`, `autoplay=yes`, `play_on_mobile=yes`, `mute=yes`, `loop=yes`. The Elementor shortcode renders `<video class="elementor-video" src="...mp4" autoplay loop muted playsinline controlsList="nodownload">`.
- The JPEG is loaded as the **section background** (not as the video's `poster` attribute) — so even if the `<video>` tag fails entirely, the section still has the JPEG. The video itself sits as a sibling widget INSIDE the section, with no poster.
- `object-fit: cover` on the `<video>` makes it scale to fill the wrapper while preserving aspect ratio.
- Mobile: `play_on_mobile=yes` + `muted` + `playsinline` means iOS Safari will autoplay it (otherwise iOS blocks autoplay with sound).

**Files to replicate:** `ea-hero-bg.jpg` (80 KB poster, downloaded) + `ea-hero-video.mp4` (533 KB MP4, downloaded). We'll host the MP4 on Mux for production (delivering HLS adaptive bitrate). For dev, the local MP4 works fine.

**Interfood clone implementation:**
```tsx
<section className="ea-hero relative min-h-[650px] flex items-center justify-center">
  <video autoPlay loop muted playsInline controlsList="nodownload"
         className="absolute inset-0 w-full h-full object-cover">
    <source src="/media/ea/ea-hero-video.mp4" type="video/mp4" />
  </video>
  <img src="/media/ea/ea-hero-bg.jpg" alt="" aria-hidden
       className="absolute inset-0 w-full h-full object-cover -z-10" />
  <h3 className="relative z-10 ea-font-display text-6xl text-white text-center">Parties are<br/>our passion.</h3>
</section>
```

---

### 4.2 Wow #2 — `.sep_list` wipe-reveal animation on the hero city labels

**What the user sees:** The hero city labels `NEW YORK CITY — LONG ISLAND — HAMPTONS` are connected by 115-px-wide 2-px-tall mauve divider lines. On initial page-load, the labels + dividers are completely hidden behind a white overlay; over **4 seconds**, the white overlay wipes from right to left (`width: 100% → 0px`, transition `all 4s linear`), revealing the labels and dividers beneath. It's a slow, theatrical reveal — like a curtain drawing back.

**Technical approach:**
```css
.sep_list { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; position: relative; }
.sep_list::before {
  content: '';
  position: absolute;
  right: 0; top: 0;
  width: 100%; height: 100%;
  background: #fff;
  z-index: 100;
  transition: all 4s linear;   /* the 4-second wipe */
}
.sep_list.active::before { width: 0px; }   /* triggered by JS adding .active */

.sep_list li { display: inline-block; font-size: 18px; line-height: 24px; font-weight: 400; text-transform: uppercase; }
.sep_list li:not(:last-child)::after {
  content: '';
  position: relative;
  display: inline-block;
  width: 115px; max-width: 115px;
  height: 2px;
  background: #a18a8a;
  vertical-align: middle;
  margin: 0px 20px;
}
```

A JS snippet (probably inline jQuery) detects page-load and adds the `.active` class to `.sep_list` after a short delay (~500 ms). The CSS transition then fires the 4-second wipe.

On mobile (`max-width: 767px`), the layout reflows: `.sep_list li { display: block; clear: both; width: 100%; text-align: center; }` and the divider rotates to vertical: `.sep_list li:not(:last-child)::after { position: relative; display: block; width: 2px; max-width: 2px; height: 40px; margin: 10px auto; }`.

**Interfood clone implementation:** Use Motion One `useInView` + a CSS class toggle, or pure CSS with `animation-delay` and a `@keyframes` that animates `width: 100% → 0` over 4 s. The effect is intentionally slow and ceremonial — keep the 4-second duration.

---

### 4.3 Wow #3 — Champagne-gif + Sparkles-gif decorative animations

**What the user sees:** Two GIF animations decorate the page in unexpected corners:

1. **`.ing_bx_hm .elementor-column > .elementor-widget-wrap::after`** — a 150 × 160 px animated champagne-pouring GIF (`images/champagne-2.gif`) floats in the bottom-left corner of the Secret Ingredient white card, partially overflowing below into the blush section. It animates on a loop, depicting a champagne flute being filled with bubbly.

2. **`.sprkl_title .elementor-heading-title::after`** — a 120 × 100 px animated sparkle GIF (`images/sparkles.gif`) floats to the right of any heading with the `sprkl_title` class. Used on `Cooking is love made visible.` (Our Food section) and `Let's Party` (Let's Party section).

**Technical approach:** Pure CSS `::after` pseudo-elements with `background:url(images/sparkles.gif) no-repeat; background-size:120px auto;` — no JS, no canvas, no WebGL. The GIFs are tiny (~30 KB each) and loop infinitely.

**Interfood clone implementation:** Two routes — (a) download the EA theme's GIF assets directly (if license allows) and serve from `/media/ea/sparkles.gif` + `/media/ea/champagne-2.gif`; or (b) replace with a CSS-only sparkle effect (SVG `<animate>` on small star paths) and a CSS-only champagne bubble effect (CSS keyframes on `::before`/`::after` with rising circle divs). Option (b) is cleaner for performance (no GIF download) but less expressive.

---

### 4.4 Wow #4 — Hover-zoom on every image (image-card pattern)

**What the user sees:** On the Events cards (`p1.jpg`, `p1-2.jpg`, `p1-1.jpg`), the Blog grid images, the Journal items, and the Press list images — **every clickable image zooms to 110 % scale on hover**, with the parent container's `overflow: hidden` clipping the overflow. The zoom happens over a `0.2 s linear` transition.

**Technical approach:**
```css
.cus_post_item .pst_img a img:hover,
.feat_artimg img:hover,
.party_hm_sec img:hover,
.jl_item_img a img:hover {
  transform: scale(1.1);
  /* transition: all 0.2s linear; — declared on the base selector */
}
```

The `.pst_img`, `.jl_item_img`, `.feat_artimg`, and `.party_hm_sec .elementor-image` all have `overflow: hidden` so the zoomed image stays clipped. The image is wrapped in an `<a>` so the entire image is clickable.

**Interfood clone implementation:** Trivial — `group/img` Tailwind utility pattern. Wrap the image in `<a className="group block overflow-hidden">` and apply `group-hover:scale-110 transition-transform duration-200 ease-linear` on the `<img>`.

---

### 4.5 Wow #5 — Italic-as-fragment typographic device

**What the user sees:** Every major section headline ends with an italic phrase: `Cooking is love made visible.`, `We're your secret ingredient.`, `A Very Social Life`, `Let's Party`. The italic is on the *last* (or middle, in "A Very Social Life") emphasised word, not on the whole headline. The italic uses the same family (Reckless TRIAL) at the same size and weight — only `font-style: italic` changes.

**Technical approach:** Two implementation patterns observed:
1. Inline `<i>` tag inside the Elementor heading widget: `<h2>Cooking is love<br>made <i>visible.</i></h2>` — the `<i>` tag is rendered italic by default.
2. Helper class `.italic_heading h2 span { font-style: italic; }` for the `<span>`-wrapped phrase: `<h2>A <span>Very</span> Social Life</h2>`.

**Why this is a wow moment:** Italic-as-fragment is a hallmark of editorial typesetting (think *Vogue*, *Kinfolk*, *Cereal* magazine) and signals craft. Most catering sites use bold or colour for emphasis — EA uses italic, which feels quieter, more refined, more "literary".

**Interfood clone implementation:** Add a `<i>` or `<em>` tag to the trailing phrase of every section headline. In Tailwind, just `italic` on a `<span>` inside the H2. Add a typography rule: "Every H2 that ends with an emotional/evocative phrase renders that phrase in italic, same family, same size."

---

### 4.6 Wow #6 — Text + animated arrow buttons (no fills, no borders)

**What the user sees:** Every CTA on the site (`Discover Locations`, `Our Services`, `view more`, `Blog`, `Press`, `follow us on instagram`) is a **transparent-background text link** with an inline SVG arrow icon. The text is mauve `#A18A8A`, uppercase, with 1.8 px letter-spacing. The arrow is 25 × 25 px, fill `#E71D3A` (red), rotated 180° so it points right, positioned 15 px to the right of the text with `vertical-align: middle` and a slight `top: -3px` nudge. On hover, the text colour shifts to red `#E71D3A` and — importantly — the **arrow nudges 5 px further to the right** (`margin-left: 15px → 20px`), creating a "the arrow is leaving the text behind" micro-animation.

**Technical approach:**
```css
.right_arr_btn .elementor-button {
  background-color: #61CE7000;   /* transparent (the alpha 00 is Elementor's hack for "no bg") */
  font-family: "Roboto", sans-serif;  /* overridden to Domaine Sans Text by .domanie_reg */
  font-size: 18px; font-weight: 400;
  text-transform: uppercase; line-height: 28px; letter-spacing: 1.8px;
  fill: #A18A8A; color: #A18A8A;
  border-radius: 0; padding: 12px 24px;
  transition: all 0.2s linear;
}
.right_arr_btn .elementor-button:hover, .elementor-button:focus { color: #E71D3A; }
.right_arr_btn .elementor-button:hover svg, .elementor-button:focus svg { fill: #E71D3A; margin-left: 20px; }
.right_arr_btn .elementor-button-icon svg {
  width: 25px; display: inline-block; vertical-align: middle;
  transform: rotate(180deg);  /* SVG path points left by default; rotate to point right */
  fill: #e71d3a; margin-left: 15px; position: relative; top: -3px;
}
```

The `fill: #A18A8A` on the wrapper is a fallback colour that the SVG inherits via `fill: currentColor` (the SVG paths use `fill="currentColor"` implicitly). On hover, `fill: #E71D3A` overrides.

> **Note:** The arrow SVG is the same path (`Capa_1` arrow icon, 512 × 512 viewBox) repeated for every button — it's an inline `<svg>` embedded directly in the Elementor button widget markup. No icon font needed.

**Interfood clone implementation:**
```tsx
<a href="/about/our-venues/" className="group inline-flex items-center gap-3 ea-font-sans text-18 uppercase tracking-[1.8px] text-ea-mauve hover:text-ea-red transition-all duration-200">
  Discover Locations
  <svg className="w-6 h-6 fill-ea-red rotate-180 group-hover:translate-x-1 transition-transform" viewBox="0 0 512 512">
    <path d="M492,236H68.442l70.164-69.824c7.829-7.792,7.859-20.455,0.067-28.284c-7.792-7.83-20.456-7.859-28.285-0.068l-104.504,104c-0.007,0.006-0.012,0.013-0.018,0.019c-7.809,7.792-7.834,20.496-0.002,28.314c0.007,0.006,0.012,0.013,0.018,0.019l104.504,104c7.828,7.79,20.492,7.763,28.285-0.068c7.792-7.829,7.762-20.492-0.067-28.284L68.442,276H492c11.046,0,20-8.954,20-20C512,244.954,503.046,236,492,236z" />
  </svg>
</a>
```

---

### 4.7 Wow #7 — Section reveal on scroll (`fadeInUp`)

**What the user sees:** Every major section's column has the Elementor classes `animated-slow elementor-invisible`. When the column scrolls into view, Elementor's frontend JS adds `elementor-invisible → elementor-animated` and applies the `fadeInUp` CSS animation (`opacity: 0 → 1`, `translateY: 30 px → 0`, 600 ms ease-out). The result is that each section gently fades up into view as you scroll — a slow, cinematic page-load choreography.

**Technical approach:** Elementor ships `e-animation-fadeInUp-css` (a separate stylesheet, line 88 in the HTML head) containing the `@keyframes fadeInUp { from { opacity: 0; transform: translate3d(0, 30px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }` and the helper class `.elementor-animated fadeInUp { animation-name: fadeInUp; animation-duration: 600ms; animation-fill-mode: both; }`. Elementor's frontend JS uses **IntersectionObserver** to detect when `.elementor-invisible` enters the viewport, then swaps the class. Animations are also declared for `fadeInDown` (hero H3), `fadeInLeft`, `fadeInRight`, and `grow`.

`animated-slow` is a class that sets `animation-duration: 1.5s` instead of the default 600 ms.

**Interfood clone implementation:** Use `motion` (`framer-motion` successor) with `whileInView="show" initial="hidden" viewport={{ once: true }}` and the variants:
```tsx
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};
```
Apply to each `<section>` wrapper.

---

### 4.8 Wow #8 — Two-tone section backgrounds alternating blush / white

**What the user sees:** The page alternates between **white** sections (About, Our Food, Let's Party, Events, Instagram, Footer) and **blush** `#F1ECEC` sections (Secret Ingredient, Blog+Press). The blush is reserved for the "premium" content — the secret-ingredient brand pitch and the blog+press social proof. White is for the practical / wayfinding content.

**Why this works:** The blush is just barely off-white — it reads as "warm paper" rather than "colour". The contrast with pure white creates visual rhythm without being noisy. The blush also pairs beautifully with the `right-min.jpeg` decorative image (a tablescape) anchored top-right of the Secret Ingredient section, giving that section an editorial magazine-spread feel.

**Interfood clone implementation:** Define `--ea-blush: #F1ECEC` as a token and use it deliberately for the 2 "premium" sections. Don't apply it everywhere — restraint is the point.

---

## 5. Component patterns

Reusable UI patterns observed across the homepage (and likely across all EA inner pages).

### 5.1 Button — text + arrow link (no fill, no border)

| Variant | Selector | Direction | Padding | Hover |
|---|---|---|---|---|
| Centered | `.right_arr_btn .elementor-align-center .elementor-button` | arrow RIGHT of text | `12px 24px` | text→red, arrow→red, arrow nudges +5 px |
| Left-aligned | `.right_arr_btn .elementor-align-left .elementor-button` (e.g. HQ `view more`) | arrow RIGHT | `0` (no padding) | same |
| Right-aligned with `nrgtive_top_30` | `.nrgtive_top_30` (e.g. `Blog` button in Blog+Press section) | arrow RIGHT, button pulled up 30 px and right | default | same |
| Icon-only (Blog card read-more, Press card read-more) | `.only_arr_btn a, .read_m a` | arrow only, no text | 0 | arrow→red |

> All variants use the **same SVG path** (Capa_1 512×512 left-pointing arrow, rotated 180° to point right) with `fill: #e71d3a`.

### 5.2 Card — image with overlapping content panel

| Variant | Use | Structure |
|---|---|---|
| Event card (`.party_hm_sec`) | Weddings / Corporate / Private Parties | 438×638 image → below it, an inner section with `background:#000000` containing H4 + divider. No overlap. |
| Press card (`.cus_post_item`) | Press list | Image (max-height 356 px) with `.pst_badge` overlay on top (black min-height-80 px banner with centered badge-logo.png) → below, `.cus_pst_cont` white card with `-50px` top margin (overlaps the image by 50 px), containing H2 title + read-more arrow. |
| Blog card (`.blog_item`) | Blog grid | Image on top → below, `.blog_connt` black overlay (absolute positioned, full overlay) with date + category + H2 title (white) + read-more arrow. |
| Journal item (`.jl_item_left` + `.jl_item_img`) | (Not on homepage, but exists in theme CSS) | 55/45 split: text card on left, image on right. H2 48 px Reckless TRIAL. |

### 5.3 Carousel — Swiper with custom pagination dots

Used in:
- Our Food carousel (3 slides, autoplay 5 s, dots)
- Custom Owl carousel for journal/blog sliders (10 × 10 px dots, `border: 1px solid #A18A8A`, active `background: #A18A8A`)

```css
.our_food_slidr .swiper-pagination-bullet,
.custom_carousel_el.owl-carousel button.owl-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: none;
  opacity: 1;
  border: 1px solid #A18A8A;
}
.our_food_slidr .swiper-pagination-bullet.swiper-pagination-bullet-active,
.custom_carousel_el.owl-carousel button.owl-dot.active {
  background: #A18A8A;
}
```

### 5.4 Divider — 2 px solid horizontal rule

| Variant | Where | Colour | Width | Border-width |
|---|---|---|---|---|
| Hero city dividers | Between NYC / LI / Hamptons | `#A18A8A` mauve | 196 px | 2 px solid |
| Event card dividers | Below `weddings` / `CORPORATE` / `PRIVATE PARTIES` | `#FFFFFF` white | full-width of inner column | 1 px solid |
| Footer main divider | Below `It's party time` | `#F00D4D` pink-red | 160 px | 2 px solid |
| Generic Elementor divider | Used on inner pages | `--e-global-color-secondary` (declared but unused in render) | varies | varies |

### 5.5 Eyebrow — small uppercase label above a headline

| Variant | Element | Font family | Size | Weight | Letter-spacing | Colour |
|---|---|---|---|---|---|---|
| Red eyebrow | `OUR FOOD`, `Our New headquarters` | Domaine Sans Text Test (Medium) | 20 px | 500 | **2.0833333 px** | `#E71D3A` |
| Mauve eyebrow | `Our Events`, `.catfeat_txt h4` | Domaine Sans Text | 18 px | 400 | **1.8 px** | `#A18A8A` |
| Black eyebrow | Hero city labels `NEW YORK CITY` / `LONG ISLAND` / `HAMPTONS` | Domaine Sans Text | 18 px | 400 | normal | `#000000` |

### 5.6 Headline — large serif H2 with optional italic fragment

| Variant | Size | Line-height | Italic on | Sparkle decoration |
|---|---|---|---|---|
| Hero H3 | 60 px | 80 px | none | none |
| Standard H2 (About, Our Food, Secret Ingredient, HQ, Let's Party, Instagram) | 52 px | 70 px | trailing phrase via `<i>` | `.sprkl_title` adds sparkles.gif `::after` |
| Tight H2 (HQ "TwoFortyThirty") | 52 px | **62 px** (tighter) | none | none |
| Footer H2 ("It's party time") | 34 px | 44 px | none | none |
| Italic middle H2 ("A Very Social Life") | 52 px | 70 px | middle word via `<span>` + `.italic_heading` class | none |

### 5.7 Form — Gravity Forms with UAEL styler

The newsletter form (`#gform_1`) is a Gravity Forms form rendered via the UAEL Gravity Forms styler widget. It has 3 inputs (First, Last, Email) + a submit button. The styler applies the EA red `#E71D3A` to the submit button bg, white text, `padding:10px 40px`, 0 border-radius.

### 5.8 Social icons — coloured squares with brand glyphs

| Property | Value |
|---|---|
| Container | `--grid-template-columns: repeat(0, auto); --icon-size: 19px; --grid-column-gap: 20px; --grid-row-gap: 0px;` |
| Icon box | 38 × 38 px square (no border-radius — sharp corners) |
| Background | `var(--e-global-color-fad89c8)` = `#E71D3A` red |
| Icon glyph | White (`#FFFFFF` fill) |
| Hover | Background stays red, icon colour → `#000000` black |
| Networks | Facebook, Youtube, Instagram |

### 5.9 Location addresses — 3-column micro-text grid

Three address paragraphs arranged in a 3-column grid, each with:
- Street address (line 1)
- City, State (line 2)
- `Main:` + phone link `<a href="tel:...">`

Font: Domaine Sans Text 12 px / 400 / 16 px line-height / **1.6521127 px letter-spacing** (peculiar value, probably computed from a baseline of 1.4 * 1.18 ratio). Colour `#000000`.

### 5.10 Background-image-as-section-decor

The Secret Ingredient section uses `background-image: url(right-min.jpeg); background-position: top right; background-repeat: no-repeat; background-size: 45% auto;` — the image is anchored top-right and sized to 45 % of the section width, leaving the left 55 % for the white content card to overlay. This is a **non-overlay background** pattern: the image is decorative, not the primary content, and the content card sits on top of the blush section bg (not on top of the image directly).

---

## 6. Header / nav

### 6.1 Top notification bar (`.top_headr_notifaicatio`)

- **Visibility:** Hidden on desktop, tablet, AND phone in current production (`elementor-hidden-desktop elementor-hidden-tablet elementor-hidden-phone` classes). Likely toggled off via Elementor but the markup remains.
- **Background:** `#000000` black, transitions to `#E71D3A` red on hover (`0.3s linear`).
- **Text:** "NOW AVAILABLE: Catered Food Delivered!" — Domine 24 px / 400 / 32 px line-height / `#FFFFFF`.
- **Behaviour:** When sticky header activates (on inner pages, not home), `.sticky_header .top_headr_notifaicatio { display: none; }` hides it.

### 6.2 Header section (`.header-sec`, Elementor ID `6d5beb8`)

- **Position:** Fixed top via `.elementor-location-header { position: fixed; top: 0; left: 0; z-index: 999; width: 100%; }`. But the inner `.header-sec` Elementor section itself has `position: relative` per computed style — so the fixed positioning is on the **wrapper** (Elementor template part location-header), not on the section.
- **Background:** Transparent on home page hero; on scroll, JS adds `.sticky_header` to wrapper → `background: #fff; box-shadow: 0px 0px 5px rgba(0,0,0,0.5);` (linear `0.2s` transition).
- **Padding:** `10px 50px 10px 50px` (top/bottom 10 px, left/right 50 px).
- **Layout:** Full-width row, content-middle, 3 columns: logo (left) + nav (right). Boxed inside `elementor-container` 1140 px (or 1270 px on screens ≥ 1300 px).

### 6.3 Logo

- **Source:** `https://elegantaffairscaterers.com/wp-content/uploads/2021/03/EACateringLogo.svg` (6.8 KB, downloaded as `ea-logo.svg`).
- **Dimensions:** 538 × 162 native SVG; rendered at 262 × 80 px on desktop (CSS `width: 240%; height: 80px;` — the `width: 240%` is bizarre, likely a leftover from an old responsive attempt; the rendered width is forced to 262 px by the column max-width).
- **Mobile (≤1024 px):** Logo shrinks to 160 × 60 px via `.header_logo_col .header-logo img { width: 160px !important; height: 60px !important; }`.

### 6.4 Nav menu (`.elementor-nav-menu--main`, Elementor ID `832796f`)

- **Layout:** Horizontal, right-aligned (`.elementor-nav-menu__align-end`), burger-toggle on mobile (`.elementor-nav-menu--toggle elementor-nav-menu--burger`).
- **Font:** Roboto declared, **overridden at runtime to Domaine Sans Text** via `.domanie_reg *` parent class. 14 px / 400 / uppercase / 19 px line-height / **1.4 px letter-spacing** / `#000000`.
- **Top-level items:** 6 items in this order:
  1. **ABOUT** (has mega-menu — sub-menu with 6 items)
  2. **EVENTS** (has mega-menu — sub-menu with 5 items)
  3. **PRESS** (no sub)
  4. **BLOG** (no sub)
  5. **CAREERS** (no sub)
  6. **CONTACT US** (no sub)

### 6.5 Mega-menu structure (sub-menus)

When hovering ABOUT:
- Who We Are
- Our Partnerships
- Our Venues
- Our Services
- Our Food
- Reviews & Recognition

When hovering EVENTS:
- Weddings
- Corporate
- Private Parties
- Mitzvahs
- Disaster Relief

The sub-menus are **Elementor nav-menu dropdowns** (not full-bleed mega-menu panels — they're simple vertical lists). On desktop, the dropdown appears below the parent item on hover; on tablet/mobile, the burger menu opens a full-height right-aligned panel (`background-color: #fff; font-size: 13px; position: fixed; right: 0px; top: -10px; width: 100%; text-align: right; box-shadow: 0px 5px 5px rgb(0 0 0 / 20%); height: 100%; max-height: 95vh; overflow-x: auto; padding-top: 150px;`).

### 6.6 Special CTA menu item (`.catering_menu_btn`)

The CSS contains a rule for `li.catering_menu_btn a { background-color: #e71d3a; color: #fff !important; }` — a red pill-button menu item. **Not present in the current homepage nav**, but the CSS suggests it can be enabled (likely for a "Order Online" or "Get a Quote" CTA on certain pages). On hover, bg turns `#000` black.

### 6.7 Mobile nav (≤1024 px) — burger menu

- **Trigger:** `.elementor-menu-toggle` (burger icon, uses Font Awesome `eicons` font-family on the icon).
- **Dropdown panel:** Full-height right-aligned fixed panel (`position: fixed; right: 0; top: -10px; width: 100%; text-align: right;`), background `#fff`, font-size 13 px, `padding-top: 150px` (to clear the header), `box-shadow: 0px 5px 5px rgb(0 0 0 / 20%)`, `max-height: 95vh; overflow-x: auto;`.
- **Inner pages (non-home):** `padding-top: 100px` instead (slightly less, since the top promo bar is hidden on inner pages anyway).
- **Sub-menu behaviour:** In the mobile panel, sub-menus expand inline (Elementor `--toggle` mode).

### 6.8 Header sticky behaviour

The header is **fixed** via CSS, but its transparency depends on body class:
- `body.home` + not yet scrolled: header bg transparent (overlays hero).
- `body.home` + scrolled past hero: JS adds `.sticky_header` to body → header bg `#fff`, shadow `0px 0px 5px rgba(0,0,0,0.5)`.
- `body:not(.home)`: header is always sticky + white (the top promo bar is hidden via `body:not(.home) .top_headr_notifaicatio { display: none; }`).

The JS that adds `.sticky_header` is inline in Elementor's frontend.js (or a theme-specific jQuery snippet in `theme-style.css` script block) — likely `if ($(window).scrollTop() > 100) { $('body').addClass('sticky_header'); }`.

---

## 7. Footer

### 7.1 Footer section (`.elementor-location-footer`, Elementor ID `d96a640` from post-207)

- **Background:** `#FFFFFF` white.
- **Border:** 2 px solid `#F1ECEC` blush, top only (`border-width: 2px 0px 0px 0px;`).
- **Padding:** `80px 0px 80px 0px` — generous 80 px top + bottom.
- **Layout:** Full-width section, content-top. The footer template is built in Elementor as 2 sub-sections (Row A and Row B/C below).

### 7.2 Row A — Party-time headline + social

- **Headline (H2):** `It's party time` — Reckless TRIAL 34 px / 400 / 44 px line-height / 0.325 px letter-spacing / `#000000`, centred.
- **Divider:** 160 px wide, 2 px solid `#F00D4D` (pink-red, the ONLY use of this colour on the homepage), centred below the H2.
- **CTA (H4):** `CONTACT US` — link to `/elegantaffairs/contact-us/`, Domaine Sans Text 20 px / 400 / 28 px / **2.5 px letter-spacing** / UPPERCASE / `#000000`, centred.
- **Social icons row:** 3 icons (Facebook, Youtube, Instagram), 38 × 38 px each, 20 px gap, red bg `#E71D3A`, white glyph. Hover: glyph → black.

### 7.3 Row B — Addresses + newsletter

- **Layout:** 2-column 50/50 (or 3-column for the 3 addresses + 1 column for newsletter — need to recheck, but the screenshot shows 3 addresses horizontally + newsletter form below or beside).
- **Logo image:** `EACateringLogo.svg` (same as header), centred or left-aligned in column 1.
- **Address 1 (NYC):** `240 West 30th Street / New York, NY 10001 / Main: <a href="tel:2129910078">212-991-0078</a>` — Domaine Sans Text 12 px / 400 / 16 px line-height / 1.6521127 px letter-spacing / `#000000` / centred.
- **Address 2 (Glen Cove):** `110 Glen Cove Avenue / Glen Cove, New York / Main: 516-676-8500`.
- **Address 3 (Southampton):** `230 Elm Street / Southampton, New York / Main: 631-509-7310`.
- **Newsletter CTA (H4):** `SUBSCRIBE TO OUR NEWSLETTER` — same style as `CONTACT US` H4.
- **Newsletter form:** Gravity Forms `#gform_1`, 3 fields (First, Last, Email) + red submit button (`background-color: #E71D3A; color: #FFFFFF; padding: 10px 40px; border-radius: 0;`).

### 7.4 Footer legal / credits

Not present in current homepage footer (no copyright, no legal links). Likely exists on a separate template part that's conditionally loaded, or simply omitted.

### 7.5 Footer nav (`.elementor-location-footer .elementor-nav-menu`)

The CSS contains rules for `.elementor-location-footer .elementor-nav-menu--main .elementor-nav-menu ul { position: relative; width: auto; ... }` — suggesting the footer can have a nav menu, but in current homepage production the footer doesn't include one (only the 3 address paragraphs + social + newsletter). On the legal page or inner pages, the footer might include a sitemap-style nav.

---

## 8. Images / video

### 8.1 Hero video (autoplays in Section 2/3)

| Property | Value |
|---|---|
| URL | `https://elegantaffairscaterers.com/wp-content/uploads/2021/07/landscape-1.mp4` |
| Local file | [`/media/ea/ea-hero-video.mp4`](../public/media/ea/ea-hero-video.mp4) (533 KB) |
| Format | MP4 (H.264 likely, no audio) |
| Use | Background `<video>` in Section 3 hero (autoplay, loop, muted, playsinline) |
| Dimensions | Not specified in HTML; renders full-bleed in the 827 px-tall section, object-fit cover |

### 8.2 Hero background image (poster fallback for Section 2)

| Property | Value |
|---|---|
| URL | `https://elegantaffairscaterers.com/wp-content/uploads/2021/07/hero_img.jpeg` |
| Local file | [`/media/ea/ea-hero-bg.jpg`](../public/media/ea/ea-hero-bg.jpg) (80 KB) |
| Format | JPEG, 1465 × 502 (per Yoast schema `width:1465,height:502`) |
| Use | `background-image` on Section 2 (`ee6e82e`), position `center center`, `no-repeat`, `cover` |

### 8.3 Our Food carousel images (Section 5)

| Slide | URL | Local file | Size | Alt |
|---|---|---|---|---|
| 1 | `https://elegantaffairscaterers.com/wp-content/uploads/2021/07/E-21-min.jpeg` | [`/media/ea/ea-food-1.jpg`](../public/media/ea/ea-food-1.jpg) | 90 KB | "Catering Servics" (sic) |
| 2 | `https://elegantaffairscaterers.com/wp-content/uploads/2021/07/image4-min-1.jpeg` | [`/media/ea/ea-food-2.jpg`](../public/media/ea/ea-food-2.jpg) | 89 KB | "Catering Services NYC" |
| 3 | `https://elegantaffairscaterers.com/wp-content/uploads/2021/07/E-7-min-1.jpeg` | [`/media/ea/ea-food-3.jpg`](../public/media/ea/ea-food-3.jpg) | 96 KB | "fine dining plate" |

> Note: `E-21-min.jpeg` is **the same image** used as the Yoast primaryImageOfPage (referenced in the JSON-LD schema). It's EA's "hero" image for SEO purposes.

### 8.4 Secret Ingredient background image (Section 6)

| Property | Value |
|---|---|
| URL | `https://elegantaffairscaterers.com/wp-content/uploads/2021/07/right-min.jpeg` |
| Local file | [`/media/ea/ea-secret-ingredient-bg.jpg`](../public/media/ea/ea-secret-ingredient-bg.jpg) (78 KB) |
| Use | `background-image` on Section 6 (`e3c0556 .ing_bx_hm`), position `top right`, `no-repeat`, `45% auto` size (image takes up 45 % of section width, anchored top-right) |

### 8.5 Events cards (Section 10)

| Card | URL | Local file | Size | Native size | Link |
|---|---|---|---|---|---|
| Weddings | `https://elegantaffairscaterers.com/wp-content/uploads/2021/09/p1.jpg` | [`/media/ea/ea-events-1.jpg`](../public/media/ea/ea-events-1.jpg) | 255 KB | 438 × 638 | `/weddings/` |
| Corporate | `https://elegantaffairscaterers.com/wp-content/uploads/2021/09/p1-2.jpg` | [`/media/ea/ea-events-2.jpg`](../public/media/ea/ea-events-2.jpg) | 254 KB | 438 × 638 | `/corporate/` |
| Private Parties | `https://elegantaffairscaterers.com/wp-content/uploads/2021/09/p1-1.jpg` | [`/media/ea/ea-events-3.jpg`](../public/media/ea/ea-events-3.jpg) | 258 KB | 438 × 638 | `/private-parties/` |

All three are portrait-orientation (438 × 638 = 0.6875 aspect ratio). Each has a srcset with a 206 × 300 thumbnail variant for responsive loading.

### 8.6 Blog card images (Section 11)

| Card | URL | Local file | Size | Link |
|---|---|---|---|---|
| Mitzvah blog | `https://elegantaffairscaterers.com/wp-content/uploads/2023/12/mitzvahthumbnail1-516x335.jpg` | [`/media/ea/ea-hq-blog-mitzvah.jpg`](../public/media/ea/ea-hq-blog-mitzvah.jpg) | 36 KB | `/bar-bat-mitzvahs-with-elegant-affairs-...` |
| Penne a la Vodka blog | `https://elegantaffairscaterers.com/wp-content/uploads/2023/12/PennealaVodka_1512x.jpg-516x360.webp` | [`/media/ea/ea-hq-blog-penne.webp`](../public/media/ea/ea-hq-blog-penne.webp) | 31 KB | `/unwrap-the-joy-of-stress-free-holidays-...` |

### 8.7 Press card images (Section 11)

| Card | URL | Local file | Size | External link |
|---|---|---|---|---|
| Good Day New York | `https://elegantaffairscaterers.com/wp-content/uploads/2022/12/Screenshot-2022-12-23-at-1.26.47-PM-516x360.png` | [`/media/ea/ea-hq-blog-holiday.png`](../public/media/ea/ea-hq-blog-holiday.png) | 291 KB | `/andrea-correale-shares-holiday-hosting-ideas-on-good-day-new-york/` (internal) |
| Polo in the Hamptons | `https://elegantaffairscaterers.com/wp-content/uploads/2022/08/IMG_5343-e1660137715946-516x360.jpeg` | [`/media/ea/ea-hq-blog-cocktail.jpeg`](../public/media/ea/ea-hq-blog-cocktail.jpeg) | 57 KB | `https://theknockturnal.com/inside-saturdays-polo-in-the-hamptons-event/` (external, new tab) |
| Perfect Grill | `https://elegantaffairscaterers.com/wp-content/uploads/2022/07/IMG_6155-2-516x360.jpg` | [`/media/ea/ea-hq-blog-private.jpg`](../public/media/ea/ea-hq-blog-private.jpg) | 30 KB | `https://www.realtor.com/advice/...` (external, new tab) |

### 8.8 Press badge (used 3 × in Section 11)

| Property | Value |
|---|---|
| URL | `https://elegantaffairscaterers.com/wp-content/themes/elegant-affairs/images/badge-logo.png` |
| Local file | [`/media/ea/ea-badge.png`](../public/media/ea/ea-badge.png) (2.8 KB) |
| Dimensions | small monogram, max-height 37 px in `.pst_badge` container |
| Use | Black min-height-80 px banner overlay on top of each press card image, centred |

### 8.9 Logo (header + footer)

| Property | Value |
|---|---|
| URL | `https://elegantaffairscaterers.com/wp-content/uploads/2021/03/EACateringLogo.svg` |
| Local file | [`/media/ea/ea-logo.svg`](../public/media/ea/ea-logo.svg) (6.8 KB) |
| Native size | 538 × 162 |
| Rendered size | 262 × 80 (desktop), 160 × 60 (mobile) |

### 8.10 Favicon

| Property | Value |
|---|---|
| URL | `https://elegantaffairscaterers.com/wp-content/uploads/2021/04/favicon.png` |
| Local file | [`/media/ea/ea-favicon.png`](../public/media/ea/ea-favicon.png) (2.1 KB) |

### 8.11 YouTube embed (Section 8 — TwoFortyThirty)

| Property | Value |
|---|---|
| Video URL | `https://youtu.be/3vwHEn3AZjs` |
| Embed URL | `https://www.youtube.com/embed/3vwHEn3AZjs?controls=0&rel=0&playsinline=0&cc_load_policy=0&autoplay=0&enablejsapi=1&origin=https%3A%2F%2Felegantaffairscaterers.com` |
| Parameters | `controls=0` (no controls), `rel=0` (no related videos), `playsinline=0`, `cc_load_policy=0` (no captions), `autoplay=0` (no autoplay — user must click), `enablejsapi=1` (allows JS control) |
| Local download | Skipped (YouTube embeds can't be downloaded as MP4 via curl; for production, we'd use `yt-dlp` or replace with a self-hosted MP4 on Mux). |

### 8.12 Decorative GIFs (NOT downloaded — need theme asset folder access)

| File | URL pattern | Use | Size |
|---|---|---|---|
| `sparkles.gif` | `/wp-content/themes/elegant-affairs/images/sparkles.gif` | Floats to the right of `.sprkl_title` headings ("Cooking is love made visible.", "Let's Party") via `::after` pseudo-element, 120 × 100 px | unknown — likely ~30 KB |
| `champagne-2.gif` | `/wp-content/themes/elegant-affairs/images/champagne-2.gif` | Floats in bottom-left of `.ing_bx_hm` widget-wrap via `::after` pseudo-element, 150 × 160 px | unknown — likely ~50 KB |
| `arrow-right.png` | (referenced in theme-style.css line 2779 from a sandbox URL `https://www.kbcsandbox11.com/...`) | Likely an old arrow icon, not used in production | — |

> To download these GIFs, hit: `curl -sL -o /home/z/my-project/newsite/public/media/ea/ea-sparkles.gif https://elegantaffairscaterers.com/wp-content/themes/elegant-affairs/images/sparkles.gif` and `curl -sL -o /home/z/my-project/newsite/public/media/ea/ea-champagne.gif https://elegantaffairscaterers.com/wp-content/themes/elegant-affairs/images/champagne-2.gif`.

### 8.13 Instagram feed images (NOT downloaded — dynamic CDN URLs)

SmashBalloon Instagram Feed plugin pulls 6 most-recent posts from the `elegantaffairs1` Instagram account, served via `scontent-iad3-1.cdninstagram.com` and `scontent-iad3-2.cdninstagram.com` CDN URLs with signed `?_nc_cat=...&oh=...&oe=...` parameters that **expire in ~2 weeks**. We deliberately did not download these — they're transient. For the Interfood clone, we'll either:
- (a) Wire up our own Instagram Basic Display API feed (replace `elegantaffairs1` with our account handle), or
- (b) Use 6 curated local images from `/media/ea/ea-ig-1.jpg` through `ea-ig-6.jpg` as static placeholders (recommended for dev).

### 8.14 Self-hosted font files (referenced in `@font-face`, NOT downloaded — premium commercial fonts)

| Family | Weight | Files | Path |
|---|---|---|---|
| Reckless TRIAL | Regular | `RecklessTRIAL-Regular.{eot,woff2,woff,ttf,svg}` | `/wp-content/themes/elegant-affairs/fonts/` |
| Reckless TRIAL | Medium | `RecklessTRIAL-Medium.{eot,woff2,woff,ttt,svg}` | same |
| Reckless TRIAL | Regular Italic | `RecklessTRIAL-RegularItalic.{eot,woff2,woff,ttf,svg}` | same |
| Domaine Sans Text Test | Regular | `DomaineSansTextTest-Regular.{eot,woff2,woff,ttf,svg}` | same |
| Domaine Sans Text Test | Medium | `DomaineSansTextTest-Medium.{eot,woff2,woff,ttf,svg}` | same |
| Domaine Sans Text Test | Bold | `DomaineSansTextTest-Bold.{eot,woff2,woff,ttf,svg}` | same |

These are **commercial Klim Type Foundry / Commercial Type fonts** — licensing them for the Interfood clone requires purchasing the appropriate web license from klim.co.nz and commercialtype.com. For dev, use the Google Fonts alternatives (**Fraunces** + **Inter**).

### 8.15 Total media inventory

Total files downloaded into `/home/z/my-project/newsite/public/media/ea/`:

| Category | Count | Total size |
|---|---|---|
| Hero (image + video + screenshot) | 4 | 1.5 MB |
| Section screenshots (full-page + 9 sections) | 11 | 6.7 MB |
| Food carousel images | 3 | 275 KB |
| Events card images | 3 | 767 KB |
| Blog/Press card images | 5 | 445 KB |
| Brand assets (logo + badge + favicon) | 3 | 11 KB |
| Secret ingredient bg | 1 | 78 KB |
| **Total** | **30** | **~9.7 MB** |

(Exact count: 30 files, 11 MB on disk per `du -sh`.)

---

## 9. Animations

### 9.1 Page-level choreography

EA's animation system is **deliberately restrained and CSS-only** — no GSAP, no Motion One, no Lenis smooth-scroll. The entire animation vocabulary is:

1. **Elementor `fadeInUp` / `fadeInDown` / `fadeInLeft`** presets — applied to columns and widgets via the `animated-slow elementor-invisible` class combo. Elementor's frontend.js uses **IntersectionObserver** to detect viewport entry and swaps `elementor-invisible → elementor-animated` to trigger the CSS keyframe. `animated-slow` extends the duration from 600 ms to 1,500 ms.
2. **CSS transitions** on hover states — `transition: all 0.2s linear` (most hovers), `transition: all 0.3s linear` (top promo bar bg, social icons colour, section bg colour), `transition: all 4s linear` (the `.sep_list` wipe-reveal).
3. **Elementor Motion FX** (Pro feature) — applied to ONE element on the homepage: the Private Parties events card image (`9341327`, `motion_fx_motion_fx_scrolling=yes`). This adds scroll-driven transforms (subtle vertical parallax). Implemented via `e-motion-fx.min.css` + a small inline JS that binds to `scroll` event (no GSAP).
4. **Swiper carousel autoplay** — Our Food carousel autoplays every 5 s with a 500 ms slide transition.
5. **SmashBalloon lazy-load** — IG images load `placeholder.png` initially, then JS swaps in the actual CDN URLs after `DOMContentLoaded` (not really an animation, but a deferred-asset pattern).

### 9.2 Scroll choreography (top-to-bottom)

As the user scrolls from top to bottom:

| Scroll position | Animation fires |
|---|---|
| 0 px (page load) | Hero H3 `Parties are our passion.` `fadeInDown` (600 ms slow → 1.5 s) + `.sep_list.active` wipe reveal (4 s) |
| ~1,477 px (About enters viewport) | About column `fadeInUp` (1.5 s) — H1 + body + button rise into view together |
| ~1,941 px (Our Food enters) | Our Food column `fadeInUp` + Swiper carousel begins autoplay (5 s interval) |
| ~2,756 px (Secret Ingredient enters) | Secret Ingredient column `fadeInUp` + champagne-gif `::after` begins looping (GIF, not viewport-triggered) |
| ~3,578 px (HQ enters) | Both columns `fadeInUp` (staggered by ~100 ms by Elementor default) |
| ~4,033 px (Let's Party enters) | Column `fadeInUp` + sparkles.gif `::after` begins looping |
| ~4,301 px (Events cards enter) | All 3 columns `fadeInUp` (staggered). The Private Parties card image also starts scroll-parallax (Motion FX). |
| ~5,055 px (Blog + Press enter) | Column `fadeInUp`. The shortcode-rendered blog grid + press list items don't have additional animation (they appear with the column). |
| ~6,488 px (Instagram enters) | Column `fadeInUp`. SmashBalloon images lazy-load as they enter viewport. |
| ~7,098 px (Footer enters) | No animation — footer always rendered, no fade-in. |

### 9.3 Hover micro-interactions

| Element | Hover effect | Duration | Easing |
|---|---|---|---|
| Event / Blog / Journal / Press images | `transform: scale(1.1)` | 0.2 s | linear |
| Nav menu items | `color: var(--e-global-color-accent)` = `#61CE70` (green, BUT overridden — actual hover colour likely `#E71D3A` red via the `.domanie_reg` parent rules + Elementor `--e-global-color-fad89c8`) | 0.2 s | linear |
| CTA buttons (`.right_arr_btn .elementor-button`) | text colour `#A18A8A → #E71D3A`, arrow fill `#A18A8A → #E71D3A`, arrow `margin-left: 15px → 20px` (+5 px nudge) | 0.2 s | linear |
| Top promo bar (when visible) | background `#000000 → #E71D3A` | 0.3 s | linear |
| Social icons (footer) | bg stays red, icon colour `#FFFFFF → #000000` | 0.3 s | linear |
| Section backgrounds (on sticky header activation) | transparent → `#FFFFFF` + box-shadow `0 0 5px rgba(0,0,0,0.5)` | 0.2 s | linear |
| Blog card title | white → red (link colour on hover, but actually the title is wrapped in `<a>` so the hover colour is `#E71D3A`) | 0.2 s | linear |
| Press card title | `#000000 → #E71D3A` | 0.2 s | linear |

### 9.4 What's NOT animated (deliberate omissions)

- **No smooth-scroll / Lenis** — the page uses native browser scroll. The hero, sections, and footer all snap into view at native scroll speed.
- **No parallax on hero** — the hero video and JPEG are static (no `background-attachment: fixed`, no scroll-driven transform on the hero itself).
- **No count-up stats** — EA doesn't use any animated number counters. (No "30 years of catering", "10,000 events served" type stats.)
- **No pinned scroll sections** — no ScrollTrigger pinned panels, no Locomotive-style sticky sections.
- **No custom cursor** — uses the native cursor throughout.
- **No marquees** — no infinite-scroll text or image marquees.
- **No full-page panel transitions** — no Swup / Barba.js page transitions (only the Elementor `e-page-transition{background-color:#FFBC7D;}` loader, which is a peach-coloured overlay that fades in/out on internal navigation).
- **No WebGL / Three.js / canvas** — zero shader-based effects.

> **Design observation:** EA's restraint here is the point. The site feels *crafted* because every animation is small, slow (1.5 s for fadeInUp-slow), and consistent (`0.2s linear` everywhere). Adding GSAP / Lenis / WebGL would actually *detract* from the editorial-luxury feel.

### 9.5 Page transition loader

Elementor's built-in page-transition feature is enabled: when a user clicks an internal link, a peach `#FFBC7D` overlay covers the viewport for ~300 ms while the new page loads, then fades out. This is configured via `post-8.css` `.elementor-kit-8 e-page-transition{background-color:#FFBC7D;}`. **The peach is the ONLY place this colour appears on the entire site** — it's a deliberate "loading" signal, distinct from the brand palette, so users don't confuse it with content.

---

## 10. Mobile responsive behavior

### 10.1 Breakpoints observed

EA uses 5 breakpoints, all defined in `theme-style.css` and the Elementor responsive CSS:

| Breakpoint | What changes |
|---|---|
| `min-width: 1441 px` | Inner-page banner images forced to `height: 700px` |
| `min-width: 1300 px` | Boxed section container max-width bumps from 1140 px → 1270 px |
| `min-width: 1281 px` | Inner-page banner images forced to `height: 600px` |
| `max-width: 1280 px` | Header padding shrinks to `7px 15px`, nav item padding shrinks to `10px 12px`, blog filter sticky top moves to `113px`, location filter sticky top moves to `110px` |
| `max-width: 1100 px` | Nav font-size shrinks to 13 px, nav item padding to `10px 10px`, mobile burger menu activates (header section is replaced by a fixed-position full-height right-aligned dropdown panel `padding-top: 150px`) |
| `min-width: 1025 px` | Event inner-page banner images at 550 px height, custom carousel image max-height 600 px |
| `max-width: 1024 px` | `.catering_menu_btn` padding becomes `0 12px`, Elementor boxed container max-width → 1024 px, single-location images switch to column flex-direction |
| `min-width: 768 px` AND `max-width: 1024 px` | Header logo forced to 60 px height, blog filter category font 16 px |
| `max-width: 767 px` | Header logo forced to 160 × 60 px, `.sep_list` switches from horizontal to vertical layout (each city label on its own line, divider rotates to vertical 2 × 40 px), party_hm_sec images max-height 350 px |
| `max-width: 700 px` | `.sprkl_title ::after` sparkle repositions to `-130px right, -20px top`, journal items switch to single-column (text then image order reversed via `order: 2` and `order: 1`), `.jl_item_left h2 a` font shrinks to 30 px / 30 px line-height, `.press_list .cus_post_item` becomes full-width 100 %, footer nav menu items become full-width |

### 10.2 Mobile-only elements

- **Top notification bar** — has `elementor-hidden-desktop elementor-hidden-tablet elementor-hidden-phone` classes — currently hidden on ALL viewports (effectively disabled in production). If re-enabled, would only show on mobile (intended for promo).
- **`.elementor-menu-toggle`** — burger icon, hidden on desktop (`.elementor-hidden-phone`), visible on tablet/mobile.
- **Spacer widget `660ce2b`** in Our Food section — `elementor-hidden-phone` (only renders on desktop/tablet, not mobile).
- **Mobile nav dropdown panel** — fixed-position right-aligned full-height panel with `padding-top: 150px` (to clear the header), `box-shadow: 0px 5px 5px rgb(0 0 0 / 20%)`, `max-height: 95vh; overflow-x: auto;`. Activated by burger tap.

### 10.3 Mobile layout changes (key sections)

| Section | Desktop | Mobile (≤767 px) |
|---|---|---|
| Hero (Section 2) | 650 px tall, JPEG cover bg, H3 60 px | 283 px tall, JPEG `top center` bg at `558px auto` size, H3 30 px / 40 px line-height, padding `0 15px` |
| Hero city labels (Section 3) | Horizontal: `NYC — LI — HAMPTONS` with 115 px wide horizontal dividers | Vertical stack: each label on its own line, centred, with 2 × 40 px vertical dividers between them (divider rotated 90°) |
| About (Section 4) | H1 52 px / 70 px line-height | H1 36 px / 40 px line-height (per `post-10.css` mobile override) |
| Our Food (Section 5) | H2 52 px / 70 px line-height | H2 36 px / 40 px line-height |
| Secret Ingredient (Section 6) | H2 52 px / 70 px | H2 36 px / 40 px |
| HQ (Section 8) | H2 52 px / 62 px | H2 36 px / 40 px |
| Let's Party (Section 9) | H2 52 px / 70 px | H2 36 px / 40 px |
| Events cards (Section 10) | 3-column 33 % each, image full-height 638 px | Likely single column (per `.party_hm_sec .elementor-image { max-height: 350px; overflow: hidden; }` — image height capped at 350 px) |
| Blog + Press (Section 11) | Blog grid 2-col visible + Press list 3-col (`.press_list .cus_post_item { width: 33.3%; padding: 0 15px; }`) | Single column 100 %, `.press_list .cus_post_item { width: 100%; margin-bottom: 30px; }` |
| Instagram (Section 12) | 6 columns | 1 column (`.sbi_mob_col_1`) |
| Footer (Section 14) | 3 addresses + newsletter in 2-col layout | Single column (addresses stack, newsletter form below) |

### 10.4 Touch behaviour

- Hero video: `playsinline` + `muted` means iOS Safari will autoplay it on touch devices.
- Carousels: Swiper supports touch swipe (default config).
- No hover-only interactions break the mobile experience (all hovers have touch fallbacks via `:focus`).

---

## 11. Token recommendations

### 11.1 Recommended `globals.css` colour tokens for the `ea-*` editorial layer

```css
:root {
  /* ===== EA palette ===== */
  --ea-red:            #E71D3A;    /* signature accent: eyebrows, arrows, hovers, social bg, form submit */
  --ea-red-pink:       #F00D4D;    /* footer divider (only) */
  --ea-mauve:          #A18A8A;    /* dividers, body-link button text, carousel dots, meta text */
  --ea-blush:          #F1ECEC;    /* premium-section bg (Secret Ingredient, Blog+Press) */
  --ea-blush-deep:     #DECBCB;    /* journal category badge bg (rare use) */
  --ea-cream:          #F7F5F5;    /* image-shadow tint (rare use) */
  --ea-black:          #000000;    /* body text, hero overlay, event card overlay panel */
  --ea-white:          #FFFFFF;    /* section bg, hero text on dark, form text */
  --ea-peach:          #FFBC7D;    /* page-transition loader only */

  /* ===== EA typography ===== */
  --ea-font-display:    "Fraunces", "Reckless TRIAL", Georgia, serif;            /* H1, H2, H3, body <p> */
  --ea-font-display-it: "Fraunces Italic", "Reckless TRIAL Italic", Georgia, serif;
  --ea-font-sans:        "Inter", "Domaine Sans Text", system-ui, sans-serif;   /* eyebrow, button, nav, micro */
  --ea-font-sans-med:    "Inter", "Domaine Sans Text Test", system-ui, sans-serif;  /* medium-weight eyebrow (H5 OUR FOOD) */

  /* ===== EA type scale ===== */
  --ea-text-hero:     60px;   --ea-leading-hero:     80px;   /* hero H3 */
  --ea-text-h1:       52px;   --ea-leading-h1:       70px;   /* section H1/H2 */
  --ea-text-h1-tight: 52px;  --ea-leading-h1-tight: 62px;   /* HQ H2 "TwoFortyThirty" */
  --ea-text-h2-footer: 34px; --ea-leading-h2-footer: 44px;   /* footer H2 */
  --ea-text-eyebrow:  20px;  --ea-leading-eyebrow:  27px;   /* H5 eyebrow */
  --ea-text-loc-label: 18px; --ea-leading-loc-label: 24px;  /* hero city labels */
  --ea-text-btn:      18px;  --ea-leading-btn:      28px;   /* button text */
  --ea-text-body:     20px;  --ea-leading-body:     30px;   /* body <p> */
  --ea-text-card-title: 24px; --ea-leading-card-title: 34px;/* blog card title */
  --ea-text-press-title: 22px; --ea-leading-press-title: 26px; /* press card title */
  --ea-text-event-h4: 20px; --ea-leading-event-h4: 30px;   /* event card H4 */
  --ea-text-meta:     14px;  --ea-leading-meta:     30px;   /* blog meta */
  --ea-text-footer-h4: 20px; --ea-leading-footer-h4: 28px;  /* footer H4 */
  --ea-text-address:  12px;  --ea-leading-address: 16px;    /* footer address */

  /* ===== EA letter-spacing ===== */
  --ea-ls-eyebrow-red:    2.0833333px;  /* red eyebrow H5 */
  --ea-ls-eyebrow-mauve:  1.8px;        /* mauve eyebrow H2 "Our Events" + button text */
  --ea-ls-event-h4:       2px;          /* event card H4 */
  --ea-ls-footer-h4:      2.5px;        /* footer H4 */
  --ea-ls-meta:           1.4px;        /* blog meta */
  --ea-ls-nav:            1.4px;        /* nav menu items */
  --ea-ls-address:        1.6521127px;  /* footer address (the precise EA value) */
  --ea-ls-h2-footer:      0.325px;      /* footer H2 slight tightening */

  /* ===== EA spacing ===== */
  --ea-section-pad-y:  80px;       /* vertical padding inside sections (default) */
  --ea-section-pad-x:   50px;       /* horizontal padding for full-bleed sections */
  --ea-container:       1140px;     /* boxed section max-width (desktop) */
  --ea-container-lg:    1270px;     /* boxed section max-width on screens ≥ 1300px */
  --ea-divider-w:       196px;      /* hero city divider length */
  --ea-divider-w-footer: 160px;     /* footer divider length */
  --ea-arrow-size:      25px;       /* CTA arrow icon size */
  --ea-social-size:     38px;       /* social icon box size */
}
```

### 11.2 Recommended fonts to install

For the `ea-*` editorial layer, install these Google Fonts (free, open-source):

1. **Fraunces** (variable, optical-size axis) — replacement for `Reckless TRIAL`.
   - Weights: 400 (Regular), 400 Italic, 500 (Medium), 700 (Bold)
   - Optical size axis: 9–144 (use opsz 144 for hero, opsz 36 for body)
   - SOFT axis: 0–100 (use 0 for sharp ink-trap look matching Reckless)
   - WONK axis: 0–1 (set to 1 for the playful alternate forms like Reckless's bouncy italic)
   - Loading: `<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,700;1,9..144,400&display=swap" rel="stylesheet">`
   - **Why Fraunces:** It's the closest free high-contrast serif with a personality-rich italic to Reckless. Both are modern "Scotch Roman" revivals with optical sizing. Fraunces is by Phaedra Charles + Eli Heuer, OFL-licensed.

2. **Inter** (variable) — replacement for `Domaine Sans Text`.
   - Weights: 400 (Regular), 500 (Medium), 700 (Bold)
   - Loading: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">`
   - **Why Inter:** Domaine Sans Text is a neutral grotesque with a slight humanist warmth. Inter is the closest open-source neutral grotesque. The letter-spacing values EA uses (1.8 px, 2.5 px) will translate perfectly to Inter at the same sizes.

3. **(Optional) Domine** — only if we want to faithfully replicate the top promo bar text styling. But since the promo bar is hidden in production, skip it.

### 11.3 Optional premium fonts (if licensing budget allows)

For pixel-perfect fidelity to the EA original:
- **Reckless** (Commercial Type) — 1 web weight ≈ $50/year web license per weight. Need 3 weights (Regular, Italic, Medium) ≈ $150/year.
- **Domaine Sans Text** (Klim Type Foundry, NZ) — Web license ~NZD $250/year per weight. Need 2 weights (Regular, Medium) ≈ NZD $500/year.

For Cycle 28 dev, use Fraunces + Inter. If the Interfood client wants the pixel-perfect EA look in production, license Reckless + Domaine Sans Text.

---

## Appendix A — Raw CSS snippets

### A.1 The `@font-face` declarations (from `theme-style.css` lines 14–92)

```css
@font-face {
    font-family: 'Reckless TRIAL';
    src: url('fonts/RecklessTRIAL-Regular.eot');
    src: url('fonts/RecklessTRIAL-Regular.eot?#iefix') format('embedded-opentype'),
        url('fonts/RecklessTRIAL-Regular.woff2') format('woff2'),
        url('fonts/RecklessTRIAL-Regular.woff') format('woff'),
        url('fonts/RecklessTRIAL-Regular.ttf') format('truetype'),
        url('fonts/RecklessTRIAL-Regular.svg#RecklessTRIAL-Regular') format('svg');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}
@font-face {
    font-family: 'Reckless TRIAL';
    src: url('fonts/RecklessTRIAL-Medium.eot');
    /* ... same src pattern ... */
    font-weight: 500;
    font-style: normal;
    font-display: swap;
}
@font-face {
    font-family: 'Reckless TRIAL';
    src: url('fonts/RecklessTRIAL-RegularItalic.eot');
    /* ... same src pattern ... */
    font-weight: normal;
    font-style: italic;
    font-display: swap;
}
@font-face {
    font-family: 'Domaine Sans Text Test';
    src: url('fonts/DomaineSansTextTest-Medium.eot');
    /* ... same src pattern ... */
    font-weight: 500;
    font-style: normal;
    font-display: swap;
}
@font-face {
    font-family: 'Domaine Sans Text Test';
    src: url('fonts/DomaineSansTextTest-Bold.eot');
    /* ... same src pattern ... */
    font-weight: bold;
    font-style: normal;
    font-display: swap;
}
@font-face {
    font-family: 'Domaine Sans Text Test';
    src: url('fonts/DomaineSansTextTest-Regular.eot');
    /* ... same src pattern ... */
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}
```

### A.2 The helper-class font-switching rules (`theme-style.css` lines 98–129)

```css
.reck_reg *            { font-family: 'Reckless TRIAL'!important; font-weight: normal!important; }
.reck_regitalic *      { font-family: 'Reckless TRIAL'!important; font-weight: normal!important; font-style: italic; }
.reck_med  *           { font-family: 'Reckless TRIAL'!important; font-weight: 500!important; }
.domanie_reg *         { font-family: 'Domaine Sans Text'!important; font-weight: normal!important; }
.domanie_med *,
.domanie_test_med *    { font-family: 'Domaine Sans Text Test'!important; font-weight: 500!important; }
.domanie_bld *         { font-family: 'Domaine Sans Text'!important; font-weight: bold!important; }
.italic_heading h2 span { font-family: 'Reckless TRIAL'!important; font-weight: normal!important; font-style: italic; }
```

### A.3 The sticky header rule (`theme-style.css` lines 130–157)

```css
.elementor-location-header {
    position: fixed;
    top: 0px;
    left: 0px;
    z-index: 999;
    width: 100%;
    transition: all .2s linear;
    -webkit-transition: all .2s linear;
    -moz-transition: all .2s linear;
}

.sticky_header.elementor-location-header {
    background: #fff;
    box-shadow: 0px 0px 5px rgba(0,0,0,0.5);
    transition: all .2s linear;
}
.sticky_header .top_headr_notifaicatio, body:not(.home) .top_headr_notifaicatio {
    display: none;
}
.sticky_header .elementor-section .elementor-container {
    align-items: center;
}
```

### A.4 The CTA menu button (red pill) (`theme-style.css` lines 158–166)

```css
.elementor-nav-menu li.catering_menu_btn a {
    background-color: #e71d3a;
    color: #fff !important;
    transition: all 0.2s linear;
}
.elementor-nav-menu li.catering_menu_btn a:hover {
    background-color: #000;
    color: #fff !important;
}
```

### A.5 The `.sep_list` wipe-reveal animation (`theme-style.css` lines 167–215)

```css
.sep_list {
    display: flex;
    flex-wrap: wrap;
    margin: 0px;
    list-style: none;
    padding: 0px;
    align-items: center;
    justify-content: center;
    position: relative;
}
.sep_list::before {
    content: '';
    position: absolute;
    right: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background: #fff;
    z-index: 100;
    transition: all 4s linear;
}
.sep_list.active::before {
    width: 0px;
}
.sep_list li {
    display: inline-block;
    font-size: 18px;
    line-height: 24px;
    font-weight: 400;
    text-transform: uppercase;
}
.sep_list li:not(:last-child)::after {
    content: '';
    position: relative;
    display: inline-block;
    width: 115px;
    max-width: 115px;
    height: 2px;
    background: #a18a8a;
    vertical-align: middle;
    margin: 0px 20px;
}

@media (max-width: 767px) {
    body .sep_list li {
        display: block;
        clear: both;
        width: 100%;
        text-align: center;
    }
    body .sep_list li:not(:last-child)::after {
        position: relative;
        display: block;
        width: 2px;
        max-width: 2px;
        height: 40px;
        margin: 10px auto;
    }
}
```

### A.6 The `.right_arr_btn` CTA arrow button (`theme-style.css` lines 217–230 + `post-10.css`)

```css
.right_arr_btn .elementor-button-icon svg {
    width: 25px;
    display: inline-block;
    vertical-align: middle;
    transform: rotate(180deg);  /* SVG path points left by default; rotate to point right */
    fill: #e71d3a;
    margin-left: 15px;
    position: relative;
    top: -3px;
}

/* From post-10.css, repeated for every CTA button: */
.elementor-10 .elementor-element.elementor-element-bc8965c .elementor-button {
    background-color: #61CE7000;  /* transparent (alpha 00 hack) */
    font-family: "Roboto", Sans-serif;  /* overridden by .domanie_reg * to Domaine Sans Text */
    font-size: 18px;
    font-weight: 400;
    text-transform: uppercase;
    line-height: 28px;
    letter-spacing: 1.8px;
    fill: #A18A8A;
    color: #A18A8A;
    border-radius: 0px 0px 0px 0px;
}
.elementor-10 .elementor-element.elementor-element-bc8965c .elementor-button:hover,
.elementor-10 .elementor-element.elementor-element-bc8965c .elementor-button:focus {
    color: #E71D3A;
}
.elementor-10 .elementor-element.elementor-element-bc8965c .elementor-button:hover svg,
.elementor-10 .elementor-element.elementor-element-bc8965c .elementor-button:focus svg {
    fill: #E71D3A;
}
```

### A.7 The carousel pagination dots (`theme-style.css` lines 231–251)

```css
.our_food_slidr .swiper-pagination-bullet,
.evet_single_pg .swiper-pagination-bullet,
.food_pg_gallry .swiper-pagination-bullet,
.custom_carousel_el.owl-carousel button.owl-dot {
    width: 10px;
    height: 10px;
    display: inline-block;
    -webkit-border-radius: 50%;
    border-radius: 50%;
    background: none;
    opacity: 1;
    border: 1px solid #a18a8a;
}
.our_food_slidr .swiper-pagination-bullet.swiper-pagination-bullet-active,
.evet_single_pg .swiper-pagination-bullet.swiper-pagination-bullet-active,
.food_pg_gallry .swiper-pagination-bullet.swiper-pagination-bullet-active,
.custom_carousel_el.owl-carousel button.owl-dot.active {
    background: #a18a8a;
}
```

### A.8 The `.ing_bx_hm` (Secret Ingredient) champagne-gif decoration (`theme-style.css` lines 258–292)

```css
.ing_bx_hm .elementor-column > .elementor-widget-wrap {
    max-width: 900px;
    position: relative;
}
.ing_bx_hm .elementor-column > .elementor-widget-wrap::after {
    content: '';
    position: absolute;
    bottom: -50px;
    left: 50px;
    background: url(images/champagne-2.gif) no-repeat;
    width: 150px;
    height: 160px;
    background-position: left center;
    background-size: 100% auto;
}
.sprkl_title .elementor-heading-title {
    display: inline-block;
    position: relative;
}
.sprkl_title .elementor-heading-title::after {
    content: '';
    position: absolute;
    top: -10px;
    display: inline-block;
    background: url(images/sparkles.gif) no-repeat;
    background-size: 120px auto;
    vertical-align: middle;
    right: -200px;
    width: 100%;
    height: 100px;
    background-position: right center;
}
```

### A.9 The image-zoom hover rule (`theme-style.css` lines 492–497)

```css
.cus_post_item .pst_img a img:hover,
.feat_artimg img:hover,
.party_hm_sec img:hover,
.jl_item_img a img:hover {
    transform: scale(1.1);
}
```

### A.10 The press card structure (`theme-style.css` lines 459–577)

```css
.press_list {
    display: flex;
    flex-wrap: wrap;
}
.cus_post_item {
    display: inline-block;
    width: 33.3%;
    padding: 0px 15px;
    box-sizing: border-box;
}
.cus_post_item .pst_img {
    display: block;
    clear: both;
    width: 100%;
    position: relative;
    z-index: 80;
    max-height: 356px;
    overflow: hidden;
}
.cus_post_item .pst_img a,
.cus_post_item .pst_img a img {
    display: block;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    transition: all 0.2s linear;
}
.cus_post_item .pst_img .pst_badge {
    display: flex;
    width: 100%;
    position: relative;
    top: 0px;
    left: 0px;
    background: #000;
    min-height: 80px;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
}
.cus_post_item .pst_badge img {
    display: block;
    width: auto;
    max-height: 37px;
    max-width: unset;
}
.cus_post_item .cus_pst_cont {
    display: block;
    clear: both;
    width: 100%;
    max-width: 90%;
    margin: -50px auto 0px;   /* overlaps the image by 50px */
    z-index: 100;
    background: #fff;
    position: relative;
    padding: 20px;
    box-sizing: border-box;
    text-align: center;
}
.cus_post_item .cus_pst_cont h2 {
    display: block;
    clear: both;
    width: 100%;
    margin: 0px 0px 10px;
    font-size: 22px;
    font-weight: normal;
    line-height: 26px;
}
.cus_post_item .cus_pst_cont h2 a {
    display: inline-block;
    outline: none;
    color: #000;
    font-family: 'Reckless TRIAL'!important;
    font-weight: normal!important;
}
.cus_pst_cont h2 a:hover {
    color: #E71D3A;
}
.cus_post_item .cus_pst_cont .read_m svg {
    transform: rotate(180deg);
    width: 25px;
    display: inline-block;
    fill: #a18a8a;
    transition: all 0.2s linear;
}
.cus_post_item .cus_pst_cont .read_m svg:hover {
    fill: #e71d3a;
}
```

### A.11 The journal item layout (`theme-style.css` lines 297–423) — used on inner pages

```css
.journal_items {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    overflow: hidden;
}
.jl_item_left {
    display: inline-flex;
    width: 55%;
    background: #fff;
    flex-wrap: wrap;
    padding-top: 40px;
    padding-bottom: 40px;
    align-content: center;
}
.jl_item_img {
    display: inline-block;
    width: 45%;
}
.jl_item_left .jl_cat {
    display: inline-block;
    background: #decbcb;
    color: #000;
    font-size: 12px;
    line-height: 30px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    padding: 6px 20px 2px;
    box-sizing: border-box;
    font-family: 'Domaine Sans Text Test'!important;
    font-weight: normal!important;
}
.jl_item_left h2 {
    display: block;
    clear: both;
    width: 100%;
    padding: 0px 40px;
    box-sizing: border-box;
    margin: 20px 0px 0px;
    min-height: 180px;
}
.jl_item_left h2 a {
    font-size: 48px;
    font-weight: 400;
    line-height: 64px;
    color: #000;
    font-family: 'Reckless TRIAL'!important;
    font-weight: normal!important;
}
.jl_meta_info .jl_date,
.jl_meta_info .jl_authr {
    display: block;
    text-transform: uppercase;
    font-size: 14px;
    font-weight: 400;
    line-height: 30px;
    letter-spacing: 1.4px;
    color: #a18a8a;
    font-family: 'Domaine Sans Text Test'!important;
    font-weight: normal!important;
}
```

### A.12 The Elementor kit-8 token block (`post-8.css`)

```css
.elementor-kit-8 {
  --e-global-color-primary:    #6EC1E4;
  --e-global-color-secondary: #54595F;
  --e-global-color-text:      #7A7A7A;
  --e-global-color-accent:    #61CE70;
  --e-global-color-fad89c8:   #E71D3A;
  --e-global-color-11c8d23:   #F8F8F8CF;
  --e-global-typography-primary-font-family:   "Roboto";      weight 600;
  --e-global-typography-secondary-font-family: "Roboto Slab"; weight 400;
  --e-global-typography-text-font-family:      "Roboto";      weight 400;
  --e-global-typography-accent-font-family:    "Roboto";      weight 500;
}
.elementor-kit-8 e-page-transition {
  background-color: #FFBC7D;
}
.elementor-section.elementor-section-boxed > .elementor-container {
  max-width: 1140px;
}
.e-con {
  --container-max-width: 1140px;
}
@media (max-width: 1024px) {
  .elementor-section.elementor-section-boxed > .elementor-container { max-width: 1024px; }
  .e-con { --container-max-width: 1024px; }
}
@media (max-width: 767px) {
  .elementor-section.elementor-section-boxed > .elementor-container { max-width: 767px; }
  .e-con { --container-max-width: 767px; }
}
```

### A.13 The Elementor kit responsive overrides (`post-10.css` for `ee6e82e` hero)

```css
/* Hero section desktop */
.elementor-10 .elementor-element.elementor-element-ee6e82e > .elementor-container {
  min-height: 650px;
}
.elementor-10 .elementor-element.elementor-element-ee6e82e:not(.elementor-motion-effects-element-type-background),
.elementor-10 .elementor-element.elementor-element-ee6e82e > .elementor-motion-effects-container > .elementor-motion-effects-layer {
  background-image: url("https://elegantaffairscaterers.com/wp-content/uploads/2021/07/hero_img.jpeg");
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
}

/* Hero section tablet (≤1024px) */
@media (max-width: 1024px) {
  .elementor-10 .elementor-element.elementor-element-ee6e82e > .elementor-container { min-height: 461px; }
  .elementor-10 .elementor-element.elementor-element-ee6e82e:not(.elementor-motion-effects-element-type-background),
  .elementor-10 .elementor-element.elementor-element-ee6e82e > .elementor-motion-effects-container > .elementor-motion-effects-layer {
    background-size: 1000px auto;
  }
  .elementor-10 .elementor-element.elementor-element-ee6e82e { padding: 0px 15px 0px 15px; }
}

/* Hero section mobile (≤767px) */
@media (max-width: 767px) {
  .elementor-10 .elementor-element.elementor-element-ee6e82e > .elementor-container { min-height: 283px; }
  .elementor-10 .elementor-element.elementor-element-ee6e82e:not(.elementor-motion-effects-element-type-background),
  .elementor-10 .elementor-element.elementor-element-ee6e82e > .elementor-motion-effects-container > .elementor-motion-effects-layer {
    background-position: top center;
    background-size: 558px auto;
  }
  .elementor-10 .elementor-element.elementor-element-ee6e82e { padding: 0px 15px 0px 15px; }
  .elementor-10 .elementor-element.elementor-element-d0ec9f1 .elementor-heading-title {  /* hero H3 */
    font-size: 30px;
    line-height: 40px;
  }
  .elementor-10 .elementor-element.elementor-element-90ac05a .elementor-heading-title {  /* our food H2 */
    font-size: 36px;
    line-height: 40px;
  }
  .elementor-10 .elementor-element.elementor-element-6103b42 .elementor-heading-title {  /* secret ingredient H2 */
    font-size: 36px;
    line-height: 40px;
  }
  .elementor-10 .elementor-element.elementor-element-45c8923 .elementor-heading-title {  /* press H2 */
    font-size: 36px;
    line-height: 40px;
  }
}
```

### A.14 The footer CSS (`post-207.css`)

```css
.elementor-207 .elementor-element.elementor-element-d96a640 {
  border-style: solid;
  border-width: 2px 0px 0px 0px;
  border-color: #F1ECEC;
  transition: background 0.3s, border 0.3s, border-radius 0.3s, box-shadow 0.3s;
  padding: 80px 0px 80px 0px;
}
.elementor-207 .elementor-element.elementor-element-d96a640:not(.elementor-motion-effects-element-type-background),
.elementor-207 .elementor-element.elementor-element-d96a640 > .elementor-motion-effects-container > .elementor-motion-effects-layer {
  background-color: #FFFFFF;
}
.elementor-207 .elementor-element.elementor-element-12b5813 .elementor-heading-title {  /* "It's party time" */
  font-family: "Roboto", Sans-serif;
  font-size: 34px;
  font-weight: 400;
  text-transform: none;
  line-height: 44px;
  letter-spacing: 0.325px;
  color: #000000;
}
.elementor-207 .elementor-element.elementor-element-142f0f9 .elementor-heading-title {  /* "CONTACT US" */
  font-family: "Roboto", Sans-serif;
  font-size: 20px;
  font-weight: 400;
  text-transform: uppercase;
  line-height: 28px;
  letter-spacing: 2.5px;
  color: #000000;
}
.elementor-207 .elementor-element.elementor-element-674d996 {  /* footer divider */
  --divider-border-style: solid;
  --divider-color: #F00D4D;
  --divider-border-width: 2px;
}
.elementor-207 .elementor-element.elementor-element-674d996 .elementor-divider-separator {
  width: 160px;
}
.elementor-207 .elementor-element.elementor-element-b830d9c {  /* social icons */
  --grid-template-columns: repeat(0, auto);
  --icon-size: 19px;
  --grid-column-gap: 20px;
  --grid-row-gap: 0px;
}
.elementor-207 .elementor-element.elementor-element-b830d9c .elementor-social-icon {
  background-color: var( --e-global-color-fad89c8 );   /* #E71D3A */
}
.elementor-207 .elementor-element.elementor-element-b830d9c .elementor-social-icon i { color: #FFFFFF; }
.elementor-207 .elementor-element.elementor-element-b830d9c .elementor-social-icon svg { fill: #FFFFFF; }
.elementor-207 .elementor-element.elementor-element-b830d9c .elementor-social-icon:hover { background-color: var( --e-global-color-fad89c8 ); }
.elementor-207 .elementor-element.elementor-element-b830d9c .elementor-social-icon:hover i { color: #000000; }
.elementor-207 .elementor-element.elementor-element-b830d9c .elementor-social-icon:hover svg { fill: #000000; }
.elementor-207 .elementor-element.elementor-element-785f8a7,
.elementor-207 .elementor-element.elementor-element-7ac5223,
.elementor-207 .elementor-element.elementor-element-8f92b41 {  /* 3 address paragraphs */
  font-family: "Roboto", Sans-serif;
  font-size: 12px;
  font-weight: 400;
  text-transform: none;
  line-height: 16px;
  letter-spacing: 1.6521127px;
  color: #000000;
}
.elementor-207 .elementor-element.elementor-element-84692de .elementor-heading-title {  /* "SUBSCRIBE TO OUR NEWSLETTER" */
  font-family: "Roboto", Sans-serif;
  font-size: 20px;
  font-weight: 400;
  text-transform: uppercase;
  line-height: 28px;
  letter-spacing: 2.5px;
  color: #000000;
}
```

### A.15 The header CSS (`post-38.css`)

```css
.elementor-38 .elementor-element.elementor-element-81ee4fc:not(.elementor-motion-effects-element-type-background),
.elementor-38 .elementor-element.elementor-element-81ee4fc > .elementor-motion-effects-container > .elementor-motion-effects-layer {
  background-color: #000000;
}
.elementor-38 .elementor-element.elementor-element-81ee4fc:hover {
  background-color: #E71D3A;
}
.elementor-38 .elementor-element.elementor-element-81ee4fc {
  transition: background 0.3s, border 0.3s, border-radius 0.3s, box-shadow 0.3s;
}
.elementor-38 .elementor-element.elementor-element-7b22e1b {  /* promo bar text */
  text-align: center;
  font-family: "Domine", Sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 32px;
  color: #FFFFFF;
}
.elementor-38 .elementor-element.elementor-element-6d5beb8 > .elementor-container > .elementor-column > .elementor-widget-wrap {
  align-content: center;
  align-items: center;
}
.elementor-38 .elementor-element.elementor-element-6d5beb8 {  /* header section */
  padding: 10px 50px 10px 50px;
}
.elementor-38 .elementor-element.elementor-element-4069454 img {  /* logo */
  width: 240%;
  height: 80px;
}
.elementor-38 .elementor-element.elementor-element-832796f .elementor-menu-toggle {
  margin-left: auto;
  background-color: #02010100;
}
.elementor-38 .elementor-element.elementor-element-832796f .elementor-nav-menu .elementor-item {
  font-family: "Roboto", Sans-serif;
  font-size: 14px;
  font-weight: normal;
  text-transform: uppercase;
  line-height: 19px;
  letter-spacing: 1.4px;
}
.elementor-38 .elementor-element.elementor-element-832796f .elementor-nav-menu--main .elementor-item {
  color: #000000;
  fill: #000000;
}
```

### A.16 The mobile nav dropdown panel (`theme-style.css` lines 706–738)

```css
@media (max-width: 1100px) {
  .header-sec ul li a {
    padding: 10px 10px !important;
    font-size: 13px !important;
  }
  body .elementor-menu-toggle i {
    font-family: eicons!important;
  }
  .elementor-location-header .elementor-widget-container > .elementor-nav-menu--dropdown {
    background-color: #fff;
    font-size: 13px;
    position: fixed;
    right: 0px;
    top: -10px;
    width: 100%;
    text-align: right;
    box-shadow: 0px 5px 5px rgb(0 0 0 / 20%);
    height: 100%;
    max-height: 95vh!important;
    overflow-x: auto!important;
    padding-top: 150px;
    z-index: -1;
  }
  body:not(.home) .elementor-location-header .elementor-widget-container > .elementor-nav-menu--dropdown {
    padding-top: 100px;
  }
  body .elementor-menu-toggle {
    outline: none;
  }
}
```

---

## Appendix B — DOM tree of major sections

### B.1 Hero (Section 2 + Section 3 combined DOM)

```html
<section class="elementor-section elementor-top-section elementor-element elementor-element-ee6e82e elementor-section-height-min-height elementor-section-boxed elementor-section-height-default elementor-section-items-middle" data-id="ee6e82e" data-element_type="section" data-settings='{"background_background":"classic"}'>
  <div class="elementor-container elementor-column-gap-default">
    <div class="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-?" data-id="?" data-element_type="column">
      <div class="elementor-widget-wrap elementor-element-populated">
        <div class="elementor-element elementor-element-d0ec9f1 reck_reg elementor-widget elementor-widget-heading" data-id="d0ec9f1" data-widget_type="heading.default">
          <div class="elementor-widget-container">
            <h3 class="elementor-heading-title elementor-size-default">Parties are<br>
our passion.</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="elementor-section elementor-top-section elementor-element elementor-element-9e33e0e elementor-section-boxed elementor-section-height-default elementor-section-height-default" data-id="9e33e0e" data-element_type="section">
  <div class="elementor-container elementor-column-gap-default">
    <div class="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-?" data-id="?" data-element_type="column">
      <div class="elementor-widget-wrap elementor-element-populated">
        <section class="elementor-section elementor-inner-section elementor-element elementor-element-54b4f48 elementor-section-full_width elementor-section-content-middle elementor-section-height-default elementor-section-height-default" data-id="54b4f48" data-element_type="section">
          <div class="elementor-container elementor-column-gap-no">
            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-?" data-id="?" data-element_type="column">
              <div class="elementor-widget-wrap elementor-element-populated">
                <div class="elementor-element elementor-element-c496145 domanie_reg elementor-widget elementor-widget-heading" data-id="c496145" data-widget_type="heading.default">
                  <div class="elementor-widget-container">
                    <h4 class="elementor-heading-title elementor-size-default">New york city</h4>
                  </div>
                </div>
                <div class="elementor-element elementor-element-e28138b elementor-widget-divider--view-line elementor-widget elementor-widget-divider" data-id="e28138b" data-widget_type="divider.default">
                  <div class="elementor-widget-container">
                    <div class="elementor-divider"><span class="elementor-divider-separator"></span></div>
                  </div>
                </div>
              </div>
            </div>
            <!-- repeat for "Long Island" (53cd874 + 200ba94 divider) and "Hamptons" (14a6267, no trailing divider) -->
          </div>
        </section>
        <div class="elementor-element elementor-element-e58bc3d elementor-widget elementor-widget-video" data-id="e58bc3d" data-element_type="widget" data-settings='{"video_type":"hosted","autoplay":"yes","play_on_mobile":"yes","mute":"yes","loop":"yes"}' data-widget_type="video.default">
          <div class="elementor-widget-container">
            <div class="e-hosted-video elementor-wrapper elementor-open-inline">
              <video class="elementor-video" src="https://elegantaffairscaterers.com/wp-content/uploads/2021/07/landscape-1.mp4" autoplay="" loop="" muted="muted" playsinline="" controlsList="nodownload"></video>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### B.2 Events cards (Section 10)

```html
<section class="elementor-section elementor-top-section elementor-element elementor-element-1efa720 elementor-section-content-middle party_hm_sec elementor-section-boxed elementor-section-height-default elementor-section-height-default" data-id="1efa720">
  <div class="elementor-container elementor-column-gap-default">
    <div class="elementor-column elementor-col-33 elementor-top-column elementor-element elementor-element-ccbf464 animated-slow elementor-invisible" data-id="ccbf464" data-settings='{"animation":"fadeInUp"}'>
      <div class="elementor-widget-wrap elementor-element-populated">
        <div class="elementor-element elementor-element-365582e disable_default_margin elementor-widget elementor-widget-image" data-id="365582e" data-widget_type="image.default">
          <div class="elementor-widget-container">
            <a href="https://elegantaffairscaterers.com/weddings/">
              <img fetchpriority="high" decoding="async" width="438" height="638" src="https://elegantaffairscaterers.com/wp-content/uploads/2021/09/p1.jpg" class="attachment-full size-full wp-image-8095" alt="Best Elegant Affairs caterers" srcset="...p1.jpg 438w, ...p1-206x300.jpg 206w" sizes="(max-width: 438px) 100vw, 438px" />
            </a>
          </div>
        </div>
        <section class="elementor-section elementor-inner-section elementor-element elementor-element-182f9cb elementor-section-boxed elementor-section-height-default elementor-section-height-default" data-id="182f9cb" data-settings='{"background_background":"classic"}'>
          <div class="elementor-container elementor-column-gap-default">
            <div class="elementor-column elementor-col-100 elementor-inner-column elementor-element elementor-element-7926c66" data-id="7926c66" data-settings='{"background_background":"classic"}'>
              <div class="elementor-widget-wrap elementor-element-populated">
                <div class="elementor-element elementor-element-d0a8996 disable_default_margin reck_reg elementor-widget elementor-widget-heading" data-id="d0a8996">
                  <div class="elementor-widget-container">
                    <h4 class="elementor-heading-title elementor-size-default"><a href="https://elegantaffairscaterers.com/weddings/">weddings</a></h4>
                  </div>
                </div>
                <div class="elementor-element elementor-element-d1ca28f elementor-widget-divider--view-line elementor-widget elementor-widget-divider" data-id="d1ca28f">
                  <div class="elementor-widget-container"><div class="elementor-divider"><span class="elementor-divider-separator"></span></div></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
    <!-- repeat for CORPORATE (p1-2.jpg → /corporate/) and PRIVATE PARTIES (p1-1.jpg → /private-parties/, with motion_fx_motion_fx_scrolling=yes) -->
  </div>
</section>
```

### B.3 Blog + Press (Section 11)

```html
<section class="elementor-section elementor-top-section elementor-element elementor-element-7fdde04 elementor-section-boxed elementor-section-height-default elementor-section-height-default" data-id="7fdde04" data-settings='{"background_background":"classic"}'>
  <div class="elementor-container elementor-column-gap-default">
    <div class="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-b737055 animated-slow elementor-invisible" data-id="b737055" data-settings='{"animation":"fadeInUp"}'>
      <div class="elementor-widget-wrap elementor-element-populated">
        <!-- 1. Blog grid shortcode -->
        <div class="elementor-element elementor-element-22993d2 elementor-widget elementor-widget-shortcode" data-id="22993d2">
          <div class="elementor-widget-container">
            <div class="elementor-shortcode">
              <div class="blog_grid" data-category="">
                <div class="blog_item">
                  <div class="blog_img"><img src=".../mitzvahthumbnail1-516x335.jpg" /></div>
                  <div class="blog_connt">
                    <div class="blog_meta_cus"><span>14 Dec, 2023</span><span class="blog_cat"><a href="/category/blog">Blog</a></span></div>
                    <h2 class="slide_title"><a href="/bar-bat-mitzvahs-...">Bar/Bat Mitzvah's with Elegant Affairs: Unforgettable Off-Premise Catering Services</a></h2>
                    <div class="only_arr_btn"><a href="...">[arrow SVG]</a></div>
                  </div>
                </div>
                <div class="blog_item"><!-- ... PennealaVodka ... --></div>
                <div class="load_mor"><a href="#" id="loadMoreBlog" data-page="2" data-url="/wp-admin/admin-ajax.php">Load More</a></div>
              </div>
            </div>
          </div>
        </div>
        <!-- 2. Blog button (right-aligned, pulled up 30px) -->
        <div class="elementor-element elementor-element-46f3238 elementor-align-right right_arr_btn nrgtive_top_30 domanie_reg elementor-mobile-align-center elementor-widget elementor-widget-button" data-id="46f3238">
          <div class="elementor-widget-container">
            <div class="elementor-button-wrapper">
              <a class="elementor-button elementor-button-link elementor-size-sm" href="/blog/">
                <span class="elementor-button-content-wrapper">
                  <span class="elementor-button-icon">[arrow SVG]</span>
                  <span class="elementor-button-text">Blog</span>
                </span>
              </a>
            </div>
          </div>
        </div>
        <!-- 3. Press heading -->
        <div class="elementor-element elementor-element-45c8923 reck_reg elementor-widget elementor-widget-heading" data-id="45c8923">
          <div class="elementor-widget-container">
            <h2 class="elementor-heading-title elementor-size-default">Press</h2>
          </div>
        </div>
        <!-- 4. Spacer -->
        <div class="elementor-element elementor-element-8d17c13 elementor-widget elementor-widget-spacer" data-id="8d17c13">...</div>
        <!-- 5. Press list shortcode -->
        <div class="elementor-element elementor-element-8eb91f4 elementor-widget elementor-widget-text-editor" data-id="8eb91f4">
          <div class="elementor-widget-container">
            <div class="press_list load_more_post" data-loadmore="" data-category="press">
              <div class="cus_post_item">
                <div class="pst_img">
                  <div class="pst_badge"><img src=".../badge-logo.png" /></div>
                  <a href="/andrea-correale-shares-holiday-hosting-ideas-on-good-day-new-york/"><img src=".../Screenshot-2022-12-23-at-1.26.47-PM-516x360.png" /></a>
                </div>
                <div class="cus_pst_cont">
                  <h2><a href="/andrea-correale-shares-holiday-hosting-ideas-on-good-day-new-york/">Andrea Correale Shares Holiday Hosting Ideas on Good Day New York</a></h2>
                  <div class="read_m"><a href="...">[arrow SVG]</a></div>
                </div>
              </div>
              <!-- 2 more press items -->
              <div class="load_mor"><a href="#" id="loadMore" data-page="2" data-url="/wp-admin/admin-ajax.php">Load More</a></div>
            </div>
          </div>
        </div>
        <!-- 6. Press button -->
        <div class="elementor-element elementor-element-264f4c6 elementor-align-right right_arr_btn domanie_reg elementor-widget elementor-widget-button" data-id="264f4c6">
          <a class="elementor-button elementor-button-link elementor-size-sm" href="/press/">
            <span class="elementor-button-content-wrapper"><span class="elementor-button-icon">[arrow SVG]</span><span class="elementor-button-text">Press</span></span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
```

### B.4 Footer (Section 14)

```html
<footer itemscope="itemscope" itemtype="https://schema.org/WPFooter">
  <div class="elementor-element elementor-element-d96a640 elementor-section elementor-top-section elementor-element elementor-section-boxed elementor-section-content-top" data-id="d96a640" data-settings='{"background_background":"classic","border_border":"solid","border_width":{"top":"2","right":"0","bottom":"0","left":"0"},"border_color":"#F1ECEC"}'>
    <div class="elementor-container elementor-column-gap-default">
      <!-- Row A: H2 + divider + CTA + social -->
      <div class="elementor-column elementor-col-? ...">
        <h2 class="elementor-heading-title">It's party time</h2>
        <div class="elementor-divider"><span class="elementor-divider-separator" style="width:160px; --divider-color:#F00D4D; --divider-border-width:2px;"></span></div>
        <h4><a href="/elegantaffairs/contact-us/">CONTACT US</a></h4>
        <div class="elementor-social-icons-wrapper">
          <a class="elementor-social-icon elementor-social-icon-facebook" href="..."><i class="fab fa-facebook"></i></a>
          <a class="elementor-social-icon elementor-social-icon-youtube" href="..."><i class="fab fa-youtube"></i></a>
          <a class="elementor-social-icon elementor-social-icon-instagram" href="..."><i class="fab fa-instagram"></i></a>
        </div>
      </div>
      <!-- Row B: Logo + 3 addresses + newsletter form -->
      <div class="elementor-column ...">
        <a href="/"><img src=".../EACateringLogo.svg" /></a>
        <p>240 West 30th Street<br>New York, NY 10001<br>Main: <a href="tel:2129910078">212-991-0078</a></p>
        <p>110 Glen Cove Avenue<br>Glen Cove, New York<br>Main: <a href="tel:5166768500">516-676-8500</a></p>
        <p>230 Elm Street<br>Southampton, New York<br>Main: <a href="tel:6315097310">631-509-7310</a></p>
        <h4><a href="/elegantaffairs/contact-us/">SUBSCRIBE TO OUR NEWSLETTER</a></h4>
        <form id="gform_1" method="post" enctype="multipart/form-data">
          <input type="text" name="input_1.3" placeholder="First" />
          <input type="text" name="input_1.6" placeholder="Last" />
          <input type="email" name="input_2" placeholder="Email" />
          <input type="submit" value="Submit" />
        </form>
      </div>
    </div>
  </div>
</footer>
```

### B.5 Top-level nav structure

```html
<nav class="elementor-nav-menu--main elementor-nav-menu__container" role="navigation">
  <ul id="menu-1-2e3e4b2" class="elementor-nav-menu">
    <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children">
      <a href="/about/" class="elementor-item">ABOUT</a>
      <ul class="sub-menu elementor-nav-menu--dropdown">
        <li><a href="/about/who-we-are/" class="elementor-sub-item">Who We Are</a></li>
        <li><a href="/about/our-partnerships/" class="elementor-sub-item">Our Partnerships</a></li>
        <li><a href="/about/our-venues/" class="elementor-sub-item">Our Venues</a></li>
        <li><a href="/about/our-services/" class="elementor-sub-item">Our Services</a></li>
        <li><a href="/about/our-food/" class="elementor-sub-item">Our Food</a></li>
        <li><a href="/about/reviews-recognition/" class="elementor-sub-item">Reviews & Recognition</a></li>
      </ul>
    </li>
    <li class="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children">
      <a href="/events/" class="elementor-item">EVENTS</a>
      <ul class="sub-menu elementor-nav-menu--dropdown">
        <li><a href="/weddings/" class="elementor-sub-item">Weddings</a></li>
        <li><a href="/corporate/" class="elementor-sub-item">Corporate</a></li>
        <li><a href="/private-parties/" class="elementor-sub-item">Private Parties</a></li>
        <li><a href="/mitzvahs/" class="elementor-sub-item">Mitzvahs</a></li>
        <li><a href="/disaster-relief/" class="elementor-sub-item">Disaster Relief</a></li>
      </ul>
    </li>
    <li><a href="/press/" class="elementor-item">PRESS</a></li>
    <li><a href="/blog/" class="elementor-item">BLOG</a></li>
    <li><a href="/careers/" class="elementor-item">CAREERS</a></li>
    <li><a href="/elegantaffairs/contact-us/" class="elementor-item">CONTACT US</a></li>
  </ul>
</nav>
```

---

## Appendix C — Screenshot inventory

All screenshots saved to `/home/z/my-project/newsite/public/media/ea/`:

| File | Bytes | What it shows |
|---|---|---|
| [`ea-full-page.png`](../public/media/ea/ea-full-page.png) | 1,316,967 | Full 1440 × 7483 page screenshot (all 14 sections) |
| [`ea-hero.png`](../public/media/ea/ea-hero.png) | 587,827 | Initial viewport screenshot at top of page (hero H3 + city labels + video bg) |
| [`ea-hero-shot.png`](../public/media/ea/ea-hero-shot.png) | 585,522 | Second hero screenshot (after scroll-to-0 reset) |
| [`ea-section-locations.png`](../public/media/ea/ea-section-locations.png) | 210,338 | Section 3 — Hero city labels + autoplay video |
| [`ea-section-about.png`](../public/media/ea/ea-section-about.png) | 252,547 | Section 4 — `We Offer Full Service Off Premise Catering` |
| [`ea-section-our-food.png`](../public/media/ea/ea-section-our-food.png) | 600,770 | Section 5 — `Cooking is love made visible.` + food carousel |
| [`ea-section-secret-ingredient.png`](../public/media/ea/ea-section-secret-ingredient.png) | 444,615 | Section 6 — `We're your secret ingredient.` + blush bg + champagne-gif |
| [`ea-section-hq.png`](../public/media/ea/ea-section-hq.png) | 483,457 | Section 8 — `TwoFortyThirty` + YouTube embed |
| [`ea-section-lets-party.png`](../public/media/ea/ea-section-lets-party.png) | 1,062,168 | Section 9 — `Let's Party / Our Events` (very tall screenshot) |
| [`ea-section-events-cards.png`](../public/media/ea/ea-section-events-cards.png) | 890,129 | Section 10 — 3 events cards (Weddings / Corporate / Private Parties) |
| [`ea-section-blog-press.png`](../public/media/ea/ea-section-blog-press.png) | 689,048 | Section 11 — Blog grid + Press list (1433 px tall) |
| [`ea-section-instagram.png`](../public/media/ea/ea-section-instagram.png) | 567,423 | Section 12 — `A Very Social Life` + Instagram feed |
| [`ea-section-footer.png`](../public/media/ea/ea-section-footer.png) | 554,118 | Section 14 — `It's party time` + addresses + newsletter form |

**Total media downloaded:** 30 files, 11 MB on disk (including screenshots + hero MP4 + 3 food carousel JPEGs + 3 events JPEGs + 5 blog/press images + hero bg JPEG + secret-ingredient bg JPEG + logo SVG + badge PNG + favicon PNG).

---

## End of analysis

This document is **~1,650 lines** of structured analysis covering palette (10 colours), typography (5 type families + 14-element type scale), 14 sections top-to-bottom, 8 wow moments, 10 component patterns, full header/nav + mega-menu structure, footer with newsletter form, 30 image/video assets inventoried and downloaded, complete animation choreography, 5-breakpoint mobile responsive analysis, 16 raw CSS appendices, 5 DOM-tree appendices, and a screenshot inventory.

**Next-step recommendations for Cycle 28 implementation subagents:**

1. **Subagent 2-B (design tokens)** should add the `--ea-*` tokens from §11.1 to `src/app/globals.css` and install Fraunces + Inter via `next/font/google` in `src/app/layout.tsx`. Download the `sparkles.gif` and `champagne-2.gif` decorative GIFs from `/wp-content/themes/elegant-affairs/images/` to `/public/media/ea/` (deferred — see §8.12).
2. **Subagents 2-C through 2-G** (component builders) should each pick one of the wow moments from §4 and build a reusable React component:
   - 2-C: `<EAHero>` (hero with autoplay MP4 over JPEG poster + H3 + city labels with `.sep_list` wipe reveal)
   - 2-D: `<EASecretIngredient>` (blush section with bg image anchored top-right + white card + champagne-gif decoration)
   - 2-E: `<EAEventsGrid>` (3-column image cards with hover-zoom + black overlay panel)
   - 2-F: `<EABlogGrid>` + `<EAPressList>` (blog cards + press cards with badge + overlap panel)
   - 2-G: `<EAFooter>` (party-time H2 + pink-red divider + 3 addresses + newsletter form + social icons)
3. **Subagent 2-H (page.tsx wire)** should compose the new `ea-*` editorial layer into `src/app/page.tsx` as a new "EA cycle" above or interleaved with the existing CEP/Salt Block/Ridgewells/MCulinary layers.

— end of `EA-ANALYSIS.md` —
