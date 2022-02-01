import type { ServerRoute } from '@hapi/hapi';
import { CAPABILITIES } from '../../utils/firebase';

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

declare module '@hapi/hapi' {
  export interface PluginSpecificConfiguration {
    firebasePlugin: {
      requiresAuth: boolean;
      requiredCapabilities: string[];
    };
  }
}

export const adminRoutes: ServerRoute[] = [
  {
    method: 'GET',
    path: '/admin/getEmoji',
    options: {
      description: 'Get all emojis and their respective URLs (from the X-Team slack)',
      tags: ['api'],
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
    },
    handler: getEmojis,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/arena/getState',
    options: {
      description: 'Get state of current arena game (if any)',
      tags: ['api'],
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
    },
    handler: getCurrentArenaGameState,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/getWeapons',
    options: {
      description: 'Get list of weapons',
      tags: ['api'],
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
    },
    handler: getWeaponsHandler,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/weapons/{weaponId}',
    options: {
      description: 'Get information on a specific weapon',
      tags: ['api'],
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
    },
    handler: getWeaponHandler,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/upsertWeapon',
    options: {
      description: 'Add or update weapon',
      tags: ['api'],
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
    },
    handler: upsertWeaponHandler,
  },

  {
    method: 'DELETE',
    path: '/dashboard/admin/weapons/{itemId}',
    options: {
      description: 'Delete a weapon by its item id.',
      tags: ['api'],
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
    },
    handler: deleteWeaponHandler,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/enemies/{enemyId}',
    options: {
      description: 'Get information on a specific enemy',
      tags: ['api'],
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
    },
    handler: getEnemyHandler,
  },

  {
    method: 'DELETE',
    path: '/dashboard/admin/enemies/{enemyId}',
    options: {
      description: 'Delete an enemy.',
      tags: ['api'],
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
    },
    handler: deleteEnemyHandler,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/enemies',
    options: {
      description: 'Get all enemies',
      tags: ['api'],
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
    },
    handler: getEnemiesHandler,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/upsertEnemy',
    options: {
      description: 'Add or update enemy',
      tags: ['api'],
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
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
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
    },
    handler: getZoneHandler,
  },

  {
    method: 'DELETE',
    path: '/dashboard/admin/zones/{zoneId}',
    options: {
      description: 'Delete a zone.',
      tags: ['api'],
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
    },
    handler: deleteZoneHandler,
  },

  {
    method: 'GET',
    path: '/dashboard/admin/zones',
    options: {
      description: 'Get all zones',
      tags: ['api'],
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
    },
    handler: getZonesHandler,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/upsertZone',
    options: {
      description: 'Add or update a zone',
      tags: ['api'],
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
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
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
    },
    handler: getTowerGameStatusHandler,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/tower-games/new',
    options: {
      description: 'Create new tower game.',
      tags: ['api'],
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
    },
    handler: newTowerGameHandler,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/tower-games/end-current-game',
    options: {
      description: 'End current tower game.',
      tags: ['api'],
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
    },
    handler: endCurrentTowerGameHandler,
  },

  {
    method: 'POST',
    path: '/dashboard/admin/tower-games/open-or-close',
    options: {
      description: 'Open or close current tower game based on POST payload data.',
      tags: ['api'],
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
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
      plugins: {
        firebasePlugin: {
          requiresAuth: true,
          requiredCapabilities: [CAPABILITIES.ACCESS_ADMIN_ACTIONS],
        },
      },
    },
    handler: addEnemyToFloorHandler,
  },
];
