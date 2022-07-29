import { expect } from 'chai';
import sinon from 'sinon';
import { v4 as uuid } from 'uuid';
import { arenaCommandRoute } from '../../../../../src/modules/dashboard/admin/adminRoutes/arenaAdminRoutes';
import { USER_ROLE_LEVEL } from '../../../../../src/consts/model';
import { Session } from '../../../../../src/models';
import { createTestUser, getCustomTestServer } from '../../../../test-utils';
import { ARENA_SLACK_COMMANDS } from '../../../../../src/games/arena/consts';
import * as arenaUtils from '../../../../../src/games/arena/utils';
import * as utils from '../../../../../src/games/utils';

describe('arenaAdminRoutes', () => {
  const testServer = getCustomTestServer();

  testServer.route([arenaCommandRoute]);

  describe('commandArenaRoute', async () => {
    // let stubbedPublishArenaMessage: any;
    // let stubbedNotifyEphemeral: any;

    beforeEach(() => {
      sinon.stub(arenaUtils, 'publishArenaMessage').resolves();
      sinon.stub(utils, 'notifyEphemeral').resolves();
    });

    afterEach(() => {
      sinon.reset();
    });

    it('should return 200 status code on POST /dashboard/admin/arena/command for new arena game', async () => {
      const { rslt, payload } = await postArenaCommand(ARENA_SLACK_COMMANDS.NEW_GAME);

      await new Promise((resolve) =>
        setTimeout(() => {
          expect(rslt.statusCode).to.equal(200);
          expect(payload.text).contains('*The Arena*\n Game "The Arena');
          expect(payload.text).contains('" has been created.');

          resolve({});
        }, 1000)
      );
    });

    it('should return 200 status code on POST /dashboard/admin/arena/command for start round', async () => {
      await postArenaCommand(ARENA_SLACK_COMMANDS.NEW_GAME);
      const { rslt, payload } = await postArenaCommand(ARENA_SLACK_COMMANDS.START_ROUND);

      await new Promise((resolve) =>
        setTimeout(() => {
          expect(rslt.statusCode).to.equal(200);
          expect(payload.text).to.equal('Resolving last round to start a new one.');

          resolve({});
        }, 1000)
      );
    });

    it('should return 200 status code on POST /dashboard/admin/arena/command for list players', async () => {
      await postArenaCommand(ARENA_SLACK_COMMANDS.NEW_GAME);
      const { rslt, payload } = await postArenaCommand(ARENA_SLACK_COMMANDS.LIST_PLAYERS);

      await new Promise((resolve) =>
        setTimeout(() => {
          expect(rslt.statusCode).to.equal(200);
          expect(payload).to.deep.equal({
            text: 'Players Info Displayed',
            type: 'response',
          });

          resolve({});
        }, 1000)
      );
    });

    const postArenaCommand = async (command: string) => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.SUPER_ADMIN });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const postPayload = {
        command,
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

      return { rslt, payload };
    };
  });
});
