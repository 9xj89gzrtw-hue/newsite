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
        $tg = tg_send_fb($token, tg_api_bases($settings, $secrets), $chatId, lead_tg_text($lead), 2);
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
     * каталог. Файл отсутствует/большой 2МБ — письмо уходит БЕЗ вложения
     * (доставка текста важнее вложения), пропуск журналируется
     * ('attachSkipped') и виден в mail-log админки. */
    if (!in_array('client', $skip, true)
        && is_string($lead['email']) && $lead['email'] !== '' && $inBudget()) {
        $attachments = [];
        $attachLabel = null;
        $attachSkipped = null;
        $p = is_array($lead['payload']) ? $lead['payload'] : [];
        $pdfEntry = menu_pdf_for_payload($p);
        if ($pdfEntry !== null) {
            $bytes = menu_pdf_bytes($pdfEntry);
            if ($bytes !== null) {
                $attachments[] = [
                    'bytes' => $bytes,
                    'name' => (string)($pdfEntry['fileName'] ?? 'menu.pdf'),
                    'entry' => $pdfEntry,
                ];
                $attachLabel = (string)($pdfEntry['label'] ?? 'PDF-меню');
            } else {
                $attachSkipped = 'pdf_file_missing_or_too_large';
            }
        } else {
            $attachSkipped = 'no_manifest';
        }
        $client = mail_send(
            $lead['email'],
            'Ваша заявка в NILOV CATERING принята',
            lead_client_mail_text($lead, $attachLabel),
            $notifyEmail !== '' ? $notifyEmail : null,
            'lead-client',
            $attachments
        );
        if ($attachSkipped !== null) {
            /* Пропуск вложения — НЕ ошибка доставки, но владелец должен
             * видеть это в журнале (иначе «почему без меню?» — загадка).
             * c99-fix (критик E1-m1): ok — фактический итог письма (а не
             * безусловный true): при сбое доставки строка журнала не
             * должна выглядеть зелёной поверх реальной ошибки. */
            mail_log_append(['to' => $lead['email'], 'context' => 'lead-client',
                'subject' => 'Ваша заявка в NILOV CATERING принята',
                'transport' => (string)($client['transport'] ?? 'none'),
                'ok' => ($client['ok'] === true), 'attach' => 0,
                'error' => $client['ok'] === true ? null : mail_error_class($client),
                'detail' => 'attachSkipped: ' . $attachSkipped]);
        }
        $status['client'] = ($client['ok'] === true);
        /* c99-fix (критик E1-m1): бейдж «PDF: …» — только у ДОСТАВЛЕННОГО
         * письма (иначе красный сбой рядом с бейджем «PDF: Фуршет» читается
         * как «клиент получил меню», хотя письма нет). Причина видна в
         * журнале почты (attach/detail). */
        $status['clientPdf'] = ($client['ok'] === true) ? $attachLabel : null;
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
 * c99: $pdfLabel — имя прикреплённого PDF-меню (null = без вложения):
 * строка «во вложении — меню…» стоит ДО контактов, чтобы клиент заметил.
 */
function lead_client_mail_text(array $lead, ?string $pdfLabel = null): string
{
    $p = is_array($lead['payload']) ? $lead['payload'] : [];
    $lines = [
        'Здравствуйте, ' . $lead['name'] . '!',
        '',
        'Ваша заявка на сайте nilovcatering.ru получена — спасибо!',
        'Мы свяжемся с вами по телефону ' . $lead['phone'] . ' в ближайшее время.',
        '',
    ];
    if ($pdfLabel !== null) {
        $lines[] = 'ВО ВЛОЖЕНИИ — МЕНЮ ВАШЕГО ФОРМАТА: ' . $pdfLabel . '.';
        $lines[] = 'Состав и цены — как на сайте; менеджер согласует детали при звонке.';
        $lines[] = '';
    }
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
    $lines[] = 'Команда NILOV CATERING — кейтеринг, в котором чувствуют';
    return implode("\r\n", $lines);
}
