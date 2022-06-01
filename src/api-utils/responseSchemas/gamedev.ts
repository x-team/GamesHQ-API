import Joi from 'joi';

const gameItemSchema = Joi.object({
  // Pending due to new table design
  id: Joi.string(),
  clientSecret: Joi.string(),
  signingSecret: Joi.string(),
  _createdById: Joi.number(),
}).optional(); //.options({ stripUnknown: true });

export const sigleGameItemSchema = Joi.object({ game: gameItemSchema }).required(); //.options({ stripUnknown: true });

export const multipleGamesSchema = Joi.object({
  games: Joi.array().items(gameItemSchema),
}).required();

export const gamedevGenericSchema = Joi.object({ success: Joi.boolean().required() }).required();
