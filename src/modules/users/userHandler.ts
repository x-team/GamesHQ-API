import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';

import type { GoogleAuthCredentials } from '../../api-utils/interfaceAndTypes';
import { logger } from '../../config';
import { USER_ROLE_LEVEL } from '../../consts/model';
import { findOrganizationByName } from '../../models/Organization';
import {
  createSession,
  findSessionById,
  findSessionByToken,
  findSessionByUserEmail,
  updateSession,
} from '../../models/Session';
import {
  createUser,
  findUserWithRoleAndCapabilities,
  getUserByEmailWithRoleAndCapabilities,
} from '../../models/User';
import { createUserInFirebase } from '../../plugins/firebasePlugin';

export const loginWithGoogle: Lifecycle.Method = async (req, h) => {
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

  let mutableUserFound = await getUserByEmailWithRoleAndCapabilities(googleProfile.email);

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
    const firebaseUser = await createUserInFirebase(googleProfile.email, googleProfile.displayName);
    mutableUserFound.firebaseUserUid = firebaseUser.uid;
    await mutableUserFound.save();
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
};

export const checkAvailableSession: Lifecycle.Method = async (req, h) => {
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
      const user = await findUserWithRoleAndCapabilities(updatedSession._userId);
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
          capabilities: user._role?._capabilities,
          isAdmin:
            user._roleId === USER_ROLE_LEVEL.ADMIN || user._roleId === USER_ROLE_LEVEL.SUPER_ADMIN,
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
};

export const logutFromAPI: Lifecycle.Method = async (req, h) => {
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
};
