import Boom from '@hapi/boom';
import type { Request, ResponseToolkit } from '@hapi/hapi';
import { isEmpty, isNaN } from 'lodash';

import { TWO } from '../../games/consts/global';
import { findGameTypeByClientSecret } from '../../models/GameType';
import { validateWebhookSignatures } from '../../utils/cryptography';
import { isRequestFresh } from '../utils';

export async function webhookValidation(request: Request, _h: ResponseToolkit) {
  if (!isEmpty(request.payload) && !Buffer.isBuffer(request.payload)) {
    throw Boom.badRequest('Payload is not a Buffer');
  }
  const bodyString = request.payload ? request.payload.toString('utf-8') : '{}';
  const timestamp = Number(request.headers['xtu-request-timestamp']);
  if (isNaN(timestamp) || !isRequestFresh(timestamp, TWO)) {
    throw Boom.unauthorized('Invalid timestamp');
  }

  const version = 'v0';
  const xtuSignature = request.headers['xtu-signature'];
  const clientSignature = request.headers['xtu-client-secret'];

  const signatureBase = `${version}:${timestamp}:${bodyString}`;
  const gameType = await findGameTypeByClientSecret(clientSignature);

  if (!gameType) {
    throw Boom.notFound('Game not found!');
  }

  const appSecretKey = gameType.signingSecret;

  if (!appSecretKey) {
    throw Boom.notAcceptable('APP SIGNING SECRET not acceptable');
  }

  const isValid = validateWebhookSignatures(appSecretKey, xtuSignature, signatureBase, version);

  if (!isValid) {
    throw Boom.unauthorized('Invalid signature');
  }
  return { gameType };
}
