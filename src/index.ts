import 'source-map-support/register';
import dotenv from 'dotenv';
import { getServerWithPlugins } from './server';
import { getConfig, logger } from './config';

if (getConfig('NODE_ENV') !== 'production') {
  dotenv.config({ path: '.env.dev' });
}

import { initDb } from './db';

(async () => {
  // Setup
  const xhqServer = await getServerWithPlugins();
  await initDb();
  await xhqServer.start();

  // await sequelize.sync({ force: true });
  logger.info('🚀 Hello from super logger 🚀\n\t⭐️⭐️⭐️⭐️⭐️');
  logger.info(`🚀 Server Running At: ${xhqServer.info.uri} 🚀`);
})();
