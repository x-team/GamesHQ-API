import type { ServerRoute } from '@hapi/hapi';

import {
  getGameAcheivmentsRoute,
  postAchievementProgressRoute,
} from './webhookRoutes/achievementsGameDevWebhookRoutes';
import {
  getGameLeaderboardResultRoute,
  getUserLeaderboardResultRoute,
  postLeaderboardResultRoute,
} from './webhookRoutes/leaderboardGameDevWebhookRoutes';

export const gameDevWebhookRoutes: ServerRoute[] = [
  //achievements
  getGameAcheivmentsRoute,
  postAchievementProgressRoute,
  //leaderboards
  getGameLeaderboardResultRoute,
  getUserLeaderboardResultRoute,
  postLeaderboardResultRoute,
];
