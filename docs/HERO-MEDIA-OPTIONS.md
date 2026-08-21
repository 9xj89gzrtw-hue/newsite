# Hero Media Options — talkofthetownatlanta.com redesign

This catalog lists all premium hero media candidates for the new site header
(menu-at-bottom + full-bleed hero image/video). Sources were gathered via the
`z-ai image-search` CLI (ZAI in-house image search) and from assets already
in the repo.

The goal is to REPLACE the existing talkofthetownatlanta.com hero photo with
something more cinematic, more editorial, and better-suited to a luxury
catering brand identity (Interfood / "Еда как искусство").

---

## 1. Downloaded hero-premium images (new)

Location: `/home/z/my-project/newsite/public/media/hero-premium/`

| # | File | Dimensions | Source | Subject / Vibe | Why cinematic |
|---|------|-----------:|--------|----------------|---------------|
| 1 | `hero-premium-1.jpg` | 1920×768 | Marriott | Luxury ballroom banquet hall, wide banner | 2.5:1 ultra-wide aspect = perfect hero banner proportion; grand ballroom symmetry reads as editorial |
| 2 | `hero-premium-2.jpg` | 1536×1024 | KMR Gourmet Catering | Elegant plated banquet table, warm tungsten light | Tight pro-catering shot; gold/copper palette matches luxury catering brand |
| 3 | `hero-premium-3.jpg` | 1280×853 | Brown Brothers Catering | Long banquet table, candlelit | Shot on Canon EOS T2i; soft candlelight = editorial mood |
| 4 | `hero-premium-4.jpg` | 2400×1600 | World's Best Wedding Photos | Wedding reception candlelight, floral + tablescape | High-resolution wedding editorial; signature luxury-catering use case |
| 5 | `hero-premium-5.jpg` | 2560×1707 | PartySlate | Elegant wedding reception, full room scale | High-res; shows full event scale — aspirational |
| 6 | `hero-premium-6.jpg` | 3000×2003 | Unsplash | Candlelit wedding dinner table, bokeh | **Highest resolution** of the set; Unsplash = clear licensing; deep candlelight bokeh = editorial luxury |
| 7 | `hero-premium-7.jpg` | 2500×1667 | The Taste Archives | Fine dining plated dish, dark moody | Explicitly dark-and-moody gastronomy shot; strong negative space for menu overlay |
| 8 | `hero-premium-8.jpg` | 2048×1365 | Chris Loves Julia | Fine dining plated dish, marble table | Shot on Canon 5D Mark IV, edited in Lightroom — professional food-photography pedigree |
| 9 | `hero-premium-9.jpg` | 1600×900 | New York Times | Chef plating close-up, wide | 16:9 native aspect; dynamic culinary craftsmanship |
| 10 | `hero-premium-10.jpg` | 1920×1080 | Kilkarney Hills | Banquet hall aerial wide, 16:9 | Native 16:9; aerial perspective reads as architectural / editorial |

Total: 10 images, ~6.4 MB combined.

---

## 2. Existing repo videos — usable as hero `<video>` background

All three are H.264 MP4s, already in the repo (no licensing or download risk).

| Path | Resolution | Duration | Vibe / Notes |
|------|-----------:|---------:|---------------|
| `/public/media/ea/ea-hero-video.mp4` | **2400×860** | 11.0 s | Ultra-wide cinematic banner (≈2.79:1) — EXACT aspect for a header banner with menu overlaid at the bottom. Short, loops seamlessly. **Best fit for the talkofthetown header pattern.** |
| `/public/media/ggcatering/gg-hero-video.mp4` | 1280×720 | 66.3 s | Long-form 16:9 catering reel — good for a longer hero loop but lower resolution and longer load. |
| `/public/media/mculinary/mculinary-hero.mp4` | 1280×720 | 28.3 s | MCulinary branded hero loop — 16:9, mid-length, kitchen + service cuts. |

> No royalty-free external video URL was fetched — the existing repo videos are
> safer (licensing already cleared by upstream repos) and the `ea-hero-video.mp4`
> is genuinely better-proportioned for the new header than anything we'd find
> externally.

---

## 3. Existing reference-library images that could serve as premium hero

Location: `/home/z/my-project/newsite/docs/reference-library/images/`
Catalog: `image-catalog.json` (29 images, 8 categories, curated 2025-01-18)

Strongest hero candidates (already vetted + cataloged):

| Path | Dimensions | Subject / Vibe |
|------|-----------:|-----------------|
| `hero-backgrounds/hero-banquet-1.jpg` | 2000×1334 | Bride & groom dancing at evening waterside reception — romantic, editorial |
| `hero-backgrounds/hero-banquet-2.jpg` | 1536×1024 | Red linens + gold cutlery + candles + bokeh — warm luxury table setting |
| `hero-backgrounds/hero-banquet-4.jpg` | 1600×1143 | Wedding venue with lush floral ceiling installation — dreamy botanical luxe |
| `events/wedding-romance-3.jpg` | 2560×1920 | Outdoor long-table garden dinner — sunny celebratory editorial |
| `events/wedding-romance-4.png` | 1600×900 | Outdoor dining, candles, draped fabric at twilight — intimate 16:9 native |
| `team/chef-action-5.jpg` | 3840×2160 | Chef plating with tweezers, 4K — meticulous precision close-up |

The catalog's own `recommendedHeroImages` field lists:
`hero-banquet-1`, `hero-banquet-2`, `hero-banquet-4`,
`wedding-romance-3`, `chef-action-5`.

---

## 4. Top recommendation

### Primary: video — `/public/media/ea/ea-hero-video.mp4`

Use this as the **new hero `<video>` background**, with the menu docked at
the bottom (talkofthetownatlanta.com pattern).

**Why it beats the original talkofthetown header:**
1. **Aspect-correct.** At 2400×860 (≈2.79:1) it is natively proportioned as a
   cinematic header banner — menu overlay at the bottom sits inside the
   letterbox band without covering subject matter.
2. **Motion = wow.** talkofthetown's current header is a static photo;
   subtle hero motion immediately elevates perceived production value and
   matches the Interfood "Еда как искусство" (food as art) positioning.
3. **Loop-clean.** 11-second duration is short enough to keep the file
   small (533 KB) and loops seamlessly without a visible jump.
4. **No licensing or fetch risk.** Already in the repo.

### Runner-up (photo fallback): `hero-premium-6.jpg`

If video is disabled (reduced-motion / mobile / `<video>` lazy-load fallback
poster), use the newly downloaded
`/public/media/hero-premium/hero-premium-6.jpg`
(Unsplash, 3000×2003, candlelit wedding dinner, deep bokeh).

- Highest resolution of the 10 newly-sourced images.
- Unsplash source = clear royalty-free license.
- Lower third of frame is typically darker tablecloth — natural contrast
  for white menu text overlaid at the bottom.
- Editorial candlelight luxury = on-brand for talkofthetown's elegant
  editorial style.

### Strong alt (if a darker mood is desired): `hero-premium-7.jpg`

The Taste Archives, 2500×1667, dark-and-moody fine-dining plated dish.
Gives a more gastronomy-forward, michelin-style editorial feel if the
client wants to lead with the food rather than the event.
