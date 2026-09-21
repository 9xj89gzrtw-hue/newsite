<?php
declare(strict_types=1);

/**
 * c102 — CRON-автоматизация «поиска клиентов без ручных действий».
 *
 * Три независимых механизма (настраиваются в админке → «Автоматизация»):
 *  1. ДАЙДЖЕСТ (autoDigest, вкл по умолчанию): первый запуск после 09:00
 *     шлёт владельцу сводку — новые заявки за сутки + список «ждут ответа».
 *     Каналы: Telegram (если настроен) + почта (notifyEmail). Пусто — молча.
 *  2. АВТО-ДОЖИМ КЛИЕНТА (autoFollowup, вкл по умолчанию): заявка старше
 *     24 ч, статус всё ещё «новая», есть email → клиенту уходит ОДНО
 *     письмо с тем же PDF-меню и кнопками связи (Telegram/WhatsApp/MAX),
 *     помечается followupTs — повторных писем не будет. Максимум 5 за
 *     запуск (шторм после простоя крона невозможен).
 *  3. НАПОМИНАНИЕ ВЛАДЕЛЬЦУ (autoNudge, ВЫКЛ по умолчанию): заявка не
 *     отмечена прочитанной дольше autoNudgeHours (1–24, дефолт 3) →
 *     короткий TG-пинг с теми же кнопками «Написать в Telegram». Максимум
 *     3 за запуск; TG уже пингует мгновенно, поэтому выключено по умолчанию.
 *
 * Запуск (SpaceWeb → Планировщик/Cron, каждые 15–30 минут):
 *   URL: https://nilovcatering.ru/api/cron.php?token=<32 hex>
 *   CLI: /usr/bin/php /home/<аккаунт>/nilovcatering.ru/public/api/cron.php <token>
 * Токен генерируется в админке («Автоматизация» → «Создать ссылку»),
 * хранится в server-data/settings.json (cronToken). null = cron выключен.
 *
 * Идемпотентность: состояние — server-data/cron-state.json (какой день
 * дайджеста отправлен, followupTs/nudgedTs прямо в заявках); повторный
 * запуск ничего не дублирует. Все письма журналируются в mail-log.json
 * (контексты cron-digest / lead-followup) — видны в админке.
 *
 * Безопасность: без токена — единый 403 (не раскрываем, включён ли cron);
 * hash_equals против тайминг-атак; Origin не нужен — дёргает планировщик
 * хостинга._rate-limit на параноидальный перебор — usleep 100–300 мс.
 */

/* lead.php сам подключает _lib.php и под guard'ом NILOV_LEAD_TESTS отдаёт
 * ТОЛЬКО функции (HTTP-обработчик заявок не запускается) — двойной include
 * _lib.php дал бы redeclare-fatal, поэтому подключаем один файл. */
define('NILOV_LEAD_TESTS', true);
require __DIR__ . '/lead.php';

/* Рабочие окна и дайджест — по Москве (сайт заявляет Europe/Moscow). */
date_default_timezone_set('Europe/Moscow');

$cli = PHP_SAPI === 'cli';
if ($cli) {
    $token = isset($argv[1]) && is_string($argv[1]) ? $argv[1] : '';
} else {
    header('X-Robots-Tag: noindex, nofollow');
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
        json_response(405, ['ok' => false, 'error' => 'method_not_allowed', 'detail' => 'GET only — URL для планировщика хостинга']);
    }
    $token = is_string($_GET['token'] ?? null) ? $_GET['token'] : '';
}

$settings = load_settings();
$expected = is_string($settings['cronToken'] ?? null) ? $settings['cronToken'] : '';
if ($expected === '' || !hash_equals($expected, strtolower(trim($token)))) {
    usleep(random_int(100000, 300000)); // перебор токенов не должен быть дешёвым
    json_response(403, ['ok' => false, 'error' => 'forbidden']);
}

@set_time_limit(120);

$state = read_json_file(cron_state_path()) ?? [];
$leads = array_values(array_filter(read_json_file(leads_path()) ?? [], 'is_array'));
$now = time();
$today = date('Y-m-d');
$result = ['ok' => true, 'digest' => false, 'followups' => 0, 'nudges' => 0, 'note' => null];

/* ================= 1. Ежедневный дайджест (после 09:00, раз в день) ===== */

if ($settings['autoDigest'] === true && (int)date('G') >= 9) {
    $day = (string)($state['lastDigestDay'] ?? '');
    if ($day !== $today) {
        $sent = cron_send_digest($leads, $settings, $now);
        $result['digest'] = $sent;
        /* День отмечаем ЛЮБЫМ исходом (пусто/успех/сбой каналов): повторные
         * запуски не должны терзать каналы ретраями целый день; сбой виден
         * в журнале почты (контекст cron-digest) — редкий случай, лечится
         * вручную запуском со свежим токеном/настройками. */
        $state['lastDigestDay'] = $today;
        $state['lastDigestTs'] = $now;
    }
}

/* ===================== 2. Авто-дожим клиента (24 ч) ===================== */

if ($settings['autoFollowup'] === true) {
    $ids = [];
    foreach ($leads as $l) {
        if (count($ids) >= 5) {
            break; // анти-шторм: после простоя крона не более 5 писем за запуск
        }
        $st = (string)($l['status'] ?? 'new');
        $email = is_string($l['email'] ?? null) ? $l['email'] : '';
        $ts = (int)($l['ts'] ?? 0);
        if ($st !== 'new' || $email === '' || $ts <= 0) {
            continue;
        }
        if (!empty($l['archived']) || !empty($l['followupTs'])) {
            continue; // в архиве/уже дожали — не беспокоим повторно
        }
        if (($now - $ts) < 86400) {
            continue; // ещё не «остыла» — менеджер мог просто не дозвониться
        }
        $ids[] = (string)$l['id'];
    }
    foreach ($ids as $id) {
        $lead = null;
        foreach ($leads as $l) {
            if ((string)($l['id'] ?? '') === $id) {
                $lead = $l;
                break;
            }
        }
        if ($lead === null) {
            continue;
        }
        $ok = cron_send_followup($lead, $settings);
        $result['followups']++;
        /* followupTs пишется и при неудачной доставке: одно письмо на заявку,
         * сбой виден в журнале почты — повторная отправка того же текста
         * через 15 минут не спасла бы конверсию, но раздражала бы клиента. */
        update_json_file(leads_path(), static function (array $cur) use ($id, $now, $ok): array {
            foreach ($cur as $i => $l) {
                if (is_array($l) && (string)($l['id'] ?? '') === $id) {
                    $cur[$i]['followupTs'] = $now;
                    $cur[$i]['followupOk'] = ($ok === true);
                    break;
                }
            }
            return $cur;
        });
        $state['lastFollowupId'] = $id;
        $state['lastFollowupTs'] = $now;
    }
}

/* ============== 3. Напоминание о зависших заявках (TG) =================== */

if ($settings['autoNudge'] === true && (int)date('G') >= 9 && (int)date('G') <= 21) {
    $hours = (int)$settings['autoNudgeHours'];
    $hours = ($hours >= 1 && $hours <= 24) ? $hours : 3;
    $nudged = 0;
    foreach ($leads as $l) {
        if ($nudged >= 3) {
            break;
        }
        if (!empty($l['archived']) || !empty($l['nudgedTs']) || ($l['read'] ?? false)) {
            continue;
        }
        $st = (string)($l['status'] ?? 'new');
        $ts = (int)($l['ts'] ?? 0);
        if ($st !== 'new' || $ts <= 0 || ($now - $ts) < $hours * 3600) {
            continue;
        }
        if (cron_send_nudge($l, $settings)) {
            $nudged++;
            $id = (string)$l['id'];
            update_json_file(leads_path(), static function (array $cur) use ($id, $now): array {
                foreach ($cur as $i => $l) {
                    if (is_array($l) && (string)($l['id'] ?? '') === $id) {
                        $cur[$i]['nudgedTs'] = $now;
                        break;
                    }
                }
                return $cur;
            });
            $state['lastNudgeId'] = $id;
            $state['lastNudgeTs'] = $now;
        }
    }
    $result['nudges'] = $nudged;
}

/* ------------------------------ состояние -------------------------------- */

$state['lastRunTs'] = $now;
$state['runs'] = (int)($state['runs'] ?? 0) + 1;
update_json_file(cron_state_path(), static fn (array $cur): array => array_merge(is_array($cur) ? $cur : [], $state));

json_response(200, $result + ['time' => date('c'), 'leadsTotal' => count($leads)]);

/* ============================== функции ================================== */

/** Заявки, созданные за последние 24 ч. */
function cron_leads_last_day(array $leads, int $now): array
{
    $out = [];
    foreach ($leads as $l) {
        $ts = (int)($l['ts'] ?? 0);
        if ($ts > 0 && ($now - $ts) <= 86400 && empty($l['archived'])) {
            $out[] = $l;
        }
    }
    return $out;
}

/** «Ждут ответа»: непрочитанные со статусом «новая», старше часа, не в архиве. */
function cron_leads_pending(array $leads, int $now): array
{
    $out = [];
    foreach ($leads as $l) {
        if (empty($l['archived']) && empty($l['read'])
            && (string)($l['status'] ?? 'new') === 'new'
            && ((int)($l['ts'] ?? 0)) > 0 && ($now - (int)$l['ts']) >= 3600) {
            $out[] = $l;
        }
    }
    return $out;
}

/** Короткая строка заявки для дайджеста/напоминания: «Мария · Фуршет · 3 ч». */
function cron_lead_line(array $l, int $now, bool $withPhone = false): string
{
    $p = is_array($l['payload'] ?? null) ? $l['payload'] : [];
    $parts = [(string)($l['name'] ?? 'Без имени')];
    $fmt = lead_format_label($p);
    if ($fmt !== null) {
        $parts[] = $fmt;
    }
    $line = implode(' · ', $parts);
    if ($withPhone) {
        $line .= ' — ' . (string)($l['phone'] ?? '');
    }
    $age = $now - (int)($l['ts'] ?? 0);
    if ($age > 0) {
        $h = (int)floor($age / 3600);
        $line .= ' · ' . ($h >= 1 ? $h . ' ч' . ' назад' : ((int)floor($age / 60)) . ' мин назад');
    }
    return $line;
}

/** Сколько часов назад создана заявка (для дайджеста «3 ч»). */
function cron_lead_age_h(array $l, int $now): string
{
    $age = $now - (int)($l['ts'] ?? 0);
    if ($age <= 0) {
        return '';
    }
    $h = (int)floor($age / 3600);
    return $h >= 24 ? floor($h / 24) . ' дн' : $h . ' ч';
}

/** Дайджест: TG + почта. true — хотя бы один канал доставлен (или пусто). */
function cron_send_digest(array $leads, array $settings, int $now): bool
{
    $last24 = cron_leads_last_day($leads, $now);
    $pending = cron_leads_pending($leads, $now);
    if ($last24 === [] && $pending === []) {
        return true; // пусто — не шумим
    }
    $e = 'tg_html_escape';
    $dateHuman = date('d.m.Y', $now);
    $sent = false;

    /* --- Telegram --- */
    $chatId = $settings['tgChatId'] ?? null;
    $token = $settings['tgBotToken'] ?? null;
    if (is_string($token) && $token !== '' && is_string($chatId) && $chatId !== '') {
        $lines = ['<b>📊 СВОДКА ЗА СУТКИ · NILOV CATERING</b>', ''];
        $lines[] = 'Новых заявок: <b>' . count($last24) . '</b> · ждут ответа: <b>' . count($pending) . '</b>';
        if ($pending !== []) {
            $lines[] = '┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄';
            $lines[] = '<b>⏳ Ждут ответа:</b>';
            $i = 1;
            foreach (array_slice($pending, 0, 8) as $l) {
                $fmt = lead_format_label(is_array($l['payload'] ?? null) ? $l['payload'] : []);
                $lines[] = $i++ . '. <b>' . $e((string)($l['name'] ?? '—')) . '</b>'
                    . ($fmt !== null ? ' · ' . $e($fmt) : '')
                    . ' — <code>' . $e((string)($l['phone'] ?? '')) . '</code>';
                $age = cron_lead_age_h($l, $now);
                if ($age !== '') {
                    $lines[] = '   ⏱ ' . $e($age) . ' без ответа';
                }
            }
            if (count($pending) > 8) {
                $lines[] = '… и ещё ' . (count($pending) - 8) . ' — все в админке';
            }
        }
        $lines[] = '┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄';
        $lines[] = 'Все заявки: nilovcatering.ru/admin';
        $r = tg_send_fb($token, tg_api_bases($settings, load_secrets(false) ?: []), $chatId, implode("\n", $lines));
        if ($r['ok'] === true) {
            $sent = true;
        }
    }

    /* --- Почта владельцу --- */
    $notifyEmail = (string)($settings['notifyEmail'] ?: NOTIFY_EMAIL_FALLBACK);
    if ($notifyEmail !== '') {
        $txt = ['СВОДКА ЗА СУТКИ — NILOV CATERING · ' . $dateHuman];
        $txt[] = 'Новых заявок за сутки: ' . count($last24);
        $txt[] = 'Ждут ответа (непрочитанные, статус «новая»): ' . count($pending);
        if ($last24 !== []) {
            $txt[] = '';
            $txt[] = 'НОВЫЕ ЗА СУТКИ';
            $txt[] = '─────────────────────────';
            foreach ($last24 as $l) {
                $txt[] = '— ' . cron_lead_line($l, $now, true);
            }
        }
        if ($pending !== []) {
            $txt[] = '';
            $txt[] = 'ЖДУТ ОТВЕТА';
            $txt[] = '─────────────────────────';
            foreach ($pending as $l) {
                $txt[] = '— ' . cron_lead_line($l, $now, true);
            }
        }
        $txt[] = '';
        $txt[] = 'Админка: https://nilovcatering.ru/admin';
        $subject = 'Сводка за сутки: ' . count($last24) . ' новых, ' . count($pending) . ' ждут ответа';
        $mail = mail_send($notifyEmail, $subject, implode("\r\n", $txt), null, 'cron-digest', [], cron_digest_html($last24, $pending, $now));
        mail_log_append(['to' => $notifyEmail, 'context' => 'cron-digest', 'subject' => $subject,
            'transport' => (string)($mail['transport'] ?? 'none'), 'ok' => ($mail['ok'] === true)]);
        if ($mail['ok'] === true) {
            $sent = true;
        }
    }
    return $sent;
}

/** HTML-версия дайджеста (в каркасе mail_html_wrap). */
function cron_digest_html(array $last24, array $pending, int $now): string
{
    $h = static fn ($s): string => htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
    $rows = static function (array $list, string $label) use ($now, $h): string {
        if ($list === []) {
            return '';
        }
        $tr = '';
        foreach ($list as $l) {
            $tr .= '<tr><td style="padding:7px 0;font:15px/1.5 Arial,sans-serif;color:#23201b;vertical-align:top;">'
                . nl2br($h(cron_lead_line($l, $now, true))) . '</td></tr>';
        }
        return '<tr><td colspan="2" style="padding:14px 0 2px;font:bold 12px/1.3 Arial,sans-serif;color:#d4a373;letter-spacing:2px;">' . $h($label) . '</td></tr>' . $tr;
    };
    $inner = '<p style="margin:0 0 6px;font:13px/1.4 Arial,sans-serif;color:#8a8175;">' . date('d.m.Y H:i', $now) . '</p>'
        . '<p style="margin:0 0 4px;font:16px/1.5 Arial,sans-serif;color:#3d3831;">Новых заявок за сутки: <b>' . count($last24) . '</b> · ждут ответа: <b>' . count($pending) . '</b></p>'
        . '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">'
        . $rows($last24, 'НОВЫЕ ЗА СУТКИ')
        . $rows($pending, 'ЖДУТ ОТВЕТА')
        . '</table>'
        . '<p style="margin:16px 0 0;font:13px/1.5 Arial,sans-serif;color:#8a8175;">Откройте админку, чтобы ответить: <a href="https://nilovcatering.ru/admin" style="color:#a97f3f;">nilovcatering.ru/admin</a></p>';
    return mail_html_wrap('Сводка за сутки', $inner, 'Письмо отправлено планировщиком сайта автоматически.');
}

/** Письмо-дожим клиенту: то же PDF-меню + каналы связи. */
function cron_send_followup(array $lead, array $settings): bool
{
    $p = is_array($lead['payload'] ?? null) ? $lead['payload'] : [];
    $pdfEntry = menu_pdf_for_payload($p);
    $pdfBytes = null;
    $pdfLabel = null;
    $pdfUrl = null;
    if ($pdfEntry !== null) {
        $bytes = menu_pdf_bytes($pdfEntry);
        if ($bytes !== null) {
            $pdfBytes = $bytes;
            $pdfLabel = (string)($pdfEntry['label'] ?? 'PDF-меню');
        }
        $file = (string)($pdfEntry['file'] ?? '');
        if ($file !== '') {
            $pdfUrl = 'https://' . MAIL_DOMAIN . '/menu-pdf/' . rawurlencode($file);
        }
    }
    $name = (string)($lead['name'] ?? '');
    $dateHuman = !empty($lead['ts']) ? date('d.m', (int)$lead['ts']) : null;
    $notifyEmail = (string)($settings['notifyEmail'] ?: NOTIFY_EMAIL_FALLBACK);

    $txt = [
        'Здравствуйте, ' . $name . '!',
        '',
        'Вы оставляли заявку на кейтеринг в NILOV CATERING' . ($dateHuman !== null ? ' (' . $dateHuman . ')' : '') . '.',
        'Мы могли не дозвониться — поэтому короткое письмо, чтобы ваша заявка не потерялась.',
        '',
        'ВАШ ЗАПРОС (копия)',
        '─────────────────────────',
    ];
    foreach (lead_detail_rows($lead) as $k => $v) {
        $txt[] = '— ' . $k . ': ' . $v;
    }
    $txt[] = '';
    $txt[] = 'ЧТО МОЖНО СДЕЛАТЬ СЕЙЧАС';
    $txt[] = '─────────────────────────';
    if ($pdfLabel !== null) {
        $txt[] = '1. Меню вашего формата — во вложении этого письма («' . $pdfLabel . '»).';
    } elseif ($pdfUrl !== null) {
        $txt[] = '1. Меню вашего формата: ' . $pdfUrl;
    } else {
        $txt[] = '1. Все меню и цены — на сайте: https://nilovcatering.ru';
    }
    $txt[] = '2. Ответьте на это письмо — оно придёт напрямую менеджеру.';
    $txt[] = '3. Или напишите нам в мессенджер (контакты ниже).';
    $txt[] = '';
    $txt[] = 'НАШИ КОНТАКТЫ';
    $txt[] = '─────────────────────────';
    $txt[] = 'Телефон / WhatsApp: ' . OWNER_PHONE_PRETTY;
    $txt[] = 'Telegram: ' . OWNER_TG_CHAT_URL;
    $txt[] = 'Макс (мессенджер MAX): ' . OWNER_MAX_PHONE_PRETTY;
    $txt[] = '   написать в MAX: ' . OWNER_MAX_URL;
    $txt[] = 'Сайт: https://nilovcatering.ru';
    $txt[] = '';
    $txt[] = 'Если мероприятие уже не актуально — просто проигнорируйте это письмо.';
    $txt[] = 'NILOV CATERING — кейтеринг, в котором чувствуют';

    $subject = 'Ваша заявка в NILOV CATERING — меню в приложении';
    $attachments = [];
    if ($pdfBytes !== null) {
        $attachments[] = [
            'bytes' => $pdfBytes,
            'name' => (string)($pdfEntry['fileName'] ?? 'menu.pdf'),
            'entry' => $pdfEntry,
        ];
    }
    $mail = mail_send(
        (string)$lead['email'],
        $subject,
        implode("\r\n", $txt),
        $notifyEmail !== '' ? $notifyEmail : null,
        'lead-followup',
        $attachments,
        cron_followup_html($lead, $pdfLabel, $pdfUrl)
    );
    mail_log_append([
        'to' => (string)$lead['email'],
        'context' => 'lead-followup',
        'subject' => $subject,
        'transport' => (string)($mail['transport'] ?? 'none'),
        'ok' => ($mail['ok'] === true),
        'attach' => ($mail['ok'] === true && $pdfBytes !== null) ? 1 : 0,
        'detail' => $pdfLabel !== null ? 'авто-дожим заявки ' . (string)$lead['id'] . '; меню: ' . $pdfLabel : 'авто-дожим заявки ' . (string)$lead['id'],
    ]);
    return $mail['ok'] === true;
}

/** HTML-версия письма-дожима. */
function cron_followup_html(array $lead, ?string $pdfLabel, ?string $pdfUrl): string
{
    $h = static fn ($s): string => htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
    $name = (string)($lead['name'] ?? '');
    $rowsHtml = '';
    foreach (lead_detail_rows($lead) as $k => $v) {
        $rowsHtml .= '<tr>'
            . '<td style="padding:8px 0;font:13px/1.4 Arial,sans-serif;color:#8a8175;white-space:nowrap;vertical-align:top;width:180px;">' . $h($k) . '</td>'
            . '<td style="padding:8px 0;font:15px/1.5 Arial,sans-serif;color:#23201b;font-weight:bold;vertical-align:top;">' . nl2br($h($v)) . '</td>'
            . '</tr>';
    }
    $menuBanner = '';
    if ($pdfLabel !== null) {
        $menuBanner = '<div style="margin:18px 0;padding:16px 18px;background:#faf6ee;border:1px solid #e5d9c3;border-radius:10px;">'
            . '<div style="font:bold 15px/1.4 Arial,sans-serif;color:#23201b;">📎 Меню вашего формата — во вложении этого письма</div>'
            . '<div style="margin-top:6px;font:14px/1.5 Arial,sans-serif;color:#3d3831;">«' . $h($pdfLabel) . '» — состав и цены как на сайте.</div></div>';
    } elseif ($pdfUrl !== null) {
        $menuBanner = '<div style="margin:18px 0;padding:16px 18px;background:#faf6ee;border:1px solid #e5d9c3;border-radius:10px;text-align:center;">'
            . '<div style="font:bold 15px/1.4 Arial,sans-serif;color:#23201b;margin-bottom:10px;">Меню вашего формата</div>'
            . '<a href="' . $h($pdfUrl) . '" style="display:inline-block;padding:11px 26px;background:#d4a373;color:#23201b;font:bold 14px/1 Arial,sans-serif;border-radius:8px;text-decoration:none;">Открыть меню (PDF)</a></div>';
    }
    /* Кнопки-«пилюли» мессенджеров — крупнее ссылок подвала: дожим должен
     * конвертировать в диалог одним тапом. */
    $pill = static fn (string $label, string $href, bool $dark = false): string =>
        '<a href="' . $href . '" style="display:inline-block;margin:4px 6px 4px 0;padding:12px 22px;'
        . 'background:' . ($dark ? '#23201b' : '#d4a373') . ';color:' . ($dark ? '#f4efe7' : '#23201b')
        . ';font:bold 14px/1 Arial,sans-serif;border-radius:8px;text-decoration:none;">' . $label . '</a>';
    $inner = '<p style="margin:0 0 10px;">Здравствуйте, <b>' . $h($name) . '</b>!</p>'
        . '<p style="margin:0 0 4px;">Вы оставляли заявку на кейтеринг — мы могли не дозвониться, и вот короткое письмо, чтобы она не потерялась.</p>'
        . $menuBanner
        . '<div style="margin:18px 0 0;font:bold 12px/1.3 Arial,sans-serif;color:#d4a373;letter-spacing:2px;">НАПИШИТЕ НАМ — ОТВЕТИМ СРАЗУ</div>'
        . '<div style="margin:8px 0 0;">'
        . $pill('📞 ' . OWNER_PHONE_PRETTY, 'tel:' . OWNER_PHONE_E164, true)
        . $pill('✈️ Telegram', OWNER_TG_CHAT_URL)
        . $pill('💬 WhatsApp', OWNER_WA_URL)
        . $pill('Ⓜ MAX', OWNER_MAX_URL)
        . '</div>'
        . ($rowsHtml !== ''
            ? '<div style="margin:20px 0 0;font:bold 12px/1.3 Arial,sans-serif;color:#d4a373;letter-spacing:2px;">ВАШ ЗАПРОС (КОПИЯ)</div>'
                . '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">' . $rowsHtml . '</table>'
            : '')
        . '<p style="margin:18px 0 0;font:13px/1.5 Arial,sans-serif;color:#8a8175;">Если мероприятие уже не актуально — просто проигнорируйте это письмо.</p>';
    return mail_html_wrap('Ваша заявка — не потерялась', $inner,
        'Вы получили это письмо, потому что оставляли заявку на nilovcatering.ru.');
}

/** Короткий TG-пинг о зависшей заявке (с теми же кнопками «Написать»). */
function cron_send_nudge(array $lead, array $settings): bool
{
    $chatId = $settings['tgChatId'] ?? null;
    $token = $settings['tgBotToken'] ?? null;
    if (!is_string($token) || $token === '' || !is_string($chatId) || $chatId === '') {
        return false; // напоминание — только TG-канал (почта для этого шумна)
    }
    $e = 'tg_html_escape';
    $p = is_array($lead['payload'] ?? null) ? $lead['payload'] : [];
    $fmt = lead_format_label($p);
    $lines = ['<b>⏰ ЗАЯВКА ЖДЁТ ОТВЕТА</b>', ''];
    $lines[] = '👤 <b>' . $e((string)($lead['name'] ?? '—')) . '</b>' . ($fmt !== null ? ' · ' . $e($fmt) : '');
    $lines[] = '📞 <code>' . $e((string)($lead['phone'] ?? '')) . '</code>';
    if (isset($p['guests']) && is_numeric($p['guests']) && (int)$p['guests'] > 0) {
        $lines[] = '👥 ' . $e((string)(int)$p['guests']) . ' гостей';
    }
    $lines[] = 'Заявка от ' . $e(date('d.m H:i', (int)($lead['ts'] ?? 0))) . ' ещё не отмечена обработанной.';
    $pdfEntry = menu_pdf_for_payload($p);
    $pdfUrl = null;
    if ($pdfEntry !== null && (string)($pdfEntry['file'] ?? '') !== '') {
        $pdfUrl = 'https://' . MAIL_DOMAIN . '/menu-pdf/' . rawurlencode((string)$pdfEntry['file']);
    }
    $r = tg_send_fb($token, tg_api_bases($settings, load_secrets(false) ?: []), $chatId,
        implode("\n", $lines), 2, lead_tg_buttons($lead, $pdfUrl));
    return $r['ok'] === true;
}
