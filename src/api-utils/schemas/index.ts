import Boom from '@hapi/boom';
import Joi from 'joi';

import { isProd, logger } from '../../config';

export const validateSchema = (schema: Joi.ObjectSchema, payload: any) => {
  const validationRslt = schema.validate(payload);
  checkForWebhookErrors(validationRslt, payload);
};

const checkForWebhookErrors = (validationResult: Joi.ValidationResult, payload: any) => {
  if (validationResult.error) {
    if (!isProd()) {
      logger.error(validationResult.error);
    }
    throw Boom.boomify(validationResult.error, { statusCode: 400, data: { payload } });
  }
};

export const genericSchema = Joi.object({ success: Joi.boolean().required() }).required();
