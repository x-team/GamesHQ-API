import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import {
  getAchievementsRoute,
  getAchievementsByIdRoute,
  upsertAchievementsRoute,
  deleteAchievementsRoute,
  postAchievementProgressRoute,
  deleteAchievementProgressRoute,
} from '../../../../../src/modules/dashboard/gameDev/gameDevRoutes/achievementGameDevRoutes';
import {
  getAchievementsHandler,
  upsertAchievementHandler,
  deleteAchievementHandler,
  updateAchievementProgressHandler,
  deleteAchievementProgressHandler,
} from '../../../../../src/modules/dashboard/gameDev/gameDevHandlers/achievementGameDevHandlers';
import {
  getAchievementsResponseSchema,
  getAchievementByIdResponseSchema,
  postAchievementRequestSchema,
  postAchievementResponseSchema,
  postAchievementProgressResponseSchema,
  updateAchievementProgressRequestSchema,
} from '../../../../../src/api-utils/schemas/gameDev/achievementsSchemas';
import { CAPABILITIES } from '../../../../../src/consts/model';
import {
  getAuthUserMiddleware,
  validateGameAuthMiddleware,
} from '../../../../../src/api-utils/midddleware';
import { gamedevGenericSchema } from '../../../../../src/api-utils/schemas/gameDev/gameTypeSchema';

describe('achievementGameDevRoutes', () => {
  describe('getAchievementsRoute', () => {
    it('should be configured as expected', async () => {
      expect(getAchievementsRoute.method).to.equal('GET');
      expect(getAchievementsRoute.path).to.equal(
        '/dashboard/game-dev/games/{gameTypeId}/achievements'
      );
      expect(getAchievementsRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [
          CAPABILITIES.MY_GAME_ACHIEVEMENT_READ,
          CAPABILITIES.MY_GAME_ACHIEVEMENT_WRITE,
        ],
      });
      expect((getAchievementsRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
        validateGameAuthMiddleware,
      ]);
      expect((getAchievementsRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((getAchievementsRoute.options as RouteOptions).response?.schema).to.equal(
        getAchievementsResponseSchema
      );
      expect(getAchievementsRoute.handler).to.equal(getAchievementsHandler);
    });
  });

  describe('getAchievementsByIdRoute', () => {
    it('should be configured as expected', async () => {
      expect(getAchievementsByIdRoute.method).to.equal('GET');
      expect(getAchievementsByIdRoute.path).to.equal(
        '/dashboard/game-dev/games/{gameTypeId}/achievements/{achievementId}'
      );
      expect(getAchievementsByIdRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [
          CAPABILITIES.MY_GAME_ACHIEVEMENT_READ,
          CAPABILITIES.MY_GAME_ACHIEVEMENT_WRITE,
        ],
      });
      expect((getAchievementsByIdRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
        validateGameAuthMiddleware,
      ]);
      expect((getAchievementsByIdRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((getAchievementsByIdRoute.options as RouteOptions).response?.schema).to.equal(
        getAchievementByIdResponseSchema
      );
      expect(getAchievementsByIdRoute.handler).to.equal(getAchievementsHandler);
    });
  });

  describe('upsertAchievementsRoute', () => {
    it('should be configured as expected', async () => {
      expect(upsertAchievementsRoute.method).to.equal('POST');
      expect(upsertAchievementsRoute.path).to.equal(
        '/dashboard/game-dev/games/{gameTypeId}/achievements'
      );
      expect(upsertAchievementsRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.MY_GAME_ACHIEVEMENT_WRITE],
      });
      expect((upsertAchievementsRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
        validateGameAuthMiddleware,
      ]);
      expect((upsertAchievementsRoute.options as RouteOptions).validate?.payload).to.equal(
        postAchievementRequestSchema
      );
      expect((upsertAchievementsRoute.options as RouteOptions).response?.schema).to.equal(
        postAchievementResponseSchema
      );
      expect(upsertAchievementsRoute.handler).to.equal(upsertAchievementHandler);
    });
  });

  describe('deleteAchievementsRoute', () => {
    it('should be configured as expected', async () => {
      expect(deleteAchievementsRoute.method).to.equal('DELETE');
      expect(deleteAchievementsRoute.path).to.equal(
        '/dashboard/game-dev/games/{gameTypeId}/achievements/{achievementId}'
      );
      expect(deleteAchievementsRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.MY_GAME_ACHIEVEMENT_WRITE],
      });
      expect((deleteAchievementsRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
        validateGameAuthMiddleware,
      ]);
      expect((deleteAchievementsRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((deleteAchievementsRoute.options as RouteOptions).response?.schema).to.equal(
        gamedevGenericSchema
      );
      expect(deleteAchievementsRoute.handler).to.equal(deleteAchievementHandler);
    });
  });

  describe('postAchievementProgressRoute', () => {
    it('should be configured as expected', async () => {
      expect(postAchievementProgressRoute.method).to.equal('POST');
      expect(postAchievementProgressRoute.path).to.equal(
        '/dashboard/game-dev/games/{gameTypeId}/achievements/{achievementId}/progress'
      );
      expect(postAchievementProgressRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.MY_GAME_ACHIEVEMENT_WRITE],
      });
      expect((postAchievementProgressRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
        validateGameAuthMiddleware,
      ]);
      expect((postAchievementProgressRoute.options as RouteOptions).validate?.payload).to.equal(
        updateAchievementProgressRequestSchema
      );
      expect((postAchievementProgressRoute.options as RouteOptions).response?.schema).to.equal(
        postAchievementProgressResponseSchema
      );
      expect(postAchievementProgressRoute.handler).to.equal(updateAchievementProgressHandler);
    });
  });

  describe('deleteAchievementProgressRoute', () => {
    it('should be configured as expected', async () => {
      expect(deleteAchievementProgressRoute.method).to.equal('DELETE');
      expect(deleteAchievementProgressRoute.path).to.equal(
        '/dashboard/game-dev/games/{gameTypeId}/achievements/{achievementId}/progress/{userId}'
      );
      expect(deleteAchievementProgressRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.MY_GAME_ACHIEVEMENT_WRITE],
      });
      expect((deleteAchievementProgressRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
        validateGameAuthMiddleware,
      ]);
      expect((deleteAchievementProgressRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((deleteAchievementProgressRoute.options as RouteOptions).response?.schema).to.equal(
        gamedevGenericSchema
      );
      expect(deleteAchievementProgressRoute.handler).to.equal(deleteAchievementProgressHandler);
    });
  });
});
