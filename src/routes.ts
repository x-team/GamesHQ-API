import type { ServerRoute } from '@hapi/hapi';

import { slackArenaRoutes } from './modules/slack/slackArenaRoute';
import { slackRoutes } from './modules/slack/slackRoutes';
import { adminRoutes } from './modules/dashboard/adminRoutes';
import { slackTowerRoutes } from './modules/slack/slackTowerRoute';
import { gameDevRoutes } from './modules/gameDevs/gameDevRoutes';
import { gameDevWebhookRoutes } from './modules/gameDevs/gameDevWebhooksRoutes';
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
