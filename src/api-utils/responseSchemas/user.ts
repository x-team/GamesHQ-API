import Joi from 'joi';

const sessionStateSchema = Joi.boolean().required();

const sessionErrorMessageSchema = Joi.string().optional();

const sessionTokenSchema = Joi.object({
  token: Joi.string().required(),
  expireTime: Joi.number().required(),
});

const userSessionSchema = Joi.object({
  displayName: Joi.string().required(),
  email: Joi.string().required(),
  slackId: Joi.string().optional(),
  firebaseUserUid: Joi.string().optional(),
  profilePictureUrl: Joi.string().optional(),
  role: Joi.number().required(),
  isAdmin: Joi.boolean().required(),
}).required();

const sessionSchema = Joi.object({
  success: sessionStateSchema,
  session: sessionTokenSchema,
  user: userSessionSchema,
}).required();

const sessionGenericSchema = Joi.object({
  success: sessionStateSchema,
  message: sessionErrorMessageSchema,
}).required();

export const checkAvailableSessionSchema = Joi.alternatives([sessionSchema, sessionGenericSchema]);

export const logoutSessionSchema = sessionGenericSchema;
