import Joi from 'joi';

export const getAchievementByIdResponseSchema = Joi.object({
  id: Joi.number().required(),
  _gameTypeId: Joi.number().required(),
  description: Joi.string().required(),
  isEnabled: Joi.boolean().required(),
  targetValue: Joi.number().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
}).optional();

export const getAchievementsResponseSchema = Joi.array()
  .items(getAchievementByIdResponseSchema)
  .optional();

export const postAchievementRequestSchema = Joi.object({
  id: Joi.number().optional(),
  description: Joi.string().required(),
  isEnabled: Joi.boolean().optional(),
  targetValue: Joi.number().required(),
}).required();

export const postAchievementResponseSchema = Joi.object({
  id: Joi.number().required(),
  _gameTypeId: Joi.number().required(),
  description: Joi.string().required(),
  isEnabled: Joi.boolean().required(),
  targetValue: Joi.number().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
}).required();

export const postAchievementProgressRequestSchema = Joi.object({
  progress: Joi.number().required(),
}).required();

export const postAchievementProgressResponseSchema = Joi.object({
  _achievementId: Joi.number().required(),
  _userId: Joi.number().required(),
  isUnlocked: Joi.boolean().required(),
  progress: Joi.number().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
}).required();
