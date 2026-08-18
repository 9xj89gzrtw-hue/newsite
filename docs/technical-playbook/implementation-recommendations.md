# Implementation-Ready Recommendations for Catering Websites

**Based on analysis of 15 premium catering websites**  
**Created:** 2025-01-15

---

## Table of Contents

1. [Recommended Tech Stack](#1-recommended-tech-stack)
2. [Performance Budget](#2-performance-budget)
3. [Security Checklist](#3-security-checklist)
4. [Analytics Setup Guide](#4-analytics-setup-guide)
5. [Quick Start Template](#5-quick-start-template)

---

## 1. Recommended Tech Stack

### 1.1 Primary Recommendation: Squarespace (Most Common Choice)

**Why:** 47% of analyzed successful caterers use Squarespace

| Aspect | Recommendation | Notes |
|--------|----------------|-------|
| **Template** | Brine Family or Fluid Engine | Most flexible for catering |
| **Plan** | Business ($33/mo) or Commerce ($46/mo) | Advanced code injection + commerce |
| **Domain** | Purchase through Squarespace or transfer | Free SSL included |
| **Booking** | Tock Integration (native) | $0 setup with Tock account |

**Pros:**
- ✅ Fastest time to launch (1-2 weeks)
- ✅ Built-in responsive design
- ✅ Automatic SSL and CDN
- ✅ Native Tock/Acuity booking
- ✅ No maintenance overhead
- ✅ Beautiful templates designed for food industry

**Cons:**
- ❌ Limited customization beyond templates
- ❌ Code injection has limits
- ❌ Vendor lock-in

---

### 1.2 Alternative: WordPress (Maximum Flexibility)

**Why:** 27% use WordPress; best for complex needs

| Component | Recommendation | Cost |
|-----------|----------------|------|
| **Hosting** | WP Engine, Kinsta, or SiteGround | $25-$100/mo |
| **Theme** | Astra Pro or GeneratePress | $59/yr |
| **Page Builder** | Elementor Pro or Beaver Builder | $59-$199/yr |
| **Forms** | Gravity Forms or WPForms | $59-$299/yr |
| **SEO** | RankMath (free) or Yoast SEO Premium | $0-$99/yr |
| **Security** | Wordfence + MalCare | $0-$199/yr |
| **Backup** | BlogVault or UpdraftPlus | $0-$71/yr |

**Recommended Plugin Stack:**
```
Essential:
├── RankMath SEO (SEO optimization)
├── WP Rocket (caching/performance)
├── Smush or ShortPixel (image optimization)
├── Gravity Forms (contact/inquiry forms)
├── Wordfence Security
└── Borlabs Cookie / Cookiebot (GDPR)

Optional:
├── Elementor Pro (page builder - if needed)
├── WPML or TranslatePress (multi-language)
├── The Events Calendar (event management)
└── WooCommerce (if selling products)
```

---

### 1.3 Alternative: Webflow (Design Control)

**Why:** Cleanest code output; best for design-focused brands

| Aspect | Recommendation |
|--------|----------------|
| **Plan** | CMS Plan ($23/mo) or Business ($42/mo) |
| **Hosting** | Webflow Hosting (included) |
| **CMS Collections** | Services, Team, Testimonials, Gallery |
| **Integrations** | GTM via custom code, external forms |

---

### 1.4 JavaScript Libraries to Include

Based on what top caterers actually use:

```javascript
// package.json dependencies (if using build tool)
{
  "dependencies": {
    // Core functionality
    "swiper": "^11.0.0",           // Touch-friendly carousels/galleries
    
    // Optional enhancements
    "lottie-web": "^5.12.0",       // Animated icons/illustrations
    "@lottiefiles/lottie-player": "^2.0.0"
  },
  
  // Load via CDN instead (simpler approach):
  // Swiper: https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js
  // Lottie: https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js
}
```

**What NOT to include (unless necessary):**
- jQuery (use vanilla JS instead)
- Bootstrap (write custom CSS)
- Heavy animation libraries (GSAP only if premium animations needed)

---

## 2. Performance Budget

### 2.1 Recommended Budget Targets

Based on Core Web Vitals and industry best practices:

| Metric | Target | Maximum | Measurement Tool |
|--------|--------|---------|------------------|
| **LCP (Largest Contentful Paint)** | < 2.0s | < 2.5s | Lighthouse, CrUX |
| **FID (First Input Delay)** | < 50ms | < 100ms | Lighthouse, CrUX |
| **CLS (Cumulative Layout Shift)** | < 0.05 | < 0.1 | Lighthouse, CrUX |
| **FCP (First Contentful Paint)** | < 1.0s | < 1.8s | Lighthouse |
| **TTFB (Time to First Byte)** | < 400ms | < 800ms | WebPageTest |
| **Speed Index** | < 3.0s | < 5.8s | Lighthouse |
| **Total Page Weight** | < 1.5MB | < 2.5MB | DevTools Network tab |
| **JavaScript Bundle** | < 200KB gz | < 350KB gz | Bundle analyzer |
| **CSS Bundle** | < 40KB gz | < 75KB gz | DevTools |
| **Images (above fold)** | < 300KB | < 500KB | DevTools |
| **Requests Count** | < 35 | < 60 | DevTools |
| **Third-Party JS** | < 150KB | < 250KB | DevTools |

### 2.2 Budget Allocation by Resource Type

```
Total Page Weight Budget: 1.5 MB
├── HTML Document:        ~15 KB (1%)
├── CSS (critical):       ~30 KB (2%)
├── JavaScript:          ~150 KB (10%)
│   ├── Main app:         ~80 KB
│   └── Third-party:      ~70 KB (GTM, analytics)
├── Fonts:               ~100 KB (7%)
│   ├── Primary font:      ~40 KB (woff2)
│   └── Secondary font:    ~60 KB (woff2)
├── Images (initial):     ~800 KB (53%)
│   ├── Hero image:       ~250 KB (WebP)
│   ├── Logo/icon:         ~20 KB (SVG/PNG)
│   └── Above-fold images:~530 KB
└── Other assets:        ~405 KB (27%)
    ├── Preloaded fonts:  ~100 KB
    └── Third-party:      ~305 KB
```

### 2.3 Performance Monitoring Setup

```javascript
// Add to your site for real-user monitoring (RUM)
// Using web-vitals library

<script type="module">
import {onCLS, onFID, onLCP, onFCP, onTTFB} from 'https://unpkg.com/web-vitals@4?module';

function sendToAnalytics(metric) {
  // Send to GA4
  gtag('event', metric.name, {
    value: metric.value,
    metric_id: metric.id,
    navigation_type: metric.navigationType,
  });
  
  // Or send to your analytics endpoint
  fetch('/api/vitals', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);
</script>
```

### 2.4 Image Optimization Rules

```yaml
# Image Optimization Configuration

formats:
  primary: "WebP"           # Use WebP as primary format
  fallback: "JPEG"          # JPEG fallback for older browsers
  icons: "SVG"              # SVG for logos and icons
  
hero_images:
  max_width: 1920
  max_height: 1080
  quality: 82
  format: "webp"
  lazy: false               # Always preload hero images
  
gallery_thumbnails:
  width: 400
  height: 300
  quality: 75
  format: "webp"
  lazy: true
  
gallery_full:
  max_width: 1200
  quality: 80
  format: "webp"
  lazy: true
  
food_photos:
  max_width: 800
  quality: 85              # Higher quality for food
  format: "webp"
  lazy: true
```

---

## 3. Security Checklist

### 3.1 Essential Security Measures

#### HTTPS & TLS
- [ ] **HTTPS Everywhere**
  - [ ] Valid SSL/TLS certificate (Let's Encrypt is free)
  - [ ] HTTP → HTTPS redirect (301 permanent)
  - [ ] HSTS header enabled
  - [ ] No mixed content warnings

#### Headers Configuration
```nginx
# Recommended security headers (add to server config)

# Prevent clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# MIME type sniffing protection
add_header X-Content-Type-Options "nosniff" always;

# XSS Protection (legacy but still useful)
add_header X-XSS-Protection "1; mode=block" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions Policy (replace Feature-Policy)
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

# Content Security Policy (start basic, tighten over time)
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://www.clarity.ms https://client.crisp.chat;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://www.google-analytics.com;
  frame-src https://www.tock.com https://www.opentable.com;
" always;

# HSTS (enable after testing)
# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### 3.2 Form Security

```php
// WordPress form security example (apply to all forms)

// 1. CSRF Protection (nonce verification)
if (!wp_verify_nonce($_POST['contact_form_nonce'], 'contact_form_action')) {
    wp_die('Security check failed');
}

// 2. Input Sanitization
$name = sanitize_text_field($_POST['name']);
$email = sanitize_email($_POST['email']);
$phone = sanitize_text_field($_POST['phone']);
$message = sanitize_textarea_field($_POST['message']);

// 3. Honeypot Field (hidden from users, bots fill it)
if (!empty($_POST['website'])) {
    // This is likely a bot, silently discard
    exit;
}

// 4. Rate Limiting (track submissions per IP)
$ip_address = $_SERVER['REMOTE_ADDR'];
// Implement rate limiting logic (e.g., max 3 submissions/hour/IP)

// 5. reCAPTCHA v3 (invisible)
$recaptcha_secret = 'YOUR_SECRET_KEY';
$response = $_POST['g-recaptcha-response'];
$verify = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret={$recaptcha_secret}&response={$response}");
$captcha_success = json_decode($verify);

if (!$captcha_success->success) {
    wp_die('reCAPTCHA verification failed');
}
```

### 3.3 Cookie & Privacy Compliance

#### GDPR Requirements (EU)
- [ ] Cookie consent banner before any non-essential cookies
- [ ] Granular cookie categories (necessary, analytics, marketing)
- [ ] Opt-out option for all cookie types
- [ ] Clear privacy policy link in footer
- [ ] Data processing agreement with third parties
- [ ] Right to access/delete data mechanism

#### CCPA Requirements (California)
- [ ] "Do Not Sell My Info" link in footer
- [ ] Disclosure of data collection practices
- [ ] Opt-out mechanism for data sales

#### Sample Cookie Consent Config

```javascript
// Borlabs Cookie / Cookiebot configuration example
const cookieConfig = {
  groups: [
    {
      id: 'essential',
      name: 'Essential Cookies',
      description: 'Required for site to function',
      required: true,
      cookies: ['session', 'csrf_token', 'cookie_consent']
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors interact',
      required: false,
      cookies: ['_ga', '_ga_*', '_gid', '_clck', 'CLID']
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'Used to deliver relevant advertisements',
      required: false,
      cookies: ['_fbp', 'fr', '_fbc']
    }
  ],
  
  defaultState: {
    essential: true,
    analytics: false,
    marketing: false
  }
};
```

### 3.4 WordPress-Specific Security

```bash
# Essential WordPress security measures

# 1. Change default admin URL from /wp-admin
# Use plugin: WPS Hide Login or iThemes Security

# 2. Disable XML-RPC (common attack vector)
# Add to wp-config.php or use security plugin
define('XMLRPC_REQUEST', false);

# 3. Disable file editor in dashboard
define('DISALLOW_FILE_EDIT', true);

# 4. Force strong passwords
# Use plugin: Force Strong Passwords

# 5. Limit login attempts
# Plugin: Login LockDown or Limit Login Attempts Reloaded

# 6. Two-factor authentication
# Plugin: WP 2FA or Google Authenticator

# 7. Regular backups (off-site)
# Service: BlogVault, ManageWP, or UpdraftPlus to cloud storage

# 8. Security scanning
# Plugin: Wordfence (free tier available)
# Schedule weekly scans

# 9. Keep everything updated
# Auto-updates for core: enabled by default (recommended)
# Update plugins/themes within 7 days of new release
```

### 3.5 Security Audit Checklist

**Monthly:**
- [ ] Review error logs for suspicious activity
- [ ] Check for plugin/theme updates
- [ ] Review user accounts (remove unused)
- [ ] Scan for malware (Wordfence/Sucuri)
- [ ] Review authorized API keys/tokens

**Quarterly:**
- [ ] Full backup test (restore to staging)
- [ ] Review third-party integrations
- [ ] Audit form submission logs
- [ ] Review cookie consent compliance
- [ ] Penetration test (basic)

**Annually:**
- [ ] Full security audit by professional
- [ ] Review and update security policies
- [ ] Disaster recovery drill
- [ ] Review data retention policies

---

## 4. Analytics Setup Guide

### 4.1 Google Analytics 4 (GA4) Setup

#### Step 1: Create GA4 Property

1. Go to [analytics.google.com](https://analytics.google.com)
2. Click "Admin" → "Create Property"
3. Select "GA4"
4. Enter property name (e.g., "Production - Catering Site")
5. Set reporting time zone
6. Set currency (USD)
7. Create property → copy Measurement ID (`G-XXXXXXXXXX`)

#### Step 2: Configure GTM Container

```html
<!-- Add to <head> of every page -->
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->

<!-- Add after opening <body> tag -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
```

#### Step 3: GA4 Configuration Tags in GTM

**Tag 1: GA4 Configuration**

| Setting | Value |
|---------|-------|
| Tag Type | Google Analytics: GA4 Configuration |
| Measurement ID | G-XXXXXXXXXX |
| Send Page View | Yes (default) |

**Trigger:** All Pages

---

**Tag 2: Contact Form Submission**

| Setting | Value |
|---------|-------|
| Tag Type | Google Analytics: GA4 Event |
| Event Name | generate_lead |
| Event Parameters: form_type | {{Form Type}} |
| Event Parameters: page_location | {{Page URL}} |

**Trigger:** Custom Event = form_submit

---

**Tag 3: Booking Button Click**

| Setting | Value |
|---------|-------|
| Tag Type | Google Analytics: GA4 Event |
| Event Name | begin_booking_flow |
| Event Parameters: booking_type | {{Booking Type}} |

**Trigger:** Click - CSS Selector = `.btn-book-now` or `[data-action="book"]`

---

### 4.2 Conversion Tracking Setup

#### Key Conversions to Track

```javascript
// Data layer pushes for key conversions

// 1. Contact Form Submission
dataLayer.push({
  event: 'form_submit',
  form_type: 'contact',  // contact, quote_request, catering_inquiry
  service_interest: 'wedding',  // wedding, corporate, social
  event_date: '2025-06-15'
});

// 2. Quote Request
dataLayer.push({
  event: 'generate_lead',
  lead_type: 'quote_request',
  estimated_guests: '150',
  event_type: 'wedding'
});

// 3. Booking Initiated (Tock click)
dataLayer.push({
  event: 'begin_booking',
  booking_method: 'tock',
  service_category: 'corporate'
});

// 4. Phone Call Click (if using call tracking)
dataLayer.push({
  event: 'click_phone',
  phone_number: '+15551234567'
});

// 5. Email Click
dataLayer.push({
  event: 'click_email',
  email_destination: 'info@catering.com'
});

// 6. Social Media Link Click
dataLayer.push({
  event: 'social_click',
  social_network: 'instagram',  // instagram, facebook, linkedin, etc.
  social_action: 'link_click'
});

// 7. Menu Download (if applicable)
dataLayer.push({
  event: 'file_download',
  file_name: 'wedding-menu-2025.pdf',
  file_type: 'pdf'
});

// 8. Video Play (if hero video)
dataLayer.push({
  event: 'video_start',
  video_title: 'Company Introduction',
  video_percent: 0
});
```

### 4.3 Enhanced Ecommerce (If Selling Products)

```javascript
// Track menu item views
dataLayer.push({ ecommerce: null });  // Clear previous
dataLayer.push({
  event: 'view_item_list',
  ecommerce: {
    item_list_name: 'Wedding Packages',
    items: [{
      item_name: 'Platinum Wedding Package',
      item_id: 'PKG-001',
      price: 125.00,
      item_category: 'Wedding',
      item_category2: 'Premium',
      item_category3: 'Full Service',
      index: 0,
      quantity: 1
    }]
  }
});

// Track "Add to Quote" (analogous to add_to_cart)
dataLayer.push({ ecommerce: null });
dataLayer.push({
  event: 'add_to_cart',
  ecommerce: {
    currency: 'USD',
    value: 125.00,
    items: [{
      item_name: 'Platinum Wedding Package',
      item_id: 'PKG-001',
      price: 125.00,
      item_category: 'Wedding',
      quantity: 1
    }]
  }
});
```

### 4.4 Facebook Pixel Setup

```html
<!-- Facebook Pixel Code - Add after GTM snippet -->

<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<noscript>
<img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"/>
</noscript>
```

**Facebook Standard Events to Fire:**

```javascript
// In GTM, create these tags triggered by same events as GA4

// PageView (automatic)
fbq('track', 'PageView');

// Lead (form submission)
fbq('track', 'Lead', {
  content_name: 'Contact Form',
  value: 0.00,
  currency: 'USD'
});

// CompleteRegistration (newsletter signup)
fbq('track', 'CompleteRegistration');

// ViewContent (viewing a specific service page)
fbq('track', 'ViewContent', {
  content_name: 'Wedding Catering',
  content_category: 'Service',
  content_ids: ['service-wedding']
});

// InitiateCheckout (starting booking flow)
fbq('track', 'InitiateCheckout');
```

### 4.5 Microsoft Clarity Setup

```html
<!-- Microsoft Clarity - Add before </head> -->
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "YOUR_PROJECT_ID");
</script>
```

**Clarity Features Enabled:**
- Session recordings (review user behavior)
- Heatmaps (click patterns)
- Dead clicks detection
- Rage clicks identification
- JavaScript errors tracking

### 4.6 Custom Dashboard Recommendations

**GA4 Dashboard - Key Widgets:**

| Widget | Metric | Purpose |
|--------|--------|---------|
| Users | Total users / 28 days | Overall traffic trend |
| Engagement | Avg engagement time | Content quality |
| Conversions | Total conversions | Goal completion rate |
| Top Pages | Page path + screen class | Popular content |
| Traffic Source | Session source / medium | Where visitors come from |
| Device Category | Users by device | Mobile vs desktop |
| Location | Users by city/region | Geographic reach |
| Bounce Rate | Engagement rate替代 | Content relevance |
| Form Submissions | generate_lead events | Lead generation |
| Booking Starts | begin_booking events | Conversion funnel |

### 4.7 Reporting Cadence

**Weekly (Monday Morning):**
- Traffic overview (users, sessions, pageviews)
- Form submissions count
- Top 5 pages
- Any anomalies or spikes

**Monthly (1st of month):**
- Month-over-month comparison
- Conversion rate trends
- Traffic source performance
- Content gap analysis
- Goal progress report

**Quarterly:**
- Full funnel analysis
- ROI calculation (if tracking ad spend)
- Year-over-year comparison
- Strategy adjustment recommendations

---

## 5. Quick Start Template

### 5.1 HTML Head Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Meta Essentials -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  
  <!-- SEO Meta -->
  <title>Page Title | Brand Name - Premium Catering</title>
  <meta name="description" content="155-160 character description with primary keyword">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://yourcatering.com/current-page/">
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://yourcatering.com/current-page/">
  <meta property="og:title" content="Page Title | Brand Name">
  <meta property="og:description" content="Description for social sharing">
  <meta property="og:image" content="https://yourcatering.com/images/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Page Title | Brand Name">
  <meta name="twitter:description" content="Description for Twitter">
  <meta name="twitter:image" content="https://yourcatering.com/images/twitter-image.jpg">
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  
  <!-- Resource Hints (PERFORMANCE) -->
  <link rel="dns-prefetch" href="//fonts.googleapis.com">
  <link rel="dns-prefetch" href="//www.googletagmanager.com">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://www.googletagmanager.com">
  
  <!-- Preload Critical Resources -->
  <link rel="preload" href="/fonts/primary-font.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/images/hero-bg.webp" as="image">
  
  <!-- Stylesheets -->
  <link rel="stylesheet" href="/css/critical.css"> <!-- Inline this ideally -->
  <link rel="stylesheet" href="/css/main.css" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="/css/main.css"></noscript>
  
  <!-- Google Fonts (with display:swap) -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "FoodEstablishment"],
    "name": "Your Catering Company",
    "description": "Premium catering services",
    "url": "https://yourcatering.com",
    "telephone": "+1-555-123-4567",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Culinary Street",
      "addressLocality": "City",
      "addressRegion": "ST",
      "postalCode": "12345"
    },
    "sameAs": [
      "https://www.instagram.com/yourcatering",
      "https://www.facebook.com/yourcatering"
    ]
  }
  </script>
  
  <!-- Google Tag Manager (HEAD) -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
  
  <!-- Crisp Chat (optional) -->
  <script type="application/javascript">
    window.$crisp=[];window.CRISP_WEBSITE_ID="YOUR_ID";
    (function(){d=document;s=d.createElement("script");
    s.src="https://client.crisp.chat/l.js";s.async=1;
    d.getElementsByTagName("head")[0].appendChild(s);})();
  </script>
</head>

<body>
  <!-- Google Tag Manager (BODY - noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  
  <!-- Skip Link (ACCESSIBILITY) -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  <!-- Header -->
  <header role="banner">
    <nav aria-label="Main Navigation">
      <!-- Navigation content -->
    </nav>
  </header>
  
  <!-- Main Content -->
  <main id="main-content" role="main">
    <!-- Page content -->
  </main>
  
  <!-- Footer -->
  <footer role="contentinfo">
    <!-- Footer content -->
  </footer>
  
  <!-- Scripts (deferred for performance) -->
  <script src="/js/main.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js" defer></script>
  
  <!-- Tock Booking Script (if using widget) -->
  <script src="https://www.tckstatic.com/tock.js" async></script>
</body>
</html>
```

### 5.2 Critical CSS Template (Inline)

```css
/* critical.css - Inline this in <head> */
/* Only above-the-fold styles */

/* Reset & Base */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font-family:'Poppins',system-ui,-apple-system,sans-serif;font-size:16px;line-height:1.5;color:#333;-webkit-font-smoothing:antialiased}

/* Skip Link */
.skip-link{position:absolute;top:-40px;left:0;background:#000;color:#fff;padding:8px 16px;z-index:100;transition:top .15s}
.skip-link:focus{top:0}

/* Header */
.header{position:fixed;top:0;left:0;right:0;z-index:1000;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.1)}
.header__inner{max-width:1200px;margin:0 auto;padding:0 20px;display:flex;align-items:center;justify-content:space-between;height:70px}
.logo{font-size:24px;font-weight:700;text-decoration:none;color:#000}
.nav__list{display:flex;gap:32px;list-style:none}
.nav__link{text-decoration:none;color:#333;font-weight:500;transition:color .2s}
.nav__link:hover{color:#c9a961}

/* Hero */
.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#1a1a1a;color:#fff;text-align:center;padding:20px;position:relative}
.hero::before{content:'';position:absolute;inset:0;background:rgba(0,0,0,.4);z-index:1}
.hero__content{position:relative;z-index:2;max-width:800px}
.hero__title{font-size:clamp(2rem,5vw,4rem);font-weight:700;line-height:1.2;margin-bottom:20px}
.hero__subtitle{font-size:clamp(1rem,2vw,1.25rem);opacity:.9;margin-bottom:32px}

/* Buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;padding:14px 32px;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;border:2px solid transparent;cursor:pointer;transition:all .25s}
.btn--primary{background:#1a1a1a;color:#fff}
.btn--primary:hover{background:#c9a961;border-color:#c9a961}
.btn--secondary{background:transparent;border-color:#fff;color:#fff}
.btn--secondary:hover{background:#fff;color:#1a1a1a}

/* Responsive */
@media(max-width:767px){
  .nav__list{display:none;position:fixed;top:70px;left:0;right:0;background:#fff;flex-direction:column;padding:20px;gap:16px;box-shadow:0 10px 30px rgba(0,0,0,.1)}
  .nav__list.is-open{display:flex}
  .hamburger{display:flex}
}
@media(min-width:768px){.hamburger{display:none}}

/* Hamburger */
.hamburger{flex-direction:column;justify-content:space-between;width:28px;height:20px;background:none;border:none;cursor:pointer;padding:0}
.hamburger span{display:block;width:100%;height:2px;background:currentColor;border-radius:2px;transition:transform .25s}

/* Focus styles */
:focus-visible{outline:3px solid #c9a961;outline-offset:2px}

/* Reduced motion */
@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
```

---

## Summary: Implementation Priority Matrix

| Task | Priority | Effort | Impact | Timeline |
|------|----------|--------|--------|----------|
| **Platform Setup** | 🔴 Critical | Medium | High | Week 1 |
| **GTM + GA4 Setup** | 🔴 Critical | Low | High | Day 1-2 |
| **SSL Certificate** | 🔴 Critical | Low | Critical | Day 1 |
| **Basic SEO (meta tags)** | 🔴 Critical | Low | High | Day 1-2 |
| **Responsive Design** | 🔴 Critical | High | Critical | Week 1-2 |
| **Contact Form** | 🟠 High | Medium | High | Week 1 |
| **Facebook Pixel** | 🟠 High | Low | Medium | Day 2-3 |
| **Microsoft Clarity** | 🟠 High | Low | Medium | Day 2 |
| **Image Optimization** | 🟠 High | Medium | High | Week 1-2 |
| **Accessibility Basics** | 🟠 High | Medium | High | Week 2 |
| **Cookie Consent** | 🟡 Medium | Medium | Medium | Week 2-3 |
| **Booking Integration** | 🟡 Medium | Medium | High | Week 2-3 |
| **Crisp Chat** | 🟡 Medium | Low | Low | Week 3 |
| **Structured Data** | 🟡 Medium | Low | Medium | Week 2 |
| **Performance Tuning** | 🟡 Medium | Medium | High | Week 3-4 |
| **Security Hardening** | 🟢 Low | Medium | Critical | Ongoing |
| **Advanced Analytics** | 🟢 Low | High | Medium | Month 2+ |

---

*Document Version: 1.0*  
*Last Updated: 2025-01-15*  
*Based on Analysis of: Wolfgang Puck, Queen of Hearts, GG Catering, Tall Guy, Elegant Affairs, Concorde Catering, Cut and Taste, Creative Edge, Sopranos, Concept Catering, Gamma Catering, Ridgewells, SaltBlock, JDK Group, MyRadish*
