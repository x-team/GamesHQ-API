import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';
import type { ValidationResult } from 'joi';

import { postLeaderboardResultScoreSchema } from '../../api-utils/responseSchemas/gamedev';

export const parseWebhookPayload: Lifecycle.Method = (request) => {
  if (!Buffer.isBuffer(request.payload)) {
    throw Boom.internal('Payload is not a Buffer');
  }

  const body = request.payload.toString('utf-8');
  const payload = JSON.parse(body);

  //TBD: add validation for new requests
  const validationRslt = postLeaderboardResultScoreSchema.validate(payload);

  checkForWebhookErrors(validationRslt, payload);

  return payload;
};

const checkForWebhookErrors = (validationResult: ValidationResult, payload: any) => {
  if (validationResult.error) {
    throw Boom.boomify(validationResult.error, { statusCode: 400, data: { payload } });
  }
};
