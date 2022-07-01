import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import {
  getGameTypesRoute,
  getGameTypeByIdRoute,
  upsertGameTypeRoute,
  deleteGameTypeRoute,
} from '../../../../../src/modules/dashboard/gameDev/gameDevRoutes/gameTypeGameDevRoutes';
import {
  getGameTypesHandler,
  getGameTypeHandler,
  upsertGameTypeHandler,
  deleteGameTypeHandler,
} from '../../../../../src/modules/dashboard/gameDev/gameDevHandlers/gameTypeGameDevHandlers';
import {
  sigleGameItemSchema,
  multipleGamesSchema,
  upsertGameTypeSchema,
} from '../../../../../src/api-utils/schemas/gameDev/gameTypeSchema';
import { CAPABILITIES } from '../../../../../src/consts/model';
import {
  getAuthUserMiddleware,
  validateGameAuthMiddleware,
} from '../../../../../src/api-utils/midddleware';
import { gamedevGenericSchema } from '../../../../../src/api-utils/schemas/gameDev/gameTypeSchema';

describe('gameTypeGameDevRoutes', () => {
  describe('getGameTypesRoute', () => {
    it('should be configured as expected', async () => {
      expect(getGameTypesRoute.method).to.equal('GET');
      expect(getGameTypesRoute.path).to.equal('/dashboard/game-dev/games');
      expect(getGameTypesRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.MY_GAME_READ, CAPABILITIES.MY_GAME_WRITE],
      });
      expect((getGameTypesRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
        validateGameAuthMiddleware,
      ]);
      expect((getGameTypesRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((getGameTypesRoute.options as RouteOptions).response?.schema).to.equal(
        multipleGamesSchema
      );
      expect(getGameTypesRoute.handler).to.equal(getGameTypesHandler);
    });
  });

  describe('getGameTypeByIdRoute', () => {
    it('should be configured as expected', async () => {
      expect(getGameTypeByIdRoute.method).to.equal('GET');
      expect(getGameTypeByIdRoute.path).to.equal('/dashboard/game-dev/games/{gameTypeId}');
      expect(getGameTypeByIdRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.MY_GAME_READ, CAPABILITIES.MY_GAME_WRITE],
      });
      expect((getGameTypeByIdRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
        validateGameAuthMiddleware,
      ]);
      expect((getGameTypeByIdRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((getGameTypeByIdRoute.options as RouteOptions).response?.schema).to.equal(
        sigleGameItemSchema
      );
      expect(getGameTypeByIdRoute.handler).to.equal(getGameTypeHandler);
    });
  });

  describe('upsertGameTypeRoute', () => {
    it('should be configured as expected', async () => {
      expect(upsertGameTypeRoute.method).to.equal('POST');
      expect(upsertGameTypeRoute.path).to.equal('/dashboard/game-dev/games/upsertGameType');
      expect(upsertGameTypeRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.MY_GAME_WRITE],
      });
      expect((upsertGameTypeRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
        validateGameAuthMiddleware,
      ]);
      expect((upsertGameTypeRoute.options as RouteOptions).validate?.payload).to.equal(
        upsertGameTypeSchema
      );
      expect((upsertGameTypeRoute.options as RouteOptions).response?.schema).to.equal(
        gamedevGenericSchema
      );
      expect(upsertGameTypeRoute.handler).to.equal(upsertGameTypeHandler);
    });
  });

  describe('deleteGameTypeRoute', () => {
    it('should be configured as expected', async () => {
      expect(deleteGameTypeRoute.method).to.equal('DELETE');
      expect(deleteGameTypeRoute.path).to.equal('/dashboard/game-dev/games/{gameTypeId}');
      expect(deleteGameTypeRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.MY_GAME_WRITE],
      });
      expect((deleteGameTypeRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
        validateGameAuthMiddleware,
      ]);
      expect((deleteGameTypeRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((deleteGameTypeRoute.options as RouteOptions).response?.schema).to.equal(
        gamedevGenericSchema
      );
      expect(deleteGameTypeRoute.handler).to.equal(deleteGameTypeHandler);
    });
  });
});
