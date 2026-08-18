# Accessibility (a11y) Skill

> Критически важный навык для обеспечения доступности сайта кейтеринговой компании всем пользователям, включая людей с ограниченными возможностями.

## Когда использовать

- Перед каждым коммитом — проверка компонента/страницы на a11y
- При создании новых форм, навигации, интерактивных элементов
- При аудите существующего кода на соответствие WCAG 2.1 AA
- При работе с цветовой контрастностью, фокус-состояниями, семантикой

## Core Principles

### 1. Semantic HTML (Семантическая разметка)

```tsx
// ✅ Правильно — семантические элементы
<main>
  <section aria-labelledby="menu-heading">
    <h2 id="menu-heading">Наше меню</h2>
    <article>
      <h3>Банкетное меню</h3>
    </article>
  </section>
</main>

// ❌ Неправильно — div soup
<div class="container">
  <div class="section">
    <div class="title">Наше меню</div>
  </div>
</div>
```

### 2. ARIA Attributes

```tsx
// Кнопка-гамбургер для мобильного меню
<button
  aria-expanded={isOpen}
  aria-controls="mobile-menu"
  aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
>
  <HamburgerIcon />
</button>

// Live region для динамического контента (калькулятор)
<div role="status" aria-live="polite" aria-atomic="true">
  Итого: {total} ₽
</div>
```

### 3. Focus Management (Управление фокусом)

```tsx
// Фокус-ловушка в модальном окне
useEffect(() => {
  if (isOpen) {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    firstElement?.focus();
  }
}, [isOpen]);

// Skip navigation link (пропустить к контенту)
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50">
  Перейти к основному содержанию
</a>
```

### 4. Color Contrast (Контрастность)

Минимальные требования WCAG AA:
- Обычный текст: **4.5:1**
- Крупный текст (18px+ / 14px bold): **3:1**
- Интерактивные элементы: **3:1** против соседних цветов
- Графические объекты: **3:1**

Палитра проекта (OKLCH):
```
cream #fcfbf8 — фон (контрастный с тёмным текстом)
night #101010 — основной текст (на светлом фоне)
bordeaux #d11a46 — акценты, CTA (проверить на cream)
sage #758269 — вторичный текст
orange #ff6e00 — предупреждения, highlights
```

### 5. Touch Targets (Тач-цели)

Минимальный размер: **44x44px** (Apple HIG, Material Design)

```tsx
// ✅ Правильно — достаточно места для тача
<button className="min-h-[44px] min-w-[44px] p-3">
  <PhoneIcon className="h-5 w-5" />
</button>

// ❌ Неправильно — слишком маленький кликабельный элемент
<button className="p-1">
  <Icon className="h-3 w-3" />
</button>
```

### 6. Images & Media (Изображения и медиа)

```tsx
// Всегда описательный alt
<SmartImage
  src="/media/banquet-1.jpg"
  alt="Свадебный банкет на 100 гостей с белым льняным текстилем и цветочными композициями"
  width={1344}
  height={768}
/>

// Декоративные изображения
<SmartImage src="/grain.png" alt="" aria-hidden={true} />

// Видео — captions обязательны
<VideoPlayer
  src={videoUrl}
  captions="/captions/hero.vtt" // WebVTT субтитры
/>
```

### 7. Forms (Формы)

```tsx
// Label + input связь
<div className="space-y-2">
  <label htmlFor="guest-count">Количество гостей</label>
  <Input
    id="guest-count"
    type="number"
    min={10}
    max={500}
    aria-describedby="guest-count-hint"
    required
  />
  <span id="guest-count-hint" className="text-sm text-muted">
    От 10 до 500 персон
  </span>
</div>

// Ошибки валидации
<Input
  aria-invalid={!!error}
  aria-describedby={error ? 'phone-error' : undefined}
/>
{error && (
  <p id="phone-error" role="alert" className="text-destructive">
    {error}
  </p>
)}
```

### 8. Motion & Animation (Движение и анимация)

```tsx
// Уважать prefers-reduced-motion
const prefersReducedMotion = useReducedMotion();

// В компонентах анимации
if (prefersReducedMotion) {
  return <StaticContent />; // Без анимации
}

// CSS подход (уже в globals.css)
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Checklists

### Before Commit Checklist

- [ ] Все `<img>` имеют `alt` (не пустой, если не декоративный)
- [ ] Все интерактивные элементы имеют `:focus-visible` стили
- [ ] Цвета проходят contrast checker (4.5:1 минимум)
- [ ] Формы имеют связанные `<label>` или `aria-label`
- [ ] ARIA атрибуты корректны (role, aria-expanded, etc.)
- [ ] `prefers-reduced-motion` уважается
- [ ] Touch targets ≥ 44px
- [ ] Заголовки иерархичны (h1 → h2 → h3, без пропусков)
- [ ] `lang="ru"` на `<html>`
- [ ] Ссылки имеют понятный текст (не "здесь", "читать")

### Screen Reader Testing Points

1. **Navigation**: Tab через все интерактивные элементы — логичный порядок?
2. **Headings**: Jump между заголовками — понятная структура?
3. **Forms**: Error сообщения озвучиваются screen reader'ом?
4. **Dynamic content**: ARIA live regions обновляются?
5. **Images**: Alt-тексты передают смысл?

## Tools & Resources

### Browser DevTools
- **Chrome Lighthouse** (Accessibility audit)
- **Firefox Accessibility Inspector**
- **axe DevTools** (расширение)

### CLI Tools
```bash
# axe-core автоматизированный тест
npx axe http://localhost:3000

# pa11y
npx pa11y http://localhost:3000
```

### Contrast Checkers
- https://webaim.org/resources/contrastchecker/
- https://contrast-ratio.com/ (поддерживает OKLCH)

## Project-Specific Notes

Для кейтеринг-сайта особое внимание:
1. **Калькулятор**: все изменения цен должны быть в `aria-live="polite"` регионе
2. **Галерея событий**: lightbox должен ловить фокус, поддерживать Escape для закрытия
3. **Мобильное меню**: фокус-ловушка при открытом состоянии
4. **Видео**: субтитры для Instagram embed и Mux видео
5. **Форма заявки**: валидация с `aria-invalid` + `role="alert"`

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Inclusive Components](https://inclusive-components.design/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
