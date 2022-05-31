import type { ServerRoute } from '@hapi/hapi';
import { getAuthUser } from '../../api-utils/getAuthUser';
import { CAPABILITIES } from '../../api-utils/interfaceAndTypes';
import {
  deleteGameTypeHandler,
  getGameTypeHandler,
  getGameTypesHandler,
  upsertGameTypeHandler,
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
    },
    handler: deleteGameTypeHandler,
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
    },
    handler: upsertGameTypeHandler,
  },
];
