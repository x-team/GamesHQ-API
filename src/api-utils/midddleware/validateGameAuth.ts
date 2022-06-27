import Boom from '@hapi/boom';
import type { Request, ResponseToolkit } from '@hapi/hapi';

import { findGameTypeById } from '../../models/GameType';
import type { GameType } from '../../models/GameType';
import type { CustomRequestThis } from '../interfaceAndTypes';

// export const validateGameAuth_temp = async (
//   authUserId: number,
//   gameTypeId?: number
// ): Promise<GameType | void> => {
//   if (!gameTypeId) {
//     return;
//   }

//   const game = await findGameTypeById(gameTypeId);
//   if (authUserId !== game?._createdById) {
//     throw Boom.forbidden('User is not the owner of the game');
//   }

//   return game;
// };

export async function validateGameAuth(
  this: CustomRequestThis,
  request: Request,
  _h: ResponseToolkit
): Promise<GameType | null> {
  const authUserId = request.pre.getAuthUser.id;
  const gameTypeId = getGameTypeId(request);

  if (!gameTypeId) {
    return null;
  }

  const game = await findGameTypeById(gameTypeId);
  if (game && authUserId !== game._createdById) {
    throw Boom.forbidden('User is not the owner of the game');
  }

  return game;
}

function getGameTypeId(request: Request): number | undefined {
  if (request.params.gameTypeId) {
    return request.params.gameTypeId;
  }

  if (!request.payload) {
    return;
  }

  switch (typeof request.payload) {
    case 'string':
      return JSON.parse(request.payload).id;
    default:
      return (request.payload as { id?: number }).id;
  }
}
