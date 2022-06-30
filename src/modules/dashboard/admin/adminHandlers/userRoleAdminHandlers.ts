import type { Lifecycle } from '@hapi/hapi';

import { arrayToJSON } from '../../../../api-utils/utils';
import {
  findAllUserRolesWithCapabilties,
  createOrUpdateUserRole,
} from '../../../../models/UserRole';
import type { UserRoleCreationAttributes } from '../../../../models/UserRole';

export const getAllUserRolesHandler: Lifecycle.Method = async (_, h) => {
  const userRoles = await findAllUserRolesWithCapabilties();
  return h.response(arrayToJSON(userRoles)).code(200);
};

export const upsertUserRolesHandler: Lifecycle.Method = async (request, h) => {
  const payload = request.payload as UserRoleCreationAttributes;

  const rslt = await createOrUpdateUserRole({ ...payload });

  return h.response(rslt?.toJSON()).code(200);
};
