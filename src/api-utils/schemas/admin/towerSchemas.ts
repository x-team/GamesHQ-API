import Joi from 'joi';

export const addTowerFloorRequestSchema = Joi.object({
  number: Joi.number().required(),
}).required();

export const addTowerFloorResponseSchema = Joi.object({
  id: Joi.number().required(),
  _towerGameId: Joi.number().required(),
  isEveryoneVisible: Joi.boolean().required(),
  number: Joi.number().required(),
}).required();

export const updateTowerRequestSchema = Joi.object({
  name: Joi.string().optional(),
  isOpen: Joi.boolean().optional(),
  coinPrize: Joi.number().optional(),
  lunaPrize: Joi.number().optional(),
}).required();

export const updateTowerResponseSchema = Joi.object({
  name: Joi.string().required(),
  isOpen: Joi.boolean().required(),
  coinPrize: Joi.number().required(),
  lunaPrize: Joi.number().required(),
}).required();
