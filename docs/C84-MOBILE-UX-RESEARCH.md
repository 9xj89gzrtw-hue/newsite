# C84 — Веб-ресёрч мобильного UX (паттерны 2015-2026, проверено август 2026)

Субагент: web-research. Все URL ниже проверены живыми (HTTP 200 через
page_reader/curl в момент ресёрча). Код-рецепты извлечены из первоисточников.

---

## 1. Scroll-hints: «юзер остановился и не знает, что ниже есть контент»

### 1.1 Illusion of Completeness (NN/G, канон)
- Суть: страница «выглядит законченной» — full-screen hero, широкий
  горизонтальный разделитель, большая пустая зона = «ложный пол» (false floor).
  В исследовании NN/G 6 из 8 юзеров НЕ ДОГАДАЛИСЬ листать страницу с
  full-screen видео-хиро.
- Рецепты из статьи: (a) контент следующей секции должен «выглядывать» выше
  фолда (peeking/bleeding off-screen); (b) избегать полноширинных
  горизонтальных линий и больших межсекционных отступов; (c) в каруселях —
  показывать «ушедший» за край экрана контент.
- URL: https://www.nngroup.com/articles/illusion-of-completeness/
- Доп.: «80% времени взгляда — выше фолда» даже у скроллящих юзеров:
  https://www.nngroup.com/articles/scrolling-and-attention/

### 1.2 Pulsing chevron scroll-cue (cssanimation.rocks)
- Двойная анимация: chevron появляется последним (fade-slide-up 1s 1s
  ease-out forwards), затем heartbeat-pulse.
- Код (проверен, адаптирован):
```css
.scroll-cue { position: absolute; bottom: 4vh; left: 0; right: 0;
  text-align: center; z-index: 10; }
.scroll-cue img, .scroll-cue svg { animation: fade-slide-up 1s 1s ease-out forwards; opacity: 0; }
@keyframes fade-slide-up { 0% { opacity: 0; transform: translateY(4rem); }
  100% { opacity: 1; transform: none; } }
@keyframes pulse { 0% { opacity: 1; transform: none; }
  50% { opacity: .8; transform: scale(.8); } 100% { opacity: 1; transform: none; } }
```
- URL: https://cssanimation.rocks/scroll-cue/
- Важно (наш контекст c81): cue не должен блокировать LCP — это декоративный
  элемент, opacity до старта анимации 0, но родительский хиро-текст обязан
  быть SSR-видимым.

### 1.3 Scroll progress bar — чистый CSS, scroll-driven animations
- WebKit-гайд (Safari 26+, июнь 2025; Chrome давно поддерживает): прогресс-бар
  без JS через animation-timeline: scroll():
```css
.progress::after { content: ""; height: 3px; width: 100%;
  background: #AA8440; left: 0; bottom: 0; position: fixed;
  transform-origin: 0 50%;
  animation: progress-expand linear;
  animation-timeline: scroll(); }
@keyframes progress-expand { from { transform: scaleX(0); } to { transform: scaleX(1); } }
```
(у WebKit в примере анимируется width; для перфа лучше scaleX + origin-left)
- URL: https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/
- MDN-гайд: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations
- Framer-вариант (Magic UI, shadcn-совместимый, исходник GitHub проверен):
```tsx
const { scrollYProgress } = useScroll();
<motion.div className="fixed inset-x-0 top-0 z-50 h-px origin-left
  bg-linear-to-r from-[#A97CF8] to-[#FDCC92]"
  style={{ scaleX: scrollYProgress }} />
```
- URL: https://magicui.design/docs/components/scroll-progress
- Живые примеры (коллекция Awwwards «Scrolling»):
  https://www.awwwards.com/websites/scrolling/

### 1.4 Счётчики секций «01/08»
- Editorial-нумерация секций + текущая позиция (в закрепе/вертикальной метке).
  Прямой канонической статьи нет — паттерн виден в коллекциях Awwwards
  (см. ссылку выше) и dribbble «counter section». Комбинировать с 1.3:
  счётчик даёт «сколько осталось», бар — «где я».
- Наш контекст: счётчик вписывается в существующую vertical-label/
  scroll-spy (c83) — индекс секции уже вычисляется для aria-current.

---

## 2. Морфинг слов в хиро («кейтеринг как [искусство/ритуал/наука/театр]»)

### 2.1 Magic UI WordRotate (простейший, вертикальный флип)
- AnimatePresence mode="wait", y-flip ±50px, 0.25s easeOut, интервал 2500мс.
- Полный исходник (GitHub, проверен):
```tsx
<div className="overflow-hidden py-2">
  <AnimatePresence mode="wait">
    <motion.h1 key={words[index]} className={className}
      initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }} transition={{ duration: 0.25, ease: "easeOut" }}>
      {words[index]}
    </motion.h1>
  </AnimatePresence>
</div>
```
- URL: https://magicui.design/docs/components/word-rotate
  (ставится `pnpm dlx shadcn@latest add @magicui/word-rotate`)

### 2.2 react-bits RotatingText (премиальный, посимвольный spring-флип)
- Spring { type: 'spring', damping: 25, stiffness: 300 }, initial y '100%' →
  0 → exit y '-120%', AnimatePresence mode 'wait', rotationInterval 2000мс,
  stagger по символам через Intl.Segmenter (grapheme-безопасно для кириллицы,
  ё/й-глифы не ломаются), splitBy 'characters' | 'words' | 'lines'.
- URL: https://reactbits.dev/texts/Rotating-Text
- Исходник TS: https://github.com/DavidHDev/react-bits
  (src/ts-default/TextAnimations/RotatingText/RotatingText.tsx)

### 2.3 GSAP SplitText (+Flip для морфа между состояниями)
- SplitText.create(".title", { type: "lines, words", mask: "lines",
  autoSplit: true, onSplit(self) { return gsap.from(self.words, {...}); } });
  autoSplit пересплитывает при ресайзе (важно для мобайл-поворотов).
- URL: https://gsap.com/docs/v3/Plugins/SplitText/
- Flip (морфинг DOM между позициями): https://gsap.com/docs/v3/Plugins/Flip/

### 2.4 CSS scroll-driven (view-timeline) + zero-JS
- Тот же механизм, что 1.3 (WebKit/MDN): смена слов по
  animation-timeline: view() — слово меняется, когда секция въезжает.
- Для АВТО-ротации без JS: чистые CSS-keyframes (период = N × интервал,
  слова абсолютами). Рецепт производный (по методике cssanimation.rocks
  + WebKit), в чистом виде не найден как готовый компонент.

### 2.5 Грабли для НАШЕГО хиро (урок c81!)
- SSR-слово статично и видно без гидратации (LCP!), морфинг стартует только
  после mount + первого кадра; иначе LCP mobile опять уедет.
- Пауза, когда хиро вне вьюпорта (IO) — у нас IO-гейт уже есть.
- prefers-reduced-motion → статичное слово (палитра из a11y-пакета c83).
- motion.dev: анимировать только transform/opacity (см. §5.3); оба
  компонента 2.1/2.2 этим и занимаются.

---

## 3. Калькулятор стоимости: UX-паттерны

### 3.1 NN/G «12 рекомендаций для калькуляторов» (апрель 2024)
- Ключевое для нас: (2) встраивать калькулятор прямо в страницу, не
  попап/отдельная страница; (5) результат пересчитывается ДИНАМИЧЕСКИ при
  вводе — юзеры «экспериментируют», а не «совершают покупку»; (6) легко
  менять один ввод без сброса остальных + кнопка «начать заново»; (3)
  обязательными делать только минимум полей; (10) не вводить в заблуждение
  дефолтами; (9) контекстуализировать вывод («~на 50 гостей»).
- URL: https://www.nngroup.com/articles/recommendations-calculator/

### 3.2 Live-пересчёт + sticky summary на мобиле
- NN/G rec #5 = пересчёт на лету; мобильная обёртка — sticky bottom bar с
  живой суммой (у нас уже есть sticky-bar инфраструктура: --cookie-banner-h
  лифтит FAB/sticky-bar, c81-W2F1).
- Гайдлайн sticky-меню (когда уместен липкий низ, высота, контент):
  https://smart-interface-design-patterns.com/articles/sticky-menus/
- Рецепт: выбор пакета (radio-card) → чекбоксы допуслуг → всё это на ОДНОЙ
  странице (встроено), цена в sticky-баре внизу обновляется мгновенно,
  тап по бару скроллит к детальной смете/квитанции (квитанция уже есть).

### 3.3 Автоскролл к следующему шагу после выбора
- База: NN/G Progressive Disclosure / Staged Disclosure (показывать
  следующий уровень опций только после выбора предыдущего):
  https://www.nngroup.com/articles/progressive-disclosure/
- Рецепт: после выбора формата плавно раскрыть следующий блок
  (условная видимость) + `el.scrollIntoView({ behavior: 'smooth',
  block: 'center' })` — нативный API (MDN), без библиотек. Radix/shadcn
  аккордеон имеет открытые обсуждения «scroll into view» — паттерн
  признан нужным юзерами (github-issues radix-ui accordion).
- Wizard vs одна страница: по NN/G для калькуляторов-оценщиков побеждает
  одна страница с живым выводом; дробить на шаги имеет смысл только
  при >5-7 обязательных вводах. Наш кейс (формат → гости → допы) =
  одна страница + sticky summary + staged disclosure.

---

## 4. Android Data Saver / Save-Data

### 4.1 Что это на самом деле (Chrome Android = Lite mode)
- Chrome Android «Data Saver» → с 2019 «Lite mode»: страницы жмутся
  серверами Google; хиро-страницы с прогнозом >5с до первого текста/картинки
  автоматически заменяются Lite-версией; для HTTPS с Google делится только
  URL (не cookies/контент); шифрование не ломается. Lite mode сообщает
  сайту через NetworkInformation API + заголовок Save-Data: On.
- URL: https://blog.chromium.org/2019/04/data-saver-is-now-lite-mode.html
- Android OS Data Saver (AOSP): режет ФОНОВЫЙ трафик приложений (юзер
  может whitelist'нуть); документация прямо требует от приложений:
  НЕ автовоспроизводить видео, НЕ префетчить контент, картинки ниже
  разрешением, lower-bitrate видео.
- URL: https://source.android.com/docs/core/data/data-saver

### 4.2 Что «ломается» на сайте (факты из источников)
- Ничего не падает жёстко: fetch, localStorage, service worker работают;
  foreground-трафик ходит. Реальные проблемы: (a) прокси-сжатие картинок
  (артефакты на уже-сжатых webp); (b) видео autoplay НЕ останавливается
  Data Saver'ом сам — сайт обязан уважать юзера (Opera-форум: «data
  savings doesn't stop video auto play»); (c) десктоп-расширение Data Saver
  deprecated (M74) — заголовок = мобильный Chromium only (Chrome 49+,
  Opera, Samsung Internet, Yandex; нет в Firefox/Safari).
- MDN: Save-Data — low-entropy client hint, Experimental:
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Save-Data
  https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData

### 4.3 Детект и фоллбеки (проверенный код web.dev)
```js
if ('connection' in navigator) {
  if (navigator.connection.saveData === true) {
    // лайт-режим: не стартовать hero-видео, отдать постер,
    // картинки пониже, шрифты-сабсеты, выключить префетчи
  }
}
// реакция на смену сети (addyosmani):
navigator.connection?.addEventListener('change', onConnectionChange);
const { rtt, downlink, effectiveType, saveData } = navigator.connection;
```
- Сервер: `Save-Data: on` в request headers → другой ответ (меньше
  ресурсов/агрессивнее сжатие).
- URL: https://web.dev/articles/optimizing-content-efficiency-save-data
  https://addyosmani.com/blog/adaptive-serving/
- Best practices (web.dev): сообщать юзеру что лайт-режим включён, давать
  тумблер и явный способ вернуться к полному опыту; лайт ≠ «урезанный» —
  функциональность та же, меньше байтов.
- Пример серверного рерайта картинок по заголовку (Apache mod_rewrite):
  https://css-tricks.com/help-users-save-data
- Для нас: в tott-hero.tsx гейт saveData/2g УЖЕ есть (c82) — расширить
  на шрифты/карусель/префетчи +OnChange-реакцию.

---

## 5. Слабые устройства (RAM/CPU) и lazy-hydration

### 5.1 Сигналы и гейтинг анимаций (Addy Osmani, Chrome Dev Summit)
- Сигналы: navigator.connection.effectiveType ('slow-2g'|'2g'|'3g'|'4g'),
  saveData, navigator.deviceMemory (GB, квант 0.25/0.5/1/2/4/8),
  navigator.hardwareConcurrency (лог. ядра). Продакшн-юзеры паттерна:
  Facebook, eBay, Tinder.
- Готовые хуки (react-adaptive-hooks):
```tsx
import { useNetworkStatus } from 'react-adaptive-hooks/network';
import { useSaveData } from 'react-adaptive-hooks/save-data';
import { useHardwareConcurrency } from 'react-adaptive-hooks/hardware-concurrency';
const { numberOfLogicalProcessors } = useHardwareConcurrency();
// numberOfLogicalProcessors <= 4 → CSS-анимации вместо framer,
// не грузить тяжёлые компоненты
```
- URL: https://addyosmani.com/blog/adaptive-loading/
  https://developer.mozilla.org/en-US/docs/Web/Navigator/hardwareConcurrency

### 5.2 Lazy-hydration ниже фолда (IO-mount) — паттерн для Next.js 15/16
- Рецепт Let's Build UI (React.lazy + Suspense + IntersectionObserver):
```tsx
const Heavy = lazy(() => import('./Heavy'));
function Section() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e], obs) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { rootMargin: '200px' });   // заранее, чтобы не мигало
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <section ref={ref}>{visible &&
    <Suspense fallback={<Skeleton/>}><Heavy/></Suspense>}</section>;
}
```
- URL: https://www.letsbuildui.dev/articles/how-to-lazy-load-react-components
- Официальный next/dynamic + Suspense:
  https://nextjs.org/docs/app/guides/lazy-loading
- Нативного lazy-hydration в Next.js нет (открытое обсуждение):
  https://github.com/vercel/next.js/discussions/28445
- React 19.2+: <Activity> (hide/show сUnmount-семантикой) — shipped;
  <ViewTransition> — canary; оба готовы к тестам (React Labs, апр 2025):
  https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more
- Это и есть «reffine IO-mount» из нашего backlog (c84-открытый пункт).

### 5.3 Framer → CSS на слабых девайсах
- motion.dev (оф. гайд перфа): анимировать ТОЛЬКО transform/opacity
  (GPU, composite; частично off-main-thread); height/width/top/left —
  layout+paint, легко >100мс на кадр при 60fps=16.7мс бюджете.
- URL: https://motion.dev/docs/performance
- Рецепт: на мобиле/слабом CPU — swap framer-версии на CSS-keyframes
  (у нас прецедент c81: hero на CSS keyframes поднял desktop 0.69→0.95);
  гейт по (pointer:coarse или IO-мобайл-детект) × deviceMemory≤2 ×
  cores≤4; WAAPI-пресс уже на индивидуальных свойствах (грабля c81 §52).

---

## 6. Мобильная типографика премиум-бренда

### 6.1 16px для инпутов — закон iOS
- font-size инпута <16px → Safari iOS автозумит вьюпорт при фокусе
  (фича accessibility). 16px+ — зума нет. Наш калькулятор = форма:
  ВСЕ инпуты/селекты ≥16px (сейчас проверять booking-форму).
- URL: https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/

### 6.2 Fluid type scale через clamp()
- clamp(min, preferred, max); preferred из линейной интерполяции:
  m = (maxFont − minFont) / (maxBreakpoint − minBreakpoint);
  интерсепт b = minFont − m·minBreakpoint;
  preferred = calc(b + m × 100vw) → «rem + vw»-форма:
  font-size: clamp(1rem, 0.96rem + 0.22vw, 1.19rem).
- Генератор: Fluid Type Scale Calculator (того же автора).
- URL: https://www.aleksandrhovhannisyan.com/blog/fluid-type-scale-with-css-clamp/

### 6.3 Читаемость ≠ «крупная эстетика ломается»
- NN/G legibility: юзер оценивает cost-benefit чтения; мелкий/низкоконтрастный
  текст = «слишком дорого» → не читают. Премиум держится на кернинге,
  line-height (1.5-1.6), measure 45-70 симв., контрасте — а НЕ на
  уменьшении кегля.
- URL: https://www.nngroup.com/articles/legibility-readability-comprehension/
- Рецепт для нас: body 17px (mobile) / clamp; display serif
  clamp(2.25rem, 1.6rem + 2.8vw, 4.5rem); межбуквенный tracking не
  трогать, только размеры; eyebrow 15px уже чинили (c81-W2).

---

## 7. PDF per-tariff: генерация меню/прайсов

### 7.1 Сравнение подходов (pdf4.dev гайд, март 2026)
| Метод | Vercel | Стилизация | Бандл | Наш вердикт |
|---|---|---|---|---|
| Route handler + PDF-API/библиотека | да | полная (HTML/CSS или JSX) | 0 в браузере | ✅ основной |
| @react-pdf/renderer в route | да | JSX-стайлинг | 0 в браузере | ✅ для конфиг-зависимых |
| pdf-lib на клиенте | да | низкоуровн. | ~300KB+ в бандл | ❌ мобайл-бюджет |
| jsPDF на клиенте | да | ограниченная | в бандл | ❌ |
| Playwright self-host | нет | полная | — | оверкилл |

- Route handler (сервер, бинарный ответ):
```ts
// app/api/menu-pdf/route.ts
export async function GET(req: NextRequest) {
  const tariff = req.nextUrl.searchParams.get('t') ?? 'classic';
  const pdf = await renderMenuPdf(tariff);   // @react-pdf/pdf-lib
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="menu-${tariff}.pdf"`,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
// клиент: fetch → blob → URL.createObjectURL → a.click()
```
- URL: https://pdf4.dev/blog/pdf-generation-nextjs (полный пример
  POST-роут + клиентский триггер; «no PDF library ships to the browser
  bundle» — главный тезис для мобайл-перфа).
- Альтернативный гайд: https://www.apryse.com/blog/generate-pdfs-nextjs-sdk
- GSAP Flip тут не при чём — упомянут выше по ошибке контекста.

### 7.2 Кэширование
- Статичные тарифные меню (контент меняется редко): лучше вообще
  прегенерить PDF в /public/menu/*.pdf при сборке → next/image-style
  immutable-кэш CDN, нулевой рантайм. Конфиг-зависимую смету калькулятора
  — route handler с ключом = hash(выбора), Cache-Control immutable.

---

## Топ-5 «что копировать» для Interfood

1. **Peek-above-fold + pulsing scroll-cue** (§1.1-1.2): мобайл-хиро не
   100vh, а ~90-92vh с «ушкой» следующей секции; chevron-cue c
   fade-slide-up + heartbeat, исчезает после первого скролла. NN/G —
   единственный паттерн с доказанной статистикой отказов скролла.
2. **CSS scroll progress bar + счётчик секций 01/08** (§1.3-1.4): чистый
   CSS (animation-timeline: scroll(), Safari 26/Chrome), нулевой JS,
   вписывается в существующий scroll-spy (c83) и vertical-label.
3. **WordRotate/RotatingText в хиро** (§2.1-2.2): transform/opacity-only
   флип слов «искусство/ритуал/наука/театр»; SSR-статика для LCP, морфинг
   после гидратации, IO-пауза, reduced-motion → статика.
4. **Device-gate «lite»-режим** (§4.3+§5.1): единый хук
   (saveData || 2g || deviceMemory≤2 || cores≤4) → отключаем hero-видео
   (постер), CSS-анимации вместо framer, урезанные картинки; реакция на
   connection.onchange. Прямой ответ на mobile Perf 0.60/TBT 1.2-1.7s.
5. **Калькулятор: одна страница + sticky-сводка + автоскролл** (§3):
   пакет-карточки → staged disclosure допов → живая цена в sticky-баре
   (существующий sticky-bar) → scrollIntoView к следующему блоку после
   выбора; PDF — серверный route handler / прегенеренные файлы (§7).
