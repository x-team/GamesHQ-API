import type { ServerRoute } from '@hapi/hapi';

import { appendUserToRequest } from '../../../api-utils/appendUserToRequest';
import {
  postAchievementProgressResponseSchema,
  postAchievementProgressRequestSchema,
} from '../../../api-utils/schemas/gameDev/achievementsSchemas';
import { webhookValidation } from '../../../api-utils/webhookValidations';
import { parseWebhookPayload } from '../utils';
import {
  getAchievementsThruWebhookHandler,
  postAchievementsProgressHandler,
} from '../webhookHandlers/achievementsGameDevWebhookHandler';

export const getGameAcheivmentsRoute: ServerRoute = {
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
      {
        method: webhookValidation,
        assign: 'webhookValidation',
      },
      {
        method: parseWebhookPayload(postAchievementProgressRequestSchema),
        assign: 'webhookPayload',
      },
      {
        method: appendUserToRequest,
        assign: 'appendUserToRequest',
      },
    ],
  },
  handler: postAchievementsProgressHandler,
};
