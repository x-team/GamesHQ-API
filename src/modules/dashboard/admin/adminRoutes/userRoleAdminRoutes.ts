import { getAuthUserMiddleware } from '../../../../api-utils/midddleware';
import {
  getAllUserRolesResponseSchema,
  upsertUserRoleRequestSchema,
  upsertUserRoleResponseSchema,
} from '../../../../api-utils/schemas/admin/userRoleSchemas';
import { CAPABILITIES } from '../../../../consts/model';
import {
  getAllUserRolesHandler,
  upsertUserRolesHandler,
} from '../adminHandlers/userRoleAdminHandlers';

export const getAllUserRolesRoute = {
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
      schema: getAllUserRolesResponseSchema,
    },
  },
  handler: getAllUserRolesHandler,
};

export const upsertUserRolesRoute = {
  method: 'POST',
  path: '/admin/userrole',
  options: {
    description: 'upsert user role',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.USER_ROLE_WRITE],
    },
    pre: [getAuthUserMiddleware],
    validate: {
      payload: upsertUserRoleRequestSchema,
    },
    response: {
      schema: upsertUserRoleResponseSchema,
    },
  },
  handler: upsertUserRolesHandler,
};
