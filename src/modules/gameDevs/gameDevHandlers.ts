import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';

import type { IGameEditorData } from '../../models/GameType';
import {
  createOrUpdateGameType,
  deleteGameTypeById,
  findAllGameTypesByCreator,
  findGameTypeById,
} from '../../models/GameType';
import type { LeaderboardEntryCreationAttributes } from '../../models/LeaderboardEntry';
import { getLeaderBoardsByGameType, createLeaderBoard } from '../../models/LeaderboardEntry';

// 🎮 Games
export const getGameTypeHandler: Lifecycle.Method = async (request, h) => {
  const authUser = request.pre.getAuthUser;
  const game = await findGameTypeById(request.params.gameTypeId);
  if (authUser.id !== game?._createdById) {
    throw Boom.forbidden('User is not the owner of the game');
  }
  return h.response({ game }).code(200);
};

export const getGameTypesHandler: Lifecycle.Method = async (request, h) => {
  const authUser = request.pre.getAuthUser;
  const games = await findAllGameTypesByCreator(authUser.id);
  return h.response({ games }).code(200);
};

export const upsertGameTypeHandler: Lifecycle.Method = async (request, h) => {
  const authUser = request.pre.getAuthUser;
  const { payload } = request;
  const gameDataPayload = payload as IGameEditorData;
  const gameTypeId = gameDataPayload.id;
  const game = await findGameTypeById(gameTypeId);
  if (game && authUser.id !== game._createdById) {
    throw Boom.forbidden('User is not the owner of the game');
  }
  const gameCreationData: IGameEditorData = {
    ...(payload as IGameEditorData),
    _createdById: authUser.id,
  };
  await createOrUpdateGameType(gameCreationData);

  return h.response({ success: true }).code(200);
};

export const deleteGameTypeHandler: Lifecycle.Method = async (request, h) => {
  await deleteGameTypeById(request.params.gameTypeId);
  return h.response({}).code(200);
};

export const getLeaderboardHandler: Lifecycle.Method = async (request, h) => {
  const authUser = request.pre.getAuthUser;
  const game = await findGameTypeById(request.params.gameTypeId);
  if (authUser.id !== game?._createdById) {
    throw Boom.forbidden('User is not the owner of the game');
  }

  const leaderboards = await getLeaderBoardsByGameType(request.params.gameTypeId);
  return h.response(leaderboards).code(200);
};

export const upsertLeaderboardHandler: Lifecycle.Method = async (request, h) => {
  const authUser = request.pre.getAuthUser;
  const gameTypeId = request.params.gameTypeId;

  const game = await findGameTypeById(gameTypeId);
  if (game && authUser.id !== game._createdById) {
    throw Boom.forbidden('User is not the owner of the game');
  }

  const payload = request.payload as LeaderboardEntryCreationAttributes;

  await createLeaderBoard({
    name: payload.name,
    _gameTypeId: gameTypeId,
  });

  return h.response({ success: true }).code(200);
};
