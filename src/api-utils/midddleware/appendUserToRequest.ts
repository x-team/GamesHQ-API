import Boom from '@hapi/boom';
import type { Request, ResponseToolkit } from '@hapi/hapi';

import { findSessionByToken } from '../../models/Session';
import type { User } from '../../models/User';
import { findUserById } from '../../models/User';

export async function appendUserToRequest(req: Request, _h: ResponseToolkit): Promise<User> {
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
    throw Boom.notFound('User not found');
  }
  return user;
  // return h.continue;
}
