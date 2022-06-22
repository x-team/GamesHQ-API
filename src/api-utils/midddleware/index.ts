import type Joi from 'joi';

import { appendUserToRequest } from './appendUserToRequest';
import { getAuthUser } from './getAuthUser';
import { parseSlackActionPayload } from './parseSlackActionPayload';
import { parseSlackEventPayload } from './parseSlackEventPayload';
import { parseSlackSlashCommandPayload } from './parseSlackSlashCommandPayload';
import { parseWebhookPayload } from './parseWebhookPayload';
import { validateGameAuth } from './validateGameAuth';
import { verifySlackRequest } from './verifySlackRequest';
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

export const verifySlackRequestMiddleware = {
  method: verifySlackRequest,
  assign: 'verifySlackRequest',
};

export const parseSlackActionPayloadMiddleware = {
  method: parseSlackActionPayload,
  assign: 'slackActionPayload',
};
export const parseSlackEventPayloadMiddleware = {
  method: parseSlackEventPayload,
  assign: 'slackActionPayload',
};

export const parseSlackSlashCommandPayloadMiddleware = {
  method: parseSlackSlashCommandPayload,
  assign: 'slashCommandPayload',
};
