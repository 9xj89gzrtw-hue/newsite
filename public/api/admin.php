<?php
declare(strict_types=1);

/**
 * c95 — единственный эндпоинт админки: /api/admin.php?action=<действие>.
 *
 * Аутентификация: пароль (bcrypt, secrets.password_hash_default или
 * settings.passwordHash после смены через UI) → HMAC-cookie nilov_admin
 * (12 ч, Secure+HttpOnly+SameSite=Strict — SSL терминирует nginx).
 *
 * Данные меню живут в GitHub (Contents API, ветка main), публикация —
 * деплой-воркфлоу CI; статус деплоя — Actions runs по head_sha.
 *
 * Все ответы — JSON + X-Robots-Tag: noindex. Методы: POST, кроме GET-действий
 * session / data / status / leads / settings(чтение).
 */

define('NILOV_API', true);
require __DIR__ . '/_lib.php';

header('X-Robots-Tag: noindex, nofollow');

@set_time_limit(90);

$method = is_string($_SERVER['REQUEST_METHOD'] ?? null) ? $_SERVER['REQUEST_METHOD'] : 'GET';
$action = is_string($_GET['action'] ?? null) ? $_GET['action'] : '';

match ($action) {
    'login' => h_login($method),
    'logout' => h_logout($method),
    'session' => h_session($method),
    'data' => h_data($method),
    'save' => h_save($method),
    'status' => h_status($method),
    'leads' => h_leads($method),
    'lead-update' => h_lead_update($method),
    'lead-delete' => h_lead_delete($method),
    'settings' => h_settings($method),
    'tg-check' => h_tg_check($method),
    'tg-discover' => h_tg_discover($method),
    'tg-test' => h_tg_test($method),
    'password' => h_password($method),
    default => json_response(404, ['ok' => false, 'error' => 'unknown_action']),
};

/* ========================= действия роутера ========================== */

/** action=login: пароль → сессионная cookie на 12 ч. */
function h_login(string $method): void
{
    if ($method !== 'POST') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed']);
    }
    if (!rl_check('login', 8, 900)) { // брутфорс: 8 попыток / 15 мин на IP
        json_response(429, ['ok' => false, 'error' => 'locked', 'retryAfterSec' => rl_last_retry_after()]);
    }
    $body = read_json_body_or_400(8192);
    $password = $body['password'] ?? null;
    if (!is_string($password) || $password === '') {
        json_response(400, ['ok' => false, 'error' => 'validation', 'detail' => 'Укажите пароль']);
    }
    $secrets = load_secrets(); // 500 not_configured, если секретов нет
    $settings = load_settings();
    $hash = (string)($settings['passwordHash'] ?: $secrets['password_hash_default']);
    $key = (string)$secrets['hmac_key'];
    if ($hash === '' || strlen($key) < 32) {
        json_response(500, ['ok' => false, 'error' => 'not_configured']);
    }
    if (!password_verify($password, $hash)) {
        usleep(400000); // равномерная задержка на неудаче (анти-брутфорс)
        json_response(401, ['ok' => false, 'error' => 'bad_password']);
    }
    $exp = time() + SESSION_TTL_SEC;
    set_admin_cookie($exp, $key);
    json_response(200, ['ok' => true, 'expiresAt' => $exp]);
}

/** action=logout: сброс cookie. Без авторизации. */
function h_logout(string $method): void
{
    if ($method !== 'POST') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed']);
    }
    clear_admin_cookie();
    json_response(200, ['ok' => true]);
}

/** action=session (GET): 200 + expiresAt | 401. */
function h_session(string $method): void
{
    if ($method !== 'GET') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed']);
    }
    $exp = current_session();
    if ($exp === null) {
        json_response(401, ['ok' => false, 'error' => 'unauthorized']);
    }
    json_response(200, ['ok' => true, 'expiresAt' => $exp]);
}

/** action=data (GET, auth): menu.json из GitHub + его sha (для контроля конфликтов). */
function h_data(string $method): void
{
    if ($method !== 'GET') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed']);
    }
    require_admin();
    $secrets = load_secrets();
    $path = gh_encode_path((string)$secrets['gh_path']);
    $r = gh_api('GET', '/repos/' . $secrets['gh_repo'] . '/contents/' . $path . '?ref=main', null, (string)$secrets['gh_token']);
    if ($r['errno'] !== 0 && $r['status'] === 0) {
        json_response(502, ['ok' => false, 'error' => 'network']);
    }
    if ($r['status'] !== 200) {
        json_response(502, ['ok' => false, 'error' => 'github', 'status' => $r['status']]);
    }
    $content = $r['data']['content'] ?? null;
    $sha = $r['data']['sha'] ?? null;
    if (!is_string($content) || !is_string($sha)) {
        json_response(502, ['ok' => false, 'error' => 'github', 'detail' => 'no_content']);
    }
    // GitHub отдаёт base64 с переносами строк каждые 60 символов
    $json = base64_decode(str_replace("\n", '', $content), true);
    if ($json === false) {
        json_response(502, ['ok' => false, 'error' => 'github', 'detail' => 'invalid_base64']);
    }
    $menu = json_decode($json, true);
    if (!is_array($menu)) {
        json_response(502, ['ok' => false, 'error' => 'github', 'detail' => 'invalid_json']);
    }
    json_response(200, [
        'ok' => true,
        'menu' => $menu,
        'sha' => $sha,
        'repo' => (string)$secrets['gh_repo'],
        'path' => (string)$secrets['gh_path'],
    ]);
}

/** action=save (POST, auth): валидация → PUT в GitHub (обновление/создание). */
function h_save(string $method): void
{
    if ($method !== 'POST') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed']);
    }
    require_admin();
    $secrets = load_secrets();
    $body = read_json_body_or_400(786432);

    $menu = $body['menu'] ?? null;
    if (!is_array($menu)) {
        json_response(400, ['ok' => false, 'error' => 'validation', 'detail' => 'menu: ожидается объект меню']);
    }
    $message = $body['message'] ?? null;
    if ($message !== null && (!is_string($message) || slen($message) > 200)) {
        json_response(400, ['ok' => false, 'error' => 'validation', 'detail' => 'message: до 200 символов']);
    }
    $clientSha = $body['sha'] ?? null;
    if ($clientSha !== null && !is_string($clientSha)) {
        json_response(400, ['ok' => false, 'error' => 'validation', 'detail' => 'sha: строка или null']);
    }

    $repo = (string)$secrets['gh_repo'];
    $path = gh_encode_path((string)$secrets['gh_path']);

    // 1) актуальный sha из GitHub — клиентскому не доверяем
    $r = gh_api('GET', '/repos/' . $repo . '/contents/' . $path . '?ref=main', null, (string)$secrets['gh_token']);
    if ($r['errno'] !== 0 && $r['status'] === 0) {
        json_response(502, ['ok' => false, 'error' => 'network']);
    }
    if ($r['status'] === 200) {
        $currentSha = is_string($r['data']['sha'] ?? null) ? $r['data']['sha'] : null;
        if ($currentSha === null) {
            json_response(502, ['ok' => false, 'error' => 'github', 'detail' => 'no_sha']);
        }
    } elseif ($r['status'] === 404) {
        $currentSha = null; // файла ещё нет — будет create (sha не нужен)
    } else {
        json_response(502, ['ok' => false, 'error' => 'github', 'status' => $r['status']]);
    }
    if ($currentSha !== $clientSha) {
        // файл менялся после загрузки (или клиент не читал его) — пусть перезагрузит
        json_response(409, ['ok' => false, 'error' => 'conflict']);
    }

    // 2) серверная структурная валидация (отсечь мусор до коммита)
    $err = validate_menu($menu);
    if ($err !== null) {
        json_response(400, ['ok' => false, 'error' => 'validation', 'detail' => $err]);
    }

    // 3) PUT contents (commit в main; дальше публикует деплой-воркфлоу)
    $json = json_encode(
        $menu,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_INVALID_UTF8_SUBSTITUTE
    );
    if ($json === false) {
        json_response(500, ['ok' => false, 'error' => 'encode_failed']);
    }
    $msg = (is_string($message) && trim($message) !== '') ? trim($message) : 'обновление меню и цен';
    $put = [
        'message' => 'chore(admin): ' . $msg,
        'branch' => 'main',
        'content' => base64_encode($json),
    ];
    if ($currentSha !== null) {
        $put['sha'] = $currentSha; // обязателен при обновлении (R-REPORT §2)
    }
    $r2 = gh_api('PUT', '/repos/' . $repo . '/contents/' . $path, $put, (string)$secrets['gh_token']);
    if ($r2['errno'] !== 0 && $r2['status'] === 0) {
        json_response(502, ['ok' => false, 'error' => 'network']);
    }
    if ($r2['status'] === 200 || $r2['status'] === 201) {
        $commit = $r2['data']['commit'] ?? [];
        json_response(200, [
            'ok' => true,
            'commitSha' => is_array($commit) && is_string($commit['sha'] ?? null) ? $commit['sha'] : null,
            'htmlUrl' => is_array($commit) && is_string($commit['html_url'] ?? null) ? $commit['html_url'] : null,
        ]);
    }
    if ($r2['status'] === 409) {
        json_response(409, ['ok' => false, 'error' => 'conflict']);
    }
    if ($r2['status'] === 422) {
        json_response(400, ['ok' => false, 'error' => 'github', 'status' => 422, 'detail' => 'unprocessable']);
    }
    json_response(502, ['ok' => false, 'error' => 'github', 'status' => $r2['status']]);
}

/** action=status (GET, auth, &sha=): состояние деплоя коммита + lastDeployed. */
function h_status(string $method): void
{
    if ($method !== 'GET') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed']);
    }
    require_admin();
    $secrets = load_secrets();
    $sha = $_GET['sha'] ?? '';
    if (!is_string($sha) || preg_match('/^[0-9a-f]{7,40}$/i', $sha) !== 1) {
        json_response(400, ['ok' => false, 'error' => 'validation', 'detail' => 'sha: hex 7–40 символов']);
    }
    $r = gh_api('GET', '/repos/' . $secrets['gh_repo'] . '/actions/runs?per_page=10&head_sha=' . rawurlencode($sha), null, (string)$secrets['gh_token']);
    if ($r['errno'] !== 0 && $r['status'] === 0) {
        json_response(502, ['ok' => false, 'error' => 'network']);
    }
    if ($r['status'] !== 200) {
        json_response(502, ['ok' => false, 'error' => 'github', 'status' => $r['status']]);
    }
    $resp = ['ok' => true, 'state' => 'unknown'];
    $runs = $r['data']['workflow_runs'] ?? [];
    if (is_array($runs)) {
        foreach ($runs as $run) { // API отдаёт новые сверху — первый матч = последний
            if (!is_array($run) || ($run['head_sha'] ?? '') !== $sha) {
                continue;
            }
            $st = (string)($run['status'] ?? '');
            if ($st === 'queued' || $st === 'in_progress') {
                $resp['state'] = 'building';
            } elseif ($st === 'completed') {
                $resp['state'] = (($run['conclusion'] ?? null) === 'success') ? 'success' : 'failure';
            }
            if (!empty($run['html_url'])) {
                $resp['htmlUrl'] = (string)$run['html_url'];
            }
            if (!empty($run['created_at'])) {
                $resp['runStartedAt'] = (string)$run['created_at'];
            }
            break;
        }
    }
    // lastDeployed: время файла в статик-экспорте (public/data/menu.json)
    $menuFile = __DIR__ . '/../data/menu.json';
    $resp['deployedAt'] = is_file($menuFile) ? gmdate('c', (int)filemtime($menuFile)) : null;
    json_response(200, $resp);
}

/** action=leads (GET, auth, &limit=1..500&offset): заявки, новые сверху. */
function h_leads(string $method): void
{
    if ($method !== 'GET') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed']);
    }
    require_admin();
    $limit = (int)($_GET['limit'] ?? 200);
    $offset = (int)($_GET['offset'] ?? 0);
    $limit = max(1, min(500, $limit));
    $offset = max(0, $offset);
    $leads = read_json_file(leads_path()) ?? [];
    $leads = array_values(array_filter($leads, 'is_array'));
    usort($leads, static fn (array $a, array $b): int => (int)($b['ts'] ?? 0) <=> (int)($a['ts'] ?? 0));
    json_response(200, [
        'ok' => true,
        'total' => count($leads),
        'leads' => array_values(array_slice($leads, $offset, $limit)),
    ]);
}

/** action=lead-update (POST, auth, {id, read?, archived?}). */
function h_lead_update(string $method): void
{
    if ($method !== 'POST') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed']);
    }
    require_admin();
    $body = read_json_body_or_400(8192);
    $id = $body['id'] ?? null;
    if (!is_string($id) || strlen($id) > 40) {
        json_response(400, ['ok' => false, 'error' => 'validation', 'detail' => 'id обязателен']);
    }
    $patch = [];
    if (array_key_exists('read', $body)) {
        if (!is_bool($body['read'])) {
            json_response(400, ['ok' => false, 'error' => 'validation', 'detail' => 'read: bool']);
        }
        $patch['read'] = $body['read'];
    }
    if (array_key_exists('archived', $body)) {
        if (!is_bool($body['archived'])) {
            json_response(400, ['ok' => false, 'error' => 'validation', 'detail' => 'archived: bool']);
        }
        $patch['archived'] = $body['archived'];
    }
    if ($patch === []) {
        json_response(400, ['ok' => false, 'error' => 'validation', 'detail' => 'нечего обновлять']);
    }
    $found = false;
    $ok = update_json_file(leads_path(), static function (array $leads) use ($id, $patch, &$found): ?array {
        foreach ($leads as $i => $l) {
            if (is_array($l) && ($l['id'] ?? null) === $id) {
                $found = true;
                $leads[$i] = array_merge($l, $patch);
                return $leads;
            }
        }
        return null; // не нашли — запись отменяется
    });
    if (!$found) {
        json_response(404, ['ok' => false, 'error' => 'not_found']);
    }
    if (!$ok) {
        json_response(500, ['ok' => false, 'error' => 'storage']);
    }
    json_response(200, ['ok' => true]);
}

/** action=lead-delete (POST, auth, {id}). */
function h_lead_delete(string $method): void
{
    if ($method !== 'POST') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed']);
    }
    require_admin();
    $body = read_json_body_or_400(8192);
    $id = $body['id'] ?? null;
    if (!is_string($id) || strlen($id) > 40) {
        json_response(400, ['ok' => false, 'error' => 'validation', 'detail' => 'id обязателен']);
    }
    $found = false;
    $ok = update_json_file(leads_path(), static function (array $leads) use ($id, &$found): ?array {
        foreach ($leads as $i => $l) {
            if (is_array($l) && ($l['id'] ?? null) === $id) {
                $found = true;
                array_splice($leads, $i, 1);
                return $leads;
            }
        }
        return null;
    });
    if (!$found) {
        json_response(404, ['ok' => false, 'error' => 'not_found']);
    }
    if (!$ok) {
        json_response(500, ['ok' => false, 'error' => 'storage']);
    }
    json_response(200, ['ok' => true]);
}

/** action=settings: GET (auth) — чтение; POST (auth) — обновление. */
function h_settings(string $method): void
{
    if ($method === 'GET') {
        require_admin();
        $s = load_settings();
        json_response(200, ['ok' => true, 'settings' => [
            'notifyEmail' => $s['notifyEmail'],
            'tgChatId' => $s['tgChatId'],
            'tgApiBase' => $s['tgApiBase'],
            'botTokenSet' => is_string($s['tgBotToken']) && $s['tgBotToken'] !== '',
            'botTokenMasked' => mask_bot_token($s['tgBotToken']),
        ]]);
    }
    if ($method !== 'POST') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed']);
    }
    require_admin();
    $body = read_json_body_or_400(16384);
    $s = load_settings();
    $bad = static function (string $detail): never {
        json_response(400, ['ok' => false, 'error' => 'validation', 'detail' => $detail]);
    };

    if (array_key_exists('notifyEmail', $body)) {
        $v = $body['notifyEmail'];
        if ($v === null || $v === '') {
            $s['notifyEmail'] = null;
        } elseif (is_string($v) && strlen($v) <= 120 && filter_var($v, FILTER_VALIDATE_EMAIL)) {
            $s['notifyEmail'] = $v;
        } else {
            $bad('notifyEmail: некорректный email');
        }
    }
    if (array_key_exists('tgChatId', $body)) {
        $v = $body['tgChatId'];
        if ($v === null || $v === '') {
            $s['tgChatId'] = null;
        } elseif ((is_string($v) || is_int($v))) {
            $sv = trim((string)$v);
            if ($sv === '' || strlen($sv) > 32) {
                $bad('tgChatId: до 32 символов');
            }
            $s['tgChatId'] = $sv;
        } else {
            $bad('tgChatId: строка или число');
        }
    }
    if (array_key_exists('tgApiBase', $body)) {
        $v = $body['tgApiBase'];
        if ($v === null || $v === '') {
            $s['tgApiBase'] = null;
        } elseif (is_string($v) && str_starts_with($v, 'https://') && strlen($v) <= 200) {
            $s['tgApiBase'] = rtrim($v, '/');
        } else {
            $bad('tgApiBase: должен начинаться с https://');
        }
    }
    if (array_key_exists('tgBotToken', $body)) {
        $v = $body['tgBotToken'];
        if ($v !== null && $v !== '') {
            if (!is_string($v) || preg_match(TG_TOKEN_RE, $v) !== 1) {
                $bad('tgBotToken: формат 123456789:AA…');
            }
            $s['tgBotToken'] = $v;
        }
    }
    if (!empty($body['clearBotToken'])) {
        $s['tgBotToken'] = null;
    }
    if (!save_settings($s)) {
        json_response(500, ['ok' => false, 'error' => 'storage']);
    }
    json_response(200, ['ok' => true]);
}

/** action=tg-check (POST, auth, {token?}): getMe — валиден ли токен. */
function h_tg_check(string $method): void
{
    if ($method !== 'POST') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed']);
    }
    require_admin();
    $body = read_json_body_or_400(8192);
    $secrets = load_secrets(false);
    $s = load_settings();
    $apiBase = (string)($s['tgApiBase'] ?: ($secrets['tg_api_base'] ?: 'https://api.telegram.org'));
    $token = null;
    if (is_string($body['token'] ?? null) && preg_match(TG_TOKEN_RE, $body['token']) === 1) {
        $token = $body['token'];
    }
    if ($token === null) {
        $token = is_string($s['tgBotToken']) ? $s['tgBotToken'] : null;
    }
    if ($token === null || $token === '') {
        json_response(400, ['ok' => false, 'error' => 'no_token']);
    }
    $r = tg_api($token, $apiBase, 'getMe', null);
    if ($r['errno'] !== 0 || $r['status'] === 0) {
        json_response(200, ['ok' => false, 'error' => 'network']);
    }
    if ($r['status'] === 401 || $r['status'] === 404) {
        json_response(200, ['ok' => false, 'error' => 'unauthorized']);
    }
    if ($r['status'] === 200 && is_array($r['data']) && ($r['data']['ok'] ?? null) === true) {
        $res = $r['data']['result'] ?? [];
        json_response(200, [
            'ok' => true,
            'botName' => is_array($res) && is_string($res['first_name'] ?? null) ? $res['first_name'] : null,
            'botUsername' => is_array($res) && is_string($res['username'] ?? null) ? $res['username'] : null,
        ]);
    }
    json_response(200, ['ok' => false, 'error' => 'network']);
}

/** action=tg-discover (POST, auth): getUpdates → список чатов для выбора. */
function h_tg_discover(string $method): void
{
    if ($method !== 'POST') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed']);
    }
    require_admin();
    $secrets = load_secrets(false);
    $s = load_settings();
    $token = is_string($s['tgBotToken']) ? $s['tgBotToken'] : '';
    if ($token === '') {
        json_response(400, ['ok' => false, 'error' => 'no_token']);
    }
    $apiBase = (string)($s['tgApiBase'] ?: ($secrets['tg_api_base'] ?: 'https://api.telegram.org'));
    $r = tg_api($token, $apiBase, 'getUpdates', null);
    if ($r['errno'] !== 0 || $r['status'] === 0) {
        json_response(200, ['ok' => false, 'error' => 'network']);
    }
    if ($r['status'] === 401 || $r['status'] === 404) {
        json_response(200, ['ok' => false, 'error' => 'unauthorized']);
    }
    if ($r['status'] !== 200 || !is_array($r['data']) || ($r['data']['ok'] ?? null) !== true) {
        json_response(502, ['ok' => false, 'error' => 'tg_error', 'status' => $r['status']]);
    }
    $chats = [];
    $result = $r['data']['result'] ?? [];
    if (is_array($result)) {
        foreach ($result as $upd) {
            if (!is_array($upd)) {
                continue;
            }
            // достаточно message/channel_post (личка/группа/канал)
            $msg = $upd['message'] ?? $upd['channel_post'] ?? null;
            if (!is_array($msg) || !is_array($msg['chat'] ?? null)) {
                continue;
            }
            $chat = $msg['chat'];
            $cid = $chat['id'] ?? null;
            if ($cid === null || isset($chats[(string)$cid])) {
                continue;
            }
            $name = $chat['title'] ?? $chat['first_name'] ?? $chat['username'] ?? null;
            $chats[(string)$cid] = [
                'id' => (string)$cid,
                'name' => is_string($name) ? $name : ('chat ' . (string)$cid),
                'type' => is_string($chat['type'] ?? null) ? $chat['type'] : 'unknown',
            ];
        }
    }
    $out = array_values($chats);
    $resp = ['ok' => true, 'chats' => $out];
    if ($out === []) {
        $resp['hint'] = 'Напишите боту любое сообщение и повторите';
    }
    json_response(200, $resp);
}

/** action=tg-test (POST, auth, {chatId?, token?}): тестовое sendMessage. */
function h_tg_test(string $method): void
{
    if ($method !== 'POST') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed']);
    }
    require_admin();
    $body = read_json_body_or_400(8192);
    $secrets = load_secrets(false);
    $s = load_settings();
    $token = null;
    if (is_string($body['token'] ?? null) && preg_match(TG_TOKEN_RE, $body['token']) === 1) {
        $token = $body['token'];
    }
    if ($token === null) {
        $token = is_string($s['tgBotToken']) ? $s['tgBotToken'] : null;
    }
    if ($token === null || $token === '') {
        json_response(400, ['ok' => false, 'error' => 'no_token']);
    }
    $chatId = $body['chatId'] ?? null;
    if ($chatId === null || $chatId === '') {
        $chatId = $s['tgChatId'];
    }
    if (!is_string($chatId) || $chatId === '' || strlen($chatId) > 32) {
        json_response(400, ['ok' => false, 'error' => 'no_chat_id']);
    }
    $apiBase = (string)($s['tgApiBase'] ?: ($secrets['tg_api_base'] ?: 'https://api.telegram.org'));
    $r = tg_send($token, $apiBase, $chatId, '<b>Тест связи</b> — уведомления о заявках работают ✅');
    if ($r['ok'] === true) {
        json_response(200, ['ok' => true]);
    }
    $resp = ['ok' => false, 'error' => $r['error'] ?? 'tg_error'];
    if (isset($r['retryAfterSec'])) {
        $resp['retryAfterSec'] = $r['retryAfterSec'];
    }
    json_response(200, $resp);
}

/** action=password (POST, auth, {current, new}): смена пароля админки. */
function h_password(string $method): void
{
    if ($method !== 'POST') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed']);
    }
    require_admin();
    if (!rl_check('pwchange', 5, 3600)) {
        json_response(429, ['ok' => false, 'error' => 'locked', 'retryAfterSec' => rl_last_retry_after()]);
    }
    $body = read_json_body_or_400(16384);
    $current = $body['current'] ?? null;
    $new = $body['new'] ?? null;
    if (!is_string($current) || $current === '') {
        json_response(400, ['ok' => false, 'error' => 'validation', 'detail' => 'Укажите текущий пароль']);
    }
    if (!is_string($new) || strlen($new) < 8 || strlen($new) > 128) {
        json_response(400, ['ok' => false, 'error' => 'validation', 'detail' => 'Новый пароль: 8–128 символов']);
    }
    $secrets = load_secrets();
    $s = load_settings();
    $hash = (string)($s['passwordHash'] ?: $secrets['password_hash_default']);
    if ($hash === '' || !password_verify($current, $hash)) {
        usleep(400000);
        json_response(401, ['ok' => false, 'error' => 'bad_password']);
    }
    $s['passwordHash'] = password_hash($new, PASSWORD_BCRYPT, ['cost' => 12]);
    if (!save_settings($s)) {
        json_response(500, ['ok' => false, 'error' => 'storage']);
    }
    json_response(200, ['ok' => true]);
}

/* ============================ хелперы ================================= */

/** Маскировка токена для UI: «1234…ABCD». Полный токен наружу не отдаём. */
function mask_bot_token(mixed $token): ?string
{
    if (!is_string($token) || $token === '') {
        return null;
    }
    $len = strlen($token);
    if ($len <= 12) {
        return substr($token, 0, 4) . '…';
    }
    return substr($token, 0, 4) . '…' . substr($token, -4);
}

/**
 * Серверная структурная валидация menu.json перед коммитом.
 * null = ок; строка = человекочитаемая ошибка (RU).
 *
 * Жёстко проверяем каркас (типы/пакеты/цены — то, что ломает сайт);
 * addons/minOrder/servicePanels проверяются по типу и объёму там, где
 * присутствуют (корень или тип), их детальная схема принадлежит слою данных.
 */
function validate_menu(array $menu): ?string
{
    $json = json_encode($menu, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (!is_string($json)) {
        return 'Меню не сериализуется в JSON';
    }
    if (strlen($json) > 400 * 1024) {
        return 'Файл меню слишком большой (больше 400 КБ)';
    }
    $types = $menu['menuTypes'] ?? null;
    if (!is_array($types) || count($types) < 1 || count($types) > 12) {
        return 'menuTypes: должен быть массивом из 1–12 форматов кейтеринга';
    }
    $seenIds = [];
    foreach ($types as $ti => $t) {
        $n = 'Формат №' . ($ti + 1);
        if (!is_array($t)) {
            return $n . ': должен быть объектом';
        }
        $id = $t['id'] ?? null;
        if (!is_string($id) || trim($id) === '' || strlen($id) > 64) {
            return $n . ': пустой или слишком длинный id';
        }
        if (in_array($id, $seenIds, true)) {
            return 'Дубликат id формата: ' . $id;
        }
        $seenIds[] = $id;
        $n = 'Формат «' . $id . '»';
        $label = $t['label'] ?? null;
        if (!is_string($label) || trim($label) === '' || slen($label) > 120) {
            return $n . ': пустой или слишком длинный label';
        }
        $pkgs = $t['packages'] ?? null;
        if (!is_array($pkgs) || count($pkgs) < 1 || count($pkgs) > 6) {
            return $n . ': packages должен содержать 1–6 пакетов';
        }
        foreach ($pkgs as $pi => $p) {
            $pn = $n . ', пакет №' . ($pi + 1);
            if (!is_array($p)) {
                return $pn . ': должен быть объектом';
            }
            $name = $p['name'] ?? null;
            if (!is_string($name) || trim($name) === '' || slen($name) > 120) {
                return $pn . ': пустое или слишком длинное name';
            }
            $price = $p['pricePerGuest'] ?? null;
            if (!is_numeric($price)) {
                return $pn . ' («' . $name . '»): pricePerGuest должен быть числом';
            }
            if ((float)$price < 100 || (float)$price > 100000) {
                return $pn . ' («' . $name . '»): pricePerGuest должен быть от 100 до 100 000';
            }
        }
        if (isset($t['addons'])) {
            if (!is_array($t['addons'])) {
                return $n . ': addons должен быть массивом';
            }
            if (count($t['addons']) > 20) {
                return $n . ': слишком много допуслуг (максимум 20)';
            }
        }
        if (isset($t['minOrder']) && !is_array($t['minOrder'])) {
            return $n . ': minOrder должен быть объектом';
        }
    }
    if (isset($menu['addons'])) {
        if (!is_array($menu['addons'])) {
            return 'addons (корень): должен быть массивом';
        }
        if (count($menu['addons']) > 20) {
            return 'Слишком много допуслуг в корне (максимум 20)';
        }
    }
    if (isset($menu['minOrder']) && !is_array($menu['minOrder'])) {
        return 'minOrder (корень): должен быть объектом';
    }
    if (isset($menu['servicePanels'])) {
        if (!is_array($menu['servicePanels'])) {
            return 'servicePanels: должен быть массивом';
        }
        if (count($menu['servicePanels']) > 12) {
            return 'Слишком много сервисных панелей (максимум 12)';
        }
    }
    return null;
}
