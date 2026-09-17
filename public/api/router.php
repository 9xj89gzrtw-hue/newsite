<?php
declare(strict_types=1);

/**
 * c95 — роутер ТОЛЬКО для локальной разработки/смоука:
 *   php -S 127.0.0.1:3007 -t public public/api/router.php
 *
 * В проде (SpaceWeb, Apache + .htaccess) не используется: статику отдаёт
 * Apache, а /api/*.php исполняет mod_php напрямую.
 *
 * Поведение:
 *  - /api/<имя>.php → исполняем соответствующий файл из public/api/
 *    (кроме служебных _lib.php и router.php — они недоступны);
 *  - /server-data/… и /config/… → 404 (эмулируем RedirectMatch 404
 *    из основного .htaccess, чтобы dev вел себя как прод);
 *  - всё остальное → return false (встроенный сервер отдаст статику
 *    из docroot public/).
 */

$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($uri, PHP_URL_PATH);
if (!is_string($path) || $path === '') {
    $path = '/';
}

if (preg_match('#^/(server-data|config)(/|$)#', $path)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Not Found');
}

if (preg_match('#^/api/([A-Za-z0-9_-]+)\.php$#', $path, $m)) {
    $name = $m[1];
    if ($name === '_lib' || $name === 'router') {
        http_response_code(404);
        header('Content-Type: text/plain; charset=utf-8');
        exit('Not Found');
    }
    $file = __DIR__ . '/' . $name . '.php';
    if (is_file($file)) {
        require $file;
        return true;
    }
}

/* c95: чистые URL без расширения (/admin, /offer, /privacy, /terms) —
 * в проде это делает mod_rewrite (.htaccess), локально эмулируем:
 * путь без слэша и точки → пробуем <path>.html из docroot. */
if ($path !== '/' && !str_contains($path, '.') && !str_ends_with($path, '/')) {
    $docroot = $_SERVER['DOCUMENT_ROOT'] ?? getcwd();
    $try = $docroot . $path . '.html';
    if (is_file($try)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($try);
        return true;
    }
}

return false; // отдать статический файл из docroot (-t public)
