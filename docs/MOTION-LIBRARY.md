# MOTION-LIBRARY.md — Библиотека Анимаций

> Полная библиотека готовых анимаций для премиального кейтеринг-сайта.
> Извлечена из анализа top-32 мировых кейтеринг-брендов.

## 🎬 Каталог анимаций

### 1. Hero Animations (Cinematic Entrance)

**Источник:** Wolfgang Puck, Pinch Food Design

| Эффект | Компонент | Описание |
|--------|-----------|----------|
| Parallax hero | `HeroCinematic` | Многослойный параллакс при скролле |
| Letter reveal | `AnimatedText` | Посимвольное появление текста |
| Opacity fade | `HeroCinematic` | Плавное исчезновение при скролле |
| Scale effect | `HeroCinematic` | Лёгкий scale-down при скролле |

```tsx
import { HeroCinematic, AnimatedText } from '@/components/motion/hero-cinematic';

<HeroCinematic>
  <AnimatedText text="Премиальный кейтеринг в СПб" />
</HeroCinematic>
```

---

### 2. Button Interactions

**Источник:** Pinch ("Book Now"), M Culinary

| Эффект | Компонент | Описание |
|--------|-----------|----------|
| Magnetic pull | `MagneticButton` | Кнопка следует за курсором |
| Glow on hover | `MagneticButton` | Свечение при наведении |
| Scale on tap | `MagneticButton` | Уменьшение при нажатии |

```tsx
import { MagneticButton } from '@/components/motion/magnetic-button';

<MagneticButton strength={40}>
  Рассчитать стоимость
</MagneticButton>
```

**Настройки:**
- `strength`: сила притяжения (default: 40)
- Увеличить для более драматичного эффекта

---

### 3. Scroll-Triggered Reveals

**Источник:** Все премиум-сайты

| Вариант | Класс | Направление |
|---------|-------|-------------|
| Fade up | `ScrollReveal variant="fade-up"` | Снизу вверх ↑ |
| Fade down | `ScrollReveal variant="fade-down"` | Сверху вниз ↓ |
| Fade left | `ScrollReveal variant="fade-left"` | Слева → |
| Fade right | `ScrollReveal variant="fade-right"` | Справа ← |
| Scale up | `ScrollReveal variant="scale-up"` | Из центра ⊙ |
| Blur in | `ScrollReveal variant="blur-in"` | С размытия |

```tsx
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/motion/scroll-reveal';

// Одиночный элемент
<ScrollReveal variant='fade-up' delay={0.2}>
  <Content />
</ScrollReveal>

// Группа с stagger эффектом
<StaggerContainer staggerDelay={0.1}>
  <StaggerItem><Card 1 /></StaggerItem>
  <StaggerItem><Card 2 /></StaggerItem>
  <StaggerItem><Card 3 /></StaggerItem>
</StaggerContainer>
```

**Props:**
- `delay`: задержка перед стартом (сек)
- `duration`: длительность (сек)
- `once`: анимировать только один раз (default: true)
- `threshold`: процент видимости для триггера (0-1)

---

### 4. Parallax Effects

**Источник:** M Culinary, Ridgewells

| Эффект | Компонент | Скорость |
|--------|-----------|----------|
| Single layer | `ParallaxLayer` | Настраиваемая |
| Multi-layer | `ParallaxSection` | На слой |

```tsx
import { ParallaxLayer, ParallaxSection } from '@/components/motion/parallax-layers';

// Один параллакс-слой
<ParallaxLayer speed={0.5} direction='up'>
  <Image src='/bg.jpg' alt='' fill className='object-cover' />
</ParallaxLayer>

// Многослойная секция
<ParallaxSection
  layers={[
    { component: <BgImage />, speed: 0.3 },
    { component: <MidImage />, speed: 0.5 },
    { component: <FgContent />, speed: 0 },
  ]}
/>
```

**Скорость (speed):**
- `0` — статичный (скроллится нормально)
- `0.3` — медленный (фон)
- `0.5` — средний
- `1.0` — нормальный
- `>1` — ускоренный

---

### 5. Counters & Stats

**Источник:** Pinch Food Design (Live Stats)

```tsx
import { AnimatedCounter, AnimatedStats } from '@/components/motion/animated-counter';

// Одиночный счётчик
<AnimatedCounter
  target={2400}
  suffix='+'
  label='Мероприятий'
/>

// Группа статистики
<AnimatedStats stats={[
  { value: 16, suffix: '+', label: 'Лет опыта' },
  { value: 2400, suffix: '+', label: 'Мероприятий' },
  { value: 50000, suffix: '+', label: 'Гостей' },
  { value: 98, suffix: '%', label: 'Довольных' },
]} />
```

**Настройки:**
- `duration`: длительность анимации мс (default: 2000)
- `prefix`/`suffix`: префикс/суффикс
- `decimals`: количество знаков после запятой

---

### 6. Custom Cursor

**Источник:** Premium trend (avant-garde сайты)

```tsx
import { CustomCursor } from '@/components/motion/custom-cursor';

// Добавить в layout.tsx
<CustomCursor />

// Использовать data-атрибуты для спецэффектов:
<button data-cursor='pointer'>  {/* Увеличенный курсор */}
<div data-cursor='hover'>      {/* Расширяющееся кольцо */}</div>
```

**Особенности:**
- Два элемента: точка + trailing ring
- Автоматическое увеличение на ссылках/кнопках
- Mix-blend-difference для контраста на любом фоне
- Только на desktop (pointer: fine)

---

### 7. Page Transitions

```tsx
import { PageTransition, TransitionLayout } from '@/components/motion/page-transition';

// Обернуть контент
<TransitionLayout>
  {children}
</TransitionLayout>
```

**Эффект:**
- Fade + slide при переходах
- Anticipate easing для плавности
- Работает с Next.js App Router

---

### 8. Text Scramble Effect

**Источник:** Cyberpunk/premium trend

```tsx
import { TextScramble } from '@/components/motion/text-scramble';

<TextScramble
  text='Premium Catering'
  trigger={isInView}
/>
```

**Когда использовать:**
- Hero headlines
- Section titles при появлении
- Интерактивные элементы

---

## 🎨 CSS Animation Utilities

Добавлены в `globals.css`:

```css
/* Keyframes */
@keyframes fade-in-up       /* Появление снизу */
@keyframes fade-in-down     /* Появление сверху */
@keyframes scale-in         /* Появление из центра */
@keyframes shimmer           /* Переливающийся блик */
@keyframes float             /* Парящее движение */
@keyframes pulse-glow        /* Пульсирующее свечение */
@keyframes draw-line         /* Рисование линии */
@keyframes rotate-slow       /* Медленное вращение */

/* Utility classes */
.animate-fade-up            /* fade-in-up */
.animate-fade-down          /* fade-in-down */
.animate-scale-in           /* scale-in */
.animate-shimmer            /* shimmer */
.animate-float              /* float */
.animate-pulse-glow         /* pulse-glow */
.animate-draw-line          /* draw-line */
.animate-rotate-slow        /* rotate-slow */

/* Stagger delays */
.stagger-1 ... .stagger-5   /* Задержки 0.1-0.5s */

/* Hover effects */
.hover-lift                 /* Подъём при наведении */
.hover-glow                 /* Свечение при наведении */
.hover-scale                /* Масштабирование */
```

---

## ⚡ GSAP Integration

Для сложных scroll-анимаций:

```tsx
import {
  createPinnedSection,
  createTextColorReveal,
  createHorizontalScroll,
} from '@/lib/gsap-utils';

// Pinned section (Manifesto-style)
createPinnedSection('#manifesto-section', {
  start: 'top top',
  end: 'bottom top',
  scrub: true,
});

// Text color progression
createTextColorReveal('.manifesto-word', {
  trigger: '#manifesto-text',
});

// Horizontal scroll gallery
createHorizontalScroll('.gallery-container', '.gallery-item');
```

---

## 📊 Performance Guidelines

### Правила

1. **GPU-only свойства**: `transform`, `opacity`
2. **will-change**: только на активных элементах
3. **Lazy mount**: dynamic import тяжёлых компонентов
4. **requestAnimationFrame**: для scroll handlers
5. **Debounce**: resize/input handlers

### Мониторинг

```bash
# Chrome DevTools
# 1. Rendering tab → Paint flashing
# 2. Performance tab → Record
# 3. Layers panel → Compositing

# Lighthouse
npx lighthouse http://localhost:3000 --only-categories=performance
```

### Target Metrics

| Метрика | Цель |
|---------|------|
| FPS при скролле | 60 |
| Jank (long frames) | 0% |
| Input latency | <100ms |
| CPU idle time | >80% |

---

## 🔧 Troubleshooting

### Проблема: Анимация дёргается

**Решение:** Использовать `useSpring` вместо `useMotionValue`

### Проблема: ScrollTrigger не работает

**Решение:** 
- Проверить `gsap.registerPlugin(ScrollTrigger)`
- Убедиться что элемент имеет высоту

### Проблема: Анимации не работают на mobile

**Решение:** Проверить `prefers-reduced-motion` и touch device detection

---

*Обновлено: Cycle 18 (18.08.2026)*
