import type { ServerRoute } from '@hapi/hapi';

import { leaderboardResultSchema } from '../../api-utils/schemas/gameDev/leaderboardSchemas';
import { webhookValidation } from '../../api-utils/webhookValidations';

import {
  getAchievementsThruWebhookHandler,
  postLeaderboardResultHandler,
} from './gameDevWebhookHandler';
import { parseWebhookPayload } from './utils';
declare module '@hapi/hapi' {
  export interface PluginSpecificConfiguration {
    firebasePlugin: {
      requiresAuth: boolean;
      requiredCapabilities: string[];
    };
  }
}

export const getLeaderboardResultRoute: ServerRoute = {
  method: 'GET',
  path: '/webhooks/game-dev/leaderboards/{leaderboardId}/rank',
  options: {
    description: 'Fetch a game`s current leaderboard rank',
    tags: ['api'],
    response: {
      schema: leaderboardResultSchema,
    },
    pre: [
      {
        method: webhookValidation,
        assign: 'webhookValidation',
      },
    ],
  },
  handler: postLeaderboardResultHandler,
};

export const postLeaderboardResultRoute: ServerRoute = {
  method: 'POST',
  path: '/webhooks/game-dev/leaderboards/score',
  options: {
    description: 'Submit a user`s game leaderboard score',
    payload: {
      parse: false,
      output: 'data',
    },
    tags: ['api'],
    response: {
      schema: leaderboardResultSchema,
    },
    pre: [
      {
        method: webhookValidation,
        assign: 'webhookValidation',
      },
      {
        method: parseWebhookPayload,
        assign: 'webhookPayload',
      },
    ],
  },
  handler: postLeaderboardResultHandler,
};

export const gameDevWebhookRoutes: ServerRoute[] = [
  {
    method: 'GET',
    path: '/webhooks/game-dev/achievements',
    options: {
      description: 'Get All the achievements related to a gameType',
      tags: ['api'],
      pre: [
        {
          method: webhookValidation,
          assign: 'webhookValidation',
        },
      ],
    },
    handler: getAchievementsThruWebhookHandler,
  },
  postLeaderboardResultRoute,
];
