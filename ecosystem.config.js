module.exports = {
  apps: [
    {
      name: 'billy-burger-prod',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3040',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3040,
      },
    },
  ],
};
