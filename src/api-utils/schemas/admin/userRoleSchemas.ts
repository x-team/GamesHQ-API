import Joi from 'joi';

export const getAllUserRolesSchema = Joi.array()
  .items(
    Joi.object({
      id: Joi.number().required(),
      name: Joi.string().required(),
      _capabilities: Joi.array()
        .items(
          Joi.object({
            id: Joi.number().required(),
            name: Joi.string().required(),
          })
        )
        .required(),
    }).required()
  )
  .required();
