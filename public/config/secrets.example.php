<?php
declare(strict_types=1);

/**
 * c95 — ШАБЛОН серверных секретов админки.
 *
 * ЭТОТ ФАЙЛ НЕ СОДЕРЖИТ СЕКРЕТОВ и коммитится как документация.
 * Реальный public/config/secrets.php на хостинге создаёт CI
 * (.github/workflows/deploy.yml, шаг по SSH) из GitHub Actions Secrets:
 *
 *   ADMIN_GH_TOKEN       — classic PAT, scope `repo` (Contents API: чтение/
 *                          запись menu.json, чтение actions/runs)
 *   ADMIN_PASSWORD_HASH  — bcrypt ($2y$) хэш пароля входа в админку,
 *                          password_hash($pw, PASSWORD_BCRYPT, cost 12)
 *   ADMIN_HMAC_KEY       — 64 hex-символа для подписи сессионной cookie
 *                          (openssl rand -hex 32)
 *
 * Файл secrets.php исключён из rsync-деплоя и из git (.gitignore):
 * он существует ТОЛЬКО на хостинге (и локально у разработчика для
 * тестов — тоже не коммитится).
 *
 * Формат: PHP-файл, возвращающий массив (именно return, не define —
 * его читает load_secrets() в public/api/_lib.php).
 */

return [
    // GitHub classic PAT (scope: repo). Пусто → админка вернёт not_configured.
    'gh_token' => '',

    // Репозиторий-«база данных» меню (owner/name).
    'gh_repo' => '9xj89gzrtw-hue/newsite',

    // Путь к файлу меню ВНУТРИ репозитория (ветка main).
    'gh_path' => 'src/data/menu.json',

    // HMAC-ключ сессии (64 hex). Пусто/короче 32 символов → логин запрещён.
    'hmac_key' => '',

    // bcrypt-хэш пароля по умолчанию ($2y$…). Может быть перекрыт
    // server-data/settings.json (passwordHash) после смены пароля в UI.
    'password_hash_default' => '',

    // База Telegram Bot API. Можно заменить зеркалом/self-hosted
    // (api.telegram.org из РФ нестабилен с 03.2026 — R-REPORT §1).
    'tg_api_base' => 'https://api.telegram.org',

    // От кого уходят письма-уведомления (ящик ДОМЕНА сайта — SPF/DMARC).
    'notify_from' => 'noreply@nilovcatering.ru',
];
