import { expect } from 'chai';
import { USER_ROLE_NAME, USER_ROLE_LEVEL } from '../../src/consts/model';
import { findUserWithRoleAndCapabilities } from '../../src/models/User';
import { createTestUser } from '../test-utils';

describe('User', () => {
  describe('findUserRoleAndCapabilities', () => {
    it('should find user role and capabilities for USER ROLE', async () => {
      const testUser = await createTestUser();

      const user = await findUserWithRoleAndCapabilities(testUser.id);

      expect(user?._role?.name).to.be.equal(USER_ROLE_NAME.USER);
      expect(user?._role?._capabilities).to.deep.equal([]);
    });

    it('should find user role and capabilities for GAMEDEV ROLE', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.GAME_DEV });
      const user = await findUserWithRoleAndCapabilities(testUser.id);

      expect(user?._role?.name).to.be.equal(USER_ROLE_NAME.GAME_DEV);
      expect(user?._role?._capabilities?.length).to.equal(6);
      for (const capability of user?._role?._capabilities || []) {
        expect([
          'MY_GAME_READ',
          'MY_GAME_WRITE',
          'MY_GAME_ACHIEVEMENT_READ',
          'MY_GAME_ACHIEVEMENT_WRITE',
          'MY_GAME_LEADERBOARD_READ',
          'MY_GAME_LEADERBOARD_WRITE',
        ]).include(capability.name);
      }
    });

    it('should find user role and capabilities for ADMIN ROLE', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.ADMIN });
      const user = await findUserWithRoleAndCapabilities(testUser.id);

      expect(user?._role?.name).to.be.equal(USER_ROLE_NAME.ADMIN);
      expect(user?._role?._capabilities?.length).to.equal(24);
      for (const capability of user?._role?._capabilities || []) {
        expect([
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
        ]).include(capability.name);
      }
    });

    it('should find user role and capabilities for SUPER ADMIN ROLE', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.SUPER_ADMIN });
      const user = await findUserWithRoleAndCapabilities(testUser.id);

      expect(user?._role?.name).to.be.equal(USER_ROLE_NAME.SUPER_ADMIN);
      expect(user?._role?._capabilities?.length).to.equal(26);
      for (const capability of user?._role?._capabilities || []) {
        expect([
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
          'USER_ROLE_READ',
          'USER_ROLE_WRITE',
        ]).include(capability.name);
      }
    });

    it('should return null if user not found', async () => {
      const user = await findUserWithRoleAndCapabilities(12312321);
      expect(user).to.be.null;
    });
  });
});
