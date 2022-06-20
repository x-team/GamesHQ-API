import 'source-map-support/register';
import { getConfig, logger } from './config';
import { SEED_MODE } from './consts/api';
import { initDb, sequelize } from './db';
import { getServerWithPlugins } from './server';

void (async () => {
  // DB Setup
  await initDb();

  if (getConfig('SEED_MODE') === SEED_MODE.NOSEED) {
    await sequelize.sync({ force: true });
  }
  // API Setup
  const xhqServer = await getServerWithPlugins();
  await xhqServer.start();

  logger.info('🚀 Hello from super logger 🚀\n\t⭐️⭐️⭐️⭐️⭐️');
  logger.info(`🚀 Server Running At: ${xhqServer.info.uri} 🚀`);
})();
