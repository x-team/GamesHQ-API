import type { ServerRoute } from '@hapi/hapi';

import {
  verifySlackRequestMiddleware,
  parseSlackSlashCommandPayloadMiddleware,
  parseSlackActionPayloadMiddleware,
} from '../../api-utils/midddleware';

import { arenaSlackActionHandler, slackCommandHandler } from './slackHandlers';

const routePrefix = '/slack-integrations/';

export const slackCommandRoute: ServerRoute = {
  method: 'POST',
  path: `${routePrefix}arena-commands`,
  options: {
    auth: false,
    payload: {
      parse: false,
      output: 'data',
    },
    description: 'The Arena Slack Commands route',
    tags: ['api', 'slack', 'slash commands', 'arena'],
    response: {
      emptyStatusCode: 200,
    },
    pre: [verifySlackRequestMiddleware, parseSlackSlashCommandPayloadMiddleware],
  },
  handler: slackCommandHandler,
};

export const arenaSlackActionRoute: ServerRoute = {
  method: 'POST',
  path: `${routePrefix}arena-actions`,
  options: {
    auth: false,
    payload: {
      parse: false,
      output: 'data',
    },
    description: 'The Arena Slack Actions route',
    tags: ['api', 'slack', 'action commands', 'arena'],
    response: {
      emptyStatusCode: 200,
    },
    pre: [verifySlackRequestMiddleware, parseSlackActionPayloadMiddleware],
  },
  handler: arenaSlackActionHandler,
};

export const slackArenaRoutes: ServerRoute[] = [slackCommandRoute, arenaSlackActionRoute];
