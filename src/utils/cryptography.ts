import { generateKey, createHmac } from 'crypto';
import { promisify } from 'util';
import { logger } from '../config';

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
