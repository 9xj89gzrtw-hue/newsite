# DESIGN-SYSTEM.md — Премиальная Дизайн-система

> Полная дизайн-система для сайта кейтеринговой компании.
> Основана на анализе 32 мировых кейтеринг-брендов (Pinch, Wolfgang Puck, Ridgewells, etc.)

## 🎨 Философия дизайна: "Cinematic Elegance"

**Кинематографичная элегантность** — каждый пиксель работает на создание
премиального впечатления, как в кино. Вдохновление:

| Бренд | Что заимствуем |
|-------|----------------|
| **Wolfgang Puck Catering** | Bold typography, video hero, gold accents |
| **Pinch Food Design** | Анимированные счётчики, креативные CTA, live stats |
| **Ridgewells** | Классическая элегантность, navy + gold палитра |
| **M Culinary Concepts** | Transparent→solid header, parallax |
| **Radish** | Минимализм, фокус на food photography |

---

## 🌈 Цветовая система (OKLCH)

### Primary Palette

```
┌─────────────────────────────────────────────────────────────┐
│  DARK THEME                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  #1A1614  │  │  #2A2524  │  │  #3D3533  │                  │
│  │   night   │  │ charcoal │  │ espresso │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
├─────────────────────────────────────────────────────────────┤
│  LIGHT THEME                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  #FCFBF8  │  │  #EAE4D8  │  │  #E8E0D2  │                  │
│  │   cream  │  │parchment │  │   sand   │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
├─────────────────────────────────────────────────────────────┤
│  ACCENTS                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  #D11A46  │  │  #C9A96E  │  │  #758269  │                  │
│  │ bordeaux │  │   gold   │  │   sage   │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│  ┌──────────┐                                              │
│  │  #FF6E00  │                                              │
│  │  orange  │                                              │
│  └──────────┘                                              │
└─────────────────────────────────────────────────────────────┘
```

### Gradient Library

```css
/* Hero gradient */
--gradient-hero: linear-gradient(135deg, night 0%, charcoal 50%, night 100%);

/* Bordeaux accent */
--gradient-bordeaux: linear-gradient(135deg, bordeaux 0%, bordeaux-light 100%);

/* Gold luxury */
--gradient-gold: linear-gradient(135deg, gold 0%, gold-light 50%, gold 100%);

/* Dark overlay for images */
--gradient-dark-overlay: linear-gradient(to bottom, transparent 0%, night/70% 50%, night/95% 100%);
```

---

## ✍️ Типографика

### Font Stack

```css
/* Display — headlines */
--font-display: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;

/* Body — UI */
--font-body: 'Geist Sans', -apple-system, BlinkMacSystemFont, sans-serif;

/* Mono — stats */
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;
```

### Type Scale (Modular 1.25)

| Token | Mobile | Desktop | Usage |
|-------|--------|---------|-------|
| `text-display-lg` | 56px | 128px | Hero headline |
| `text-display` | 40px | 80px | Section title |
| `text-display-sm` | 32px | 56px | Subsection |
| `text-h1` | 32px | 48px | Page title |
| `text-h2` | 28px | 40px | Section heading |
| `text-h3` | 24px | 32px | Card title |
| `text-h4` | 20px | 24px | Small heading |
| `text-body-lg` | 18px | 18px | Lead text |
| `text-body` | 16px | 16px | Body copy |
| `text-body-sm` | 14px | 14px | Secondary text |
| `text-label` | 12px | 12px | Labels, tags |
| `text-caption` | 11px | 11px | Captions |
| `text-overline` | 10px | 10px | Overlines |

### Typography Patterns

**Hero Headline (Wolfgang Puck style):**
```
SETTING THE STANDARD FOR
CULINARY EXCELLENCE
↑ display-lg, uppercase, tracking-tighter, font-display
```

**Section Heading (Ridgewells style):**
```
Our Services
↑ h2, font-display, italic accent word
```

**Stats Number (Pinch style):**
```
2400+
↑ display-lg, tabular-nums, font-mono
```

---

## 📐 Spacing System (8px Grid)

```
0     4px    8px    12px   16px    20px    24px    32px
│     │      │      │      │       │       │       │
0     sp-1   sp-2   sp-3   sp-4    sp-5    sp-6    sp-8

40px   48px   64px   80px   96px    128px   160px   192px   256px
sp-10  sp-12  sp-16  sp-20  sp-24   sp-32   sp-40   sp-48   sp-64
```

**Section Padding:**
- Mobile: `py-20` (80px)
- Tablet: `py-32` (128px)
- Desktop: `py-48` (192px)

**Container:**
- Max width: `1280px` (80rem)
- Padding: `16px` mobile, `24px` desktop

---

## 🔲 Компоненты

### Buttons

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   PRIMARY (Bordeaux)│  │  SECONDARY (Outline)│  │   LUXURY (Gold)     │
│  ╭─────────────────╮│  │  ╭─────────────────╮│  │  ╭─────────────────╮│
│  │  Рассчитать     ││  │  │  Смотреть       ││  │  │  Забронировать  ││
│  ╰─────────────────╯│  │  ╰─────────────────╯│  │  ╰─────────────────╯│
│  bg-bordeaux        │  │  border-2           │  │  bg-gold             │
│  text-white         │  │  hover:bg-white     │  │  text-night          │
│  rounded-full       │  │  rounded-full       │  │  shadow-gold         │
│  hover:shadow       │  │                     │  │                     │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

### Cards

```
╭──────────────────────────────────╮
│  ┌────┐                         │
│  │ 🎂 │  Service Title           │ ← h4, font-display
│  └────┘                         │
│                                  │
│  Description text here...        │ ← body-sm, muted
│                                  │
│  • Feature 1                    │
│  • Feature 2                    │
│  • Feature 3                    │
│                                  │
╰──────────────────────────────────╯
↑ rounded-2xl, p-6, shadow-default
  hover:shadow-xl, hover:-translate-y-1
```

---

## 🎬 Микро-анимации

| Эффект | CSS Class | Когда использовать |
|--------|-----------|---------------------|
| Fade up | `.animate-fade-up` | Секции при скролле |
| Shimmer | `.animate-shimmer` | Loading states |
| Float | `.animate-float` | Decorative элементы |
| Pulse glow | `.animate-pulse-glow` | CTA кнопки |
| Draw line | `.animate-draw-line` | Разделители |
| Hover lift | `.hover-lift` | Карточки, ссылки |
| Hover glow | `.hover-glow` | Кнопки акценты |

---

## 📱 Responsive Breakpoints

```
Mobile:    < 640px   (sm)
Tablet:    ≥ 768px   (md)
Desktop:   ≥ 1024px  (lg)
Large:     ≥ 1280px  (xl)
X-Large:   ≥ 1536px  (2xl)
```

---

## ♿ Accessibility

- Контраст AA: текст ≥ 4.5:1, крупный ≥ 3:1
- Touch targets: минимум 44×44px
- Focus rings: видимые на всех интерактивах
- Reduced motion: уважать `prefers-reduced-motion`

---

## 🔄 Использование

1. Импортировать токены из `globals.css` через Tailwind v4 `@theme`
2. Использовать компоненты из `src/components/ui/`
3. Следовать паттернам из этого документа
4. При добавлении новых стилей — обновлять этот документ

---

*Обновлено: Cycle 18 (18.08.2026)*
*Источник: анализ 32 премиальных кейтеринг-сайтов*
