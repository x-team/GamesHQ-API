import Joi from 'joi';

export const postAcheivementRequestSchema = Joi.object({
  id: Joi.number().optional(),
  description: Joi.string().required(),
  isEnabled: Joi.boolean().optional(),
  targetValue: Joi.number().required(),
}).required();

export const postAcheivementResponseSchema = Joi.object({
  id: Joi.number().required(),
  _gameTypeId: Joi.number().required(),
  description: Joi.string().required(),
  isEnabled: Joi.boolean().required(),
  targetValue: Joi.number().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
}).required();
