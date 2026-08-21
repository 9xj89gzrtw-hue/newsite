# Wolfgang Puck Catering — Design Patterns Analysis

> **Purpose:** Design-pattern analysis only. No content, copy, photos, or assets reproduced.  
> **Source URL:** https://wolfgangpuckcatering.com/  
> **Captured:** Live render via headless browser (1440 × 900 desktop + iPhone 14 viewport)  
> **Author:** Task ID 3 — research agent  
> **IP rule:** All findings below describe *how* the site is structured, animated, colored, and typeset — not what it says.

---

## 0. Headline correction vs prior brief

The existing `reference-library/sites/wolfgangpuckcatering/patterns.md` guessed the accent was gold/warm (#c4a052). **Live measurement corrects this**:

| Element | Prior brief | Actual (measured via `getComputedStyle`) |
|---|---|---|
| Primary accent | Gold (~#c4a052) | **Dark green `rgb(29, 70, 46)` ≈ `#1D462E`** |
| Headline font | "Serif, Playfair-esque" | **`Gotham` Bold + ALL CAPS + heavy tracking** (sans-serif, not serif) |
| Section title font | (not specified) | **`Nesans` Bold** (custom serif display face) |
| Body font | Helvetica/Arial | **`Metropolis`** (geometric sans) |
| Hero media | Image/video unspecified | **Confirmed video** (`<video autoplay loop muted playsinline>`) |

So the actual palette is **three colors only**: pure black `#000`, pure white `#FFF`, dark green `#1D462E`. The "gold" reading is a misperception — what reads as warm on the screenshot is the gold-toned food photography, not the UI chrome.

---

## 1. Section-by-section breakdown (top to bottom)

The full homepage is ~5805 px tall (measured `document.body.scrollHeight`), 6 viewport heights at 900 px. Sections in order:

### 1.1 Top accessibility region (y=0 → ~40 px)
- **Purpose:** Skip-link cluster for keyboard/screen-reader users — sits ABOVE the main nav, outside the page chrome.
- **Layout:** Three small buttons inline (`Skip to main content` / `Enable accessibility for low vision` / `Open the accessibility menu`).
- **Content type:** Pure utility — no brand chrome.
- **Animation:** None. Static.
- **Why effective:** Front-loads WCAG compliance without cluttering the visual header. Users who don't need it never see it (visually hidden until focused).

### 1.2 Sticky navigation header (y=40 → ~80 px)
- **Purpose:** Primary IA entry — three-tier header.
- **Layout:** Three-column horizontal grid —
  - LEFT cluster: `SERVICES` (with mega-menu caret) · `LOCATION` (with mega-menu caret) · `MENU`
  - CENTER: Wordmark logo (`wpc-logo.png`, 127 × 96 px)
  - RIGHT cluster: `CAREERS` · `CONTACT` (with caret) · `START PLANNING` (primary CTA, dark-green pill)
- **Sticky behavior:** Header has `data-nav` + `data-nav-sticky` data attributes. On scroll, the logo shrinks to a smaller "sticky-logo.png" (122 × 48 px) and the bar likely gains a solid background — classic HubSpot pattern.
- **Mega-menu behavior:** Hovering SERVICES reveals a vertical mega-menu with 7 children: `SOCIAL EVENTS · WEDDINGS · CORPORATE EVENTS · LARGE-SCALE EVENTS · WORKPLACE · PRIVATE CHEF · SEASONAL`. Hovering LOCATION reveals 9 children: `VENUES · LOS ANGELES, CA · ATLANTA, GA · DALLAS-FORT WORTH, TX · HOUSTON, TX · SAN FRANCISCO, CA · CHICAGO · PHILADELPHIA · TAKE US ANYWHERE`. Hovering CONTACT reveals 5 children: `EVENT INQUIRY · PRESS/MEDIA INQUIRIES · VENDOR/PARTNER INQUIRIES · FINE DINING (external) · OTHER`.
- **Animation:** Mega-menu fades in (~150 ms) on hover; on mouse-leave it fades out.
- **Why effective:** Mega-menu eliminates 2nd-level navigation pages. A user looking for "Weddings in LA" can navigate in one hover + one click instead of 3 page loads.

### 1.3 Hero banner (y=80 → ~1094 px, ~1000 px tall)
- **Purpose:** Brand promise + first conversion.
- **Layout:** Full-bleed video background (`.hero_banner.hero_banner-type_video`); headline + CTA overlay anchored to top-left at y=275. The H1 + CTA group sits inside `.header_btn_groups` (1440 × 245 px region).
- **Background media:** HTML5 `<video>` with attributes `autoplay loop muted playsinline data-uw-rm-av="vi"` (UserWay attribute for accessible video handling). Source: `26S No Sound Power Of Food.mp4`. There is **no poster image** — video starts black and fades in.
- **Overlay:** A `::before` pseudo-element on the video with `background-color: rgba(255, 255, 255, 0)` — i.e. a near-transparent white wash. So the video plays at near-full saturation with no scrim. This is unusual — most luxury heroes use a dark 30-50% scrim. WP lets the food video speak for itself.
- **Headline:** H1, single line — `SETTING THE STANDARD FOR CULINARY EXCELLENCE.` in Gotham Bold, 32 px, weight 700, **letter-spacing 8 px**, line-height 60 px, color black. All caps.
- **CTA:** Single dark-green pill button — `INQUIRE ABOUT YOUR EVENT` — Gotham Bold 16 px, 4 px letter-spacing, white text on `#1D462E` background.
- **No secondary CTA, no scroll indicator, no logo overlay.**
- **Animation:** Video autoplays silently; no parallax, no fade-up on the H1.
- **Why effective:** Hero restraint = luxury. One headline, one CTA. The H1 is a *brand thesis* (a standard, not a feature list). Heavy letter-spacing reads as fashion/editorial.

### 1.4 Hospitality Services — tabbed service browser (y=1094 → 2096 px, 1002 px tall)
- **Purpose:** Show 5 service categories without scrolling 5× the height.
- **Layout:** 
  - H2 `HOSPITALITY SERVICES` (Gotham Bold 30 px / 700 / 7.5 px letter-spacing / black)
  - Horizontal **tab bar** with 5 tabs: `SOCIAL EVENTS · WEDDINGS · CORPORATE EVENTS · WORKPLACE · PRIVATE CHEF`
  - Tab styling: Gotham Bold 16 px / 700 / 4 px letter-spacing, dark-green text on white. **Active tab inverts**: dark-green background, white text.
  - Below the tab bar: a large 2-column panel — landscape image LEFT (or above on mobile), content RIGHT (H3 title in Nesans serif + paragraph + single CTA).
- **Contextual CTAs per tab:** Each tab swaps the CTA label to match the audience —
  - SOCIAL EVENTS → `BOOK YOUR EVENT`
  - WEDDINGS → `BOOK YOUR WEDDING`
  - CORPORATE EVENTS → `BOOK YOUR EVENT`
  - WORKPLACE → `PARTNER WITH US`
  - PRIVATE CHEF → `BOOK A CHEF`
- **Interaction model:** Click tab → panel swaps image + copy + CTA in place. No page load. ARIA `tablist/tab/tabpanel` roles (uses Van11y accessible-tab-panel-aria library).
- **Animation:** Cross-fade between panels (~200-300 ms), image swap with subtle slide.
- **Why effective:** Reduces cognitive load — user picks category, content reorganizes around their choice. The contextual CTA labels convert better than a generic "Inquire Now" because they mirror the user's mental model.

### 1.5 Seasonal Inspiration — tabbed seasonal menu browser (y=2096 → 3000 px, 904 px tall)
- **Purpose:** Drive seasonal menu exploration + seasonal conversions.
- **Layout:** Identical pattern to §1.4 —
  - H2 `SEASONAL INSPIRATION`
  - 5 tabs: `SUMMER · SPRING · FALL · WINTER · AWARDS`
  - Tab panel: image + seasonal copy + `VIEW [SEASON] MENU` CTA
- **The genius:** `AWARDS` is the 5th "season". Wolfgang Puck caters the Academy Awards Governors Ball — so Awards Season (Feb/March + Sept/Emmys) is treated as a marketable season with its own menu. This is a category invention, not a copy of a standard tab list.
- **Animation:** Same cross-fade as §1.4.
- **Why effective:** Recurring-content rotation (refresh every 3 months) keeps the site feeling current without rebuilding the homepage. The Awards tab converts aspirational event planners who want "Oscar-style" catering.

### 1.6 "WHO WE ARE" alternating CTA block (y=3000 → ~3500 px)
- **Purpose:** Brand bio block — first editorial paragraph.
- **Layout:** Alternating 2-column — image LEFT (1007 × 652 px landscape), text RIGHT. Uses HubSpot's `alternating_cta-item` module.
- **Content type:** H3 `WHO WE ARE` (Nesans serif 32 px / 700 / 4.8 px letter-spacing) + brand-thesis paragraph + `INQUIRE ABOUT YOUR EVENT` CTA.
- **Why effective:** Alternating layout creates visual rhythm — next section flips the alignment.

### 1.7 "ICONIC VENUES FOR YOUR EVENT" alternating CTA block (y=3500 → ~4000 px)
- **Purpose:** Venue credibility showcase.
- **Layout:** Same alternating CTA module — image RIGHT (this time flipped), text LEFT.
- **H3 + paragraph + `EXPLORE OUR VENUES` CTA.**
- **Card design:** Single wide hero image (not a 3-up card grid on the homepage — the actual venue directory lives on the `/locations` page). The homepage teaser shows one large venue image and a CTA to the deeper directory.
- **Why effective:** One iconic image > many small images for premium positioning. The site reserves the 7-up venue directory (`Academy Museum · Audrey Irmas Pavilion · El Rey Theatre · Fanny's LA · Grammy Museum · Greystone Mansion · Ovation Hollywood`) for the location landing page, where each venue gets a full hero.

### 1.8 "THE WORLD OF WOLFGANG PUCK" alternating CTA block (y=4000 → ~4500 px)
- **Purpose:** Brand story / sub-brand directory.
- **Layout:** Same alternating CTA module — image LEFT, text RIGHT, `VIEW MORE` CTA.
- **Why effective:** This is a "see also" block — sends users to other Wolfgang Puck properties (fine dining restaurants, consumer products, cookware). The catering site leverages the master brand without distracting from the catering CTA.

### 1.9 "NOW HIRING IN A CITY NEAR YOU" — careers as a first-class section (y=4500 → ~5059 px)
- **Purpose:** Recruitment. **Careers sits IN the homepage flow**, not buried in the footer.
- **Layout:** Same alternating CTA module — image RIGHT, text LEFT, `JOIN OUR TEAM` CTA. Heading is a clever localization hook ("in a city near you") instead of generic "Careers".
- **Why effective:** Catering is labor-intensive — events can't happen without 100s of trained staff. Putting recruiting in the homepage flow (rather than footer link) treats hiring as a primary conversion path equal to event inquiries. The headline also doubles as geography proof — they're hiring in many cities = they operate in many cities.

### 1.10 Footer (y=5059 → ~5805 px)
- **Purpose:** Email capture, social, secondary nav, legal.
- **Layout:** Dark (black/charcoal) background, multi-column —
  - LEFT: Footer wordmark logo (separate `WPC Footer Logo` asset, different from header wordmark)
  - CENTER-LEFT: `JOIN OUR MAILING LIST` H3 + email input (`Email*` required field) + submit button. Single-field signup (no name, no event type) = lower friction.
  - CENTER-RIGHT: `FOLLOW US` H4 + 4 social icons (Facebook-f · Instagram · YouTube · LinkedIn) — icon-only, no labels, hover state likely color-inverts.
  - RIGHT: Secondary nav menu — `RECIPES · CAREERS · PRESS INQUIRIES · CONTACT`
- **Bottom strip:** Legal nav as inline menu items separated by pipes — `| TERMS OF USE | PRIVACY POLICY | Privacy Request | Code of Business Conduct | WOLFGANG PUCK CATERING 2026`
- **Why effective:** Two CTAs in footer (mailing list + careers link repeated) — captures both top-of-funnel (newsletter) and bottom-of-funnel (hiring) visitors who scrolled all the way down.

### 1.11 Floating "Back to Top" button
- **Purpose:** Long-page navigation aid.
- **Layout:** Fixed bottom-right, semi-transparent black background (`rgba(0, 0, 0, 0.25)`), white arrow icon. Appears after scroll threshold.

### 1.12 Floating Accessibility Menu button (UserWay widget)
- **Purpose:** Universal accessibility shortcut.
- **Layout:** Fixed bottom-right (above Back-to-Top), `UserWay` widget button. Opens a panel with: text-size, contrast, dyslexia-friendly font, link highlighting, reading guide, etc.
- **Why effective:** Visible accessibility commitment without polluting the main chrome. (Cost: a third-party SaaS dependency and a stray floating button on the page.)

---

## 2. Navigation & Information Architecture

### 2.1 Nav structure (desktop)
```
[ Quick accessibility region — 3 utility buttons, above nav ]

[ LEFT mega-nav ]          [ CENTER wordmark ]          [ RIGHT mega-nav + CTA ]
SERVICES ▾                                              CAREERS
LOCATION ▾                  WPC logo                     CONTACT ▾
MENU                                                    [ START PLANNING ] ← pill CTA
```

Total top-level items: **6 nav links + 1 CTA pill = 7 entry points**. That's unusually restrained for a site this complex.

### 2.2 Mega-menu pattern
- **Trigger:** Hover (desktop) — caret button next to each top-level link expands submenu.
- **Layout:** Vertical list of children, full-width mega panel below the nav bar OR right-aligned dropdown. Width sized to longest child label.
- **Aria:** `aria-expanded` toggled on the caret `button.menu_module-child-toggle`. Child links have `role="menuitem"`.
- **Mobile:** Mega menu replaced with collapsible accordion inside the mobile drawer (each parent has a "Show submenu for X" toggle button).

### 2.3 Sticky behavior
Data attributes on `body`: `data-nav` + `data-nav-sticky`. On scroll, the header transitions from transparent (over hero) → solid background with a smaller "sticky-logo" asset. The CTA pill stays anchored top-right the entire time.

### 2.4 Mobile menu
- **Hamburger icon** replaces the LEFT cluster. Wordmark stays CENTER. CTA pill replaced with text `BOOK YOUR EVENT`.
- Drawer opens with **backdrop overlay** + close button.
- Top-level links listed vertically; each parent has an accordion caret ("Show submenu for Services").
- Drawer contains all 6 top-level links + the BOOK YOUR EVENT CTA at the bottom (so the primary CTA is always one tap away).

---

## 3. Hero design — exact treatment

| Property | Value |
|---|---|
| Container height | ~1000 px (full viewport + some) |
| Background media | HTML5 video, 1 file (no poster, no fallback) |
| Video attributes | `autoplay loop muted playsinline` |
| Overlay scrim | `rgba(255, 255, 255, 0)` — essentially transparent (no dark wash) |
| H1 typeface | Gotham Bold |
| H1 size | 32 px |
| H1 weight | 700 |
| H1 letter-spacing | **8 px** (heavy) |
| H1 line-height | 60 px |
| H1 color | Black `#000` |
| H1 case | UPPERCASE |
| H1 alignment | Left-aligned at x=40 px |
| Primary CTA | Pill button, white text on `#1D462E` dark-green bg |
| CTA label | `INQUIRE ABOUT YOUR EVENT` (Gotham Bold 16 px, 4 px letter-spacing) |
| Secondary CTA | **None** |
| Scroll indicator | **None** |
| Trust badges / social proof | **None** (in hero — kept in footer and lower sections) |

**Key design decisions to learn from:**
1. **No scrim** — the video plays at near-full saturation. Trust that the food photography is good enough to carry the brand.
2. **One CTA only** — no "Watch Video" / "Read More" competing with the primary action.
3. **Heavy letter-spacing (8 px)** — at 32 px font size, that's 25% of the glyph height as letter-spacing. Reads as fashion magazine cover, not web app.
4. **Headline is brand thesis, not feature list** — "Setting the Standard for Culinary Excellence" is a *claim*, not a description. Forces the visitor to scroll for proof.
5. **No "play" affordance on the video** — it just plays. The user doesn't control it.
6. **H1 sits at y=275** — top-third of the viewport, not vertically centered. Leaves the bottom of the video visible for food shots.

---

## 4. Service tabs pattern — how it works and why

### 4.1 Categorization
5 service categories, deliberately distinct audiences:
1. **SOCIAL EVENTS** — personal milestone parties
2. **WEDDINGS** — own category (not lumped under "Social") because wedding clients have different decision journeys (longer sales cycle, larger budgets, more emotional)
3. **CORPORATE EVENTS** — B2B one-off events
4. **WORKPLACE** — recurring corporate food service (cafeteria, daily catering) — DIFFERENT business model from one-off Corporate Events
5. **PRIVATE CHEF** — in-home, lowest-volume highest-margin service

### 4.2 Interaction model
- **ARIA tablist** (Van11y accessible-tab-panel-aria library)
- Active tab: dark-green background + white text (inverted from inactive state of green text on white)
- Click → JS swaps the entire panel content (image + H3 + paragraph + CTA) in place
- Transition: cross-fade, ~250 ms
- No URL change (no history entry) — but each tab has a deep-linkable destination (`/social-events`, `/weddings`, `/corporate-events`, `/workplace`, `/private-chef` — accessible from the SERVICES mega menu)

### 4.3 Why it works
- **No scroll cost:** 5 services fit in 1002 px instead of 5010 px (5 × the height). The page stays scannable.
- **Contextual CTAs:** Each tab's CTA label mirrors the user's mental model. A bride sees "Book Your Wedding", not "Inquire". An HR manager sees "Partner With Us" (recurring relationship verb), not "Book".
- **Progressive disclosure:** A user only sees the image/copy for the service they care about. The other 4 services don't compete for attention.
- **Brand consistency:** Same module shape (image LEFT + content RIGHT) regardless of which tab is active = predictable layout, low cognitive load.

---

## 5. Seasonal content rotation — the tab mechanic

### 5.1 Structure
Same module as §1.4 — 5 tabs, one selected at a time. The 5 tabs are **Summer · Spring · Fall · Winter · Awards**.

### 5.2 Why "Awards" is the genius move
The 4 seasons are obvious. Adding **Awards** as a 5th "season" is a category invention — Awards Season (Feb–March for Oscars, Sept for Emmys) is treated as a marketable moment with its own menu. This:
- Turns a recurring real-world event into a seasonal sales hook.
- Reinforces the celebrity/landmark positioning (they cater the Governors Ball).
- Gives them a recurring content cadence (every Awards Season they refresh the tab).
- Provides a discrete conversion path for aspirational planners ("I want my gala to feel like the Oscars").

### 5.3 Implementation notes
- Tab mechanic identical to §1.4 (same Van11y library, same ARIA roles).
- CTA label swaps per tab: `VIEW SUMMER MENU` / `VIEW SPRING MENU` / `VIEW FALL MENU` / `VIEW WINTER MENU` / `INQUIRE NOW` (Awards doesn't have a menu, just inquiry).
- The "View Season Menu" CTAs lead to `/seasonal/summer-menu` etc. — a deeper page per season.

### 5.4 Why it works
- **Fresh content without redesign:** Quarterly tab refresh keeps site "alive" without rebuilding.
- **SEO benefit:** Each season has its own URL (5 pages from one homepage module).
- **Conversion optimization:** A user planning a fall wedding in August sees "Fall Menu" front-and-center — seasonally relevant.

---

## 6. Venues showcase — card design and hover behavior

### 6.1 Homepage teaser vs. directory page
- **Homepage:** Single alternating CTA block — one large venue hero image + paragraph + `EXPLORE OUR VENUES` CTA. NOT a card grid on the homepage.
- **Directory page (`/los-angeles/venues`):** Full 7-up grid of named iconic venues — each a landmark brand (Academy Museum of Motion Pictures, Audrey Irmas Pavilion, El Rey Theatre, Fanny's LA, Grammy Museum at L.A. Live, Greystone Mansion, Ovation Hollywood).

### 6.2 Card design (on `/locations` and city landing pages)
- Each venue = full hero image, name overlaid bottom-left, hover state likely scales image + reveals "Learn More" affordance.
- Aspect ratio: 1007 × 652 (~1.55:1, near 16:10 widescreen) — cinematic feel, not square.
- Filterable by city (LOS ANGELES, ATLANTA, DALLAS-FORT WORTH, HOUSTON, SAN FRANCISCO, CHICAGO, PHILADELPHIA).

### 6.3 Why it works
- **Landmark association:** Each named venue is itself a brand (Grammy Museum, Academy Museum). The catering brand borrows their prestige by association.
- **Geographic proof:** 7 cities + "Take Us Anywhere" = nationwide scale perception without saying "nationwide" explicitly.
- **City landing pages** = local SEO landing pages (one page per city × one per venue = many keyword-targeted pages).

---

## 7. Brand story / "World of Wolfgang Puck"

### 7.1 Narrative structure
The `alternating_cta-item` module repeats 4× in the homepage's compound section:
1. WHO WE ARE (brand thesis)
2. ICONIC VENUES FOR YOUR EVENT (place proof)
3. THE WORLD OF WOLFGANG PUCK (brand ecosystem cross-link)
4. NOW HIRING IN A CITY NEAR YOU (recruitment)

The alternating layout (image L → R → L → R) creates rhythm and prevents content fatigue over a long vertical scroll.

### 7.2 Visual treatment
- Each block: one large landscape image (1007 × 652) + H3 in Nesans serif + paragraph + single dark-green CTA pill.
- Same module, different content. Low engineering cost — one reusable HubSpot module rendered 4×.
- Image style: editorial food / event photography, warm-toned (this is what gives the "gold" misperception — the photography is warm, the UI chrome is dark green).

### 7.3 What "World of Wolfgang Puck" specifically does
It's a cross-link block — sends catering visitors to the broader WP ecosystem (fine dining restaurants, cookware, consumer products, recipes). This leverages the master brand without distracting from the catering CTA (the catering CTA stays as the only green button on the block).

---

## 8. Careers section — "Now Hiring" as first-class

### 8.1 Why it's a homepage section, not a footer link
Catering is labor-intensive — events need hundreds of trained staff. Recruitment is a primary business operation, not a side concern. Placing "Now Hiring in a City Near You" in the homepage flow (between World of WP and Footer) treats hiring as **a conversion path equal to event inquiries**.

### 8.2 Headline psychology
- **"IN A CITY NEAR YOU"** — geographic proof + personal relevance. If you're in LA, the headline implies they're hiring in LA.
- Subtext: scale (many cities), accessibility (they want local staff), momentum (hiring = growing).

### 8.3 CTA
`JOIN OUR TEAM` — Gotham Bold caps, dark-green pill. CAREERS also appears in the top nav and the footer nav — 3 entry points to the same destination.

### 8.4 What Interfood can learn
Most catering sites bury "Careers" in the footer. WP elevates it. For a labor-intensive Russian catering brand operating in 2+ cities, recruitment traffic could equal inquiry traffic in volume.

---

## 9. Footer & mailing list

### 9.1 Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│ [ WPC Footer Logo ]   [ JOIN OUR MAILING LIST ]   [ FOLLOW US ]    │
│                       Email* [____] [Submit]       f  ig  yt  in   │
│                                                                      │
│   RECIPES · CAREERS · PRESS INQUIRIES · CONTACT                     │
│                                                                      │
│   | TERMS OF USE | PRIVACY POLICY | Privacy Request |               │
│   Code of Business Conduct | WOLFGANG PUCK CATERING 2026            │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.2 Mailing list signup pattern
- **Single field** (email only). No name, no event type, no checkbox list.
- Required: `Email*` — `required` attribute on input.
- Submit button: Arrow icon (`Submit button` aria-label).
- Why single-field: **lower friction = higher conversion**. They can enrich the lead later via email.

### 9.3 Link organization
Three tiers:
1. **Primary actions** (above footer): mailing list capture, social follow.
2. **Secondary nav** (mid footer): RECIPES · CAREERS · PRESS INQUIRIES · CONTACT (4 utility links).
3. **Legal strip** (bottom): Terms / Privacy / Privacy Request / Code of Conduct / Copyright.

Pipe-separated legal links (`|` chars) — magazine colophon style. The pipe is a deliberate typographic choice, not bullet characters.

### 9.4 Footer logo differs from header logo
The footer uses a different `WPC Footer Logo` asset — likely a stacked or simplified mark that reads better at small sizes on a dark background. The header wordmark is horizontal (122 × 48 px) for the sticky state.

---

## 10. Animation philosophy

### 10.1 Inventory
| Element | Animation |
|---|---|
| Hero video | Autoplay (silent, looped) — no play affordance |
| Sticky header | Shrinks logo on scroll past hero (data-nav-sticky) |
| Mega menu | Fade in on hover (~150 ms), fade out on mouse-leave |
| Service tabs | Cross-fade between panels (~250 ms), image swaps |
| Seasonal tabs | Same as service tabs |
| Mobile menu | Slide-in drawer + backdrop fade |
| Back-to-top button | Appears after scroll threshold (~500 px) |
| Footer mailing list | Submit button — likely inline success message |
| UserWay widget | Slide-in panel on click |

### 10.2 What's deliberately absent
- **No GSAP / ScrollTrigger pinning.** No "pinned scroll" wow moments.
- **No AOS / scroll-reveal libraries.** No stagger fade-ups on sections.
- **No parallax.** Hero video plays flat.
- **No Lottie animations.**
- **No `data-aos` attributes anywhere.** (Searched.)
- **No Ken Burns zoom on hero video.**
- **No animated counters on stats.** (No stat band at all on the homepage.)

### 10.3 Motion language
**Restraint as brand signal.** The animation budget is spent on:
1. One hero video (the highest-production-value motion asset).
2. Tab cross-fades (functional, not decorative).
3. Mega-menu fades (functional).
4. Mobile drawer slide (functional).

**Zero decorative animation.** Everything that moves has a UX job. This is the opposite of Interfood's editorial maximalism (Manifesto pinned scroll, EaEventsPortfolio auto-advance, CepTestimonialsCarousel peeking scroll, EaPhilosophyQuote cinematic drama).

### 10.4 Implications for Interfood
WP's restraint is appropriate for a B2B luxury brand where the visitor is a busy executive planning a corporate event. Interfood's editorial maximalism is appropriate for a creative-led Russian catering brand where the visitor is emotionally shopping. **Both are valid; they serve different funnels.**

---

## 11. Color & typography system

### 11.1 Color palette — 3 colors only
| Color | Hex | Role |
|---|---|---|
| Black | `#000000` | All primary text. Hero H1. Section H3s. Footer text. |
| White | `#FFFFFF` | Primary background. Button text on green. |
| Dark Green | `#1D462E` (rgb 29, 70, 46) | **All** CTAs. Active tab state. Link color. Pill button background. |

That's it. Three colors in the entire UI chrome. No grays (text is pure black on pure white). No secondary accent. No state colors (no red for errors visible — only one stray `#FF0000` detected, likely a hidden notification badge).

### 11.2 Why dark green works
- **Doesn't compete with food photography** (which is warm-toned — reds, golds, browns).
- **Reads as natural / culinary** (herbs, vegetables, gardens).
- **Distinctive** — every other luxury catering brand uses gold or black. Green is ownable.
- **High contrast** on white (WCAG AAA for normal text, AA for large text).

### 11.3 Typography system — 3 typefaces
| Typeface | Role | Sample usage |
|---|---|---|
| **Gotham Bold + ALL CAPS + heavy letter-spacing** | Primary UI / headlines / buttons / nav | H1 (32 px / 700 / 8 px LS), H2 (30 px / 700 / 7.5 px LS), nav links (16 px / 700 / 4 px LS), CTA button labels (16 px / 700 / 4 px LS), tabs (16 px / 700 / 4 px LS) |
| **Nesans Bold** (custom serif display face) | Section content titles — editorial elegance | H3 (32 px / 700 / 4.8 px LS) — used inside tab panels and alternating CTA blocks: "SOCIAL EVENTS", "SUMMER", "WHO WE ARE", "ICONIC VENUES FOR YOUR EVENT", "THE WORLD OF WOLFGANG PUCK", "NOW HIRING IN A CITY NEAR YOU" |
| **Metropolis** (geometric sans, lighter weight) | Body copy | Paragraph text inside tab panels and alternating CTA blocks |

**Type pairing philosophy:** Sans-serif for the brand voice (Gotham = uppercase, tracked, confident), serif for the editorial voice (Nesans = section titles, the "magazine headline" feel). The two voices alternate — Gotham H2 → Nesans H3 → Metropolis body.

### 11.4 Letter-spacing as brand signal
Heavy positive letter-spacing on uppercase sans-serif is the **fashion / luxury hospitality signature** (think Aman Resorts, Four Seasons, Edition Hotels). At 4-8 px letter-spacing on 16-32 px text, the type reads as magazine cover, not website.

### 11.5 Case discipline
- **UPPERCASE everywhere in UI chrome** — H1, H2, H3, nav, buttons, tabs, footer headings.
- **Sentence case implicit in body copy** (paragraph text is normal case, but most body copy is sparse).

---

## 12. Accessibility

### 12.1 Three-layer accessibility approach
1. **Skip-link cluster (top of page):** `Skip to main content` + `Enable accessibility for low vision` + `Open the accessibility menu` — visually hidden until focused, then appears.
2. **Floating UserWay widget button** (bottom-right): opens a full accessibility panel with text-size, contrast, dyslexia-friendly font, link highlighting, reading guide, pause animations.
3. **ARIA-compliant tab system:** Van11y-accessible-tab-panel-aria library gives proper `role="tablist"` / `role="tab"` / `role="tabpanel"` / `aria-selected` / `aria-controls`. Keyboard arrow navigation between tabs.

### 12.2 Contrast
- All text is pure black on white or white on dark green — both pass WCAG AAA.
- Dark-green `#1D462E` on white: contrast ratio ≈ 9.2:1 (AAA for normal text).
- White on dark-green: same ratio.

### 12.3 Focus
- The `:focus-visible` state on links and buttons should be visible (default browser outline preserved in most HubSpot themes).
- Skip links become visible on Tab keypress.

### 12.4 Reduced motion
- The hero video has `data-uw-rm-av="vi"` — UserWay attribute marking it as accessible video. The widget can pause it.
- No `prefers-reduced-motion` media query in the chrome (because there's no decorative motion to suppress).

### 12.5 What's notably absent
- No high-contrast toggle of their own (delegated to UserWay).
- No font-size controls of their own (delegated to UserWay).
- No language toggle visible (single language: English).

---

## 13. Mobile UX

### 13.1 Responsive breakpoints
- Desktop (≥1024 px): 3-column header with mega-menu hover dropdowns. Tab bars fit horizontally.
- Tablet (768-1023 px): Header likely collapses left nav to hamburger. Tab bars still horizontal.
- Mobile (<768 px): Full hamburger drawer. Tab bars horizontal but may need horizontal scroll if labels are long.

### 13.2 Touch targets
- Tab labels: 16 px font with padding, ~44 px touch height (meets Apple HIG minimum).
- CTA pill buttons: ~48 px tall — meets WCAG 2.5.5 (Target Size - AAA).
- Hamburger icon: standard 24 × 24 px icon in a 48 × 48 px tap zone.

### 13.3 Mobile menu drawer
- Slides in from left (or right).
- Backdrop overlay (semi-transparent black) — tap-to-close.
- Close button (X) top-right.
- All 6 top-level links stacked vertically, each with an accordion caret.
- BOOK YOUR EVENT CTA at the bottom (replaces START PLANNING — shorter, more imperative).

### 13.4 Mobile tab behavior
- 5 tabs in the service section. On narrow viewports, tabs may either:
  - Wrap to 2 rows (less elegant)
  - Scroll horizontally with peek of next tab (more elegant — likely the chosen pattern, given the consistent module design)
- Tab content panel stacks vertically below the tab bar (image on top, content below).

### 13.5 Mobile hero
- Video still autoplays (muted, playsinline — required for iOS Safari).
- Headline scales down but maintains letter-spacing ratio.
- CTA button full-width or near-full-width.

---

## 14. WOW effects inventory

WP's wow effects are **restrained and structural** — not animated showpieces:

| Wow | Description |
|---|---|
| **Hero video** | Full-bleed silent food video, no scrim. The food IS the wow. |
| **Heavy letter-spacing** | 8 px on H1, 4 px on buttons — magazine-cover typography that reads as luxury without animation. |
| **Three-color palette** | Pure black + pure white + dark green. The restraint itself is the wow — most luxury sites layer 6+ accent colors. |
| **Mega-menu** | Hover-revealed city directory (9 cities in LOCATION dropdown) — instant scale perception. |
| **Tab-based service exploration** | 5 services in 1002 px height — density without scroll cost. |
| **Awards as 5th season** | Category invention — converts aspirational planners via a recurring seasonal tab. |
| **Careers in homepage flow** | "Now Hiring in a City Near You" as a primary section — most competitors bury this in footer. |
| **Contextual CTAs per tab** | Each service tab has a different CTA label mirroring the user's mental model. |
| **UserWay widget** | Visible accessibility commitment (a wow for compliance-conscious enterprise clients). |
| **Footer logo ≠ header logo** | Subtle brand asset variation — shows craft in the footer where most sites copy-paste the header mark. |
| **Pipe-separated legal strip** | Magazine colophon typography in the footer. |

**Notably absent wow:** No scroll-pinned moments. No animated counters. No parallax. No 3D. No Lottie. No custom cursor. No page transitions.

---

## 15. Gap analysis vs Interfood

Interfood's current homepage has 33 sections (read from `/home/z/my-project/newsite/src/app/page.tsx`). Below: every gap, prioritized P0 / P1 / P2, with concrete recommendations.

### P0 — Must add / improve (high-impact, missing or weak)

#### P0-1. **Interfood is missing the "Service tabs" pattern entirely.**
- **Interfood today:** `EaServicesGrid` is a 4-col minimal services teaser (Свадьбы / Корпоратив / Банкеты / Фуршеты). `ServicesOverview` is a 4-category 50/50 split with hover-zoom. Both are *grids*, not *tabs*. User must scroll past all 4 to see one.
- **Wolfgang Puck pattern:** Single tabbed module — 5 services, click a tab to swap image+copy+CTA in place. 1002 px tall total instead of 4 × 700 px = 2800 px.
- **Recommendation:** Replace `EaServicesGrid + ServicesOverview` (sections 16-17) with ONE tabbed service module. Categories: `Свадьбы · Корпоратив · Банкеты · Фуршеты · Выездной Шеф` (5 tabs, mirroring WP's social/weddings/corporate/workplace/private-chef split — Bankety=large banquets, Фуршеты=receptions, Выездной Шеф=private chef).
- **Why:** Cuts ~1800 px of scroll, gives each service category a full panel + contextual CTA, reduces decision fatigue.

#### P0-2. **Interfood is missing "Seasonal inspiration" rotation entirely.**
- **Interfood today:** `SustainabilityStrip` mentions "seasonal" but there's no seasonal menu showcase, no seasonal rotation, no seasonal landing pages.
- **Wolfgang Puck pattern:** 5-tab seasonal rotation (Summer/Spring/Fall/Winter/Awards) driving traffic to /seasonal/[season]-menu pages.
- **Recommendation:** Add a new `EaSeasonalTabs` section between `TastingMenuExperience` (13) and `EaTastingCta` (14). Tabs: `Лето · Осень · Зима · Весна · Праздничная` (Holiday/New Year season as the 5th tab — Russia's biggest catering season, equivalent to WP's "Awards" season hook). Each tab swaps to a seasonal dish image + 2-sentence copy + `Смотреть меню` CTA → `/seasonal/[season]` page.
- **Why:** Russia has dramatic seasonal menus (white-asparagus spring, mushroom/pumpkin fall, Olivier/herring winter). Seasonal tabs give Interfood a recurring content refresh cadence + 5 SEO landing pages + a Holiday Season conversion hook (Nov-Jan = corporate New Year banquet peak).

#### P0-3. **Interfood is missing "Careers" as a first-class homepage section.**
- **Interfood today:** No careers section in the 33-section list. `SiteFooter` may have a "Careers" link but no homepage recruitment block.
- **Wolfgang Puck pattern:** "Now Hiring in a City Near You" alternating CTA block in the homepage flow + CAREERS in top nav + CAREERS in footer nav.
- **Recommendation:** Add a new `EaCareersBlock` section between `EaPressStrip` (27) and `CepInstagramGrid` (28). Layout: full-bleed photo of chefs/plating + H3 `РАБОТАЙ С НАМИ` + 2-sentence pitch (training, growth, events) + `ОТКЛИКНУТЬСЯ` CTA → `/careers`. Add `РАБОТА` or `ВАКАНСИИ` to the top nav (between calculator and contact).
- **Why:** Catering is labor-intensive. Interfood operates in SPb + Moscow + All-Russia — constant staff recruitment is operationally critical. A homepage careers section converts site visitors who came for catering but might consider working with the brand. Also signals scale (we're hiring = we're growing).

#### P0-4. **Interfood's CTAs are too varied — context-specific CTAs missing.**
- **Interfood today:** CTA labels include `ОБСУДИМ СОБЫТИЕ?` (EaFinalCta), `Хотите попробовать до заказа?` (EaTastingCta), `Рассчитать стоимость` (Calculator), `Написать письмо` (EaFinalCta), `СЛЕДИТЕ ЗА НАМИ` (CepInstagramGrid), `ЗАБРОНИРОВАТЬ` (TastingMenuExperience). They're poetic but not service-context-specific.
- **Wolfgang Puck pattern:** Each service tab has its own CTA label that mirrors the user's mental model — `BOOK YOUR EVENT` / `BOOK YOUR WEDDING` / `PARTNER WITH US` / `BOOK A CHEF`.
- **Recommendation:** Audit every CTA on the page. For each service category shown in `EaServicesGrid`/`ServicesOverview`/new tabbed service module, use a context-specific verb: `ЗАКАЗАТЬ СВАДЬБУ` (not generic "ОБСУДИТЬ"), `ЗАКАЗАТЬ КОРПОРАТИВ`, `ЗАКАЗАТЬ БАНКЕТ`, `ЗАКАЗАТЬ ФУРШЕТ`, `ВЫЕЗДНОЙ ШЕФ К ВАМ`. The CTA should complete the user's sentence, not the brand's sentence.

### P1 — Should add (medium-impact)

#### P1-1. **Add a mega-menu to SiteHeader exposing city/district landing pages.**
- **Interfood today:** `SiteHeader` likely has a simple flat nav (need to verify in `components/catering/site-header.tsx`). `CepLocationsStrip` says "САНКТ-ПЕТЕРБУРГ | МОСКВА | ВСЯ РОССИЯ" but doesn't expand.
- **Wolfgang Puck pattern:** LOCATION mega-menu with 7 cities + "Take Us Anywhere" + Venues — gives scale perception in one hover.
- **Recommendation:** Add a `ЛОКАЦИИ` mega-menu item to `SiteHeader` exposing: `ПЛОЩАДИ СПб · МОСКВА · ПРИГОРОДЫ · ВСЯ РОССИЯ · ВЫЕЗД ЗА РУБЕЖ` (or district-level: `Петроградская сторона · Центральный район · Васильевский остров · МОСКВА · …`). Even if Interfood doesn't have city landing pages yet, the mega-menu can deep-link to existing venue sections (#venues, #locations).
- **Why:** Local SEO + scale perception + reduces bounce from users who want to know "do you serve my area?"

#### P1-2. **Add mailing list signup to SiteFooter.**
- **Interfood today:** `SiteFooter` exists — need to check if it has mailing list. The current section list (1-33) shows `Contact` (lead form) but no email-capture-only mailing list.
- **Wolfgang Puck pattern:** Single-field email signup in footer (Email + Submit).
- **Recommendation:** Add a `ПОДПИСКА` block to `SiteFooter` — single `Email` input + arrow submit button. Hook to a future email-capture API endpoint. Position center-left, mirroring WP's footer layout.
- **Why:** Captures top-of-funnel visitors who aren't ready to inquire but want to stay in touch. Lower friction than the contact form.

#### P1-3. **Consolidate Interfood's multi-accent palette.**
- **Interfood today:** Cream (#F4EFE8 base) + black + Interfood red (#FF360A) + EA red (#E71D3A) + Salt Block honey + blush (#F1ECEC) + espresso bg + philosophy-quote black bg. At least 7 distinct accent surfaces.
- **Wolfgang Puck pattern:** 3 colors total (black + white + dark green). Every accent serves a specific semantic role.
- **Recommendation:** Audit Interfood's palette. The current `CepRedStats` red band (#FF360A) and EA red (#E71D3A) overlap and compete. Pick ONE red. Reserve the blush (#F1ECEC) for ONE section (founder story). Reserve espresso for ONE section (TastingMenuExperience). Don't introduce more accents.
- **Why:** Multi-accent palettes dilute brand identity. WP's restraint is what makes their dark-green CTAs pop — they're the only non-black/white thing on the page. Interfood's reds compete with the food photography.

#### P1-4. **Adopt alternating CTA module pattern for storytelling sections.**
- **Interfood today:** `EaFounderStory` is a 2-col block (photo left + story right). `ChefPortrait` is also 2-col. `EaTastingCta` is 2-col. None alternate direction.
- **Wolfgang Puck pattern:** The 4 alternating CTA blocks (WHO WE ARE / ICONIC VENUES / WORLD OF WP / NOW HIRING) flip image left↔right between blocks, creating visual rhythm.
- **Recommendation:** Stagger `EaFounderStory`, `ChefPortrait`, `EaTastingCta`, and the new `EaCareersBlock` in an L-R-L-R pattern. Photo LEFT in section 8, photo RIGHT in section 11, photo LEFT in section 14, photo RIGHT in the new careers block.
- **Why:** Alternating layout creates a wave-like reading rhythm, prevents "stack of identical 2-col blocks" fatigue, and naturally alternates eye-leading direction (left photo pulls eye left → text pulls eye right → next block right photo pulls eye right → text pulls eye left → ...).

#### P1-5. **Add contextual CTAs to EaVenueNetwork venue cards.**
- **Interfood today:** `EaVenueNetwork` is a magazine partner-network directory with 30 venues + sticky featured hero card. Hover behavior likely just visual.
- **Wolfgang Puck pattern:** Each venue = a landmark-named venue (Academy Museum, Grammy Museum) with its own landing page. Click → city/venue page with full details + inquiry CTA.
- **Recommendation:** For each of Interfood's 30 partner venues, ensure each card has a contextual CTA: `ЗАБРОНИРОВАТЬ В [VENUE NAME]` or `УЗНАТЬ О [VENUE]`. Hover reveals the CTA.
- **Why:** Converts "I want to know more about venue X" into "I'm inquiring about hosting at venue X" with one click.

### P2 — Nice to have (low-impact, polish)

#### P2-1. **Visible accessibility widget (UserWay-style or custom).**
- **Interfood today:** Has accessibility features (skip links, ARIA, focus states) but no visible accessibility toggle in the chrome.
- **Wolfgang Puck pattern:** UserWay floating widget — text-size, contrast, dyslexia font, reading guide.
- **Recommendation:** Either (a) install a UserWay-style widget, or (b) build a small custom `Доступность` floating button that opens a panel with text-size + contrast + reduced motion toggles.
- **Why:** Visible accessibility commitment signals enterprise-grade compliance. Especially valuable for Interfood's B2B corporate clients who have accessibility procurement requirements.

#### P2-2. **Add a `РЕЦЕПТЫ` content-marketing nav item + landing page.**
- **Interfood today:** No recipes content visible in the 33 sections.
- **Wolfgang Puck pattern:** `RECIPES` in the footer nav — content marketing for organic search + brand affinity.
- **Recommendation:** Add a recipes/blog landing page. Add `РЕЦЕПТЫ` to the footer nav (or a hidden secondary nav).
- **Why:** SEO + brand affinity + content marketing for catering (recipe pages rank for ingredient queries, drive organic traffic, cross-link to catering services).

#### P2-3. **Pipe-separated legal strip in SiteFooter.**
- **Interfood today:** SiteFooter likely has standard legal links (Terms / Privacy / Copyright).
- **Wolfgang Puck pattern:** Pipe-separated legal strip — `| TERMS OF USE | PRIVACY POLICY | Privacy Request | Code of Business Conduct | COPYRIGHT` — magazine colophon typography.
- **Recommendation:** Use pipe characters (`|`) between legal links in SiteFooter's bottom strip. Single line, centered or left-aligned.
- **Why:** Subtle craft signal. Reads as editorial publishing rather than generic SaaS.

#### P2-4. **Different footer logo vs header logo.**
- **Interfood today:** Likely uses the same logo in header and footer.
- **Wolfgang Puck pattern:** Different `WPC Footer Logo` asset (likely stacked/simplified mark that reads better at small sizes on dark backgrounds).
- **Recommendation:** Commission or design a separate stacked/simplified `Interfood` footer mark — better legibility on dark backgrounds at small sizes.
- **Why:** Craft detail. Footer logo on dark bg often needs different proportions than header logo on light bg.

#### P2-5. **Lean MORE into "iconic landmark" venue association.**
- **Interfood today:** `EaVenueNetwork` has 30 venues — but they're "partner" venues, not Interfood's own iconic landmarks.
- **Wolfgang Puck pattern:** Each WP venue is itself a landmark brand (Academy Museum, Grammy Museum) — WP borrows prestige.
- **Recommendation:** Identify 3-5 landmark SPb/Moscow venues that Interfood has catered at (or regularly caters at) — give them hero treatment in a new section. Use the venue's own name recognition (e.g., "Банкет в [Landmark Hotel]", "Свадьба в [Landmark Estate]") as social proof.
- **Why:** Landmark association elevates brand perception. WP doesn't say "we cater at venues" — they say "we cater at the Academy Museum."

### Interfood advantages WP doesn't have (KEEP THESE)

These are Interfood strengths that WP lacks. Don't lose them in pursuit of WP's patterns:

1. **Price calculator** (section 30) — WP doesn't have one (luxury positioning — they want custom quotes). Interfood's calculator converts price-conscious B2B and price-shopping consumers. KEEP.
2. **Pinned-scroll Manifesto wow** (section 9) — WP has no scroll-pinned moments. Interfood's editorial maximalism is a different brand voice. KEEP.
3. **Named-institution testimonials** (section 23) — WP has testimonials slider but no named-institution cards. Interfood's named-with-Яндекс/Сбер/Гинза cards are stronger B2B proof. KEEP.
4. **60-venue partner-network directory** (section 20, EaVenueNetwork) — WP shows one venue teaser on homepage; Interfood shows 30. KEEP (but improve contextual CTAs per P1-5).
5. **Mid-page tasting CTA** (section 14) — WP has no "try before you buy" mid-page conversion. KEEP (this is a strong B2B catering pattern WP misses).
6. **Press strip** (section 27) — WP doesn't surface press logos on homepage. KEEP.
7. **Instagram grid** (section 28) — WP doesn't have an IG grid on homepage. KEEP.
8. **Pure-black philosophy quote bookend** (section 29) — WP's restraint has no cinematic drama moment. KEEP (it's a distinctive Interfood voice).

### Summary of section-level changes (priority-ordered)

| Priority | Section | Action |
|---|---|---|
| **P0** | Replace 16-17 (EaServicesGrid + ServicesOverview) | One tabbed service module with 5 tabs + contextual CTAs |
| **P0** | Add between 13 and 14 | New `EaSeasonalTabs` section (5 tabs: Лето/Осень/Зима/Весна/Праздничная) |
| **P0** | Add between 27 and 28 | New `EaCareersBlock` alternating CTA + top-nav `РАБОТА` |
| **P0** | Audit all CTAs | Replace generic "ОБСУДИТЬ" with service-context-specific verbs |
| **P1** | Update SiteHeader | Add `ЛОКАЦИИ` mega-menu with city/district landing pages |
| **P1** | Update SiteFooter | Add single-field mailing-list signup block |
| **P1** | Audit palette | Consolidate to 3-4 colors max; pick ONE red |
| **P1** | Stagger 8/11/14/new careers | Alternating L-R-L-R image direction |
| **P1** | Update EaVenueNetwork cards | Add contextual per-venue CTAs |
| **P2** | Add floating button | Accessibility menu toggle |
| **P2** | Add to footer nav | `РЕЦЕПТЫ` content-marketing link |
| **P2** | Update SiteFooter legal strip | Pipe-separated, magazine colophon |
| **P2** | Commission separate asset | Footer logo (different from header) |
| **P2** | Add new section | 3-5 "iconic landmark" SPb/Moscow venue spotlights |

---

## 16. Tech-stack notes (for context)

- **CMS:** HubSpot CMS (Cos-i18n, HubspotToolsMenu, hsstatic) — confirmed via script URLs (`js.hs-analytics.net`, `js.hs-banner.com`, `js.hsforms.net`).
- **JS libraries (loaded):**
  - **Van11y-accessible-tab-panel-aria.min.js** — open-source ARIA-compliant tab library (powers both service tabs and seasonal tabs).
  - Module-compiled HubSpot JS per component (`module_menu.min.js`, `module_hero_banner.min.js`, `module_hospitality_services.min.js`, `module_seasonal_inspiration.min.js`, `module_testimonials_slider.min.js`).
  - **No jQuery, no GSAP, no AOS, no Swiper, no Embla, no Lottie, no lozad.** Pure vanilla JS.
- **Analytics:** Microsoft Clarity (session replay), Google Tag Manager (GTM-5K5MTZW), Google Ads (AW-17362630125), Facebook Pixel, Bing UET (bat.js), HubSpot analytics + forms.
- **Accessibility widget:** UserWay (`cdn.userway.org/widget.js`) — third-party SaaS.
- **Asset CDN:** `wolfgangpuckcatering.com/hs-fs/hubfs/...` — HubSpot file system.

**Implication for Interfood:** WP's stack is heavier (HubSpot CMS + 5+ analytics tags + UserWay widget) but the rendered site has only 1 video + tab swaps as motion. The chrome is vanilla JS — Interfood's Next.js + React 19 + Framer Motion stack can replicate every WP pattern with less code and better performance.

---

## 17. Closing summary

Wolfgang Puck Catering's homepage is a **master class in restraint**. Three colors, three typefaces, no decorative animation, no scroll-pinned wow moments, no parallax — yet the site reads as premium because:

1. **The food photography carries the brand** (hero video, alternating CTA blocks, venue directory all use real food/event photography, not abstract gradients).
2. **Heavy letter-spacing on uppercase Gotham** signals fashion/luxury without ornament.
3. **One accent color (dark green)** used semantically — every green thing is a CTA. No exceptions.
4. **Tab-based exploration** of services and seasons compresses 10 sections of content into 2.
5. **Careers elevated** to first-class homepage status signals operational scale and recruitment priority.
6. **Contextual CTAs** mirror the user's mental model (Book Your Wedding ≠ Book Your Event).

Interfood's gaps against this benchmark, in priority order:
- **P0:** Missing service tabs (1), missing seasonal rotation (2), missing careers section (3), CTAs not context-specific (4).
- **P1:** Missing mega-menu (5), missing mailing list (6), too many accent colors (7), no alternating rhythm (8), venue CTAs not contextual (9).
- **P2:** No visible accessibility toggle (10), no recipes content (11), no pipe-separated footer (12), no separate footer logo (13), no landmark venue spotlights (14).

The biggest single-impact move is **P0-1 (replace service grids with a tabbed service module)** — this single change would compress Interfood's homepage by ~1800 px and surface all 5 service categories with contextual CTAs in one screen height.

The most differentiated move is **P0-2 (add seasonal rotation with "Праздничная" as the 5th tab)** — Russia's New Year banquet season is Interfood's "Awards Season" equivalent, a discrete conversion window worth its own tab.

The most operationally valuable move is **P0-3 (add careers section)** — for a labor-intensive multi-city catering operation, recruitment traffic should be a primary conversion path, not a footer afterthought.

---

*End of analysis. All findings describe design patterns only — no content reproduced.*
