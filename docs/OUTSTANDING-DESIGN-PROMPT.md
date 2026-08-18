# ПРОМПТ ДЛЯ МЕНЯ: «Cinematic Ritual» — выдающийся дизайн

> Написан мной для себя. Цель — поднять сайт с ~5/10 до Awwwards-SOTD уровня
> (8–9/10). Полная творческая свобода в рамках существующей конституции
> (`BUILD_SITE_PROMPT.md`, `docs/RULES.md`).

---

## 0. Роль

Я — арт-директор + senior frontend-инженер. Сайт уже построен (15 циклов
оптимизации), но он «хороший», а не «выдающийся». Моя задача — добавить
**один сигнатурный кинематографичный момент**, которого сейчас нет, и
**пять quick-wins**, которые поднимут воспринимаемое качество на 2–3 пункта.

## 1. Главная идея — «Cinematic Ritual»

Превратить прокрутку сайта в **ритуал**: каждый скролл — жест, каждая секция —
глава. Сайт кейтеринга — это про еду как искусство и ритуал застолья. Значит,
сам скролл должен ощущаться как нарезка блюда, как поднятие крышки, как
зажигание свечи. Не «информация про кейтеринг», а **перформанс кейтеринга**.

Три принципа:
1. **Один незабываемый момент.** Сайт запоминают по одному scroll-биту. Я построю
   его — «Манифест-as-Window».
2. **Текст как окно.** Крупная типографика Playfair Display перестаёт быть
   «заголовком» — она становится **окном в кадр**: буквы заполняются едой.
3. **Каждый микро-жест живой.** Магнитные кнопки, живое зерно, курсор со
   смыслом — сайт «дышит».

## 2. Сигнатурный момент — «Манифест-as-Window»

**Расположение:** между `#about` и `#menu`. Новый `<section id="manifesto">`.

**Что происходит (250vh pinned scroll):**

1. (0%) Фон `#1A1614` (тёмный charcoal). По центру — гигантское слово
   **«ПИР»** (Playfair Display, ~38vw), буквы заполнены slow Ken-Burns
   фотографией блюда (`background-clip: text` + `color: transparent`).
   Clip-mask = тонкая горизонтальная щель по центру (`inset(45% 0 45% 0)`).
2. (0–50%) Скролл расширяет щель до полной высоты слова (`inset(0% 0 0% 0)`).
   Блюдо «открывается» сквозь буквы. Одновременно под словом проявляется
   короткий манифест: «Еда — это ритуал. Мы готовим руками, сервируем с
   любовью, и каждый жест — ради вашего застолья». Слова **колоризуются**
   по одному: charcoal-40% → cream-100%, заблокированные к прогрессу скролла.
3. (50–100%) Фон ease-ится из charcoal `#1A1614` в cream `#F5EFE6`.
   Текст-как-окно fade-ит в реальное полное фото блюда, которое дальше
   уходит естественной прокруткой в `#menu`.

**Техника:**
- `position: sticky; top: 0; height: 100vh` на внутреннем «экране», внешний
  контейнер `height: 250vh` для скролл-пространства.
- Motion `useScroll({ target: container, offset: ["start start", "end end"] })`.
- `useTransform` на `scrollYProgress` для: mask-inset, фона, opacity фото,
  colorize каждого слова.
- Слово-колоризация: `<span>` на слово, `useTransform(progress, [start, end], [0.15, 1])` → `opacity` или `color` mix.
- Ken-Burns на фоновом фото — CSS `@keyframes kenburns` (transform/opacity only).
- `prefers-reduced-motion`: рендерим финальное состояние без pinned scrub.

**Почему это «выдающийся» момент:** объединяет три Awwwards-техники
(text-as-window, word colorize, palette shift) в один scroll-бит. Это ровно
то, что отличает 8/10 от 5/10 — интегрированная сигнатура, а не россыпь
приёмов.

## 3. Пять quick-wins

### 3.1. Магнитные кнопки (Magnetic)
Обернуть 3–4 ключевые CTA в `<Magnetic>`: hero «Рассчитать», hero «Смотреть
меню», header «Рассчитать», calculator CTA. Motion `useMotionValue` + `useSpring`
(stiffness 150, damping 15). На hover — лёгкое scale. Только десктоп (pointer:fine).

### 3.2. Живое зерно (Grain)
Глобальный `position: fixed; inset: 0; z-[100]; pointer-events: none; mix-blend-mode: overlay; opacity: 0.06` SVG `<feTurbulence>` зерно. Анимация
`background-position` 0→-50px на 0.8s loop — «дышит». Поверх всего сайта.

### 3.3. Hero — кинетический масштаб + chapter indicator
- Главный заголовок: `scale` 1.15 → 0.92 по скроллу (kinetic oversized type).
- Слева вертикальный chapter indicator: «01 / 08» с текущей секцией.
- Зерно усиливается на скролле (opacity 0.06 → 0.12).
- Magnetic CTA.

### 3.4. ChapterNav — вертикальный индикатор секций
Тонкая вертикальная линия справа (desktop only), с точками на каждую секцию.
Текущая секция подсвечивается bordeaux. Прогресс-заполнение по скроллу.
`sr-only` label. Не interfering с контентом.

### 3.5. Cursor image-preview (stretch)
На пунктах меню — при hover курсор показывает мини-превью блюда. Spring-
позиционирование. Десктоп-only.

## 4. Палитра и типографика (без изменений в конституцию)

Сохраняю существующую OKLCH-палитру (cream/night/bordeaux/sage/peach). Для
манифеста добавляю один tinted-dark `--charcoal: #1A1614` (уже в globals).
Слоган-манифест — Playfair Display Italic для акцентного слова («ритуал»).

## 5. Жёсткие ограничения (не нарушать)

- `transform`/`opacity` only. Никаких `width`/`height`/`margin` в анимациях.
- `prefers-reduced-motion` — всё деградирует в финальное состояние.
- Sticky footer обязателен.
- Без индиго/синего.
- Server Components по умолчанию; `'use client'` только там, где нужны хуки.
- `lint` + `typecheck` зелёные перед коммитом.
- Agent Browser на `/` — обязательная верификация.

## 6. Definition of Done

- [ ] Секция `#manifesto` рендерится: pinned, text-clip, word colorize, palette shift.
- [ ] Magnetic обёртка на ≥ 3 CTA.
- [ ] Глобальный grain overlay.
- [ ] Hero: kinetic scale + chapter indicator + magnetic CTA.
- [ ] ChapterNav: вертикальный индикатор, a11y.
- [ ] `prefers-reduced-motion` корректно деградирует.
- [ ] Адаптив: мобайл/десктоп. На мобиле pinned-секция упрощается (не pin).
- [ ] `lint` + `typecheck` зелёные.
- [ ] Agent Browser: `/` грузится, скролл плавный, манифест играет, футер sticky.
- [ ] Commit + push.

## 7. Порядок сборки

1. `Magnetic` компонент → применить к hero CTAs (commit `feat(magnetic)`)
2. `Grain` overlay в layout (commit `feat(grain)`)
3. `ChapterNav` (commit `feat(chapter-nav)`)
4. Hero refinements (commit `feat(hero-kinetic)`)
5. `Manifesto` секция — коронный момент (commit `feat(manifesto)`)
6. Полировка, lint, typecheck, Agent Browser (commit `style(polish)`)
7. Push, обновить AGENTS.md.

**Слоган этого апгрейда:** *«Сайт, который скроллят как ритуал».*
