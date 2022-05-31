import Boom from '@hapi/boom';
import type { ServerRoute } from '@hapi/hapi';
import { logger } from '../../config';
import { createUser, findUserById, getUserByEmail } from '../../models/User';
import { USER_ROLE_LEVEL } from '../../consts/model';
import { findOrganizationByName } from '../../models/Organization';
import {
  createSession,
  findSessionById,
  findSessionByToken,
  findSessionByUserEmail,
  updateSession,
} from '../../models/Session';
import { firebaseApp } from '../../plugins/firebasePlugin';

interface GoogleAuthCredentials {
  provider: 'google';
  query: any;
  token: string;
  expiresIn: number;
  profile: {
    id: string;
    displayName: string;
    name: {
      given_name: string;
      family_name: string;
    };
    email: string;
    raw: {
      sub: string;
      name: string;
      given_name: string;
      family_name: string;
      picture: string;
      email: string;
      email_verified: boolean;
      locale: string;
    };
  };
}

export const userRoutes: ServerRoute[] = [
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
    handler: async (req, h) => {
      if (!req.auth.isAuthenticated) {
        logger.error({ error: req.auth.error });
        return Boom.forbidden(`You can't access if you're not authenticated`);
      }

      const { profile: googleProfile } = req.auth.credentials as unknown as GoogleAuthCredentials;

      const fastSession = await findSessionByUserEmail(googleProfile.email);

      if (fastSession) {
        const THOUSAND = 1000;
        if (Date.now() / THOUSAND < fastSession.expireTime / THOUSAND) {
          await updateSession({
            id: fastSession.id,
            _userId: fastSession._userId,
          });
          const updatedSession = await findSessionById(fastSession.id);
          if (!updatedSession) {
            return Boom.notFound('Session not found');
          }
          return h.view('successfullAuth', {
            userSession: {
              success: true,
              session: {
                token: updatedSession.token,
                expireTime: updatedSession.expireTime,
              },
            },
          });
        } else {
          await fastSession.destroy();
        }
      }

      if (!googleProfile.raw.email_verified) {
        return Boom.forbidden('Only validated emails can login');
      }

      req.cookieAuth.set({ id: googleProfile.id });

      let mutableUserFound = await getUserByEmail(googleProfile.email);

      if (!mutableUserFound) {
        const xteamOrganization = await findOrganizationByName('x-team');
        if (!xteamOrganization) {
          throw Boom.badRequest(`X-Team organization not found`);
        }
        mutableUserFound = await createUser({
          email: googleProfile.email,
          displayName: googleProfile.displayName,
          firebaseUserUid: null,
          profilePictureUrl: googleProfile.raw.picture,
          slackId: null,
          _roleId: USER_ROLE_LEVEL.USER,
          _organizationId: xteamOrganization?.id,
        });
      }
      if (!mutableUserFound.firebaseUserUid) {
        const firebaseUser = await firebaseApp.auth().getUserByEmail(googleProfile.email);

        if (!firebaseUser) {
          await firebaseApp.auth().createUser({
            email: googleProfile.email,
            displayName: googleProfile.displayName,
          });
        } else {
          mutableUserFound.firebaseUserUid = firebaseUser.uid;
          await mutableUserFound.save();
        }
      }

      const newSession = await createSession({
        _userId: mutableUserFound.id,
      });

      return h.view('successfullAuth', {
        userSession: {
          success: true,
          session: {
            token: newSession.token,
            expireTime: newSession.expireTime,
          },
        },
      });
    },
  },
  {
    method: ['GET'],
    path: '/general/login/session',
    options: {
      description: 'check if user is already logged in',
      tags: ['api', 'login', 'google'],
    },
    handler: async (req, h) => {
      const sessionToken = req.headers['xtu-session-token'];

      if (!sessionToken) {
        return h.response({
          success: false,
          message: 'xtu-session-token Header needed',
        });
      }
      const fastSession = await findSessionByToken(sessionToken);

      if (fastSession) {
        const THOUSAND = 1000;
        if (Date.now() / THOUSAND < fastSession.expireTime / THOUSAND) {
          await updateSession(
            {
              id: fastSession.id,
              _userId: fastSession._userId,
            },
            false
          );
          const updatedSession = await findSessionById(fastSession.id);
          if (!updatedSession) {
            return Boom.notFound('Session not found');
          }
          const user = await findUserById(updatedSession._userId);
          if (!user) {
            return Boom.notFound('User not found');
          }
          return h.response({
            success: true,
            session: {
              token: updatedSession.token,
              expireTime: updatedSession.expireTime,
            },
            user: {
              displayName: user.displayName,
              email: user.email,
              slackId: user.slackId,
              firebaseUserUid: user.firebaseUserUid,
              profilePictureUrl: user.profilePictureUrl,
              role: user._roleId,
              isAdmin:
                user._roleId === USER_ROLE_LEVEL.ADMIN ||
                user._roleId === USER_ROLE_LEVEL.SUPER_ADMIN,
            },
          });
        } else {
          await fastSession.destroy();
        }
      }

      return h.response({
        success: false,
        message: 'User needs to login',
      });
    },
  },
  {
    method: ['GET'],
    path: '/general/logout',
    options: {
      description: 'Logout the user',
      tags: ['api', 'login', 'google'],
    },
    handler: async (req, h) => {
      const sessionToken = req.headers['xtu-session-token'];

      if (!sessionToken) {
        return Boom.unauthorized('xtu-session-token Header needed');
      }
      const fastSession = await findSessionByToken(sessionToken);

      if (fastSession) {
        await fastSession.destroy();
      }

      return h.response({
        success: true,
        message: 'User logged out successfully',
      });
    },
  },
];
