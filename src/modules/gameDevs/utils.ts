import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';
import type Joi from 'joi';

import { validateSchema } from '../../api-utils/schemas';

export const parseWebhookPayload = (schema: Joi.ObjectSchema): Lifecycle.Method => {
  return (request) => {
    if (!Buffer.isBuffer(request.payload)) {
      throw Boom.badRequest('Payload is not a Buffer');
    }

    const body = request.payload.toString('utf-8');
    const payload = JSON.parse(body);
    validateSchema(schema, payload);

    return payload;
  };
};
