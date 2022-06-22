import type { ServerRoute } from '@hapi/hapi';

import {
  webhookValidationMiddleware,
  appendUserToRequestMiddleware,
  parseWebhookPayloadMiddleware,
} from '../../../api-utils/midddleware';
import {
  postAchievementProgressResponseSchema,
  postAchievementProgressRequestSchema,
} from '../../../api-utils/schemas/gameDev/achievementsSchemas';
import {
  getAchievementsThruWebhookHandler,
  postAchievementsProgressHandler,
} from '../webhookHandlers/achievementsGameDevWebhookHandlers';

export const getGameAcheivmentsRoute: ServerRoute = {
  method: 'GET',
  path: '/webhooks/game-dev/achievements',
  options: {
    description: 'Get All the achievements related to a gameType',
    tags: ['api'],
    pre: [webhookValidationMiddleware],
  },
  handler: getAchievementsThruWebhookHandler,
};

export const postAchievementProgressRoute: ServerRoute = {
  method: 'POST',
  path: '/webhooks/game-dev/achievements/{achievementId}/progress',
  options: {
    description: 'Post user achievement progress',
    payload: {
      parse: false,
      output: 'data',
    },
    tags: ['api'],
    response: {
      schema: postAchievementProgressResponseSchema,
    },
    pre: [
      webhookValidationMiddleware,
      parseWebhookPayloadMiddleware(postAchievementProgressRequestSchema),
      appendUserToRequestMiddleware,
    ],
  },
  handler: postAchievementsProgressHandler,
};
