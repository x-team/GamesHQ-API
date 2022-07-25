import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';

import {
  addEnemies,
  addTowerFloor,
  removeTowerFloor,
} from '../../../../games/tower/repositories/tower/floorRepository';
import type {
  ICreateTowerGameData,
  IUpdateTowerGameData,
} from '../../../../games/tower/repositories/tower/towerRepository';
import {
  createTowerGame,
  endCurrentTowerGame,
  openOrCloseTower,
  updateTowerGame,
} from '../../../../games/tower/repositories/tower/towerRepository';
import { findActiveTowerGame } from '../../../../models/TowerGame';

export const getTowerGameStatusHandler: Lifecycle.Method = async (_request, h) => {
  const towerGame = await findActiveTowerGame();
  return h.response({ towerGame }).code(200);
};

export const newTowerGameHandler: Lifecycle.Method = async (_request, h) => {
  const { payload } = _request;
  const towerCreationData = payload as ICreateTowerGameData;

  await createTowerGame(towerCreationData);
  return h.response({ success: true }).code(200);
};

export const updateTowerGameHandler: Lifecycle.Method = async (_request, h) => {
  const towerGameId = parseInt(_request.params.towerGameId);
  const payload = _request.payload as IUpdateTowerGameData;

  const towerUpdateData = {
    ...payload,
    towerGameId,
  } as IUpdateTowerGameData;

  const towerGame = await updateTowerGame(towerUpdateData);

  if (!towerGame) {
    throw Boom.notFound('no tower game found');
  }

  return h
    .response({
      name: towerGame._game?.name,
      ...towerGame.toJSON(),
    })
    .code(200);
};

export const endCurrentTowerGameHandler: Lifecycle.Method = async (_request, h) => {
  await endCurrentTowerGame();
  return h.response({ success: true }).code(200);
};

export const openOrCloseCurrentTowerHandler: Lifecycle.Method = async (_request, h) => {
  const { payload } = _request;
  const { open } = payload as { open: boolean };

  await openOrCloseTower(open);

  return h.response({ success: true }).code(200);
};

type IAddEnemiesPayload = {
  enemyIds: number[];
};

type IAddFloorPayload = {
  number: number;
};

export const addEnemyToFloorHandler: Lifecycle.Method = async (_request, h) => {
  const floorId = parseInt(_request.params.floorId);
  const { payload } = _request;
  const { enemyIds } = payload as IAddEnemiesPayload;

  await addEnemies(floorId, enemyIds);

  return h.response({ success: true }).code(200);
};

export const addTowerFloorHandler: Lifecycle.Method = async (_request, h) => {
  const towerGameId = parseInt(_request.params.towerGameId);
  const { payload } = _request;
  const { number } = payload as IAddFloorPayload;

  const floor = await addTowerFloor(number, towerGameId);

  return h.response(floor.toJSON()).code(200);
};

export const removeTowerFloorHandler: Lifecycle.Method = async (_request, h) => {
  const towerGameId = parseInt(_request.params.towerGameId);
  const floorId = parseInt(_request.params.floorId);

  await removeTowerFloor(floorId, towerGameId);

  return h.response({ success: true }).code(200);
};
