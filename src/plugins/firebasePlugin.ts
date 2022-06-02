import Boom from '@hapi/boom';
import type { PluginSpecificConfiguration, Server } from '@hapi/hapi';
import admin from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

import { getConfig } from '../config';
import { SECONDS_IN_A_WEEK } from '../consts/api';
import { USER_ROLE_LEVEL } from '../consts/model';
import { User } from '../models';
import { findOrganizationByName } from '../models/Organization';
import { createUser } from '../models/User';

const googleApplicationCredentials = JSON.parse(getConfig('GOOGLE_APPLICATION_CREDENTIALS'));

export const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(googleApplicationCredentials),
});

const linkFirestoreUserIdToDatabaseUser = async (firebaseUser: DecodedIdToken) => {
  // TODO this should not be hardcoded to x-team in the future?
  const xteamOrganization = await findOrganizationByName('x-team');
  const { email, name, uid } = firebaseUser;

  if (!xteamOrganization || !email) {
    return;
  }

  const existingDbUser = await User.findOne({
    where: {
      email,
    },
  });

  if (existingDbUser && !existingDbUser.firebaseUserUid) {
    existingDbUser.firebaseUserUid = uid;
    await existingDbUser.save();
  } else if (!existingDbUser) {
    await createUser({
      email: email,
      displayName: name,
      firebaseUserUid: uid,
      profilePictureUrl: null,
      slackId: null,
      _roleId: USER_ROLE_LEVEL.USER,
      _organizationId: xteamOrganization?.id,
    });
  }
};

export const firebasePlugin = {
  name: 'Firebase Plugin',
  version: '1.0.0',
  register: (server: Server, _options: any) => {
    const firebaseTokenCache = server.cache({
      cache: 'firebase_token_cache',
      expiresIn: SECONDS_IN_A_WEEK,
      generateTimeout: 10000,
      generateFunc: async (idObject: any) => {
        const { id: firebaseIdToken } = idObject;
        try {
          const firebaseUser = await firebaseApp.auth().verifyIdToken(firebaseIdToken);
          if (firebaseUser) {
            await linkFirestoreUserIdToDatabaseUser(firebaseUser);
          }
          return firebaseUser;
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    });

    server.ext('onPostAuth', async (request: any, h) => {
      const { firebasePlugin } = request.route.settings.plugins as PluginSpecificConfiguration;
      if (!firebasePlugin) {
        return h.continue;
      }
      const { requiresAuth } = firebasePlugin;

      const {
        query: { firebaseIdToken },
      } = request;

      const firebaseUser: any = await firebaseTokenCache.get({
        id: firebaseIdToken,
      });

      if (!firebaseUser && requiresAuth) {
        throw Boom.badRequest('Invalid Firebase ID token.');
      } else {
        const firestore = firebaseApp.firestore();
        let firebaseUserData = (
          await firestore.collection('users').doc(firebaseUser.uid).get()
        ).data();

        if (!firebaseUserData) {
          firebaseUserData = {};
        }

        const userRole = firebaseUserData.role || 'user';
        const isAdmin = userRole === 'admin';

        if (!isAdmin) {
          throw Boom.badRequest('Lacking capabilities');
        }
        const firebaseUserRequestData = {
          ...firebaseUser,
          data: firebaseUserData,
        };
        request.firebaseUser = firebaseUserRequestData;
      }

      return h.continue;
    });
  },
};
