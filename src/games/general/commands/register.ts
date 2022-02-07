import Boom from '@hapi/boom';

import { USER_ROLE_LEVEL } from '../../../consts/model';
import { findOrganizationByName } from '../../../models/Organization';
import { createUser, userExists } from '../../../models/User';
import { getGameResponse, getSlackUserInfo } from '../../utils';

export const register = async (slackUserId: string) => {
  const exists = await userExists(slackUserId);
  if (exists) {
    return getGameResponse(`Your user is already registered.`);
  }

  const xteamOrganization = await findOrganizationByName('x-team');
  const { user } = await getSlackUserInfo(slackUserId);

  if (!user || !user.profile || !xteamOrganization) {
    throw Boom.badRequest(`Failed to create new user on GamesHQ.`);
  }
  const { profile } = user;
  const { email, image_512 } = profile;

  await createUser({
    email: email,
    displayName: user.real_name,
    firebaseUserUid: null,
    profilePictureUrl: image_512,
    slackId: user.id,
    _roleId: USER_ROLE_LEVEL.USER,
    _organizationId: xteamOrganization?.id,
  });

  return getGameResponse(
    `Your e-mail _${email}_ is now registered to all our games :partyparrot: `
  );
};
