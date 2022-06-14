import Boom from '@hapi/boom';

import { USER_ROLE_LEVEL } from '../../../consts/model';
import { findOrganizationByName } from '../../../models/Organization';
import { upsertUser, userExists, getUserByEmail } from '../../../models/User';
import { createUserInFirebase } from '../../../plugins/firebasePlugin';
import { getGameResponse, getSlackUserInfo } from '../../utils';

export const register = async (slackUserId: string) => {
  const exists = await userExists(slackUserId);

  if (exists) {
    return getGameResponse(`Your user is already registered.`);
  }

  const xteamOrganization = await findOrganizationByName('x-team');
  const { user: slackUser } = await getSlackUserInfo(slackUserId);

  if (!slackUser || !slackUser.profile || !xteamOrganization) {
    throw Boom.badRequest(`Failed to create new user on GamesHQ.`);
  }
  const {
    id: slackId,
    profile: { email, image_512 },
    real_name: displayName,
  } = slackUser;

  const userInDb = await getUserByEmail(email);
  let firebaseUserUid = userInDb?.firebaseUserUid;

  if (!firebaseUserUid) {
    const firebaseUser = await createUserInFirebase(email, displayName);
    firebaseUserUid = firebaseUser.uid;
  }

  await upsertUser({
    id: userInDb?.id,
    _roleId: userInDb?._roleId || USER_ROLE_LEVEL.USER,
    email,
    displayName,
    profilePictureUrl: image_512,
    _organizationId: xteamOrganization?.id,
    slackId,
    firebaseUserUid,
  });

  return getGameResponse(
    `Your e-mail _${email}_ is now registered to all our games :partyparrot: `
  );
};
