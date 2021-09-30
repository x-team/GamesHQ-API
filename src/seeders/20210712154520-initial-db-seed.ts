import { isNumber } from 'lodash';
import type { QueryInterface, Sequelize, Transaction } from 'sequelize';
import { Op, QueryTypes } from 'sequelize';
import { generateSecret } from '../utils/cryptography';

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

enum GAME_TYPE {
  TOWER = 'The Tower',
  ARENA = 'The Arena',
}

const firstUserEmail = 'cristian.cmj@x-team.com';
const firstOrganizationName = 'x-team';

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

module.exports = {
  async up({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkInsert('AvailableAction', enumToIds(AVAILABLE_ACTION), {
        transaction,
      });
      await queryInterface.bulkInsert('ItemRarity', enumToIds(RARITY), { transaction });
      await queryInterface.bulkInsert('GameType', enumToIds(GAME_TYPE), { transaction });
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

      ////////////////////////////////////////   ORGANIZATION   ////////////////////////////////////////
      await queryInterface.bulkInsert(
        'Organization',
        [
          {
            name: firstOrganizationName,
            domain: `https://www.${firstOrganizationName}.com`,
            isActive: true,
            clientSecret: await generateSecret(),
            signingSecret: await generateSecret(),
          },
        ],
        { transaction }
      );

      const [firstOrganization] = (await queryByProp(
        'Organization',
        'name',
        firstOrganizationName,
        queryInterface,
        transaction
      )) as LightEntity[];

      ////////////////////////////////////////   USER   ////////////////////////////////////////
      await queryInterface.bulkInsert(
        'User',
        [
          {
            displayName: 'Cristian Morales',
            email: firstUserEmail,
            slackId: 'UBZ9PC0SK',
            createdAt: new Date(),
            updatedAt: new Date(),
            profilePictureUrl: 'https://ca.slack-edge.com/T0257R0RP-UBZ9PC0SK-1c4146b874d1-512',
            _roleId: USER_ROLE_LEVEL.SUPER_ADMIN,
            _organizationId: firstOrganization.id,
          },
        ],
        { transaction }
      );

      // const [firstUser] = (await queryByProp(
      //   'User',
      //   'email',
      //   firstUserEmail,
      //   queryInterface,
      //   transaction
      // )) as LightEntity[];

      ////////////////////////////////////////   TEAM   ////////////////////////////////////////
      await queryInterface.bulkInsert(
        'Team',
        [
          {
            name: 'House Nascent Fire',
            emoji: ':nascent-fire:',
            health: 500,
            isActive: true,
            slackWebhook:
              'https://hooks.slack.com/services/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',
            _organizationId: firstOrganization.id,
          },
          {
            name: 'House Panda',
            emoji: ':pandablob:',
            health: 500,
            isActive: true,
            slackWebhook:
              'https://hooks.slack.com/services/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',
            _organizationId: firstOrganization.id,
          },
          {
            name: 'House of Corgi',
            emoji: ':corgi:',
            health: 500,
            isActive: true,
            slackWebhook:
              'https://hooks.slack.com/services/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',
            _organizationId: firstOrganization.id,
          },
          {
            name: 'House Ragnar',
            emoji: ':ragnar:',
            health: 500,
            isActive: true,
            slackWebhook:
              'https://hooks.slack.com/services/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',
            _organizationId: firstOrganization.id,
          },
          {
            name: 'House Nightclaw',
            emoji: ':nightclaw:',
            health: 500,
            isActive: true,
            slackWebhook:
              'https://hooks.slack.com/services/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',
            _organizationId: firstOrganization.id,
          },
          {
            name: 'The Lions Pride',
            emoji: ':lions-pride:',
            health: 500,
            isActive: true,
            slackWebhook:
              'https://hooks.slack.com/services/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',
            _organizationId: firstOrganization.id,
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
      await queryInterface.bulkDelete('GameType', toDelete(GAME_TYPE), { transaction });
      await queryInterface.bulkDelete('Trait', toDelete(TRAIT), { transaction });
      await queryInterface.bulkDelete(
        'UserRole',
        {
          id: {
            [Op.in]: Object.values(USER_ROLE_LEVEL)
              .map((t) => t)
              .filter((t) => isNumber(t)),
          },
        },
        { transaction }
      );
      const [firstOrganization] = (await queryByProp(
        'Organization',
        'name',
        firstOrganizationName,
        queryInterface,
        transaction
      )) as LightEntity[];
      const [firstUser] = (await queryByProp(
        'User',
        'email',
        firstUserEmail,
        queryInterface,
        transaction
      )) as LightEntity[];
      await queryInterface.bulkDelete('User', { id: firstUser.id }, { transaction });
      await queryInterface.bulkDelete(
        'Organization',
        { id: firstOrganization.id },
        { transaction }
      );
    });
  },
};
