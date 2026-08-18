# Hero Video Production Brief Template

> **Purpose:** Ready-to-use template for creating hero/background video content
> **Based on:** Analysis of top-performing catering website videos

---

## Project Overview

| Field | Details |
|-------|---------|
| **Project Name** | Interfood Catering - Hero Video |
| **Video Type** | Background/Hero Loop |
| **Duration** | 20-30 seconds (seamless loop) |
| **Format** | 16:9 (1920x1080 minimum, 4K preferred) |
| **Primary Use** | Website hero section background |
| **Secondary Uses** | Social media, presentations, ads |

---

## Creative Direction

### Brand Essence
```
Interfood is premium catering in Saint Petersburg that transforms events into 
unforgettable experiences through exceptional food, impeccable service, and 
meticulous attention to detail.

KEY ATTRIBUTES:
├── Premium / Luxury feel
├── Warm & Inviting (not cold/stiff)
├── Professional yet approachable
├── Artistic / Food-as-art sensibility
└── Russian hospitality warmth + European sophistication
```

### Visual Style Reference

| Element | Direction |
|---------|-----------|
| **Color palette** | Warm golds, deep burgundies, cream backgrounds, rich food colors |
| **Lighting** | Warm, golden hour feel; soft shadows; appetizing food lighting |
| **Movement** | Slow, elegant camera moves; gentle motion; no jarring cuts |
| **Pacing** | Relaxed, confident; each shot 3-5 seconds |
| **Mood** | Celebration, anticipation, craftsmanship, care |

### Music/Sound Direction

| Element | Specification |
|---------|---------------|
| **Music style** | Instrumental, sophisticated, uplifting |
| **Tempo** | 80-100 BPM (moderate, not frantic) |
| **Instruments** | Piano or strings lead; subtle percussion |
| **Mood** | Elegant, warm, building gently |
| **Licensing** | Royalty-free commercial license required |
| **Volume mix** | Will be used muted on website; full for social versions |

---

## Shot List

### Sequence A: Opening (0:00-0:05)

| Shot | Duration | Description | Audio Cue |
|------|----------|-------------|-----------|
| **A1** | 2 sec | Close-up: Chef's hands plating a dish with precision | Music begins softly |
| **A2** | 3 sec | Medium: Beautiful finished dish, steam rising, garnish placement | Build slightly |

**Visual Notes:** 
- Shallow depth of field on A1 (hands in focus, kitchen soft)
- A2 should feature a "hero dish" - most photogenic menu item
- Warm lighting from side/back to create dimension

### Sequence B: Service & Atmosphere (0:05-0:12)

| Shot | Duration | Description | Audio Cue |
|------|----------|-------------|-----------|
| **B1** | 3 sec | Wide: Elegant banquet hall setup, tables being set | Music swells |
| **B2** | 2 sec | Detail: Crystal glassware, polished silver, floral centerpiece | Continue |
| **B3** | 2 sec | Medium: Server carrying tray with confidence and grace | Peak warmth |

**Visual Notes:**
- B1 should show scale without feeling empty
- B2 macro shots show quality/attention to detail
- B3 human element - professional but warm service

### Sequence C: Food & Craftsmanship (0:12-0:20)

| Shot | Duration | Description | Audio Cue |
|------|----------|-------------|-----------|
| **C1** | 3 sec | Action: Chef finishing sauce drizzle or garnish | Sustained warmth |
| **C2** | 3 sec | Close-up: Cutting into perfectly cooked protein (juice visible) | Continue |
| **C3** | 2 sec | Detail: Fresh herbs, artisan bread, quality ingredients | Gentle peak |

**Visual Notes:**
- C1 shows skill/artistry
- C2 is the "money shot" - must look incredibly appetizing
- C3 emphasizes fresh, quality ingredients

### Sequence D: Celebration & Closing (0:20-0:28)

| Shot | Duration | Description | Audio Cue |
|------|----------|-------------|-----------|
| **D1** | 3 sec | Wide: Guests smiling, toasting, enjoying the event | Music to gentle close |
| **D2** | 3 sec | Medium: Couple or group laughing, clearly having wonderful time | Resolve |
| **D3** | 2 sec | Logo lockup: Interfood logo on elegant background | Fade out |

**Visual Notes:**
- D1/D2 capture emotion - joy, celebration, connection
- D3 clean branding moment
- D3 loops seamlessly back to A1

---

## Technical Specifications

### Camera & Format

| Spec | Requirement |
|------|-------------|
| **Resolution** | 4K (3840x2160) primary; deliver 1080p web version |
| **Frame rate** | 24fps or 25fps (cinematic feel) |
| **Codec** | ProRes 422 for master; H.264 for delivery |
| **Aspect ratio** | 16:9 (with 1:1 and 9:16 versions for social) |
| **Color space** | Rec.709 for web; log if grading intended |

### Delivery Files

| File | Use | Specs |
|------|-----|-------|
| `interfood-hero-master.mov` | Archive | ProRes 422, 4K, original audio |
| `interfood-hero-web.mp4` | Website | H.264, 1080p, ~8MB file size |
| `interfood-hero-mobile.mp4` | Mobile | H.720, vertical/portrait ~4MB |
| `interfood-hero-social.mp4` | Social posts | 1080x1080 (1:1) + 1080x1920 (9:16) |
| `interfood-hero-poster.jpg` | Fallback image | First frame as high-quality JPEG |

### Website Integration Notes

```javascript
// Current implementation uses Mux for video hosting
// This video should be uploaded to Mux with these settings:
const MUX_UPLOAD_CONFIG = {
  playbackPolicy: 'public',
  mp4_support: 'standard',
  normalization: {
    audioBitrate: 128,
    videoBitrate: 5000  // 5Mbps for quality/size balance
  },
  metadata: {
    title: 'Interfood Hero Video',
    category: 'hero',
    variant: 'main'
  }
}

// The video will be configured as:
// - autoplay: true
// - muted: true  
// - loop: true
// - playsInline: true
// - fallback to poster image on mobile/connection issues
```

---

## Location Requirements

### Primary Location Options

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Actual event venue** | Authenticity, real atmosphere | Scheduling, client permission | Best if available |
| **Studio with set build** | Control, flexibility | Cost, can look artificial | Good backup |
| **Beautiful rented space** | Professional look, availability | Budget consideration | Solid option |
| **Our own kitchen/dining area** | No rental cost, convenient | May lack "event" feel | Supplemental only |

### Set Dressing Needs

- [ ] White or cream tablecloths (premium linen)
- [ ] Crystal glassware variety
- [ ] Polished silver or gold flatware
- [ ] Fresh flowers (seasonal, elegant arrangements)
- [ ] Candle holders/ambient lighting elements
- [ ] Assorted beautiful plates/serving pieces
- [ ] Quality linens/napkins

---

## Talent Requirements

| Role | Number | Notes |
|------|--------|-------|
| **Chef(s)** | 1-2 | Photogenic, skilled at plating presentation |
| **Server(s)** | 2 | Professional appearance, graceful movement |
| **Guest models** | 4-6 | Diverse, attractive, able to show genuine enjoyment |
| **Hands models** | 1-2 | For close-up food handling shots (can be chef) |

---

## Food Styling Requirements

### Dishes to Feature (Priority Order)

1. **Hero Appetizer** - Most visually stunning hors d'oeuvre
   - Example: Blini with caviar, or artisan bruschetta
   - Must photograph beautifully in close-up

2. **Main Course "Money Shot"** - Protein cut or plated masterpiece
   - Example: Beef tenderloid, salmon en croûte
   - Steam, juice, perfect sear essential

3. **Sharing Platter** - Abundance, celebration feel
   - Example: Grazing table, seafood tower, charcuterie
   - Shows scale and generosity

4. **Dessert/Final Course** - Beautiful ending
   - Example: Chocolate creation, fruit tart, petit fours
   - Detailed, artistic plating

5. **Cocktail/Beverage** - Lifestyle element
   - Example: Signature cocktail, champagne pour
   - Adds sophistication

### Food Stylist Notes

- All food must be freshly prepared day-of shoot
- Backup portions of everything
- Tweezers, culinary torch, spray bottles for gloss
- Ice must be fresh (melts fast under lights)
- Herbs/garnish must be perky and vibrant

---

## Production Timeline

| Phase | Duration | Key Milestones |
|-------|----------|----------------|
| **Pre-production** | 2 weeks | Finalize creative, book location/talent, source props |
| **Production** | 1 day | Shoot day (10-12 hours including setup/breakdown) |
| **Post-production** | 2 weeks | Edit, color grade, sound mix, revisions |
| **Delivery** | 2 days | Final exports, upload to Mux, integration |
| **Total** | ~5 weeks | From kickoff to live on website |

---

## Budget Estimate

| Category | Range | Notes |
|----------|-------|-------|
| **Pre-production** | $500-1,500 | Planning, location scouting, prop sourcing |
| **Production crew** | $2,000-5,000 | Director, DP, assistant, stylist |
| **Talent** | $500-2,000 | Models, chefs (may be internal) |
| **Location/Rental** | $500-2,000 | Venue, equipment |
| **Food/Craft** | $300-800 | Ingredients, props, consumables |
| **Post-production** | $1,500-4,000 | Editing, color, sound, revisions |
| **TOTAL ESTIMATE** | **$5,300-15,300** | Depending on scope and choices |

---

## Approval Process

1. **Creative treatment approval** - Before production begins
2. **Rough cut review** - Initial edit assembly
3. **Fine cut review** - Near-final with temp color/audio
4. **Final delivery** - All specs met, ready for deployment

**Revision policy:** 2 rounds of revisions included in budget

---

## Success Metrics

| Metric | Target |
|--------|--------|
| **Website engagement** | +15% time-on-page for homepage |
| **Conversion lift** | Measurable improvement in inquiry rate |
| **Brand perception** | Qualitative feedback on premium feel |
| **Social engagement** | High view/engagement when shared |
| **Load performance** | <3 second additional page load time |

---

*Template ready for use. Customize based on specific production needs.*
