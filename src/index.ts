import dotenv from 'dotenv';
import { getConfig, logger } from './config';

if (getConfig('NODE_ENV') !== 'production') {
  dotenv.config({ path: '.env.dev' });
}

import { initDb } from './db';

(async () => {
  // Setup
  await initDb();
  // await sequelize.sync({ force: true });
  logger.info({
    yell: true,
    message: '🚀 Helllo from super logger 🚀\n\t⭐️⭐️⭐️⭐️⭐️',
  });
  // logger.info('🚀 Helllo from super logger 🚀\n\t⭐️⭐️⭐️⭐️⭐️');
})();
