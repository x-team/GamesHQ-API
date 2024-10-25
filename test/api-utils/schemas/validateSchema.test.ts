import { expect } from 'chai';
import Joi from 'joi';
import { validateSchema } from '../../../src/api-utils/schemas';

describe('Schema Validation', () => {
  const testSchema = Joi.object({
    required: Joi.string().required(),
    optional: Joi.number().optional(),
    nested: Joi.object({
      field: Joi.boolean()
    }).optional()
  });

  it('should validate correct payload', () => {
    const payload = {
      required: 'test',
      optional: 123,
      nested: { field: true }
    };

    const result = validateSchema(testSchema, payload);
    expect(result).to.deep.equal(payload);
  });

  it('should validate payload with only required fields', () => {
    const payload = {
      required: 'test'
    };

    const result = validateSchema(testSchema, payload);
    expect(result).to.deep.equal(payload);
  });

  it('should throw error for missing required field', () => {
    const payload = {
      optional: 123
    };

    try {
      validateSchema(testSchema, payload);
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error.message).to.include('"required" is required');
    }
  });

  it('should throw error for invalid field type', () => {
    const payload = {
      required: 123, // should be string
      optional: 'invalid' // should be number
    };

    try {
      validateSchema(testSchema, payload);
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error.message).to.include('"required" must be a string');
    }
  });
});
