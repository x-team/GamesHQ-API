import Joi from 'joi';

import { ScoreStrategy, ResetStrategy } from '../../../models/LeaderboardEntry';

export const getLeaderboardRankResponseSchema = Joi.array()
  .items(
    Joi.object({
      displayName: Joi.string().allow(null).required(),
      email: Joi.string().required(),
      score: Joi.number().required(),
    })
  )
  .required();

export const postLeaderboardResultScoreResquestSchema = Joi.object({
  id: Joi.number().optional(),
  _leaderboardEntryId: Joi.number().required(),
  _userId: Joi.number().required(),
  score: Joi.number().required(),
  _leaderboardResultsMeta: Joi.array()
    .items(
      Joi.object({
        attribute: Joi.string().required(),
        value: Joi.string().required(),
      })
    )
    .optional(),
}).required();

export const postLeaderboardResultScoreResponseSchema = Joi.object({
  newEntry: Joi.boolean().required(),
}).required();

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
