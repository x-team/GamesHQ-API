import Boom from '@hapi/boom';
import type { Lifecycle, Request, ResponseToolkit } from '@hapi/hapi';

import type { CustomRequestThis } from '../../api-utils/interfaceAndTypes';
import { arrayToJSON } from '../../api-utils/utils';
import type { AchievementEditorData } from '../../models/Achievements';
import {
  findAllAchievementsByGameType,
  getAcheivementByCreator,
  createOrUpdateAchievement,
  deleteAchievementById,
} from '../../models/Achievements';
import type { IGameEditorData, GameType } from '../../models/GameType';
import {
  createOrUpdateGameType,
  deleteGameTypeById,
  findAllGameTypesByCreator,
  findGameTypeById,
} from '../../models/GameType';
import type { LeaderboardEntryCreationAttributes } from '../../models/LeaderboardEntry';
import {
  getLeaderBoardsByGameType,
  getLeaderBoardByCreator,
  createOrUpdateLeaderBoard,
  deleteLeaderboardById,
} from '../../models/LeaderboardEntry';

// 🎮 Games
export const getGameTypeHandler: Lifecycle.Method = async (request, h) => {
  const game = await validateGameAuth(request.pre.getAuthUser.id, request.params.gameTypeId);
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
  const game = await validateGameAuth(authUser.id, gameDataPayload.id);

  if (game && game.id !== gameDataPayload.id && game.name !== gameDataPayload.name) {
    throw Boom.forbidden('Game name already exists.');
  }

  const gameCreationData: IGameEditorData = {
    ...(payload as IGameEditorData),
    _createdById: authUser.id,
  };
  await createOrUpdateGameType(gameCreationData);

  return h.response({ success: true }).code(200);
};

export const deleteGameTypeHandler: Lifecycle.Method = async (request, h) => {
  await validateGameAuth(request.pre.getAuthUser.id, request.params.gameTypeId);

  await deleteGameTypeById(request.params.gameTypeId);
  return h.response({ success: true }).code(200);
};

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

export const getAcheivementsHandler: Lifecycle.Method = async (request, h) => {
  await validateGameAuth(request.pre.getAuthUser.id, request.params.gameTypeId);

  if (request.params.acheivementId) {
    const acheivement = await getAcheivementByCreator(
      request.params.acheivementId,
      request.params.gameTypeId,
      request.pre.getAuthUser.id
    );

    if (!acheivement) {
      throw Boom.notFound('acheivement not found');
    }

    return h.response(acheivement?.toJSON()).code(200);
  } else {
    const acheivements = await findAllAchievementsByGameType(request.params.gameTypeId);
    return h.response(arrayToJSON(acheivements)).code(200);
  }
};

export const upsertAcheivementHandler: Lifecycle.Method = async (request, h) => {
  const payload = request.payload as AchievementEditorData;

  const game = await validateGameAuth(request.pre.getAuthUser.id, request.params.gameTypeId);

  if (payload.id && game && !game._acheivements?.map((a) => a.id).includes(payload.id)) {
    throw Boom.forbidden(`acheivement does not belong to gametypeId ${request.params.gameTypeId}`);
  }

  const [rslt] = await createOrUpdateAchievement({ ...payload }, request.params.gameTypeId);

  return h.response(rslt?.toJSON()).code(200);
};

export const deleteAcheivementHandler: Lifecycle.Method = async (request, h) => {
  await validateGameAuth(request.pre.getAuthUser.id, request.params.gameTypeId);

  const rslt = await deleteAchievementById(request.params.acheivementId);

  if (!rslt) {
    throw Boom.notFound('acheivement not found');
  }

  return h.response({ success: true }).code(200);
};

const validateGameAuth = async (
  authUserId: number,
  gameTypeId?: number
): Promise<GameType | void> => {
  if (!gameTypeId) {
    return;
  }

  const game = await findGameTypeById(gameTypeId);
  if (authUserId !== game?._createdById) {
    throw Boom.forbidden('User is not the owner of the game');
  }

  return game;
};
