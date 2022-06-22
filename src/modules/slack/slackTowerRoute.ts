import type { ServerRoute } from '@hapi/hapi';

import {
  parseSlackSlashCommandPayloadMiddleware,
  parseSlackEventPayloadMiddleware,
  parseSlackActionPayloadMiddleware,
  verifySlackRequestMiddleware,
} from '../../api-utils/midddleware';

import {
  slackCommandHandler,
  towerSlackActionHandler,
  towerSlackEventHandler,
} from './slackHandlers';

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
      pre: [verifySlackRequestMiddleware, parseSlackSlashCommandPayloadMiddleware],
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
      pre: [verifySlackRequestMiddleware, parseSlackActionPayloadMiddleware],
    },
    handler: towerSlackActionHandler,
  },
  {
    method: 'POST',
    path: `${routePrefix}tower-events`,
    options: {
      auth: false,
      payload: {
        parse: false,
        output: 'data',
      },
      description: 'The Tower Slack Events route',
      tags: ['api', 'slack', 'action commands', 'arena'],
      response: {
        emptyStatusCode: 200,
      },
      pre: [verifySlackRequestMiddleware, parseSlackEventPayloadMiddleware],
    },
    handler: towerSlackEventHandler,
  },
];
