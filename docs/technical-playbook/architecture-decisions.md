# Architecture Decisions - Catering Websites Analysis

**Analysis Date:** 2025-01-15  
**Sites Analyzed:** 15 premium catering websites  
**Goal:** Document site architecture patterns, URL structures, routing approaches, and structural decisions

---

## Table of Contents

1. [CMS Platform Architecture](#1-cms-platform-architecture)
2. [URL Structure Patterns](#2-url-structure-patterns)
3. [Page Organization](#3-page-organization)
4. [Navigation Architecture](#4-navigation-architecture)
5. [Routing Approaches](#5-routing-approaches)
6. [Internal Linking Structure](#6-internal-linking-structure)
7. [Component Architecture](#7-component-architecture)
8. [Data Flow & State Management](#8-data-flow--state-management)
9. [SEO Architecture](#9-seo-architecture)
10. [Recommended Architecture for New Sites](#10-recommended-architecture-for-new-sites)

---

## 1. CMS Platform Architecture

### 1.1 Platform Distribution

```
Platform Market Share (15 sites analyzed):

Squarespace  ████████████████████  47% (7 sites)
WordPress    ████████████          27% (4 sites)
Webflow      █████                13% (2 sites)
HubSpot      ██                    7% (1 site)
Wix          ██                    7% (1 site)
Custom       ██                    7% (1 site)
```

### 1.2 Platform-Specific Architectures

#### Squarespace Architecture (7 sites)

```
┌─────────────────────────────────────────────────────────────┐
│                      SQUARESPACE                             │
├─────────────────────────────────────────────────────────────┤
│  Template Layer                                              │
│  ├── Brine Family Templates (most common)                   │
│  ├── Fluid Engine (newer sites)                            │
│  └── Developer Platform (custom code injection)             │
├─────────────────────────────────────────────────────────────┤
│  Content Management                                          │
│  ├── Pages (standard pages)                                 │
│  ├── Collections (blog, events, galleries)                  │
│  ├── Products (if e-commerce)                               │
│  └── Cover Pages (landing pages)                            │
├─────────────────────────────────────────────────────────────┤
│  Asset Delivery                                              │
│  ├── Static Assets CDN (squarespace-cdn.com)               │
│  ├── Image Processing API (?format=XXw)                     │
│  └── Font Delivery (Typekit + Google Fonts)                 │
├─────────────────────────────────────────────────────────────┤
│  Integration Points                                          │
│  ├── Code Injection (header/footer/code block)              │
│  ├── Tock/Acuity (native booking)                           │
│  ├── Mailchimp (native newsletter)                          │
│  └── External embeds via Code Blocks                        │
└─────────────────────────────────────────────────────────────┘
```

**Key Squarespace Features Used:**
- **Cover Pages:** Landing pages for campaigns (Creative Edge, MyRadish)
- **Summary Blocks:** Dynamic content aggregation (all SS sites)
- **Index Pages:** Gallery-style page collections (SaltBlock)
- **Blog for News/Events:** Content marketing (Tall Guy, Concorde)

#### WordPress Architecture (4 sites)

```
┌─────────────────────────────────────────────────────────────┐
│                       WORDPRESS                              │
├─────────────────────────────────────────────────────────────┤
│  Theme Layer                                                  │
│  ├── Astra Theme (Elegant Affairs, JDK Group)              │
│  ├── Custom/Agency Themes                                   │
│  └── Page Builders: Elementor / Beaver Builder              │
├─────────────────────────────────────────────────────────────┤
│  Plugin Ecosystem                                            │
│  ├── SEO: Yoast SEO / RankMath                             │
│  ├── Forms: Gravity Forms / Contact Form 7 / WPForms       │
│  ├── Performance: WP Rocket / Smush                         │
│  ├── Security: Wordfence                                    │
│  └── Cookie Consent: Borlabs / Cookiebot                   │
├─────────────────────────────────────────────────────────────┤
│  Custom Post Types                                           │
│  ├── Menu Items (CPT with custom fields)                    │
│  ├── Events/Galleries                                       │
│  ├── Testimonials                                           │
│  └── Team Members                                           │
├─────────────────────────────────────────────────────────────┤
│  Headless Options (Gamma Catering uses Vue.js frontend)     │
│  ├── REST API exposed                                      │
│  ├── Vue.js SPA consuming API                              │
│  └── Decoupled content management                          │
└─────────────────────────────────────────────────────────────┘
```

#### Webflow Architecture (2 sites)

```
┌─────────────────────────────────────────────────────────────┐
│                        WEBFLOW                               │
├─────────────────────────────────────────────────────────────┤
│  Designer Layer                                               │
│  ├── Visual Canvas (no-code design)                         │
│  ├── Interactions Panel (animations/triggers)               │
│  └── Components (symbols, reusable elements)                │
├─────────────────────────────────────────────────────────────┤
│  CMS Collection                                               │
│  ├── Team Members (dynamic staff pages)                     │
│  ├── Services/Menus                                         │
│  ├── Blog Posts                                             │
│  └── Testimonials                                           │
├─────────────────────────────────────────────────────────────┤
│  Publishing                                                   │
│  ├── Webflow Hosting (automatic SSL, CDN)                   │
│  ├── Export Option (static HTML export possible)            │
│  └── Webflow.js (runtime interactions)                      │
├─────────────────────────────────────────────────────────────┤
│  Technical Output                                             │
│  ├── Clean semantic HTML                                    │
│  ├── CSS Grid/Flexbox layouts                               │
│  ├── Minimal JavaScript footprint                           │
│  └── CloudFront CDN delivery                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. URL Structure Patterns

### 2.1 Common URL Conventions

| Site Type | Pattern | Example |
|-----------|---------|---------|
| **Squarespace** | `/{page-slug}` | `/wedding-catering` |
| **WordPress** | `/{page-slug}/` or `/{category}/{slug}/` | `/services/wedding-catering/` |
| **Webflow** | `/{collection-name}/{item-slug}` | `/menu/wedding-packages` |
| **HubSpot** | `/{page-slug}` | `/corporate-catering` |
| **Wix** | `/{page-slug}` | `/our-menu` |

### 2.2 URL Structure Analysis by Site

**Squarespace Sites (Flat Structure):**
```
/                          → Home
/about                     → About Us
/menu                      → Menu/Services
/weddings                  → Wedding Catering
/corporate                  → Corporate Events
/social                    → Social Events
/gallery                   → Photo Gallery
/reviews                   → Testimonials
/blog                      → Blog/News
/contact                   → Contact
/book-now                  → Booking/Tock
```

**WordPress Sites (Hierarchical):**
```
/                          → Home
/about/                    → About
/about/our-team/           → Team Members
/services/                 → Services Parent
/services/weddings/        → Weddings
/services/corporate/       → Corporate
/services/menus/           → Menus
/portfolio/                → Portfolio/Events
/blog/                     → Blog
/blog/category/events/     → Event Category
/contact/                  → Contact
/privacy-policy/           → Legal
```

**Webflow Sites (Collection-based):**
```
/                          → Home
/about                     → About
/work/                     → Work/Portfolio Collection
/work/project-name/        → Individual Project
/services/                 → Services Collection
/service-name/             → Individual Service
/team/                     → Team Collection
/team/member-name/         → Team Member
/blog/                     → Blog
/blog/post-title/          → Blog Post
/contact                   → Contact
```

### 2.3 Best Practices Observed

✅ **Good Patterns:**
- Short, descriptive URLs (`/weddings` not `/?page_id=123`)
- Hyphens not underscores (`wedding-catering` not `wedding_catering`)
- Lowercase only
- No query parameters for static pages
- Consistent trailing slash behavior

❌ **Patterns to Avoid:**
- Deep nesting (`/category/subcategory/item/`)
- Numeric IDs in URLs
- Uppercase characters
- Special characters beyond hyphens

---

## 3. Page Organization

### 3.1 Standard Page Types Found

| Page Type | Sites Having | Purpose |
|-----------|--------------|---------|
| **Home/Landing** | 15/15 (100%) | Primary conversion point |
| **About Us** | 15/15 (100%) | Company story, team |
| **Services/Menu** | 14/15 (93%) | Core offerings |
| **Weddings** | 12/15 (80%) | Wedding-specific info |
| **Corporate Events** | 11/15 (73%) | B2B services |
| **Gallery/Portfolio** | 13/15 (87%) | Visual proof of quality |
| **Testimonials/Reviews** | 11/15 (73%) | Social proof |
| **Blog/News** | 10/15 (67%) | Content marketing |
| **Contact** | 15/15 (100%) | Lead generation |
| **Booking/Quote** | 12/15 (80%) | Conversion action |
| **FAQ** | 6/15 (40%) | Common questions |
| **Privacy Policy** | 8/15 (53%) | Legal compliance |

### 3.2 Homepage Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│  HERO SECTION                                                │
│  - Full-width image/video background                        │
│  - Compelling headline + subheadline                       │
│  - Primary CTA (Get Quote / Book Now)                       │
│  - Optional: Secondary CTA (View Menu)                      │
├─────────────────────────────────────────────────────────────┤
│  SOCIAL PROOF BAR                                            │
│  - "Trusted by X+ clients"                                  │
│  - Client logos or review stars                             │
├─────────────────────────────────────────────────────────────┤
│  SERVICES OVERVIEW (3-4 columns)                             │
│  - Weddings                                                 │
│  - Corporate Events                                         │
│  - Social Parties                                           │
│  - Each with icon + brief description + link               │
├─────────────────────────────────────────────────────────────┤
│  FEATURED GALLERY / PORTFOLIO                                │
│  - Masonry or grid layout                                   │
│  - 6-12 featured images                                     │
│  - Hover effects revealing event type                       │
├─────────────────────────────────────────────────────────────┤
│  ABOUT SNIPPET                                               │
│  - Brief company story (2-3 paragraphs)                     │
│  - Chef/Owner photo                                         │
│  - Link to full about page                                  │
├─────────────────────────────────────────────────────────────┤
│  TESTIMONIALS SLIDER                                         │
│  - 3-5 rotating testimonials                               │
│  - Client name + event type                                 │
│  - Star rating if available                                 │
├─────────────────────────────────────────────────────────────┤
│  CTA SECTION                                                 │
│  - "Ready to plan your event?"                              │
│  - Contact form or booking link                             │
│  - Phone number prominently displayed                       │
├─────────────────────────────────────────────────────────────┤
│  FOOTER                                                      │
│  - Navigation links                                         │
│  - Social media icons                                       │
│  - Contact information                                     │
│  - Newsletter signup                                        │
│  - Legal links (Privacy, Terms)                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Service Page Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  SERVICE PAGE: WEDDING CATERING                             │
├─────────────────────────────────────────────────────────────┤
│  HERO                                                       │
│  - Beautiful wedding photo                                  │
│  - H1: "Wedding Catering Services"                         │
│  - Brief tagline                                           │
├─────────────────────────────────────────────────────────────┤
│  INTRODUCTION                                                │
│  - 2-3 paragraphs about wedding approach                   │
│  - Emphasis on customization, quality, experience           │
├─────────────────────────────────────────────────────────────┤
│  PACKAGES / TIERS (Optional)                                │
│  - Silver Package ($X per person)                           │
│  - Gold Package ($X per person)                             │
│  - Platinum Package ($X per person)                         │
│  - Or: Fully customizable options                           │
├─────────────────────────────────────────────────────────────┤
│  MENU PREVIEW                                                │
│  - Sample menu items with photos                           │
│  - Dietary accommodation note                              │
│  - Link to full sample menus                               │
├─────────────────────────────────────────────────────────────┤
│  PROCESS / WHAT TO EXPECT                                    │
│  1. Initial Consultation                                   │
│  2. Custom Proposal                                        │
│  3. Tasting Session                                        │
│  4. Final Details                                         │
│  5. Event Day Execution                                    │
├─────────────────────────────────────────────────────────────┤
│  GALLERY                                                     │
│  - 8-12 wedding photos in grid                             │
│  - Lightbox on click                                       │
├─────────────────────────────────────────────────────────────┤
│  TESTIMONIALS (Wedding-specific)                             │
│  - 3-4 wedding couple reviews                              │
├─────────────────────────────────────────────────────────────┤
│  FAQ                                                         │
│  - Common wedding catering questions                       │
│  - Accordion format                                        │
├─────────────────────────────────────────────────────────────┤
│  CTA                                                         │
│  - "Start Planning Your Wedding" button                    │
│  - Contact form or link to inquiry                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Navigation Architecture

### 4.1 Primary Navigation Patterns

**Pattern A: Service-Based (Most Common - 10 sites)**
```
Home | About | Weddings | Corporate | Social | Gallery | Contact
```

**Pattern B: Audience-Based (5 sites)**
```
Home | Plan an Event | Our Menus | Our Story | Gallery | Contact
```

**Pattern C: Simplified (Luxury brands - 3 sites)**
```
Home | Services | About | Contact [+ Menu for more]
```

### 4.2 Mobile Navigation Patterns

**Hamburger Menu (Universal):**

```html
<!-- Mobile Nav Structure -->
<header class="header">
  <a href="/" class="logo" aria-label="Home">
    <img src="logo.svg" alt="Company Name">
  </a>
  
  <nav class="nav-primary" id="main-nav" aria-label="Main navigation">
    <ul class="nav-primary__links">
      <li><a href="/about">About</a></li>
      <li class="has-dropdown">
        <button aria-expanded="false" aria-haspopup="true">
          Services
        </button>
        <ul class="dropdown">
          <li><a href="/weddings">Weddings</a></li>
          <li><a href="/corporate">Corporate</a></li>
          <li><a href="/social">Social Events</a></li>
        </ul>
      </li>
      <!-- ... more items -->
    </ul>
  </nav>
  
  <div class="header-actions">
    <a href="/contact" class="btn btn--primary">Get a Quote</a>
    <button class="hamburger" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<!-- Mobile overlay -->
<div class="nav-overlay" aria-hidden="true"></div>
```

### 4.3 Secondary Navigation Elements

| Element | Sites Using | Placement |
|---------|-------------|-----------|
| **Sticky Header** | 12/15 (80%) | Fixed top on scroll |
| **CTA Button in Header** | 11/15 (73%) | Right side of nav |
| **Phone Number Visible** | 9/15 (60%) | Header or sticky bar |
| **Utility Bar** | 5/15 (33%) | Top of header (social, login) |
| **Breadcrumb** | 4/15 (27%) | Below header on inner pages |
| **Sidebar Nav** | 3/15 (20%) | Service detail pages |

---

## 5. Routing Approaches

### 5.1 MPA vs SPA Distribution

| Approach | Count | Platforms | Characteristics |
|----------|-------|-----------|-----------------|
| **MPA (Multi-Page App)** | 13/15 (87%) | All except custom | Traditional server-rendered pages |
| **SPA (Single-Page App)** | 1/15 (7%) | Gamma Catering (Vue.js) | Client-side routing |
| **Hybrid** | 1/15 (7%) | Some WordPress | Partial SPA sections |

### 5.2 Server-Side Rendering (MPA)

**Advantages observed:**
- Better initial SEO (content in HTML)
- Simpler analytics tracking
- Full page reloads = fresh state
- Works without JavaScript
- Easier to implement

**Most sites use this approach.**

### 5.3 Client-Side Rendering (SPA)

**Gamma Catering's Vue.js approach:**

```javascript
// Vue Router configuration
const routes = [
  { path: '/', component: HomePage },
  { path: '/en', component: HomePage },
  { path: '/services', component: ServicesPage },
  { path: '/gallery', component: GalleryPage },
  { path: '/contact', component: ContactPage },
]

// SSR considerations for SEO
// - Pre-render critical pages
// - Use meta tags management (vue-meta)
// - Implement fallback for no-JS
```

### 5.4 Recommendation for New Sites

> **Use MPA (Multi-Page Application)** unless you have specific SPA requirements.
> 
> Rationale:
> - 87% of successful caterers use MPA
> - Better SEO out of the box
> - Easier to maintain
> - Third-party integrations work better
> - Analytics simpler to implement

---

## 6. Internal Linking Structure

### 6.1 Observed Linking Patterns

**Homepage → Inner Pages:**
```
Hero CTA → /contact or /book-now
Services Overview → /weddings, /corporate, /social
Gallery Preview → /gallery (filtered?)
About Snippet → /about
Testimonial → /reviews or /about#testimonials
Blog Preview → /blog/latest-post
```

**Service Pages → Cross-Linking:**
```
Weddings → Related gallery images
         → Sample wedding menus
         → Wedding testimonials
         → Contact for quote
         
Corporate → Corporate packages
          → Case studies
          → Contact for proposal
```

### 6.2 Silo Architecture (Best Practice)

```
                    ┌─────────┐
                    │  HOME   │
                    └────┬────┘
                         │
        ┌────────┬───────┼───────┬────────┐
        ▼        ▼       ▼       ▼        ▼
   ┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐
   │ ABOUT  │ │WEDDING│ │CORP. │ │SOCIAL│ │GALLERY │
   └────────┘ └──┬───┘ └──┬───┘ └──┬───┘ └────────┘
                 │        │        │
           ┌─────┴────┐   │   ┌────┴────┐
           ▼          ▼   ▼   ▼         ▼
        ┌──────┐  ┌──────┐┌──────┐┌──────┐┌──────┐
        │Menus │  │Process││Packages││FAQ  ││Team  │
        └──────┘  └──────┘└──────┘└──────┘└──────┘
```

### 6.3 Footer Link Architecture

```
FOOTER SECTIONS:

Column 1: Company
├── About Us
├── Our Team
├── Careers
└── Press

Column 2: Services  
├── Wedding Catering
├── Corporate Events
├── Social Parties
├── Menus
└── Pricing

Column 3: Resources
├── Gallery
├── Blog
├── Testimonials
├── FAQ
└── Event Planning Tips

Column 4: Connect
├── Contact Us
├── Get a Quote
├── Newsletter Signup
├── Social Media Links
└── Location/Map

Bottom Row:
├── Privacy Policy
├── Terms of Service
├── Accessibility Statement
└── © 2025 Company Name
```

---

## 7. Component Architecture

### 7.1 Reusable Component Inventory

Based on analysis, these components appear across most sites:

| Component | Usage Frequency | Variations |
|-----------|-----------------|------------|
| **Header/Nav** | 15/15 (100%) | Sticky, transparent→solid |
| **Hero Section** | 15/15 (100%) | Image, video, slider |
| **CTA Banner** | 14/15 (93%) | Multiple placements |
| **Card Component** | 13/15 (87%) | Service, gallery, testimonial |
| **Gallery Grid** | 13/15 (87%) | Masonry, uniform, carousel |
| **Footer** | 15/15 (100%) | Multi-column |
| **Contact Form** | 14/15 (93%) | Inline, modal, dedicated page |
| **Testimonial Slider** | 11/15 (73%) | Carousel, grid |
| **Social Proof Bar** | 10/15 (67%) | Logos, stats, stars |
| **Accordion/FAQ** | 8/15 (53%) | Standard accordion |
| **Image Lightbox** | 9/15 (60%) | Various libraries |
| **Newsletter Form** | 8/15 (53%) | Footer, inline, modal |
| **Breadcrumb** | 4/15 (27%) | Standard breadcrumb |

### 7.2 Component Specification Example

```yaml
component: HeroSection
props:
  variant:
    - 'image'        # Static background image
    - 'video'        # Background video
    - 'slider'       # Image carousel
    - 'gradient'     # Color gradient overlay
  height:
    - 'full'         # 100vh
    - 'large'        # 70vh
    - 'medium'       # 50vh
  alignment:
    - 'center'       # Centered text
    - 'left'         # Left-aligned
  overlay:
    - 'dark'         # Dark overlay for light text
    - 'light'        # Light overlay for dark text
    - 'gradient'     # Gradient overlay
  cta:
    primary:
      text: string
      url: string
    secondary:
      text: string
      url: string
slots:
  default:           # Main content area
  'above-cta':       # Content between headline and buttons
  'below-hero':      # Scroll indicator, etc.

usage_examples:
  - page: home
    variant: image
    height: large
    overlay: dark
  - page: service
    variant: image
    height: medium
    overlay: gradient
```

---

## 8. Data Flow & State Management

### 8.1 Form Data Flow

```
User fills form
       ↓
Client-side validation
       ↓
[Optional] Spam protection (reCAPTCHA/honeypot)
       ↓
Submit to endpoint
       ↓
    ┌───┴───┐
    ↓       ↓
 CMS API  Email Service
(HubSpot) (SendGrid/etc)
    ↓       ↓
    └───┬───┘
        ↓
  Notification to admin
        ↓
  Auto-response to user
        ↓
  CRM entry created
```

### 8.2 Booking Data Flow (Tock Integration)

```
User clicks "Book Now"
       ↓
Redirect to Tock widget/page
       ↓
Tock handles:
  - Date selection
  - Party size
  - Event type
  - Contact info
  - Deposit (if configured)
       ↓
Confirmation email (Tock)
       ↓
Notification to caterer
       ↓
Calendar sync
```

### 8.3 Analytics Data Flow

```
User Interaction
       ↓
Event Listener (click, scroll, submit)
       ↓
dataLayer.push() [GTM]
       ↓
    ┌───┼───┐
    ↓   ↓   ↓
   GA4  FB  Clarity
    ↓   ↓   ↓
Dashboards/Reports
```

---

## 9. SEO Architecture

### 9.1 Structured Data Implementation

**Schema.org Types Detected:**

| Schema Type | Sites Using | Purpose |
|-------------|-------------|---------|
| **WebSite** | 12/15 (80%) | Site identity, search action |
| **LocalBusiness** | 10/15 (67%) | Business info, location |
| **Organization** | 5/15 (33%) | Company details |
| **BreadcrumbList** | 6/15 (40%) | Navigation path |
| **WebPage** | 5/15 (33%) | Page-specific metadata |
| **ImageObject** | 4/15 (27%) | Image metadata |
| **ContactPoint** | 3/15 (20%) | Contact information |
| **Product/Service** | 2/15 (13%) | Offerings |
| **Article/BlogPosting** | 3/15 (20%) | Blog posts |
| **FAQPage** | 2/15 (13%) | FAQ content |

### 9.2 Structured Data Pattern (JSON-LD)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "FoodEstablishment"],
  "name": "Your Catering Company",
  "description": "Premium catering services for weddings, corporate events, and social gatherings",
  "url": "https://yourcatering.com",
  "telephone": "+1-555-123-4567",
  "email": "info@yourcatering.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Culinary Street",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "40.7128",
    "longitude": "-74.0060"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  ],
  "sameAs": [
    "https://www.instagram.com/yourcatering",
    "https://www.facebook.com/yourcatering",
    "https://www.linkedin.com/company/yourcatering"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "127"
  },
  "priceRange": "$$",
  "servesCuisine": ["American", "Italian", "Asian Fusion"],
  "hasMenu": "https://yourcatering.com/menu"
}
</script>
```

### 9.3 Meta Tag Architecture

```html
<!-- Essential Meta Tags -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Primary Keyword - Brand Name | Secondary Info</title>
<meta name="description" content="155-160 characters including primary keyword and value proposition">

<!-- Open Graph (Facebook, LinkedIn) -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://yourcatering.com/page-url">
<meta property="og:title" content="Page Title | Brand Name">
<meta property="og:description" content="Description for social sharing">
<meta property="og:image" content="https://yourcatering.com/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Page Title | Brand Name">
<meta name="twitter:description" content="Description for Twitter">
<meta name="twitter:image" content="https://yourcatering.com/twitter-image.jpg">

<!-- Additional SEO -->
<link rel="canonical" href="https://yourcatering.com/page-url">
<meta name="robots" content="index, follow">
<link rel="alternate" hreflang="en" href="https://yourcatering.com/en/">

<!-- Favicon (complete set) -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

---

## 10. Recommended Architecture for New Sites

### 10.1 Recommended Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                RECOMMENDED ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PLATFORM: Squarespace (for ease) OR Webflow (for control)  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  FRONTEND LAYER                                      │    │
│  │  • Semantic HTML5                                   │    │
│  │  • CSS Custom Properties (design tokens)            │    │
│  │  • Vanilla JS or lightweight framework               │    │
│  │  • Responsive (mobile-first)                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  INTEGRATION LAYER                                   │    │
│  │  • GTM (tag management hub)                         │    │
│  │  • GA4 + Facebook Pixel + Clarity                   │    │
│  │  • Crisp Chat (optional)                            │    │
│  │  • Tock (booking)                                   │    │
│  │  • Mailchimp (newsletter)                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PERFORMANCE LAYER                                  │    │
│  │  • CDN (platform-provided)                          │    │
│  │  • Image optimization (WebP, lazy loading)          │    │
│  │  • Font loading (preconnect + display:swap)         │    │
│  │  • Resource hints (preload, prefetch)               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ACCESSIBILITY LAYER                                │    │
│  │  • WCAG 2.1 AA compliance                          │    │
│  │  • ARIA landmarks + labels                         │    │
│  │  • Skip navigation                                 │    │
│  │  • Keyboard navigable                              │    │
│  │  • Reduced motion support                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 File/Folder Structure (Reference)

```
project-root/
├── index.html              # Homepage
├── about/
│   └── index.html          # About page
├── services/
│   ├── index.html          # Services overview
│   ├── weddings/
│   │   └── index.html      # Wedding catering
│   ├── corporate/
│   │   └── index.html      # Corporate events
│   └── social/
│       └── index.html      # Social parties
├── menu/
│   └── index.html          # Menus/samples
├── gallery/
│   └── index.html          # Photo gallery
├── reviews/
│   └── index.html          # Testimonials
├── blog/
│   ├── index.html          # Blog listing
│   └── post/
│       └── slug/
│           └── index.html  # Individual post
├── contact/
│   └── index.html          # Contact page
├── privacy-policy/
│   └── index.html          # Legal page
├── assets/
│   ├── css/
│   │   ├── main.css        # Main stylesheet
│   │   └── components/     # Component styles
│   ├── js/
│   │   ├── main.js         # Main JavaScript
│   │   └── components/     # Component scripts
│   ├── images/
│   │   ├── hero/           # Hero images
│   │   ├── gallery/        # Gallery images
│   │   ├── icons/          # Icons/SVGs
│   │   └── og/             # Social sharing images
│   └── fonts/              # Self-hosted fonts (if any)
├── favicon.ico
├── robots.txt
├── sitemap.xml
└── humans.txt               # Human-readable site info
```

### 10.3 Key Architecture Decisions Checklist

- [ ] **Platform Selection:** Squarespace vs WordPress vs Webflow vs Custom
- [ ] **URL Structure:** Flat vs hierarchical (recommend flat for simplicity)
- [ ] **Navigation:** Max 7 top-level items
- [ ] **Page Types:** Identify all required pages
- [ ] **Component System:** Reusable components inventory
- [ ] **Form Strategy:** HubSpot vs native vs third-party
- [ ] **Booking Flow:** Tock integration or custom
- [ ] **Analytics Stack:** GA4 + GTM as foundation
- [ ] **SEO Foundation:** Structured data, meta tags, sitemap
- [ ] **Performance Budget:** Define targets before building
- [ ] **Accessibility Target:** WCAG 2.1 AA minimum
- [ ] **Content Workflow:** How will non-technical users update?

---

## Appendix: Architecture Comparison Matrix

| Criterion | Squarespace | WordPress | Webflow | Custom |
|-----------|-------------|-----------|---------|--------|
| **Ease of Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| **Design Freedom** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Content Management** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Performance (OOTB)** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **SEO Capabilities** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **E-commerce** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Cost (Monthly)** | $23-$46 | $15-$45 | $14-$39 | Varies |
| **Maintenance** | Low | Medium | Low | High |
| **Best For** | Quick launch, non-technical teams | Maximum flexibility, complex needs | Design-focused, clean code | Unique requirements, dev resources |
