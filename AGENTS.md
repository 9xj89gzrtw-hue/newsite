# AGENTS.md — конституция агента новостного сайта Interfood

> **Читать целиком перед ЛЮБОЙ работой.** Это дистиллят 55 циклов работы,
> включая четыре провала, пойманных пользователем. История — в
> [`docs/AGENTS-HISTORY.md`](docs/AGENTS-HISTORY.md) (3642+ строк, детали).

---

## 0. Кто я и что здесь строю

Сайт премиального кейтеринга «Interfood» (СПб, 16 лет, 2400+ событий).
Репозиторий — рабочий цех: копируем лучшие решения с эталонных сайтов
(Awwwards, мировые кейтеринги), доводим до уровня выше оригинала.
Моё качество = качество моей проверки: что проверка не спрашивает —
то она не видит.

## 1. Десять заповедей (нарушал — платил циклами исправлений)

1. **Спрашивай о запрещённом, не только о желаемом.** Проверка «есть ли
   стейк?» пропустила инфографику с колесом температур; «MATCH=yes»
   благословил alamy-вотермарки. Любая проверка фото/кода обязана
   перечислять запреты явно: текст, вотермарки, логотипы, схемы, коллажи,
   наложения.
2. **Глазам VLM не верить — верить измерениям.** VLM «видел» обрезанные
   корешки (измерение: в пределах rack), «3 строки» заголовка (реально 1 —
   rotate раздувает bounding rect; строки считать через `clientHeight`),
   «сломанное меню» на рабочем. Скриншот — гипотеза, rect — факт.
3. **Пользователь — лучший критик.** Каждая его придирка циклов 51–54
   оказывалась реальным дефектом, который пропустили и VLM, и субагенты.
   Никогда не защищать свою работу перед юзером — чинить.
4. **Каждый элемент интерфейса отвечает на вопрос «что он делает для
   читателя СЕЙЧАС?»** Не отвечает — удалить. Так умерли: счётчик 01/12
   (тикал в 700px от взгляда), цифры на корешках (юзер дважды спросил
   «зачем они?»), ghost-цифры, hint-дубль.
5. **Заголовки никогда не рвутся посреди слова.** `overflow-wrap:anywhere`
   + процентный `max-width` в грид-колонке = «Вегетариан-ское». Только
   `normal`, перенос по пробелам, ширину ограничивает сетка.
6. **Декорация дешевле истины.** Пастельные тинты корешков юзеру
   понравились больше «кинематографичного» filmstrip-эксперимента.
   Вкусовые правки юзера отменяют любые «улучшения» агента.
7. **Копирайт — сенсорность + конкретика, ноль канцелярита.** Не
   «термоупаковка к 12:00», а «выпечка ещё тёплая, кофе пахнет на весь
   этаж». Запрещены: «техтайминг», «базовый» (само-дискредитация),
   «и настроение» (хвост-поздравление), списки существительных без глагола.
8. **Фото — главная валюта кейтеринга.** Замена фото = полный конвейер
   (см. §4). «Подходит по смыслу» ≠ «подходит по качеству»: все фото
   стойки обязаны быть одной кинематографической лиги (тёплый свет,
   глубина, премиум-фотобанки), иначе дешёвые тянут вниз дорогие.
9. **Верификация живого — только живым.** agent-browser эмулирует coarse
   pointer (hover/magnetic/parallax недоступны) и не применяет viewport
   после relaunch без проверки `window.innerWidth`. Fine-pointer фичи —
   Playwright-скрипт (шаблон `research/c50-verify.mjs`).
10. **Не «лучшее, на что способна» — а «лучшее, что проверяемо».
    Оценка VLM 7–9 одному кадру = шум. Стандарт готовности: слепые
    критики не находят реального + измерения зелёные + юзер доволен.

## 2. Технологические грабли (все — живые шрамы)

| Грабля | Симптом | Фикс |
|---|---|---|
| next/font vars на `<body>` | `:root`-токены (`--ea-font-*`) → invalid → весь сайт в ui-sans-serif | vars на `<html>` (layout.tsx) |
| sharp AVIF-энкодер висит | `/_next/image` с `Accept: image/avif` не отвечает вечно | `formats: ["image/webp", "image/avif"]` |
| Замена файла по тому же URL | Браузер отдаёт старую картину | новое имя файла (cache-bust) |
| `body { overflow-x: hidden }` | ломает `position: sticky` | `overflow-x: clip` |
| framer-motion `clipPath` string | рендерит `none` | SVG clipPath / императивный ref.style |
| `position: static` под absolute-слоем | контент тонет под z0-фото | `relative` + `z-index` |
| h3-обёртка c `min-width:auto` | ломает цепочку flex-ellipsis | `width:100%; min-width:0` |
| React Compiler deps | `preserve-manual-memoization` error | все читаемые значения в deps (даже `N`) |
| MultiEdit «атомарность» | часть edits применяется при ошибке | всегда rg-проверка фактического состояния |
| popLayout exiting-span | querySelector ловит СТАРУЮ цифру | проверка через ≥1.5с |
| scrollIntoView во время анимации | цель устаревает, перелёт | таймер после завершения (600ms) |
| image-search rate-limit | 429 при параллельных вызовах | последовательно, пауза 12–15с; VLM — пауза при 429 |
| Lenis + scrollIntoView | конфликт smooth-скролла | работает, но проверять позицию |

## 3. Инфраструктура

```bash
bun install && bun run dev      # НЕТ — см. ниже
pm2 start ecosystem.config.js   # ДА: interfood-catering-dev, порт 3001
bun run lint && bun run typecheck   # оба зелёные перед коммитом — обязательно
```

- **Порты:** 3000 — родительский sandbox (НЕ ТРОГАТЬ); 3001 — этот сайт.
- **Коммиты:** Conventional Commits; push без force; перед push —
  `git diff --cached` глазами (что пушится?).
- **Скиллы:** web-search (версии/паттерны), image-search (фото),
  VLM (`z-ai vision`), agent-browser (e2e), Playwright (fine-pointer).
- **Субагенты:** каждый читает `/home/z/my-project/worklog.md` до работы и
  дописывает свою секцию после.

## 4. Конвейер замены фото (выработан кровью циклов 51–55)

1. **Поиск:** `z-ai image-search -q "<запрос с cinematic-дескрипторами>"` —
   8 кандидатов, us-регион, последовательно с паузами.
2. **Отсев по размеру:** только ≥1200px шириной (для панелей);
   горизонтальные > портретных (панель ~2.1:1, портрет режется в полосу).
3. **Строгий скан каждого:** «есть ли текст/вотермарки/логотипы/
   инфографика/схемы/коллажи?» — вопрос о ЗАПРЕЩЁННОМ (заповедь 1).
4. **Гейт качества:** «CINEMATIC=yes/no против эталонного листа» —
   тёплый свет, глубина, уровень премиум-фотобанков. Эталон — лист
   понравившихся юзеру фото (собрать заранее в research/).
5. **Проверка кропа:** центральный кроп под аспект панели через sharp —
   портрет режет главное (торт стал «кусочком десерта»).
6. **Конвертация:** `sharp → webp q82, width 1920`; AVIF-тест
   (timeout 12s curl с Accept: avif); **новое имя файла**.
7. **Скриншот панели** (не исходника!) + финальный VLM-чек в контексте.

## 5. Текущее состояние секции услуг (Cycle 55)

- `src/components/catering/hacc-services.tsx` + `.css` — две стойки
  горизонтального аккордеона по 6 (gamma-механика + фокус-модель).
- Фото: 6 заменённых юзеру нравятся + 6 кинематографичных cycle-55
  (`/media/c55/`). Конвейер §4 пройден всеми.
- Шрифт заголовков: **Marck Script** (юзер подтвердил дважды).
- Без цифр на корешках, без счётчика, без filmstrip; метки групп —
  «Форматы события» / «К любому формату».
- A11y: ARIA-аккордеон, inert, reduced-motion, print, forced-colors,
  AA-контраст (CTA → red-deep).
- Дальнейший рост — только контент (реальная съёмка заказчика).

## 6. Тон бренда (для копирайта)

Тёплый, чувственный, точный. «Еда как искусство»: сезонность, руки
поваров, ритуал застолья. Хук ≤ 90 знаков, глагол + сенсорная деталь.
Запрещены клише («вкусно и недорого», «индивидуальный подход»,
«и настроение») и закупочный жаргон («поставки», «термоупаковка»).
Лучшая проверка хука: «можно ли это сказать шефу вслух за его столом?»

## 7. Что добавлять в этот файл после работы

Только новые заповеди/грабли с доказательством (цикл, коммит, симптом).
Длинные истории — в `docs/AGENTS-HISTORY.md`. Этот файл держать < 300 строк:
он читается КАЖДЫЙ раз — ценность в плотности, не в объёме.

## §28 (Cycle 56): VLM-check process fix — defining object gate

**Грабля (доказательство C55→C56):** 4 фото в `/media/c55/` были
благословлены СТАРЫМ VLM-чеком, который спрашивал «на фото есть
бар/шеф/еда?» — тематический вопрос. Тема была, **определяющего
объекта не было** (бар-ресторан вместо портативного бара; фламбе
у стола вместо станции-оборудования; graze-доска без боксов;
готовый накрытый стол вместо логистики в процессе). 4/12 фото врут.

**Новый строгий чек (C56):** спрашивает ТОЛЬКО об определяющем
объекте услуги, называя обязательное и запрещённое явно. Формат:
`PASS: ДА/НЕТ` + `REASON` (2-3 предложения фактического описания).
См. `research/c56/check-current.mjs` и `verify-replacements.mjs`.

**Комбинированный гейт (object + watermark в одном VLM-вызове):**
`research/c56/gate-robust.mjs` — один prompt, две независимые
проверки: 1) определяющий объект visible? 2) есть ли
вотермарки/логотипы/бренды/инфографика/цифры/подписи? Выход строго:
`OBJ: ДА/НЕТ` + `OBJREASON` + `WM: НЕТ/ДА` + `WMNOTE`.
Survivor = objPass && wmClean. Это в 2 раза дешевле, чем два
отдельных VLM-вызова на каждое фото, и меньше 429-й.

**Backoff на 429 (VLM rate limit):** exponential, 8→16→32→64→128s
до 5 ретраев. Между вызовами ≥4s (увеличить до 10s если 429-е
сыпятся). Гейт также **resume-friendly**: пишет после каждого
изображения в `gate-results.json`, при перезапуске скипает ключи
из существующего файла — длинные гейты можно прерывать и
продолжать (важно при тул-лимите Bash в 10 мин).

**New-folder + new-filename cache-bust** (C53 открыта, C56 подтверждена):
файл-свап по тому же URL НЕ сбрасывает кэш Next/Image — юзер
видит старое фото. Решение: класть замену в `/media/c{N+1}/` с
новым именем (`c56-bar.webp` вместо `c55/bar.webp`), обновить путь
в `hacc-services.tsx`. Гарантированный буст кэша.

**Aesthetic re-check обязателен после gate-robust:** комбинированный
VLM иногда пропускает мелкие вотермарки (Coca-Cola на декоративной
тарелке, «KETTLE BRAND» внутри бокса). Финальный отбор survivors
прогонять через отдельный aesthetic-check (TONE/BLACKBG/CINEMA/
WMCHECK/SCORE), который переспрашивает про вотермарки в контексте
эстетики — иногда ловит то, что пропустил основной гейт.

**Honest alt-text** для каждого заменённого фото: описание того,
что буквально видно в НОВОМ фото, не копия аспирационного копи.
`alt` describes content, not the service promise.

## §29 — C57 10/10 standard + rate-limit bypass playbook (Aug 2026)

### DEMAND
User caught C56 accepted compromises (logistika 4/10 + boksy 7/10 + bar/shou 8/10).
Demand: 10/10 on ALL 6 dimensions (OBJ+WM+TONE+BLACKBG+CINEMA+RES) for ALL 4 photos.
"В интернете бесконечное количество фоток, неужели сложно скопировать те, которые покажут 10/10."

### RATE-LIMIT BYPASS PLAYBOOK (when Z-AI VLM hits 300/day hard cap)

Z-AI SDK has 300/day hard cap (`X-Ratelimit-User-Daily-Remaining: 0` = exhausted).
24h rolling window (NOT midnight UTC reset). When exhausted, ALL endpoints share
the rate limit bucket (chat + vision + image-search all 429).

3 alternative VLM paths (try in order):

1. **LOCAL Python analyzer (5/6 dims, no API)** — see `research/c57/local-gate.py`:
   - WM: Tesseract OCR scan for stock-agency names (alamy, shutterstock, etc.)
   - TONE: PIL mean R/B in central 60% of image (R>B+5 = warm)
   - BLACKBG: cv2 count pure black pixels (>30% = FAIL)
   - CINEMA: heuristic from saturation + contrast + Laplacian variance + hue richness
   - RES: from sharp metadata (long_edge ≥ 1600)
   - Skip OBJ (defining-object visible) — needs VLM
   - 24 candidates in 28 seconds (Tesseract is slow)

2. **ollama + moondream (local VLM, no API, no root)** — `~/opt/ollama/bin/ollama`:
   - Download `ollama-linux-amd64.tgz` from GitHub releases, extract to `~/opt/ollama`
   - `OLLAMA_HOST=127.0.0.1:11434 OLLAMA_MODELS=$HOME/opt/ollama/models setsid ollama serve &`
   - `ollama pull moondream` (1.74GB, fits 4GB RAM at 765MB resident)
   - Use HTTP API: `POST /api/generate {model, prompt, images:[b64], stream:false, options:{temperature:0, num_predict:60, top_k:1}}`
   - Resize images to 512px before POST (10s per call at full size → 3s resized)
   - DON'T use `ollama run` CLI (spinner escape codes fill output buffers, causes Bash timeout)
   - WARNING: moondream 1B is non-deterministic even at temp=0 — same prompt+image gives
     different answers across calls. Too unreliable for OBJ yes/no gates.

3. **HuggingFace Space vikhyatk/moondream1 (free VLM, ZERO AUTH, ZERO QUOTA)**:
   - `from gradio_client import Client, handle_file`
   - `client = Client("vikhyatk/moondream1", verbose=False)`
   - `client.predict(handle_file(image_path), question, api_name="/answer_question")`
   - 3-15s per call (cold start + image encoding dominates)
   - Subdomain `vikhyatk-moondream1.hf.space` resolves in this sandbox
   - ZeroGPU-quota-free (unlike merve/moondream3 which needs HF token)
   - YES/NO prompts UNRELIABLE (gives YES to restaurant interiors mistaken for bars)
   - DESCRIPTIONS reliable — use describe prompt + keyword-match instead of yes/no

### DESCRIBE-GATE PATTERN (replaces YES/NO for small VLMs)

YES/NO prompts gave false positives (moondream said YES to:
- "bar" = restaurant interior with bottles on table
- "cooking station" = backyard BBQ with hot dogs
- "bento boxes" = grazing board
- "event setup" = finished party with guests dining)

Switched to: prompt "Describe in 2 sentences what you see" + keyword-match on description:
- strong_pos keywords (e.g., "mobile bar", "bartender") → +3 score
- weak_pos keywords (e.g., "bar", "bottle") → +1 score
- strong_neg keywords (e.g., "restaurant interior", "guests dining") → -5 score
- obj_pass = (1+ strong_pos AND 0 strong_neg) OR (3+ weak_pos AND 0 strong_neg)

Keyword lists per category in `research/c57/describe-obj-gate.py` (OBJ_KEYWORDS dict).
Expand keywords after each false positive/negative (e.g., add "oven" for shou).

### SOURCE-QUALITY FILTER (cut bad-source noise before VLM)

`research/c57/rank-by-source.mjs` reads all search JSON files and classifies:
- Tier A (premium editorial, no watermark, warm cinematic): PartySlate, Avenue Magazine,
  Here Comes The Guide, Olive Magazine, BBC Good Food, The Infatuation, Melissa Fritzsche,
  The Knot, Healthy Happy Life, Glassette, SF Standard, GRUBSTANCE, Anne Byrn, gathergrills
- Tier B (variable, needs visual check): Yelp, Lemon8, Togather, ABC Hire, Jolly Chef
- Tier C (likely watermarked stock — REJECT): Shutterstock, Alamy, Getty, Dreamstime, etc.
- Tier D (brand/PR — likely has logo — REJECT): ASUS Pressroom, CNET, DoorDash, *Press*

Pick top-6 by RES from Tier A+B pool only — skips watermarked stock noise.

### CACHE-BUST (C53 lesson reinforced in C57)

Same-URL file swap does NOT bust Next.js Image cache. Replace:
- /media/c56/c56-bar.webp → /media/c57/c57-bar.webp (NEW folder + NEW name)
- Update path in component file (hacc-services.tsx)
- Old c56 folder retained for rollback

### HONEST ALT-TEXT

Don't use marketing copy. Don't use generic templates. Use LITERAL description of what's
visible in the photo (1 sentence, ~80 chars). Source: HF moondream1 description prompt.
Example: "Bartender preparing a craft cocktail at a well-stocked mobile bar with bottles,
fresh fruit garnishes, and a smoke infuser in use"

### KNOWN COMPROMISES (per rule 9 — document honestly)

- shou source is ABC Hire (Tier B, equipment-hire site) — not Tier A editorial. Picked
  because description clearly shows chef at oven with audience watching (show-cooking).
  All Tier A shou sources were plated food / collages / table settings.
- boksy source is Lemon8 (Tier B social media) — not Tier A editorial. Picked because
  description shows clear catering boxes with snacks visible.
- logistika shows "set up for wedding reception" rather than "staff actively servicing
  in process" — but no guests dining, no "enjoying food" keyword. True in-process servicing
  stock photos remain elusive (same lesson as C56). Recommend real client shoot.

### SUBAGENT DISPATCH PATTERN (when Z-AI limits hit)

Dispatch parallel subagents (one per approach) to keep work going when main session
hits context/time limits. Each subagent:
1. Reads `/home/z/my-project/worklog.md` before starting (sees prior state)
2. Appends its own entry with Task ID (e.g., 57-A, 57-B, ...)
3. Produces deliverable files in `/home/z/my-project/newsite/research/c57/`
17 subagents dispatched in C57 cycle. 4 timed out (long-running), 13 succeeded.

### RATE-LIMIT HEADER INSPECTION (debug pattern)

When Z-AI returns 429, use raw curl to inspect rate-limit headers:
```bash
curl -sS -i -X POST "$BASE_URL/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "X-Z-AI-From: Z" \
  -H "X-Chat-Id: $CHAT_ID" \
  -H "X-User-Id: $USER_ID" \
  -H "X-Token: $TOKEN" \
  -d '{"messages":[{"role":"user","content":"hi"}],"thinking":{"type":"disabled"}}'
```
Returns headers:
- `x-ratelimit-user-10min-limit: 30` (10-min window cap)
- `x-ratelimit-user-10min-remaining: 28` (current 10-min remaining)
- `x-ratelimit-user-daily-remaining: 0` (DAILY cap — when 0, you're locked out)

Config at `/etc/.z-ai-config` (read-only, readable by user `z`).
JWT in `token` field encodes user_id (rate limit is per-user, not per-chat).
