import Joi from 'joi';

export interface SlackDialogsPayload {
  token: string;
  callback_id: string;
  type: string;
  response_url: string;
  action_ts: string;
  state: string;
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
  submission: {
    userId: string;
    bountyId: string;
    comment: string;
  };
  view: {
    callback_id: string;
    state: {
      [key: string]: {
        key: string;
        value: string | object;
      };
    };
  };
}

export const slackDialogsPayloadSchema = Joi.object({
  token: Joi.string().required().allow(''),
  callback_id: Joi.string().required().allow(''),
  response_url: Joi.string().required().allow(''),
  state: Joi.string().required().allow(''),
  action_ts: Joi.string().required().allow(''),
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
  submission: Joi.object({
    userId: Joi.string().required(),
    bountyId: Joi.string().required(),
    comment: Joi.string().required().allow(''),
  }),
});
