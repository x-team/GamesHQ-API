import admin from 'firebase-admin';

import { getConfig } from '../config';

const googleApplicationCredentials = JSON.parse(getConfig('GOOGLE_APPLICATION_CREDENTIALS'));

export const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(googleApplicationCredentials),
});

export const createUserInFirebase = async (email: string, displayName: string) => {
  const firebaseUser = await firebaseApp.auth().getUserByEmail(email);

  if (!firebaseUser) {
    return await firebaseApp.auth().createUser({
      email,
      displayName,
    });
  }

  return firebaseUser;
};
