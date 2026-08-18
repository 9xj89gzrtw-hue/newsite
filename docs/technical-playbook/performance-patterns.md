# Performance Patterns - Catering Websites Analysis

**Analysis Date:** 2025-01-15  
**Sites Analyzed:** 15 premium catering websites  
**Goal:** Document performance optimization techniques used by top catering websites

---

## Table of Contents

1. [Image Optimization Strategies](#1-image-optimization-strategies)
2. [Font Loading Patterns](#2-font-loading-patterns)
3. [JavaScript Loading Strategies](#3-javascript-loading-strategies)
4. [CSS Performance](#4-css-performance)
5. [CDN & Caching](#5cdn--caching)
6. [Resource Hints](#6-resource-hints)
7. [Critical Rendering Path](#7-critical-rendering-path)
8. [Performance Budget Recommendations](#8-performance-budget-recommendations)

---

## 1. Image Optimization Strategies

### 1.1 Image Formats Used

| Format | Usage Count | Sites Using | Notes |
|--------|-------------|-------------|-------|
| **JPEG/JPG** | 15/15 (100%) | All sites | Primary format for photos |
| **PNG** | 14/15 (93%) | Most sites | Logos, graphics with transparency |
| **WebP** | 5/15 (33%) | Elegant Affairs, Gamma, Queen of Hearts, Ridgewells | Modern format with better compression |
| **SVG** | 7/15 (47%) | Multiple sites | Icons, logos, decorative elements |
| **GIF** | 3/15 (20%) | Cut and Taste, JDK Group, Ridgewells | Limited use for animations |

### 1.2 Responsive Image Patterns

#### Squarespace Pattern (7 sites)
```html
<!-- Squarespace automatic responsive images -->
<img 
  src="https://images.squarespace-cdn.com/content/v1/.../image.jpg?format=750w"
  srcset="
    https://images.squarespace-cdn.com/content/.../image.jpg?format=100w 100w,
    https://images.squarespace-cdn.com/content/.../image.jpg?format=300w 300w,
    https://images.squarespace-cdn.com/content/.../image.jpg?format=500w 500w,
    https://images.squarespace-cdn.com/content/.../image.jpg?format=750w 750w,
    https://images.squarespace-cdn.com/content/.../image.jpg?format=1000w 1000w,
    https://images.squarespace-cdn.com/content/.../image.jpg?format=1500w 1500w
  "
  sizes="(max-width: 799px) 90vw, 1000px"
  loading="lazy"
  alt="Descriptive alt text"
>
```

#### Wix Pattern (Ridgewells)
```html
<!-- Wix optimized image delivery -->
<img 
  src="https://static.wixstatic.com/media/image.jpg?v=1&usm=0.66_1.00_0.01"
  style="object-fit:cover; width:100%; height:100%"
  loading="lazy"
>
```

### 1.3 Lazy Loading Implementation

**Universal Pattern (13/15 sites):**
```html
<img src="image.jpg" loading="lazy" alt="..." decoding="async">
```

**JavaScript-based Lazy Loading (older pattern):**
```javascript
// Intersection Observer pattern (used in custom implementations)
const lazyImages = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      observer.unobserve(img);
    }
  });
});

lazyImages.forEach(img => imageObserver.observe(img));
```

### 1.4 Image Sizing Strategy

| Site Category | Max Width Used | Breakpoints | Technique |
|---------------|----------------|-------------|-----------|
| Hero Images | 1500w-1920w | 3-5 breakpoints | `srcset` with format parameter |
| Gallery Images | 800w-1200w | 3 breakpoints | Responsive sizing |
| Thumbnails | 300w-400w | Fixed size | Single optimized size |
| Logo/Icons | SVG preferred | N/A | Vector format |

---

## 2. Font Loading Patterns

### 2.1 Font Providers Detected

| Provider | Sites Using | Detection Method |
|----------|-------------|------------------|
| **Google Fonts** | 12/15 (80%) | fonts.googleapis.com |
| **Adobe Fonts (Typekit)** | 4/15 (27%) | use.typekit.net, p.typekit.net |
| **System Fonts** | 3/15 (20%) | No external font requests |
| **Custom Hosted** | 2/15 (13%) | Self-hosted font files |

### 2.2 Google Fonts Implementation

**Best Practice Pattern:**
```html
<!-- Preconnect hints (CRITICAL for performance) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Font loading with display=swap -->
<link href="https://fonts.googleapis.com/css2?family=Font+Name:wght@400;600;700&display=swap" rel="stylesheet">
```

**Font Display Values Observed:**
- `display=swap` - **12/12 Google Fonts users** ✅ RECOMMENDED
- No display parameter - 0 sites (all using swap)

### 2.3 Adobe Fonts (Typekit) Pattern

```html
<!-- Preconnect for Typekit -->
<link rel="preconnect" href="https://use.typekit.net" crossorigin>
<link rel="preconnect" href="https://p.typekit.net" crossorigin>

<!-- Typekit embed -->
<script>
  (function(d) {
    var config = { kitId: 'xxxxxxx', scriptTimeout: 3000, async: true },
        h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kit+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s);
  })(document);
</script>
```

### 2.4 Font Families in Use

**Serif Fonts (for headings/elegance):**
- Adobe Caslon Pro (Concorde Catering)
- Adobe Garamond Pro (Tall Guy)
- Roboto Slab (JDK Group)

**Sans-Serif Fonts (for body/UI):**
- Poppins (Concorde, MyRadish) - *Most popular*
- Montserrat (Tall Guy)
- Nunito Sans (Creative Edge)
- Manrope (Creative Edge)
- Rubik (Cut and Taste)
- Raleway (JDK Group)
- Albert Sans (Wolfgang Puck)
- PP Neue Montreal (Gamma Catering)

---

## 3. JavaScript Loading Strategies

### 3.1 Script Loading Attributes

| Attribute | Sites Using | Purpose |
|-----------|-------------|---------|
| `async` | 11/15 (73%) | Non-blocking load, executes when ready |
| `defer` | 10/15 (67%) | Non-blocking load, executes after DOM parse |
| `type="module"` | 2/15 (13%) | ES modules (modern sites) |

### 3.2 Loading Pattern Examples

**Google Tag Manager (Universal):**
```html
<!-- GTM with async - standard implementation -->
<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX"></script>
```

**Analytics Scripts:**
```html
<!-- GA4 gtag.js with async -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>

<!-- Facebook Pixel with async -->
<script async src="https://connect.facebook.net/en_US/fbevents.js"></script>

<!-- Microsoft Clarity with async -->
<script async src="https://www.clarity.ms/tag/XXXXXXX"></script>
```

**Third-Party Widgets:**
```html
<!-- Chat widgets loaded asynchronously -->
<script defer src="https://widget.crisp.chat/lXXXXXX/crisp.js"></script>

<!-- Booking systems deferred -->
<iframe defer src="https://www.tock.com/..."></iframe>
```

### 3.3 Module Preloading (Advanced - Gamma Catering)

```html
<!-- Vue.js module preloading for cookie consent -->
<link rel="modulepreload" href="/wp-content/plugins/borlabs-cookie/assets/javascript/borlabs-cookie-box.min.js" as="script" crossorigin>
<link rel="modulepreload" href="/wp-content/plugins/borlabs-cookie/assets/javascript/borlabs-widget.min.js" as="script" crossorigin>
```

---

## 4. CSS Performance

### 4.1 Critical CSS Inlining

**Pattern detected in:** Wix sites, some WordPress themes

```html
<style>
  /* Critical above-the-fold styles inlined */
  .hero { min-height: 70vh; background: ... }
  .nav { display: flex; align-items: center; }
  /* ... essential styles only ... */
</style>
```

### 4.2 CSS Delivery Methods

| Method | Sites Using | Performance Impact |
|--------|-------------|-------------------|
| External CSS files | 15/15 (100%) | Standard, cacheable |
| Inline critical CSS | 3/15 (20%) | Faster first paint |
| CSS-in-JS (React) | 2/15 (13%) | Runtime overhead but dynamic |
| Internal `<style>` blocks | 5/15 (33%) | Platform-generated |

### 4.3 CSS Custom Properties for Theming

**Performance benefit:** Reduces CSS size through token reuse

```css
:root {
  --color-primary: #1a1a1a;
  --transition-base: 250ms ease;
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}
/* Reusable tokens reduce repetition */
```

---

## 5. CDN & Caching

### 5.1 CDN Usage Distribution

| CDN Provider | Sites Using | Features |
|--------------|-------------|----------|
| **Squarespace CDN** | 7 (47%) | Auto-optimization, global edge |
| **Cloudflare** | 2 (13%) | DDoS protection, caching rules |
| **Webflow + CloudFront** | 2 (13%) | AWS infrastructure |
| **Wix Static CDN** | 1 (7%) | Wix-managed |
| **HubSpot CDN** | 1 (7%) | HubSpot-hosted assets |
| **Self-hosted/Direct** | 2 (13%) | Direct server delivery |

### 5.2 Cache-Control Hints (Detected)

**Common patterns observed:**

```
# Static assets (JS/CSS/images)
Cache-Control: public, max-age=31536000, immutable

# HTML pages
Cache-Control: no-cache, must-revalidate

# API responses
Cache-Control: max-age=3600
```

### 5.3 Squarespace CDN URL Pattern

```
https://images.squarespace-cdn.com/content/v1/{site_id}/{asset_path}?format={width}w
```

**Format options available:** 100w, 300w, 500w, 750w, 1000w, 1500w, 1920w, 2500w

---

## 6. Resource Hints

### 6.1 Preconnect Usage (12/15 sites)

```html
<!-- Most common preconnect patterns -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://www.googletagmanager.com">
<link rel="preconnect" href="https://images.squarespace-cdn.com" crossorigin>
<link rel="preconnect" href="https://use.typekit.net" crossorigin>
<link rel="preconnect" href="https://p.typekit.net" crossorigin>
<link rel="preconnect" href="https://cdn.prod.website-files.com" crossorigin>
```

### 6.2 DNS Prefetch Usage (4/15 sites)

```html
<!-- DNS prefetch for less critical domains -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="dns-prefetch" href="//www.googletagmanager.com">
```

### 6.3 Prefetch Usage (3/15 sites)

```html
<!-- Prefetch next page or likely navigation targets -->
<link rel="prefetch" href="/menu-page">
<link rel="prefetch" href="/contact">
```

### 6.4 Preload Usage (4/15 sites)

```html
<!-- Preload critical resources -->
<link rel="preload" href="/fonts/main-font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/images/hero-bg.jpg" as="image">
<link rel="preload" href="/css/critical.css" as="style">
```

---

## 7. Critical Rendering Path

### 7.1 Head Element Structure (Optimized Pattern)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- 1. Character set (must be early) -->
  <meta charset="utf-8">
  
  <!-- 2. Viewport meta (early for mobile) -->
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <!-- 3. Preconnect to critical origins -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- 4. Preload critical resources -->
  <link rel="preload" as="font" type="font/woff2" crossorigin href="...">
  
  <!-- 5. Title & SEO meta -->
  <title>Site Title</title>
  <meta name="description" content="...">
  
  <!-- 6. Critical CSS (inline) -->
  <style>/* above-fold styles */</style>
  
  <!-- 7. Async external CSS (non-render-blocking) -->
  <!-- Note: CSS is normally render-blocking, but non-critical can be loaded via JS -->
</head>
```

### 7.2 Third-Party Script Loading Order

**Recommended order (observed in best-performing sites):**

1. **Immediate (sync):** None (except analytics snippets)
2. **Async (high priority):** GTM, core analytics
3. **Defer (medium priority):** Main app JS, chat widgets
4. **Lazy (low priority):** Social embeds, booking widgets, reviews

---

## 8. Performance Budget Recommendations

### 8.1 Based on Industry Analysis

For a new catering website targeting similar quality to analyzed sites:

| Metric | Budget Target | Rationale |
|--------|---------------|-----------|
| **First Contentful Paint (FCP)** | < 1.5s | Average of analyzed sites: 1.2-2.1s |
| **Largest Contentful Paint (LCP)** | < 2.5s | Hero images are main bottleneck |
| **Time to Interactive (TTI)** | < 3.5s | Many third-party scripts slow this down |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Dynamic content causes shifts |
| **Total Page Weight** | < 2MB initial | Average observed: 1.5-4MB |
| **JavaScript Bundle** | < 300KB gzipped | Excluding third-party scripts |
| **CSS Bundle** | < 50KB gzipped | Critical path only |
| **Images (above fold)** | < 500KB total | Hero + logo only |
| **Requests (initial)** | < 40 | Combine where possible |

### 8.2 Performance Checklist for New Development

#### Must-Have (High Impact)

- [ ] Implement `loading="lazy"` on all below-fold images
- [ ] Add `preconnect` for fonts.googleapis.com and fonts.gstatic.com
- [ ] Use `display=swap` on all Google Fonts
- [ ] Serve WebP images with JPEG fallback
- [ ] Use `async` or `defer` on all non-critical JavaScript
- [ ] Compress and optimize all images before upload
- [ ] Minify CSS and JavaScript in production
- [ ] Enable gzip/brotli compression on server

#### Should-Have (Medium Impact)

- [ ] Implement responsive images with `srcset` and `sizes`
- [ ] Preload hero image and critical fonts
- [ ] Inline critical CSS (above-fold styles)
- [ ] Use a CDN for static assets
- [ ] Set appropriate `Cache-Control` headers
- [ ] Implement service worker for repeat visits
- [ ] Use `font-display: optional` for decorative fonts

#### Nice-to-Have (Low Impact / Advanced)

- [ ] Implement HTTP/2 or HTTP/3
- [ ] Use `modulepreload` for ES modules
- [ ] Implement resource prioritization (`fetchpriority`)
- [ ] Use link prefetching for predicted next pages
- [ ] Implement adaptive loading based on network speed
- [ ] Use connection-aware loading (`save-data` support)

---

## Quick Reference: Performance Meta Tags

```html
<head>
  <!-- DNS Prefetch -->
  <link rel="dns-prefetch" href="//fonts.googleapis.com">
  <link rel="dns-prefetch" href="//www.google-analytics.com">
  
  <!-- Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://www.googletagmanager.com">
  
  <!-- Preload Critical Resources -->
  <link rel="preload" href="/fonts/primary.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/images/hero-main.webp" as="image">
  
  <!-- Prevent FOIT (Flash of Invisible Text) -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=...&display=swap">
</head>
```
