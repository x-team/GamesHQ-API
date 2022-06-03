import Joi from 'joi';

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
