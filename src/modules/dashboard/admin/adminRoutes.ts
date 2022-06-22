import type { ServerRoute } from '@hapi/hapi';

import { CAPABILITIES } from '../../../api-utils/interfaceAndTypes';
import { getAuthUser } from '../../../api-utils/midddleware/getAuthUser';

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
  getTowerGameStatusHandler,
  newTowerGameHandler,
  endCurrentTowerGameHandler,
  openOrCloseCurrentTowerHandler,
  getEmojis,
  addEnemyToFloorHandler,
} from './adminHandlers';

export const adminRoutes: ServerRoute[] = [
  {
    method: 'GET',
    path: '/admin/getEmoji',
    options: {
      description: 'Get all emojis and their respective URLs (from the X-Team slack)',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: getEmojis,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/arena/getState',
    options: {
      description: 'Get state of current arena game (if any)',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: getCurrentArenaGameState,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/getWeapons',
    options: {
      description: 'Get list of weapons',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: getWeaponsHandler,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/weapons/{weaponId}',
    options: {
      description: 'Get information on a specific weapon',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: getWeaponHandler,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/upsertWeapon',
    options: {
      description: 'Add or update weapon',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: upsertWeaponHandler,
  },

  {
    method: 'DELETE',
    path: '/dashboard/admin/weapons/{itemId}',
    options: {
      description: 'Delete a weapon by its item id.',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: deleteWeaponHandler,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/enemies/{enemyId}',
    options: {
      description: 'Get information on a specific enemy',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: getEnemyHandler,
  },

  {
    method: 'DELETE',
    path: '/dashboard/admin/enemies/{enemyId}',
    options: {
      description: 'Delete an enemy.',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: deleteEnemyHandler,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/enemies',
    options: {
      description: 'Get all enemies',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: getEnemiesHandler,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/upsertEnemy',
    options: {
      description: 'Add or update enemy',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
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
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: getZoneHandler,
  },

  {
    method: 'DELETE',
    path: '/dashboard/admin/zones/{zoneId}',
    options: {
      description: 'Delete a zone.',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: deleteZoneHandler,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/zones',
    options: {
      description: 'Get all zones',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: getZonesHandler,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/upsertZone',
    options: {
      description: 'Add or update a zone',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: upsertZoneHandler,
  },

  // 🏯 TOWER GAMES
  {
    method: 'GET',
    path: '/dashboard/admin/tower-games/status',
    options: {
      description: 'Get status of current tower game',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: getTowerGameStatusHandler,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/tower-games/new',
    options: {
      description: 'Create new tower game.',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: newTowerGameHandler,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/tower-games/end-current-game',
    options: {
      description: 'End current tower game.',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: endCurrentTowerGameHandler,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/tower-games/open-or-close',
    options: {
      description: 'Open or close current tower game based on POST payload data.',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: openOrCloseCurrentTowerHandler,
  },

  // 🪜 Floors

  {
    method: 'POST',
    path: '/dashboard/admin/floors/{floorId}/addEnemies',
    options: {
      description: 'Add ',
      tags: ['api'],
      bind: {
        requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
      },
      pre: [
        {
          method: getAuthUser,
          assign: 'getAuthUser',
        },
      ],
    },
    handler: addEnemyToFloorHandler,
  },
];
