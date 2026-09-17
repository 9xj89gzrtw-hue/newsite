# public/config/ — серверные секреты админки (c95)

Здесь живёт `secrets.php` — массив с GitHub-токеном, bcrypt-хэшем пароля
админки и HMAC-ключом сессии. Читает его `public/api/_lib.php → load_secrets()`.

## Откуда берётся файл

- **На хостинге (SpaceWeb)** его создаёт CI: `.github/workflows/deploy.yml`
  по SSH пишет файл из GitHub Actions Secrets
  (`ADMIN_GH_TOKEN`, `ADMIN_PASSWORD_HASH`, `ADMIN_HMAC_KEY`).
  Он не участвует в rsync-деплое и не попадает в git.
- **Локально** для тестов положите рядом `secrets.php` по образцу
  `secrets.example.php` (токен разработки, hash пароля, hmac-ключ).
  `.gitignore` уже исключает `public/config/secrets.php`.

## Доступ из веба

Закрыт двумя независимыми механизмами:

1. `RedirectMatch 404 ^/(server-data|config)(/.*)?$` в корневом `public/.htaccess`;
2. `Require all denied` в `.htaccess` этого каталога (Apache 2.4,
   без директив 2.2 — их нельзя смешивать на SpaceWeb).
