import type { ServerRoute } from '@hapi/hapi';

import {
  getAchievementsByIdRoute,
  getAchievementsRoute,
  getAchievementsProgressRoute,
  upsertAchievementsRoute,
  deleteAchievementsRoute,
  postAchievementProgressRoute,
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
  getResultsFromLeaderboardRoute,
  deleteLeaderboardRoute,
  upsertLeaderboardRoute,
} from './gameDevRoutes/leaderboardGameDevRoutes';

export const gameDevRoutes: ServerRoute[] = [
  //achievements
  getAchievementsByIdRoute,
  getAchievementsRoute,
  getAchievementsProgressRoute,
  postAchievementProgressRoute,
  upsertAchievementsRoute,
  deleteAchievementsRoute,
  //GameTypes
  getGameTypeByIdRoute,
  getGameTypesRoute,
  deleteGameTypeRoute,
  upsertGameTypeRoute,
  //leaderboards
  getLeaderboardByIdRoute,
  getResultsFromLeaderboardRoute,
  getLeaderboardsRoute,
  upsertLeaderboardRoute,
  deleteLeaderboardRoute,
];
