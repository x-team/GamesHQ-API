import { expect } from 'chai';
import { v4 as uuid } from 'uuid';
import { getAllUserRolesRoute } from '../../../../../src/modules/dashboard/admin/adminRoutes/userRoleAdminRoutes';
import { USER_ROLE_LEVEL } from '../../../../../src/consts/model';
import { Session } from '../../../../../src/models';
import { createTestUser, getCustomTestServer } from '../../../../test-utils';

describe('userRoleAdminRoutes', () => {
  const testServer = getCustomTestServer();

  testServer.route([getAllUserRolesRoute]);

  describe('getAllUserRolesRoute', async () => {
    it('should return 200 status code on GET /admin/userrole', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.SUPER_ADMIN });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const injectOptions = {
        method: 'GET',
        url: '/admin/userrole',
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(payload.length).to.equal(4);
      expect(Object.keys(payload[0])).to.deep.equal(['id', 'name', '_capabilities']);
      expect(payload[0].name).to.equal('admin');
      expect(payload[0]._capabilities.length).to.equal(24);
      expect(Object.keys(payload[0]._capabilities[0])).to.deep.equal(['id', 'name']);
      expect(payload[1].name).to.equal('gamedev');
      expect(payload[1]._capabilities.length).to.equal(6);
      expect(payload[2].name).to.equal('super_admin');
      expect(payload[2]._capabilities.length).to.equal(28);
      expect(payload[3].name).to.equal('user');
      expect(payload[3]._capabilities.length).to.equal(0);
    });

    it('should return error if user does not have permission', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.GAME_DEV });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const injectOptions = {
        method: 'GET',
        url: '/admin/userrole',
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
