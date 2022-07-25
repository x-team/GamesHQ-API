import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import {
  getCurrentArenaGameStateRoute,
  commandArenaRoute,
} from '../../../../../src/modules/dashboard/admin/adminRoutes/arenaAdminRoutes';
import {
  getCurrentArenaGameState,
  commandArenaHandler,
} from '../../../../../src/modules/dashboard/admin/adminHandlers/arenaAdminHandlers';
import { CAPABILITIES } from '../../../../../src/consts/model';
import { getAuthUserMiddleware } from '../../../../../src/api-utils/midddleware';
import {
  commandArenaRequestSchema,
  commandArenaResponseSchema,
} from '../../../../../src/api-utils/schemas/admin/arenaSchemas';

describe('arenaAdminRoutes', () => {
  describe('getCurrentArenaGameStateRoute', () => {
    it('should be configured as expected', async () => {
      expect(getCurrentArenaGameStateRoute.method).to.equal('GET');
      expect(getCurrentArenaGameStateRoute.path).to.equal('/dashboard/admin/arena/getState');
      expect(getCurrentArenaGameStateRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.THE_ARENA_READ, CAPABILITIES.THE_ARENA_WRITE],
      });
      expect((getCurrentArenaGameStateRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((getCurrentArenaGameStateRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((getCurrentArenaGameStateRoute.options as RouteOptions).response?.schema).to.equal(
        undefined
      );
      expect(getCurrentArenaGameStateRoute.handler).to.equal(getCurrentArenaGameState);
    });
  });

  describe('commandArenaRoute', () => {
    it('should be configured as expected', async () => {
      expect(commandArenaRoute.method).to.equal('POST');
      expect(commandArenaRoute.path).to.equal('/dashboard/admin/command/arena');
      expect(commandArenaRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.THE_ARENA_WRITE],
      });
      expect((commandArenaRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((commandArenaRoute.options as RouteOptions).validate?.payload).to.equal(
        commandArenaRequestSchema
      );
      expect((commandArenaRoute.options as RouteOptions).response?.schema).to.equal(
        commandArenaResponseSchema
      );
      expect(commandArenaRoute.handler).to.equal(commandArenaHandler);
    });
  });
});
