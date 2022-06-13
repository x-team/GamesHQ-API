import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';
import type { ValidationResult } from 'joi';

import { postLeaderboardResultScoreResquestSchema } from '../../api-utils/schemas/gameDev/leaderboardSchemas';
import { isProd, logger } from '../../config';

export const parseWebhookPayload: Lifecycle.Method = (request) => {
  if (!Buffer.isBuffer(request.payload)) {
    throw Boom.internal('Payload is not a Buffer');
  }

  const body = request.payload.toString('utf-8');
  const payload = JSON.parse(body);

  //TBD: add validation for new requests
  const validationRslt = postLeaderboardResultScoreResquestSchema.validate(payload);

  checkForWebhookErrors(validationRslt, payload);

  return payload;
};

const checkForWebhookErrors = (validationResult: ValidationResult, payload: any) => {
  if (validationResult.error) {
    if (!isProd()) {
      logger.error(validationResult.error);
    }
    throw Boom.boomify(validationResult.error, { statusCode: 400, data: { payload } });
  }
};
