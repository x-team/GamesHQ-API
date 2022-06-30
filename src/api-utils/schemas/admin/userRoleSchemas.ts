import Joi from 'joi';

export const getUserRoleResponseSchema = Joi.object({
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
}).required();

export const getAllUserRolesResponseSchema = Joi.array()
  .items(getUserRoleResponseSchema)
  .required();

export const upsertUserRoleRequestSchema = Joi.object({
  id: Joi.number().optional(),
  name: Joi.string().required(),
  _capabilities: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().required(),
        name: Joi.string().required(),
      })
    )
    .required(),
}).required();

export const upsertUserRoleResponseSchema = getUserRoleResponseSchema;
