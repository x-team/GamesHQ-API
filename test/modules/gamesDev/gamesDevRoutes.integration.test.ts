import { expect } from 'chai';
import {
  getLeaderboardsRoute,
  getLeaderboardByIdRoute,
  upsertLeaderboardRoute,
  deleteLeaderboardRoute,
  getAcheivementsByIdRoute,
  getAcheivementsRoute,
  upsertAcheivementsRoute,
} from '../../../src/modules/gameDevs/gameDevRoutes';
import { Achievement, LeaderboardEntry, Session, User } from '../../../src/models';
import { v4 as uuid } from 'uuid';
import { createTestUser, getCustomTestServer } from '../../test-utils';

describe('gameDevRoutes', () => {
  const testServer = getCustomTestServer();

  testServer.route([
    getLeaderboardsRoute,
    getLeaderboardByIdRoute,
    upsertLeaderboardRoute,
    deleteLeaderboardRoute,
    getAcheivementsByIdRoute,
    getAcheivementsRoute,
    upsertAcheivementsRoute,
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

  describe('getAcheivementsRoute', async () => {
    it('should return 200 status code on GET /acheivements', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const acheivementInDB_1 = await Achievement.create({
        description: 'new_my_acheivement_1',
        isEnabled: true,
        targetValue: 200,
        _gameTypeId: 1,
      });

      const acheivementInDB_2 = await Achievement.create({
        description: 'new_my_acheivement_2',
        isEnabled: true,
        targetValue: 200,
        _gameTypeId: 1,
      });

      const injectOptions = {
        method: 'GET',
        url: '/dashboard/game-dev/games/1/acheivements',
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);

      expect(rslt.statusCode).to.equal(200);
      expect(JSON.parse(rslt.payload)).to.deep.equal([
        {
          ...acheivementInDB_1.toJSON(),
          createdAt: acheivementInDB_1.createdAt.toISOString(),
          updatedAt: acheivementInDB_1.updatedAt.toISOString(),
        },
        {
          ...acheivementInDB_2.toJSON(),
          createdAt: acheivementInDB_2.createdAt.toISOString(),
          updatedAt: acheivementInDB_2.updatedAt.toISOString(),
        },
      ]);
    });

    it('should return 200 status code on GET /acheivements with empty response', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const injectOptions = {
        method: 'GET',
        url: '/dashboard/game-dev/games/1/acheivements',
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);

      expect(rslt.statusCode).to.equal(200);
      expect(JSON.parse(rslt.payload)).to.deep.equal([]);
    });

    it('should return error if user does not own gametype', async () => {
      const user = await createTestUser();

      const session = await Session.create({
        token: uuid(),
        _userId: user.id,
      });

      const injectOptions = {
        method: 'GET',
        url: '/dashboard/game-dev/games/1/acheivements',
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);

      expect(rslt.statusCode).to.equal(403);
      expect(rslt.result).to.deep.equal({
        error: 'Forbidden',
        message: 'User is not the owner of the game',
        statusCode: 403,
      });
    });
  });

  describe('getAcheivementsByIdRoute', async () => {
    it('should return 200 status code on GET /acheivements/{id}', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const acheivementInDB_1 = await Achievement.create({
        description: 'new_my_acheivement_1',
        isEnabled: true,
        targetValue: 200,
        _gameTypeId: 1,
      });

      const injectOptions = {
        method: 'GET',
        url: `/dashboard/game-dev/games/1/acheivements/${acheivementInDB_1.id}`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);

      expect(rslt.statusCode).to.equal(200);
      expect(JSON.parse(rslt.payload)).to.deep.equal({
        ...acheivementInDB_1.toJSON(),
        createdAt: acheivementInDB_1.createdAt.toISOString(),
        updatedAt: acheivementInDB_1.updatedAt.toISOString(),
      });
    });

    it('should return 404 status code on GET /acheivements/{id} when acheivement does not exist', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const injectOptions = {
        method: 'GET',
        url: `/dashboard/game-dev/games/1/acheivements/1234`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);

      expect(rslt.statusCode).to.equal(404);
      expect(rslt.result).to.deep.equal({
        error: 'Not Found',
        message: 'acheivement not found',
        statusCode: 404,
      });
    });

    it('should return error if user does not own gametype', async () => {
      const user = await createTestUser();

      const session = await Session.create({
        token: uuid(),
        _userId: user.id,
      });

      const injectOptions = {
        method: 'GET',
        url: '/dashboard/game-dev/games/1/acheivements/1',
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);

      expect(rslt.statusCode).to.equal(403);
      expect(rslt.result).to.deep.equal({
        error: 'Forbidden',
        message: 'User is not the owner of the game',
        statusCode: 403,
      });
    });
  });

  describe('upsertAcheivementsRoute', async () => {
    it('should return 200 status code on POST /acheivements when creating acheivement', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const payload = {
        description: 'my_acheivement_' + uuid(),
        isEnabled: true,
        targetValue: 200,
      };

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/1/acheivements`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload,
      };

      const rslt = await testServer.inject(injectOptions);
      const acheivementIDb = await Achievement.findOne();
      const resp = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(resp.id).to.equal(acheivementIDb?.id);
      expect(resp.description).to.equal(acheivementIDb?.description);
      expect(resp.description).to.equal(payload.description);
      expect(resp.isEnabled).to.equal(acheivementIDb?.isEnabled);
      expect(resp.isEnabled).to.equal(payload.isEnabled);
      expect(resp.targetValue).to.equal(acheivementIDb?.targetValue);
      expect(resp.targetValue).to.equal(payload.targetValue);
      expect(isNaN(Date.parse(resp.createdAt))).to.be.false;
      expect(isNaN(Date.parse(resp.updatedAt))).to.be.false;
    });

    it('should return 200 status code on POST /acheivements when updating an acheivement', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const acheivementInDB = await Achievement.create({
        description: 'new_my_acheivement',
        isEnabled: true,
        targetValue: 200,
        _gameTypeId: 1,
      });

      const payload = {
        id: acheivementInDB.id,
        description: 'updated_acheivement',
        isEnabled: false,
        targetValue: 100,
      };

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/1/acheivements`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload,
      };

      const rslt = await testServer.inject(injectOptions);
      const updatedAcheivementInDB = await Achievement.findOne();
      const resp = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(resp.id).to.equal(updatedAcheivementInDB?.id);
      expect(resp.id).to.equal(payload?.id);
      expect(resp.description).to.equal(updatedAcheivementInDB?.description);
      expect(resp.description).to.equal(payload.description);
      expect(resp.isEnabled).to.equal(updatedAcheivementInDB?.isEnabled);
      expect(resp.isEnabled).to.equal(payload.isEnabled);
      expect(resp.targetValue).to.equal(updatedAcheivementInDB?.targetValue);
      expect(resp.targetValue).to.equal(payload.targetValue);
      expect(isNaN(Date.parse(resp.createdAt))).to.be.false;
      expect(isNaN(Date.parse(resp.updatedAt))).to.be.false;
    });

    it('should return error if updating acheivement that does not belong to gametype', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const acheivementInDB = await Achievement.create({
        description: 'new_my_acheivement',
        isEnabled: true,
        targetValue: 200,
        _gameTypeId: 1,
      });

      const payload = {
        id: acheivementInDB.id,
        description: 'updated_acheivement',
        isEnabled: false,
        targetValue: 100,
      };

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/2/acheivements`, // from other gameType
        headers: {
          'xtu-session-token': session.token,
        },
        payload,
      };

      const rslt = await testServer.inject(injectOptions);
      expect(rslt.statusCode).to.equal(403);
      expect(rslt.result).to.deep.equal({
        statusCode: 403,
        error: 'Forbidden',
        message: 'acheivement does not belong to gametypeId 2',
      });
    });

    it('should return error if calling POST /acheivements with invalid payload', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const payload = {
        description_invalid: 'new_acheivement',
        isEnabled: false,
      };

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/1/acheivements`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload,
      };

      const rslt = await testServer.inject(injectOptions);
      expect(rslt.statusCode).to.equal(400);
      expect(rslt.result).to.deep.equal({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid request payload input',
      });
    });

    it('should return error if creating acheivement without user permission', async () => {
      const user = await createTestUser();

      const session = await Session.create({
        token: uuid(),
        _userId: user.id,
      });

      const payload = {
        description: 'updated_acheivement',
        isEnabled: false,
        targetValue: 100,
      };

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/1/acheivements`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload,
      };

      const rslt = await testServer.inject(injectOptions);
      expect(rslt.statusCode).to.equal(403);
      expect(rslt.result).to.deep.equal({
        statusCode: 403,
        error: 'Forbidden',
        message: 'User is not the owner of the game',
      });
    });
  });
});
