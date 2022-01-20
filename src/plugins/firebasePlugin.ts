import Boom from '@hapi/boom';
import type { PluginSpecificConfiguration, Server } from '@hapi/hapi';
import admin from 'firebase-admin';

import { getConfig } from '../config';

const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(getConfig('GOOGLE_APPLICATION_CREDENTIALS')),
});

const setupInitialFirestoreUserData = async (firebaseUserUid: string) => {
  const firestore = firebaseApp.firestore();

  await firestore
    .collection('users')
    .doc(firebaseUserUid)
    .set({
      gamesHq: {
        capabilities: [],
      },
    });
};

export const firebasePlugin = {
  name: 'Firebase Plugin',
  version: '1.0.0',
  register: (server: Server, _options: any) => {
    const SECONDS_IN_A_WEEK = 604800000;
    const firebaseTokenCache = server.cache({
      cache: 'firebase_token_cache',
      expiresIn: SECONDS_IN_A_WEEK,
      generateTimeout: 10000,
      generateFunc: async (idObject: any) => {
        const { id: firebaseIdToken } = idObject;
        try {
          const token = await firebaseApp.auth().verifyIdToken(firebaseIdToken);
          return token;
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
      const { requiresAuth, requiredCapabilities } = firebasePlugin;

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
          await setupInitialFirestoreUserData(firebaseUser.uid);
          firebaseUserData = {};
        }

        const userCapabilities = firebaseUserData.gamesHq.capabilities || [];
        const meetsAllCapabilityChecks = requiredCapabilities.every((capability) =>
          userCapabilities.includes(capability)
        );

        if (!meetsAllCapabilityChecks) {
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
