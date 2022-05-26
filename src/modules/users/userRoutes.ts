import Boom from '@hapi/boom';
import admin from 'firebase-admin';
import type { ServerRoute } from '@hapi/hapi';
import { getConfig, logger } from '../../config';
import { createUser, getUserByEmail } from '../../models/User';
import { USER_ROLE_LEVEL } from '../../consts/model';
import { findOrganizationByName } from '../../models/Organization';
import {
  createSession,
  findSessionByToken,
  findSessionByUserEmail,
  updateSession,
} from '../../models/Session';

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
      const googleApplicationCredentials = JSON.parse(getConfig('GOOGLE_APPLICATION_CREDENTIALS'));

      const fastSession = await findSessionByUserEmail(googleProfile.email);

      if (fastSession) {
        const THOUSAND = 1000;
        if (Date.now() / THOUSAND < fastSession.expireTime / THOUSAND) {
          await updateSession({
            id: fastSession.id,
            _userId: fastSession._userId,
          });
          // Something happening up here or down here
          return h.response({
            success: true,
            session: {
              token: fastSession.token,
              expireTime: fastSession.expireTime,
            },
          });
        } else {
          await fastSession.destroy();
        }
      }

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

      const firebaseApp = admin.initializeApp(
        {
          credential: admin.credential.cert(googleApplicationCredentials),
        },
        'loginFirebaseApp'
      );
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

      const session = await createSession({
        _userId: mutableUserFound.id,
      });

      return h.response({
        success: true,
        session: {
          token: session.token,
          expireTime: session.expireTime,
        },
      });
    },
  },
  {
    method: ['GET'],
    path: '/general/login/session',
    options: {
      description: 'Login into Games API with Google',
      tags: ['api', 'login', 'google'],
    },
    handler: async (req, h) => {
      const sessionToken = req.headers['xtu-session-token'];

      if (!sessionToken) {
        return Boom.forbidden('xtu-session-token Header needed');
      }
      const fastSession = await findSessionByToken(sessionToken);

      if (fastSession) {
        const THOUSAND = 1000;
        if (Date.now() / THOUSAND < fastSession.expireTime / THOUSAND) {
          await updateSession({
            id: fastSession.id,
            _userId: fastSession._userId,
          });
          // Something happening up here or down here
          return h.response({
            success: true,
            session: {
              token: fastSession.token,
              expireTime: fastSession.expireTime,
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
];
