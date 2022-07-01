import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import {
  getEnemiesRoute,
  getEnemyRoute,
  upsertEnemyRoute,
  deleteEnemyRoute,
} from '../../../../../src/modules/dashboard/admin/adminRoutes/enemyAdminRoutes';
import {
  getEnemiesHandler,
  getEnemyHandler,
  upsertEnemyHandler,
  deleteEnemyHandler,
} from '../../../../../src/modules/dashboard/admin/adminHandlers/enemyAdminHandlers';
import { CAPABILITIES } from '../../../../../src/consts/model';
import { getAuthUserMiddleware } from '../../../../../src/api-utils/midddleware';

describe('enemyAdminRoutes', () => {
  describe('getEnemiesRoute', () => {
    it('should be configured as expected', async () => {
      expect(getEnemiesRoute.method).to.equal('GET');
      expect(getEnemiesRoute.path).to.equal('/dashboard/admin/enemies');
      expect(getEnemiesRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.ENEMY_READ, CAPABILITIES.ENEMY_WRITE],
      });
      expect((getEnemiesRoute.options as RouteOptions).pre).to.deep.equal([getAuthUserMiddleware]);
      expect((getEnemiesRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((getEnemiesRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(getEnemiesRoute.handler).to.equal(getEnemiesHandler);
    });
  });

  describe('getEnemyRoute', () => {
    it('should be configured as expected', async () => {
      expect(getEnemyRoute.method).to.equal('GET');
      expect(getEnemyRoute.path).to.equal('/dashboard/admin/enemies/{enemyId}');
      expect(getEnemyRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.ENEMY_READ, CAPABILITIES.ENEMY_WRITE],
      });
      expect((getEnemyRoute.options as RouteOptions).pre).to.deep.equal([getAuthUserMiddleware]);
      expect((getEnemyRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((getEnemyRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(getEnemyRoute.handler).to.equal(getEnemyHandler);
    });
  });

  describe('upsertEnemyRoute', () => {
    it('should be configured as expected', async () => {
      expect(upsertEnemyRoute.method).to.equal('POST');
      expect(upsertEnemyRoute.path).to.equal('/dashboard/admin/upsertEnemy');
      expect(upsertEnemyRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.ENEMY_WRITE],
      });
      expect((upsertEnemyRoute.options as RouteOptions).pre).to.deep.equal([getAuthUserMiddleware]);
      expect((upsertEnemyRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((upsertEnemyRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(upsertEnemyRoute.handler).to.equal(upsertEnemyHandler);
    });
  });

  describe('deleteEnemyRoute', () => {
    it('should be configured as expected', async () => {
      expect(deleteEnemyRoute.method).to.equal('DELETE');
      expect(deleteEnemyRoute.path).to.equal('/dashboard/admin/enemies/{enemyId}');
      expect(deleteEnemyRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.ENEMY_WRITE],
      });
      expect((deleteEnemyRoute.options as RouteOptions).pre).to.deep.equal([getAuthUserMiddleware]);
      expect((deleteEnemyRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((deleteEnemyRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(deleteEnemyRoute.handler).to.equal(deleteEnemyHandler);
    });
  });
});
