import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';

import { arrayToJSON } from '../../../../api-utils/utils';
import { USER_ROLE_NAME } from '../../../../consts/model';
import {
  findAllUserRolesWithCapabilties,
  createOrUpdateUserRole,
  findUserRoleByName,
  deleteUserRole,
} from '../../../../models/UserRole';
import type { UserRoleCreationAttributes } from '../../../../models/UserRole';

export const getAllUserRolesHandler: Lifecycle.Method = async (_, h) => {
  const userRoles = await findAllUserRolesWithCapabilties();
  return h.response(arrayToJSON(userRoles)).code(200);
};

export const upsertUserRolesHandler: Lifecycle.Method = async (request, h) => {
  const payload = request.payload as UserRoleCreationAttributes;

  const rslt = await createOrUpdateUserRole({ ...payload });

  return h
    .response({
      ...rslt?.toJSON(),
      _capabilities: payload._capabilities,
    })
    .code(200);
};

export const deleteUserRoleHandler: Lifecycle.Method = async (request, h) => {
  const superAdminRole = await findUserRoleByName(USER_ROLE_NAME.SUPER_ADMIN);

  if (request.params.userRoleId == superAdminRole?.id) {
    throw Boom.forbidden('that role cannot be deleted');
  }

  const rslt = await deleteUserRole(request.params.userRoleId);

  if (!rslt) {
    throw Boom.notFound('user role not found');
  }

  return h.response({ success: true }).code(200);
};
