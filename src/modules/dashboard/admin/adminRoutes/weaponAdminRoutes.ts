import { getAuthUserMiddleware } from '../../../../api-utils/midddleware';
import { CAPABILITIES } from '../../../../consts/model';
import {
  getWeaponsHandler,
  getWeaponHandler,
  upsertWeaponHandler,
  deleteWeaponHandler,
} from '../adminHandlers/weaponAdminHandlers';

export const getWeaponsRoute = {
  method: 'GET',
  path: '/dashboard/admin/getWeapons',
  options: {
    description: 'Get list of weapons',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.WEAPONS_READ, CAPABILITIES.WEAPONS_WRITE],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: getWeaponsHandler,
};

export const getWeaponByIdRoute = {
  method: 'GET',
  path: '/dashboard/admin/weapons/{weaponId}',
  options: {
    description: 'Get information on a specific weapon',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.WEAPONS_READ, CAPABILITIES.WEAPONS_WRITE],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: getWeaponHandler,
};

export const upsertWeaponRoute = {
  method: 'POST',
  path: '/dashboard/admin/upsertWeapon',
  options: {
    description: 'Add or update weapon',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.WEAPONS_WRITE],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: upsertWeaponHandler,
};

export const deleteWeaponRoute = {
  method: 'DELETE',
  path: '/dashboard/admin/weapons/{itemId}',
  options: {
    description: 'Delete a weapon by its item id.',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.WEAPONS_WRITE],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: deleteWeaponHandler,
};
