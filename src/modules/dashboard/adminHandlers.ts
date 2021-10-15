import { Lifecycle } from '@hapi/hapi';
import {
  deleteZone,
  IZoneEditorData,
  upsertZone,
} from '../../games/tower/repositories/arena/zonesRepository';
import {
  deleteEnemy,
  IEnemyEditorData,
  upsertEnemy,
} from '../../games/tower/repositories/tower/enemyRepository';
import {
  deleteWeapon,
  IWeaponEditorData,
  upsertWeapon,
} from '../../games/tower/repositories/universal/weaponRepository';
import { ArenaPlayer, Item } from '../../models';
import { ArenaGame, findActiveArenaGame } from '../../models/ArenaGame';
import { findAllArenaZones, findArenaZoneById } from '../../models/ArenaZone';
import { findAllEnemies, findEnemyById } from '../../models/Enemy';
import { listAllWeapons } from '../../models/Item';
import { findWeaponById } from '../../models/ItemWeapon';

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

export const getWeaponsHandler: Lifecycle.Method = async (_request, h) => {
  const weapons = await listAllWeapons();

  return h.response({ weapons }).code(200);
};

export const getWeaponHandler: Lifecycle.Method = async (_request, h) => {
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

export const deleteWeaponHandler: Lifecycle.Method = async (_request, h) => {
  await deleteWeapon(_request.params.itemId);
  return h.response({ success: true }).code(200);
};

export const getEnemyHandler: Lifecycle.Method = async (_request, h) => {
  const enemy = await findEnemyById(_request.params.enemyId);

  return h
    .response({
      enemy,
    })
    .code(200);
};

export const getEnemiesHandler: Lifecycle.Method = async (_request, h) => {
  const enemies = await findAllEnemies();

  return h.response({ enemies }).code(200);
};

export const upsertEnemyHandler: Lifecycle.Method = async (_request, h) => {
  const { payload } = _request;
  const enemyCreationData = payload as IEnemyEditorData;
  await upsertEnemy(enemyCreationData);

  return h.response({ success: true }).code(200);
};

export const deleteEnemyHandler: Lifecycle.Method = async (_request, h) => {
  await deleteEnemy(_request.params.enemyId);

  return h
    .response({
      success: true,
    })
    .code(200);
};

// 🏠 Zones

export const getZoneHandler: Lifecycle.Method = async (_request, h) => {
  const zone = await findArenaZoneById(_request.params.zoneId);

  return h.response({ zone }).code(200);
};

export const getZonesHandler: Lifecycle.Method = async (_request, h) => {
  const zones = await findAllArenaZones();
  return h.response({ zones }).code(200);
};

export const upsertZoneHandler: Lifecycle.Method = async (_request, h) => {
  const { payload } = _request;
  const zoneCreationData = payload as IZoneEditorData;
  await upsertZone(zoneCreationData);

  return h.response({ success: true }).code(200);
};

export const deleteZoneHandler: Lifecycle.Method = async (_request, h) => {
  await deleteZone(_request.params.zoneId);
  return h.response({}).code(200);
};
