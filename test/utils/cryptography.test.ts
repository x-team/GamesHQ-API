import { expect } from 'chai';
import { signMessage, validateWebhookSignatures } from '../../src/utils/cryptography';

describe('Cryptography Utils', () => {
  describe('signMessage', () => {
    it('should generate consistent signatures for same input', () => {
      const message = 'test message';
      const secret = 'secret123';
      
      const sig1 = signMessage(message, secret);
      const sig2 = signMessage(message, secret);
      
      expect(sig1).to.equal(sig2);
    });

    it('should generate different signatures for different messages', () => {
      const secret = 'secret123';
      
      const sig1 = signMessage('message1', secret);
      const sig2 = signMessage('message2', secret);
      
      expect(sig1).to.not.equal(sig2);
    });
  });

  describe('validateWebhookSignatures', () => {
    it('should validate correct signatures', () => {
      const message = 'test message';
      const secret = 'secret123';
      const timestamp = '1234567890';
      const version = 'v0';
      
      const signatureBase = `${version}:${timestamp}:${message}`;
      const signature = signMessage(signatureBase, secret);
      
      const isValid = validateWebhookSignatures(
        secret,
        `${version}=${signature}`,
        signatureBase,
        version
      );
      
      expect(isValid).to.be.true;
    });

    it('should reject invalid signatures', () => {
      const message = 'test message';
      const secret = 'secret123';
      const timestamp = '1234567890';
      const version = 'v0';
      
      const signatureBase = `${version}:${timestamp}:${message}`;
      const signature = signMessage(signatureBase, 'wrong_secret');
      
      const isValid = validateWebhookSignatures(
        secret,
        `${version}=${signature}`,
        signatureBase,
        version
      );
      
      expect(isValid).to.be.false;
    });
  });
});
