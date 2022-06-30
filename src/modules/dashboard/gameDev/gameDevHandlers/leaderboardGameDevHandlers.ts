import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';

import { arrayToJSON } from '../../../../api-utils/utils';
import type { GameType } from '../../../../models';
import type { LeaderboardEntryCreationAttributes } from '../../../../models/LeaderboardEntry';
import {
  getLeaderboardById,
  getLeaderBoardsByGameType,
  getLeaderBoardByCreator,
  createOrUpdateLeaderBoard,
  deleteLeaderboardById,
} from '../../../../models/LeaderboardEntry';
import { getLeaderboardResultRank } from '../../../../models/LeaderboardResults';

export const getLeaderboardHandler: Lifecycle.Method = async (request, h) => {
  if (request.params.leaderboardId) {
    const leaderboard = await getLeaderBoardByCreator(
      request.params.leaderboardId,
      request.params.gameTypeId,
      request.pre.getAuthUser.id
    );

    if (!leaderboard) {
      throw Boom.notFound('leaderboard not found');
    }

    return h.response(leaderboard?.toJSON()).code(200);
  } else {
    const leaderboards = await getLeaderBoardsByGameType(request.params.gameTypeId);
    return h.response(arrayToJSON(leaderboards)).code(200);
  }
};

export const getLeaderboardResultsHandler: Lifecycle.Method = async (request, h) => {
  const leaderboard = await getLeaderboardById(request.params.leaderboardId);

  if (!leaderboard) {
    throw Boom.notFound('leaderboard not found');
  }

  const leaderboardResult = await getLeaderboardResultRank(leaderboard);
  const res = arrayToJSON(leaderboardResult);
  console.log(
    '🚀 ~ file: leaderboardGameDevHandlers.ts ~ line 44 ~ constgetLeaderboardResultsHandler:Lifecycle.Method= ~ res',
    res
  );

  return h.response(res).code(200);
};

export const upsertLeaderboardHandler: Lifecycle.Method = async (request, h) => {
  const payload = request.payload as LeaderboardEntryCreationAttributes;
  const game = request.pre.game as GameType;

  if (payload.id && game && !game._leaderboards?.map((l) => l.id).includes(payload.id)) {
    throw Boom.forbidden(`leaderboard does not belong to gametypeId ${request.params.gameTypeId}`);
  }

  const [rslt] = await createOrUpdateLeaderBoard({
    id: payload.id,
    name: payload.name,
    scoreStrategy: payload.scoreStrategy,
    resetStrategy: payload.resetStrategy,
    _gameTypeId: request.params.gameTypeId,
  });

  return h.response(rslt?.toJSON()).code(200);
};

export const deleteLeaderboardHandler: Lifecycle.Method = async (request, h) => {
  const rslt = await deleteLeaderboardById(request.params.leaderboardId);

  if (!rslt) {
    throw Boom.notFound('leaderboard not found');
  }

  return h.response({ success: true }).code(200);
};
