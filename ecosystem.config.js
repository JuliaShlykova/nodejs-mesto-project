require('dotenv').config({ path: './.env.deploy' });

const {
  DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH, DEPLOY_REPO, DEPLOY_REF='origin/main'
} = process.env;

module.exports = {
  apps: [{
    name: 'mesto-backend',
    script: './dist/app.js',
    env: {
      NODE_ENV: 'production'
    }
  }],

  deploy: {
    production: {
      user: DEPLOY_USER,
      host: DEPLOY_HOST,
      ref: DEPLOY_REF,
      repo: DEPLOY_REPO,
      path: DEPLOY_PATH,
      'pre-deploy-local': `scp .env.production ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/current/.env`,
      'post-deploy': 'npm i && npm run build && pm2 reload ecosystem.config.js --env production',
    }
  }
};
