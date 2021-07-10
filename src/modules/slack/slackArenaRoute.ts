import type { ServerRoute } from '@hapi/hapi';

import { slackCommandHandler } from './slackHandlers';
import { parseSlashCommandPayload, verifySlackRequest } from './utils';

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
];
