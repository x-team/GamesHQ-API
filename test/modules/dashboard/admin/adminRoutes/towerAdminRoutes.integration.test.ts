import { expect } from 'chai';
import {
  addTowerFloorRoute,
  removeTowerFloorRoute,
} from '../../../../../src/modules/dashboard/admin/adminRoutes/towerAdminRoutes';
import { Session } from '../../../../../src/models';
import { v4 as uuid } from 'uuid';
import { getCustomTestServer } from '../../../../test-utils';
import { startTowerGame, TowerGame } from '../../../../../src/models/TowerGame';

describe('towerAdminRoutes', () => {
  const testServer = getCustomTestServer();

  testServer.route([addTowerFloorRoute, removeTowerFloorRoute]);

  describe('addTowerFloorRoute', async () => {
    it('should return 200 status code on POST /dashboard/admin/tower-games/{towerGameId}/floors', async () => {
      const towerGame = await createTowerGame();
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const payload = {
        number: 11,
      };

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/admin/tower-games/${towerGame!.id}/floors`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload,
      };

      const rslt = await testServer.inject(injectOptions);
      const resp = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(resp.id).to.equal(11);
      expect(resp.number).to.equal(11);
    });

    it('should return 400 status code on POST /dashboard/admin/tower-games/{towerGameId}/floors when floor  umber exceeds limit', async () => {
      const towerGame = await createTowerGame();
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const payload = {
        number: 12,
      };

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/admin/tower-games/${towerGame!.id}/floors`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload,
      };

      const rslt = await testServer.inject(injectOptions);
      const resp = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(400);
      expect(resp).to.deep.equal({
        statusCode: 400,
        error: 'Bad Request',
        message: 'max floor number allowed is 11',
      });
    });

    it('should return 404 status code on POST /dashboard/admin/tower-games/{towerGameId}/floors when tower game not found', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const payload = {
        number: 12,
      };

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/admin/tower-games/1234/floors`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload,
      };

      const rslt = await testServer.inject(injectOptions);
      const resp = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(404);
      expect(resp).to.deep.equal({
        statusCode: 404,
        error: 'Not Found',
        message: 'tower game not found',
      });
    });
  });

  describe('removeTowerFloorRoute', async () => {
    it('should return 200 status code on DELETE /dashboard/admin/tower-games/{towerGameId}/floors/{floorId}', async () => {
      const towerGame = await createTowerGame();
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const injectOptions = {
        method: 'DELETE',
        url: `/dashboard/admin/tower-games/${towerGame!.id}/floors/1`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);
      const resp = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(resp).to.deep.equal({
        success: true,
      });
    });

    it('should return 404 status code on DELETE /dashboard/admin/tower-games/{towerGameId}/floors/{floorId} when floor does not exist', async () => {
      const towerGame = await createTowerGame();
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const injectOptions = {
        method: 'DELETE',
        url: `/dashboard/admin/tower-games/${towerGame!.id}/floors/123`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);
      const resp = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(404);
      expect(resp).to.deep.equal({
        statusCode: 404,
        error: 'Not Found',
        message: 'tower floor not found',
      });
    });

    it('should return 404 status code on DELETE /dashboard/admin/tower-games/{towerGameId}/floors/{floorId} when tower game does not exist', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const injectOptions = {
        method: 'DELETE',
        url: `/dashboard/admin/tower-games/123/floors/1`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);
      const resp = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(404);
      expect(resp).to.deep.equal({
        statusCode: 404,
        error: 'Not Found',
        message: 'tower floor not found',
      });
    });
  });
});

const createTowerGame = async () => {
  const game = await startTowerGame({
    name: 'test_' + uuid(),
    _createdById: 1,
    isOpen: true,
  });

  return await TowerGame.findOne({ where: { _gameId: game.id } });
};
