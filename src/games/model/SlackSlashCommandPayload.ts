import Joi from 'joi';

export interface SlackSlashCommandPayload {
  command: string;
  text: string;
  response_url: string;
  trigger_id: string;
  user_id: string;
  user_name: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
}

export const slackSlashCommandPayloadSchema = Joi.object({
  command: Joi.string().required().allow(''),
  text: Joi.string().required().allow(''),
  response_url: Joi.string().required().allow(''),
  trigger_id: Joi.string().required().allow(''),
  user_id: Joi.string().required().allow(''),
  user_name: Joi.string().required().allow(''),
  team_id: Joi.string().required().allow(''),
  team_domain: Joi.string().required().allow(''),
  channel_id: Joi.string().required().allow(''),
  channel_name: Joi.string().required().allow(''),
});
