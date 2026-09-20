<?php
declare(strict_types=1);

/**
 * c99-C — публичный рантайм-источник переменных аналитики:
 *   GET /api/vars.php → {ok, metrikaId, webvisor, clickmap, gaId, customHead}
 *
 * ЗАЧЕМ: сайт — статик-экспорт, но владелец должен менять счётчики
 * (Яндекс.Метрика/Вебвизор/клик-карта, GA4, пиксели Roistat/VK/Top100) в
 * админке БЕЗ пересборки. src/lib/analytics.ts fetch'ит этот эндпоинт
 * после cookie-consent и инициализирует аналитику свежими значениями.
 *
 * БЕЗОПАСНОСТЬ:
 *  - никакой авторизации не нужно: значения публичны (ID счётчиков и так
 *    видны в исходнике страницы каждому посетителю);
 *  - ВАЖНО: массив ответа собирается ЯВНО перечисленными полями —
 *    settings.json содержит СЕКРЕТЫ (tgBotToken, smtpPass, passwordHash),
 *    они физически не могут утечь сюда (никаких array_merge/$s целиком);
 *  - GET-only (405 на прочее); тела нет — только чтение settings.json
 *    под LOCK_SH (read_json_file), rate-limit не нужен (чистое чтение).
 *
 * КЕШ: public, max-age=300 — смена настроек владельцем подхватывается
 * сайтом ≤ 5 минут. Отличается от общего правила «no-store» остальных
 * эндпоинтов (см. public/api/README.md) — это осознанно: анонимные,
 * не-персональные данные, экономия запросов на каждой странице.
 */

define('NILOV_API', true);
require __DIR__ . '/_lib.php';

header('X-Robots-Tag: noindex, nofollow'); // для ЛЮБОГО запроса к этому файлу

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    json_response(405, ['ok' => false, 'error' => 'method_not_allowed', 'detail' => 'GET only']);
}

/* GET без Origin-барьера: require_same_origin(true) пропускает GET-запросы
 * с любым/пустым Origin (allowlist проверяется только для POST) — публичные
 * данные, кросс-сайтового вреда нет. CORS-заголовки не нужны: сайт читает
 * same-origin; чужим сайтам эти ID бесполезны. */
require_same_origin(true);

$s = load_settings(); // нормализация встроена (мусор в settings.json → null)

// РЕЗУЛЬТИРУЮЩИЙ КОНТЕЙНЕР — только эти 5 полей уходит наружу.
// Добавление секрета сюда = утечка; расширять список ТОЛЬКО не-секретами.
$vars = [
    'ok' => true,
    'metrikaId' => $s['metrikaId'],
    'webvisor' => $s['metrikaWebvisor'],
    'clickmap' => $s['metrikaClickmap'],
    'gaId' => $s['gaId'],
    'customHead' => $s['customHeadHtml'],
];

/* Ответ — JSON с кешированием: отличается от json_response() (no-store)
 * только заголовком Cache-Control; всё остальное — тот же контракт. */
http_response_code(200);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: public, max-age=300');
echo json_encode($vars, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
exit;
