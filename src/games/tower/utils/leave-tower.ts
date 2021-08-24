import type { Transaction } from 'sequelize';
import { TowerRaider, TowerRound } from '../../../models';
import { Ability } from '../../classes/GameAbilities';

export async function leaveTower(
  { raider, round }: { raider: TowerRaider; round?: TowerRound | null },
  transaction: Transaction
) {
  if (round) {
    await round.endRound(transaction);
  }
  await raider.resetFullInventory(transaction);
  raider._towerFloorBattlefieldId = null;
  raider.abilitiesJSON = Ability.defaultProps();
  await raider.save({ transaction });
}
