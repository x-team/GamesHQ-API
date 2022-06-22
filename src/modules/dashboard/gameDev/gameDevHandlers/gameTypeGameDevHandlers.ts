import Boom from '@hapi/boom';
import type { Lifecycle, Request, ResponseToolkit } from '@hapi/hapi';

import type { CustomRequestThis } from '../../../../api-utils/interfaceAndTypes';
import { arrayToJSON } from '../../../../api-utils/utils';
import {
  createOrUpdateGameType,
  deleteGameTypeById,
  findAllGameTypesByCreator,
} from '../../../../models/GameType';
import type { IGameEditorData, GameType } from '../../../../models/GameType';

// 🎮 Games
export const getGameTypeHandler: Lifecycle.Method = async (request, h) => {
  const game = request.pre.game as GameType;
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
  const game = request.pre.game;

  if (game && game.id !== gameDataPayload.id && game.name !== gameDataPayload.name) {
    throw Boom.forbidden('Game name already exists.');
  }

  const gameCreationData = {
    ...(payload as IGameEditorData),
    _createdById: authUser.id,
  };

  await createOrUpdateGameType(gameCreationData);

  return h.response({ success: true }).code(200);
};

export const deleteGameTypeHandler: Lifecycle.Method = async (request, h) => {
  await deleteGameTypeById(request.params.gameTypeId);
  return h.response({ success: true }).code(200);
};
