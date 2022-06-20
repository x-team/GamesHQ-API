import type { TowerFloorBattlefieldEnemy, TowerRaider } from '../../../../../../models';
import { perkImpactCalculator } from '../../../../../../models/Perk';
import type { AbilityProperty } from '../../../../../classes/GameAbilities';
import type { DamageDealtSpecs } from '../../../../../consts/global';
import { ZERO } from '../../../../../consts/global';
import { damageIncrease, damageReduction, nonLessThanZeroParam } from '../../../../../utils';
import { roundTwoDecimalPlaces } from '../../../../../utils/math';

export const hasAttackAbilities = ({ flatAttackBonus, attackRate }: AbilityProperty) => {
  return flatAttackBonus !== ZERO || attackRate !== ZERO;
};

export const hasDefenseAbilities = ({ flatDefenseBonus, defenseRate }: AbilityProperty) => {
  return flatDefenseBonus !== ZERO || defenseRate !== ZERO;
};

export function damageSpecsGenerator(
  raider: TowerRaider,
  enemy: TowerFloorBattlefieldEnemy | undefined,
  originalDamage: number,
  raiderIsTarget = false,
  ignoresArmor = false
): DamageDealtSpecs {
  const damageDetails: DamageDealtSpecs = {
    originalDamage,
    wasOriginatedByPerk: false,
  };
  const raiderArmor = ignoresArmor ? undefined : raider.itemsAvailable(raider._armors)[ZERO];
  let mutableReductionRate = 0;
  let mutableNewDamageDealt: number | null = null;
  const generatedAbilities = perkImpactCalculator({ raider }).toJSON();
  if (!raiderIsTarget && enemy) {
    if (hasAttackAbilities(generatedAbilities)) {
      damageDetails.wasOriginatedByPerk = true;
      mutableNewDamageDealt = nonLessThanZeroParam(
        originalDamage + generatedAbilities.flatAttackBonus
      );
      mutableNewDamageDealt += damageIncrease(mutableNewDamageDealt, generatedAbilities.attackRate);
    }
    if (enemy?.abilitiesJSON.defenseRate > 0 && !ignoresArmor) {
      damageDetails.wasOriginatedByPerk = true;
      const dealtDamageReduction = damageReduction(
        mutableNewDamageDealt ?? originalDamage,
        roundTwoDecimalPlaces(enemy?.abilitiesJSON.defenseRate)
      );
      mutableNewDamageDealt = mutableNewDamageDealt
        ? mutableNewDamageDealt - dealtDamageReduction
        : originalDamage - dealtDamageReduction;
    }
  } else {
    if (hasDefenseAbilities(generatedAbilities)) {
      damageDetails.wasOriginatedByPerk = true;
      mutableNewDamageDealt = nonLessThanZeroParam(
        damageDetails.originalDamage - generatedAbilities.flatDefenseBonus
      );
      mutableReductionRate = generatedAbilities.defenseRate;
    }
    if (raiderArmor && !ignoresArmor) {
      mutableReductionRate += raiderArmor._armor?.reductionRate ?? ZERO;
      damageDetails.armorSpecs = {
        emoji: raiderArmor.emoji,
        rarity: raiderArmor._itemRarityId,
        damageDealt: damageDetails.originalDamage,
      };
    }
    const dealtDamageReduction = damageReduction(
      mutableNewDamageDealt ?? damageDetails.originalDamage,
      roundTwoDecimalPlaces(mutableReductionRate)
    );

    mutableNewDamageDealt =
      (mutableNewDamageDealt ?? damageDetails.originalDamage) - dealtDamageReduction;
  }

  if (mutableNewDamageDealt !== null && (raiderArmor || damageDetails.wasOriginatedByPerk)) {
    damageDetails.newDamage = mutableNewDamageDealt;
  }
  return damageDetails;
}
