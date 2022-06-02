const dotenv = require('dotenv');
const { getConfig } = require('./index');

if (getConfig('NODE_ENV') === 'test') {
  dotenv.config({ path: '.env.test' });
} else if (getConfig('NODE_ENV') !== 'production') {
  dotenv.config({ path: '.env.dev' });
}

const config = {
  username: getConfig('DB_USERNAME'),
  password: getConfig('DB_PASSWORD'),
  database: getConfig('DB_NAME'),
  host: getConfig('DB_HOSTNAME'),
  port: getConfig('DB_PORT'),
  dialect: 'postgres',
  seederStorage: 'sequelize',
};

module.exports = {
  development: config,
  test: {
    ...config,
    seederStorage: 'none',
  },
  production: config,
  staging: config,
};
