import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import { getLeaderboardsRoute } from '../../../../../src/modules/dashboard/gameDev/gameDevRoutes/leaderboardGameDevRoutes';
import { getLeaderboardHandler } from '../../../../../src/modules/dashboard/gameDev/gameDevHandlers/leaderboardGameDevHandlers';
import { multipleLeaderboardSchema } from '../../../../../src/api-utils/schemas/gameDev/leaderboardSchemas';
import { CAPABILITIES } from '../../../../../src/consts/model';
import {
  getAuthUserMiddleware,
  validateGameAuthMiddleware,
} from '../../../../../src/api-utils/midddleware';

describe('getLeaderboardRoute', async () => {
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
    expect((getLeaderboardsRoute.options as RouteOptions).response?.schema).to.equal(
      multipleLeaderboardSchema
    );
    expect(getLeaderboardsRoute.handler).to.equal(getLeaderboardHandler);
  });
});
