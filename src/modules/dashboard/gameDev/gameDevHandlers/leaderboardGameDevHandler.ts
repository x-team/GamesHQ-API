import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';

import { arrayToJSON } from '../../../../api-utils/utils';
import { validateGameAuth } from '../../../../api-utils/validateGameAuth';
import type { LeaderboardEntryCreationAttributes } from '../../../../models/LeaderboardEntry';
import {
  getLeaderBoardsByGameType,
  getLeaderBoardByCreator,
  createOrUpdateLeaderBoard,
  deleteLeaderboardById,
} from '../../../../models/LeaderboardEntry';

export const getLeaderboardHandler: Lifecycle.Method = async (request, h) => {
  await validateGameAuth(request.pre.getAuthUser.id, request.params.gameTypeId);

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

export const upsertLeaderboardHandler: Lifecycle.Method = async (request, h) => {
  const payload = request.payload as LeaderboardEntryCreationAttributes;

  const game = await validateGameAuth(request.pre.getAuthUser.id, request.params.gameTypeId);

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
  await validateGameAuth(request.pre.getAuthUser.id, request.params.gameTypeId);

  const rslt = await deleteLeaderboardById(request.params.leaderboardId);

  if (!rslt) {
    throw Boom.notFound('leaderboard not found');
  }

  return h.response({ success: true }).code(200);
};
