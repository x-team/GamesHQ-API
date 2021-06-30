const dotenv = require('dotenv');
dotenv.config({ path: '.env.dev' });

const config = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOSTNAME,
  dialect: 'postgres',
  seederStorage: 'sequelize',
};

module.exports = {
  test: {
    ...config,
    database: `${config.database}_test`,
    seederStorage: 'none',
  },
};
