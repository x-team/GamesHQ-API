import type { ServerRoute } from '@hapi/hapi';

import { arenaSlackActionHandler, slackCommandHandler } from './slackHandlers';
import { parseSlackActionPayload, parseSlashCommandPayload, verifySlackRequest } from './utils';

const routePrefix = '/slack-integrations/';

export const slackArenaRoutes: ServerRoute[] = [
  {
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
      pre: [
        {
          method: verifySlackRequest,
          assign: 'verifySlackRequest',
        },
        {
          method: parseSlashCommandPayload,
          assign: 'slashCommandPayload',
        },
      ],
    },
    handler: slackCommandHandler,
  },
  {
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
      pre: [
        {
          method: verifySlackRequest,
          assign: 'verifySlackRequest',
        },
        {
          method: parseSlackActionPayload,
          assign: 'slackActionPayload',
        },
      ],
    },
    handler: arenaSlackActionHandler,
  },
];
