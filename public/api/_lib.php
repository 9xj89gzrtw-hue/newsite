<?php
declare(strict_types=1);

/**
 * c95 — общий bootstrap серверного PHP-API (nilovcatering.ru, SpaceWeb).
 *
 * Подключается ТОЛЬКО из public/api/lead.php и public/api/admin.php
 * сразу после `define('NILOV_API', true);` — при прямом HTTP-запросе к
 * этому файлу константа не определена и запрос завершается 404.
 *
 * Внешние контракты (Telegram Bot API, GitHub Contents API, ограничения
 * SpaceWeb) проверены по первоисточникам — см. research/c95/R-REPORT.md.
 * Карта эндпоинтов — public/api/README.md.
 *
 * PHP >= 8.1, без фреймворков. Все файловые операции — flock + атомарная
 * запись (tmp + rename). Ни один путь к файлу не строится из user input.
 */

if (!defined('NILOV_API')) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Not Found');
}

/* ------------------------------ константы ------------------------------ */

/** Origin-allowlist для CSRF-защиты: прод, локальные dev/e2e, зеркало Vercel. */
const NILOV_ORIGIN_ALLOW = [
    'https://nilovcatering.ru',
    'http://localhost:3001',
    'http://localhost:3005',
    // 127.0.0.1-варианты тех же дев-портов: браузер с http://127.0.0.1:PORT
    // шлёт Origin «http://127.0.0.1:PORT» (не «localhost») — иначе 403 в e2e.
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3005',
    'https://newsite-three-kappa.vercel.app',
];

/** Фолбэк-адрес уведомлений о заявках, если в настройках не задан свой. */
const NOTIFY_EMAIL_FALLBACK = 'dmitry_nilov@mail.ru';

/** Имя HMAC-cookie сессии админки. */
const SESSION_COOKIE = 'nilov_admin';

/** TTL сессии админки (12 часов), сек. */
const SESSION_TTL_SEC = 43200;

/** Лимиты хранилища заявок (шт): активный файл + архив. */
const LEADS_CAP = 1000;
const LEADS_ARCHIVE_CAP = 5000;

/** Регулярка токена Telegram-бота (вида 123456789:AAH…). */
const TG_TOKEN_RE = '/^[0-9]{6,12}:[A-Za-z0-9_-]{30,}$/';

/**
 * Фатальная ошибка runtime → валидный JSON 500 вместо HTML-мусора PHP.
 */
register_shutdown_function(static function (): void {
    $e = error_get_last();
    if ($e === null || !in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        return;
    }
    if (headers_sent()) {
        return;
    }
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo '{"ok":false,"error":"internal"}';
});

/* --------------------------- базовые ответы ---------------------------- */

/**
 * Единственный способ отдать JSON-ответ и завершить запрос.
 * Все ответы API: JSON + noindex + no-store.
 */
function json_response(int $status, array $body): never
{
    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        header('X-Robots-Tag: noindex, nofollow');
        header('Cache-Control: no-store, must-revalidate');
        header('Pragma: no-cache');
    }
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

/**
 * Прочитать тело запроса как JSON-объект (associative array).
 * Пустое тело → []. Больше $maxBytes → RuntimeException('too_large').
 * Невалидный JSON / скаляр → RuntimeException('bad_json').
 */
function read_json_body(int $maxBytes = 65536): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === null) {
        $raw = '';
    }
    if (strlen($raw) > $maxBytes) {
        throw new RuntimeException('too_large');
    }
    $raw = trim($raw);
    if ($raw === '') {
        return [];
    }
    try {
        $data = json_decode($raw, true, 512, JSON_THROW_ON_ERROR | JSON_INVALID_UTF8_SUBSTITUTE);
    } catch (JsonException $e) {
        throw new RuntimeException('bad_json');
    }
    if (!is_array($data)) {
        throw new RuntimeException('bad_json');
    }
    return $data;
}

/**
 * read_json_body + автответ 400 при ошибке разбора.
 */
function read_json_body_or_400(int $maxBytes = 65536): array
{
    try {
        return read_json_body($maxBytes);
    } catch (RuntimeException $e) {
        json_response(400, ['ok' => false, 'error' => $e->getMessage()]);
    }
}

/* ------------------------- строки и кодировки -------------------------- */

/** Длина строки в символах (UTF-8), с фолбэком на байты. */
function slen(string $s): int
{
    return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
}

/** Обрезка строки до N символов (UTF-8-safe). */
function str_trunc(string $s, int $max): string
{
    if ($max < 1) {
        return '';
    }
    if (slen($s) <= $max) {
        return $s;
    }
    if (function_exists('mb_substr')) {
        return mb_substr($s, 0, $max, 'UTF-8');
    }
    return substr($s, 0, $max);
}

/* ----------------------------- секреты --------------------------------- */

/** Дефолты секретов (полный файл пишет CI по SSH из GitHub Secrets). */
function secrets_defaults(): array
{
    return [
        'gh_token' => '',
        'gh_repo' => '9xj89gzrtw-hue/newsite',
        'gh_path' => 'src/data/menu.json',
        'hmac_key' => '',
        'password_hash_default' => '',
        'tg_api_base' => 'https://api.telegram.org',
        'notify_from' => 'noreply@nilovcatering.ru',
    ];
}

/**
 * Секреты из ../config/secrets.php (в git не попадает, пишет CI).
 * $required=true: файла нет → JSON 500 {error:"not_configured"} и exit.
 * $required=false: файла нет → возвращаются дефолты (для эндпоинтов,
 * которые обязаны работать и без секретов, например lead.php).
 */
function load_secrets(bool $required = true): ?array
{
    $file = __DIR__ . '/../config/secrets.php';
    $raw = is_file($file) ? include $file : false;
    if (!is_array($raw)) {
        if ($required) {
            json_response(500, ['ok' => false, 'error' => 'not_configured']);
        }
        return secrets_defaults();
    }
    return array_merge(secrets_defaults(), $raw);
}

/* ----------------------- хранилище server-data -------------------------- */

function server_data_dir(): string
{
    return __DIR__ . '/../server-data';
}

function settings_path(): string
{
    return server_data_dir() . '/settings.json';
}

function leads_path(): string
{
    return server_data_dir() . '/leads.json';
}

function leads_archive_path(): string
{
    return server_data_dir() . '/leads-archive.json';
}

/** c102 — состояние cron-автоматизации (server-data/cron-state.json):
 *  {lastRunTs, lastDigestDay, lastDigestTs, followupsSent, nudgesSent,
 *   lastFollowupId, lastNudgeId} — какие письма/напоминания уже ушли,
 *  чтобы повторные запуски не дублировали их. */
function cron_state_path(): string
{
    return server_data_dir() . '/cron-state.json';
}

/** c97 — журнал попыток отправки почты (server-data/mail-log.json). */
function mail_log_path(): string
{
    return server_data_dir() . '/mail-log.json';
}

/** c97 — лимит журнала почты (шт; старейшие выбрасываются). */
const MAIL_LOG_CAP = 300;

/**
 * c97 — прочитать журнал почты (новые сверху), максимум $limit записей.
 * Для диагностики в админке («последние отправки» в разделе «Почта»).
 */
function mail_log_read(int $limit = 30): array
{
    $arr = read_json_file(mail_log_path());
    if (!is_array($arr)) {
        return [];
    }
    $arr = array_values(array_filter($arr, 'is_array'));
    $arr = array_slice($arr, -$limit);
    return array_reverse($arr);
}

/**
 * c97 — добавить запись в журнал почты (append + cap 300, под локом).
 * Никогда не бросает исключений: журнал не должен ломать отправку.
 */
function mail_log_append(array $entry): void
{
    $entry['ts'] = time();
    update_json_file(mail_log_path(), static function (array $cur) use ($entry): array {
        $cur[] = $entry;
        if (count($cur) > MAIL_LOG_CAP) {
            $cur = array_slice($cur, count($cur) - MAIL_LOG_CAP);
        }
        return $cur;
    });
}

/* --------------------- c98-A: журнал спам-ловушек ---------------------- */

/** c98-A — журнал сабмитов, пойманных анти-спам ловушками (spam-log.json). */
function spam_log_path(): string
{
    return server_data_dir() . '/spam-log.json';
}

/** c98-A — лимит журнала ловушек (шт; старейшие выбрасываются). */
const SPAM_LOG_CAP = 300;

/**
 * c98-A — прочитать журнал ловушек (новые сверху), максимум $limit записей.
 * До c98 «пойманные» сабмиты умирали молча (фейковый ok:true) — если туда
 * попадал реальный клиент, лид терялся БЕЗ СЛЕДА. Теперь каждая ловушка
 * оставляет запись: владелец видит её в разделе «Заявки» и может проверить.
 */
function spam_log_read(int $limit = 50): array
{
    $arr = read_json_file(spam_log_path());
    if (!is_array($arr)) {
        return [];
    }
    $arr = array_values(array_filter($arr, 'is_array'));
    $arr = array_slice($arr, -$limit);
    return array_reverse($arr);
}

/**
 * c98-A — добавить запись в журнал ловушек (append + cap 300, под локом).
 * Никогда не бросает исключений и не влияет на ответ клиенту.
 */
function spam_log_append(array $entry): void
{
    $entry['ts'] = time();
    update_json_file(spam_log_path(), static function (array $cur) use ($entry): array {
        $cur[] = $entry;
        if (count($cur) > SPAM_LOG_CAP) {
            $cur = array_slice($cur, count($cur) - SPAM_LOG_CAP);
        }
        return $cur;
    });
}

/** Каталог runtime-данных: создать (0775) + анти-листинг index.html. */
function ensure_server_data_dir(): void
{
    $dir = server_data_dir();
    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }
    $idx = $dir . '/index.html';
    if (is_dir($dir) && !is_file($idx)) {
        @file_put_contents($idx, '');
    }
}

/**
 * Чтение JSON-файла под общим блоком (LOCK_SH на парный *.lock).
 * Ошибки не бросает: нет файла/битый JSON → null.
 */
function read_json_file(string $path): ?array
{
    $lp = @fopen($path . '.lock', 'c');
    if ($lp !== false) {
        @flock($lp, LOCK_SH);
    }
    try {
        $raw = is_file($path) ? @file_get_contents($path) : false;
    } finally {
        if ($lp !== false) {
            @flock($lp, LOCK_UN);
            fclose($lp);
        }
    }
    if (!is_string($raw) || $raw === '') {
        return null;
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
}

/**
 * Атомарная запись JSON (tmp + rename), без взятия лока.
 */
function write_json_atomic(string $path, array $data): bool
{
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    if ($json === false) {
        return false;
    }
    $tmp = $path . '.tmp-' . bin2hex(random_bytes(4));
    if (@file_put_contents($tmp, $json, LOCK_EX) === false) {
        @unlink($tmp);
        return false;
    }
    $ok = @rename($tmp, $path);
    if (!$ok) {
        @unlink($tmp);
    }
    return $ok;
}

/**
 * Атомарное обновление JSON-файла под эксклюзивным локом на парный
 * *.lock (лочится отдельный постоянный файл — сам целевой файл может
 * быть переименован, это не ломает сериализацию писателей).
 * Колбэк получает текущий массив (или []); вернёт массив — запись,
 * вернёт null — отмена записи.
 *
 * c98-A (непотеряемость): БИТЫЙ файл (не пустой, ≥3 байт, но JSON не
 * декодируется) больше НЕ затирается пустым массивом — раньше store_lead
 * на битом leads.json получал [] и перезаписывал файл одной новой заявкой,
 * теряя ВСЕ старые (главные подозреваемые в «лид потерян без следа»).
 * Теперь битый файл переименовывается в <имя>.corrupt-<Ymd-His>.json
 * (данные сохранены для ручного восстановления), работа продолжается
 * с пустого массива. Переименование — под тем же локом: конкурентные
 * писатели не потеряют только что записанное. Колбэку вторым аргументом
 * передаётся имя backup-файла (string|null) — store_lead пишет его в
 * поле rescuedFrom лида; прочие колбэки объявляют один параметр, лишний
 * аргумент PHP молча игнорирует (back-compat, проверено тестом).
 */
function update_json_file(string $path, callable $fn): bool
{
    ensure_server_data_dir();
    $lp = @fopen($path . '.lock', 'c');
    if ($lp === false) {
        return false;
    }
    if (!@flock($lp, LOCK_EX)) {
        fclose($lp);
        return false;
    }
    try {
        $current = is_file($path) ? @file_get_contents($path) : false;
        $arr = is_string($current) ? json_decode($current, true) : null;
        $rescuedFrom = null;
        $rawTrim = is_string($current) ? trim($current) : '';
        if ($rawTrim !== '' && strlen($rawTrim) > 2 && !is_array($arr)) {
            // «[]» и пробелы — валидный пустой JSON; мусор ≥3 байт — авария
            $rescuedFrom = basename($path, '.json') . '.corrupt-' . date('Ymd-His') . '.json';
            @rename($path, dirname($path) . '/' . $rescuedFrom);
            if (!is_file($path)) {
                $arr = null; // начинаем новый файл с пустого массива
            } else {
                // переименовать не удалось (права?) — НЕ рискуем затиранием:
                // отмена записи, вызывающий получит false (= сбой хранения)
                return false;
            }
        }
        $new = $fn(is_array($arr) ? $arr : [], $rescuedFrom);
        if (!is_array($new)) {
            return false;
        }
        return write_json_atomic($path, $new);
    } finally {
        @flock($lp, LOCK_UN);
        fclose($lp);
    }
}

/* ----------------------------- настройки ------------------------------- */

/** Дефолты настроек админки (server-data/settings.json). */
function default_settings(): array
{
    return [
        'notifyEmail' => null,
        'tgBotToken' => null,
        'tgChatId' => null,
        'tgApiBase' => null,
        // c97: SMTP для надёжной доставки почты (ящик на хостинге,
        // например noreply@nilovcatering.ru — панель SpaceWeb → Почта).
        // Заполняется владельцем в «Настройках → Почта»; письма через SMTP
        // подписываются DKIM хостинга и не попадают в спам. Пароль —
        // server-side, в UI маскируется (как tgBotToken).
        'smtpHost' => null,
        'smtpPort' => null,
        'smtpUser' => null,
        'smtpPass' => null,
        'smtpFrom' => null,
        // c96: последняя рабочая база Bot API — сервер запоминает её после
        // первого успешного вызова (владелец развернул воркер / ожил прямой
        // api.telegram.org), чтобы каждый следующий вызов не платил
        // 5–7-секундным таймаутом на мёртвой базе. Пишется только сервером
        // (tg_remember_working_base), в UI — read-only.
        'tgWorkingBase' => null,
        // c99-C: аналитика, редактируемая владельцем в «Настройках» без
        // передеплоя. Статик-экспорт читает их РАНТАЙМ через /api/vars.php
        // (src/lib/analytics.ts), поэтому смена счётчика подхватывается ≤5
        // мин (Cache-Control max-age=300), а не со следующей сборкой.
        // metrikaId — номер счётчика (только цифры); null = используется
        // ID из env деплоя (прод-счётчик 112532826).
        'metrikaId' => null,
        // Вебвизор (запись сессий) — по умолчанию ВКЛ: явное требование
        // владельца (c98 подтвердил счётчик с webvisor:true).
        'metrikaWebvisor' => true,
        // Клик-карта Метрики — по умолчанию ВКЛ.
        'metrikaClickmap' => true,
        // GA4 (G-XXXXXXXXXX); null = GA не грузим.
        'gaId' => null,
        // Свободный код пикселей (Roistat, VK pixel, Top100, <script>…),
        // вставляемый в <head> после cookie-consent. Максимально свободная
        // форма: владелец копирует готовый сниппет из сервиса.
        'customHeadHtml' => null,
        // c102 — «Автоматизация» (cron.php): ежедневный дайджест, авто-дожим
        // клиента письмом, напоминание о необработанных заявках. Управление —
        // карточка «Автоматизация» в настройках админки; состояние —
        // server-data/cron-state.json (последний запуск/счётчики).
        // autoDigest: в 09:00–23:59 (первый запуск дня) шлёт владельцу сводку
        // «за сутки + необработанные» в TG и на почту. По умолчанию ВКЛ.
        'autoDigest' => true,
        // autoFollowup: заявка со статусом «новая» и email, старше 24 ч —
        // клиенту уходит ОДНО письмо-дожим (меню во вложении + кнопки
        // связи). По умолчанию ВКЛ — это и есть «поиск клиентов без ручных
        // действий»: система сама возвращается к клиенту.
        'autoFollowup' => true,
        // autoNudge: TG-напоминание о необработанной заявке через N часов.
        // По умолчанию ВЫКЛ — TG уже пингует мгновенно при каждой заявке;
        // включить может владелец, который часто пропускает уведомления.
        'autoNudge' => false,
        // Через сколько часов непрочитанная заявка считается «зависшей»
        // (1–24; только для autoNudge).
        'autoNudgeHours' => 3,
        // Секретный токен cron-запуска (32 hex). null = cron выключен
        // (403). Генерируется кнопкой в «Автоматизации», вызов:
        //   GET /api/cron.php?token=…  — для веб-крона SpaceWeb
        //   php api/cron.php <token>   — для CLI-крона хостинга
        'cronToken' => null,
        // passwordHash перекрывает secrets.password_hash_default после
        // смены пароля владельцем через UI (action=password).
        'passwordHash' => null,
        // Эпоха сессий: входит в HMAC подписи cookie; инкремент при смене
        // пароля / logout-all мгновенно отзывает ВСЕ выданные cookie.
        'sessionEpoch' => 0,
    ];
}

function load_settings(): array
{
    $s = read_json_file(settings_path());
    if (!is_array($s)) {
        return default_settings();
    }
    $merged = array_merge(default_settings(), array_intersect_key($s, default_settings()));
    // sessionEpoch обязан быть int; числоподобное значение из вручную
    // испорченного файла приводим, мусор — в 0 (не окирпичиваем админку)
    if (!is_int($merged['sessionEpoch'])) {
        $merged['sessionEpoch'] = is_numeric($merged['sessionEpoch']) ? (int)$merged['sessionEpoch'] : 0;
    }
    // c97: smtpPort — int 1..65535 (мусор из испорченного файла — в null,
    // SMTP просто неактивен, письма идут через mail())
    if ($merged['smtpPort'] !== null) {
        $p = is_int($merged['smtpPort']) ? $merged['smtpPort'] : (is_numeric($merged['smtpPort']) ? (int)$merged['smtpPort'] : 0);
        $merged['smtpPort'] = ($p >= 1 && $p <= 65535) ? $p : null;
    }
    /* c99-C: нормализация аналитики — settings.json мог быть испорчен
     * вручную/полу-битым. Правило то же, что у admin.php при сохранении:
     * мусор НЕ окирпичивает сайт (vars.php отдаст null), а не падает. */
    // metrikaId: только цифры 5–10 (реальные номера счётчиков 6–9); всё
    // прочее → null (= работает env-фолбэк из деплоя).
    $mid = $merged['metrikaId'];
    if ($mid !== null) {
        $digits = is_int($mid) ? (string)$mid : (is_string($mid) ? preg_replace('/\D+/', '', trim($mid)) : '');
        $merged['metrikaId'] = (strlen($digits) >= 5 && strlen($digits) <= 10) ? $digits : null;
    }
    // флаги Метрики: булевы, всё небулево → дефолт (true), а не ложь —
    // случайная строка в файле не должна молча выключать Вебвизор владельцу.
    $merged['metrikaWebvisor'] = is_bool($merged['metrikaWebvisor']) ? $merged['metrikaWebvisor'] : true;
    $merged['metrikaClickmap'] = is_bool($merged['metrikaClickmap']) ? $merged['metrikaClickmap'] : true;
    // gaId: G-XXXXXXXXXX (4–12 алфанумерика после префикса); невалидное → null.
    $ga = $merged['gaId'];
    if ($ga !== null) {
        $ga = is_string($ga) ? trim($ga) : '';
        $merged['gaId'] = preg_match('/^G-[A-Z0-9]{4,12}$/i', $ga) === 1 ? strtoupper($ga) : null;
    }
    // customHeadHtml: строка ≤ 8000; длиннее — обрезаем (не дропаем: это
    // код владельца, обрезанный пиксель хуже полного, но пустой — хуже
    // обоих; admin.php при сохранении и так отвергает перебор, это
    // только защита от ручной порчи файла).
    $ch = $merged['customHeadHtml'];
    if ($ch !== null) {
        $ch = is_string($ch) ? str_trunc($ch, 8000) : '';
        $merged['customHeadHtml'] = $ch === '' ? null : $ch;
    }
    /* c102: нормализация «Автоматизации» — правила те же: мусор в
     * settings.json не должен ни окирпичивать админку, ни молча
     * выключать включённое владельцем. Флаги — булевы (не-bool → дефолт),
     * часы — int 1..24, токен — 32 hex или null. */
    foreach (['autoDigest' => true, 'autoFollowup' => true, 'autoNudge' => false] as $k => $def) {
        $merged[$k] = is_bool($merged[$k] ?? null) ? $merged[$k] : $def;
    }
    $nh = $merged['autoNudgeHours'] ?? null;
    $nh = is_int($nh) ? $nh : (is_numeric($nh) ? (int)$nh : 0);
    $merged['autoNudgeHours'] = ($nh >= 1 && $nh <= 24) ? $nh : 3;
    $ct = $merged['cronToken'] ?? null;
    $ct = is_string($ct) ? trim($ct) : '';
    $merged['cronToken'] = preg_match('/^[0-9a-f]{32}$/i', $ct) === 1 ? strtolower($ct) : null;
    return $merged;
}

/**
 * c97 — валидная ли SMTP-конфигурация (host+user+pass заполнены).
 * port по умолчанию 465 (SSL) — стандарт SpaceWeb/большинства хостингов.
 */
function smtp_config(array $s): ?array
{
    $host = is_string($s['smtpHost'] ?? null) ? trim($s['smtpHost']) : '';
    $user = is_string($s['smtpUser'] ?? null) ? trim($s['smtpUser']) : '';
    $pass = is_string($s['smtpPass'] ?? null) ? $s['smtpPass'] : '';
    if ($host === '' || $user === '' || $pass === '') {
        return null;
    }
    $from = is_string($s['smtpFrom'] ?? null) ? trim($s['smtpFrom']) : '';
    return [
        'host' => $host,
        'port' => is_int($s['smtpPort'] ?? null) ? $s['smtpPort'] : 465,
        'user' => $user,
        'pass' => $pass,
        // From должен совпадать с ящиком авторизации (DKIM-выравнивание),
        // кастомный smtpFrom — только если владелец задал его осознанно
        'from' => ($from !== '' && filter_var($from, FILTER_VALIDATE_EMAIL)) ? $from : $user,
    ];
}

function save_settings(array $settings): bool
{
    ensure_server_data_dir();
    $clean = array_intersect_key($settings, default_settings());
    return update_json_file(settings_path(), static fn (array $cur): array => $clean);
}

/* ------------------------- rate limiting (IP) --------------------------- */

/**
 * IP клиента: из X-Forwarded-For берём ПОСЛЕДНИЙ элемент, фолбэк REMOTE_ADDR.
 * Значение НЕ сохраняем целиком — только md5-префикс.
 */
function ip(): string
{
    $xff = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if (is_string($xff) && $xff !== '') {
        // nginx дописывает реальный IP клиента ПОСЛЕДНИМ; первый элемент подделывает клиент
        $parts = explode(',', $xff);
        $last = trim((string)end($parts));
        if ($last !== '') {
            return substr($last, 0, 45);
        }
    }
    $ra = $_SERVER['REMOTE_ADDR'] ?? '';
    return is_string($ra) ? $ra : '';
}

/**
 * Файловый счётчик запросов на IP: server-data/rl-<bucket>-<md5(ip)>.json.
 * true — лимит не исчерпан (счётчик увеличен), false — 429 (выставлен
 * заголовок Retry-After, остаток секунд — rl_last_retry_after()).
 * Недоступное хранилище не блокирует пользователей (fail-open).
 */
function rl_check(string $bucket, int $max, int $windowSec): bool
{
    ensure_server_data_dir();
    $safeBucket = preg_replace('/[^a-z0-9]/', '', strtolower($bucket));
    $file = server_data_dir() . '/rl-' . $safeBucket . '-' . md5(ip()) . '.json';
    return rl_check_file($file, $max, $windowSec);
}

/**
 * Глобальный предохранитель БЕЗ привязки к IP: один общий счётчик на bucket
 * (server-data/rl-g-<bucket>.json). Ловит спам-волны с ротацией
 * X-Forwarded-For/прокси-пулов, когда per-IP лимиты ничего не жгут.
 */
function rl_check_global(string $bucket, int $max, int $windowSec): bool
{
    ensure_server_data_dir();
    $safeBucket = preg_replace('/[^a-z0-9]/', '', strtolower($bucket));
    $file = server_data_dir() . '/rl-g-' . $safeBucket . '.json';
    return rl_check_file($file, $max, $windowSec);
}

/** Общий файловый счётчик (flock) поверх одного файла-счётчика. */
function rl_check_file(string $file, int $max, int $windowSec): bool
{
    rl_sweep(); // самопроизвольная подчистка устаревших rl-файлов
    $GLOBALS['nilov_rl_retry_after'] ??= 60;
    $now = time();
    $fp = @fopen($file, 'c+');
    if ($fp === false) {
        return true;
    }
    $allowed = true;
    $start = $now;
    if (@flock($fp, LOCK_EX)) {
        $raw = stream_get_contents($fp);
        $d = is_string($raw) ? json_decode($raw, true) : null;
        $count = 0;
        if (is_array($d) && isset($d['c'], $d['t']) && ($now - (int)$d['t']) < $windowSec) {
            $count = (int)$d['c'];
            $start = (int)$d['t'];
        }
        if ($count < $max) {
            $count++;
        } else {
            $allowed = false;
        }
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode(['c' => $count, 't' => $start]));
        fflush($fp);
        flock($fp, LOCK_UN);
    }
    fclose($fp);
    if (!$allowed) {
        $retry = max(1, $windowSec - ($now - $start));
        $GLOBALS['nilov_rl_retry_after'] = $retry;
        header('Retry-After: ' . $retry);
    }
    return $allowed;
}

/**
 * Подчистка rl-*.json старше 25 ч: срабатывает на ~5% запросов
 * (random_int(1,20)===1), не чаще одного раза на запрос. 25 ч больше
 * самого длинного окна счётчиков (leadday, 24 ч) — живые счётчики
 * не трогаем; ротация IP больше не расползается тысячами инодов.
 */
function rl_sweep(): void
{
    if (($GLOBALS['nilov_rl_swept'] ?? false) === true) {
        return;
    }
    $GLOBALS['nilov_rl_swept'] = true;
    try {
        if (random_int(1, 20) !== 1) {
            return;
        }
    } catch (Throwable $e) {
        return; // fail-open, как и весь rate-limiter
    }
    $files = glob(server_data_dir() . '/rl-*.json');
    if (!is_array($files)) {
        return;
    }
    $cutoff = time() - 25 * 3600;
    foreach ($files as $f) {
        $m = @filemtime($f);
        if ($m !== false && $m < $cutoff) {
            @unlink($f);
        }
    }
}

/** Остаток секунд до сброса последнего сработавшего лимита (для тела 429). */
function rl_last_retry_after(): int
{
    return max(1, (int)($GLOBALS['nilov_rl_retry_after'] ?? 60));
}

/* ------------------------------ CSRF ----------------------------------- */

/**
 * Same-origin защита (см. R-REPORT §5): заголовок Origin ∈ allowlist
 * (или отсутствует — топ-левел GET-навигации Origin не шлют).
 *
 * c98-A (sendBeacon): браузерный beacon НЕ может ставить кастомные
 * заголовки — X-Requested-With там физически невозможен. Но sendBeacon
 * (как и fetch) ВСЕГДА шлёт Origin, и кросс-доменный JS не способен его
 * подделать. Новое правило: Origin ∈ allowlist → пропускаем и без XRW;
 * XRW остаётся обязательным при ОТСУТСТВУЮЩЕМ Origin (старые клиенты,
 * curl — как до c98). Чужой Origin отсекается выше в любом случае.
 */
function require_same_origin(bool $isGet = false): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? null;
    if (is_string($origin)) {
        $origin = trim($origin);
    }
    $originOk = ($origin === null || $origin === '') || in_array($origin, NILOV_ORIGIN_ALLOW, true);
    if (!$originOk) {
        json_response(403, ['ok' => false, 'error' => 'origin']);
    }
    if ($isGet) {
        return;
    }
    // доверенный same-origin Origin — сам по себе достаточный CSRF-барьер
    if (is_string($origin) && $origin !== '' && in_array($origin, NILOV_ORIGIN_ALLOW, true)) {
        return;
    }
    $xrw = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';
    if (!is_string($xrw) || strcasecmp($xrw, 'XMLHttpRequest') !== 0) {
        json_response(403, ['ok' => false, 'error' => 'origin']);
    }
}

/* --------------------- сессия админа (HMAC-cookie) --------------------- */

function make_session_cookie_value(int $exp, int $epoch, string $key): string
{
    // подпись включает эпоху сессий: инкремент эпохи отзывает все cookie разом
    return $exp . '.' . hash_hmac('sha256', $exp . '|' . $epoch, $key);
}

/**
 * Выдать сессионную cookie. Secure=true всегда: SSL терминирует nginx,
 * $_SERVER['HTTPS'] у Apache пуст (R-REPORT §3), сайт https-only.
 */
function set_admin_cookie(int $exp, string $key, int $epoch): void
{
    setcookie(SESSION_COOKIE, make_session_cookie_value($exp, $epoch, $key), [
        'expires' => $exp,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
}

function clear_admin_cookie(): void
{
    if (headers_sent()) {
        return;
    }
    setcookie(SESSION_COOKIE, '', [
        'expires' => 1,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
}

/**
 * Валидная сессия → expiry (unix), иначе null.
 * Значение cookie: "<exp10digits>" . "." .
 * hash_hmac('sha256', exp . '|' . sessionEpoch, key); подпись сверяется
 * timing-safe (hash_equals) против ТЕКУЩЕЙ эпохи из настроек — смена пароля
 * или logout-all инкрементируют эпоху и все старые cookie отмирают.
 * expiry — не в прошлом.
 */
function current_session(): ?int
{
    $v = $_COOKIE[SESSION_COOKIE] ?? null;
    if (!is_string($v) || strlen($v) < 12) {
        return null;
    }
    $dot = strpos($v, '.');
    if ($dot === false || $dot < 8 || $dot > 12) {
        return null;
    }
    $exp = substr($v, 0, $dot);
    $sig = substr($v, $dot + 1);
    if (!ctype_digit($exp) || $sig === '') {
        return null;
    }
    $key = (string)(load_secrets(false)['hmac_key'] ?? '');
    if (strlen($key) < 32) {
        return null;
    }
    $epoch = load_settings()['sessionEpoch'] ?? 0;
    if (!is_int($epoch) || $epoch < 0) {
        return null; // битая эпоха — fail-closed, сессий нет
    }
    if (!hash_equals(hash_hmac('sha256', $exp . '|' . $epoch, $key), $sig)) {
        return null;
    }
    $expI = (int)$exp;
    if ($expI < time() || $expI > time() + 31536000) {
        return null;
    }
    return $expI;
}

/** Требовать валидную сессию, иначе 401 JSON. */
function require_admin(): void
{
    if (current_session() === null) {
        json_response(401, ['ok' => false, 'error' => 'unauthorized']);
    }
}

/* ------------------------------ curl ----------------------------------- */

/**
 * Универсальный HTTP-вызов. Возвращает ['status'=>int, 'body'=>string,
 * 'errno'=>int, 'error'=>string]; errno!==0 — транспортная ошибка
 * (status в этом случае 0). UA обязателен для GitHub (403 без него).
 */
function curl_request(string $method, string $url, ?string $jsonBody, int $timeoutSec, array $headers = []): array
{
    if (!function_exists('curl_init')) {
        return ['status' => 0, 'body' => '', 'errno' => -1, 'error' => 'no_curl'];
    }
    $ch = curl_init($url);
    if ($ch === false) {
        return ['status' => 0, 'body' => '', 'errno' => -1, 'error' => 'curl_init_failed'];
    }
    $opts = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => $timeoutSec,
        CURLOPT_USERAGENT => 'nilov-admin/1.0 (+https://nilovcatering.ru)',
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_POSTFIELDS => $jsonBody ?? '',
    ];
    if ($jsonBody === null) {
        // без тела — GET/HEAD (CURLOPT_POSTFIELDS='' превратил бы в POST)
        $opts[CURLOPT_HTTPGET] = true;
        unset($opts[CURLOPT_POSTFIELDS]);
    }
    curl_setopt_array($ch, $opts);
    $body = curl_exec($ch);
    $errno = curl_errno($ch);
    $errmsg = curl_error($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    return [
        'status' => $status,
        'body' => ($body === false || $body === null) ? '' : (string)$body,
        'errno' => $errno,
        'error' => $errmsg,
    ];
}

function curl_post_json(string $url, array $body, int $timeoutSec, array $headers = []): array
{
    $json = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    if ($json === false) {
        return ['status' => 0, 'body' => '', 'errno' => -1, 'error' => 'json_encode_failed'];
    }
    $headers[] = 'Content-Type: application/json';
    return curl_request('POST', $url, $json, $timeoutSec, $headers);
}

function curl_get(string $url, int $timeoutSec, array $headers = []): array
{
    return curl_request('GET', $url, null, $timeoutSec, $headers);
}

/* --------------------------- GitHub API --------------------------------- */

/**
 * Вызов GitHub REST API (https://api.github.com), таймаут 15 c.
 * Заголовки по R-REPORT §2: Bearer, Accept vnd.github+json,
 * X-GitHub-Api-Version: 2022-11-28, User-Agent (без него 403).
 * Возвращает ['status'=>int, 'data'=>?array, 'errno'=>int, 'error'=>string].
 */
function gh_api(string $method, string $path, ?array $body, string $token): array
{
    if ($token === '') {
        return ['status' => 0, 'data' => null, 'errno' => -1, 'error' => 'no_token'];
    }
    $headers = [
        'Authorization: Bearer ' . $token,
        'Accept: application/vnd.github+json',
        'X-GitHub-Api-Version: 2022-11-28',
        'User-Agent: nilov-admin',
    ];
    $json = null;
    if ($body !== null) {
        $json = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json === false) {
            return ['status' => 0, 'data' => null, 'errno' => -1, 'error' => 'json_encode_failed'];
        }
        $headers[] = 'Content-Type: application/json';
    }
    $r = curl_request($method, 'https://api.github.com' . $path, $json, 15, $headers);
    $data = json_decode($r['body'], true);
    return [
        'status' => $r['status'],
        'data' => is_array($data) ? $data : null,
        'errno' => $r['errno'],
        'error' => $r['error'],
    ];
}

/** Путь вида src/data/menu.json → процентно-кодированный (слэши на месте). */
function gh_encode_path(string $path): string
{
    return implode('/', array_map('rawurlencode', explode('/', $path)));
}

/* --------------------------- Telegram API ------------------------------- */

/** Экранирование текста под parse_mode=HTML (правило из доков TG: <, >, &). */
function tg_html_escape(?string $s): string
{
    return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * Вызов Telegram Bot API ($apiBase может быть зеркалом — api.telegram.org
 * из РФ нестабилен с 03.2026, см. R-REPORT §1). Таймаут 7 c.
 */
function tg_api(string $token, string $apiBase, string $apiMethod, ?array $body): array
{
    $base = ($apiBase !== '') ? $apiBase : 'https://api.telegram.org';
    $url = rtrim($base, '/') . '/bot' . $token . '/' . $apiMethod;
    if ($body === null) {
        $r = curl_get($url, 7);
    } else {
        $r = curl_post_json($url, $body, 7);
    }
    $data = json_decode($r['body'], true);
    return [
        'status' => $r['status'],
        'data' => is_array($data) ? $data : null,
        'errno' => $r['errno'],
        'error' => $r['error'],
    ];
}

/**
 * c96 — список API-баз Bot API в порядке попытки:
 *  1) авто-запомненная рабочая база (tgWorkingBase);
 *  2) зеркало владельца из «Настройки → Дополнительно» (tgApiBase);
 *  3) зеркало из secrets (tg_api_base);
 *  4) основной https://api.telegram.org;
 *  5) дополнительные зеркала из secrets (tg_api_bases, массив).
 * Публичных зеркал Bot API не существует (токен в URL → публичный прокси
 * = перехватчик токенов, см. research/c96/tg-mirrors.md) — владелец
 * разворачивает СВОЙ Cloudflare Worker и вставляет URL в настройки.
 */
function tg_api_bases(array $s, array $secrets): array
{
    $bases = [];
    $push = static function (mixed $b) use (&$bases): void {
        if (!is_string($b)) {
            return;
        }
        $b = rtrim(trim($b), '/');
        if ($b !== '' && str_starts_with($b, 'https://') && strlen($b) <= 200 && !in_array($b, $bases, true)) {
            $bases[] = $b;
        }
    };
    $push($s['tgWorkingBase'] ?? null);
    $push($s['tgApiBase'] ?? null);
    $push($secrets['tg_api_base'] ?? null);
    $push('https://api.telegram.org');
    $extra = $secrets['tg_api_bases'] ?? null;
    if (is_array($extra)) {
        foreach ($extra as $b) {
            $push($b);
        }
    }
    return $bases;
}

/**
 * c96 — вызов TG API с перебором баз: транспортный сбой (errno!==0,
 * status 0 или 5xx) → следующая база. HTTP 2xx–4xx = сервер жив
 * (токен/чат/лимиты проверяет сам Telegram — на них НЕ переключаемся).
 * Возвращает результат + 'base' (какая сработала) и 'tried' (диагностика
 * для UI: какие базы и с какой ошибкой пробовали).
 */
function tg_api_try(string $token, array $bases, string $apiMethod, ?array $body): array
{
    $tried = [];
    $last = ['status' => 0, 'data' => null, 'errno' => -1, 'error' => 'no_bases', 'base' => null, 'tried' => []];
    foreach ($bases as $base) {
        $r = tg_api($token, (string)$base, $apiMethod, $body);
        $r['base'] = $base;
        $tried[] = [
            'base' => $base,
            'errno' => $r['errno'],
            'error' => str_trunc((string)$r['error'], 120),
            'status' => $r['status'],
        ];
        /* c96-CRIT-A: 3xx — тоже транспортный сбой (TG Bot API легитимно
         * не отвечает редиректами; база-редирект вроде t.me блокировала
         * весь фолбэк). 2xx–4xx = сервер жив. */
        $transportFail = $r['errno'] !== 0 || $r['status'] === 0 || $r['status'] >= 300;
        if (!$transportFail) {
            $r['tried'] = $tried;
            return $r;
        }
        $last = $r;
    }
    $last['tried'] = $tried;
    return $last;
}

/**
 * c96 — запомнить рабочую базу TG (см. default_settings/tgWorkingBase).
 * Пишет только при изменении, под flock; безопасна при конкурентных лидах.
 */
function tg_remember_working_base(string $base): void
{
    $base = rtrim(trim($base), '/');
    if ($base === '' || !str_starts_with($base, 'https://') || strlen($base) > 200) {
        return;
    }
    update_json_file(settings_path(), static function (array $cur) use ($base): array {
        if (($cur['tgWorkingBase'] ?? null) === $base) {
            return $cur;
        }
        $cur['tgWorkingBase'] = $base;
        return $cur;
    });
}

/**
 * c96-CRIT-A — сбросить запомненную базу (сетевой сбой по всем базам).
 * Самозалечивание: следующая успешная база запишется при первом успехе;
 * без сброса мёртвая база висела первой в цепочке вечно.
 */
function tg_forget_working_base(): void
{
    update_json_file(settings_path(), static function (array $cur): array {
        if (array_key_exists('tgWorkingBase', $cur)) {
            unset($cur['tgWorkingBase']);
        }
        return $cur;
    });
}

/**
 * c96 — sendMessage с перебором баз и запоминанием рабочей: замена tg_send
 * в прод-путях (lead.php, админ-мастер). Возвращает как tg_send плюс
 * 'tried' (диагностика сетевых неудач) и 'base' на успехе.
 *
 * c96-CRIT-A: $maxBases ограничивает бюджет таймаутов (лид-путь передаёт 2 —
 * мёртвая запомненная база + одна запасная, дальше mail()-фолбэк); при
 * полном сетевом сбое запомненная база сбрасывается (самозалечивание).
 * c101: + $replyMarkup — массив для sendMessage (inline_keyboard;
 * {'inline_keyboard':[[{'text':…,'url':…}]]}), null — без клавиатуры
 * (админ-тест и любые прочие вызовы не меняются).
 */
function tg_send_fb(string $token, array $bases, string $chatId, string $html, int $maxBases = 0, ?array $replyMarkup = null): array
{
    $html = str_trunc($html, 3800); // лимит TG 4096 после парсинга — берём запас
    if ($maxBases > 0 && count($bases) > $maxBases) {
        $bases = array_slice($bases, 0, $maxBases);
    }
    $body = [
        'chat_id' => $chatId,
        'text' => $html,
        'parse_mode' => 'HTML',
        'link_preview_options' => ['is_disabled' => true],
    ];
    if ($replyMarkup !== null) {
        $body['reply_markup'] = $replyMarkup;
    }
    $r = tg_api_try($token, $bases, 'sendMessage', $body);
    if ($r['errno'] !== 0 || $r['status'] === 0) {
        tg_forget_working_base();
        return ['ok' => false, 'status' => 0, 'error' => 'network', 'tried' => $r['tried'] ?? []];
    }
    if ($r['status'] === 200 && is_array($r['data']) && ($r['data']['ok'] ?? null) === true) {
        if (is_string($r['base'] ?? null) && $r['base'] !== '') {
            tg_remember_working_base($r['base']);
        }
        return ['ok' => true, 'status' => 200, 'base' => $r['base'] ?? null];
    }
    if ($r['status'] === 429) {
        $ra = null;
        if (is_array($r['data']) && isset($r['data']['parameters']['retry_after'])) {
            $ra = max(1, (int)$r['data']['parameters']['retry_after']);
        }
        return ['ok' => false, 'status' => 429, 'error' => 'rate_limit', 'retryAfterSec' => $ra, 'base' => $r['base'] ?? null];
    }
    if ($r['status'] === 401 || $r['status'] === 404) {
        return ['ok' => false, 'status' => $r['status'], 'error' => 'unauthorized', 'base' => $r['base'] ?? null];
    }
    $desc = 'tg_error';
    if (is_array($r['data']) && isset($r['data']['description']) && is_string($r['data']['description'])) {
        $desc = $r['data']['description'];
    }
    return ['ok' => false, 'status' => $r['status'], 'error' => $desc, 'base' => $r['base'] ?? null];
}

/**
 * sendMessage (parse_mode=HTML, превью ссылок выключено актуальным
 * параметром link_preview_options — disable_web_page_preview удалён).
 * Возвращает ['ok'=>bool, 'status'=>int, 'error'=>?, 'retryAfterSec'=>?].
 * 429 → параметры retry_after пробрасываются наружу.
 * c101: + $replyMarkup (inline_keyboard; null — без клавиатуры).
 */
function tg_send(string $token, string $apiBase, string $chatId, string $html, ?array $replyMarkup = null): array
{
    $html = str_trunc($html, 3800); // лимит TG 4096 после парсинга — берём запас
    $body = [
        'chat_id' => $chatId,
        'text' => $html,
        'parse_mode' => 'HTML',
        'link_preview_options' => ['is_disabled' => true],
    ];
    if ($replyMarkup !== null) {
        $body['reply_markup'] = $replyMarkup;
    }
    $r = tg_api($token, $apiBase, 'sendMessage', $body);
    if ($r['errno'] !== 0 || $r['status'] === 0) {
        return ['ok' => false, 'status' => 0, 'error' => 'network'];
    }
    if ($r['status'] === 200 && is_array($r['data']) && ($r['data']['ok'] ?? null) === true) {
        return ['ok' => true, 'status' => 200];
    }
    if ($r['status'] === 429) {
        $ra = null;
        if (is_array($r['data']) && isset($r['data']['parameters']['retry_after'])) {
            $ra = max(1, (int)$r['data']['parameters']['retry_after']);
        }
        return ['ok' => false, 'status' => 429, 'error' => 'rate_limit', 'retryAfterSec' => $ra];
    }
    if ($r['status'] === 401 || $r['status'] === 404) {
        return ['ok' => false, 'status' => $r['status'], 'error' => 'unauthorized'];
    }
    $desc = 'tg_error';
    if (is_array($r['data']) && isset($r['data']['description']) && is_string($r['data']['description'])) {
        $desc = $r['data']['description'];
    }
    return ['ok' => false, 'status' => $r['status'], 'error' => $desc];
}

/* ------------------------------- mail ----------------------------------- */

/** Отображаемое имя отправителя для писем сайта. */
const MAIL_FROM_NAME = 'NILOV CATERING';
/** Домен сайта для Message-ID (RFC 5322: <ts.rand@domain>). */
const MAIL_DOMAIN = 'nilovcatering.ru';

/* ------- c102: контактные каналы компании для писем (единый источник) ----- */

/** Телефон/WhatsApp/Telegram-чат компании (один номер, три канала). */
const OWNER_PHONE_PRETTY = '+7 (911) 941-72-05';
const OWNER_PHONE_E164 = '+79119417205';
const OWNER_PHONE_DIGITS = '79119417205';
/** Прямой Telegram-ЧАТ с компанией (не канал): клиент пишет — нам. */
const OWNER_TG_CHAT_URL = 'https://t.me/+79119417205';
/** WhatsApp-чат по тому же номеру. */
const OWNER_WA_URL = 'https://wa.me/79119417205';
/** c102 (владелец: «очень актуально»): профиль в мессенджере MAX
 *  (max.ru/u/f9LH… — реальный профиль от владельца, c92; тот же URL,
 *  что CONTACTS.maxHref в src/lib/config.ts). */
const OWNER_MAX_URL = 'https://max.ru/u/f9LHodD0cOLcnReQpyQHwFiG5c5jpXP58e8Ni38wbQC2lpDWdSCYkXsZ8ak';
const OWNER_MAX_PHONE_PRETTY = '+7 (911) 826-39-26';

/* ------------- c101: CID-логотип в HTML-письмах (public/brand/) ---------- */

/**
 * c101 — фиксированный Content-ID эмблемы в шапке HTML-писем. Один и тот же
 * для всех писем: в сообщении ровно одна inline-картинка, уникальность
 * внутри сообщения гарантирована самим фактом единственности; Gmail /
 * Outlook / Apple Mail / Яндекс-почта принимают доменный CID спокойно.
 * HTML ссылается как <img src="cid:logo@nilovcatering.ru">, MIME-часть
 * несёт Content-ID: <logo@nilovcatering.ru> внутри multipart/related.
 */
const MAIL_LOGO_CID = 'logo@nilovcatering.ru';

/** c101 — файл эмблемы для писем (public/brand/logo-email.png, 120x140,
 * генерируется scripts/gen-email-logo.py; едет со статикой на хостинг). */
function mail_logo_file(): string
{
    return dirname(__DIR__) . '/brand/logo-email.png';
}

/**
 * c101 — CID логотипа, если файл на месте (кеш в static — файловая проверка
 * один раз на запрос). null → письма уходят с текстовой шапкой как в c100
 * (мягкая деградация: HTML без картинок, MIME — plain alternative).
 */
function mail_logo_cid(): ?string
{
    static $ok = null;
    if ($ok === null) {
        $ok = is_file(mail_logo_file()) && is_readable(mail_logo_file());
    }
    return $ok ? MAIL_LOGO_CID : null;
}

/**
 * c101 — inline-вложение логотипа для mail_send(): ['bytes','name','entry',
 * 'inline'=>true,'cid']. Кап 512КБ — страховка от случайно подложенного
 * гигантского файла (реальный размер ~23КБ).
 */
function mail_logo_attachment(): ?array
{
    if (mail_logo_cid() === null) {
        return null;
    }
    $bytes = @file_get_contents(mail_logo_file());
    if (!is_string($bytes) || $bytes === '' || strlen($bytes) > 524288) {
        return null;
    }
    return ['bytes' => $bytes, 'name' => 'logo-email.png',
        'entry' => ['fileName' => 'logo-email.png', 'fileNameStar' => ''],
        'inline' => true, 'cid' => MAIL_LOGO_CID];
}

/** c101 — число «настоящих» вложений письма (PDF), CID-логотип не считается:
 * журнал почты в админке показывает «вложение: N» = количество файлов,
 * которые клиент реально скачивает, а не служебную эмблему шапки. */
function mail_attach_count(array $attachments): int
{
    $n = 0;
    foreach ($attachments as $att) {
        if (empty($att['inline'])) {
            $n++;
        }
    }
    return $n;
}

/* ------------------ c99: PDF-вложения (public/menu-pdf/) ---------------- */

/**
 * c99 — каталог PDF-меню (сгенерирован scripts/gen-menu-pdfs.ts в build:
 * 17 per-tariff PDF + полный каталог + manifest.json; лежит в out/ и
 * деплоится rsync'ом вместе со статикой).
 */
function menu_pdf_dir(): string
{
    return dirname(__DIR__) . '/menu-pdf';
}

/** Манифест PDF-вложений: [{typeId,pkgIdx,file,label,fileName,fileNameStar}] или []. */
function menu_pdf_manifest(): array
{
    $path = menu_pdf_dir() . '/manifest.json';
    if (!is_file($path)) {
        return [];
    }
    $raw = file_get_contents($path);
    if (!is_string($raw) || $raw === '') {
        return [];
    }
    $m = json_decode($raw, true);
    $entries = (is_array($m) && isset($m['entries']) && is_array($m['entries'])) ? $m['entries'] : [];
    return array_values(array_filter($entries, 'is_array'));
}

/**
 * c100 — русский ярлык типа мероприятия по его id (как в src/data/menu.json).
 * Дубликат ярлыков на бэкенде: письмо собирается из payload, где от старого
 * кэш-бандла может не быть typeLabel/eventLabel — по одному typeId всегда
 * восстанавливаем человекочитаемый «Фуршет»/«Банкет» (раньше письма
 * показывали только «Формат: Премиум» — тип события терялся).
 */
function menu_type_label(string $typeId): ?string
{
    static $map = [
        'buffet' => 'Фуршет',
        'banquet' => 'Банкет',
        'snack-box' => 'Доставка закусок',
        'coffee-break' => 'Кофе-брейк',
        'vegetarian' => 'Вегетарианское',
        'bbq' => 'Барбекю',
    ];
    return $map[$typeId] ?? null;
}

/**
 * c99 — подобрать PDF-меню под ЗАЯВКУ: пакет конкретного тарифа
 * (typeId+pkgIdx из калькулятора) → иначе тип без пакета (pkgIdx null
 * не бывает в манифесте тарифов) → полный каталог. Возвращает запись
 * манифеста или null (каталога нет — письмо уйдёт без вложения).
 */
function menu_pdf_for_payload(array $payload): ?array
{
    $entries = menu_pdf_manifest();
    if ($entries === []) {
        return null;
    }
    $typeId = (isset($payload['typeId']) && is_string($payload['typeId'])) ? $payload['typeId'] : '';
    $pkgIdx = (isset($payload['pkgIdx']) && is_numeric($payload['pkgIdx'])) ? (int)$payload['pkgIdx'] : null;

    if ($typeId !== '') {
        foreach ($entries as $e) {
            if (($e['typeId'] ?? '') === $typeId && $pkgIdx !== null && ($e['pkgIdx'] ?? null) === $pkgIdx) {
                return $e;
            }
        }
        foreach ($entries as $e) {
            if (($e['typeId'] ?? '') === $typeId) {
                return $e;
            }
        }
    }
    foreach ($entries as $e) {
        if (($e['typeId'] ?? '') === 'all') {
            return $e;
        }
    }
    return null;
}

/**
 * c99 — прочитать файл PDF-вложения. Возвращает null, если файла нет
 * или он больше 2 МБ (защита от распухших вложений; реальные меню
 * 130-280 КБ). Ошибка читается в журнале отправки (attachSkipped).
 */
function menu_pdf_bytes(array $entry): ?string
{
    $file = (isset($entry['file']) && is_string($entry['file'])) ? $entry['file'] : '';
    // имя файла — из манифеста (наш генератор), НЕ из юзера; всё равно
    // страховка: только basename без расширений пути
    $file = basename($file);
    if ($file === '' || !preg_match('/^[a-z0-9-]+\.pdf$/i', $file)) {
        return null;
    }
    $path = menu_pdf_dir() . '/' . $file;
    if (!is_file($path) || filesize($path) < 1024 || filesize($path) > 2 * 1024 * 1024) {
        return null;
    }
    $bytes = file_get_contents($path);
    return is_string($bytes) ? $bytes : null;
}

/** c99 — Content-Disposition вложения: filename= (ASCII-фолбэк) +
 *  filename*=UTF-8''<pct-encoded> (RFC 6266) — кириллица читается в
 *  современных клиентах, ASCII — в старых. Значения из манифеста,
 *  уже подготовленные генератором (транслит + rawurlencode). */
function mail_attachment_disposition(array $entry): string
{
    $ascii = (isset($entry['fileName']) && is_string($entry['fileName'])) ? $entry['fileName'] : 'menu.pdf';
    $star = (isset($entry['fileNameStar']) && is_string($entry['fileNameStar'])) ? $entry['fileNameStar'] : '';
    $d = "attachment; filename=\"" . str_replace(['"', "\\", "\r", "\n"], '', $ascii) . "\"";
    if ($star !== '') {
        $d .= "; filename*=UTF-8''" . str_replace(["\r", "\n", ' '], '', $star);
    }
    return $d;
}

/**
 * c100 — HTML-каркас письма (таблично-инлайновый, почтовые клиенты без
 * CSS-поддержки читают всё равно). $inner — готовый внутренний HTML
 * (детали заявки/контакты). Палитра сайта: крем/уголь/золото #D4A373.
 * c101 — в тёмной шапке над вордмарком эмблема компании (CID-картинка из
 * public/brand/logo-email.png, инлайн-вложение multipart/related — НЕ
 * внешняя ссылка: ноль внешних запросов из письма сохраняется). Файла нет
 * — шапка остаётся чисто текстовой, как в c100 (мягкая деградация).
 * alt="" — эмблема декоративна, бренд уже назван вордмарком ниже (при
 * заблокированных картинках письмо не «звенит» битым alt).
 */
function mail_html_wrap(string $title, string $inner, string $footerNote = ''): string
{
    $year = date('Y');
    $foot = $footerNote !== ''
        ? '<p style="margin:0 0 10px;font:13px/1.5 Arial,sans-serif;color:#8a8175;">' . $footerNote . '</p>'
        : '';
    $logo = '';
    $logoCid = mail_logo_cid();
    if ($logoCid !== null) {
        $logo = '<img src="cid:' . $logoCid . '" width="60" height="70" alt="" '
            . 'style="display:block;margin:0 auto 10px;width:60px;height:70px;border:0;outline:none;text-decoration:none;">';
    }
    return '<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<title>' . $title . '</title></head>'
        . '<body style="margin:0;padding:0;background:#f4efe7;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4efe7;padding:24px 12px;">'
        . '<tr><td align="center">'
        . '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 14px rgba(35,32,27,.08);">'
        // шапка бренда (c101: эмблема CID + вордмарк + слоган)
        . '<tr><td style="padding:26px 32px 22px;background:#23201b;text-align:center;">'
        . $logo
        . '<div style="font:bold 22px/1 Georgia,serif;color:#d4a373;letter-spacing:3px;">NILOV&nbsp;CATERING</div>'
        . '<div style="margin-top:6px;font:12px/1.4 Arial,sans-serif;color:#b7ad9e;letter-spacing:1px;">кейтеринг, в&nbsp;котором чувствуют&nbsp;· Санкт-Петербург</div>'
        . '</td></tr>'
        // заголовок письма
        . '<tr><td style="padding:28px 32px 4px;font:bold 24px/1.3 Georgia,serif;color:#23201b;">' . $title . '</td></tr>'
        // контент
        . '<tr><td style="padding:14px 32px 8px;font:15px/1.6 Arial,sans-serif;color:#3d3831;">' . $inner . '</td></tr>'
        // контакты-подвал (c102: + MAX; Telegram — прямой ЧАТ t.me/+<номер>,
        // а не канал: из письма пишут «нам», канал живёт на сайте)
        . '<tr><td style="padding:20px 32px 26px;border-top:1px solid #eee6d8;">'
        . $foot
        . '<p style="margin:0;font:14px/1.7 Arial,sans-serif;color:#3d3831;">'
        . 'Телефон: <a href="tel:' . OWNER_PHONE_E164 . '" style="color:#23201b;font-weight:bold;text-decoration:none;">' . OWNER_PHONE_PRETTY . '</a><br>'
        . 'Написать: <a href="' . OWNER_TG_CHAT_URL . '" style="color:#a97f3f;text-decoration:none;">Telegram</a> · '
        . '<a href="' . OWNER_WA_URL . '" style="color:#a97f3f;text-decoration:none;">WhatsApp</a> · '
        . '<a href="' . OWNER_MAX_URL . '" style="color:#a97f3f;text-decoration:none;">MAX</a> '
        . '<span style="color:#b7ad9e;">(' . OWNER_MAX_PHONE_PRETTY . ')</span><br>'
        . 'Сайт: <a href="https://nilovcatering.ru" style="color:#a97f3f;text-decoration:none;">nilovcatering.ru</a></p>'
        . '<p style="margin:12px 0 0;font:11px/1.5 Arial,sans-serif;color:#b7ad9e;">'
        . 'Это письмо отправлено автоматически с сайта nilovcatering.ru · © ' . $year . ' NILOV CATERING</p>'
        . '</td></tr>'
        . '</table></td></tr></table></body></html>';
}

/**
 * c99/c100/c101 — тело письма с MIME-частями. Вложений нет и нет HTML —
 * прежний плоский text/plain (байт-совместим со старыми тестовыми письмами).
 * Есть HTML — multipart/alternative [text, html] (клиент без HTML-рендера
 * покажет текст). Есть inline-части (CID-логотип шапки, c101) — ядро
 * оборачивается в multipart/related [ alternative [text, html], image… ]
 * (RFC 2387 — так CID-картинки находят свой HTML). Обычные вложения —
 * внешний multipart/mixed [ related|alternative, pdf… ] (RFC 2046).
 * Полная структура письма клиенту с меню и логотипом:
 *   mixed [ related [ alternative [text, html], logo.png ], menu.pdf ].
 * Возвращает [headers: string[], body: string] — To/Subject SMTP-пути
 * добавляет smtp_send, mail()-путь — PHP сам.
 */
function mail_mime_parts(array $extraHeaders, string $bodyText, array $attachments, ?string $html = null): array
{
    $hasHtml = $html !== null && $html !== '';
    /* c101: inline-части имеют смысл только при HTML (cid: живёт в HTML);
     * без HTML они выбрасываются — писем «картинка в никуда» не бывает. */
    $inline = [];
    $regular = [];
    foreach ($attachments as $att) {
        if (!empty($att['inline'])) {
            if ($hasHtml) {
                $inline[] = $att;
            }
        } else {
            $regular[] = $att;
        }
    }
    if ($regular === [] && !$hasHtml) {
        return [$extraHeaders, mail_body_crlf($bodyText)];
    }
    $b = '=nilov-' . bin2hex(random_bytes(12)); // '=' разрешён в boundary (RFC 2046 bcharsnospace) и не встречается в base64-строках тела
    $bRel = '=nilov-rel-' . bin2hex(random_bytes(10));
    $bAlt = '=nilov-alt-' . bin2hex(random_bytes(10));
    // базовые заголовки — без плоских Content-Type/CTE (заменяются multipart-версией ниже)
    $headers = array_values(array_filter($extraHeaders, static function (string $h): bool {
        return stripos($h, 'Content-Type:') !== 0 && stripos($h, 'Content-Transfer-Encoding:') !== 0;
    }));
    /* Текстовая часть обязана заканчиваться CRLF: по RFC 2046 разделитель
     * границы — CRLF "--{boundary}"; без него граница приклеилась бы к
     * последней строке текста («…чувствуют--=nilov-…») и почтовые клиенты
     * не распознали бы вложение (поймано тестом c99-A: base64-раундтрип). */
    $textPart = "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n"
        . mail_body_crlf($bodyText) . "\r\n";
    $htmlPart = "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n"
        . mail_body_crlf($html ?? '') . "\r\n";

    /* Ядро письма (уровень 1): alternative [text, html] — либо одиночный
     * text/plain без HTML (его заголовки уже внутри $textPart). */
    if ($hasHtml) {
        $nodeCT = 'multipart/alternative; boundary="' . $bAlt . '"';
        $nodeBody = "--{$bAlt}\r\n" . $textPart
            . "--{$bAlt}\r\n" . $htmlPart
            . "--{$bAlt}--\r\n";
    } else {
        $nodeCT = null;
        $nodeBody = $textPart;
    }

    /* Уровень 2 (c101): related [ core, inline-картинки ] — RFC 2387. */
    if ($inline !== []) {
        $relBody = "--{$bRel}\r\n"
            . ($nodeCT !== null ? "Content-Type: {$nodeCT}\r\n\r\n" : '')
            . $nodeBody;
        foreach ($inline as $img) {
            $name = str_replace(['"', "\r", "\n"], '', (string)($img['name'] ?? 'image.png'));
            $cid = str_replace(['<', '>', '"', "\r", "\n", ' '], '', (string)($img['cid'] ?? ''));
            $data = chunk_split(base64_encode((string)$img['bytes']), 76, "\r\n");
            $relBody .= "--{$bRel}\r\n"
                . "Content-Type: image/png; name=\"{$name}\"\r\n"
                . "Content-Disposition: inline; filename=\"{$name}\"\r\n"
                . "Content-ID: <{$cid}>\r\n"
                . "Content-Transfer-Encoding: base64\r\n\r\n"
                . $data;
        }
        $relBody .= "--{$bRel}--\r\n";
        $nodeCT = 'multipart/related; boundary="' . $bRel . '"';
        $nodeBody = $relBody;
    }

    /* Уровень 3: обычные вложения — внешний multipart/mixed (RFC 2046). */
    if ($regular !== []) {
        $parts = ["--{$b}\r\n"
            . ($nodeCT !== null ? "Content-Type: {$nodeCT}\r\n\r\n" : '')
            . $nodeBody];
        foreach ($regular as $att) {
            $data = chunk_split(base64_encode($att['bytes']), 76, "\r\n");
            $parts[] = "--{$b}\r\n"
                . "Content-Type: application/pdf; name=\"" . str_replace(['"', "\r", "\n"], '', (string)$att['name']) . "\"\r\n"
                . 'Content-Disposition: ' . mail_attachment_disposition($att['entry']) . "\r\n"
                . "Content-Transfer-Encoding: base64\r\n\r\n"
                . $data;
        }
        $body = implode('', $parts) . "--{$b}--\r\n";
        $headers[] = 'Content-Type: multipart/mixed; boundary="' . $b . '"';
    } else {
        /* Верхний контейнер — сам узел (alternative или related); сюда не
         * попадаем с $nodeCT === null: без HTML и без regular вернулись
         * плоским письмом выше. */
        $body = $nodeBody;
        $headers[] = 'Content-Type: ' . (string)$nodeCT;
    }
    $headers[] = 'Content-Transfer-Encoding: 8bit';
    return [$headers, $body];
}

/**
 * c97 — тема письма в encoded-word (=?UTF-8?B?…?=), кусками ≤ 75 байт
 * (RFC 2047). Длинные темы надёжно принимаются Gmail/mail.ru.
 */
function mail_subject_enc(string $subject): string
{
    $subject = str_replace(["\r", "\n"], ' ', $subject);
    $words = [];
    // режем на куски по 12 UTF-8-символов (модификатор u — суррогатных
    // разрезов нет): 12 симв. = до 48 байт base64 + обвязка ≈ 20 байт —
    // каждый encoded-word в лимите 75 байт (RFC 2047)
    if (preg_match_all('/.{1,12}/us', $subject, $m) && !empty($m[0])) {
        foreach ($m[0] as $chunk) {
            $words[] = '=?UTF-8?B?' . base64_encode($chunk) . '?=';
        }
    }
    return $words === [] ? '=?UTF-8?B??=' : implode("\r\n ", $words);
}

/** c97 — уникальный Message-ID (отсутствие — сильный спам-сигнал Gmail). */
function mail_message_id(): string
{
    return '<' . time() . '.' . bin2hex(random_bytes(8)) . '@' . MAIL_DOMAIN . '>';
}

/**
 * c97 — тело письма: CRLF, точка в начале строки защищена (RFC 5321
 * «dot-stuffing» — иначе SMTP-транспорте разорвёт письмо).
 */
function mail_body_crlf(string $bodyText): string
{
    $body = str_replace(["\r\n", "\r"], "\n", $bodyText);
    $body = str_replace("\n", "\r\n", $body);
    return preg_replace('/^\./m', '..', $body);
}

/**
 * c97 — общий набор заголовков (без To/Subject: SMTP добавляет их
 * сам из параметров, а mail() ставит из своих аргументов — дубликаты
 * ломают письмо).
 * c99: плоские Content-Type/CTE остаются только для писем БЕЗ вложений;
 * с вложениями mail_mime_parts() заменяет их на multipart/mixed.
 * Date и Message-ID обязательны: их отсутствие — один из главных
 * спам-сигналов у Gmail (в c95 их не было — вероятная причина пропажи).
 */
function mail_headers(string $fromEmail, ?string $replyTo): array
{
    $headers = [
        'From: ' . MAIL_FROM_NAME . ' <' . $fromEmail . '>',
        'Date: ' . date('r'),
        'Message-ID: ' . mail_message_id(),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];
    if ($replyTo !== null && $replyTo !== '' && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $headers[] = 'Reply-To: ' . $replyTo;
    }
    return $headers;
}

/**
 * c97 — SMTP-клиент по сырому сокету (без phpmailer: хостинг-агностично,
 * расширений не требуется — fsockopen + stream crypto из ядра PHP).
 * Поддерживает SSL (465) и STARTTLS (587/25) + AUTH LOGIN.
 * Возвращает ['ok'=>bool, 'error'=>?string, 'detail'=>?string].
 *
 * c98-FIX1 (критик2 E2, MAJOR): бюджет ОДНОГО письма — 15с wall-clock,
 * таймаут операции — 5с (было: connect 10с + stream_set_timeout(15) на
 * КАЖДУЮ из ~11 операций ≈ до ~190с на письмо; писем два + ретрай — один
 * FPM-воркер висел минутами ПОСЛЕ ответа клиенту). Дедлайн сверяется
 * перед каждой командой; остаток бюджета становится таймаутом операции —
 * письмо физически не может занять больше ~15с. Таймаут чтения помечается
 * отдельным кодом 'smtp_timeout' (было 'bad_greeting'/'ehlo_failed' с
 * пустым текстом) — lead.php различает «мёртвый» канал для ретрая.
 *
 * c99: + $attachments (массив ['bytes'=>string,'name'=>string,
 * 'entry'=>манифест]) — тело собирается через mail_mime_parts
 * (multipart/mixed).
 * c100: + $html — письмо с HTML-частью (multipart/alternative). ГЛАВНОЕ:
 * тело DATA пишем ЧАНКАМИ с дотяжкой частичных fwrite. Раньше один
 * fwrite на ~335КБ (PDF+base64): под SO_SNDTIMEO fwrite возвращал
 * ЧАСТЬ (замер c99-критика: 114271 из 343040) → 'write_failed' →
 * mail()-фолбэк со своими сюрпризами. Теперь: окно 32КБ × цикл до
 * полного объёма, дедлайн письма проверяется перед каждым окном; бюджет
 * письма для писем с вложениями поднят 15с → 25с (транзит 335КБ по TLS
 * легитимно занимает секунды).
 */
function smtp_send(array $cfg, string $to, string $subject, string $bodyText, ?string $replyTo, array $attachments = [], ?string $html = null): array
{
    $host = $cfg['host'];
    $port = (int)$cfg['port'];
    $errno = 0;
    $errstr = '';
    $letterBudgetSec = ($attachments === []) ? 15.0 : 25.0; // c100: вложение ~335КБ — больше транзита
    $opTimeoutSec = 5.0;      // c98-FIX1: таймаут одной операции (было 15)
    $deadline = microtime(true) + $letterBudgetSec;
    $ctx = stream_context_create(['ssl' => [
        'verify_peer' => true,
        'verify_peer_name' => true,
        'SNI_enabled' => true,
    ]]);
    $fp = @stream_socket_client(
        'tcp://' . $host . ':' . $port,
        $errno,
        $errstr,
        5.0, // c98-FIX1: connect тоже в бюджете письма (было 10с)
        STREAM_CLIENT_CONNECT,
        $ctx
    );
    if ($fp === false) {
        return ['ok' => false, 'error' => 'connect_failed', 'detail' => str_trunc("{$errstr} ({$errno})", 200)];
    }
    /* c98-FIX1: таймаут операции = min(5с, остаток бюджета) — последняя
     * операция не выйдет за дедлайн письма; false = бюджет исчерпан. */
    $tuneTimeout = static function () use ($fp, $deadline, $opTimeoutSec): bool {
        $left = $deadline - microtime(true);
        if ($left <= 0) {
            return false;
        }
        $t = min($opTimeoutSec, $left);
        $sec = (int)floor($t);
        $usec = (int)round(($t - $sec) * 1000000);
        stream_set_timeout($fp, $sec, $usec);
        return true;
    };

    /** Читает SMTP-ответ (многострочный «250-…» / «250 …»), возвращает код.
     * c98-FIX2 (критик5 MAJOR-1): дедлайн письма/кап проверяются НА КАЖДОЙ
     * continuation-строке — прежде $tuneTimeout ставился ОДИН раз до цикла,
     * и сервер, бесконечно стримящий «250-…», кормил fgets вечно: таймаут
     * срабатывал только при МОЛЧАНИИ сокета, воркер умирал от memory
     * exhausted (~65МБ ответа за ~37с при бюджете 15с/письмо). Капы:
     * ≤200 строк / ≤64КБ текста (реальные SMTP-ответы — единицы строк);
     * исчерпание → код 0 'smtp_timeout' (lead.php классифицирует канал
     * «мёртвый» для ретрая). */
    $readCode = static function () use ($fp, $tuneTimeout, $deadline): array {
        if (!$tuneTimeout()) {
            return [0, 'timeout_budget'];
        }
        $code = 0;
        $text = '';
        $maxLines = 200;
        $maxBytes = 65536;
        $lines = 0;
        while (($line = fgets($fp, 1024)) !== false) {
            $text .= $line;
            $lines++;
            if (strlen($line) < 4 || $line[3] !== '-') {
                $code = (int)substr($line, 0, 3);
                break;
            }
            /* continuation «250-…»: сверяем бюджет и капы ПЕРЕД следующей
             * строкой + подтягиваем сокет-таймаут под остаток бюджета. */
            if (
                $lines >= $maxLines ||
                strlen($text) >= $maxBytes ||
                microtime(true) >= $deadline ||
                !$tuneTimeout()
            ) {
                return [0, 'smtp_timeout'];
            }
        }
        return [$code, trim($text)];
    };
    /** Пишет команду и читает ответ; false — таймаут/обрыв.
     * c99-fix (критик E1-m2): детект ЧАСТИЧНОЙ записи. fwrite на блокирующем
     * сокете с SO_SNDTIMEO может вернуть МЕНЬШЕ байт (замер: 114271 из
     * 343040 при застрявшем читателе) — раньше это молча доводило до
     * таймаута чтения ('smtp_timeout', +5с ожидания); теперь честный
     * 'write_failed' сразу: письмо быстрее уходит в mail()-фолбэк. */
    $cmd = static function (string $c, string $expect) use ($fp, $readCode, $tuneTimeout): array {
        if (!$tuneTimeout()) {
            return [0, 'timeout_budget'];
        }
        $want = strlen($c) + 2; // команда + CRLF
        $n = fwrite($fp, $c . "\r\n");
        if ($n === false || $n !== $want) {
            return [0, 'write_failed'];
        }
        [$code, $text] = $readCode();
        if ($code === 0) {
            return [0, 'timeout'];
        }
        if ($expect !== '' && $code !== (int)$expect) {
            return [$code, str_trunc($text, 300)];
        }
        return [$code, $text];
    };
    /** Включает TLS на текущем сокете (STARTTLS после EHLO). */
    $startTls = static function () use ($fp): bool {
        if (!@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            // некоторые PHP без перечисления методов: пробуем любой клиентский
            return (bool)@stream_socket_enable_crypto($fp, true);
        }
        return true;
    };

    try {
        // 465 — implicit TLS (крипта до приветствия); 587/25 — STARTTLS
        $implicitTls = ($port === 465);
        if ($implicitTls) {
            // блокирующий сокет: рукопожатие выполняется в одном вызове;
            // при неудаче — вторая попытка с ANY (хостинги со старым TLS)
            $tlsOk = @stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)
                || @stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_ANY_CLIENT);
            if (!$tlsOk) {
                return ['ok' => false, 'error' => 'tls_failed', 'detail' => 'SSL-рукопожатие не удалось (порт 465)'];
            }
        }
        [$code, $text] = $readCode();
        if ($code !== 220) {
            // c98-FIX1: code 0 = таймаут приветствия (мёртвый сервер) — свой код
            return ['ok' => false, 'error' => ($code === 0 ? 'smtp_timeout' : 'bad_greeting'), 'detail' => str_trunc($text, 200)];
        }

        [$code, $text] = $cmd('EHLO ' . MAIL_DOMAIN, '250');
        if ($code !== 250) {
            return ['ok' => false, 'error' => ($code === 0 ? 'smtp_timeout' : 'ehlo_failed'), 'detail' => $text];
        }

        if (!$implicitTls && strpos($text, 'STARTTLS') !== false) {
            [$code, $text] = $cmd('STARTTLS', '220');
            if ($code !== 220) {
                return ['ok' => false, 'error' => ($code === 0 ? 'smtp_timeout' : 'starttls_failed'), 'detail' => $text];
            }
            if (!$startTls()) {
                return ['ok' => false, 'error' => 'tls_failed', 'detail' => 'STARTTLS-рукопожатие не удалось'];
            }
            [$code, $text] = $cmd('EHLO ' . MAIL_DOMAIN, '250');
            if ($code !== 250) {
                return ['ok' => false, 'error' => ($code === 0 ? 'smtp_timeout' : 'ehlo_after_tls_failed'), 'detail' => $text];
            }
        }

        [$code, $text] = $cmd('AUTH LOGIN', '334');
        if ($code !== 334) {
            return ['ok' => false, 'error' => ($code === 0 ? 'smtp_timeout' : 'auth_not_offered'), 'detail' => $text];
        }
        [$code, $text] = $cmd(base64_encode($cfg['user']), '334');
        if ($code !== 334) {
            return ['ok' => false, 'error' => ($code === 0 ? 'smtp_timeout' : 'auth_user_rejected'), 'detail' => $text];
        }
        [$code, $text] = $cmd(base64_encode($cfg['pass']), '235');
        if ($code !== 235) {
            return ['ok' => false, 'error' => ($code === 0 ? 'smtp_timeout' : 'auth_failed'), 'detail' => str_trunc('Логин или пароль SMTP не приняты сервером', 200)];
        }

        [$code, $text] = $cmd('MAIL FROM:<' . $cfg['from'] . '>', '250');
        if ($code !== 250) {
            return ['ok' => false, 'error' => ($code === 0 ? 'smtp_timeout' : 'mail_from_rejected'), 'detail' => $text];
        }
        [$code, $text] = $cmd('RCPT TO:<' . $to . '>', '250');
        if ($code !== 250 && $code !== 251) {
            return ['ok' => false, 'error' => ($code === 0 ? 'smtp_timeout' : 'rcpt_rejected'), 'detail' => $text];
        }
        [$code, $text] = $cmd('DATA', '354');
        if ($code !== 354) {
            return ['ok' => false, 'error' => ($code === 0 ? 'smtp_timeout' : 'data_rejected'), 'detail' => $text];
        }

        $subjectEnc = mail_subject_enc($subject);
        // SMTP-путь: To/Subject в заголовках DATA (в отличие от mail(),
        // которая добавляет их сама из своих аргументов)
        // c99: тело+заголовки — через mail_mime_parts (multipart при вложениях)
        // c100: + HTML-часть
        [$mimeHeaders, $mimeBody] = mail_mime_parts(
            mail_headers($cfg['from'], $replyTo),
            $bodyText,
            $attachments,
            $html
        );
        $headers = array_merge(
            ['To: ' . $to, 'Subject: ' . $subjectEnc],
            $mimeHeaders
        );
        /* Терминатор DATA — CRLF «.» CRLF: если тело уже заканчивается CRLF
         * (multipart закрывается «--b--\r\n»), НЕ добавляем второй — пустая
         * строка перед точкой стала бы лишней строкой письма. */
        $msg = implode("\r\n", $headers) . "\r\n\r\n" . $mimeBody;
        if (substr($mimeBody, -2) !== "\r\n") {
            $msg .= "\r\n";
        }
        $msg .= ".\r\n";
        /* c100: тело DATA — ЧАНКАМИ по 32КБ с дотяжкой частичных fwrite.
         * Одна fwrite на весь буфер под SO_SNDTIMEO возвращает ЧАСТЬ байт
         * (замер: 114271 из 343040) — раньше это был 'write_failed' и
         * mail()-фолбэк; теперь дотягиваем остаток, сверяя дедлайн письма
         * перед каждым окном. Окно 32КБ > типичного TLS-кадра (16КБ),
         * fwrite внутренними итерациями заполняет сокет сам. */
        $writeAll = static function (string $data) use ($fp, $tuneTimeout, $deadline): bool {
            $len = strlen($data);
            $off = 0;
            while ($off < $len) {
                if (!$tuneTimeout() || microtime(true) >= $deadline) {
                    return false;
                }
                $n = fwrite($fp, substr($data, $off, 32768));
                if ($n === false || $n <= 0) {
                    return false;
                }
                $off += $n;
            }
            return true;
        };
        if (!$writeAll($msg)) {
            return ['ok' => false, 'error' => 'write_failed',
                'detail' => 'fwrite: не удалось записать тело письма целиком (бюджет исчерпан или сокет закрыт)'];
        }
        [$code, $text] = $readCode();
        if ($code !== 250) {
            return ['ok' => false, 'error' => ($code === 0 ? 'smtp_timeout' : 'message_rejected'), 'detail' => $text];
        }
        @fwrite($fp, "QUIT\r\n");
        return ['ok' => true, 'error' => null, 'detail' => null];
    } finally {
        @fclose($fp);
    }
}

/**
 * c97 — ЕДИНАЯ точка отправки почты: SMTP (если настроен) → фолбэк
 * mail() → честный отказ. Каждая попытка пишется в журнал
 * (server-data/mail-log.json), который виден в админке — владелец
 * больше не узнаёт о нерабочей почте «неожиданно».
 *
 * $context — метка для журнала: 'lead-owner' | 'lead-client' | 'test'.
 * c99: + $attachments — [['bytes'=>…,'name'=>…,'entry'=>…]] из
 * menu_pdf_*(); оба транспорта получают одинаковое MIME-тело
 * (mail_mime_parts). Файл слишком большой/отсутствует — просто не
 * попадает в массив на уровне lead.php (там же журналируется пропуск).
 * c100: + $html — HTML-версия письма (multipart/alternative; null/'' —
 * только текст). В mail()-фолбэке тело переводится в LF и
 * dot-стаффинг снимается: sendmail сам перекодирует LF→CRLF и сам
 * стаффит точки при SMTP-транзите; с CRLF+престаффом некоторые MTA
 * выдавали «\r\r\n» на границе MIME → вложение терялось (наблюдалось
 * на проде c99: письмо клиенту приходило без PDF).
 * Возвращает ['ok'=>bool, 'transport'=>'smtp'|'mail'|'mail-fallback'|'none',
 * 'error'=>?string, 'detail'=>?string].
 * c98-FIX1 (критик2 E2): + 'smtpError' — исходный код ошибки SMTP
 * ('smtp_timeout'/'auth_failed'/…), если SMTP пробовался и провалился
 * (даже когда mail()-фолбэк спас письмо) — lead.php классифицирует канал
 * для решения о ретрае (dead/crit/retry).
 * c101: HTML-письмо автоматически получает inline-эмблему шапки
 * (mail_logo_attachment, multipart/related) — вызвать mail_send с $html
 * достаточно, CID синхронизирован с mail_html_wrap константой
 * MAIL_LOGO_CID. В журнале «вложение: N» считает только PDF — эмблема
 * служебная и в счётчик не попадает (mail_attach_count).
 */
function mail_send(string $to, string $subject, string $bodyText, ?string $replyTo = null, string $context = 'test', array $attachments = [], ?string $html = null): array
{
    /* c101: эмблема шапки для всех HTML-писем (владелец/клиент/тест) —
     * один и тот же CID для HTML-ссылки и MIME-части. */
    if ($html !== null && $html !== '') {
        $logo = mail_logo_attachment();
        if ($logo !== null) {
            $attachments[] = $logo;
        }
    }
    if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        $r = ['ok' => false, 'transport' => 'none', 'error' => 'invalid_recipient', 'detail' => $to, 'smtpError' => null];
        mail_log_append(['to' => str_trunc($to, 120), 'context' => $context, 'subject' => str_trunc($subject, 100),
            'transport' => 'none', 'ok' => false, 'error' => 'invalid_recipient',
            'attach' => mail_attach_count($attachments)]);
        return $r;
    }

    $settings = load_settings();
    $secrets = load_secrets(false);
    $smtp = smtp_config($settings);

    if ($smtp !== null) {
        $r = smtp_send($smtp, $to, $subject, $bodyText, $replyTo, $attachments, $html);
        if ($r['ok'] === true) {
            mail_log_append(['to' => $to, 'context' => $context, 'subject' => str_trunc($subject, 100),
                'transport' => 'smtp', 'ok' => true, 'error' => null, 'attach' => mail_attach_count($attachments)]);
            return ['ok' => true, 'transport' => 'smtp', 'error' => null, 'detail' => null, 'smtpError' => null];
        }
        // SMTP настроен, но не сработал (пароль/сеть) — НЕ теряем письмо:
        // пробуем mail() сервера, обе попытки в журнале.
        mail_log_append(['to' => $to, 'context' => $context, 'subject' => str_trunc($subject, 100),
            'transport' => 'smtp', 'ok' => false, 'error' => str_trunc((string)$r['error'], 100),
            'detail' => str_trunc((string)($r['detail'] ?? ''), 200), 'attach' => mail_attach_count($attachments)]);
    }

    /* mail()-путь: sendmail хостинга. c97 — с Date/Message-ID (без них
     * Gmail кладёт в спам или молча отбраковывает — главный подозреваемый
     * в «почта не работает» у владельца). c99 — с вложениями: mail()
     * принимает СБОРКУ MIME-заголовков 4-м аргументом; тело — подготовленный
     * mail_mime_parts (multipart при вложениях, плоский text/plain без).
     * c100 — LF-нормализация: PHP docs прямо предупреждают — «some Unix
     * MTAs replace LF by CRLF incorrectly (doubled CR)»; удвоенный CR на
     * MIME-границе ломает распознавание вложения. sendmail сам ставит CRLF
     * при SMTP-транзите, и сам делает dot-stuffing — престафф и CRLF из
     * тела снимаем. SMTP-путь остаётся байт-точным CRLF (RFC 5321). */
    if (!function_exists('mail')) {
        mail_log_append(['to' => $to, 'context' => $context, 'subject' => str_trunc($subject, 100),
            'transport' => 'none', 'ok' => false, 'error' => 'mail_disabled', 'detail' => 'mail() отключена на хостинге, SMTP не настроен', 'attach' => mail_attach_count($attachments)]);
        return ['ok' => false, 'transport' => 'none', 'error' => 'mail_disabled',
            'detail' => 'Функция mail() отключена на хостинге; настройте SMTP в разделе «Почта»',
            'smtpError' => (($smtp !== null && !($r['ok'] ?? true)) ? (string)$r['error'] : null)];
    }

    $from = (string)($secrets['notify_from'] ?: 'noreply@' . MAIL_DOMAIN);
    if ($smtp !== null && $smtp['from'] !== '') {
        $from = $smtp['from']; // выравнивание From с SMTP-ящиком
    }
    // mail() сама ставит To/Subject из аргументов — в заголовках их НЕ дублируем
    [$mimeHeaders, $mimeBody] = mail_mime_parts(
        mail_headers($from, $replyTo),
        $bodyText,
        $attachments,
        $html
    );
    /* LF-вариант для mail(): заголовки «\n», тело CRLF→LF + снятие
     * dot-stuffing (сделает MTA). ТЕМА: PHP mail() переписывает переводы
     * строк в пробел — CRLF-фолдинг дал бы ДВОЙНОЙ пробел между
     * encoded-words (RFC 2047 сворачивает только один LWSP): «Форм  ат».
     * Поэтому между encoded-words — один пробел: и RFC-совместимо, и
     * PHP ничего не портит. */
    $lfBody = preg_replace('/^\.\./m', '.', str_replace("\r\n", "\n", $mimeBody));
    $lfHeaders = implode("\n", $mimeHeaders);
    $lfSubject = str_replace("\r\n ", " ", mail_subject_enc($subject));
    $ok = @mail($to, $lfSubject, $lfBody, $lfHeaders);

    $transport = ($smtp !== null) ? 'mail-fallback' : 'mail';
    mail_log_append(['to' => $to, 'context' => $context, 'subject' => str_trunc($subject, 100),
        'transport' => $transport, 'ok' => (bool)$ok,
        'error' => $ok ? null : 'mail() вернула false (sendmail не принял письмо)',
        'attach' => mail_attach_count($attachments)]);
    return [
        'ok' => (bool)$ok,
        'transport' => $transport,
        'error' => $ok ? null : 'mail_failed',
        'detail' => $ok ? null : ($smtp !== null
            ? 'SMTP не сработал (' . str_trunc((string)($r['error'] ?? '?'), 120) . '), sendmail тоже не принял письмо'
            : 'sendmail хостинга не принял письмо'),
        // c98-FIX1 (критик2 E2): причина провала SMTP — класс ретрая в lead.php
        'smtpError' => (($smtp !== null && !($r['ok'] ?? true)) ? (string)$r['error'] : null),
    ];
}

/**
 * c95-легаси-обёртка (использовалась в lead.php до c97) — теперь через
 * mail_send(). Оставлена для совместимости смоук-тестов.
 */
function mail_notify(string $to, string $subject, string $bodyText, ?string $replyTo = null, ?string $from = null): bool
{
    $r = mail_send($to, $subject, $bodyText, $replyTo, 'legacy');
    return $r['ok'] === true;
}
