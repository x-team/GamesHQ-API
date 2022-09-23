import Boom from '@hapi/boom';
import type { Lifecycle, Request } from '@hapi/hapi';

import type { SlackSlashCommandPayload } from '../../games/model/SlackSlashCommandPayload';
import { slackSlashCommandPayloadSchema } from '../../games/model/SlackSlashCommandPayload';
import { checkForSlackErrors } from '../utils';

export function parseSlackSlashCommandPayload(request: Request): Lifecycle.Method {
  if (!Buffer.isBuffer(request.payload)) {
    throw Boom.internal('Payload is not a Buffer');
  }

  const body = new URLSearchParams(request.payload.toString('utf-8'));
  const payload = {} as any;
  body.forEach((value, name) => (payload[name] = value));
  const parsed = payload as SlackSlashCommandPayload;

  const slashCommandPayload = slackSlashCommandPayloadSchema.validate(parsed, {
    stripUnknown: true,
  });

  checkForSlackErrors(slashCommandPayload, parsed);

  return slashCommandPayload.value;
}
