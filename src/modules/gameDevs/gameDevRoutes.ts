import type { ServerRoute } from '@hapi/hapi';

import { getAuthUser } from '../../api-utils/getAuthUser';
import { CAPABILITIES } from '../../api-utils/interfaceAndTypes';
import {
  gamedevGenericSchema,
  multipleGamesSchema,
  sigleGameItemSchema,
} from '../../api-utils/responseSchemas/gamedev';

import {
  deleteGameTypeHandler,
  getGameTypeHandler,
  getGameTypesHandler,
  upsertGameTypeHandler,
  getLeaderboardHandler,
  upsertLeaderboardHandler,
} from './gameDevHandlers';

declare module '@hapi/hapi' {
  export interface PluginSpecificConfiguration {
    firebasePlugin: {
      requiresAuth: boolean;
      requiredCapabilities: string[];
    };
  }
}

export const gameDevRoutes: ServerRoute[] = [
  // 🎮 Games
  {
    method: 'GET',
    path: '/dashboard/game-dev/games/{gameTypeId}',
    options: {
      description: 'Get specific game by id',
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
        schema: sigleGameItemSchema,
      },
    },
    handler: getGameTypeHandler,
  },

  {
    method: 'DELETE',
    path: '/dashboard/game-dev/games/{gameTypeId}',
    options: {
      description: 'Delete a game.',
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
    handler: deleteGameTypeHandler,
  },
  {
    method: 'GET',
    path: '/dashboard/game-dev/games/{gameTypeId}/leaderboard',
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
    },
    handler: getLeaderboardHandler,
  },
  {
    method: 'POST',
    path: '/dashboard/game-dev/games/{gameTypeId}/leaderboard',
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
    },
    handler: upsertLeaderboardHandler,
  },
  {
    method: 'GET',
    path: '/dashboard/game-dev/games',
    options: {
      description: 'Get all games',
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
        schema: multipleGamesSchema,
      },
    },
    handler: getGameTypesHandler,
  },

  {
    method: 'POST',
    path: '/dashboard/game-dev/games/upsertGameType',
    options: {
      description: 'Add or update a game',
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
    handler: upsertGameTypeHandler,
  },
];
