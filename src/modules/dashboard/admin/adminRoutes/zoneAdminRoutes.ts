import { getAuthUserMiddleware } from '../../../../api-utils/midddleware';
import { CAPABILITIES } from '../../../../consts/model';
import {
  getZoneHandler,
  getZonesHandler,
  deleteZoneHandler,
  upsertZoneHandler,
} from '../adminHandlers/zoneAdminHandlers';

export const getZoneRoute = {
  method: 'GET',
  path: '/dashboard/admin/zones/{zoneId}',
  options: {
    description: 'Get specific zone by id',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.ZONE_READ, CAPABILITIES.ZONE_WRITE],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: getZoneHandler,
};

export const deleteZoneRoute = {
  method: 'DELETE',
  path: '/dashboard/admin/zones/{zoneId}',
  options: {
    description: 'Delete a zone.',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.ZONE_WRITE],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: deleteZoneHandler,
};

export const getZonesRoute = {
  method: 'GET',
  path: '/dashboard/admin/zones',
  options: {
    description: 'Get all zones',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.ZONE_READ, CAPABILITIES.ZONE_WRITE],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: getZonesHandler,
};

export const upsertZoneRoute = {
  method: 'POST',
  path: '/dashboard/admin/upsertZone',
  options: {
    description: 'Add or update a zone',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.ZONE_WRITE],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: upsertZoneHandler,
};
