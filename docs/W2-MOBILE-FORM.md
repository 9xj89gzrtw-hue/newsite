# W2 — Мобильная форма + Логотип в письме

## Часть 1: Поля формы не влезают в экран телефона

### Диагностика

**Корневая причина — несколько накладывающихся проблем:**

1. **`.hb-zone__inner { overflow: hidden; min-height: 0 }`** (hacc-booking.css:912)
   Контейнер формы обрезает контент по горизонтали. На мобильных экранах
   320–375px это может обрезать правый край полей ввода, особенно когда
   `.hb-form` имеет `padding-left: 0.45rem` + абсолютно спозиционированный
   `.hb-form__thread` (left:0, width:2px) и `.hb-form__node` (абсолютный).

2. **`.hbooking :is(...) { touch-action: manipulation }`** (hacc-booking.css:2148)
   На `input:not([type=range])` установлен `touch-action: manipulation`,
   что отключает double-tap zoom, но если `font-size < 16px` iOS Safari
   всё равно зумит при фокусе. CSS-хак `.hb-form input.hb-input { font-size: 16px }`
   (line 1037) **должен** работать, но `text-[15px]` Tailwind-класс
   имеет тот же приоритет что и CSS-медиа-запрос — порядок объявления
   в CSS-файле определяет победу. `text-[15px]` объявлен в `field`
   переменной TSX (1396) и это строка классов, а не CSS. Медиа-запрос
   в hacc-booking.css должен перебивать, но из-за `!important` Tailwind
   или специфичности может не работать.

3. **`.hb-grid { gap: 2rem }`** (hacc-booking.css:100)
   На мобильном gap 32px + padding контейнера — на 320px это 32+16=48px,
   оставляя 272px на контент. С `w-full` на input и `px-4` padding (16px)
   — это 272-32=240px доступной ширины, что должно хватать. Но если
   родительские контейнеры имеют дополнительный padding — нет.

4. **`.hb-zone[data-open="true"] { grid-template-rows: 1fr }`** +
   **`.hb-zone__body { padding-left: 0.7rem }`** (hacc-booking.css:919)
   Левый набив 0.7rem + `.hb-form { padding-left: 0.45rem }` = 1.15rem
   дополнительного левого смещения, что на мобиле может толкать поля
   за видимую область.

### Исправления

```css
/* 1. Убрать overflow:hidden у .hb-zone__inner — заменить на overflow-x:clip */
.hb-zone__inner { overflow-x: clip; overflow-y: hidden; min-height: 0; }

/* 2. Добавить max-width:100% и box-sizing ко всем инпутам формы */
.hb-form input, .hb-form textarea, .hb-form select {
  box-sizing: border-box;
  max-width: 100%;
  width: 100%;
}

/* 3. Убрать горизонтальный padding у .hb-form на мобиле
   (прогресс-нить абсолютно спозиционирована и не влияет на flow) */
@media (max-width: 767.98px) {
  .hb-form { padding-left: 0; }
  .hb-zone__body { padding-left: 0; }
}

/* 4. Убедиться что font-size:16px применяется (добавить !important
   или повысить специфичность, чтобы перебить Tailwind text-[15px]) */
@media (max-width: 767px) {
  .hb-form input.hb-input,
  .hb-form input[type="text"],
  .hb-form input[type="tel"],
  .hb-form input[type="email"],
  .hb-form input[type="text"]:not([type]) {
    font-size: 16px !important;
  }
}

/* 5. Добавить overflow-x:hidden на .hbooking чтобы предотвратить
   горизонтальный скролл на уровне секции */
.hbooking {
  overflow-x: clip;
}
```

### Что проверить после правки
- Открыть форму на 320px, 375px, 390px viewport
- Все поля (Имя, Телефон, Email, Время, Комментарий) должны быть полностью видны
- Клик по полю не должен вызывать horizontal scroll
- iOS Zoom при фокусе не должен происходить

---

## Часть 2: Логотип не загружается в письме

### Диагностика

**Файл существует**: `public/brand/logo-email.png` (120×140 PNG, 22728 байт).

**Путь в `_lib.php` (line 1216)**: `dirname(__DIR__) . '/brand/logo-email.png'`
- `__DIR__` в `public/api/_lib.php` = `/path/to/public/api/`
- `dirname(__DIR__)` = `/path/to/public/`
- Итог: `/path/to/public/brand/logo-email.png` — **правильно**.

**CID-схема корректна**: `Content-ID: <logo@nilovcatering.ru>` ↔ `src="cid:logo@nilovcatering.ru"`

**Проблема — в `mail_logo_cid()` (line 1224)**:
```php
function mail_logo_cid(): ?string
{
    static $ok = null;
    if ($ok === null) {
        $ok = is_file(mail_logo_file()) && is_readable(mail_logo_file());
    }
    return $ok ? MAIL_LOGO_CID : null;
}
```

1. **`static $ok = null`** — кеширует результат на всё время процесса PHP.
   Если при первом вызове файл недоступен (права, кэш opcache,
   deploy timing) — `null` кэшируется и **никогда не проверяется снова**.

2. **`@file_get_contents`** в `mail_logo_attachment()` (line 1243) —
   ошибки подавляются `@`, если файл есть но права доступа не позволяют
   прочитать — возвращается `null` без логирования.

3. **MIME-структура**: `mail_mime_parts()` оборачивает HTML+логотип в
   `multipart/related`. Это RFC 2387 — правильно. Но если `mail_logo_attachment()`
   возвращает `null` (файл не прочитался), логотип просто не встраивается,
   и письмо приходит без картинки (только текст шапки).

4. **Вероятная причина на проде**: при деплое `public/brand/` может
   копироваться с правами 644 но владелец `root`, а PHP-FPM работает от
   другого пользователя (например `www-data`). `is_readable()` возвращает false.

### Исправления

```php
// 1. Снять static-кеш и добавить логирование ошибок
function mail_logo_cid(): ?string
{
    // Снимаем static-кеш — проверяем файл КАЖДЫЙ раз.
    // На проде путь может отличаться после деплоя,
    // и stale-кэч приводит к тому, что логотип не грузится.
    $filePath = mail_logo_file();
    if (!is_file($filePath) || !is_readable($filePath)) {
        // Логируем для диагностики (mail-log.json)
        error_log('[W2] logo-email.png missing or unreadable: ' . $filePath);
        return null;
    }
    return MAIL_LOGO_CID;
}

// 2. mail_logo_attachment() — добавить явную проверку и fallback
function mail_logo_attachment(): ?array
{
    $cid = mail_logo_cid();
    if ($cid === null) {
        return null;
    }
    $filePath = mail_logo_file();
    $bytes = @file_get_contents($filePath);
    if (!is_string($bytes) || $bytes === '') {
        error_log('[W2] logo-email.png file_get_contents returned empty');
        return null;
    }
    if (strlen($bytes) > 524288) {
        error_log('[W2] logo-email.png exceeds 512KB');
        return null;
    }
    return [
        'bytes' => $bytes,
        'name' => 'logo-email.png',
        'entry' => ['fileName' => 'logo-email.png', 'fileNameStar' => ''],
        'inline' => true, 'cid' => MAIL_LOGO_CID
    ];
}

// 3. mail_html_wrap() — добавить ширину/высоту как атрибуты HTML и
//    style с max-width для мобильных почтовых клиентов
//    (уже есть width="60" height="70" + style — достаточно)
//    Но добавить max-width:100% и height:auto на случай, если
//    почтовый клиент масштабирует
```

**Дополнительно**: В `mail_html_wrap` (line 1406-1407) inline-стиль:
```html
style="display:block;margin:0 auto 10px;width:60px;height:70px;border:0;outline:none;text-decoration:none;"
```
Добавить `max-width:100%` и `height:auto` для совместимости с Gmail/iOS Mail
которые могут не respect фиксированные width/height на inline-изображениях.

---

## Примечания по реализации

- Правки CSS в `src/components/catering/hacc-booking.css`
- Правки PHP в `public/api/_lib.php`
- Никаких коммитов — изменения остаются в worktree
- Тестировать: `bun run dev` → агент-browser на 320/375/390px + проверка `mail_logo_attachment()` через PHP CLI
