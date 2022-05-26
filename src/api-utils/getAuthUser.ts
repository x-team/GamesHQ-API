import Boom from '@hapi/boom';
import type { Request, ResponseToolkit } from '@hapi/hapi';
import { getUserByEmail } from '../models/User';

export async function getAuthUser(request: Request, _h: ResponseToolkit) {
  const firebaseUser = request.firebaseUser;
  if (!firebaseUser) {
    throw Boom.forbidden("Firebase guest can't access here");
  }
  const userEmail = firebaseUser.email;
  const user = await getUserByEmail(userEmail);
  if (!user) {
    throw Boom.notFound('User does not exist');
  }

  return user;
  // return h.continue;
}
