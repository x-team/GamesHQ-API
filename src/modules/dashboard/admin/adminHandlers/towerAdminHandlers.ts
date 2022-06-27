import type { Lifecycle } from '@hapi/hapi';

import { addEnemies } from '../../../../games/tower/repositories/tower/floorRepository';
import type { ICreateTowerGameData } from '../../../../games/tower/repositories/tower/towerRepository';
import {
  createTowerGame,
  endCurrentTowerGame,
  openOrCloseTower,
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

export const addEnemyToFloorHandler: Lifecycle.Method = async (_request, h) => {
  const floorId = parseInt(_request.params.floorId);
  const { payload } = _request;
  const { enemies } = payload as { enemies: number[] };

  await addEnemies(floorId, enemies);

  return h.response({ success: true }).code(200);
};
