import { expect } from 'chai';
import type { Request, ResponseToolkit } from '@hapi/hapi';
import { getAuthUser } from '../../src/api-utils/midddleware/getAuthUser';
import { Session } from '../../src/models';
import { v4 as uuid } from 'uuid';
import { fail } from 'assert';
import { CAPABILITIES } from '../../src/consts/model';
import { createTestUser } from '../test-utils';

describe('getAuthUser', async () => {
  const authContext = {
    getAuthUser,
    requiredCapabilities: [],
  };

  it('should return authed user', async () => {
    const session = await Session.create({
      token: uuid(),
      _userId: 1,
    });

    const requestHeaders = {
      headers: {
        'xtu-session-token': session.token,
      },
    } as unknown as Request;

    let rslt = await authContext.getAuthUser(requestHeaders, {} as ResponseToolkit);

    expect(rslt.id).to.equal(session._userId);
  });

  it('should return authed user with valid capability', async () => {
    const session = await Session.create({
      token: uuid(),
      _userId: 1,
    });

    const authCapabilityContext = {
      getAuthUser,
      requiredCapabilities: [CAPABILITIES.GENERAL_READ],
    };

    const requestHeaders = {
      headers: {
        'xtu-session-token': session.token,
      },
    } as unknown as Request;

    let rslt = await authCapabilityContext.getAuthUser(requestHeaders, {} as ResponseToolkit);

    expect(rslt.id).to.equal(session._userId);
  });

  it('should return error on missing xtu-session-token header', async () => {
    const requestHeaders = {
      headers: {},
    } as unknown as Request;

    try {
      await authContext.getAuthUser(requestHeaders, {} as ResponseToolkit);
      fail('rslt should not return User');
    } catch (e: any) {
      expect(e.message).to.equal('Only Auth users can access here - send session token');
    }
  });

  it('should return error on invalid header', async () => {
    const requestHeaders = {
      headers: {
        'xtu-session-token': 'invalid',
      },
    } as unknown as Request;

    try {
      await authContext.getAuthUser(requestHeaders, {} as ResponseToolkit);
      fail('rslt should not return User');
    } catch (e: any) {
      expect(e.message).to.equal('Only Auth users can access here - user is not logged in');
    }
  });

  it('should return error on unauthorized capability', async () => {
    const session = await Session.create({
      token: uuid(),
      _userId: 1,
    });

    const authCapabilityContext = {
      getAuthUser,
      requiredCapabilities: ['RANDOM_CAPABILITY'],
    };

    const requestHeaders = {
      headers: {
        'xtu-session-token': session.token,
      },
    } as unknown as Request;

    try {
      await authCapabilityContext.getAuthUser(requestHeaders, {} as ResponseToolkit);
      fail('rslt should return User');
    } catch (e: any) {
      expect(e.message).to.equal('Only authorized users can access here');
    }
  });

  it('should return error on unauthorized capability for USER_ROLE_LEVEL.USER', async () => {
    const user = await createTestUser();

    const session = await Session.create({
      token: uuid(),
      _userId: user.id,
    });

    const authCapabilityContext = {
      getAuthUser,
      requiredCapabilities: [CAPABILITIES.MY_GAME_LEADERBOARD_WRITE],
    };

    const requestHeaders = {
      headers: {
        'xtu-session-token': session.token,
      },
    } as unknown as Request;

    try {
      await authCapabilityContext.getAuthUser(requestHeaders, {} as ResponseToolkit);
      fail('rslt should return User');
    } catch (e: any) {
      expect(e.message).to.equal('Only authorized users can access here');
    }
  });
});
