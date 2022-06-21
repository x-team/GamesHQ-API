import type { ServerRoute } from '@hapi/hapi';

import { appendUserToRequest } from '../../../api-utils/appendUserToRequest';
import {
  getLeaderboardRankResponseSchema,
  getUserLeaderboardResultScoreResponseSchema,
  postLeaderboardResultScoreResquestSchema,
  postLeaderboardResultScoreResponseSchema,
} from '../../../api-utils/schemas/gameDev/leaderboardSchemas';
import { webhookValidation } from '../../../api-utils/webhookValidations';
import { parseWebhookPayload } from '../utils';
import {
  getUserLeaderboardResultHandler,
  postLeaderboardResultHandler,
  getLeaderboardRankHandler,
} from '../webhookHandlers/leaderboardGameDevWebhookHandler';

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
        method: parseWebhookPayload(postLeaderboardResultScoreResquestSchema),
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
