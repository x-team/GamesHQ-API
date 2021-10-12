import { Lifecycle } from '@hapi/hapi';
import { logger } from '../../config';
import { GAME_TYPE } from '../../games/consts/global';
import {
  creteWeapon,
  IWeaponEditorData,
} from '../../games/tower/repositories/universal/weaponRepository';
import { ArenaPlayer, Item } from '../../models';
import { ArenaGame, findActiveArenaGame } from '../../models/ArenaGame';
import { listActiveWeaponsByGameType } from '../../models/ItemWeapon';

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
  const [towerWeapons, arenaWeapons] = await Promise.all([
    listActiveWeaponsByGameType(GAME_TYPE.TOWER),
    listActiveWeaponsByGameType(GAME_TYPE.ARENA),
  ]);

  return h.response({ weapons: [...towerWeapons, ...arenaWeapons] }).code(200);
};

export const newWeapon: Lifecycle.Method = async (_request, h) => {
  const { payload } = _request;
  const weaponCreationData = payload as IWeaponEditorData;
  await creteWeapon(weaponCreationData);
  logger.info('Added');

  return h.response({ success: true }).code(200);
};
