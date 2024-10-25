import { expect } from 'chai';
import sinon from 'sinon';
import { webhookValidation } from '../../../src/api-utils/midddleware/webhookValidations';
import { GameType } from '../../../src/models';
import { generateSecret } from '../../../src/utils/cryptography';

describe('webhookValidation middleware', () => {
  let findGameTypeStub: sinon.SinonStub;

  beforeEach(() => {
    findGameTypeStub = sinon.stub(GameType, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should validate request with correct signature', async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const signingSecret = await generateSecret();
    const mockGameType = { signingSecret };
    findGameTypeStub.resolves(mockGameType);

    const request = {
      headers: {
        'xtu-request-timestamp': timestamp,
        'xtu-signature': 'valid-signature',
        'xtu-client-secret': 'client-secret'
      },
      payload: Buffer.from('{}')
    };

    const result = await webhookValidation(request as any, {} as any);
    expect(result.gameType).to.deep.equal(mockGameType);
  });

  it('should reject request with invalid timestamp', async () => {
    const oldTimestamp = Math.floor(Date.now() / 1000) - 300; // 5 minutes old
    
    const request = {
      headers: {
        'xtu-request-timestamp': oldTimestamp,
        'xtu-signature': 'valid-signature',
        'xtu-client-secret': 'client-secret'
      },
      payload: Buffer.from('{}')
    };

    try {
      await webhookValidation(request as any, {} as any);
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error.output.statusCode).to.equal(401);
      expect(error.message).to.equal('Invalid timestamp');
    }
  });

  it('should reject request with missing game type', async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    findGameTypeStub.resolves(null);

    const request = {
      headers: {
        'xtu-request-timestamp': timestamp,
        'xtu-signature': 'valid-signature',
        'xtu-client-secret': 'client-secret'
      },
      payload: Buffer.from('{}')
    };

    try {
      await webhookValidation(request as any, {} as any);
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error.output.statusCode).to.equal(404);
      expect(error.message).to.equal('Game not found!');
    }
  });

  it('should reject request with invalid payload format', async () => {
    const request = {
      headers: {},
      payload: 'invalid-payload' // Not a buffer
    };

    try {
      await webhookValidation(request as any, {} as any);
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error.output.statusCode).to.equal(400);
      expect(error.message).to.equal('Payload is not a Buffer');
    }
  });
});
