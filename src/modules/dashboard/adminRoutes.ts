import type { ServerRoute } from '@hapi/hapi';
import {
  getCurrentArenaGameState,
  getWeapon,
  getWeapons,
  upsertWeaponHandler,
} from './adminHandlers';

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
    method: 'GET',
    path: '/dashboard/admin/weapons/{weaponId}',
    options: {
      description: 'Get information on a specific weapon',
      tags: ['api'],
    },
    handler: getWeapon,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/upsertWeapon',
    options: {
      description: 'Adds a new weapon',
      tags: ['api'],
    },
    handler: upsertWeaponHandler,
  },
];
