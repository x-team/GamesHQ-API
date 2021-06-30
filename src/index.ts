import dotenv from 'dotenv';
import { getConfig } from './config';

if (getConfig('NODE_ENV') !== 'production') {
  dotenv.config({ path: '.env.dev' });
}

import { initDb, sequelize } from './db';

(async () => {
  // Setup
  await initDb();
  await sequelize.sync({ force: true });
})();
