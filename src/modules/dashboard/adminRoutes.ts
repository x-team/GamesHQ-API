import type { ServerRoute } from '@hapi/hapi';
import { getCurrentArenaGameState } from './adminHandlers';

export const adminRoutes: ServerRoute[] = [
  {
    method: 'GET',
    path: '/dashboard/admin/arena/getState',
    options: {
      description: 'Get state of current arena game (if any)',
      tags: ['api'],
    },
    handler: getCurrentArenaGameState,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/arena/getWeapons',
    options: {
      description: 'Get list of weapons',
      tags: ['api'],
    },
    handler: getWeapons,
  },
];
