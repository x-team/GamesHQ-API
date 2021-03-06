import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import {
  getTowerGameStatusRoute,
  newTowerGameRoute,
  endCurrentTowerGameRoute,
  openOrCloseCurrentTowerRoute,
  addEnemyToFloorRoute,
  addTowerFloorRoute,
  removeTowerFloorRoute,
  updateTowerGameRoute,
} from '../../../../../src/modules/dashboard/admin/adminRoutes/towerAdminRoutes';
import {
  getTowerGameStatusHandler,
  newTowerGameHandler,
  endCurrentTowerGameHandler,
  openOrCloseCurrentTowerHandler,
  addEnemyToFloorHandler,
  addTowerFloorHandler,
  removeTowerFloorHandler,
  updateTowerGameHandler,
} from '../../../../../src/modules/dashboard/admin/adminHandlers/towerAdminHandlers';
import { CAPABILITIES } from '../../../../../src/consts/model';
import { getAuthUserMiddleware } from '../../../../../src/api-utils/midddleware';
import {
  addTowerFloorRequestSchema,
  addTowerFloorResponseSchema,
  updateTowerRequestSchema,
  updateTowerResponseSchema,
} from '../../../../../src/api-utils/schemas/admin/towerSchemas';
import { genericSchema } from '../../../../../src/api-utils/schemas';

describe('towerAdminRoutes', () => {
  describe('getTowerGameStatusRoute', () => {
    it('should be configured as expected', async () => {
      expect(getTowerGameStatusRoute.method).to.equal('GET');
      expect(getTowerGameStatusRoute.path).to.equal('/dashboard/admin/tower-games/status');
      expect(getTowerGameStatusRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.THE_TOWER_READ, CAPABILITIES.THE_TOWER_WRITE],
      });
      expect((getTowerGameStatusRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((getTowerGameStatusRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((getTowerGameStatusRoute.options as RouteOptions).response?.schema).to.equal(
        undefined
      );
      expect(getTowerGameStatusRoute.handler).to.equal(getTowerGameStatusHandler);
    });
  });

  describe('newTowerGameRoute', () => {
    it('should be configured as expected', async () => {
      expect(newTowerGameRoute.method).to.equal('POST');
      expect(newTowerGameRoute.path).to.equal('/dashboard/admin/tower-games/new');
      expect(newTowerGameRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.THE_TOWER_WRITE],
      });
      expect((newTowerGameRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((newTowerGameRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((newTowerGameRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(newTowerGameRoute.handler).to.equal(newTowerGameHandler);
    });
  });

  describe('updateTowerGameRoute', () => {
    it('should be configured as expected', async () => {
      expect(updateTowerGameRoute.method).to.equal('POST');
      expect(updateTowerGameRoute.path).to.equal('/dashboard/admin/tower-games/{towerGameId}');
      expect(updateTowerGameRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.THE_TOWER_WRITE],
      });
      expect((updateTowerGameRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((updateTowerGameRoute.options as RouteOptions).validate?.payload).to.equal(
        updateTowerRequestSchema
      );
      expect((updateTowerGameRoute.options as RouteOptions).response?.schema).to.equal(
        updateTowerResponseSchema
      );
      expect(updateTowerGameRoute.handler).to.equal(updateTowerGameHandler);
    });
  });

  describe('endCurrentTowerGameRoute', () => {
    it('should be configured as expected', async () => {
      expect(endCurrentTowerGameRoute.method).to.equal('POST');
      expect(endCurrentTowerGameRoute.path).to.equal(
        '/dashboard/admin/tower-games/end-current-game'
      );
      expect(endCurrentTowerGameRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.THE_TOWER_WRITE],
      });
      expect((endCurrentTowerGameRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((endCurrentTowerGameRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((endCurrentTowerGameRoute.options as RouteOptions).response?.schema).to.equal(
        undefined
      );
      expect(endCurrentTowerGameRoute.handler).to.equal(endCurrentTowerGameHandler);
    });
  });

  describe('openOrCloseCurrentTowerRoute', () => {
    it('should be configured as expected', async () => {
      expect(openOrCloseCurrentTowerRoute.method).to.equal('POST');
      expect(openOrCloseCurrentTowerRoute.path).to.equal(
        '/dashboard/admin/tower-games/open-or-close'
      );
      expect(openOrCloseCurrentTowerRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.THE_TOWER_WRITE],
      });
      expect((openOrCloseCurrentTowerRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((openOrCloseCurrentTowerRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((openOrCloseCurrentTowerRoute.options as RouteOptions).response?.schema).to.equal(
        undefined
      );
      expect(openOrCloseCurrentTowerRoute.handler).to.equal(openOrCloseCurrentTowerHandler);
    });
  });

  describe('addEnemyToFloorRoute', () => {
    it('should be configured as expected', async () => {
      expect(addEnemyToFloorRoute.method).to.equal('POST');
      expect(addEnemyToFloorRoute.path).to.equal('/dashboard/admin/floors/{floorId}/addEnemies');
      expect(addEnemyToFloorRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.THE_TOWER_WRITE],
      });
      expect((addEnemyToFloorRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((addEnemyToFloorRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((addEnemyToFloorRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(addEnemyToFloorRoute.handler).to.equal(addEnemyToFloorHandler);
    });
  });

  describe('addTowerFloorRoute', () => {
    it('should be configured as expected', async () => {
      expect(addTowerFloorRoute.method).to.equal('POST');
      expect(addTowerFloorRoute.path).to.equal('/dashboard/admin/tower-games/{towerGameId}/floors');
      expect(addTowerFloorRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.THE_TOWER_WRITE],
      });
      expect((addTowerFloorRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((addTowerFloorRoute.options as RouteOptions).validate?.payload).to.equal(
        addTowerFloorRequestSchema
      );
      expect((addTowerFloorRoute.options as RouteOptions).response?.schema).to.equal(
        addTowerFloorResponseSchema
      );
      expect(addTowerFloorRoute.handler).to.equal(addTowerFloorHandler);
    });
  });

  describe('removeTowerFloorRoute', () => {
    it('should be configured as expected', async () => {
      expect(removeTowerFloorRoute.method).to.equal('DELETE');
      expect(removeTowerFloorRoute.path).to.equal(
        '/dashboard/admin/tower-games/{towerGameId}/floors/{floorId}'
      );
      expect(removeTowerFloorRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.THE_TOWER_WRITE],
      });
      expect((removeTowerFloorRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((removeTowerFloorRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((removeTowerFloorRoute.options as RouteOptions).response?.schema).to.equal(
        genericSchema
      );
      expect(removeTowerFloorRoute.handler).to.equal(removeTowerFloorHandler);
    });
  });
});
