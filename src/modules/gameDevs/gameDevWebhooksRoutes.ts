import type { ServerRoute } from '@hapi/hapi';
import { webhookValidation } from '../../api-utils/webhookValidations';
import { getAchievementsThruWebhookHandler } from './gameDevWebhookHandler';

declare module '@hapi/hapi' {
  export interface PluginSpecificConfiguration {
    firebasePlugin: {
      requiresAuth: boolean;
      requiredCapabilities: string[];
    };
  }
}

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
];
