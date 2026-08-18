# CSS & Design Patterns Extracted from Reference Sites

**Generated**: 2025-01-15  
**Source Sites**: 15 successful catering website captures  
**Purpose**: Reusable design pattern library for new catering site development

---

## Table of Contents

1. [Per-Site Analysis](#per-site-analysis)
2. [Cross-Site Pattern Library](#cross-site-pattern-library)
3. [Color Palettes](#color-palettes)
4. [Typography Systems](#typography-systems)
5. [Animation Keyframes](#animation-keyframes)
6. [Button Styles](#button-styles)
7. [Navigation Patterns](#navigation-patterns)
8. [Hero Section Patterns](#hero-section-patterns)
9. [Card Components](#card-components)
10. [Form Styles](#form-styles)
11. [Gallery/Grid Patterns](#gallerygrid-patterns)
12. [Responsive Breakpoints](#responsive-breakpoints)
13. [Class Naming Conventions](#class-naming-conventions)

---

## Per-Site Analysis

### 1. Concorde Catering (Calgary, Canada)
- **URL**: https://concordecatering.ca/
- **Platform**: Squarespace
- **Primary Colors**: Dark neutrals (uses Adobe Typekit fonts)
- **Font Stack**: Adobe Fonts via Typekit
- **Notable Classes**: `header theme-col--primary`, `black-bold`
- **Animations**: `@keyframes fonts` (font loading animation)
- **Unique Features**: Clean minimal design, Calgary restaurant group backing

### 2. My Radish
- **URL**: https://www.myradish.com/
- **Platform**: Squarespace
- **Primary Colors**: Neutral palette
- **Font Stack**: System/Squarespace defaults
- **Notable Classes**: `header-background theme-bg--primary`, `header-menu-icon-plus`, `header-blur-background`, `white-bold header theme-col--primary`
- **Breakpoints**: 768px (tablet)
- **Unique Features**: Blurred header background effect

### 3. Ridgewells Catering (Washington DC)
- **URL**: https://www.ridgewells.com/
- **Platform**: Wix/WordPress hybrid
- **Primary Colors**: 
  - Primary: `#116dff` (bright blue)
  - Dark: `#080808` (near black)
  - Text: `#5f6360` (dark gray)
- **Font Sizes**: 10px, 14px, 1em
- **Line Heights**: 1.2
- **Animations**: 
  - `@keyframes slide-horizontal-new/old`
  - `@keyframes slide-vertical-new/old`
  - `@keyframes out-in-new`
- **Unique Features**: 95+ year history, slider animations for content transitions

### 4. Sopranos Catering (Michigan)
- **URL**: https://www.sopranoscatering.com/
- **Platform**: Webflow
- **Google Fonts**: `Oswald:200,300,400,500,600,700 | Great Vibes:400 | Karla:300,400,500,600,700`
- **Button Classes**: 
  - `button w-button` (base)
  - `button hero-button w-button` (hero CTA)
  - `button small-button white-hover-button w-button` (secondary)
  - `button full-width-button w-button` (full width)
- **Nav Classes**: `nav-bar fixed-nav-bar w-nav`, `nav-link fixed-nav-link w-nav-link`, `dropdown-2 w-dropdown`
- **Hero Pattern**: Full-screen hero with scroll indicator (`hero-scroll`)
- **Components**: Side cards (`side-card`), CTA section (`cta-section`)

### 5. Concept Catering Crew (Germany)
- **URL**: https://www.concept-catering.de/
- **Platform**: Webflow
- **Google Fonts**: `PT Sans:400,400italic,700,700italic`
- **Adobe Fonts**: Yes (Typekit integration)
- **Color Palette**:
  - Near Black: `#151515`, `#1C1C1C`, `#080808`
  - Grays: `#ebebeb`, `#f5f5f5`, `#f3f3f3`, `#DADADA`
  - Mid-tones: `#4d4d4d`, `#666666`, `#2f2f2f`, `#212121`, `#424242`, `#616161`
  - White: `#FEFEFE`, `#FFFFFF`
- **Font Sizes**: 10px-37px range
- **Line Heights**: 1.65, 2, 3, 3.2
- **Letter Spacing**: 0, 0.4px, 1px
- **Animations**: `expandBox`, MDC ripple effects
- **Breakpoints**: 992px (desktop)
- **Notable Classes**: `hero-wrapper`, `full-screen-menu`, `big-footer`, `text-scroling-section`, `menu-link-block-2`

### 6. Queen of Hearts Catering (Philadelphia)
- **URL**: https://queenofheartscatering.com/
- **Platform**: WordPress
- **Google Fonts**: `Lato:300,400,700`
- **Color Palette**:
  - Accent Red: `#e60023`
  - Purple: `#7a00df`, `#9b51e0`
  - Blue: `#2874fc`
  - Teal: `#34e2e4`
  - Gold: `#fdd79a`
  - Lavender: `#dad0ec`
  - Neutrals: `#313131`, `#363636`, `#444`, `#746d6a`, `#eee`, `#ddd`, `#efefef`
- **Font Sizes**: 11px-27px range, plus em values
- **Line Heights**: 1.11, 1.23, 24, 30, 32
- **Animations**: 
  - `hb-foil-sweep` (scratch card reveal)
  - `hb-scratch-pulse`
  - `hb-scratch-reveal-reward`
  - `hb-loot-shake`, `hb-loot-open`
- **Unique Features**: Gamification animations (scratch cards, rewards)

### 7. Tall Guy and a Grill (Milwaukee)
- **URL**: https://www.tallguyandagrill.com/
- **Platform**: Squarespace
- **Adobe Fonts**: Yes (Typekit)
- **Animations**: `@keyframes fonts` (font loading)
- **Unique Features**: Farm-to-fork focus, certified green caterer, Wisconsin-based

### 8. Global Gourmet Catering (Bay Area)
- **URL**: https://www.ggcatering.com/
- **Platform**: Custom build
- **Google Fonts**: `Poppins:ital,wght@0,400;0,500;0,600;0,700;1,700`
- **Button Classes**: `btn`, `btn mt-6 enter-text`, `nav-button`
- **Nav Classes**: `nav-bar`, `nav-bg`, `nav-home`, `nav-links`, `nav-links-inner`, `nav-links-wrapper`
- **Hero Pattern**: CSS Grid-based graphic layout (`home-hero-graphic`) with complex grid positioning
- **Grid Pattern**: `grid grid-cols-5 grid-rows-4` for hero section
- **Unique Features**: Tailwind-like utility classes, lime accent color (`text-lime`), sophisticated grid system

### 9. SaltBlock Hospitality (Tampa)
- **URL**: https://saltblockhospitality.com/
- **Platform**: Squarespace
- **Google Fonts**: `PT Serif:ital,wght@0,400;0,700;1,400;1,700`
- **Adobe Fonts**: Yes (Typekit)
- **Color Palette**:
  - Red/Coral: `#ff4734`, `#dd4b39`, `#f93262`
  - Blue: `#1c91ff`, `1ab2e8`, `#3c5a9b`
  - Green: `#4ad504`
  - Yellow/Gold: `#ffb400`
  - Neutrals: `#fafafa`, `#222`, `#111`, `#9c9c9c`
- **Font Sizes**: 11px, 12px, 15px
- **Line Heights**: 14
- **Letter Spacing**: 0
- **Animations**: Font loading
- **Unique Features**: Multi-color vibrant palette, serif typography (PT Serif)

### 10. The JDK Group (Harrisburg/Lancaster/York)
- **URL**: https://thejdkgroup.com/
- **Platform**: WordPress
- **Google Fonts**: 
  - `Raleway:100-900` (full weight range)
  - `Roboto:100-900` (full weight range)
  - `Roboto Slab:100-900` (full weight range)
  - `Open Sans:400italic,600italic`
- **Color Palette**:
  - Navy Blue: `#323E6D`
  - Purple: `#9b51e0`
  - Green: `#23A455`, `#61CE70`
  - Blue: `#6EC1E4`
  - Orange: `#ff6900`, `#FFBC7D`
  - Red: `#de1247`, `#cf2e2e`
  - Gold: `#fcb900`
- **Font Sizes**: 16px, 1.125em, 1.5em
- **Line Heights**: 1.6
- **Button Classes**: `btn`, `btn-slider`, `nav-btn`
- **Nav Classes**: `site-mainmenu`, `wrapper-header`, `site-header`, `menu-item-*`
- **Unique Features**: Extensive font library, multi-accent color scheme

### 11. Creative Edge Parties (Miami/Palm Beach)
- **URL**: https://www.creativeedgeparties.com/
- **Platform**: Squarespace
- **Notable Classes**: `dark` (theme variant), `header theme-col--primary`
- **Unique Features**: Light/dark mode favicon support, luxury positioning

### 12. Cut & Taste (Las Vegas)
- **URL**: https://www.cutandtastelv.com/
- **Platform**: Squarespace
- **Adobe Fonts**: Yes (Typekit)
- **Animations**: Font loading
- **Unique Features**: High-end Las Vegas market positioning

### 13. Elegant Affairs Caterers (NYC/Hamptons)
- **URL**: https://elegantaffairscaterers.com/
- **Platform**: WordPress
- **Color Palette**:
  - Red: `#e71d3a`, `#cf2e2e`
  - Orange: `#ff6900`
  - Purple: `#9b51e0`
  - Blue: `#8ed1fc`
  - Dark: `#40464d`
  - Light grays: `#e7e7e7`, `#EEEEEE`, `#FAFAFA`, `#fafafa`
- **Breakpoints**: 544px, 545px, 769px, 1200px, 1201px
- **Unique Features**: NYC/Hamptons luxury market, refined color palette

### 14. Gamma Catering (Switzerland)
- **URL**: https://www.gammacatering.com/en/
- **Platform**: Webflow (Oxygen builder)
- **Notable Classes**: 
  - BEM-style: `site-header__burger-bars`, `site-header__logo-img`, `site-header__item--has-dropdown`
  - Buttons: `btn btn--outline`, `gh__btn gh__btn--secondary`
  - Hero: `hero__title heading-styling-h1`, `hero__card`
  - Accordion: `accordion__header`, `accordion__cta`
  - Location: `loc-card`
- **Animations**: `ghScriptIn` (fade-in entrance)
- **Unique Features**: Swiss precision design, multilingual (DE/EN), BEM naming convention

### 15. Wolfgang Puck Catering (National)
- **URL**: https://wolfgangpuckcatering.com/
- **Platform**: HubSpot CMS
- **Google Fonts**: `Albert Sans:ital,wght@0,100..900;1,100..900`
- **Color Palette**:
  - Teal: `#00a4bd`, `#3af`
  - Coral/Red: `#f2545b`
  - Orange: `#ff8000`
  - Blue: `#178fe5`
  - Green: `#1d462e`
  - Gray: `#f5f5f5`, `#9fa0a2`, `#bbb`
- **Font Sizes**: 11px, 12px, 14px
- **Line Heights**: 15, 20, 25
- **Button Classes**: `button`, `button_group`, `header_btn_groups-btns`
- **Nav Classes**: `menu_module-link`, `menu_module-item`, `menu_module-wrapper`, `popup_navigation-*`
- **Unique Features**: National brand, HubSpot platform, popup navigation menu pattern

---

## Cross-Site Pattern Library

### Color Palettes

#### Professional/Corporate Palette (Most Common)
```css
:root {
  /* Primary */
  --color-primary: #116dff;        /* Bright blue - Ridgewells */
  --color-primary-dark: #0a4db8;
  
  /* Neutrals */
  --color-black: #080808;          /* Near-black backgrounds */
  --color-dark: #1c1c1c;           /* Dark sections */
  --color-text: #333333;           /* Body text */
  --color-text-light: #666666;     /* Secondary text */
  --color-text-muted: #999999;     /* Captions/metadata */
  --color-border: #e5e5e5;         /* Borders */
  --color-light: #f5f5f5;          /* Light backgrounds */
  --color-white: #ffffff;          /* White */
}
```

#### Warm/Luxury Palette
```css
:root {
  /* Accent colors */
  --color-accent-red: #e71d3a;     /* Elegant Affairs */
  --color-accent-coral: #f2545b;   /* Wolfgang Puck */
  --color-accent-orange: #ff8000;  /* Wolfgang Puck */
  --color-accent-gold: #ffb400;    /* SaltBlock */
  --color-accent-gold-light: #FFBC7D; /* JDK Group */
  
  /* Support colors */
  --color-purple: #9b51e0;         /* Multiple sites */
  --color-teal: #00a4bd;           /* Wolfgang Puck */
  --color-green: #4ad504;          /* SaltBlock */
}
```

#### Sophisticated/Minimal Palette
```css
:root {
  /* Monochrome with single accent */
  --color-bg-dark: #151515;
  --color-bg-darker: #080808;
  --color-surface: #ffffff;
  --color-surface-alt: #fafafa;
  --color-text-primary: #1c1c1c;
  --color-text-secondary: #666666;
  --color-divider: #ebebeb;
}
```

---

## Typography Systems

### Font Stacks by Category

#### Modern Sans-Serif (Recommended for Headlines)
```css
/* Option 1: Geometric - Great for modern feel */
.font-headline {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Option 2: Grotesque - Strong, bold headlines */
.font-headline-alt {
  font-family: 'Oswald', 'Arial Narrow', sans-serif;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

/* Option 3: Clean Swiss-style */
.font-swiss {
  font-family: 'PT Sans', 'Helvetica Neue', Arial, sans-serif;
}

/* Option 4: Versatile modern */
.font-modern {
  font-family: 'Albert Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

#### Body Text Fonts
```css
/* Option 1: Highly readable */
.font-body {
  font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  line-height: 1.6;
}

/* Option 2: Elegant serif for luxury feel */
.font-serif {
  font-family: 'PT Serif', Georgia, 'Times New Roman', serif;
  line-height: 1.65;
}

/* Option 3: Technical/professional */
.font-technical {
  font-family: 'Raleway', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Option 4: Friendly approachable */
.font-friendly {
  font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

#### Decorative/Accent Fonts
```css
/* Script for special occasions */
.font-script {
  font-family: 'Great Vibes', cursive;
}

/* Slab serif for emphasis */
.font-slab {
  font-family: 'Roboto Slab', Georgia, serif;
}
```

### Typography Scale (Common Patterns)

```css
:root {
  /* Fluid type scale based on 16px base */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);    /* 12-14px */
  --text-sm: clamp(0.875rem, 0.85rem + 0.1vw, 1rem);       /* 14-16px */
  --text-base: 1rem;                                          /* 16px */
  --text-lg: clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem);    /* 18-20px */
  --text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);       /* 20-24px */
  --text-2xl: clamp(1.5rem, 1.25rem + 1.25vw, 2rem);        /* 24-32px */
  --text-3xl: clamp(1.875rem, 1.5rem + 1.85vw, 2.5rem);     /* 30-40px */
  --text-4xl: clamp(2.25rem, 1.75rem + 2.5vw, 3rem);        /* 36-48px */
  --text-hero: clamp(2.5rem, 1.8rem + 3.5vw, 4rem);          /* 40-64px */
}

/* Line heights */
--leading-tight: 1.1;
--leading-snug: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.65;
--leading-loose: 1.8;

/* Letter spacing */
--tracking-tight: -0.02em;
--tracking-normal: 0;
--tracking-wide: 0.02em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;
```

---

## Animation Keyframes

### Fade Animations (Most Common Pattern)
```css
/* Simple fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Fade in up (for content reveals) */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Script/elegant fade (from Gamma Catering) */
@keyframes scriptIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Slide Animations (From Ridgewells)
```css
/* Horizontal slide in from right */
@keyframes slideHorizontalNew {
  0% { transform: translateX(100%); }
  100% { transform: translateX(0); }
}

/* Horizontal slide out to left */
@keyframes slideHorizontalOld {
  0% { transform: translateX(0); opacity: 1; }
  80% { transform: translateX(-100%); opacity: 1; }
  100% { transform: translateX(-100%); opacity: 0; }
}

/* Vertical slide from top */
@keyframes slideVerticalNew {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(0); }
}
```

### Interactive/Gamification Animations (From Queen of Hearts)
```css
/* Scratch card foil sweep */
@keyframes foilSweep {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(100%) skewX(-15deg); }
}

/* Pulse effect for interactive elements */
@keyframes scratchPulse {
  from { transform: translateY(0) scale(1); }
  50% { transform: translateY(-5px) scale(1.02); }
  to { transform: translateY(0) scale(1); }
}

/* Reward reveal */
@keyframes scratchRevealReward {
  0% { transform: scale(0.7); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
```

### Expand/Box Animation (From Concept Catering)
```css
@keyframes expandBox {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
```

### Utility Animation Classes
```css
/* Usage classes */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

.animate-slide-in-left {
  animation: slideHorizontalNew 0.5s ease-out forwards;
}

.animate-scale-in {
  animation: expandBox 0.4s ease-out forwards;
}

/* Staggered children animation */
.stagger-children > * {
  opacity: 0;
  animation: fadeInUp 0.5s ease-out forwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.4s; }
.stagger-children > *:nth-child(5) { animation-delay: 0.5s; }

/* Hover interactions */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}

.hover-scale {
  transition: transform 0.3s ease;
}

.hover-scale:hover {
  transform: scale(1.03);
}
```

---

## Button Styles

### Primary Button (CTA)
```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 32px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-decoration: none;
  color: #ffffff;
  background-color: var(--color-primary, #116dff);
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark, #0a4db8);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(17, 109, 255, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}
```

### Secondary/Outline Button
```css
.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 30px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  color: var(--color-text, #333);
  background-color: transparent;
  border: 2px solid currentColor;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  color: #ffffff;
  background-color: var(--color-text, #333);
}
```

### Ghost/Text Button
```css
.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
  color: var(--color-primary, #116dff);
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
}

.btn-ghost::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 20px;
  right: 20px;
  height: 2px;
  background-color: currentColor;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.btn-ghost:hover::after {
  transform: scaleX(1);
}
```

### Button Size Variants
```css
/* Small */
.btn-sm {
  padding: 8px 16px;
  font-size: 0.875rem;
}

/* Large/Hero */
.btn-lg {
  padding: 18px 40px;
  font-size: 1.125rem;
}

/* Full width (mobile) */
.btn-full {
  width: 100%;
}

@media (max-width: 768px) {
  .btn-full-mobile {
    width: 100%;
  }
}
```

---

## Navigation Patterns

### Standard Top Navigation Structure
```html
<!-- Recommended navigation structure -->
<header class="site-header">
  <div class="header-container">
    <!-- Logo -->
    <a href="/" class="header-logo" aria-label="Home">
      <img src="logo.svg" alt="Company Name" />
    </a>
    
    <!-- Main Navigation -->
    <nav class="main-nav" aria-label="Main navigation">
      <ul class="nav-list">
        <li class="nav-item">
          <a href="/services" class="nav-link">Services</a>
        </li>
        <li class="nav-item nav-item-has-dropdown">
          <a href="/menus" class="nav-link">Menus</a>
          <ul class="dropdown-menu">
            <li><a href="/menus/corporate" class="dropdown-link">Corporate</a></li>
            <li><a href="/menus/weddings" class="dropdown-link">Weddings</a></li>
            <li><a href="/menus/social" class="dropdown-link">Social</a></li>
          </ul>
        </li>
        <li class="nav-item">
          <a href="/about" class="nav-link">About</a>
        </li>
        <li class="nav-item">
          <a href="/gallery" class="nav-link">Gallery</a></li>
        <li class="nav-item">
          <a href="/contact" class="nav-link">Contact</a>
        </li>
      </ul>
    </nav>
    
    <!-- CTA Button -->
    <a href="/quote" class="btn-primary header-cta">Get a Quote</a>
    
    <!-- Mobile Menu Toggle -->
    <button class="mobile-menu-toggle" aria-label="Toggle menu">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  </div>
</header>
```

### Navigation CSS
```css
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border, #e5e5e5);
  transition: all 0.3s ease;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 80px;
}

.header-logo img {
  height: 48px;
  width: auto;
}

.nav-list {
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  display: block;
  padding: 10px 18px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text, #333);
  text-decoration: none;
  position: relative;
  transition: color 0.3s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 18px;
  right: 18px;
  height: 2px;
  background-color: var(--color-primary, #116dff);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.nav-link:hover {
  color: var(--color-primary, #116dff);
}

.nav-link:hover::after,
.nav-link.active::after {
  transform: scaleX(1);
}

/* Dropdown */
.nav-item-has-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  padding: 8px 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.nav-item-has-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-link {
  display: block;
  padding: 12px 20px;
  color: var(--color-text, #333);
  text-decoration: none;
  transition: background 0.2s ease;
}

.dropdown-link:hover {
  background-color: var(--color-light, #f5f5f5);
  color: var(--color-primary, #116dff);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
}

.hamburger-line {
  width: 24px;
  height: 2px;
  background-color: var(--color-text, #333);
  transition: all 0.3s ease;
}

/* Header scrolled state */
.site-header.scrolled {
  box-shadow: 0 2px 20px rgba(0,0,0,0.1);
}

@media (max-width: 1024px) {
  .main-nav {
    display: none;
  }
  
  .header-cta {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: flex;
  }
  
  .main-nav.is-open {
    display: block;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    padding: 24px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  }
  
  .nav-list {
    flex-direction: column;
    gap: 0;
  }
  
  .nav-link {
    padding: 14px 0;
    border-bottom: 1px solid var(--color-border, #e5e5e5);
  }
}
```

---

## Hero Section Patterns

### Full-Screen Image Hero (Most Common Pattern)
```html
<section class="hero hero-fullscreen">
  <div class="hero-background">
    <img src="hero-image.jpg" alt="" class="hero-image" />
    <div class="hero-overlay"></div>
  </div>
  <div class="hero-content">
    <h1 class="hero-title">Exceptional Catering<br>for Every Occasion</h1>
    <p class="hero-subtitle">From corporate events to weddings, we bring culinary excellence to your celebration.</p>
    <div class="hero-actions">
      <a href="/contact" class="btn-primary btn-lg">Get Started</a>
      <a href="/menus" class="btn-outline btn-lg">View Menus</a>
    </div>
  </div>
  <div class="hero-scroll-indicator">
    <span>Scroll</span>
    <div class="scroll-line"></div>
  </div>
</section>
```

### Hero CSS
```css
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-fullscreen {
  min-height: 100vh;
  height: 100vh;
}

.hero-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 900px;
  padding: 0 24px;
  animation: fadeInUp 1s ease-out;
}

.hero-title {
  font-size: var(--text-hero, clamp(2.5rem, 1.8rem + 3.5vw, 4rem));
  font-weight: 700;
  line-height: 1.1;
  color: #ffffff;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: var(--text-lg, 1.25rem);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Scroll Indicator */
.hero-scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  animation: fadeIn 1s ease-out 0.5s both;
}

.scroll-line {
  width: 1px;
  height: 60px;
  background: linear-gradient(to bottom, white, transparent);
  animation: scrollPulse 2s ease-in-out infinite;
}

@keyframes scrollPulse {
  0%, 100% { opacity: 1; transform: scaleY(1); transform-origin: top; }
  50% { opacity: 0.5; transform: scaleY(0.8); transform-origin: top; }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.125rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .hero-actions .btn-primary,
  .hero-actions .btn-outline {
    width: 100%;
    text-align: center;
  }
}
```

### Split Layout Hero (Alternative)
```html
<section class="hero-split">
  <div class="hero-split-content">
    <h1 class="hero-title">Crafting Culinary<br>Experiences</h1>
    <p class="hero-text">Premium catering services tailored to your vision.</p>
    <a href="/contact" class="btn-primary">Request Quote</a>
  </div>
  <div class="hero-split-image">
    <img src="catering-image.jpg" alt="Beautifully catered event" />
  </div>
</section>
```

---

## Card Components

### Service Card
```html
<div class="service-card">
  <div class="card-image">
    <img src="service.jpg" alt="Service name" />
  </div>
  <div class="card-content">
    <h3 class="card-title">Corporate Events</h3>
    <p class="card-description">Professional catering for business meetings, conferences, and corporate celebrations.</p>
    <a href="/corporate" class="card-link">Learn More &rarr;</a>
  </div>
</div>
```

### Card CSS
```css
.service-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.card-image {
  aspect-ratio: 16 / 10;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.service-card:hover .card-image img {
  transform: scale(1.08);
}

.card-content {
  padding: 28px;
}

.card-title {
  font-size: 1.375rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin-bottom: 12px;
}

.card-description {
  font-size: 1rem;
  color: var(--color-text-light, #666);
  line-height: 1.6;
  margin-bottom: 20px;
}

.card-link {
  font-weight: 600;
  color: var(--color-primary, #116dff);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: gap 0.3s ease;
}

.card-link:hover {
  gap: 12px;
}
```

### Card Grid
```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  padding: 40px 0;
}

@media (min-width: 1200px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Form Styles

### Contact Form
```html
<form class="contact-form" action="/api/contact" method="POST">
  <div class="form-row">
    <div class="form-group">
      <label for="name" class="form-label">Full Name *</label>
      <input type="text" id="name" name="name" class="form-input" required placeholder="John Smith" />
    </div>
    <div class="form-group">
      <label for="email" class="form-label">Email Address *</label>
      <input type="email" id="email" name="email" class="form-input" required placeholder="john@example.com" />
    </div>
  </div>
  
  <div class="form-row">
    <div class="form-group">
      <label for="phone" class="form-label">Phone Number</label>
      <input type="tel" id="phone" name="phone" class="form-input" placeholder="(555) 123-4567" />
    </div>
    <div class="form-group">
      <label for="event-type" class="form-label">Event Type *</label>
      <select id="event-type" name="event_type" class="form-select" required>
        <option value="">Select event type...</option>
        <option value="wedding">Wedding</option>
        <option value="corporate">Corporate Event</option>
        <option value="social">Social Gathering</option>
        <option value="other">Other</option>
      </select>
    </div>
  </div>
  
  <div class="form-group">
    <label for="message" class="form-label">Tell Us About Your Event *</label>
    <textarea id="message" name="message" class="form-textarea" rows="5" required placeholder="Number of guests, date, venue, dietary requirements..."></textarea>
  </div>
  
  <button type="submit" class="btn-primary btn-lg form-submit">Send Message</button>
</form>
```

### Form CSS
```css
.contact-form {
  max-width: 700px;
  margin: 0 auto;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text, #333);
  margin-bottom: 8px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 14px 18px;
  font-family: inherit;
  font-size: 1rem;
  color: var(--color-text, #333);
  background-color: white;
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: 8px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary, #116dff);
  box-shadow: 0 0 0 3px rgba(17, 109, 255, 0.15);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #999;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-submit {
  width: 100%;
  margin-top: 16px;
}

/* Validation states */
.form-input:invalid:not(:placeholder-shown),
.form-textarea:invalid:not(:placeholder-shown) {
  border-color: #e71d3a;
}

.form-input:valid:not(:placeholder-shown),
.form-textarea:valid:not(:placeholder-shown) {
  border-color: #23A455;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
```

---

## Gallery/Grid Patterns

### Masonry-style Gallery
```html
<div class="gallery-grid">
  <a href="image1-large.jpg" class="gallery-item gallery-item-tall">
    <img src="image1.jpg" alt="Gallery image 1" loading="lazy" />
  </a>
  <a href="image2-large.jpg" class="gallery-item">
    <img src="image2.jpg" alt="Gallery image 2" loading="lazy" />
  </a>
  <a href="image3-large.jpg" class="gallery-item gallery-item-wide">
    <img src="image3.jpg" alt="Gallery image 3" loading="lazy" />
  </a>
  <!-- More items... -->
</div>
```

### Gallery CSS
```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 24px 0;
}

.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  aspect-ratio: 1;
}

.gallery-item-tall {
  grid-row: span 2;
  aspect-ratio: auto;
}

.gallery-item-wide {
  grid-column: span 2;
  aspect-ratio: 2 / 1;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.gallery-item:hover img {
  transform: scale(1.08);
}

.gallery-item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  transition: background 0.3s ease;
}

.gallery-item:hover::after {
  background: rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .gallery-item-wide {
    grid-column: span 1;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Responsive Breakpoints

### Common Breakpoint Values (Extracted from Reference Sites)

```css
/* Extra small devices (phones) */
@media (max-width: 544px) { }   /* Elegant Affairs */

/* Small devices (phones landscape) */
@media (max-width: 576px) { }

/* Medium small (large phones/small tablets) */
@media (max-width: 768px) { }   /* Most common tablet breakpoint */

/* Tablets */
@media (max-width: 992px) { }   /* Concept Catering desktop breakpoint */

/* Small desktops */
@media (max-width: 1200px) { }  /* Elegant Affairs */

/* Large desktops and up */
@media (min-width: 1201px) { } /* Elegant Affairs */
```

### Recommended Breakpoint System
```css
:root {
  /* Mobile first breakpoints */
  --bp-sm: 640px;   /* Small tablets */
  --bp-md: 768px;   /* Tablets */
  --bp-lg: 1024px;  /* Laptops */
  --bp-xl: 1280px;  /* Desktops */
  --bp-2xl: 1536px; /* Large screens */
}

/* Usage example */
.container {
  width: 100%;
  padding: 0 16px;
  margin: 0 auto;
}

@media (min-width: 640px) { .container { max-width: 640px; } }
@media (min-width: 768px) { .container { max-width: 768px; padding: 0 24px; } }
@media (min-width: 1024px) { .container { max-width: 1024px; padding: 0 32px; } }
@media (min-width: 1280px) { .container { max-width: 1280px; } }
```

---

## Class Naming Conventions

### Summary of Conventions Found

| Convention | Sites Using It | Example |
|------------|----------------|---------|
| **BEM** (Block__Element--Modifier) | Gamma Catering, Global Gourmet | `.site-header__nav`, `.btn--outline` |
| **Webflow** (w-prefix) | Sopranos, Concept Catering | `.w-nav`, `.w-button`, `.w-dropdown` |
| **WordPress Theme** | Queen of Hearts, JDK Group, Elegant Affairs | `.menu-item`, `.site-header`, `.entry-content` |
| **Squarespace** | Concorde, My Radish, Tall Guy, SaltBlock, Creative Edge, Cut & Taste | `.header-nav-item`, `.sqs-button-element` |
| **HubSpot** | Wolfgang Puck | `.menu_module`, `.header_btn_groups` |
| **Utility-first** | Global Gourmet | `.mt-6`, `.text-white`, `.grid-cols-5` |

### Recommended Naming Convention (BEM-inspired)

```css
/* Block */
.hero { }
.nav { }
.card { }
.btn { }
.form { }
.gallery { }
.footer { }

/* Elements */
.hero__title { }
.hero__subtitle { }
.hero__content { }
.hero__background { }
.hero__actions { }

.nav__list { }
.nav__item { }
.nav__link { }
.nav__dropdown { }

.card__image { }
.card__content { }
.card__title { }
.card__description { }
.card__link { }

/* Modifiers */
.btn--primary { }
.btn--secondary { }
.btn--outline { }
.btn--lg { }
.btn--sm { }

.nav--fixed { }
.nav--transparent { }
.card--featured { }
.hero--fullscreen { }
```

---

## Quick Reference: Platform Detection

When analyzing competitor sites, use these markers:

| Platform | Markers |
|----------|---------|
| **Squarespace** | `squarespace-cdn.com`, `typekit.net`, `sqs-button`, `header-nav-item` |
| **Webflow** | `w-nav`, `w-dropdown`, `data-wf-page`, `website-files.com` |
| **WordPress** | `/wp-content/`, `wp-json`, `menu-item-*`, `xmlrpc.php` |
| **Wix** | `wixstatic.com`, `wix-code`, `XtWUZQ` classes |
| **HubSpot** | `hubspot`, `hs-menu`, `menu_module` |
| **Custom** | Custom domain CDN, unique class names, no platform markers |

---

## Implementation Recommendations

Based on this analysis, here are recommended choices for a new catering site:

### Recommended Stack
- **Framework**: Next.js or similar React framework
- **Styling**: Tailwind CSS (utility-first like Global Gourmet) OR CSS Modules with BEM
- **Fonts**: Google Fonts combination:
  - Headlines: `Poppins` or `Oswald` (modern, clean)
  - Body: `Lato` or `Open Sans` (readable, professional)
  - Accent: `Great Vibes` or `PT Serif` (for elegant touches)
- **Colors**: Professional blue primary (#116dff) with warm accents
- **Animations**: Subtle fade-ins and hover effects (avoid heavy animations)
- **Layout**: Full-screen hero, card-based services, masonry gallery

### Performance Notes
- Use `loading="lazy"` on images below fold
- Implement responsive images with `srcset`
- Preload critical fonts
- Use CSS containment for animated components
- Consider `content-visibility: auto` for off-screen sections

---

*Document generated automatically from reference site analysis.*
*Last updated: 2025-01-15*
