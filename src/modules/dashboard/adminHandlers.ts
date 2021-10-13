import { Lifecycle } from '@hapi/hapi';
import { GAME_TYPE } from '../../games/consts/global';
import {
  IWeaponEditorData,
  upsertWeapon,
} from '../../games/tower/repositories/universal/weaponRepository';
import { ArenaPlayer, Item } from '../../models';
import { ArenaGame, findActiveArenaGame } from '../../models/ArenaGame';
import { findWeaponById, listActiveWeaponsByGameType } from '../../models/ItemWeapon';

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

export const getWeapon: Lifecycle.Method = async (_request, h) => {
  const weapon = await findWeaponById(_request.params.weaponId);

  return h
    .response({
      weapon,
    })
    .code(200);
};

export const upsertWeaponHandler: Lifecycle.Method = async (_request, h) => {
  const { payload } = _request;
  const weaponCreationData = payload as IWeaponEditorData;
  await upsertWeapon(weaponCreationData);

  return h.response({ success: true }).code(200);
};
