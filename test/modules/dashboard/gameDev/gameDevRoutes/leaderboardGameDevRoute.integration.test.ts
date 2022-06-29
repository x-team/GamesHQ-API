import { expect } from 'chai';
import {
  getLeaderboardsRoute,
  getLeaderboardByIdRoute,
  upsertLeaderboardRoute,
  deleteLeaderboardRoute,
  getResultsFromLeaderboardRoute,
} from '../../../../../src/modules/dashboard/gameDev/gameDevRoutes/leaderboardGameDevRoutes';
import { LeaderboardEntry, LeaderboardResults, Session } from '../../../../../src/models';
import { v4 as uuid } from 'uuid';
import { getCustomTestServer } from '../../../../test-utils';

describe('gameDevRoutes', () => {
  const testServer = getCustomTestServer();

  testServer.route([
    getLeaderboardsRoute,
    getLeaderboardByIdRoute,
    upsertLeaderboardRoute,
    deleteLeaderboardRoute,
    getResultsFromLeaderboardRoute,
  ]);

  describe('getLeaderboardRoute', async () => {
    it('should return 200 status code on GET /leaderboards', async () => {
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
      expect(JSON.parse(rslt.payload)).to.deep.equal([
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

    it('should return 200 status code on GET /leaderboards/{id}', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const lb1 = await LeaderboardEntry.create({
        name: 'LeaderBoard_' + uuid(),
        _gameTypeId: 1,
      });

      const injectOptions = {
        method: 'GET',
        url: `/dashboard/game-dev/games/1/leaderboards/${lb1.id}`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);

      expect(rslt.statusCode).to.equal(200);
      expect(JSON.parse(rslt.payload)).to.deep.equal({
        ...lb1.toJSON(),
        createdAt: lb1.createdAt.toISOString(),
        updatedAt: lb1.updatedAt.toISOString(),
      });
    });

    it('should return 404 status code on GET /leaderboards/{id} when leaderboard does not exist', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const injectOptions = {
        method: 'GET',
        url: `/dashboard/game-dev/games/1/leaderboards/1234`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);

      expect(rslt.statusCode).to.equal(404);
      expect(rslt.result).to.deep.equal({
        error: 'Not Found',
        message: 'leaderboard not found',
        statusCode: 404,
      });
    });
  });

  describe('getLeaderboardResultsRoute', async () => {
    it('should return 200 status code on GET /leaderboards/{id}/results', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const lb1 = await LeaderboardEntry.create({
        name: 'LeaderBoard_' + uuid(),
        _gameTypeId: 1,
      });

      const lbr1 = await LeaderboardResults.create({
        score: 10,
        _leaderboardEntryId: 1,
        _userId: 1,
      });

      const injectOptions = {
        method: 'GET',
        url: `/dashboard/game-dev/games/1/leaderboards/${lb1.id}/results`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);
      const resultJson = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(resultJson[0].score).to.equal(lbr1.score);
      expect(resultJson[0].id).to.equal(lbr1.id);
    });

    it('should return 404 status code on GET /leaderboards/{id}/results when leaderboard does not exist', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const injectOptions = {
        method: 'GET',
        url: `/dashboard/game-dev/games/1/leaderboards/1234/results`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);

      expect(rslt.statusCode).to.equal(404);
      expect(rslt.result).to.deep.equal({
        error: 'Not Found',
        message: 'Invalid leaderboard or gametypeId',
        statusCode: 404,
      });
    });
  });

  describe('upsertLeaderboardRoute', async () => {
    it('should return 200 status code on POST /leaderboards when creating new leaderboard', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/1/leaderboards`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload: {
          name: 'new_leaderboard_' + uuid(),
        },
      };
      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);
      expect(rslt.statusCode).to.equal(200);
      expect(payload._gameTypeId).to.equal(1);
      expect(payload.name).to.equal(injectOptions.payload.name);
      expect(payload.scoreStrategy).to.equal('highest');
      expect(payload.resetStrategy).to.equal('never');
      expect(isNaN(Date.parse(payload.createdAt))).to.be.false;
      expect(isNaN(Date.parse(payload.updatedAt))).to.be.false;
    });

    it('should return 200 status code on POST /leaderboards when updating leaderboard', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const lb1 = await LeaderboardEntry.create({
        name: 'LeaderBoard_' + uuid(),
        _gameTypeId: 1,
      });

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/1/leaderboards`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload: {
          id: lb1.id,
          name: 'new_leaderboard_' + uuid(),
          scoreStrategy: 'sum',
        },
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);
      expect(rslt.statusCode).to.equal(200);
      expect(payload._gameTypeId).to.equal(1);
      expect(payload.name).to.equal(injectOptions.payload.name);
      expect(payload.scoreStrategy).to.equal('sum');
      expect(payload.resetStrategy).to.equal('never');
      expect(isNaN(Date.parse(payload.createdAt))).to.be.false;
      expect(isNaN(Date.parse(payload.updatedAt))).to.be.false;
    });

    it('should return error if updating leaderboard that does not belong to gametype', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const lb1 = await LeaderboardEntry.create({
        name: 'LeaderBoard_' + uuid(),
        _gameTypeId: 1,
      });

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/2/leaderboards`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload: {
          id: lb1.id,
          name: 'new_leaderboard_' + uuid(),
          scoreStrategy: 'sum',
        },
      };

      const rslt = await testServer.inject(injectOptions);
      expect(rslt.statusCode).to.equal(403);
      expect(rslt.result).to.deep.equal({
        statusCode: 403,
        error: 'Forbidden',
        message: 'leaderboard does not belong to gametypeId 2',
      });
    });

    it('should return 200 status code on POST /leaderboards when creating new leaderboard with non default values', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/1/leaderboards`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload: {
          name: 'new_leaderboard_' + uuid(),
          scoreStrategy: 'lowest',
          resetStrategy: 'daily',
        },
      };
      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);
      expect(rslt.statusCode).to.equal(200);
      expect(payload._gameTypeId).to.equal(1);
      expect(payload.name).to.equal(injectOptions.payload.name);
      expect(payload.scoreStrategy).to.equal('lowest');
      expect(payload.resetStrategy).to.equal('daily');
      expect(isNaN(Date.parse(payload.createdAt))).to.be.false;
      expect(isNaN(Date.parse(payload.updatedAt))).to.be.false;
    });

    it('should return 400 status code on POST /leaderboards when body has invalid payload', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/1/leaderboards`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload: {
          name: 'new_leaderboard_' + uuid(),
          scoreStrategy: 'invalid',
        },
      };
      const rslt = await testServer.inject(injectOptions);
      expect(rslt.statusCode).to.equal(400);
    });
  });

  describe('deleteLeaderboardRoute', async () => {
    it('should return 200 status code on DELETE /leaderboards', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const lb1 = await LeaderboardEntry.create({
        name: 'LeaderBoard_' + uuid(),
        _gameTypeId: 1,
      });

      const injectOptions = {
        method: 'DELETE',
        url: `/dashboard/game-dev/games/1/leaderboards/${lb1.id}`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload: {
          name: 'new_leaderboard_' + uuid(),
        },
      };
      const rslt = await testServer.inject(injectOptions);

      const deletedLeaderboard = await LeaderboardEntry.findByPk(lb1.id);

      expect(rslt.statusCode).to.equal(200);
      expect(JSON.parse(rslt.payload)).to.deep.equal({
        success: true,
      });
      expect(deletedLeaderboard).to.be.null;
    });
  });
});
