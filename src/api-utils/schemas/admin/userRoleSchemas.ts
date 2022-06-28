import Joi from 'joi';

export const getUserRolesSchema = Joi.object({
  id: Joi.number().required(),
  name: Joi.number().required(),
  _capabilities: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().required(),
        name: Joi.number().required(),
      })
    )
    .required(),
}).required();
