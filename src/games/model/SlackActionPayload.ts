import Joi from 'joi';

import type { SlackSubmitAppreciationStatePayload } from './SlackSubmitAppreciationStatePayload';

export interface SlackActionsPayload {
  token: string;
  callback_id: string;
  type: string;
  response_url: string;
  trigger_id: string;
  team: {
    id: string;
    domain: string;
  };
  channel: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
  };
  message: {
    type: string;
    user: string;
    ts: string;
    text: string;
  };
  view: {
    callback_id: string;
    state: {
      values: SlackSubmitAppreciationStatePayload;
    };
  };
}

export const slackActionsPayloadSchema = Joi.object({
  token: Joi.string().required().allow(''),
  callback_id: Joi.string().optional().allow(''),
  response_url: Joi.string().optional().allow(''),
  trigger_id: Joi.string().required().allow(''),
  type: Joi.string().required().allow(''),
  user: Joi.object({
    id: Joi.string().required().allow(''),
    name: Joi.string().required().allow(''),
  }),
  channel: Joi.object({
    id: Joi.string().required().allow(''),
    name: Joi.string().required().allow(''),
  }),
  team: Joi.object({
    id: Joi.string().required().allow(''),
    domain: Joi.string().required().allow(''),
  }),
  message: Joi.object({
    type: Joi.string().required().allow(''),
    user: Joi.string().required().allow(''),
    ts: Joi.string().required().allow(''),
    text: Joi.string().required().allow(''),
  }),
  view: Joi.object({
    callback_id: Joi.string(),
    state: Joi.object({ values: Joi.object() }).unknown(),
  }).optional(),
});
