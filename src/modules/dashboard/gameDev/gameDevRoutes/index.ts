import type { ServerRoute } from '@hapi/hapi';

import {
  getAchievementsByIdRoute,
  getAchievementsRoute,
  upsertAchievementsRoute,
  deleteAchievementsRoute,
} from './achievementGameDevRoute';
import {
  getGameTypeByIdRoute,
  getGameTypesRoute,
  deleteGameTypeRoute,
  upsertGameTypeRoute,
} from './gameTypeGameDevRoute';
import {
  getLeaderboardByIdRoute,
  getLeaderboardsRoute,
  deleteLeaderboardRoute,
  upsertLeaderboardRoute,
} from './leaderboardGameDevRoutes';

export const gameDevRoutes: ServerRoute[] = [
  //achievements
  getAchievementsByIdRoute,
  getAchievementsRoute,
  upsertAchievementsRoute,
  deleteAchievementsRoute,
  //GameTypes
  getGameTypeByIdRoute,
  getGameTypesRoute,
  deleteGameTypeRoute,
  upsertGameTypeRoute,
  //leaderboards
  getLeaderboardByIdRoute,
  getLeaderboardsRoute,
  upsertLeaderboardRoute,
  deleteLeaderboardRoute,
];
