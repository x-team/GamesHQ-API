import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';

import type { SlackChallengesPayload } from '../../games/model/SlackChallengePayload';
import { slackChallengesPayloadSchema } from '../../games/model/SlackChallengePayload';
import type { SlackEventsPayload } from '../../games/model/SlackEventPayload';
import { slackEventsPayloadSchema } from '../../games/model/SlackEventPayload';
import { checkForSlackErrors } from '../utils';

export const parseSlackEventPayload: Lifecycle.Method = (request) => {
  if (!Buffer.isBuffer(request.payload)) {
    throw Boom.internal('Payload is not a Buffer');
  }

  const body = new URLSearchParams(request.payload.toString('utf-8'));
  const payload = {} as any;
  body.forEach((value, name) => (payload[name] = value));

  const parsed: SlackChallengesPayload | SlackEventsPayload = payload;

  const slackEventPayload = parsed.challenge
    ? slackChallengesPayloadSchema.validate(parsed, { stripUnknown: true })
    : slackEventsPayloadSchema.validate(parsed, { stripUnknown: true });

  checkForSlackErrors(slackEventPayload, parsed);

  return slackEventPayload.value;
};
