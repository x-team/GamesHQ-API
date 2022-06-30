import { expect } from 'chai';
import { v4 as uuid } from 'uuid';
import { getAllCapabilitiesRoute } from '../../../../../src/modules/dashboard/admin/adminRoutes/capabilityAdminRoutes';
import { USER_ROLE_LEVEL } from '../../../../../src/consts/model';
import { Session } from '../../../../../src/models';
import { createTestUser, getCustomTestServer } from '../../../../test-utils';

describe('userRoleAdminRoutes', () => {
  const testServer = getCustomTestServer();

  testServer.route([getAllCapabilitiesRoute]);

  describe('getAllCapabilitiesRoute', async () => {
    it('should return 200 status code on GET /admin/capabilities', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.SUPER_ADMIN });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const injectOptions = {
        method: 'GET',
        url: '/admin/capabilities',
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(payload.length).to.equal(28);
      expect(payload).to.deep.equal([
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
        'CAPABILITY_READ',
        'CAPABILITY_WRITE',
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
      ]);
    });

    it('should return error if user does not have permission', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.GAME_DEV });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const injectOptions = {
        method: 'GET',
        url: '/admin/capabilities',
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(401);
      expect(payload).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Only authorized users can access here',
      });
    });
  });
});
