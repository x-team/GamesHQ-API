import Boom from '@hapi/boom';
import type { Request, ResponseToolkit } from '@hapi/hapi';
import { ZERO } from '../games/consts/global';
import { findSessionByToken } from '../models/Session';
import { findUserById } from '../models/User';
import { CustomRequestThis } from './interfaceAndTypes';

export async function getAuthUser(this: CustomRequestThis, req: Request, _h: ResponseToolkit) {
  // console.log({ something: this }); // Get capabilities from this
  const sessionToken = req.headers['xtu-session-token'];
  if (!sessionToken) {
    throw Boom.forbidden('Only Auth users can access here - send session token');
  }
  const userSession = await findSessionByToken(sessionToken);
  if (!userSession) {
    throw Boom.forbidden('Only Auth users can access here - user is not logged in');
  }
  const user = await findUserById(userSession._userId);
  if (!user) {
    return Boom.notFound('User not found');
  }
  const capabilityHeight = this.requiredCapabilities.shift() ?? ZERO;

  // This works for now while we design and code the capabilities system
  if ((user._roleId ?? ZERO) < capabilityHeight) {
    return Boom.unauthorized('Only authorized users can access here');
  }
  return user;
  // return h.continue;
}
