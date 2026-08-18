# Деплой на Timeweb Cloud (Российский хостинг)

> Инструкция для миграции с Vercel на Timeweb. Закон РФ: данные хранятся в РФ.

## Вариант 1: Node.js-приложение (рекомендуется)

Timeweb Cloud → «Облачные серверы» → создать Node.js-приложение.

### Шаги

1. **Создать сервер**:
   - Панель Timeweb → «Облачные приложения» → «Создать» → Node.js
   - Версия Node: 22.x
   - Репозиторий: `https://github.com/9xj89gzrtw-hue/newsite`
   - Ветка: `main`

2. **Настроить переменные окружения** (Панель → «Переменные окружения»):
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   NEXT_PUBLIC_SITE_URL=https://your-domain.ru
   NEXT_PUBLIC_YANDEX_METRIKA=12345678
   HOSTING_TARGET=timeweb
   ```
   - `DATABASE_URL` — строка подключения к PostgreSQL (Timeweb → «Базы данных» → PostgreSQL → создать → скопировать connection string)
   - `NEXT_PUBLIC_SITE_URL` — ваш домен
   - `NEXT_PUBLIC_YANDEX_METRIKA` — номер счётчика Яндекс.Метрики (создать на metrika.yandex.ru)

3. **Команды сборки** (Панель → «Настройки сборки»):
   ```
   Install:  bun install || npm install
   Build:    bun run build
   Start:    bun run start  (или: npx next start -p $PORT)
   ```

4. **База данных**:
   - Timeweb → «Базы данных» → PostgreSQL → создать
   - Скопировать `DATABASE_URL`
   - `db-push-if-set.js` автоматически создаст таблицы при сборке

5. **Домен**:
   - Timeweb → «Домены» → привязать домен
   - В DNS: A-запись → IP сервера
   - `NEXT_PUBLIC_SITE_URL` = ваш домен

### SSL (HTTPS)
Timeweb автоматически выдаёт Let's Encrypt сертификат. Включить в настройках домена.

---

## Вариант 2: Docker-контейнер

Timeweb → «Контейнеры» → создать из Dockerfile.

```bash
docker build -t interfood-catering .
docker run -d -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e NEXT_PUBLIC_SITE_URL=https://your-domain.ru \
  -e NEXT_PUBLIC_YANDEX_METRIKA=12345678 \
  --name catering \
  --restart unless-stopped \
  interfood-catering
```

---

## Вариант 3: VPS + PM2

Для выделенного сервера (Timeweb VPS):

```bash
# 1. Клонировать репо
git clone https://github.com/9xj89gzrtw-hue/newsite.git
cd newsite

# 2. Установить зависимости
curl -fsSL https://bun.sh/install | bash
bun install

# 3. Создать .env
cp .env.example .env
# отредактировать .env (DATABASE_URL, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_YANDEX_METRIKA)

# 4. Собрать
bun run build

# 5. Запустить через PM2
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save && pm2 startup
```

### Nginx reverse proxy (рекомендуется для VPS)

```nginx
server {
    listen 80;
    server_name your-domain.ru;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.ru;

    ssl_certificate /etc/letsencrypt/live/your-domain.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.ru/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# SSL через certbot
sudo certbot --nginx -d your-domain.ru
```

---

## Перенос БД (если уже была на Vercel Postgres)

```bash
# Экспорт с Vercel
pg_dump $VERCEL_DATABASE_URL > backup.sql

# Импорт на Timeweb Postgres
psql $TIMEWEB_DATABASE_URL < backup.sql
```

---

## Checklist перед запуском на Timeweb

- [ ] `NEXT_PUBLIC_SITE_URL` = новый домен
- [ ] `DATABASE_URL` = Timeweb PostgreSQL connection string
- [ ] `NEXT_PUBLIC_YANDEX_METRIKA` = номер счётчика
- [ ] `HOSTING_TARGET=timeweb`
- [ ] Заполнить реквизиты в `src/lib/config.ts` (ИНН, ОГРН, адрес)
- [ ] SSL включён (Let's Encrypt)
- [ ] `prisma db push` выполнен (таблица `Lead` создана)
- [ ] Тест: POST `/api/lead` → 201
- [ ] Яндекс.Метрика: добавить сайт, получить тег
- [ ] Яндекс.Вебмастер: добавить сайт, подтвердить права, загрузить sitemap.xml
