import type { QueryInterface, Sequelize, Transaction } from 'sequelize';
import { Op, QueryTypes } from 'sequelize';

interface SequelizeContext {
  context: {
    queryInterface: QueryInterface;
    Sequelize: Sequelize;
  };
}

enum RARITY {
  COMMON = 'Common',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
}

enum STARTER_PERKS {
  // VANGUARD
  HYPER = 'hyper', // Common
  LOCK_ON = 'lockon', // Rare
  FRONTLINER = 'frontliner', // Epic
  SHARPSHOOTER = 'sharpshooter', // Legendary

  // DEFENDER
  UNSTOPPABLE = 'unstoppable', // Common
  ENDURANCE = 'endurance', // Rare
  VIGOR = 'vigor', // Epic
  HERBOLOGY = 'herbology', // Legendary

  // AVENGER
  FOCUSED_VIEW = 'focusedview', // Common
  CHARGE = 'charge', // Rare
  ADRENALINE = 'adrenaline', // Epic
  NINJITSU = 'ninjitsu', // Legendary
}

enum STARTER_PERKS_NAMES {
  // VANGUARD
  HYPER = 'Hyper', // Common
  LOCK_ON = 'Lock On', // Rare
  FRONTLINER = 'Frontliner', // Epic
  SHARPSHOOTER = 'Sharpshooter', // Legendary

  // DEFENDER
  UNSTOPPABLE = 'Unstoppable', // Common
  ENDURANCE = 'Endurance', // Rare
  VIGOR = 'Vigor', // Epic
  HERBOLOGY = 'Herbology', // Legendary

  // AVENGER
  FOCUSED_VIEW = 'Focused View', // Common
  CHARGE = 'Charge', // Rare
  ADRENALINE = 'Adrenaline', // Epic
  NINJITSU = 'Ninjitsu', // Legendary
}

enum PERK_ARCHETYPE {
  VANGUARD = 'vanguard',
  DEFENDER = 'defender',
  AVENGER = 'avenger',
}

const defaultAbilitiesValues = {
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
  initiative: 0,
  initiativeBonus: 0,
  flatHealingBoost: 0,
};
const firstOrganizationName = 'x-team';

interface LightEntity {
  id: number;
}

function queryByProp(
  table: string,
  prop: string,
  value: string,
  queryInterface: QueryInterface,
  transaction: Transaction
): Promise<LightEntity[]> {
  const queryString = `SELECT id, "${prop}" FROM "${table}" WHERE "${prop}" = '${value}';`;
  return queryInterface.sequelize.query(queryString, {
    transaction,
    type: QueryTypes.SELECT,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDelete(enumerable: any): { name: { [Op.in]: string[] } } {
  return { name: { [Op.in]: Object.values<string>(enumerable).map((t) => t) } };
}

module.exports = {
  async up({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      const [firstOrganization] = (await queryByProp(
        'Organization',
        'name',
        firstOrganizationName,
        queryInterface,
        transaction
      )) as LightEntity[];

      await queryInterface.bulkInsert(
        'Perk',
        [
          ////////////////////////////////////// VANGUARD //////////////////////////////////////////////////
          {
            id: STARTER_PERKS.HYPER,
            name: STARTER_PERKS_NAMES.HYPER,
            archetype: PERK_ARCHETYPE.VANGUARD,
            emoji: ':twr-hyper:',
            description:
              'Downloads a code snippet that enhances neuronal sensibility improving your reaction time based on your attacks (+2% Bonus initiative on critical attacks)',
            _itemRarityId: RARITY.COMMON,
            _organizationId: firstOrganization.id,
            abilitiesJSON: JSON.stringify({
              ...defaultAbilitiesValues,
              initiativeBonus: 0.02,
            }),
          },
          {
            id: STARTER_PERKS.LOCK_ON,
            name: STARTER_PERKS_NAMES.LOCK_ON,
            archetype: PERK_ARCHETYPE.VANGUARD,
            emoji: ':twr-lockon:',
            description:
              'Downloads a UI component that helps you adjust your attacks to enemies intended motion (+10% Accuracy, +2 Attack)',
            _itemRarityId: RARITY.RARE,
            _organizationId: firstOrganization.id,
            abilitiesJSON: JSON.stringify({
              ...defaultAbilitiesValues,
              accuracy: 0.1,
              flatAttackBonus: 2,
            }),
          },
          {
            id: STARTER_PERKS.FRONTLINER,
            name: STARTER_PERKS_NAMES.FRONTLINER,
            archetype: PERK_ARCHETYPE.VANGUARD,
            emoji: ':twr-frontliner:',
            description:
              'Downloads a protocol to enhance your performance in risk-taking situations (+6 Attack, -2 Defense)',
            _itemRarityId: RARITY.EPIC,
            _organizationId: firstOrganization.id,
            abilitiesJSON: JSON.stringify({
              ...defaultAbilitiesValues,
              flatAttackBonus: 6,
              flatDefenseBonus: -2,
            }),
          },
          {
            id: STARTER_PERKS.SHARPSHOOTER,
            name: STARTER_PERKS_NAMES.SHARPSHOOTER,
            archetype: PERK_ARCHETYPE.VANGUARD,
            emoji: ':twr-sharpshooter:',
            description: `Downloads a UI component that shows in high detail the target's vulnerable spots (+5% Attack Power, +20% Stun against enemies)`,
            _itemRarityId: RARITY.LEGENDARY,
            _organizationId: firstOrganization.id,
            abilitiesJSON: JSON.stringify({
              ...defaultAbilitiesValues,
              attackRate: 0.05,
              stunOthersRate: 0.2,
            }),
          },

          ////////////////////////////////////// DEFENDER //////////////////////////////////////////////////
          {
            id: STARTER_PERKS.UNSTOPPABLE,
            name: STARTER_PERKS_NAMES.UNSTOPPABLE,
            archetype: PERK_ARCHETYPE.DEFENDER,
            emoji: ':twr-unstoppable:',
            description:
              'Downloads a code snippet that enhances your fight or flight responses (+20% Stun resistance, +20% Find Healthkits)',
            _itemRarityId: RARITY.COMMON,
            _organizationId: firstOrganization.id,
            abilitiesJSON: JSON.stringify({
              ...defaultAbilitiesValues,
              stunBlockRate: 0.2,
              healthkitSearchRate: 0.2,
            }),
          },
          {
            id: STARTER_PERKS.ENDURANCE,
            name: STARTER_PERKS_NAMES.ENDURANCE,
            archetype: PERK_ARCHETYPE.DEFENDER,
            emoji: ':twr-endurance:',
            description:
              'Downloads a basic armor upgrade with a radar showing other nearby armors (+2 Defense, +20% Find Armor)',
            _itemRarityId: RARITY.RARE,
            _organizationId: firstOrganization.id,
            abilitiesJSON: JSON.stringify({
              ...defaultAbilitiesValues,
              armorSearchRate: 0.2,
              flatDefenseBonus: 2,
            }),
          },
          {
            id: STARTER_PERKS.VIGOR,
            name: STARTER_PERKS_NAMES.VIGOR,
            archetype: PERK_ARCHETYPE.DEFENDER,
            emoji: ':twr-vigor:',
            description:
              'Downloads a protocol to better capitalize on advantageous physical condition (+3-6 Attack when *HP > 80*)',
            _itemRarityId: RARITY.EPIC,
            _organizationId: firstOrganization.id,
            abilitiesJSON: JSON.stringify({
              ...defaultAbilitiesValues,
              attackRate: 0.1,
              flatAttackBonus: 3,
            }),
          },
          {
            id: STARTER_PERKS.HERBOLOGY,
            name: STARTER_PERKS_NAMES.HERBOLOGY,
            archetype: PERK_ARCHETYPE.DEFENDER,
            emoji: ':twr-herbology:',
            description:
              'Downloads a UI component focused on identifying rare elements (+5% Find Epic/Legendary Weapons, +10HP healthkit healing)',
            _itemRarityId: RARITY.LEGENDARY,
            _organizationId: firstOrganization.id,
            abilitiesJSON: JSON.stringify({
              ...defaultAbilitiesValues,
              rarityRateBonus: 0.1,
              flatHealingBoost: 10,
            }),
          },

          ////////////////////////////////////// AVENGER //////////////////////////////////////////////////
          {
            id: STARTER_PERKS.FOCUSED_VIEW,
            name: STARTER_PERKS_NAMES.FOCUSED_VIEW,
            archetype: PERK_ARCHETYPE.AVENGER,
            emoji: ':twr-focusedview:',
            description: `Downloads a UI component that helps you find weapons and target's weak points (+2 Attack, +20% Find Weapon)`,
            _itemRarityId: RARITY.COMMON,
            _organizationId: firstOrganization.id,
            abilitiesJSON: JSON.stringify({
              ...defaultAbilitiesValues,
              flatAttackBonus: 2,
              weaponSearchRate: 0.2,
            }),
          },
          {
            id: STARTER_PERKS.CHARGE,
            name: STARTER_PERKS_NAMES.CHARGE,
            archetype: PERK_ARCHETYPE.AVENGER,
            emoji: ':twr-charge:',
            description:
              'Downloads a protocol for a better conversion of momentum into attacking motions (+6 Attack when *you are last to attack*)',
            _itemRarityId: RARITY.RARE,
            _organizationId: firstOrganization.id,
            abilitiesJSON: JSON.stringify({
              ...defaultAbilitiesValues,
              flatAttackBonus: 6,
            }),
          },
          {
            id: STARTER_PERKS.ADRENALINE,
            name: STARTER_PERKS_NAMES.ADRENALINE,
            archetype: PERK_ARCHETYPE.AVENGER,
            emoji: ':twr-adrenaline:',
            description:
              'Downloads a protocol to convert adrenaline into enhanced muscle control (+3-6 Attack when *HP < 60*)',
            _itemRarityId: RARITY.EPIC,
            _organizationId: firstOrganization.id,
            abilitiesJSON: JSON.stringify({
              ...defaultAbilitiesValues,
              attackRate: 0.1,
              flatAttackBonus: 3,
            }),
          },
          {
            id: STARTER_PERKS.NINJITSU,
            name: STARTER_PERKS_NAMES.NINJITSU,
            archetype: PERK_ARCHETYPE.AVENGER,
            emoji: ':twr-ninjitsu:',
            description:
              'Downloads a protocol that increases the speed of muscle response to brain commands (+2 Attack, +5% Attack Power,  +20% Evade)',
            _itemRarityId: RARITY.LEGENDARY,
            _organizationId: firstOrganization.id,
            abilitiesJSON: JSON.stringify({
              ...defaultAbilitiesValues,
              evadeRate: 0.2,
              attackRate: 0.05,
              flatAttackBonus: 2,
            }),
          },
        ],
        { transaction }
      );
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      ///////////////////////////////////
      await queryInterface.bulkDelete('Perk', toDelete(STARTER_PERKS), { transaction });
    });
  },
};
