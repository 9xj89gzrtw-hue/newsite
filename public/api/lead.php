<?php
declare(strict_types=1);

/**
 * c95 — публичный эндпоинт приёма заявок (POST /api/lead.php).
 *
 * Без авторизации (публичная форма сайта). Защита:
 *  - same-origin (X-Requested-With + Origin-allowlist);
 *  - rate limit: 6/час и 30/сутки на IP + глобальный предохранитель
 *    120/час на всё (файловые счётчики, flock);
 *  - honeypot + elapsedMs — молчаливая ловля ботов (отвечаем ok:true,
 *    ничего не сохранляя и не отправляя);
 *  - все поля ограничены по длине/формату, JSON-тело ≤ 64 КБ.
 *
 * Хранение: server-data/leads.json (append, flock+atomic, cap 1000,
 * архив leads-archive.json cap 5000). Полный IP не хранится — md5-префикс.
 * Уведомления: Telegram (если настроен) + mail() на notifyEmail (или
 * фолбэк NOTIFY_EMAIL_FALLBACK). Заявка считается принятой, если она
 * записана ИЛИ доставлено хоть одно уведомление.
 */

define('NILOV_API', true);
require __DIR__ . '/_lib.php';

header('X-Robots-Tag: noindex, nofollow'); // для ЛЮБОГО запроса к этому файлу

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_response(405, ['ok' => false, 'error' => 'method_not_allowed', 'detail' => 'POST only']);
}

require_same_origin(false); // POST: обязателен X-Requested-With + Origin-allowlist

// Глобальный предохранитель — ДО per-IP проверок: ротация XFF/прокси-пул
// обнуляет per-IP счётчики, общий лимит 120 заявок/час держит спам-волну.
if (!rl_check_global('leadall', 120, 3600)
    || !rl_check('lead', 6, 3600)
    || !rl_check('leadday', 30, 86400)) {
    json_response(429, ['ok' => false, 'error' => 'rate', 'retryAfterSec' => rl_last_retry_after()]);
}

$body = read_json_body_or_400(65536); // ≤ 64 КБ, иначе 400 too_large

/* ---------- молчаливые анти-спам ловушки: фейковый ok:true ---------- */
$trap = false;
$honeypot = $body['honeypot'] ?? '';
if (is_string($honeypot) && trim($honeypot) !== '') {
    $trap = true; // боты заполняют невидимое поле
}
$elapsedMs = $body['elapsedMs'] ?? null;
// elapsedMs проставляет наш form-JS: ОТСУТСТВИЕ ключа = бот без нашего JS
// (curl/скрипт), значение <1500 мс = быстрее человека. Оба случая —
// молчаливый фейковый ok:true без сохранения и уведомлений.
if (!is_int($elapsedMs) || $elapsedMs < 1500) {
    $trap = true;
}
if ($trap) {
    json_response(200, ['ok' => true, 'id' => make_lead_id()]);
}

/* -------------------------- валидация полей -------------------------- */
$vErr = static function (string $detail): never {
    json_response(400, ['ok' => false, 'error' => 'validation', 'detail' => $detail]);
};

$name = isset($body['name']) && is_string($body['name']) ? trim($body['name']) : '';
if ($name === '' || slen($name) > 100) {
    $vErr('Имя: укажите 1–100 символов');
}

$phone = isset($body['phone']) && is_string($body['phone']) ? trim($body['phone']) : '';
if (strlen($phone) < 7 || strlen($phone) > 25 || preg_match('/^[+0-9()\\-\\s]+$/', $phone) !== 1) {
    $vErr('Телефон: 7–25 символов, только цифры и + ( ) - пробел');
}
if (strlen(preg_replace('/\D/', '', $phone) ?? '') < 9) {
    $vErr('Телефон: слишком мало цифр');
}

$source = $body['source'] ?? null;
if (!is_string($source) || !in_array($source, ['calculator', 'contact', 'footer'], true)) {
    $vErr('source: некорректный источник заявки');
}

if (($body['consent'] ?? null) !== true) {
    $vErr('Необходимо согласие на обработку персональных данных');
}

$email = $body['email'] ?? null;
if ($email !== null && $email !== '') {
    if (!is_string($email) || strlen($email) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $vErr('Email: некорректный адрес');
    }
} else {
    $email = null;
}

$comment = $body['comment'] ?? null;
if ($comment !== null && $comment !== '') {
    if (!is_string($comment) || slen($comment) > 2000) {
        $vErr('Комментарий: до 2000 символов');
    }
} else {
    $comment = null;
}

$payload = $body['payload'] ?? null;
if ($payload !== null && $payload !== []) {
    if (!is_array($payload)) {
        $vErr('payload: ожидается объект');
    }
    $payloadJson = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($payloadJson === false || strlen($payloadJson) > 8192) {
        json_response(400, ['ok' => false, 'error' => 'too_large', 'detail' => 'payload: максимум 8 КБ']);
    }
}

/* ------------------------- запись заявки ----------------------------- */
$lead = [
    'id' => make_lead_id(),
    'ts' => time(),
    // полный IP не храним — только короткий md5-префикс для трассировки abuse
    'ipHash' => substr(md5(ip()), 0, 8),
    'ua' => str_trunc((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 200),
    'read' => false,
    'archived' => false,
    'source' => $source,
    'name' => str_trunc($name, 100),
    'phone' => str_trunc($phone, 25),
    'email' => $email !== null ? str_trunc($email, 120) : null,
    'comment' => $comment !== null ? str_trunc($comment, 2000) : null,
    // payload хранится «как есть» (typeId, guests, dateIso, pkgName, addonIds,
    // total, preferredTime, undecided, …) — поля калькулятора добавляются
    // формами без изменения этого эндпоинта
    'payload' => ($payload === null || $payload === []) ? null : $payload,
];

$stored = store_lead($lead);

/* c96-CRIT-A (таймаут-бюджет): заявка ЗАПИСАНА → отвечаем посетителю
 * СРАЗУ; уведомления догоняют после ответа (fastcgi_finish_request на
 * PHP-FPM хостинга; в CLI-тестах функции нет — синхронный путь как в c95).
 * Раньше 2 мёртвые TG-базы держали форму 10+ секунд. */
if ($stored && function_exists('fastcgi_finish_request')) {
    send_lead_response(200, ['ok' => true, 'id' => $lead['id']]);
    fastcgi_finish_request();
    lead_notify_and_store_status($lead);
    exit;
}

$notify = lead_notify_and_store_status($lead);

/* Не записано И ни одно уведомление не доставлено → честный 500:
   клиент переключится на mailto-фоллбэк. */
if (!$stored && $notify !== true) {
    json_response(500, ['ok' => false, 'error' => 'delivery']);
}

json_response(200, ['ok' => true, 'id' => $lead['id']]);

/* ============================ функции ================================ */

/** Ответ JSON без exit (нужно для fastcgi_finish_request: ответ уже
 *  отправлен, но PHP-код продолжает исполняться в фоне). */
function send_lead_response(int $status, array $body): void
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
}

/** Все уведомления по заявке (TG + mail владельцу + подтверждение клиенту).
 * true — хоть одно доставлено. c97: статусы также пишутся в запись лида
 * (notify: tg/mail/client/mailTransport) — видно в разделе «Заявки». */
function lead_notify_all(array $lead): array
{
    $settings = load_settings();
    $secrets = load_secrets(false);
    $status = ['tg' => false, 'mail' => false, 'client' => null, 'mailTransport' => null];

    $chatId = $settings['tgChatId'] ?? null;
    $token = $settings['tgBotToken'] ?? null;
    if (is_string($token) && $token !== '' && is_string($chatId) && $chatId !== '') {
        /* c96: перебор баз Bot API (запомненная рабочая → зеркало
         * владельца → api.telegram.org); api.telegram.org с РФ-хостингов
         * деградирует с 03.2026. maxBases=2 — бюджет таймаутов (лид
         * не должен висеть на мёртвых базах), почта всегда догонит. */
        $tg = tg_send_fb($token, tg_api_bases($settings, $secrets), $chatId, lead_tg_text($lead), 2);
        $status['tg'] = ($tg['ok'] === true);
    }

    $notifyEmail = (string)($settings['notifyEmail'] ?: NOTIFY_EMAIL_FALLBACK);
    if ($notifyEmail !== '') {
        /* c97: единый канал mail_send — SMTP (если настроен) → mail() с
         * обязательными Date/Message-ID (без них Gmail отбраковывал
         * письма — вероятная причина «почта не работает»). Клиент в
         * Reply-To: владелец отвечает посетителю прямо из письма. */
        $mail = mail_send(
            $notifyEmail,
            'Новая заявка с сайта — ' . $lead['name'],
            lead_mail_text($lead),
            is_string($lead['email']) && $lead['email'] !== '' ? $lead['email'] : null,
            'lead-owner'
        );
        $status['mail'] = ($mail['ok'] === true);
        $status['mailTransport'] = is_string($mail['transport'] ?? null) ? $mail['transport'] : null;
    }

    /* c97: подтверждение КЛИЕНТУ — если посетитель указал email, ему
     * уходит копия заявки с контактами (Reply-To — на владельца:
     * ответ клиента на письмо приходит владельцу напрямую). */
    if (is_string($lead['email']) && $lead['email'] !== '') {
        $client = mail_send(
            $lead['email'],
            'Ваша заявка в Nilov Catering принята',
            lead_client_mail_text($lead),
            $notifyEmail !== '' ? $notifyEmail : null,
            'lead-client'
        );
        $status['client'] = ($client['ok'] === true);
    }
    return $status;
}

/**
 * c97 — обёртка над lead_notify_all: доставляет уведомления и дописывает
 * их статусы в сохранённую запись лида (leads.json). Возвращает true,
 * если доставлено хоть одно уведомление (критерий «принято» с c95).
 */
function lead_notify_and_store_status(array $lead): bool
{
    $status = lead_notify_all($lead);
    $any = $status['tg'] === true || $status['mail'] === true || $status['client'] === true;
    // пишем только если было хоть одно уведомление (иначе файл не трогаем)
    if ($status['mail'] === true || $status['client'] !== null || $status['tg'] === true) {
        update_json_file(leads_path(), static function (array $leads) use ($lead, $status): ?array {
            foreach ($leads as $i => $l) {
                if (($l['id'] ?? null) === $lead['id']) {
                    $leads[$i]['notify'] = [
                        'ts' => time(),
                        'tg' => (bool)$status['tg'],
                        'mail' => (bool)$status['mail'],
                        'client' => isset($status['client']) ? (bool)$status['client'] : null,
                        'mailTransport' => is_string($status['mailTransport'] ?? null) ? $status['mailTransport'] : null,
                    ];
                    return $leads;
                }
            }
            return null; // лид не найден (архив?) — отменяем запись
        });
    }
    return $any;
}

function make_lead_id(): string
{
    return date('Ymd-His') . '-' . bin2hex(random_bytes(3));
}

/**
 * Append в leads.json под локом; сверх 1000 — старейшие уходят в архив
 * (leads-archive.json, cap 5000). Возврат false = сбой записи.
 */
function store_lead(array $lead): bool
{
    return update_json_file(leads_path(), static function (array $leads) use ($lead): array {
        $leads[] = $lead;
        if (count($leads) > LEADS_CAP) {
            $overflowCount = count($leads) - LEADS_CAP;
            $overflow = array_splice($leads, 0, $overflowCount);
            // архив читаем/пишем без вложенного лока: все записи в архив
            // идут только под локом leads.json.lock (единственный писатель)
            $archPath = leads_archive_path();
            $arch = is_file($archPath) ? json_decode((string)@file_get_contents($archPath), true) : null;
            $arch = is_array($arch) ? $arch : [];
            $arch = array_merge($arch, $overflow);
            if (count($arch) > LEADS_ARCHIVE_CAP) {
                $arch = array_slice($arch, count($arch) - LEADS_ARCHIVE_CAP);
            }
            write_json_atomic($archPath, $arch);
        }
        return $leads;
    });
}

/** HTML-сообщение для Telegram (parse_mode=HTML, всё экранировано). */
function lead_tg_text(array $lead): string
{
    $e = 'tg_html_escape';
    $lines = ['<b>Новая заявка</b>'];
    $lines[] = 'Имя: ' . $e($lead['name']);
    $lines[] = 'Телефон: ' . $e($lead['phone']); // tel-ссылку не делаем — просто текст
    if (!empty($lead['email'])) {
        $lines[] = 'Email: ' . $e($lead['email']);
    }
    $p = is_array($lead['payload']) ? $lead['payload'] : [];
    if (!empty($p['pkgName']) && is_string($p['pkgName'])) {
        $lines[] = 'Формат: ' . $e($p['pkgName']);
    }
    if (!empty($p['typeId']) && is_string($p['typeId'])) {
        $lines[] = 'Тип: ' . $e($p['typeId']);
    }
    if (isset($p['guests']) && is_numeric($p['guests'])) {
        $lines[] = 'Гостей: ' . $e((string)$p['guests']);
    }
    if (!empty($p['dateIso']) && is_string($p['dateIso'])) {
        $lines[] = 'Дата: ' . $e($p['dateIso']);
    }
    if (!empty($p['preferredTime']) && is_string($p['preferredTime'])) {
        $lines[] = 'Время: ' . $e($p['preferredTime']);
    }
    if (isset($p['total']) && is_numeric($p['total'])) {
        $lines[] = 'Расчёт: ' . $e(number_format((float)$p['total'], 0, ',', ' ')) . ' ₽';
    }
    if (!empty($lead['comment'])) {
        $lines[] = 'Комментарий: ' . $e(str_trunc($lead['comment'], 500));
    }
    $labels = [
        'calculator' => 'Калькулятор',
        'contact' => 'Страница контактов',
        'footer' => 'Быстрая заявка (подвал)',
    ];
    $lines[] = 'Источник: ' . $e($labels[$lead['source']] ?? $lead['source']);
    return implode("\n", $lines);
}

/** Текст письма (plain text, UTF-8). */
function lead_mail_text(array $lead): string
{
    $p = is_array($lead['payload']) ? $lead['payload'] : [];
    $lines = [
        'Новая заявка с сайта nilovcatering.ru',
        '',
        'Имя: ' . $lead['name'],
        'Телефон: ' . $lead['phone'],
    ];
    if (!empty($lead['email'])) {
        $lines[] = 'Email: ' . $lead['email'];
    }
    if (!empty($p['pkgName']) && is_string($p['pkgName'])) {
        $lines[] = 'Формат: ' . $p['pkgName'];
    }
    if (isset($p['guests']) && is_numeric($p['guests'])) {
        $lines[] = 'Гостей: ' . (string)$p['guests'];
    }
    if (!empty($p['dateIso']) && is_string($p['dateIso'])) {
        $lines[] = 'Дата: ' . $p['dateIso'];
    }
    if (!empty($p['preferredTime']) && is_string($p['preferredTime'])) {
        $lines[] = 'Время: ' . $p['preferredTime'];
    }
    if (isset($p['total']) && is_numeric($p['total'])) {
        $lines[] = 'Расчёт: ' . number_format((float)$p['total'], 0, ',', ' ') . ' ₽';
    }
    if (!empty($lead['comment'])) {
        $lines[] = 'Комментарий: ' . str_trunc($lead['comment'], 1000);
    }
    $labels = [
        'calculator' => 'Калькулятор',
        'contact' => 'Страница контактов',
        'footer' => 'Быстрая заявка (подвал)',
    ];
    $lines[] = 'Источник: ' . ($labels[$lead['source']] ?? $lead['source']);
    $lines[] = '';
    $lines[] = 'Дата заявки: ' . date('d.m.Y H:i:s', (int)$lead['ts']);
    $lines[] = 'ID: ' . $lead['id'];
    return implode("\r\n", $lines);
}

/**
 * c97 — подтверждение КЛИЕНТУ (уходит на email посетителя, если указан).
 * Копия расчёта + контакты; ответ на письмо уходит владельцу (Reply-To).
 */
function lead_client_mail_text(array $lead): string
{
    $p = is_array($lead['payload']) ? $lead['payload'] : [];
    $lines = [
        'Здравствуйте, ' . $lead['name'] . '!',
        '',
        'Ваша заявка на сайте nilovcatering.ru получена — спасибо!',
        'Мы свяжемся с вами по телефону ' . $lead['phone'] . ' в ближайшее время.',
        '',
    ];
    $details = [];
    if (!empty($p['pkgName']) && is_string($p['pkgName'])) {
        $details[] = 'Формат: ' . $p['pkgName'];
    }
    if (isset($p['guests']) && is_numeric($p['guests'])) {
        $details[] = 'Гостей: ' . (string)$p['guests'];
    }
    if (!empty($p['dateIso']) && is_string($p['dateIso'])) {
        $details[] = 'Дата: ' . $p['dateIso'];
    }
    if (!empty($p['preferredTime']) && is_string($p['preferredTime'])) {
        $details[] = 'Время: ' . $p['preferredTime'];
    }
    if (isset($p['total']) && is_numeric($p['total'])) {
        $details[] = 'Предварительный расчёт: ' . number_format((float)$p['total'], 0, ',', ' ') . ' ₽';
    }
    if (!empty($lead['comment'])) {
        $details[] = 'Ваш комментарий: ' . str_trunc($lead['comment'], 500);
    }
    if ($details !== []) {
        $lines[] = 'КОПИЯ ВАШЕЙ ЗАЯВКИ';
        foreach ($details as $d) {
            $lines[] = '— ' . $d;
        }
        $lines[] = '';
    }
    $lines[] = 'Есть вопросы? Просто ответьте на это письмо — оно придёт нам напрямую.';
    $lines[] = '';
    $lines[] = 'Телефон / WhatsApp: +7 (911) 941-72-05';
    $lines[] = 'Telegram: https://t.me/nilov_catering';
    $lines[] = 'Сайт: https://nilovcatering.ru';
    $lines[] = '';
    $lines[] = 'Хорошего дня!';
    $lines[] = 'Команда Nilov Catering — кейтеринг, в котором чувствуют';
    return implode("\r\n", $lines);
}
