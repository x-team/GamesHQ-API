import Joi from 'joi';

import { leaderboardSchema } from './leaderboardSchemas';

const gameItemSchema = Joi.object({
  id: Joi.number(),
  name: Joi.string(),
  clientSecret: Joi.string(),
  signingSecret: Joi.string(),
  _createdById: Joi.number(),
  _leaderboards: Joi.array().items(leaderboardSchema),
}).optional(); //.options({ stripUnknown: true });

export const sigleGameItemSchema = Joi.object({ game: gameItemSchema }).required(); //.options({ stripUnknown: true });

export const upsertGameTypeSchema = Joi.object({
  id: Joi.number().optional(),
  name: Joi.string().required(),
  clientSecret: Joi.string().optional(),
  signingSecret: Joi.string().optional(),
}).required();

export const multipleGamesSchema = Joi.object({
  games: Joi.array().items(gameItemSchema),
}).required();

export const gamedevGenericSchema = Joi.object({ success: Joi.boolean().required() }).required();
