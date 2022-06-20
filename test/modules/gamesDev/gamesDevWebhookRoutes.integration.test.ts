import { expect } from 'chai';
import {
  getGameAcheivmentsRoute,
  postAchievementProgressRoute,
  getGameLeaderboardResultRoute,
  getUserLeaderboardResultRoute,
  postLeaderboardResultRoute,
} from '../../../src/modules/gameDevs/gameDevWebhooksRoutes';
import {
  GameType,
  LeaderboardEntry,
  LeaderboardResults,
  Session,
  Achievement,
  AchievementUnlocked,
} from '../../../src/models';
import { getCustomTestServer, createTestUser } from '../../test-utils';
import { signMessage } from '../../../src/utils/cryptography';
import { v4 as uuid } from 'uuid';

describe('gameDevWebhooksRoutes', () => {
  const testServer = getCustomTestServer();

  testServer.route([
    postAchievementProgressRoute,
    getGameAcheivmentsRoute,
    postLeaderboardResultRoute,
    getGameLeaderboardResultRoute,
    getUserLeaderboardResultRoute,
  ]);

  describe('getGameAcheivmentsRoute', async () => {
    it('should return 200 status code on GET /achievements for specific gametype', async () => {
      const game = await GameType.findByPk(1);

      const a1 = await Achievement.create({
        description: 'game_achievement_' + uuid(),
        _gameTypeId: game!.id,
        isEnabled: true,
        targetValue: 100,
      });

      const a2 = await Achievement.create({
        description: 'game_achievement_' + uuid(),
        _gameTypeId: game!.id,
        isEnabled: true,
        targetValue: 100,
      });

      await Achievement.create({
        description: 'from_another_game_achievement_' + uuid(),
        _gameTypeId: 2,
        isEnabled: true,
        targetValue: 100,
      });

      const rslt = await testServer.inject(await getAchievementsInjectOptions(game!));
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(payload.length).to.equal(2);
      expect(payload).to.deep.equal([
        {
          id: a1.id,
          _gameTypeId: a1._gameTypeId,
          description: a1.description,
          isEnabled: a1.isEnabled,
          targetValue: a1.targetValue,
          createdAt: a1.createdAt.toISOString(),
          updatedAt: a1.updatedAt.toISOString(),
        },
        {
          id: a2.id,
          _gameTypeId: a2._gameTypeId,
          description: a2.description,
          isEnabled: a2.isEnabled,
          targetValue: a2.targetValue,
          createdAt: a2.createdAt.toISOString(),
          updatedAt: a2.updatedAt.toISOString(),
        },
      ]);
    });

    it('should return 200 status code on GET /achievements with empty array', async () => {
      const game = await GameType.findByPk(1);
      const rslt = await testServer.inject(await getAchievementsInjectOptions(game!));
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(payload.length).to.equal(0);
      expect(payload).to.deep.equal([]);
    });
  });

  describe('postGameAchievementUnlockedRoute', async () => {
    it('should return 200 status code on POST /achievements/{id}/progress with unlocked achievement', async () => {
      const game = await GameType.findByPk(1);
      const a1 = await Achievement.create({
        description: 'game_achievement_' + uuid(),
        _gameTypeId: game!.id,
        isEnabled: true,
        targetValue: 100,
      });

      const postPayload: any = {
        progress: 100,
      };

      const rslt = await testServer.inject(
        await postAchievementsProgressInjectOptions(a1.id, game!, postPayload)
      );
      const payload = JSON.parse(rslt.payload);

      const userAchievement = await AchievementUnlocked.findOne({ where: { _userId: 1 } });

      expect(rslt.statusCode).to.equal(200);
      expect(payload).to.deep.equal({
        progress: 100,
        isUnlocked: true,
        _achievementId: a1.id,
        _userId: 1,
        createdAt: userAchievement?.createdAt.toISOString(),
        updatedAt: userAchievement?.updatedAt.toISOString(),
      });
    });

    it('should return 200 status code on POST /achievements/{id}/progress with locked achievement', async () => {
      const game = await GameType.findByPk(1);
      const a1 = await Achievement.create({
        description: 'game_achievement_' + uuid(),
        _gameTypeId: game!.id,
        isEnabled: true,
        targetValue: 100,
      });

      const postPayload: any = {
        progress: 99, //below targetValue
      };

      const rslt = await testServer.inject(
        await postAchievementsProgressInjectOptions(a1.id, game!, postPayload)
      );
      const payload = JSON.parse(rslt.payload);

      const userAchievement = await AchievementUnlocked.findOne({ where: { _userId: 1 } });

      expect(rslt.statusCode).to.equal(200);
      expect(payload).to.deep.equal({
        progress: 99,
        isUnlocked: false,
        _achievementId: a1.id,
        _userId: 1,
        createdAt: userAchievement?.createdAt.toISOString(),
        updatedAt: userAchievement?.updatedAt.toISOString(),
      });
    });

    it('should return 403 status code on POST /achievements/{id}/progress when achievement does not belong to game', async () => {
      const game = await GameType.findByPk(1);
      const a1 = await Achievement.create({
        description: 'game_achievement_' + uuid(),
        _gameTypeId: 2,
        isEnabled: true,
        targetValue: 100,
      });

      const postPayload: any = {
        progress: 100,
      };

      const rslt = await testServer.inject(
        await postAchievementsProgressInjectOptions(a1.id, game!, postPayload)
      );
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(403);
      expect(payload).to.deep.equal({
        statusCode: 403,
        message: 'achievement does not belong to that game',
        error: 'Forbidden',
      });
    });
  });

  describe('getUserLeaderboardResultRoute', async () => {
    it('should return 200 status code on GET /leaderboards/{id}/score', async () => {
      const game = await GameType.findByPk(1);
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });
      const lbr = await LeaderboardResults.create({
        _leaderboardEntryId: lb1.id,
        score: 10,
        _userId: 1,
        _leaderboardResultsMeta: [],
      });

      const rslt = await testServer.inject(
        await getUserLeaderboarsScoreInjectOptions(lb1.id, game!)
      );
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(payload).to.deep.equal({
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 10,
        id: lbr.id,
      });
      expect(lbr?._leaderboardEntryId).to.equal(lb1.id);
      expect(lbr?._userId).to.equal(1);
      expect(lbr?.score).to.equal(10);
      expect(lbr?._leaderboardResultsMeta).to.be.undefined;
    });

    it('should return 200 status code on GET /leaderboards/{id}/score without meta', async () => {
      const game = await GameType.findByPk(1);
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });
      const lbr = await LeaderboardResults.create({
        _leaderboardEntryId: lb1.id,
        score: 10,
        _userId: 1,
        _leaderboardResultsMeta: [
          {
            attribute: 'timePlayed',
            value: '123',
          },
        ],
      });

      const rslt = await testServer.inject(
        await getUserLeaderboarsScoreInjectOptions(lb1.id, game!)
      );
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(payload).to.deep.equal({
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 10,
        id: lbr.id,
      });
      expect(lbr?._leaderboardEntryId).to.equal(lb1.id);
      expect(lbr?._userId).to.equal(1);
      expect(lbr?.score).to.equal(10);
      expect(lbr?._leaderboardResultsMeta).to.be.undefined;
    });

    it('should return 404 status code on GET /leaderboards/{id}/score if score not found', async () => {
      const game = await GameType.findByPk(1);
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });
      const lbr = await LeaderboardResults.create({
        _leaderboardEntryId: lb1.id,
        score: 10,
        _userId: 1,
        _leaderboardResultsMeta: [
          {
            attribute: 'timePlayed',
            value: '123',
          },
        ],
      });
      const notFoundId = 100 * lb1.id;

      const rslt = await testServer.inject(
        await getUserLeaderboarsScoreInjectOptions(notFoundId, game!)
      );
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(404);
      expect(payload).to.deep.equal({
        statusCode: 404,
        message: 'user score not found',
        error: 'Not Found',
      });
      expect(lbr?._leaderboardEntryId).to.equal(lb1.id);
      expect(lbr?._userId).to.equal(1);
      expect(lbr?.score).to.equal(10);
      expect(lbr?._leaderboardResultsMeta).to.be.undefined;
    });
  });

  describe(' postLeaderboardResultRoute', async () => {
    it('should return 200 status code on POST /leaderboards/score', async () => {
      const game = await GameType.findByPk(1);
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });

      const rslt = await testServer.inject(
        await postLeaderboarsScoreInjectOptions(undefined, lb1.id, game!)
      );
      const payload = JSON.parse(rslt.payload);

      const lbrInDB = await LeaderboardResults.findOne({
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt.statusCode).to.equal(200);
      expect(payload).to.deep.equal({
        newEntry: true,
      });
      expect(lbrInDB?._leaderboardEntryId).to.equal(lb1.id);
      expect(lbrInDB?._userId).to.equal(1);
      expect(lbrInDB?.score).to.equal(10);
      expect(lbrInDB?._leaderboardResultsMeta?.length).to.equal(1);
      expect(lbrInDB?._leaderboardResultsMeta![0].attribute).to.equal('timePlayed');
      expect(lbrInDB?._leaderboardResultsMeta![0].value).to.equal('10000');
    });

    it('should return 200 status code on POST /leaderboards/score without meta', async () => {
      const game = await GameType.findByPk(1);
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });

      const p = {
        score: 10,
      };

      let injectOptions = await postLeaderboarsScoreInjectOptions(p, lb1.id, game!);

      const rslt = await testServer.inject(injectOptions as any);
      const payload = JSON.parse(rslt.payload);

      const lbrInDB = await LeaderboardResults.findOne({
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt.statusCode).to.equal(200);
      expect(payload).to.deep.equal({
        newEntry: true,
      });
      expect(lbrInDB!._leaderboardEntryId).to.equal(lb1.id);
      expect(lbrInDB!._userId).to.equal(1);
      expect(lbrInDB!.score).to.equal(10);
      expect(lbrInDB?._leaderboardResultsMeta?.length).to.equal(0);
    });

    it('should return 200 status code on POST /leaderboards/score with empty meta', async () => {
      const game = await GameType.findByPk(1);
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });

      const p = {
        score: 10,
        _leaderboardResultsMeta: [],
      };

      let injectOptions = await postLeaderboarsScoreInjectOptions(p, lb1.id, game!);

      const rslt = await testServer.inject(injectOptions as any);
      const payload = JSON.parse(rslt.payload);

      const lbrInDB = await LeaderboardResults.findOne({
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt.statusCode).to.equal(200);
      expect(payload).to.deep.equal({
        newEntry: true,
      });
      expect(lbrInDB!._leaderboardEntryId).to.equal(lb1.id);
      expect(lbrInDB!._userId).to.equal(1);
      expect(lbrInDB!.score).to.equal(10);
      expect(lbrInDB?._leaderboardResultsMeta?.length).to.equal(0);
    });

    it('should return newEntry= false on POST /leaderboards/score when result is not updated', async () => {
      const game = await GameType.findByPk(1);
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });

      await LeaderboardResults.create({
        score: 100,
        _leaderboardEntryId: lb1.id,
        _userId: 1,
      });

      const p = {
        score: 10, // score is lower than current
        _leaderboardResultsMeta: [],
      };

      let injectOptions = await postLeaderboarsScoreInjectOptions(p, lb1.id, game!);

      const rslt = await testServer.inject(injectOptions as any);
      const payload = JSON.parse(rslt.payload);
      const lbrInDB = await LeaderboardResults.findOne({
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt.statusCode).to.equal(200);
      expect(payload).to.deep.equal({
        newEntry: false,
      });
      expect(lbrInDB!._leaderboardEntryId).to.equal(lb1.id);
      expect(lbrInDB!._userId).to.equal(1);
      expect(lbrInDB!.score).to.equal(100);
      expect(lbrInDB?._leaderboardResultsMeta?.length).to.equal(0);
    });

    it('should return 400 status code on POST /leaderboards/score on schema validation: missing score', async () => {
      const game = await GameType.findByPk(1);
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });
      const p = {
        // score: 10,
        _leaderboardResultsMeta: [],
      };

      let injectOptions = await postLeaderboarsScoreInjectOptions(p, lb1.id, game!);

      const rslt = await testServer.inject(injectOptions as any);
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(400);
      expect(payload.statusCode).to.be.equal(400);
      expect(payload.error).to.be.equal('Bad Request');
      expect(payload.message).to.be.equal('"score" is required');
    });
  });

  describe('getGameLeaderboardResultRoute', async () => {
    it('should return 200 status code on GET /leaderboards/score', async () => {
      const game = await GameType.findByPk(1);
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });

      for (const score of [1, 2, 3, 1]) {
        await LeaderboardResults.create({
          _leaderboardEntryId: lb1.id,
          _userId: (await createTestUser()).id,
          score,
        });
      }

      const rslt = await testServer.inject(
        getLeaderboardResultsRankInjectOptions({}, lb1.id, game!)
      );

      const payload = JSON.parse(rslt.payload);
      expect(rslt.statusCode).to.equal(200);
      expect(payload.length).to.equal(4);
      expect(Object.keys(payload[0])).to.deep.equal(['score', 'displayName', 'email']);
      expect(payload[0].score).to.equal(3);
      expect(payload[0].displayName).to.be.a('string');
      expect(payload[0].email).to.be.a('string');
      expect(payload[1].score).to.equal(2);
      expect(payload[2].score).to.equal(1);
      expect(payload[3].score).to.equal(1);
    });

    it('should return 200 status code on GET /leaderboards/score with limit set', async () => {
      const limit = 2;
      const game = await GameType.findByPk(1);
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });

      for (const score of [1, 2, 3, 1]) {
        await LeaderboardResults.create({
          _leaderboardEntryId: lb1.id,
          _userId: (await createTestUser()).id,
          score,
        });
      }

      const rslt = await testServer.inject(
        getLeaderboardResultsRankInjectOptions({}, lb1.id, game!, limit)
      );

      const payload = JSON.parse(rslt.payload);
      expect(rslt.statusCode).to.equal(200);
      expect(payload.length).to.equal(2);
      expect(payload[0].score).to.equal(3);
      expect(payload[0].displayName).to.be.a('string');
      expect(payload[0].email).to.be.a('string');
      expect(payload[1].score).to.equal(2);
      expect(payload[1].displayName).to.be.a('string');
      expect(payload[1].email).to.be.a('string');
    });

    it('should return 200 status code on GET /leaderboards/score with default limit of 10', async () => {
      const game = await GameType.findByPk(1);
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });

      for (const score of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]) {
        await LeaderboardResults.create({
          _leaderboardEntryId: lb1.id,
          _userId: (await createTestUser()).id,
          score,
        });
      }

      const rslt = await testServer.inject(
        getLeaderboardResultsRankInjectOptions({}, lb1.id, game!)
      );

      const payload = JSON.parse(rslt.payload);
      expect(rslt.statusCode).to.equal(200);
      expect(payload.length).to.equal(10);
    });
  });
});

async function postLeaderboarsScoreInjectOptions(
  p: any,
  _leaderboardEntryId?: number,
  game?: GameType
) {
  const payload = p || {
    score: 10,
    _leaderboardResultsMeta: [
      {
        attribute: 'timePlayed',
        value: '10000',
      },
    ],
  };
  const timestamp = String(new Date().getTime() / 1000);
  const signatureMessage = `v0:${timestamp}:${JSON.stringify(payload)}`;

  const session = await Session.create({
    token: uuid(),
    _userId: 1,
  });

  const injectOptions = {
    method: 'POST',
    url: `/webhooks/game-dev/leaderboards/${_leaderboardEntryId}/score`,
    headers: {
      'xtu-request-timestamp': timestamp,
      'xtu-signature': `v0=${signMessage(signatureMessage, game!.signingSecret)}`,
      'xtu-client-secret': game!.clientSecret,
      'xtu-session-token': session.token,
    },
    payload,
  };

  return injectOptions;
}

async function getAchievementsInjectOptions(game?: GameType) {
  const timestamp = String(new Date().getTime() / 1000);
  const signatureMessage = `v0:${timestamp}:{}`;

  const injectOptions = {
    method: 'GET',
    url: `/webhooks/game-dev/achievements`,
    headers: {
      'xtu-request-timestamp': timestamp,
      'xtu-signature': `v0=${signMessage(signatureMessage, game!.signingSecret)}`,
      'xtu-client-secret': game!.clientSecret,
    },
  };

  return injectOptions;
}

async function postAchievementsProgressInjectOptions(
  achievementId: number,
  game?: GameType,
  payload?: any
) {
  const timestamp = String(new Date().getTime() / 1000);
  const signatureMessage = `v0:${timestamp}:${JSON.stringify(payload)}`;

  const session = await Session.create({
    token: uuid(),
    _userId: 1,
  });

  const injectOptions = {
    method: 'POST',
    url: `/webhooks/game-dev/achievements/${achievementId}/progress`,
    headers: {
      'xtu-request-timestamp': timestamp,
      'xtu-signature': `v0=${signMessage(signatureMessage, game!.signingSecret)}`,
      'xtu-client-secret': game!.clientSecret,
      'xtu-session-token': session.token,
    },
    payload,
  };

  return injectOptions;
}

async function getUserLeaderboarsScoreInjectOptions(_leaderboardEntryId?: number, game?: GameType) {
  const timestamp = String(new Date().getTime() / 1000);
  const signatureMessage = `v0:${timestamp}:{}`;

  const session = await Session.create({
    token: uuid(),
    _userId: 1,
  });

  const injectOptions = {
    method: 'GET',
    url: `/webhooks/game-dev/leaderboards/${_leaderboardEntryId}/score`,
    headers: {
      'xtu-request-timestamp': timestamp,
      'xtu-signature': `v0=${signMessage(signatureMessage, game!.signingSecret)}`,
      'xtu-client-secret': game!.clientSecret,
      'xtu-session-token': session.token,
    },
  };

  return injectOptions;
}

function getLeaderboardResultsRankInjectOptions(
  _: {},
  _leaderboardEntryId?: number,
  game?: GameType,
  limit?: number
) {
  const timestamp = String(new Date().getTime() / 1000);
  const signatureMessage = `v0:${timestamp}:{}`;

  const injectOptions = {
    method: 'GET',
    url:
      `/webhooks/game-dev/leaderboards/${_leaderboardEntryId}/rank` +
      (limit ? `?limit=${limit}` : ''),
    headers: {
      'xtu-request-timestamp': timestamp,
      'xtu-signature': `v0=${signMessage(signatureMessage, game!.signingSecret)}`,
      'xtu-client-secret': game!.clientSecret,
    },
  };

  return injectOptions;
}
