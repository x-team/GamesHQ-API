import type { QueryInterface, Sequelize } from 'sequelize';

import type { Capability, UserRole } from '../models';

interface SequelizeContext {
  context: {
    queryInterface: QueryInterface;
    Sequelize: Sequelize;
  };
}

const userRoleCapabilitiesMap: Record<string, string[]> = {
  user: [],
  gamedev: [
    'MY_GAME_READ',
    'MY_GAME_WRITE',
    'MY_GAME_ACHIEVEMENT_READ',
    'MY_GAME_ACHIEVEMENT_WRITE',
    'MY_GAME_LEADERBOARD_READ',
    'MY_GAME_LEADERBOARD_WRITE',
  ],
  admin: [
    'MY_GAME_READ',
    'MY_GAME_WRITE',
    'MY_GAME_ACHIEVEMENT_READ',
    'MY_GAME_ACHIEVEMENT_WRITE',
    'MY_GAME_LEADERBOARD_READ',
    'MY_GAME_LEADERBOARD_WRITE',
    'GENERAL_READ',
    'GENERAL_WRITE',
    'THE_ARENA_READ',
    'THE_ARENA_WRITE',
    'THE_TOWER_READ',
    'THE_TOWER_WRITE',
    'WEAPONS_READ',
    'WEAPONS_WRITE',
    'ENEMY_READ',
    'ENEMY_WRITE',
    'ZONE_READ',
    'ZONE_WRITE',
    'ARENA_COMMAND',
    'ARENA_ACTION',
    'TOWER_COMMAND',
    'TOWER_ACTION',
    'TOWER_EVENT',
    'GAMESHQ_COMMAND',
  ],
  super_admin: [
    'MY_GAME_READ',
    'MY_GAME_WRITE',
    'MY_GAME_ACHIEVEMENT_READ',
    'MY_GAME_ACHIEVEMENT_WRITE',
    'MY_GAME_LEADERBOARD_READ',
    'MY_GAME_LEADERBOARD_WRITE',
    'GENERAL_READ',
    'GENERAL_WRITE',
    'THE_ARENA_READ',
    'THE_ARENA_WRITE',
    'THE_TOWER_READ',
    'THE_TOWER_WRITE',
    'WEAPONS_READ',
    'WEAPONS_WRITE',
    'ENEMY_READ',
    'ENEMY_WRITE',
    'ZONE_READ',
    'ZONE_WRITE',
    'ARENA_COMMAND',
    'ARENA_ACTION',
    'TOWER_COMMAND',
    'TOWER_ACTION',
    'TOWER_EVENT',
    'GAMESHQ_COMMAND',
  ],
};

module.exports = {
  async up({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkUpdate(
        'UserRole',
        { name: 'gamedev' },
        { name: 'community team' },
        { transaction }
      );

      await queryInterface.bulkUpdate(
        'UserRole',
        { name: 'super_admin' },
        { name: 'super admin' },
        { transaction }
      );

      const userRoles = await queryInterface.sequelize.query('SELECT * from "UserRole"');
      const capabilities = await queryInterface.sequelize.query('SELECT * from "Capability"');

      for (const role of userRoles[0] as UserRole[]) {
        const userRoleCapabilities = userRoleCapabilitiesMap[role.name];

        for (const cabability of capabilities[0] as Capability[]) {
          console.log(cabability);

          if (userRoleCapabilities?.includes(cabability.name)) {
            await queryInterface.insert(
              null,
              'UserRoleCapability',
              {
                _userRoleId: role.id,
                _capabilityId: cabability.id,
              },
              { transaction }
            );
          }
        }
      }
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete('UserRoleCapability', {}, { transaction });
    });
  },
};
