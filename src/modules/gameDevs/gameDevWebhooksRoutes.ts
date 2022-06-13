import type { ServerRoute } from '@hapi/hapi';

import { appendUserToRequest } from '../../api-utils/appendUserToRequest';
import {
  getLeaderboardRankResponseSchema,
  getUserLeaderboardResultScoreResponseSchema,
  postLeaderboardResultScoreResponseSchema,
} from '../../api-utils/schemas/gameDev/leaderboardSchemas';
import { webhookValidation } from '../../api-utils/webhookValidations';

import {
  getAchievementsThruWebhookHandler,
  getUserLeaderboardResultHandler,
  postLeaderboardResultHandler,
  getLeaderboardRankHandler,
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

export const getGameLeaderboardResultRoute: ServerRoute = {
  method: 'GET',
  path: '/webhooks/game-dev/leaderboards/{leaderboardId}/rank',
  options: {
    description: 'Fetch a game`s current leaderboard rank',
    tags: ['api'],
    response: {
      schema: getLeaderboardRankResponseSchema,
    },
    pre: [
      {
        method: webhookValidation,
        assign: 'webhookValidation',
      },
    ],
  },
  handler: getLeaderboardRankHandler,
};

export const getUserLeaderboardResultRoute: ServerRoute = {
  method: 'GET',
  path: '/webhooks/game-dev/leaderboards/{leaderboardId}/score',
  options: {
    description: `Fetch a user's current leaderboard score`,
    tags: ['api'],
    response: {
      schema: getUserLeaderboardResultScoreResponseSchema,
    },
    pre: [
      {
        method: webhookValidation,
        assign: 'webhookValidation',
      },
      {
        method: appendUserToRequest,
        assign: 'appendUserToRequest',
      },
    ],
  },
  handler: getUserLeaderboardResultHandler,
};

export const postLeaderboardResultRoute: ServerRoute = {
  method: 'POST',
  path: '/webhooks/game-dev/leaderboards/{leaderboardId}/score',
  options: {
    description: `Submit a game's leaderboard score`,
    payload: {
      parse: false,
      output: 'data',
    },
    tags: ['api'],
    response: {
      schema: postLeaderboardResultScoreResponseSchema,
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
      {
        method: appendUserToRequest,
        assign: 'appendUserToRequest',
      },
    ],
  },
  handler: postLeaderboardResultHandler,
};

const getGameAcheivmentsRoute: ServerRoute = {
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
};

export const gameDevWebhookRoutes: ServerRoute[] = [
  getGameAcheivmentsRoute,
  getGameLeaderboardResultRoute,
  getUserLeaderboardResultRoute,
  postLeaderboardResultRoute,
];
