import { CAPABILITIES } from '../../../../api-utils/interfaceAndTypes';
import { getAuthUserMiddleware } from '../../../../api-utils/midddleware';
import {
  getTowerGameStatusHandler,
  newTowerGameHandler,
  endCurrentTowerGameHandler,
  openOrCloseCurrentTowerHandler,
  addEnemyToFloorHandler,
} from '../adminHandlers/towerAdminHandlers';

export const getTowerGameStatusRoute = {
  method: 'GET',
  path: '/dashboard/admin/tower-games/status',
  options: {
    description: 'Get status of current tower game',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: getTowerGameStatusHandler,
};

export const newTowerGameRoute = {
  method: 'POST',
  path: '/dashboard/admin/tower-games/new',
  options: {
    description: 'Create new tower game.',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: newTowerGameHandler,
};

export const endCurrentTowerGameRoute = {
  method: 'POST',
  path: '/dashboard/admin/tower-games/end-current-game',
  options: {
    description: 'End current tower game.',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: endCurrentTowerGameHandler,
};

export const openOrCloseCurrentTowerRoute = {
  method: 'POST',
  path: '/dashboard/admin/tower-games/open-or-close',
  options: {
    description: 'Open or close current tower game based on POST payload data.',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: openOrCloseCurrentTowerHandler,
};

export const addEnemyToFloorRoute = {
  method: 'POST',
  path: '/dashboard/admin/floors/{floorId}/addEnemies',
  options: {
    description: 'Add ',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: addEnemyToFloorHandler,
};
