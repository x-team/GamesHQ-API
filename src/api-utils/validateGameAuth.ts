import Boom from '@hapi/boom';

import type { GameType } from '../models/GameType';
import { findGameTypeById } from '../models/GameType';

export const validateGameAuth = async (
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
