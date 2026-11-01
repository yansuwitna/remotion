module.exports = {
  apps: [
    {
      name: 'remotion-autostudio',
      script: 'server.js',
      // Gunakan mode fork dan 1 instance agar background scheduler cron tidak dieksekusi ganda
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      // Restart otomatis jika konsumsi RAM melebihi 1.5 GB setelah banyak proses render
      max_memory_restart: '1500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Penanganan restart jika terjadi error
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000
    }
  ]
};
