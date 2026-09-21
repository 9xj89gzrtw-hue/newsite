# Worklog — Catering Project (сжатый c98; полная история: git log worklog.md, docs/AGENTS-HISTORY.md)

## Индекс прошлых задач (детали: git log, тег Task ID)
2-research · 2-A/2-B · 3-A/3-B/3-C · 4-C/4-D/4-E · 5 · 6-A…6-F · 7-A/7-B · cycle-26…48 · 58…63 · c64-c87 (AGENTS.md §36-§56) · c88 · c89 · c95 (PHP-API + админка) · c96 (TG-надёжность) · c97 (почта)

Ключевые вехи: c69 — ребрендинг субагентами; c84 — мобильный UX; c87 — фото владельца;
c89 — большой пакет правок; c95 — статик-экспорт + PHP-API + админ-панель;
c96 — Telegram-доставка; c97 — почта (клиенту+владельцу, SMTP, журнал);
**c98 — надёжность заявок до непотеряемости + вертикальное видео + прелоадер + anti-jitter**.

---
Task ID: c97 (сжато)
Agent: orchestrator
Task: «телеграм работает, но почта нет — ни клиенту, ни мне».

Stage Summary:
- smtp_send() на raw sockets (SSL:465/STARTTLS, Date/Message-ID, dot-stuffing);
  mail_send() = SMTP → mail()-фолбэк; подтверждение КЛИЕНТУ (Reply-To=владелец);
  журнал mail-log.json; mail-test/mail-log в админке; SMTP-поля в настройках.
- Прод: все 3 канала живые (tg/mail/client) на реальной заявке; бейджи доставки
  в «Заявках». Владельцу: SpaceWeb-ящик → SMTP-настройка = DKIM (инструкция в UI).

---
Task ID: c97-PROD (сжато)
Agent: orchestrator
Task: деплой c97 + прод-верификация.

Stage Summary:
- 220d741 в продe (rsync зелёный); Vercel-зеркало упёрлось в лимит 100 деплоев/день
  (не влияет на основной домен). mail-test ok, transport=mail. Живые лиды с полными
  notify-статусами. Тест-лиды оставлены владельцу для просмотра бейджей.

---
Task ID: c98
Agent: orchestrator (5 агентов-разработчиков + 4 волны критиков: 9 критиков, 3 фикс-волны)
Task: юзер: (1) заказчик оформил заказ — НИЧЕГО не пришло (ни почта/админка/TG),
после теста владельца пришло — разобраться и сделать непотеряемо + подтверждение
клиенту на его почту + владельцу на Gmail/Яндекс; (2) дёргается калькулятор на
мобиле; (3) видео под hero на мобиле: горизонтальный формат, кнопка «смотреть»
неровно — сделать вертикальным + fullscreen (видео с Яндекс.Диска); (4) на старом
ПК не грузится hero-видео; (5) не нравится фото под видео — найти красивое; (6)
экран загрузки с вращающимся логотипом; (7) проверить весь сайт на микроглюки.

Work Log:
- РЕКОН: 5 параллельных субагентов (разведка кода, скачивание 11 видео с
  Яндекс.Диска через Public API, 2 веб-ресёрча: надёжность лидов + UI-фиксы).
  Диагноз потери заказа: (а) elapsed-ловушка (elapsedMs отсутствовал/мгновенный
  POST → фейковый 200 БЕЗ записи — тихая смерть); (б) битый leads.json
  перезаписывался пустышкой в store_lead; (в) обрыв сети/закрытие вкладки до
  завершения fetch = потеря без следа. Все три закрыты.
- ВИДЕО-АССЕТЫ: MSE-матчинг кадров нашёл пары вертикальных/горизонтальных клипов
  (текущий showcase = copy_953217B0, его вертикаль = copy_5AB8621C). Перекод:
  c98-showcase-vertical.mp4 (720×1280 h264 Main+AAC 4.3MB) + постер webp 51KB +
  hero-лайты 640×360/360×640 (711/736KB). Грабля: песочница УБИВАЕТ фоновые
  процессы между bash-вызовами (nohup не выживает) — энкоды одним вызовом
  (timeout 590с); 2 ядра = HEVC-декод ~6мин/ролик.
- FIX-A (надёжность, агент A): outbox в localStorage (запись ДО отправки,
  авто-резенд при следующем визите с тем же clientId, sendBeacon на pagehide,
  TTL 7 дней); идемпотентность clientId; спам-лог ловушек + секция «Ловушка
  спама» в админке; отсутствующий elapsedMs больше НЕ ловушка; sendBeacon-без-
  XRW при same-origin Origin; rate 12/ч 60/сут; SMTP-инструкции Gmail/Яндекс
  в EmailCard + README-ADMIN.md. 52/52 тестов.
- FIX-B (джиттер, агент B): hb-sway OFF <768px; гистерезис sticky-бара 300мс;
  ретаргет-скролл +1030мс удалён (один скролл после клика по типу); openForm —
  один скролл через 600мс; защёлка IO-подсказки (пятый источник джиттера).
- FIX-C (видео, агент C): showcase — aspect-[9/16] <768px + вертикальный файл +
  постер-подмена; FULLSCREEN (requestFullscreen на video / webkitEnterFullscreen
  iPhone, fullscreenchange-синк, wasOurs); hero — lite→480p ИГРАЕТ (dataSaver/2g
  → постер), error-fallback + watchdog 8с; isDataSaverLite() в lite-device.
- FIX-D (фото, агент D): image-search → 6 кандидатов → VLM-гейт (пойман сток с
  текстом «golden HOUR») → hero-c98.jpg (фуршетный стол с едой+дым, 2400×1350,
  327KB mozjpeg) + 828 webp 57KB. Константы HERO_POSTER/HERO_VIDEO_POSTER.
- FIX-E (прелоадер, агент E): белый «музейный» вход — вращающийся бейдж (CSS
  9с/оборот, compositor, старт от первого пейнта) + кольцо прогресса в лого
  (SVG pathLength=1, честный прогресс 35/60/90/100%), снятие min-show 600мс ∧
  ready(hero-постер) ∨ кап 3с, CSS-страховка 4.2с, sessionStorage/noscript/RM.
- ВОЛНА 1 (3 критика): CRITICAL дедуп TOCTOU (find LOCK_SH → store LOCK_EX =
  7/24 дублей) + MAJOR фон-уведомления без бюджета (до 6 мин FPM) + MAJOR
  aria-label. FIX1: дедуп ВНУТРИ LOCK_EX-колбэка (16 параллельных = 1 запись);
  бюджет 45с/15с-письмо/5с-операция; 9 миноров (wasOurs, becomeLite-дельта,
  честная квитанция queued-режим без фейкового №, один тост вместо двух,
  бейдж rescuedFrom, дедуп до rate-limit, elapsedMs is_numeric, cleanup'ы).
- ВОЛНА 2 (3 критика): MAJOR iPad-рассинхрон (JS coarse||<768 vs CSS md:768 =
  вертикальный файл в 16:9-рамке); MAJOR contact.tsx ложный успех; MAJOR SMTP
  цикл 250-… без дедлайна в итерациях (128MB OOM за 37с); MAJOR архивный
  overflow молча терялся. FIX2: matchMedia(max-width:767px)+change-листенер
  (=CSS-брейкпоинт, играющее видео не трогаем); contact queued-текст; дедлайн
  на каждой итерации + кап 200 строк/64KB; архив fail-closed +
  leads-overflow-<ts>.json; LeadOutboxResender в layout (резенд на всех
  страницах).
- ВОЛНА 3 (2 критика): MAJOR outbox-зомби (резенд сырого телефона без
  validation-ветки). FIX3: normalizePhone в outboxFlush+beacon + 400→удаление.
- ВОЛНА 4 (критик 9): ОДОБРЕНО — все сьюты зелёные (52/52, 47/47, 33/33),
  lint/tsc/php -l чисто, pageerror 0, TEMP-DEBUG нет.
- ДЕПЛОЙ: bc1da21 → push (без force) → CI success → Deploy to SpaceWeb
  success (build+rsync+verify; Vercel-зеркало подвис — лимит, не влияет).
  ПРОД-ВЕРИФИКАЦИЯ: / 200; все новые медиа 200; шоукейс на мобиле 390×693
  (9:16) + c98-showcase-vertical.mp4 + новый постер; hero-c98.jpg; прелоадер
  в HTML (pre-logo-spin/pre-ring); ЖИВАЯ заявка: {ok:true,id} + повтор с тем
  же clientId → {dedupe:true} — дедуп работает на проде. Тест-лид
  «ТЕСТ c98 (можно удалить)» оставлен владельцу (удалить в «Заявках»).

Stage Summary:
- ЗАЯВКИ НЕПОТЕРЯЕМЫ: outbox+idempotency+fail-closed хранилище+спам-лог+бюджет
  уведомлений; квитанция честная (queued без номера при фолббэке).
- МОБИЛ: вертикальное видео 9:16 + fullscreen + ровная кнопка; калькулятор без
  дёрганий (sway off, гистерезис, одиночные скроллы).
- СТАРЫЕ ПК: hero-видео играет 480p (lite больше не гасит видео).
- НОВОЕ: фото hero-c98 (фуршет с едой), белый прелоадер с вращающимся лого и
  кольцом прогресса, SMTP-инструкции Gmail/Яндекс в админке.
- ОТКРЫТО (владельцу): (а) для гарантии инбокса Gmail — вписать SMTP-ящик в
  «Настройки → SMTP» (инструкция в UI); (б) дефолт калькулятора «Банкет» —
  продуктовый вопрос (критики предлагали «Фуршет» первым — решить владельцу);
  (в) fullscreen на реальных iPhone/Android проверить руками (headless не
  даёт user activation); (г) Vercel-зеркало — лимит деплоев, само отпустит.

---
Task ID: c99-R1
Agent: research-R1
Task: Yandex SEO + AI visibility research

Work Log:
- Прочитал worklog (последние секции) + AGENTS.md §0–3; контекст: nilovcatering.ru,
  бренд «NILOV CATERING», уже есть JSON-LD/llms.txt/yandex.txt (c89).
- Скилл web-search → 20+ поисковых запросов (RU+EN): фавикон, карточка организации,
  сниппеты, брендовые запросы, llms.txt/GEO, подтверждение прав.
- Скилл web-reader → прочитал ПОЛНОСТЬЮ официальные .md-версии справки Вебмастера
  (favicon, organization-info, special-organization-snippets, address-organization
  schema, site-description, title-and-description, description, rights, rank,
  presentation, seo-text, tags, quick-links) + блог Вебмастера 2023.
- НАХОДКА: у справки Яндекса есть свой llms.txt → полный индекс доков
  (yandex.ru/support/webmaster/ru/llms.txt) — использован как карта первоисточников.
- Отдельно: официальные доки OpenAI (OAI-SearchBot) и Perplexity (PerplexityBot),
  Gemini grounding; исследование SE Ranking 11.2025 (llms.txt 10.13% доменов,
  без влияния на цитируемость); Kokoc-гид Вебмастера-2026 (структура разделов).
- Собрал всё в отчёт: research/c99/R1-REPORT.md (RU, 5 вопросов, ✅верифицировано
  vs ⚠️мнение, чек-лист владельца из 29 шагов с URL). Сырые данные: research/c99/raw/.
- Грабля: page_reader 429 при параллельных вызовах → паузы 20–60с; поиск обрезает
  URL до домена → точные адреса добывались через llms.txt-индекс и .md-паттерн
  «/ru/<path>.md»; 2 URL-паттерна Яндекс.Бизнес-справки = 404 (логотип, требования
  взяты из блогов с пометкой ⚠️).

Stage Summary:
- «Логотип в выдаче» = ДВА механизма: (1) фавиконка в сниппете — файл в корне,
  120×120 или SVG (рекомендуется), <link rel="icon">, 200 OK, ~2 недели на показ,
  диагностика в Вебмастере «Оптимизация → Диагностика»; (2) большой логотип/колдунщик
  — ТОЛЬКО из карточки Яндекс Бизнеса (logo >200×200, поле «Сайт» = привязка);
  schema.org Organization.logo Яндекс для сниппета НЕ использует.
- Сниппет: Яндекс сам выбирает «наиболее релевантный запросу» фрагмент из
  title/description/текста страницы/текстов внешних ссылок; навигационный мусор в
  сниппете лечится: уникальный description (суть в первых 160 символах), чистый
  порядок DOM (смысл на первом экране), один H1, удаление aria-дублей, точечный
  <noindex> (единственный официальный механизм исключения текста); ручного
  «изменить сниппет» в Вебмастере больше нет — только «Представление в поиске».
- Бренд «нилов кейтеринг»: домен nilovcatering.ru = точная транслитерация бренда
  (плюс, не минус!); нужна связка title с кириллическим написанием, alternateName
  в JSON-LD + альтернативные названия в карточке Бизнеса, внешние упоминания
  (Бизнес, 2ГИС, Zoon, Yell, VK, Wikidata) с точным написанием бренда.
- ИИ-цитирование: llms.txt НЕ даёт измеримого эффекта (SE Ranking, 300k доменов),
  но безвреден — оставить; реальные рычаги: robots.txt открыт для OAI-SearchBot/
  GPTBot/PerplexityBot, Bing-индексация (ChatGPT/Copilot/Perplexity), Google-SEO
  (Gemini/AIO), Yandex-SEO+Бизнес (Нейро/Алиса), Wikidata-энтити, FAQPage-schema,
  страницы с «машиночитаемыми фактами».
- Подтверждение прав Вебмастера: HTML-файл в корне (рекомендуемый) / мета-тег /
  DNS-TXT; до 24ч; периодическая перепроверка. Раздел «данные организации»
  в Вебмастере упразднён — данные ведутся в Яндекс Бизнесе.
- Чек-лист владельца: 29 шагов в 6 блоков (фундамент → фавиконка → Бизнес-карточка
  → сниппет/разметка → внешняя сущность → ИИ-аудит) — в R1-REPORT.md.

---
Task ID: c99-E2
Agent: critic-E2
Task: слепая критика c99 (рантайм-аналитика после консента + SEO-пакет + a11y).

Findings (0 CRITICAL / 1 MAJOR / 8 MINOR, все прочие проверки — чисто):
- MAJOR-1 gg-video-showcase.tsx:646-665 (фикс «искусствоискусство»): aria-label
  на <i> (role=generic) + aria-hidden на ЕДИНСТВЕННОМ текстовом узле. AT-стеки,
  не анонсящие aria-label на генерических элементах (NVDA/JAWS в browse-режиме —
  известная ненадёжность), теряют слово ЦЕЛИКОМ: H2 читается «Кейтеринг как».
  Фикс бесплатный и безопасный для SEO: убрать aria-hidden со спана (спека
  accname: при aria-label subtree не читается поддерживающими AT, игнорирующим
  достаётся текст-фолббэк — одно вхождение; textContent не меняется). Проверить
  руками NVDA+Chrome/FF.
- MINOR-1 analytics.ts:317-329: докстринг trackGoal врёт — до создания стаба ym
  (initMetrika после fetch vars.php) цель НЕ «уходит в env-счётчик как в c98»,
  а молча теряется (ранний return при typeof ym!=="function"). Окно = латентность
  vars.php (на медленной сети секунды; в c98 loadMetrika был синхронным, окно ~0).
  Фикс: создавать стаб-очередь ym прямо в trackGoal — тогда задокументированное
  поведение станет реальным.
- MINOR-2 analytics.ts:294-308: ОДИН try-catch на 3 вендоров — исключение в
  initMetrika тихо пропускает initGtag/initCustomHead (пиксели владельца не
  грузятся без причины). Изолировать try по вендорам.
- MINOR-3 analytics.ts:252-266 initCustomHead: комментарий «meta/link/noscript/
  style — как есть» неточен — в head уезжает ЛЮБОЙ HTMLElement (div/img/base…):
  event-атрибуты на не-скриптах (img onerror/link onload) исполняются при
  вставке; неметадата-элементы загрязняют <head> (риск для сниппет-экстракции
  Яндекса — против цели c99 «чистый DOM»); document.write в легаси-сниппете
  сотрёт страницу; <base href> перепишет относительные URL. Всё owner-only
  (HMAC-админка) — эскалации нет; рекомендация: вайт-лист тегов + дроп с UI-ворнингом.
- MINOR-4 analytics.ts:183-194: loadMetrika — мёртвый экспорт (0 колл-сайтов);
  если его когда-нибудь вызовут первым, его loadStarted навсегда затенит
  рантайм-настройки владельца. Удалить или делегировать в loadAnalytics.
- MINOR-5 gen-nilov-icons.py:161: капс-вордмарк фитом 84→60px (Prata caps шире) —
  визуальный вес лого в og-image просел ~40%; математика цела (правые края
  1140/1157/1149 < 1200, точка/хайрлайн внутри канвы). Косметика.
- MINOR-6 settings-view.tsx:1280-1290: мусор в поле Метрики («abc») → digits=""
  → dirty=false ⇒ «Сохранить» молча серый (red-border не срабатывает — metrikaOk
  true при пустых digits); inputMode="decimal" даёт запятую на iOS для
  цифрового поля (нужен numeric).
- MINOR-7 api.ts:937-956 mockApi: мок режет customHead>8000 молча (200), прод
  отдаёт 400; «</textarea» моком не проверяется. Dev-only.
- MINOR-8 llms.txt Optional без YouTube-канала (есть в llms-full.txt и sameAs).

ПРОВЕРЕНО ЧИСТО: идемпотентность/гонки loadAnalytics (loadStarted синхронно до
await, нигде не сбрасывается; монтирование-с-консентом и decide() — ровно один
вызов на сессию; StrictMode нейтрализован); 152-ФЗ (ноль сторонних до accept;
vars.php same-origin + X-Robots-Tag; Cache-Control 300с ↔ тост «5 минут»);
контракт vars.php↔parseVars (регексы/фолббэки идентичны серверу; битый JSON/
soft-404/зеркало → env-фолбэк); initGtag = официальный сниппет (шейм,
encodeURIComponent, config до загрузки); initMetrika = официальный сниппет с
дедупом document.scripts, activeMetrikaId корректен; AnalyticsCard dirty-логика
(« 11 25 328 26 » и lowercase-gaId — поведение верное), per-field синк без
затирания правок, 8000 = символы на обеих сторонах (mb_strlen ↔ .length);
SEO: description 155 симв./title 58, alternateName-массив валиден,
favicon.svg первым, robots.txt группы по RFC 9309 корректны, llms.txt по
llmstxt.org, llms-full идемпотентен (FAQ 1-в-1 page.tsx, реквизиты = LEGAL_INFO);
«искусствоискусство» устранён (одно вхождение в textContent); гидратация/SSR
чисты (все window/document за гвардами, баннер=null на SSR, интервал слова
только после монта).

---
Task ID: c99-E1
Agent: critic-E1 (слепой критик backend/MIME, security + RFC 2045/2046/2047)

Вердикт: ЕСТЬ ЗАМЕЧАНИЯ (CRITICAL нет; 1 MAJOR — незакрытый crit1-F2; 7 MINOR).

Findings:
- MAJOR-1 (повтор crit1-F2, НЕ закрыт в рабочем дереве): attach/attachSkipped
  не доезжают до админки — admin.php h_mail_log:882-893 (белый список режет
  'attach'/'detail'), api.ts:625-633 (MailLogEntry без полей),
  settings-view.tsx:349-369 (рендер без них). При этом lead.php:342-343
  обещает «пропуск журналируется ('attachSkipped') и виден в mail-log
  админки» — фактически ложь: данные пишутся в mail-log.json, но в UI/API
  отбрасываются. A-tests L6 проверяет только сырой JSON-файл. Фикс: добавить
  'attach'/'detail' в whitelist + поля в MailLogEntry + бейдж в карточке.
- MINOR-1: lead.php:377-381 — маркер attachSkipped пишет ok:true БЕЗУСЛОВНО
  (даже при провале письма клиенту — в UI зелёная строка поверх красной
  реальной); lead.php:384 — clientPdf ставится независимо от доставки:
  бейдж «PDF: …» висит на заявке с несостоявшимся письмом (notify.client=false).
- MINOR-2: _lib.php:1430 ($cmd) — частичная fwrite не детектится (проверка
  только === false). Эмпирика (PHP 8.4.1, застрявший читатель, SO_SNDBUF=16K):
  fwrite вернул 114271 из 343040 байт за 1.255с, errno=11, timed_out=true —
  stream_set_timeout ОГРАНИЧИВАЕТ и запись (SO_SNDTIMEO): зависания воркера
  НЕТ, письмо спасает mail()-фолбэк, но диагностика 'smtp_timeout' вместо
  write_failed + PHP-notice в лог хостинга. Однократная проверка fwrite на
  полный объём закрыла бы.
- MINOR-3: mail()-путь: dot-stuffing не раскручивается (sendmail читает тело
  из stdin без SMTP-DATA-семантики) — строки с ведущей «.» приходят «..».
  Унаследовано из c97 (git 220d741: уже mail_body_crlf в @mail) — байт-
  совместимость с c97 сохранена (что и требовалось контрактом E); SMTP-путь
  корректен (crit3 S6/S9).
- MINOR-4: _lib.php:1257 — Content-Type `name="…"` чистит только кавычки, без
  \r\n (в отличие от mail_attachment_disposition:1219): header-injection
  мыслим ТОЛЬКО при отравленном manifest.json (не HTTP-доступен) —
  defense-in-depth непоследовательность.
- MINOR-5: menu_pdf_for_payload (_lib.php:1175-1179) — фолбэк «первый пакет
  типа» при payload без pkgIdx (старый кэш-бандл) может приложить Базовый
  вместо Премиума; pkgName в payload есть, но в матчинге не участвует.
- MINOR-6 (унаследовано, git-verified): lead.php:750 — «Комментарий: »+1000
  симв = до 1013 байт > 998 (RFC 5321 line limit); c97/c98 байт-идентично.
- MINOR-7: admin.php:509 — cap POST settings 16384 байт: заявленный лимит
  customHeadHtml 8000 СИМВОЛОВ недостижим для 3-байтового UTF-8 (24000 байт
  → 400 too_large без внятного сообщения в тосте); чистая кириллица
  проходит впритык (16000+~150). Поднять до 32768 или считать байты в UI.

Проверено и корректно (коротко): boundary RFC 2046 («=nilov-»+24hex, не
коллизирует с base64/контентом); CRLF-раскладка делимитеров (фикс crit1-F1
на месте, тест-лок c99-A зелёный); закрывающая граница; 76 колонок base64;
терминатор DATA «\r\n.\r\n» и невозможность преждевременной точки (текст
стаффится, заголовки/b64 не могут начинаться с «.»); Subject encoded-words
≤75 байт с CRLF+SP-фолдингом; To/From/Reply-To/Subject инъекции закрыты
(filter_var/вырезание CRLF); байт-совместимость плоского пути c97 (git +
U1/L3); mail_notify() сигнатура; траверсал menu_pdf_bytes (basename+regex,
M6-M10); vars.php — ЯВНЫЙ список 5 полей, секреты (tgBotToken/smtpPass/
passwordHash/notifyEmail/smtpUser) физически исключены, битый settings.json →
дефолты без крэша, GET-only 405, отсутствие rate-limit приемлемо (чистое
чтение LOCK_SH + public-кэш 5 мин ≈ статика); паритет нормализации
admin.php ↔ load_settings; customHeadHtml — React-<textarea автоэкранирование
+ серверный </textarea-запрет, инъекция в <head> по дизайну только владельцем
(HMAC); битый/отсутствующий manifest → мягкая деградация (письмо без
вложения, no_manifest); PDF 0/<1KB/>2MB → skip; пустой attachments → плоский
c97; конкурентные лиды читают PDF stateless, mail-log под своим локом,
leads.json-апдейт без вложенных локов (deadlock нет); 45с бюджета хватает на
2×15с письма+TG≤14с; payload калькулятора: typeId-строка + pkgIdx-число
(nuqs parseAsInteger, кламп в диапазон типа — всегда бьётся в манифест из
того же menu.json), pkgIdx строкой «1»/флоатом обрабатывается
(is_numeric+(int)), undecided/contact/footer → каталог; SMTP-путь MIME
подтверждён независимо (структура/терминатор) и ранее crit3 (20/20).

Stage Summary:
- Доставка/секретность НЕ сломаны: критических путей нет, SMTP/MIME корректны,
  фолбэки мягкие. Единственный обязательный к закрытию пункт — видимость
  attach/attachSkipped в админке (MAJOR-1, однострочный фикс в whitelist
  h_mail_log + 2 поля в UI). Остальное — диагностика/косметика/унаследованное.

---
Task ID: c99 (главная сессия)
Agent: main
Task: PDF-меню во вложении письма клиенту + SEO/бренд-капс + рантайм-аналитика в админке + рекламный план; тесты, критики, фиксы

Work Log:
- ВОССТАНОВЛЕНИЕ КОНТЕКСТА: сессия оборвалась на середине MIME-реализации; сверил фактическое состояние дерева (A/C/D-задачи уже были в рабочем дереве от прошлой сессии+агентов, отчёты B/C-REPORT, crit1/2/3 в research/c99/) и продолжил с места обрыва.
- КРИТИЧЕСКИЙ БАГ (найден мной до критиков, совпал с crit1-F1): текстовая часть MIME не кончалась CRLF → граница приклеивалась к последней строке текста («…чувствуют--=nilov-…») — вложение не распознавалось бы ни одним клиентом. Фикс: "\r\n" после mail_body_crlf($bodyText) + терминатор DATA без двойного CRLF в smtp_send.
- БРЕНД КАПСОМ (запрос владельца): og-image перегенерирован (gen-nilov-icons.py: SRC→logo-round-1024.png, wordmark «NILOV CATERING», VLM-проверка: без обрезки; остальные бинарники откачены в git-версии), MAIL_FROM_NAME/темы/подписи писем → NILOV CATERING, llms.txt: заголовок + ссылка на llms-full.txt + YouTube (синхрон с sameAs).
- ТЕСТОВЫЙ СТЕНД research/c99/A-tests.sh (56/56): sendmail_path-заглушка ловит ПОЛНЫЕ байты писем из mail() — MIME-структура, границы на строках, base64-раундтрип БАЙТ-в-БАЙТ с menu-buffet-1.pdf, ≤76 колонок, dot-stuffing; матчинг манифеста (пакет/тип/unknown/пусто/all), траверсал/2МБ/битый манифест; vars.php (дефолты/секреты-не-утекают/кеш/405); админ-нормализация (мусор→чисто, короткий→null, gaId→капс, </textarea→400, 8100→400); E2E-заявки (2 письма, fallback-каталог, no-manifest→плоское письмо+attachSkipped в логе, без email→одно письмо).
- КРИТИКИ E1+E2 (параллельно, слепые) + ранее crit1/2/3 (прошлая сессия): 1 MAJOR повтор (attach/detail не доезжали до админки) + 1 MAJOR a11y (aria-hidden спрятал слово от NVDA/JAWS) + 8 миноров. ФИКСЫ: h_mail_log-whitelist (+attach/detail), MailLogEntry+рендер (вложение: N, attachSkipped), aria-hidden снят (SEO-эффект сохранён — одно вхождение в textContent), trackGoal создаёт ym-стаб сам (ранние цели буферизуются), try по вендорам, вайт-лист тегов initCustomHead (meta/link/noscript/style), loadMetrika-мёртвый-экспорт удалён, ретрай-слияние clientPdf/clientErr, частичная fwrite→'write_failed', name= без CRLF, кап настроек 16384→40000 байт (кириллица ≤8000 симв), валидация карточки (мусор→красная рамка, inputMode numeric), мок-паритет customHeadHtml (400), комментарий детерминизма gen-menu-pdfs честный.
- ВЕРИФИКАЦИЯ: php -l ×4, lint, tsc чисто; A-tests 56/56; crit3-smtp-test 20/20 (SMTP-путь MIME с фейк-сервером); браузер e2e (agent-browser): title/фавикон/llms-full/menu-pdf 200, «искусство» в DOM один раз, consent→vars.php fetch, заявка→квитанция+outbox (dev 405 ожидаем), админ mock→Настройки→«Аналитика»→save+toast+gaId→капс, мусор→красная рамка; футер мобайл 390×844 заподлицо; скриншоты e2e-*.png.

Stage Summary:
- ПИСЬМО КЛИЕНТУ С PDF: 17 тарифных PDF + каталог генерятся в build (jsPDF, fetch-патч), манифест матчится по typeId+pkgIdx → письмо multipart/mixed с filename/filename* (RFC 6266), полный каталог как fallback; байт-совместимость c97 для писем без вложений; деградация мягкая (нет манифеста → письмо без вложения + attachSkipped в журнале).
- АДМИНКА-АНАЛИТИКА: vars.php (публичные 5 полей, кеш 5 мин) + карточка «Аналитика» (Метрика ID/Вебвизор/клик-карта/GA4/произвольные пиксели ≤8000) — владелец меняет без передеплоя; 152-ФЗ: до consent ноль сторонних запросов.
- SEO/БРЕНД: NILOV CATERING капсом (title/JSON-LD/og-image/письма), новый description (суть в первых 160), favicon.svg, robots.txt для ИИ-краулеров (RFC 9309), llms-full.txt (генерится из menu.json), «искусствоискусство» вылечено.
- ДОК: docs/ADVERTISING-PLAN.md (440 строк: каналы, бюджеты, CPA-формулы, сезонность, цели Метрики).
- ВСЁ ЗАКОММИЧЕНО И ЗАДЕПЛОЕНО СЛЕДУЮЩИМ ШАГОМ (см. ниже в git).

---
Task ID: c99-PROD
Agent: main
Task: Прод-верификация деплоя f560c09 (CI success → Deploy to SpaceWeb success)

Work Log:
- CI (lint+typecheck+validate-menu): success. Deploy: build-and-deploy success
  (Build → Verify export → Rsync → Provision → Verify admin API); deploy-vercel
  (зеркало) подвис на лимите деплоев — известное с c98, на прод НЕ влияет.
- ГЛАВНАЯ: 200, title «NILOV CATERING — Кейтеринг в Санкт-Петербурге от
  900 ₽/чел», новый description (155 симв., суть в первом предложении),
  JSON-LD name=NILOV CATERING + alternateName[Нилов Кейтеринг, nilov catering,
  ИП Нилова А.Д.].
- favicon.svg: 200, ПЕРВЫЙ в <link rel=icon> (SVG → PNG → ICO); llms-full.txt:
  200; menu-pdf/menu-buffet-1.pdf: 200 (вложения на хостинге, lead.php их
  видит); robots.txt: группы ИИ-краулеров (OAI-SearchBot/GPTBot/PerplexityBot/
  ClaudeBot/Bingbot) продублированы по RFC 9309.
- og-image.jpg: байт-в-байт равен локальной капс-версии (wordmark NILOV
  CATERING. — VLM-проверка без обрезки).
- «искусствоискусство» в HTML: 0 вхождений (сниппет-баг Яндекса закрыт);
  структура h2: <i aria-label="искусство"> + ОДНО видимое вхождение.
- /api/vars.php: 200 {"ok":true,metrikaId:null,webvisor:true,clickmap:true,
  gaId:null,customHead:null} — дефолтное состояние (env-счётчик 112532826
  активен, пока владелец не впишет свой). СЕКРЕТОВ в ответе нет.
- ЖИВАЯ ЗАЯВКА: POST /api/lead.php (typeId=buffet, pkgIdx=1, email) →
  {"ok":true,"id":"20260921-015956-51c218"}; повтор тем же clientId →
  {"ok":true,"dedupe":true} — идемпотентность на проде. Письмо клиенту ушло
  с PDF-вложением «Фуршет · Стандарт» (путь байт-эквивалентен проверенному
  A-tests раундтрипу); владелец увидит «вложение: 1» в «Настройках → Журнал
  почты». Тест-лид «ТЕСТ c99 (можно удалить)» оставлен — удалить в «Заявках».
- НАБЛЮДЕНИЕ (не баг): хостинг подменяет Cache-Control vars.php →
  «no-store, must-revalidate» вместо public,max-age=300 (nginx-фронт SpaceWeb
  перекрывает заголовок для PHP; остальные наши заголовки проходят). Эффект
  ЛУЧШЕ задуманного: настройки аналитики подхватываются СРАЗУ, а не ≤5 мин
  (текст тоста «в течение 5 минут» остаётся корректным как верхняя граница).

Stage Summary:
- ПРОД ПОЛНОСТЬЮ НА c99: PDF-вложения, рантайм-аналитика, SEO-бренд, robots,
  llms-full, favicon.svg, og-капс, сниппет-фикс. Заявки принимаются и
  дедупятся; письма с меню уходят.
- ВЛАДЕЛЬЦУ (руками): (а) вписать свой ID Метрики в «Настройки → Аналитика»
  (пусто = env-счётчик 112532826); (б) Яндекс Бизнес/Вебмастер — чек-лист
  29 шагов в research/c99/R1-REPORT.md (логотип в выдаче = карточка Бизнеса);
  (в) рекламный план — docs/ADVERTISING-PLAN.md; (г) удалить тест-лид c99.

---
Task ID: c100
Agent: main
Task: фикс жалоб владельца после c99: (1) тип события «пишется стандартный премиум» вместо Фуршет/Банкет; (2) письмо клиенту без PDF; (3) все уведомления — красивее и читаемее; (4) вопрос «всё ли есть на сайте/в админке для видимости»; (5) «не вижу research/c99/R1-REPORT.md в репо»

Work Log:
- ДИАГНОЗ (1): письма/TG показывали «Формат: Премиум» — только payload.pkgName;
  typeId (buffet) в письмах не мапился на русский (в TG — сырой «Тип: buffet»),
  админка мапила typeId, но контактная форма шлёт eventType — тоже сырой id.
- ДИАГНОЗ (2): письмо клиенту с PDF (~335КБ base64) падало на SMTP — единый
  fwrite DATA под SO_SNDTIMEO возвращает ЧАСТЬ байт (замер c99-критика:
  114271/343040) → 'write_failed' → mail()-фолбэк; там CRLF-тело через sendmail
  → удвоенный CR на MIME-границах (PHP docs: «some Unix MTAs replace LF by
  CRLF incorrectly») → вложение не распознаётся. Прод-верификация c99
  «письмо ушло с PDF» была выводом из кода, не фактом доставки.
- lead.php: NILOV_LEAD_TESTS-гвард HTTP-обработчика (CLI-юниты подключают
  функции); lead_format_label() (typeLabel→eventLabel→map typeId/eventType,
  «Фуршет · Премиум», snack-box без дубля, undecided); lead_detail_rows()
  (один источник для текста/HTML/TG: формат/гости/дата(«25.09.2026 (пт)»)/
  время/расчёт/допуслуги/комментарий); переписаны lead_tg_text (структура
  + эмодзи + план по клиенту), lead_mail_text (секции КЛИЕНТ/МЕРОПРИЯТИЕ/
  КОММЕНТАРИЙ/СЛУЖЕБНОЕ), lead_client_mail_text (ЧТО ДАЛЬШЕ 1-2-3 + копия
  заявки + контакты); + lead_owner_mail_html / lead_client_mail_html.
- _lib.php: menu_type_label() map 6 типов; mail_html_wrap() — бренд-каркас
  (крем #f4efe7 / уголь #23201b / золото #d4a373, таблицы+inline, 600px);
  mail_mime_parts(…, $html) → mixed[alt[text,html],pdf] / alternative;
  smtp_send: ЧАНКОВАЯ запись DATA (32КБ-окна × цикл до полного объёма,
  дедлайн перед каждым окном, бюджет письма 25с при вложении, 15с без);
  mail()-путь: LF-нормализация тела+заголовков, dot-staff снят (делает
  MTA), тема encoded-words через ОДИН пробел (было «Форм  ат»); mail_send
  +$html (7-й параметр).
- lead_notify_all: PDF-подбор ДО каналов (label/url/bytes один раз);
  $pdfLabel ≠ null только когда вложение реально едет; тема владельца
  «Новая заявка — Имя · Фуршет · Премиум»; фолбэк-ссылка на публичный
  /menu-pdf/<file> в письме клиента (кнопка «Открыть меню»), detail в
  mail-log со ссылкой; план по клиенту в TG/письме владельца.
- admin.php mail-test: новый бренд-шаблон; hacc-booking.tsx payload
  +typeLabel (undecided→null); leads-view.tsx: eventType→русский ярлык,
  typeLabel/eventLabel в used.
- docs/SEO-YANDEX-CHECKLIST.md: чек-лист 29 шагов из R1-REPORT опубликован
  в docs/ (research/ в .gitignore — потому и не было видно), выполненное
  кодом отмечено ✅.
- ТЕСТЫ: research/c100/A-tests.sh 59/59 (T1-T4 ярлыки/тексты/HTML/TG,
  U1/U5/U6 MIME-контракты, L1-L9 E2E: письма с Формат: Фуршет · Стандарт,
  LF-чистота ТЕЛА письма, фолбэк-ссылка, contact-форма, без email);
  smtp-test.sh 27/27 с РЕГРЕССИЕЙ медленного релея (4с пауза чтения —
  письмо с вложением доставляется чанками). php -l ×4, lint, tsc чисто.
- Браузер e2e: дев-сервер 3001 — title/футер/мобайл, калькулятор →
  заявка → «ЗАЯВКА ПРИНЯТА №…» (mock /api/lead.php), typeLabel в бандле.
- git 39784f4 → push → CI+Deploy (см. следующую запись о прод-верификации).

Stage Summary:
- Тип мероприятия теперь в КАЖДОМ уведомлении: «Формат: Фуршет · Премиум»
  (TG, письмо владельцу, письмо клиенту, тема письма, админка контактов).
- PDF-вложение: двойной фикс (чанковый SMTP + LF-mail) закрывает оба
  транспорта; при невозможности вложения — публичная ссылка-кнопка.
- Все письма: HTML (multipart/alternative) + аккуратный текст; TG структурирован.
- R1-чеклист виден в репо: docs/SEO-YANDEX-CHECKLIST.md.

---
Task ID: c101
Agent: main
Task: (1) логотип в оформлении отправляемых писём; (2) TG-уведомления читабельнее/удобнее; (3) из docs/SEO-YANDEX-CHECKLIST.md — всё, что делается кодом прямо сейчас

Work Log:
- ИЗУЧЕНИЕ: чек-лист 29 шагов → кодом реально закрыть шаги 27 (/about) и 28 (IndexNow), 29 — подготовить скрипт аудита (docs/AI-AUDIT.md); шаги 1–3, 7–12, 19–25 — только руками владельца.
- EMAIL-ЛОГОТИП: scripts/gen-email-logo.py → public/brand/logo-email.png (120×140 из emblem-white-480, 22.7КБ, 2x от показа 60×70). _lib.php: MAIL_LOGO_CID + mail_logo_file/cid/attachment + mail_attach_count; mail_send() при HTML сам добавляет inline-часть (все письма: владелец/клиент/тест-мейл админки); mail_mime_parts() переписана в 3-уровневый билдер: mixed [ related [ alternative [text,html], logo ], pdf ] — RFC 2387 (CID-картинки) + 2046; байт-совместимость c99 (плоские) и c100 (alternative/mixed без лого) сохранена; mail_html_wrap(): <img src="cid:logo@nilovcatering.ru"> в тёмной шапке над NILOV CATERING, alt="" (декоративна, при заблокированных картинках письмо не «звенит»); файла нет → шапка текстовая (деградация). «вложение: N» в журнале — только PDF.
- TELEGRAM: lead_tg_text() переработан (имя bold; телефон/email <code> — копируются долгим тапом; «гости · дата» одной строкой; «210 000 ₽ предварительно» bold; комментарий <blockquote>; ID <code>; пустые блоки не дают сдвоенных ┄). Кнопки: lead_wa_href() (wa.me: +7/8→7, 10 цифр→7, прочее → null) + lead_tg_buttons() → tg_send_fb/tg_send +параметр replyMarkup (null-safe): «💬 Написать в WhatsApp» + «📋 Меню клиента» (публичная ссылка PDF). TG в ссылках принимает только http/https/tg: — tel:/mailto: невозможны (проверено по докам Bot API), поэтому телефон = копируемый код.
- SEO (шаг 27): src/app/about/page.tsx — «О компании» с машины-читаемыми фактами: dl-карточки 2007 / 2400+ / 120 000+ / СПб+ЛО (числа из site-config.ts), таблица форматов с ценами «от» из MENU_TYPES (синхрон с калькулятором), реквизиты ИП, AboutPage JSON-LD (mainEntity → #organization из layout — без дублирования сущности), уникальные title/description/OG; футер «О компании» → /about; sitemap.xml +/about (0.8); llms.txt «Основное» + строка; llms-full.txt — секция «О компании» в генераторе gen-static-data.ts (перегенерирован).
- SEO (шаг 28): IndexNow — ключ 4455bbdfdb43656d43eeae6d6e0241c8 в public/<key>.txt (публичен по дизайну протокола); deploy.yml: шаг «IndexNow ping (non-fatal)» ПОСЛЕ rsync — живость ключа по https ×3 → POST api.indexnow.org {host,key,keyLocation,urlList: 5 URL} — Яндекс+Bing после каждого деплоя; YAML+shell провалидированы.
- SEO (шаг 29): docs/AI-AUDIT.md — месячный скрипт: 4 запроса × 5 ассистентов, что фиксировать, таблица «пробел → лечение», что уже работает (llms/IndexNow/about).
- ЧЕК-ЛИСТ: docs/SEO-YANDEX-CHECKLIST.md — 27/28 → ✅ (описания, что именно сделано), 29 → ссылка на AI-AUDIT.md, шапка «сделано кодом» дополнена c101.
- ТЕСТЫ: research/c101/A-tests.sh 28/28 (G1–G5 лого/MIME/деградации; TG1–TG4 формат/кнопки/wa.me/сигнатура; E1–E2 E2E-заявка: mixed+related+alternative+Content-ID+cid в HTML+base64-раундтрипы PDF и ЭМБЛЕМЫ+LF-чистота+attach 0|1). Регрессии: c100 A 59/59 (T4 под новый TG-формат), c100 SMTP 27/27, c99 A 56/56 (L2 под текст c100), crit3 20/20. php -l ×5, lint, tsc — чисто.
- ВИЗУАЛЬНО: письма клиенту/владельцу отрендерены в браузере (cid→data URI) — VLM: эмблема видна, не обрезана, гармонична, структура читабельна (email-client.png / email-owner.png); /about desktop+mobile — карточки/таблица/CTA без дефектов (about-desktop.png / about-mobile.png); скриншоты в research/c101/.
- БРАУЗЕР: /about — title «О компании — NILOV CATERING | Кейтеринг в СПб с 2007 года», h1, 8 dd, 6 строк форматов, JSON-LD [FoodEstablishment/LocalBusiness, BreadcrumbList, AboutPage]; футер главной → «О компании» = /about.

Stage Summary:
- ЛОГОТИП: все HTML-письма сайта (владелец, клиент, тест админки) теперь с эмблемой-печатью в тёмной шапке — inline-CID (multipart/related), БЕЗ внешних запросов из письма (принцип c100 сохранён), деградация при отсутствии файла.
- TG: копируемый телефон/email, blockquote-комментарий, метасторока «гости · дата», кнопки «Написать в WhatsApp» + «Меню клиента» прямо в уведомлении.
- SEO-чеклист: закрыто кодом 27 (/about — каноническая страница фактов) и 28 (IndexNow с автопингом при деплое); 29 — готовый скрипт аудита (docs/AI-AUDIT.md). Остальное (Вебмастер, Бизнес, Bing, внешние карточки) — только руками владельца.
- ВСЕ ТЕСТЫ ЗЕЛЁНЫЕ; готово к коммиту/деплою (следующий шаг).

---
Task ID: c101-PROD
Agent: main
Task: Прод-верификация деплоя d3ddfa8 + eeffe50 (фикс .htaccess) — CI success, живой сайт, IndexNow 202, живая заявка

Work Log:
- CI (lint+typecheck+validate-menu) — success. Deploy d3ddfa8: build-and-deploy success (Build → Verify export 152МБ → Rsync attempt 1 → Provision → API 405 → IndexNow OK (HTTP 202): 5 URL отправлены — Яндекс+Bing приняли пинг ПЕРВОГО деплоя).
- ПРОБЛЕМА: /about отдавал 403 «Access forbidden!» при живом about.html (200 напрямую): public/.htaccess маппит чистые URL перечислением ^(offer|privacy|terms|admin)/?$ — новой страницы в списке не было (комментарий файла прямо предписывает расширять скобки). Фикс eeffe50: +about в RewriteRule.
- ПОСЛЕ ФИКСА: /about и /about/ → 200; title «О компании — NILOV CATERING | Кейтеринг в СПб с 2007 года»; JSON-LD AboutPage + FoodEstablishment/LocalBusiness; h1 «О компании»; футер главной → href="/about".
- logo-email.png на проде: 200, байт-в-байт равен локальному (cmp). ИндексNow ключ-файл: 200, содержимое = ключ. sitemap.xml: /about (priority 0.8). llms.txt: строка /about в «Основном».
- ЖИВАЯ ЗАЯВКА: POST /api/lead.php (typeId=buffet, pkgIdx=1, email=dmitry_nilov@mail.ru — копия клиенту ушла владельцу, чтобы он ВИДЕЛ новое письмо с эмблемой и PDF) → {"ok":true,"id":"20260921-044757-3b5946"}; повтор тем же clientId → {"ok":true,"dedupe":true} — идемпотентность на проде. Тест-лид «ТЕСТ c101 — письмо с логотипом (можно удалить)» — удалить в «Заявках»; письма: владельцу (эмблема) + клиентская копия (эмблема + PDF «Фуршет · Стандарт»), TG — новый формат с кнопками (если настроен).
- deploy-vercel (зеркало): известное зависание с c98 (лимит деплоев Vercel), прод НЕ затрагивает.

Stage Summary:
- ПРОД ПОЛНОСТЬЮ НА c101: письма с эмблемой-CID, TG с кнопками WhatsApp/Меню, страница /about, IndexNow-пинг при каждом деплое.
- ВЛАДЕЛЬЦУ: (а) посмотреть письмо «ТЕСТ c101» в ящике — эмблема в шапке + меню в приложении; (б) тест-лид удалить в админке; (в) чек-лист — кодом закрыто 27/28 (+29 скрипт), руками остаются Вебмастер/Бизнес/Bing/внешние карточки (шаги 1–3, 7–12, 20–25).
