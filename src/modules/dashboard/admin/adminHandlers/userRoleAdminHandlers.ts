import type { Lifecycle } from '@hapi/hapi';

import { arrayToJSON } from '../../../../api-utils/utils';
import { findAllUserRolesWithCapabilties } from '../../../../models/UserRole';

export const getUserRoleHanlder: Lifecycle.Method = async (_, h) => {
  const userRoles = await findAllUserRolesWithCapabilties();
  return h.response(arrayToJSON(userRoles)).code(200);
};
