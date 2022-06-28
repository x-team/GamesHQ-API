import Boom from '@hapi/boom';
import type { Request, ResponseToolkit } from '@hapi/hapi';

import type { Capability } from '../../models';
import { findSessionByToken } from '../../models/Session';
import type { User } from '../../models/User';
import { findUserWithRoleAndCapabilities } from '../../models/User';
import type { CustomRequestThis } from '../interfaceAndTypes';

export async function getAuthUser(
  this: CustomRequestThis,
  req: Request,
  _h: ResponseToolkit
): Promise<User> {
  // console.log({ something: this }); // Get capabilities from this
  const sessionToken = req.headers['xtu-session-token'];
  if (!sessionToken) {
    throw Boom.forbidden('Only Auth users can access here - send session token');
  }
  const userSession = await findSessionByToken(sessionToken);
  if (!userSession) {
    throw Boom.forbidden('Only Auth users can access here - user is not logged in');
  }
  const user = await findUserWithRoleAndCapabilities(userSession._userId);
  if (!user) {
    throw Boom.notFound('User not found');
  }

  if (!userRoleContainsCapability(this.requiredCapabilities, user._role?._capabilities)) {
    throw Boom.unauthorized('Only authorized users can access here');
  }
  return user;
}

function userRoleContainsCapability(
  requiredCapabilities: string[],
  userCapabilities?: Capability[]
): boolean {
  if (!requiredCapabilities.length) {
    return true;
  }

  return requiredCapabilities.some((requiredC) => {
    return userCapabilities?.some((userCapabilties) => userCapabilties.name === requiredC);
  });
}
