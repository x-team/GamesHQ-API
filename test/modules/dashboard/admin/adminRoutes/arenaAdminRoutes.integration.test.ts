import { expect } from 'chai';
import { v4 as uuid } from 'uuid';
import { commandArenaRoute } from '../../../../../src/modules/dashboard/admin/adminRoutes/arenaAdminRoutes';
import { USER_ROLE_LEVEL } from '../../../../../src/consts/model';
import { Session } from '../../../../../src/models';
import { createTestUser, getCustomTestServer } from '../../../../test-utils';

describe('arenaAdminRoutes', () => {
  const testServer = getCustomTestServer();

  testServer.route([commandArenaRoute]);

  describe('commandArenaRoute', async () => {
    it('should return 200 status code on POST /dashboard/admin/arena/command for start round', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.SUPER_ADMIN });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const postPayload = {
        command: '/arena-startround',
      };

      const injectOptions = {
        method: 'POST',
        url: '/dashboard/admin/arena/command',
        headers: {
          'xtu-session-token': session.token,
        },
        payload: postPayload,
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(payload).to.deep.equal({
        message: 'Resolved last round and started a new one.',
      });
    });
  });
});
