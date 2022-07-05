import { getAuthUserMiddleware } from '../../../../api-utils/midddleware';
import { CAPABILITIES } from '../../../../consts/model';
import { getCurrentArenaGameState } from '../adminHandlers/arenaAdminHandlers';

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
