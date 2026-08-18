# Landing Page Wireframes (Text-Based)

> **Purpose:** Ready-to-implement wireframe specifications for key landing pages
> **Based on:** Analysis of top-converting landing pages from 23 catering websites
> **Format:** Text-based ASCII/structured wireframes for developer handoff

---

## Wedding Catering Landing Page Wireframe

### Page Metadata

```
URL: /weddings/
Title: Wedding Catering in Saint Petersburg | Interfood
Meta Description: Create your perfect wedding feast with Saint Petersburg's 
premier catering service. Custom menus, exceptional service, unforgettable celebrations.
Primary CTA: View Wedding Menu / Check Your Date
Target Audience: Engaged couples, wedding planners, parents of bride/groom
```

### Section-by-Section Specification

```
╔══════════════════════════════════════════════════════════════════╗
║  SECTION 1: HERO                                                ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  LAYOUT: Full-viewport, centered content, image background      ║
║                                                                 ║
║  BACKGROUND:                                                    ║
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  [Full-width hero image: Real wedding moment]            │   │
│  │  Source: /media/wedding-hero.jpg                         │   │
│  │  Overlay: Gradient from cream/80% bottom → transparent    │   │
│  └──────────────────────────────────────────────────────────┘   │
║                                                                 ║
║  CONTENT (centered, max-width: 800px):                          ║
║  ┌─────────────────────────────────────────────────────────┐   ║
║  │                                                         │   ║
║  │  ┌─────────────────────────────────────────────┐       │   ║
║  │  │ 💍 Trusted by 500+ Happy Couples            │       │   ║
║  │  └─────────────────────────────────────────────┘       │   ║
║  │                                                         │   ║
║  │  H1: A Wedding Feast as Unique                        │   ║
║  │      as Your Love Story                                │   ║
║  │                                                         │   ║
║  │  P: From intimate garden celebrations to grand         │   ║
║  │     ballroom receptions, we craft every detail          │   ║
║  │     of your wedding menu with care and artistry.        │   ║
║  │                                                         │   ║
║  │  CTAs (inline-flex, gap: 16px):                        │   ║
║  │  ┌──────────────────┐ ┌──────────────────┐            │   ║
║  │  │ 📖 View Menu     │ │ 📅 Check Date    │            │   ║
║  │  └──────────────────┘ └──────────────────┘            │   ║
║  │                                                         │   ║
║  │  Secondary link: "Or browse our real weddings →"        │   ║
║  │                                                         │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                                  ║
║  DECORATIVE: Floating particles, subtle scroll indicator         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SECTION 2: TRUST BAR                                           ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  LAYOUT: Full-width, light background, centered content          ║
║                                                                 ║
║  ┌─────────────────────────────────────────────────────────┐   ║
║  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   ║
║  │  │ ★★★★★  │  │  15+    │  │  500+   │  │ 100%    │   │   ║
║  │  │ 4.9/5   │  │ years   │  │ weddings│  │ custom  │   │   ║
║  │  │ reviews │  │ experience│  │ catered │  │ menus   │   │   ║
║  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SECTION 3: REAL WEDDINGS GALLERY                                 ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  LAYOUT: Container with section header + grid                     ║
║                                                                 ║
║  HEADER (text-left, optional image-right on desktop):             ║
║  ┌─────────────────────────────────────────────────────────┐   ║
║  │ BADGE: Real Weddings                                     │   ║
║  │ H2: Every Love Story Deserves a Perfect Celebration      │   ║
║  │ P: Browse real weddings we've had the honor of catering  │   ║
║  │ LINK: View all real weddings →                           │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                                  ║
║  GALLERY GRID (CSS Grid, 2x2 desktop, 1 col mobile):            ║
║  ┌────────────────────┐ ┌────────────────────┐                ║
║  │ [Image: Wedding 1] │ │ [Image: Wedding 2] │                ║
║  │                    │ │                    │                ║
║  │ Overlay on hover:  │ │ Overlay on hover:  │                ║
║  │ "Sarah & Alex"     │ │ "Maria & Ivan"     │                ║
║  │ Garden Wedding     │ │ Ballroom Elegance  │                ║
║  │ 150 guests         │ │ 200 guests         │                ║
║  │ Read story →       │ │ Read story →       │                ║
║  └────────────────────┘ └────────────────────┘                ║
║  ┌────────────────────┐ ┌────────────────────┐                ║
║  │ [Image: Wedding 3] │ │ [Image: Wedding 4] │                ║
║  │ ...                │ │ ...                │                ║
║  └────────────────────┘ └────────────────────┘                ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SECTION 4: VIDEO TESTIMONIALS                                   ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  LAYOUT: Two-column (video left, quote right) on desktop;       ║
║          Stacked on mobile                                       ║
║                                                                 ║
║  HEADER:                                                         ║
║  H2: Hear From Happy Couples                                    ║
║                                                                 ║
║  CONTENT:                                                       ║
║  ┌─────────────────────────────────┐ ┌─────────────────────┐   ║
║  │  VIDEO CONTAINER               │ │ QUOTE CARD          │   ║
║  │  ┌───────────────────────────┐ │ │                     │   ║
║  │  │ ▶ YouTube/Vimeo embed     │ │ │ ⭐⭐⭐⭐⭐           │   ║
║  │  │ 16:9 aspect ratio        │ │ │                     │   ║
║  │  │ Autoplay disabled         │ │ │ "The food was        │   ║
║  │  │ Poster thumbnail          │ │ │  absolutely incredible│   ║
║  │  └───────────────────────────┘ │ │  and our guests are   │   ║
║  │                                 │ │  still talking about  │   ║
║  │ Play button overlay on hover   │ │  it six months later." │   ║
║  │                                 │ │                     │   ║
║  │ — Sarah & Alex J.              │ │ — Elena & Dmitry K.  │   ║
║  │   Garden Wedding, June 2024    │ │   Winter Wedding     │   ║
║  └─────────────────────────────────┘ └─────────────────────┘   ║
║                                                                  ║
║  [Additional testimonial carousel below]                          ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SECTION 5: SERVICE STYLES                                       ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  HEADER:                                                         ║
║  H2: Every Couple, Every Style                                  ║
║  P: Choose the dining experience that matches your vision        ║
║                                                                 ║
║  CARDS (3-column grid, equal height):                            ║
║                                                                 ║
║  ┌─────────────────────────────────────────────────────────┐   ║
║  │ CARD 1: SEATED DINNER                                    │   ║
║  │ ┌─────────────────────────────────────────────────────┐ │   ║
║  │ │ [Image: Elegant seated dinner setting]              │ │   ║
║  │ ├─────────────────────────────────────────────────────┤ │   ║
║  │ │ H3: Seated Dinner                                   │ │   ║
║  │ │ P: Formal, elegant, traditional multi-course        │ │   ║
║  │ │    experience with impeccable table service          │ │   ║
║  │ │                                                     │ │   ║
║  │ │ ✓ Best for: Formal venues, 50+ guests             │ │   ║
║  │ │ ✓ Includes: Full service, china, linens           │ │   ║
║  │ │                                                     │ │   ║
║  │ │ [Explore Seated Dinners →]                         │ │   ║
║  │ └─────────────────────────────────────────────────────┘ │   ║
║  ├─────────────────────────────────────────────────────────┤   ║
║  │ CARD 2: STATIONS STYLE                                  │   ║
║  │ [Similar structure - Interactive grazing stations]     │   ║
║  ├─────────────────────────────────────────────────────────┤   ║
║  │ CARD 3: COCKTAIL RECEPTION                             │   ║
║  │ [Similar structure - Passed appetizers, mingling]      │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SECTION 6: THE PROCESS                                         ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  HEADER:                                                         ║
║  H2: From First Conversation to Last Bite                       ║
║                                                                 ║
║  TIMELINE (horizontal on desktop, vertical on mobile):           ║
║                                                                 ║
║  ① ─────── ② ─────── ③ ─────── ④                              ║
║  │        │        │        │                                  ║
║  ▼        ▼        ▼        ▼                                  ║
║  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                          ║
║  │ ICON │ │ ICON │ │ ICON │ │ ICON │                          ║
║  │      │ │      │ │      │ │      │                          ║
║  │Consult│ │Tasting│ │Custom-│ │Event │                          ║
║  │ ation│ │Experi│ │ization│ │Day   │                          ║
║  │      │ │ence  │ │      │ │Magic │                          ║
║  └──────┘ └──────┘ └──────┘ └──────┘                          ║
║                                                                  ║
║  Step descriptions beneath each icon                              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SECTION 7: SAMPLE PACKAGES                                      ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  HEADER:                                                         ║
║  H2: Wedding Package Options                                    ║
║  P: All packages fully customizable to your vision               ║
║                                                                 ║
║  PRICING TABLE (3 tiers):                                        ║
║  ┌─────────────────────────────────────────────────────────┐   ║
║  │                                                         │   ║
║  │  CLASSIC          PREMIUM           PLATINUM           │   ║
║  │  ─────────        ──────────        ──────────         │   ║
║  │  From X₽/person  From Y₽/person   Custom Quote       │   ║
║  │                                                         │   ║
║  │  • Passed hors     • Everything in   • Fully custom     │   ║
║  │    d'oeuvres        Classic, plus:                      │   ║
║  │  • 3 entree        • Signature       • Dedicated event  │   ║
║  │    choices          cocktail hour    manager            │   ║
║  │  • Selected sides  • Action stations • Unlimited        │   ║
║  │  • Cake coord.     (2)              customization       │   ║
║  │                                                         │   ║
║  │  [View Menu]      [View Menu]      [Request Proposal]  │   ║
║  │                                                         │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                                  ║
║  NOTE: "All menus accommodate dietary needs. Exact pricing      ║
║        provided after consultation."                              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SECTION 8: DIETARY ACCOMMODATIONS                               ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  ICON ROW:                                                       ║
║  🌱 Vegan  |  🌾 Gluten-Free  |  🥛 Dairy-Free                 ║
║  🍖 Halal  |  ✡ Kosher  |  🔵 Nut-Free                        ║
║                                                                  ║
║  TEXT: "No dietary need is too complex. Our culinary team        ║
║        excels at creating inclusive menus that every guest        ║
║        can enjoy safely and deliciously."                         ║
║                                                                  ║
║  LINK: Learn about our dietary protocols →                       ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SECTION 9: FAQ (Accordion)                                      ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  H2: Frequently Asked Questions                                  ║
║                                                                 ║
║  ACCORDION ITEMS:                                                ║
║  ▸ How far in advance should we book?                           ║
║  ▸ Do you offer tastings? What's included?                     ║
║  ▸ Can you accommodate dietary restrictions?                   ║
║  ▸ What's included in your service?                            ║
║  ▸ Do you provide rentals (linens, china, glassware)?         ║
║  ▸ What are payment terms?                                     ║
║  ▸ What is your service area?                                 ║
║  ▸ What happens if we need to change guest count?              ║
║  ▸ Do you work with our venue/florist/other vendors?          ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SECTION 10: URGENCY + CONVERSION                                ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  LAYOUT: Contrasting background (gold gradient or dark)           ║
║                                                                 ║
║  ┌─────────────────────────────────────────────────────────┐   ║
║  │                                                         │   ║
║  │  📅 2025 Wedding Dates Now Open                        │   ║
║  │                                                         │   ║
║  │  Peak season dates (May-October) fill 4-6 months       │   ║
║  │  in advance. Early booking ensures:                     │   ║
║  │                                                         │   ║
║  │  ✓ Your preferred date secured                          │   ║
║  │  ✓ Complimentary tasting session                        │   ║
║  │  ✓ Priority scheduling flexibility                     │   ║
║  │  ✓ More time for menu customization                    │   ║
║  │                                                         │   ║
║  │  CTAs:                                                 │   ║
║  │  ┌────────────────────┐ ┌────────────────────┐        │   ║
║  │  │ 📅 Check Your Date │ │ 📞 Contact Us       │        │   ║
║  │  └────────────────────┘ └────────────────────┘        │   ║
║  │                                                         │   ║
║  │  Or call us: +7 (XXX) XXX-XX-XX                       │   ║
║  │                                                         │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Corporate Catering Landing Page Wireframe

### Page Metadata

```
URL: /corporate/
Title: Corporate Event Catering in Saint Petersburg | Interfood
Meta Description: Premium corporate catering for meetings, conferences,
and company events. Impress clients and motivate teams with exceptional food.
Primary CTA: Get Corporate Packet / Request Quote
Target Audience: Event planners, office managers, executives, HR
```

### Section-by-Section Specification

```
╔══════════════════════════════════════════════════════════════════╗
║  SECTION 1: HERO (Corporate Aesthetic)                            ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  BACKGROUND: Professional corporate event imagery                  ║
║  OVERLAY: Dark gradient for text legibility (more contrast than  ║
║            wedding page)                                          ║
║                                                                 ║
║  CONTENT:                                                        ║
║  ┌─────────────────────────────────────────────────────────┐   ║
║  │  BADGE: Trusted by Leading Companies                    │   ║
║  │                                                         │   ║
║  │  H1: Corporate Catering That Makes You Look Good        │   ║
║  │                                                         │   ║
║  │  P: Impress clients, motivate teams, and celebrate       │   ║
║  │     milestones with exceptional food and seamless       │   ║
║  │     professional service.                               │   ║
║  │                                                         │   ║
║  │  STATS BAR:                                             │   ║
║  │  15+ yrs · 2000+ events · 98% satisfaction             │   ║
║  │                                                         │   ║
║  │  CTAs:                                                 │   ║
║  │  [Get Corporate Packet]  [Request Quote]                │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SECTION 2: CLIENT LOGOS                                         ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  TEXT: "Trusted by leading companies and organizations"           ║
║                                                                 ║
║  LOGO WALL (grayscale, color on hover):                          ║
║  [Logo1] [Logo2] [Logo3] [Logo4] [Logo5] [Logo6]                 ║
║  (Use placeholder or actual client logos with permission)         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SECTION 3: SERVICE TYPES GRID                                   ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  H2: Solutions for Every Business Occasion                       ║
║                                                                 ║
║  2x3 Grid of Service Cards:                                     ║
║  ┌────────────┐ ┌────────────┐ ┌────────────┐                   ║
║  │ EXECUTIVE  │ │ COMPANY    │ │ CLIENT     │                   ║
║  │ MEETINGS   │ │ EVENTS     │ │ ENTERTAIN. │                   ║
║  │            │ │            │ │            │                   ║
║  │ [Icon+Img] │ │ [Icon+Img] │ │ [Icon+Img] │                   ║
║  │ Board mtgs │ │ Holidays   │ │ Business   │                   ║
║  │ Lunches    │ │ Team build │ │ dinners    │                   ║
║  │ Investor   │ │ Retreats   │ │ Golf       │                   ║
║  │ meetings   │ │ Celebrations│ │ Receptions │                   ║
║  │            │ │            │ │            │                   ║
║  │ Learn more→│ │ Learn more→│ │ Learn more→│                   ║
║  └────────────┘ └────────────┘ └────────────┘                   ║
║  ┌────────────┐ ┌────────────┐ ┌────────────┐                   ║
║  │ CONFERENCE │ │ TRAINING   │ │ VIRTUAL/   │                   ║
║  │ CATERING   │ │ EVENTS     │ │ HYBRID     │                   ║
║  │ ...        │ │ ...        │ │ ...        │                   ║
║  └────────────┘ └────────────┘ └────────────┘                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SECTION 4: CASE STUDIES                                          ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  H2: Recent Corporate Success Stories                            ║
║                                                                 ║
║  CASE STUDY CARDS (alternating layout or grid):                   ║
║  ┌─────────────────────────────────────────────────────────┐   ║
║  │ CASE STUDY: [Company Name/Type]                        │   ║
║  │                                                         │   ║
║  │ CHALLENGE:                                             │   ║
║  │ "Annual shareholder meeting for 500 attendees with     │   ║
║  │  VIP dinner following"                                 │   ║
║  │                                                         │   ║
║  │ SOLUTION:                                              │   ║
║  │ Custom menu with dietary accommodations, premium       │   ║
║  │ presentation, seamless service coordination            │   ║
║  │                                                         │   ║
║  │ RESULT:                                                │   ║
║  │ "Best catering we've ever had. Flawless execution."    │   ║
║  │ — Event Director, [Company]                            │   ║
║  │                                                         │   ║
║  │ [Read Full Case Study →]                               │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                                  ║
║  [2-3 case studies total]                                       ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SECTION 5: MENUS BY OCCASION (Tabbed Interface)                 ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  TABS: [Breakfast/Lunch] [Cocktail Reception] [Full Dinner]      ║
║                                                                 ║
║  TAB PANEL CONTENT:                                              ║
║  ┌─────────────────────────────────────────────────────────┐   ║
║  │ Sample menu items for this occasion type                │   ║
║  │                                                         │   ║
║  │ • Item 1 description                                    │   ║
║  │ • Item 2 description                                    │   ║
║  │ • Item 3 description                                    │   ║
║  │ • ...                                                   │   ║
║  │                                                         │   ║
║  │ Pricing: From X₽/person                                │   ║
║  │ Minimum: N guests                                       │   ║
║  │ Setup time: X hours before event                        │   ║
║  │                                                         │   ║
║  │ [Download Full Menu PDF]  [Request Custom Menu]         │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SECTION 6: WHY CORPORATES CHOOSE US                             ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  H2: The Professional Difference                                 ║
║                                                                 ║
║  TWO-COLUMN LAYOUT:                                              ║
║  ┌─────────────────────────────┬─────────────────────────────┐   ║
║  │ ACCOUNT MANAGEMENT           │ LOGISTICS & CAPABILITIES    │   ║
║  │                             │                             │   ║
║  │ ✓ Single point of contact   │ ✓ Arrive 2+ hours early    │   ║
║  │ ✓ Monthly invoicing option  │ ✓ Full cleanup included     │   ║
║  │ ✓ Repeat client perks       │ ✓ Insurance covered         │   ║
║  │ ✓ Volume discounts          │ ✓ Permits handled           │   ║
║  │ ✓ Dedicated account mgr     │ ✓ Scalable 10-10,000 guests │   ║
║  │                             │ ✓ Dietary expertise        │   ║
║  └─────────────────────────────┴─────────────────────────────┘   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SECTION 7: CORPORATE QUOTE FORM                                  ║
║  ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║  H2: Request a Corporate Catering Proposal                       ║
║  P: Fill out the form below and we'll respond within 24 hours    ║
║                                                                 ║
║  FORM FIELDS:                                                   ║
║  ┌─────────────────────────────────────────────────────────┐   ║
║  │ Company Name *                                   [______] │   ║
║  │ Contact Name *                                    [______] │   ║
║  │ Business Email *                                  [______] │   ║
║  │ Phone *                                           [______] │   ║
║  │                                                         │   ║
║  │ Event Type * (dropdown)                               [______] │   ║
║  │   ▸ Board Meeting                                     │   ║
║  │   ▸ Company Celebration                               │   ║
║  │   ▸ Client Entertainment                              │   ║
║  │   ▸ Conference/Training                               │   ║
║  │   ▸ Holiday Party                                     │   ║
║  │   ▸ Other                                            │   ║
║  │                                                         │   ║
║  │ Expected Headcount (range)                        [______] │   ║
║  │ Date(s) Considering                              [______] │   ║
║  │ Budget Range (optional)                           [______] │   ║
║  │                                                         │   ║
║  │ Additional Details                                   [______] │   ║
║  │ [Large textarea]                                       │   ║
║  │                                                         │   ║
║  │ [ Submit Request ]                                     │   ║
║  │                                                         │   ║
║  │ We respect your privacy. No spam, ever.               │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Social Events Landing Page Wireframe (Condensed)

### Page Metadata

```
URL: /social-events/
Title: Social Event Catering | Private Parties & Celebrations | Interfood
Meta Description: From birthday parties to anniversaries, make your
social event unforgettable with premium catering. Custom menus for any celebration.
Primary CTA: Get Started / View Social Menus
```

### Key Sections

```
╔══════════════════════════════════════════════════════════════════╗
║  HERO                                                           ║
║  ─────────────────────────────────────────────────────────────  ║
║  Warm, celebratory imagery                                       ║
║  H1: Life's Moments Deserve Great Food                         ║
║  Subhead: Birthdays, anniversaries, milestones - we make        ║
║          every celebration memorable and delicious              ║
║  CTAs: [View Social Menus] [Tell Us About Your Event]          ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  EVENT TYPE GRID (Visual, warm)                                 ║
║  ─────────────────────────────────────────────────────────────  ║
║  2x4 or 3x3 grid of event type cards:                          ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          ║
║  │ Birthday │ │Anniver-  │ │Gradua-   │ │Holiday   │          ║
║  │ Parties  │ │sary      │ │tion      │ │Parties   │          ║
║  │ [img]    │ │[img]     │ │[img]     │ │[img]     │          ║
║  └──────────┘ └──────────┘ └──────────┘ └──────────┘          ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          ║
║  │ Bridal   │ │Baby/     │ │Religious │ │Memorial  │          ║
║  │ Showers  │ │Baptism   │ │Events    │ │Services  │          ║
║  │ [img]    │ │[img]     │ │[img]     │ │[img]     │          ║
║  └──────────┘ └──────────┘ └──────────┘ └──────────┘          ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  GALLERY (Mixed social events - carousel or masonry grid)         ║
║  ─────────────────────────────────────────────────────────────  ║
║  8-12 images from various social event types                     ║
║  Lightbox on click                                               ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SIMPLIFIED PROCESS (3 steps only)                               ║
║  ─────────────────────────────────────────────────────────────  ║
║  ① Tell Us About Your Event → ② We'll Customize Your Menu       ║
║      → ③ Enjoy Your Celebration (we handle everything)          ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  SOCIAL MENU SAMPLES (Lighter than wedding/corporate)            ║
║  ─────────────────────────────────────────────────────────────  ║
║  3 casual package options or "build your own" concept            ║
║  Emphasis on fun, customization, stress-free experience          ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║  FRIENDLY CONTACT CTA                                             ║
║  ─────────────────────────────────────────────────────────────  ║
║  "Let's Make Your Celebration Unforgettable"                     ║
║  Simple form: Name, Email, Event Type, Date, Message            ║
║  OR: "Prefer to chat? Call us at [phone]"                        ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Implementation Notes

### Component Library Needed

| Component | Used On | Priority |
|----------|---------|----------|
| HeroSection | All LPs | High |
| TrustBar | Wedding, Corporate | High |
| GalleryGrid | Wedding, Social | High |
| TestimonialCarousel | Wedding | Medium |
| ServiceCardGrid | All LPs | High |
| ProcessTimeline | Wedding, Social | Medium |
| PricingTable | Wedding | Medium |
| FAQAccordion | Wedding | Low-Medium |
| CaseStudyCard | Corporate | Medium |
| TabInterface | Corporate | Medium |
| QuoteForm | Corporate, Social | High |
| UrgencySection | Wedding | Medium |
| IconRow | Wedding | Low |

### Responsive Breakpoints

```
Mobile-first approach:
- Base: < 640px (single column)
- sm: ≥ 640px (minor adjustments)
- md: ≥ 768px (2 columns where applicable)
- lg: ≥ 1024px (full desktop layouts)
- xl: ≥ 1280px (max container width)
```

### Animation Recommendations

- **Scroll-triggered reveals** for each section (staggered)
- **Hover effects** on cards (lift, shadow)
- **Counter animation** for statistics
- **Smooth accordion** open/close for FAQ
- **Parallax** on hero images (subtle)

---

*Wireframes ready for development handoff.*
