import { getAuthUserMiddleware } from '../../../../api-utils/midddleware';
import { getAllCapabilitiesResponseSchema } from '../../../../api-utils/schemas/admin/capabilitySchemas';
import { CAPABILITIES } from '../../../../consts/model';
import { getAllCapabilitiesHandler } from '../adminHandlers/capabilityAdminHandlers';

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
