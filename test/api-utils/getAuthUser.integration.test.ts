import { expect } from 'chai';
import type { Request, ResponseToolkit } from '@hapi/hapi';
import { getAuthUser } from '../../src/api-utils/getAuthUser';
import { Session } from '../../src/models';
import { v4 as uuid } from 'uuid';
import { fail } from 'assert';

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

  it('should return error on missing xtu-session-token header', async () => {
    const requestHeaders = {
      headers: {},
    } as unknown as Request;

    try {
      await authContext.getAuthUser(requestHeaders, {} as ResponseToolkit);
      fail('rslt should return User');
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
      fail('rslt should return User');
    } catch (e: any) {
      expect(e.message).to.equal('Only Auth users can access here - user is not logged in');
    }
  });
});
