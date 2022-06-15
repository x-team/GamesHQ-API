import admin from 'firebase-admin';

import { getConfig } from '../config';

const googleApplicationCredentials = JSON.parse(getConfig('GOOGLE_APPLICATION_CREDENTIALS'));

export const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(googleApplicationCredentials),
});
