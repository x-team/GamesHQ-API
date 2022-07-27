import { getAuthUserMiddleware } from '../../../../api-utils/midddleware';
import {
  commandArenaRequestSchema,
  actionArenaRequestSchema,
  // commandArenaResponseSchema,
} from '../../../../api-utils/schemas/admin/arenaSchemas';
import { CAPABILITIES } from '../../../../consts/model';
import {
  getCurrentArenaGameState,
  arenaCommandHandler,
  arenaActionHandler,
} from '../adminHandlers/arenaAdminHandlers';

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

export const arenaCommandRoute = {
  method: 'POST',
  path: '/dashboard/admin/arena/command',
  options: {
    description: 'Post arena game command',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.THE_ARENA_WRITE],
    },
    pre: [getAuthUserMiddleware],
    validate: {
      payload: commandArenaRequestSchema,
    },
    // response: {
    //   schema: commandArenaResponseSchema,
    // },
  },
  handler: arenaCommandHandler,
};

export const arenaActionRoute = {
  method: 'POST',
  path: '/dashboard/admin/arena/action',
  options: {
    description: 'Post arena game action',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.THE_ARENA_WRITE],
    },
    pre: [getAuthUserMiddleware],
    validate: {
      payload: actionArenaRequestSchema,
    },
    // response: {
    //   schema: commandArenaResponseSchema,
    // },
  },
  handler: arenaActionHandler,
};
