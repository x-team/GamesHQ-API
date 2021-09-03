import type { Transaction } from 'sequelize';
import {
  Item,
  TowerFloorBattlefieldEnemy,
  TowerItemInventory,
  TowerRaider,
} from '../../../../../../models';
import { ZERO } from '../../../../../consts/global';
import { INITIATIVE_WEAPON_DAMAGE_THRESHOLD } from '../../../../consts';

const sixtyPercentOfDamage = (majorDamageRate: number, minorDamageRate: number) =>
  Math.ceil(INITIATIVE_WEAPON_DAMAGE_THRESHOLD * (majorDamageRate - minorDamageRate)) +
  minorDamageRate;

interface AttackOperation {
  attacker: TowerRaider | TowerFloorBattlefieldEnemy;
  isRaiderAttacking: boolean;
  weapon?: Item & { TowerItemInventory: TowerItemInventory };
  damageDelt: number;
  target: TowerRaider | TowerFloorBattlefieldEnemy;
}

export async function evaluateInitiative(
  { attacker, isRaiderAttacking, weapon, damageDelt, target }: AttackOperation,
  transaction: Transaction
) {
  let mutableDamageThreshold = 0;
  if (isRaiderAttacking) {
    const raider = attacker as TowerRaider;
    const itemWeapon = weapon!;
    mutableDamageThreshold = sixtyPercentOfDamage(
      itemWeapon._weapon?.majorDamageRate ?? ZERO,
      itemWeapon._weapon?.minorDamageRate ?? ZERO
    );
    if (damageDelt >= mutableDamageThreshold) {
      await raider.addOrSubtractInitiative('add', transaction);
      await target.addOrSubtractInitiative('sub', transaction);
    }
  } else {
    const enemy = attacker as TowerFloorBattlefieldEnemy;
    mutableDamageThreshold = sixtyPercentOfDamage(
      enemy._towerFloorEnemy?._enemy?.majorDamageRate!,
      enemy._towerFloorEnemy?._enemy?.minorDamageRate!
    );
    if (damageDelt >= mutableDamageThreshold) {
      await enemy.addOrSubtractInitiative('add', transaction);
      await target.addOrSubtractInitiative('sub', transaction);
    }
  }
}
