# public/api/ — серверный PHP-API админки и заявок (c95)

PHP ≥ 8.1 без фреймворков, живёт в статик-экспорте Next.js на SpaceWeb
(Apache 2.4 за nginx-фронтом; SSL терминирует nginx, поэтому cookie всегда
`Secure`, а `$_SERVER['HTTPS']` у Apache пуст — на это не опираться).

Общие свойства всех ответов: `Content-Type: application/json; charset=utf-8`,
`X-Robots-Tag: noindex`, `Cache-Control: no-store`. Тело запроса — JSON
(`read_json_body`), все входы ограничены по размеру/типу.

## Состав

| Файл        | Назначение |
|-------------|------------|
| `_lib.php`  | Общий bootstrap (подключается только после `define('NILOV_API', true)`; прямой HTTP-доступ → 404). Секреты, настройки, flock+atomic JSON-хранилище, rate-limit, сессия, curl/TG/GitHub/mail-хелперы. |
| `lead.php`  | Публичный приём заявок. |
| `admin.php` | Единый эндпоинт админки, роутер по `?action=`. |
| `vars.php`  | c99-C: публичные переменные аналитики (Метрика/GA4/пиксели) для рантайм-загрузки статик-экспортом. |
| `router.php`| Только для локальной разработки (`php -S … router.php`), в проде не используется. |

## POST /api/lead.php — заявка (без авторизации)

Защита: same-origin (Origin ∈ allowlist: прод / localhost:3001 /
localhost:3005 / зеркало Vercel; c98-A: same-origin Origin достаточен и БЕЗ
`X-Requested-With` — так проходят sendBeacon-запросы; без Origin XRW обязателен,
как раньше); rate-limit 12/час и 60/сутки на IP (c98-A: было 6/30) + глобальный
120/час; honeypot ИЛИ `elapsedMs<1500` → фейковый `ok:true` + запись в
`server-data/spam-log.json` (c98-A: раньше молчаливая смерть — реальный клиент
терялся без следа; ОТСУТСТВУЮЩИЙ `elapsedMs` больше НЕ ловушка — старый
кэш-бандл не слал поле).

Тело: `name` (1–100), `phone` (7–25, ≥9 цифр), `source` ∈
`calculator|contact|footer`, `consent:true`; опционально `email` (≤120),
`comment` (≤2000), `payload` (объект ≤8 КБ: typeId, guests, dateIso, pkgName,
addonIds, total, preferredTime, undecided, …), `honeypot`, `elapsedMs`,
`clientId` (c98-A: UUID v4, 8–64 hex — идемпотентность: ретрай/sendBeacon-дубль
с тем же clientId возвращает `200 {ok:true,id,dedupe:true}` без повторной
записи и уведомлений; хранится в записи лида).

Ответы: `200 {ok:true,id[,dedupe:true]}` · `400 {error:validation|bad_json|too_large}`
· `403 {error:origin}` · `405` · `429 {error:rate,retryAfterSec}` ·
`500 {error:delivery}` — только если заявка НЕ записана и ни одно уведомление
(Telegram + mail) не доставлено (клиент переключается на mailto-фолбэк).

Хранение: `server-data/leads.json` (cap 1000; старейшие → `leads-archive.json`,
cap 5000). c98-A: битый `leads.json`/`leads-archive.json` НЕ затирается —
бэкапится в `<имя>.corrupt-<Ymd-His>.json`, новая заявка получает
`rescuedFrom` (защита от «весь файл заявок перезаписан одной строкой»).
Полный провал уведомлений → `lead.notify`-статусы (✕✕ в админке) + запись
`lead-notify-fail` в mail-log.json + один ретрай через 5с в фоне после
`fastcgi_finish_request`. Полный IP не хранится — только md5-префикс. Уведомления: Telegram
Bot API (если в настройках есть токен+chat_id; API-base переопределяемый) +
почта через `mail_send()` (SMTP из настроек → фолбэк `mail()`) на
`settings.notifyEmail` (фолбэк `NOTIFY_EMAIL_FALLBACK`). c97: клиенту с email
уходит подтверждение (копия расчёта + контакты, Reply-To — владелец);
статусы доставки пишутся в запись лида (`notify: {tg,mail,client,mailTransport}`)
и в журнал `server-data/mail-log.json` (cap 300). Почтовые письма всегда
с Date/Message-ID (без них Gmail отбраковывает) и encoded-word-темой
чанками ≤ 75 байт.

## GET /api/vars.php — переменные аналитики (без авторизации, c99-C)

Рантайм-мост «админка → статик-экспорт»: владелец меняет счётчики в
«Настройках», сайт подхватывает их без пересборки (fetch из
src/lib/analytics.ts после cookie-consent; 152-ФЗ: до согласия ноль
запросов). Ответ собирается ЯВНЫМ списком полей — секреты
(tgBotToken/smtpPass/passwordHash) физически не попадают в этот
эндпоинт. В отличие от остальных эндпоинтов: `Cache-Control: public,
max-age=300` (анонимные данные; смена настроек видна ≤5 мин),
rate-limit не нужен (чистое чтение settings.json под LOCK_SH).

Ответ: `200 {ok:true, metrikaId:string|null, webvisor:bool,
clickmap:bool, gaId:string|null, customHead:string|null}` · `405`
(не GET). metrikaId — только цифры 5–10; gaId — `G-…` (мусор → null
на уровне load_settings). Пустой metrikaId = сайт использует env-ID
из деплоя (NEXT_PUBLIC_YANDEX_METRIKA_ID).

## /api/admin.php?action=… — админка

Аутентификация: пароль → bcrypt-проверка (`settings.passwordHash` или
`secrets.password_hash_default`) → HMAC-cookie `nilov_admin` (12 ч,
`Secure; HttpOnly; SameSite=Strict`), значение `<exp>.<hmac_sha256(exp)>`.

| action         | Метод | Auth | Тело / параметры | Ответ |
|----------------|-------|------|------------------|-------|
| `login`        | POST  | —    | `{password}`     | `200 {ok,expiresAt}` + cookie · `401 bad_password` · `429 locked` (8/15 мин) |
| `logout`       | POST  | —    | —                | `200 {ok:true}` (cookie сброшена) |
| `session`      | GET   | —    | —                | `200 {ok,expiresAt}` \| `401` |
| `data`         | GET   | ✓    | —                | `200 {ok,menu,sha,repo,path}` · `502 github` |
| `save`         | POST  | ✓    | `{menu,message?,sha?}` | `200 {ok,commitSha,htmlUrl}` · `409 conflict` (sha устарел → перезагрузить) · `400 validation` (структура меню: menuTypes 1–12, пакеты 1–6, pricePerGuest 100–100000, ≤400 КБ) · `502 github` |
| `status`       | GET   | ✓    | `&sha=<commit>`  | `200 {ok,state:unknown\|building\|success\|failure,htmlUrl?,runStartedAt?,deployedAt?}` (Actions runs по head_sha + filemtime public/data/menu.json) |
| `leads`        | GET   | ✓    | `&limit=1..500&offset` | `200 {ok,total,leads[]}` (новые сверху) |
| `lead-update`  | POST  | ✓    | `{id,read?,archived?}` | `200` \| `404` |
| `lead-delete`  | POST  | ✓    | `{id}`           | `200` \| `404` |
| `settings`     | GET/POST | ✓ | GET — чтение; POST `{notifyEmail?,tgChatId?,tgApiBase?,tgBotToken?,clearBotToken?,smtpHost?,smtpPort?,smtpUser?,smtpPass?,clearSmtpPass?,smtpFrom?,metrikaId?,metrikaWebvisor?,metrikaClickmap?,gaId?,customHeadHtml?}` (пустой smtpPass НЕ затирает; c99-C: metrikaId/gaId с мягкой нормализацией — мусор → null; customHeadHtml ≤ 8000 и без `</textarea`) | GET: `{notifyEmail,tgChatId,tgApiBase,botTokenSet,botTokenMasked,smtpHost,smtpPort,smtpUser,smtpFrom,smtpSet,smtpPassMasked,metrikaId,metrikaWebvisor,metrikaClickmap,gaId,customHeadHtml}` (токен и пароль только маской; ID аналитики — публичны, без масок) · POST: `200 {ok}` \| `400 validation` |
| `tg-check`     | POST  | ✓    | `{token?}` (иначе сохранённый) | `200 {ok:true,botName,botUsername}` \| `200 {ok:false,error:unauthorized\|network}` (getMe) |
| `tg-discover`  | POST  | ✓    | —                | `200 {ok,chats:[{id,name,type}],hint?}` (getUpdates; напишите боту сообщение) |
| `tg-test`      | POST  | ✓    | `{chatId?,token?}` | `200 {ok:true}` \| `200 {ok:false,error,retryAfterSec?}` (sendMessage) |
| `mail-test`    | POST  | ✓    | `{to?}` (иначе notifyEmail/фолбэк) | `200 {ok,to,transport,error?,detail?}` — тестовое письмо тем же каналом, что заявки (rate 10/час) |
| `mail-log`     | GET   | ✓    | `&limit=1..50` (по умолчанию 10) | `200 {ok,entries:[{ts,to,context,subject,transport,ok,error?}]}` (новые сверху; c98-A: контекст `lead-notify-fail` = уведомление о заявке не доставлено ни одним каналом) |
| `spam-log`     | GET   | ✓    | `&limit=1..50` (по умолчанию 5)  | c98-A: `200 {ok,entries:[{ts,reason,elapsedMs,name,phone,email?,comment?,source,clientId?}]}` — сабмиты, пойманные honeypot/elapsed-ловушками (новые сверху) |
| `password`     | POST  | ✓    | `{current,new}`  | `200 {ok}` · `401 bad_password` · `429 locked` (5/час) · `400 validation` (новый 8–128) |

Неизвестный action → `404 {error:unknown_action}`.

## Конфигурация и данные

- `../config/secrets.php` — см. `public/config/README.md` (пишет CI;
  в git не попадает). Отсутствует → `login`/admin-действия отвечают
  `500 {error:"not_configured"}` (кроме `lead.php` — он работает и без
  секретов, просто без TG/mail-уведомлений).
- `../server-data/` — runtime: `settings.json`, `leads.json`,
  `leads-archive.json`, `spam-log.json` (c98-A, cap 300), `mail-log.json`,
  `*.corrupt-*.json` (c98-A: спасённые битые файлы), `rl-*.json` (счётчики
  rate-limit). Закрыт из веба
  (`Require all denied` + RedirectMatch 404 в корневом .htaccess).
  При деплое rsync пишет каталог заново, но `--delete` затирает только файлы,
  которых нет в экспорте — server-data живёт между деплоями (заявки теряются
  только при ручной чистке).

## Модель публикации меню

`data` читает `src/data/menu.json` из ветки main (GitHub Contents API,
base64 + sha), `save` делает GET→сверка sha→PUT (коммит в main) — дальше
деплой-воркфлоу пересобирает статик-экспорт и rsync'ит его на хостинг;
`status` поллит Actions runs по `head_sha` коммита из ответа `save`.
Параллельные записи GitHub сериализует сам (409 при гонке), клиент при
`conflict` обязан перечитать `data`.
