# Talk of the Town Atlanta — MINED EXTRACTION (Task 1-b)

Source: pre-extracted JSON dumps at
- `/home/z/my-project/newsite/docs/footer-library/site6_talkofthetown.json` (homepage, 459 KB raw HTML)
- `/home/z/my-project/newsite/docs/ui-patterns/talkofthetown-404.json` (404 page, 118 KB)
- `/home/z/my-project/newsite/docs/site-maps/raw-sitemaps/talkofthetown_sitemap.xml` (sitemap index)

JSON schema: `{ code: 200, data: { description, external, html, httpStatus, metadata, title, url, usage } }`.
Each `data.html` is the full server-rendered HTML page (no separate css / scripts / external assets).

Site URL: `https://talkofthetownatlanta.com/`
Site type: **WordPress + Avada 7.0.4 child theme + Slider Revolution 6.7.58**
Generator metadata: `Powered by Slider Revolution 6.7.58 - responsive, Mobile-Friendly Slider Plugin for WordPress`
og:site_name: `Talk of the Town Catering`
Language: `en-US`

---

## 1. FONTS

### Google Fonts `<link>` (loaded inside Slider Revolution block, line 697 of HTML)
```html
<link href="//fonts.googleapis.com/css2?family=Nothing+You+Could+Do:wght@400&family=Prata:wght@400&family=Lato:wght@400&display=swap" rel="stylesheet" property="stylesheet" media="all" type="text/css">
```

JS-detected required fonts (Slider Revolution):
```js
_tpt.R.fonts.domFonts = {
  "Nothing+You+Could+Do": { "normal":[400], "italic":[] },
  "Prata":                { "normal":[400], "italic":[] },
  "Lato":                 { "normal":[400], "italic":[] }
};
```

### Font roles (from inline `style="font-family:..."` on SR7 layers and Avada typography vars)

| Font | Role | Where used |
|---|---|---|
| **Prata** (display serif, 400 only) | Section H1/H2 display headlines (e.g. testimonial carousel titles, "ATLANTA CATERERS THAT CARE" overlays in SR7) | Avada `--h1_typography-font-family` / `--h2_typography-font-family` (defined in external fusion-styles CSS) |
| **Nothing You Could Do** (decorative script, 400 only) | Decorative script overlay text on hero slider ("bacon & bluecheese tartlet") and accent words on section sliders | SR7 layer `style="font-family: 'Nothing You Could Do'"` |
| **Lato** (sans-serif body, 400 only) | Body copy, menu items, captions (loaded via Google Fonts by SR7 module; not used as Avada body var) | SR7 layer `font.family: "Lato"` |

No `@font-face` declarations found in the inlined HTML (Avada stores its typography CSS in an external minified file: `https://talkofthetownatlanta.com/wp-content/uploads/fusion-styles/0d905e679a0f3adbd0c44e83237f3eb3.min.css?ver=3.16`).
On the 404 page the H1 uses a fallback stack `font-family: open-sans, arial` — Google Fonts are NOT loaded on the 404 because no SR7 slider is present.

### External CSS (3 stylesheets)
```
//talkofthetownatlanta.com/wp-content/plugins/revslider/public/css/sr7.css?ver=6.7.58
https://talkofthetownatlanta.com/wp-content/themes/Avada-Child-Theme/style.css?ver=7.0.4
https://talkofthetownatlanta.com/wp-content/uploads/fusion-styles/0d905e679a0f3adbd0c44e83237f3eb3.min.css?ver=3.16
```

---

## 2. HEADER + NAV HTML (MENU IS BELOW THE HERO)

### Document order (confirmed by line scan)

```
1. <div id="sliders-container">       (line 183)   — HERO slider first
2.   <sr7-module data-alias="hero-2"> (line 186)   — Slider Revolution hero module
3. </div>                             (line 201)
4. <header class="fusion-header-wrapper"> (line 204)  — HEADER (with logo + nav) AFTER hero
```

This is the "menu at the BOTTOM of the header" / "hero on top, nav underneath" layout the user wants to replicate. The Avada template positions `<header>` AFTER `#sliders-container` so the nav bar sits visually **below** the full-bleed hero image.

### Raw `<header>` opening (truncated to ~3 KB)
```html
<header class="fusion-header-wrapper">
  <div class="fusion-header-v1 fusion-logo-alignment fusion-logo-left fusion-sticky-menu-1 fusion-sticky-logo- fusion-mobile-logo- fusion-mobile-menu-design-modern">
    <div class="fusion-header-sticky-height" style="height: 84.2969px; overflow: visible;"></div>
    <div class="fusion-header" style="height: 84.2969px; overflow: visible;">
      <div class="fusion-row" style="padding-top: 0px; padding-bottom: 0px;">

        <!-- LEFT: Logo (SVG, 2:1 ratio, white-on-transparent) -->
        <div class="fusion-logo" data-margin-top="10px" data-margin-bottom="10px" data-margin-left="0px" data-margin-right="0px" style="margin-top: 10px; margin-bottom: 10px;">
          <a class="fusion-logo-link" href="https://talkofthetownatlanta.com/">
            <img src="https://talkofthetownatlanta.com/wp-content/uploads/2019/01/talk-of-the-town-website-logo-1.svg"
                 srcset="https://talkofthetownatlanta.com/wp-content/uploads/2019/01/talk-of-the-town-website-logo-1.svg 1x"
                 width="2" height="1" alt="Talk of the Town Catering Logo" class="fusion-standard-logo">
          </a>
        </div>

        <!-- RIGHT: Main nav + search overlay -->
        <nav class="fusion-main-menu" aria-label="Main Menu">
          <div class="fusion-overlay-search" style="max-width: 917.891px;">
            <form role="search" class="searchform fusion-search-form fusion-search-form-classic" method="get" action="https://talkofthetownatlanta.com/"> ... </form>
            <a href="#" role="button" aria-label="Close Search" class="fusion-close-search"></a>
          </div>

          <ul id="menu-main-menu" class="fusion-menu">
            <!-- 1. catering (dropdown) -->
            <li ... class="menu-item ... menu-item-has-children ... fusion-dropdown-menu">
              <a href="https://talkofthetownatlanta.com/atlanta-catering/" style="height: 84px;">
                <span class="menu-text">catering</span>
              </a>
              <ul class="sub-menu">
                <li><a href=".../atlanta-wedding-catering/">  <span>wedding catering</span></a></li>
                <li><a href=".../atlanta-corporate-catering/"><span>corporate catering</span></a></li>
                <li><a href=".../atlanta-catering-casual/">    <span>social events catering</span></a></li>
                <li><a href=".../atlanta-tv-and-film-industry-catering/"><span>tv &amp; film industry</span></a></li>
                <li><a href=".../best-bbq-catering-atlanta-north-georgia/"><span>bbq catering</span></a></li>
                <li><a href=".../mitzvah-catering/">            <span>Mitzvah Catering</span></a></li>
              </ul>
            </li>

            <!-- 2. catering menus (dropdown) -->
            <li ... class="menu-item menu-item-has-children ... fusion-dropdown-menu">
              <a href="https://talkofthetownatlanta.com/menus/" style="height: 84px;">
                <span class="menu-text">catering menus</span>
              </a>
              <ul class="sub-menu">
                <li><a href=".../menus/">                      <span>full menus</span></a></li>
                <li><a href=".../sample-menu-selections/">     <span>sample menu selections</span></a></li>
              </ul>
            </li>

            <!-- 3. venues (single link) -->
            <li><a href="https://talkofthetownatlanta.com/venues/"><span class="menu-text">venues</span></a></li>

            <!-- 4. meet tott (dropdown w/ sub-submenu) -->
            <li ... class="menu-item menu-item-has-children ... fusion-dropdown-menu">
              <a href="https://talkofthetownatlanta.com/about-atlanta-caterer-talk-of-the-town/" style="height: 84px;">
                <span class="menu-text">meet tott</span>
              </a>
              <ul class="sub-menu">
                <li><a href=".../our-culinary-philosophy/">   <span>culinary philosophy</span></a></li>
                <li><a href=".../our-purpose-and-values/">    <span>our purpose &amp; values</span></a></li>
                <li><a href=".../gallery/">                  <span>gallery</span></a>
                  <ul class="sub-menu fusion-switched-side" style="left: -255px;">
                    <li><a href=".../the-wedding-gallery/">      <span>wedding gallery</span></a></li>
                    <li><a href=".../corporate-events-gallery/"> <span>corporate events gallery</span></a></li>
                  </ul>
                </li>
              </ul>
            </li>

            <!-- 5. contact (single link) -->
            <li><a href="https://talkofthetownatlanta.com/contact/"><span class="menu-text">contact</span></a></li>

            <!-- 6. PHONE — styled as last menu item, fusion-button -->
            <li class="menu-item ... fusion-menu-item-button">
              <a href="tel:4043344935" class="fusion-bar-highlight" style="height: 84px;">
                <span class="menu-text fusion-button button-default button-medium">
                  <span class="button-icon-divider-left">
                    <i class="glyphicon fa-phone-alt fas" aria-hidden="true"></i>
                  </span>
                  <span class="fusion-button-text-left">404-334-4935</span>
                </span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</header>
```

### Header structural facts
- **Sticky**: `fusion-sticky-menu-1` — header becomes sticky on scroll.
- **Mobile menu**: `fusion-mobile-menu-design-modern` (hamburger).
- **No announcement bar / no top bar** — there is no `fusion-secondary-header` on the homepage.
- Header height (desktop): **84.2969 px** (hardcoded by JS based on logo height).
- Phone CTA `404-334-4935` is rendered as a button INSIDE the nav `<ul>` as the last `<li>` (style `fusion-menu-item-button`), with a phone-alt glyphicon to the left.

### Top-level menu items (5 + phone button)
1. catering (dropdown → 6 subs)
2. catering menus (dropdown → 2 subs)
3. venues
4. meet tott (dropdown → culinary philosophy / our purpose & values / gallery [nested dropdown])
5. contact
6. 📞 404-334-4935 (button-styled `<li>`)

---

## 3. HERO

The hero is a **Slider Revolution** module `<sr7-module data-alias="hero-2" data-id="2" id="SR7_2_1">` placed INSIDE `<div id="sliders-container">`, positioned ABOVE the `<header>`.

### Hero markup (lines 183–201)
```html
<div id="sliders-container" class="fusion-slider-visibility">
  <sr7-module data-alias="hero-2" data-id="2" id="SR7_2_1" class="rs-ov-hidden"
             data-version="6.7.58" style="height: 1280px;" data-current="2">
    <sr7-adjuster style="height: 1280px;"></sr7-adjuster>
    <sr7-content style="height: 1280px; left: 0px; width: 1280px; top: 0px;">

      <sr7-slide id="SR7_2_1-2" data-key="2" style="pointer-events: auto; ...">

        <!-- HERO BACKGROUND IMAGE (slide bg, full-bleed) -->
        <sr7-mask ...>
          <sr7-bg id="SR7_2_1-2-5" class="sr7-layer" data-type="shape"
                  data-subtype="slidebg"
                  style="padding: 0px; width: 100%; height: 1280px;
                         display: block; visibility: visible; overflow: hidden;
                         background: transparent; pointer-events: none; opacity: 1;">
            <canvas width="1280" height="1280" class="sr7-a-canvas" ...></canvas>
            <noscript>
              <img src="https://talkofthetownatlanta.com/wp-content/uploads/2019/01/hero-2.jpg"
                   alt="" title="hero-2">
            </noscript>
          </sr7-bg>
        </sr7-mask>

        <!-- DECORATIVE WHITE BORDER SHAPE -->
        <sr7-shp id="SR7_2_1-2-2" class="tp-shape tp-shapewrapper sr7-layer"
                 style="width: 1573px; height: 763px;
                        border-style: solid; border-width: 5px;
                        border-color: rgb(255, 255, 255);
                        background: rgba(0, 0, 0, 0);
                        position: absolute; left: -147.5px; top: 262.5px; ..."></sr7-shp>

        <!-- WHITE LOGO OVERLAY (498 × 110 px) -->
        <sr7-img id="SR7_2_1-2-3" class="sr7-layer"
                 style="width: 498px; height: 110px; z-index: 7;
                        background: url('https://talkofthetownatlanta.com/wp-content/uploads/2019/01/Talk_logo_white.png') 50% 50% / cover no-repeat transparent;
                        left: -50px; top: 366px;"></sr7-img>

        <!-- SCRIPT OVERLAY TEXT: "bacon & bluecheese tartlet" -->
        <sr7-txt id="SR7_2_1-2-4" class="sr7-layer"
                 style="font-family: 'Nothing You Could Do';
                        font-size: 24px; font-weight: 400;
                        color: rgb(255, 255, 255);
                        letter-spacing: 0px; line-height: 22px;
                        position: absolute; left: 1052px; top: 950px;">
          <div class="sr7_splitted_words_noanim">[chars split for animation: b a c o n  &  b l u e c h e e s e  t a r t l e t]</div>
        </sr7-txt>
      </sr7-slide>
    </sr7-content>
  </sr7-module>
</div>
```

### Hero SR7 JSON config (parsed from `SR7.JSON['SR7_2_1']`)
```jsonc
{
  "settings": {
    "title": "hero 2",
    "alias": "hero-2",
    "type": "hero",
    "fonts": { "'Nothing+You+Could+Do'": {"normal":{"400":true},"subset":{"latin":true}} },
    "size": { "fullHeight": true, "fullHeightOffset": ",",
              "width":[1240,1240,1024,778,480],
              "height":[868,868,768,960,720] },
    "imgs": [
      { "src": "https://talkofthetownatlanta.com/wp-content/uploads/2019/01/Talk_logo_white.png" },
      { "lib_id":10, "src":  "https://talkofthetownatlanta.com/wp-content/uploads/2019/01/hero-2.jpg" }
    ],
    "pLoader": { "color":"#FFFFFF", "type":"0" }
  },
  "slides": { "2": {...}, "25": {...} }   // 2 slides total (1 visible + 1 staticslide)
}
```

### Hero media URLs
- **Hero background image**: `https://talkofthetownatlanta.com/wp-content/uploads/2019/01/hero-2.jpg`
- **White logo overlay**: `https://talkofthetownatlanta.com/wp-content/uploads/2019/01/Talk_logo_white.png` (498 × 110)
- **Hero overlay text**: `bacon & bluecheese tartlet` (script font, 24 px, white)
- **Decorative border**: 5 px solid white rectangle (1573 × 763 px), positioned offset
- **No video** in hero (`data-bgvideo` empty, no `<video>`/`<source>`).

### Hero responsive heights
`gh: [868, 868, 768, 960, 720]` px for breakpoints [1240, 1024, 778, 480] desktop→mobile.

---

## 4. COLOR PALETTE

### Avada color palette (CSS custom properties, top of HTML, line 80)
```css
--wp--preset--color--awb-color-1: rgba(255,255,255,1);      /* white              */
--wp--preset--color--awb-color-2: rgba(246,246,246,1);      /* off-white          */
--wp--preset--color--awb-color-3: rgba(224,222,222,1);      /* light gray         */
--wp--preset--color--awb-color-4: rgba(160,206,78,1);       /* olive green accent */
--wp--preset--color--awb-color-5: rgba(116,116,116,1);      /* medium gray text   */
--wp--preset--color--awb-color-6: rgba(139,31,28,1);        /* BURGUNDY (primary) */
--wp--preset--color--awb-color-7: rgba(51,51,51,1);         /* dark gray text      */
--wp--preset--color--awb-color-8: rgba(0,0,0,1);            /* black               */
--wp--preset--color--awb-color-custom-10: rgba(235,234,234,1);
--wp--preset--color--awb-color-custom-11: rgba(139,11,4,1); /* dark burgundy       */
--wp--preset--color--awb-color-custom-12: rgba(229,229,229,1);
--wp--preset--color--awb-color-custom-13: rgba(249,249,249,1);
--wp--preset--color--awb-color-custom-14: rgba(232,232,232,1);
```

### Hex colors actually used inline (top frequencies)
| Hex | Usage count | Role |
|---|---|---|
| `#ffffff` | 230× | Hero text, menu button text, blog card borders |
| `#8c0b05` | 4× | **Button gradient top** (CTA buttons, "MAKE A SECURE PAYMENT", "CONTACT TOTT") |
| `#6b0202` | 4× | **Button gradient hover top** |
| `#8b0b04` | 3× | Button gradient variant ("download an application") |
| `#700d02` | 3× | Button gradient hover variant |
| `#333333` | 4× | Body text color in footer social icons / inline |
| `#808080` | 8× | Muted gray text |
| `#32373c` | 3× | Avada button bg (default) |
| `#000000` | 3× | Black text |
| `#039` (3-digit) | 24× | Blue accent (default `<a>` links — WP preset) |

### Beige section background (inline)
- `rgba(241,234,224,1)` ≈ `#F1EAE0` — used 3× as blog post card background (cream/beige section bg)

### Background image backgrounds (CSS `url(...)` inside `--awb-background-image`)
| Background image | Sections using it |
|---|---|
| `https://talkofthetownatlanta.com/wp-content/uploads/2019/01/square-background-beige-1.jpg` | Many "intro" / "decadent dishes" / "social events" sections (with `background-attachment: fixed` parallax) |
| `https://talkofthetownatlanta.com/wp-content/uploads/2019/01/logo-background-1.jpg` | "let's talk about your atlanta special event!" CTA section |
| `https://talkofthetownatlanta.com/wp-content/uploads/2019/07/Olivetrees.jpg` | "let's talk about your next special event!" CTA section |
| `https://talkofthetownatlanta.com/wp-content/uploads/2025/11/North-on-5th.png` | "NORTH ON 5TH" tasting room section |
| `https://talkofthetownatlanta.com/wp-content/uploads/2019/05/mobile-background-1-1.png` | Mobile-only section bg |
| `https://talkofthetownatlanta.com/wp-content/uploads/2019/05/mobile-background-2-4.png` | Mobile-only section bg |

### 5 main brand colors
1. **Burgundy / primary brand** — `#8B1F1C` (rgb 139,31,28) — `awb-color-6`
2. **Dark burgundy / buttons** — `#8C0B05` (gradient top) → `#6B0202` (gradient hover top)
3. **Olive green accent** — `#A0CE4E` (rgb 160,206,78) — `awb-color-4`
4. **Cream / section background** — `#F1EAE0` (rgb 241,234,224)
5. **Off-white / light gray** — `#F6F6F6` (rgb 246,246,246) — `awb-color-2`

Supporting neutrals: `#E0DEDE` (light gray), `#747474` (medium gray body), `#333333` (dark gray text), `#FFFFFF`, `#000000`.

---

## 5. ALL IMAGE URLS (grouped by section)

### Hero (Slider Revolution `SR7_2_1`)
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/01/hero-2.jpg` — slide background (full-bleed)
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/01/Talk_logo_white.png` — white logo overlay (498 × 110)
- (decorative 5 px white border shape — no image)

### Header
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/01/talk-of-the-town-website-logo-1.svg` — main logo (SVG, 2:1 aspect)

### Intro / "atlanta's best catering company" sections (rows 1 + 2)
Background:
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/01/square-background-beige-1.jpg` (parallax fixed bg)

### "ATLANTA / CATERERS THAT CARE / decadent dishes / flawless presentation" (rows 3 + 4)
- "explore the menu" CTA button (no inline image — text-only block)

### Dish spotlight ("smoked trout…" rows 5 + 6)
No images on this row in the visible content (white-bg centered text spotlight)

### "let's talk about your atlanta special event!" CTA (rows 7 + 8)
Background:
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/01/logo-background-1.jpg`

### "FLAWLESS SERVICE / highly trained staff" (rows 9 + 10)
- "learn about our team" → https://talkofthetownatlanta.com/atlanta-caterer-talk-of-the-town-our-catering-staff/
- "download an application to join our team" → `https://talkofthetownatlanta.com/wp-content/uploads/2019/07/Employment-Application-2019.pdf`

### "chefs paella action station" (rows 11 + 12)
Likely uses one of the dish photos inline — image not in this row's preview; included under "Food thumbnails".

### Testimonial carousel (Slider Revolution `SR7_8_2` + `SR7_8_3`)
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/04/quotes-2.png` — quote icon
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/04/quotes-1.png` — quote icon
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/04/grey-block.png` — slide bg placeholder (used 24× as grey placeholder bg for all 13 slides)

### Service category sections (rows 15–19) — wedding / corporate / social events
Inline `<img>`:
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/01/wedding-couple-home-4.jpg` — wedding catering (700 × ~1050)
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/02/GoogleDrive_Ball-Ground-The-Greystone-Estate-Atlanta-Wedding-Photography-Pineapple-Styled-Shoot-Six-Hearts-Photography_431.jpg` — Greystone Estate wedding venue (2048 × ~1366)
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/01/fish-dish-home.jpg` — corporate dish
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/01/place-setting.jpg` — social events (700 × ~1050 portrait)
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/01/tacos-lime-wedges.jpg` — social events dish (700 × ~1050)

### "let's talk about your next special event!" CTA (row 20)
Background:
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/07/Olivetrees.jpg` — olive trees (parallax)

### "chef in the field" blog teaser (row 21)
Background: cream/beige.
Inline flexslider blog cards (3 posts):
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/07/Kati-Brad-Romantic-Photos-0116.jpg` (2048 × 1366) — Tara & Matt's Wedding at Little River Farms
- (2 more blog posts in same grid — same source path `/wp-content/uploads/2019/02/...` and `/2019/07/...`)

### "NORTH ON 5TH — a talk of the town tasting room" (rows 23 + 24)
Background:
- `https://talkofthetownatlanta.com/wp-content/uploads/2025/11/North-on-5th.png`

### Food thumbnails (Avada image elements, full srcset available)
All from `/wp-content/uploads/2019/01/`:
- `boxed-lunch-botanical-garden.jpg` (800 × 533)
- `carrot.jpg` (700 × 1050 portrait)
- `fish-dish-home.jpg` (1000 × 665)
- `flawless-service.jpg` (1200 × 823)
- `paella-station-home.jpg` (800 × 533)
- `passed-appetizers-home.jpg` (1000 × 501)
- `place-setting.jpg` (700 × 1050 portrait)
- `sage-pasta-home.jpg` (800 × 554)
- `tacos-lime-wedges.jpg` (700 × 1050 portrait)
- `tomatoes-moz-home.jpg` (533 × 800)
- `wedding-buffet-home.jpg` (700 × 1050 portrait)

Newer uploads (2024–2026):
- `https://talkofthetownatlanta.com/wp-content/uploads/2024/06/passed-horderves.jpg` (1000 × 501)
- `https://talkofthetownatlanta.com/wp-content/uploads/2024/06/sweet-treats.jpg` (700 × 1050 portrait)
- `https://talkofthetownatlanta.com/wp-content/uploads/2025/06/DSC07061_websize-1.jpg` (1600 × 1067)

### Awards strip
- `https://talkofthetownatlanta.com/wp-content/uploads/2024/01/badg.png` — badge image (349 wide)
- `https://talkofthetownatlanta.com/wp-content/uploads/2026/03/Talk-of-the-Town-awards.png` — awards strip (1315 × ~203)
- `https://talkofthetownatlanta.com/wp-content/uploads/2026/08/1.png`, `3.png`, `8.png` — 3 portrait venue photos (700 × 1050 each)

### Footer images
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/02/t-t-logo-300x66.png` — footer logo (with srcset 200w, 300w, 400w, 470w)
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/05/mobile-logos-2.png` — mobile logo strip
- `https://talkofthetownatlanta.com/wp-content/uploads/2021/08/mobile-logos-3.png` — mobile logo strip (newer)

### Favicon / apple-touch-icons (metadata)
- `https://talkofthetownatlanta.com/wp-content/uploads/2020/01/cropped-email-signature-logo-32x32.jpg`
- `https://talkofthetownatlanta.com/wp-content/uploads/2020/01/cropped-email-signature-logo-180x180.jpg`
- `https://talkofthetownatlanta.com/wp-content/uploads/2020/01/cropped-email-signature-logo-192x192.jpg`
- `https://talkofthetownatlanta.com/wp-content/uploads/2020/01/cropped-email-signature-logo-270x270.jpg`

### OG image
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/01/talk-of-the-town-website-logo-1.svg` (svg, 2.79 × 0.67 aspect)

### Misc / utility
- `https://s.w.org/images/core/emoji/17.0.2/svg/1f642.svg` — emoji 🙂 (used 2×)
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/04/grey-block.png` — SR7 testimonial slide bg placeholder (used 24×)

### Documents / PDF
- `https://talkofthetownatlanta.com/wp-content/uploads/2019/07/Employment-Application-2019.pdf` — employment application (linked from "download an application to join our team" button)

---

## 6. ALL VIDEO URLS

**NONE.** The homepage contains:
- 0× `<video>` tags
- 0× `<source>` tags
- 0× YouTube / Vimeo / Wistia embeds
- 0× `.mp4` / `.webm` / `.mov` URLs
- 0× SR7 `data-bgvideo` attributes
- 0× SR7 `data-youtube` / `data-vimeo` attributes

The hero is purely an image background (`hero-2.jpg`) with overlaid text and logo. No video on the 404 page either. The whole site relies on photography, not video.

---

## 7. ANIMATIONS

### Slider Revolution (SR7) — primary animation engine
- 428× references to `sr7-` prefixed elements/classes
- Internal GSAP integration: `_tpt.gsap` (4× references) — used for preloader fade-in/out and SR7 layer transitions
- Hero layer transitions: `power3.inOut` easing, 300 ms fade-in, 310 ms fade-out (parsed from SR7 JSON `tl.in.content.all`)
- Hero text animation: chars are split into individual `<div>` elements with class `sr7_splitted_chars`, each animated separately (character-by-character reveal)
- Preloader: type 0 (dot bounce animation `prlt0` with `dot1`, `dot2`, `bounce1`, `bounce2`, `bounce3` divs)

### Avada built-in scroll animations
- **41 elements** with `class="fusion-animated"` + `data-animationtype` attribute
- All 41 use the SAME animation type: `data-animationtype="fadeInLeft"`
- Durations (data-animationduration): `0.3` (23×), `0.9` (13×), `0.6` (3×), `0.7` (2×)
- Trigger offsets (data-animationoffset): `top-into-view` (32×), `top-mid-of-view` (9×)

### Parallax (CSS `background-attachment: fixed`)
- **16 sections** use `background-attachment: fixed` for parallax-style fixed-bg scrolling effect
- The `fusion-parallax` Avada class is referenced 16× in the DOM
- Section backgrounds that parallax: `square-background-beige-1.jpg`, `logo-background-1.jpg`, `Olivetrees.jpg`, `North-on-5th.png`, `mobile-background-1-1.png`, `mobile-background-2-4.png`

### Flexslider (blog post grid)
- 9× references to `flexslider` class — used for 3 blog post cards in the "chef in the field" section
- Each post card uses `fusion-flexslider flexslider fusion-flexslider-loading fusion-post-slideshow` with `<ul class="slides">` (typically only 1 slide per post)

### NOT USED (libraries absent)
- ❌ AOS (no `data-aos`)
- ❌ Swiper (no `swiper-container`)
- ❌ Slick (no `slick-slider`)
- ❌ Waypoints
- ❌ ScrollReveal
- ❌ Lottie
- ❌ Standalone GSAP (only via Slider Revolution internally)
- ❌ No `@keyframes` definitions in inlined CSS

### CSS `transition:` rules
- Only 1× inlined `transition:` rule (most transitions are in the external fusion-styles CSS file).

---

## 8. SECTION STRUCTURE (in order)

Each "row" below is one `<div class="fusion-fullwidth fullwidth-box fusion-builder-row-N">`. Avada renders duplicate rows for each breakpoint (small / medium / large) — pairs marked "(small)" / "(medium)" are responsive duplicates of the same logical section.

| # | Row | Visible on | Heading(s) | CTA button(s) | Background |
|---|---|---|---|---|---|
| 0 | (sr7-module hero-2) | all | "bacon & bluecheese tartlet" (script overlay) | — | `hero-2.jpg` full-bleed + `Talk_logo_white.png` overlay |
| 1 | row 1 | small only | "atlanta's best catering company" (×2) | — | — |
| 2 | row 2 | medium+ | "atlanta's best catering company" | — | `square-background-beige-1.jpg` (parallax) |
| 3 | row 3 | small | "ATLANTA / CATERERS THAT CARE / decadent dishes / flawless presentation" | "explore the menu" | — |
| 4 | row 4 | medium+ | (same as row 3) | "explore the menu" | — |
| 5 | row 5 | small | "smoked trout with pureed peruvian potatoes, chantelle mushrooms, & mustard v..." | — | — |
| 6 | row 6 | medium+ | (same) | — | `#ffffff` |
| 7 | row 7 | small | "let's talk about your atlanta special event!" | "contact talk of the town catering" | `logo-background-1.jpg` (parallax) |
| 8 | row 8 | medium+ | (same) | "contact talk of the town" | `square-background-beige-1.jpg` (parallax) |
| 9 | row 9 | small | "FLAWLESS SERVICE / highly trained staff" | "learn about our team" + "download an application to join our team" (PDF) | — |
| 10 | row 10 | medium+ | (same) | "learn about our team" | — |
| 11 | row 11 | small | "chefs paella action station" | — | — |
| 12 | row 12 | medium+ | (same) | — | `#ffffff` |
| 13 | row 13 | small | — | — | (testimonial carousel sr7 SR7_8_3) |
| 14 | row 14 | medium+ | — | — | (testimonial carousel sr7 SR7_8_2) |
| 15 | row 15 | all | "ATLANTA WEDDING CATERERS" | "explore atlanta wedding catering" + "view our atlanta wedding catering menus" | — |
| 16 | row 16 | small | "ATLANTA CORPORATE CATERING" | (similar CTAs) | — |
| 17 | row 17 | medium+ | "ATLANTA CORPORATE CATERING" | "explore corporate catering in atlanta" + "view our atlanta corporate catering menus" | — |
| 18 | row 18 | small | "SOCIAL EVENTS CATERING / pristine place settings for your social occasion" | "explore atlanta social events caterings" + "view our atlanta social catering menus" | — |
| 19 | row 19 | medium+ | "SOCIAL EVENTS CATERING / taco al pastor with orange cilantro dressing & fresh lime" | (similar CTAs) | — |
| 20 | row 20 | all | "let's talk about your next special event!" | "contact talk of the town" | `Olivetrees.jpg` (parallax) |
| 21 | row 21 | all | "chef in the field / stories of our farm-to-table philosophy" | "visit our blog" | cream bg + flexslider blog cards |
| 22 | row 22 | all | (blog post grid: Tara & Matt's Wedding at Little River Farms; Delilah & William's Wedding at Greystone Estate; Christine & Shane's Biltmore Wedding) | "Read More" | — |
| 23 | row 23 | medium+ | — | — | `North-on-5th.png` (parallax) |
| 24 | row 24 | all | "NORTH / ON 5TH / a talk of the town / tasting room" | "explore the tasting room" → https://northon5th.com/ | — |
| 25–29 | rows 25–29 | small only | (mobile-only blocks: logo strip + awards badge + venue photos 1/3/8.png) | — | — |

### Heading HTML sample (row 3 — "ATLANTA / CATERERS THAT CARE")
```html
<h1 class="title-heading-left fusion-responsive-typography-calculated"
    style="...">
  ATLANTA <br>CATERERS THAT CARE
</h1>
```
```html
<h2 class="title-heading-left fusion-responsive-typography-calculated"
    style="...">
  decadent dishes <br>flawless presentation
</h2>
```

### Button CTA sample (footer)
```html
<a class="fusion-button button-flat fusion-button-default-size button-custom fusion-button-default button-21 fusion-button-default-span fusion-button-default-type"
   style="--button_accent_color:#ffffff;
          --button_accent_hover_color:#ffffff;
          --button_border_hover_color:#ffffff;
          --button_border_width-top:0;--button_border_width-right:0;
          --button_border_width-bottom:0;--button_border_width-left:0;
          --button_gradient_top_color:#8c0b05;
          --button_gradient_bottom_color:#8c0b05;
          --button_gradient_top_color_hover:#6b0202;
          --button_gradient_bottom_color_hover:#6b0202;"
   target="_blank" rel="noopener noreferrer"
   href="https://form.jotform.co/80806188542865">
  <span class="fusion-button-text awb-button__text awb-button__text--default">MAKE A SECURE PAYMENT</span>
</a>
```

### Testimonial carousel (SR7_8_2 / SR7_8_3) — fonts and slide data
- Module title: `"TESIMONIAL 2024"`, type: `carousel`, alias: `tesimonial-2-1`
- Fonts loaded for this module: `Prata`, `Lato`, `'Nothing+You+Could+Do'`
- 13 slides total (12 testimonials + 1 "Global Layers" slide 42)
- Each slide bg: `https://talkofthetownatlanta.com/wp-content/uploads/2019/04/grey-block.png`
- Two quote-icon images: `quotes-1.png`, `quotes-2.png`

#### Testimonial slide names + dates
1. **jsilverboard** — June 2024 — "We had the best experience using Talk of the Town for our wedding…"
2. **Surjyendu Ray** — May 2024 — "Amazing food and very friendly! :) Definitely recommend!"
3. **Primrose Midtown Colony Square** — May 2024 — "Extraordinary! Exceeded Our Expectations! We had a large fundraising event…"
4. **Tracy Joseph** — May 2024 — "Extraordinary! Exceeded Our Expectations! Hope and her team are incredibly professional…"
5. **Michelle Bryan** — April 2024 — "This team is fantastic and our food was amazing!…"
6. **Elizabeth Stucky** — April 2024 — "Talk of the town catered a baby shower for me…"
7. **Janet Dahlstrom** — April 2024 — "Talk of the Town worked with us to ensure the event was affordable for our budget…"
8. **Sherri Morgan** — March 2024 — "Hope and her team at Talk of the Town were hands down an amazing partner for our 40th Anniversary Gala…"
9. **Isabelle Herring** — March 2024 — "The best of the best. Nothing else really compares."
10. **Tamar Faulhaber** — March 2024 — "We had an unbelievable experience with TOTT. Food was all delicious, beautifully presented…"
11. **Stan S** — January 2024 — "We held my daughter's wedding at our home on New Years Eve this year…"
12. **Chris Archer** — November 2023 — "I have used many of the top catering companies in Atlanta and I have to say Talk of the Town lives up to its name!…"

---

## 9. FOOTER HTML

### Footer 1 — Widget area (line 621, 11.6 KB)
```html
<footer class="fusion-footer-widget-area fusion-widget-area fusion-footer-widget-area-center">
  <div class="fusion-row">
    <div class="fusion-columns fusion-columns-3 fusion-widget-area">

      <!-- COLUMN 1: Footer menu 1 + "MAKE A SECURE PAYMENT" button -->
      <div class="fusion-column col-lg-4 col-md-4 col-sm-4">
        <section id="avada-vertical-menu-widget-2" class="fusion-footer-widget-column widget avada_vertical_menu">
          <nav id="fusion-vertical-menu-widget-avada-vertical-menu-widget-2-nav"
               class="fusion-vertical-menu-widget fusion-menu hover right no-border"
               aria-label="Secondary Navigation: ">
            <ul id="menu-footer-1" class="menu">
              <li><a href=".../menus/"><span class="link-text"> catering menus</span></a></li>
              <li><a href=".../venues/"><span class="link-text"> atlanta venues</span></a></li>
              <li><a href=".../atlanta-wedding-catering/"><span class="link-text"> atlanta wedding catering</span></a></li>
              <li><a href=".../best-bbq-catering-atlanta-north-georgia/"><span class="link-text"> barbecue catering</span></a></li>
              <li><a href=".../atlanta-catering-casual/"><span class="link-text"> in-home catering</span></a></li>
              <li><a href=".../mitzvah-catering/"><span class="link-text"> Mitzvah Catering</span></a></li>
              <li><a href=".../atlanta-corporate-catering/"><span class="link-text"> atlanta corporate catering</span></a></li>
              <li><a href=".../atlanta-tv-and-film-industry-catering/"><span class="link-text"> tv &amp; film catering</span></a></li>
            </ul>
          </nav>
        </section>
        <section id="custom_html-3" class="widget_text fusion-footer-widget-column widget widget_custom_html">
          <div class="textwidget custom-html-widget">
            <div style="text-align:right;">
              <a class="fusion-button button-flat ... button-21 ..."
                 style="--button_accent_color:#ffffff;
                        --button_gradient_top_color:#8c0b05;
                        --button_gradient_bottom_color:#8c0b05;
                        --button_gradient_top_color_hover:#6b0202;
                        --button_gradient_bottom_color_hover:#6b0202;"
                 target="_blank" rel="noopener noreferrer"
                 href="https://form.jotform.co/80806188542865">
                <span class="fusion-button-text awb-button__text awb-button__text--default">MAKE A SECURE PAYMENT</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <!-- COLUMN 2: Logo + address + email + phone + social icons -->
      <div class="fusion-column col-lg-4 col-md-4 col-sm-4">
        <section id="media_image-3" class="fusion-footer-widget-column widget widget_media_image">
          <img width="300" height="66"
               src="https://talkofthetownatlanta.com/wp-content/uploads/2019/02/t-t-logo-300x66.png"
               class="image wp-image-2396 attachment-medium size-medium"
               alt="" style="max-width: 100%; height: auto;"
               srcset="https://talkofthetownatlanta.com/wp-content/uploads/2019/02/t-t-logo-200x44.png 200w,
                       https://talkofthetownatlanta.com/wp-content/uploads/2019/02/t-t-logo-300x66.png 300w,
                       https://talkofthetownatlanta.com/wp-content/uploads/2019/02/t-t-logo-400x89.png 400w,
                       https://talkofthetownatlanta.com/wp-content/uploads/2019/02/t-t-logo.png 470w">
        </section>
        <section id="custom_html-2" class="widget_text fusion-footer-widget-column widget widget_custom_html">
          <div class="textwidget custom-html-widget">
            <p>2469 Canton Rd<br>Marietta, GA. 30066</p>
            <p><a href="mailto:andrew@TOTTAtl.com">andrew@TOTTAtl.com</a></p>
            <h3 data-fontsize="18" style="--fontSize: 18; line-height: 1.5; --minFontSize: 18;"
                data-lineheight="27px" class="fusion-responsive-typography-calculated">
              <a href="tel:+14043344935">404-334-4935</a>
            </h3>
          </div>
        </section>
        <section id="social_links-widget-2" class="fusion-footer-widget-column widget social_links">
          <div class="fusion-social-networks">
            <div class="fusion-social-networks-wrapper">
              <a class="fusion-social-network-icon fusion-tooltip fusion-facebook awb-icon-facebook"
                 href="https://www.facebook.com/TalkoftheTownCateringandSpecialEvents/"
                 title="Facebook" style="font-size:16px;color:#333333;"></a>
              <a class="fusion-social-network-icon fusion-tooltip fusion-twitter awb-icon-twitter"
                 href="https://twitter.com/TalkoftheTownGA"
                 title="Twitter" style="font-size:16px;color:#333333;"></a>
              <a class="fusion-social-network-icon fusion-tooltip fusion-instagram awb-icon-instagram"
                 href="https://www.instagram.com/tott_catering/"
                 title="Instagram" style="font-size:16px;color:#333333;"></a>
              <a class="fusion-social-network-icon fusion-tooltip fusion-mail awb-icon-mail"
                 href="mailto:andrew@tottalt.com"
                 title="Mail" style="font-size:16px;color:#333333;"></a>
            </div>
          </div>
        </section>
      </div>

      <!-- COLUMN 3: Footer menu 2 + "CONTACT TOTT" button -->
      <div class="fusion-column fusion-column-last col-lg-4 col-md-4 col-sm-4">
        <section id="avada-vertical-menu-widget-3" class="fusion-footer-widget-column widget avada_vertical_menu">
          <nav id="fusion-vertical-menu-widget-avada-vertical-menu-widget-3-nav"
               class="fusion-vertical-menu-widget fusion-menu hover left no-border">
            <ul id="menu-footer-2" class="menu">
              <li><a href="https://talkofthetownatlanta.com/" aria-current="page"><span class="link-text"> home</span></a></li>
              <li><a href=".../gallery/"><span class="link-text"> gallery</span></a></li>
              <li><a href=".../contact/"><span class="link-text"> contact</span></a></li>
              <li><a href=".../wedding-special-event-providers-links/"><span class="link-text"> partners</span></a></li>
              <li><a href=".../about-atlanta-caterer-talk-of-the-town/community/"><span class="link-text"> community</span></a></li>
              <li><a href=".../about-atlanta-caterer-talk-of-the-town/georgia-grown/"><span class="link-text"> georgia grown</span></a></li>
              <li><a href=".../about-atlanta-caterer-talk-of-the-town/our-culinary-philosophy/"><span class="link-text"> culinary philosophy</span></a></li>
              <li><a href=".../video-blog/"><span class="link-text"> vblog</span></a></li>
            </ul>
          </nav>
        </section>
        <section id="custom_html-4" class="widget_text fusion-footer-widget-column widget widget_custom_html">
          <div class="textwidget custom-html-widget">
            <div style="text-align:left;">
              <a class="fusion-button button-flat ... button-22 ..."
                 style="--button_accent_color:#ffffff;
                        --button_gradient_top_color:#8c0b05;
                        --button_gradient_bottom_color:#8c0b05;
                        --button_gradient_top_color_hover:#6b0202;
                        --button_gradient_bottom_color_hover:#6b0202;"
                 target="_blank" rel="noopener noreferrer"
                 href="https://talkofthetownatlanta.com/contact/">
                <span class="fusion-button-text awb-button__text awb-button__text--default">CONTACT TOTT</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <div class="fusion-clearfix"></div>
    </div>
  </div>
</footer>
```

### Footer 2 — Copyright bar (line 671)
```html
<footer id="footer" class="fusion-footer-copyright-area fusion-footer-copyright-center">
  <div class="fusion-row">
    <div class="fusion-copyright-content">
      <div class="fusion-copyright-notice" style="padding-bottom: 0px;">
        <div>
          Copyright 2025 Talk of the Town | All Rights Reserved |
          Designed by <a href="www.interactivemarketing.net">Interactive Marketing</a> |
          <a href="https://talkofthetownatlanta.com/privacy-policy/">Privacy Policy</a>
        </div>
      </div>
      <div class="fusion-social-links-footer" style="display: none;"></div>
    </div>
  </div>
</footer>
```

### Footer summary
- **3-column** widget layout (col-lg-4 / col-md-4 / col-sm-4).
- Column 1: vertical footer menu (8 items: catering menus, atlanta venues, atlanta wedding catering, barbecue catering, in-home catering, Mitzvah Catering, atlanta corporate catering, tv & film catering) + burgundy CTA button "MAKE A SECURE PAYMENT" → external JotForm.
- Column 2: footer logo (t-t-logo-300x66.png), physical address (2469 Canton Rd, Marietta, GA. 30066), email andrew@TOTTAtl.com, phone 404-334-4935 (linked as `tel:+14043344935`), social icons (Facebook, Twitter, Instagram, Mail) at 16 px, color `#333333`.
- Column 3: vertical footer menu 2 (8 items: home, gallery, contact, partners, community, georgia grown, culinary philosophy, vblog) + burgundy CTA button "CONTACT TOTT" → /contact/.
- Footer 2: single-line copyright notice "Copyright 2025 Talk of the Town | All Rights Reserved | Designed by Interactive Marketing | Privacy Policy".

### Contact info
- **Address**: 2469 Canton Rd, Marietta, GA. 30066
- **Email**: andrew@TOTTAtl.com (alt: andrew@tottalt.com for mail social link)
- **Phone**: 404-334-4935
- **Social**: Facebook https://www.facebook.com/TalkoftheTownCateringandSpecialEvents/ · Twitter @TalkoftheTownGA · Instagram @tott_catering

---

## 10. 404 PAGE NOTES (talkofthetown-404.json)

- URL: `https://talkofthetownatlanta.com/404`
- Title: "404 Error, content does not exist anymore - Talk of the Town Catering"
- H1: `ERROR 404 – NOT FOUND` (inline style: `text-align: center; font-family: open-sans, arial; color: rgb(68, 68, 68); font-size: 60px; padding: 50px;`)
- Has a `wpcf7` contact form with submit button "GET ACCESS TO OUR MENUS" (lead-gen form for menu PDF).
- 404 page renders the SAME `<header>` (with full main nav + phone button) but NO hero slider.
- 404 page does NOT load Google Fonts (no SR7 module on 404 → no Prata / Nothing You Could Do / Lato).

---

## 11. EXTERNAL SCRIPTS LOADED

| Host | Count | Purpose |
|---|---|---|
| talkofthetownatlanta.com (self-hosted WP) | 10 | Avada JS, fusion-scripts, SR7 plugin JS, WP emoji |
| www.googletagmanager.com | 2 | GTM (analytics) |
| www.google-analytics.com | 1 | GA |
| www.gstatic.com | 1 | Google Fonts static |
| static.alliai.com | 1 | Alli AI (?) |
| www.google.com | 1 | (recaptcha / maps?) |
| js.callrail.com | 1 | CallRail call-tracking (dynamic phone swap) |

22 external scripts total.

---

## 12. KEY TAKEAWAYS FOR THE NEWSITE GRAFT

1. **Header structure**: hero is rendered FIRST (in `#sliders-container`), then `<header>` is BELOW it. Menu IS at the bottom of the hero. Header is sticky (`fusion-sticky-menu-1`) and includes a phone CTA as the last menu item styled as a button.
2. **Hero**: Slider Revolution `<sr7-module data-alias="hero-2">`, full-height (1280 px), background image `hero-2.jpg` (no video), overlay white logo + decorative 5 px white border + script text "bacon & bluecheese tartlet" in Nothing You Could Do font (24 px white). SR7 layer animations use `power3.inOut` easing with char-by-char text reveal.
3. **Fonts (3 total)**: **Prata** (display serif), **Nothing You Could Do** (script accent), **Lato** (body) — all weight 400 only, all from Google Fonts. Loaded only when an SR7 module is present.
4. **Color palette**: Burgundy `#8B1F1C` / `#8C0B05` / `#6B0202` (primary brand + button gradients + hover) · Olive green `#A0CE4E` (Avada accent 4, used sparingly) · Cream `#F1EAE0` (section bg) · Off-white `#F6F6F6` · Light gray `#E0DEDE` · Medium gray `#747474` · Dark gray `#333333`.
5. **Parallax**: 16 sections use CSS `background-attachment: fixed` with `cover` size for parallax effect on `square-background-beige-1.jpg`, `logo-background-1.jpg`, `Olivetrees.jpg`, `North-on-5th.png`, `mobile-background-1-1.png`, `mobile-background-2-4.png`.
6. **Scroll animations**: Avada `fusion-animated` class with `data-animationtype="fadeInLeft"` on 41 elements, durations 0.3s / 0.9s / 0.6s / 0.7s, trigger offset `top-into-view`.
7. **Testimonial carousel**: SR7 module with 12 real testimonials (12 names + dates June 2024 → Nov 2023), each slide using grey-block.png as bg placeholder, fonts Prata + Lato + Nothing You Could Do.
8. **No video** anywhere on the site — purely photographic.
9. **Site footer**: 3-column with two footer menus + center column (logo/address/phone/social). Burgundy `#8C0B05` CTA buttons "MAKE A SECURE PAYMENT" (external JotForm) and "CONTACT TOTT" (internal /contact/).
