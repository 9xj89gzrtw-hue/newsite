# Third-Party Integrations Catalog - Catering Websites

**Analysis Date:** 2025-01-15  
**Sites Analyzed:** 15 premium catering websites  
**Goal:** Complete inventory of third-party tools, services, and integrations used by top catering companies

---

## Table of Contents

1. [Analytics & Tracking](#1-analytics--tracking)
2. [Chat & Customer Support](#2-chat--customer-support)
3. [Booking & Reservation Systems](#3-booking--reservation-systems)
4. [Social Media Integration](#4-social-media-integration)
5. [Review Platforms](#5-review-platforms)
6. [Email Marketing](#6-email-marketing)
7. [Cookie Consent & Privacy](#7-cookie-consent--privacy)
8. [Payment Processing](#8-payment-processing)
9. [CMS & Platform Integrations](#9-cms--platform-integrations)
10. [Integration Recommendations for New Sites](#10-integration-recommendations-for-new-sites)

---

## 1. Analytics & Tracking

### 1.1 Analytics Stack Overview

| Tool | Sites Using | Purpose | Cost |
|------|-------------|---------|------|
| **Google Analytics 4 (GA4)** | 13/15 (87%) | Core analytics, user behavior | Free |
| **Google Tag Manager** | 12/15 (80%) | Tag management, centralized tracking | Free |
| **Facebook/Meta Pixel** | 5/15 (33%) | Ad attribution, retargeting | Free |
| **Microsoft Clarity** | 2/15 (13%) | Heatmaps, session recordings | Free |
| **LinkedIn Insight Tag** | 1/15 (7%) | B2B ad tracking | Free |
| **Snapchat Pixel** | 1/15 (7%) | Social ad attribution | Free |
| **Microsoft Bing Ads** | 1/15 (7%) | Search advertising | Paid |
| **HubSpot Analytics** | 1/15 (7%) | CRM + marketing analytics | Paid |
| **Wix Analytics** | 1/15 (7%) | Platform-native analytics | Included |
| **VisitorQueue** | 1/15 (7%) | Visitor identification | Paid |

### 1.2 Google Tag Manager Implementation Pattern

```html
<!-- GTM Head Snippet -->
<head>
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
  <!-- End Google Tag Manager -->
</head>

<!-- GTM Body Noscript Fallback -->
<body>
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
```

### 1.3 GA4 Configuration Pattern

```javascript
// GTM Data Layer initialization
window.dataLayer = window.dataLayer || [];

// Standard events to track for catering sites
dataLayer.push({
  event: 'page_view',
  page_title: document.title,
  page_location: window.location.href,
  catering_service: 'wedding', // Custom dimension
});

// Contact form submission
dataLayer.push({
  event: 'generate_lead',
  form_type: 'contact',
  service_interest: document.querySelector('[name="service"]')?.value
});

// Booking request
dataLayer.push({
  event: 'begin_checkout',
  event_category: 'booking',
  items: [{
    item_name: 'Catering Service',
    item_category: document.querySelector('[name="event_type"]')?.value
  }]
});
```

### 1.4 Facebook Pixel Implementation

```html
<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" style="display:none"
       src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"/>
</noscript>
```

### 1.5 Microsoft Clarity Setup

```html
<!-- Microsoft Clarity -->
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "YOUR_PROJECT_ID");
</script>
```

---

## 2. Chat & Customer Support

### 2.1 Chat Widget Usage

| Chat Platform | Sites Using | Features | Monthly Cost |
|---------------|-------------|----------|--------------|
| **Crisp Chat** | 5/15 (33%) | Live chat, chatbot, CRM, inbox | Free / $25/mo |
| *None* | 10/15 (67%) | N/A | $0 |

### 2.2 Crisp Chat Implementation

```html
<!-- Crisp Chat Widget -->
<script type="application/javascript">
  window.$crisp=[];
  window.CRISP_WEBSITE_ID="YOUR_WEBSITE_ID";
  (function(){
    d=document;s=d.createElement("script");
    s.src="https://client.crisp.chat/l.js";
    s.async=1;d.getElementsByTagName("head")[0].appendChild(s);
  })();
</script>

<!-- Custom configuration options -->
<script type="application/javascript">
  window.$crisp.push(["do", "chat:hide"]);
  // Show chat after delay or on intent
  setTimeout(() => {
    window.$crisp.push(["do", "chat:show"]);
  }, 30000); // 30 seconds
  
  // Set user data if logged in
  window.$crisp.push(["set", "user:email", ["user@example.com"]]);
  window.$crisp.push(["set", "user:nickname", ["John Doe"]]);
</script>
```

### 2.3 Alternative Chat Options Considered

| Platform | Best For | Starting Price |
|----------|----------|----------------|
| **Intercom** | B2B lead qualification | $39/mo |
| **Drift** | Conversational marketing | $2,500/yr |
| **Zendesk** | Full support suite | $55/agent/mo |
| **Tawk.to** | Budget option | Free |
| **Chatra** | Small business | $0 (forever free) |

---

## 3. Booking & Reservation Systems

### 3.1 Booking System Distribution

| System | Sites Using | Type | Notes |
|--------|-------------|------|-------|
| **Tock** | 8/15 (53%) | Embedded widget | Most popular choice |
| **OpenTable** | 5/15 (33%) | Embedded widget | Restaurant-focused |
| **Custom Forms** | 4/15 (27%) | CMS forms | Direct inquiry only |
| *None Visible* | 3/15 (20%) | Phone/email only | Traditional approach |

### 3.2 Tock Integration Pattern

```html
<!-- Tock Booking Widget -->
<div class="tock-wrapper" 
     data-tock-inline-mode="true" 
     data-tock-client-key="YOUR_CLIENT_KEY"
     data-tock-test-mode="false">
</div>
<script src="https://www.tckstatic.com/tock.js" async></script>

<!-- Or Tock Button Link -->
<a href="https://www.tock.com/YOUR_BUSINESS_URL" 
   class="btn btn--primary"
   target="_blank"
   rel="noopener noreferrer">
  Book Your Event
</a>
```

### 3.3 OpenTable Integration Pattern

```html
<!-- OpenTable Reservation Widget -->
<div id="ot-reservation-widget"></div>
<script>
  OTSettings = {
    rid: YOUR_RESTAURANT_ID,
    domain: 'www.opentable.com',
    type: 'id'
  };
</script>
<script src="https://otwidgets.opentable.com/widget.min.js" async defer></script>
```

### 3.4 Custom Inquiry Form Pattern (WordPress)

```php
<!-- HubSpot Form Embed (Wolfgang Puck pattern) -->
<!--[if lte IE 8]>
<script charset="utf-8" src="//js.hsforms.net/forms/v2-legacy.js"></script>
<![endif]-->
<script charset="utf-8" src="//js.hsforms.net/forms/v2.js"></script>
<script>
  hbspt.forms.create({
    region: "na1",
    portalId: "YOUR_PORTAL_ID",
    formId: "YOUR_FORM_ID",
    onFormSubmit: function($form) {
      // Track conversion
      dataLayer.push({event: 'form_submission'});
    }
  });
</script>
```

---

## 4. Social Media Integration

### 4.1 Social Media Presence by Site

| Platform | Sites with Links | Sites with Feeds | Notes |
|----------|------------------|------------------|-------|
| **Instagram** | 14/15 (93%) | 3/15 (20%) | Primary visual platform |
| **Facebook** | 12/15 (80%) | 2/15 (13%) | Community building |
| **LinkedIn** | 8/15 (53%) | 0 | B2B/corporate focus |
| **Twitter/X** | 10/15 (67%) | 0 | News/updates |
| **Pinterest** | 7/15 (47%) | 1/15 (7%) | Visual inspiration |
| **YouTube** | 5/15 (33%) | 1/15 (7%) | Video content |
| **TikTok** | 4/15 (27%) | 0 | Growing platform |
| **Yelp** | 2/15 (13%) | 1/15 (7%) | Reviews display |

### 4.2 Social Feed Embed Patterns

**Instagram Feed (Common):**

```html
<!-- Elfsight Instagram Widget (SaltBlock uses this) -->
<div class="elfsight-app-YOUR_WIDGET_ID"></div>
<script src="https://static.elfsight.com/platform/platform.js" data-use-service-core defer></script>
```

**Facebook Page Plugin:**

```html
<div class="fb-page" 
     data-href="https://www.facebook.com/YOUR_PAGE"
     data-tabs="timeline"
     data-width="380"
     data-height="500"
     data-small-header="false"
     data-adapt-container-width="true"
     data-hide-cover="false"
     data-show-facepile="true">
  <blockquote cite="https://www.facebook.com/YOUR_PAGE" class="fb-xfbml-parse-ignore">
    <a href="https://www.facebook.com/YOUR_PAGE">Follow us on Facebook</a>
  </blockquote>
</div>
```

### 4.3 Social Share Buttons Pattern

```html
<div class="social-share" aria-label="Share this page">
  <a href="#" class="share-btn share-btn--facebook" aria-label="Share on Facebook">
    <svg aria-hidden="true"><!-- FB icon --></svg>
  </a>
  <a href="#" class="share-btn share-btn--twitter" aria-label="Share on Twitter">
    <svg aria-hidden="true"><!-- Twitter icon --></svg>
  </a>
  <a href="#" class="share-btn share-btn--linkedin" aria-label="Share on LinkedIn">
    <svg aria-hidden="true"><!-- LinkedIn icon --></svg>
  </a>
  <a href="#" class="share-btn share-btn--pinterest" aria-label="Pin to Pinterest">
    <svg aria-hidden="true"><!-- Pinterest icon --></svg>
  </a>
</div>
```

---

## 5. Review Platforms

### 5.1 Review Integration Methods

| Method | Sites Using | Implementation |
|--------|-------------|----------------|
| **Yelp Badge** | 1/15 (7%) | Embedded widget |
| **Manual Testimonials** | 10/15 (67%) | Static content in HTML |
| **Google Reviews** | 3/15 (20%) | Manual curation |
| **WeddingWire** | 2/15 (13%) | Linked badges |
| **The Knot** | 2/15 (13%) | Linked badges |

### 5.2 Yelp Review Widget Pattern

```html
<!-- Yelp Business Badge -->
<a href="https://www.yelp.com/biz/YOUR_BIZ_ID" target="_blank" rel="noopener noreferrer">
  <img src="https://www.yelp.com/images/biz/yelp_bubble_small.png" alt="Read our reviews on Yelp">
</a>

<!-- Or use Yelp's embed code -->
<div class="yelp-review" data-business-id="YOUR_BIZ_ID" data-review-count="3"></div>
```

### 5.3 Testimonial Display Pattern

```html
<section class="testimonials" aria-label="Client testimonials">
  <div class="testimonial-carousel">
    <div class="testimonial-card">
      <blockquote>
        <p class="testimonial-text">"Amazing food and service! Our wedding was perfect."</p>
        <footer>
          <cite>— Sarah & Michael</cite>
          <span class="testimonial-event">Wedding, June 2024</span>
        </footer>
      </blockquote>
      <div class="testimonial-rating" aria-label="5 out of 5 stars">
        ★★★★★
      </div>
    </div>
    <!-- More testimonials... -->
  </div>
</section>
```

---

## 6. Email Marketing

### 6.1 Detected Email Marketing Tools

| Tool | Detection Method | Sites Using |
|------|------------------|-------------|
| **HubSpot** | hubspot.com scripts | 1 (Wolfgang Puck) |
| **Mailchimp** | mailchimp.com patterns | 0 detected |
| **Klaviyo** | klaviyo.com patterns | 0 detected |
| **Constant Contact** | constantcontact.com | 0 detected |

### 6.2 Newsletter Signup Pattern

```html
<form class="newsletter-form" action="/api/subscribe" method="POST">
  <label for="newsletter-email">Subscribe to our newsletter</label>
  <div class="newsletter-input-group">
    <input 
      type="email" 
      id="newsletter-email" 
      name="email" 
      placeholder="Enter your email"
      required
      autocomplete="email"
    >
    <button type="submit" class="btn btn--primary">Subscribe</button>
  </div>
  <p class="newsletter-disclaimer">
    Get seasonal menus, special offers, and event tips. Unsubscribe anytime.
  </p>
</form>
```

### 6.3 Recommended Email Stack for Caterers

| Need | Recommendation | Why |
|------|----------------|-----|
| **General Marketing** | Mailchimp or Flodesk | Easy templates, good automation |
| **E-commerce/Cross-sell** | Klaviyo | Advanced segmentation |
| **B2B Corporate** | HubSpot | Full CRM integration |
| **Simple/Free** | ConvertKit or Beehiiv | Creator-friendly pricing |

---

## 7. Cookie Consent & Privacy

### 7.1 Cookie Consent Solutions

| Solution | Sites Using | GDPR Ready | CCPA Ready | Cost |
|----------|-------------|------------|------------|------|
| **OneTrust** | 1 (Wolfgang Puck) | ✅ | ✅ | Enterprise ($$$) |
| **Cookiebot** | 1 (JDK Group) | ✅ | ✅ | €9+/mo |
| **Borlabs Cookie** | 1 (Gamma Catering) | ✅ | ✅ | €49 one-time |
| **WPConsent** | 1 (JDK Group) | ✅ | ✅ | Freemium |
| **None/Custom** | 11/15 (73%) | ❌ | ⚠️ | $0 |

### 7.2 OneTrust Implementation (Enterprise)

```html
<!-- OneTrust Cookies Consent Notice -->
<script src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js" 
        type="text/javascript" 
        charset="UTF-8" 
        data-domain-script="YOUR_SCRIPT_ID"
        data-document-language="true"></script>
<script type="text/javascript">
  function OptanonWrapper() { }
</script>
```

### 7.3 Borlabs Cookie Implementation (WordPress)

```php
<?php
// Borlabs is a WordPress plugin
// Settings configured in WP Admin > Borlabs Cookie
// Outputs consent banner automatically
?>
```

### 7.4 Lightweight Cookie Consent (Custom)

```html
<!-- Simple cookie banner (GDPR minimum) -->
<div id="cookie-banner" role="dialog" aria-label="Cookie consent" hidden>
  <div class="cookie-content">
    <p>We use cookies to enhance your experience. By continuing, you agree to our 
      <a href="/privacy-policy">Privacy Policy</a>.
    </p>
    <div class="cookie-actions">
      <button id="cookie-accept" class="btn btn--primary">Accept All</button>
      <button id="cookie-decline" class="btn btn--secondary">Necessary Only</button>
      <button id="cookie-settings" class="btn btn--link">Preferences</button>
    </div>
  </div>
</div>

<script>
// Simple cookie consent logic
if (!localStorage.getItem('cookie-consent')) {
  document.getElementById('cookie-banner').hidden = false;
}

document.getElementById('cookie-accept').addEventListener('click', () => {
  localStorage.setItem('cookie-consent', 'all');
  document.getElementById('cookie-banner').hidden = true;
  enableAllAnalytics();
});

document.getElementById('cookie-decline').addEventListener('click', () => {
  localStorage.setItem('cookie-consent', 'necessary');
  document.getElementById('cookie-banner').hidden = true;
  // Keep only essential cookies
});
</script>
```

---

## 8. Payment Processing

### 8.1 Payment Methods Detected

| Method | Context | Sites |
|--------|---------|-------|
| **Deposit via Form** | Booking deposits | 5/15 (33%) |
| **Invoice System** | Corporate clients | 3/15 (20%) |
| **Phone Payment** | Traditional | 8/15 (53%) |
| **Online Portal** | Tock integrated | 4/15 (27%) |

### 8.2 Typical Payment Flow for Caterers

```
1. Initial Inquiry → Contact Form
         ↓
2. Consultation → Phone/In-Person Meeting  
         ↓
3. Proposal → Email PDF Proposal
         ↓
4. Deposit → Invoice Link / Phone / Check
         ↓
5. Final Payment → Before Event (50% balance)
```

### 8.3 Recommended Payment Solutions

| Solution | Best For | Fee Structure |
|----------|----------|---------------|
| **Stripe** | Online deposits | 2.9% + 30¢ |
| **Square** | In-person + online | 2.6% + 10¢ |
| **PayPal Business** | Familiar to clients | 2.89% + 49¢ |
| **FreshBooks** | Invoicing focus | From $15/mo |
| **QuickBooks** | Accounting integration | From $30/mo |

---

## 9. CMS & Platform Integrations

### 9.1 Platform Distribution Summary

| Platform | Count | Percentage | Key Strengths |
|----------|-------|------------|---------------|
| **Squarespace** | 7 | 47% | Easiest, built-in booking, beautiful templates |
| **WordPress** | 4 | 27% | Most flexible, plugin ecosystem |
| **Webflow** | 2 | 13% | Design control, clean code output |
| **HubSpot** | 1 | 7% | CRM integration, marketing automation |
| **Wix** | 1 | 7% | Drag-drop ease, app marketplace |
| **Custom** | 1 | 7% | Full control, higher maintenance |

### 9.2 Squarespace-Specific Integrations

```
Built-in:
├── Tock Reservations (native)
├── Acuity Scheduling
├── Mailchimp Newsletter
├── Instagram Feed Block
├── Google Maps
├── OpenTable
└── Yelp Reviews

Via Code Injection:
├── Custom Analytics (GTM)
├── Facebook Pixel
├── Chat Widgets (Crisp)
├── Cookie Consent
└── Custom Fonts (Adobe Fonts)
```

### 9.3 WordPress-Specific Integrations

```
Popular Plugins Used:
├── Contact Form 7 / Gravity Forms / WPForms
├── Yoast SEO / RankMath
├── Smush / ShortPixel (Image Optimization)
├── WP Rocket / W3 Total Cache (Performance)
├── Wordfence / iThemes Security
├── MonsterInsights (GA4)
├── WooCommerce (if selling products)
├── Borlabs Cookie / Cookiebot
└── Crisp Chat / LiveChat
```

---

## 10. Integration Recommendations for New Sites

### 10.1 Essential Integrations (Must Have)

| Category | Recommendation | Priority | Setup Time |
|----------|----------------|----------|------------|
| **Analytics** | GA4 + GTM | 🔴 Critical | 1 hour |
| **Tracking** | Facebook Pixel | 🟠 High | 30 min |
| **Booking** | Tock Widget | 🟠 High | 1 hour |
| **Forms** | HubSpot or native | 🟠 High | 30 min |
| **Heatmaps** | Microsoft Clarity | 🟡 Medium | 15 min |

### 10.2 Recommended Integrations (Should Have)

| Category | Recommendation | Priority | Cost |
|----------|----------------|----------|------|
| **Live Chat** | Crisp (free tier) | 🟡 Medium | $0-25/mo |
| **Reviews** | Manual testimonials section | 🟡 Medium | $0 |
| **Social Feed** | Instagram embed | 🟡 Medium | $0 |
| **Newsletter** | Mailchimp or Flodesk | 🟡 Medium | $0-50/mo |
| **Cookie Consent** | Cookiebot or custom | 🟡 Medium | $0-9/mo |

### 10.3 Optional Enhancements (Nice to Have)

| Category | Recommendation | When to Add |
|----------|----------------|-------------|
| **CRM** | HubSpot | B2B corporate focus |
| **Marketing Automation** | Klaviyo | Email-heavy strategy |
| **Advanced Booking** | SevenRooms | High-volume events |
| **Payment** | Stripe | Online deposits needed |
| **SMS** | Twilio | Reminder notifications |

### 10.4 Integration Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR CATERING WEBSITE                    │
│                      (CMS Platform)                          │
└─────────┬──────────┬──────────┬──────────┬─────────────────┘
          │          │          │          │
    ┌─────▼─────┐ ┌──▼───┐ ┌───▼───┐ ┌───▼────┐
    │  GTM/GA4  │ │ Tock │ │Crisp  │ │Mailchimp│
    │           │ │      │ │ Chat  │ │         │
    ├───────────┤ └──────┘ └───────┘ └────────┘
    │FB Pixel   │
    │Clarity    │
    │HS Forms   │
    └───────────┘
    
Data Flow:
GTM → GA4 (analytics)
GTM → FB Pixel (ads)
GTM → Clarity (heatmaps)
Tock → Email notifications
Crisp → Inbox/CRM
Mailchimp → Email campaigns
```

---

## Quick Reference: Integration Scripts

```html
<!-- HEAD SECTION - Add all before </head> -->

<!-- 1. Preconnects (performance) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://www.googletagmanager.com">

<!-- 2. Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>

<!-- 3. Crisp Chat (optional) -->
<script type="application/javascript">
  window.$crisp=[];window.CRISP_WEBSITE_ID="YOUR_ID";
  (function(){d=document;s=d.createElement("script");
  s.src="https://client.crisp.chat/l.js";s.async=1;
  d.getElementsByTagName("head")[0].appendChild(s);})();
</script>


<!-- BODY SECTION - Add right after <body> -->

<!-- GTM Noscript -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

<!-- BEFORE </body> -->

<!-- Tock Script (if using widget) -->
<script src="https://www.tckstatic.com/tock.js" async></script>

<!-- Clarity (optional) -->
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "YOUR_ID");
</script>
```
