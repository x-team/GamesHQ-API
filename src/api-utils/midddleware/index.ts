import type Joi from 'joi';

import { appendUserToRequest } from './appendUserToRequest';
import { getAuthUser } from './getAuthUser';
import { parseWebhookPayload } from './parseWebhookPayload';
import { validateGameAuth } from './validateGameAuth';
import { webhookValidation } from './webhookValidations';

export const getAuthUserMiddleware = {
  method: getAuthUser,
  assign: 'getAuthUser',
};

export const validateGameAuthMiddleware = {
  method: validateGameAuth,
  assign: 'game',
};

export const webhookValidationMiddleware = {
  method: webhookValidation,
  assign: 'webhookValidation',
};

export const appendUserToRequestMiddleware = {
  method: appendUserToRequest,
  assign: 'appendUserToRequest',
};

export const parseWebhookPayloadMiddleware = (schema: Joi.ObjectSchema) => {
  return {
    method: parseWebhookPayload(schema),
    assign: 'webhookPayload',
  };
};
