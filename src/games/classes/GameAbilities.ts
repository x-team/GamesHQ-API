import { roundTwoDecimalPlaces } from "../utils/math";

export type AbilityPropertyKeys = keyof AbilityProperty;
export interface AbilityProperty {
  rarityRateBonus: number;
  searchRate: number;
  healthkitSearchRate: number;
  armorSearchRate: number;
  weaponSearchRate: number;
  accuracy: number;
  flatAttackBonus: number;
  flatDefenseBonus: number;
  attackRate: number;
  stunBlockRate: number;
  stunOthersRate: number;
  defenseRate: number;
  evadeRate: number;
  initiative: number;
  initiativeBonus: number;
  flatHealingBoost: number;
}

export class Ability {
  static defaultProps(): AbilityProperty {
    return {
      rarityRateBonus: 0,
      searchRate: 0,
      healthkitSearchRate: 0,
      armorSearchRate: 0,
      weaponSearchRate: 0,
      accuracy: 0,
      flatAttackBonus: 0,
      flatDefenseBonus: 0,
      attackRate: 0,
      defenseRate: 0,
      stunBlockRate: 0,
      stunOthersRate: 0,
      evadeRate: 0,
      initiative: 1,
      initiativeBonus: 0,
      flatHealingBoost: 0,
    };
  }

  static isFlatValue(abilityKey: AbilityPropertyKeys): boolean {
    const stringAbilityKey = abilityKey as string;
    return (
      stringAbilityKey === "flatAttackBonus" ||
      stringAbilityKey === "flatDefenseBonus" ||
      stringAbilityKey === "flatHealingBoost"
    );
  }

  private properties: AbilityProperty;

  constructor(assignProps: Partial<AbilityProperty> = {}) {
    (Object.keys(assignProps) as Partial<AbilityPropertyKeys>[]).forEach(
      (key: AbilityPropertyKeys) => {
        if (assignProps[key]) {
          assignProps[key] = roundTwoDecimalPlaces(assignProps[key]!);
        }
      }
    );
    this.properties = { ...Ability.defaultProps(), ...assignProps };
  }

  calculateAbilities(
    abilities: AbilityProperty,
    flatValuesMultiplier?: number
  ) {
    // Multipliers will only affect flat values
    const newAbilitiesJSON = this.toJSON();
    (Object.keys(newAbilitiesJSON) as AbilityPropertyKeys[]).forEach(
      (key: AbilityPropertyKeys) => {
        newAbilitiesJSON[key] +=
          flatValuesMultiplier && Ability.isFlatValue(key)
            ? abilities[key] * flatValuesMultiplier
            : abilities[key];
      }
    );
    this.properties = newAbilitiesJSON;
  }

  toJSON(): AbilityProperty {
    return this.properties;
  }

  get<T extends keyof AbilityProperty>(name: T): AbilityProperty[T] {
    const val = this.properties[name];
    if (!val) {
      throw new Error(`Cannot find Ability's property: ${name}`);
    }
    return val;
  }

  set<T extends keyof AbilityProperty>(
    name: T,
    value: AbilityProperty[T]
  ): void {
    if (!this.properties[name] === undefined) {
      throw new Error(`Cannot find Ability's property: ${name}`);
    }
    this.properties[name] = value;
  }
}
