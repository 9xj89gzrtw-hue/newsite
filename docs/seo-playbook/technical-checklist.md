# Technical SEO Checklist & Templates — Catering Industry

## Complete Technical Implementation Guide

Based on analysis of 15 top-performing catering websites, this playbook provides ready-to-use templates and implementation checklists.

---

## Table of Contents

1. [Page Metadata Templates](#page-metadata-templates)
2. [Complete JSON-LD Schema Library](#complete-json-ld-schema-library)
3. [Technical SEO Checklist](#technical-seo-checklist)
4. [Core Web Vitals Optimization](#core-web-vitals-optimization)
5. [Sitemap & robots.txt Templates](#sitemap--robotstxt-templates)

---

## Page Metadata Templates

### Ideal Title Tag Formula for Catering Sites

```
[Brand Name] | [Primary Keyword] [Location] | [Unique Value Proposition]
```

**Length Target:** 50-60 characters (optimal), max 70 characters

#### Title Templates by Page Type:

| Page | Template | Example |
|------|----------|---------|
| Homepage | `[Brand] \| [Location] Catering Services \| [Tagline]` | `Wolfgang Puck Catering \| The Standard for Culinary Excellence` |
| Wedding | `Wedding Catering [Location] \| [Brand] - [Differentiator]` | `Wedding Catering Philadelphia \| Queen of Hearts - Since 1986` |
| Corporate | `Corporate Event Catering [Location] \| [Brand]` | `Corporate Catering DC \| Ridgewells - 95+ Years` |
| Menus | `[Type] Menu \| [Brand] [Location] Catering` | `Seasonal Menu \| Global Gourmet Bay Area Catering` |
| About | `About [Brand] \| [Location]'s Premier Caterer` | `About Tall Guy and a Grill \| Milwaukee's Green Caterer` |
| Contact | `Contact [Brand] \| Get a Quote for [Location] Catering` | `Contact Sopranos \| Southeast Michigan Catering Quotes` |
| Gallery | `[Event Type] Portfolio \| [Brand] [Location]` | `Wedding Gallery \| Elegant Affairs NYC & Hamptons` |
| Blog | `[Topic] Tips \| [Brand] Catering Blog` | `Wedding Planning Tips \| Gamma Catering Blog` |

---

### Meta Description Templates

**Length Target:** 140-160 characters (optimal), max 220 characters

#### Template A: Service-Focused (Homepage)
```
[Brand] delivers [quality level] catering services in [Location]. 
Expert [service types] for [event types]. [CTA] your custom quote today!
```
*Character count: ~145*

**Example:**
```
Wolfgang Puck Catering offers nationwide event catering services. 
Our offerings range from social and corporate events to workplace 
food services.
```

#### Template B: Trust & Experience
```
Trusted by [number]+ clients since [year], [Brand] is [Location]'s 
choice for [services]. [Key differentiator]. Book your event today!
```

#### Template C: Comprehensive (Service Pages)
```
Premium [service type] in [Location]. [Brand] provides full-service 
[key features] with [unique selling point]. View menus & pricing.
```

#### Template D: Location-Specific (City Pages)
```
Looking for catering in [City], [State]? [Brand] serves [area] with 
[event types]. [Number] star reviews. Free quotes available!
```

---

### Open Graph Tags (Social Sharing)

```html
<!-- Primary Meta Tags -->
<title>[Your Title Here]</title>
<meta name="title" content="[Your Title Here]">
<meta name="description" content="[Your description here - 200-300 chars for OG]">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://example.com/page-url/">
<meta property="og:title" content="[Your Title Here]">
<meta property="og:description" content="[Your description here - 2-4 sentences]">
<meta property="og:image" content="https://example.com/images/social-share-1200x630.jpg">
<meta property="og:site_name" content="[Your Brand Name]">
<meta property="og:locale" content="en_US">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://example.com/page-url/">
<meta property="twitter:title" content="[Your Title Here]">
<meta property="twitter:description" content="[Your description here]">
<meta property="twitter:image" content="https://example.com/images/social-share-1200x630.jpg">
```

**Image Specifications:**
- **Recommended Size:** 1200 x 630 pixels
- **Max File Size:** 8MB
- **Format:** PNG or JPG
- **Alt Text:** Include brand + context

---

### Canonical URL Implementation

```html
<link rel="canonical" href="https://example.com/current-page/" />
```

**When to Use:**
- Every page MUST have a canonical URL
- HTTPS version (not HTTP)
- No trailing slash inconsistency
- Query parameters stripped

**Special Cases:**
```html
<!-- Pagination -->
<link rel="canonical" href="https://example.com/category/" />
<link rel="prev" href="https://example.com/category/page/2/" />
<link rel="next" href="https://example.com/category/page/4/" />

<!-- Cross-domain (if applicable) -->
<link rel="canonical" href="https://main-site.com/original-page/" />
```

---

### Hreflang Tags (Multilingual Sites)

```html
<!-- English (default) -->
<link rel="alternate" hreflang="en" href="https://example.com/en/" />

<!-- German -->
<link rel="alternate" hreflang="de" href="https://example.com/de/" />

<!-- German (Switzerland) -->
<link rel="alternate" hreflang="de-ch" href="https://example.com/de-ch/" />

<!-- French (Switzerland) -->
<link rel="alternate" hreflang="fr-ch" href="https://example.com/fr-ch/" />

<!-- x-default for language selection page -->
<link rel="alternate" hreflang="x-default" href="https://example.com/" />
```

---

## Complete JSON-LD Schema Library

### Schema 1: Organization + LocalBusiness (REQUIRED for every page)

```json
{
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness", "FoodEstablishment"],
  "@id": "https://example.com/#organization",
  "name": "[Brand Name]",
  "alternateName": "[Short Name / DBA]",
  "url": "https://example.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://example.com/images/logo.png",
    "width": 600,
    "height": 60
  },
  "image": {
    "@type": "ImageObject", 
    "url": "https://example.com/images/storefront.jpg",
    "width": 1200,
    "height": 630
  },
  "description": "[Brand] is [Location]'s premier catering company specializing in [services]. [Years] years of excellence.",
  "telephone": "+1-XXX-XXX-XXXX",
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+1-XXX-XXX-XXXX",
      "contactType": "sales",
      "availableLanguage": ["English"]
    }
  ],
  "email": "info@example.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street, Suite 100",
    "addressLocality": "City",
    "addressRegion": "ST",
    "postalCode": "12345",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "XX.XXXXXX",
    "longitude": "-XX.XXXXXX"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "08:00",
      "closes": "17:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday"],
      "opens": "09:00",
      "closes": "14:00"
    }
  ],
  "sameAs": [
    "https://www.facebook.com/example",
    "https://www.instagram.com/example",
    "https://www.pinterest.com/example",
    "https://www.linkedin.com/company/example"
  ],
  "foundingDate": "YYYY-MM-DD",
  "founders": {
    "@type": "Person",
    "name": "[Founder Name]"
  },
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": "XX"
  },
  "areaServed": [
    {"@type": "City", "name": "City 1"},
    {"@type": "City", "name": "City 2"},
    {"@type": "City", "name": "City 3"}
  ],
  "priceRange": "$$$$",
  "currenciesAccepted": "USD",
  "paymentAccepted": "Cash, Credit Card, Check"
}
```

---

### Schema 2: WebPage (Every Page)

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://example.com/page/#webpage",
  "url": "https://example.com/page/",
  "name": "[Page Title]",
  "isPartOf": {
    "@type": "WebSite",
    "@id": "https://example.com/#website"
  },
  "about": {
    "@type": "Thing",
    "name": "[Primary Topic]"
  },
  "description": "[Page meta description]",
  "breadcrumb": {
    "@id": "https://example.com/page/#breadcrumb"
  },
  "inLanguage": "en-US",
  "potentialAction": [
    {
      "@type": "ReadAction",
      "target": ["https://example.com/page/"]
    }
  ]
}
```

---

### Schema 3: BreadcrumbList (All Inner Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://example.com/services/weddings/#breadcrumb",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Services",
      "item": "https://example.com/services/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Wedding Catering",
      "item": "https://example.com/services/weddings/"
    }
  ]
}
```

---

### Schema 4: FAQ (FAQ Pages or Sections with 3+ Questions)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How far in advance should I book catering?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We recommend booking [X] weeks in advance for weddings and [Y] weeks for corporate events to ensure availability and allow time for menu customization."
      }
    },
    {
      "@type": "Question",
      "name": "What is the minimum guest count for catering?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our minimum varies by service type: [details]. Contact us for specific requirements."
      }
    },
    {
      "@type": "Question",
      "name": "Do you accommodate dietary restrictions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! We offer extensive options for vegetarian, vegan, gluten-free, kosher, halal, and allergy-friendly diets."
      }
    },
    {
      "@type": "Question",
      "name": "What areas do you serve?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We serve [list cities/areas] and surrounding regions within approximately [X] miles of our kitchen."
      }
    },
    {
      "@type": "Question",
      "name": "Can I customize my menu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! All our menus are fully customizable. Our culinary team works with you to create a menu that reflects your vision and preferences."
      }
    }
  ]
}
```

---

### Schema 5: Service (Service Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://example.com/services/weddings/#service",
  "name": "Wedding Catering Services",
  "description": "Full-service wedding catering including custom menu creation, professional service staff, and complete event coordination.",
  "provider": {
    "@type": "Organization",
    "@id": "https://example.com/#organization",
    "name": "[Brand Name]"
  },
  "serviceType": "Catering Service",
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "XX.XXXXXX",
      "longitude": "-XX.XXXXXX"
    },
    "geoRadius": {
      "@type": "Distance",
      "value": 50,
      "unitCode": "KMT"
    }
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Wedding Packages",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Platinum Wedding Package",
          "description": "Full-service luxury wedding catering"
        },
        "price": "150",
        "priceCurrency": "USD",
        "unitCode": "CTM"
      }
    ]
  },
  "termsOfService": "https://example.com/terms/",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "87",
    "bestRating": "5"
  }
}
```

---

### Schema 6: Event (Event Pages / Featured Events)

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "[Event Name]",
  "startDate": "2025-06-15T17:00:00",
  "endDate": "2025-06-15T23:00:00",
  "location": {
    "@type": "Place",
    "name": "[Venue Name]",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Venue Street",
      "addressLocality": "City",
      "addressRegion": "ST",
      "postalCode": "12345",
      "addressCountry": "US"
    }
  },
  "organizer": {
    "@type": "Organization",
    "@id": "https://example.com/#organization",
    "name": "[Brand Name]"
  },
  "description": "[Event description]",
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/contact/",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "validFrom": "2025-01-01T00:00:00"
  },
  "performer": {
    "@type": "Organization",
    "name": "[Brand Name]"
  }
}
```

---

### Schema 7: Review + AggregateRating (Testimonials/Review Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  "itemReviewed": {
    "@type": "Organization",
    "@id": "https://example.com/#organization",
    "name": "[Brand Name]"
  },
  "ratingValue": "4.9",
  "bestRating": "5",
  "worstRating": "1",
  "ratingCount": "247",
  "reviewCount": "156"
}

// Individual Review:
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Organization",
    "name": "[Brand Name]"
  },
  "author": {
    "@type": "Person",
    "name": "[Client Name]"
  },
  "datePublished": "2024-12-15",
  "reviewBody": "[Full review text - minimum 50 characters]",
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5"
  },
  "publisher": {
    "@type": "Organization",
    "name": "[Platform Name - Google, WeddingWire, etc.]"
  }
}
```

---

### Schema 8: Article (Blog Posts)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Blog Post Title]",
  "description": "[Post meta description/excerpt]",
  "image": "https://example.com/blog/post-image.jpg",
  "datePublished": "2025-01-15T10:00:00",
  "dateModified": "2025-01-16T14:30:00",
  "author": {
    "@type": "Person",
    "name": "[Author Name]",
    "url": "https://example.com/about/team/"
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://example.com/#organization",
    "name": "[Brand Name]"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/blog/post-slug/"
  }
}
```

---

## Technical SEO Checklist

### Pre-Launch Checklist

#### Essential (Must Have)
- [ ] **Canonical URL** on every page
- [ ] **Meta title** unique per page (50-60 chars optimal)
- [ ] **Meta description** unique per page (140-160 chars)
- [ ] **H1 tag** exactly one per page with primary keyword
- [ ] **JSON-LD Organization schema** on all pages
- [ ] **JSON-LD BreadcrumbList** on inner pages
- [ ] **Open Graph tags** on all pages
- [ ] **Twitter Card tags** on all pages
- [ ] **robots.txt** file present and configured
- [ ] **XML sitemap** submitted to search engines
- [ ] **SSL certificate** (HTTPS) active
- [ ] **Favicon** present (multiple sizes)
- [ ] **404 page** designed and functional

#### Important (Should Have)
- [ ] **Hreflang tags** if multilingual
- [ ] **FAQ schema** on FAQ pages
- [ ] **Service schema** on service pages
- [ ] **Article schema** on blog posts
- [ ] **Review/AggregateRating** schema
- [ ] **Image alt text** on all images
- [ ] **Internal linking** between related pages
- [ ] **Mobile-responsive** design
- [ ] **Fast loading** (< 3 seconds)
- [ ] **Structured data testing** passed

#### Nice to Have
- [ ] **Event schema** for featured events
- [ ] **Video schema** if videos present
- [ ] **How-to schema** for guides
- [ ] **Product schema** for packages
- [ ] **Breadcrumb navigation** visible
- [ ] **Related posts** on blog
- [ ] **Table of contents** on long pages

---

### Performance Optimization

#### Core Web Vitals Targets

| Metric | Target | Impact |
|--------|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s | Visual loading |
| FID (First Input Delay) | < 100ms | Interactivity |
| CLS (Cumulative Layout Shift) | < 0.1 | Visual stability |

#### Image Optimization
```html
<!-- Modern image element with lazy loading -->
<picture>
  <source srcset="image-480w.webp 480w, image-800w.webp 800w" 
          type="image/webp">
  <source srcset="image-480w.jpg 480w, image-800w.jpg 800w" 
          type="image/jpeg">
  <img src="image-800w.jpg" 
       alt="[Descriptive alt text]" 
       width="800" 
       height="600"
       loading="lazy"
       decoding="async">
</picture>
```

#### Font Loading
```html
<!-- Optimal font preconnect + display=swap -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Family:wght@400;700&display=swap" 
      rel="stylesheet">

<style>
  /* Ensure text remains visible during font load */
  body { font-family: system-ui, -apple-system, sans-serif; }
  .font-loaded { font-family: 'Family', sans-serif; }
</style>
```

#### Critical CSS Inlining
```html
<head>
  <!-- Critical above-fold CSS inline -->
  <style>
    /* Header, hero section, critical layout */
    header { ... }
    .hero { ... }
    h1 { ... }
  </style>
  
  <!-- Rest of CSS loaded async -->
  <link rel="preload" href="/styles/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/styles/main.css"></noscript>
</head>
```

---

## Sitemap & robots.txt Templates

### XML Sitemap

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Homepage - highest priority -->
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2025-01-20</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Main Service Pages -->
  <url>
    <loc>https://example.com/services/weddings/</loc>
    <lastmod>2025-01-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://example.com/services/corporate/</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://example.com/services/social-events/</loc>
    <lastmod>2025-01-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Menu Pages -->
  <url>
    <loc>https://example.com/menus/sample-menus/</loc>
    <lastmod>2025-01-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- About -->
  <url>
    <loc>https://example.com/about/</loc>
    <lastmod>2024-12-01</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Gallery -->
  <url>
    <loc>https://example.com/gallery/</loc>
    <lastmod>2025-01-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Blog Posts -->
  <url>
    <loc>https://example.com/blog/wedding-planning-tips/</loc>
    <lastmod>2025-01-08</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Location Pages -->
  <url>
    <loc>https://example.com/catering-city-name/</loc>
    <lastmod>2025-01-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Contact -->
  <url>
    <loc>https://example.com/contact/</loc>
    <lastmod>2024-11-01</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  
</urlset>
```

### robots.txt

```text
# robots.txt for example.com

User-agent: *
Allow: /

# Disallow admin/private areas
Disallow: /admin/
Disallow: /wp-admin/
Disallow: /cgi-bin/
Disallow: /api/private/

# Disallow search results, cart, thank-you pages
Disallow: /search?
Disallow: /cart
Disallow: /thank-you
Disallow: /quote-received

# Allow important assets
Allow: /wp-content/uploads/
Allow: /images/
Allow: /css/
Allow: /js/

# Sitemap location
Sitemap: https://example.com/sitemap.xml

# Crawl-delay for aggressive bots (optional)
# User-agent: AhrefsBot
# Crawl-delay: 2
```

---

## Quick Reference: Meta Tag Summary

### Head Section Template (Copy-Paste Ready)

```html
<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  
  <!-- Primary Meta -->
  <title>[Page Title | Brand Name]</title>
  <meta name="description" content="[Meta description 140-160 chars]">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="https://example.com/this-page/">
  
  <!-- Favicon -->
  <link rel="icon" href="/favicon.ico" sizes="32x32">
  <link rel="icon" type="image/png" href="/favicon-192x192.png" sizes="192x192">
  <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png">
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://example.com/this-page/">
  <meta property="og:title" content="[Page Title | Brand Name]">
  <meta property="og:description" content="[OG description 2-4 sentences]">
  <meta property="og:image" content="https://example.com/images/og-image.jpg">
  <meta property="og:site_name" content="[Brand Name]">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="[Page Title | Brand Name]">
  <meta name="twitter:description" content="[Description]">
  <meta name="twitter:image" content="https://example.com/images/og-image.jpg">
  
  <!-- Preconnect for Performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="dns-prefetch" href="//www.googletagmanager.com">
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    ...
  }
  </script>
  
  <!-- Stylesheets -->
  <link rel="stylesheet" href="/styles.css">
</head>
```

---

## Testing & Validation Tools

| Tool | Purpose | URL |
|------|---------|-----|
| Google Rich Results Test | Validate structured data | https://search.google.com/test/rich-results |
| Schema Markup Validator | Test JSON-LD syntax | https://validator.schema.org/ |
| Google Search Console | Monitor indexing | https://search.google.com/search-console |
| PageSpeed Insights | Core Web Vitals | https://pagespeed.web.dev/ |
| Mobile-Friendly Test | Mobile optimization | https://search.google.com/test/mobile-friendly |
| Facebook Sharing Debugger | OG tags preview | https://developers.facebook.com/tools/debug/ |
| Twitter Card Validator | Twitter cards | https://cards-dev.twitter.com/validator |
| Bing Webmaster Tools | Bing SEO | https://www.bing.com/webmasters |

---

## Document Information

**Generated:** January 2025  
**Source Data:** 15 top catering websites analyzed  
**Industry:** Food Services / Catering  
**Last Updated:** See git history for changes
