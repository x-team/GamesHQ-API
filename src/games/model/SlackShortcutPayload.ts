import Joi from 'joi';

export interface SlackShortcutPayload {
  token: string;
  type: string;
  trigger_id: string;
  team: {
    id: string;
    domain: string;
  };
  user: {
    id: string;
    name?: string;
    username: string;
    team_id: string;
  };
  callback_id: string;
  action_ts?: string;
}

export const slackSShortcutPayloadSchema = Joi.object({
  token: Joi.string().required().allow(''),
  trigger_id: Joi.string().required().allow(''),
  type: Joi.string().required().allow(''),
  user: Joi.object({
    id: Joi.string().required().allow(''),
    name: Joi.string().optional().allow(''),
    username: Joi.string().required().allow(''),
    team_id: Joi.string().required().allow(''),
  }),
  team: Joi.object({
    id: Joi.string().required().allow(''),
    domain: Joi.string().required().allow(''),
  }),
  action_ts: Joi.string().required().allow(''),
  callback_id: Joi.string().required().allow(''),
});
