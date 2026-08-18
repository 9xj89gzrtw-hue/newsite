# Catering Company Site

Репозиторий кейтеринговой компании. **Стек установлен и проверен; сам сайт пока
не построен** — это «инструментальный цех» для дальнейшей разработки богатых
медиа-экранов (видео, фото, интерактив, анимация).

- **Репозиторий:** [github.com/9x89gzrtw-hue/newsite](https://github.com/9x89gzrtw-hue/newsite)
- **Деплой:** Vercel (авто из `main`, preview на каждый PR)
- **Снимок актуальности:** 17 августа 2026 г. (см. [`docs/STACK-SNAPSHOT.md`](docs/STACK-SNAPSHOT.md))

## Стек

| Слой | Технологии |
|---|---|
| Ядро | Next.js 16 (App Router, Cache Components, Turbopack) · React 19 · TypeScript 5 |
| Стили | Tailwind CSS v4 (CSS-first, OKLCH) · shadcn/ui (New York) · Lucide |
| Анимация | Motion (Framer) · GSAP + ScrollTrigger · Lenis smooth scroll |
| Видео | Mux (adaptive HLS, autoplay hero) · Cloudflare Stream (fallback) |
| Фото | `next/image` + blur · AVIF/WebP |
| Данные | Prisma (SQLite → Postgres) · TanStack Query · Zustand · nuqs · Zod |
| Деплой | Vercel · GitHub Actions CI |

## Быстрый старт

```bash
bun install
cp .env.example .env        # заполнить MUX_TOKEN_*, DATABASE_URL
bun run db:push             # создать схему
bun run dev                 # http://localhost:3000
```

## Скрипты

```bash
bun run dev        # dev-сервер (порт 3000)
bun run build      # production-сборка
bun run lint       # ESLint
bun run typecheck  # tsc --noEmit
bun run db:push    # применить схему Prisma
bun run db:generate
```

## Структура

```
src/
  app/            # layout (providers) + page (плейсхолдер «готово»)
  components/
    ui/           # shadcn/ui
    media/        # VideoPlayer (Mux/CF), SmartImage
    motion/       # Reveal, Marquee, ScrollScene
    providers/    # theme, query, lenis
  lib/            # utils, db (Prisma), video (Mux/CF абстракция)
prisma/           # schema.prisma (скелет моделей)
docs/             # RULES, INSPIRATION, ANIMATION-PRESETS, STACK-SNAPSHOT
skills/           # карта навыков (README.md)
.agents/skills/   # установленные скиллы (SKILL.md)
agent/skills/     # зеркало для generic-агента
.github/workflows/  # CI
AGENT_SETUP_PROMPT.md  # «конституция» репозитория
AGENTS.md         # инструкции для агентов (читать перед работой)
```

## Правила

Перед любой работой — прочитать:
1. [`AGENTS.md`](AGENTS.md) — инструкции для агента.
2. [`AGENT_SETUP_PROMPT.md`](AGENT_SETUP_PROMPT.md) — полный промпт-конституция.
3. [`docs/RULES.md`](docs/RULES.md) — 16 правил разработки.
4. [`docs/INSPIRATION.md`](docs/INSPIRATION.md) — эталоны для копирования.

**Кратко:** сначала веб-поиск → потом решение; сначала эталон → потом своя
реализация; видео только через Mux/CF; фото через `next/image`; анимация
`transform`/`opacity` only; доступность обязательна; sticky footer; без
индиго/синего.

## Скиллы

Подключены через `npx skills add` (см. `skills-lock.json`): `find-skills`,
`skill-creator`, `frontend-design`, `brand-guidelines`, `theme-factory`,
`webapp-testing`. Полная карта — в [`skills/README.md`](skills/README.md).
