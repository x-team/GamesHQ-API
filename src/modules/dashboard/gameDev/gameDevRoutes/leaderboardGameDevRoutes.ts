import type { ServerRoute } from '@hapi/hapi';

import { CAPABILITIES } from '../../../../api-utils/interfaceAndTypes';
import {
  getAuthUserMiddleware,
  validateGameAuthMiddleware,
} from '../../../../api-utils/midddleware';
import { gamedevGenericSchema } from '../../../../api-utils/schemas/gameDev/gameTypeSchema';
import {
  leaderboardSchema,
  multipleLeaderboardResultScoreSchema,
  multipleLeaderboardSchema,
  postLeaderboardSchema,
} from '../../../../api-utils/schemas/gameDev/leaderboardSchemas';
import {
  getLeaderboardHandler,
  upsertLeaderboardHandler,
  deleteLeaderboardHandler,
  getLeaderboardResultsHandler,
} from '../gameDevHandlers/leaderboardGameDevHandlers';

export const getLeaderboardsRoute: ServerRoute = {
  method: 'GET',
  path: '/dashboard/game-dev/games/{gameTypeId}/leaderboards',
  options: {
    description: 'Fetch game`s leaderboardEntries',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.GAMEDEV_ACTIONS],
    },
    pre: [getAuthUserMiddleware, validateGameAuthMiddleware],
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
    pre: [getAuthUserMiddleware, validateGameAuthMiddleware],
    response: {
      schema: leaderboardSchema,
    },
  },
  handler: getLeaderboardHandler,
};

export const getResultsFromLeaderboardRoute: ServerRoute = {
  method: 'GET',
  path: '/dashboard/game-dev/games/{gameTypeId}/leaderboards/{leaderboardId}/results',
  options: {
    description: 'Fetch a list of LeaderboardRank from a LeaderboardEntry',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.GAMEDEV_ACTIONS],
    },
    pre: [getAuthUserMiddleware, validateGameAuthMiddleware],
    response: {
      schema: multipleLeaderboardResultScoreSchema,
    },
  },
  handler: getLeaderboardResultsHandler,
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
    pre: [getAuthUserMiddleware, validateGameAuthMiddleware],
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
    pre: [getAuthUserMiddleware, validateGameAuthMiddleware],
    validate: {
      payload: postLeaderboardSchema,
    },
    response: {
      schema: leaderboardSchema,
    },
  },
  handler: upsertLeaderboardHandler,
};
