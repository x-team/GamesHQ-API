import { expect, assert } from 'chai';
import { Server } from '@hapi/hapi';
import { getLeaderboardsRoute } from '../../../src/modules/gameDevs/gameDevRoutes';
import { LeaderboardEntry, Session } from '../../../src/models';
import { v4 as uuid } from 'uuid';

const testServer = new Server();
testServer.route(getLeaderboardsRoute);

describe('gameDevRoutes', () => {
  describe('getLeaderboardRoute', async () => {
    it('should return 200 with leaderboard', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const lb1 = await LeaderboardEntry.create({
        name: 'LeaderBoard_' + uuid(),
        _gameTypeId: 1,
      });

      const lb2 = await LeaderboardEntry.create({
        name: 'LeaderBoard_' + uuid(),
        _gameTypeId: 1,
      });

      const injectOptions = {
        method: 'GET',
        url: '/dashboard/game-dev/games/1/leaderboards',
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);

      expect(rslt.statusCode).to.equal(200);
      assert.deepEqual(JSON.parse(rslt.payload), [
        {
          ...lb1.toJSON(),
          createdAt: lb1.createdAt.toISOString(),
          updatedAt: lb1.updatedAt.toISOString(),
        },
        {
          ...lb2.toJSON(),
          createdAt: lb2.createdAt.toISOString(),
          updatedAt: lb2.updatedAt.toISOString(),
        },
      ]);
    });

    it('should return 403 error when no valid session', async () => {
      const injectOptions = {
        method: 'GET',
        url: '/dashboard/game-dev/games/1/leaderboards',
        headers: {
          'xtu-session-token': '132',
        },
      };

      const rslt = await testServer.inject(injectOptions);
      expect(rslt.payload).to.equal(
        JSON.stringify({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Only Auth users can access here - user is not logged in',
        })
      );
    });

    it('should return 403 error when no valid auth header', async () => {
      const injectOptions = {
        method: 'GET',
        url: '/dashboard/game-dev/games/1/leaderboards',
        headers: {},
      };

      const rslt = await testServer.inject(injectOptions);
      expect(rslt.payload).to.equal(
        JSON.stringify({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Only Auth users can access here - send session token',
        })
      );
    });
  });
});
