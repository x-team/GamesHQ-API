import Querystring from 'querystring';

import Boom from '@hapi/boom';
import type { Lifecycle, Request } from '@hapi/hapi';

import type { SlackSlashCommandPayload } from '../../games/model/SlackSlashCommandPayload';
import { slackSlashCommandPayloadSchema } from '../../games/model/SlackSlashCommandPayload';
import { checkForSlackErrors } from '../utils';

export function parseSlackSlashCommandPayload(request: Request): Lifecycle.Method {
  if (!Buffer.isBuffer(request.payload)) {
    throw Boom.internal('Payload is not a Buffer');
  }

  const body = request.payload.toString('utf-8');
  const parsed = Querystring.parse(body) as unknown as SlackSlashCommandPayload;

  const slashCommandPayload = slackSlashCommandPayloadSchema.validate(parsed, {
    stripUnknown: true,
  });

  checkForSlackErrors(slashCommandPayload, parsed);

  return slashCommandPayload.value;
}
