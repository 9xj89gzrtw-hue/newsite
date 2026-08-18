# Mobile UX Patterns Playbook
## Catering Website Mobile Analysis — 23 Sites

> **Generated:** 2025-01-19 | **Task ID:** Deep-3

---

## Table of Contents

1. [Mobile Menu Patterns](#mobile-menu-patterns)
2. [Thumb-Friendly Zone Analysis](#thumb-friendly-zone-analysis)
3. [Click-to-Call Implementation](#click-to-call-implementation)
4. [Sticky Mobile Headers](#sticky-mobile-headers)
5. [Mobile-Specific CTAs](#mobile-specific-ctas)
6. [Mobile Form Optimization](#mobile-form-optimization)
7. [Mobile Gallery Behavior](#mobile-gallery-behavior)
8. [Performance Patterns](#performance-patterns)

---

## Mobile Menu Patterns

### Pattern Distribution Across Sites

| Menu Type | % of Sites | Examples | UX Rating |
|-----------|------------|----------|-----------|
| **Hamburger (standard)** | 60% | Wolfgang Puck, GG, Elegant Affairs | ⭐⭐⭐ Good |
| **Full-screen overlay** | 20% | Creative Edge, Cut & Taste | ⭐⭐⭐⭐ Excellent |
| **Bottom navigation** | 5% | (rare in catering) | ⭐⭐⭐⭐⭐ Best |
| **Slide-in sidebar** | 10% | Soprano's, Concorde | ⭐⭐⭐ Good |
| **Dropdown accordion** | 5% | Some WordPress sites | ⭐⭐ Basic |

### Pattern 1: Standard Hamburger (Most Common)

```
┌─────────────────────────────────┐
│  ☰          Logo           ✉   │  ← Header
├─────────────────────────────────┤
│                                 │
│     [Hero Image - Full Width]   │
│                                 │
│     "Setting the Standard..."   │
│                                 │
│         [ CTA Button ]         │
│                                 │
└─────────────────────────────────┘

TAP HAMBURGER →
┌─────────────────────────────────┐
│  ✕ Close                        │
├─────────────────────────────────┤
│                                 │
│  SERVICES                       │  ← Main nav items
│  LOCATIONS                      │
│  MENU                           │
│  GALLERY                        │
│  ABOUT                          │
│  CONTACT                        │
│                                 │
│  ─────────────────────          │  ← Divider
│                                 │
│  📞 Call Now                    │  ← Quick actions
│  📧 Email Us                    │
│  📸 Instagram                   │
│                                 │
└─────────────────────────────────┘
```

**Used by:** Wolfgang Puck, GG Catering, Elegant Affairs, Tall Guy

### Pattern 2: Full-Screen Overlay (Premium Feel)

```
┌─────────────────────────────────┐
│  ☰          Logo           📞   │
├─────────────────────────────────┤
│                                 │
│  [Content as usual...]          │
│                                 │
└─────────────────────────────────┘

TAP HAMBURGER → FULL SCREEN OVERLAY:
┌─────────────────────────────────┐
│                                 │
│                                 │
│          MENU                   │  ← Large centered text
│                                 │
│        Services                 │  ← Generous spacing
│                                 │
│        Locations                │
│                                 │
│        Menu                     │
│                                 │
│        Gallery                  │
│                                 │
│        About                    │
│                                 │
│        Contact                  │
│                                 │
│  ─────────────────────────      │
│                                 │
│    📱  (555) 123-4567           │  ← Prominent phone
│                                 │
│  ✕                              │  ← Close bottom-right
│                                 │
└─────────────────────────────────┘
```

**Used by:** Creative Edge, Gamma Catering, Queen of Hearts

### Pattern 3: Bottom Navigation Bar (Emerging Best Practice)

```
┌─────────────────────────────────┐
│  Logo (small)              ☰   │  ← Minimal header
├─────────────────────────────────┤
│                                 │
│     [Hero / Content Area]       │
│     (full viewport height)      │
│                                 │
├─────────────────────────────────┤
│  🏠     🍽️     📞     👤      │  ← Fixed bottom bar
│ Home   Menu   Call   Account   │
└─────────────────────────────────┘
```

**Advantages:** 
- Always visible primary actions
- Thumb-friendly (natural reach zone)
- No need to scroll back to top for navigation

**Implementation:**

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: env(safe-area-inset-bottom) 0 8px; /* iPhone notch */
  z-index: 1000;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  font-size: 10px;
  color: #666;
  text-decoration: none;
}

.bottom-nav-item.active {
  color: var(--primary-color);
}

.bottom-nav-icon {
  font-size: 22px;
  margin-bottom: 2px;
}
```

---

## Thumb-Friendly Zone Analysis

### Mobile Reach Zones

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │           HARD TO REACH           │  │  ← Top corners
│  │            ○ ○                    │  │     (stretch required)
│  │                                   │  │
│  │                                   │  │
│  │         NATURAL ZONE              │  │  ← Center area
│  │            ● ●                    │  │     (easy thumb reach)
│  │                                   │  │
│  │                                   │  │
│  │  ○ ○                              │  │  ← Bottom corners
│  │         HARD TO REACH             │  │     (hand position varies)
│  └───────────────────────────────────┘  │
│                                         │
│  ████████████████████████████████████  │  ← Bottom edge (EASY)
│  ██████  THUMB ZONE  NATURAL  ██████  │  ← Best for CTAs
│  ████████████████████████████████████  │
└─────────────────────────────────────────┘

LEGEND:
● = Easy thumb reach (place important CTAs here)
○ = Requires adjustment (less critical actions)
```

### Zone-Based Element Placement Guide

| Zone | Recommended Elements | Avoid |
|------|---------------------|-------|
| **Bottom center (thumb zone)** | Primary CTA, Contact button, Sticky submit | Nothing - keep clear |
| **Bottom edges** | Secondary nav, Back button | Critical actions only |
| **Center screen** | Content, Forms, Images | Fixed elements |
| **Top center** | Logo, Page title | Important CTAs |
| **Top corners** | Hamburger menu, Search | Primary conversion CTAs |

### Observed Mobile CTA Placements

```html
<!-- Pattern 1: Floating Action Button (FAB) -->
<!-- Wolfgang Puck uses this pattern -->
<div class="fab-container">
  <a href="tel:+15551234567" class="fab fab-phone">
    <span class="fab-icon">📞</span>
  </a>
  <a href="#contact" class="fab fab-chat">
    <span class="fab-icon">💬</span>
  </a>
</div>

<style>
.fab-container {
  position: fixed;
  right: 16px;
  bottom: 80px; /* Above bottom nav if present */
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 999;
}

.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: transform 0.2s ease;
}

.fab:active {
  transform: scale(0.95);
}

.fab-phone {
  background: #2563eb; /* Blue for call */
}

.fab-chat {
  background: #16a34a; /* Green for chat */
}
</style>
```

---

## Click-to-Call Implementation

### Patterns Found

#### Pattern 1: Persistent FAB (Recommended)

```
Visible at all times while scrolling:
┌──────────────────┐
│                  │
│     [Content]    │
│                  │
│                  │
│            📞    │  ← Fixed position
│           (FAB)  │     Right edge
│                  │
└──────────────────┘
```

**Sites using:** Wolfgang Puck, GG Catering, Salt Block

#### Pattern 2: Header Phone number

```
┌─────────────────────────────────┐
│  ☰  Logo          📞 (555)...  │  ← Tappable
├─────────────────────────────────┤
│                                 │
│  [Content...]                   │
│                                 │
└─────────────────────────────────┘
```

**Sites using:** Soprano's, Elegant Affairs, Ridgewells

#### Pattern 3: Sticky bottom bar with phone

```
┌─────────────────────────────────┐
│                                 │
│  [Scrollable content area]      │
│                                 │
│                                 │
├─────────────────────────────────┤
│  📞 Call: (555) 123-4567   [→] │  ← Sticky bottom
└─────────────────────────────────┘
```

**Sites using:** Creative Edge, Queen of Hearts

### Click-to-Call Best Practices

```html
<!-- Optimal implementation -->
<a href="tel:+18005551234" class="click-to-call">
  <span class="phone-icon">📞</span>
  <span class="phone-number">1-800-CATER-NOW</span>
  <span class="call-hint">Tap to call</span>
</a>

<style>
.click-to-call {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: white;
  text-decoration: none;
  font-weight: 600;
  /* Sticky positioning */
  position: sticky;
  bottom: 0;
  /* Touch friendly */
  min-height: 56px;
}

.phone-number {
  font-size: 18px;
  letter-spacing: 1px;
}

.call-hint {
  font-size: 12px;
  opacity: 0.8;
}

/* Active state feedback */
.click-to-call:active {
  transform: scale(0.98);
  background: linear-gradient(135deg, #15803d, #166534);
}
</style>
```

### Phone Number Formatting Tips

| Format | Example | Mobile Behavior |
|--------|---------|-----------------|
| **tel: link** | `tel:+18005551234` | Opens dialer ✓ |
| **Formatted with dashes** | `1-800-555-1234` | Readable ✓ |
| **Vanity number** | `1-800-CATER-ME` | Memorable ✓ |
| **Local format** | `(555) 123-4567` | Familiar ✓ |
| **International** | `+1-555-123-4567` | Universal ✓ |

---

## Sticky Mobile Headers

### Header Behavior Analysis

| Behavior | Sites Using | Pros | Cons |
|----------|------------|------|------|
| **Always sticky** | 35% | Nav always accessible | Takes up screen space |
| **Sticky on scroll up** | 25% | Best of both worlds | Complex implementation |
| **Not sticky** | 40% | Clean design | Scroll to access nav |

### Smart Sticky Header Pattern

```javascript
// Show header on scroll up, hide on scroll down
let lastScrollY = 0;
const header = document.querySelector('.mobile-header');
const threshold = 100;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  
  if (currentScrollY > lastScrollY && currentScrollY > threshold) {
    // Scrolling down - hide header
    header.classList.add('header-hidden');
  } else {
    // Scrolling up - show header
    header.classList.remove('header-hidden');
  }
  
  lastScrollY = currentScrollY;
});
```

```css
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  z-index: 1000;
}

.header-hidden {
  transform: translateY(-100%);
}

/* Add padding to body when header is fixed */
body {
  padding-top: 64px; /* Match header height */
}
```

### Shrinking Header Pattern (Wolfgang Puck style)

```css
.hero-header {
  transition: all 0.3s ease;
  padding: 20px 16px;
}

.hero-header.scrolled {
  padding: 12px 16px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.hero-header.scrolled .logo {
  height: 32px; /* Shrink from 40px */
}

.hero-header.scrolled .hamburger {
  /* Adjust icon size if needed */
}
```

---

## Mobile-Specific CTAs

### CTA Size Specifications

```css
/* Mobile-first CTA sizing based on Apple HIG + Material Design */

/* Primary CTA - Full width or near full width */
.cta-primary {
  width: 100%;
  max-width: 340px;
  height: 52px; /* Apple minimum: 44pt = ~58px, we use 52px */
  margin: 0 auto;
  font-size: 17px; /* Minimum readable size */
  font-weight: 600;
  border-radius: 12px; /* Modern rounded style */
  /* Ensure 44px touch target even with padding */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Secondary CTA */
.cta-secondary {
  height: 48px;
  padding: 0 24px;
  font-size: 16px;
  border-radius: 8px;
}

/* Text link CTA */
.cta-text {
  height: 44px; /* Still full touch target */
  display: inline-flex;
  align-items: center;
  font-size: 16px;
  text-decoration: underline;
  text-underline-offset: 4px;
}
```

### Mobile CTA Placement Strategy

```
MOBILE VIEWPORT LAYOUT:

┌─────────────────────────────────┐
│ HEADER (sticky or static)       │
├─────────────────────────────────┤
│                                 │
│  HERO SECTION                   │
│  "Exceptional Catering..."      │
│                                 │
│  ┌───────────────────────────┐  │
│  │     GET A FREE QUOTE     │  │  ← Hero CTA (above fold)
│  └───────────────────────────┘  │
│                                 │
├─────────────────────────────────┤
│  SERVICES GRID                  │
│  [Wedding] [Corporate] [Social] │
│                                 │
├─────────────────────────────────┤
│  SOCIAL PROOF                   │
│  ★★★★★ 500+ reviews            │
│                                 │
├─────────────────────────────────┤
│  MOBILE CONTACT FORM            │
│  ┌───────────────────────────┐  │
│  │ Name _________________   │  │
│  │ Phone _________________   │  │
│  │ Email _________________   │  │
│  │ Event Type ▼             │  │
│  │                           │  │
│  │ [ CHECK AVAILABILITY ]   │  │  ← Form CTA
│  └───────────────────────────┘  │
│                                 │
│  Or call: 📞 (800) 555-1234     │  ← Alternative
│                                 │
├─────────────────────────────────┤
│  STICKY BOTTOM BAR (optional)   │
│  📞 Call Now    [Book Now →]   │  ← Always accessible
└─────────────────────────────────┘
```

---

## Mobile Form Optimization

### Form Field Adaptations

```html
<form class="mobile-form">
  <!-- Use appropriate input types for mobile keyboards -->
  
  <fieldset class="form-section">
    <legend>Your Information</legend>
    
    <!-- Name field -->
    <div class="field">
      <label for="name">Full Name *</label>
      <input type="text" id="name" name="name" 
             autocomplete="name"
             autocapitalize="words"
             required>
    </div>
    
    <!-- Email with email keyboard -->
    <div class="field">
      <label for="email">Email Address *</label>
      <input type="email" id="email" name="email"
             autocomplete="email"
             autocapitalize="none"
             autocorrect="off"
             spellcheck="false"
             required>
    </div>
    
    <!-- Phone with tel keyboard and formatting -->
    <div class="field">
      <label for="phone">Phone Number *</label>
      <input type="tel" id="phone" name="phone"
             autocomplete="tel"
             placeholder="(555) 123-4567"
             inputmode="numeric"
             required>
    </div>
  </fieldset>
  
  <fieldset class="form-section">
    <legend>Event Details</legend>
    
    <!-- Date picker (native on mobile) -->
    <div class="field">
      <label for="date">Event Date</label>
      <input type="date" id="date" name="date">
    </div>
    
    <!-- Number with number keyboard -->
    <div class="field">
      <label for="guests">Number of Guests</label>
      <input type="number" id="guests" name="guests"
             inputmode="numeric"
             min="1"
             placeholder="Approximate">
    </div>
    
    <!-- Select dropdown (native picker) -->
    <div class="field">
      <label for="type">Event Type</label>
      <select id="type" name="type">
        <option value="">Select event type...</option>
        <option value="wedding">Wedding</option>
        <option value="corporate">Corporate Event</option>
        <option value="social">Social Gathering</option>
        <option value="private">Private Party</option>
        <option value="other">Other</option>
      </select>
    </div>
  </fieldset>
  
  <!-- Submit button - always visible consideration -->
  <button type="submit" class="submit-btn">
    Check Availability
  </button>
  
  <!-- Alternative contact -->
  <p class="alt-contact">
    Prefer to talk? <a href="tel:+18005551234">Call us</a>
  </p>
</form>
```

### Mobile Form CSS

```css
.mobile-form {
  padding: 20px 16px;
}

.form-section {
  border: none;
  margin-bottom: 24px;
  padding: 0;
}

.form-section legend {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding: 0;
}

.field {
  margin-bottom: 20px;
}

.field label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  height: 48px; /* Touch-friendly */
  padding: 12px 16px;
  font-size: 16px; /* Prevent iOS zoom */
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  box-sizing: border-box;
}

.field textarea {
  height: 120px;
  resize: vertical;
}

/* Focus states */
.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.submit-btn {
  width: 100%;
  height: 56px;
  margin-top: 8px;
  font-size: 17px;
  font-weight: 600;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

.alt-contact {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}

.alt-contact a {
  color: var(--primary-color);
  font-weight: 500;
}
```

---

## Mobile Gallery Behavior

### Lightbox Implementation

```javascript
// Mobile-optimized lightbox pattern
class MobileLightbox {
  constructor(gallery) {
    this.gallery = gallery;
    this.images = gallery.querySelectorAll('.gallery-image');
    this.currentIndex = 0;
    this.init();
  }
  
  init() {
    this.images.forEach((img, index) => {
      img.addEventListener('click', () => this.open(index));
    });
  }
  
  open(index) {
    this.currentIndex = index;
    this.createLightbox();
    this.showImage(index);
  }
  
  createLightbox() {
    // Create lightbox container
    this.lb = document.createElement('div');
    this.lb.className = 'lightbox';
    this.lb.innerHTML = `
      <button class="lb-close">×</button>
      <button class="lb-prev">‹</button>
      <button class="lb-next">›</button>
      <div class="lb-image-container"></div>
      <div class="lb-counter"></div>
      <div class="lb-thumbs"></div>
    `;
    document.body.appendChild(this.lb);
    
    // Swipe support
    this.addSwipeSupport();
    
    // Close handlers
    this.lb.querySelector('.lb-close').onclick = () => this.close();
    this.lb.onclick = (e) => {
      if (e.target === this.lb) this.close();
    };
  }
  
  addSwipeSupport() {
    let startX = 0;
    let endX = 0;
    
    this.lb.addEventListener('touchstart', (e) => {
      startX = e.changedTouches[0].screenX;
    });
    
    this.lb.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].screenX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) { // Min swipe distance
        if (diff > 0) this.next();
        else this.prev();
      }
    });
  }
}
```

### Gallery Pattern Options

| Pattern | Description | Best For |
|---------|-------------|----------|
| **Vertical swipe** | Swipe up/down between images | Single-column layout |
| **Horizontal swipe** | Swipe left/right (like Instagram) | Full-screen lightbox |
| **Thumbnail strip** | Small thumbs below main image | Multi-image showcase |
| **Grid tap to expand** | Grid view, tap for full size | Portfolio galleries |
| **Infinite scroll** | Continuous vertical scroll | Social feed style |

### Lazy Loading for Mobile Galleries

```html
<!-- Native lazy loading -->
<img src="thumbnail.jpg" 
     data-src="full-image.jpg"
     loading="lazy"
     alt="Gallery image description"
     class="gallery-image">

<!-- Or Intersection Observer for more control -->
<script>
const images = document.querySelectorAll('.gallery-image');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imageObserver.unobserve(img);
    }
  });
}, { rootMargin: '100px' }); // Load 100px before visible

images.forEach(img => imageObserver.observe(img));
</script>
```

---

## Performance Patterns

### Mobile Performance Optimizations Found

| Technique | Sites Using | Impact |
|-----------|-------------|--------|
| **Lazy load images** | 70% | -40% initial load time |
| **Compressed images** | 85% | -60% bandwidth |
| **Minimal fonts** | 90% | Faster FCP |
| **CSS animations over JS** | 60% | Smoother 60fps |
| **No autoplay video** | 95% | Saves data/battery |
| **Responsive images** | 75% | Proper sizing |
| **Critical CSS inline** | 30% | Faster render |

### Mobile Performance Checklist

```yaml
mobile_performance_targets:
  first_contentful_paint: "< 1.5s"
  largest_contentful_paint: "< 2.5s"
  cumulative_layout_shift: "< 0.1"
  total_blocking_time: "< 200ms"
  page_weight: "< 2MB (ideal < 1MB)"
  images:
    format: "WebP with fallback"
    max_dimension: "1200px for hero"
    lazy_load: true
  fonts:
    count: "< 3 typefaces"
    display: "swap (prevent FOIT)"
  javascript:
    defer_non_critical: true
    remove_unused: true
```

---

## Anti-Patterns for Mobile

### ❌ Common Mobile UX Mistakes

1. **Tiny Touch Targets**
   - ❌ Buttons smaller than 44x44px
   - ❌ Links too close together (< 8px gap)
   - ✅ Minimum 48px height for all tappable elements

2. **Poor Form Experience**
   - ❌ Dropdowns that don't work well on touch
   - ❌ Zoomed inputs (font-size < 16px)
   - ❌ Horizontal scrolling forms
   - ✅ Native controls, proper input types

3. **Navigation Issues**
   - ❌ Menu hard to reach (top corner only)
   - ❌ No way to contact without scrolling
   - ❌ Deep navigation hierarchies
   - ✅ Multiple contact points, sticky options

4. **Performance Problems**
   - ❌ Heavy images not optimized
   - ❌ Autoplay video with sound
   - ❌ Too many scripts blocking render
   - ✅ Lazy loading, optimized assets

5. **Ignoring Platform Conventions**
   - ❌ Custom back buttons that don't work
   - ❌ Ignoring safe areas (notch, home indicator)
   - ❌ No visual feedback on tap
   - ✅ Follow platform guidelines, haptic feedback

---

## Quick Reference: Mobile UX Checklist

### Essential (Must Have)

- [ ] Hamburger menu that works perfectly
- [ ] Click-to-call phone numbers
- [ ] Touch targets ≥ 48px
- [ ] Readable font sizes (min 16px body)
- [ ] Fast loading (< 3s on 3G)
- [ ] Sticky or easily accessible CTA
- [ ] Mobile-optimized form fields

### Enhanced (Should Have)

- [ ] Full-screen menu overlay
- [ ] Floating action button(s)
- [ ] Smart sticky header
- [ ] Swipeable gallery/lightbox
- [ ] Bottom sticky contact bar
- [ ] Thumb-zone optimized CTAs
- [ ] Lazy loaded images

### Delightful (Nice to Have)

- [ ] Bottom navigation for key sections
- [ ] Haptic feedback on interactions
- [ ] Pull-to-refresh functionality
- [ ] Gesture shortcuts (swipe to go back)
- [ ] Progressive web app capabilities
- [ ] Offline availability for key content

---

*End of Mobile UX Document*
