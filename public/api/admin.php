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

// CSRF defense-in-depth: первичная защита — SameSite=Strict на сессионной
// cookie; этот барьер (Origin-allowlist + XRW для POST) — бэкстоп для
// легаси-браузеров без поддержки SameSite. Наш клиент шлёт XRW всегда
// (src/components/admin/api.ts), login не исключение.
require_same_origin($method === 'GET');

match ($action) {
    'login' => h_login($method),
    'logout' => h_logout($method),
    'logout-all' => h_logout_all($method),
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
    /* c95-W2-E MINOR-2: глобальный предохранитель логина (60/15 мин со всех
     *  IP) — иначе распределённый брутфорс создаёт неограниченно rl-файлов,
     *  перебирая XFF/сети. Плюс прежний пер-IP лимит 8/15 мин. */
    if (!rl_check_global('loginall', 60, 900)) {
        json_response(429, ['ok' => false, 'error' => 'locked', 'retryAfterSec' => rl_last_retry_after()]);
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
    // cookie подписывается ТЕКУЩЕЙ эпохой сессий (см. current_session)
    $epoch = (int)($settings['sessionEpoch'] ?? 0);
    set_admin_cookie($exp, $key, $epoch);
    json_response(200, ['ok' => true, 'expiresAt' => $exp]);
}

/** action=logout: сброс cookie + отзыв сессии (эпоха). c95-W2-E MINOR-1:
 *  cookie могла быть украдена — простое удаление из браузера не отзывает
 *  её серверно. Для одного владельца «выйти» = «выйти везде» — приемлемо
 *  (второе устройство просто перелогинится; сессии и так 12ч). */
function h_logout(string $method): void
{
    if ($method !== 'POST') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed']);
    }
    /* Эпоху поднимаем только если сессия была валидна — анонимный logout
     * не сбрасывает чужие сессии (иначе любой гость мог бы «выгнать» владельца). */
    if (current_session() !== null) {
        $s = load_settings();
        $s['sessionEpoch'] = (int)($s['sessionEpoch'] ?? 0) + 1;
        save_settings($s);
    }
    clear_admin_cookie();
    json_response(200, ['ok' => true]);
}

/** action=logout-all (POST, auth): инкремент эпохи — отзыв ВСЕХ сессий
 *  (включая чужие браузеры), своя cookie сбрасывается. */
function h_logout_all(string $method): void
{
    if ($method !== 'POST') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed']);
    }
    require_admin();
    $s = load_settings();
    $s['sessionEpoch'] = (int)($s['sessionEpoch'] ?? 0) + 1;
    if (!save_settings($s)) {
        json_response(500, ['ok' => false, 'error' => 'storage']);
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

    // 2) серверная валидация (паритет zod-гейту src/lib/menu-schema.ts
    //    по типам/диапазонам) — отсечь мусор ДО коммита
    $errors = validate_menu($menu);
    if ($errors !== []) {
        json_response(400, [
            'ok' => false,
            'error' => 'validation',
            'detail' => implode(' ', $errors),
            'errors' => $errors,
        ]);
    }

    // 3) PUT contents (commit в main; дальше публикует деплой-воркфлоу).
    //    Кодируем с 2-пробельным отступом и \n в конце — как файл в репо,
    //    чтобы диффы публикаций были минимальными.
    $json = pretty_json_2sp($menu) . "\n";
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
    // Раны ТОЛЬКО деплой-воркфлоу (файл deploy.yml, путь-сегмент — имя файла):
    // общий /actions/runs смешивал CI+Deploy с нестабильным порядком и давал
    // ложные «Сборка не удалась» при успешном деплое (критика 4-W1-D).
    $r = gh_api(
        'GET',
        '/repos/' . $secrets['gh_repo'] . '/actions/workflows/deploy.yml/runs?per_page=10&head_sha=' . rawurlencode($sha),
        null,
        (string)$secrets['gh_token']
    );
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
                $conclusion = (string)($run['conclusion'] ?? '');
                if ($conclusion === 'success') {
                    $resp['state'] = 'success';
                } elseif ($conclusion === 'cancelled') {
                    // отменённый ран (напр., вытеснен новым деплоем при
                    // cancel-in-progress) не равен упавшему — своё состояние
                    $resp['state'] = 'cancelled';
                } else {
                    $resp['state'] = 'failure';
                }
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
    // смена пароля отзывает ВСЕ выданные cookie: инкремент эпохи сессий —
    // старые подписи (со старой эпохой) больше не сходятся (4-W1-A MAJOR-2)
    $s['sessionEpoch'] = (int)($s['sessionEpoch'] ?? 0) + 1;
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
 * Серверная валидация menu.json перед коммитом (4-W1-A MINOR / 4-W1-C):
 * паритет с zod-гейтом src/lib/menu-schema.ts по типам и диапазонам.
 * Цены — строго int: json_decode даёт int для «4500», float для «4500.5»
 * и string для «\"250\"» — обе нецелые формы отклоняем. Перекрёстные
 * инварианты (minOrder ↔ menuTypes и т.п.) остаются сборочному гейту.
 * Возвращает список ошибок (RU, максимум 5); [] = ок.
 */
function validate_menu(array $menu): array
{
    $errors = [];
    $add = static function (string $msg) use (&$errors): void {
        if (count($errors) < 5) {
            $errors[] = $msg;
        }
    };
    $json = json_encode($menu, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (!is_string($json)) {
        return ['Меню не сериализуется в JSON'];
    }
    if (strlen($json) > 400 * 1024) {
        $add('Файл меню слишком большой (больше 400 КБ)');
    }

    /* --- локальные проверки-замыкания (общие для корня и формата) --- */
    // непустая строка до $cap символов (UTF-8)
    $str = static function (mixed $v, int $cap): bool {
        return is_string($v) && trim($v) !== '' && slen($v) <= $cap;
    };
    // addons: ≤20; РОВНО одно из price (int 100..1000000) | percent (int 1..200)
    $checkAddons = static function (mixed $list, string $where) use ($add): void {
        if (!is_array($list)) {
            $add($where . ': addons должен быть массивом');
            return;
        }
        if (count($list) > 20) {
            $add($where . ': слишком много допуслуг (максимум 20)');
        }
        foreach ($list as $ai => $a) {
            $an = $where . ', допуслуга №' . ($ai + 1);
            if (!is_array($a)) {
                $add($an . ': должен быть объектом');
                continue;
            }
            $label = $a['label'] ?? null;
            if (!is_string($label) || trim($label) === '' || slen($label) > 200) {
                $add($an . ': пустой или слишком длинный label (до 200 символов)');
            }
            $hasPrice = array_key_exists('price', $a);
            $hasPercent = array_key_exists('percent', $a);
            if ($hasPrice === $hasPercent) { // задано оба или ни одного
                $add($an . ': должно быть РОВНО одно из полей price | percent');
            } elseif ($hasPrice) {
                if (!is_int($a['price'])) {
                    $add($an . ': цена должна быть целым числом');
                } elseif ($a['price'] < 100 || $a['price'] > 1000000) {
                    $add($an . ': price должен быть от 100 до 1 000 000');
                }
            } elseif (!is_int($a['percent'])) {
                $add($an . ': процент должен быть целым числом');
            } elseif ($a['percent'] < 1 || $a['percent'] > 200) {
                $add($an . ': percent должен быть от 1 до 200');
            }
        }
    };
    // minOrder: значения — int 0..10000000 (минимальная сумма заказа)
    $checkMinOrder = static function (mixed $mo, string $where) use ($add): void {
        if (!is_array($mo)) {
            $add($where . ': minOrder должен быть объектом');
            return;
        }
        foreach ($mo as $v) {
            if (!is_int($v)) {
                $add($where . ': minOrder — цена должна быть целым числом');
            } elseif ($v < 0 || $v > 10000000) {
                $add($where . ': minOrder должен быть от 0 до 10 000 000');
            }
        }
    };

    $types = $menu['menuTypes'] ?? null;
    if (!is_array($types) || count($types) < 1 || count($types) > 12) {
        $add('menuTypes: должен быть массивом из 1–12 форматов кейтеринга');
    } else {
        $seenIds = [];
        foreach ($types as $ti => $t) {
            $n = 'Формат №' . ($ti + 1);
            if (!is_array($t)) {
                $add($n . ': должен быть объектом');
                continue;
            }
            $id = $t['id'] ?? null;
            if (!is_string($id) || trim($id) === '' || strlen($id) > 64) {
                $add($n . ': пустой или слишком длинный id');
                $id = null;
            } elseif (in_array($id, $seenIds, true)) {
                $add('Дубликат id формата: ' . $id);
            } else {
                $seenIds[] = $id;
            }
            $n = $id !== null ? 'Формат «' . $id . '»' : $n;
            if (!$str($t['label'] ?? null, 200)) {
                $add($n . ': пустой или слишком длинный label (до 200 символов)');
            }
            if (array_key_exists('short', $t) && !$str($t['short'], 200)) {
                $add($n . ': пустой или слишком длинный short (до 200 символов)');
            }
            if (array_key_exists('description', $t) && !$str($t['description'], 500)) {
                $add($n . ': пустой или слишком длинный description (до 500 символов)');
            }
            // цены формата (каталог/калькулятор) — положительные целые.
            // c95-W2-E MINOR-4: верхние границы (1e6/1e4) — иначе в scratch
            // проходили 999999999999 (разрыв калькулятора при публикации).
            foreach (['perGuest', 'calcPerGuest', 'minGuests'] as $pf) {
                if (!array_key_exists($pf, $t)) {
                    continue;
                }
                $v = $t[$pf];
                $max = ($pf === 'minGuests') ? 10000 : 1000000;
                if (!is_int($v)) {
                    $add($n . ': ' . $pf . ' — цена должна быть целым числом');
                } elseif ($v < 1) {
                    $add($n . ': ' . $pf . ' должен быть больше нуля');
                } elseif ($v > $max) {
                    $add($n . ': ' . $pf . ' — недопустимо большое значение (максимум ' . $max . ')');
                }
            }
            if (array_key_exists('included', $t)) {
                $inc = $t['included'];
                if (!is_array($inc)) {
                    $add($n . ': included должен быть массивом');
                } else {
                    if (count($inc) > 20) {
                        $add($n . ': слишком много пунктов included (максимум 20)');
                    }
                    foreach ($inc as $s) {
                        if (!is_string($s) || trim($s) === '' || slen($s) > 200) {
                            $add($n . ': included — непустые строки до 200 символов');
                            break;
                        }
                    }
                }
            }
            $pkgs = $t['packages'] ?? null;
            if (!is_array($pkgs) || count($pkgs) < 1 || count($pkgs) > 6) {
                $add($n . ': packages должен содержать 1–6 пакетов');
                continue;
            }
            foreach ($pkgs as $pi => $p) {
                $pn = $n . ', пакет №' . ($pi + 1);
                if (!is_array($p)) {
                    $add($pn . ': должен быть объектом');
                    continue;
                }
                $name = $p['name'] ?? null;
                if (!$str($name, 200)) {
                    $add($pn . ': пустое или слишком длинное name (до 200 символов)');
                    $name = null;
                }
                $pnt = $name !== null ? $n . ', пакет «' . $name . '»' : $pn;
                $ppg = $p['pricePerGuest'] ?? null;
                if (!is_int($ppg)) {
                    $add($pnt . ': цена должна быть целым числом');
                } elseif ($ppg < 100 || $ppg > 100000) {
                    $add($pnt . ': pricePerGuest должен быть от 100 до 100 000');
                }
                if (array_key_exists('description', $p) && !$str($p['description'], 500)) {
                    $add($pnt . ': пустой или слишком длинный description (до 500 символов)');
                }
                if (array_key_exists('dishes', $p)) {
                    $dishes = $p['dishes'];
                    if (!is_array($dishes) || count($dishes) < 1 || count($dishes) > 60) {
                        $add($pnt . ': dishes должен содержать 1–60 позиций');
                    } else {
                        foreach ($dishes as $dish) {
                            $dn = is_array($dish) ? ($dish['name'] ?? null) : null;
                            if (!is_string($dn) || trim($dn) === '' || slen($dn) > 300) {
                                $add($pnt . ': название блюда — строка 1–300 символов');
                                break;
                            }
                        }
                    }
                }
            }
            if (array_key_exists('addons', $t)) {
                $checkAddons($t['addons'], $n);
            }
            if (array_key_exists('minOrder', $t)) {
                $checkMinOrder($t['minOrder'], $n);
            }
        }
    }

    if (array_key_exists('addons', $menu)) {
        $checkAddons($menu['addons'], 'addons (корень)');
    }
    if (array_key_exists('minOrder', $menu)) {
        $checkMinOrder($menu['minOrder'], 'minOrder (корень)');
    }
    if (array_key_exists('servicePanels', $menu)) {
        $panels = $menu['servicePanels'];
        if (!is_array($panels)) {
            $add('servicePanels: должен быть массивом');
        } else {
            if (count($panels) > 12) {
                $add('Слишком много сервисных панелей (максимум 12)');
            }
            foreach ($panels as $si => $panel) {
                $sn = 'Плитка услуг №' . ($si + 1);
                if (!is_array($panel)) {
                    $add($sn . ': должен быть объектом');
                    continue;
                }
                if (!$str($panel['label'] ?? null, 120)) {
                    $add($sn . ': пустой или слишком длинный label (до 120 символов)');
                }
                if (!$str($panel['priceLabel'] ?? null, 60)) {
                    $add($sn . ': пустой или слишком длинный priceLabel (до 60 символов)');
                }
            }
        }
    }
    return $errors;
}

/**
 * JSON с 2-пробельным отступом — как исходный src/data/menu.json в репо,
 * чтобы публикации из админки давали минимальные диффы. Список/объект
 * различаем array_is_list; строки/ключи — без экранирования юникода
 * и слэшей; пустой массив печатается как [].
 */
function pretty_json_2sp(mixed $data, int $depth = 0): string
{
    $flags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE;
    if (!is_array($data)) {
        return json_encode($data, $flags);
    }
    if ($data === []) {
        return '[]';
    }
    $pad = str_repeat('  ', $depth + 1);
    $close = str_repeat('  ', $depth);
    if (array_is_list($data)) {
        $items = [];
        foreach ($data as $v) {
            $items[] = $pad . pretty_json_2sp($v, $depth + 1);
        }
        return "[\n" . implode(",\n", $items) . "\n" . $close . "]";
    }
    $items = [];
    foreach ($data as $k => $v) {
        $items[] = $pad . json_encode((string)$k, $flags) . ': ' . pretty_json_2sp($v, $depth + 1);
    }
    return "{\n" . implode(",\n", $items) . "\n" . $close . "}";
}
