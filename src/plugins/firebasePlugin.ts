import admin from 'firebase-admin';

import { getConfig } from '../config';

const googleApplicationCredentials = JSON.parse(getConfig('GOOGLE_APPLICATION_CREDENTIALS'));
let firebaseApp: admin.app.App;

const getFirebaseApp = (): admin.app.App => {
  if (firebaseApp) {
    return firebaseApp;
  }

  return admin.initializeApp({
    credential: admin.credential.cert(googleApplicationCredentials),
  });
};

export const createUserInFirebase = async (email: string, displayName: string) => {
  const firebaseUser = await getFirebaseApp().auth().getUserByEmail(email);

  if (!firebaseUser) {
    return await firebaseApp.auth().createUser({
      email,
      displayName,
    });
  }

  return firebaseUser;
};
