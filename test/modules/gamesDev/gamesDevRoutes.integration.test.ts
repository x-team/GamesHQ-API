import { expect } from 'chai';
import {
  getLeaderboardsRoute,
  getLeaderboardByIdRoute,
  upsertLeaderboardRoute,
  deleteLeaderboardRoute,
  getAchievementsByIdRoute,
  getAchievementsRoute,
  upsertAchievementsRoute,
  deleteAchievementsRoute,
} from '../../../src/modules/gameDevs/gameDevRoutes';
import { Achievement, LeaderboardEntry, Session } from '../../../src/models';
import { v4 as uuid } from 'uuid';
import { createTestUser, getCustomTestServer } from '../../test-utils';

describe('gameDevRoutes', () => {
  const testServer = getCustomTestServer();

  testServer.route([
    getLeaderboardsRoute,
    getLeaderboardByIdRoute,
    upsertLeaderboardRoute,
    deleteLeaderboardRoute,
    getAchievementsByIdRoute,
    getAchievementsRoute,
    upsertAchievementsRoute,
    deleteAchievementsRoute,
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

  describe('getAchievementsRoute', async () => {
    it('should return 200 status code on GET /achievements', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const achievementInDB_1 = await Achievement.create({
        description: 'new_my_achievement_1',
        isEnabled: true,
        targetValue: 200,
        _gameTypeId: 1,
      });

      const achievementInDB_2 = await Achievement.create({
        description: 'new_my_achievement_2',
        isEnabled: true,
        targetValue: 200,
        _gameTypeId: 1,
      });

      const injectOptions = {
        method: 'GET',
        url: '/dashboard/game-dev/games/1/achievements',
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);

      expect(rslt.statusCode).to.equal(200);
      expect(JSON.parse(rslt.payload)).to.deep.equal([
        {
          ...achievementInDB_1.toJSON(),
          createdAt: achievementInDB_1.createdAt.toISOString(),
          updatedAt: achievementInDB_1.updatedAt.toISOString(),
        },
        {
          ...achievementInDB_2.toJSON(),
          createdAt: achievementInDB_2.createdAt.toISOString(),
          updatedAt: achievementInDB_2.updatedAt.toISOString(),
        },
      ]);
    });

    it('should return 200 status code on GET /achievements with empty response', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const injectOptions = {
        method: 'GET',
        url: '/dashboard/game-dev/games/1/achievements',
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
        url: '/dashboard/game-dev/games/1/achievements',
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

  describe('getAchievementsByIdRoute', async () => {
    it('should return 200 status code on GET /achievements/{id}', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const achievementInDB_1 = await Achievement.create({
        description: 'new_my_achievement_1',
        isEnabled: true,
        targetValue: 200,
        _gameTypeId: 1,
      });

      const injectOptions = {
        method: 'GET',
        url: `/dashboard/game-dev/games/1/achievements/${achievementInDB_1.id}`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);

      expect(rslt.statusCode).to.equal(200);
      expect(JSON.parse(rslt.payload)).to.deep.equal({
        ...achievementInDB_1.toJSON(),
        createdAt: achievementInDB_1.createdAt.toISOString(),
        updatedAt: achievementInDB_1.updatedAt.toISOString(),
      });
    });

    it('should return 404 status code on GET /achievements/{id} when achievement does not exist', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const injectOptions = {
        method: 'GET',
        url: `/dashboard/game-dev/games/1/achievements/1234`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);

      expect(rslt.statusCode).to.equal(404);
      expect(rslt.result).to.deep.equal({
        error: 'Not Found',
        message: 'achievement not found',
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
        url: '/dashboard/game-dev/games/1/achievements/1',
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

  describe('upsertAchievementsRoute', async () => {
    it('should return 200 status code on POST /achievements when creating achievement', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const payload = {
        description: 'my_achievement_' + uuid(),
        isEnabled: true,
        targetValue: 200,
      };

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/1/achievements`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload,
      };

      const rslt = await testServer.inject(injectOptions);
      const achievementIDb = await Achievement.findOne();
      const resp = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(resp.id).to.equal(achievementIDb?.id);
      expect(resp.description).to.equal(achievementIDb?.description);
      expect(resp.description).to.equal(payload.description);
      expect(resp.isEnabled).to.equal(achievementIDb?.isEnabled);
      expect(resp.isEnabled).to.equal(payload.isEnabled);
      expect(resp.targetValue).to.equal(achievementIDb?.targetValue);
      expect(resp.targetValue).to.equal(payload.targetValue);
      expect(isNaN(Date.parse(resp.createdAt))).to.be.false;
      expect(isNaN(Date.parse(resp.updatedAt))).to.be.false;
    });

    it('should return 200 status code on POST /achievements when updating an achievement', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const achievementInDB = await Achievement.create({
        description: 'new_my_achievement',
        isEnabled: true,
        targetValue: 200,
        _gameTypeId: 1,
      });

      const payload = {
        id: achievementInDB.id,
        description: 'updated_achievement',
        isEnabled: false,
        targetValue: 100,
      };

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/1/achievements`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload,
      };

      const rslt = await testServer.inject(injectOptions);
      const updatedAchievementInDB = await Achievement.findOne();
      const resp = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(resp.id).to.equal(updatedAchievementInDB?.id);
      expect(resp.id).to.equal(payload?.id);
      expect(resp.description).to.equal(updatedAchievementInDB?.description);
      expect(resp.description).to.equal(payload.description);
      expect(resp.isEnabled).to.equal(updatedAchievementInDB?.isEnabled);
      expect(resp.isEnabled).to.equal(payload.isEnabled);
      expect(resp.targetValue).to.equal(updatedAchievementInDB?.targetValue);
      expect(resp.targetValue).to.equal(payload.targetValue);
      expect(isNaN(Date.parse(resp.createdAt))).to.be.false;
      expect(isNaN(Date.parse(resp.updatedAt))).to.be.false;
    });

    it('should return error if updating achievement that does not belong to gametype', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const achievementInDB = await Achievement.create({
        description: 'new_my_achievement',
        isEnabled: true,
        targetValue: 200,
        _gameTypeId: 1,
      });

      const payload = {
        id: achievementInDB.id,
        description: 'updated_achievement',
        isEnabled: false,
        targetValue: 100,
      };

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/2/achievements`, // from other gameType
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
        message: 'achievement does not belong to gametypeId 2',
      });
    });

    it('should return error if calling POST /achievements with invalid payload', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const payload = {
        description_invalid: 'new_achievement',
        isEnabled: false,
      };

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/1/achievements`,
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

    it('should return error if creating achievement without user permission', async () => {
      const user = await createTestUser();

      const session = await Session.create({
        token: uuid(),
        _userId: user.id,
      });

      const payload = {
        description: 'updated_achievement',
        isEnabled: false,
        targetValue: 100,
      };

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/1/achievements`,
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

  describe('deleteAchievementsRoute', async () => {
    it('should return 200 status code on DELETE /achievements/{id}', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const achievementInDB_1 = await Achievement.create({
        description: 'new_my_achievement_1',
        isEnabled: true,
        targetValue: 200,
        _gameTypeId: 1,
      });

      const injectOptions = {
        method: 'DELETE',
        url: `/dashboard/game-dev/games/1/achievements/${achievementInDB_1.id}`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);

      const achievementIDb = await Achievement.findOne();
      const resp = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(resp).to.deep.equal({
        success: true,
      });
      expect(achievementIDb).to.be.null;
    });

    it('should return 404 status code on DELETE /achievements/{id} when achievement does not exist', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const injectOptions = {
        method: 'DELETE',
        url: `/dashboard/game-dev/games/1/achievements/123`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);

      const resp = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(404);
      expect(resp).to.deep.equal({
        statusCode: 404,
        message: 'achievement not found',
        error: 'Not Found',
      });
    });

    it('should return 403 status code on DELETE /achievements/{id} when user does not own game', async () => {
      const user = await createTestUser();

      const session = await Session.create({
        token: uuid(),
        _userId: user.id,
      });

      const injectOptions = {
        method: 'DELETE',
        url: `/dashboard/game-dev/games/1/achievements/1`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);

      const resp = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(403);
      expect(resp).to.deep.equal({
        statusCode: 403,
        message: 'User is not the owner of the game',
        error: 'Forbidden',
      });
    });
  });
});
