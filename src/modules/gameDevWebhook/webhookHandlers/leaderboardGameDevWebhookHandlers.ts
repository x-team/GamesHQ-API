import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';

import type { User } from '../../../models';
import type { LeaderboardEntry } from '../../../models/LeaderboardEntry';
import { getLeaderboardById } from '../../../models/LeaderboardEntry';
import type { LeaderboardResultsCreationAttributes } from '../../../models/LeaderboardResults';
import {
  createOrUpdateLeaderBoardResult,
  getLeaderboardResultRank,
  getUserLeaderboardResult,
} from '../../../models/LeaderboardResults';

export const getLeaderboardRankHandler: Lifecycle.Method = async (request, h) => {
  const { gameType } = request.pre.webhookValidation;

  const leaderboard = await validateLeaderboard(request.params.leaderboardId, gameType.id);
  const rslt = await getLeaderboardResultRank(leaderboard, request.query.limit);

  return h
    .response(
      rslt.map((i) => ({
        score: i.score,
        displayName: i._user?.displayName,
        email: i._user?.email,
      }))
    )
    .code(200);
};

export const getUserLeaderboardResultHandler: Lifecycle.Method = async (request, h) => {
  const { gameType } = request.pre.webhookValidation;
  const user = request.pre.appendUserToRequest as User;

  const rslt = await getUserLeaderboardResult(user.id, request.params.leaderboardId, gameType.id);

  if (!rslt) {
    throw Boom.notFound('user score not found');
  }

  return h.response(rslt?.toJSON()).code(200);
};

export const postLeaderboardResultHandler: Lifecycle.Method = async (request, h) => {
  const { gameType } = request.pre.webhookValidation;
  const payload = request.pre.webhookPayload as LeaderboardResultsCreationAttributes;
  const user = request.pre.appendUserToRequest as User;

  await validateLeaderboard(request.params.leaderboardId, gameType.id);

  const leaderboardRslt = await createOrUpdateLeaderBoardResult({
    ...payload,
    _leaderboardEntryId: request.params.leaderboardId,
    _userId: user.id,
  });

  return h.response({ newEntry: leaderboardRslt ? true : false }).code(200);
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
