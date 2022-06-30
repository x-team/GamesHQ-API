import Joi from 'joi';

export const getAllCapabilitiesResponseSchema = Joi.array()
  .items(
    Joi.object({
      id: Joi.number().required(),
      name: Joi.string().required(),
    })
  )
  .required();
