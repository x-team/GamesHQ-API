import type { QueryInterface, Sequelize } from 'sequelize';

interface SequelizeContext {
  context: {
    queryInterface: QueryInterface;
    Sequelize: Sequelize;
  };
}

export enum CAPABILITIES {
  MY_GAME_READ = 'MY_GAME_READ',
  MY_GAME_WRITE = 'MY_GAME_WRITE',
  MY_GAME_ACHIEVEMENT_READ = 'MY_GAME_ACHIEVEMENT_READ',
  MY_GAME_ACHIEVEMENT_WRITE = 'MY_GAME_ACHIEVEMENT_WRITE',
  MY_GAME_LEADERBOARD_READ = 'MY_GAME_LEADERBOARD_READ',
  MY_GAME_LEADERBOARD_WRITE = 'MY_GAME_LEADERBOARD_WRITE',
  GENERAL_READ = 'GENERAL_READ',
  GENERAL_WRITE = 'GENERAL_WRITE',
  THE_ARENA_READ = 'THE_ARENA_READ',
  THE_ARENA_WRITE = 'THE_ARENA_WRITE',
  THE_TOWER_READ = 'THE_TOWER_READ',
  THE_TOWER_WRITE = 'THE_TOWER_WRITE',
  WEAPONS_READ = 'WEAPONS_READ',
  WEAPONS_WRITE = 'WEAPONS_WRITE',
  ENEMY_READ = 'ENEMY_READ',
  ENEMY_WRITE = 'ENEMY_WRITE',
  ZONE_READ = 'ZONE_READ',
  ZONE_WRITE = 'ZONE_WRITE',
  ARENA_COMMAND = 'ARENA_COMMAND',
  ARENA_ACTION = 'ARENA_ACTION',
  TOWER_COMMAND = 'TOWER_COMMAND',
  TOWER_ACTION = 'TOWER_ACTION',
  TOWER_EVENT = 'TOWER_EVENT',
  GAMESHQ_COMMAND = 'GAMESHQ_COMMAND',
}

const capabilites = Object.keys(CAPABILITIES).map((capability) => {
  return {
    name: capability,
  };
});

module.exports = {
  async up({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkInsert('Capability', capabilites, { transaction });
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete(
        'Capability',
        {},
        {
          transaction,
        }
      );
    });
  },
};
