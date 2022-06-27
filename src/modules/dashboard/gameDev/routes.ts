import type { ServerRoute } from '@hapi/hapi';

import {
  getAchievementsByIdRoute,
  getAchievementsRoute,
  upsertAchievementsRoute,
  deleteAchievementsRoute,
} from './gameDevRoutes/achievementGameDevRoutes';
import {
  getGameTypeByIdRoute,
  getGameTypesRoute,
  deleteGameTypeRoute,
  upsertGameTypeRoute,
} from './gameDevRoutes/gameTypeGameDevRoutes';
import {
  getLeaderboardByIdRoute,
  getLeaderboardsRoute,
  deleteLeaderboardRoute,
  upsertLeaderboardRoute,
} from './gameDevRoutes/leaderboardGameDevRoutes';

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
