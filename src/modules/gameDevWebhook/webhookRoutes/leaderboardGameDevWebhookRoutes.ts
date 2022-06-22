import type { ServerRoute } from '@hapi/hapi';

import {
  webhookValidationMiddleware,
  appendUserToRequestMiddleware,
  parseWebhookPayloadMiddleware,
} from '../../../api-utils/midddleware';
import {
  getLeaderboardRankResponseSchema,
  getUserLeaderboardResultScoreResponseSchema,
  postLeaderboardResultScoreResquestSchema,
  postLeaderboardResultScoreResponseSchema,
} from '../../../api-utils/schemas/gameDev/leaderboardSchemas';
import {
  getUserLeaderboardResultHandler,
  postLeaderboardResultHandler,
  getLeaderboardRankHandler,
} from '../webhookHandlers/leaderboardGameDevWebhookHandlers';

export const getGameLeaderboardResultRoute: ServerRoute = {
  method: 'GET',
  path: '/webhooks/game-dev/leaderboards/{leaderboardId}/rank',
  options: {
    description: 'Fetch a game`s current leaderboard rank',
    tags: ['api'],
    response: {
      schema: getLeaderboardRankResponseSchema,
    },
    pre: [webhookValidationMiddleware],
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
    pre: [webhookValidationMiddleware, appendUserToRequestMiddleware],
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
      webhookValidationMiddleware,
      parseWebhookPayloadMiddleware(postLeaderboardResultScoreResquestSchema),
      appendUserToRequestMiddleware,
    ],
  },
  handler: postLeaderboardResultHandler,
};
