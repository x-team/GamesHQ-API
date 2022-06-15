import type { Association, Transaction } from 'sequelize';
import { Op } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AllowNull,
} from 'sequelize-typescript';
import { Ability, AbilityProperty } from '../games/classes/GameAbilities';
import {
  ITEM_RARITY,
  PerkMultiplierKey,
  PERK_CONDITIONS,
  PERK_MULTIPLIERS,
} from '../games/consts/global';
import { PERK, PERK_ARCHETYPE } from '../games/consts/global';
import { ItemRarity, Organization, TowerRaider } from '.';

interface PerkAttributes {
  id: PERK;
  archetype: string;
  name: string;
  emoji: string;
  description: string;
  abilitiesJSON: AbilityProperty;
  _itemRarityId: ITEM_RARITY;
}

interface PerkCreationAttributes {
  archetype: string;
  name: string;
  emoji: string;
  description: string;
  abilitiesJSON: AbilityProperty;
  _itemRarityId: ITEM_RARITY;
}

@Table({
  indexes: [
    {
      unique: true,
      fields: ['name'],
    },
  ],
})
export class Perk extends Model<PerkAttributes, PerkCreationAttributes> implements PerkAttributes {
  @PrimaryKey
  @Column(DataType.TEXT)
  declare id: PERK;

  @AllowNull(false)
  @Column(DataType.TEXT)
  archetype!: PERK_ARCHETYPE;

  @Column(DataType.TEXT)
  name!: string;

  @Column(DataType.TEXT)
  emoji!: string;

  @Column(DataType.TEXT)
  description!: string;

  @Column(DataType.JSONB)
  abilitiesJSON!: AbilityProperty;

  @ForeignKey(() => ItemRarity)
  @Column(DataType.TEXT)
  _itemRarityId!: ITEM_RARITY;

  @BelongsTo(() => ItemRarity, '_itemRarityId')
  _rarity?: ItemRarity;

  @ForeignKey(() => Organization)
  @Column(DataType.INTEGER)
  _organizationId!: string;

  @BelongsTo(() => Organization, {
    foreignKey: '_organizationId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    as: '_organization',
  })
  _organization?: Organization;

  static associations: {
    _rarity: Association<Perk, ItemRarity>;
    _organization: Association<Perk, Organization>;
  };
}

export function findPerkById(perkId: string, transaction?: Transaction) {
  return Perk.findByPk(perkId, { transaction });
}

export function findPerksByRarities(rarities: ITEM_RARITY[], transaction?: Transaction) {
  return Perk.findAll({
    where: {
      _itemRarityId: {
        [Op.in]: rarities,
      },
    },
    transaction,
  });
}

export function findAllPerks(transaction?: Transaction) {
  return Perk.findAll({ transaction });
}

interface PerkCalculator {
  raider: TowerRaider;
  raiderHuntPosition?: number;
  huntActionsCount?: number;
}

enum PERK_CONDITION_TIERS {
  FIRST_TIER = 1,
  SECOND_TIER = 2, // basic
  THIRD_TIER = 3,
}

function isConditionalPerk(perk: PERK): boolean {
  return PERK.ADRENALINE === perk || PERK.CHARGE === perk || PERK.VIGOR === perk;
}

function evalPerkCondition(
  { raider, raiderHuntPosition, huntActionsCount }: PerkCalculator,
  perk: PERK
): PERK_CONDITION_TIERS | undefined {
  const ZERO = 0;
  const ONE = 0;
  /*
    PERK CONDITION: Charge - Attacking last
    PERK CONDITION: Adrenaline - LOW HP
    PERK CONDITION: Vigor - HIGH HP
  */
  const perkName = perk.toString().toUpperCase();
  switch (perkName) {
    case 'VIGOR':
      if (raider.health >= PERK_CONDITIONS.VIGOR_THIRD_HP_THRESHOLD) {
        return PERK_CONDITION_TIERS.THIRD_TIER;
      }
      if (raider.health >= PERK_CONDITIONS.VIGOR_SECOND_HP_THRESHOLD) {
        return PERK_CONDITION_TIERS.SECOND_TIER;
      }
      if (raider.health >= PERK_CONDITIONS.VIGOR_FIRST_HP_THRESHOLD) {
        return PERK_CONDITION_TIERS.FIRST_TIER;
      }
      break;
    case 'ADRENALINE':
      if (raider.health <= PERK_CONDITIONS.ADRENALINE_THIRD_HP_THRESHOLD) {
        return PERK_CONDITION_TIERS.THIRD_TIER;
      }
      if (raider.health <= PERK_CONDITIONS.ADRENALINE_SECOND_HP_THRESHOLD) {
        return PERK_CONDITION_TIERS.SECOND_TIER;
      }
      if (raider.health <= PERK_CONDITIONS.ADRENALINE_FIRST_HP_THRESHOLD) {
        return PERK_CONDITION_TIERS.FIRST_TIER;
      }
      break;
    case 'CHARGE':
      if (huntActionsCount! - (raiderHuntPosition! + ONE) === ZERO) {
        return PERK_CONDITION_TIERS.SECOND_TIER;
      }
      break;
    default:
      return PERK_CONDITION_TIERS.SECOND_TIER;
  }
  return undefined; // Sometimes the conditions are not meet at all
}

export function perkImpactCalculator({
  raider,
  raiderHuntPosition,
  huntActionsCount,
}: PerkCalculator): Ability {
  const calculatedAbilitiesJSON = new Ability(raider.abilitiesJSON || Ability.defaultProps());
  raider._perks?.forEach((perk) => {
    const ZERO = 0;
    const perkAmount = perk.PerkInventory.quantity!;
    for (let mutableIndex = 1; mutableIndex <= perkAmount; mutableIndex++) {
      if (isConditionalPerk(perk.id)) {
        const perkConditionTier = evalPerkCondition(
          {
            raider,
            raiderHuntPosition,
            huntActionsCount,
          },
          perk.id
        );
        switch (perkConditionTier) {
          case PERK_CONDITION_TIERS.FIRST_TIER:
            // ONLY FLAT VALUES
            const perklineOnlyFlatValues = new Ability({
              initiative: ZERO,
              flatAttackBonus: perk.abilitiesJSON.flatAttackBonus,
              flatDefenseBonus: perk.abilitiesJSON.flatDefenseBonus,
              flatHealingBoost: perk.abilitiesJSON.flatHealingBoost,
            });
            calculatedAbilitiesJSON.calculateAbilities(perklineOnlyFlatValues.toJSON());
            break;
          case PERK_CONDITION_TIERS.SECOND_TIER:
            // THE WHOLE PERK (Flat and Percentages)
            calculatedAbilitiesJSON.calculateAbilities(perk.abilitiesJSON);
            break;
          case PERK_CONDITION_TIERS.THIRD_TIER:
            // THE WHOLE PERK (Flat and Percentages) and the multiplier
            const perkName = perk.toString().toUpperCase();
            calculatedAbilitiesJSON.calculateAbilities(
              perk.abilitiesJSON,
              PERK_MULTIPLIERS[perkName as PerkMultiplierKey]
            );
            break;
        }
      } else {
        calculatedAbilitiesJSON.calculateAbilities(perk.abilitiesJSON);
      }
    }
  });
  return calculatedAbilitiesJSON;
}
