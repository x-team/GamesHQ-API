import { getAuthUserMiddleware } from '../../../../api-utils/midddleware';
import { getUserRolesSchema } from '../../../../api-utils/schemas/admin/userRoleSchemas';
import { CAPABILITIES } from '../../../../consts/model';
import { getUserRoleHanlder } from '../adminHandlers/userRoleAdminHandlers';

export const getUserRoleRoute = {
  method: 'GET',
  path: '/admin/userrole',
  options: {
    description: 'Get all user roles and capabilities',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.USER_ROLE_READ, CAPABILITIES.USER_ROLE_WRITE],
    },
    pre: [getAuthUserMiddleware],
    response: {
      schema: getUserRolesSchema,
    },
  },
  handler: getUserRoleHanlder,
};
