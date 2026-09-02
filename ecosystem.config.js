// PM2 ecosystem — dev server for Interfood Catering (newsite)
// Start: pm2 start ecosystem.config.js
// Save:  pm2 save && pm2 startup
//
// PORT MAP (Cycle 37, this machine):
//   3000 — parent sandbox my-project (DO NOT TOUCH)
//   3001 — THIS app, interfood-catering-dev (newsite)
module.exports = {
  apps: [
    {
      name: "interfood-catering-dev",
      script: "node_modules/next/dist/bin/next",
      args: "dev -p 3001",
      cwd: __dirname,
      env: {
        NODE_ENV: "development",
        PORT: 3001,
        // Cycle 70: sqlite dev-БД newsite (absolute — prisma walks up for .env,
        // parent sandbox .env must NOT capture this var)
        DATABASE_URL: "file:/home/z/my-project/newsite/db/custom.db",
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      // Cycle 70: 1G бил — Turbopack-компиляции поднимали RSS >1G → pm2
      // рестартил (↺55). 1600M на машине 4.1G — безопасно (pm7 не парсит «1.6G»).
      max_memory_restart: "1600M",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      watch: false,
    },
  ],
};
