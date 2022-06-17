import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

initializeApp({
  credential: applicationDefault(),
});

export const createUserInFirebase = async (email: string, displayName: string) => {
  try {
    const firebaseUser = await getAuth().getUserByEmail(email);
    return firebaseUser;
  } catch (error: any) {
    // If the user is not found, an error is thrown, and the user is created
    if (error.code === 'auth/user-not-found') {
      try {
        const createdUser = await getAuth().createUser({
          email,
          displayName,
        });
        return createdUser;
      } catch (e) {
        console.error(e);
        throw new Error('Error creating user in firebase');
      }
    }
    throw new Error('Error creating firebase user ', error);
  }
};
