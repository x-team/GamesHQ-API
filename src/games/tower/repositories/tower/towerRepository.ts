import { startTowerGame } from '../../../../models/TowerGame';
import { findAdmin } from '../../../../models/User';
import { withTowerTransaction } from '../../utils';
import { endGame, openOrCloseTowerGates } from './actions/admin/create-or-finish-game';

export interface ICreateTowerGameData {
  name: string;
  height: number;
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
