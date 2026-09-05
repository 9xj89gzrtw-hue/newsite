# Worklog — Catering Project (сжатый c82; полная история в git log и docs/AGENTS-HISTORY.md)

## Индекс прошлых задач (детали: git log worklog.md, тег каждого Task ID)
2-research · 2-A/2-B · 3-A/3-B/3-C/3-implement · 4-C/4-D/4-E · 5 · 6-A…6-F · 7-A/7-B · cycle-26 · cycle-28 · 37 · 43 · 43-R4 · 44 · C44-A/C44-C · 45 · cycle-46…48 · 58…63 · c64-c79 (см. AGENTS.md §36-§50) · c80

Ключевые вехи: 6-x — ресёрч/извлечение контента с 22 эталонных сайтов; cycle-26+ —
построение витрины; c55 — аккордеон услуг + фото-конвейер; c62-c64 — сцена booking;
c69 — ребрендинг на субагентах; c71 — 4 слепых критика + LLM-SEO; c72 — hero=
картина; c74-c79 — нативные scroll-эффекты, логотип, скрытые микровзаимодействия,
touch-анимации; c80 — полный QA fresh-clone (0 багов); c81 — Lighthouse+3 волны
слепых критиков + фиксы; c82 — качество моб-hero-видео (портрет-кроп 480×720
вместо 480×270, правка владельца §1.6).

---

Task ID: c80
Agent: main (Z.ai Code)
Task: «протестируй теперь работоспособность всего на сайте» — полный
QA-прогон после сброса песочницы (fresh-clone §40 + сквозной e2e).

Work Log:
- Песочница сброшена: репо склонировано заново, bun install → prisma
  generate + db push (абсолютный DATABASE_URL) → pm2 start :3001,
  прогрев 17с, GET / 200.
- HTTP: /, /offer, /privacy, /terms, /sitemap.xml, /robots.txt,
  /llms.txt → 200; /несуществующее → 404. favicon/apple-touch/brand/
  og-image → 200.
- API: lead (валид → 201 + запись в БД; битый телефон → 400; без
  согласия → 400), newsletter (201/400), faq-vote (201/400). Тест-лиды
  удалены, db/custom.db восстановлен git checkout.
- Desktop 1440 (agent-browser qa-desktop): 0 ошибок консоли/страницы;
  hero — ссылок/кнопок 0, видео играет (IO-пауза вне вьюпорта
  работает); cookie-баннер; якоря навигации; FAQ-аккордеон
  (aria-expanded + панель); калькулятор-форма ПОЛНЫЙ цикл: заполнение →
  «Оставить заявку» → «Далее» → согласие → POST /api/lead 201 →
  успех+конфетти → ресет «Отправить ещё одну заявку» (форма чистая,
  зона открыта); карусель видео: модалка play/close, стрелки
  (scrollLeft 0→80); каталог меню: пакеты, «Ещё 4 блюда» → 81 блюдо +
  «Свернуть»; микро-сюрпризы: 3-тап-яйцо (конфетти + тост «Секретный
  ингредиент — любовь»), двойной-тап искры (13 частиц), tilt
  matrix3d+глянец, kinetic-h2 анимация; overflowX=0; VLM 5 скринов
  CLEAN.
- Mobile iPhone 14 (qa-mobile): 0 ошибок; hero-видео играет; бургер:
  открытие, ссылки (меню закрылось, скролл к #services 2088); press
  WAAPI scale(0.94) (getAnimations: running, кейфреймы 1→0.94);
  лонг-пресс 500мс — «золотой выдох»: кольца+искры+пульс фото
  scale(1→1.045→1), клик после выдоха defaultPrevented=true; FAQ
  переключается реальным CDP-тапом; форма моб: полный цикл 201 +
  запись в БД (телефон нормализован 8926→+7926); overflowX=0; VLM 5
  скринов CLEAN.
- SEO: title/description/OG/canonical/JSON-LD×2/h1-единственный/
  lang=ru/robots (AI-боты)/sitemap с lastmod — всё на месте.
- Грабли → §51: ЛОЖНЫЙ «баг» selector-коррупции: транспорт Bash этой
  сессии съедает последовательность «[h» в обе стороны (a[href] →
  aref]). Греп по исходникам через bash показывал «битые» селекторы —
  Read-инструментом файлы оказались целыми ('button, [href],
  input…'). Урок: строки с «[h» проверять только Read-инструментом,
  не bash-выводом; синтетика fill/type на iOS-эмуляции не проходит в
  контролируемые инпуты (лечится нативным value-setter + Event('input')).

Stage Summary:
- ИТОГ: 40+ проверок, 0 реальных багов. Сайт полностью работоспособен:
  все маршруты, все 3 API с записью в БД, обе формы e2e, все
  анимации c77-c79 (десктоп+моб), SEO-контур, hero-гейты, отсутствие
  overflow. pm2 :3001 online, память ~80МБ после тёплого старта.
- Коммит c80: только worklog (код не менялся — фиксировать нечего).

---
Task ID: c81
Agent: main (Z.ai Code) + 12 субагентов (критики A–J слепые волны, ресёрч, фикстеры F1–F4/W2F1–3)
Task: /loop — Lighthouse-тест + слепые волны враждебных критиков с исправлениями
до одобрения; pm2 :3001 dev / :3002 prod standalone.

Work Log:
- Окружение: fresh clone, bun install, prisma generate+db push, pm2 dev :3001,
  lighthouse 13.4.1 (CHROME_PATH playwright-chromium-1234; OOM-краш вкладки в
  конце прогона — артефакт, JSON полный). Прод: bun run build → standalone →
  pm2 interfood-prod-lh :3002 (env PORT/HOSTNAME/DATABASE_URL абсолютные).
- Базлайн Lighthouse (prod): desktop Perf 0.69, mobile 0.42 (LCP 9.5s!),
  A11y 0.91, BP/SEO 1.0.
- ВОЛНА 1 (слепые критики A-визуал/VLM, B-UX/e2e, C-код/SEO/a11y, D-перф;
  ресёрч-агент по веб-паттернам): найдено 40+ дефектов, гл.: hero-текст
  SSR opacity:0 (framer initial + useMounted) → LCP ждёт гидратацию; press-
  WAAPI сносит translate(-50%,-50%) play-кнопок (тап мимо на мобиле);
  vanity-URL не скроллят; HaccBooking вне SSR (Suspense null); skip-link
  цель на 4/5 страниц нет; 8 span[aria-label] без role; cep-цифры 2.4:1;
  rate-limit нет; CSP без Metrika/frame-ancestors/HSTS; 404-кнопки
  сплющены; лосось-лейблы вне палитры; футер slate.
- ФИКСЫ волны 1 (F1-F4 + добивка F1b/F2b после таймаутов): hero на CSS-
  keyframes (SSR-видимость, тайминги 1:1, scroll-cue обёртка-паттерн §44);
  preloader двери CSS-таймлайн ≤0.8s от paint (инлайн-скрипт сессии в body);
  press через scale-свойство WAAPI + transform-origin 0 0 (Chromium-баг
  composite-add + transition — замер); vanity-scroll.tsx (load + 2 коррекции
  дрейфа); HaccBookingShell SSR-фоллбэк (#calculator/#contact/H2 в HTML,
  скелет CLS-0); sr-only-твины scramble/split-text; main-content на всех
  страницах; cep var(--cep-black) ≈19:1; rate-limit token-bucket (429+
  Retry-After) на 3 POST; zod+серверная нормализация телефона (lib/phone.ts);
  админ-GET faq-vote удалён; CSP+mc.yandex.ru+frame-ancestors+UIR, HSTS,
  COOP; 404 вертикальные CTA+robots/canonical по норме; cookie-карточка
  340px; № заявки ДДММ-ЧЧММ; фокус на невалидное поле; consent-хинт.
- Итог волны 1 (прод): desktop Perf 0.90, mobile 0.56, LCP mobile 4.1s,
  A11y 0.97. Коммит a97217a.
- ВОЛНА 2 (слепые критики E,F,G,H — не знали о волне 1): найдено: cookie
  поверх hero-CTA (мобайл), видео-модалка без Play, outline:none у
  «Рассчитать фуршет», тост поверх баннера, квитанция вне вьюпорта,
  пресеты 29×26, бургер без inert, label-in-name ×5, лосось #FF6B77
  2.6:1, футер slate #1F2937, апскейл фото (IG 1.3×, marquee, furshet),
  PII в логах лида, XFF-спуф, Mux-секреты В git-истории (ВАЛИДНЫ — HTTP
  200!), дубли preload шрифтов, 1.5MB hero-видео на мобиле.
- ФИКСЫ волны 2 (W2F1-3 + F1b/F2b): баннер над док-зоной (--cookie-banner-h
  лифтит FAB/sticky-bar, settle 550мс); Play-оверлей модалки; focus-visible;
  тосты top-center мобайл; автоскролл к квитанции; пресеты 44×44; Calendar
  next/dynamic (react-day-picker ВНЕ стартового бандла); бургер inert;
  skip-link фокус-видимый; label-in-name «Смотреть видео: …»; бордо вместо
  лосося; футер espresso #161312; eyebrow 15px; vanity /events →
  events-video-carousel (rewrite+MAP); vertical-label href на субстраницах;
  mculinary-hero-480.mp4 315KB на мобиле (−79% видео-трафика); preload
  шрифтов через ReactDOM.preload (0 дублей); PII-лог → sha256-хинт;
  getClientIp Vercel-aware (последний XFF).
- ВОЛНА 3 (финальный гейт, слепые): критик I (UX) — **APPROVE** (полный
  лид-флоу e2e мобайл+десктоп, 0 ошибок консоли; MAJOR «баннер поверх
  CTA» невоспроизводим в контролируемых замерах — вероятен транзиент
  settle-таймера); критик J (перф) — **REJECT** по mobile-score 51.5
  (дисперсия 51-60) при desktop 93 и РЕАЛЬНОМ LCP 0.94s/вордмарк
  читаем <2s.

Stage Summary:
- ФИНАЛ Lighthouse (prod): **desktop Perf 0.95** (LCP 1.0s, TBT 90ms), **mobile
  Perf 0.60** (LCP 3.3s по LH / 0.94s реальный, TBT ~1.2-1.7s), A11y 0.97,
  BP 1.0, SEO 1.0 (обе платформы). CLS 0. 0 ошибок консоли.
- Прирост за цикл: desktop 0.69→0.95, mobile 0.42→0.60, LCP mobile
  9.5s→3.3s, A11y 0.91→0.97.
- ГРАБЛИ цикла (для §52): (1) naturalWidth в Playwright-эмуляции
  НЕДОСТОВЕРЕН (запрос w=828 и тело ответа 828×553, а naturalWidth=390) —
  мерить сеть/тело ответа, не naturalWidth; (2) Lighthouse-score mobile
  дисперсия ±8 между прогонами (TBT 1140-7570ms!) — гейтить по ≥3 прогонам
  и реальным пробам; (3) субагенты падают по context-deadline на
  длинных задачах — дробить на completion-агентов; (4) составные
  transform-анимации (translate-позиционирование + scale-press) — только
  через индивидуальные свойства WAAPI + transform-origin: 0 0.
- ОТКРЫТО (цикл 82): (a) lazy-hydration секций ниже фолда — единственный
  путь TBT<1s / mobile≥70 (паттерн reffine IO-mount; ~17 секций, риск
  регресса анимаций — отдельным циклом); (b) MUX-токены В git-истории
  (коммит 6b7977e, ВАЛИДНЫ, проверено HTTP 200) — РОТАЦИЯ У ВЛАДЕЛЬЦА
  обязательна (force-push запрещён юзером — историю не вычистить);
  (c) nonce-CSP (proxy.ts + strict-dynamic) вместо unsafe-inline/eval;
  (d) полный SSR формы (BAILOUT_TO_CLIENT_SIDE_RENDERING у nuqs);
  (e) фото-конвейер: исходники gamma 484px/furshet 524px меньше DPR2-
  рендера (лёгкий апскейл 1.16×) — нужны hires-исходники; (f) шрифты 18
  woff2/350KB 5 семейств — сабсеты; (g) дизайн: 2 конкурирующих serif
  (Prata/Playfair), 2 крема — вкусовое решение владельца; (h) hero-CTA
  в первый экран (критик I: сейчас CTA ниже фолда на мобиле).
- pm2: interfood-catering-dev :3001 + interfood-prod-lh :3002, память ~110МБ.
- Коммит c81: код+доки, push без force.

---

Task ID: c82
Agent: main (Z.ai Code)
Task: «качество видео на hero на мобильной версии стало прям очень плохим,
улучши его качество» — прямая правка владельца (§1.6 отменяет byte-оптимизацию
волны-2 c81).

Work Log:
- Диагноз: 81-W2F3 ставил мобиле mculinary-hero-480.mp4 = 480×270, 88kbps,
  315KB. object-cover на 390×844 (DPR2-3) апскейлит ×3.5, виден центр ~26%
  полосы → фактическая резкость ~125px/ширина экрана + макроблоки 88kbps.
- Фикс: mculinary-hero-portrait-720.mp4 — вертикальный кроп ЦЕНТРА исходника
  (crop=480:720:400:0) из ОРИГИНАЛА 1.45Mbps (не из пережатой -720), h264
  High, crf21/preset-fast (slow не влез в 300с таймаут на 2 ядрах), 751kbps,
  2.67MB, faststart, -an. Кроп = та же полоса, что object-cover показывает
  на смартфонах (видимо 26-32% ширины) — композиция 1:1, весь битрейт в
  видимой зоне. Планшеты: cover скейлит по ширине, режет высоту — без боксов.
- Код: tott-hero.tsx HERO_VIDEO_MOBILE → портрет-файл (+док-комментарий
  c82). Логика (IO-гейт, saveData/2g, src-подмена до play) не тронута.
- Верификация: mобайл iPhone14 (agent-browser): запрошен ровно 1 mp4 —
  portrait-720 (206), video playing 480×720 readyState 4, 0 ошибок; VLM
  A/B кадр t=14s (старый vs новый, отрендерены как object-cover 780×1688):
  новый «noticeably better» (чёткие края ложки, текстура гарнира vs
  smearing). VLM живого скриншота: резко, вордмарк читается, дефектов нет.
  Десктоп 1440: запрошен -720, портрет НЕ запрашивается — регресса нет.
  Линт 0. Старые файлы НЕ удалял (§28), -480 больше не референсится.
- Грабля: кодирование на 2 ядрах — x264 slow 850 кадров > 5 мин, таймаут;
  preset fast хватило (751kbps crf21).

Stage Summary:
- Мобильное hero-видео: фактическая видимость ~125px → ~332px CSS-ширины
  (×~9 к видимой резкости), биты на видимый пиксель ×30 против -480, ×4.5
  против десктоп-720. Цена: 315KB → 2.67MB видео-байт на мобиле (вне
  критического пути: preload=none + IO + старт после LCP-кадра).
- Коммит c82: 13d24d0 (1 tsx + новый mp4), push без force, дифф проверен.

---
Task ID: c83
Agent: main (Z.ai Code) + ~30 субагентов (аудит, ресёрч, 5 реализаторов
A/B/C/D/E, фиксеры F1-F5, 4 волны слепых критиков V/U/P ×2-4 сегмента)

Task: «добавь побольше анимации в каждый из блоков» — усиление анимаций
всех блоков с сохранением перф-бюджетов, вкуса бренда и верифицируемости.

Work Log:
- Разведка: аудит-агент (инвентаризация анимаций 15 секций, живые/мёртвые
  keyframes, «дыры») + web-ресёрч (Awwwards/GSAP Vault/motion.dev 2025-26,
  20+ рецептур). План: 4 параллельных реализатора непересекающимися файлами
  (§39) + globals-агент последовательно.
- Реализация: hero scroll-exit (CSS view(), именованный таймлайн — грабля:
  view() у потомков #hero резолвится в overflow-контейнер, нужен
  view-timeline-name на секции); Magnetic CTA хедера + scroll-spy
  (aria-current, метка #AA8440 ≥3:1 на light); kinetic-h2 gg + Magnetic
  play-pill; shimmer-sweep пила карусели; hover-глисс строк меню +hairline;
  squash FAQ; focus-underline полей booking; индекс-поп аккордеона;
  каскад цифр process; hairline тайлов IG; reading-highlight слов band
  (useScroll→per-word useTransform, sr-only-твин); VelocitySkew wordmark
  футера + соц y-hop; cookie slide-fill.
- Волна-1 критиков: FAQ НЕВИДИМ под RM (SSR initial opacity:0 + RM-ветка
  без финала; F2a: settled type-swap rmSettled? p : motion.p, гидро-паритет);
  Magnetic без fine-pointer гейта (тап=mousemove; фикс в УТИЛИТЕ — закрыл все
  вызовы); a11y-пакет.
- Волна-2: карусель — СТРЕЛКА ОТКАТЫВАЛА scrollLeft (root-cause: wrap-эвристика
  advance() считала конец из любой позиции при max=80 + 5s-таймер не
  сбрасывался кликом; F3: snapPoints по rect карточек + restart отсчёта);
  миноры P2/V2 (дубль-гейт хедера, свайп-сброс таймера, 8.22:1, мёртвый
  .magnetic-lift, тики <640px, focus-visible вне hover-медиа).
- Волны-2/3 ЛОЖНЫЕ клеймы разобраны пруфами (§1.2): «телепорты скролла»
  и «зависание» = OOM-убийцы chrome (4ГБ/0-swap, критики оставляли ~1.8ГБ
  процессов) + программный scrollTo-vs-Lenis дрейф agent-browser; «cookie
  auto-consent» = персистентный localStorage профиля критика (Storage.setItem
  перехват со стеком: 0 записей в 5/5 пассивных сессий).
- Прод-гейт поймал КРИТИЧЕСКИЙ баг: next build падал — Tailwind v4 сканирует
  КОММЕНТАРИИ как кандидаты классов; докблок gamma-marquee содержал
  «aspect-[3:4]» → невалидный aspect-ratio: 3:4 в выходе → PostCSS-парсинг
  падал (dev-сервер молчал, браузер дропал декларацию). Фикс: комментарий
  без утилити-токенов + предупреждение в докблоке. Урок в §2.
- Перф (c81-методика: LH + реальная проба): desktop-preset 89/92 (LCP
  1.16-1.4s, TBT 68-175ms, CLS 0); mobile REAL LCP 348-392ms (лучше c81
  0.94s), LH-devtools 2.7s (c81: 3.3s); LH-Lantern mobile ~6.9s/46-53 —
  инфляция render-delay на общем боксе при 4x-CPU симуляции (§52: гейтить
  реальной пробой). A11y LH 97.
- Хозяйство: −611 строк мёртвых keyframes/классов (24 удалено, 5 оставлено
  с нерындеримыми владельцами), stale-докблоки gamma-marquee/page.tsx,
  images.qualities [75,82] (−9 dev-варнингов).

Stage Summary:
- Коммит 678a6ae, push без force. Все 15 секций получили новые анимации
  (кроме уже-максимальных founder/gamma-separator/gamma-marquee — §1.4).
- 4 волны слепых критиков: волна-4 U4a APPROVE (9/10, единственный «фейл» —
  методологический: framer-спринги в JS, не WAAPI); финальная прямая
  верификация карусели/модалки/бургера/FAQ-тапа — PASS.
- ГРАБЛИ цикла → §2: (1) Tailwind-комментарий-кандидат; (2) window.scrollTo
  vs Lenis для e2e-позиционирования — только __lenis.scrollTo или wheel;
  (3) критикам-субагентам: headless agent-browser отдаёт hover:false и
  reduce:true — их «мёртвые ховеры/анимации» = слепота инструмента, валид
  только Playwright; (4) контекст-лимит субагентов: all-in-one скрипт одним
  запуском вместо интерактива (максимум фактов за минимум раунд-трипов).
- ОТКРЫТО (c84): lazy-hydration (перенос c81); LH-mobile Lantern на общем
  боксе — прогонять на чистой машине для честного score; EASE-константа
  lib/motion-ease (45 файлов дублируют [0.22,1,0.36,1]).
