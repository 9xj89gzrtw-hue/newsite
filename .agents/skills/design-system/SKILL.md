# Design System Skill

> Полная дизайн-система для премиального кейтеринг-сайта.
> Основана на анализе **55 мировых кейтеринг-брендов** (32 оригинальных + 23 дополнительных).

## Когда использовать

- При создании новых компонентов или секций
- При работе с цветами, типографикой, spacing
- При обеспечении консистентности дизайна
- Перед любыми визуальными изменениями

## Design Philosophy

**"Cinematic Elegance"** — кинематографичная элегантность, вдохновлённая:
- **Wolfgang Puck** — голливудский шик, bold typography
- **Pinch Food Design** — авангард, креативные взаимодействия
- **Ridgewells** — классическая элегантность, navy + gold
- **M Culinary** — premium корпоративный стиль
- **Concorde Catering** — тёплая элегантность, золотые акценты
- **Gamma Catering** — швейцарская утончённость, GSAP-анимации
- **Tall Guy & Grill** — смелый современный, терракотовые CTA

## Color System (OKLCH)

### Primary Palette

```css
@theme {
  /* === DARK THEME (Primary) === */
  
  /* Core colors */
  --color-night: oklch(0.15 0.02 260);        /* #1A1614 — основной фон */
  --color-charcoal: oklch(0.2 0.02 260);      /* #2A2524 — elevated */
  --color-espresso: oklch(0.28 0.03 260);     /* #3D3533 — secondary bg */
  
  /* Light theme (cream) */
  --color-cream: oklch(0.98 0.005 90);         /* #FCFBF8 — light bg */
  --color-parchment: oklch(0.94 0.01 85);     /* #EAE4D8 — cards */
  --color-sand: oklch(0.9 0.015 80);          /* #E8E0D2 — borders */
  
  /* Accent palette */
  --color-bordeaux: oklch(0.55 0.22 15);      /* #D11A46 — primary CTA */
  --color-bordeaux-dark: oklch(0.45 0.20 15);  /* #A01435 — hover state */
  --color-bordeaux-light: oklch(0.7 0.18 15);  /* #E84D6B — subtle accent */
  
  /* Secondary accents */
  --color-gold: oklch(0.78 0.12 75);          /* #C9A96E — luxury accent */
  --color-gold-light: oklch(0.88 0.08 75);     /* #DDD4BC — subtle gold */
  --color-sage: oklch(0.55 0.06 145);         /* #758269 — nature/organic */
  --color-sage-light: oklch(0.7 0.05 145);     /* #9BAF9D — sage muted */
  --color-orange: oklch(0.7 0.18 50);         /* #FF6E00 — energy/alerts */
  
  /* Semantic colors */
  --color-success: oklch(0.65 0.17 145);       /* Green */
  --color-warning: oklch(0.75 0.16 65);        /* Amber */
  --color-error: oklch(0.58 0.23 25);          /* Red */
  --color-info: oklch(0.6 0.15 250);           /* Blue */
}
```

### Gradient Library

```css
/* Premium gradients */
--gradient-hero: linear-gradient(
  135deg,
  oklch(0.15 0.02 260) 0%,
  oklch(0.2 0.04 260) 50%,
  oklch(0.15 0.02 260) 100%
);

--gradient-bordeaux: linear-gradient(
  135deg,
  oklch(0.55 0.22 15) 0%,
  oklch(0.6 0.2 30) 100%
);

--gradient-gold: linear-gradient(
  135deg,
  oklch(0.78 0.12 75) 0%,
  oklch(0.82 0.1 80) 50%,
  oklch(0.78 0.12 75) 100%
);

--gradient-dark-overlay: linear-gradient(
  to bottom,
  oklch(0.15 0.02 260 / 0) 0%,
  oklch(0.15 0.02 260 / 0.7) 50%,
  oklch(0.15 0.02 260 / 0.95) 100%
);

--gradient-shimmer: linear-gradient(
  90deg,
  transparent 0%,
  oklch(1 0 0 / 0.05) 50%,
  transparent 100%
);
```

## Reference Site Color Palettes

> Полные цветовые схемы из анализа 23 дополнительных референсных сайтов.
> Каждая палитра включает hex-значения и OKLCH-эквиваленты.

### Palette 1: Concorde Catering — Warm Elegant Gold

```css
@theme {
  /* Тёплая золотистая палитра для элегантных мероприятий */
  --palette-concorde-primary: #daad40;        /* Warm Gold — основной акцент */
  --palette-concorde-primary-dark: #b8922f;   /* Deep Gold — hover */
  --palette-concorde-bg: #FDF8F3;             /* Warm Cream — фон */
  --palette-concorde-bg-alt: #F5EBD9;         /* Champagne — карточки */
  --palette-concorde-text: #2C2416;           /* Espresso — текст */
  --palette-concorde-text-muted: #6B5D4B;     /* Taupe — вторичный текст */
  --palette-concorde-border: #E5D5C3;         /* Sand — границы */
  
  /* OKLCH equivalents */
  --palette-concorde-primary-oklch: oklch(0.76 0.14 75);
  --palette-concorde-bg-oklch: oklch(0.98 0.008 85);
}
```

**Font pairing**: Adobe Caslon Pro (serif) + Poppins (sans)  
**Best for**: Wedding catering, gala dinners, luxury events

---

### Palette 2: Radish — Clean Minimalism

```css
@theme {
  /* Минималистичная светлая палитра */
  --palette-radish-primary: #1A1A1A;          /* Near Black — текст/акценты */
  --palette-radish-secondary: #666666;        /* Gray — вторичный */
  --palette-radish-bg: #FFFFFF;               /* Pure White — фон */
  --palette-radish-bg-alt: #F8F8F8;           /* Off White — секции */
  --palette-radish-accent: #E8E8E8;           /* Light Gray — границы */
  --palette-radish-highlight: #FF4500;        /* Orange Red — редкий акцент */
  
  /* OKLCH equivalents */
  --palette-radish-primary-oklch: oklch(0.2 0 0);
  --palette-radish-bg-oklch: oklch(1 0 0);
}
```

**Font pairing**: Neutra2Text / Neutraface Display  
**Best for**: Modern corporate, tech events, minimalist brands  
**Nav style**: Transparent → solid on scroll

---

### Palette 3: Concept Catering — Bold Dark Theme

```css
@theme {
  /* Смелая тёмная тема с высоким контрастом */
  --palette-concept-bg: rgb(16, 16, 16);      /* Near Black — основной фон */
  --palette-concept-surface: rgb(28, 28, 28);  /* Dark Gray — поверхности */
  --palette-concept-text: #FFFFFF;            /* Pure White — текст */
  --palette-concept-text-muted: #A0A0A0;      /* Silver — приглушённый */
  --palette-concept-accent: #FFD700;          /* Gold — CTA/accent */
  --palette-concept-border: rgba(255,255,255,0.1); /* Subtle border */
  
  /* OKLCH equivalents */
  --palette-concept-bg-oklch: oklch(0.12 0 0);
  --palette-concept-accent-oklch: oklch(0.88 0.18 85);
}
```

**Font pairing**: Barlow Semi Condensed (headlines) + Inter (body)  
**Best for**: Bold modern brands, nightlife events, edgy catering  
**Hero style**: Dark Bold — near-black bg, high contrast white text

---

### Palette 4: Tall Guy & Grill — Terracotta Bold

```css
@theme {
  /* Современная палитра с терракотовым акцентом */
  --palette-tg-primary: #A72B2A;              /* Terracotta Red — CTA */
  --palette-tg-primary-hover: #8B2322;        /* Dark Terracotta */
  --palette-tg-bg: #FAFAFA;                   /* Near White — фон */
  --palette-tg-bg-dark: #1A1A1A;              /* Black — тёмные секции */
  --palette-tg-text: #222222;                 /* Almost Black — текст */
  --palette-tg-text-light: #F5F5F5;           /* Light Gray — текст на тёмном */
  --palette-tg-accent: #C4A35A;              /* Muted Gold — доп. акцент */
  
  /* OKLCH equivalents */
  --palette-tg-primary-oklch: oklch(0.48 0.22 25);
  --palette-tg-accent-oklch: oklch(0.75 0.10 75);
}
```

**Font pairing**: Steelfish / Tungsten (display) + Gotham / Montserrat (body)  
**Best for**: BBQ, grill, casual-chic catering, outdoor events  
**CTA style**: Bold, uppercase, slightly rounded corners

---

### Palette 5: Queen of Hearts — Royal Classic

```css
@theme {
  /* Классическая королевская палитра */
  --palette-qoh-primary: #0000EE;             /* Royal Blue — основной */
  --palette-qoh-primary-dark: #0000AA;        /* Deep Blue — hover */
  --palette-qoh-bg: #FEFEFE;                  /* Pure White — фон */
  --palette-qoh-bg-warm: #FDFBF7;             /* Warm White — альтернатива */
  --palette-qoh-text: #1A1A2E;                /* Navy Black — текст */
  --palette-qoh-gold: #D4AF37;               /* Metallic Gold — luxury accent */
  --palette-qoh-border: #E0E0E0;             /* Light Gray — границы */
  
  /* OKLCH equivalents */
  --palette-qoh-primary-oklch: oklch(0.56 0.23 260);
  --palette-qoh-gold-oklch: oklch(0.80 0.13 80);
}
```

**Font pairing**: Times New Roman / Playfair Display (serif dominant)  
**Best for**: Traditional weddings, royal-themed galas, classic elegance  
**Nav style**: Static horizontal with dropdown submenus

---

### Palette 6: GG Catering — Premium Luxury

```css
@theme {
  /* Премиальная палитра с фокусом на типографику */
  --palette-gg-black: #0D0D0D;               /* Rich Black — основной */
  --palette-gg-white: #FFFFFF;               /* Pure White — контраст */
  --palette-gg-cream: #FAF8F5;               /* Warm Cream — фон */
  --palette-gg-charcoal: #2D2D2D;            /* Charcoal — вторичный */
  --palette-gg-blush: #F5EDE8;               /* Blush — подсветки */
  --palette-gg-champagne: #E8DFD5;           /* Champagne — карточки */
  
  /* OKLCH equivalents */
  --palette-gg-black-oklch: oklch(0.12 0 0);
  --palette-gg-blush-oklch: oklch(0.94 0.01 80);
}
```

**Font pairing**: Inter (clean, versatile) + Rotating adjective carousel  
**Best for**: Premium corporate, high-end social events  
**Unique feature**: Adjective carousel in hero ("Exceptional" → "Extraordinary" → "Exquisite")

---

### Palette 7: Gamma Catering — Swiss Sophistication

```css
@theme {
  /* Швейцарская точность и утончённость */
  --palette-gamma-bg: #0A0A0A;               /* Deepest Black — иммерсивный */
  --palette-gamma-surface: #141414;           /* Elevated surface */
  --palette-gamma-text: #FFFFFF;             /* Pure White */
  --palette-gamma-text-dim: rgba(255,255,255,0.6); /* Dimmed text */
  --palette-gamma-accent: #C9A96E;           /* Refined Gold */
  --palette-gamma-accent-alt: #8B7355;       /* Bronze — secondary */
  --palette-gamma-line: rgba(255,255,255,0.08); /* Subtle dividers */
  
  /* OKLCH equivalents */
  --palette-gamma-bg-oklch: oklch(0.09 0 0);
  --palette-gamma-accent-oklch: oklch(0.74 0.10 75);
}
```

**Tech stack**: GSAP animations + Lenis smooth scroll + Splide carousel  
**Best for**: Ultra-premium, cinematic experiences, award-winning caterers  
**Animation style**: Orchestrated reveal sequences, parallax depth

---

## Hero Section Templates

> 5 типов hero-секций, обнаруженных при анализе 23 референсных сайтов.
> Каждый шаблон включает полный код реализации.

### Type 1: Classic Elegant (Queen of Hearts Style)

**Характеристики**: Serif-типографика, центрированный overlay, простой fade-in

```tsx
'use client';

import { useEffect, useState } from 'react';

export function HeroClassicElegant() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero-elegant.jpg)' }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content - Centered Overlay */}
      <div className={`relative z-10 text-center px-6 max-w-4xl mx-auto transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Overline */}
        <p className="font-[family:var(--font-body)] text-sm md:text-base tracking-[0.3em] uppercase text-white/80 mb-6">
          Est. 1985 • Award-Winning Cuisine
        </p>

        {/* Main Headline - Serif */}
        <h1 className="font-[family:'Times_New_Roman',_serif] text-5xl md:text-7xl lg:text-8xl font-normal text-white leading-[1.1] mb-8">
          Where Every Bite<br />
          <span className="italic">Tells a Story</span>
        </h1>

        {/* Subtitle */}
        <p className="font-[family:var(--font-body)] text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
          Crafting unforgettable culinary experiences for life's most cherished moments
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-10 py-4 bg-[#0000EE] text-white font-medium tracking-wide hover:bg-[#0000AA] transition-colors duration-300">
            Plan Your Event
          </button>
          <button className="px-10 py-4 border-2 border-white/40 text-white font-medium tracking-wide hover:bg-white/10 transition-all duration-300">
            View Our Work
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
```

**Key CSS classes for this type**:
```css
.hero-classic {
  font-family: 'Times New Roman', serif; /* или Playfair Display */
  text-align: center;
  animation: fadeInUp 1s ease-out forwards;
}

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
```

---

### Type 2: Full-Bleed Modern (Tall Guy & Grill Style)

**Характеристики**: Display-шрифт, full-viewport parallax изображение, bold CTA

```tsx
'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function HeroFullBleed() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-[#1A1A1A]">
      {/* Parallax Background Image */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(/images/hero-bold.jpg)',
          y,
        }}
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"
          style={{ opacity }}
        />
      </motion.div>

      {/* Content - Left Aligned, Bold Typography */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <motion.p 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-[#A72B2A] font-semibold tracking-[0.25em] uppercase text-sm mb-6"
            >
              Bold Flavors. Unforgettable Moments.
            </motion.p>

            {/* Headline - Compressed Display Font */}
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="font-['Steelfish',_'Tungsten',_sans-serif] text-7xl md:text-8xl lg:text-[10rem] font-normal leading-[0.9] text-white uppercase tracking-tight mb-8"
            >
              GRILL<br />PERFECTED
            </motion.h1>

            {/* Terracotta CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <button className="group relative px-12 py-5 bg-[#A72B2A] text-white font-bold text-lg uppercase tracking-wider overflow-hidden transition-colors hover:bg-[#8B2322]">
                <span className="relative z-10 flex items-center gap-3">
                  Get a Quote
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Side Stats Bar */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-8 pr-12">
        {[
          { value: '25+', label: 'Years' },
          { value: '10K', label: 'Events' },
          { value: '∞', label: 'Memories' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + i * 0.15, duration: 0.5 }}
            className="text-right"
          >
            <p className="font-['Steelfish'] text-4xl text-white">{stat.value}</p>
            <p className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

**Key CSS classes for this type**:
```css
.hero-fullbleed {
  font-family: 'Steelfish', 'Tungsten', sans-serif;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

.cta-terracotta {
  background-color: #A72B2A;
  border-radius: 4px; /* Slightly rounded, not pill */
  font-weight: 700;
}
```

---

### Type 3: Cinematic Luxury (Wolfgang Puck Style)

**Характеристики**: Большое изображение + tagline, split text animation, video option

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

export function HeroCinematic() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animation sequence
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Split text into words for staggered animation
  const headline = "Cinematic Culinary Artistry";
  const words = headline.split(' ');

  return (
    <section className="relative h-screen overflow-hidden bg-black">
      {/* Video Background (optional fallback to image) */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        poster="/images/hero-cinematic-poster.jpg"
      >
        <source src="/videos/hero-cinematic.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

      {/* Cinematic Bars (letterbox effect) */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-black" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-black" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 lg:px-20">
        <div className="max-w-5xl">
          {/* Tagline - Small, elegant */}
          <p className={`text-white/60 text-sm md:text-base tracking-[0.4em] uppercase mb-6 transition-all duration-700 delay-300 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Wolfgang Puck Catering
          </p>

          {/* Split Text Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white leading-[1.05] mb-8">
            {words.map((word, i) => (
              <span
                key={i}
                className={`inline-block mr-4 transition-all duration-500 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${400 + i * 80}ms` }}
              >
                {word}
              </span>
            ))}
          </h1>

          {/* Description */}
          <p className={`text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed mb-12 transition-all duration-700 delay-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            From Hollywood's biggest nights to your most intimate celebrations,<br />
            we bring extraordinary cuisine to every occasion.
          </p>

          {/* Dual CTAs */}
          <div className={`flex flex-wrap gap-4 transition-all duration-700 delay-1200 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <button className="px-10 py-4 bg-white text-black font-semibold tracking-wide hover:bg-white/90 transition-colors">
              Explore Our Services
            </button>
            <button className="px-10 py-4 border border-white/40 text-white font-medium tracking-wide hover:bg-white/10 transition-all flex items-center gap-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Watch Our Story
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-16 left-0 right-0 px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between text-white/40 text-xs tracking-wider uppercase">
          <span>Serving Los Angeles & Beyond</span>
          <span className="hidden md:block">Est. 1982 • James Beard Award Winner</span>
        </div>
      </div>
    </section>
  );
}
```

**Key CSS classes for this type**:
```css
.hero-cinematic {
  font-weight: 300; /* Light weight for elegance */
  letter-spacing: -0.01em;
}

/* Letterbox effect */
.cinematic-bars::before,
.cinematic-bars::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 64px;
  background: black;
  z-index: 5;
}

.cinematic-bars::before { top: 0; }
.cinematic-bars::after { bottom: 0; }
```

---

### Type 4: Video Marquee (Ridgewells/Relish Style)

**Характеристики**: Auto-playing video background, minimal overlay text

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';

export function HeroVideoMarquee() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Try autoplay
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setIsPlaying(true);
        setShowContent(true);
      }).catch(() => {
        // Autoplay blocked, show poster instead
        setShowContent(true);
      });
    }

    // Staggered content reveal
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="/images/hero-video-poster.jpg"
      >
        <source src="/videos/hero-marquee.mp4" type="video/mp4" />
        <source src="/videos/hero-marquee.webm" type="video/webm" />
      </video>

      {/* Subtle Overlay - lighter than other types */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

      {/* Minimal Content - Centered */}
      <div className={`relative z-10 h-full flex flex-col items-center justify-center text-center px-6 transition-all duration-1500 ease-out ${
        showContent ? 'opacity-100 scale-100' : 'opacity-90 scale-95'
      }`}>
        {/* Logo or Mark */}
        <div className={`mb-8 transition-all duration-1000 delay-300 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          <div className="w-16 h-16 border-2 border-white/80 rounded-full flex items-center justify-center">
            <span className="text-white font-serif text-2xl italic">R</span>
          </div>
        </div>

        {/* Single Line Headline */}
        <h1 className={`font-[family:var(--font-display)] text-5xl md:text-6xl lg:text-7xl text-white font-light leading-tight max-w-4xl transition-all duration-1000 delay-500 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          Extraordinary Catering for<br />
          <span className="italic">Life's Celebrations</span>
        </h1>

        {/* Thin Divider */}
        <div className={`w-24 h-px bg-white/40 my-10 transition-all duration-1000 delay-700 ${
          showContent ? 'opacity-100 scaleX-100' : 'opacity-0 scaleX-0'
        }`} />

        {/* Simple CTA */}
        <div className={`transition-all duration-1000 delay-900 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          <a 
            href="#contact" 
            className="inline-block px-10 py-4 border border-white/60 text-white font-medium tracking-widest uppercase text-sm hover:bg-white hover:text-black transition-all duration-300"
          >
            Begin Your Journey
          </a>
        </div>
      </div>

      {/* Play/Pause Control (subtle) */}
      <button
        onClick={() => {
          if (videoRef.current?.paused) {
            videoRef.current.play();
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }}
        className="absolute bottom-8 right-8 z-20 w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 transition-colors"
        aria-label={isPlaying ? 'Pause video' : 'Play video'}
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
    </section>
  );
}
```

**Key CSS classes for this type**:
```css
.hero-video-marquee {
  /* Keep overlay light - let video shine through */
  background-overlay: rgba(0, 0, 0, 0.25);
}

/* Smooth scaling on load */
.video-hero-content {
  transform-origin: center center;
  transition: opacity 1.5s ease-out, transform 1.5s ease-out;
}
```

---

### Type 5: Dark Bold (Concept Catering Style)

**Характеристики**: Near-black background, high contrast white text, geometric typography

```tsx
'use client';

import { useState, useEffect } from 'react';

export function HeroDarkBold() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen bg-[rgb(16,16,16)] overflow-hidden flex items-center">
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      />

      {/* Floating Accent Elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-white/[0.02] rounded-full blur-2xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Main Copy */}
          <div>
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-white/60 uppercase tracking-wider">Now Booking 2025 & 2026</span>
            </div>

            {/* Geometric Headline */}
            <h1 className="font-['Barlow_Semi_Condensed',sans-serif] text-6xl md:text-7xl lg:text-[5.5rem] font-semibold text-white leading-[0.95] uppercase tracking-tight mb-8">
              Concept<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500]">
                Catering
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-white/50 max-w-md leading-relaxed mb-10">
              Wir erschaffen gastronomische Erlebnisse, die Ihre Gäste bewegen. 
              Jedes Detail ist durchdacht, jeder Bissen ein Erlebnis.
            </p>

            {/* Bold CTAs */}
            <div className="flex flex-wrap gap-4">
              <button className="group relative px-8 py-4 bg-[#FFD700] text-black font-bold uppercase tracking-wider text-sm overflow-hidden transition-transform hover:scale-105 active:scale-95">
                <span className="relative z-10">Anfragen</span>
                <div className="absolute inset-0 bg-[#FFA500] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
              </button>
              <button className="px-8 py-4 border border-white/20 text-white font-semibold uppercase tracking-wider text-sm hover:border-white/50 hover:bg-white/5 transition-all">
                Portfolio
              </button>
            </div>
          </div>

          {/* Right Column - Visual Element */}
          <div className="relative hidden lg:block">
            {/* Framed Image with Offset Border Effect */}
            <div className="relative">
              {/* Offset Border */}
              <div className="absolute -top-4 -left-4 w-full h-full border border-[#FFD700]/30" />
              
              {/* Main Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                <img 
                  src="/images/hero-dark.jpg" 
                  alt="Concept Catering"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
                
                {/* Corner Accents */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-[#FFD700]" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-[#FFD700]" />
              </div>
            </div>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-8 -left-8 bg-[rgb(25,25,25)] border border-white/10 p-6 backdrop-blur-sm">
              <p className="font-['Barlow_Semi_Condensed'] text-4xl font-bold text-[#FFD700]">15+</p>
              <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Jahre Erfahrung</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Marquee */}
      <div className="absolute bottom-0 left-0 right-0 py-4 border-t border-white/5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {['EVENTS', '•', 'CORPORATE', '•', 'WEDDINGS', '•', 'GALAS', '•', 'PRIVATE DINING', '•'].map((item, i) => (
            <span key={i} className="mx-4 text-xs text-white/30 uppercase tracking-[0.3em]">{item}</span>
          ))}
          {['EVENTS', '•', 'CORPORATE', '•', 'WEDDINGS', '•', 'GALAS', '•', 'PRIVATE DINING', '•'].map((item, i) => (
            <span key={`dup-${i}`} className="mx-4 text-xs text-white/30 uppercase tracking-[0.3em]">{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**CSS Animation for marquee**:
```css
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 20s linear infinite;
}
```

---

## Navigation Patterns Found

> 5 паттернов навигации, обнаруженных при анализе 23 сайтов.

### Pattern 1: Static Horizontal (Queen of Hearts)
```tsx
<nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
  <div className="container mx-auto px-6">
    <div className="flex items-center justify-between h-20">
      {/* Logo */}
      <a href="/" className="font-serif text-2xl text-[#0000EE]">Queen of Hearts</a>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8">
        {['About', 'Services', 'Menus', 'Gallery', 'Contact'].map((item) => (
          <div key={item} className="relative group">
            <a href={`/${item.toLowerCase()}`} className="py-7 text-sm uppercase tracking-wider text-gray-700 hover:text-[#0000EE] transition-colors">
              {item}
            </a>
            {/* Dropdown submenu */}
            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="bg-white shadow-xl border border-gray-100 py-2 min-w-[200px]">
                <a href="#" className="block px-4 py-2 text-sm text-gray-600 hover:text-[#0000EE] hover:bg-blue-50">Submenu Item 1</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-600 hover:text-[#0000EE] hover:bg-blue-50">Submenu Item 2</a>
              </div>
            </div>
          </div>
        ))}
        
        {/* CTA in Nav */}
        <a href="/contact" className="ml-4 px-6 py-3 bg-[#0000EE] text-white text-sm font-medium hover:bg-[#0000AA] transition-colors">
          Get Quote
        </a>
      </div>
      
      {/* Mobile Hamburger */}
      <button className="md:hidden p-2" aria-label="Menu">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>
</nav>
```

### Pattern 2: Sticky with CTA (Concorde/Radish)
```tsx
'use client';

import { useState, useEffect } from 'react';

export function StickyNavWithCTA() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white shadow-lg py-3' 
        : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo - changes color based on scroll */}
        <a href="/" className={`font-serif text-2xl transition-colors ${isScrolled ? 'text-[#daad40]' : 'text-white'}`}>
          Concorde
        </a>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {['Services', 'Events', 'About', 'Contact'].map((link) => (
            <a 
              key={link} 
              href={`/${link.toLowerCase()}`}
              className={`text-sm font-medium tracking-wide uppercase transition-colors ${
                isScrolled ? 'text-gray-700 hover:text-[#daad40]' : 'text-white/90 hover:text-white'
              }`}
            >
              {link}
            </a>
          ))}
        </div>
        
        {/* Sticky CTA Button */}
        <a 
          href="/contact"
          className={`hidden md:inline-flex px-6 py-3 rounded-full font-semibold text-sm transition-all ${
            isScrolled 
              ? 'bg-[#daad40] text-white hover:bg-[#b8922f]' 
              : 'bg-white text-[#daad40] hover:bg-white/90'
          }`}
        >
          Book Now
        </a>
      </div>
    </nav>
  );
}
```

### Pattern 3: Mega Menu (Wolfgang Puck Style)
```tsx
'use client';

import { useState } from 'react';

export function MegaMenuNav() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const megaMenuData = {
    services: {
      title: 'Our Services',
      featured: '/images/mega-menu-services.jpg',
      links: [
        { category: 'Corporate Events', items: ['Board Meetings', 'Product Launches', 'Company Parties'] },
        { category: 'Social Events', items: ['Weddings', 'Birthday Galas', 'Anniversary Parties'] },
        { category: 'Specialized', items: ['Private Dinners', 'Film Production', 'VIP Experiences'] },
      ]
    },
    menus: {
      title: 'Explore Menus',
      featured: '/images/mega-menu-food.jpg',
      links: [
        { category: 'By Occasion', items: ['Wedding Menus', 'Corporate Menus', 'Holiday Feasts'] },
        { category: 'By Cuisine', items: ['American Classics', 'Asian Fusion', 'Mediterranean'] },
        { category: 'Dietary', items: ['Vegetarian', 'Gluten-Free', 'Kosher Options'] },
      ]
    }
  };

  return (
    <nav className="bg-black text-white relative z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <a href="/" className="font-display text-2xl">WP Catering</a>
          
          <div className="hidden lg:flex items-center gap-8">
            {Object.keys(megaMenuData).map((key) => (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => setActiveMenu(key)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className="py-7 text-sm uppercase tracking-wider text-white/80 hover:text-white transition-colors capitalize">
                  {key}
                </button>
                
                {/* Mega Menu Panel */}
                {activeMenu === key && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4">
                    <div className="bg-white text-gray-900 shadow-2xl rounded-lg w-[800px] overflow-hidden">
                      <div className="grid grid-cols-3">
                        {/* Featured Image */}
                        <div className="col-span-1">
                          <img 
                            src={megaMenuData[key as keyof typeof megaMenuData].featured} 
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Link Columns */}
                        <div className="col-span-2 p-8 grid grid-cols-3 gap-8">
                          {megaMenuData[key as keyof typeof megaMenuData].links.map((column) => (
                            <div key={column.category}>
                              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-black">
                                {column.category}
                              </h4>
                              <ul className="space-y-2">
                                {column.items.map((item) => (
                                  <li key={item}>
                                    <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                                      {item}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <a href="/contact" className="px-6 py-3 bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### Pattern 4: Hamburger + Overlay (67% of sites)
```tsx
'use client';

import { useState, useEffect } from 'react';

export function HamburgerOverlayNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleMenu = () => {
    if (isOpen) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsAnimating(false);
      }, 400);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-night/95 backdrop-blur-md">
        <div className="container mx-auto px-6 flex items-center justify-between h-18">
          <a href="/" className="font-display text-xl text-cream">Brand</a>
          
          {/* Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="relative w-10 h-10 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1.5">
              <span className={`block w-6 h-0.5 bg-cream transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-cream transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-cream transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </header>

      {/* Full Screen Overlay */}
      {(isOpen || isAnimating) && (
        <div className={`fixed inset-0 z-40 bg-night transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <nav className="h-full flex flex-col items-center justify-center gap-8">
            {['Home', 'About', 'Services', 'Gallery', 'Contact'].map((item, i) => (
              <a
                key={item}
                href={`/${item.toLowerCase()}`}
                className={`font-display text-4xl md:text-6xl text-cream hover:text-bordeaux transition-all duration-300 ${
                  isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: isOpen ? `${i * 100}ms` : '0ms' }}
                onClick={() => toggleMenu()}
              >
                {item}
              </a>
            ))}
            
            {/* Social Links */}
            <div className={`flex gap-6 mt-12 pt-12 border-t border-cream/10 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity delay-500`}>
              {['Instagram', 'Facebook', 'Pinterest'].map((social) => (
                <a key={social} href="#" className="text-cream/60 hover:text-cream text-sm uppercase tracking-wider">
                  {social}
                </a>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
```

---

## Signature Components

> Уникальные компоненты, обнаруженные при анализе 23 референсных сайтов.
> Каждый компонент готов к использованию в проекте.

### Component 1: Rotating Adjective Carousel (GG Catering)

Циклическая карусель позитивных брендовых прилагательных в hero-секции.

```tsx
'use client';

import { useState, useEffect } from 'react';

const adjectives = [
  { word: 'Exceptional', color: '#C9A96E' },
  { word: 'Extraordinary', color: '#8B7355' },
  { word: 'Exquisite', color: '#D4AF37' },
  { word: 'Elevated', color: '#A0855C' },
  { word: 'Enchanting', color: '#B8945F' },
];

export function RotatingAdjectiveCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % adjectives.length);
        setIsTransitioning(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const current = adjectives[currentIndex];

  return (
    <span 
      className="relative inline-block min-w-[280px] text-left"
      style={{ color: current.color }}
    >
      <span 
        className={`inline-block transition-all duration-500 ${
          isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
        }`}
        key={current.word}
      >
        {current.word}
      </span>
      
      {/* Decorative underline that follows color */}
      <span 
        className="absolute bottom-0 left-0 h-0.5 transition-all duration-500"
        style={{ 
          width: isTransitioning ? '0%' : '100%',
          backgroundColor: current.color 
        }}
      />
    </span>
  );
}

// Usage in hero:
// <h1>We Create <RotatingAdjectiveCarousel /> Experiences</h1>
```

**Variations**:
```tsx
// Fade variant (softer transition)
export function RotatingAdjectiveFade() {
  const [index, setIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % adjectives.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block">
      {adjectives.map((adj, i) => (
        <span
          key={adj.word}
          className="transition-opacity duration-700"
          style={{
            position: i === index ? 'relative' : 'absolute',
            opacity: i === index ? 1 : 0,
            color: adj.color,
          }}
        >
          {adj.word}
        </span>
      ))}
    </span>
  );
}
```

---

### Component 2: Dismissible Announcement Bar (Salt Block)

Закрываемая панель объявлений с localStorage для запоминания состояния.

```tsx
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AnnouncementBarProps {
  message: string;
  storageKey?: string; // Unique key for localStorage
  linkText?: string;
  linkHref?: string;
  expiryDays?: number; // Auto-show again after N days
}

export function DismissibleAnnouncementBar({
  message,
  storageKey = 'announcement-dismissed',
  linkText,
  linkHref,
  expiryDays = 7,
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if user dismissed within expiry period
    const dismissedAt = localStorage.getItem(storageKey);
    
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      const expiryMs = expiryDays * 24 * 60 * 60 * 1000;
      
      if (now - dismissedTime > expiryMs) {
        // Expired - show again
        localStorage.removeItem(storageKey);
        setIsVisible(true);
      }
      // Still valid - keep hidden
    } else {
      // Never dismissed - show
      setIsVisible(true);
    }
  }, [storageKey, expiryDays]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, Date.now().toString());
  };

  // Prevent flash of content
  if (!isMounted || !isVisible) return null;

  return (
    <div className="relative bg-night text-cream overflow-hidden">
      {/* Optional gradient shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      
      <div className="container mx-auto px-6 py-3 flex items-center justify-center gap-2 text-sm">
        <span className="text-center">
          {message}
          {linkText && linkHref && (
            <a 
              href={linkHref} 
              className="ml-2 underline underline-offset-4 hover:text-gold transition-colors font-medium"
            >
              {linkText} →
            </a>
          )}
        </span>
        
        <button
          onClick={handleDismiss}
          className="absolute right-4 p-1 text-cream/60 hover:text-cream transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Usage examples:
// <DismissibleAnnouncementBar 
//   message="Now Booking 2026 & 2027 Weddings" 
//   linkText="Secure Your Date"
//   linkHref="/contact"
//   storageKey="wedding-booking-2026"
// />
//
// <DismissibleAnnouncementBar 
//   message="🎉 New Summer Menu Available!" 
//   expiryDays={3} // Show again after 3 days
// />
```

**Styling options**:
```css
/* Variant: High-contrast alert */
.announcement-alert {
  @apply bg-bordeaux text-white font-semibold;
}

/* Variant: Subtle elegant */
.announcement-subtle {
  @apply bg-cream/10 text-cream/90 border-b border-cream/10;
}

/* Variant: Seasonal themed */
.announcement-seasonal {
  background: linear-gradient(90deg, #C9A96E 0%, #D4AF37 50%, #C9A96E 100%);
  color: #1A1614;
}
```

---

### Component 3: Dual Brand Pillar Headings (Salt Block)

Параллельный display двух брендовых столпов ("CHEF CRAFTED" + "FARM FRESH").

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface PillarHeadingProps {
  pillar1: string;
  pillar2: string;
  subtitle?: string;
  separator?: string;
  variant?: 'split' | 'stacked' | 'connected';
}

export function DualPillarHeadings({
  pillar1,
  pillar2,
  subtitle,
  separator = '&',
  variant = 'split',
}: PillarHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (variant === 'split') {
    return (
      <div ref={ref} className="grid md:grid-cols-[1fr_auto-1fr] gap-4 md:gap-8 items-end max-w-4xl">
        {/* Pillar 1 */}
        <div className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-normal leading-none tracking-tight">
            {pillar1.split(' ').map((word, i) => (
              <span key={i} className="block">{word}</span>
            ))}
          </h2>
        </div>

        {/* Separator */}
        <div className={`pb-2 text-bordeaux text-2xl md:text-3xl font-light transition-all duration-700 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {separator}
        </div>

        {/* Pillar 2 */}
        <div className={`transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-normal leading-none tracking-tight text-right">
            {pillar2.split(' ').map((word, i) => (
              <span key={i} className="block">{word}</span>
            ))}
          </h2>
        </div>

        {subtitle && (
          <p className={`md:col-span-3 mt-6 text-center text-muted transition-all duration-700 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'connected') {
    return (
      <div ref={ref} className="relative inline-block">
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-normal leading-none">
          <span className={`inline-block transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0 -translate-x-4'}`}>
            {pillar1}
          </span>
          <span className="text-bordeaux mx-3">/</span>
          <span className={`inline-block transition-all duration-700 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0 translate-x-4'}`}>
            {pillar2}
          </span>
        </h2>
        {subtitle && (
          <p className={`mt-4 text-muted transition-all duration-700 delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // stacked variant (default fallback)
  return (
    <div ref={ref} className="space-y-2">
      <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-normal leading-none">
        <span className={`block transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
          {pillar1}
        </span>
        <span className={`block text-bordeaux transition-all duration-700 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
          {separator} {pillar2}
        </span>
      </h2>
    </div>
  );
}

// Usage examples:
// <DualPillarHeadings 
//   pillar1="CHEF CRAFTED" 
//   pillar2="FARM FRESH" 
//   subtitle="Every dish tells a story of passion and provenance"
//   variant="split"
// />
//
// <DualPillarHeadings 
//   pillar1="ARTISTRY" 
//   pillar2="FLAVOR" 
//   separator="+"
//   variant="connected"
// />
```

---

### Component 4: Impact Stats Counter (Creative Edge)

Анимированный счётчик статистики ("30+" / "40,000+" / "5,000,000+").

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface StatCounterProps {
  value: number;
  suffix?: string; // '+', '%', etc.
  prefix?: string; // '$', etc.
  label: string;
  duration?: number; // ms
  decimals?: number;
}

function useCountUp(target: number, duration: number = 2000, isActive: boolean) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const animationFrame = useRef<number>();

  useEffect(() => {
    if (!isActive) return;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [target, duration, isActive]);

  return count;
}

export function StatCounter({ 
  value, 
  suffix = '', 
  prefix = '', 
  label, 
  duration = 2000,
  decimals = 0 
}: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const count = useCountUp(value, duration, isVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const formatNumber = (num: number) => {
    if (decimals > 0) return num.toFixed(decimals);
    return num.toLocaleString('en-US');
  };

  return (
    <div ref={ref} className="text-center group">
      {/* Number */}
      <div className="font-mono text-4xl md:text-5xl lg:text-6xl font-bold text-night dark:text-cream tabular-nums">
        <span className="text-bordeaux">{prefix}</span>
        {formatNumber(count)}
        <span className="text-bordeaux">{suffix}</span>
      </div>
      
      {/* Label */}
      <p className="mt-2 text-sm md:text-base text-muted uppercase tracking-wider font-medium">
        {label}
      </p>
    </div>
  );
}

// Combined stats section component
interface StatsSectionProps {
  stats: Array<{
    value: number;
    suffix?: string;
    prefix?: string;
    label: string;
  }>;
  title?: string;
}

export function ImpactStatsSection({ stats, title }: StatsSectionProps) {
  return (
    <section className="py-20 md:py-32 bg-cream dark:bg-espresso">
      <div className="container mx-auto px-6">
        {title && (
          <h2 className="text-center font-display text-h2 mb-16">{title}</h2>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <StatCounter key={i} {...stat} duration={2000 + i * 200} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Usage:
// <ImpactStatsSection
//   title="Our Impact"
//   stats={[
//     { value: 30, suffix: '+', label: 'Years Experience' },
//     { value: 40000, suffix: '+', label: 'Events Catered' },
//     { value: 5000000, suffix: '+', label: 'Meals Served' },
//     { value: 98, suffix: '%', label: 'Client Satisfaction' },
//   ]}
// />
```

**Visual variants**:
```tsx
// Compact horizontal bar variant
export function StatsBar({ stats }: StatsSectionProps) {
  return (
    <div className="flex flex-wrap justify-center gap-8 md:gap-16 py-8 border-y border-sand">
      {stats.map((stat, i) => (
        <div key={i} className="flex items-baseline gap-2">
          <StatCounter {...stat} duration={1500} />
          {i < stats.length - 1 && (
            <span className="text-sand hidden md:inline">|</span>
          )}
        </div>
      ))}
    </div>
  );
}

// Large hero stats variant (for about page hero)
export function HeroStats({ stats }: StatsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-sand">
      {stats.map((stat, i) => (
        <div key={i} className="py-8 md:py-12 px-6 text-center">
          <div className="font-mono text-6xl md:text-8xl font-bold text-bordeaux">
            {stat.prefix}{stat.value.toLocaleString()}{stat.suffix}
          </div>
          <p className="mt-4 text-overline tracking-widest text-muted">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### Component 5: Emotional Process Steps (Creative Edge)

Эмоциональные шаги процесса (01-DREAM → 02-BUILD → 03-SAVOR).

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface ProcessStep {
  number: string;
  verb: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const defaultSteps: ProcessStep[] = [
  {
    number: '01',
    verb: 'DREAM',
    title: 'Share Your Vision',
    description: 'Tell us about your perfect event. We listen, imagine, and begin crafting something extraordinary together.',
  },
  {
    number: '02',
    verb: 'BUILD',
    title: 'We Create Magic',
    description: 'Our culinary artists design custom menus, flawless presentations, and seamless service plans tailored to you.',
  },
  {
    number: '03',
    verb: 'SAVOR',
    title: 'Experience Excellence',
    description: 'Relax and enjoy while we bring your vision to life. Every detail perfected, every moment memorable.',
  },
];

interface EmotionalProcessStepsProps {
  steps?: ProcessStep[];
  title?: string;
  subtitle?: string;
  variant?: 'vertical' | 'horizontal' | 'timeline';
}

export function EmotionalProcessSteps({
  steps = defaultSteps,
  title = 'How We Work',
  subtitle = 'Your journey to an unforgettable event',
  variant = 'vertical',
}: EmotionalProcessStepsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visibleStep, setVisibleStep] = useState(-1);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = parseInt(entry.target.getAttribute('data-step') || '-1', 10);
            setVisibleStep((prev) => Math.max(prev, stepIndex));
          }
        });
      },
      { threshold: 0.3 }
    );

    const stepElements = ref.current?.querySelectorAll('[data-step]');
    stepElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  if (variant === 'horizontal') {
    return (
      <section className="py-20 md:py-32 bg-night text-cream">
        <div className="container mx-auto px-6">
          {/* Header */}
          <header className="text-center mb-16">
            <p className="text-overline tracking-widest text-bordeaux uppercase mb-4">The Journey</p>
            <h2 className="font-display text-h1">{title}</h2>
            <p className="mt-4 text-cream/60 max-w-2xl mx-auto">{subtitle}</p>
          </header>

          {/* Steps - Horizontal Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step, i) => (
              <div
                key={step.number}
                data-step={i}
                className={`relative p-8 lg:p-10 border transition-all duration-700 ${
                  visibleStep >= i
                    ? 'opacity-100 translate-y-0 border-bordeaux/30 bg-bordeaux/5'
                    : 'opacity-0 translate-y-8 border-cream/10'
                }`}
              >
                {/* Step Number */}
                <span className="font-mono text-5xl lg:text-6xl font-bold text-bordeaux/20">
                  {step.number}
                </span>
                
                {/* Verb */}
                <p className="mt-2 text-xs tracking-[0.3em] uppercase text-bordeaux font-semibold">
                  {step.verb}
                </p>
                
                {/* Title */}
                <h3 className="mt-4 font-display text-2xl lg:text-3xl">{step.title}</h3>
                
                {/* Description */}
                <p className="mt-4 text-cream/60 leading-relaxed">{step.description}</p>

                {/* Connector arrow (not on last item) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-bordeaux/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'timeline') {
    return (
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <header className="text-center mb-16">
            <h2 className="font-display text-h1">{title}</h2>
            <p className="mt-4 text-muted">{subtitle}</p>
          </header>

          {/* Timeline */}
          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-sdark" />
            
            {steps.map((step, i) => (
              <div
                key={step.number}
                data-step={i}
                className={`relative flex items-start gap-8 mb-12 last:mb-0 transition-all duration-700 ${
                  visibleStep >= i ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                } ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Dot */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-bordeaux border-4 border-cream dark:border-night z-10" />
                
                {/* Content */}
                <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                  <span className="font-mono text-sm text-bordeaux">{step.number}</span>
                  <p className="text-xs tracking-[0.2em] uppercase text-muted mt-1">{step.verb}</p>
                  <h3 className="font-display text-xl mt-2">{step.title}</h3>
                  <p className="text-muted mt-2 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default vertical variant
  return (
    <section className="py-20 md:py-32 bg-cream dark:bg-night">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left - Sticky header */}
          <div className="lg:sticky lg:top-32">
            <p className="text-overline tracking-widest text-bordeaux uppercase mb-4">Our Process</p>
            <h2 className="font-display text-h1 lg:text-display">{title}</h2>
            <p className="mt-6 text-muted text-lg leading-relaxed">{subtitle}</p>
          </div>

          {/* Right - Steps */}
          <div className="space-y-0">
            {steps.map((step, i) => (
              <div
                key={step.number}
                data-step={i}
                className={`relative pb-12 border-l-2 pl-8 transition-all duration-700 ${
                  visibleStep >= i
                    ? 'opacity-100 border-bordeaux'
                    : 'opacity-0 border-sand -translate-x-4'
                } ${i === steps.length - 1 ? 'pb-0' : ''}`}
              >
                {/* Dot on line */}
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-bordeaux" />
                
                {/* Number & Verb */}
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="font-mono text-2xl font-bold text-bordeaux/40">{step.number}</span>
                  <span className="text-xs tracking-[0.3em] uppercase text-bordeaux font-semibold">{step.verb}</span>
                </div>
                
                {/* Title */}
                <h3 className="font-display text-2xl mt-2">{step.title}</h3>
                
                {/* Description */}
                <p className="mt-3 text-muted leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Usage:
// <EmotionalProcessSteps 
//   variant="vertical" // or 'horizontal' or 'timeline'
//   title="Your Journey"
//   subtitle="Three simple steps to perfection"
// />
```

---

## Typography System

### Font Families

```css
@theme {
  /* === PRIMARY FONTS (from original 32 sites) === */
  
  /* Display font — headlines, hero text */
  --font-display: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
  
  /* Body font — UI, paragraphs */
  --font-body: 'Geist Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Mono font — stats, code, small labels */
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
  
  /* Accent font — optional decorative elements */
  --font-accent: 'Playfair Display Italic', 'Georgia Italic', serif;
  
  /* === ADDITIONAL FONTS (from 23 new sites) === */
  
  /* Bold compressed display fonts (Tall Guy & Grill style) */
  --font-compressed: 'Steelfish', 'Tungsten', 'Oswald', sans-serif;
  
  /* Modern geometric font (Concept Catering) */
  --font-geometric: 'Barlow Semi Condensed', 'Barlow', sans-serif;
  
  /* Elegant serif (Concorde Catering) */
  --font-elegant-serif: 'Adobe Caslon Pro', 'Caslon', 'Garamond', serif;
  
  /* Distinctive sans-serif (Radish) */
  --font-distinctive: 'Neutraface', 'Neutra2Text', 'Futura', sans-serif;
  
  /* Clean premium (GG Catering) */
  --font-premium: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Classic royal (Queen of Hearts) */
  --font-classic: 'Times New Roman', 'Times', serif;
}
```

### Google Fonts Import

```html
<!-- Add to layout.tsx <head> or global CSS -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet" />

<!-- For self-hosted/commercial fonts (Steelfish, Adobe Caslon Pro, Neutraface) -->
<!-- Use @font-face with proper licensing -->
```

### Type Scale (Modular Scale 1.25)

```css
@theme {
  /* Display — hero headlines */
  --text-display-lg: clamp(3.5rem, 8vw + 1rem, 8rem);      /* 56-128px */
  --text-display: clamp(2.5rem, 5vw + 0.5rem, 5rem);        /* 40-80px */
  --text-display-sm: clamp(2rem, 4vw + 0.5rem, 3.5rem);     /* 32-56px */
  
  /* Headings */
  --text-h1: clamp(2rem, 3vw + 0.5rem, 3rem);               /* 32-48px */
  --text-h2: clamp(1.75rem, 2.5vw + 0.25rem, 2.5rem);       /* 28-40px */
  --text-h3: clamp(1.5rem, 2vw + 0.25rem, 2rem);             /* 24-32px */
  --text-h4: clamp(1.25rem, 1.5vw + 0.25rem, 1.5rem);        /* 20-24px */
  
  /* Body */
  --text-body-lg: 1.125rem;                                    /* 18px */
  --text-body: 1rem;                                           /* 16px */
  --text-body-sm: 0.875rem;                                    /* 14px */
  
  /* Labels & Captions */
  --text-label: 0.75rem;                                       /* 12px */
  --text-caption: 0.6875rem;                                   /* 11px */
  --text-overline: 0.625rem uppercase;                          /* 10px */
}

/* Line heights */
--leading-tight: 1.1;
--leading-snug: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;

/* Letter spacing */
--tracking-tighter: -0.03em;
--tracking-tight: -0.015em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;
```

### Typography Patterns

```tsx
// Hero headline (Wolfgang Puck style)
<h1 className='
  font-[family:var(--font-display)]
  text-[var(--text-display)]
  leading-[var(--leading-tight)]
  tracking-[var(--tracking-tighter)]
  uppercase
'>
  Setting The Standard For<br />Culinary Excellence
</h1>

// Section heading (Ridgewells style)
<h2 className='
  font-[family:var(--font-display)]
  text-[var(--text-h2)]
  leading-[var(--leading-snug)]
'>
  Our <span className='italic text-bordeaux'>Services</span>
</h2>

// Body copy
<p className='
  font-[family:var(--font-body)]
  text-[var(--text-body)]
  leading-[var(--leading-normal)]
  text-night/70 dark:text-cream/80
'>
  Premium catering content...
</p>

// Stats number (Pinch style)
<span className='
  font-[family:var(--font-mono)]
  text-[var(--text-display)]
  tabular-nums
'>
  2400+
</span>

// Label/Caption
<span className='
  font-[family:var(--font-body)]
  text-[var(--text-overline)]
  tracking-[var(--tracking-widest)]
  uppercase
  text-muted
'>
  Since 2014
</span>

// Bold compressed headline (Tall Guy style)
<h1 className='
  font-[family:var(--font-compressed)]
  text-[var(--text-display-lg)]
  uppercase
  tracking-tight
'>
  GRILL PERFECTED
</h1>

// Geometric modern heading (Concept Catering style)
<h2 className='
  font-[family:var(--font-geometric)]
  font-semibold
  uppercase
  tracking-tight
'>
  Concept Catering
</h2>
```

## Spacing System (8px Grid)

```css
@theme {
  /* Base unit: 4px (quarter of 8px grid) */
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  --spacing-20: 5rem;     /* 80px */
  --spacing-24: 6rem;     /* 96px */
  --spacing-32: 8rem;     /* 128px */
  --spacing-40: 10rem;    /* 160px */
  --spacing-48: 12rem;    /* 192px */
  --spacing-64: 16rem;    /* 256px */
}

/* Section padding */
--section-padding-y: var(--spacing-20);   /* Mobile */
--section-padding-y-md: var(--spacing-32); /* Tablet */
--section-padding-y-lg: var(--spacing-48); /* Desktop */

/* Container */
--container-max: 80rem;                    /* 1280px */
--container-padding: var(--spacing-4);     /* Mobile */
--container-padding-md: var(--spacing-6);  /* Tablet+ */
```

## Border & Radius

```css
@theme {
  /* Border radius */
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px */
  --radius-default: 0.5rem; /* 8px */
  --radius-md: 0.75rem;     /* 12px */
  --radius-lg: 1rem;        /* 16px */
  --radius-xl: 1.5rem;      /* 24px */
  --radius-2xl: 2rem;       /* 32px */
  --radius-full: 9999px;    /* Pill/circle */
  
  /* Borders */
  --border-thin: 1px;
  --border-default: 1.5px;
  --border-thick: 2px;
  
  /* Border styles */
  --border-color: var(--color-sand);
  --border-color-dark: rgba(255, 255, 255, 0.1);
}
```

## Shadow System

```css
@theme {
  /* Elevation shadows */
  --shadow-sm: 
    0 1px 2px oklch(0.15 0.02 260 / 0.05),
    0 1px 3px oklch(0.15 0.02 260 / 0.1);
    
  --shadow-default:
    0 4px 6px -1px oklch(0.15 0.02 260 / 0.07),
    0 2px 4px -2px oklch(0.15 0.02 260 / 0.05);
    
  --shadow-md:
    0 10px 15px -3px oklch(0.15 0.02 260 / 0.08),
    0 4px 6px -4px oklch(0.15 0.02 260 / 0.05);
    
  --shadow-lg:
    0 20px 25px -5px oklch(0.15 0.02 260 / 0.1),
    0 8px 10px -6px oklch(0.15 0.02 260 / 0.05);
    
  --shadow-xl:
    0 25px 50px -12px oklch(0.15 0.02 260 / 0.2);
    
  /* Colored shadows for special effects */
  --shadow-bordeaux:
    0 20px 40px -10px oklch(0.55 0.22 15 / 0.3);
    
  --shadow-gold:
    0 20px 40px -10px oklch(0.78 0.12 75 / 0.25);
    
  /* Glow effects */
  --glow-bordeaux:
    0 0 40px oklch(0.55 0.22 15 / 0.4);
    
  --glow-gold:
    0 0 40px oklch(0.78 0.12 75 / 0.35);
}
```

## Component Patterns

### Buttons

```tsx
// Primary CTA (Bordeaux)
<Button className='
  bg-bordeaux 
  text-white 
  px-8 py-4 
  rounded-full
  font-semibold
  tracking-wide
  hover:bg-bordeaux-dark
  hover:shadow-bordeaux
  transition-all duration-300
'>
  Рассчитать стоимость
</Button>

// Secondary (Outline)
<Button variant='outline' className='
  border-2 border-current
  px-8 py-4 rounded-full
  hover:bg-white hover:text-night
  transition-all duration-300
'>
  Смотреть портфолио
</Button>

// Ghost (Subtle)
<Button variant='ghost' className='
  text-muted
  hover:text-foreground
  hover:bg-foreground/5
'>
  Подробнее →
</Button>

// Luxury Gold variant
<Button className='
  bg-gradient-to-r from-gold to-gold-light
  text-night
  px-8 py-4 rounded-full
  font-semibold
  shadow-gold
  hover:shadow-lg
'>
  Забронировать дату
</Button>

// Terracotta Bold variant (Tall Guy style)
<Button className='
  bg-[#A72B2A]
  text-white
  px-10 py-5
  rounded
  font-bold
  uppercase
  tracking-wider
  hover:bg-[#8B2322]
  transition-colors
'>
  Get a Quote
</Button>

// Gold CTA (Concept Catering style)
<Button className='
  bg-[#FFD700]
  text-black
  px-8 py-4
  font-bold
  uppercase
  tracking-wider
  hover:bg-[#FFA500]
  hover:scale-105
  active:scale-95
  transition-all
'>
  Anfragen
</Button>
```

### Cards

```tsx
// Service card (elevated)
<Card className='
  group relative overflow-hidden
  bg-card rounded-2xl p-6
  shadow-default
  hover:shadow-xl
  hover:-translate-y-1
  transition-all duration-500
'>
  {/* Hover glow effect */}
  <div className='
    absolute inset-0 opacity-0 group-hover:opacity-100
    bg-gradient-to-br from-bordeaux/5 to-transparent
    transition-opacity duration-500
  ' />
  
  <CardHeader>
    <div className='w-12 h-12 rounded-xl bg-bordeaux/10 flex items-center justify-center mb-4'>
      <Icon className='w-6 h-6 text-bordeaux' />
    </div>
    <CardTitle className='text-xl'>Банкетное обслуживание</CardTitle>
  </CardHeader>
  
  <CardContent>
    <p className='text-muted text-sm'>
      Полный цикл обслуживания от разработки меню до уборки зала
    </p>
  </CardContent>
</Card>

// Gallery card with overlay
<div className='group relative aspect-[4/3] overflow-hidden rounded-2xl'>
  <SmartImage
    src={imageSrc}
    alt={alt}
    fill
    className='object-cover transition-transform duration-700 group-hover:scale-110'
  />
  
  {/* Overlay on hover */}
  <div className='
    absolute inset-0 bg-gradient-to-t from-night/90 via-night/40 to-transparent
    opacity-0 group-hover:opacity-100
    transition-opacity duration-300
    flex items-end p-6
  '>
    <p className='text-white font-medium'>{title}</p>
  </div>
</div>
```

### Form Elements

```tsx
// Floating label input
<div className='relative'>
  <Input
    id='name'
    placeholder=' '
    className='
      peer w-full pt-6 pb-2
      border-b-2 border-sand
      bg-transparent
      focus:border-bordeaux
      transition-colors
    '
  />
  <label
    htmlFor='name'
    className='
      absolute left-0 top-4
      text-muted
      peer-focus:top-1 peer-focus:text-xs peer-focus:text-bordeaux
      peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs
      transition-all duration-200
    '
  >
    Ваше имя
  </label>
</div>
```

## Layout Patterns

### Section Structure

```tsx
// Standard section wrapper
<section className='relative py-20 md:py-32 lg:py-40'>
  <div className='container mx-auto max-w-container px-4 md:px-6'>
    {/* Optional section header */}
    {header && (
      <header className='mb-12 md:mb-16 lg:mb-20 text-center max-w-3xl mx-auto'>
        <Overline>{overline}</Overline>
        <h2 className='mt-4'>{title}</h2>
        {subtitle && <p className='mt-4 text-muted'>{subtitle}</p>}
      </header>
    )}
    
    {children}
  </div>
</section>

// Full-width section (no container)
<section className='relative w-full overflow-hidden'>
  {children}
</section>

// Alternating content sections (About style)
<section className='grid min-h-screen lg:grid-cols-2'>
  <div className='flex items-center justify-center p-8 lg:p-16'>
    {/* Content */}
  </div>
  <div className='relative h-[50vh] lg:h-auto order-first lg:order-last'>
    {/* Image */}
  </div>
</section>
```

### Grid Systems

```css
/* Default content grid */
.grid-content {
  display: grid;
  gap: var(--spacing-6);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .grid-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-content {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Services grid (4 columns) */
.grid-services {
  display: grid;
  gap: var(--spacing-6);
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 768px) {
  .grid-services {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .grid-services {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Gallery masonry-like */
.grid-gallery {
  columns: 1;
  column-gap: var(--spacing-4);
}

@media (min-width: 768px) {
  .grid-gallery {
    columns: 2;
  }
}

@media (min-width: 1024px) {
  .grid-gallery {
    columns: 3;
  }
}

.grid-gallery > * {
  break-inside: avoid;
  margin-bottom: var(--spacing-4);
}
```

## Responsive Breakpoints

```css
/* Tailwind v4 default breakpoints */
/* sm: 640px — Large phones */
/* md: 768px — Tablets */
/* lg: 1024px — Small laptops */
/* xl: 1280px — Desktops */
/* 2xl: 1536px — Large screens */

/* Custom utility classes for responsive visibility */
.mobile-only { display: block; }
.tablet-up { display: none; }

@media (min-width: 768px) {
  .mobile-only { display: none; }
  .tablet-up { display: block; }
  .desktop-up { display: none; }
}

@media (min-width: 1024px) {
  .tablet-only { display: none; }
  .desktop-up { display: block; }
}
```

## Iconography

```tsx
// Using Lucide icons (already in project)
import { 
  // Navigation & Actions
  Menu, X, ArrowRight, ArrowLeft, ChevronDown, ChevronUp,
  ExternalLink, Phone, Mail, MapPin, Clock,
  
  // Social
  Instagram, Facebook, Youtube, Linkedin, Send,
  
  // Content
  Star, Heart, Check, Plus, Minus, Search,
  Calendar, Users, UtensilsCrossed, ChefHat,
  
  // Status
  CheckCircle, AlertCircle, Info, Loader2,
} from 'lucide-react';

// Icon sizes
const iconSizes = {
  xs: 16,
  sm: 18,
  default: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};

// Usage pattern
<Icon 
  className='w-6 h-6 text-bordeau' 
  strokeWidth={1.5} // Thinner lines for elegance
/>
```

## Accessibility Notes

1. **Contrast ratios**: All text must pass WCAG AA (4.5:1 normal, 3:1 large)
2. **Focus indicators**: Visible focus rings on all interactive elements
3. **Reduced motion**: Respect `prefers-reduced-motion`
4. **Touch targets**: Minimum 44x44px on mobile
5. **Color independence**: Don't rely solely on color to convey information

## References

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [OKLCH Color Space](https://oklch.com/)
- [Material Design 3](https://m3.material.io/)
- [GSAP Animations](https://gsap.com/) — Used by Gamma Catering
- [Lenis Smooth Scroll](https://lenis.studiofreight.com/) — Premium scroll experience
- [Splide Carousel](https://splidejs.com/) — Lightweight carousel library
