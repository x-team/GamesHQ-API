import { getAuthUserMiddleware } from '../../../../api-utils/midddleware';
import { CAPABILITIES } from '../../../../consts/model';
import {
  getEnemyHandler,
  getEnemiesHandler,
  deleteEnemyHandler,
  upsertEnemyHandler,
} from '../adminHandlers/enemyAdminHandlers';

export const getEnemyRoute = {
  method: 'GET',
  path: '/dashboard/admin/enemies/{enemyId}',
  options: {
    description: 'Get information on a specific enemy',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.ENEMY_READ, CAPABILITIES.ENEMY_WRITE],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: getEnemyHandler,
};

export const deleteEnemyRoute = {
  method: 'DELETE',
  path: '/dashboard/admin/enemies/{enemyId}',
  options: {
    description: 'Delete an enemy.',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.ENEMY_WRITE],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: deleteEnemyHandler,
};

export const getEnemiesRoute = {
  method: 'GET',
  path: '/dashboard/admin/enemies',
  options: {
    description: 'Get all enemies',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.ENEMY_READ, CAPABILITIES.ENEMY_WRITE],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: getEnemiesHandler,
};

export const upsertEnemyRoute = {
  method: 'POST',
  path: '/dashboard/admin/upsertEnemy',
  options: {
    description: 'Add or update enemy',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.ENEMY_WRITE],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: upsertEnemyHandler,
};
