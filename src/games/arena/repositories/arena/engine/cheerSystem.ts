import type { Transaction } from 'sequelize';

import type { ArenaPlayer } from '../../../../../models';
import { Ability } from '../../../../classes/GameAbilities';
import { ARENA_PERK } from '../../../consts';

const CHEER_LV_ONE = 6;
const CHEER_LV_TWO = 13;
const CHEER_LV_THREE = 21;
const CHEER_LV_FOUR = 30;
const CHEER_LV_FIVE = 40;

export function hasArenaPerk(perk: ARENA_PERK, cheersAmount: number): boolean {
  let mutablePerkThreshold: number | undefined;
  switch (perk) {
    case ARENA_PERK.ATTACK_PERK:
      mutablePerkThreshold = CHEER_LV_ONE;
      break;
    case ARENA_PERK.DEFENSE_PERK:
      mutablePerkThreshold = CHEER_LV_TWO;
      break;
    case ARENA_PERK.STUN_RESISTANCE_PERK:
      mutablePerkThreshold = CHEER_LV_THREE;
      break;
    case ARENA_PERK.ACCURACY_PERK:
      mutablePerkThreshold = CHEER_LV_FOUR;
      break;
    case ARENA_PERK.ADRENALINE_PERK:
      mutablePerkThreshold = CHEER_LV_FIVE;
      break;
  }
  return mutablePerkThreshold !== undefined && cheersAmount >= mutablePerkThreshold;
}

export async function cheerAwards(
  player: ArenaPlayer,
  cheersAmount: number,
  transaction: Transaction
): Promise<ARENA_PERK | undefined> {
  let mutableAbility: Ability;
  let mutablePerk: ARENA_PERK | undefined;
  switch (cheersAmount) {
    case CHEER_LV_ONE:
      mutableAbility = new Ability({
        initiative: 0,
        weaponSearchRate: 0.2,
        flatAttackBonus: 10,
      });
      mutablePerk = ARENA_PERK.ATTACK_PERK;
      break;
    case CHEER_LV_TWO:
      mutableAbility = new Ability({
        initiative: 0,
        armorSearchRate: 0.3,
        flatDefenseBonus: 10,
      });
      mutablePerk = ARENA_PERK.DEFENSE_PERK;
      break;
    case CHEER_LV_THREE:
      mutableAbility = new Ability({
        initiative: 0,
        stunBlockRate: 0.3,
        healthkitSearchRate: 0.3,
      });
      mutablePerk = ARENA_PERK.STUN_RESISTANCE_PERK;
      break;
    case CHEER_LV_FOUR:
      mutableAbility = new Ability({
        initiative: 0,
        accuracy: 0.2,
      });
      mutablePerk = ARENA_PERK.ACCURACY_PERK;
      break;
    case CHEER_LV_FIVE:
      mutableAbility = new Ability({
        initiative: 0,
        flatAttackBonus: 2,
        attackRate: 0.81,
      });
      mutablePerk = ARENA_PERK.ADRENALINE_PERK;
      break;
    default:
      mutableAbility = new Ability({
        initiative: 0,
      });
      break;
  }
  await player.addAbilities(mutableAbility, transaction);
  return mutablePerk;
}
