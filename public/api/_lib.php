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
        $new = $fn(is_array($arr) ? $arr : []);
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
        // c96: последняя рабочая база Bot API — сервер запоминает её после
        // первого успешного вызова (владелец развернул воркер / ожил прямой
        // api.telegram.org), чтобы каждый следующий вызов не платил
        // 5–7-секундным таймаутом на мёртвой базе. Пишется только сервером
        // (tg_remember_working_base), в UI — read-only.
        'tgWorkingBase' => null,
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
    return $merged;
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
 * Для POST дополнительно обязателен кастомный заголовок
 * X-Requested-With: XMLHttpRequest — кросс-доменный fetch с кастомным
 * заголовком требует preflight, который наш сервер не разрешает.
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
        $transportFail = $r['errno'] !== 0 || $r['status'] === 0 || $r['status'] >= 500;
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
 * c96 — sendMessage с перебором баз и запоминанием рабочей: замена tg_send
 * в прод-путях (lead.php, админ-мастер). Возвращает как tg_send плюс
 * 'tried' (диагностика сетевых неудач) и 'base' на успехе.
 */
function tg_send_fb(string $token, array $bases, string $chatId, string $html): array
{
    $html = str_trunc($html, 3800); // лимит TG 4096 после парсинга — берём запас
    $r = tg_api_try($token, $bases, 'sendMessage', [
        'chat_id' => $chatId,
        'text' => $html,
        'parse_mode' => 'HTML',
        'link_preview_options' => ['is_disabled' => true],
    ]);
    if ($r['errno'] !== 0 || $r['status'] === 0) {
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
 */
function tg_send(string $token, string $apiBase, string $chatId, string $html): array
{
    $html = str_trunc($html, 3800); // лимит TG 4096 после парсинга — берём запас
    $r = tg_api($token, $apiBase, 'sendMessage', [
        'chat_id' => $chatId,
        'text' => $html,
        'parse_mode' => 'HTML',
        'link_preview_options' => ['is_disabled' => true],
    ]);
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

/**
 * Уведомление по mail() (SpaceWeb: sendmail, From — ящик домена,
 * см. R-REPORT §3). Тема кодируется =?UTF-8?B?…?=, клиент в Reply-To.
 */
function mail_notify(string $to, string $subject, string $bodyText, ?string $replyTo = null, ?string $from = null): bool
{
    /* c95: guard — на хостинге mail() может быть отключена (тестовый период,
     * лимиты, политика хостера); локальные статические сборки PHP тоже могут
     * её не иметь. Тихая деградация: заявка уже сохранена в JSON. */
    if (!function_exists('mail')) {
        return false;
    }
    if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    $from = ($from !== null && $from !== '') ? $from : 'noreply@nilovcatering.ru';
    $headers = [
        'From: Nilov Catering <' . $from . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];
    if ($replyTo !== null && $replyTo !== '' && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $headers[] = 'Reply-To: ' . $replyTo;
    }
    // тело: нормализуем переводы строк к CRLF (RFC 5322)
    $body = str_replace(["\r\n", "\r"], "\n", $bodyText);
    $body = str_replace("\n", "\r\n", $body);
    $subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    return @mail($to, $subject, $body, implode("\r\n", $headers));
}
