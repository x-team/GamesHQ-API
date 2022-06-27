import type { ServerRoute } from '@hapi/hapi';

import { sessionSchema, logoutSessionSchema } from '../../api-utils/schemas/user';

import { checkAvailableSession, loginWithGoogle, logutFromAPI } from './userHandler';

export const loginWithGoogleRoute: ServerRoute =
  // Login with Google
  {
    method: ['GET', 'POST'],
    path: '/general/login/google',
    options: {
      description: 'Login into Games API with Google',
      tags: ['api', 'login', 'google'],
      auth: {
        mode: 'try',
        strategy: 'google',
      },
    },
    handler: loginWithGoogle,
  };

export const checkAvailableSessionRoute: ServerRoute = {
  method: ['GET'],
  path: '/general/login/session',
  options: {
    description: 'check if user is already logged in',
    tags: ['api', 'login', 'google'],
    response: {
      schema: sessionSchema,
    },
  },
  handler: checkAvailableSession,
};

export const logutFromAPIRoute: ServerRoute = {
  method: ['GET'],
  path: '/general/logout',
  options: {
    description: 'Logout the user',
    tags: ['api', 'login', 'google'],
    response: {
      schema: logoutSessionSchema,
    },
  },
  handler: logutFromAPI,
};

export const userRoutes: ServerRoute[] = [
  loginWithGoogleRoute,
  checkAvailableSessionRoute,
  logutFromAPIRoute,
];
