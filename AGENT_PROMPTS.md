# AGENT_PROMPTS.md — Готовые промпты для агентов

> Коллекция проверенных промптов для типовых задач. Копировать и адаптировать
> под конкретную ситуацию.

## 🎨 Дизайн и верстка

### Промпт: Создание новой секции

```
Ты — Senior Frontend Developer + Art Director. Создай секцию [НАЗВАНИЕ] 
для сайта премиального кейтеринга в СПб.

КОНТЕКСТ:
- Стек: Next.js 16, React 19, Tailwind v4, Motion (Framer), GSAP+Lenis
- Компоненты: shadcn/ui (New York), SmartImage, VideoPlayer
- Палитра: cream #fcfbf8, night #101010, bordeaux #d11a46, sage #758269
- Шрифты: Playfair Display (serif) + Geist Sans

ТРЕБОВАНИЯ:
1. Сначала изучи [ЭТАЛОНЫ] через VLM/web-reader
2. Создай компонент в src/components/catering/[name].tsx
3. Используй Server Component по умолчанию, 'use client' только где нужно
4. Анимации: transform/opacity only, respect prefers-reduced-motion
5. Изображения: только SmartImage с alt + blur placeholder
6. Доступность: семантика, ARIA, 44px touch targets, контраст AA
7. Sticky footer: min-h-screen flex flex-col + mt-auto

ВЫХОД:
- Готовый компонент
- Инструкция по подключению в page.tsx
- Список необходимых изображений (с описанием для generation)
```

### Промпт: Оптимизация анимаций

```
Проверь и оптимизируй анимации в [КОМПОНЕНТ].

ПРОВЕРКИ:
1. Все анимации используют только transform/opacity?
2. Есть ли will-change где нужно?
3. Уважается prefers-reduced-motion?
4. Нет ли layout thrashing?
5. GSAP ScrollTrigger корректно очищается?

ОПТИМИЗАЦИИ:
- Замени layout properties на transform
- Добавьте useReducedMotion checks
- Оберните GSAP в gsap.context() с cleanup
- Используйте requestAnimationFrame для Lenis sync
```

## 📝 Контент

### Промпт: Написание текста секции

```
Напиши текст для секции [НАЗВАНИЕ] сайта кейтеринговой компании.

ТОН БРЕНДА:
- Премиальный, тёплый, чувственный, точный
- Без: «вкусно/дешево/лучшие/скидки»
- С: цифрами, конкретикой, эмоциями

СТРУКТУРА:
- Заголовок (H2): до 8 слов, включает ключевое слово
- Подзаголовок: 1-2 предложения
- Основной текст: 2-4 абзаца по 2-3 предложения
- CTA если уместно

КЛЮЧЕВЫЕ СЛОВА (SEO): [СПИСОК]

ЦЕЛЕВАЯ АУДИТОРИЯ: [ОПИСАНИЕ]

Пример хорошего тона:
«Шестнадцать лет мы создаём моменты, которые остаются в памяти. 
Каждое банкете — это история из пятидесяти деталей, подобранных 
с любовью: от сезонных ингредиентов до музыки, под которую гости 
встречают закат.»
```

### Промпт: Генерация FAQ

```
Сгенерируй 8-10 FAQ вопросов для раздела [ТЕМА] кейтеринг-сайта.

ФОРМАТ:
Q: [Вопрос от лица клиента, естественный язык]
A: [Ответ: конкретика + успокоение + опциональный CTA]

ПРАВИЛА:
- Вопросы реальные (из запросов клиентов)
- Ответы с цифрами, сроками, условиями
- Тон: экспертный, но дружелюбный
- Включить вопросы про цену, сроки, изменения, оплату

ТЕМЫ ДЛЯ FAQ:
- Минимальное количество гостей
- Изменения в заказе
- Оплата и предоплата
- География обслуживания
- Меню и дегустация
- Диетические ограничения
```

## 🔍 SEO

### Промпт: Оптимизация страницы

```
Проведи SEO-аудит страницы [ПУТЬ].

ПРОВЕРКИ:
1. Title tag: 50-60 символов, включает ключевое слово
2. Meta description: 150-160 символов, CTA
3. H1: один на странице, включает ключевое слово
4. H2-H4: иерархия без пропусков
5. Alt-тексты: все изображения, включают ключевые слова
6. Internal links: релевантные anchor text
7. Canonical URL: задан
8. Open Graph: title, description, image
9. Structured data: JSON-LD (LocalBusiness, Service)
10. Mobile: responsive, readable fonts, touch targets

ВЫХОД:
- Список проблем с приоритетами
- Готовый код для исправлений
- Рекомендации по контенту
```

### Промпт: Structured Data

```
Сгенерируй JSON-LD structured data для [СТРАНИЦА/СЕКЦИЯ].

ДОСТУПНЫЕ СХЕМЫ:
- LocalBusiness (главная)
- Service или MenuSection (/offer)
- FAQPage (секция FAQ)
- Event (если есть мероприятия)
- AggregateRating (отзывы)

ФОРМАТ:
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "[TYPE]",
  ...
}
</script>

ДАННЫЕ КОМПАНИИ:
- Название: [ИМЯ]
- Телефон: +7(812)919-59-11
- Город: Санкт-Петербург
- Рейтинг: 4.9/5 (127 отзывов)
- Цены: от 2450 ₽/чел
```

## ♿ Accessibility

### Промпт: A11y аудит компонента

```
Проведи accessibility аудит компонента [ПУТЬ].

ЧЕКЛИСТ WCAG 2.1 AA:

1. СЕМАНТИКА
   - Правильные HTML элементы (nav, main, section, article)?
   - Один h1 на странице?
   - Иерархия заголовков без пропусков?

2. ARIA
   - Интерактивные элементы имеют role где нужно?
   - aria-expanded, aria-controls для toggles?
   - aria-label для иконечных кнопок?
   - aria-live для динамического контента?

3. ФОКУС
   - Логичный порядок tab?
   - Видимый :focus-visible стиль?
   - Focus trap в модальных?

4. ИЗОБРАЖЕНИЯ
   - Все img имеют alt (не пустой если не декоративный)?
   - Decorative: alt="" + aria-hidden?

5. ЦВЕТ
   - Контраст текста ≥ 4.5:1?
   - Не только цвет для информации?

6. ДВИЖЕНИЕ
   - prefers-reduced-motion уважён?
   - Нет автопроигрывания без остановки?

7. ФОРМЫ
   - Label связан с input?
   - Error сообщения в aria-live / role="alert"?
   - Required поля помечены?

ВЫХОД:
- Список issues с severity (Critical/Major/Minor)
- Готовый код исправлений
- Рекомендации
```

## ⚡ Performance

### Промпт: Аудит производительности

```
Проведи performance аудит [СТРАНИЦА/КОМПОНЕНТ].

CORE WEB VITALS:
- LCP: какой элемент? Как оптимизировать?
- INP: какие обработчики? Блокируют ли?
- CLS: есть ли shift? Какие элементы?

ПРОВЕРКИ:
1. Images
   - AVIF/WebP форматы?
   - Явные width/height?
   - Priority для above-fold?
   - Lazy для below-fold?
   - Blur placeholder?

2. Fonts
   - display: swap?
   - Preload critical fonts?
   - Subset (latin+cyrillic)?

3. JavaScript
   - Dynamic import for heavy?
   - Code splitting?
   - Unused code eliminated?

4. CSS
   - Critical inlined?
   - Unused purged?
   - No expensive selectors?

5. Network
   - Preconnect to external?
   - Cache headers?
   - Minimal requests?

ВЫХОД:
- Текущие метрики (оценка)
- Оптимизации с ожидаемым эффектом
- Приоритизированный список действий
```

## 🧪 Тестирование

### Промпт: E2E тест сценарий

```
Напиши E2E тесты для [КОМПОНЕНТ/СТРАНИЦА].

ФРЕЙМВОРК: Playwright (@playwright/test)

СЦЕНАРИИ:

1. POSITIVE PATH
   - Открываю страницу → вижу ожидаемый контент
   - Взаимодействую с элементом → получаю ожидаемый результат
   - Заполняю форму валидными данными → успешная отправка

2. VALIDATION
   - Отправляю пустую форму → вижу ошибки
   - Ввожу невалидный email/телефон → ошибка валидации

3. RESPONSIVE
   - Mobile (375px): всё помещается, touch targets 44px+
   - Tablet (768px): адаптивная раскладка
   - Desktop (1280px): полный вид

4. ACCESSIBILITY
   - Tab navigation: логичный порядок
   - Screen reader: контент доступен

5. EDGE CASES
   - Медленная сеть: skeleton/loading states
   - Ошибка API: error message показан

ФОРМАТ:
import { test, expect } from '@playwright/test';

test.describe('[Component Name]', () => {
  test('should [what it does]', async ({ page }) => {
    // ...
  });
});
```

## 🐛 Debugging

### Промпт: Диагностика проблемы

```
Диагностируй проблему: [ОПИСАНИЕ].

ИНФОРМАЦИЯ:
- Что ожидаю: [EXPECTED]
- Что получаю: [ACTUAL]
- Когда возникает: [STEPS TO REPRODUCE]
- Консольные ошибки: [ERRORS IF ANY]
- Dev server log: [RELEVANT LINES]

АНАЛИЗ:
1. Возможно причина: [HYPOTHESIS 1]
2. Возможно причина: [HYPOTHESIS 2]
3. Возможно причина: [HYPOTHESIS 3]

ДЕЙСТВИЯ:
1. Проверить [ACTION 1]
2. Проверить [ACTION 2]
3. Добавить логирование [WHERE]

ГРАБЛИ ИЗ AGENTS.md:
- [релевантные грабли если есть]
```

---

## Использование

1. Выбрать подходящий промпт
2. Адаптировать под конкретную задачу (в квадратных скобках)
3. Добавить контекст если нужно
4. Выполнить
5. Результат записать в worklog.md
