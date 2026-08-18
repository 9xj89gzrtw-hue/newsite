# INSPIRATION.md — Эталоны для копирования

> Механика «копирования лучших реализаций» (см. `AGENT_SETUP_PROMPT.md` §9).
> Перед сборкой каждого экрана — выбрать 3–5 эталонов отсюда, разобрать через
> **VLM** (скриншот → палитра/сетка/типографика/тайминги) и **web-reader**
> (DOM/секции/копирайт), воспроизвести 1-в-1 со своим контентом.

## Алгоритм работы с эталоном

1. **Найти** — `web_search "<тип экрана> catering website 2026 Awwwards"`.
2. **Извлечь** — `web-reader` по URL; VLM по скриншоту.
3. **Задокументировать** — записать в этот файл: URL, скриншот, разбор
   (секции, шрифты, цвета OKLCH, анимация, что берём).
4. **Воспроизвести** — на стеке Motion/GSAP+Lenis/Mux/`next/image`, со своим
   контентом (image-search/generation + LLM-копирайт).
5. **Адаптировать** — никаких «чужих» библиотек, только наш стек.

## Каталоги-источники (актуальны на 17.08.2026)

| Каталог | Что даёт | URL |
|---|---|---|
| colorlib «30 Best Catering Website Examples 2026» | 30 реальных сайтов с указанием платформы | colorlib.com (Mar 27, 2026) |
| siiimple | курируемая подборка appetizing-дизайна | siiimple.com |
| createtoday.io «32 Best Catering Website Examples (2026)» | 32 сайта + design stats (цвета, шрифты, layout) | createtoday.io (Aug 8, 2026) |
| Dribbble — Catering Website designs | 44 работы для насмотренности | dribbble.com |
| Awwwards — Food/Restaurant | премиум-эталоны анимации | awwwards.com |
| SiteInspire | curated food/event sites | siteinspire.com |
| mycodelesswebsite.com «Best Catering Website Examples of 2026» | подборка с разбором | mycodelesswebsite.com (Dec 29, 2025) |
| wordstream «13 Brilliant Restaurant Website Designs to Copy in 2026» | рестораны (близко к кейтерингу) | wordstream.com (Jan 7, 2026) |

## 5 эталонов-архетипов (что берём с каждого)

> Конкретные URL подставляются из каталогов выше перед стартом экрана.
> Ниже — архетипы и «что копировать».

### 1. Премиальный fine-dining кейтеринг (Awwwards-уровень)
- **Тип**: тёмный фон (espresso), крупная serif-типографика, полноэкранные
  видео-героики с медленным зумом, параллакс фото блюд.
- **Что берём**: hero video loop (через `VideoPlayer` Mux, `autoPlay muted
  loop hideControls`), `Reveal` каскадом, `ScrollScene` параллакс на фото,
  serif `Playfair Display` для заголовков (уже в `layout.tsx`).
- **Палитра**: наш `.dark` (espresso + terracotta + honey) — уже готова.

### 2. Сезонное меню / farm-to-table (colorlib-примеры)
- **Тип**: светлый кремовый фон, много воздуха, фуд-фотография крупным
  планом, мягкие reveal-анимации, фильтры по категориям.
- **Что берём**: `SmartImage` с blur-плейсхолдерами, `Marquee` для ленты
  сезонных продуктов, `nuqs` для URL-фильтров категорий меню, Zustand для
  корзины заказа.

### 3. События / portfolio галерея (siiimple)
- **Тип**: masonry/асимметричная сетка фото+видео, hover-раскрытие,
  lightbox-просмотр.
- **Что берём**: CSS Grid + `ScrollScene` parallax, hover-зум на
  `SmartImage`, модалка на shadcn `Dialog` для lightbox, `VideoPlayer` для
  видео-элементов галереи.

### 4. История бренда / «руки поваров» (Awwwards storytelling)
- **Тип**: длинный скролл-рассказ, pinned-секции, текстовые эффекты
  (split-text, mask-reveal), фоновое видео процесса готовки.
- **Что берём**: `ScrollScene` с pin + scrub, GSAP `SplitText`-аналог через
  Motion (по-символьный reveal), `VideoPlayer` как фоновый loop.

### 5. Отзывы / социальное доказательство (ресторан-примеры)
- **Тип**: автокарусель цитат, видео-отзывы клиентов, рейтинги.
- **Что берём**: `Marquee` горизонтальная лента цитат, `VideoPlayer` для
  видео-отзывов, shadcn `Card` для текстовых, TanStack Query для подгрузки.

## Чек-лист перед стартом экрана

- [ ] Выбрано ≥ 3 эталона из этого файла / каталогов.
- [ ] Каждый разобран VLM-ом (палитра, сетка, шрифты, тайминги).
- [ ] Записан разбор в новую секцию этого файла.
- [ ] Выбран «что берём» с каждого.
- [ ] Сценарий воспроизведения описан в PR-описании.
