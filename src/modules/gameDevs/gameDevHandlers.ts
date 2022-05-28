import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';

import type { IGameEditorData } from '../../models/GameType';
import {
  findGameTypeByName,
  createOrUpdateGameType,
  deleteGameTypeById,
  findAllGameTypesByCreator,
  findGameTypeById,
} from '../../models/GameType';

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
  const gameTypeName = gameDataPayload.id;
  const game = await findGameTypeByName(gameTypeName);
  if (game && authUser.id !== game._createdById) {
    throw Boom.forbidden('User is not the owner of the game');
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
  return h.response({}).code(200);
};
