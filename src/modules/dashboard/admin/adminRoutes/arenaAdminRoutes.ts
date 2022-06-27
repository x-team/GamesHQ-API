import { CAPABILITIES } from '../../../../api-utils/interfaceAndTypes';
import { getAuthUserMiddleware } from '../../../../api-utils/midddleware';
import { getCurrentArenaGameState } from '../adminHandlers/arenaAdminHandlers';

export const getCurrentArenaGameStateRoute = {
  method: 'GET',
  path: '/dashboard/admin/arena/getState',
  options: {
    description: 'Get state of current arena game (if any)',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: getCurrentArenaGameState,
};
