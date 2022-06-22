import type { ServerRoute } from '@hapi/hapi';

import { CAPABILITIES } from '../../../../api-utils/interfaceAndTypes';
import {
  getAuthUserMiddleware,
  validateGameAuthMiddleware,
} from '../../../../api-utils/midddleware';
import {
  gamedevGenericSchema,
  multipleGamesSchema,
  sigleGameItemSchema,
  upsertGameTypeSchema,
} from '../../../../api-utils/schemas/gameDev/gameTypeSchema';
import {
  deleteGameTypeHandler,
  getGameTypeHandler,
  getGameTypesHandler,
  upsertGameTypeHandler,
} from '../gameDevHandlers/gameTypeGameDevHandlers';

export const getGameTypesRoute: ServerRoute = {
  method: 'GET',
  path: '/dashboard/game-dev/games',
  options: {
    description: 'Get all games',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.GAMEDEV_ACTIONS],
    },
    pre: [getAuthUserMiddleware, validateGameAuthMiddleware],
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
    pre: [getAuthUserMiddleware, validateGameAuthMiddleware],
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
    pre: [getAuthUserMiddleware, validateGameAuthMiddleware],
    validate: {
      payload: upsertGameTypeSchema,
    },
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
    pre: [getAuthUserMiddleware, validateGameAuthMiddleware],
    response: {
      schema: gamedevGenericSchema,
    },
  },
  handler: deleteGameTypeHandler,
};
