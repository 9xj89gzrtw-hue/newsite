# 📖 DEVELOPER GUIDE — Как использовать извлечённые данные

> **Важно для агента:** Этот файл — твой главный справочник. Используй его ВСЕГДА когда работаешь над сайтом.

---

## 🎯 Где что находится (Quick Reference)

### 🍽️ МЕНЮ & PDF-МЕНЮ (Критично!)
```
docs/menu-pdf-extraction/
├── menu-items-complete.json      # 150+ блюд с описаниями на английском
├── menu-structures.json          # Структуры меню 12+ компаний
├── wedding-menus.json            # Свадебные меню ($46-$130/чел)
├── corporate-menus.json          # Корпоративные меню
├── dietary-menus.json            # Диетические опции (GF/V/VG/DF)
├── pdf-menu-links.json           # Ссылки на реальные PDF-меню
└── menu-design-analysis.md       # Анализа дизайна меню (12KB)
```

**Как использовать:**
- Копируй описания блюд → адаптируй на русский
- Следуй структуре категорий из `menu-structures.json`
- Используй dietary labels: ГБ (глютен-free), В (vegetarian), ВГ (vegan)

### 📸 ФОТОГРАФИЯ ЕДЫ
```
docs/food-photography-analysis/
├── recommended-shots-list.md     # 👈 СЧИТАЙ ЭТО! 95-140 shot'ов нужно
├── photography-best-practices.md # Как снимать еду профессионально
├── food-photo-analysis.md        # Стили и композиция
├── event-photo-analysis.md       # Фото мероприятий
└── image-categories.json         # 7 категорий изображений
```

**Приоритет shot'ов:**
1. P0 Critical (28-42): Hero + Core Food
2. P1 High (36-50): Events + Buffets  
3. P2 Medium (19-24): Details
4. P3 Nice-to-have (5-15): Team/Lifestyle

### 💰 ПАКЕТЫ УСЛУГ (Ценообразование!)
```
docs/service-packages/
├── wedding-packages-complete.json    # Свадьбы $75-$450+/чел
├── corporate-packages-complete.json  # Корпоративные форматы
├── pricing-strategies.md             # 👈 Стратегии ценообразования!
├── package-inclusions-checklist.json # Что включать в пакеты
├── add-ons-services.json            # 100+ доп. услуг
├── minimum-requirements.json        # Минимальные требования
└── seasonal-pricing.json            # Сезонное ценообразование
```

**Рекомендуемые tier'ы для русского рынка:**
| Tier | Цена (₽/чел) | Включено |
|------|--------------|----------|
| Классик | 7,000 - 12,000 | 3-4 закуски, 2-3 горячих |
| Премиум | 12,000 - 20,000 | 5-6 закусок, дегустация |
| Делюкс | 20,000 - 35,000 | Chef stations, координатор |
| VIP | 35,000+ | Полный кастом |

### 🔧 ТЕХНИЧЕСКИЕ АКТИВЫ (CSS/Fonts/JS)
```
docs/technical-assets/
├── fonts-compilation.json      # 👈 Google Fonts топ-5!
├── color-palettes.json         # Цветовые палитры из CSS
├── typography-systems.json     # Типографические системы
├── css-analysis.json           # CSS фреймворки
├── javascript-packages.json    # JS библиотеки
├── tech-stack-summary.md       # Сводка технологий
└── favicons-icons.json         # Favicon'ы и иконки
```

**Топ-5 шрифтов для использования:**
1. **Poppins** — современный, геометричный (рекомендуется!)
2. **Montserrat** — элегантный, универсальный
3. **Roboto** — чистый, читабельный
4. **Lato** — дружелюбный, профессиональный
5. **Raleway** — стильный для заголовков

### 📝 КОНТЕНТ (Блоги, Вакансии, Диеты)
```
docs/content-deep-extraction/
├── blog-posts-complete.json      # Посты блогов (10+ сайтов)
├── blog-topics-analysis.md       # Темы блогов
├── careers-jobs-complete.json    # Вакансии с зарплатами
├── job-descriptions-templates.md # Шаблоки вакансий
├── dietary-options-complete.json # Диетические опции
├── venue-partnerships.json       # Venue партнёры
├── vendor-suppliers.json         # Поставщики
└── seasonal-menus.json           # Сезонные меню
```

### ⚙️ ПРОДВИНУТЫЙ ТЕХНИЧЕСКИЙ (Analytics, Chat, etc.)
```
docs/advanced-technical/
├── analytics-setup.json          # GA4/GTM/FB Pixel настройки
├── chat-widgets-config.json      # Чат-виджеты (Crisp доминирует)
├── cookie-consent-analysis.json  # Cookie consent реализации
├── email-marketing-setup.json    # Email маркетинг
├── social-integrations.json      # Социальные интеграции
├── press-media-kit.json          # Пресс-киты
├── performance-infrastructure.json # Инфраструктура
└── marketing-tech-stack.md       # 👈 Маркетинговый стек!
```

### 📚 ПРЕДЫДУЩИЕ РАУНДЫ (Богатая база!)
```
docs/
├── MEGA-INDEX-V2.md              # 👈 ПОЛНЫЙ КАТАЛОГ ВСЕХ ФАЙЛОВ!
├── MEGA-INDEX.md                 # Предыдущий каталог V1
├── REFERENCE-SITES-ANALYSIS.md   # Мастер-анализ 23 сайтов (82KB)
├── site-maps/                    # 672+ URL карт сайтов
├── footer-library/               # 22 футера проанализировано
├── legal-library/                # Юридические шаблоны
├── content-pages/                # Страницы блога/команды/карьеры
├── ui-patterns/                  # UI паттерны (404, формы, галереи)
├── social-proof-library/         # Отзывы, награды, trust signals
├── content-library/              # Таксономия меню, writing guide
└── seo-playbook/                 # SEO копирайтинг handbook
```

---

## 🚀 Чеклист: Что реализовать на сайте

### Меню (Страница /menu)
- [ ] Структура по категориям (из `menu-structures.json`)
- [ ] Dietary labels (ГБ, В, ВГ, БМ)
- [ ] Красивые описания блюд (адаптировать из `menu-items-complete.json`)
- [ ] PDF-меню для скачивания
- [ ] Фото каждого блюда (из `recommended-shots-list.md`)

### Пакеты услуг (Страница /packages или /weddings, /corporate)
- [ ] 4 tier'а: Классик/Премиум/Делюкс/VIP
- [ ] Чёткое ценообразование (из `pricing-strategies.md`)
- [ ] Checklist включений (из `package-inclusions-checklist.json`)
- [ ] Add-ons услуги (из `add-ons-services.json`)

### Техническая реализация
- [ ] Шрифты: Poppins + Montserrat (из `fonts-compilation.json`)
- [ ] Цветовая схема (из `color-palettes.json`)
- [ ] GA4 + GTM (из `analytics-setup.json`)
- [ ] Chat widget (Crisp рекомендован)
- [ ] Cookie consent banner

### Контент
- [ ] Блог (темы из `blog-topics-analysis.md`)
- [ ] Страница команды (паттерны из `content-pages/`)
- [ ] Отзывы (из `social-proof-library/`)

---

## 🔗 Blue Ocean Возможности (Конкурентные преимущества)

| Возможность | Конкуренты имеют | Действие |
|-------------|------------------|----------|
| Русскоязычный контент | **0%** | 🔥 Сделать первым! |
| Онлайн-калькулятор цены | **0%** | 🔥 Реализовать! |
| Конструктор меню | **0%** | 🔥 Реализовать! |
| Live Chat | 14% | ✅ Добавить Crisp |
| Email Marketing | 10% | ✅ Настроить HubSpot |
| Press Page | 27% | ⚡ Добавить |
| PDF-меню на русском | **0%** | 🔥 Создать красивые! |

---

## 💡 Примеры использования

### Пример 1: Создание страницы меню
```bash
# 1. Прочитай структуру меню
cat docs/menu-pdf-extraction/menu-structures.json

# 2. Получи примеры блюд
cat docs/menu-pdf-extraction/menu-items-complete.json

# 3. Изучи дизайн лучшие практики
cat docs/menu-pdf-extraction/menu-design-analysis.md

# 4. Адаптируй описания на русский язык
# (используй MENU-WRITING-GUIDE.md из docs/content-library/)
```

### Пример 2: Создание пакетов услуг
```bash
# 1. Изучи pricing стратегии
cat docs/service-packages/pricing-strategies.md

# 2. Получи чеклист включений
cat docs/service-packages/package-inclusions-checklist.json

# 3. Посмотри реальные примеры пакетов
cat docs/service-packages/wedding-packages-complete.json

# 4. Адаптируй под русский рынок (цены в ₽)
```

### Пример 3: Выбор шрифтов и цветов
```bash
# 1. Посмотри популярные шрифты
cat docs/technical-assets/fonts-compilation.json

# 2. Изучи цветовые палитры
cat docs/technical-assets/color-palettes.json

# 3. Посмотри типографические системы
cat docs/technical-assets/typography-systems.json
```

---

## 📞 Быстрые ссылки на ключевые файлы

| Задача | Файл | Приоритет |
|--------|------|-----------|
| **Создать меню** | `menu-pdf-extraction/menu-items-complete.json` | 🔥🔥🔥 |
| **Дизайн меню** | `menu-pdf-extraction/menu-design-analysis.md` | 🔥🔥🔥 |
| **Цены пакетов** | `service-packages/pricing-strategies.md` | 🔥🔥🔥 |
| **Shot-list фото** | `food-photography-analysis/recommended-shots-list.md` | 🔥🔥🔥 |
| **Шрифты** | `technical-assets/fonts-compilation.json` | 🔥🔥 |
| **Цвета** | `technical-assets/color-palettes.json` | 🔥🔥 |
| **Аналитика** | `advanced-technical/analytics-setup.json` | 🔥🔥 |
| **Блог темы** | `content-deep-extraction/blog-topics-analysis.md` | 🔥 |
| **SEO тексты** | `seo-playbook/SEO-COPYWRITING-HANDBOOK.md` | 🔥🔥 |
| **Отзывы** | `social-proof-library/raw-testimonials-compilation.json` | 🔥🔥 |

---

*Обновлено: Cycle 22 | Round 6*
*Используй этот指南 как первоисточник для всех решений по сайту!*
