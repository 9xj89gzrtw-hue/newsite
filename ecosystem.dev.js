module.exports = {
  apps: [
    {
      name: "interfood-dev",
      script: "node_modules/.bin/next",
      args: "dev -p 3000",
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
