import { withTransaction } from '../../../../db';
import { startTowerGame, findTowerGameById } from '../../../../models/TowerGame';
import { findAdmin } from '../../../../models/User';
import { withTowerTransaction } from '../../utils';

import { endGame, openOrCloseTowerGates } from './actions/admin/create-or-finish-game';

export interface ICreateTowerGameData {
  name: string;
  height: number;
}

export interface IUpdateTowerGameData {
  name?: string;
  isOpen?: false;
  lunaPrize?: number;
  coinPrize?: number;
  towerGameId: number;
}

export const createTowerGame = async (data: ICreateTowerGameData) => {
  return withTowerTransaction(async (transaction) => {
    await startTowerGame(
      {
        name: data.name,
        height: data.height,
        isOpen: false,
        lunaPrize: 0,
        coinPrize: 0,
        _createdById: 1,
      },
      transaction
    );
  });
};

export const updateTowerGame = async (data: IUpdateTowerGameData) => {
  return withTransaction(async (transaction) => {
    const towerGame = await findTowerGameById(data.towerGameId);

    if (!towerGame) {
      return;
    }

    await towerGame._game?.updateGame(
      {
        name: data.name || towerGame._game.name,
      },
      transaction
    );

    return towerGame.updateTowerGame(
      {
        ...data,
      },
      transaction
    );
  });
};

export const endCurrentTowerGame = async () => {
  const adminUser = await findAdmin();
  if (!adminUser) {
    return;
  }
  return endGame(adminUser);
};

export const openOrCloseTower = async (open: boolean) => {
  const adminUser = await findAdmin();
  if (!adminUser) {
    return;
  }
  return openOrCloseTowerGates(adminUser, open);
};
