import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import { getCurrentArenaGameStateRoute } from '../../../../../src/modules/dashboard/admin/adminRoutes/arenaAdminRoutes';
import { getCurrentArenaGameState } from '../../../../../src/modules/dashboard/admin/adminHandlers/arenaAdminHandlers';
import { CAPABILITIES } from '../../../../../src/consts/model';
import { getAuthUserMiddleware } from '../../../../../src/api-utils/midddleware';

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
});
