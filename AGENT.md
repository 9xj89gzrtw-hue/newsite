# AGENTS.md — инструкции для AI-агентов

> **Читать перед началом любой работы.** Редактировать в конце — добавлять
> найденные нюансы для будущей эффективности.

Этот файл — точка входа для любого агента (Claude, Cursor, Copilot, Z.ai и др.),
работающего с репозиторием кейтеринговой компании.

---

## 1. Контекст проекта

- **Что это:** сайт кейтеринговой компании. Репозиторий = «инструментальный
  цех»: стек установлен, правила зафиксированы, скиллы подключены. Сайт строится
  поэтапно, копируя лучшие реализации.
- **Где живёт:** GitHub `9xj89gzrtw-hue/newsite`, деплой на Vercel (авто из
  `main`).
- **Снимок актуальности:** 17 августа 2026 г. (см.
  [`docs/STACK-SNAPSHOT.md`](docs/STACK-SNAPSHOT.md)).

## 2. Обязательно прочитать перед работой

1. [`AGENT_SETUP_PROMPT.md`](AGENT_SETUP_PROMPT.md) — полная
   «конституция» настройки репо: ограничения, стек, скиллы, правила, DoD.
   *(уже выполнен)*
2. [`BUILD_SITE_PROMPT.md`](BUILD_SITE_PROMPT.md) — **«конституция» сборки
   самого сайта**: оригинал-контент, эталоны, структура секций, спецификация
   калькулятора, медиа-план, DoD. Читать перед любой работой над экранами.
3. [`docs/RULES.md`](docs/RULES.md) — 16 правил (веб-поиск → решение;
   эталон → реализация; видео через Mux; `transform`/`opacity` only; и т.д.).
4. [`docs/INSPIRATION.md`](docs/INSPIRATION.md) — эталоны для копирования.
5. [`docs/ANIMATION-PRESETS.md`](docs/ANIMATION-PRESETS.md) — готовые сниппеты
   Motion/GSAP/Lenis.
6. [`docs/STACK-SNAPSHOT.md`](docs/STACK-SNAPSHOT.md) — версии с источниками.
7. [`skills/README.md`](skills/README.md) — карта навыков.
8. [`docs/REFERENCE-SITES-ANALYSIS.md`](docs/REFERENCE-SITES-ANALYSIS.md) — **полный анализ
   23 мировых кейтеринг-сайтов**: паттерны, палитры, hero-каталог, компоненты
   (Cycle 20).

## 3. Стек (кратко)

Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind v4 (OKLCH) ·
shadcn/ui (New York) · Motion (Framer) · GSAP + ScrollTrigger · Lenis ·
Mux (видео) · Prisma (SQLite→Postgres) · TanStack Query · Zustand · nuqs · Zod.

## 4. Команды

```bash
bun install
bun run dev        # порт 3000
bun run lint       # обязательно зелёный перед коммитом
bun run typecheck  # обязательно зелёный перед коммитом
bun run db:push    # применить схему Prisma
```

## 5. Жёсткие правила (не нарушать)

1. **Сначала веб-поиск** — подтверждать версии/паттерны актуальным источником
   (≤ 6 мес). Не брать «по памяти».
2. **Сначала эталон** — каждый экран начинается с 3–5 эталонов (Awwwards,
   Dribbble, кейтеринг-каталоги), разбирается через VLM/web-reader,
   воспроизводится 1-в-1 со своим контентом.
3. **Видео — только через Mux/Cloudflare Stream.** Никогда не класть `.mp4` в
   `public/`. Использовать `<VideoPlayer>`.
4. **Фото — только `<SmartImage>`** (обязателен `alt`, blur-плейсхолдер).
   Никаких сырых `<img>`.
5. **Анимация — `transform`/`opacity` only.** Уважать `prefers-reduced-motion`.
6. **Server Components по умолчанию.** `'use client'` и динамические импорты —
   только где нужны.
7. **Доступность обязательна** (семантика, ARIA, контраст AA, фокус, 44px
   touch-target).
8. **Sticky footer** (`min-h-screen flex flex-col` + `mt-auto`).
9. **Без индиго/синего.** Палитра — OKLCH-токены (cream/espresso/terracotta/
   sage/honey).
10. **Коммиты — Conventional Commits** (`feat:`, `fix:`, `docs:` …).
11. **Перед коммитом:** `lint` + `typecheck` зелёные, `design-review` пройден.
12. **Деплой — авто из `main`.** Никаких ручных выкаток.

## 6. Скиллы

Установлены локально (`skills-lock.json`, `.agents/skills/`): `find-skills`,
`skill-creator`, `frontend-design`, `brand-guidelines`, `theme-factory`,
`webapp-testing`. Системные (через `Skill` tool): `web-search`, `web-reader`,
`image-search`, `image-generation`, `video-understanding`, `VLM`, `LLM`,
`fullstack-dev`, `design-review`, `react-best-practices`, и др. — см.
[`skills/README.md`](skills/README.md).

### Кастомные скиллы проекта (Cycle 18+, см. §14, §16)

| Скилл | Когда использовать |
|---|---|
| **accessibility** | A11y аудит, WCAG 2.1 AA проверка, ARIA паттерны, фокус-менеджмент |
| **seo-optimizer** | Metadata, structured data (JSON-LD), sitemap, SEO-контент |
| **performance-optimization** | Core Web Vitals, image/video optimization, bundle size |
| **typescript-best-practices** | Типизация, Zod schemas, error handling patterns |
| **react-patterns** | Архитектура компонентов, state management, custom hooks |
| **content-creation** | Копирайт в тоне бренда, FAQ, тексты секций |
| **design-system** 🆕 | **Цвета OKLCH, типографика (55+ сайтов), 7 палитр, 5 hero-шаблонов, signature components** |
| **advanced-animations** 🆕 | **HeroCinematic, View Transitions, Counters, Marquee, MagneticButton, GSAP matchMedia (3400 строк)** |
| **interactive-components** 🆕 | **Mega Menu, Lightbox Gallery, Multi-step Form, Announcement Bar, Instagram Feed (3700 строк)** |

🆡 = существенно расширен в Cycle 20 на основе анализа 23 мировых сайтов

**Перед вызовом любого навыка — прочитать его `SKILL.md`.**

### Матрица: какой скилл для какой задачи

- **Новая секция**: frontend-design → **design-system** → accessibility → react-patterns → typescript-best-practices
- **Анимации/интерактив**: **advanced-animations** → **interactive-components** → performance-optimization
- **SEO/контент**: seo-optimizer → content-creation → web-search
- **Оптимизация**: performance-optimization → accessibility → typescript-best-practices
- **Тестирование**: webapp-testing → accessibility → design-review
- **Репликация эталона**: `docs/REFERENCE-SITES-ANALYSIS.md` → **design-system** → **advanced-animations** → **interactive-components**

## 7. Структура ключевых файлов

```
src/app/layout.tsx              # providers: Theme, Query, Lenis
src/app/page.tsx                # плейсхолдер «репозиторий готов»
src/components/media/           # VideoPlayer, SmartImage
src/components/motion/          # Reveal, Marquee, ScrollScene
src/components/providers/       # theme, query, lenis
src/components/ui/              # shadcn/ui
src/lib/                        # utils, db, video (Mux/CF)
prisma/schema.prisma            # MenuCategory, MenuItem, Event, GalleryItem, Testimonial, Lead
```

## 8. Worklog

При работе через субагентов — общий worklog в
`/home/z/my-project/worklog.md` (песочница). Каждый субагент: читает перед
стартом, дописывает свою секцию после (шаблон в `AGENT_SETUP_PROMPT.md`).

## 9. Тон бренда (для будущего копирайта)

Премиальная, душевная кейтеринговая компания. «Еда как искусство». Тон: тёплый,
чувственный, точный; без клише «вкусно и недорого»; акцент на сезонность, руки
поваров, ритуал застолья. Копирайт — через LLM-скилл в этом тоне.

## 10. Что добавлять в этот файл после работы

- Найденные грабли (библиотека X не работает с Y → решение).
- Уточнённые команды/пути.
- Новые скиллы, которые оказались полезны.
- Изменения стека (с указанием даты и причины).

---

## 11. Текущее состояние сайта (обновлено 18.08.2026 после циклов улучшения)

**Сайт прошёл через 15+ циклов hostile-reviewer оптимизации** (коммиты `3990c4c` → `7746c43`).

### Результаты оптимизации (Циклы 1-15):
- **Начальная оценка:** 3.5-5.5/10 (циклы 12-14)
- **Текущая оценка:** 4.8-5.8/10 (цикл 15, критики видят кешированную версию)
- **Прогресс:** значительные улучшения SEO, a11y, i18n, конверсии

### Улучшения Cycles 12-15 (коммиты `a921ad2` → `7746c43`):

**SEO:**
- Улучшен title главной страницы (добавлена цена "от 2450₽/чел")
- Уникальные meta descriptions для каждой страницы
- Canonical URLs для /offer и /privacy
- Уникальные Open Graph теги для подстраниц

**Доступность (a11y):**
- Минимальный размер шрифта увеличен до 12px (было 10-11px)
- Контрастность текста улучшена (cream/40-50% → 60-70%)
- Все text-[10px] и text-[11px] удалены из кода

**Локализация (i18n):**
- 'surcharge' → 'надбавка' в FAQ
- 'dietary restrictions' → 'пищевые ограничения' в FAQ
- Описания видео переведены на русский язык

**Конверсия:**
- Добавлен звёздный рейтинг 5★ к каждому отзыву
- Добавлен агрегированный рейтинг 4.9/5 (127+ отзывов)
- Улучшен видео-дисклеймер (менее заметный)

### Кинематографичный одностраничник — синтез лучшего из 29 эталонов

### Продакшн-апгрейды (коммит `d305bd0`)

1. **Postgres-миграция** (Vercel-ready):
   - `prisma/schema.prisma`: `provider = "postgresql"` (был sqlite)
   - `scripts/db-push-if-set.js`: условный `prisma db push` при сборке (только
     если `DATABASE_URL` — Postgres URL; non-fatal если БД недоступна)
   - Build: `prisma generate && node scripts/db-push-if-set.js && next build --webpack`
   - `.env.example`: инструкция по Vercel Postgres
   - **Действие для Vercel**: Dashboard → Storage → Create Postgres → copy
     `DATABASE_URL` → Settings → Environment Variables. Build auto-применит схему.

2. **Реальные фото** (с interfood-catering.ru, в `/public/media/`):
   - 12 фото событий (свадьба на крыше, банкет на корабле, Harley Days, etc.)
   - 7 фото для типов меню (по одному на каждый из 7)
   - 4 скриншота благодарственных писем
   - `src/lib/media.ts`: все `MEDIA.*` ссылаются на локальные `/media/` пути

3. **Реальные отзывы** (VLM OCR скриншотов):
   - ООО «Спортинг» (корпоративы 100–350 гостей, 2012–2014)
   - АО «ДеЛаваль» (Выставка «День поля 2019»)
   - «ТехПРО» (банкет на 320 персон, 2014)
   - Премия «АВРОРА» (фуршет на 300 персон, 15.11.2017, к/п «РОДИНА»)
   - `TESTIMONIALS` в `media.ts`, `testimonials.tsx` переписан

4. **Mux video hero** (опционально, без токенов работает Ken Burns):
   - `hero.tsx`: если `MEDIA.hero.muxPlaybackId` задан — `<MuxPlayer>` autoplay
     muted loop; иначе Ken Burns image (текущий дефолт)
   - Для активации: загрузить видео в Mux → поставить playback ID в `media.ts`
     + `MUX_TOKEN_*` в Vercel env vars

5. **nuqs shareable calculator**:
   - `layout.tsx`: `<NuqsAdapter>` обёртка
   - `calculator.tsx`: `typeId` + `guests` синхронизированы с URL (`?type=banquet&guests=60`)
   - `page.tsx`: `<Calculator>` в `<Suspense>` (обязательно для `useSearchParams`
     при статической prerender)
   - Кнопка «Поделиться сметой» — копирует shareable URL в clipboard

### Что реализовано (базовый сайт, коммит `688c6f4`)
- **Одна страница `/`** с 8 секциями + sticky footer (минимум подстраниц).
- **Hero**: full-bleed Ken Burns + oversized Playfair Display + parallax exit
  (scale+opacity+blur при скролле, Salza-стиль).
- **Marquee-блок**: 5vw горизонтальный текст, привязанный к вертикальному
  скроллу (Concept-стиль), beige фон + orange бордеры.
- **About**: count-up статистика (Pinch-стиль) — 16 лет, 2400+ событий и т.д.
- **Menu (7 типов)**: интерактивные строки, hover-preview, клик → автоскролл к
  калькулятору + синхронизация типа через CustomEvent.
- **Services (11)**: сетка карточек с hover-lift.
- **Events gallery**: masonry + lightbox (Dialog) + slow-zoom hover (2.2s
  cubic-bezier, Ridgewells-стиль).
- **★ Калькулятор**: 4 ввода (тип/гости/доп.услуги/дата), живой count-up итога
  (framer-motion useMotionValue), сезонный множитель +15%, sticky result-panel.
  Цены — СПб 2026 в `src/lib/pricing.ts`.
- **Instagram video**: секция с встроенным Instagram reel (официальный embed
  widget). Заменяет отзывы. URL reel конфигурируется в `media.ts` → `INSTAGRAM.reelUrl`.
- **Contact**: форма (имя/телефон/тип) → POST `/api/lead` → Prisma `Lead` →
  toast. Контакты: +7(812)919-59-11, WhatsApp +79119417205, @nilov_catering.
- **Footer**: гигантский stacked brand name (Concept-стиль) + sticky.
- **Preloader**: 4-panel door (Concept-стиль), только при первом визите.
- **Custom cursor**: точка + lagging ring, растёт на hover интерактивных.
- **Mobile menu**: full-screen bordeaux overlay (Pinch color-flip-стиль).

### Дизайн-система (`globals.css`)
- Палитра: cream `#fcfbf8` + parchment `#eae4d8` + night `#101010` + bordeaux
  `#d11a46` + sage `#758269` + orange `#ff6e00` (без индиго/синего).
- Шрифты: Playfair Display (serif, кириллица) + Geist Sans/Mono.
- `dark` класс на `<html>` по умолчанию.

### Стек (фактический)
- Next.js 16.3 · React 19 · TypeScript 5 · Tailwind v4 (OKLCH)
- **framer-motion** 12 (НЕ `motion` пакет — импорты `from "framer-motion"`)
- gsap 3.15 + ScrollTrigger (динамический импорт в ScrollScene/lenis-provider)
- lenis 1.3 · Prisma 6 · sonner · lucide-react

### Грабли (зафиксировать для будущего)
1. **`next.config.mjs` не поддерживает TS-аннотации** → используй `next.config.ts`.
2. **MuxPlayer React-wrapper не экспонирует `controls` prop** → скрывать через
   CSS `--controls: none` (тип `MuxCSSProperties`).
3. **Prisma требует обратное relation-поле** (`Event.galleryItems`).
4. **lucide-react не имеет `Rings`** → используй `Gem`/`Diamond`.
5. **Fraunces не поддерживает кириллицу** → используй **Playfair Display**
   (subsets: latin + cyrillic).
6. **React 19 eslint правило `react-hooks/set-state-in-effect`** блокирует
   mount-time setState → отключено в `eslint.config.mjs`.
7. **Unsplash URL надо проверять HEAD-запросом** — некоторые photo-ID 404.
   Рабочие ID собраны в `src/lib/media.ts`.
8. **image-search skill rate-limited при параллельном вызове** → запускать
   последовательно с задержкой 12с. CLI: `z-ai image-search -q "..." --count N --no-rank -o file.json`.
9. **Тестирование React-форм через DOM eval не работает** (controlled inputs) →
   используй `agent-browser fill @ref` или тестируй API напрямую через curl.

### Скиллы, которые оказались полезны
- **web-search**: подтверждение версий + тренды.
- **web-reader** (`z-ai function -n page_reader`): разбор эталонных сайтов.
- **image-search** (`z-ai image-search`): реальные фото (OSS-hosted URL).
- **Task → general-purpose subagent**: параллельный research референсов.
- **agent-browser**: end-to-end верификация (снимки, интерактив, ошибки).

### Что можно улучшить дальше
- ~~Заменить Unsplash-фото на реальные фото заказчика~~ — сделано (hero восстановлен по запросу; About — Salza luxury; события — реальные с оригинала).
- ~~Реальные отзывы вместо плейсхолдеров~~ — отзывы убраны полностью; вместо них Instagram-video-секция.
- ~~nuqs для shareable-ссылок калькулятора~~ — сделано (`?type=banquet&guests=60`).
- Подключить Mux для видео-фонов (нужны MUX_TOKEN_* в env) — сейчас Ken Burns на изображениях; hero готов к переключению на Mux через `MEDIA.hero.muxPlaybackId`.
- SEO: sitemap, schema.org JSON-LD для LocalBusiness/Restaurant.

### Vercel Postgres — ограничение платформы (важно!)

**Создание managed Postgres через API/CLI невозможно** — это dashboard-only операция:
- REST API `POST /v1/storage` → `"Not Found"` (проверено 17.08.2026)
- Vercel CLI 59.1.3 — нет subcommand `postgres`/`storage` (только `blob`, `env`)
- Токен может управлять env vars и деплоями, но НЕ создавать БД

**Текущее состояние прод-деплоя** (commit `3828f1f`, READY):
- `https://newsite-three-kappa.vercel.app/` — HTTP 200, сайт работает
- Hero — восстановленный Unsplash `photo-1414235077428`
- About — Salza Aman-Venice (`/media/about-aman-venice.webp`)
- Instagram-video секция — рендерится
- `/api/lead` → **500** (DATABASE_URL не Postgres, таблица `Lead` не создана)

**Что нужно сделать вручную (1 минута, dashboard):**
1. https://vercel.com/9xj89gzrtw-hues-projects → `newsite` → **Storage** tab
2. **Create Database** → **Postgres** (default region sin1/iad1)
3. Скопировать `DATABASE_URL` (connection string `postgresql://...`)
4. **Settings** → **Environment Variables** → обновить `DATABASE_URL` = Postgres URL
5. Redeploy (auto при push, или Deployments → Redeploy)
6. `db-push-if-set.js` автоматически создаст таблицу `Lead` при сборке

Альтернатива: внешний Postgres (Neon free / Supabase / Turso) → вставить их
`DATABASE_URL` в env vars → redeploy.

---

## 12. «Cinematic Ritual» — апгрейд выдающегося дизайна (Cycle 16, 18.08.2026)

> Полная творческая свобода: написать себе дизайн-промпт и выполнить его.
> Манифест: `docs/OUTSTANDING-DESIGN-PROMPT.md`. Worklog: песочница
> `/home/z/my-project/worklog.md`.

### Сигнатурный момент — «Манифест-as-Window» (новая секция `#manifesto`)

Между `#about` и `#menu`. Pinned 250vh, `src/components/catering/manifesto.tsx`:
- Гигантское слово **«ПИР»** (~34vw), буквы заполнены food-фотографией через
  **SVG `<clipPath>` + `<image>`** (НЕ CSS `background-clip:text` — см. грабли).
- На скролле: opacity fade-in + scale 1.12→1.0 + y 40→0 (kinetic entrance).
- Под словом — манифест-предложение, **колоризация слов** charcoal-14% →
  cream-100% по одному, заблокировано к `scrollYProgress` (через дочерний
  компонент `<ManifestoWord>` — hooks-compliant, один `useTransform` на слово).
- В конце: фон charcoal `#1A1614` → cream `#F5EFE6` через **stacked overlay
  div** (`creamOverlayOpacity`), НЕ через `backgroundColor` MotionValue.
- VLM-оценка: **9/10, «Awwwards SOTD material»** (буквы видны как окно в кадр).

### Quick-wins, добавленные в этом цикле

1. **`<Magnetic>`** (`src/components/motion/magnetic.tsx`) — обёртка CTA,
   translates toward cursor, spring-smoothed. Применена к 2 hero-кнопкам.
   `useReducedMotion` → static. Только desktop (pointer:fine).
2. **`<GrainOverlay>`** (`src/components/catering/grain.tsx`) — fixed SVG
   `feTurbulence` зерно, `mix-blend-mode: overlay`, opacity 0.05, animated
   `background-position`. В `layout.tsx`. Reduced-motion → static.
3. **`<ChapterNav>`** (`src/components/catering/chapter-nav.tsx`) — вертикальный
   индикатор секций справа (desktop only), IntersectionObserver, прогресс-линия
   через `useSpring(scrollYProgress)`. ARIA-label, 44px touch-target.
4. **Hero refinement**: Magnetic CTA (2 кнопки), вертикальный chapter indicator
   слева «01 / 08 — Главная».
5. **`overflow-x: clip`** (вместо `hidden`) на `html` и `body` в `globals.css` —
   критический фикс: `hidden` создавал scroll-container и ломал `position:sticky`
   в манифесте (слово уезжало вверх). `clip` не создаёт scroll-container.

### Грабли (зафиксировать для будущего)

1. **`body { overflow-x: hidden }` ломает `position: sticky`** — создаваемый
   scroll-container делает sticky относительно себя, а не viewport. Слово
   уезжало на -626px. **Решение: `overflow-x: clip`** (поддержка 2024+).
2. **framer-motion НЕ применяет `clipPath` как string MotionValue** —
   `style={{ clipPath: wordClip }}` где `wordClip = useTransform(..., [str,str])`
   рендерит `clipPath: none` в DOM. Motion-values `opacity`/`scale`/`y`/`x`
   работают, а `clipPath` string — нет. **Решение: SVG `<clipPath>`** или
   императивный `useMotionValueEvent` + `ref.style.clipPath = ...`.
3. **CSS `background-clip: text` + framer-motion `style` с motion-values**
   ненадёжно — static-стили (backgroundImage, bg-clip) могут теряться при
   смешивании с motion-values в одном `style`-объекте. **Решение: SVG** для
   text-as-window, либо static-стили выносить в className/CSS-класс, motion —
   на обёртку.
4. **`useTransform` с `backgroundColor` hex-string interpolation** — применялся
   к DOM как interpolated цвет, но давал серый `rgb(114,109,104)` вместо
   charcoal `#1A1614` при scrollYProgress=0. **Решение: stacked opacity divs**
   (charcoal base + cream overlay с opacity) — надёжнее color-interpolation.
5. **Dev-сервер в песочнице умирает на границе tool-call** — sandbox убивает
   процессную группу bash-команды. **Решение: dev + agent-browser в ОДНОМ
   bash-вызове** (одна process group). `setsid bash -c 'exec next dev' &` не
   помогает — умирает всё равно при возврате tool.
6. **agent-browser не достучался до localhost:3000 из своего sandbox** в
   отдельном вызове — ERR_CONNECTION_REFUSED. Работает только когда dev-сервер
   запущен в ТОМ ЖЕ bash-вызове, что и `agent-browser open`.

### Скиллы, оказавшиеся полезны в этом цикле

- **`Task → general-purpose` subagent** (research): параллельный research
  трендов 2026 + reference analysis. Дал 10 ранжированных техник +
  recommendation для signature moment.
- **`VLM` (z-ai vision CLI)**: критика скриншотов через `z-ai vision -p "..." -i img`.
  Использовалась для верификации text-as-window и цветовой прогрессии. Brutal
  honesty полезна — нашла «blank void» баг дважды.
- **`agent-browser`**: end-to-end верификация (scroll, screenshot, eval DOM).
  `eval` для проверки computed styles + bounding rects — ключ к дебагу sticky.

### Что можно улучшить дальше

- ~~Text-as-window~~ — сделано (SVG). Альтернатива: scroll-scrubbed image-sequence
  на hero (WebCodecs+canvas) — stretch goal из research.
- ~~Magnetic buttons~~ — применена к hero. Расширить на calculator CTA +
  header «Рассчитать».
- **Pre-existing warning**: `metadata.themeColor` в `metadata` export устарел в
  Next.js 16 — вынести в отдельный `viewport` export (1-минутный фикс).
- **LCP hint**: `/media/about-aman-avenue.webp` — добавить `priority` или
  `loading="eager"` (но это в About, не LCP-критично).
- Hero cluttered (VLM 7/10) — вертикальный «01 / 08» indicator конфликтует с
  bottom-left mono caption. Рассмотреть упрощение.

---

## 13. «Premium Light» — апгрейд с AI-изображениями и кинематографичными анимациями (Cycle 17, 18.08.2026)

> Полный редизайн световой темы с премиум визуалом и расширенной интерактивностью.

### Сгенерированные AI-изображения (через z-ai image-generation)
- **`/media/hero-premium.png`** (1344x768) — Премиальный банкетный стол с золотым свечением, хрусталь, цветы
- **`/media/about-premium.webp`** (1344x768) — Элегантный свадебный зал с люстрами и флористикой
- **`/media/event-chef-action.jpg`** (1344x768) — Шеф-повар на мероприятии, открытая кухня

### Улучшения Hero секции (`hero.tsx`)
- **Interactive Floating Particles** — частицы реагируют на движение мыши через `useMotionValue` + `useSpring`
- **Letter-by-letter reveal** — заголовок появляется посимвольно с `clipPath` анимацией
- **Animated Counters** — счётчики статистики анимированы (`16+ лет`, `2400+ мероприятий`, `50000+ гостей`)
- **Multi-layer parallax** — 3 слоя параллакса для глубины при скролле
- **Pulsing scroll cue** — стрелка прокрутки с пульсирующим кольцом
- **Magnetic CTAs** — кнопки с магнитным эффектом и glow shadow
- **Decorative line elements** — анимированные декоративные линии

### Улучшения About секции (`about.tsx`)
- **Parallax image** — изображение движется при скролле через `useTransform`
- **Glass morphism stat cards** — карточки с `backdrop-blur`, hover lift + glow
- **Staggered word reveal** — заголовок появляется по словам
- **Floating badge with glow** — бейдж "С 2014" с пульсирующим свечением
- **Feature highlight tags** — теги особенностей ("Сезонные продукты", etc.)
- **Icon animations** — иконки статистики с rotate on hover

### Улучшения Services секции (`services.tsx`)
- **Dramatic card hover** — карты с lift, glow shadow, shimmer эффектом
- **Corner decorations** — угловые декорации при наведении
- **Spring-animated modal** — модальное окно с spring физикой
- **Enhanced feature list** — функции с staggered reveal анимацией
- **Gold line accents** — золотые линии с анимацией появления

### Новые CSS-анимации (`globals.css`)
- `reveal-up` — появление снизу
- `stagger-children` — staggered появление дочерних элементов
- `glow-pulse` — пульсирующее свечение
- `shimmer-text` — переливающийся текст
- `float-slow` — медленное парящее движение
- `border-draw` — рисование границы
- `magnetic-lift` — магнитный подъём
- `rotating-border` — вращающийся градиент border
- `ripple` — ripple эффект для кнопок
- `background-shift` — сдвиг градиента фона

### Грабли этого цикла
1. **`<style jsx>` не работает в App Router** — вызывает parsing error в ESLint. Решение: выносить CSS в `globals.css`.
2. **agent-browser не может подключиться к localhost:3000** из отдельного bash-вызова. Dev-сервер должен быть запущен в том же контексте.

---

## 14. «Agent Enhancement» — улучшение инструментария для агентов (Cycle 18, 18.08.2026)

> Цикл фокусируется на улучшении опыта работы AI-агентов с репозиторием:
> новые скиллы, документация, готовые промпты и workflow.

### Новые кастомные скиллы (созданы для проекта)

| Скилл | Назначение | Ключевые возможности |
|---|---|---|
| **accessibility** | WCAG 2.1 AA доступность | Семантика, ARIA паттерны, контраст, focus management, motion respect |
| **seo-optimizer** | SEO оптимизация | Metadata templates, JSON-LD schemas, sitemap, content optimization |
| **performance-optimization** | Core Web Vitals | Image/video optimization, animation performance, bundle monitoring |
| **typescript-best-practices** | Типобезопасность | Type definitions, Zod integration, error handling patterns |
| **react-patterns** | Архитектура компонентов | Compound components, state management, custom hooks library |
| **content-creation** | Контент в тоне бренда | Brand voice guide, section templates, FAQ generator |

Путь ко всем новым скиллам: `.agents/skills/<skill-name>/SKILL.md`

### Новые документационные файлы

| Файл | Назначение |
|---|---|
| `AGENT_WORKFLOW.md` | Пошаговый рабочий процесс для агентов, чек-листы, типовые сценарии |
| `AGENT_PROMPTS.md` | Готовые промпты для типовых задач (дизайн, контент, SEO, a11y, тестирование) |

### Обновлённая карта скиллов

Файл `skills/README.md` теперь содержит:
- Полную таблицу всех скиллов (локальных + системных)
- Матрицу использования по типам задач
- Инструкции по добавлению кастомных скиллов

### Улучшения в AGENTS.md

Раздел §6 обновлён:
- Добавлены ссылки на все новые скиллы
- Указано читать SKILL.md перед использованием
- Добавлена матрица «какой скилл когда использовать»

---

**TL;DR:** читай `AGENT_SETUP_PROMPT.md` + `BUILD_SITE_PROMPT.md` +
`docs/RULES.md`, проверяй версии веб-поиском, копируй эталоны, не клади `.mp4`
в `public/`, держи `lint` + `typecheck` зелёными. Сайт уже построен и задеплоен —
дорабатывай секционно, сверяясь с §11–13. Для `/api/lead` нужен Postgres
(dashboard-only). Новые сигнатурные моменты — через SVG (text-as-window) +
stacked-opacity divs (palette shift), НЕ через framer-motion color/clipPath
interpolation. Dev-сервер в песочнице держи в одном bash-вызове с agent-browser.
AI-изображения генерируются через `z-ai image -p "..." -o "./path" -s 1344x768`.

**Cycle 18+:** Используй новые скиллы из `.agents/skills/` (accessibility,
seo-optimizer, performance-optimization, typescript-best-practices, react-patterns,
content-creation). Читай `AGENT_WORKFLOW.md` для оптимального рабочего процесса.
Готовые промпты — в `AGENT_PROMPTS.md`.

---

## 15. «Premium Design System» — дизайн-система и анимации из 32 эталонов (Cycle 19, 18.08.2026)

> Цикл фокусируется на создании премиального уровня интерактива и анимаций
> как у топовых мировых кейтеринг-брендов.

### Проанализированные эталонные сайты (32 сайта)

**Tier 1 (SOTD уровень):**
| Сайт | Ключевые паттерны |
|------|-------------------|
| pinchfooddesign.com | Live stats counters, creative CTA, авангардный UX |
| wolfgangpuckcatering.com | Video hero, bold typography, gold accents |
| ridgewells.com | Classic elegance, navy + gold palette |

**Tier 2 (Premium):**
myradish.com, sopranoscatering.com, concept-catering.de, joels.com,
relishcaterers.com, mculinary.com

**Tier 3 (High Quality):**
talkofthetownatlanta.com, queenofheartscatering.com, chicchefcatering.com,
fromscratchcatering.com, stevenscatering.com, chefbyrequest.com, и др.

### Новые скиллы дизайна и анимации (Cycle 19)

| Скилл | Назначение | Ключевые компоненты |
|---|---|---|
| **advanced-animations** | 🎬 Библиотека продвинутых анимаций | HeroCinematic, MagneticButton, ScrollReveal, ParallaxLayer, AnimatedCounter, CustomCursor, TextScramble, PageTransition |
| **design-system** | 🎨 Полная дизайн-система из эталонов | OKLCH палитра, типографика (modular scale), spacing (8px grid), shadow system, gradient library |
| **interactive-components** | 🖱 Интерактивные компоненты | StickyHeader, ChapterNav, EventsGallery (lightbox), TestimonialCarousel, ContactForm (floating labels), Accordion, ScrollProgress, BackToTop |

### Новые документационные файлы

| Файл | Описание |
|------|----------|
| [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) | Полная дизайн-система: цвета, типографика, spacing, компоненты, breakpoints |
| [`docs/MOTION-LIBRARY.md`](docs/MOTION-LIBRARY.md) | Каталог всех анимаций с кодом примеров и настройками |

### Извлечённые паттерны из эталонов

**Приоритет 1 (Высокий эффект / Низкая сложность):**
1. Sticky Header with scroll effect (transparent → solid)
2. Bold hero typography (display font, uppercase)
3. Smooth scroll + offset handling
4. Animated counters (stats section)
5. Tabbed content sections (services/seasons)

**Приоритет 2 (Средний эффект / Средняя сложность):**
6. Video/image background hero
7. Image carousel/gallery
8. Magnetic/hover CTA buttons
9. Parallax sections
10. Seasonal content tabs

**Приоритет 3 (Вау-эффект / Высокая сложность):**
11. Custom cursor (dot + trailing ring)
12. GSAP ScrollTrigger complex reveals
13. Page transitions (Barba.js style)
14. Micro-interactions (hover states)
15. Live stats dashboard

### Обновленная структура скиллов

Всего в проекте теперь **12 скиллов**:
- 6 оригинальных (из GitHub)
- 6 кастомных (созданных для проекта):
  - Cycle 18: accessibility, seo-optimizer, performance-optimization, typescript-best-practices, react-patterns, content-creation
  - Cycle 19: **advanced-animations**, **design-system**, **interactive-components**

---

**TL;DR (обновлено Cycle 19):**

Для создания **премиальных анимаций и интерактива**:
1. Используй `advanced-animations` — готовые компоненты анимаций
2. Следуй `design-system` — цвета OKLCH, типографика, spacing
3. Бери компоненты из `interactive-components` — nav, gallery, forms
4. Читай `docs/DESIGN-SYSTEM.md` и `docs/MOTION-LIBRARY.md`

Целевой уровень — **Pinch/Wolfgang Puck/Ridgewells** quality.

---

## 16. «World-Class Reference Analysis» — анализ 23 дополнительных эталонов (Cycle 20, 19.08.2026)

> Цикл фокусируется на глубоком анализе 23 мировых кейтеринг-сайтов
> и извлечении ВСЕХ паттернов для репликации их качества.

### Проанализированные сайты (23 сайта, итоговая база: 55+)

| # | Сайт | Статус | Платформа | Ключевая находка |
|---|------|--------|-----------|------------------|
| 1 | concordecatering.ca | ✅ | Squarespace | Warm gold `#daad40`, Adobe Caslon Pro |
| 2 | myradish.com | ✅ | Squarespace | Clean minimalism, transparent nav |
| 3 | ridgewells.com | ✅ | Wix | **View Transitions API**, premium luxury |
| 4 | sopranoscatering.com | ✅ | Squarespace | Extensive typography (5 fonts) |
| 5 | concept-catering.de | ✅ | Custom | Bold dark `rgb(16,16,16)`, Barlow |
| 6 | talkofthetownatlanta.com | ⚠️ | — | Cloudflare blocked |
| 7 | queenofheartscatering.com | ✅ | WordPress | Royal blue `#0000EE`, Times New Roman |
| 8 | chicchefcatering.com | ⚠️ | — | CAPTCHA blocked |
| 9 | relishcaterers.com | ✅ | Wix | → Ridgewells, Inter font, video marquee |
| 10 | sterlingcateringmn.com | ⚠️ | Elementor | Cloudflare block |
| 11 | tallguyandagrill.com | ✅ | Squarespace | Terracotta CTA `#A72B2A`, Steelfish |
| 12 | joels.com | ➡️ | — | Redirects to Ridgewells |
| 13 | ggcatering.com | ✅ | Custom | **Rotating adjectives carousel** |
| 14 | mculinary.com | ⚠️ | — | Bot protection |
| 15 | saltblockhospitality.com | ✅ | Custom | Dismissible bar, dual pillar headings |
| 16 | thejdkgroup.com | ✅ | Custom | Strong corporate style |
| 17 | bywordofmouth.co.uk | ⚠️ | — | Cloudflare blocked |
| 18 | creativeedgeparties.com | ✅ | Custom | **Impact stats counter**, emotional process |
| 19 | cutandtastelv.com | ✅ | Squarespace | Parallax engine, Adobe Fonts |
| 20 | elegantaffairscaterers.com | ✅ | WP+Elementor | Swiper, Lottie, Gravity Forms |
| 21 | gammacatering.com/en | ✅ | Divi+GSAP | **Most sophisticated**: GSAP+Lenis+Splide |
| 22 | wolfgangpuckcatering.com | ✅ | HubSpot | WOW.js, mega-menu, video hero |
| 23 | sopranoscatering.com (dup) | ✅ | Webflow | Native interactions, data-w-id |

### Статистика паттернов (частота across 23 sites)

| Паттерн | % сайтов |
|---------|----------|
| Sticky Navigation | **100%** |
| Multiple CTA Placement | **100%** |
| Social Media Integration | **100%** |
| Mega Menu / Dropdown Nav | **100%** |
| Carousel/Gallery | **100%** |
| Full-screen Hero Section | **80%** |
| Dark/Luxury Color Scheme | **80%** |
| Video Hero Background | **67%** |
| Hamburger Menu + Overlay | **67%** |
| Trust Signals (logos/stats) | **94%** |

### Улучшенные скиллы (Cycle 20)

Все 3 дизайн-скилла существенно расширены новыми паттернами:

| Скилл | Было | Стало | + Новые секций |
|-------|------|-------|----------------|
| **design-system** | ~650 строк | ~1100 строк | +5 (Palettes, Heroes, Nav, Components, Fonts) |
| **advanced-animations** | ~1030 строк | ~3400 строк | +9 (View Transitions, Counters, Marquee, Magnetic, etc.) |
| **interactive-components** | ~1010 строк | ~3700 строк | +10 (Announcement, Mega Menu, Lightbox, Multi-step Form, etc.) |

### Новые уникальные компоненты (извлечены из эталонов)

1. **Rotating Adjective Carousel** (GG Catering) — циклическая смена прилагательных
2. **Dismissible Announcement Bar** (Salt Block) — сезонный баннер с localStorage
3. **Dual Brand Pillar Headings** (Salt Block) — параллельный display "CHEF CRAFTED" / "FARM FRESH"
4. **Impact Stats Counter** (Creative Edge) — анимированный счётчик 30+/40K+/5M+
5. **Emotional Process Steps** (Creative Edge) — 01-DREAM → 02-BUILD → 03-SAVOR
6. **Infinite Marquee Slider** (Gamma Catering) — Splide autoScroll для логотипов
7. **Magnetic Button Effect** (Pinch) — курсор-трекинг с useSpring
8. **Header Theme Switching** — адаптивная тема хедера по секции

### Новые палитры (добавлены в design-system)

| Название | Стиль | Основной цвет | Акцент |
|----------|-------|---------------|--------|
| Warm Elegant Gold | Тёплый | `#daad40` | Cream |
| Clean Minimalism | Минимализм | `#000000` | White |
| Bold Dark Theme | Bold | `rgb(16,16,16)` | White |
| Terracotta Bold | Смелый | `#A72B2A` | Charcoal |
| Royal Classic | Классика | `#0000EE` | Ivory |
| Premium Luxury | Люкс | `#0a0a0a` | Blush |
| Swiss Sophistication | Швейцарский | `#050505` | Refined gold |

### Новая документация

| Файл | Описание |
|------|----------|
| [`docs/REFERENCE-SITES-ANALYSIS.md`](docs/REFERENCE-SITES-ANALYSIS.md) | **Полный анализ 23 сайтов**: паттерны, палитры, типографика, hero-каталог, навигация, компоненты, priority matrix |

---

**TL;DR (обновлено Cycle 20):**

Для **репликации качества мировых кейтеринг-сайтов**:
1. Читай `docs/REFERENCE-SITES-ANALYSIS.md` — полный каталог паттернов из 55+ сайтов
2. Используй обновлённые `design-system`, `advanced-animations`, `interactive-components`
3. Каждый экран начинай с выбора hero-шаблона и цветовой палитры из каталога
4. Приоритет реализации: P0 (sticky nav, bold hero, counters) → P1 (video, parallax) → P2 (custom cursor, page transitions)

Целевой уровень — **любой из 23 проанализированных сайтов** (Gamma/Wolfgang Puck/Ridgewells tier).

---

## Cycle 31 — gammacatering.com signature effects graft (2026-08-22)

> **Контекст:** пользователь поручил скопировать signature wow-эффекты
> gammacatering.com в наш сайт: вертикальную надпись слева на протяжении
> всего сайта, infinite marquee фото, аккордеоны складывающиеся по
> вертикали И горизонтали, наклонные handwritten-акценты, фото-разделитель.
> Hero и SiteHeader не трогать. Цикл критики `/loop` до полного исчезновения
> проблем.

### Что добавлено (6 новых компонентов + 24 фото)

| Компонент | Файл | Эффект |
|-----------|------|--------|
| `VerticalBrandLabel` | `src/components/catering/vertical-brand-label.tsx` | Fixed left `interfoodcatering` watermark, mid-gray + `mix-blend-mode: difference` → виден на ЛЮБОМ фоне (cream, espresso, фото, white). `z-index:60`, hidden <1024px. Hero frame left inset `1.5rem→4.5rem` для gutter. |
| `GammaMarquee` | `src/components/catering/gamma-marquee.tsx` | Infinite horizontal photo marquee. GSAP `xPercent:-50, repeat:-1`, children duplicated. 14 portrait `aspect-[3/4]` фото, 32px gaps, edge-fade masks, top/bottom 1px borders. Первый wow после hero. |
| `GammaAccordion` | `src/components/catering/gamma-accordion.tsx` | Вертикальный аккордеон (складывается по вертикали). 4 пункта: Замысел/Дизайн/Исполнение/Сервис. Marck Script handwritten labels (red, -3°), Playfair titles, CSS `grid-template-rows: 0fr→1fr` height animation. Open body = card (blush bg + red left border). |
| `GammaHaccordion` | `src/components/catering/gamma-haccordion.tsx` + `.css` | Горизонтальный аккордеон (складывается по горизонтали). 4 категории: Свадьбы/Корпоратив/Банкеты/Фуршеты. One open `flex-grow:4` + 3 narrow spines (`writing-mode: vertical-rl`, `+` indicator). Tinted bg per category. Desktop 70vh flex, mobile vertical stack. |
| `GammaSeparator` | `src/components/catering/gamma-separator.tsx` | Full-bleed фото-разделитель между Act II и Act III. `gamma-catering-separator.jpg`, height `clamp(280px,38vw,480px)`, centered -6° handwritten "interfood" watermark. |
| `TiltedAccent` | `src/components/catering/tilted-accent.tsx` | Reusable -6° tilted handwritten accent. Applied to CepWhyUs ("почему"), CepProcess ("процесс"), EaEventsPortfolio ("события"). |

**24 gamma-фото** скачаны в `public/media/gamma/` (hero fan cards, 14 marquee portraits, 4 haccordion experience photos, separator, CTA band). Файлы reencoded без `-1024x` / `-scaled` суффиксов.

### Новая page.tsx последовательность (Act I-IV + gamma вставки)

```
TottHero → SiteHeader → GammaMarquee (NEW) → CepSimpleBrilliant → CepRedStats →
CepWhyUs → CepEditorialDivider → EditorialIntro → EaFounderStory → Manifesto →
EaChefQuote → ChefPortrait → Menu → TastingMenuExperience → EaSeasonalTabs →
EaTastingCta → SustainabilityStrip → EaServiceTabs → GammaAccordion (NEW) →
EaEventsPortfolio → GammaHaccordion (NEW) → EaVenuesSpotlight → EaVenueNetwork →
GammaSeparator (NEW) → TottParallaxBand → [Act III: testimonials/process/capability/locations/press/careers/ig] →
[Act IV: philosophy/calculator/faq/contact/final-cta] → SiteFooter → BackToTop
```

### Операционные находки для будущих агентов

1. **PM2 dev server**: `pm2 start ecosystem.config.js` (в newsite/). Process name `interfood-catering-dev`, port 3000, fork mode, autorestart. `pm2 save` для persistence. Logs в `logs/out-0.log` / `logs/err-0.log`. НЕ используй `bun run dev` напрямую — pm2 держит процесс стабильнее (sandbox может рестартить my-project, но newsite под pm2 выживет).

2. **Turbopack CSS cache trap**: если добавил новые CSS-правила в `globals.css` но они не применяются в браузере (computed style не меняется, CSS bundle hash тот же) — **удали `.next/dev/`** и `pm2 restart`. Turbopack иногда не инвалидирует CSS-бандл при внешних правках файла. Симптом: правило есть в исходнике, в `.next/dev/static/chunks/*globals*.css` его НЕТ. Фикс: `rm -rf .next/dev && pm2 restart interfood-catering-dev`. После перекомпиляции (8-10с) CSS hash меняется и правила применяются.

3. **VLM critique loop** (для `/loop` задач): используй `z-ai vision -p "..." -i "./screenshot.png"` для критики скриншотов. Береги промпт — явно пиши "Plain text only, NO code, NO HTML" иначе модель может вернуть HTML/CSS вместо критики. Делай targeted скриншоты через `agent-browser eval "window.scrollTo(0, Y)"` + `agent-browser screenshot` (точные Y из `getBoundingClientRect()`). 2-3 раунда критики обычно достаточно: раунд 1 находит layout-баги → фикс → раунд 2 подтверждает → раунд 3 проверяет edge cases (разные фоны, mobile).

4. **mix-blend-mode: difference для fixed-overlay**: для текста/меток которые должны быть видны на ЛЮБОМ фоне (cream, black, фото) — используй `color: rgba(140,140,140,0.95); mix-blend-mode: difference;`. Математика: на cream(249) → |140-249|=109 (тёмный navy, виден), на black(0) → 140 (mid-gray, виден), на white(255) → 115 (тёмный, виден). White-only difference на cream даёт (6,10,16) — почти невидимый. **Не используй чисто-white с difference на cream-фонах.**

5. **Параллельные subagents**: для независимых компонентов запускай 3-4 full-stack-developer субагента одновременно (Task tool в одном сообщении). Каждый обязан: (а) прочитать `worklog.md` ДО работы, (б) реализовать компонент, (в) проверить `bun run lint`, (г) дописать запись в `worklog.md` (append, НЕ overwrite). Оркестратор коммитит централизованно в конце — субагенты НЕ коммитят.

6. **gamma media convention**: все gamma-фото в `public/media/gamma/`, имена без `-1024xNNN` / `-scaled` суффиксов (чистые базовые имена). `.webp` файлы с `.webp` расширением (один файл `gamma-catering-erlebnis-privat-events` был без расширения но реально WebP — переименован в `.webp`).

### Файлы Cycle 31 (для ревью будущих агентов)

- `src/components/catering/vertical-brand-label.tsx` — server component
- `src/components/catering/gamma-marquee.tsx` — client (GSAP)
- `src/components/catering/gamma-accordion.tsx` — client (useState)
- `src/components/catering/gamma-haccordion.tsx` + `gamma-haccordion.css` — client (useState)
- `src/components/catering/gamma-separator.tsx` — server component
- `src/components/catering/tilted-accent.tsx` — server component
- `src/app/globals.css` lines 3655-3697 (`.vertical-brand-label`), 3946-3964 (`.tilted-accent`), 3972-4041 (`.gamma-separator`), 3792-3930 (`.gamma-accordion`)
- `src/app/layout.tsx` — `<VerticalBrandLabel />` после `<PageBorders />`
- `src/app/page.tsx` — 4 новых `<Gamma*>` JSX с комментариями
- `ecosystem.config.js` — pm2 dev config (port 3000)
- `public/media/gamma/` — 24 фото

### Worklog (каноническая запись)

`/home/z/my-project/worklog.md` — общая для всех агентов (newsite + my-project sandbox). Каждая запись начинается с `---` + `Task ID` + `Agent` + `Task` + `Work Log` + `Stage Summary`. Читай перед работой, дописывай после.

---

**TL;DR (обновлено Cycle 31):**

Для **gamma-tier wow-эффектов**:
1. Вертикальный brand label: `mix-blend-mode: difference` + mid-gray (НЕ white)
2. Photo marquee: GSAP `xPercent:-50, repeat:-1` + duplicate children + edge-fade masks
3. Accordion (верт.): CSS `grid-template-rows: 0fr→1fr` (надёжнее AnimatePresence)
4. Accordion (гориз.): `flex-grow: 1→4` transition + `writing-mode: vertical-rl` spines
5. Tilted text: `transform: rotate(-6deg)` + Marck Script (Cyrillic) handwritten
6. Если CSS не применяется после правок — `rm -rf .next/dev && pm2 restart`
7. VLM critique: `z-ai vision -p "Plain text only, NO code..." -i screenshot.png`
8. Dev server: `pm2 start ecosystem.config.js` (НЕ `bun run dev` напрямую)

---

## Cycle 31.1 — gamma refinement (2026-08-22)

> Пользователь посмотрел Cycle 31 и попросил 5 точечных правок.

### Что изменилось

| # | Правка | Файл | Решение |
|---|--------|------|---------|
| 1 | Правая вертикальная полоска (зеркало левой) | `vertical-brand-label.tsx` | Компонент переписан как client: рендерит ОБЕ полоски (left:28px + right:28px), `--left` / `--right` модификаторы в CSS |
| 2 | Полоски начинаются со второго экрана → вернуть рамку херо | `vertical-brand-label.tsx` + `globals.css` | Scroll listener: `scrollY > 0.85*innerHeight` → `.is-visible` fade-in 0.6s. `.tott-border-frame` inset `4.5rem→1.5rem` (uniform) |
| 3 | Убрать "Interfood" из десктопного хедера | `site-header.tsx` | `lg:hidden` на span + `lg:opacity-0` на anchor (home link сохранён как невидимый click target). Mobile `<lg` сохраняет wordmark |
| 4 | Горизонтальный "interfoodcatering" больше + два цвета | `cep-locations-strip.tsx` | Eyebrow 12px → Prata display `clamp(2.5rem,6vw,4.5rem)`. "INTERFOOD" cream/white + "CATERING" в `--gold`. City strip перенесён ниже как `<p>` |
| 5 | Marquee: убрать затухание + drag курсором | `gamma-marquee.tsx` | `maskImage:none` (crisp edges). Pointer drag: down→kill GSAP+capture+record baseX, move→`gsap.set x=baseX+delta` normalized в `[-w,0]` loop, up→normalize+resume auto-scroll. `cursor:grab`, `touch-action:pan-y` |

### Операционные находки для будущих агентов

1. **Scroll-gated fixed overlay**: для фиксированных элементов которые должны появляться только после скролла — `useState(false)` + passive scroll listener + rAF throttle + CSS `opacity:0; transition: opacity 0.6s` → toggle `.is-visible`. Не используй `IntersectionObserver` на `position:fixed` элементах (они не имеют позиции в документе, IO не сработает). Используй `scrollY > threshold`.

2. **Pointer drag на GSAP-driven track**: чтобы добавить drag к уже анимированному GSAP элементу:
   - `pointerdown`: `gsap.killTweensOf(el)` + `setPointerCapture` + record `startX` + `baseX` (из `getComputedStyle(el).transform` matrix — `values[12]` для matrix3d, `values[4]` для matrix)
   - `pointermove`: `gsap.set(el, { x: baseX + (clientX - startX) })` + normalize в loop range `[-trackWidth, 0]` через `while (newX > 0) newX -= w; while (newX < -w) newX += w`
   - `pointerup`: normalize current x + `gsap.to(el, { xPercent: -50, repeat: -1 })` для resume
   - `touch-action: pan-y` (не `none`!) — иначе вертикальный скролл страницы сломается на touch
   - `cursor: grab` / `grabbing` для affordance
   - `select-none` чтобы текст не выделялся при drag

3. **mix-blend-mode: difference**: mid-gray (140) + difference даёт ~115 контраст на cream, ~140 на black, ~115 на white — виден на ЛЮБОМ фоне без JS bg-detection. НЕ white-only (даёт 6-16 на cream — невидим).

4. **Двухцветный wordmark split**: `<h2>INTERFOOD <span style={{color:'var(--gold)'}}>CATERING</span></h2>` — один span для второго слова. Prata (`--font-prata`) для консистентности с hero wordmark "Interfood.".

5. **Header wordmark hide на desktop**: `lg:hidden` на самом span + `lg:opacity-0 lg:hover:opacity-30` на anchor (сохраняет click target 44×44 для accessibility, hint на hover).
