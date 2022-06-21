import { expect } from 'chai';
import sinon from 'sinon';
import type { Request } from '@hapi/hapi';
import { webhookValidation } from '../../src/api-utils/webhookValidations';
import * as GameType from '../../src/models/GameType';
import { fail } from 'assert';
import { signMessage } from '../../src/utils/cryptography';

describe('webhookValidations', async () => {
  it('should return gameType on successful validation with payload', async () => {
    const payload = Buffer.from(
      JSON.stringify({
        test: 'this is my payload',
      })
    );

    const gameSigningSecret = '123455';
    const gameClientSignature = 'myClientSignature';
    const timestamp = new Date().getTime();
    const signatureMessage = `v0:${timestamp}:${payload}`;

    const stubbedFindFameByClientSecret = sinon
      .stub(GameType, 'findGameTypeByClientSecret')
      .resolves({
        name: 'fakeGame',
        signingSecret: gameSigningSecret,
      } as any);

    const request = {
      headers: {
        'xtu-request-timestamp': timestamp,
        'xtu-signature': `v0=${signMessage(signatureMessage, gameSigningSecret)}`,
        'xtu-client-secret': gameClientSignature,
      },
      payload,
    } as unknown as Request;

    const rslt = await webhookValidation(request, {} as any);

    expect(stubbedFindFameByClientSecret).to.be.calledOnce;
    expect(rslt.gameType).to.deep.equal({
      name: 'fakeGame',
      signingSecret: gameSigningSecret,
    });
  });

  it('should return gameType on successful validation without payload', async () => {
    const gameSigningSecret = '123455';
    const gameClientSignature = 'myClientSignature';
    const timestamp = new Date().getTime();
    const signatureMessage = `v0:${timestamp}:${JSON.stringify({})}`;

    const stubbedFindFameByClientSecret = sinon
      .stub(GameType, 'findGameTypeByClientSecret')
      .resolves({
        name: 'fakeGame',
        signingSecret: gameSigningSecret,
      } as any);

    const request = {
      headers: {
        'xtu-request-timestamp': timestamp,
        'xtu-signature': `v0=${signMessage(signatureMessage, gameSigningSecret)}`,
        'xtu-client-secret': gameClientSignature,
      },
    } as unknown as Request;

    const rslt = await webhookValidation(request, {} as any);

    expect(stubbedFindFameByClientSecret).to.be.calledOnce;
    expect(rslt.gameType).to.deep.equal({
      name: 'fakeGame',
      signingSecret: gameSigningSecret,
    });
  });

  it('should throw error if payload is not Buffer', async () => {
    const gameSigningSecret = '123455';
    const gameClientSignature = 'myClientSignature';
    const timestamp = new Date().getTime();
    const signatureMessage = `v0:${timestamp}:${JSON.stringify({})}`;

    sinon.stub(GameType, 'findGameTypeByClientSecret').resolves({
      name: 'fakeGame',
      signingSecret: gameSigningSecret,
    } as any);

    const payload = {
      test: 'this is my payload not as Buffer',
    };

    const request = {
      headers: {
        'xtu-request-timestamp': timestamp,
        'xtu-signature': `v0=${signMessage(signatureMessage, gameSigningSecret)}`,
        'xtu-client-secret': gameClientSignature,
      },
      payload,
    } as unknown as Request;

    try {
      await webhookValidation(request, {} as any);
      fail('call should throw error on test');
    } catch (e: any) {
      expect(e.message).to.equal('Payload is not a Buffer');
    }
  });

  it('should throw error if invalid timestamp in xtu-request-timestamp header', async () => {
    const request = {
      headers: {
        'xtu-request-timestamp': 'invalid',
      },
    } as unknown as Request;

    try {
      await webhookValidation(request, {} as any);
      fail('call should throw error on test');
    } catch (e: any) {
      expect(e.message).to.equal('Invalid timestamp');
    }
  });

  it('should throw error if timestamp in xtu-request-timestamp is not a fresh request', async () => {
    const request = {
      headers: {
        'xtu-request-timestamp': new Date().getTime() / 1000 - 1000000,
      },
    } as unknown as Request;

    try {
      await webhookValidation(request, {} as any);
      fail('call should throw error on test');
    } catch (e: any) {
      expect(e.message).to.equal('Invalid timestamp');
    }
  });

  it('should throw error if gametype does not exists', async () => {
    const request = {
      headers: {
        'xtu-request-timestamp': new Date().getTime(),
      },
    } as unknown as Request;

    sinon.stub(GameType, 'findGameTypeByClientSecret').resolves(null);

    try {
      await webhookValidation(request, {} as any);
      fail('call should throw error on test');
    } catch (e: any) {
      expect(e.message).to.equal('Game not found!');
    }
  });

  it('should throw error if gametype signingSecret is undefined', async () => {
    const request = {
      headers: {
        'xtu-request-timestamp': new Date().getTime(),
      },
    } as unknown as Request;

    sinon.stub(GameType, 'findGameTypeByClientSecret').resolves({
      signingSecret: '',
    } as any);

    try {
      await webhookValidation(request, {} as any);
      fail('call should throw error on test');
    } catch (e: any) {
      expect(e.message).to.equal('APP SIGNING SECRET not acceptable');
    }
  });

  it('should throw error if webhook signature is invalid', async () => {
    const gameSigningSecret = '123455';
    const gameClientSignature = 'myClientSignature';
    const signatureMessage = 'invalid';

    const stubbedFindFameByClientSecret = sinon
      .stub(GameType, 'findGameTypeByClientSecret')
      .resolves({
        signingSecret: gameSigningSecret,
      } as any);

    const request = {
      headers: {
        'xtu-request-timestamp': new Date().getTime(),
        'xtu-signature': `v0=${signMessage(signatureMessage, gameSigningSecret)}`,
        'xtu-client-secret': gameClientSignature,
      },
    } as unknown as Request;

    try {
      await webhookValidation(request, {} as any);
      fail('call should throw error on test');
    } catch (e: any) {
      expect(stubbedFindFameByClientSecret).to.be.calledWith(gameClientSignature);
      expect(e.message).to.equal('Invalid signature');
    }
  });
});
