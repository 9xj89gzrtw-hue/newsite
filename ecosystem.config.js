// PM2 ecosystem — for Timeweb Cloud (Node.js app) or any VPS with PM2.
// Start: pm2 start ecosystem.config.js --env production
// Save:  pm2 save && pm2 startup

module.exports = {
  apps: [
    {
      name: "interfood-catering",
      script: ".next/standalone/server.js",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // Set these in Timeweb control panel or .env file:
        // DATABASE_URL: "postgresql://...",
        // NEXT_PUBLIC_SITE_URL: "https://your-domain.ru",
        // NEXT_PUBLIC_YANDEX_METRIKA: "12345678",
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
