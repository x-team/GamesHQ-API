import { generateKey, createHmac } from 'crypto';
import { promisify } from 'util';

const generateKeyAsync = promisify(generateKey);

export async function generateSecret() {
  const secret = await generateKeyAsync('hmac', { length: 256 });
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
  | 'SLACK_TOWER_SIGNING_SECRET'
  | 'FRONT_END_SIGNING_SECRET';

export function validateWebhookSignatures(
  secretSignature: string,
  hashedSignature: string,
  signatureBase: string,
  version: string
) {
  const sha = signMessage(signatureBase, secretSignature);
  return hashedSignature === `${version}=${sha}`;
}
