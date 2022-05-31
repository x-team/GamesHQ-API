/* eslint-disable */
import sinon from 'sinon';
import { performance } from 'perf_hooks';
import { initDb } from '../db';
import { logger } from '../config';

declare module 'mocha' {
  interface Suite {
    gameshqDontClearDBAfterEach?: boolean;
  }
}

const isIntegration = (context: import('mocha').Context): boolean =>
  Boolean(
    context.test?.parent?.suites.some((suite) => suite.file?.endsWith('.integration.test.ts'))
  );

before(async function () {
  if (!isIntegration(this)) {
    return;
  }

  this.test?.parent?.suites.forEach((_) => {
    // if (suite.gameshqDontClearDBAfterEach) {
    //   // this means after each "describe"
    //   // much faster!
    //   suite.afterAll(resetDB);
    // } else {
    //   suite.beforeEach(resetDB);
    // }
  });
});

let mutableTestsStartTime = 0;
before(async function () {
  mutableTestsStartTime = performance.now();
  if (!isIntegration(this)) {
    return;
  }

  await initDb();
  // await sequelize.sync({ match: /_test$/, logging: false });

  // await resetDB();
});

afterEach(async () => {
  sinon.restore();
});

after(() => {
  const now = performance.now();
  // tslint:disable-next-line: no-magic-numbers
  const diffInSeconds = (now - mutableTestsStartTime) / 1000;
  logger.info(`Done! 🎉 Tests took ${diffInSeconds}s.`);
});

// async function resetDB() {
//   const TRUNCATE_BLACKLIST = ['sequelize'];
//   const keys = Object.keys(getAllModels()).filter((key) => !TRUNCATE_BLACKLIST.includes(key));
//   const query = keys.map((key) => `TRUNCATE TABLE "${key}" RESTART IDENTITY CASCADE;`).join('\n');
//   await sequelize.query(query, { raw: true });
// }
