/* eslint-disable */
import sinon from 'sinon';
import { performance } from 'perf_hooks';
import { initDb, sequelize, getAllModels } from '../src/db';
import { logger } from '../src/config';
import { Server } from '@hapi/hapi';
import Boom from '@hapi/boom';
import Joi from 'joi';

declare module 'mocha' {
  interface Suite {
    gameshqDontClearDBAfterEach?: boolean;
  }
}

export const getCustomTestServer = () => {
  return new Server({
    routes: {
      response: {
        modify: true,
        options: {
          allowUnknown: false,
          convert: true,
          stripUnknown: { objects: true },
        },
        async failAction(_request, _h, error) {
          logger.error('response error', error);
          throw error;
        },
      },
      cors: {
        origin: ['*'],
        headers: [
          'Accept',
          'Authorization',
          'Content-Type',
          'If-None-Match',
          'xtu-session-token',
          'xtu-client-secret',
          'xtu-request-timestamp',
          'xtu-signature',
        ],
      },
      validate: {
        headers: Joi.object({
          Authorization: Joi.string().default('Bearer {uuid}').optional(),
        }),
        options: {
          allowUnknown: true,
        },
        async failAction(_request, _h, error) {
          logger.error(error);
          throw Boom.badRequest(`Invalid request payload input`);
        },
      },
    },
  });
};

const isIntegration = (context: import('mocha').Context): boolean =>
  Boolean(
    context.test?.parent?.suites.some((suite) => suite.file?.endsWith('.integration.test.ts'))
  );

before(async function () {
  if (!isIntegration(this)) {
    return;
  }

  this.test?.parent?.suites.forEach((suite) => {
    // if (suite.gameshqDontClearDBAfterEach) {
    //   // this means after each "describe"
    //   // much faster!
    //   suite.afterAll(resetDB);
    // } else {
    suite.beforeEach(resetDB);
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

async function resetDB() {
  const TRUNCATE_BLACKLIST = [
    'sequelize',
    'ArenaZone',
    'GameType',
    'AvailableAction',
    'Enemy',
    'EnemyPattern',
    'EnemyTrait',
    'GameItemAvailability',
    'Item',
    'ItemArmor',
    'ItemHealthKit',
    'ItemRarity',
    'ItemTrait',
    'ItemWeapon',
    'Organization',
    'SequelizeData',
    'Perk',
    'SequelizeData',
    'SequelizeMeta',
    'Team',
    'Trait',
    'User',
    'UserRole',
  ];
  const keys = Object.keys(getAllModels()).filter((key) => !TRUNCATE_BLACKLIST.includes(key));
  const query = keys.map((key) => `TRUNCATE TABLE "${key}" RESTART IDENTITY CASCADE;`).join('\n');
  await sequelize.query(query, { raw: true });
}
