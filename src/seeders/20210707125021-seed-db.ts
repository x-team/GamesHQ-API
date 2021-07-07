import type { QueryInterface, Sequelize } from 'sequelize';
import { Op } from 'sequelize';

enum AVAILABLE_ACTION {
  // SHARED
  SEARCH_WEAPONS = 'searchWeapons',
  SEARCH_HEALTH = 'searchHealth',
  SEARCH_ARMOR = 'searchArmor',
  HUNT = 'hunt',
  REVIVE = 'revive',
  HIDE = 'hide',
  // ARENA
  CHEER = 'cheer',
  STAY_ON_LOCATION = 'idleStayOnLocation',
  // TOWER
  LUCK_ELIXIR = 'luckElixir',
  CHARGE = 'charge',
}

enum RARITY {
  COMMON = 'Common',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
}

enum TRAIT {
  ARMORBREAK = 'armorbreak',
  BLAST_2 = 'blast_2',
  BLAST_3 = 'blast_3',
  BLAST_ALL = 'blast_all',
  DETECT = 'detect',
  DUALSTRIKE = 'dualstrike',
  INITIAL = 'initial',
  PIERCING = 'piercing',
  PRECISION = 'precision',
  STEALTH = 'stealth',
  UNSEARCHABLE = 'unsearchable',
}

enum TRAIT_NAME {
  ARMORBREAK = 'Armorbreak',
  BLAST_2 = 'Blast 2',
  BLAST_3 = 'Blast 3',
  BLAST_ALL = 'Blast All',
  DETECT = 'Detect',
  DUALSTRIKE = 'Dual Strike',
  INITIAL = 'Initial',
  PIERCING = 'Piercing',
  PRECISION = 'Precision',
  STEALTH = 'Stealth',
  UNSEARCHABLE = 'Unsearchable',
}

enum USER_ROLE_LEVEL {
  USER = 1,
  COMMUNITY_TEAM,
  ADMIN,
  SUPER_ADMIN,
}

enum USER_ROLE_NAME {
  USER = 'user',
  COMMUNITY_TEAM = 'community team',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super admin',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enumToIds(enumerable: any): Array<{ id: string }> {
  return Object.values<string>(enumerable).map((t) => ({ id: t }));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDelete(enumerable: any): { id: { [Op.in]: string[] } } {
  return { id: { [Op.in]: Object.values<string>(enumerable).map((t) => t) } };
}

interface SequelizeContext {
  context: {
    queryInterface: QueryInterface;
    Sequelize: Sequelize;
  };
}

module.exports = {
  async up({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkInsert('AvailableAction', enumToIds(AVAILABLE_ACTION), {
        transaction,
      });
      await queryInterface.bulkInsert('ItemRarity', enumToIds(RARITY), { transaction });
      await queryInterface.bulkInsert(
        'Trait',
        [
          {
            id: TRAIT.ARMORBREAK,
            displayName: TRAIT_NAME.ARMORBREAK,
            shortDescription: 'Destroys an armor (if any) after hitting.',
          },
          {
            id: TRAIT.BLAST_2,
            displayName: TRAIT_NAME.BLAST_2,
            shortDescription: 'Area damage. Targets 2 players (One chosen, one random)',
          },
          {
            id: TRAIT.BLAST_3,
            displayName: TRAIT_NAME.BLAST_3,
            shortDescription: 'Area damage. Targets 3 players (One chosen, two random)',
          },
          {
            id: TRAIT.BLAST_ALL,
            displayName: TRAIT_NAME.BLAST_ALL,
            shortDescription: 'Area damage. Targets all players.',
          },
          {
            id: TRAIT.DETECT,
            displayName: TRAIT_NAME.DETECT,
            shortDescription: 'Targets any player or enemy even if hidden',
          },
          {
            id: TRAIT.DUALSTRIKE,
            displayName: TRAIT_NAME.DUALSTRIKE,
            shortDescription: 'Targets a player for two possible hits',
          },
          {
            id: TRAIT.INITIAL,
            displayName: TRAIT_NAME.INITIAL,
            shortDescription: 'A player will receive this item at the start of a game',
          },
          {
            id: TRAIT.PIERCING,
            displayName: TRAIT_NAME.PIERCING,
            shortDescription: 'Ability to hit thru armors without destroying them.',
          },
          {
            id: TRAIT.PRECISION,
            displayName: TRAIT_NAME.PRECISION,
            shortDescription: `100% accurate hit. The Player won't fail.`,
          },
          {
            id: TRAIT.STEALTH,
            displayName: TRAIT_NAME.STEALTH,
            shortDescription: 'The player could attack while hidden.',
          },
          {
            id: TRAIT.UNSEARCHABLE,
            displayName: TRAIT_NAME.UNSEARCHABLE,
            shortDescription: 'The Item is not available by searching option',
          },
        ],
        { transaction }
      );
      await queryInterface.bulkInsert(
        'UserRole',
        [
          {
            id: USER_ROLE_LEVEL.USER,
            name: USER_ROLE_NAME.USER,
          },
          {
            id: USER_ROLE_LEVEL.COMMUNITY_TEAM,
            name: USER_ROLE_NAME.COMMUNITY_TEAM,
          },
          {
            id: USER_ROLE_LEVEL.ADMIN,
            name: USER_ROLE_NAME.ADMIN,
          },
          {
            id: USER_ROLE_LEVEL.SUPER_ADMIN,
            name: USER_ROLE_NAME.SUPER_ADMIN,
          },
        ],
        { transaction }
      );
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete('AvailableAction', toDelete(AVAILABLE_ACTION), {
        transaction,
      });
      await queryInterface.bulkDelete('ItemRarity', toDelete(RARITY), { transaction });
      await queryInterface.bulkDelete('Trait', toDelete(TRAIT), { transaction });
      await queryInterface.bulkDelete(
        'UserRole',
        {
          where: {
            id: {
              [Op.in]: Object.values(USER_ROLE_LEVEL).map((t) => t),
            },
          },
        },
        { transaction }
      );
    });
  },
};
