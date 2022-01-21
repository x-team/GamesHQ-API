import type { ServerRoute } from '@hapi/hapi';

import {
  slackCommandHandler,
  towerSlackActionHandler,
  towerSlackEventHandler,
} from './slackHandlers';
import {
  parseSlackActionPayload,
  parseSlackEventPayload,
  parseSlashCommandPayload,
  verifySlackRequest,
} from './utils';

const routePrefix = '/slack-integrations/';

export const slackTowerRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: `${routePrefix}gameshq-commands`,
    options: {
      auth: false,
      payload: {
        parse: false,
        output: 'data',
      },
      description: 'General GamesHQ related routes',
      tags: ['api', 'slack', 'slash commands', 'gameshq'],
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
      pre: [
        {
          method: verifySlackRequest,
          assign: 'verifySlackRequest',
        },
        {
          method: parseSlackEventPayload,
          assign: 'slackActionPayload',
        },
      ],
    },
    handler: towerSlackEventHandler,
  },
];
