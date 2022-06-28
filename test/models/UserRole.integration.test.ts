import { fail } from 'assert';
import { expect } from 'chai';
import { findAllUserRolesWithCapabilties } from '../../src/models/UserRole';

describe('UserRole', () => {
  describe('findAllUserRolesWithCapabilties', () => {
    it('should find user role and capabilities for USER ROLE', async () => {
      const userRoles = await findAllUserRolesWithCapabilties();

      expect(userRoles.length).to.equal(4);
      for (const role of userRoles) {
        expect(['user', 'gamedev', 'admin', 'super_admin']).includes(role.name);

        switch (role.name) {
          case 'user':
            expect(role._capabilities?.length).to.equal(userCapabilities.length);
            expect(userCapabilities).to.deep.equal(role._capabilities);
            break;
          case 'gamedev':
            expect(role._capabilities?.length).to.equal(gamedevCapabilities.length);
            for (const capability of role._capabilities || []) {
              expect(gamedevCapabilities).includes(capability.name);
            }
            break;
          case 'admin':
            expect(role._capabilities?.length).to.equal(adminCapabilities.length);
            for (const capability of role._capabilities || []) {
              expect(adminCapabilities).includes(capability.name);
            }
            break;
          case 'super_admin':
            expect(role._capabilities?.length).to.equal(superAdminCapabilities.length);
            for (const capability of role._capabilities || []) {
              expect(superAdminCapabilities).includes(capability.name);
            }
            break;
          default:
            fail('error on user role test');
        }
      }
    });
  });
});

const userCapabilities: string[] = [];
const gamedevCapabilities = [
  'MY_GAME_READ',
  'MY_GAME_WRITE',
  'MY_GAME_ACHIEVEMENT_READ',
  'MY_GAME_ACHIEVEMENT_WRITE',
  'MY_GAME_LEADERBOARD_READ',
  'MY_GAME_LEADERBOARD_WRITE',
];
const adminCapabilities = [
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
];
const superAdminCapabilities = [
  'MY_GAME_READ',
  'MY_GAME_WRITE',
  'MY_GAME_ACHIEVEMENT_READ',
  'MY_GAME_ACHIEVEMENT_WRITE',
  'MY_GAME_LEADERBOARD_READ',
  'MY_GAME_LEADERBOARD_WRITE',
  'GENERAL_READ',
  'GENERAL_WRITE',
  'USER_ROLE_WRITE',
  'USER_ROLE_READ',
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
];
