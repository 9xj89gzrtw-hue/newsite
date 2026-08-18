# STACK-SNAPSHOT.md

> Снимок актуальности технологий — **17 августа 2026 г.**
> Каждая позиция подтверждена веб-поиском (`z-ai web_search`) 17.08.2026.
> Ссылки — на первоисточники с датами.

## Ядро

| Технология | Версия в репо | Актуально на 17.08.2026 | Источник |
|---|---|---|---|
| Next.js | `^16.1.1` (пин тестовый; линия 16.x) | **16.3** — последний релиз (рейлы от 15–16 авг 2026 в `vercel/next.js` Releases) | nextjs.org — «16.3 is now available»; github.com/vercel/next.js Releases (Aug 16, 2026); endoflife.date (last updated 15 Aug 2026) |
| React | `^19.0.0` | React 19 (Server Components, Actions, `use()`) — стандарт для Next 16 | nextjs.org — «built on the latest React features, including Server Components and Actions» |
| TypeScript | `^5.0.0` | TS 5.x | — |
| Node | `>=20` | Node 20/22 (рекомендация Vercel) | vercel.com docs |

> Примечание: `next@^16.1.1` зафиксирован как проверенно-рабочий в песочнице;
> при первом деплое на Vercel `bun install` подтянет последний 16.x (включая
> 16.3) автоматически благодаря caret-диапазону. Cache Components, стабильный
> Turbopack, React Compiler, file-system caching — всё входит в линейку 16.x.

## Стили / UI

| Технология | Версия | Источник |
|---|---|---|
| Tailwind CSS | `^4.0.0` (CSS-first, `@theme`, OKLCH) | ui.shadcn.com — «All components are updated for Tailwind v4 and React 19» |
| shadcn/ui | New York style, React 19, без `forwardRef`, OKLCH | ui.shadcn.com; buildmvpfast.com «Tailwind v4 shadcn/ui Migration Breaking Changes 2026» (Jun 5, 2026) |
| `tw-animate-css` | `^1.3.5` | заменяет `tailwindcss-animate` под Tailwind v4 |
| Lucide | `^0.525.0` | — |

## Анимация

| Технология | Пакет | Назначение | Источник |
|---|---|---|---|
| Motion (бывш. Framer Motion) | `motion@^12` | микро-взаимодействия, layout, переходы | hontran.dev «GSAP vs Framer Motion in 2026» (Jun 27, 2026); spell.sh «15 Best React Animation Libraries Compared (2026)» (Jan 10, 2026) |
| GSAP + ScrollTrigger | `gsap@^3.13` | скролл-сцены, таймлайн, SVG-морфинг, текст | gsap.com; annnimate.com (Aug 15, 2026) |
| Lenis | `lenis@^1.1.20` (переименован из `@studio-freight/lenis`) | плавный скролл + мост к ScrollTrigger | lenis.dev; edoardolunardi.dev «Building Smooth Scroll in 2025 with Lenis»; freefrontend.com «10+ lenis.js Examples» (Apr 13, 2026) |

## Видео / фото

| Технология | Пакет | Назначение | Источник |
|---|---|---|---|
| Mux | `@mux/mux-player-react@^3`, `@mux/mux-uploader-react@^1` | adaptive HLS, autoplay-героики, лучшая интеграция с Vercel | mux.com «Adding video to your Next.js application»; vercel.com «best practices for hosting videos on Vercel» |
| Cloudflare Stream | (embed via iframe) | резервный/бюджетный провайдер | cloudflare.com; buildmvpfast.com «Best Mux Alternatives (2026)» (Jun 6, 2026); pkgpulse.com «Mux vs Cloudflare Stream vs Bunny Stream 2026» (Jun 15, 2026) |
| next/image | (встроено) | AVIF/WebP, blur-плейсхолдеры, явные размеры | — |

> Vercel прямо **не рекомендует** хостить `.mp4`/`.gif` в `public/` — bandwidth
> penalty. Видео — только через Mux/Cloudflare Stream.

## Данные / состояние

| Технология | Версия | Назначение |
|---|---|---|
| Prisma + `@prisma/client` | `^6.11.1` | ORM (SQLite локально, Postgres на Vercel) |
| TanStack Query | `^5.82.0` | серверное состояние (меню, события, отзывы) |
| Zustand | `^5.0.0` | клиентское состояние (корзина, фильтры) |
| nuqs | `^2.4.0` | URL-состояние (фильтры меню) |
| Zod | `^4.0.2` | валидация |

## Деплой / качество

| Технология | Назначение |
|---|---|
| Vercel | деплой из `main`, preview на PR |
| GitHub Actions | CI: `bun run lint` + `tsc --noEmit` на каждый PR |
| ESLint 9 + `eslint-config-next` | линтинг |

## Источники вдохновения (каталоги 2026)

- colorlib.com — «30 Best Catering Website Examples 2026» (Mar 27, 2026)
- siiimple.com — «Best Catering Website Examples 2026»
- createtoday.io — «32 Best Catering Website Examples (2026)» (Aug 8, 2026)
- mycodelesswebsite.com — «Best Catering Website Examples of 2026» (Dec 29, 2025)
- sitebuilderreport.com — «20+ Inspiring Catering Website Examples» (May 2, 2026)
- dribbble.com — Catering Website designs (44 работы)
- Awwwards, SiteInspire — премиальные food/event сайты
