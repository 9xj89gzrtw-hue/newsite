<?php
declare(strict_types=1);

/**
 * c95 — публичный эндпоинт приёма заявок (POST /api/lead.php).
 *
 * Без авторизации (публичная форма сайта). Защита:
 *  - same-origin (Origin-allowlist; XRW нужен только без Origin — c98-A
 *    добавил пропуск beacon-запросов с same-origin Origin без XRW);
 *  - rate limit: 12/час и 60/сутки на IP (c98-A: было 6/30 — один офисный
 *    IP с несколькими сотрудниками упирался в лимит) + глобальный
 *    предохранитель 120/час на всё (файловые счётчики, flock);
 *  - honeypot + elapsedMs — ловля ботов с записью в spam-log.json
 *    (c98-A: раньше умирали молча — реальный клиент мог потеряться без
 *    следа; отсутствующий elapsedMs больше НЕ ловушка — старый кэш-бандл
 *    не слал поле);
 *  - идемпотентность (c98-A): поле clientId в теле — ретрай сети/sendBeacon
 *    не создаёт дубль, ответ дублируется {dedupe:true};
 *    c98-FIX1: проверка clientId — ВНУТРИ колбэка store_lead (LOCK_EX),
 *    быстрый dedup-путь ДО rate-limit — резенд не жжёт квоту IP;
 *  - все поля ограничены по длине/формату, JSON-тело ≤ 64 КБ.
 *
 * Хранение: server-data/leads.json (append, flock+atomic, cap 1000,
 * архив leads-archive.json cap 5000). Битый leads.json НЕ затирается —
 * бэкапится в leads.corrupt-*.json, лид получает rescuedFrom (c98-A).
 * Полный IP не хранится — md5-префикс.
 * Уведомления: Telegram (если настроен) + mail() на notifyEmail (или
 * фолбэк NOTIFY_EMAIL_FALLBACK). Заявка считается принятой, если она
 * записана ИЛИ доставлено хоть одно уведомление. Полный провал
 * уведомлений — запись lead.notify + контекст 'lead-notify-fail'
 * в mail-log.json + один ретрай через 5с в фоне (c98-A; c98-FIX1 —
 * только транзиентные каналы, в рамках wall-clock-бюджета ~45с).
 */

define('NILOV_API', true);
require __DIR__ . '/_lib.php';

/* c100: NILOV_LEAD_TESTS — CLI-юнит-тесты подключают файл ради ФУНКЦИЙ
 * (lead_format_label/lead_*_mail_*): константа отключает обработку
 * HTTP-запроса (в проде/на php -S не определена — работает как раньше). */
if (!defined('NILOV_LEAD_TESTS')) {

header('X-Robots-Tag: noindex, nofollow'); // для ЛЮБОГО запроса к этому файлу

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_response(405, ['ok' => false, 'error' => 'method_not_allowed', 'detail' => 'POST only']);
}

require_same_origin(false); // POST: Origin-allowlist; XRW — только без Origin (c98-A beacon)

/* c98-FIX1 (критик2 E6/MINOR-3): тело читается ДО rate-limit — быстрому
 * dedup-пути ниже нужен clientId. Чтение ≤64 КБ дешёвое и без побочных
 * эффектов; все «пишущие» пути (trap-лог, счётчики, leads.json) по-прежнему
 * за rate-limit. */
$body = read_json_body_or_400(65536); // ≤ 64 КБ, иначе 400 too_large

/* ------------------ идемпотентность (c98-A): clientId ------------------ */
/* Клиент (submit-lead.ts outbox) присылает UUID v4 — ретрай сети,
 * sendBeacon-дубль при закрытии вкладки и авто-резенд не создают дубль
 * заявки: находим существующую запись и отвечаем тем же успехом.
 * Поле в ТЕЛЕ (не в заголовке): sendBeacon не умеет кастомных заголовков.
 *
 * c98-FIX1 (критик2 E6, MINOR): dedup-чтение ВЫНЕСЕНО ДО rate-limit —
 * резенд УЖЕ сохранённой заявки не расходует квоту IP и не ловит 429
 * (раньше outbox-резенд при исчерпанном лимите получал 429 → клиент в
 * mailto-фолбэк → дубль письма владельцу + зря прожжённые tries).
 * Чтение под LOCK_SH, записи нет — дешёво и безопасно. Этот путь НЕ
 * закрывает гонку «два одновременных новичка с одним clientId» — её
 * закрывает атомарная проверка ВНУТРИ store_lead (LOCK_EX, см. функцию).
 * Гонку «нашли null → конкурент записал → мы пишем дубль» закрывает тот же
 * атомарный dedup в store_lead: callback перечитает файл под LOCK_EX. */
$clientId = $body['clientId'] ?? null;
if ($clientId !== null) {
    if (!is_string($clientId) || preg_match('/^[0-9a-f-]{8,64}$/i', $clientId) !== 1) {
        json_response(400, ['ok' => false, 'error' => 'validation', 'detail' => 'clientId: 8–64 hex-символов']);
    }
    $existing = find_lead_by_client_id($clientId);
    if ($existing !== null) {
        // уже записана — без повторной записи и БЕЗ повторных уведомлений
        json_response(200, ['ok' => true, 'id' => $existing['id'], 'dedupe' => true]);
    }
}

// Глобальный предохранитель — ДО per-IP проверок: ротация XFF/прокси-пул
// обнуляет per-IP счётчики, общий лимит 120 заявок/час держит спам-волну.
// c98-A: per-IP подняты 6→12/час и 30→60/сутки (реальный кейс: один
// офисный IP, несколько сотрудников отправляют заявки в один час).
// c98-FIX1: мусорные тела (без clientId) по-прежнему жгут квоту — порядок
// «счётчики до валидации» сохранён (E5a/E5b/E7/T7 ждут именно этого).
if (!rl_check_global('leadall', 120, 3600)
    || !rl_check('lead', 12, 3600)
    || !rl_check('leadday', 60, 86400)) {
    json_response(429, ['ok' => false, 'error' => 'rate', 'retryAfterSec' => rl_last_retry_after()]);
}

/* ---------- молчаливые анти-спам ловушки: фейковый ok:true ---------- */
$trap = false;
$trapReason = null;
$honeypot = $body['honeypot'] ?? '';
if (is_string($honeypot) && trim($honeypot) !== '') {
    $trap = true; // боты заполняют невидимое поле
    $trapReason = 'honeypot';
}
$elapsedMs = $body['elapsedMs'] ?? null;
/* c98-A (смягчение): ОТСУТСТВИЕ elapsedMs больше НЕ ловушка — старый
 * кэш-бандл (и sendBeacon-дубли) мог не слать поле, и реальные клиенты
 * умирали молча (вероятная причина потери лида у владельца). honeypot
 * остаётся главным барьером; валидация полей отсечёт ботов без нашего JS.
 * Числовое значение <1500 мс — по-прежнему бот.
 * c98-FIX1 (критик2 E4): СТРОГОЕ приведение типа — числовое значение в
 * ЛЮБОМ JSON-типе (int/float/строка-число) ловится (раньше is_int()
 * пропускал "100"/100.7/true — обход «мгновенного сабмита»); не-число
 * (строка-мусор/bool/массив) → -1 → ловушка со спам-логом. Отсутствие
 * (null) → пропуск, как раньше. */
$elapsed = ($elapsedMs === null) ? null : (is_numeric($elapsedMs) ? (float)$elapsedMs : -1.0);
if ($elapsed !== null && $elapsed < 1500) {
    $trap = true;
    if ($trapReason === null) {
        $trapReason = 'elapsed';
    }
}
if ($trap) {
    /* c98-A: каждая ловушка оставляет след в spam-log.json — если сюда
     * попал реальный клиент, владелец увидит имя/телефон в разделе
     * «Заявки → Ловушка спама» и сможет перезвонить. До c98 пойманный
     * лид терялся без следов. Фейковый ok:true сохраняем — бот не должен
     * знать, что его поймали. */
    spam_log_append([
        'reason' => $trapReason,
        // c98-FIX1: нормализованное число (целые — int, чтобы JSON был без .0)
        'elapsedMs' => ($elapsed === null) ? null : ($elapsed == floor($elapsed) ? (int)$elapsed : $elapsed),
        'name' => str_trunc((string)($body['name'] ?? ''), 100),
        'phone' => str_trunc((string)($body['phone'] ?? ''), 25),
        'email' => (str_trunc((string)($body['email'] ?? ''), 120) !== '') ? str_trunc((string)($body['email'] ?? ''), 120) : null,
        'comment' => (str_trunc((string)($body['comment'] ?? ''), 500) !== '') ? str_trunc((string)($body['comment'] ?? ''), 500) : null,
        'source' => is_string($body['source'] ?? null) ? str_trunc($body['source'], 40) : '',
        'ipHash' => substr(md5(ip()), 0, 8),
        'clientId' => is_string($body['clientId'] ?? null) ? str_trunc($body['clientId'], 64) : null,
        // обрезок payload для ручной проверки (полный не нужен)
        'payload' => str_trunc((string)json_encode($body['payload'] ?? null, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), 300) ?: null,
    ]);
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
/* (блок clientId удалён — проверка форматы+дедуп переехали ДО rate-limit,
 * c98-FIX1; сюда доходят только «не найденные» clientId — атомарный dedup
 * в store_lead ловит конкурента, записавшегося между чтением и записью.) */
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
    // c98-A: ключ идемпотентности (быстрый dedup-путь выше + атомарный в store_lead)
    'clientId' => is_string($clientId) ? $clientId : null,
];

/* c98-FIX1 (критик2 E1, CRITICAL): атомарный dedup — store_lead проверяет
 * clientId ВНУТРИ колбэка под LOCK_EX (update_json_file). До фикса:
 * find под LOCK_SH (:164) → лок отпущен → store под LOCK_EX — TOCTOU,
 * 7/24 параллельных POST с одним clientId создавали дубль (двойные
 * уведомления). Дубль → dedupe-ответ БЕЗ записи и БЕЗ уведомлений. */
$res = store_lead($lead);
if ($res['dedupe']) {
    json_response(200, ['ok' => true, 'id' => $res['id'], 'dedupe' => true]);
}
$stored = $res['stored'];

/* c96-CRIT-A (таймаут-бюджет): заявка ЗАПИСАНА → отвечаем посетителю
 * СРАЗУ; уведомления догоняют после ответа (fastcgi_finish_request на
 * PHP-FPM хостинга; в CLI-тестах функции нет — синхронный путь как в c95).
 * Раньше 2 мёртвые TG-базы держали форму 10+ секунд. */
if ($stored && function_exists('fastcgi_finish_request')) {
    send_lead_response(200, ['ok' => true, 'id' => $lead['id']]);
    fastcgi_finish_request();
    // true = мы в фоне после ответа: разрешён один 5-секундный ретрай (c98-A)
    lead_notify_and_store_status($lead, true);
    exit;
}

$notify = lead_notify_and_store_status($lead, false);

/* Не записано И ни одно уведомление не доставлено → честный 500:
   клиент переключится на mailto-фоллбэк. */
if (!$stored && $notify !== true) {
    json_response(500, ['ok' => false, 'error' => 'delivery']);
}

json_response(200, ['ok' => true, 'id' => $lead['id']]);

} // c100: конец HTTP-обработчика (NILOV_LEAD_TESTS подключает только функции)

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
 * (notify: tg/mail/client/mailTransport) — видно в разделе «Заявки».
 *
 * c98-FIX1 (критик2 E2, MAJOR): $deadline (wall-clock microtime) — бюджет
 * фоновой фазы (~45с, взводится в lead_notify_and_store_status): перед
 * КАЖДЫМ каналом сверяем остаток — связка мёртвых TG-зеркал + чёрная дыра
 * вместо SMTP больше не держит один FPM-воркер минутами (до фикса худший
 * случай: TG ≤14с + 2 письма × до ~190с + sleep(5) + полный повтор
 * ВСЕХ каналов). $skip — каналы ('tg'|'mail'|'client'), исключённые из
 * ретрая (см. lead_notify_and_store_status). В статус дописываются классы
 * ошибок каналов (tgErr/mailErr/clientErr ∈ 'dead'|'crit'|'retry'|null) —
 * по ним принимается решение о ретрае. */
function lead_notify_all(array $lead, ?float $deadline = null, array $skip = []): array
{
    $inBudget = static function () use ($deadline): bool {
        return $deadline === null || microtime(true) < $deadline;
    };
    $settings = load_settings();
    $secrets = load_secrets(false);
    /* c98-A: *Attempted-флаги — «канал был настроен и пробовался» (в
     * отличие от ==false, который не отличает провал от «не настроено»). */
    $status = ['tg' => false, 'tgAttempted' => false, 'tgErr' => null,
        'mail' => false, 'mailAttempted' => false, 'mailErr' => null,
        'client' => null, 'clientErr' => null, 'clientPdf' => null, 'mailTransport' => null];

    /* c100: PDF-меню подбираем ОДИН раз до всех каналов: ярлык меню виден
     * в TG и письме владельца («клиенту ушло меню …»), публичная ссылка —
     * фолбэком в письме клиента, байты — вложением. $pdfLabel ≠ null
     * ТОЛЬКО когда вложение реально поедет (bytes прочитаны) — иначе
     * баннер «меню во вложении» был бы ложью. */
    $p = is_array($lead['payload']) ? $lead['payload'] : [];
    $pdfEntry = menu_pdf_for_payload($p);
    $pdfBytes = null;
    $pdfLabel = null;
    $pdfUrl = null;
    $attachSkipped = null;
    if ($pdfEntry !== null) {
        $bytes = menu_pdf_bytes($pdfEntry);
        if ($bytes !== null) {
            $pdfBytes = $bytes;
            $pdfLabel = (string)($pdfEntry['label'] ?? 'PDF-меню');
        } else {
            $attachSkipped = 'pdf_file_missing_or_too_large';
        }
        $file = (string)($pdfEntry['file'] ?? '');
        if ($file !== '') {
            // публичная ссылка на тот же файл (деплоится со статикой)
            $pdfUrl = 'https://' . MAIL_DOMAIN . '/menu-pdf/' . rawurlencode($file);
        }
    } else {
        $attachSkipped = 'no_manifest';
    }
    /* TG/владелец: что КЛИЕНТ получит (email может не быть указан). */
    $clientPlan = !is_string($lead['email']) || $lead['email'] === ''
        ? 'Клиент не оставил email — подтверждение не отправлялось'
        : ($pdfLabel !== null ? 'Клиенту ушло письмо с меню «' . $pdfLabel . '»'
            : 'Клиенту ушло письмо-подтверждение (без PDF-меню)');

    $chatId = $settings['tgChatId'] ?? null;
    $token = $settings['tgBotToken'] ?? null;
    if (!in_array('tg', $skip, true)
        && is_string($token) && $token !== '' && is_string($chatId) && $chatId !== ''
        && $inBudget()) {
        $status['tgAttempted'] = true;
        /* c96: перебор баз Bot API (запомненная рабочая → зеркало
         * владельца → api.telegram.org); api.telegram.org с РФ-хостингов
         * деградирует с 03.2026. maxBases=2 — бюджет таймаутов (лид
         * не должен висеть на мёртвых базах), почта всегда догонит. */
        $tg = tg_send_fb($token, tg_api_bases($settings, $secrets), $chatId, lead_tg_text($lead, $clientPlan), 2);
        $status['tg'] = ($tg['ok'] === true);
        if (!$status['tg']) {
            $status['tgErr'] = tg_error_class($tg);
        }
    }

    $notifyEmail = (string)($settings['notifyEmail'] ?: NOTIFY_EMAIL_FALLBACK);
    if (!in_array('mail', $skip, true) && $notifyEmail !== '' && $inBudget()) {
        $status['mailAttempted'] = true;
        /* c97: единый канал mail_send — SMTP (если настроен) → mail() с
         * обязательными Date/Message-ID (без них Gmail отбраковывал
         * письма — вероятная причина «почта не работает»). Клиент в
         * Reply-To: владелец отвечает посетителю прямо из письма.
         * c100: тема — с форматом («Новая заявка — Мария · Фуршет ·
         * Премиум»), тело — секциями, + HTML-версия. */
        $fmt = lead_format_label($p);
        $subject = 'Новая заявка — ' . $lead['name'] . ($fmt !== null ? ' · ' . $fmt : '');
        $mail = mail_send(
            $notifyEmail,
            $subject,
            lead_mail_text($lead, $clientPlan),
            is_string($lead['email']) && $lead['email'] !== '' ? $lead['email'] : null,
            'lead-owner',
            [],
            lead_owner_mail_html($lead, $clientPlan)
        );
        $status['mail'] = ($mail['ok'] === true);
        $status['mailTransport'] = is_string($mail['transport'] ?? null) ? $mail['transport'] : null;
        if (!$status['mail']) {
            $status['mailErr'] = mail_error_class($mail);
        }
    }

    /* c97: подтверждение КЛИЕНТУ — если посетитель указал email, ему
     * уходит копия заявки с контактами (Reply-To — на владельца:
     * ответ клиента на письмо приходит владельцу напрямую).
     * c99: + PDF-меню ЕГО тарифа во вложении (меню = «витрина»
     * конверсии: клиент держит меню перед звонком менеджера).
     * Подбор: typeId+pkgIdx из калькулятора → тип без пакета → полный
     * каталог. Файл отсутствует/большой 2МБ — письмо уходит БЕЗ вложения,
     * но с публичной ССЫЛКОЙ на меню (c100) — доставка текста важнее
     * вложения; пропуск журналируется ('attachSkipped') и виден в
     * mail-log админки. */
    if (!in_array('client', $skip, true)
        && is_string($lead['email']) && $lead['email'] !== '' && $inBudget()) {
        $attachments = [];
        if ($pdfBytes !== null) {
            $attachments[] = [
                'bytes' => $pdfBytes,
                'name' => (string)($pdfEntry['fileName'] ?? 'menu.pdf'),
                'entry' => $pdfEntry,
            ];
        }
        $client = mail_send(
            $lead['email'],
            'Ваша заявка в NILOV CATERING принята',
            lead_client_mail_text($lead, $pdfLabel, $pdfUrl),
            $notifyEmail !== '' ? $notifyEmail : null,
            'lead-client',
            $attachments,
            lead_client_mail_html($lead, $pdfLabel, $pdfUrl)
        );
        if ($attachSkipped !== null) {
            /* Пропуск вложения — НЕ ошибка доставки, но владелец должен
             * видеть это в журнале (иначе «почему без меню?» — загадка).
             * c99-fix (критик E1-m1): ok — фактический итог письма (а не
             * безусловный true): при сбое доставки строка журнала не
             * должна выглядеть зелёной поверх реальной ошибки.
             * c100: detail + публичная ссылка на PDF (клиент получил её
             * в письме). */
            mail_log_append(['to' => $lead['email'], 'context' => 'lead-client',
                'subject' => 'Ваша заявка в NILOV CATERING принята',
                'transport' => (string)($client['transport'] ?? 'none'),
                'ok' => ($client['ok'] === true), 'attach' => 0,
                'error' => $client['ok'] === true ? null : mail_error_class($client),
                'detail' => 'attachSkipped: ' . $attachSkipped . ($pdfUrl !== null ? '; ссылка в письме: ' . $pdfUrl : '')]);
        }
        $status['client'] = ($client['ok'] === true);
        /* c99-fix (критик E1-m1): бейдж «PDF: …» — только у ДОСТАВЛЕННОГО
         * письма (иначе красный сбой рядом с бейджем «PDF: Фуршет» читается
         * как «клиент получил меню», хотя письма нет). Причина видна в
         * журнале почты (attach/detail). */
        $status['clientPdf'] = ($client['ok'] === true) ? $pdfLabel : null;
        if ($status['client'] !== true) {
            $status['clientErr'] = mail_error_class($client);
        }
    }
    return $status;
}

/** c98-FIX1 (критик2 E2): класс ошибки TG-канала для решения о ретрае.
 *  'dead'  — сетевой сбой (все базы молчат): канал «мёртв», повтор лишь
 *            сожжёт ещё один полный таймаут — не ретраим (E2-в);
 *  'crit'  — неверный токен/чат (401/404): повтор даст тот же ответ (E2-г);
 *  'retry' — прочее (429/5xx-API): транзиентно, ретрай оправдан. */
function tg_error_class(array $tg): string
{
    $err = (string)($tg['error'] ?? '');
    if ($err === 'network') {
        return 'dead';
    }
    if ($err === 'unauthorized') {
        return 'crit';
    }
    return 'retry';
}

/** c98-FIX1 (критик2 E2): класс ошибки почтового канала (SMTP→mail()-фолбэк).
 *  'dead'  — connect/таймаут/TLS: канал мёртв — не ретраим;
 *  'crit'  — неверный пароль/адрес (AUTH/MAIL FROM/RCPT отклонены, битый
 *            получатель, mail() отключена) — повтор даст тот же ответ;
 *  'retry' — сервер жив, но ответил «не сейчас» (sendmail-ик, фильтр). */
function mail_error_class(array $r): string
{
    if (($r['ok'] ?? false) === true) {
        return 'retry'; // не вызывается для доставленных — страховка слияния
    }
    $smtpErr = (string)($r['smtpError'] ?? '');
    if ($smtpErr !== '') {
        // SMTP пробовался и провалился, mail()-фолбэк тоже не спас
        if (in_array($smtpErr, ['smtp_timeout', 'connect_failed', 'tls_failed', 'starttls_failed'], true)) {
            return 'dead';
        }
        if (in_array($smtpErr, ['auth_failed', 'auth_user_rejected', 'auth_not_offered', 'mail_from_rejected', 'rcpt_rejected'], true)) {
            return 'crit';
        }
        return 'retry'; // bad_greeting / ehlo / data / message_rejected — сервер жив
    }
    if ((string)($r['transport'] ?? 'none') === 'none') {
        return 'crit'; // invalid_recipient / mail_disabled — конфигурация
    }
    return 'retry'; // чистый mail()-провал (sendmail не принял)
}

/**
 * c97 — обёртка над lead_notify_all: доставляет уведомления и дописывает
 * их статусы в сохранённую запись лида (leads.json). Возвращает true,
 * если доставлено хоть одно уведомление (критерий «принято» с c95).
 *
 * c98-A (непотеряемость): $background=true — вызов после
 * fastcgi_finish_request (клиент уже получил ответ): при полном провале
 * каналов один ретрай через 5с (транзиентные сетевые сбои часты), затем
 * форс-запись в mail-log.json с контекстом 'lead-notify-fail' — владелец
 * увидит в журнале и бейджах, что заявку нужно проверить руками.
 * Статусы lead.notify пишутся при ЛЮБОЙ попытке (не только успехе) —
 * красные бейджи в админке виднее молчания.
 *
 * c98-FIX1 (критик2 E2, MAJOR): wall-clock бюджет фоновой фазы ~45с
 * (микробюджет на каждый шаг — lead_notify_all сверяет перед каналом) и
 * умный ретрай: (в) только если бюджет ещё вмещает sleep(5)+попытку и
 * упали НЕ сетевые таймауты («мёртвый» канал не ретраим дважды);
 * (г) канал с критичной ошибкой (неверный пароль/токен/адрес) в ретрае
 * пропускается — повтор даст тот же ответ. Формат lead.notify НЕ изменён. */
function lead_notify_and_store_status(array $lead, bool $background = false): bool
{
    $t0 = microtime(true);
    $deadline = $t0 + 45.0; // c98-FIX1: бюджет всей фоновой фазы уведомлений

    $status = lead_notify_all($lead, $deadline);
    $any = ($status['tg'] ?? false) === true || ($status['mail'] ?? false) === true || ($status['client'] ?? null) === true;

    /* c98-A: оба основных канала (TG+mail) не доставлены → один ретрай
     * через 5с, но ТОЛЬКО в фоне — синхронный путь не должен держать
     * ответ клиента (fastcgi_finish_request уже отослал его).
     * c98-FIX1: ретраим ТОЛЬКО каналы с транзиентной ('retry') ошибкой —
     * 'dead'/'crit'/не-настроенные уходят в $skip; если ретраить нечего
     * или бюджет не вмещает sleep(5)+попытку — сразу к форс-логу. */
    if (!$any && $background && function_exists('fastcgi_finish_request')) {
        $skip = [];
        $anyRetry = false;
        foreach ([['tg', 'tgErr'], ['mail', 'mailErr'], ['client', 'clientErr']] as [$k, $errKey]) {
            if (($status[$k] ?? null) === true) {
                continue; // доставлен — не трогаем
            }
            if (($status[$errKey] ?? null) === 'retry') {
                $anyRetry = true; // транзиентная ошибка — кандидат на ретрай
            } else {
                $skip[] = $k; // dead / crit / не настроен / за бюджетом
            }
        }
        if ($anyRetry && microtime(true) + 6.0 < $deadline) {
            sleep(5);
            $status2 = lead_notify_all($lead, $deadline, $skip);
            // сливаем: доставленный канал из ретрая спасает итог
            foreach (['tg', 'mail', 'client'] as $k) {
                if (($status2[$k] ?? null) === true) {
                    $status[$k] = true;
                } elseif (($status[$k] ?? null) !== true) {
                    $status[$k] = $status2[$k] ?? ($status[$k] ?? null);
                }
            }
            if (is_string($status2['mailTransport'] ?? null) && !is_string($status['mailTransport'] ?? null)) {
                $status['mailTransport'] = $status2['mailTransport'];
            }
            /* c99-fix (критик crit1-F3): clientPdf/clientErr из РЕТРАЯ тоже
             * переносим — иначе письмо клиенту спасено ретраем (client=true),
             * а бейдж «PDF: …»/причина первого провала так и остались от
             * первой попытки (null) — админка врала бы о вложении. */
            if (is_string($status2['clientPdf'] ?? null) && !is_string($status['clientPdf'] ?? null)) {
                $status['clientPdf'] = $status2['clientPdf'];
            }
            if (is_string($status2['clientErr'] ?? null) && !is_string($status['clientErr'] ?? null)) {
                $status['clientErr'] = $status2['clientErr'];
            }
            $any = ($status['tg'] ?? false) === true || ($status['mail'] ?? false) === true || ($status['client'] ?? null) === true;
        }
    }

    /* c98-A: форс-запись в журнал почты — «уведомление о заявке не
     * доставлено НИ одним каналом» (tg+mail оба провалились). Заявка при
     * этом сохранена в leads.json — письмо призывает проверить руками. */
    if (($status['tg'] ?? false) !== true && ($status['mail'] ?? false) !== true) {
        $notifyEmail = (string)(load_settings()['notifyEmail'] ?: NOTIFY_EMAIL_FALLBACK);
        mail_log_append([
            'to' => $notifyEmail,
            'context' => 'lead-notify-fail',
            'subject' => 'Новая заявка — ' . $lead['name'] . ' (' . $lead['id'] . ')',
            'transport' => 'none',
            'ok' => false,
            'error' => 'ни Telegram, ни почта не доставили уведомление',
            'detail' => 'заявка СОХРАНЕНА в разделе «Заявки» — свяжитесь с клиентом вручную',
        ]);
    }

    /* c98-A: пишем статусы при любой попытке — раньше писали только при
     * успехе, и полный провал оставался невидимым в админке. */
    $attempted = ($status['tg'] ?? false) || ($status['mail'] ?? false) || ($status['client'] !== null)
        || ($status['tgAttempted'] ?? false) || ($status['mailAttempted'] ?? false);
    if ($attempted) {
        update_json_file(leads_path(), static function (array $leads) use ($lead, $status): ?array {
            foreach ($leads as $i => $l) {
                if (($l['id'] ?? null) === $lead['id']) {
                    $leads[$i]['notify'] = [
                        'ts' => time(),
                        'tg' => (bool)($status['tg'] ?? false),
                        'mail' => (bool)($status['mail'] ?? false),
                        'client' => isset($status['client']) ? (bool)$status['client'] : null,
                        'mailTransport' => is_string($status['mailTransport'] ?? null) ? $status['mailTransport'] : null,
                        /* c99: имя PDF-меню, прикреплённого к письму клиенту
                         * (null = без вложения) — бейдж «PDF: …» в «Заявках». */
                        'clientPdf' => is_string($status['clientPdf'] ?? null) ? $status['clientPdf'] : null,
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
 * (leads-archive.json, cap 5000). Возврат ['stored' => false] = сбой записи.
 *
 * c98-A (непотеряемость): битый leads.json НЕ затирается — update_json_file
 * переименует его в leads.corrupt-<Ymd-His>.json (все старые заявки
 * сохранены для восстановления) и передаст имя backup вторым аргументом
 * колбэка; новая запись получает rescuedFrom. Битый архив обрабатываем
 * так же: переименовать в leads-archive.corrupt-*.json, начать новый.
 *
 * c98-FIX1 (критик2 E1, CRITICAL — TOCTOU): дедуп по clientId выполняется
 * ВНУТРИ колбэка, под тем же LOCK_EX, что и запись (update_json_file).
 * До фикса: find_lead_by_client_id читал под LOCK_SH, лок отпускался, и
 * только потом store_lead брал LOCK_EX — check-then-act в двух скоупах:
 * два одновременных POST с одним clientId оба получали «не найдено» и оба
 * писали (7/24 раундов у критика — дубль заявки + двойные уведомления).
 * Теперь конкурент, записавшийся между быстрым dedup-чтением и этим
 * колбэком, здесь же и находится: запись отменяется, вызывающий получает
 * ['dedupe' => true, 'id' => <существующий>] и отвечает dedupe-успехом
 * БЕЗ записи и уведомлений.
 *
 * Возврат: ['stored' => bool, 'dedupe' => bool, 'id' => string]
 * (id — либо id нового лида, либо id найденного дубля). Аргументы не
 * менялись: clientId берётся из самого $lead (его кладёт lead.php), так
 * что внешние вызовы с clientId в записи получают атомарный дедуп
 * автоматически (тест-барьер E1b передаёт clientId ровно так).
 */
function store_lead(array $lead): array
{
    $clientId = is_string($lead['clientId'] ?? null) ? $lead['clientId'] : null;
    $dup = null; // найденный существующий лид — by-ref из колбэка
    $ok = update_json_file(leads_path(), static function (array $leads, ?string $rescuedFrom) use ($lead, $clientId, &$dup): ?array {
        if ($clientId !== null) {
            /* тот же скан, что find_lead_by_client_id: последние 300 записей
             * (новые в конце; резенд приходит следом за оригиналом), сверка
             * timing-safe. Под LOCK_EX — атомарно с записью ниже. */
            for ($i = count($leads) - 1, $seen = 0; $i >= 0 && $seen < 300; $i--, $seen++) {
                $l = $leads[$i];
                if (is_array($l) && is_string($l['clientId'] ?? null) && hash_equals($clientId, $l['clientId'])) {
                    $dup = $l;
                    return null; // дубль: отмена записи (update_json_file вернёт false)
                }
            }
        }
        if ($rescuedFrom !== null) {
            // спасение после битого файла — помечаем для владельца
            $lead['rescuedFrom'] = $rescuedFrom;
        }
        $leads[] = $lead;
        if (count($leads) > LEADS_CAP) {
            $overflowCount = count($leads) - LEADS_CAP;
            $overflow = array_splice($leads, 0, $overflowCount);
            // архив читаем/пишем без вложенного лока: все записи в архив
            // идут только под локом leads.json.lock (единственный писатель)
            $archPath = leads_archive_path();
            $archRaw = is_file($archPath) ? (string)@file_get_contents($archPath) : '';
            $arch = ($archRaw !== '') ? json_decode($archRaw, true) : [];
            /* $archWritable = можно писать по archPath. c98-FIX2 (критик5
             * MAJOR-2): @rename битого архива БЕЗ проверки оставлял файл на
             * месте — $arch=[] и write_json_atomic ЗАТИРАЛИ ещё живой битый
             * архив (до 5000 лидов). Теперь: rename не прошёл → архив НЕ
             * трогаем вовсе (fail-closed, как update_json_file с его
             * corrupt-rename), overflow уходит в страховочный файл ниже. */
            $archWritable = true;
            if (!is_array($arch)) {
                /* c98-A: битый архив не затираем — сохраняем содержимое в
                 * leads-archive.corrupt-<ts>.json и начинаем новый массив
                 * (иначе архивный файл потерял бы все 5000 записей). */
                if (strlen(trim($archRaw)) > 2) {
                    $archBackup = 'leads-archive.corrupt-' . date('Ymd-His') . '.json';
                    $archWritable = @rename($archPath, dirname($archPath) . '/' . $archBackup);
                }
                if ($archWritable) {
                    $arch = [];
                }
            }
            $archWritten = false;
            if ($archWritable) {
                $arch = array_merge($arch, $overflow);
                if (count($arch) > LEADS_ARCHIVE_CAP) {
                    $arch = array_slice($arch, count($arch) - LEADS_ARCHIVE_CAP);
                }
                /* c98-FIX2 (критик5 MAJOR-2): возврат write_json_atomic
                 * прежде ИГНОРИРОВАЛСЯ — overflow уже изъят из $leads, сбой
                 * записи архива (ENOSPC/права/каталог на месте archPath) =
                 * молчаливая потеря вытесненных лидов при ответе ok:true. */
                $archWritten = write_json_atomic($archPath, $arch);
            }
            if (!$archWritten) {
                /* Страховка: overflow в отдельный leads-overflow-<ts>.json
                 * (рядом с архивом; уникальный суффикс — параллельные сбои в
                 * одну секунду не затирают друг друга). Не записался и он
                 * (диск полон) — записи ВОЗВРАЩАЮТСЯ в $leads: leads.json
                 * временно сверх cap, архивация повторится при следующей
                 * заявке. НИ ОДИН лид не теряется молча при ok:true. */
                $rescuePath = dirname($archPath) . '/leads-overflow-'
                    . date('Ymd-His') . '-' . bin2hex(random_bytes(2)) . '.json';
                if (!write_json_atomic($rescuePath, $overflow)) {
                    $leads = array_merge($overflow, $leads);
                }
            }
        }
        return $leads;
    });
    return [
        'stored' => ($ok === true && $dup === null),
        'dedupe' => ($dup !== null),
        'id' => ($dup !== null) ? (string)($dup['id'] ?? '') : (string)$lead['id'],
    ];
}

/**
 * c98-A — найти заявку по clientId (идемпотентность ретраев). Смотрит
 * последние 300 записей leads.json (append снизу, новые в конце — идём
 * с конца и обрываем поиск: ретрай приходит следом за оригиналом).
 * Возвращает запись лида или null.
 */
function find_lead_by_client_id(string $clientId): ?array
{
    $leads = read_json_file(leads_path());
    if (!is_array($leads)) {
        return null;
    }
    for ($i = count($leads) - 1, $seen = 0; $i >= 0 && $seen < 300; $i--, $seen++) {
        $l = $leads[$i];
        if (is_array($l) && isset($l['clientId']) && is_string($l['clientId']) && hash_equals($clientId, $l['clientId'])) {
            return $l;
        }
    }
    return null;
}

/* ============ c100: красивые уведомления (TG + письма) ==================
 * Проблема c99 на проде: «Формат: Премиум» — письмо показывало только имя
 * пакета, ТИП мероприятия (Фуршет/Банкет/…) терялся (typeId — англ. id).
 * Теперь: один источник правды lead_format_label() → «Фуршет · Премиум»;
 * структура «секции» (Клиент / Мероприятие / Расчёт) — и в тексте, и в
 * HTML (multipart/alternative), и в Telegram. */

/**
 * c100 — «Фуршет · Премиум» одним ярлыком. Приоритет источников ярлыка
 * типа: payload.typeLabel (новый бандл) → payload.eventLabel (контактная
 * форма) → map по payload.typeId / payload.eventType (menu_type_label —
 * старый кэш-бандл без ярлыков). Пакет: payload.pkgName; если имя пакета
 * уже СОДЕРЖИТ ярлык типа (snack-box: «Доставка закусок (канапе,…)»),
 * не дублируем. undecided → «подберём вместе».
 */
function lead_format_label(array $p): ?string
{
    if (($p['undecided'] ?? null) === true) {
        return 'Ещё не выбран — подберём вместе';
    }
    $typeLabel = null;
    foreach (['typeLabel', 'eventLabel'] as $k) {
        if (isset($p[$k]) && is_string($p[$k]) && trim($p[$k]) !== '') {
            $typeLabel = trim($p[$k]);
            break;
        }
    }
    $tid = '';
    foreach (['typeId', 'eventType'] as $k) {
        if (isset($p[$k]) && is_string($p[$k]) && $p[$k] !== '') {
            $tid = $p[$k];
            break;
        }
    }
    if ($typeLabel === null && $tid !== '') {
        $typeLabel = menu_type_label($tid);
    }
    $pkg = (isset($p['pkgName']) && is_string($p['pkgName'])) ? trim($p['pkgName']) : '';
    if ($typeLabel !== null && $pkg !== '') {
        // pkg уже содержит ярлык типа (snack-box: «Доставка закусок (канапе,…)»)
        // → вернуть pkg целиком (он богаче), иначе склеить «Фуршет · Премиум»
        return stripos($pkg, $typeLabel) === false ? $typeLabel . ' · ' . $pkg : $pkg;
    }
    if ($typeLabel !== null) {
        return $typeLabel;
    }
    return $pkg !== '' ? $pkg : null;
}

/** c100 — дата заявки по-человечески: «25.09.2026 (пт)»; мусор → как есть. */
function lead_date_human(?string $iso): ?string
{
    if ($iso === null || $iso === '' || strlen($iso) < 10) {
        return ($iso !== null && $iso !== '') ? $iso : null;
    }
    $t = strtotime(substr($iso, 0, 10));
    if ($t === false) {
        return $iso;
    }
    $wd = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'][(int)date('w', $t)];
    return date('d.m.Y', $t) . ' (' . $wd . ')';
}

/** c100 — деньги: «123 456 ₽». */
function lead_money($n): string
{
    return number_format((float)$n, 0, ',', ' ') . ' ₽';
}

/**
 * c100 — строки деталей заявки [label => value] в порядке важности для
 * менеджера; null-значения выкидываются. Один источник для текста и HTML
 * писем: формат/гости/дата/время/расчёт/допуслуги/комментарий.
 */
function lead_detail_rows(array $lead): array
{
    $p = is_array($lead['payload'] ?? null) ? $lead['payload'] : [];
    $rows = [];
    $fmt = lead_format_label($p);
    if ($fmt !== null) {
        $rows['Формат'] = $fmt;
    }
    if (isset($p['guests']) && is_numeric($p['guests']) && (int)$p['guests'] > 0) {
        $rows['Гостей'] = (string)(int)$p['guests'];
    }
    $date = isset($p['dateIso']) && is_string($p['dateIso'])
        ? lead_date_human($p['dateIso'])
        : (isset($p['date']) && is_string($p['date']) ? lead_date_human($p['date']) : null);
    if ($date !== null) {
        $rows['Дата'] = $date;
    }
    if (!empty($p['preferredTime']) && is_string($p['preferredTime'])) {
        $rows['Время звонка'] = $p['preferredTime'];
    }
    $total = null;
    foreach (['total', 'calcTotal'] as $k) {
        if (isset($p[$k]) && is_numeric($p[$k])) {
            $total = (float)$p[$k];
            break;
        }
    }
    if ($total !== null && $total > 0) {
        $rows['Расчёт (предварительно)'] = lead_money($total);
    }
    /* Допуслуги: калькулятор шлёт addons[] («Аренда мебели (+20% ≈ 88 000 ₽)»),
     * контактная форма — calcAddons[] (голые названия). */
    $addons = [];
    foreach (['addons', 'calcAddons'] as $k) {
        if (isset($p[$k]) && is_array($p[$k])) {
            foreach ($p[$k] as $a) {
                if (is_string($a) && trim($a) !== '') {
                    $addons[] = trim($a);
                }
            }
        }
        if ($addons !== []) {
            break;
        }
    }
    if ($addons !== []) {
        $rows['Допуслуги'] = implode("\n— ", $addons);
    }
    if (!empty($lead['comment'])) {
        $rows['Комментарий'] = str_trunc($lead['comment'], 1000);
    }
    return $rows;
}

/** c100 — источник лида по-русски. */
function lead_source_label(string $source): string
{
    $labels = [
        'calculator' => 'Калькулятор',
        'contact' => 'Страница контактов',
        'footer' => 'Быстрая заявка (подвал)',
    ];
    return $labels[$source] ?? $source;
}

/** HTML-сообщение для Telegram (parse_mode=HTML, всё экранировано). */
function lead_tg_text(array $lead, ?string $clientPlan = null): string
{
    $e = 'tg_html_escape';
    $p = is_array($lead['payload']) ? $lead['payload'] : [];
    $L = '┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄';
    $lines = ['<b>НОВАЯ ЗАЯВКА · NILOV CATERING</b>', $L];
    $lines[] = '👤 <b>Имя:</b> ' . $e($lead['name']);
    $lines[] = '📞 <b>Телефон:</b> ' . $e($lead['phone']);
    if (!empty($lead['email'])) {
        $lines[] = '✉️ <b>Email:</b> ' . $e($lead['email']);
    }
    $lines[] = $L;
    $fmt = lead_format_label($p);
    if ($fmt !== null) {
        $lines[] = '🍽 <b>Формат:</b> ' . $e($fmt);
    }
    if (isset($p['guests']) && is_numeric($p['guests']) && (int)$p['guests'] > 0) {
        $lines[] = '👥 <b>Гостей:</b> ' . $e((string)(int)$p['guests']);
    }
    $date = isset($p['dateIso']) && is_string($p['dateIso'])
        ? lead_date_human($p['dateIso'])
        : (isset($p['date']) && is_string($p['date']) ? lead_date_human($p['date']) : null);
    if ($date !== null) {
        $lines[] = '📅 <b>Дата:</b> ' . $e($date);
    }
    if (!empty($p['preferredTime']) && is_string($p['preferredTime'])) {
        $lines[] = '🕐 <b>Время звонка:</b> ' . $e($p['preferredTime']);
    }
    foreach (['total', 'calcTotal'] as $k) {
        if (isset($p[$k]) && is_numeric($p[$k]) && (float)$p[$k] > 0) {
            $lines[] = '💰 <b>Расчёт:</b> ' . $e(lead_money((float)$p[$k]));
            break;
        }
    }
    $addons = [];
    foreach (['addons', 'calcAddons'] as $k) {
        if (isset($p[$k]) && is_array($p[$k])) {
            foreach ($p[$k] as $a) {
                if (is_string($a) && trim($a) !== '') {
                    $addons[] = trim($a);
                }
            }
        }
        if ($addons !== []) {
            break;
        }
    }
    if ($addons !== []) {
        $lines[] = '🧾 <b>Допуслуги:</b> ' . $e(implode('; ', $addons));
    }
    if (!empty($lead['comment'])) {
        $lines[] = '💬 <b>Комментарий:</b> ' . $e(str_trunc($lead['comment'], 500));
    }
    $lines[] = $L;
    if ($clientPlan !== null) {
        $lines[] = '📎 ' . $e($clientPlan);
    }
    $lines[] = '🌐 Источник: ' . $e(lead_source_label($lead['source']));
    $lines[] = '🆔 ' . $e($lead['id']) . ' · ' . $e(date('d.m.Y H:i', (int)$lead['ts']));
    return implode("\n", $lines);
}

/** Текст письма владельцу (plain-text часть; HTML — lead_owner_mail_html). */
function lead_mail_text(array $lead, ?string $clientPlan = null): string
{
    $rows = lead_detail_rows($lead);
    $rule = '─────────────────────────';
    $L = [];
    $L[] = 'НОВАЯ ЗАЯВКА — NILOV CATERING';
    $L[] = '№ ' . $lead['id'] . ' · ' . date('d.m.Y H:i', (int)$lead['ts']);
    $L[] = '';
    $L[] = 'КЛИЕНТ';
    $L[] = $rule;
    $L[] = 'Имя: ' . $lead['name'];
    $L[] = 'Телефон: ' . $lead['phone'];
    if (!empty($lead['email'])) {
        $L[] = 'Email: ' . $lead['email'];
    }
    $L[] = '';
    $L[] = 'МЕРОПРИЯТИЕ';
    $L[] = $rule;
    foreach ($rows as $k => $v) {
        if ($k === 'Комментарий') {
            continue;
        }
        $L[] = $k . ': ' . $v;
    }
    if (isset($rows['Комментарий'])) {
        $L[] = '';
        $L[] = 'КОММЕНТАРИЙ КЛИЕНТА';
        $L[] = $rule;
        $L[] = $rows['Комментарий'];
    }
    $L[] = '';
    $L[] = 'СЛУЖЕБНОЕ';
    $L[] = $rule;
    $L[] = 'Источник: ' . lead_source_label($lead['source']);
    if ($clientPlan !== null) {
        $L[] = $clientPlan;
    }
    $L[] = 'Ответьте на это письмо — ответ уйдёт клиенту напрямую.';
    return implode("\r\n", $L);
}

/** c100 — HTML-часть письма владельцу (в каркасе mail_html_wrap). */
function lead_owner_mail_html(array $lead, ?string $clientPlan = null): string
{
    $h = static function ($s): string {
        return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
    };
    $rows = lead_detail_rows($lead);
    $tr = '';
    foreach ($rows as $k => $v) {
        if ($k === 'Комментарий') {
            continue;
        }
        $tr .= '<tr>'
            . '<td style="padding:7px 0;font:13px/1.4 Arial,sans-serif;color:#8a8175;white-space:nowrap;vertical-align:top;width:170px;">' . $h($k) . '</td>'
            . '<td style="padding:7px 0;font:15px/1.5 Arial,sans-serif;color:#23201b;font-weight:bold;vertical-align:top;">' . nl2br($h($v)) . '</td>'
            . '</tr>';
    }
    $commentBlock = isset($rows['Комментарий'])
        ? '<div style="margin:18px 0 0;padding:14px 18px;background:#faf6ee;border-left:4px solid #d4a373;border-radius:0 8px 8px 0;">'
            . '<div style="font:12px/1.3 Arial,sans-serif;color:#8a8175;letter-spacing:1px;margin-bottom:6px;">КОММЕНТАРИЙ КЛИЕНТА</div>'
            . '<div style="font:15px/1.6 Arial,sans-serif;color:#3d3831;">' . nl2br($h($rows['Комментарий'])) . '</div></div>'
        : '';
    $phoneDigits = preg_replace('/[^0-9+]/', '', $lead['phone']);
    $inner = '<p style="margin:0 0 6px;font:13px/1.4 Arial,sans-serif;color:#8a8175;">№ ' . $h($lead['id']) . ' · ' . $h(date('d.m.Y H:i', (int)$lead['ts'])) . '</p>'
        . '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">'
        . '<tr><td colspan="2" style="padding:14px 0 2px;font:bold 12px/1.3 Arial,sans-serif;color:#d4a373;letter-spacing:2px;">КЛИЕНТ</td></tr>'
        . '<tr><td style="padding:7px 0;font:13px/1.4 Arial,sans-serif;color:#8a8175;width:170px;vertical-align:top;">Имя</td>'
        . '<td style="padding:7px 0;font:15px/1.5 Arial,sans-serif;color:#23201b;font-weight:bold;">' . $h($lead['name']) . '</td></tr>'
        . '<tr><td style="padding:7px 0;font:13px/1.4 Arial,sans-serif;color:#8a8175;vertical-align:top;">Телефон</td>'
        . '<td style="padding:7px 0;font:15px/1.5 Arial,sans-serif;"><a href="tel:' . $h($phoneDigits) . '" style="color:#23201b;font-weight:bold;text-decoration:none;">' . $h($lead['phone']) . '</a></td></tr>'
        . (!empty($lead['email'])
            ? '<tr><td style="padding:7px 0;font:13px/1.4 Arial,sans-serif;color:#8a8175;vertical-align:top;">Email</td>'
                . '<td style="padding:7px 0;font:15px/1.5 Arial,sans-serif;"><a href="mailto:' . $h($lead['email']) . '" style="color:#a97f3f;text-decoration:none;">' . $h($lead['email']) . '</a></td></tr>'
            : '')
        . '<tr><td colspan="2" style="padding:16px 0 2px;font:bold 12px/1.3 Arial,sans-serif;color:#d4a373;letter-spacing:2px;">МЕРОПРИЯТИЕ</td></tr>'
        . $tr
        . '</table>'
        . $commentBlock
        . '<div style="margin:20px 0 0;padding:12px 16px;background:#f4efe7;border-radius:8px;font:13px/1.5 Arial,sans-serif;color:#3d3831;">'
        . ($clientPlan !== null ? $h($clientPlan) . '<br>' : '')
        . 'Источник: ' . $h(lead_source_label($lead['source']))
        . '</div>'
        . '<p style="margin:16px 0 0;font:13px/1.5 Arial,sans-serif;color:#8a8175;">Ответьте на это письмо — ответ уйдёт клиенту напрямую (Reply-To).</p>';
    return mail_html_wrap('Новая заявка — ' . $lead['name'], $inner,
        'Письмо отправлено роботом сайта сразу после отправки формы.');
}

/**
 * c97 — подтверждение КЛИЕНТУ (уходит на email посетителя, если указан).
 * c99: $pdfLabel — имя прикреплённого PDF-меню (null = без вложения).
 * c100: полная переделка: секции «Что дальше» / копия заявки / контакты;
 * $pdfUrl — публичная ссылка на тот же PDF (фолбэк, если вложение не
 * отобразилось или письмо ушло без вложения).
 */
function lead_client_mail_text(array $lead, ?string $pdfLabel = null, ?string $pdfUrl = null): string
{
    $rows = lead_detail_rows($lead);
    $L = [
        'Здравствуйте, ' . $lead['name'] . '!',
        '',
        'Ваша заявка в NILOV CATERING принята — спасибо, что выбрали нас!',
        '',
        'ЧТО ДАЛЬШЕ',
        '─────────────────────────',
        '1. Менеджер перезвонит вам на ' . $lead['phone'],
        '   в течение 15 минут в рабочее время (09:00–21:00).',
    ];
    if ($pdfLabel !== null) {
        $L[] = '2. Меню вашего формата — во вложении этого письма:';
        $L[] = '   «' . $pdfLabel . '» (состав и цены — как на сайте).';
    } elseif ($pdfUrl !== null) {
        $L[] = '2. Меню вашего формата можно открыть здесь:';
        $L[] = '   ' . $pdfUrl;
    } else {
        $L[] = '2. Все меню и цены — на сайте: https://nilovcatering.ru';
    }
    $L[] = '3. Есть вопрос? Просто ответьте на это письмо —';
    $L[] = '   оно придёт нам напрямую.';
    if ($rows !== []) {
        $L[] = '';
        $L[] = 'ВАША ЗАЯВКА (копия)';
        $L[] = '─────────────────────────';
        foreach ($rows as $k => $v) {
            $L[] = '— ' . $k . ': ' . $v;
        }
    }
    $L[] = '';
    $L[] = 'НАШИ КОНТАКТЫ';
    $L[] = '─────────────────────────';
    $L[] = 'Телефон / WhatsApp: +7 (911) 941-72-05';
    $L[] = 'Telegram: https://t.me/nilov_catering';
    $L[] = 'Сайт: https://nilovcatering.ru';
    $L[] = '';
    $L[] = 'Хорошего дня!';
    $L[] = 'NILOV CATERING — кейтеринг, в котором чувствуют';
    return implode("\r\n", $L);
}

/** c100 — HTML-часть письма клиенту: что дальше + копия заявки + контакты. */
function lead_client_mail_html(array $lead, ?string $pdfLabel = null, ?string $pdfUrl = null): string
{
    $h = static function ($s): string {
        return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
    };
    $rows = lead_detail_rows($lead);
    /* Баннер меню: вложение есть — «смотрите во вложении»; нет — кнопка
     * «Открыть меню» на публичную ссылку того же PDF. */
    if ($pdfLabel !== null) {
        $menuBanner = '<div style="margin:18px 0;padding:16px 18px;background:#faf6ee;border:1px solid #e5d9c3;border-radius:10px;">'
            . '<div style="font:bold 15px/1.4 Arial,sans-serif;color:#23201b;">📎 Меню вашего формата — во вложении этого письма</div>'
            . '<div style="margin-top:6px;font:14px/1.5 Arial,sans-serif;color:#3d3831;">«' . $h($pdfLabel) . '» — состав и цены как на сайте; менеджер согласует детали при звонке.</div>'
            . '</div>';
    } elseif ($pdfUrl !== null) {
        $menuBanner = '<div style="margin:18px 0;padding:16px 18px;background:#faf6ee;border:1px solid #e5d9c3;border-radius:10px;text-align:center;">'
            . '<div style="font:bold 15px/1.4 Arial,sans-serif;color:#23201b;margin-bottom:10px;">Меню вашего формата</div>'
            . '<a href="' . $h($pdfUrl) . '" style="display:inline-block;padding:11px 26px;background:#d4a373;color:#23201b;font:bold 14px/1 Arial,sans-serif;border-radius:8px;text-decoration:none;">Открыть меню (PDF)</a>'
            . '</div>';
    } else {
        $menuBanner = '';
    }
    $rowsHtml = '';
    foreach ($rows as $k => $v) {
        $rowsHtml .= '<tr>'
            . '<td style="padding:8px 0;font:13px/1.4 Arial,sans-serif;color:#8a8175;white-space:nowrap;vertical-align:top;width:180px;">' . $h($k) . '</td>'
            . '<td style="padding:8px 0;font:15px/1.5 Arial,sans-serif;color:#23201b;font-weight:bold;vertical-align:top;">' . nl2br($h($v)) . '</td>'
            . '</tr>';
    }
    $copyBlock = $rowsHtml !== ''
        ? '<div style="margin:20px 0 0;font:bold 12px/1.3 Arial,sans-serif;color:#d4a373;letter-spacing:2px;">ВАША ЗАЯВКА (КОПИЯ)</div>'
            . '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">' . $rowsHtml . '</table>'
        : '';
    $inner = '<p style="margin:0 0 14px;">Здравствуйте, <b>' . $h($lead['name']) . '</b>!</p>'
        . '<p style="margin:0 0 4px;">Ваша заявка принята — спасибо, что выбрали нас. Вот что произойдёт дальше:</p>'
        . '<ol style="margin:12px 0 0;padding-left:22px;font:15px/1.8 Arial,sans-serif;color:#3d3831;">'
        . '<li><b>Менеджер перезвонит</b> на ' . $h($lead['phone']) . ' в течение 15 минут в рабочее время (09:00–21:00).</li>'
        . '<li><b>Меню вашего формата</b> — ' . ($pdfLabel !== null ? 'во вложении этого письма.' : ($pdfUrl !== null ? 'по кнопке ниже.' : 'на сайте nilovcatering.ru.')) . '</li>'
        . '<li><b>Есть вопрос?</b> Просто ответьте на это письмо — оно придёт нам напрямую.</li>'
        . '</ol>'
        . $menuBanner
        . $copyBlock
        . '<p style="margin:22px 0 0;font:15px/1.6 Arial,sans-serif;color:#3d3831;">Хорошего дня!<br>'
        . '<span style="font:bold 14px/1.4 Georgia,serif;color:#23201b;">NILOV CATERING</span> — кейтеринг, в котором чувствуют</p>';
    return mail_html_wrap('Ваша заявка принята', $inner,
        'Вы получили это письмо, потому что оставили заявку на nilovcatering.ru.');
}

