# SEO-чеклист владельца: Яндекс + ИИ-ассистенты (29 шагов)

> **Откуда взялся этот файл.** Исследовательский отчёт цикла c99 жил в
> `research/c99/R1-REPORT.md` — каталог `research/` исключён из git
> (рабочие материалы агентов), поэтому в репозитории его не было видно.
> С c100 практическая часть — чек-лист владельца — опубликована в `docs/`,
> чтобы её можно было найти и отмечать выполненное. Полная версия с
> методологией и ссылками на первоисточники — в приложении ниже.
>
> **Что уже сделано на сайте (циклы c99/c100/c101, руками владельца не нужно):**
> favicon.svg + 120×120 PNG в корне и `<link rel=icon>`, robots.txt с
> группами ИИ-краулеров, /llms.txt и /llms-full.txt (генерируются сборкой),
> title/description/JSON-LD (NILOV CATERING + alternateName), sitemap.xml,
> лечение дублей «искусствоискусство», метрика-счётчик и аналитика из
> админки, **страница /about с машины-читаемыми фактами (c101, шаг 27)** и
> **IndexNow — ключ-файл + авто-пинг Яндекс/Bing при каждом деплое (c101,
> шаг 28)**. Пункты 4–6, 13–16, 18, 26–28 ниже закрыты кодом сайта —
> отмечены «✅ (сделано кодом)»; для шага 29 готов скрипт аудита —
> docs/AI-AUDIT.md.

---

## ЧЕК-ЛИСТ ДЛЯ ВЛАДЕЛЬЦА (конкретные шаги, по порядку)

### Блок А. Фундамент (1 день)

1. ☐ **Яндекс Вебмастер**: добавить сайт https://nilovcatering.ru → подтвердить права **HTML-файлом** (скачать файл из Вебмастера, положить в корень хостинга SpaceWeb, проверить доступность `https://nilovcatering.ru/<файл>` = 200) → https://webmaster.yandex.ru/sites/add/
2. ☐ Настроить в Вебмастере: главное зеркало (https, без www) в «Индексирование → Переезд сайта»; robots.txt и sitemap.xml («Индексирование → Файлы Sitemap»); **Региональность = Санкт-Петербург** («Представление в поиске → Региональность»); привязать счётчик Метрики; включить уведомления.
3. ☐ **Bing Webmaster Tools** (для ChatGPT/Copilot/Perplexity): добавить сайт, подтвердить (можно тем же способом/Import from Google Search Console), отправить sitemap → https://www.bing.com/webmasters
4. ✅ **robots.txt**: убедиться, что НЕ запрещены `OAI-SearchBot`, `GPTBot`, `PerplexityBot`, `Googlebot`, `Bingbot`, `YandexBot`, а также каталог фавиконки; разрешить `/llms.txt`, `/yandex.txt`, sitemap.

### Блок Б. Фавиконка/логотип в Яндексе (1 день + 2 недели ожидания)

5. ✅ Подготовить **favicon.svg (векторный логотип-бейдж)** и **PNG 120×120** (проверить читаемость в тёмной/светлой теме) → положить в корень: `https://nilovcatering.ru/favicon.svg` (+ `favicon.ico` 32×32 как фолбэк браузеров).
6. ✅ В `<head>` главной — ОДНА каноническая ссылка: `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` (для .ico-фолбэка — вторая с `type="image/x-icon"`; следить, чтобы Next.js не плодил конфликтующие линки).
7. ☐ Проверить «Оптимизация сайта → Диагностика сайта» в Вебмастере — статус фавиконки; после появления роботом подождать **~2 недели** на показ в выдаче. (Справка: https://yandex.ru/support/webmaster/ru/search-results/favicon)

### Блок В. Карточка Яндекс Бизнеса (главный источник логотипа/колдунщика) (2–3 часа + модерация)

8. ☐ **Добавить организацию**: https://yandex.ru/sprav/companies → «Добавить» → название **«NILOV CATERING»**, альтернативные названия: **«Нилов Кейтеринг», «nilov catering», «Нилов кейтеринг СПб»**; вид деятельности: кейтеринг/доставка еды/обслуживание мероприятий; адрес (город, улица, дом — обязательно для адресного сниппета), телефон, часы работы.
9. ☐ В карточке: поле **«Сайт» = https://nilovcatering.ru** (это и есть привязка организации к сайту).
10. ☐ Загрузить **логотип > 200×200 px** (JPG/PNG, до 10 МБ) + 15–30 фото блюд/событий.
11. ☐ Пройти подтверждение владения → **«синяя галочка»** («Информация подтверждена владельцем»): https://business.yandex.ru
12. ☐ Собрать 5–10 живых отзывов (Яндекс Карты/Фламп) — рейтинг попадает в сниппет.

### Блок Г. Сниппет и структура страниц (совместимо с текущим кодом сайта)

13. ✅ **Title главной**: «NILOV CATERING — Нилов Кейтеринг | Кейтеринг в Санкт-Петербурге» (~70 симв.); внутренние страницы — свои уникальные title.
14. ✅ **Description на каждой странице** (уникальный, суть в первых 160 символах: «Кейтеринг полного цикла в СПб. 16 лет, 2400+ событий. Фуршеты от 1 700 ₽/гость…»); проверить в Вебмастере «Индексирование → Заголовки и описания» на дубли → https://webmaster.yandex.ru/site/indexing/double-descriptions/
15. ✅ Убрать из DOM-текста дубли для экстракции: повторяющиеся aria-label, двойные скрытые заголовки; навигационное меню — компактным текстом (первый экран уже должен нести смысл: бренд + «кейтеринг СПб»).
16. ✅ Проверить, что **H1 — один и не разорван сплит-анимацией на нечитаемые роботом фрагменты** (спаны допустимы, если итоговый текст в DOM корректен и не дублируется).
17. ☐ Точечно: `<noindex>` на служебные тексты, которые не должны попадать в сниппет (✅ единственный официальный способ исключения).
18. ✅ **JSON-LD**: `FoodEstablishment`/`LocalBusiness` + `Organization`: `name` «NILOV CATERING», `alternateName` [«Нилов Кейтеринг», «nilov catering»], `address` СПб, `telephone`, `url`, `priceRange`, `openingHours`; + `FAQPage` с 5–8 вопросами (реальными запросами клиентов). (Поддерживаемые Яндексом схемы: https://yandex.ru/support/webmaster/ru/supported-schemas/address-organization)
19. ☐ После правок — **«Переобход страниц»** для главной и ключевых URL → https://webmaster.yandex.ru/site/indexing/reindex/

### Блок Д. Внешняя сущность бренда (неделя, параллельно)

20. ☐ **2ГИС**: добавить компанию (https://2gis.ru/spb) — бесплатно, фото, описание с брендом.
21. ☐ **Zoon** (https://zoon.ru) и **Yell** (https://yell.ru) — карточки с ссылкой на сайт.
22. ☐ **VK-сообщество** компании (vk.com) с ссылкой на сайт, верифицировать.
23. ☐ **Wikidata**: создать элемент «NILOV CATERING» (label RU/EN, описание «кейтеринговая компания, Санкт-Петербург», свойства: официальный сайт, ИНН ИП Ниловой А.Д., дата основания) — это дешёвый «entity-якорь» для ИИ. (https://www.wikidata.org/wiki/Special:NewItem)
24. ☐ 3–5 упоминаний в СМИ/блогах СПб (свадебные/event-порталы, «Где поесть», Питерские СМИ) с точным написанием «NILOV CATERING» и ссылкой.
25. ☐ (Опционально) Яндекс Кью/qna.habr: экспертные ответы про кейтеринг с упоминанием бренда.

### Блок Е. ИИ-видимость

26. ✅ Оставить и поддерживать **/llms.txt** (обновлять при изменении меню/услуг — уже генерируется сборкой); добавить **/llms-full.txt** с полным фактажем (цены, форматы, цифры) — вреда нет, часть agentic-краулеров читает.
27. ✅ **Страница «О компании»** с машины-читаемыми фактами: год основания, количество событий, ИП, география, форматы — лучший источник для цитирования ИИ. *(c101: nilovcatering.ru/about — год 2007, 2400+ событий, 120 000+ гостей, ИП Нилова А.Д., СПб+ЛО, таблица форматов с ценами «от» из меню-каталога; в sitemap.xml, llms.txt и llms-full.txt; из футера «О компании» ведёт на неё.)*
28. ✅ **IndexNow** (Яндекс + Bing одним ключом): отправлять URL при обновлениях. *(c101: ключ-файл 4455bbdf…c8.txt в корне сайта; каждый деплой CI-ем пингует api.indexnow.org с 5 URL — главная, /about, /offer, /privacy, /terms;/IndexNow ретраится трижды и не блокирует релиз.)*
29. ☐ Раз в месяц — «аудит ассистентов»: спросить у ChatGPT (с поиском), Perplexity, Алисы/Нейро, Gemini: «Нилов Кейтеринг СПб», «nilov catering», «кейтеринг спб» — фиксировать, кто цитирует и откуда; закрывать пробелы (нет в Bing → IndexNow; нет карточки → Бизнес). **Готовый скрипт аудита: docs/AI-AUDIT.md** (таблица пробел→лечение, 15–20 мин/мес).

### Сроки ожидания (✅/⚠️)

- Фавиконка в выдаче: ~2 недели после обхода. Правка сниппета: от дней до недель после переобхода. Карточка Бизнеса/адресный сниппет: модерация + ~неделя. Данные организации обновляются ≈ неделя после правки карточки. Проверка прав Вебмастера: до 24 ч. Позиции по брендовому запросу: обычно 1–4 недели после включения сигналов (⚠️).

---

---

## Приложение: использованные первоисточники

**Официальная справка Яндекса (✅, читались полностью, .md-версии):**
- Фавиконка: https://yandex.ru/support/webmaster/ru/search-results/favicon
- Информация об организации: https://yandex.ru/support/webmaster/ru/addresses-organizations/organization-info
- Спецсниппеты организаций: https://yandex.ru/support/webmaster/ru/addresses-organizations/special-organization-snippets
- Схемы Organization/Place: https://yandex.ru/support/webmaster/ru/supported-schemas/address-organization
- Сниппет: https://yandex.ru/support/webmaster/ru/search-results/site-description
- Заголовок и описание: https://yandex.ru/support/webmaster/ru/search-results/title-and-description
- Как составить description: https://yandex.ru/support/webmaster/ru/indexing-options/description
- Подтверждение прав: https://yandex.ru/support/webmaster/ru/service/rights
- Как улучшить позиции: https://yandex.ru/support/webmaster/ru/yandex-indexing/rank
- Представление информации на сайте: https://yandex.ru/support/webmaster/ru/recommendations/presentation
- SEO-тексты (скрытый текст): https://yandex.ru/support/webmaster/ru/threat/seo-text
- Знаки сайта: https://yandex.ru/support/webmaster/ru/search-results/tags
- Быстрые ссылки: https://yandex.ru/support/webmaster/ru/search-results/quick-links
- Индекс llms.txt справки Вебмастера: https://yandex.ru/support/webmaster/ru/llms.txt
- Блог Вебмастера (обновление сниппета, 2023): https://webmaster.yandex.ru/blog/obnovlenie-v-snippete-sayta

**Официальные доки ИИ-компаний (✅):**
- OpenAI Crawlers (OAI-SearchBot, GPTBot): https://developers.openai.com/crawlers/
- Perplexity Crawlers (PerplexityBot): https://docs.perplexity.ai
- Gemini Grounding: https://ai.google.dev/gemini-api/docs/grounding

**Исследования/блоги (⚠️):** seranking.com/blog/llms-txt · searchenginejournal.com (llms.txt не влияет на цитирования, 11.2025) · nationalpositions.com (ChatGPT↔Bing ~87%) · showupinai.com (Perplexity↔Bing) · blog.cloudflare.com (Perplexity stealth crawlers, 08.2025) · presenc.ai, astiva.ai, amicited.com (Wikipedia/Wikidata в цитатах ИИ) · semrush.com, aioseo.com, webnode.com (GEO-гайды для SMB) · kokoc.com (гид Вебмастер 2026; AI-сниппеты) · rush-analytics.ru (витальные запросы) · blog.promopult.ru (брендовые запросы) · hardkod.ru, topvisor journal, b2b.yandex.ru/adv/edu (фавиконки, практика) · adpass.ru, cossa.ru, vc.ru (Яндекс Бизнес: логотип >200×200, оформление) · rocketdata.ru, business.yandex.ru (синяя галочка) · texterra.ru, rookee.ru, kompот.bz (Поиск с Алисой/Нейро) · habr.com, sostav.ru (попадание в ответы ИИ) · longato.ch (аудит llms.txt 2025) · mchost.ru, team-b.ru, agima.ru (способы подтверждения прав, привязка Справочника в Вебмастере) · 2gis.ru, zoon.ru, yell.ru (агрегаторы).

*Отчёт составлен субагентом R1 (c99). Сырые данные: research/c99/raw/ (JSON-ответы поиска + markdown-версии официальных доков).*
