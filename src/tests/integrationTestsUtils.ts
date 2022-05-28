/* eslint-disable */
import sinon from 'sinon';
import { performance } from 'perf_hooks';
import { ArenaZone } from '../models';
import { ARENA_ZONE_RING } from '../games/arena/consts';
import { ArenaZoneCreationAttributes } from '../models/ArenaZone';
import { initDb, sequelize, getAllModels } from '../db';
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
  this.test?.parent?.suites.forEach((suite) => {
    // if (suite.gameshqDontClearDBAfterEach) {
    //   // this means after each "describe"
    //   // much faster!
    //   suite.afterAll(clearDB);
    // } else {
    //   suite.afterEach(clearDB);
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

  // await clearDB();
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

async function clearDB() {
  const TRUNCATE_BLACKLIST = ['sequelize'];

  const keys = Object.keys(getAllModels()).filter((key) => !TRUNCATE_BLACKLIST.includes(key));
  const query = keys.map((key) => `TRUNCATE TABLE "${key}" RESTART IDENTITY CASCADE;`).join('\n');
  await sequelize.query(query, { raw: true });
}

// const testTeamData = {
//   name: 'Test Team',
//   addedAt: new Date(),
//   isActive: true,
//   slackWebhook: 'https://test-webhook.com',
// };

// const testTowerEnemyData = {
//   name: 'Test Enemy Name',
//   emoji: ':test-emoji:',
//   minorDamageRate: random(ENEMY_MIN_DAMAGE_RATE, ENEMY_MAX_DAMAGE_RATE),
//   majorDamageRate: random(ENEMY_MIN_DAMAGE_RATE, ENEMY_MAX_DAMAGE_RATE),
//   health: random(MIN_ENEMY_HEALTH, MAX_ENEMY_HEALTH),
//   isBoss: false,
//   gifUrl: 'https://some-test-url.com/pretend-to-be.gif',
// };

const testArenaZoneData: ArenaZoneCreationAttributes = {
  name: 'Test Zone',
  emoji: ':test-zone-emoji:',
  ring: ARENA_ZONE_RING.ONE_A,
  isActive: true,
  isArchived: false,
};

// export function seedTestTeam(options = {}) {
//   return Team.create({
//     ...testTeamData,
//     ...options,
//   });
// }

// export function seedTestTowerEnemy(options: Partial<TowerEnemy>) {
//   return Enemy.create({
//     ...testTowerEnemyData,
//     ...options,
//   });
// }

export function seedTestArenaZone(options: Partial<ArenaZoneCreationAttributes>) {
  return ArenaZone.create({
    ...testArenaZoneData,
    ...options,
  });
}
