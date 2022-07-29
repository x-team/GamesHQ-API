import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import {
  getCurrentArenaGameStateRoute,
  arenaCommandRoute,
  arenaActionRoute,
} from '../../../../../src/modules/dashboard/admin/adminRoutes/arenaAdminRoutes';
import {
  getCurrentArenaGameState,
  arenaCommandHandler,
  arenaActionHandler,
} from '../../../../../src/modules/dashboard/admin/adminHandlers/arenaAdminHandlers';
import { CAPABILITIES } from '../../../../../src/consts/model';
import { getAuthUserMiddleware } from '../../../../../src/api-utils/midddleware';
import {
  actionArenaRequestSchema,
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
      expect(arenaCommandRoute.method).to.equal('POST');
      expect(arenaCommandRoute.path).to.equal('/dashboard/admin/arena/command');
      expect(arenaCommandRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.THE_ARENA_WRITE],
      });
      expect((arenaCommandRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((arenaCommandRoute.options as RouteOptions).validate?.payload).to.equal(
        commandArenaRequestSchema
      );
      expect((arenaCommandRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(arenaCommandRoute.handler).to.equal(arenaCommandHandler);
    });
  });

  describe('actionArenaRoute', () => {
    it('should be configured as expected', async () => {
      expect(arenaActionRoute.method).to.equal('POST');
      expect(arenaActionRoute.path).to.equal('/dashboard/admin/arena/action');
      expect(arenaActionRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.THE_ARENA_WRITE],
      });
      expect((arenaActionRoute.options as RouteOptions).pre).to.deep.equal([getAuthUserMiddleware]);
      expect((arenaActionRoute.options as RouteOptions).validate?.payload).to.equal(
        actionArenaRequestSchema
      );
      expect((arenaActionRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(arenaActionRoute.handler).to.equal(arenaActionHandler);
    });
  });
});
