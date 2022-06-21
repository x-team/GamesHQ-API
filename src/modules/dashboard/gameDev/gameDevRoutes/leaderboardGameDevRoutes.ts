import type { ServerRoute } from '@hapi/hapi';

import { getAuthUser } from '../../../../api-utils/getAuthUser';
import { CAPABILITIES } from '../../../../api-utils/interfaceAndTypes';
import { gamedevGenericSchema } from '../../../../api-utils/schemas/gameDev/game';
import {
  leaderboardSchema,
  multipleLeaderboardSchema,
  postLeaderboardSchema,
} from '../../../../api-utils/schemas/gameDev/leaderboardSchemas';
import {
  getLeaderboardHandler,
  upsertLeaderboardHandler,
  deleteLeaderboardHandler,
} from '../gameDevHandlers/leaderboardGameDevHandler';

export const getLeaderboardsRoute: ServerRoute = {
  method: 'GET',
  path: '/dashboard/game-dev/games/{gameTypeId}/leaderboards',
  options: {
    description: 'Fetch game`s leaderboardEntries',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.GAMEDEV_ACTIONS],
    },
    pre: [
      {
        method: getAuthUser,
        assign: 'getAuthUser',
      },
    ],
    response: {
      schema: multipleLeaderboardSchema,
    },
  },
  handler: getLeaderboardHandler,
};

export const getLeaderboardByIdRoute: ServerRoute = {
  method: 'GET',
  path: '/dashboard/game-dev/games/{gameTypeId}/leaderboards/{leaderboardId}',
  options: {
    description: 'Fetch game`s leaderboardEntry',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.GAMEDEV_ACTIONS],
    },
    pre: [
      {
        method: getAuthUser,
        assign: 'getAuthUser',
      },
    ],
    response: {
      schema: leaderboardSchema,
    },
  },
  handler: getLeaderboardHandler,
};

export const deleteLeaderboardRoute: ServerRoute = {
  method: 'DELETE',
  path: '/dashboard/game-dev/games/{gameTypeId}/leaderboards/{leaderboardId}',
  options: {
    description: 'Delete game`s leaderboardEntry',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.GAMEDEV_ACTIONS],
    },
    pre: [
      {
        method: getAuthUser,
        assign: 'getAuthUser',
      },
    ],
    response: {
      schema: gamedevGenericSchema,
    },
  },
  handler: deleteLeaderboardHandler,
};

export const upsertLeaderboardRoute: ServerRoute = {
  method: 'POST',
  path: '/dashboard/game-dev/games/{gameTypeId}/leaderboards',
  options: {
    description: 'Add or update a game`s leaderboardEntry',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.GAMEDEV_ACTIONS],
    },
    pre: [
      {
        method: getAuthUser,
        assign: 'getAuthUser',
      },
    ],
    validate: {
      payload: postLeaderboardSchema,
    },
    response: {
      schema: leaderboardSchema,
    },
  },
  handler: upsertLeaderboardHandler,
};
