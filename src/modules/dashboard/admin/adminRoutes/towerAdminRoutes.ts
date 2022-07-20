import { getAuthUserMiddleware } from '../../../../api-utils/midddleware';
import { genericSchema } from '../../../../api-utils/schemas';
import {
  addTowerRequestSchema,
  addTowerResponseSchema,
} from '../../../../api-utils/schemas/admin/towerSchemas';
import { CAPABILITIES } from '../../../../consts/model';
import {
  getTowerGameStatusHandler,
  newTowerGameHandler,
  endCurrentTowerGameHandler,
  openOrCloseCurrentTowerHandler,
  addEnemyToFloorHandler,
  addTowerFloorHandler,
  removeTowerFloorHandler,
} from '../adminHandlers/towerAdminHandlers';

export const getTowerGameStatusRoute = {
  method: 'GET',
  path: '/dashboard/admin/tower-games/status',
  options: {
    description: 'Get status of current tower game',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.THE_TOWER_READ, CAPABILITIES.THE_TOWER_WRITE],
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
      requiredCapabilities: [CAPABILITIES.THE_TOWER_WRITE],
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
      requiredCapabilities: [CAPABILITIES.THE_TOWER_WRITE],
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
      requiredCapabilities: [CAPABILITIES.THE_TOWER_WRITE],
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
      requiredCapabilities: [CAPABILITIES.THE_TOWER_WRITE],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: addEnemyToFloorHandler,
};

export const addTowerFloorRoute = {
  method: 'POST',
  path: '/dashboard/admin/tower-games/{towerGameId}/floors',
  options: {
    description: 'Add tower floor',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.THE_TOWER_WRITE],
    },
    pre: [getAuthUserMiddleware],
    validate: {
      payload: addTowerRequestSchema,
    },
    response: {
      schema: addTowerResponseSchema,
    },
  },
  handler: addTowerFloorHandler,
};

export const removeTowerFloorRoute = {
  method: 'DELETE',
  path: '/dashboard/admin/tower-games/{towerGameId}/floors/{floorId}',
  options: {
    description: 'Remove tower floor',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.THE_TOWER_WRITE],
    },
    pre: [getAuthUserMiddleware],
    response: {
      schema: genericSchema,
    },
  },
  handler: removeTowerFloorHandler,
};
