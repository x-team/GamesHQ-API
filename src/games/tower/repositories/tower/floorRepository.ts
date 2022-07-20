import Boom from '@hapi/boom';

import { addFloor, findTowerFloor, removeFloor } from '../../../../models/TowerFloor';
import { findTowerGameById } from '../../../../models/TowerGame';
import { findAdmin } from '../../../../models/User';

import { addEnemiesToFloor } from './actions/admin/tower-floors-operations';

export const addEnemies = async (floorNumber: number, enemyIds: number[]) => {
  const adminUser = await findAdmin();
  if (!adminUser) {
    return;
  }

  await addEnemiesToFloor(adminUser, floorNumber, enemyIds);
};

export const addTowerFloor = async (floorNumber: number, towerGameId: number) => {
  const towerGame = await findTowerGameById(towerGameId);

  if (!towerGame) {
    throw Boom.notFound('tower game not found');
  }

  if (floorNumber > towerGame.height + 1) {
    // can either add a new floor or add a floor in the middle
    throw Boom.badRequest(`max floor number allowed is ${towerGame.height + 1}`);
  }

  return await addFloor(floorNumber, towerGameId);
};

export const removeTowerFloor = async (floorId: number, towerGameId: number) => {
  const towerFloor = await findTowerFloor(floorId, towerGameId);

  if (!towerFloor) {
    throw Boom.notFound('tower floor not found');
  }

  return await removeFloor(towerFloor.number, towerGameId);
};
