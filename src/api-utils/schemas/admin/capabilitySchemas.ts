import Joi from 'joi';

export const createCapabilitiesRequestSchema = Joi.object({
  name: Joi.string().required(),
}).required();

export const createCapabilitiesResponseSchema = Joi.object({
  id: Joi.number().required(),
  name: Joi.string().required(),
}).required();

export const getAllCapabilitiesResponseSchema = Joi.array()
  .items(
    Joi.object({
      id: Joi.number().required(),
      name: Joi.string().required(),
    })
  )
  .required();
