import { expect } from 'chai';
import {
  getGameTypeByIdRoute,
  getGameTypesRoute,
  deleteGameTypeRoute,
  upsertGameTypeRoute,
} from '../../../../../src/modules/dashboard/gameDev/gameDevRoutes/gameTypeGameDevRoute';
import { v4 as uuid } from 'uuid';
import { getCustomTestServer } from '../../../../test-utils';
import { GameType, Session } from '../../../../../src/models';

describe('gameTypeGameDevRoute', () => {
  const testServer = getCustomTestServer();

  testServer.route([
    getGameTypeByIdRoute,
    getGameTypesRoute,
    deleteGameTypeRoute,
    upsertGameTypeRoute,
  ]);

  describe('upsertGameTypeRoute', async () => {
    it('should return 200 status code on POST /upsertGameType when creating new gametype', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const postPayload = {
        name: 'name_' + uuid(),
      };

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/upsertGameType`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload: postPayload,
      };

      const gameInDb = await GameType.findOne({ where: { name: postPayload.name } });

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);
      expect(rslt.statusCode).to.equal(200);
      expect(payload).to.deep.equal({
        success: true,
      });
      expect(gameInDb).to.not.be.undefined;
    });

    it('should return 200 status code on POST /upsertGameType when updating new gametype', async () => {
      const session = await Session.create({
        token: uuid(),
        _userId: 1,
      });

      const [game] = await GameType.upsert({
        name: 'name_' + uuid(),
        clientSecret: uuid(),
        signingSecret: uuid(),
        _createdById: 1,
      });

      const postPayload = {
        id: game.id,
        name: 'updated_name_' + uuid(),
      };

      const injectOptions = {
        method: 'POST',
        url: `/dashboard/game-dev/games/upsertGameType`,
        headers: {
          'xtu-session-token': session.token,
        },
        payload: postPayload,
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);
      const updatedGame = await GameType.findOne({ where: { name: postPayload.name } });

      expect(rslt.statusCode).to.equal(200);
      expect(payload).to.deep.equal({
        success: true,
      });
      expect(updatedGame?.id).to.equal(game.id);
    });
  });
});
