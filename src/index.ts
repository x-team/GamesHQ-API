import 'source-map-support/register';
import dotenv from 'dotenv';
import { getServerWithPlugins } from './server';
import { getConfig, logger } from './config';

if (getConfig('NODE_ENV') !== 'production') {
  dotenv.config({ path: '.env.dev' });
}

import { initDb } from './db';

(async () => {
  // DB Setup
  await initDb();
  // await sequelize.sync({ force: true });
  // API Setup
  const xhqServer = await getServerWithPlugins();
  await xhqServer.start();

  logger.info('🚀 Hello from super logger 🚀\n\t⭐️⭐️⭐️⭐️⭐️');
  logger.info(`🚀 Server Running At: ${xhqServer.info.uri} 🚀`);
})();
