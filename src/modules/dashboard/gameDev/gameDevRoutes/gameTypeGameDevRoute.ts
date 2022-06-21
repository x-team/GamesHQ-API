import type { ServerRoute } from '@hapi/hapi';

import { getAuthUser } from '../../../../api-utils/getAuthUser';
import { CAPABILITIES } from '../../../../api-utils/interfaceAndTypes';
import {
  gamedevGenericSchema,
  multipleGamesSchema,
  sigleGameItemSchema,
} from '../../../../api-utils/schemas/gameDev/game';
import {
  deleteGameTypeHandler,
  getGameTypeHandler,
  getGameTypesHandler,
  upsertGameTypeHandler,
} from '../gameDevHandlers/gameTypeGameDevHandler';

export const getGameTypesRoute: ServerRoute = {
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
};

export const getGameTypeByIdRoute: ServerRoute = {
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
};

export const upsertGameTypeRoute: ServerRoute = {
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
};

export const deleteGameTypeRoute: ServerRoute = {
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
};
