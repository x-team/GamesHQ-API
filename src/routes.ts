import type { ServerRoute } from '@hapi/hapi';

import { adminRoutes } from './modules/dashboard/admin/adminRoutes';
import { gameDevRoutes } from './modules/dashboard/gameDev/gameDevRoutes';
import { gameDevWebhookRoutes } from './modules/gameDevWebhook/webhookRoutes';
import { slackArenaRoutes } from './modules/slack/slackArenaRoute';
import { slackRoutes } from './modules/slack/slackRoutes';
import { slackTowerRoutes } from './modules/slack/slackTowerRoute';
import { userRoutes } from './modules/users/userRoutes';

export const routes: ServerRoute[] = [
  ...slackRoutes,
  ...slackArenaRoutes,
  ...slackTowerRoutes,
  ...adminRoutes,
  ...gameDevRoutes,
  ...gameDevWebhookRoutes,
  ...userRoutes,
];
