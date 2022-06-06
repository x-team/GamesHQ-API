import Joi from 'joi';

import { ScoreStrategy, ResetStrategy } from '../../models/LeaderboardEntry';

export const postLeaderboardSchema = Joi.object({
  id: Joi.number().optional(),
  name: Joi.string().required(),
  scoreStrategy: Joi.string()
    .valid(...Object.values(ScoreStrategy))
    .optional(),
  resetStrategy: Joi.string()
    .valid(...Object.values(ResetStrategy))
    .optional(),
}).required();

export const leaderboardSchema = Joi.object({
  id: Joi.number(),
  name: Joi.string(),
  scoreStrategy: Joi.string(),
  resetStrategy: Joi.string(),
  _gameTypeId: Joi.number(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
}).optional();

export const multipleLeaderboardSchema = Joi.array().items(leaderboardSchema).optional();

const gameItemSchema = Joi.object({
  id: Joi.number(),
  name: Joi.string(),
  clientSecret: Joi.string(),
  signingSecret: Joi.string(),
  _createdById: Joi.number(),
  _leaderboards: Joi.array().items(leaderboardSchema),
}).optional(); //.options({ stripUnknown: true });

export const sigleGameItemSchema = Joi.object({ game: gameItemSchema }).required(); //.options({ stripUnknown: true });

export const multipleGamesSchema = Joi.object({
  games: Joi.array().items(gameItemSchema),
}).required();

export const gamedevGenericSchema = Joi.object({ success: Joi.boolean().required() }).required();
