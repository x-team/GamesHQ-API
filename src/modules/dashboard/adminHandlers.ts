import { Lifecycle } from '@hapi/hapi';
import { ArenaPlayer, Item } from '../../models';
import { ArenaGame, findActiveArenaGame } from '../../models/ArenaGame';

export interface ArenaState {
  players: ArenaPlayer[];
}

export const getCurrentArenaGameState: Lifecycle.Method = async (_request, h) => {
  const activeGame = await findActiveArenaGame();
  await activeGame?.reload({
    include: {
      model: ArenaGame,
      include: [
        {
          model: ArenaPlayer,
          include: [
            {
              association: ArenaPlayer.associations._weapons,
              include: [Item.associations._weapon, Item.associations._traits],
              as: '_weapons',
            },
          ],
        },
      ],
    },
  });

  return h.response({ arenaGame: activeGame }).code(200);
};

export const getWeapons: Lifecycle.Method = async (_request, h) => {
  // return h.response({ arenaGame: activeGame }).code(200);
};
