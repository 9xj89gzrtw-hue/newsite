/**
 * c95: pm2-конфиг dev-сервера сайта (порт 3001 — §3 AGENTS.md).
 * Порт 3000 занят родительским sandbox — НЕ ТРОГАТЬ.
 * Прод: nilovcatering.ru (SpaceWeb, статический экспорт) + зеркало Vercel.
 */
module.exports = {
  apps: [
    {
      name: "interfood-catering-dev",
      script: "node_modules/.bin/next",
      args: "dev -p 3001",
      cwd: __dirname,
      env: { NODE_ENV: "development" },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "1G",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      watch: false,
    },
  ],
};
