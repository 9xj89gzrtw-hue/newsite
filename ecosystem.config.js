// PM2 ecosystem — dev server for Interfood Catering (newsite)
// Start: pm2 start ecosystem.config.js
// Save:  pm2 save && pm2 startup
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
      },
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
