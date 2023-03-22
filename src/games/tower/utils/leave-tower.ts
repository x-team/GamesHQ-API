import type { Transaction } from 'sequelize';

import type { TowerRaider, TowerRound } from '../../../models';
import { findTowerFloorById } from '../../../models/TowerFloor';
import { updateTowerAsCompleted } from '../../../models/TowerStatistics';
import { Ability } from '../../classes/GameAbilities';
import { ZERO } from '../../consts/global';

export async function leaveTower(
  { raider, round }: { raider: TowerRaider; round?: TowerRound | null },
  transaction: Transaction
) {
  if (round) {
    const towerFloor = (await findTowerFloorById(
      round._floorBattlefield?._towerFloorId!,
      true,
      transaction
    ))!;
    const lastFloorVisited = towerFloor.number;
    await updateTowerAsCompleted(
      towerFloor._towerGameId,
      raider._user?.id ?? ZERO,
      lastFloorVisited,
      raider._perks ?? [],
      transaction
    );

    await round.endRound(transaction);
  }

  await raider.resetFullInventory(transaction);
  raider._towerFloorBattlefieldId = null;
  raider.abilitiesJSON = Ability.defaultProps();
  await raider.save({ transaction });
}
