import type { ServerRoute } from '@hapi/hapi';

import { slackCommandHandler, towerSlackActionHandler } from './slackHandlers';
import { parseSlackActionPayload, parseSlashCommandPayload, verifySlackRequest } from './utils';

const routePrefix = '/slack-integrations/';

export const slackTowerRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: `${routePrefix}tower-commands`,
    options: {
      auth: false,
      payload: {
        parse: false,
        output: 'data',
      },
      description: 'The Tower Slack Commands route',
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
    path: `${routePrefix}tower-actions`,
    options: {
      auth: false,
      payload: {
        parse: false,
        output: 'data',
      },
      description: 'The Tower Slack Actions route',
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
    handler: towerSlackActionHandler,
  },
];
