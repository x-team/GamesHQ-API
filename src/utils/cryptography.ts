import { generateKey, createHmac } from 'crypto';
import { promisify } from 'util';
import { getConfig, logger } from '../config';

const generateKeyAsync = promisify(generateKey);

export async function generateSecret() {
  const secret = await generateKeyAsync('hmac', { length: 256 });
  logger.info(secret.export().toString('hex'));
  return secret.export().toString('hex');
}

export function signMessage(message: string, secret: string) {
  const hmac = createHmac('sha256', secret);
  hmac.update(message);
  return hmac.digest('hex');
}

// SLACK
export type SlackConfigKey =
  | 'SLACK_ARENA_SIGNING_SECRET'
  | 'SLACK_CAMPAIGN_SIGNING_SECRET'
  | 'SLACK_TOWER_SIGNING_SECRET';

export function validateSlackSignatures(
  secretKey: SlackConfigKey,
  slackSignature: string,
  signatureBase: string,
  version: string
) {
  const secret = getConfig(secretKey);

  const hmac = createHmac('sha256', secret);
  hmac.update(signatureBase);
  const sha = hmac.digest('hex');

  return slackSignature === `${version}=${sha}`;
}
