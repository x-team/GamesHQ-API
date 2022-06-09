import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';

import { findAllAchievementsByGameType } from '../../models/Achievements';
import { getLeaderboardById } from '../../models/LeaderboardEntry';
import type { LeaderboardResultsCreationAttributes } from '../../models/LeaderboardResults';
import {
  createOrUpdateLeaderBoardResult,
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
): Promise<void> => {
  const leaderboard = await getLeaderboardById(leaderboardEntryId);

  if (leaderboard?._gameTypeId !== gameTypeId) {
    throw Boom.forbidden('leaderboard does not belong to that game');
  }
};
