import { expect } from 'chai';
import {
  getGameAcheivmentsRoute,
  postAchievementProgressRoute,
} from '../../../../src/modules/gameDevWebhook/webhookRoutes/achievementsGameDevWebhookRoutes';
import { GameType, Session, Achievement, AchievementUnlocked } from '../../../../src/models';
import { getCustomTestServer } from '../../../test-utils';
import { signMessage } from '../../../../src/utils/cryptography';
import { v4 as uuid } from 'uuid';

describe('gameDevWebhooksRoutes', () => {
  const testServer = getCustomTestServer();

  testServer.route([postAchievementProgressRoute, getGameAcheivmentsRoute]);

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

    it('should return 200 status code on POST /achievements/{id}/progress with empt payload and default progress', async () => {
      const game = await GameType.findByPk(1);
      const a1 = await Achievement.create({
        description: 'game_achievement_' + uuid(),
        _gameTypeId: game!.id,
        isEnabled: true,
        targetValue: 100,
      });

      const postPayload = {};

      const rslt = await testServer.inject(
        await postAchievementsProgressInjectOptions(a1.id, game!, postPayload)
      );
      const payload = JSON.parse(rslt.payload);
      const userAchievement = await AchievementUnlocked.findOne({ where: { _userId: 1 } });

      expect(rslt.statusCode).to.equal(200);
      expect(payload).to.deep.equal({
        progress: 0, //default
        isUnlocked: true,
        _achievementId: a1.id,
        _userId: 1,
        createdAt: userAchievement?.createdAt.toISOString(),
        updatedAt: userAchievement?.updatedAt.toISOString(),
      });
    });

    it('should return 400 status code on POST /achievements/{id}/progress when payload is invalid', async () => {
      const game = await GameType.findByPk(1);
      const a1 = await Achievement.create({
        description: 'game_achievement_' + uuid(),
        _gameTypeId: 2,
        isEnabled: true,
        targetValue: 100,
      });

      const postPayload: any = {
        progresssss: 100,
      };

      const rslt = await testServer.inject(
        await postAchievementsProgressInjectOptions(a1.id, game!, postPayload)
      );
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(400);
      expect(payload).to.deep.equal({
        statusCode: 400,
        message: '"progresssss" is not allowed',
        error: 'Bad Request',
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
});

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
  const signatureMessage = `v0:${timestamp}:${JSON.stringify(payload) || '{}'}`;

  const session = await Session.create({
    token: uuid(),
    _userId: 1,
  });

  let injectOptions = {
    method: 'POST',
    url: `/webhooks/game-dev/achievements/${achievementId}/progress`,
    headers: {
      'xtu-request-timestamp': timestamp,
      'xtu-signature': `v0=${signMessage(signatureMessage, game!.signingSecret)}`,
      'xtu-client-secret': game!.clientSecret,
      'xtu-session-token': session.token,
    },
    payload: payload || {},
  };

  return injectOptions;
}
