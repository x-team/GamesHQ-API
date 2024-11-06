import { expect } from 'chai';
import { parseWebhookPayload } from '../../../src/api-utils/midddleware/parseWebhookPayload';
import Joi from 'joi';

describe('parseWebhookPayload', () => {
  const testSchema = Joi.object({
    test: Joi.string().required()
  });

  it('should parse valid payload', () => {
    const mockRequest = {
      payload: Buffer.from(JSON.stringify({ test: 'value' }))
    };

    const result = parseWebhookPayload(testSchema)(mockRequest as any);
    expect(result).to.deep.equal({ test: 'value' });
  });

  it('should reject non-buffer payload', () => {
    const mockRequest = {
      payload: 'not a buffer'
    };

    try {
      parseWebhookPayload(testSchema)(mockRequest as any);
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error.output.statusCode).to.equal(400);
      expect(error.message).to.equal('Payload is not a Buffer');
    }
  });

  it('should reject invalid payload schema', () => {
    const mockRequest = {
      payload: Buffer.from(JSON.stringify({ wrong: 'value' }))
    };

    try {
      parseWebhookPayload(testSchema)(mockRequest as any);
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error.message).to.include('"test" is required');
    }
  });
});
