import Boom from '@hapi/boom';
import type { Lifecycle, Request, ResponseToolkit } from '@hapi/hapi';

import type { CustomRequestThis } from '../../api-utils/interfaceAndTypes';
import { arrayToJSON } from '../../api-utils/utils';
import type { IGameEditorData } from '../../models/GameType';
import {
  findGameTypeByName,
  createOrUpdateGameType,
  deleteGameTypeById,
  findAllGameTypesByCreator,
  findGameTypeById,
} from '../../models/GameType';
import type { LeaderboardEntryCreationAttributes } from '../../models/LeaderboardEntry';
import {
  getLeaderBoardsByGameType,
  getLeaderBoardById,
  createOrUpdateLeaderBoard,
} from '../../models/LeaderboardEntry';

// 🎮 Games
export const getGameTypeHandler: Lifecycle.Method = async (request, h) => {
  const authUser = request.pre.getAuthUser;
  const game = await findGameTypeById(request.params.gameTypeId);
  if (authUser.id !== game?._createdById) {
    throw Boom.forbidden('User is not the owner of the game');
  }
  return h.response({ game: game?.toJSON() }).code(200);
};

export async function getGameTypesHandler(
  this: CustomRequestThis,
  request: Request,
  h: ResponseToolkit
) {
  const authUser = request.pre.getAuthUser;
  const games = await findAllGameTypesByCreator(authUser.id);
  return h.response({ games: arrayToJSON(games) }).code(200);
}

export const upsertGameTypeHandler: Lifecycle.Method = async (request, h) => {
  const authUser = request.pre.getAuthUser;
  const { payload } = request;
  const gameDataPayload = payload as IGameEditorData;
  const gameTypeName = gameDataPayload.name;
  const game = await findGameTypeByName(gameTypeName);

  if (game && authUser.id !== game._createdById) {
    throw Boom.forbidden('User is not the owner of the game');
  }

  if (game && game.id !== gameDataPayload.id) {
    throw Boom.forbidden('Game name already exists.');
  }

  const gameCreationData: IGameEditorData = {
    ...(payload as IGameEditorData),
    name: gameTypeName,
    _createdById: authUser.id,
  };
  await createOrUpdateGameType(gameCreationData);

  return h.response({ success: true }).code(200);
};

export const deleteGameTypeHandler: Lifecycle.Method = async (request, h) => {
  await deleteGameTypeById(request.params.gameTypeId);
  return h.response({ success: true }).code(200);
};

export const getLeaderboardHandler: Lifecycle.Method = async (request, h) => {
  const authUser = request.pre.getAuthUser;
  const game = await findGameTypeById(request.params.gameTypeId);
  if (authUser.id !== game?._createdById) {
    throw Boom.forbidden('User is not the owner of the game');
  }

  if (request.params.leaderboardId) {
    const leaderboard = await getLeaderBoardById(request.params.leaderboardId);
    return h.response(leaderboard?.toJSON()).code(200);
  } else {
    const leaderboards = await getLeaderBoardsByGameType(request.params.gameTypeId);
    return h.response(leaderboards).code(200);
  }
};

export const upsertLeaderboardHandler: Lifecycle.Method = async (request, h) => {
  const authUser = request.pre.getAuthUser;
  const gameTypeId = request.params.gameTypeId;

  const game = await findGameTypeById(gameTypeId);
  if (game && authUser.id !== game._createdById) {
    throw Boom.forbidden('User is not the owner of the game');
  }

  const payload = request.payload as LeaderboardEntryCreationAttributes;

  const [rslt] = await createOrUpdateLeaderBoard({
    id: payload.id,
    name: payload.name,
    _gameTypeId: gameTypeId,
    scoreStrategy: payload.scoreStrategy,
    resetStrategy: payload.resetStrategy,
  });

  return h.response(rslt).code(200);
};
