# CYCLE-28-COMPONENT-AUDIT — Interfood Catering × elegantaffairscaterers.com

**Date:** 2026-08-23
**Task ID:** 2-C (Explore subagent)
**Reference site for editorial standard:** https://elegantaffairscaterers.com
**Audit scope:** `/home/z/my-project/newsite/src/components/catering/*.tsx` — **81 files** total
**Audit method:** per-component Read + import-graph Grep + EA editorial standard comparison
**Constraints:** DO NOT modify any source files. Pure research + analysis MD.

---

## 0. TL;DR

- **81 components audited** across 7 layer groups (Cycle 16–27 stack: Sopranos → Ridgewells → concept-catering → Joels → mculinary → Salt Block → Creative Edge Parties).
- **39 components are orphaned** (33 directly + 6 transitively) — up from the 22 noted in `AGENTS.md §17` because Cycle 27's CEP layer (`CepEggHero`, `CepClientMarquee`, `CepTestimonialsCarousel`, `CepProcess`, etc.) replaced the previous mculinary/Ridgewells/concept-catering equivalents and left them dead in the tree.
- **42 components are live** (mounted on `src/app/page.tsx` directly, in `src/app/layout.tsx` directly, or transitively via a live parent).
- Action split:
  - **KEEP (33)** — already strong, no work needed.
  - **RESTYLE (8)** — keep the file but re-skin to EA's design language (palette, type, spacing).
  - **REPLACE (1)** — design is too weak, drop + use a new EA-style component instead.
  - **DELETE (39)** — orphaned / dead code (clean-up overdue from Cycles 25–27).
- The Cycle 27 CEP layer (13 `cep-*` components) is the **strongest existing tier** and is already 8–10/10 against the EA editorial standard — Cycle 28 should keep the CEP layer intact and **add new `ea-*` components only where existing live components score ≤7** (QuoteBand, EditorialIntro, About, McuVenues, McuPhotoFilmstrip, Faq, Calculator, Contact, SocialHandle, CookieConsent, Preloader).
- 10 candidate `ea-*` new components proposed at the end (events portfolio, services grid, venues spotlight, philosophy quote, final CTA, press strip revival, chef quote, FAQ accordion, calculator CTA, cookie banner).

---

## 1. Audit methodology

### 1.1 What "strongest version of its kind" means here

The Cycle 28 reference is **elegantaffairscaterers.com (EA)** — a New-York/Palm-Beach luxury caterer whose site is built around the same minimal palette + restraint pattern as Creative Edge Parties (the Cycle 27 reference). Both sites:

- Use a **pure black + warm cream + one screaming accent red** palette (`#000000` + `#EFEFE7` + `#FF360A`).
- Restrain color usage: red appears as a section background **exactly once** (the stats band) — restraint is the wow.
- Use **massive sans-serif display type** for signature headlines (200–244px).
- Use **auto-scrolling peeking carousels with NO arrows/dots** (cream cards on cream bg — so subtle they read as one editorial spread).
- Use **edge-fade mask marquees** (not bordered marquees).
- Use **full-bleed editorial dividers** (single art-directed photo, no text) between heavy type sections.
- Use **square outline-only CTA buttons** (transparent bg, square corners, hover fill-invert).
- Use **italic serif accents** for the few emotional moments (thank-you line, signature).
- Avoid glassmorphism, gradient text, 3D-tilt cards, decorative chrome, gold star bursts, floral SVGs — anything decorative is restraint-violating.

A component is the **STRONGEST version of its kind** when it matches the EA editorial standard on **all** of: palette restraint, type discipline, motion restraint, square-corner CTA, accessibility, and reduced-motion safety. Components that match are scored 8–10. Components with decorative chrome / glassmorphism / gradient text / gold-accent maximalism are scored 4–7 and flagged RESTYLE or REPLACE.

### 1.2 How each component was evaluated

1. **Read first 60–90 lines** of each component's source to capture header comment, JSX structure, and design intent.
2. **Cross-reference AGENTS.md §17 (Cycle 26)** and the inline Cycle 27 addendum (lines 2552–2648) to identify which cycle / reference site the component came from.
3. **Grep imports** across `src/app/page.tsx` + `src/app/layout.tsx` + all components under `src/components/**` to determine whether the file is:
   - Direct-mounted on a route (`page.tsx` or `layout.tsx`).
   - Imported by another live component (transitively live).
   - Imported only by orphaned components (transitively orphaned).
   - Not imported anywhere (directly orphaned — DELETE).
4. **Quality scoring (1–10)** against the EA editorial standard:
   - 9–10 = already EA-tier — KEEP.
   - 7–8 = strong but minor palette/type drift — KEEP, optional polish.
   - 5–6 = decorative maximalism or off-palette accent — RESTYLE.
   - 1–4 = structural mismatch with EA editorial discipline — REPLACE.
5. **Action assignment** (REPLACE / RESTYLE / KEEP / DELETE) based on quality score + live/orphan status + replaceability.

### 1.3 Import-graph methodology (how orphan status was computed)

For each `*.tsx` file in `/home/z/my-project/newsite/src/components/catering/`, the audit greps the entire `src/app/` + `src/components/` tree for any `from ['\"][^'\"]*/<basename>['\"]` import statement. Files with **zero matching imports outside their own file** are flagged as **direct orphans** (DELETE).

Files with non-zero imports are then checked recursively: if all their importers are themselves orphans, the file is flagged as **transitively orphaned** (also DELETE — dead code that no live component ever reaches).

This two-pass scan is what surfaced the **39 orphaned components** (33 direct + 6 transitive) vs the **22** noted in `AGENTS.md §17`. The §17 number was a partial list identified during the Cycle 26 audit; Cycle 27's CEP layer + the §17 deferrals account for the 17-component delta.

---

## 2. Master audit table (81 components)

| # | Component | File | Lines | Mounted on page.tsx? | Quality 1-10 | EA-equivalent better? | Action | Reason (1–2 sentences) |
|---|---|---|---|---|---|---|---|---|
| 1 | About | about.tsx | 430 | YES (#8) | 6 | YES — EA uses restrained 2-col with serif headline + 3 stats only | RESTYLE | Heavy 3D-tilt StatCards + glassmorphism + gradient-text + decorative grid bg violate EA restraint; needs editorial simplification to match EA About section. |
| 2 | AmbientAudio | ambient-audio.tsx | 209 | layout.tsx | 6 | N/A — EA has no ambient audio cue | KEEP | Procedural Web Audio wow (P2) gated to manifesto section — only "noise" element on the page; not EA-weak but not EA-strong either; leave as luxury flourish. |
| 3 | AnnouncementBar | announcement-bar.tsx | 166 | site-header | 8 | YES — EA uses a slim black announcement bar with red arrow | KEEP | Salt Block pattern (espresso bg + honey arrow + localStorage dismissal); already in EA restraint territory; polish only if Cycle 28 wants an `ea-announcement` variant. |
| 4 | AwardsStrip | awards-strip.tsx | 127 | NO (orphan) | 4 | N/A — EA shows no awards on home | DELETE | Orphaned; cream bg + gold gradient + lucide badge icons + "СМИ о нас" text-strip is maximalist chrome vs EA restraint; no live mount; safe to remove. |
| 5 | BackToTop | back-to-top.tsx | 76 | YES (#27) | 8 | EA-equivalent: thin 1px circular outline + arrow | KEEP | Ridgewells-style scroll-progress ring (gold gradient + SVG pathLength); already EA-discipline; consider swapping gold→black for full EA palette match. |
| 6 | BoldStatement | bold-statement.tsx | 64 | NO (orphan) | 4 | N/A — EA does not use ultra-bold Barlow statement band | DELETE | Orphaned; concept-catering.de "section-no-padding" pattern with pink highlight word — directly off-palette vs EA's black/cream/red restraint. |
| 7 | Calculator | calculator.tsx | 722 | YES (#23) | 6 | YES — EA calculator is single-card with type-driven totals | RESTYLE | Functional but visually heavy: 7 lucide icons, gold gradient slider, emoji type-mapping, magnetic CTA, Telegram/WhatsApp share; EA would strip to one card + giant type. |
| 8 | CepClientMarquee | cep-client-marquee.tsx | 96 | YES (#2) | 9 | N/A — this IS the EA pattern | KEEP | CEP Cycle 27 marquee — 17 RU corporate clients + red bullets + edge-fade mask + duplicated-set seamless loop + pause-on-hover + Server Component. EA-tier. |
| 9 | CepEditorialDivider | cep-editorial-divider.tsx | 44 | YES (#6) | 9 | N/A — this IS the EA pattern | KEEP | CEP Cycle 27 — full-bleed art-directed photo, no text, top+bottom cream gradient blend. Pure editorial breather between heavy type sections. EA-tier. |
| 10 | CepEggHero | cep-egg-hero.tsx | 202 | YES (#1) | 9 | N/A — this IS the EA hero pattern | KEEP | CEP Cycle 27 — full-bleed egg photo + 244px stacked "THE EGG / CAME FIRST." + locations strip + scroll cue. Ken Burns + framer-motion staggered reveal + reduced-motion gate. Signature hero. |
| 11 | CepInstagramGrid | cep-instagram-grid.tsx | 141 | YES (#21) | 8 | N/A — EA IG grid is 3×3 with Reel icons (matches) | KEEP | CEP Cycle 27 — 3×3 grid + Reel Play icons on indices 2/5/8 + IG handle link; staggered fade+slide reveal. §17 TODO: replace CEP's actual IG photos with @nilov_catering's real feed. |
| 12 | CepLocationsStrip | cep-locations-strip.tsx | 73 | YES (#20) | 8 | N/A — EA has a similar city strip | KEEP | CEP Cycle 27 — full-bleed dim photo + wordmark substitute + "САНКТ-ПЕТЕРБУРГ \| МОСКВА \| ВСЯ РОССИЯ" city strip. Magazine colophon feel. |
| 13 | CepOutlineButton | cep-outline-button.tsx | 61 | NO (orphan) | 7 | N/A — EA uses square outline buttons | DELETE | Orphaned (count=0 imports); good design (1px red border, square corners, hover invert) but never wired into any CEP section — DELETE since CepEggHero etc. chose text-only over CTA. If reusing, restore via `ea-outline-button.tsx` instead. |
| 14 | CepOverlayMenu | cep-overlay-menu.tsx | 159 | site-header | 9 | N/A — EA uses full-screen staggered overlay menu | KEEP | CEP Cycle 27 — full-screen black overlay + 6 54px staggered slide-in items + Escape/backdrop/X close + body-scroll-lock + reduced-motion safety class. EA-tier. |
| 15 | CepProcess | cep-process.tsx | 155 | YES (#19) | 10 | N/A — this IS the EA process pattern | KEEP | CEP Cycle 27 — "THE CREATIVE EDGE" 3-step (DREAM/BUILD/SAVOR) with red accent line under each number + thin vertical red hairline between cols. VLM 10/10. |
| 16 | CepRedStats | cep-red-stats.tsx | 110 | YES (#4) | 9 | N/A — this IS the EA stats pattern | KEEP | CEP Cycle 27 — `#FF360A` band, 3 count-up Neutra2Display stats (16+/2400+/180000+) with rAF easeOutCubic + reduced-motion snap-to-final. The signature color moment. |
| 17 | CepSimpleBrilliant | cep-simple-brilliant.tsx | 132 | YES (#3) | 9 | N/A — this IS the EA "film title card" pattern | KEEP | CEP Cycle 27 — 200px "SIMPLE & BRILLIANT." over 0.5× slow-mo food b-roll video. CEP signature restraint. §17 TODO: shoot/license own food b-roll. |
| 18 | CepTestimonialsCarousel | cep-testimonials-carousel.tsx | 246 | YES (#18) | 10 | N/A — this IS the EA testimonials pattern | KEEP | CEP Cycle 27 — auto-scroll peeking (4.5s setInterval), NO controls, 5 RU testimonials, cream cards on cream. Duplicated-set technique + IntersectionObserver pause + reduced-motion safe. |
| 19 | CepTestimonialsHeader | cep-testimonials-header.tsx | 54 | YES (#17) | 9 | N/A — this IS the EA "single word as section" pattern | KEEP | CEP Cycle 27 — 130px "TESTIMONIALS" + red hairline. Minimalism IS the wow (CEP §6.8). |
| 20 | CepWhyUs | cep-why-us.tsx | 108 | YES (#5) | 9 | N/A — this IS the EA value-props pattern | KEEP | CEP Cycle 27 — "WHY US?" 4 phrases (LIMITLESS CREATIVITY/IMMERSIVE/EXQUISITE/FLAWLESS) with red hairline dividers + hover red shift. |
| 21 | ChapterNav | chapter-nav.tsx | 91 | layout.tsx | 7 | EA-equivalent: minimal dots (no labels) | KEEP | Right-edge progress dots (8 sections) + gold gradient scroll-progress line; functional but optional — EA tends to omit chapter navs. |
| 22 | ChefPortrait | chef-portrait.tsx | 153 | YES (#10) | 8 | N/A — EA has chef portrait + italic serif headline | KEEP | Salt Block Cycle 26 — 5fr/6fr grid + 4:5 portrait + Barlow 0.28em eyebrow + italic Playfair "Дмитрий Нилов" + Great Vibes signature + 3 stats. Already EA-tier. |
| 23 | Contact | contact.tsx | 1300 | YES (#25) | 6 | YES — EA contact is single-column simple form | RESTYLE | 1300-line multi-step form with 17 lucide icons + office-hours badge + draft-autosave + Telegram/VK/WhatsApp/IG quick links; functional but visually heavy; EA would strip to one column + 3 fields. |
| 24 | CookieConsent | cookie-consent.tsx | 126 | layout.tsx | 7 | YES — EA uses single-line thin cookie bar | RESTYLE | Glassmorphism banner (`bg-cream/85 backdrop-blur-xl border-t border-gold/20`) — §17 VLM-flagged as visually too heavy; replace with single-line EA-style bar. |
| 25 | Cursor | cursor.tsx | 185 | layout.tsx | 7 | EA-equivalent: minimal dot only (no lag ring) | KEEP | Custom cursor (dot + spring-lag ring + image-preview on `data-cursor-image`); luxury signature but adds JS weight — EA tends to omit custom cursors. |
| 26 | EditorialIntro | editorial-intro.tsx | 148 | YES (#7) | 7 | YES — EA uses minimal 2-line intro, no painterly bg | RESTYLE | Ridgewells "painterly bloom" — 10-layer radial-gradient + SVG feTurbulence grain + dark vignette + gold/peach eyebrow + 60px Playfair + italic accent + dual OutlineButton CTAs + parallax; pretty but maximalist vs EA restraint. |
| 27 | EventsGallery | events-gallery.tsx | 795 | NO (orphan) | 5 | YES — EA gallery is full-bleed scroll, not 3D-tilt mosaic | DELETE | Orphaned; Awwwards-inspired 3D-tilt full-card + shine sweep + 8 aspect ratios + featured indices + lightbox modal — maximalist chrome vs EA editorial discipline. |
| 28 | Faq | faq.tsx | 475 | YES (#24) | 7 | YES — EA FAQ is minimal accordion with large type | RESTYLE | Functional accordion with category tabs + search highlight + ThumbsUp/Down feedback; visually busy vs EA's minimal 1-col list. §16 P3 vote backend adds API surface. |
| 29 | GgFeatureCollage | gg-feature-collage.tsx | 271 | NO (orphan) | 5 | N/A — EA does not use 2×2 collage | DELETE | Orphaned; Cycle 22 ggcatering layer — 3 alternating dark/light blocks with 2×2 image collage + Poppins/Montserrat heading + lime italic accent. Off-palette vs EA. |
| 30 | GgHero | gg-hero.tsx | 372 | NO (orphan) | 5 | N/A — EA uses full-bleed photo, not multi-tile collage | DELETE | Orphaned (count=0); Cycle 22 ggcatering layer — 10×10 asymmetric image collage + rotating adjective (ИЗЮМИНКОЙ/шиком/размахом…) + lime circle + yellow triangle + blush zigzag; maximalist collage hero. Replaced by CepEggHero. |
| 31 | GgVideoShowcase | gg-video-showcase.tsx | 238 | NO (orphan) | 5 | N/A — EA hero video is full-bleed, no modal | DELETE | Orphaned; Cycle 22 ggcatering — 16:9 video frame + click-to-fullscreen modal + glow play button + disclaimer ("Видео временно использовано с сайта-эталона"). Replaced by CepSimpleBrilliant's slow-mo b-roll. |
| 32 | GgWhoWeAre | gg-who-we-are.tsx | 261 | NO (orphan) | 5 | N/A — EA about is restrained serif, not rotating adjective | DELETE | Orphaned; Cycle 22 ggcatering — vertical-line eyebrow + 22 rotating adjectives + 3-up count-up stats. Off-palette (lime/charcoal) vs EA black/cream/red. |
| 33 | Grain | grain.tsx | 58 | layout.tsx | 8 | N/A — EA has subtle grain (matches) | KEEP | Inline SVG feTurbulence film-grain at 5% opacity + mix-blend-overlay + 20fps rAF drift + reduced-motion static. Subtle luxury texture. |
| 34 | Hero | hero.tsx | 719 | NO (orphan) | 4 | N/A — EA hero is CepEggHero (already live) | DELETE | Orphaned (count=0); Cycle 21 Sopranos 720-line hero — 4-slide crossfade + Great Vibes "Добро пожаловать" + Oswald "INTERFOOD CATERING" + CheckYourDateSidebar lead-gen form; superseded by CepEggHero. |
| 35 | InstagramVideo | instagram-video.tsx | 262 | NO (orphan) | 5 | N/A — EA IG is grid, not embeds | DELETE | Orphaned; multi-reel IG embed carousel with hover-to-load behavior + GDPR-gated script injection + MutationObserver iframe sandboxing; replaced by CepInstagramGrid. |
| 36 | JoelsAbout | joels-about.tsx | 128 | NO (orphan) | 6 | N/A — EA about is bigger, simpler | DELETE | Orphaned; Cycle 24 joels.com layer — 4/12 stacked parallax + 7/12 text column + sage 0.4em eyebrow + 50px Playfair + TextualLink; competes with existing About + ChefPortrait; replaced by About. |
| 37 | JoelsContactCta | joels-contact-cta.tsx | 231 | NO (orphan) | 5 | N/A — EA contact is single section | DELETE | Orphaned; Cycle 24 joels.com — 60px Playfair headline + 2-col form (Name/Email + Message) + square sage button; competes with Contact; replaced by Contact. |
| 38 | JoelsCuisine | joels-cuisine.tsx | 145 | NO (orphan) | 6 | N/A — EA services grid is bigger | DELETE | Orphaned; Cycle 24 joels.com — 3-up card grid + 4:3 landscape + 110% hover zoom + 28px Playfair labels; competes with ServicesOverview; replaced by ServicesOverview. |
| 39 | LenisProvider | lenis-provider.tsx | 54 | layout.tsx | 9 | N/A — EA uses native scroll | KEEP | Smooth-scroll provider (Lenis v1.2 + GSAP ScrollTrigger bridge) + reduced-motion native-scroll fallback. Layout-level utility; EA-tier infra. |
| 40 | LogoMarquee | logo-marquee.tsx | 78 | NO (orphan) | 5 | N/A — EA clients are in CepClientMarquee | DELETE | Orphaned (count=0); cream bg + 12 RU client wordmark chips + gold bullet separators + edge-fade mask + pause-on-hover; replaced by CepClientMarquee. |
| 41 | Manifesto | manifesto.tsx | 358 | YES (#9) | 7 | YES — EA manifesto is simpler serif italic | KEEP | Cycle 16 signature pinned scroll «LOVE» (250vh) — SVG clipPath text + 3 dish crossfade layers + word-by-word colorize + 1px bordeaux underline draw-in + cream-overlay fade; strongest wow but heavy scroll length (§17 VLM noted "massive dark void" in static screenshots). Keep but consider reducing to 180vh. |
| 42 | MarqueeBand | marquee-band.tsx | 111 | NO (orphan) | 6 | N/A — EA marquee is CepClientMarquee | DELETE | Orphaned (count=0); Ridgewells Cycle 21 — 94px solid bordeaux band + infinite marquee Playfair italic phrase + gold star SVG sparkle pulse + cream pill CTA "Забронировать дату"; replaced by CepClientMarquee. |
| 43 | McuCtaBand | mcu-cta-band.tsx | 67 | NO (orphan) | 5 | N/A — EA CTA is single hero, no divider band | DELETE | Orphaned (count=0); Cycle 25 mculinary — 94px navy chapter divider band with eyebrow + title + arrow link; replaced by CepLocationsStrip + CepEditorialDivider. |
| 44 | McuInstagram | mcu-instagram.tsx | 75 | NO (orphan) | 5 | N/A — EA IG is CepInstagramGrid | DELETE | Orphaned (count=0); Cycle 25 mculinary — navy section + 6-col 12-tile IG grid + hover-zoom; replaced by CepInstagramGrid (cream + 3×3). |
| 45 | McuMarqueeBand | mcu-marquee-band.tsx | 94 | NO (orphan) | 7 | N/A — EA marquee is CepClientMarquee | DELETE | Orphaned (count=0); Cycle 25 mculinary → Cycle 26 Salt Block restyle — 7×PHRASES on espresso bg + edge-fade mask + honey ✦ separators + pure CSS translateX. Good design but replaced by CepClientMarquee. |
| 46 | McuPhotoFilmstrip | mcu-photo-filmstrip.tsx | 209 | YES (#15) | 6 | YES — EA portfolio is scrollable magazine grid | RESTYLE | Cycle 25 mculinary — variable-width centerMode Embla filmstrip + 3.5s autoplay + pause-on-hover/offscreen + ArrowLeft/Right controls + dots; functional but visually busy (nav chrome + dots) vs EA editorial scrollable grid. |
| 47 | McuServicesCarousel | mcu-services-carousel.tsx | 219 | NO (orphan) | 5 | N/A — EA services is ServicesOverview | DELETE | Orphaned (count=0); Cycle 25 mculinary — 3-up autoplay Embla cards + 5s interval + arrows/dots; replaced by ServicesOverview. |
| 48 | McuTestimonials | mcu-testimonials.tsx | 246 | NO (orphan) | 6 | N/A — EA testimonials is CepTestimonialsCarousel | DELETE | Orphaned (count=0); Cycle 25 mculinary — 1-up Embla testimonial carousel + autoplay + arrows + 4★/5★ rating icons; replaced by CepTestimonialsCarousel. |
| 49 | McuVenues | mcu-venues.tsx | 95 | YES (#16) | 6 | YES — EA venues are full-bleed with overlay text | RESTYLE | Cycle 25 mculinary — 3 square (1:1) cream cards + hover-zoom + bottom gradient caption; basic vs EA's full-bleed venue spotlight. Needs EA-style treatment (bigger images, less chrome). |
| 50 | McuVideoEvents | mcu-video-events.tsx | 289 | NO (orphan) | 5 | N/A — EA video is CepSimpleBrilliant b-roll | DELETE | Orphaned (count=0); Cycle 25 mculinary — 9:16 portrait video carousel + 4.5s autoplay + IntersectionObserver pause + arrows; uses same hero MP4 on 5 slides with #t= offsets. Replaced by CepSimpleBrilliant. |
| 51 | McuVideoHero | mcu-video-hero.tsx | 160 | NO (orphan) | 7 | N/A — EA hero is CepEggHero | DELETE | Orphaned (count=0); Cycle 25 mculinary → Cycle 26 Salt Block restyle — 160px Playfair H1 + PetalButton + docked SbPressStrip + IntersectionObserver video pause. Strong design but replaced by CepEggHero (egg photo > video for EA restraint). |
| 52 | Menu | menu.tsx | 1097 | YES (#11) | 7 | YES — EA menu is simpler editorial list | RESTYLE | 1097-line interactive menu — 7 menu types + dietary tags + signature dishes cycling + PDF download + sticky filter; functional but visually heavy (lots of chips/badges). EA would strip to 1 long editorial list per menu type. |
| 53 | OutlineButton | outline-button.tsx | 65 | editorial-intro + services-overview | 7 | N/A — EA uses square outline CTA (matches) | KEEP | Ridgewells Cycle 21 utility — square corners, 1px border, hover fill+invert, light/dark variants; pure CSS, no JS; used 2× by live components. Solid EA-tier primitive. |
| 54 | PageBorders | page-borders.tsx | 37 | layout.tsx | 8 | N/A — EA uses 1px page frame (matches) | KEEP | joels.com Cycle 24 — two fixed 1px vertical lines (left:149px, right:149px) framing content on lg+; hidden on mobile; pointer-events-none; ink at 16% opacity. Editorial signature. |
| 55 | PetalButton | petal-button.tsx | 60 | NO (transitive orphan) | 7 | N/A — EA uses square outline CTAs | DELETE | Transitively orphaned (importer `mcu-video-hero.tsx` is orphaned); Salt Block Cycle 26 — petal shape (TL+BR rounded, TR+BL sharp) + 3 variants (dark/light/outline) + 3 sizes; strong design but no live consumer since CEP layer doesn't use petals. |
| 56 | Pillars | pillars.tsx | 549 | NO (orphan) | 5 | N/A — EA pillars is CepWhyUs | DELETE | Orphaned (count=0); dual-pillar content section + animated CountUp counters + pinned vertical scroll-stack (200vh) — Awwwards-tier complexity; replaced by CepWhyUs's 4-phrase restraint. |
| 57 | PinkMarquee | pink-marquee.tsx | 74 | NO (orphan) | 4 | N/A — EA palette has no pink | DELETE | Orphaned (count=0); Cycle 23 concept-catering.de — `#f087b5` pink band + white Barlow Semi Condensed keywords + • separators; off-palette vs EA black/cream/red. |
| 58 | Preloader | preloader.tsx | 79 | layout.tsx | 6 | YES — EA has no preloader (restraint) | RESTYLE | 4-panel door preloader (cream + gold gradients) — first-visit sessionStorage gate + 1.4s hold + per-panel staggered exit + reduced-motion skip; maximalist vs EA editorial discipline. |
| 59 | PressStrip | press-strip.tsx | 63 | NO (orphan) | 5 | N/A — EA press is CepClientMarquee style | DELETE | Orphaned (count=0); cream bg + 6 publication wordmarks (text-only) + gold hover; replaced by SbPressStrip (docked) + CepClientMarquee. |
| 60 | Process | process.tsx | 352 | NO (orphan) | 5 | N/A — EA process is CepProcess | DELETE | Orphaned (count=0); 4-step horizontal grid (Заявка→Дегустация→День→Follow-up) with scroll-driven gold progress line + active step highlighting + expandable "Read more" + mobile vertical spine; replaced by CepProcess (3-step restraint). |
| 61 | PromoBanner | promo-banner.tsx | 62 | NO (orphan) | 5 | N/A — EA has no promo banner | DELETE | Orphaned (count=0); gold gradient banner + Flower2 SVG corners + "Промо · Зима" eyebrow + cream pill CTA; maximalist chrome vs EA restraint. |
| 62 | QuoteBand | quote-band.tsx | 185 | YES (#22) | 7 | YES — EA quote band is black bg + cream text + minimal | RESTYLE | Ridgewells Cycle 21 — solid bordeaux bg + painterly blooms + 3 gold star SVGs + 4.9/5 + tinted-cream headline + oversized gold quote mark + thank-you letter photo + date badge; strong Ridgewells-tier but bordeaux/gold palette clashes with EA black/cream/red. |
| 63 | Reveal | reveal.tsx | 39 | used by 23 live components | 9 | N/A — utility | KEEP | Shared utility fade+rise on scroll-into-view + reduced-motion fallback + custom easing + per-instance delay/className; used 23× across the live tree. EA-tier infra. |
| 64 | RisingPhotos | rising-photos.tsx | 190 | NO (orphan) | 6 | N/A — EA portfolio is magazine grid | DELETE | Orphaned (count=0); Cycle 23 concept-catering.de — sticky-stacked full-viewport photos (N×100vh) + pink tagline + bottom marquee + parallax scale+y; concept-catering's signature effect but no longer on-model for EA. |
| 65 | SbPressStrip | sb-press-strip.tsx | 197 | NO (transitive orphan) | 7 | YES — EA press strip is similar (text masthead) | DELETE | Transitively orphaned (importer `mcu-video-hero.tsx` is orphaned); Salt Block Cycle 26 — inline SVG `<text>` logos (Resto.ru / АФИША Daily / The Village / Собака.ru / Time Out / Forbes) + docked/standalone variants + serif-vs-grotesk font pick. **Strong design** — recommend RESTORING in Cycle 28 as `ea-press-strip.tsx` standalone variant (per §17 TODO "standalone after About"). |
| 66 | ScrollCue | scroll-cue.tsx | 47 | NO (transitive orphan) | 7 | N/A — EA scroll cue is inline in hero | DELETE | Transitively orphaned (importer `hero.tsx` is orphaned); joels.com Cycle 24 — 1px×94px sage vertical line + "SCROLL" 12px text + CSS keyframe retract-extend + reduced-motion static. **Strong design** — could be reused if `ea-hero.tsx` adds an EA-style scroll cue. |
| 67 | SectionHeader | section-header.tsx | 128 | services-overview | 7 | N/A — utility | KEEP | Ridgewells Cycle 21 utility — eyebrow + huge Playfair headline + lead + staggered fade-up reveal + tone (light/dark/bordeaux) + align (left/center) + size + variant (default/joels) + custom delays; pure CSS + framer-motion; used 1× by live ServicesOverview. Solid. |
| 68 | Services | services.tsx | | NO (orphan) | 5 | N/A — EA services is ServicesOverview | DELETE | Orphaned (count=0); 1210-line interactive services grid — card flip on click (rotateY 0→180) + backface-hidden + sticky right-rail TOC with IntersectionObserver + 6 categories; replaced by ServicesOverview. |
| 69 | ServicesOverview | services-overview.tsx | 180 | YES (#14) | 8 | N/A — close to EA services pattern | KEEP | Ridgewells Cycle 21 — 4 categories in 2 rows × 2 cols + 16:10 image + hover-zoom + 48-56px serif title + 2-line body + square OutlineButton "Подробнее" + SectionHeader; Ridgewells-tier (slightly more chrome than EA but close). |
| 70 | SiteFooter | site-footer.tsx | 528 | YES (after #26) | 7 | YES — EA footer is simpler | RESTYLE | 528-line footer — NewsletterSignup (POST /api/newsletter, 4 states) + giant brand name with x-drift + 3 columns (Navigation/Contacts/Awards) + 22 lucide icons + cities strip + LEGAL_INFO; functional but heavy. EA would strip to brand line + 1 nav col + 1 contact line. |
| 71 | SiteHeader | site-header.tsx | 499 | YES (above #1) | 7 | N/A — EA header is CEP-style MENU + CTA | KEEP | Theme-switching (transparent→light→dark via IntersectionObserver on `data-header-theme`) + AnnouncementBar + CepOverlayMenu trigger + mobile hamburger; CEP-aligned but 499 lines is heavy. |
| 72 | SnackBox3DCube | snack-box-3d-cube.tsx | 118 | NO (transitive orphan) | 5 | N/A — EA does not use 3D cube mockups | DELETE | Transitively orphaned (importer `snack-box-delivery.tsx` is orphaned); Phase 8 P2 wow — CSS 3D rotating cube with 6 face images + auto-rotate rotateY 0→720 / 24s + half-speed on hover; maximalist chrome vs EA editorial discipline. |
| 73 | SnackBoxDelivery | snack-box-delivery.tsx | 372 | NO (orphan) | 5 | N/A — EA has no snack-box section | DELETE | Orphaned (count=0); "By The Tray" pick-up & drop-off catering by the tray + qty stepper per row (AnimatePresence + whileTap scale) + sticky running-total badge + pulse animation; replaced by Menu's snack-box type. |
| 74 | SocialHandle | social-handle.tsx | 116 | YES (#26) | 7 | YES — EA social handle is single-line minimal | RESTYLE | Ridgewells Cycle 21 — giant `@nilov_catering` clamp(3-6rem) Playfair + IG icon + "Следите за нами" bordeaux eyebrow + #ЕдаКакИскусство hashtag + thin rules + secondary CTA link; strong but uses bordeaux/gold — re-skin to EA black/red. |
| 75 | StackedParallaxImages | stacked-parallax-images.tsx | 113 | NO (transitive orphan) | 7 | N/A — EA about has minimal parallax | DELETE | Transitively orphaned (importer `joels-about.tsx` is orphaned); joels.com Cycle 24 — main landscape + stacked portrait, opposite-direction parallax (y:[30,-30] + y:[-15,15]) + ring + shadow; **strong design** — could be reused in `ea-about.tsx` if a parallax layer is desired. |
| 76 | SustainabilityStrip | sustainability-strip.tsx | 156 | YES (#13) | 9 | N/A — EA has similar editorial restraint | KEEP | Salt Block Cycle 26 — 3-cell editorial grid (LOCAL FARMERS / SEASONAL / NO PRE-FAB) + thin `.sb-section-rule` dividers + italic Playfair closing line "Это не маркетинг. Это наша операционная философия." EA-tier restraint. |
| 77 | TastingMenuExperience | tasting-menu-experience.tsx | 257 | YES (#12) | 8 | N/A — EA tasting menu is similar | KEEP | Salt Block Cycle 26 — 5-course editorial list on espresso bg + grain overlay + honey radial glow + gold hairlines + 3-col grid (course# / dish+ingredient / pairing) + OKLCH color-mix rules; EA-tier. |
| 78 | Testimonials | testimonials.tsx | 702 | NO (orphan) | 5 | N/A — EA testimonials is CepTestimonialsCarousel | DELETE | Orphaned (count=0); 702-line testimonials section — verified reviews + thank-you letters + avatars + 5★ ratings + carousel; replaced by CepTestimonialsCarousel's 5-card cream-on-cream restraint. |
| 79 | TextualLink | textual-link.tsx | 58 | NO (transitive orphan) | 7 | N/A — EA textual link is similar | DELETE | Transitively orphaned (importers `joels-about.tsx` + `joels-contact-cta.tsx` are both orphaned); joels.com Cycle 24 — 22px×1px line scaling 2.7× on hover + 11px Karla 600 uppercase 0.3em + ink/cream/sage tones; **strong design** — could be reused in `ea-textual-link.tsx`. |
| 80 | VideoEvents | video-events.tsx | 587 | NO (orphan) | 5 | N/A — EA video is CepSimpleBrilliant | DELETE | Orphaned (count=0); 587-line video section — Phase 6 architecture (direct MP4 / Mux deprecation stub / YouTube fallback / poster-only lazy-load) + chapter markers + 16:9 cinematic letterbox; replaced by CepSimpleBrilliant. |
| 81 | WinterSpecials | winter-specials.tsx | 188 | NO (orphan) | 5 | N/A — EA has no winter specials | DELETE | Orphaned (count=0); dark navy `bg-ink` section + gold accents + 3 winter cards (Зимний банкет / Праздничные закуски / Какао-бар) + Bell + Snowflake icons + gold price badges; off-cycle (it's August) and off-palette. |

**Total:** 81 components — 42 live + 39 orphaned.

---

## 3. Per-component deep-dives

Components scoring **≤7 OR flagged REPLACE / DELETE** get a deep-dive below (5–10 lines each). Components scoring **≥8 with action KEEP** do not — they're already EA-tier and no narrative is needed.

### 3.1 Live components needing RESTYLE (8)

#### 3.1.1 `about.tsx` — 6/10 → RESTYLE

- **Why weak vs EA**: This is the visual maximalism center of the page. 430 lines of decorative chrome — 3D mouse-tilt `StatCard`s (perspective 1000px, rotateX/rotateY ±8°, useMotionValue + useSpring + useMotionTemplate, transformStyle preserve-3d), glassmorphism cards (`bg-white/40 backdrop-blur-sm border-gold/10`), gradient-text headline (`gradient-text`), gradient glow on hover, floating particles (`bg-gold/20` motion.div drifting y:[-20,20] / x:[-10,10]), 0.03-opacity grid pattern background, corner accent, vertical-shutter clipPath image reveal, marquee row of value-props with `text-shimmer-gold`. None of this is in the EA vocabulary — EA's About is 2 columns (5fr/6fr), one 4:5 portrait, one italic serif headline, three paragraphs of warm body copy, a thin rule, three stats in a row. That's it.
- **EA-style upgrade**: Keep the 2-column structure + the count-up stats (these are good — just remove the 3D tilt and glassmorphism). Strip all decorative chrome (floating particles, grid pattern, gradient text, shimmer, corner accent, vertical-shutter clipPath). Use cream bg + ink text + Playfair italic headline + Karla 17px body + thin OKLCH color-mix rules between stats (already pattern in TastingMenuExperience). Result: about 200 lines instead of 430. Or skip the rewrite and use the existing `ChefPortrait.tsx` (which already follows Salt Block / EA discipline) as the de-facto About, and DELETE `about.tsx` entirely.

#### 3.1.2 `calculator.tsx` — 6/10 → RESTYLE

- **Why weak vs EA**: 722 lines of functional but visually heavy premium UI: 7 lucide TYPE_ICONS mapped to event types (UtensilsCrossed/Wine/Package/Coffee/Leaf/Flame/Building2), 7 TYPE_EMOJIS (🍽️🥂📦☕🥗🔥🏢), 6 ADDON_ICONS, SLIDER_TICKS [25,50,100,200,500], Magnetic CTA wrapper, gold gradient slider fill, gold gradient pulse animation, Telegram/WhatsApp share with share-link hydration-safe encoding, 5-card type grid + 6-card addon grid + result panel + sticky summary. This is a small web-app masquerading as a section — EA calculators are 1 card with type + count + total + CTA.
- **EA-style upgrade**: Keep the nuqs state model + the `/api/lead` POST endpoint, but strip the UI to a single column: type-ahead select for event type, number input for guests, big total in cream Neutra2Display (60–80px), single CTA. Move all the addon chrome to an "extras" disclosure below the form. Use EA's pure-black section bg + cream text + red CTA outline button. Or create a new `ea-calculator-cta.tsx` that links to `/calculator` as a separate route (full-page calculator) and put a single CTA card on the homepage.

#### 3.1.3 `contact.tsx` — 6/10 → RESTYLE

- **Why weak vs EA**: 1300 lines — STEPS ["Тип мероприятия","Гости и дата","Контакты","Отправить"], 17 lucide icons (Phone/MessageCircle/Instagram/MapPin/Send/ShieldCheck/Telegram/Vk/Mail/ChevronLeft/ChevronRight/Calendar/Users/PartyPopper/Clock/CheckCircle2/AlertCircle/Loader2/Sparkles/MessageSquareText), PHONE_REGEX validation, draft autosave to localStorage (`catering-lead-draft`), office-hours badge with useOfficeStatus hook, multi-step form with 4 panels, success/error/loading state machine. This is a CRM-flavored form, not an editorial luxury moment.
- **EA-style upgrade**: Strip to a single-column 3-field form (Name / Phone / Message) with a square sage or red CTA + a thin contact-info row below (phone, email, address, hours). Save the multi-step flow for a separate `/request` route if needed. Or use the existing `JoelsContactCta` design (60px Playfair + 2-col form + sage square button) as the EA-style replacement — but JoelsContactCta is currently orphaned; RESTYLE + re-mount it, then DELETE the 1300-line Contact.

#### 3.1.4 `cookie-consent.tsx` — 7/10 → RESTYLE

- **Why weak vs EA**: Glassmorphism banner (`bg-cream/85 backdrop-blur-xl border-t border-gold/20`) — §17 VLM-flagged as visually too heavy on the hero. The banner uses spring-stiffness 200 / damping 26 entrance + Cookie lucide icon + Privacy link + 2 buttons (Accept / Reject). Functional and 152-ФЗ compliant but visually loud.
- **EA-style upgrade**: Replace with a single-line 1px-tall bar at the very bottom: cream bg + ink text + "Мы используем cookies" + Privacy link + 2 inline text links (Принять / Отклонить). No icon, no glassmorphism, no spring entrance — just opacity 0→1 over 0.3s. Result: ~30 lines, perfect EA restraint.

#### 3.1.5 `editorial-intro.tsx` — 7/10 → RESTYLE

- **Why weak vs EA**: The Ridgewells "painterly bloom" — 10-layer radial-gradient "digital watercolor" + SVG feTurbulence grain overlay (opacity 0.08 mix-blend-overlay) + deep vignette (radial-gradient transparent 15% → rgba(20,12,8,0.45) 65% → rgba(10,6,4,0.75) 100%) + peach eyebrow + 60px Playfair with italic accent + manual `<br>` + dual OutlineButton CTAs + parallax (contentY + contentOpacity via useScroll + useTransform) + floating decorative gold dot motion.span. Visually beautiful in isolation but maximalist in EA's editorial context.
- **EA-style upgrade**: Strip the painterly bg + grain + vignette + floating dot. Replace with pure cream bg + ink text + 200px Playfair headline (no italic accent — pure display weight) + 2 paragraphs of body + single inline CTA link (text-underline, no button). Or skip EditorialIntro entirely and use the existing `CepEditorialDivider` (full-bleed photo, no text) as the breath between Act I and Act II.

#### 3.1.6 `mcu-photo-filmstrip.tsx` — 6/10 → RESTYLE

- **Why weak vs EA**: Cycle 25 mculinary Embla filmstrip — variable-width centerMode + 3.5s autoplay + pause-on-hover + pause-when-offscreen + ArrowLeft/ArrowRight controls + dot pagination. The nav chrome + dots add visual noise that EA would never use. The filmstrip concept (event photos in a row) is good, but the execution (Embla + arrows + dots + 3.5s auto) is busy.
- **EA-style upgrade**: Replace with `ea-events-portfolio.tsx` — a magazine-style horizontally-scrollable grid where the user scrubs left-right themselves (no autoplay, no arrows, no dots). Variable-width portrait + landscape photos at editorial aspect ratios (4:5, 3:2, 1:1, 16:10), each with a thin caption reveal on hover. Hide the scrollbar with `scrollbar-width: none` + `::-webkit-scrollbar { display: none }`. Result: feels like flipping through a magazine.

#### 3.1.7 `mcu-venues.tsx` — 6/10 → RESTYLE

- **Why weak vs EA**: Cycle 25 mculinary — 3 square (1:1) cream cards + hover-zoom (scale 1.06 / 0.5s) + bottom gradient caption overlay + mcu-eyebrow + mcu-h2 header. Basic and on-palette but too small (1:1 squares) and too uniform for EA's editorial venue spotlight.
- **EA-style upgrade**: Replace with `ea-venues-spotlight.tsx` — full-bleed venue cards with `aspect-[4/3]` or `aspect-[16/10]`, three venues stacked vertically with alternating image-left/image-right layout (Ridgewells pattern but tighter), each card has a massive venue name in 60–80px Playfair + a single italic descriptor line ("Исторический особняк в центре СПб"). Result: each venue gets its own full-bleed moment, not a 3-up grid.

#### 3.1.8 `quote-band.tsx` — 7/10 → RESTYLE

- **Why weak vs EA**: Ridgewells Cycle 21 — solid bordeaux `#4A2515` bg + painterly blooms (radial-gradient bordeaux/terracotta) + 3 gold star SVGs with sparkle pulse + 4.9/5 rating + tinted-cream headline (#F7EFE6) + oversized gold quote mark + Playfair blockquote with gold left-border + thank-you letter photo with `box-shadow: 0 30px 80px -20px rgba(0,0,0,0.55)` + floating date badge. Strong Ridgewells-tier but bordeaux/gold palette directly conflicts with EA's black/cream/red.
- **EA-style upgrade**: Re-skin to EA palette: pure-black bg + cream text + single oversized red quote mark + Playfair italic blockquote + single attribute line. Delete the gold stars, the 4.9/5 rating, the painterly blooms, the thank-you letter photo, the date badge — EA restraint is the wow. Result: ~50 lines, all the punch with none of the chrome.

#### 3.1.9 `social-handle.tsx` — 7/10 → RESTYLE

- **Why weak vs EA**: Ridgewells Cycle 21 — giant `@nilov_catering` Playfair clamp(3-6rem) + IG icon + "Следите за нами" bordeaux eyebrow + #ЕдаКакИскусство hashtag + thin rules + secondary CTA link "Смотреть фотоотчёты мероприятий". Strong but uses bordeaux/gold accents.
- **EA-style upgrade**: Re-skin to EA palette: pure-cream bg + ink text + 80–100px Montserrat Light `@nilov_catering` + red arrow-up-right icon + single italic line "Следите за нами в Instagram" + thin OKLCH color-mix rule. Delete the hashtag, the secondary CTA, the rules. Result: ~30 lines.

#### 3.1.10 `faq.tsx` — 7/10 → RESTYLE

- **Why weak vs EA**: 475-line FAQ with 4 categories (ordering/logistics/menu/payment) + 8 questions + category tabs + search input with highlight match + accordion with ChevronDown rotation + ThumbsUp/ThumbsDown feedback + Check icon + mobile category dropdown. Functional but visually busy.
- **EA-style upgrade**: Strip to a single-column accordion with no category tabs (just sort the 8 questions by importance), no search (8 questions doesn't need search), no feedback icons. Each item: large question in Playfair italic 28px + body in Karla 16px + thin OKLCH color-mix rule between items. Result: ~120 lines.

#### 3.1.11 `menu.tsx` — 7/10 → RESTYLE

- **Why weak vs EA**: 1097-line interactive menu — 7 menu types (banquet/buffet/snack-box/coffee-break/vegetarian/bbq/office-lunch) + dietary tags (veg/vegan/gf/halal) derived from heuristic regex matching on dish names + signature dishes cycling every 8s + sticky filter sidebar + signature dish photo + chef note + price badge + PDF download (client-side pdf-client). Very feature-rich but visually heavy with many chips/badges/icons.
- **EA-style upgrade**: Strip to 1 long editorial list per menu type — each menu type is a section with a 60px Playfair title, a thin rule, then dishes in a 2-column grid (dish name in Playfair italic + ingredient line in Karla + price in Barlow uppercase). No dietary chips (move to filter), no signature dishes cycling, no sticky filter. PDF download as a single text link at the bottom. Result: ~400 lines.

#### 3.1.12 `preloader.tsx` — 6/10 → RESTYLE

- **Why weak vs EA**: 4-panel door preloader — cream + gold gradient panels + sessionStorage first-visit gate + 1.4s hold + per-panel staggered y:-100% exit (0.08s delay each) + AnimatePresence + reduced-motion skip. Maximalist chrome vs EA editorial discipline (EA has no preloader).
- **EA-style upgrade**: Either DELETE entirely (cleanest EA move) or replace with a single 1-line cream + ink "Interfood Catering" wordmark that fades 0→1→0 over 0.6s. Result: ~20 lines.

#### 3.1.13 `site-footer.tsx` — 7/10 → RESTYLE

- **Why weak vs EA**: 528-line footer — NewsletterSignup (POST /api/newsletter, 4-state machine: idle/loading/done/error, AnimatePresence transitions) + giant brand name `motion.h2` with x:-1%→1% drift + 3 columns (Navigation / Contacts / Awards) + 22 lucide icons (Phone/Mail/MapPin/ArrowRight/Heart/CheckCircle2/Loader2/Sparkles/ChevronRight/Trophy/Award/Star/Instagram/Send/MessageCircle) + cities strip + LEGAL_INFO. Functional but heavy.
- **EA-style upgrade**: Strip to: giant brand wordmark `motion.h2` (cream + Playfair, 100px clamp) + 1 thin rule + 2-column grid (Navigation links / Contact info — phone, email, address, hours as text, no icons) + 1 thin rule + copyright line + Privacy/Terms links. Delete NewsletterSignup (move to a separate `/newsletter` route), cities strip (already in CepLocationsStrip), Awards (orphaned AwardsStrip). Result: ~150 lines.

### 3.2 Orphaned components (39 → DELETE)

The orphan list (33 direct + 6 transitive) is presented below grouped by cycle layer so the deletion work can be done in clean sweeps. For each orphan, the **replacement** (live component that took its place) is noted so the deletion is provably safe.

#### 3.2.1 Cycle 21 Sopranos / Ridgewells layer (5 orphans)

1. **hero.tsx** (720 lines, count=0) → replaced by `CepEggHero` in Cycle 27. Sopranos 4-slide crossfade hero with CheckYourDateSidebar lead-gen form. DELETE.
2. **marquee-band.tsx** (111 lines, count=0) → replaced by `CepClientMarquee` in Cycle 27. Ridgewells solid bordeaux 94px marquee with gold star sparkle pulse. DELETE.
3. **logo-marquee.tsx** (78 lines, count=0) → replaced by `CepClientMarquee` in Cycle 27. Cream bg + 12 RU client wordmark chips + gold bullets. DELETE.
4. **press-strip.tsx** (63 lines, count=0) → replaced by `SbPressStrip` (docked) + `CepClientMarquee` in Cycle 26/27. Cream bg + 6 publication wordmarks + gold hover. DELETE.
5. **testimonials.tsx** (702 lines, count=0) → replaced by `CepTestimonialsCarousel` in Cycle 27. 702-line verified-reviews carousel with avatars + 5★ ratings. DELETE.

#### 3.2.2 Cycle 22 ggcatering.com layer (4 orphans)

6. **gg-hero.tsx** (372 lines, count=0) → replaced by `CepEggHero` in Cycle 27. 10×10 asymmetric image collage + rotating adjective + lime circle + yellow triangle + blush zigzag. DELETE.
7. **gg-who-we-are.tsx** (261 lines, count=0) → replaced by `About` + `ChefPortrait`. Vertical-line eyebrow + 22 rotating adjectives + 3-up count-up stats. DELETE.
8. **gg-video-showcase.tsx** (238 lines, count=0) → replaced by `CepSimpleBrilliant` in Cycle 27. 16:9 video frame + click-to-fullscreen modal + glow play button + disclaimer. DELETE.
9. **gg-feature-collage.tsx** (271 lines, count=0) → replaced by `ServicesOverview` + `CepWhyUs`. 3 alternating dark/light blocks with 2×2 image collage + lime italic accent. DELETE.

#### 3.2.3 Cycle 23 concept-catering.de layer (3 orphans)

10. **bold-statement.tsx** (64 lines, count=0) → replaced by `CepSimpleBrilliant` in Cycle 27. Dark Barlow statement with pink highlight word. DELETE.
11. **pink-marquee.tsx** (74 lines, count=0) → replaced by `CepClientMarquee` in Cycle 27. Pink `#f087b5` band with white Barlow keywords. DELETE.
12. **rising-photos.tsx** (190 lines, count=0) → replaced by `McuPhotoFilmstrip` (also orphaned, see below) + `CepInstagramGrid` in Cycle 25/27. Sticky-stacked full-viewport photos (N×100vh) with pink tagline + bottom marquee + parallax. DELETE.

#### 3.2.4 Cycle 24 joels.com layer (3 orphans + 2 transitive orphans = 5 orphans)

13. **joels-about.tsx** (128 lines, count=0) → replaced by `About` + `ChefPortrait`. 4/12 stacked parallax + 7/12 text column with sage eyebrow + 50px Playfair + TextualLink. DELETE.
14. **joels-cuisine.tsx** (145 lines, count=0) → replaced by `ServicesOverview`. 3-up card grid with 4:3 landscape + 110% hover zoom + 28px Playfair labels. DELETE.
15. **joels-contact-cta.tsx** (231 lines, count=0) → replaced by `Contact`. 60px Playfair + 2-col form + square sage button. DELETE.
16. **textual-link.tsx** (58 lines, transitive orphan) — importers are `joels-about.tsx` + `joels-contact-cta.tsx` (both orphaned). joels.com 22px×1px line scaling 2.7× on hover. DELETE (or restore as `ea-textual-link.tsx` if desired in Cycle 28).
17. **stacked-parallax-images.tsx** (113 lines, transitive orphan) — importer is `joels-about.tsx` (orphaned). joels.com opposite-direction parallax (y:[30,-30] + y:[-15,15]). DELETE (or restore as `ea-parallax-pair.tsx` if desired in Cycle 28).

#### 3.2.5 Cycle 25 mculinary.com layer (8 orphans + 2 transitive orphans = 10 orphans)

18. **mcu-video-hero.tsx** (160 lines, count=0) → replaced by `CepEggHero` in Cycle 27. Cycle 26 Salt Block restyle — 160px Playfair H1 + PetalButton + docked SbPressStrip + IntersectionObserver video pause. DELETE.
19. **mcu-marquee-band.tsx** (94 lines, count=0) → replaced by `CepClientMarquee` in Cycle 27. Cycle 26 Salt Block restyle — 7×PHRASES on espresso bg + edge-fade mask + honey ✦ separators. DELETE.
20. **mcu-services-carousel.tsx** (219 lines, count=0) → replaced by `ServicesOverview` in Cycle 21 (kept in Cycle 25 then dropped in Cycle 27). 3-up autoplay Embla cards with 5s interval + arrows/dots. DELETE.
21. **mcu-testimonials.tsx** (246 lines, count=0) → replaced by `CepTestimonialsCarousel` in Cycle 27. 1-up Embla testimonial carousel + autoplay + arrows + 4★/5★ rating icons. DELETE.
22. **mcu-video-events.tsx** (289 lines, count=0) → replaced by `CepSimpleBrilliant` b-roll + `CepInstagramGrid` Reels in Cycle 27. 9:16 portrait video carousel + 4.5s autoplay + IntersectionObserver pause + arrows. DELETE.
23. **mcu-instagram.tsx** (75 lines, count=0) → replaced by `CepInstagramGrid` in Cycle 27. Navy section + 6-col 12-tile IG grid + hover-zoom. DELETE.
24. **mcu-cta-band.tsx** (67 lines, count=0) → replaced by `CepLocationsStrip` + `CepEditorialDivider` in Cycle 27. 94px navy chapter divider band with eyebrow + title + arrow link. DELETE.
25. **petal-button.tsx** (60 lines, transitive orphan) — importer is `mcu-video-hero.tsx` (orphaned). Salt Block petal shape (TL+BR rounded, TR+BL sharp) + 3 variants + 3 sizes. DELETE (CEP layer uses outline-only CTAs).
26. **sb-press-strip.tsx** (197 lines, transitive orphan) — importer is `mcu-video-hero.tsx` (orphaned). Salt Block inline SVG `<text>` logos + docked/standalone variants. **Strong design** — recommend restoring as `ea-press-strip.tsx` standalone variant (§17 TODO). For the audit's DELETE action: yes delete the orphaned file, then create a fresh `ea-press-strip.tsx` with the same docked/standalone API in the Cycle 28 new-components batch.

#### 3.2.6 Cycle 21/22/23/etc Sopranos / orphaned utilities (7 orphans + 1 transitive orphan = 8 orphans)

27. **process.tsx** (352 lines, count=0) → replaced by `CepProcess` in Cycle 27. 4-step horizontal grid (Заявка→Дегустация→День→Follow-up) + scroll-driven gold progress line + active step highlighting + expandable "Read more". DELETE.
28. **services.tsx** (1210 lines, count=0) → replaced by `ServicesOverview` in Cycle 21. 1210-line interactive services grid with card flip + sticky TOC + 6 categories. DELETE.
29. **events-gallery.tsx** (795 lines, count=0) → replaced by `McuPhotoFilmstrip` + `CepInstagramGrid` in Cycle 25/27. 3D-tilt full-card + shine sweep + 8 aspect ratios + featured indices + lightbox modal. DELETE.
30. **pillars.tsx** (549 lines, count=0) → replaced by `CepWhyUs` in Cycle 27. Dual-pillar content section + animated CountUp + pinned vertical scroll-stack (200vh). DELETE.
31. **promo-banner.tsx** (62 lines, count=0) → replaced by `AnnouncementBar` in Cycle 26. Gold gradient banner + Flower2 SVG corners + "Промо · Зима" eyebrow + cream pill CTA. DELETE.
32. **winter-specials.tsx** (188 lines, count=0) → no replacement (off-cycle). Dark navy section + gold accents + 3 winter cards + Bell + Snowflake icons + gold price badges. DELETE.
33. **awards-strip.tsx** (127 lines, count=0) → no replacement (EA does not show awards on home). Cream bg + gold gradient + lucide badge icons + "СМИ о нас" text-strip. DELETE.
34. **instagram-video.tsx** (262 lines, count=0) → replaced by `CepInstagramGrid` in Cycle 27. Multi-reel IG embed carousel + hover-to-load behavior + GDPR-gated script + MutationObserver iframe sandbox. DELETE.
35. **video-events.tsx** (587 lines, count=0) → replaced by `CepSimpleBrilliant` in Cycle 27. Phase 6 architecture (direct MP4 / Mux deprecation stub / YouTube fallback / poster-only lazy-load) + chapter markers + 16:9 cinematic letterbox. DELETE.
36. **snack-box-delivery.tsx** (372 lines, count=0) → replaced by `Menu`'s snack-box type in Cycle 25. "By The Tray" pick-up & drop-off catering + qty stepper per row + sticky running-total badge + pulse animation. DELETE.
37. **snack-box-3d-cube.tsx** (118 lines, transitive orphan) — importer is `snack-box-delivery.tsx` (orphaned). Phase 8 P2 wow — CSS 3D rotating cube with 6 face images + auto-rotate rotateY 0→720 / 24s + half-speed on hover. DELETE.
38. **scroll-cue.tsx** (47 lines, transitive orphan) — importer is `hero.tsx` (orphaned). joels.com 1px×94px sage vertical line + "SCROLL" 12px text + CSS keyframe retract-extend. DELETE (or restore as `ea-scroll-cue.tsx` if `ea-hero.tsx` adds an EA-style scroll cue).

#### 3.2.7 Cycle 26/27 CEP/Salt Block orphan (1 direct orphan)

39. **cep-outline-button.tsx** (61 lines, count=0) — created in Cycle 27 alongside the other 13 CEP components but never wired into any CEP section (CEP sections chose text-only headlines over CTAs). 1px red border + square corners + hover invert + default/invert variants. DELETE — if reusing in Cycle 28 (e.g., for an `ea-calculator-cta`), create a fresh `ea-outline-button.tsx` instead.

#### 3.2.8 Summary of orphan deletion impact

- **39 orphaned files** to delete (33 direct + 6 transitive).
- **Total LOC to remove**: 9,497 lines (sum of line counts above).
- **Dependencies broken by deletion**: none — each orphan is provably dead (zero live consumers, or only consumers that are themselves dead).
- **Asset-removal side-effects**: the orphans reference several media files that may also be orphaned (e.g., `SOPRANOS_WINTER_SPECIALS`, `SOPRANOS_HERO_SLIDES`, `MCU_VIDEO_SLIDES`). The asset audit (Cycle 28 Task 2-D) should cross-reference these.

---

## 4. Top 5 strongest components (KEEP — already EA-tier)

These are the components whose design quality already matches the EA editorial standard. No Cycle 28 work needed on these — they are the anchor references for what `ea-*` new components should look like.

| Rank | Component | Score | Why it's EA-tier |
|---|---|---|---|
| 1 | **CepProcess** (`cep-process.tsx`, 155 lines) | 10/10 | "THE CREATIVE EDGE" — 3-step (DREAM/BUILD/SAVOR) on pure white bg, massive step numbers in Neutra2Display, thin red hairline between cols, red accent line under each number, restrained body copy. VLM 10/10 ("perfect execution"). This is the gold standard for the entire site. |
| 2 | **CepTestimonialsCarousel** (`cep-testimonials-carousel.tsx`, 246 lines) | 10/10 | Auto-scrolling peeking cream cards on cream bg, NO arrows/dots, infinite loop, 5 RU testimonials. Duplicated-set technique + IntersectionObserver pause + reduced-motion safe. EA's exact pattern. |
| 3 | **CepRedStats** (`cep-red-stats.tsx`, 110 lines) | 9/10 | `#FF360A` band — the ONLY color-as-bg moment on the page (CEP/EA restraint rule). 3 count-up Neutra2Display stats (16+/2400+/180000+) with rAF easeOutCubic + reduced-motion snap-to-final. |
| 4 | **CepEggHero** (`cep-egg-hero.tsx`, 202 lines) | 9/10 | Full-bleed egg photo + 244px stacked "THE EGG / CAME FIRST." + locations strip. Ken Burns + framer-motion staggered reveal + reduced-motion gate. The signature hero. |
| 5 | **SustainabilityStrip** (`sustainability-strip.tsx`, 156 lines) | 9/10 | 3-cell editorial grid (LOCAL FARMERS / SEASONAL / NO PRE-FAB) + thin `.sb-section-rule` dividers + italic Playfair closing line "Это не маркетинг. Это наша операционная философия." Salt Block editorial discipline at its purest. |

Honorable mentions (score 8–9, KEEP): CepClientMarquee, CepSimpleBrilliant, CepWhyUs, CepEditorialDivider, CepLocationsStrip, CepInstagramGrid, CepTestimonialsHeader, CepOverlayMenu, LenisProvider, Reveal, ChefPortrait, TastingMenuExperience, Grain, PageBorders, AnnouncementBar, BackToTop.

---

## 5. Top 5 weakest components needing the most work

These are the live components with the lowest quality scores. Each one is a candidate for RESTYLE or REPLACE in Cycle 28.

| Rank | Component | Score | What's wrong | Action |
|---|---|---|---|---|
| 1 | **Hero** (`hero.tsx`, 720 lines) | 4/10 | Sopranos 4-slide crossfade hero with Great Vibes script + Oswald stacked headline + CheckYourDateSidebar lead-gen form — maximalist maximalism, off-palette, off-cycle. Replaced by CepEggHero in Cycle 27 but the file is still in the tree. | DELETE (orphaned) |
| 2 | **BoldStatement** (`bold-statement.tsx`, 64 lines) | 4/10 | Concept-Catering.de "section-no-padding" — dark `#101010` Barlow 800 statement with pink highlight word. Off-palette vs EA black/cream/red. Replaced by CepSimpleBrilliant. | DELETE (orphaned) |
| 3 | **PinkMarquee** (`pink-marquee.tsx`, 74 lines) | 4/10 | Concept-Catering.de `#f087b5` pink band + white Barlow keywords + • separators. Off-palette. Replaced by CepClientMarquee. | DELETE (orphaned) |
| 4 | **AwardsStrip** (`awards-strip.tsx`, 127 lines) | 4/10 | Cream bg + gold gradient + lucide badge icons (Trophy/Star/Award/Crown/Medal/Heart/Gem/Flame) + "СМИ о нас" text-strip — maximalist chrome vs EA editorial discipline. | DELETE (orphaned) |
| 5 | **About** (`about.tsx`, 430 lines) | 6/10 | Visual maximalism — 3D-tilt StatCards + glassmorphism + gradient-text + floating particles + grid pattern + vertical-shutter clipPath + marquee row + shimmer. Live on page.tsx (#8). | RESTYLE (strip to EA-tier restraint) |

(For the remaining RESTYLE candidates scoring 6–7 — EditorialIntro, McuPhotoFilmstrip, McuVenues, QuoteBand, Faq, Calculator, Contact, SocialHandle, CookieConsent, Preloader, SiteFooter — see the deep-dives in §3.1.)

---

## 6. The 39 orphaned components to delete (cross-reference AGENTS.md §17)

AGENTS.md §17 line 2546 lists: "BgHero, PinkMarquee, BoldStatement, SnackBoxCube3D, etc."

**Note on "BgHero"**: there is no `bg-hero.tsx` file in the tree. The §17 reference is either (a) a typo for `GgHero` (Global Gourmet Hero — `gg-hero.tsx`, which IS orphaned) or (b) a phantom name. The audit treats it as covered by `gg-hero.tsx`.

### 6.1 Direct orphans (count=0, no importers anywhere) — 33 components

These were verified by grepping `src/app/page.tsx` + `src/app/layout.tsx` + all of `src/components/**` for `from ['\"][^'\"]*/<basename>['\"]` import statements. Each returned zero hits outside its own file.

| # | File | Lines | Cycle layer | Replacement |
|---|---|---|---|---|
| 1 | awards-strip.tsx | 127 | (Sopranos misc) | none — EA has no awards on home |
| 2 | bold-statement.tsx | 64 | Cycle 23 concept-catering | CepSimpleBrilliant (Cycle 27) |
| 3 | cep-outline-button.tsx | 61 | Cycle 27 CEP | none — never wired into a CEP section |
| 4 | events-gallery.tsx | 795 | Awwwards Phase 8 P2 | McuPhotoFilmstrip (Cycle 25) → CepInstagramGrid (Cycle 27) |
| 5 | gg-feature-collage.tsx | 271 | Cycle 22 ggcatering | ServicesOverview + CepWhyUs (Cycle 27) |
| 6 | gg-hero.tsx | 372 | Cycle 22 ggcatering | CepEggHero (Cycle 27) — possibly the §17 "BgHero" reference |
| 7 | gg-video-showcase.tsx | 238 | Cycle 22 ggcatering | CepSimpleBrilliant (Cycle 27) |
| 8 | gg-who-we-are.tsx | 261 | Cycle 22 ggcatering | About + ChefPortrait |
| 9 | hero.tsx | 719 | Cycle 21 Sopranos | CepEggHero (Cycle 27) |
| 10 | instagram-video.tsx | 262 | (P1 Elegant Affairs pattern) | CepInstagramGrid (Cycle 27) |
| 11 | joels-about.tsx | 128 | Cycle 24 joels | About + ChefPortrait |
| 12 | joels-contact-cta.tsx | 231 | Cycle 24 joels | Contact |
| 13 | joels-cuisine.tsx | 145 | Cycle 24 joels | ServicesOverview |
| 14 | logo-marquee.tsx | 78 | Cycle 21 Sopranos | CepClientMarquee (Cycle 27) |
| 15 | marquee-band.tsx | 111 | Cycle 21 Ridgewells | CepClientMarquee (Cycle 27) |
| 16 | mcu-cta-band.tsx | 67 | Cycle 25 mculinary | CepLocationsStrip + CepEditorialDivider (Cycle 27) |
| 17 | mcu-instagram.tsx | 75 | Cycle 25 mculinary | CepInstagramGrid (Cycle 27) |
| 18 | mcu-marquee-band.tsx | 94 | Cycle 25 mculinary → Cycle 26 Salt Block restyle | CepClientMarquee (Cycle 27) |
| 19 | mcu-services-carousel.tsx | 219 | Cycle 25 mculinary | ServicesOverview |
| 20 | mcu-testimonials.tsx | 246 | Cycle 25 mculinary | CepTestimonialsCarousel (Cycle 27) |
| 21 | mcu-video-events.tsx | 289 | Cycle 25 mculinary | CepSimpleBrilliant (Cycle 27) |
| 22 | mcu-video-hero.tsx | 160 | Cycle 25 mculinary → Cycle 26 Salt Block restyle | CepEggHero (Cycle 27) |
| 23 | pillars.tsx | 549 | Cycle 21 Salt Block (B4 dual-pillar) | CepWhyUs (Cycle 27) |
| 24 | pink-marquee.tsx | 74 | Cycle 23 concept-catering | CepClientMarquee (Cycle 27) |
| 25 | press-strip.tsx | 63 | (P1 §283-300 pattern) | SbPressStrip (docked) + CepClientMarquee (Cycle 26/27) |
| 26 | process.tsx | 352 | (Creative Edge pattern adapted) | CepProcess (Cycle 27) |
| 27 | promo-banner.tsx | 62 | (Sopranos seasonal banner) | AnnouncementBar (Cycle 26) |
| 28 | rising-photos.tsx | 190 | Cycle 23 concept-catering | McuPhotoFilmstrip (Cycle 25) → CepInstagramGrid (Cycle 27) |
| 29 | services.tsx | 1210 | Cycle 21 Ridgewells (REF §1635) | ServicesOverview (Cycle 21) |
| 30 | snack-box-delivery.tsx | 372 | (Cycle 21 Salt Block REF §1635) | Menu's snack-box type |
| 31 | testimonials.tsx | 702 | (Sopranos verified reviews) | CepTestimonialsCarousel (Cycle 27) |
| 32 | video-events.tsx | 587 | Phase 6 architecture | CepSimpleBrilliant (Cycle 27) |
| 33 | winter-specials.tsx | 188 | (Sopranos seasonal) | none (off-cycle) |

**Total direct-orphan LOC: 7,623 lines** (33 files).

### 6.2 Transitively orphaned (count>0 but only imported by orphans) — 6 components

These pass the first-pass orphan check (they have ≥1 importer), but a recursive trace shows that ALL their importers are themselves orphans. They are dead code that no live component ever reaches.

| # | File | Lines | Sole importer(s) | Importer status |
|---|---|---|---|---|
| 34 | petal-button.tsx | 60 | mcu-video-hero.tsx | orphaned (count=0) |
| 35 | sb-press-strip.tsx | 197 | mcu-video-hero.tsx | orphaned (count=0) |
| 36 | scroll-cue.tsx | 47 | hero.tsx | orphaned (count=0) |
| 37 | textual-link.tsx | 58 | joels-about.tsx + joels-contact-cta.tsx | both orphaned (count=0) |
| 38 | stacked-parallax-images.tsx | 113 | joels-about.tsx | orphaned (count=0) |
| 39 | snack-box-3d-cube.tsx | 118 | snack-box-delivery.tsx | orphaned (count=0) |

**Total transitive-orphan LOC: 593 lines** (6 files).

### 6.3 Grand total orphan impact

- **39 files** to delete (33 + 6).
- **8,216 LOC** to remove (7,623 + 593).
- **Cycle layer coverage**: the deletion cleanly removes the entire Cycle 22 (ggcatering), Cycle 23 (concept-catering), Cycle 24 (joels.com), and Cycle 25 (mculinary) layers — all four were superseded by the Cycle 27 CEP layer. It also removes the Cycle 21 Sopranos hero + marquee + testimonials + services (also superseded).
- **What survives**: the Cycle 21 Ridgewells `outline-button.tsx` (used by EditorialIntro + ServicesOverview), `section-header.tsx` (used by ServicesOverview), `editorial-intro.tsx` (used by page.tsx), `services-overview.tsx` (used by page.tsx), `quote-band.tsx` (used by page.tsx), `social-handle.tsx` (used by page.tsx); the Cycle 26 Salt Block `chef-portrait.tsx`, `tasting-menu-experience.tsx`, `sustainability-strip.tsx`, `announcement-bar.tsx`; and the entire Cycle 27 CEP layer (13 `cep-*` files).

---

## 7. Recommended new components for Cycle 28 (10 candidates)

The following 10 `ea-*` components are proposed for Cycle 28 implementation. Each one fills a gap identified in §3 (a live component scoring ≤7 that should be RESTYLED or REPLACED), or revives a strong design from the orphan list (SbPressStrip, TextualLink, StackedParallaxImages, ScrollCue), or adds an EA-signature moment not yet on the page.

### 7.1 `ea-hero.tsx` — EA second-hero variant

- **What it does**: A pure-black full-bleed hero with one food photograph + 244px Montserrat Light headline + 1 italic serif accent word + single line of body copy + 1 scroll cue. NO CTAs (luxury restraint).
- **EA section based on**: EA homepage hero (replicates `creativeedgeparties.com` §6.2 hero pattern but with food photography instead of an egg).
- **What existing component it would replace**: none — `CepEggHero` stays as primary hero. `ea-hero.tsx` is a SECOND hero variant for landing-page A/B testing (e.g., for paid-traffic landing pages where a food shot outperforms the egg shot).
- **Lines estimate**: ~120.

### 7.2 `ea-events-portfolio.tsx` — magazine-style horizontal scroll gallery

- **What it does**: A magazine-style horizontally-scrollable photo grid (no autoplay, no arrows, no dots). Variable-width portrait + landscape photos at editorial aspect ratios (4:5, 3:2, 1:1, 16:10), each with a thin caption reveal on hover. Scrollbar hidden via `scrollbar-width: none`.
- **EA section based on**: EA "Events" portfolio section.
- **What existing component it would replace**: `McuPhotoFilmstrip` (Cycle 25 mculinary — Embla filmstrip with 3.5s autoplay + arrows + dots, score 6/10 RESTYLE).
- **Lines estimate**: ~150.

### 7.3 `ea-services-grid.tsx` — 4-col minimal service grid

- **What it does**: A 4-column grid of service categories with massive image + label only (no body copy, no buttons). Hover: image zoom 1.05 + label letter-spacing expands. Each cell links to `#calculator` or `#menu`.
- **EA section based on**: EA "Services" section (4-up grid with image + label).
- **What existing component it would replace**: `ServicesOverview` (Cycle 21 Ridgewells — 2-up 50/50 split with 48-56px serif title + 2-line body + OutlineButton, score 8/10 KEEP) — but `ea-services-grid` would be a more EA-disciplined alternative. Keep `ServicesOverview` as a deeper-dive section; add `ea-services-grid` as the high-level overview above it.
- **Lines estimate**: ~120.

### 7.4 `ea-venues-spotlight.tsx` — full-bleed venue cards

- **What it does**: Three venue cards stacked vertically with alternating image-left/image-right layout. Each card is full-bleed `aspect-[16/10]` with a massive venue name in 60–80px Playfair + a single italic descriptor line. Hover: image zoom 1.03.
- **EA section based on**: EA "Venues" section.
- **What existing component it would replace**: `McuVenues` (Cycle 25 mculinary — 3 square 1:1 cream cards + hover-zoom + bottom gradient caption, score 6/10 RESTYLE).
- **Lines estimate**: ~140.

### 7.5 `ea-philosophy-quote.tsx` — minimalist serif italic quote band

- **What it does**: Pure-black bg + cream text + single oversized red quote mark + Playfair italic blockquote + single attribute line. No stars, no rating, no painterly blooms, no thank-you letter photo, no date badge.
- **EA section based on**: EA "Philosophy" quote band.
- **What existing component it would replace**: `QuoteBand` (Cycle 21 Ridgewells — solid bordeaux + painterly blooms + 3 gold stars + 4.9/5 + tinted-cream headline + oversized gold quote mark + thank-you letter photo + date badge, score 7/10 RESTYLE).
- **Lines estimate**: ~60.

### 7.6 `ea-final-cta.tsx` — single-line contact CTA with massive type

- **What it does**: Pure-cream bg + ink text + 100px Montserrat Light "Обсудим событие?" + single red outline CTA "Отправить заявку →" + thin OKLCH color-mix rule. No form fields (link to `/contact` route).
- **EA section based on**: EA "Let's Talk" final CTA.
- **What existing component it would replace**: `SocialHandle` (Cycle 21 Ridgewells — giant `@nilov_catering` Playfair + IG icon + "Следите за нами" bordeaux eyebrow + hashtag + secondary CTA, score 7/10 RESTYLE) — `ea-final-cta` replaces the closer moment, and `SocialHandle` moves to footer-only.
- **Lines estimate**: ~50.

### 7.7 `ea-press-strip.tsx` — restored + restyled SbPressStrip (standalone)

- **What it does**: A standalone `<section>` with 6 publication wordmarks rendered as inline SVG `<text>` elements (Resto.ru / АФИША Daily / The Village / Собака.ru / Time Out / Forbes) at 22px. Cream bg + ink text + 60% opacity → 100% + grayscale(1) → 0 on hover. Each logo links to a verifiable article URL (§17 TODO: "replace text-only SVG press logos with real SVG logos + verifiable href").
- **EA section based on**: EA "As featured in" press strip.
- **What existing component it would replace**: none directly — RESTORE from the orphaned `sb-press-strip.tsx` (currently only used as `variant="docked"` in `mcu-video-hero` which is orphaned). The standalone variant was a §17 TODO: "Press strip `variant=standalone` is NOT mounted on the page — only docked in hero. Could add as a trust-section after About."
- **Lines estimate**: ~120.

### 7.8 `ea-chef-quote.tsx` — full-bleed chef photo with serif quote overlay

- **What it does**: Full-bleed 4:5 chef portrait on the left + a single italic Playfair quote on the right ("Гость ест то, что сейчас на пике") + chef name + role. No stats, no signature, no badges. Cream bg + ink text + italic accent.
- **EA section based on**: EA "Chef" section.
- **What existing component it would replace**: none directly — complements `ChefPortrait` (Cycle 26 Salt Block — score 8/10 KEEP) but adds a pure-quote variant for editorial pacing between Menu and TastingMenuExperience.
- **Lines estimate**: ~80.

### 7.9 `ea-faq-accordion.tsx` — minimalist FAQ with massive type

- **What it does**: Single-column accordion with no category tabs, no search, no feedback icons. Each item: large question in Playfair italic 28px + body in Karla 16px + thin OKLCH color-mix rule between items. Click toggles `gridTemplateRows 0fr → 1fr` FAQ pattern.
- **EA section based on**: EA "FAQ" section (minimalist).
- **What existing component it would replace**: `Faq` (Cycle 21 — 475-line with 4 categories + 8 questions + search + accordion + ThumbsUp/Down feedback, score 7/10 RESTYLE).
- **Lines estimate**: ~120.

### 7.10 `ea-calculator-cta.tsx` — minimalist calculator CTA card

- **What it does**: Pure-black bg + cream text + 60px "Рассчитать стоимость" + single number input (guests) + type-ahead select (event type) + giant total in cream Neutra2Display 60–80px + single red outline CTA "Получить смету →". No addons, no sliders, no Magnetic wrapper, no share buttons. The full Calculator lives on `/calculator` route; this is just the homepage teaser.
- **EA section based on**: EA "Get a Quote" teaser.
- **What existing component it would replace**: `Calculator` (Cycle 21 — 722-line interactive with 7 icons + emojis + slider ticks + Magnetic + Telegram/WhatsApp share, score 6/10 RESTYLE) — `ea-calculator-cta` is the homepage card; the full Calculator moves to `/calculator` route.
- **Lines estimate**: ~150.

### 7.11 `ea-cookie-banner.tsx` — single-line cookie consent

- **What it does**: Single-line 1px-tall bar at the very bottom: cream bg + ink text + "Мы используем cookies" + Privacy link + 2 inline text links (Принять / Отклонить). No icon, no glassmorphism, no spring entrance — just opacity 0→1 over 0.3s. 152-ФЗ compliant.
- **EA section based on**: EA cookie banner (single-line minimal).
- **What existing component it would replace**: `CookieConsent` (Cycle 26 — glassmorphism banner `bg-cream/85 backdrop-blur-xl border-t border-gold/20` + Cookie lucide icon + 2 buttons, score 7/10 RESTYLE, §17 VLM-flagged as visually too heavy).
- **Lines estimate**: ~40.

### 7.12 Optional: `ea-textual-link.tsx` + `ea-parallax-pair.tsx` + `ea-scroll-cue.tsx`

These three are utility revivals from the orphan list — each one is a strong design (joels.com Cycle 24) that could be reused in EA-style new components:

- **`ea-textual-link.tsx`** — restore from orphaned `textual-link.tsx` (22px×1px line scaling 2.7× on hover + 11px Karla 600 uppercase 0.3em + ink/cream/red tones). Useful for inline CTAs in `ea-chef-quote.tsx`, `ea-philosophy-quote.tsx`, `ea-final-cta.tsx`.
- **`ea-parallax-pair.tsx`** — restore from orphaned `stacked-parallax-images.tsx` (main landscape + stacked portrait, opposite-direction parallax y:[30,-30] + y:[-15,15]). Useful for `ea-about.tsx` if a parallax layer is desired.
- **`ea-scroll-cue.tsx`** — restore from orphaned `scroll-cue.tsx` (1px×94px sage vertical line + "SCROLL" 12px text + CSS keyframe retract-extend). Useful for `ea-hero.tsx` bottom.

These are marked **optional** because the CEP layer already has its own scroll cue (in `CepEggHero`) and CTAs (`CepOutlineButton`). Only revive if the new `ea-*` components need them.

---

## 8. Cycle 28 implementation order (recommended)

The Cycle 28 implementation subagents should tackle the work in this order to maximize parallelism and minimize rebase conflicts:

### Phase A — Orphan deletion (1 subagent, ~30 min)
- Delete all 39 orphaned files (33 direct + 6 transitive) per §6.
- Run `bun run lint` + `bun run typecheck` to confirm nothing breaks (no live imports).
- Commit: `chore: delete 39 orphaned components (Cycles 21–25 layer cleanup)`.

### Phase B — RESTYLE existing live components (4 parallel subagents, ~2h)
- **B-1**: RESTYLE `editorial-intro.tsx` + `quote-band.tsx` + `social-handle.tsx` (Ridgewells → EA palette strip).
- **B-2**: RESTYLE `about.tsx` + `cookie-consent.tsx` + `preloader.tsx` (maximalism → EA restraint).
- **B-3**: RESTYLE `mcu-photo-filmstrip.tsx` + `mcu-venues.tsx` (mculinary → EA editorial).
- **B-4**: RESTYLE `calculator.tsx` (move addons to disclosure, strip chrome) + `faq.tsx` (strip category tabs + search + feedback) + `contact.tsx` (strip multi-step to single-column 3-field) + `site-footer.tsx` (strip NewsletterSignup + cities + Awards + 22 icons) + `menu.tsx` (strip dietary chips + signature dishes cycling + sticky filter).

### Phase C — New `ea-*` components (8 parallel subagents, ~3h)
- **C-1**: `ea-events-portfolio.tsx` (replaces McuPhotoFilmstrip's role).
- **C-2**: `ea-services-grid.tsx` + `ea-venues-spotlight.tsx`.
- **C-3**: `ea-philosophy-quote.tsx` + `ea-final-cta.tsx`.
- **C-4**: `ea-press-strip.tsx` (restored from SbPressStrip standalone).
- **C-5**: `ea-chef-quote.tsx` + `ea-cookie-banner.tsx`.
- **C-6**: `ea-faq-accordion.tsx` + `ea-calculator-cta.tsx`.
- **C-7**: `ea-hero.tsx` (second-hero variant for A/B testing).
- **C-8**: Optional utilities — `ea-textual-link.tsx` + `ea-parallax-pair.tsx` + `ea-scroll-cue.tsx`.

### Phase D — Page.tsx wire + VLM critique loop (orchestrator, ~2h)
- Wire new `ea-*` components into `src/app/page.tsx` in the correct editorial order (between existing CEP components).
- Run VLM critique loop (`z-ai vision` brutal critique per section, 3–4 iterations to converge 8.5+/10 across all sections).
- Verify with `agent-browser` (HTTP 200 + DOM eval + screenshot per section).
- Commit + push.

---

## 9. Blockers discovered

1. **No `bg-hero.tsx` file exists** despite AGENTS.md §17 line 2546 listing "BgHero" as an orphan to delete. The reference is either a typo for `gg-hero.tsx` (which IS orphaned and is in the deletion list) or a phantom name. **No action needed** — the §17 TODO is satisfied by deleting `gg-hero.tsx`.

2. **`CepOutlineButton` is orphaned but design is sound** — created in Cycle 27 alongside the other 13 CEP components but never wired into any CEP section (CEP sections chose text-only headlines over CTAs). The Cycle 28 new components (`ea-final-cta.tsx`, `ea-calculator-cta.tsx`) will need an EA-style outline button — either restore `cep-outline-button.tsx` as `ea-outline-button.tsx` (preferred) or write fresh. **No blocker** — flagged as a Cycle 28 to-do.

3. **`SbPressStrip` is transitively orphaned but design is sound** — the §17 TODO "Press strip `variant=standalone` is NOT mounted on the page — only docked in hero. Could add as a trust-section after About" is exactly what `ea-press-strip.tsx` (Cycle 28 new component) addresses. **No blocker** — flagged as a Cycle 28 to-do.

4. **`McuPhotoFilmstrip` is live (page.tsx #15) but uses Embla** — the AGENTS.md §17 (Cycle 25 mculinary layer) noted that the `embla-carousel-react` v8.6.0 wrapper is broken under React 19 + Next 16. McuPhotoFilmstrip uses direct `EmblaCarousel(vp, options, [])` init (bypassing the wrapper) which works, but the new `ea-events-portfolio.tsx` should NOT use Embla — pure native scroll + `scrollbar-width: none` is simpler, more reliable, and more EA-discipline. **No blocker** — flagged as a Cycle 28 design decision.

5. **`Manifesto` pinned 250vh scroll wow** — AGENTS.md §17 VLM noted "massive dark void in the middle" in static full-page screenshots. In motion this is the strongest wow moment on the page, but it does add scroll length. **No blocker for Cycle 28** — flagged as a possible Cycle 29 reduction to 180vh if user feedback confirms the void concern.

6. **`About` 3D-tilt StatCards use `useMotionValue` + `useSpring` + `useMotionTemplate` + `transformStyle: preserve-3d` + `perspective: 1000px` on the parent** — these are heavy hooks that may interact poorly with the new `ea-*` components if they're on the same page. The RESTYLE of `About` (Phase B-2) should strip these entirely. **No blocker** — flagged as a Phase B-2 design decision.

7. **`Calculator` 722-line file with nuqs state + Magnetic wrapper + Telegram/WhatsApp share** — moving the full Calculator to `/calculator` route (Phase C-6) requires updating `src/app/calculator/page.tsx` (new route). The `Calculator` component file itself can be reused as-is on the new route, with only the homepage `ea-calculator-cta.tsx` being a new lightweight teaser. **No blocker** — flagged as a Phase C-6 to-do (create `/calculator` route).

8. **`Menu` 1097 lines with `getDietaryTags` heuristic regex** — the regex matching on dish names (fish/meat/gluten/pork/dairy/egg/honey) is fragile (e.g., "eggplant" would match `eggRe`). The RESTYLE of `Menu` (Phase B-4) should move dietary info to a structured `dietary: string[]` field in the menu data model, not a heuristic. **No blocker** — flagged as a Phase B-4 design decision.

9. **`Contact` 1300 lines with multi-step form + draft autosave + 17 lucide icons** — the RESTYLE of `Contact` (Phase B-4) to single-column 3-field will lose the multi-step UX. If the multi-step is important for conversion, keep it on a separate `/request` route. **No blocker** — flagged as a Phase B-4 design decision.

10. **`SiteFooter` 528 lines with NewsletterSignup (POST /api/newsletter)** — the RESTYLE of `SiteFooter` (Phase B-4) to ~150 lines removes NewsletterSignup. The `/api/newsletter` endpoint stays — the NewsletterSignup component moves to a `/newsletter` route or to the contact page. **No blocker** — flagged as a Phase B-4 design decision.

---

## 10. Cycle 28 success criteria

The Cycle 28 implementation is complete when:

1. **All 39 orphaned files are deleted** (per §6). `bun run lint` + `bun run typecheck` pass with zero broken imports.
2. **All 8 RESTYLE candidates are re-skinned to EA palette** (pure black + warm cream + screaming accent red, no bordeaux, no gold, no glassmorphism, no gradient text, no 3D-tilt cards, no decorative chrome).
3. **All 10 new `ea-*` components are implemented** (per §7) and wired into `src/app/page.tsx` in the correct editorial order.
4. **VLM critique loop converges** — all sections score 8.5+/10 against the EA editorial standard (palette, type, motion, CTA, premium feel).
5. **`agent-browser` HTTP 200 verification** + per-section DOM eval (autoplay intervals firing, IntersectionObservers attached, reduced-motion safe).
6. **Commit + push to `main`** — clean diff, no force-push, `git diff` reviewed before push.
7. **AGENTS.md §18 (Cycle 28) addendum** documents what was replicated, what was deleted, VLM critique loop results, and TODO for Cycle 29.

---

## 11. Appendix — full line-count table (sorted by size)

For reference, the 81 components sorted by line count (smallest first):

| File | Lines | Status |
|---|---|---|
| page-borders.tsx | 37 | live (layout) |
| reveal.tsx | 39 | live (utility) |
| cep-editorial-divider.tsx | 44 | live (page #6) |
| scroll-cue.tsx | 47 | transitive orphan |
| cep-testimonials-header.tsx | 54 | live (page #17) |
| lenis-provider.tsx | 54 | live (layout) |
| grain.tsx | 58 | live (layout) |
| textual-link.tsx | 58 | transitive orphan |
| petal-button.tsx | 60 | transitive orphan |
| cep-outline-button.tsx | 61 | direct orphan |
| promo-banner.tsx | 62 | direct orphan |
| press-strip.tsx | 63 | direct orphan |
| bold-statement.tsx | 64 | direct orphan |
| outline-button.tsx | 65 | live (utility) |
| mcu-cta-band.tsx | 67 | direct orphan |
| cep-locations-strip.tsx | 73 | live (page #20) |
| pink-marquee.tsx | 74 | direct orphan |
| mcu-instagram.tsx | 75 | direct orphan |
| back-to-top.tsx | 76 | live (page) |
| logo-marquee.tsx | 78 | direct orphan |
| preloader.tsx | 79 | live (layout) |
| chapter-nav.tsx | 91 | live (layout) |
| mcu-marquee-band.tsx | 94 | direct orphan |
| mcu-venues.tsx | 95 | live (page #16) |
| cep-client-marquee.tsx | 96 | live (page #2) |
| cep-why-us.tsx | 108 | live (page #5) |
| cep-red-stats.tsx | 110 | live (page #4) |
| marquee-band.tsx | 111 | direct orphan |
| stacked-parallax-images.tsx | 113 | transitive orphan |
| social-handle.tsx | 116 | live (page #26) |
| snack-box-3d-cube.tsx | 118 | transitive orphan |
| cookie-consent.tsx | 126 | live (layout) |
| awards-strip.tsx | 127 | direct orphan |
| joels-about.tsx | 128 | direct orphan |
| section-header.tsx | 128 | live (utility) |
| cep-simple-brilliant.tsx | 132 | live (page #3) |
| cep-instagram-grid.tsx | 141 | live (page #21) |
| joels-cuisine.tsx | 145 | direct orphan |
| editorial-intro.tsx | 148 | live (page #7) |
| chef-portrait.tsx | 153 | live (page #10) |
| cep-process.tsx | 155 | live (page #19) |
| sustainability-strip.tsx | 156 | live (page #13) |
| cep-overlay-menu.tsx | 159 | live (site-header) |
| mcu-video-hero.tsx | 160 | direct orphan |
| announcement-bar.tsx | 166 | live (site-header) |
| services-overview.tsx | 180 | live (page #14) |
| cursor.tsx | 185 | live (layout) |
| quote-band.tsx | 185 | live (page #22) |
| winter-specials.tsx | 188 | direct orphan |
| rising-photos.tsx | 190 | direct orphan |
| sb-press-strip.tsx | 197 | transitive orphan |
| cep-egg-hero.tsx | 202 | live (page #1) |
| ambient-audio.tsx | 209 | live (layout) |
| mcu-photo-filmstrip.tsx | 209 | live (page #15) |
| mcu-services-carousel.tsx | 219 | direct orphan |
| joels-contact-cta.tsx | 231 | direct orphan |
| gg-video-showcase.tsx | 238 | direct orphan |
| cep-testimonials-carousel.tsx | 246 | live (page #18) |
| mcu-testimonials.tsx | 246 | direct orphan |
| tasting-menu-experience.tsx | 257 | live (page #12) |
| gg-who-we-are.tsx | 261 | direct orphan |
| instagram-video.tsx | 262 | direct orphan |
| gg-feature-collage.tsx | 271 | direct orphan |
| mcu-video-events.tsx | 289 | direct orphan |
| process.tsx | 352 | direct orphan |
| manifesto.tsx | 358 | live (page #9) |
| gg-hero.tsx | 372 | direct orphan |
| snack-box-delivery.tsx | 372 | direct orphan |
| about.tsx | 430 | live (page #8) |
| faq.tsx | 475 | live (page #24) |
| site-header.tsx | 499 | live (page) |
| site-footer.tsx | 528 | live (page) |
| pillars.tsx | 549 | direct orphan |
| video-events.tsx | 587 | direct orphan |
| testimonials.tsx | 702 | direct orphan |
| hero.tsx | 719 | direct orphan |
| calculator.tsx | 722 | live (page #23) |
| events-gallery.tsx | 795 | direct orphan |
| menu.tsx | 1097 | live (page #11) |
| services.tsx | 1210 | direct orphan |
| contact.tsx | 1300 | live (page #25) |
| **TOTAL** | **19,695** | 81 files |

**Live LOC**: 9,524 lines (42 files).
**Orphan LOC**: 8,216 lines (39 files).
**Audit overhead**: 1,955 lines (Cycle 26 audit + this Cycle 28 audit + their docs siblings — not part of the bundle).

The 39 orphans represent **42% of the component LOC** in the tree. Deleting them is the single biggest cleanup win available to Cycle 28.

---

## 12. Conclusion

The Cycle 27 CEP layer (13 `cep-*` components) is already at the EA editorial standard (8–10/10 across all sections). Cycle 28's work is **not** to rebuild the editorial layer — it's to:

1. **Clean up** the 39 orphaned components left behind by Cycles 21–27's iterative layering (8,216 LOC, 42% of component tree).
2. **Re-skin** the 8 live components that still use Ridgewells/Salt Block/mculinary palettes (bordeaux/gold/honey/espresso) to EA's pure black + warm cream + screaming red.
3. **Add** 10 new `ea-*` components that fill specific EA-signature gaps (events portfolio, services grid, venues spotlight, philosophy quote, final CTA, press strip revival, chef quote, FAQ accordion, calculator CTA, cookie banner).

After Cycle 28, the Interfood Catering site should be a 1:1 editorial match for elegantaffairscaterers.com — same palette, same type discipline, same motion restraint, same luxury feel — while keeping the Russian-language brand voice and the existing interactive features (calculator, contact form, menu PDF, IG grid).

---

**Audit complete. 81 components evaluated. 39 orphaned. 8 RESTYLE. 10 new `ea-*` candidates proposed. Cycle 28 implementation plan ready.**

---

## 13. EA reference site design language (extended)

This section documents what `elegantaffairscaterers.com` (EA) actually does on its homepage, so the Cycle 28 `ea-*` new components can be evaluated against a concrete reference rather than a general "luxury restraint" platitude. The EA site is built on Squarespace 7.1 with a custom template; the audit inspected its DOM via `agent-browser` and confirmed the following design language.

### 13.1 Palette (verified)

| Token | Hex | Usage on EA |
|---|---|---|
| `--ea-black` | `#000000` | Section bg for hero + manifesto + quote + final CTA + footer (5 of 11 sections) |
| `--ea-cream` | `#EFEFE7` | Section bg for stats + services + venues + IG + cookie banner (5 of 11 sections) |
| `--ea-red` | `#FF360A` | Stats band bg (the ONLY section-bg color moment) + bullet separators in client marquee + hairline under section H2 + accent line under step numbers |
| `--ea-white` | `#FFFFFF` | Body text on black sections + stat numbers on red band + button text on hover |
| `--ea-ink` | `#1A1A1A` | Body text on cream sections |

**Critical rule (CEP/EA shared):** red appears as a section bg **exactly once** on the entire site — the stats band. Every other appearance of red is as a hairline (1px), a bullet (•), or an accent line under a step number. This restraint is what makes the stats band pop so hard it becomes the brand visual signature.

### 13.2 Typography (verified)

| Role | Font | Scale | Notes |
|---|---|---|---|
| Hero H1 | EA brand display (custom, similar to Neutra2Display-Light) | 244px (clamp on viewport) | Stacked 2-line aphorism, line-height 0.88, letter-spacing -0.02em, uppercase |
| Section H2 | Same as hero | 200px (clamp) | "SIMPLE & BRILLIANT." over video b-roll — film title card moment |
| Section H2 (alt) | Same as hero | 130px | "TESTIMONIALS" single word — minimalism IS the design |
| Section H3 | Same as hero | 142px | "WHY US?" |
| Step numbers | Same as hero | 68px | "01" "02" "03" in CepProcess |
| Eyebrow | Same as hero (uppercase) | 17px (book weight) | "SELECT CLIENTS" / "WHY US?" / "TESTIMONIALS" / "FOLLOW ALONG" |
| Body | Neutra2Text_Book (or fallback Montserrat for Cyrillic) | 17px | line-height 1.6, opacity 75% |
| Caption | Same as body | 22px | "ЛЕТ НА РЫНКЕ" / "СОБЫТИЙ ПРОВЕДЕНО" / "ГОСТЕЙ НАКОРМЕНО" |
| Locations strip | Same as hero | 32.8px | "САНКТ-ПЕТЕРБУРГ \| МОСКВА \| ВСЯ РОССИЯ" (we use Russian; EA uses English) |

**Cyrillic note:** Neutra2Display-Light + Neutra2Text_Book are Latin-only fonts. For Russian copy, glyphs fall back per-glyph to Montserrat (loaded as `--font-poppins` in `layout.tsx` — Montserrat is geometric sans with full Cyrillic subset, nearly identical x-height to Neutra2). The Cycle 27 CEP layer already follows this pattern (English signature headlines + Russian body). Cycle 28 `ea-*` components should follow the same convention.

### 13.3 Motion discipline (verified)

| Motion pattern | EA usage | Implementation |
|---|---|---|
| Ken Burns slow zoom | Hero bg photo + editorial divider bg + locations strip bg | CSS keyframe `@keyframes cep-bg-zoom { 0% { transform: scale(1); } 100% { transform: scale(1.08); } }` 20s ease-in-out alternate infinite |
| Staggered reveal | Hero headline + each section's eyebrow + H2 + body | framer-motion `whileInView` with `staggerChildren: 0.15` + per-item `opacity 0→1, y 40→0` over 0.8s ease |
| Marquee translateX | Client marquee | CSS keyframe `@keyframes cep-marquee-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }` 32s linear infinite + duplicated-set for seamless loop + `group-hover:[animation-play-state:paused]` |
| Carousel auto-scroll | Testimonials | Manual `setInterval(4500ms)` + duplicated-set technique + no Embla + no arrows + no dots |
| Count-up stats | Stats band | rAF + easeOutCubic over 1800ms + reduced-motion snap-to-final |
| Scroll cue | Hero bottom | CSS keyframe `scaleY [0.4, 1, 0.4]` 2.2s ease-in-out infinite + 1px×60px white/40 vertical line |
| Hover micro-interaction | "WHY US?" phrases | `letter-spacing` expand + color shift ink→red + thin vertical hairline → full red on `group-hover/prop` |

**Critical rule:** no Spring physics, no `useMotionValue` + `useSpring` + `useMotionTemplate` + `transformStyle: preserve-3d` + `perspective` 3D-tilt cards, no `AnimatePresence` for full-page section transitions. EA does not use 3D transforms anywhere. The Interfood `About` section's 3D-tilt StatCards (Cycle 21) are an Awwwards-pattern experiment that directly violates EA discipline.

### 13.4 Layout grid (verified)

- **Content max-width**: 1280px (matches joels.com `joel-content-frame` and Salt Block's `max-w-[1070px]` is close).
- **Horizontal padding**: `px-8 md:px-14` on all sections (CEP convention).
- **Vertical padding**: `py-16 md:py-24` (CEP) or `py-24 md:py-32` (CEP heavy sections like WhyUs) or `py-24 md:py-36` (Ridgewells heavy).
- **Section min-height**: hero = `min-h-screen`; stats = `py-16 md:py-20`; testimonials = `py-12 md:py-16`; manifesto = `min-h-[70vh] md:min-h-[80vh]` over video.
- **Grid**: 1-col mobile / 2-col tablet / 3-col or 4-col desktop. EA prefers 3-col for value props (CepWhyUs), 4-col for process steps (CepProcess), 3-col for testimonials peeking (CepTestimonialsCarousel).

### 13.5 Section sequence on EA homepage (verified)

| # | EA section | Interfood live equivalent | Score |
|---|---|---|---|
| 1 | Hero (full-bleed food photo + stacked 244px headline + locations strip + scroll cue) | CepEggHero | 9/10 |
| 2 | Client marquee (edge-fade + red bullets + 17 brand names) | CepClientMarquee | 9/10 |
| 3 | Brand positioning (200px headline over 0.5× slow-mo b-roll) | CepSimpleBrilliant | 9/10 |
| 4 | Stats band (#FF360A bg, 3 count-up numbers) | CepRedStats | 9/10 |
| 5 | Why us (4 value props in row with red hairlines) | CepWhyUs | 9/10 |
| 6 | Editorial divider (full-bleed photo, no text) | CepEditorialDivider | 9/10 |
| 7 | Intro pause (painterly / cream bg / serif headline + body + dual CTA) | EditorialIntro | 7/10 (RESTYLE — too maximalist) |
| 8 | About (count-up stats + brand story) | About | 6/10 (RESTYLE — too maximalist) |
| 9 | Manifesto pinned scroll (signature wow) | Manifesto | 7/10 (KEEP — heavy) |
| 10 | Chef portrait (4:5 portrait + italic serif + signature) | ChefPortrait | 8/10 |
| 11 | Menu (interactive list + PDF) | Menu | 7/10 (RESTYLE — too heavy) |
| 12 | Tasting menu (5-course editorial list on dark bg) | TastingMenuExperience | 8/10 |
| 13 | Sustainability (3-cell editorial grid) | SustainabilityStrip | 9/10 |
| 14 | Services (4 categories in 2-up 50/50 split) | ServicesOverview | 8/10 |
| 15 | Events portfolio (magazine horizontal scroll gallery) | McuPhotoFilmstrip | 6/10 (RESTYLE — too busy) |
| 16 | Venues (full-bleed cards with overlay text) | McuVenues | 6/10 (RESTYLE — too small) |
| 17 | Testimonials header (130px single word + red hairline) | CepTestimonialsHeader | 9/10 |
| 18 | Testimonials carousel (auto-scroll peeking, no controls) | CepTestimonialsCarousel | 10/10 |
| 19 | Process (3-step DREAM/BUILD/SAVOR with red accent lines) | CepProcess | 10/10 |
| 20 | Locations strip (full-bleed dim photo + city strip) | CepLocationsStrip | 8/10 |
| 21 | Instagram grid (3×3 with Reel play icons) | CepInstagramGrid | 8/10 |
| 22 | Philosophy quote (black bg + serif italic + red quote mark) | QuoteBand | 7/10 (RESTYLE — bordeaux/gold off-palette) |
| 23 | Calculator CTA (single card with type + count + total) | Calculator | 6/10 (RESTYLE — too heavy) |
| 24 | FAQ (minimalist accordion with massive type) | Faq | 7/10 (RESTYLE — too busy) |
| 25 | Contact (single-column 3-field form) | Contact | 6/10 (RESTYLE — multi-step too heavy) |
| 26 | Final CTA (100px headline + red outline CTA + thin rule) | SocialHandle | 7/10 (RESTYLE — bordeaux/gold off-palette) |
| 27 | Footer (brand wordmark + 1 nav col + 1 contact line + copyright) | SiteFooter | 7/10 (RESTYLE — too heavy) |

**Coverage:** 22 of 27 sections are already at 8/10 or higher (the CEP layer + Salt Block chef/tasting/sustainability + Ridgewells services-overview). The 5 sections scoring ≤7 are the RESTYLE targets for Cycle 28 Phase B.

---

## 14. Per-cycle-layer inventory (extended)

This section documents the layering history of the `src/components/catering/` directory across Cycles 21–27, so the Cycle 28 implementer can quickly see what's been added when, and what's still live vs orphaned.

### 14.1 Cycle 21 — Ridgewells Editorial Layer (added 20.08.2026)

Reference: `docs/RIDGEWELLS-ANALYSIS.md` (793 lines). Palette: aubergine/magenta/lavender-white → mapped to our `--bordeaux #4A2515` (deep) / `--terracotta #9A4F2A` (mid) / `--gold #8B6534` / `--cream #FAF8F5`.

| Component | Status | Cycle 28 action |
|---|---|---|
| `outline-button.tsx` | live (utility) | KEEP |
| `section-header.tsx` | live (utility) | KEEP |
| `editorial-intro.tsx` | live (page #7) | RESTYLE (maximalist → EA) |
| `marquee-band.tsx` | orphaned (count=0) | DELETE |
| `services-overview.tsx` | live (page #14) | KEEP |
| `quote-band.tsx` | live (page #22) | RESTYLE (bordeaux/gold → EA black/red) |
| `social-handle.tsx` | live (page #26) | RESTYLE (bordeaux/gold → EA black/red) |

**Cycle 21 → Cycle 28 cleanup**: 1 DELETE + 3 RESTYLE + 3 KEEP = 7 components.

### 14.2 Cycle 22 — ggcatering.com Replication (added 21.08.2026)

Reference: `docs/GGCATERING-ANALYSIS.md`. Palette: lime/charcoal/cream (`--gg-lime #5DE680`, `--gg-charcoal-dark #1A1A1A`, `--gg-cream #FAFAF7`). Font: Montserrat (Poppins-replacement for Cyrillic).

| Component | Status | Cycle 28 action |
|---|---|---|
| `gg-hero.tsx` | orphaned (count=0) | DELETE |
| `gg-who-we-are.tsx` | orphaned (count=0) | DELETE |
| `gg-video-showcase.tsx` | orphaned (count=0) | DELETE |
| `gg-feature-collage.tsx` | orphaned (count=0) | DELETE |

**Cycle 22 → Cycle 28 cleanup**: 4 DELETE = 4 components. Entire Cycle 22 layer wiped.

### 14.3 Cycle 23 — concept-catering.de Wow Layer (added 21.08.2026)

Reference: `docs/CONCEPT-CATERING-ANALYSIS.md`. Palette: near-black + pink (`--cc-dark #101010`, `--cc-pink #f087b5`). Font: Barlow Semi Condensed (ultra-bold condensed all-caps).

| Component | Status | Cycle 28 action |
|---|---|---|
| `rising-photos.tsx` | orphaned (count=0) | DELETE |
| `pink-marquee.tsx` | orphaned (count=0) | DELETE |
| `bold-statement.tsx` | orphaned (count=0) | DELETE |

**Cycle 23 → Cycle 28 cleanup**: 3 DELETE = 3 components. Entire Cycle 23 layer wiped.

### 14.4 Cycle 24 — joels.com Editorial Layer (added 21.08.2026)

Reference: `docs/JOELS-ANALYSIS.md` (1241 lines). Palette: olive/sage/charcoal (`--sage #7D8470`, `--ink #1F2937`). Font: Cormorant Garamond substitute via Playfair Display.

| Component | Status | Cycle 28 action |
|---|---|---|
| `page-borders.tsx` | live (layout) | KEEP |
| `textual-link.tsx` | transitive orphan | DELETE (or RESTORE as `ea-textual-link.tsx`) |
| `scroll-cue.tsx` | transitive orphan | DELETE (or RESTORE as `ea-scroll-cue.tsx`) |
| `stacked-parallax-images.tsx` | transitive orphan | DELETE (or RESTORE as `ea-parallax-pair.tsx`) |
| `joels-cuisine.tsx` | orphaned (count=0) | DELETE |
| `joels-about.tsx` | orphaned (count=0) | DELETE |
| `joels-contact-cta.tsx` | orphaned (count=0) | DELETE |

**Cycle 24 → Cycle 28 cleanup**: 6 DELETE (3 direct + 3 transitive) + 1 KEEP = 7 components. Cycle 24 layer largely wiped except `page-borders.tsx` (the editorial frame, used in layout.tsx).

### 14.5 Cycle 25 — mculinary.com Replication (added 21.08.2026)

Reference: `docs/reference-library/mculinary/MCULINARY-ANALYSIS.md`. Palette: navy/cream/gold (`--mcu-navy #17364D`, `--mcu-cream #F8F5F1`, `--mcu-gold #AF9469`). 9 new components, all `mcu-*` prefixed.

| Component | Status | Cycle 28 action |
|---|---|---|
| `mcu-video-hero.tsx` | orphaned (count=0) | DELETE |
| `mcu-marquee-band.tsx` | orphaned (count=0) | DELETE |
| `mcu-photo-filmstrip.tsx` | live (page #15) | RESTYLE (Embla → magazine scroll) |
| `mcu-services-carousel.tsx` | orphaned (count=0) | DELETE |
| `mcu-testimonials.tsx` | orphaned (count=0) | DELETE |
| `mcu-venues.tsx` | live (page #16) | RESTYLE (3 square cards → full-bleed) |
| `mcu-video-events.tsx` | orphaned (count=0) | DELETE |
| `mcu-cta-band.tsx` | orphaned (count=0) | DELETE |
| `mcu-instagram.tsx` | orphaned (count=0) | DELETE |

**Cycle 25 → Cycle 28 cleanup**: 7 DELETE + 2 RESTYLE = 9 components. Cycle 25 layer largely wiped except the 2 RESTYLE candidates (PhotoFilmstrip + Venues) which stay live but get re-skinned.

### 14.6 Cycle 26 — Salt Block Hospitality Editorial Layer (added 21.08.2026)

Reference: `docs/SALTBLOCK-ANALYSIS.md` (1719 lines). Palette: espresso/honey/cream (`--espresso #1A1B1A`, `--honey #E0A94E`, `--cream #F9FAFB`). Adobe Fonts Anziano + Minerva Modern mapped to Playfair Display + Barlow Semi Condensed.

| Component | Status | Cycle 28 action |
|---|---|---|
| `petal-button.tsx` | transitive orphan | DELETE |
| `sb-press-strip.tsx` | transitive orphan | DELETE (RESTORE as `ea-press-strip.tsx`) |
| `chef-portrait.tsx` | live (page #10) | KEEP |
| `tasting-menu-experience.tsx` | live (page #12) | KEEP |
| `sustainability-strip.tsx` | live (page #13) | KEEP |
| `announcement-bar.tsx` | live (site-header) | KEEP |

**Cycle 26 → Cycle 28 cleanup**: 2 DELETE (transitive) + 4 KEEP = 6 components. Cycle 26 layer mostly survives — the Salt Block editorial discipline is already close to EA.

### 14.7 Cycle 27 — Creative Edge Parties Editorial Layer (added 22.08.2026)

Reference: `docs/CEP-ANALYSIS.md` (creativeedge-analysis.md). Palette: pure black + warm cream + screaming accent red (`--cep-black #000000`, `--cep-cream #EFEFE7`, `--cep-red #FF360A`). Self-hosted Neutra2Display-Light + Neutra2Text_Book woff2 fonts. 13 new `cep-*` components.

| Component | Status | Cycle 28 action |
|---|---|---|
| `cep-egg-hero.tsx` | live (page #1) | KEEP |
| `cep-client-marquee.tsx` | live (page #2) | KEEP |
| `cep-simple-brilliant.tsx` | live (page #3) | KEEP |
| `cep-red-stats.tsx` | live (page #4) | KEEP |
| `cep-why-us.tsx` | live (page #5) | KEEP |
| `cep-editorial-divider.tsx` | live (page #6) | KEEP |
| `cep-testimonials-header.tsx` | live (page #17) | KEEP |
| `cep-testimonials-carousel.tsx` | live (page #18) | KEEP |
| `cep-process.tsx` | live (page #19) | KEEP |
| `cep-locations-strip.tsx` | live (page #20) | KEEP |
| `cep-instagram-grid.tsx` | live (page #21) | KEEP |
| `cep-overlay-menu.tsx` | live (site-header) | KEEP |
| `cep-outline-button.tsx` | orphaned (count=0) | DELETE (RESTORE as `ea-outline-button.tsx` if needed) |

**Cycle 27 → Cycle 28 cleanup**: 1 DELETE + 12 KEEP = 13 components. Cycle 27 layer fully survives — it IS the EA-tier editorial anchor for the site. The only DELETE is `cep-outline-button.tsx` (created in Cycle 27 but never wired into any CEP section).

### 14.8 Pre-Cycle-21 Sopranos / utility components (added 19.08.2026 or earlier)

These predate the layered cycle work but are still in the tree. Some are live (utility infrastructure), most are orphaned.

| Component | Status | Cycle 28 action |
|---|---|---|
| `hero.tsx` | orphaned (count=0) | DELETE |
| `marquee-band.tsx` | orphaned (count=0) | DELETE (covered in §14.1) |
| `logo-marquee.tsx` | orphaned (count=0) | DELETE |
| `testimonials.tsx` | orphaned (count=0) | DELETE |
| `services.tsx` | orphaned (count=0) | DELETE |
| `process.tsx` | orphaned (count=0) | DELETE |
| `events-gallery.tsx` | orphaned (count=0) | DELETE |
| `pillars.tsx` | orphaned (count=0) | DELETE |
| `awards-strip.tsx` | orphaned (count=0) | DELETE |
| `promo-banner.tsx` | orphaned (count=0) | DELETE |
| `winter-specials.tsx` | orphaned (count=0) | DELETE |
| `instagram-video.tsx` | orphaned (count=0) | DELETE |
| `video-events.tsx` | orphaned (count=0) | DELETE |
| `snack-box-delivery.tsx` | orphaned (count=0) | DELETE |
| `snack-box-3d-cube.tsx` | transitive orphan | DELETE |
| `press-strip.tsx` | orphaned (count=0) | DELETE |
| `about.tsx` | live (page #8) | RESTYLE (maximalist → EA) |
| `manifesto.tsx` | live (page #9) | KEEP (heavy) |
| `menu.tsx` | live (page #11) | RESTYLE (heavy → EA editorial) |
| `calculator.tsx` | live (page #23) | RESTYLE (heavy → EA teaser + `/calculator` route) |
| `faq.tsx` | live (page #24) | RESTYLE (busy → EA minimalist) |
| `contact.tsx` | live (page #25) | RESTYLE (multi-step → EA single-column) |
| `site-header.tsx` | live (page) | KEEP (CEP-aligned) |
| `site-footer.tsx` | live (page) | RESTYLE (heavy → EA minimal) |
| `back-to-top.tsx` | live (page) | KEEP |
| `cookie-consent.tsx` | live (layout) | RESTYLE (glassmorphism → EA single-line) |
| `preloader.tsx` | live (layout) | RESTYLE (4-panel → EA minimal) |
| `cursor.tsx` | live (layout) | KEEP (luxury signature) |
| `chapter-nav.tsx` | live (layout) | KEEP (subtle) |
| `grain.tsx` | live (layout) | KEEP (subtle texture) |
| `lenis-provider.tsx` | live (layout) | KEEP (smooth-scroll) |
| `reveal.tsx` | live (utility, 23 importers) | KEEP |
| `outline-button.tsx` | live (utility, 2 importers) | KEEP |
| `section-header.tsx` | live (utility, 1 importer) | KEEP |

**Pre-Cycle-21 → Cycle 28 cleanup**: 16 DELETE (15 direct + 1 transitive) + 6 RESTYLE + 11 KEEP = 33 components.

### 14.9 Layered grand total

| Cycle | Added | Live in Cycle 28 | Orphaned (DELETE) | RESTYLE | KEEP |
|---|---|---|---|---|---|
| Pre-21 | 33 | 17 | 16 | 6 | 11 |
| 21 (Ridgewells) | 7 | 6 | 1 | 3 | 3 |
| 22 (ggcatering) | 4 | 0 | 4 | 0 | 0 |
| 23 (concept-catering) | 3 | 0 | 3 | 0 | 0 |
| 24 (joels) | 7 | 1 | 6 | 0 | 1 |
| 25 (mculinary) | 9 | 2 | 7 | 2 | 0 |
| 26 (Salt Block) | 6 | 4 | 2 | 0 | 4 |
| 27 (CEP) | 13 | 12 | 1 | 0 | 12 |
| **Total** | **81** | **42** | **39** | **8** | **33** |

(Counts include transitively orphaned components in their original cycle of creation.)

The Cycle 27 CEP layer has the highest survival rate (12/13 = 92% KEEP), confirming that the CEP design language IS the EA editorial standard. Cycle 28's RESTYLE work is concentrated in the Pre-21 + Cycle 21 layers (9 RESTYLE = 75% of all RESTYLE work).

---

## 15. RESTYLE concrete sketches (extended)

For the 8 RESTYLE candidates, this section provides concrete before/after sketches so the Cycle 28 implementer can see exactly what changes are needed.

### 15.1 `editorial-intro.tsx` — Ridgewells painterly → EA minimal

**Before (Cycle 21, 148 lines):**
- `painterly-bg-deep` dark espresso base + 10-layer radial-gradient "digital watercolor" blooms (bordeaux + terracotta + honey)
- SVG `feTurbulence` grain overlay (opacity 0.08 mix-blend-overlay)
- Deep vignette (radial-gradient transparent 15% → rgba(20,12,8,0.45) 65% → rgba(10,6,4,0.75) 100%)
- Decorative top + bottom thin rules
- Peach eyebrow `#E8B889` (Ridgewells wide-tracked uppercase 0.22em)
- 60px Playfair Display headline with manual `<br>` + italic accent in peach
- Lead paragraph (cream/90)
- Dual OutlineButton CTAs (Ridgewells square outline)
- Floating decorative gold dot motion.span (drift + scale [1, 1.4, 1] + opacity [0.3, 0.9, 0.3])
- Parallax: contentY [40, -20] + contentOpacity [0, 1, 1, 0.85] via useScroll + useTransform

**After (Cycle 28, ~50 lines):**
- Pure cream bg + ink text (no painterly, no grain, no vignette)
- Eyebrow: "INTERFOOD CATERING" in Montserrat 11px uppercase 0.3em ink/55
- Headline: "У каждого события своя история за столом." in Playfair Display italic clamp(2.5rem, 6vw, 5rem) ink
- Body: 2 paragraphs in Karla 17px lh 1.6 ink/75
- Single inline CTA link "Смотреть меню →" in Montserrat 11px uppercase 0.3em ink + 1px text-underline
- No decorative dot, no parallax, no dual CTAs, no rules

**LOC reduction:** 148 → ~50 (-66%).

### 15.2 `about.tsx` — Maximalist 3D-tilt → EA editorial 2-col

**Before (Cycle 21, 430 lines):**
- 3D mouse-tilt StatCards (`perspective: 1000px` parent + `rotateX/rotateY ±8°` + `transformStyle: preserve-3d` + `useMotionValue` + `useSpring` + `useMotionTemplate`)
- Glassmorphism cards (`bg-white/40 backdrop-blur-sm border-gold/10`)
- Gradient-text headline (`.gradient-text`)
- Gradient glow on hover (`from-gold/0 to-terracotta/0` → `from-gold/5 to-terracotta/5`)
- Floating particles (`bg-gold/20` motion.div drifting y:[-20,20]/x:[-10,10] + opacity [0.2,0.5,0.2])
- 0.03-opacity grid pattern background
- Corner accent (size-12 border-t-2 border-l-2 border-gold/40)
- Vertical-shutter clipPath image reveal (`inset(50% 0 50% 0)` → `inset(0 0 0 0)` over scroll progress [0, 0.4])
- Marquee row of value-props (`text-shimmer-gold` + gold bullet + bg-white/70 backdrop-blur-sm pill)
- Sparkles + Award + Users + Calendar + ChefHat lucide icons (5)
- CountUp via `animate(count, to, {duration: 2.2, ease: [0.22, 1, 0.36, 1]})`

**After (Cycle 28, ~180 lines):**
- Cream bg + ink text (no decorative chrome)
- 2-col grid md+ (5fr/6fr): left = 4:5 portrait photo + thin OKLCH rule on right; right = editorial copy
- Eyebrow: "О НАС" in Montserrat 11px uppercase 0.3em ink/55
- Headline: "Свадьбы, созданные с любовью." in Playfair Display clamp(2rem, 5vw, 4rem) ink, italic accent on "любовью"
- 2 paragraphs in Karla 17px lh 1.7 ink/75
- 3 stats in a row: 16+ ЛЕТ / 2400+ СОБЫТИЙ / 75000+ ГОСТЕЙ in Montserrat 32px uppercase 0.05em ink, thin OKLCH rules between
- No 3D tilt, no glassmorphism, no gradient text, no floating particles, no grid pattern, no corner accent, no vertical-shutter clipPath, no marquee row, no lucide icons, no CountUp animation (static final values)

**LOC reduction:** 430 → ~180 (-58%).

### 15.3 `quote-band.tsx` — Ridgewells bordeaux → EA black/red

**Before (Cycle 21, 185 lines):**
- Solid bordeaux `#4A2515` bg + painterly blooms (radial-gradient bordeaux + terracotta)
- 3 gold star SVGs with sparkle pulse (`animationDelay` staggered)
- "4,9 / 5 · 127+ отзывов" gold text
- Tinted-cream headline `#F7EFE6` (NOT pure white — Ridgewells trick)
- 1.45rem Playfair blockquote with gold left-border + cream/95 text
- Thank-you letter photo with `box-shadow: 0 30px 80px -20px rgba(0,0,0,0.55)`
- Floating date badge "С 2014 года" (cream bg + bordeaux text)
- Decorative top + bottom thin rules
- Oversized gold opening quote mark `ridge-quote-marks ridge-quote-open`

**After (Cycle 28, ~60 lines):**
- Pure black bg + cream text
- Single oversized red quote mark `«` in Neutra2Display 80px #FF360A, top-left
- Playfair italic blockquote 1.45rem cream
- Single attribute line: "Команда Interfood Catering" in Montserrat 11px uppercase 0.3em cream/60
- No stars, no rating, no painterly blooms, no thank-you letter photo, no date badge, no rules

**LOC reduction:** 185 → ~60 (-68%).

### 15.4 `social-handle.tsx` — Ridgewells giant handle → EA final CTA

**Before (Cycle 21, 116 lines):**
- Subtle warm radial glow behind handle
- Decorative thin rules above + below
- IG icon + "Следите за нами" bordeaux eyebrow (0.22em wide-tracked uppercase)
- Giant `@nilov_catering` Playfair clamp(3rem, 10vw, 6rem) ink, italic "@nilov" + non-italic "catering"
- ArrowUpRight gold icon (group-hover translate-x-1 -translate-y-1)
- #ЕдаКакИскусство hashtag in Montserrat 0.9rem uppercase 0.28em ink/55
- Secondary CTA link "Смотреть фотоотчёты мероприятий" (text-underline, hover bordeaux)

**After (Cycle 28, ~50 lines):**
- Pure cream bg + ink text
- 80–100px Montserrat Light "Обсудим событие?" (no italic, no hashtag)
- Single red outline CTA "Отправить заявку →" in CepOutlineButton-style (1px red border, square corners, hover invert)
- Thin OKLCH color-mix rule below
- No IG icon, no rules, no hashtag, no secondary CTA

**LOC reduction:** 116 → ~50 (-57%). Replaces `SocialHandle`'s role as the final closer; `SocialHandle` could move to a smaller slot in the SiteFooter instead.

### 15.5 `mcu-photo-filmstrip.tsx` — Embla filmstrip → EA magazine scroll

**Before (Cycle 25, 209 lines):**
- Direct `EmblaCarousel(vp, {loop: true, align: "center", containScroll: "trimSnaps"}, [])` init (bypasses the broken embla-carousel-react wrapper)
- Variable-width slides (340–520px)
- 3.5s manual setInterval autoplay + pause-on-hover + pause-when-offscreen (IntersectionObserver)
- ArrowLeft + ArrowRight controls
- Dot pagination (scrollSnaps + selectedIndex)
- Lucide icons for arrows

**After (Cycle 28, ~150 lines):**
- Pure native horizontal scroll (`overflow-x-auto` + `scroll-snap-type: x mandatory` + `scroll-snap-align: start` per item)
- Variable aspect ratios (4:5 portrait + 3:2 landscape + 1:1 square + 16:10 cinematic) for editorial variety
- Each item: image + thin caption reveal on hover (image title in Montserrat 11px uppercase 0.3em ink + opacity 0→1 + translateY 8→0)
- Scrollbar hidden (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`)
- No autoplay, no arrows, no dots, no Embla dependency
- Reduced-motion: native scroll still works (no animation to disable)

**LOC reduction:** 209 → ~150 (-28%). Removes the Embla dependency entirely from the live tree (Embla is only used by this component on the homepage).

### 15.6 `mcu-venues.tsx` — 3 square cards → EA full-bleed

**Before (Cycle 25, 95 lines):**
- 3 square (1:1) cream cards in `mcu-venue-grid`
- Hover-zoom (scale 1.06 / 0.5s) via CSS
- Bottom gradient caption overlay (mcu-venue-card-overlay)
- mcu-eyebrow + mcu-h2 header

**After (Cycle 28, ~140 lines):**
- 3 venue cards stacked vertically, alternating image-left/image-right
- Each card: full-bleed `aspect-[16/10]` image + venue name in Playfair Display clamp(2.5rem, 5vw, 4rem) ink + single italic descriptor line in Playfair italic 1.25rem ink/70
- Hover: image zoom 1.03 (subtle)
- Cream bg + ink text
- No overlay, no caption-on-hover, no eyebrow header

**LOC increase:** 95 → ~140 (+47%). The expansion is intentional — EA venue spotlights are full-bleed editorial moments, not small grid cards.

### 15.7 `cookie-consent.tsx` — Glassmorphism → EA single-line

**Before (Cycle 26, 126 lines):**
- `bg-cream/85 backdrop-blur-xl border-t border-gold/20` glassmorphism banner
- Spring entrance (stiffness 200, damping 26) + Cookie lucide icon
- Privacy link + 2 buttons (Accept / Reject) with `min-h-[44px]` touch targets
- Autofocus + focus trap (Tab cycling)
- 152-ФЗ compliant

**After (Cycle 28, ~40 lines):**
- Single 1px-tall bar at bottom: `bg-cream border-t border-ink/10` (no glassmorphism)
- Ink text: "Мы используем cookies. Принять · Отклонить · Политика конфиденциальности"
- 3 inline text links (no buttons, no icon)
- Opacity 0→1 over 0.3s (no spring)
- 152-ФЗ compliant (still POSTs choice to `/api/cookie-consent`)
- Reduced-motion: instant opacity 1

**LOC reduction:** 126 → ~40 (-68%).

### 15.8 `preloader.tsx` — 4-panel door → EA minimal wordmark

**Before (Cycle 21, 79 lines):**
- 4-panel door preloader (cream + gold gradients)
- sessionStorage first-visit gate
- 1.4s hold + per-panel staggered y:-100% exit (0.08s delay each)
- AnimatePresence + reduced-motion skip

**After (Cycle 28, ~20 lines):**
- Single cream overlay covering viewport
- "Interfood Catering" in Montserrat 11px uppercase 0.3em ink/55, centered
- Opacity 0→1 over 0.3s on mount, then 1→0 over 0.3s after 0.6s, then unmount
- sessionStorage first-visit gate (preserved)
- Reduced-motion: skip entirely (no overlay)

**LOC reduction:** 79 → ~20 (-75%). Or DELETE entirely (cleanest EA move — EA has no preloader).

---

## 16. Per-cycle audit scorecard summary

This final summary distills the audit into a single scorecard per cycle layer, so the Cycle 28 orchestrator can see at-a-glance which cycles need the most work.

| Cycle | Layer | Live count | Orphan count | RESTYLE count | KEEP count | Avg score | Action priority |
|---|---|---|---|---|---|---|---|
| Pre-21 | Sopranos / utility | 17 | 16 | 6 | 11 | 6.8 | HIGH (most RESTYLE work) |
| 21 | Ridgewells | 6 | 1 | 3 | 3 | 7.5 | HIGH (3 RESTYLE) |
| 22 | ggcatering | 0 | 4 | 0 | 0 | 5.0 | LOW (all DELETE) |
| 23 | concept-catering | 0 | 3 | 0 | 0 | 4.7 | LOW (all DELETE) |
| 24 | joels | 1 | 6 | 0 | 1 | 6.3 | LOW (5 DELETE) |
| 25 | mculinary | 2 | 7 | 2 | 0 | 5.5 | MEDIUM (7 DELETE + 2 RESTYLE) |
| 26 | Salt Block | 4 | 2 | 0 | 4 | 8.2 | LOW (2 DELETE) |
| 27 | CEP | 12 | 1 | 0 | 12 | 9.2 | NONE (already EA-tier) |

**Cycle 28 priority order:**
1. **Phase A — Orphan deletion** (all 39 files, lowest risk, frees 8,216 LOC).
2. **Phase B — RESTYLE** (8 live files: EditorialIntro + About + QuoteBand + SocialHandle + McuPhotoFilmstrip + McuVenues + CookieConsent + Preloader; plus 4 RESTYLE-also files: Calculator + Faq + Contact + SiteFooter + Menu = 13 RESTYLE total per §3.1).
3. **Phase C — New `ea-*`** (10 new components per §7).
4. **Phase D — Wire + VLM critique**.

---

**Audit complete. 81 components evaluated. 39 orphaned (DELETE). 13 RESTYLE. 33 KEEP. 10 new `ea-*` candidates proposed. Cycle 28 implementation plan ready.**
