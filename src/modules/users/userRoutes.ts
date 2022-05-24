import Boom from '@hapi/boom';
import admin from 'firebase-admin';
import type { ServerRoute } from '@hapi/hapi';
import { getConfig } from '../../config';
import { createUser, getUserByEmail } from '../../models/User';
import { USER_ROLE_LEVEL } from '../../consts/model';
import { findOrganizationByName } from '../../models/Organization';

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
        return `Authentication failed due to: ${req.auth.error.message}`;
      }
      const { profile: googleProfile } = req.auth.credentials as unknown as GoogleAuthCredentials;
      const googleApplicationCredentials = JSON.parse(getConfig('GOOGLE_APPLICATION_CREDENTIALS'));

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
      // Perform any account lookup or registration, setup local session,
      // and redirect to the application. The third-party credentials are
      // stored in request.auth.credentials. Any query parameters from
      // the initial request are passed back via request.auth.credentials.query.

      return h.redirect('/');
    },
  },
];
