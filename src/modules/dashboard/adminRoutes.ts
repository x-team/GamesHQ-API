import type { ServerRoute } from '@hapi/hapi';
import {
  getCurrentArenaGameState,
  getWeaponHandler,
  getWeaponsHandler,
  upsertWeaponHandler,
  getEnemyHandler,
  upsertEnemyHandler,
  getEnemiesHandler,
  deleteEnemyHandler,
  getZoneHandler,
  deleteZoneHandler,
  upsertZoneHandler,
  getZonesHandler,
  deleteWeaponHandler,
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
    handler: getWeaponsHandler,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/weapons/{weaponId}',
    options: {
      description: 'Get information on a specific weapon',
      tags: ['api'],
    },
    handler: getWeaponHandler,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/upsertWeapon',
    options: {
      description: 'Add or update weapon',
      tags: ['api'],
    },
    handler: upsertWeaponHandler,
  },

  {
    method: 'DELETE',
    path: '/dashboard/admin/weapons/{itemId}',
    options: {
      description: 'Delete a weapon by its item id.',
      tags: ['api'],
    },
    handler: deleteWeaponHandler,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/enemies/{enemyId}',
    options: {
      description: 'Get information on a specific enemy',
      tags: ['api'],
    },
    handler: getEnemyHandler,
  },

  {
    method: 'DELETE',
    path: '/dashboard/admin/enemies/{enemyId}',
    options: {
      description: 'Delete an enemy.',
      tags: ['api'],
    },
    handler: deleteEnemyHandler,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/enemies',
    options: {
      description: 'Get all enemies',
      tags: ['api'],
    },
    handler: getEnemiesHandler,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/upsertEnemy',
    options: {
      description: 'Add or update enemy',
      tags: ['api'],
    },
    handler: upsertEnemyHandler,
  },

  // 🏠 Zones

  {
    method: 'GET',
    path: '/dashboard/admin/zones/{zoneId}',
    options: {
      description: 'Get specific zone by id',
      tags: ['api'],
    },
    handler: getZoneHandler,
  },

  {
    method: 'DELETE',
    path: '/dashboard/admin/zones/{zoneId}',
    options: {
      description: 'Delete a zone.',
      tags: ['api'],
    },
    handler: deleteZoneHandler,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/zones',
    options: {
      description: 'Get all zones',
      tags: ['api'],
    },
    handler: getZonesHandler,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/upsertZone',
    options: {
      description: 'Add or update a zone',
      tags: ['api'],
    },
    handler: upsertZoneHandler,
  },
];
