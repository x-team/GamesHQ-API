import Joi from 'joi';

export const commandArenaRequestSchema = Joi.object({
  command: Joi.string().required(),
}).required();

export const commandArenaResponseSchema = Joi.object({
  message: Joi.string().required(),
}).required();

export const actionArenaRequestSchema = Joi.object({
  action: Joi.string().required(),
  value: Joi.array().items(Joi.string()),
}).required();
