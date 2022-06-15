import { expect } from 'chai';
import { v4 as uuid } from 'uuid';
import sinon from 'sinon';
import * as utils from '../../../../src/games/utils';
import type { SlackUser } from '../../../../src/games/model/SlackUser';
import { register } from '../../../../src/games/general/commands/register';
import * as firebaseplugin from '../../../../src/plugins/firebasePlugin';
import { User } from '../../../../src/models';
import { createTestUser } from '../../../test-utils';
import { USER_ROLE_LEVEL } from '../../../../src/consts/model';
import { fail } from 'assert';

describe('register', () => {
  it('should register new user with slackId and firebaseUid', async () => {
    const random = uuid();
    const slackId = 'randomSlackId' + random;

    const stubbedGetSlackUser = sinon.stub(utils, 'getSlackUserInfo').resolves({
      id: slackId,
      real_name: random,
      profile: {
        email: random + '@email.com',
        image_512: 'imageUrl_' + random,
      },
    } as unknown as SlackUser);

    const stubberCreateUserInFirebase = sinon
      .stub(firebaseplugin, 'createUserInFirebase')
      .resolves({
        uid: 'firebaseUid_' + random,
      } as any);

    const rslt = await register(slackId);

    const userInDB = await User.findOne({
      where: {
        slackId,
      },
    });

    expect(rslt).to.deep.equal({
      type: 'response',
      text: `Your e-mail _${random}@email.com_ is now registered to all our games :partyparrot: `,
    });
    expect(stubbedGetSlackUser).callCount(1);
    expect(stubberCreateUserInFirebase).callCount(1);
    expect(userInDB?.displayName).to.equal(random);
    expect(userInDB?.slackId).to.equal(slackId);
    expect(userInDB?.firebaseUserUid).to.equal('firebaseUid_' + random);
    expect(userInDB?.email).to.equal(random + '@email.com');
    expect(userInDB?.profilePictureUrl).to.equal('imageUrl_' + random);
    expect(userInDB?._roleId).to.equal(USER_ROLE_LEVEL.USER);
  });

  it('should update ADMIN user without slackId and firebaseUid', async () => {
    const random = uuid();
    const slackId = 'randomSlackId' + random;

    const user = await createTestUser({
      slackId: undefined,
      firebaseUserUid: undefined,
      _roleId: USER_ROLE_LEVEL.ADMIN,
    });

    const stubbedGetSlackUser = sinon.stub(utils, 'getSlackUserInfo').resolves({
      id: slackId,
      real_name: random,
      profile: {
        email: random + '@email.com',
        image_512: 'imageUrl_' + random,
      },
    } as unknown as SlackUser);

    const stubberCreateUserInFirebase = sinon
      .stub(firebaseplugin, 'createUserInFirebase')
      .resolves({
        uid: 'firebaseUid_' + random,
      } as any);

    const rslt = await register(slackId);

    const userInDB = await User.findOne({
      where: {
        slackId,
      },
    });

    expect(rslt).to.deep.equal({
      type: 'response',
      text: `Your e-mail _${random}@email.com_ is now registered to all our games :partyparrot: `,
    });
    expect(stubbedGetSlackUser).callCount(1);
    expect(stubberCreateUserInFirebase).callCount(1);
    expect(userInDB?.displayName).to.equal(random);
    expect(userInDB?.slackId).to.equal(slackId);
    expect(userInDB?.firebaseUserUid).to.equal('firebaseUid_' + random);
    expect(userInDB?.email).to.equal(random + '@email.com');
    expect(userInDB?.profilePictureUrl).to.equal('imageUrl_' + random);
    expect(userInDB?._roleId).to.equal(USER_ROLE_LEVEL.USER);
  });

  it('should return if user is already registered with SlackId', async () => {
    const user = await createTestUser();
    const rslt = await register(user.slackId!);
    expect(rslt).to.deep.equal({
      type: 'response',
      text: 'Your user is already registered.',
    });
  });

  it('should throw error if request to SlackId does not return id', async () => {
    sinon.stub(utils, 'getSlackUserInfo').resolves({
      // id: 123,
      real_name: 'test',
      profile: 'test',
    } as unknown as SlackUser);

    const randomSlackId = 'randomSlackId' + uuid();

    try {
      await register(randomSlackId);
      fail('call should not return');
    } catch (e: any) {
      expect(e.message).to.equal('Failed to create new user on GamesHQ.');
    }
  });

  it('should throw error if request to SlackId does not return real_name', async () => {
    sinon.stub(utils, 'getSlackUserInfo').resolves({
      id: 123,
      // real_name: 'test',
      profile: 'test',
    } as unknown as SlackUser);

    const randomSlackId = 'randomSlackId' + uuid();

    try {
      await register(randomSlackId);
      fail('call should not return');
    } catch (e: any) {
      expect(e.message).to.equal('Failed to create new user on GamesHQ.');
    }
  });

  it('should throw error if request to SlackId does not return profile', async () => {
    sinon.stub(utils, 'getSlackUserInfo').resolves({
      id: 123,
      real_name: 'test',
      // profile : 'test'
    } as unknown as SlackUser);

    const randomSlackId = 'randomSlackId' + uuid();

    try {
      await register(randomSlackId);
      fail('call should not return');
    } catch (e: any) {
      expect(e.message).to.equal('Failed to create new user on GamesHQ.');
    }
  });
});
