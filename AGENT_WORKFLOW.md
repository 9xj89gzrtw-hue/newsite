# AGENT_WORKFLOW.md — Пошаговый рабочий процесс для AI-агентов

> **Читать после `AGENTS.md`.** Этот файл описывает оптимальный workflow
> для работы над сайтом кейтеринговой компании.

## 🚀 Быстрый старт (First Run)

Если вы агент, работающий с этим репозиторием впервые:

```bash
# 1. Перейти в директорию проекта
cd /home/z/my-project/newsite

# 2. Установить зависимости
bun install

# 3. Прочитать ключевые файлы (ОБЯЗАТЕЛЬНО)
cat AGENTS.md                    # Основные инструкции
cat AGENT_SETUP_PROMPT.md        # Полная «конституция»
cat docs/RULES.md                # 16 правил разработки
cat skills/README.md             # Карта доступных скиллов

# 4. Запустить dev-сервер
bun run dev                      # Порт 3000
```

## 📋 Чек-лист перед началом работы

- [ ] Прочитан `AGENTS.md` (этот файл)
- [ ] Прочитан `AGENT_SETUP_PROMPT.md` (полный контекст)
- [ ] Прочитаны `docs/RULES.md` (правила)
- [ ] Изучена текущая структура (`src/`, `components/`)
- [ ] Проверен `worklog.md` на предыдущую работу
- [ ] Определён список задач для текущей сессии
- [ ] Выбраны соответствующие скиллы из `skills/README.md`

## 🔧 Типовые сценарии работы

### Сценарий 1: Создание новой секции сайта

```
1. ПОДГОТОВКА
   └── Прочитать SKILL.md для: frontend-design, accessibility, react-patterns

2. ИССЛЕДОВАНИЕ  
   ├── web-search: найти 3-5 эталонных реализаций
   ├── VLM/web-reader: разобрать лучший эталон
   └── Зафиксировать в INSPIRATION.md что берём

3. РЕАЛИЗАЦИЯ
   ├── Создать компонент в src/components/catering/
   ├── Использовать shadcn/ui компоненты где возможно
   ├── Применить типизацию (typescript-best-practices)
   └── Добавить анимации через motion/gsap

4. ОПТИМИЗАЦИЯ
   ├── accessibility: проверить a11y
   ├── performance-optimизация: images, animations
   └── seo-optimizer: metadata если нужно

5. ТЕСТИРОВАНИЕ
   ├── bun run lint + typecheck
   ├── agent-browser: визуальная проверка
   └── webapp-testing: E2E если интерактив

6. ЗАВЕРШЕНИЕ
   ├── Commit (Conventional Commits)
   ├── Обновить worklog.md
   └── Push в main → auto-deploy
```

### Сценарий 2: Оптимизация существующей секции

```
1. АНАЛИЗ
   ├── performance-optimization: замерить Core Web Vitals
   ├── accessibility: пройтись по чеклисту
   └── react-patterns: проверить архитектуру

2. ИСПРАВЛЕНИЯ
   ├── Внести оптимизации
   ├── Проверить регрессии
   └── Обновить документацию

3. КОММИТ И PUSH
```

### Сценарий 3: Контент-обновление

```
1. content-creation: написать/обновить тексты
2. seo-optimizer: проверить keywords, metadata
3. VLM/LLM: оценить качество копирайта
4. Коммит и push
```

## 🎯 Приоритеты задач

### P0 — Критично (делать первым)
- Исправление ошибок компиляции/сборки
- Broken layout на мобильных устройствах
- Критические accessibility issues (навигация невозможна)
- Security issues

### P1 — Высоко
- Core Web Vitals regression (LCP > 2.5s, CLS > 0.1)
- SEO критические проблемы (noindex, broken meta)
- Missing alt texts, semantic HTML
- Форма заявки не работает

### P2 — Средне
- Улучшение анимаций/интерактивности
- Дополнительный контент
- Рефакторинг кода
- Новые фичи

### P3 — Низко
- Cosmetic изменения
- «Would be nice» фичи
- Эксперименты с дизайном

## 🛠️ Инструментарий по этапам

| Этап | Инструменты | Скиллы |
|------|-------------|--------|
| Research | web-search, web-reader, VLM | find-skills |
| Design | Figma/эталоны, frontend-design | frontend-design, brand-guidelines |
| Development | VS Code, TypeScript | typescript-best-practices, react-patterns |
| Content | LLM, copywriting guides | content-creation |
| Accessibility | axe, Lighthouse | accessibility |
| Performance | Lighthouse, WebPageTest | performance-optimization |
| SEO | GSC, Yandex Webmaster | seo-optimizer |
| Testing | Playwright, agent-browser | webapp-testing |
| Deploy | Vercel CLI, GitHub Actions | vercel-deployment |

## 📝 Шаблон записи в Worklog

Каждый агент должен записывать свою работу:

```markdown
---
Task ID: <номер задачи>
Agent: <имя/тип агента>
Task: <краткое описание>

Work Log:
- <конкретное действие 1>
- <конкретное действие 2>
- ...

Stage Summary:
- <ключевые результаты>
- <принятые решения>
- <проблемы и решения>
- <что осталось/что дальше>
```

## ⚠️ Распространённые ошибки

### ❌ Не делать
1. **Пропускать чтение SKILL.md** перед использованием скилла
2. **Коммитить с красным lint/typecheck**
3. **Добавлять `.mp4` в `public/`** (только Mux/CF)
4. **Использовать сырой `<img>`** (только SmartImage)
5. **Мутировать props/state** напрямую
6. **Игнорировать `prefers-reduced-motion`**
7. **Писать «вакуумный» код** без проверки в браузере
8. **Забывать обновлять worklog**

### ✅ Делать всегда
1. Читать AGENTS.md перед работой
2. Проверять версии веб-поиском
3. Копировать эталоны, не изобретать
4. Test in browser (agent-browser)
5. Lint + typecheck зелёными
6. Conventional Commits
7. Документировать грабли
8. Push только готовый код

## 🔄 Цикл обратной связи

```
Code → Lint → TypeCheck → Browser Test → Review → Deploy → Monitor
    ↑                                                       │
    └────────────── Feedback/Issues ←───────────────────────┘
```

При обнаружении проблем:
1. Зафиксировать в worklog
2. Исправить
3. Добавить в AGENTS.md §10 («Что добавлять после работы»)

## 📚 Дополнительные ресурсы

### Внутри проекта
- `docs/ANIMATION-PRESETS.md` — готовые сниппеты анимаций
- `docs/INSPIRATION.md` — эталоны для копирования
- `docs/STACK-SNAPSHOT.md` — версии зависимостей
- `.agents/skills/*/SKILL.md` — документация скиллов

### Внешние ресурсы
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind v4 Docs](https://tailwindcss.com/docs)
- [MDN Web Docs](https://developer.mozilla.org/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Помни:** Этот проект — «инструментальный цех». Хорошая подготовка экономит время впоследствии.
