import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import {
  getLeaderboardsRoute,
  getLeaderboardByIdRoute,
  upsertLeaderboardRoute,
  deleteLeaderboardRoute,
} from '../../../../../src/modules/dashboard/gameDev/gameDevRoutes/leaderboardGameDevRoutes';
import {
  getLeaderboardHandler,
  upsertLeaderboardHandler,
  deleteLeaderboardHandler,
} from '../../../../../src/modules/dashboard/gameDev/gameDevHandlers/leaderboardGameDevHandlers';
import {
  multipleLeaderboardSchema,
  leaderboardSchema,
  postLeaderboardSchema,
} from '../../../../../src/api-utils/schemas/gameDev/leaderboardSchemas';
import { CAPABILITIES } from '../../../../../src/consts/model';
import {
  getAuthUserMiddleware,
  validateGameAuthMiddleware,
} from '../../../../../src/api-utils/midddleware';
import { gamedevGenericSchema } from '../../../../../src/api-utils/schemas/gameDev/gameTypeSchema';

describe('leaderboardGameDevRoutes', () => {
  describe('getLeaderboardRoute', () => {
    it('should be configured as expected', async () => {
      expect(getLeaderboardsRoute.method).to.equal('GET');
      expect(getLeaderboardsRoute.path).to.equal(
        '/dashboard/game-dev/games/{gameTypeId}/leaderboards'
      );
      expect(getLeaderboardsRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [
          CAPABILITIES.MY_GAME_LEADERBOARD_READ,
          CAPABILITIES.MY_GAME_LEADERBOARD_WRITE,
        ],
      });
      expect((getLeaderboardsRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
        validateGameAuthMiddleware,
      ]);
      expect((getLeaderboardsRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((getLeaderboardsRoute.options as RouteOptions).response?.schema).to.equal(
        multipleLeaderboardSchema
      );
      expect(getLeaderboardsRoute.handler).to.equal(getLeaderboardHandler);
    });
  });

  describe('getLeaderboardByIdRoute', () => {
    it('should be configured as expected', async () => {
      expect(getLeaderboardByIdRoute.method).to.equal('GET');
      expect(getLeaderboardByIdRoute.path).to.equal(
        '/dashboard/game-dev/games/{gameTypeId}/leaderboards/{leaderboardId}'
      );
      expect(getLeaderboardByIdRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [
          CAPABILITIES.MY_GAME_LEADERBOARD_READ,
          CAPABILITIES.MY_GAME_LEADERBOARD_WRITE,
        ],
      });
      expect((getLeaderboardByIdRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
        validateGameAuthMiddleware,
      ]);
      expect((getLeaderboardByIdRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((getLeaderboardByIdRoute.options as RouteOptions).response?.schema).to.equal(
        leaderboardSchema
      );
      expect(getLeaderboardByIdRoute.handler).to.equal(getLeaderboardHandler);
    });
  });

  describe('upsertLeaderboardRoute', () => {
    it('should be configured as expected', async () => {
      expect(upsertLeaderboardRoute.method).to.equal('POST');
      expect(upsertLeaderboardRoute.path).to.equal(
        '/dashboard/game-dev/games/{gameTypeId}/leaderboards'
      );
      expect(upsertLeaderboardRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.MY_GAME_LEADERBOARD_WRITE],
      });
      expect((upsertLeaderboardRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
        validateGameAuthMiddleware,
      ]);
      expect((upsertLeaderboardRoute.options as RouteOptions).validate?.payload).to.equal(
        postLeaderboardSchema
      );
      expect((upsertLeaderboardRoute.options as RouteOptions).response?.schema).to.equal(
        leaderboardSchema
      );
      expect(upsertLeaderboardRoute.handler).to.equal(upsertLeaderboardHandler);
    });
  });

  describe('deleteLeaderboardRoute', () => {
    it('should be configured as expected', async () => {
      expect(deleteLeaderboardRoute.method).to.equal('DELETE');
      expect(deleteLeaderboardRoute.path).to.equal(
        '/dashboard/game-dev/games/{gameTypeId}/leaderboards/{leaderboardId}'
      );
      expect(deleteLeaderboardRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.MY_GAME_LEADERBOARD_WRITE],
      });
      expect((deleteLeaderboardRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
        validateGameAuthMiddleware,
      ]);
      expect((deleteLeaderboardRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((deleteLeaderboardRoute.options as RouteOptions).response?.schema).to.equal(
        gamedevGenericSchema
      );
      expect(deleteLeaderboardRoute.handler).to.equal(deleteLeaderboardHandler);
    });
  });
});
