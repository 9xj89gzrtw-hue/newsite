# Skills — карта подключённых навыков

> Скиллы установлены через `npx skills add` (см. `skills-lock.json`) и
> разложены в `.agents/skills/` + `agent/skills/`. Перед вызовом любого навыка —
> **прочитать его `SKILL.md`** и следовать параметрам.

## Установленные локально (из GitHub-репозиториев)

| Скилл | Источник | Назначение | Путь к SKILL.md |
|---|---|---|---|
| **find-skills** | vercel-labs/skills | Поиск и установка новых навыков по запросу «how do I do X» | `.agents/skills/find-skills/SKILL.md` |
| **skill-creator** | anthropics/skills | Создание/редактирование/оценка собственных навыков | `.agents/skills/skill-creator/SKILL.md` |
| **frontend-design** | anthropics/skills | Принципы фронтенд-дизайна, UI/UX, верстка эталонов | `.agents/skills/frontend-design/SKILL.md` |
| **brand-guidelines** | anthropics/skills | Консистентность бренда (тон, цвета, шрифты, голос) | `.agents/skills/brand-guidelines/SKILL.md` |
| **theme-factory** | anthropics/skills | Тематизация, дизайн-токены, мульти-брендовые темы | `.agents/skills/theme-factory/SKILL.md` |
| **webapp-testing** | anthropics/skills | E2E-тестирование веб-приложений | `.agents/skills/webapp-testing/SKILL.md` |

## Кастомные скиллы проекта (созданы для кейтеринг-сайта)

### Core Skills (Cycle 18)

| Скилл | Назначение | Путь к SKILL.md |
|---|---|---|
| **accessibility** | WCAG 2.1 AA доступность: семантика, ARIA, контраст, фокус, motion | `.agents/skills/accessibility/SKILL.md` |
| **seo-optimizer** | SEO оптимизация: metadata, structured data, sitemap, контент | `.agents/skills/seo-optimizer/SKILL.md` |
| **performance-optimization** | Core Web Vitals: LCP/INP/CLS, images, video, animation perf | `.agents/skills/performance-optimization/SKILL.md` |
| **typescript-best-practices** | TypeScript паттерны: типы, generics, Zod, error handling | `.agents/skills/typescript-best-practices/SKILL.md` |
| **react-patterns** | React архитектура: compound components, state management, hooks | `.agents/skills/react-patterns/SKILL.md` |
| **content-creation** | Контент в тоне бренда: копирайт, FAQ, SEO-тексты | `.agents/skills/content-creation/SKILL.md` |

### Premium Design & Animation Skills (Cycle 19)

| Скилл | Назначение | Путь к SKILL.md |
|---|---|---|
| **advanced-animations** | 🎬 Продвинутые анимации: GSAP ScrollTrigger, Motion, custom cursor, parallax, text scramble, page transitions | `.agents/skills/advanced-animations/SKILL.md` |
| **design-system** | 🎨 Полная дизайн-система из 32 эталонов: цвета OKLCH, типографика, spacing, компоненты, gradients | `.agents/skills/design-system/SKILL.md` |
| **interactive-components** | 🖱 Интерактивные компоненты: sticky header, chapter nav, gallery lightbox, carousel, forms, accordion | `.agents/skills/interactive-components/SKILL.md` |

## Системные навыки (через `Skill` tool, без локальной установки)

> Эти вызываются через встроенный `Skill` tool. Тоже читать `SKILL.md` перед
> использованием (через сам tool).

| Скилл | Когда использовать |
|---|---|
| **web-search** | Подтверждение версий; поиск эталонов; тренды 2026. CLI: `z-ai function -n web_search -a '{"query":"...","num":8}'` |
| **web-reader** | Извлечение DOM/копирайта с эталонных сайтов. |
| **image-search** | Реальные фото блюд, сервировки, интерьеров. |
| **image-generation** | Кастомные фото/иллюстрации для героев, обложек меню. |
| **video-understanding** | Анализ видео-референсов (настроение, темп, монтаж). |
| **VLM** | Разбор скриншотов эталонов: палитра, сетка, типографика, тайминги. |
| **LLM** | Копирайт меню/о-нас/FAQ в тоне бренда (тёплый, чувственный, точный). |
| **ASR / TTS** | Транскрипция/озвучка (если будут видео с закадровым голосом). |
| **fullstack-dev** | Сборка экранов по готовому стеку (через Task → subagent). |
| **react-best-practices** | Ревью компонентов, ре-рендеры, Server/Client границы. |
| **react-performance** | Оптимизация тяжёлых медиа, LCP/CLS. |
| **vercel-composition-patterns** | Архитектура составных компонентов. |
| **vercel-deployment** | Линковка репо, env, домены, preview. |
| **design-system-patterns** | Токены, темизация, масштабирование. |
| **design-review** | QA визуала перед каждым коммитом (обязательно!). |
| **ui-ux-design** | Раскладки, прототипы, доступность. |
| **frontend-performance** | LCP/CLS/INP, bundle-size, оптимизация видео/фото. |
| **e2e-testing-patterns** | E2E-паттерны (Playwright/Cypress). |
| **charts** | Инфографика «как мы работаем», статистика событий. |
| **api-design-principles / api-error-handling** | Когда появятся API-роуты под заказы/лиды. |

## Матрица использования скиллов по задачам

### Создание премиальной секции сайта
```
1. design-system → выбрать цвета, типографику, spacing
2. advanced-animations → выбрать эффекты появления
3. interactive-components → использовать готовые паттерны
4. accessibility → проверить на a11y соответствие
5. performance-optimization → оптимизировать изображения и анимации
6. react-patterns → правильная архитектура компонента
7. typescript-best-practices → типобезопасность
```

### UX/UI дизайн
```
1. design-system → токены, компоненты
2. interactive-components → навигация, формы, галерея
3. frontend-design → layout patterns
4. brand-guidelines → консистентность бренда
5. accessibility → WCAG 2.1 AA
```

### Анимации и интерактив
```
1. advanced-animations → GSAP/Motion паттерны
2. interactive-components → hover, scroll, touch взаимодействия
3. performance-optimизация → 60fps, GPU-only свойства
```

### SEO и контент
```
1. seo-optimizer → metadata, structured data
2. content-creation → тексты в тоне бренда
3. web-search → анализ конкурентов
4. image-generation/search → visuals
```

### Оптимизация и тестирование
```
1. performance-optimization → Core Web Vitals аудит
2. accessibility → скрин-ридер тестирование
3. webapp-testing → E2E сценарии
4. react-performance → профилирование
```

## Документация дизайна

| Файл | Описание |
|------|----------|
| [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) | Полная дизайн-система: цвета, типографика, spacing, компоненты |
| [`docs/MOTION-LIBRARY.md`](docs/MOTION-LIBRARY.md) | Библиотека анимаций: все эффекты с примерами кода |
| [`docs/ANIMATION-PRESETS.md`](docs/ANIMATION-PRESETS.md) | Готовые CSS/JS сниппеты анимаций |
| [`AGENT_WORKFLOW.md`](AGENT_WORKFLOW.md) | Пошаговый рабочий процесс для агентов |
| [`AGENT_PROMPTS.md`](AGENT_PROMPTS.md) | Готовые промпты для типовых задач |

## Как добавить новый навык

```bash
# из каталога-источника
npx skills add https://github.com/<owner>/<repo> --skill <skill-name> -y

# или поискать
npx skills find "<что нужно>"
```

Для кастомного скилла:
1. Создать директорию `.agents/skills/<skill-name>/`
2. Создать `SKILL.md` с документацией
3. Добавить запись в `skills-lock.json`
4. Обновить этот файл (добавить строку в таблицу)

После установки — добавить строку в таблицу выше и
зафиксировать назначение. Обновить `skills-lock.json` (генерируется CLI).

---

## Эталонные сайты (анализированы для дизайн-системы)

### Tier 1 (SOTD уровень)
- **pinchfooddesign.com** — Авангардный дизайн, live stats, креативные CTA
- **wolfgangpuckcatering.com** — Голливудский шик, video hero, bold typography
- **ridgewells.com** — Классическая элегантность, navy + gold

### Tier 2 (Premium)
- myradish.com, sopranoscatering.com, concept-catering.de
- joels.com, relishcaterers.com, mculinary.com

### Tier 3 (High Quality)
- talkofthetownatlanta.com, queenofheartscatering.com
- chicchefcatering.com, fromscratchcatering.com
- stevenscatering.com, chefbyrequest.com

Полный анализ — в `docs/DESIGN-SYSTEM.md`
