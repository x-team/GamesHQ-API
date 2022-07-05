import Boom from '@hapi/boom';
import type { Request, ResponseToolkit } from '@hapi/hapi';
import { endsWith } from 'lodash';

import { getConfig } from '../../config';
import type { SlackConfigKey } from '../../utils/cryptography';
import { validateWebhookSignatures } from '../../utils/cryptography';
import { isRequestFresh } from '../utils';

/**
 * @see https://api.slack.com/docs/verifying-requests-from-slack#step-by-step_walk-through_for_validating_a_request
 */
export function verifySlackRequest(request: Request, h: ResponseToolkit) {
  if (!Buffer.isBuffer(request.payload)) {
    throw Boom.internal('Payload is not a Buffer');
  }
  const timestamp = Number(request.headers['x-slack-request-timestamp']);
  if (!isRequestFresh(timestamp)) {
    throw Boom.unauthorized('Invalid timestamp');
  }
  const body = request.payload.toString('utf-8');
  const version = 'v0';
  const slackSignature = request.headers['x-slack-signature'];

  const signatureBase = `${version}:${timestamp}:${body}`;

  const appSecretKey = getAppSigningSecretKeyForPath(request);

  if (!appSecretKey) {
    throw Boom.notAcceptable('APP SIGNING SECRET not acceptable');
  }

  const appSecretKeyHash = getConfig(appSecretKey);
  const isValid = validateWebhookSignatures(
    appSecretKeyHash,
    slackSignature,
    signatureBase,
    version
  );

  if (!isValid) {
    throw Boom.unauthorized('Invalid signature');
  }
  return h.continue;
}

const getAppSigningSecretKeyForPath = (request: Request): SlackConfigKey | undefined => {
  const isCampaignCommand = endsWith(request.path, '/cmp-commands');
  const isCampaignAction = endsWith(request.path, '/cmp-actions');
  const isTowerCommand = endsWith(request.path, '/tower-commands');
  const isTowerAction = endsWith(request.path, '/tower-actions');
  const isTowerEvents = endsWith(request.path, '/tower-events');
  const isArenaCommand = endsWith(request.path, '/arena-commands');
  const isArenaAction = endsWith(request.path, '/arena-actions');
  const isGamesHqCommand = endsWith(request.path, '/gameshq-commands');

  if (isCampaignCommand || isCampaignAction) {
    return 'SLACK_CAMPAIGN_SIGNING_SECRET';
  }
  if (isTowerAction || isTowerCommand || isTowerEvents) {
    return 'SLACK_TOWER_SIGNING_SECRET';
  }
  if (isArenaCommand || isArenaAction) {
    return 'SLACK_ARENA_SIGNING_SECRET';
  }
  if (isGamesHqCommand) {
    return 'FRONT_END_SIGNING_SECRET';
  }

  return undefined;
};
