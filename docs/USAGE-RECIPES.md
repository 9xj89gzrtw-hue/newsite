# Usage Recipes — Common Tasks & File Maps

> **Step-by-step guides for common development and content tasks.**
> 
> Each recipe tells you exactly which files to read, in what order, and how to use them.

---

## Recipe 1: Build a Homepage

**Goal:** Create a high-converting homepage from scratch

### Files to Read (in order)

| Step | File | What to Extract |
|------|------|-----------------|
| 1 | `REFERENCE-SITES-ANALYSIS.md` (lines 1-100) | Executive summary & top recommendations |
| 2 | `DESIGN-SYSTEM.md` | Colors, typography, spacing tokens |
| 3 | `content-library/headlines.json` | Choose your hero headline style |
| 4 | `reference-library/patterns/html/hero-templates/01-centered.html` | Hero HTML structure |
| 5 | `ux-playbook/conversion-elements.json` | CTA button copy & colors |
| 6 | `content-library/cta-library.json` | Additional CTA variations |
| 7 | `reference-library/patterns/css/components.css` | Base component styles |

### Implementation Checklist

```
[ ] Select headline from headlines.json (recommend: bold_confident or playful_creative)
[ ] Choose hero template: centered (safe), split (balanced), cinematic (premium)
[ ] Set primary CTA from conversion-elements.json hero_ctas section
[ ] Apply color palette from DESIGN-SYSTEM.md
[ ] Add sticky nav from nav-templates/01-standard.html
[ ] Include trust signals from ux-playbook/trust-building.md
[ ] Implement structured data from seo-playbook/structured-data-patterns.json
```

### Pro Tips

- **For luxury positioning**: Use `03-cinematic.html` + dark-luxury background images
- **For approachable feel**: Use `01-centered.html` + warm CTA colors (#F4A261 orange)
- **Video hero?** 67% of top sites use video - see MOTION-LIBRARY.md for implementation

---

## Recipe 2: Write an About Page

**Goal:** Create a compelling About page that builds trust

### Files to Read (in order)

| Step | File | What to Extract |
|------|------|-----------------|
| 1 | `social-proof-library/about-us-page-outline.md` | Complete page structure |
| 2 | `social-proof-library/brand-story-framework.md` | Narrative framework |
| 3 | `social-proof-library/brand-stories.md` | Examples for inspiration |
| 4 | `content-library/messaging-frameworks.md` | Tone & voice guidelines |
| 5 | `content-library/tone-and-power-words-analysis.md` | Powerful word choices |
| 6 | `reference-library/images/team/chef-action.json` | Photo specifications |

### Page Structure (from about-us-page-outline.md)

```markdown
1. Hero Section
   - Emotional headline (see brand-stories.md examples)
   - Founder/hero image (use chef-action.json specs)

2. Our Story Section
   - Brand narrative using framework from brand-story-framework.md
   - Timeline or journey visualization

3. Values/Mission Section
   - 3-4 core values with icons
   - Connect to messaging-frameworks.md principles

4. Team Section
   - Team photos (chef-action.json specs)
   - Brief bios with personality

5. Trust Signals
   - Awards (awards-certifications.md)
   - Certifications
   - Client logos (client-logo-strategy.md)

6. CTA Section
   - Contact/inquiry CTA (conversion-elements.json)
```

---

## Recipe 3: Set Up SEO

**Goal:** Implement complete SEO optimization for launch

### Files to Read (in order)

| Step | File | What to Extract |
|------|------|-----------------|
| 1 | `seo-playbook/technical-checklist.md` | Master audit checklist |
| 2 | `seo-playbook/metadata-compilation.json` | Title/description patterns |
| 3 | `seo-playbook/structured-data-patterns.json` | JSON-LD schemas |
| 4 | `seo-playbook/heading-structures.md` | H1-H6 hierarchy rules |
| 5 | `seo-playbook/keyword-strategy.md` | Target keywords by page |
| 6 | `seo-playbook/local-seo-patterns.md` | Local business setup |

### Pre-Launch SEO Checklist

```
Technical Foundation:
[ ] Run through technical-checklist.md - all Priority 1 items
[ ] Set up Google Search Console & Analytics
[ ] Create and submit sitemap.xml
[ ] Configure robots.txt
[ ] Implement canonical URLs
[ ] Set up 301 redirects if needed

On-Page Optimization:
[ ] Write unique title tags (use metadata-compilation.json patterns)
[ ] Write meta descriptions (150-160 chars, include keywords)
[ ] Implement heading hierarchy per heading-structures.md
[ ] Add alt text to all images
[ ] Optimize page load speed (see technical-playbook/performance-patterns.md)

Structured Data:
[ ] Add Organization schema (from structured-data-patterns.json)
[ ] Add LocalBusiness schema with NAP info
[ ] Add FAQPage schema if applicable
[ ] Test with Google Rich Results Test

Local SEO:
[ ] Claim/optimize Google Business Profile
[ ] Ensure NAP consistency across web
[ ] Build local citations
[ ] Gather reviews (use testimonial-request-template.md)
```

---

## Recipe 4: Create a Contact Form

**Goal:** Build a high-converting lead capture form

### Files to Read (in order)

| Step | File | What to Extract |
|------|------|-----------------|
| 1 | `ux-playbook/form-patterns.md` | Form design patterns |
| 2 | `ux-playbook/conversion-elements.json` | CTA button specs for submit |
| 3 | `content-library/email-capture-patterns.json` | Email field patterns |
| 4 | `ux-playbook/trust-building.md` | Trust signals near form |
| 5 | `technical-playbook/accessibility-implementations.md` | Form accessibility |

### Optimal Form Structure

```html
<!-- Based on form-patterns.md best practices -->
<form class="lead-capture-form">
  
  <!-- Above fold: Quick contact -->
  <fieldset>
    <legend>Get Your Free Quote</legend>
    
    <!-- Required fields only -->
    <input type="text" name="name" placeholder="Your Name *" required />
    <input type="email" name="email" placeholder="Email Address *" required />
    <input type="tel" name="phone" placeholder="Phone Number" />
    
    <!-- Event details (can expand) -->
    <select name="event_type">
      <option>Event Type *</option>
      <!-- Options from raw_extractions.json event categories -->
    </select>
    
    <input type="number" name="guests" placeholder="Estimated Guests" />
    
    <!-- Submit CTA from conversion-elements.json -->
    <button type="submit" class="cta-primary">
      Request Your Quote →
    </button>
  </fieldset>
  
  <!-- Trust signals below form -->
  <div class="trust-signals">
    <span>🔒 Your information is secure</span>
    <span>⏱️ Response within 24 hours</span>
    <span>★ 5-star rated service</span>
  </div>
</form>
```

### Conversion Optimization Tips

From `conversion-elements.json`:

- **Optimal fields**: 4-7 (name, email, phone, event type, date, guests, message)
- **Submit button**: Use action-oriented text ("Request Your Quote", not "Submit")
- **Button size**: Min 52px height on mobile
- **Trust signals**: Place immediately below form
- **Multi-step option**: Consider for complex inquiries (event details first, contact second)

---

## Recipe 5: Design a Hero Section

**Goal:** Create an impactful hero section that converts

### Files to Read (in order)

| Step | File | What to Extract |
|------|------|-----------------|
| 1 | `content-library/headlines.json` | Headline options by style |
| 2 | `reference-library/patterns/html/hero-templates/` | All 3 layout options |
| 3 | `ux-playbook/conversion-elements.json` | CTA placement & color |
| 4 | `reference-library/images/hero-backgrounds/hero-banquet.json` | Background image specs |
| 5 | `reference-library/images/abstract/dark-luxury.json` | Alternative backgrounds |
| 6 | `MOTION-LIBRARY.md` | Animation/parallax options |

### Hero Template Selection Guide

| Choose... | When... | Template |
|-----------|---------|----------|
| **Centered** | You have strong single message, versatile | `01-centered.html` |
| **Split-screen** | Equal importance of image + text | `02-split.html` |
| **Cinematic** | Premium positioning, video background | `03-cinematic.html` |

### Headline Style Selection

From `headlines.json`, filter by `style`:

| Style | Example | Best For |
|-------|---------|----------|
| `bold_confident` | "Switzerland's leading provider..." | Established, premium brands |
| `playful_creative` | "Fresh Flavours. Creative Catering." | Approachable, modern brands |
| `neutral` | "Event & Experience Catering" | Corporate, B2B focus |

### Hero Color Combinations

From `conversion-elements.json` cta_color_psychology:

| Positioning | Primary CTA Color | Accent |
|-------------|-------------------|--------|
| Luxury/Premium | #c4a052 (Gold) or #1a4d2e (Forest) | White text |
| Warm/Friendly | #F4A261 (Orange) or #e07a3f (Terracotta) | Dark text |
| Bold/Passionate | #E63946 (Red) or #be185d (Pink) | White text |
| Trustworthy | #2c5282 (Navy) or #2d5016 (Green) | White text |

---

## Recipe 6: Add Testimonials

**Goal:** Display social proof effectively

### Files to Read (in order)

| Step | File | What to Extract |
|------|------|-----------------|
| 1 | `social-proof-library/testimonials-compilation.json` | Format examples |
| 2 | `social-proof-library/testimonial-request-template.md` | How to collect more |
| 3 | `social-proof-library/trust-badges-inventory.json` | Supporting badges |
| 4 | `ux-playbook/trust-building.md` | Placement strategy |

### Testimonial Format Options

From `testimonials-compilation.json`:

**Option A: Classic Quote Card**
```html
<blockquote class="testimonial-card">
  <p class="quote">"Amazing service! Our wedding was perfect."</p>
  <cite>
    <img src="person.jpg" alt="" />
    <strong>Sarah Johnson</strong>
    <span>Wedding, June 2024</span>
  </cite>
  <div class="rating">★★★★★</div>
</blockquote>
```

**Option B: Result-Focused**
```html
<div class="testimonial-result">
  <div class="metric">300+ Guests Served</div>
  <blockquote>"They made our corporate event effortless."</blockquote>
  <cite>— Michael Chen, TechCorp Events Director</cite>
</div>
```

**Option C: Video Testimonial**
```html
<figure class="testimonial-video">
  <video poster="thumbnail.jpg" controls>
    <source src="testimonial.mp4" type="video/mp4">
  </video>
  <figcaption>Watch: Real client experience</figcaption>
</figure>
```

### Placement Recommendations

From `trust-building.md`:

1. **Homepage**: 3 testimonials in horizontal scroll (above fold lower section)
2. **Services page**: Relevant testimonial per service type
3. **Dedicated page**: Full testimonial grid with filtering
4. **Contact page**: 1-2 near form to reduce anxiety
5. **Checkout/Inquiry**: Mini-testimonial near submit button

---

## Recipe 7: Build a Pricing Page

**Goal:** Create a clear, conversion-focused pricing presentation

### Files to Read (in order)

| Step | File | What to Extract |
|------|------|-----------------|
| 1 | `content-library/pricing-page-template.md` | Page structure |
| 2 | `content-library/pricing-strategies.md` | Psychology & display tactics |
| 3 | `ux-playbook/conversion-elements.json` | Pricing CTA patterns |
| 4 | `content-library/menu-presentation-patterns.md` | Menu/package display |

### Pricing Page Structure

```markdown
1. Value Proposition Header
   - Clear headline about investment value
   - "Starting at" anchor pricing if applicable

2. Package Tiers (if applicable)
   - 3 tiers recommended (Good/Best/Value)
   - Most popular highlighted
   - Clear feature comparison

3. What's Included
   - Visual checklist of inclusions
   - Premium items called out

4. Custom Quote CTA
   - For complex events needing custom pricing
   - Large, prominent form link

5. FAQ Section
   - Common pricing questions (from faq-templates.json)
   - Transparency about additional costs

6. Social Proof
   - Testimonials mentioning value
   - "X events served" metrics
```

### Psychology Tips (from pricing-strategies.md)

- **Anchor effect**: Show highest price first
- **Charm prices**: Use $9,999 not $10,000
- **Bundle perception**: Show total value vs. price
- **Transparency**: Be clear about what's NOT included
- **Urgency**: Seasonal pricing or availability notes

---

## Recipe 8: Optimize for Mobile

**Goal:** Ensure excellent mobile user experience

### Files to Read (in order)

| Step | File | What to Extract |
|------|------|-----------------|
| 1 | `ux-playbook/mobile-ux.md` | Mobile-specific patterns |
| 2 | `ux-playbook/form-patterns.md` | Mobile form optimization |
| 3 | `ux-playbook/micro-interactions.css` | Touch-friendly animations |
| 4 | `technical-playbook/performance-patterns.md` | Speed optimization |
| 5 | `technical-playbook/accessibility-implementations.md` | Touch targets & contrast |

### Mobile Optimization Checklist

```
Layout & Navigation:
[ ] Hamburger menu (67% of top sites use this)
[ ] Sticky header with CTA always visible
[ ] Single column layout below 768px
[ ] Touch-friendly tap targets (44x44px minimum)

Forms:
[ ] Input fields full width
[ ] Number inputs with proper type
[ ] Date picker native or custom
[ ] Dropdown becomes select or accordion
[ ] Submit button 52px+ height

Performance:
[ ] Images < 200KB each, responsive srcset
[ ] Lazy loading below-fold images
[ ] Critical CSS inlined (< 14KB)
[ ] Font loading optimized (font-display: swap)

Testing:
[ ] Test on real devices (iOS + Android)
[ ] Test on 3G connection
[ ] Verify all CTAs reachable with thumb zone
```

---

## Recipe 9: Set Up Email Marketing

**Goal:** Create email capture and nurture sequences

### Files to Read (in order)

| Step | File | What to Extract |
|------|------|-----------------|
| 1 | `content-library/email-capture-patterns.json` | Capture form designs |
| 2 | `content-library/lead-magnet-templates.md` | Lead magnet ideas |
| 3 | `content-library/welcome-email-sequence.md` | 7-email nurture sequence |
| 4 | `content-library/lead-magnets.md` | Lead magnet strategy |
| 5 | `ux-playbook/conversion-elements.json` | Exit-intent popup patterns |

### Email Sequence Overview (from welcome-email-sequence.md)

| Email | Timing | Content Focus |
|-------|--------|---------------|
| **Welcome** | Immediate | Thank you, set expectations, deliver lead magnet |
| **Value #1** | Day 2 | Tip or resource related to catering |
| **Social Proof** | Day 4 | Testimonials, case studies, results |
| **Value #2** | Day 7 | Another helpful resource or guide |
| **Offer (Soft)** | Day 10 | Soft invitation to book consultation |
| **Value #3** | Day 14 | Final valuable content piece |
| **Offer (Direct)** | Day 21 | Direct call to book/inquire |

### Lead Magnet Ideas (from lead-magnet-templates.md)

**High-converting for caterers:**
- "Event Planning Checklist PDF"
- "Sample Menu Package"
- "Budget Planning Spreadsheet"
- "Seasonal Menu Inspiration Guide"
- "Timeline Template for Events"

---

## Recipe 10: Implement Animations

**Goal:** Add polished, purposeful animations

### Files to Read (in order)

| Step | File | What to Extract |
|------|------|-----------------|
| 1 | `MOTION-LIBRARY.md` | Animation principles & timing |
| 2 | `ANIMATION-PRESETS.md` | Ready-to-use code snippets |
| 3 | `reference-library/patterns/css/animations.css` | Animation utilities |
| 4 | `ux-playbook/micro-interactions.css` | Micro-interaction CSS |
| 5 | `reference-assets/raw/gammacatering.json` | Reference: most sophisticated stack |

### Animation Stack Recommendation

Based on analysis of Gamma Catering (most sophisticated):

```
Core Libraries:
- GSAP (GreenSock) - Main animation engine
- Lenis - Smooth scrolling
- Splide/Swiper - Carousels/sliders

Animation Categories:
1. Scroll-triggered reveals (fade-up, slide-in)
2. Parallax layers (hero backgrounds)
3. Counter animations (stats/metrics)
4. Hover micro-interactions (buttons, cards)
5. Page transitions (view switching)
```

### Performance Guidelines

From `performance-patterns.md`:

- **Prefer transform/opacity** - These are GPU-composited
- **Avoid animating layout properties** - width, height, top, left trigger reflow
- **Use will-change sparingly** - Only on elements you know will animate
- **Reduce motion preference** - Respect `prefers-reduced-motion`
- **Mobile consideration** - Simplify or disable complex animations on mobile

---

## Quick Reference: File Locations

| I need to... | Go to... |
|--------------|----------|
| Find a headline | `content-library/headlines.json` |
| Find CTA copy | `content-library/cta-library.json` |
| See design tokens | `DESIGN-SYSTEM.md` |
| Check SEO requirements | `seo-playbook/technical-checklist.md` |
| Build a form | `ux-playbook/form-patterns.md` |
| Add testimonials | `social-proof-library/testimonials-compilation.json` |
| Copy HTML template | `reference-library/patterns/html/` |
| Copy CSS component | `reference-library/patterns/css/` |
| See site screenshots | `reference-library/sites/*/screenshots/` |
| Get image specs | `reference-library/images/image-catalog.json` |
| Research a specific site | `reference-assets/raw/{sitename}.json` |
| Understand UX flows | `ux-playbook/user-journeys.md` |
| Make accessible | `technical-playbook/accessibility-implementations.md` |
| Speed up site | `technical-playbook/performance-patterns.md` |

---

*This recipe file is part of the Deep-8 Master Index deliverables.*
*Last updated: 2025-01-20*
