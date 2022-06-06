import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import { getLeaderboardsRoute } from '../../../src/modules/gameDevs/gameDevRoutes';
import { getLeaderboardHandler } from '../../../src/modules/gameDevs/gameDevHandlers';
import { multipleLeaderboardSchema } from '../../../src/api-utils/responseSchemas/gamedev';
import { CAPABILITIES } from '../../../src/api-utils/interfaceAndTypes';
import { getAuthUser } from '../../../src/api-utils/getAuthUser';

describe('gameDevRoutes', () => {
  describe('getLeaderboardRoute', async () => {
    it('should be configured as expected', async () => {
      expect(getLeaderboardsRoute.method).to.equal('GET');
      expect(getLeaderboardsRoute.path).to.equal(
        '/dashboard/game-dev/games/{gameTypeId}/leaderboards'
      );
      expect(getLeaderboardsRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.GAMEDEV_ACTIONS],
      });
      expect((getLeaderboardsRoute.options as RouteOptions).pre).to.deep.equal([
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ]);
      expect((getLeaderboardsRoute.options as RouteOptions).response?.schema).to.equal(
        multipleLeaderboardSchema
      );
      expect(getLeaderboardsRoute.handler).to.equal(getLeaderboardHandler);
    });
  });
});
