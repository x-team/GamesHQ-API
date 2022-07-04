import type { ServerRoute } from '@hapi/hapi';

import {
  getAchievementsByIdRoute,
  getAchievementsRoute,
  getAchievementsProgressRoute,
  upsertAchievementsRoute,
  deleteAchievementsRoute,
  postAchievementProgressRoute,
  deleteAchievementProgressRoute,
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
  upsertAchievementsRoute,
  deleteAchievementsRoute,
  //acheivements unlocked progress
  getAchievementsProgressRoute,
  postAchievementProgressRoute,
  deleteAchievementProgressRoute,
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
