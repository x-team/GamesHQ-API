import Joi from 'joi';

export interface SlackChallengesPayload {
  token: string;
  challenge: string;
  type: string;
}

export const slackChallengesPayloadSchema = Joi.object({
  token: Joi.string().required().allow(''),
  challenge: Joi.string().required().allow(''),
  type: Joi.string().required().allow(''),
});
