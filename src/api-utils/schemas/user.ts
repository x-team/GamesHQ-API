import Joi from 'joi';

const sessionStateSchema = Joi.boolean().required();

const sessionErrorMessageSchema = Joi.string().optional();

const sessionTokenSchema = Joi.object({
  token: Joi.string().uuid().required(),
  expireTime: Joi.number().required(),
}).options({ stripUnknown: true });

const userSessionSchema = Joi.object({
  displayName: Joi.string().allow(null).required(),
  email: Joi.string().email().required(),
  slackId: Joi.string().allow(null).optional(),
  firebaseUserUid: Joi.string().allow(null).optional(),
  profilePictureUrl: Joi.string().allow(null).optional(),
  role: Joi.number().required(),
  isAdmin: Joi.boolean().required(),
  capabilities: Joi.array().items(Joi.string().required()).required(),
}).options({ stripUnknown: true });

export const sessionSchema = Joi.object({
  success: sessionStateSchema,
  session: sessionTokenSchema,
  user: userSessionSchema,
}).options({ stripUnknown: true });

const sessionGenericSchema = Joi.object({
  success: sessionStateSchema,
  message: sessionErrorMessageSchema,
}).required();

export const checkAvailableSessionSchema = sessionSchema;

export const logoutSessionSchema = sessionGenericSchema;
