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
