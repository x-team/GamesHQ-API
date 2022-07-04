import { getAuthUserMiddleware } from '../../../../api-utils/midddleware';
import { genericSchema } from '../../../../api-utils/schemas';
import {
  getAllCapabilitiesResponseSchema,
  createCapabilitiesRequestSchema,
  createCapabilitiesResponseSchema,
} from '../../../../api-utils/schemas/admin/capabilitySchemas';
import { CAPABILITIES } from '../../../../consts/model';
import {
  getAllCapabilitiesHandler,
  createCapabilityHandler,
  deleteCapabilityHandler,
} from '../adminHandlers/capabilityAdminHandlers';

export const getAllCapabilitiesRoute = {
  method: 'GET',
  path: '/admin/capabilities',
  options: {
    description: 'Get all capabilities',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.CAPABILITY_READ, CAPABILITIES.CAPABILITY_WRITE],
    },
    pre: [getAuthUserMiddleware],
    response: {
      schema: getAllCapabilitiesResponseSchema,
    },
  },
  handler: getAllCapabilitiesHandler,
};

export const createCapabilityRoute = {
  method: 'POST',
  path: '/admin/capabilities',
  options: {
    description: 'Create capability',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.CAPABILITY_WRITE],
    },
    pre: [getAuthUserMiddleware],
    validate: {
      payload: createCapabilitiesRequestSchema,
    },
    response: {
      schema: createCapabilitiesResponseSchema,
    },
  },
  handler: createCapabilityHandler,
};

export const deleteCapabilityRoute = {
  method: 'DELETE',
  path: '/admin/capabilities/{capabilityId}',
  options: {
    description: 'Delete capability',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.CAPABILITY_WRITE],
    },
    pre: [getAuthUserMiddleware],
    response: {
      schema: genericSchema,
    },
  },
  handler: deleteCapabilityHandler,
};
