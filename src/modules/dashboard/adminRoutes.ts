import type { ServerRoute } from '@hapi/hapi';
import { getCurrentArenaGameState, getWeapons, newWeapon } from './adminHandlers';

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
    path: '/dashboard/admin/getWeapons',
    options: {
      description: 'Get list of weapons',
      tags: ['api'],
    },
    handler: getWeapons,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/newWeapon',
    options: {
      description: 'Adds a new weapon',
      tags: ['api'],
    },
    handler: newWeapon,
  },
];
