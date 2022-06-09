import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';

import { arrayToJSON } from '../../api-utils/utils';
import { findAllAchievementsByGameType } from '../../models/Achievements';
import type { LeaderboardEntry } from '../../models/LeaderboardEntry';
import { getLeaderboardById } from '../../models/LeaderboardEntry';
import type { LeaderboardResultsCreationAttributes } from '../../models/LeaderboardResults';
import {
  createOrUpdateLeaderBoardResult,
  getLeaderboardResultRank,
  getUserLeaderboardResult,
} from '../../models/LeaderboardResults';

// 🎮 Games
export const getAchievementsThruWebhookHandler: Lifecycle.Method = async (request, h) => {
  const { gameType } = request.pre.webhookValidation;
  const achievements = await findAllAchievementsByGameType(gameType.id);
  // if () {
  //   throw Boom.forbidden('User is not the owner of the game');
  // }
  return h.response({ achievements }).code(200);
};

export const getLeaderboardRankHandler: Lifecycle.Method = async (request, h) => {
  const { gameType } = request.pre.webhookValidation;

  const leaderboard = await validateLeaderboard(request.params.leaderboardId, gameType.id);
  const rslt = await getLeaderboardResultRank(leaderboard);

  return h.response(arrayToJSON(rslt)).code(200);
};

export const postLeaderboardResultHandler: Lifecycle.Method = async (request, h) => {
  const { gameType } = request.pre.webhookValidation;
  const payload = request.pre.webhookPayload as LeaderboardResultsCreationAttributes;

  await validateLeaderboard(payload._leaderboardEntryId, gameType.id);

  const currentLeaderboardRslt = await getUserLeaderboardResult(
    payload._userId,
    payload._leaderboardEntryId
  );

  const [leaderboardRslt] = await createOrUpdateLeaderBoardResult({
    id: currentLeaderboardRslt?.id,
    ...payload,
  });

  return h.response(leaderboardRslt.toJSON()).code(200);
};

const validateLeaderboard = async (
  leaderboardEntryId: number,
  gameTypeId: number
): Promise<LeaderboardEntry> => {
  const leaderboard = await getLeaderboardById(leaderboardEntryId);

  if (leaderboard?._gameTypeId !== gameTypeId) {
    throw Boom.forbidden('leaderboard does not belong to that game');
  }

  return leaderboard;
};
