import type { ServerRoute } from '@hapi/hapi';

import {
  getGameAcheivmentsRoute,
  postAchievementProgressRoute,
} from './achievementsGameDevWebhookRoute';
import {
  getGameLeaderboardResultRoute,
  getUserLeaderboardResultRoute,
  postLeaderboardResultRoute,
} from './leaderboardGameDevWebhookRoute';

export const gameDevWebhookRoutes: ServerRoute[] = [
  //achievements
  getGameAcheivmentsRoute,
  postAchievementProgressRoute,
  //leaderboards
  getGameLeaderboardResultRoute,
  getUserLeaderboardResultRoute,
  postLeaderboardResultRoute,
];
