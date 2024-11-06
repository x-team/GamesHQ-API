import { expect } from 'chai';
import sinon from 'sinon';
import { getAuthUser } from '../../../src/api-utils/midddleware/getAuthUser';
import { Session, User } from '../../../src/models';
import { CAPABILITIES } from '../../../src/consts/model';

describe('getAuthUser middleware', () => {
  let findSessionStub: sinon.SinonStub;
  let findUserStub: sinon.SinonStub;

  beforeEach(() => {
    findSessionStub = sinon.stub(Session, 'findOne');
    findUserStub = sinon.stub(User, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should authorize user with correct capabilities', async () => {
    const mockSession = { _userId: 1 };
    const mockUser = {
      id: 1,
      _role: {
        _capabilities: [{ name: CAPABILITIES.GENERAL_READ }]
      }
    };

    findSessionStub.resolves(mockSession);
    findUserStub.resolves(mockUser);

    const request = {
      headers: {
        'xtu-session-token': 'valid-token'
      }
    };

    const h = {}; // Mock response toolkit
    const context = {
      requiredCapabilities: [CAPABILITIES.GENERAL_READ]
    };

    const result = await getAuthUser.call(context, request as any, h as any);
    expect(result).to.deep.equal(mockUser);
  });

  it('should throw error when session token is missing', async () => {
    const request = {
      headers: {}
    };
    const h = {}; // Mock response toolkit

    try {
      await getAuthUser.call({ requiredCapabilities: [] }, request as any, h as any);
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error.output.statusCode).to.equal(403);
    }
  });
});
