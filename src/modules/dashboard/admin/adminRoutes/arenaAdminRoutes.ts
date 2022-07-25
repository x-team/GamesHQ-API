import { getAuthUserMiddleware } from '../../../../api-utils/midddleware';
import {
  commandArenaRequestSchema,
  commandArenaResponseSchema,
} from '../../../../api-utils/schemas/admin/arenaSchemas';
import { CAPABILITIES } from '../../../../consts/model';
import { getCurrentArenaGameState, commandArenaHandler } from '../adminHandlers/arenaAdminHandlers';

export const getCurrentArenaGameStateRoute = {
  method: 'GET',
  path: '/dashboard/admin/arena/getState',
  options: {
    description: 'Get state of current arena game (if any)',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.THE_ARENA_READ, CAPABILITIES.THE_ARENA_WRITE],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: getCurrentArenaGameState,
};

export const commandArenaRoute = {
  method: 'POST',
  path: '/dashboard/admin/arena/command',
  options: {
    description: 'Get state of current arena game (if any)',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.THE_ARENA_WRITE],
    },
    pre: [getAuthUserMiddleware],
    validate: {
      payload: commandArenaRequestSchema,
    },
    response: {
      schema: commandArenaResponseSchema,
    },
  },
  handler: commandArenaHandler,
};
