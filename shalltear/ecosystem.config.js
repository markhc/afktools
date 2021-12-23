const join = require('path').join;

module.exports = {
  apps: [
    {
      name: 'Shalltear',
      script: './shalltear/build/index.js',
      autorestart: true,
      env: {
        NODE_ENV: 'development',
        SERVER_PORT: 5500,
      },
      env_production: {
        NODE_ENV: 'production',
        SERVER_PORT: 5500,
      },
    },
  ],

  deploy: {
    production: {
      key: '~/.ssh/ssh_rsa',
      user: 'markhc',
      host: [
        {
          host: '168.235.109.144',
          port: '27847',
        },
      ],
      ssh_options: 'StrictHostKeyChecking=no',
      ref: 'origin/master',
      repo: 'git@github.com:markhc/afktools.git',
      path: '/home/markhc/afktools',
      'post-deploy':
        'cd ./shalltear && \
          npm install && \
          npm run build && \
          pm2 startOrRestart ecosystem.config.js --env production',
    },
  },
};
