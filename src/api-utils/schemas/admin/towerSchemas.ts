import Joi from 'joi';

export const addTowerRequestSchema = Joi.object({
  number: Joi.number().required(),
}).required();

export const addTowerResponseSchema = Joi.object({
  id: Joi.number().required(),
  _towerGameId: Joi.number().required(),
  isEveryoneVisible: Joi.boolean().required(),
  number: Joi.number().required(),
}).required();
