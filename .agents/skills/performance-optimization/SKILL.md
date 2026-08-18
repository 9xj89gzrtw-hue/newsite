# Performance Optimization Skill

> Оптимизация производительности сайта кейтеринговой компании для максимальной скорости загрузки и плавности взаимодействия.

## Когда использовать

- При добавлении новых изображений/видео
- При интеграции тяжёлых библиотек (GSAP, Motion, Mux)
- При работе с анимациями и скроллом
- Перед деплоем — финальный performance audit
- При получении плохих Core Web Vitals метрик

## Target Metrics (Core Web Vitals)

| Metric | Target | Threshold |
|--------|--------|-----------|
| LCP (Largest Contentful Paint) | < 2.0s | < 2.5s |
| INP (Interaction to Next Paint) | < 100ms | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.05 | < 0.1 |
| TTFB (Time to First Byte) | < 400ms | < 800ms |

## Image Optimization Strategy

### SmartImage Component Usage

```tsx
// ✅ Оптимально — все параметры заданы
<SmartImage
  src="/media/banquet-1.jpg"
  alt="Банкетное обслуживание"
  width={1344}        // Явные размеры предотвращают CLS
  height={768}
  priority            // Для above-the-fold изображений
  placeholder="blur"  // Blur placeholder для perceived performance
  blurDataURL={blurHash} // Генерируется при build
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  quality={85}        // Баланс качества/размера
/>

// ❌ Плохо — нет размеров = layout shift
<SmartImage src="/media/photo.jpg" alt="photo" />
```

### Image Formats Priority

1. **AVIF** — лучший compression (25-50% меньше WebP)
2. **WebP** — fallback для старых браузеров
3. **JPEG/PNG** — final fallback

```tsx
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};
```

### Responsive Images

```tsx
// Мультипльные srcset для разных viewport'ов
<picture>
  <source
    media="(max-width: 768px)"
    srcSet="/media/hero-mobile.avif 768w"
    type="image/avif"
  />
  <source
    media="(min-width: 769px)"
    srcSet="/media/hero-desktop.avif 1344w"
    type="image/avif"
  />
  <SmartImage
    src="/media/hero-desktop.jpg"
    alt="Премиальный кейтеринг"
    fill
    className="object-cover"
  />
</picture>
```

## Video Optimization

### Mux Player Configuration

```tsx
// Оптимальные настройки Mux плеера
<MuxPlayer
  playbackId={playbackId}
  autoplay
  muted
  loop
  playbackRate={1}          // Без ускорения
  thumbnailTime={0}         // Постер из первого кадра
  metadata={{
    video_title: 'Hero Background',
    player_name: 'Catering Site',
  }}
  style={{ aspectRatio: '16/9' }}
  // Ленивая инициализация
  loading="lazy"
/>
```

### Video Best Practices

1. **Autoplay только muted** — иначе браузеры блокируют
2. **Poster image обязателен** — показывать пока видео грузится
3. **Preload="none"** для below-fold видео
4. **Статический fallback** — если Mux недоступен, показать Ken Burns на изображении

## Animation Performance

### Motion/Framer Motion Optimization

```tsx
// ✅ GPU-accelerated свойства только
<motion.div
  animate={{ x: 100, opacity: 1, scale: 1.1 }}  // transform + opacity
  transition={{ duration: 0.5, ease: 'easeOut' }}
  willChange="transform, opacity"                   // Подсказка браузеру
/>

// ❌ Триггерит layout
<motion.div
  animate={{ top: 100, width: 500 }}  // layout properties!
/>

// Use Reduced Motion
const prefersReducedMotion = useReducedMotion();
if (prefersReducedMotion) return <StaticContent />;
```

### GSAP ScrollTrigger Optimization

```tsx
// Динамический импорт — не блокировать initial load
import { gsap } from '@/lib/gsap'; // Обёртка с dynamic import

// ScrollTrigger с will-change
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.to(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
    });
  });

  return () => ctx.revert(); // Cleanup!
}, []);
```

### Lenis Smooth Scroll Tuning

```tsx
// lenis-provider.tsx — оптимизированная конфигурация
import Lenis from 'lenis';

const lenis = new Lenis({
  duration: 1.2,       // Плавность скролла
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
  touchMultiplier: 2,  // Мобильная чувствительность
});

// RAF loop оптимизация
function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
```

## Code Splitting & Lazy Loading

### Dynamic Imports

```tsx
// Тяжёлые компоненты — динамический импорт
const VideoPlayer = dynamic(() => import('@/components/media/video-player'), {
  ssr: false,
  loading: () => <VideoSkeleton />,
});

const EventsGallery = dynamic(() => import('@/components/catering/events-gallery'), {
  loading: () => <GallerySkeleton />,
});

const Calculator = dynamic(() => import('@/components/catering/calculator'), {
  ssr: false, // Использует browser APIs
});
```

### Route-Based Code Splitting

```tsx
// app/page.tsx — Suspense boundaries
<Suspense fallback={<HeroSkeleton />}>
  <Hero />
</Suspense>

<Suspense fallback={<GallerySkeleton />}>
  <EventsGallery />
</Suspense>

<Suspense fallback={<CalculatorSkeleton />}>
  <Calculator />
</Suspense>
```

## Font Loading Strategy

```tsx
// layout.tsx — оптимальная загрузка шрифтов
import { Playfair_Display, Geist_Sans } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',     // Prevent FOIT
  variable: '--font-playfair',
  preload: true,       // Above-the-fold шрифт
});

const geistSans = Geist_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

// CSS
font-display: swap; // Для self-hosted шрифтов в public/fonts/
```

## CSS Optimization

### Tailwind v4 Best Practices

```css
/* globals.css — критические стили inlined */
@theme {
  /* OKLCH tokens — минифицированные */
  --color-cream: oklch(0.98 0.005 90);
  --color-night: oklch(0.15 0.02 260);
}

/* Удалить неиспользуемые стили */
/* Tailwind v4 автоматически tree-shakes unused classes */

/* Critical CSS — inline в <head> */
@layer base {
  /* Только critical path styles */
}
```

### Avoid Expensive Patterns

```css
/* ❌ Дорого — box-shadow blur large area */
.box {
  box-shadow: 0 0 100px rgba(0, 0, 0, 0.3);
}

/* ✅ Дешевле — spread shadow */
.box {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* ❌ Дорого — gradient backgrounds animating */
.bg-animated {
  background: linear-gradient(45deg, ...);
  animation: bg-shift 5s linear infinite;
}

/* ✅ Альтернатива — opacity toggle on pseudo-element */
```

## Bundle Size Monitoring

### Analyze Bundle

```bash
# Next.js built-in analyzer
ANALYZE=true bun run build

# Или
bun run build -- --analyze
```

### Target Budgets

| Category | Budget |
|----------|--------|
| Total JS (initial) | < 150KB gzipped |
| First-party JS | < 100KB gzipped |
| Third-party JS | < 50KB gzipped |
| Total CSS | < 50KB gzipped |
| Fonts (per font) | < 30KB gzipped |

## Preloading Critical Resources

```tsx
// layout.tsx или page.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/Playfair-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Preconnect to external origins */}
        <link rel="preconnect" href="https://mux.com" />
        <link rel="dns-prefetch" href="https://mux.com" />
        
        {/* Preload hero image */}
        <link
          rel="preload"
          as="image"
          href="/media/hero-premium.avif"
          type="image/avif"
        />
      </head>
      <body className={...}>{children}</body>
    </html>
  );
}
```

## Caching Strategy

### Static Assets (vercel.json)

```json
{
  "headers": [
    {
      "source": "/media/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/fonts/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, s-maxage=3600, stale-while-revalidate=86400" }
      ]
    }
  ]
}
```

## Performance Audit Checklist

### Before Deploy
- [ ] Lighthouse score ≥ 90 (Performance)
- [ ] LCP < 2.5s (Lighthouse + CrUX data)
- [ ] CLS < 0.1 (no layout shifts)
- [ ] No render-blocking resources
- [ ] Images optimized (AVIF/WebP, responsive)
- [ ] Fonts loaded with `display: swap`
- [ ] Third-party scripts lazy-loaded
- [ ] Bundle size within budget

### Regression Testing
- [ ] Сравнить с предыдущим деплоем
- [ ] Core Web Vitals не ухудшились
- [ ] New features don't add significant bundle weight

## Tools

### CLI Tools
```bash
# Lighthouse CI
npx lighthouse http://localhost:3000 --output html --output-path ./report.html

# WebPageTest
# https://www.webpagetest.org/

# Bundle analyzer
npx @next/bundle-analyzer
```

### Browser DevTools
- **Performance tab** — timeline, flame chart
- **Network panel** — waterfall, resource size
- **Rendering** — paint metrics, layer borders
- **Coverage** — unused CSS/JS

## Project-Specific Notes

Для кейтеринг-сайта:
1. **Hero section** — критична для LCP, preload hero image
2. **Gallery** — lazy load images below fold, use Intersection Observer
3. **Video** — Mux with poster fallback, don't autoplay on mobile data
4. **Animations** — respect `prefers-reduced-motion`, GPU-only properties
5. **Calculator** — instant interaction response (< 100ms INP)

## References

- [Web.dev Performance](https://web.dev/performance/)
- [Next.js Documentation - Optimizing](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Core Web Vitals](https://web.dev/vitals/)
