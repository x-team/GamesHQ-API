import { QueryInterface, QueryOptions, QueryTypes, Sequelize, Transaction } from 'sequelize';
import { Op } from 'sequelize';

enum ARENA_ZONE_RING {
  ONE_A = '1A',
  ONE_B = '1B',
  ONE_C = '1C',
  ONE_D = '1D',
  TWO_A = '2A',
  TWO_B = '2B',
  TWO_C = '2C',
  TWO_D = '2D',
  THREE_A = '3A',
  THREE_B = '3B',
  THREE_C = '3C',
  THREE_D = '3D',
  FOUR_A = '4A',
  FOUR_B = '4B',
  FOUR_C = '4C',
  FOUR_D = '4D',
  FIVE = '5',
}

enum ITEM_TYPE {
  HEALTH_KIT = 'health kit',
  WEAPON = 'weapon',
  ARMOR = 'armor',
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

enum GAME_TYPE {
  TOWER = 'The Tower',
  ARENA = 'The Arena',
}

enum ITEM_NAME_TO_ADD {
  COMMON_ARMOR = 'Common Armor',
  RARE_ARMOR = 'Rare Armor',
  EPIC_ARMOR = 'Epic Armor',
  LEGENDARY_ARMOR = 'Legendary Armor',
  ARENA_HEALTH_KIT = 'arena health kit',
  TOWER_HEALTH_KIT = 'tower health kit',
  NOSSECS_PRIME = `Nossec's Prime`,
  DMITREVNAS_SHOTGUN = `Dmitrevna's Shotgun`,
  WATCHMANS_CHRONOGUN = `Watchman's Chronogun`,
  BR58_BATTLE_RIFLE = `BR58 Battle Rifle`,
  FLARE_BLASTERS_M21 = `Flare Blasters M21`,
  KOBOLS_THUNDERBOLT = `Kobol's Thunderbolt`,
  INTERCEPTOR_VIII = `Interceptor VIII`,
  FLAMERS_FIRESTARTERS = `Flamer's Firestarters`,
  VEES_OATHKEEPER = `Vee's Oathkeeper`,
  LOADER_GUN_GAMMA_26 = `Loader Gun Gamma 26`,
  DAMETRICS_EXECUTIONER = `Dameric's Executioner`,
  CETRAAHS_FIREHAWK = `Cetraah's Firehawk`,
  PYROS_DOUBLEBARREL = `Pyro's Doublebarrel`,
  CETRAAHS_EXECUTIONER = `Cetraah's Executioner`,
  RC06_ENVISIONER = `RC06 Envisioner`,
  NBL8_LEVIATHAN = `NBL8 Leviathan`,
  HELLFIRE_SHOTGUN = `Hellfire Shotgun`,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDelete(enumerable: any): { name: { [Op.in]: string[] } } {
  return { name: { [Op.in]: Object.values<string>(enumerable).map((t) => t) } };
}

interface Item {
  id: number;
  name: string;
}

interface SequelizeContext {
  context: {
    queryInterface: QueryInterface;
    Sequelize: Sequelize;
  };
}

function queryItemByName(
  name: string,
  queryInterface: QueryInterface,
  transaction: Transaction
): Promise<Item[]> {
  const queryString = `SELECT id, "name" FROM "Item" WHERE "name" = '${name.replace(`'`, `''`)}';`;
  return queryInterface.sequelize.query(queryString, {
    transaction,
    type: QueryTypes.SELECT,
  });
}

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

      const items: Item[] = [];
      //        WEAPONS        ///////////////////////////////////////////////////////////
      const itemWeapons: Item[] = (await queryInterface.bulkInsert(
        'Item',
        [
          {
            name: ITEM_NAME_TO_ADD.NOSSECS_PRIME,
            emoji: `:nossec's-prime:`,
            usageLimit: 4,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.COMMON,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.DMITREVNAS_SHOTGUN,
            emoji: `:dmitrevna's-shotgun:`,
            usageLimit: 4,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.COMMON,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.WATCHMANS_CHRONOGUN,
            emoji: `:watchman's-chronogun:`,
            usageLimit: null,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.COMMON,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.BR58_BATTLE_RIFLE,
            emoji: ':br58-battle-rifle:',
            usageLimit: 4,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.RARE,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.FLARE_BLASTERS_M21,
            emoji: `:flare-blasters-m21:`,
            usageLimit: 2,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.RARE,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.KOBOLS_THUNDERBOLT,
            emoji: `:kobol's-thunderbolt:`,
            usageLimit: 2,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.RARE,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.INTERCEPTOR_VIII,
            emoji: `:interceptor-viii:`,
            usageLimit: 2,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.RARE,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.FLAMERS_FIRESTARTERS,
            emoji: `:flamer's-firestarters:`,
            usageLimit: 4,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.RARE,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.VEES_OATHKEEPER,
            emoji: `:vee's-oathkeeper:`,
            usageLimit: 2,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.EPIC,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.LOADER_GUN_GAMMA_26,
            emoji: `:loader-gun-gamma-26:`,
            usageLimit: 3,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.EPIC,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.DAMETRICS_EXECUTIONER,
            emoji: `:dameric's-executioner:`,
            usageLimit: 3,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.EPIC,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.CETRAAHS_FIREHAWK,
            emoji: `:cetraah's-firehawk:`,
            usageLimit: 3,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.EPIC,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.PYROS_DOUBLEBARREL,
            emoji: `:pyro's-doublebarrel:`,
            usageLimit: 3,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.EPIC,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.CETRAAHS_EXECUTIONER,
            emoji: `:cetraah's-executioner:`,
            usageLimit: 3,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.LEGENDARY,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.RC06_ENVISIONER,
            emoji: `:rc06-envisioner:`,
            usageLimit: 2,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.LEGENDARY,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.NBL8_LEVIATHAN,
            emoji: `:nbl8-leviathan:`,
            usageLimit: 3,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.LEGENDARY,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.HELLFIRE_SHOTGUN,
            emoji: `:hellfire-shotgun:`,
            usageLimit: 2,
            type: ITEM_TYPE.WEAPON,
            _itemRarityId: RARITY.LEGENDARY,
            _organizationId: firstOrganization.id,
          },
        ],
        { transaction, returning: true } as QueryOptions
      )) as Item[];

      const [nossecsPrime] = await queryItemByName(
        ITEM_NAME_TO_ADD.NOSSECS_PRIME,
        queryInterface,
        transaction
      );

      const [dmitrevnasShotgun] = await queryItemByName(
        ITEM_NAME_TO_ADD.DMITREVNAS_SHOTGUN,
        queryInterface,
        transaction
      );

      const [watchmansChronogun] = await queryItemByName(
        ITEM_NAME_TO_ADD.WATCHMANS_CHRONOGUN,
        queryInterface,
        transaction
      );

      const [br58BattleRifle] = await queryItemByName(
        ITEM_NAME_TO_ADD.BR58_BATTLE_RIFLE,
        queryInterface,
        transaction
      );

      const [flareBlasterM21] = await queryItemByName(
        ITEM_NAME_TO_ADD.FLARE_BLASTERS_M21,
        queryInterface,
        transaction
      );

      const [kobolsThunderbolt] = await queryItemByName(
        ITEM_NAME_TO_ADD.KOBOLS_THUNDERBOLT,
        queryInterface,
        transaction
      );

      const [interceptorVIII] = await queryItemByName(
        ITEM_NAME_TO_ADD.INTERCEPTOR_VIII,
        queryInterface,
        transaction
      );

      const [flamersFirestarters] = await queryItemByName(
        ITEM_NAME_TO_ADD.FLAMERS_FIRESTARTERS,
        queryInterface,
        transaction
      );

      const [veesOathkeeper] = await queryItemByName(
        ITEM_NAME_TO_ADD.VEES_OATHKEEPER,
        queryInterface,
        transaction
      );

      const [loaderGunGAmma26] = await queryItemByName(
        ITEM_NAME_TO_ADD.LOADER_GUN_GAMMA_26,
        queryInterface,
        transaction
      );

      const [damericExecutioner] = await queryItemByName(
        ITEM_NAME_TO_ADD.DAMETRICS_EXECUTIONER,
        queryInterface,
        transaction
      );

      const [cetraahsFirehawk] = await queryItemByName(
        ITEM_NAME_TO_ADD.CETRAAHS_FIREHAWK,
        queryInterface,
        transaction
      );

      const [pyrosDoublebarrel] = await queryItemByName(
        ITEM_NAME_TO_ADD.PYROS_DOUBLEBARREL,
        queryInterface,
        transaction
      );

      const [cetraahsExecutioner] = await queryItemByName(
        ITEM_NAME_TO_ADD.CETRAAHS_EXECUTIONER,
        queryInterface,
        transaction
      );

      const [rc06Envisioner] = await queryItemByName(
        ITEM_NAME_TO_ADD.RC06_ENVISIONER,
        queryInterface,
        transaction
      );

      const [nbl8Leviathan] = await queryItemByName(
        ITEM_NAME_TO_ADD.NBL8_LEVIATHAN,
        queryInterface,
        transaction
      );

      const [hellfireShotgun] = await queryItemByName(
        ITEM_NAME_TO_ADD.HELLFIRE_SHOTGUN,
        queryInterface,
        transaction
      );

      await queryInterface.bulkInsert(
        'ItemWeapon',
        [
          {
            _itemId: nossecsPrime!.id,
            minorDamageRate: 10,
            majorDamageRate: 30,
          },
          {
            _itemId: dmitrevnasShotgun!.id,
            minorDamageRate: 10,
            majorDamageRate: 50,
          },
          {
            _itemId: watchmansChronogun!.id,
            minorDamageRate: 10,
            majorDamageRate: 20,
          },
          {
            _itemId: br58BattleRifle!.id,
            minorDamageRate: 35,
            majorDamageRate: 45,
          },
          {
            _itemId: flareBlasterM21!.id,
            minorDamageRate: 30,
            majorDamageRate: 40,
          },
          {
            _itemId: kobolsThunderbolt!.id,
            minorDamageRate: 10,
            majorDamageRate: 30,
          },
          {
            _itemId: interceptorVIII!.id,
            minorDamageRate: 20,
            majorDamageRate: 20,
          },
          {
            _itemId: flamersFirestarters!.id,
            minorDamageRate: 20,
            majorDamageRate: 60,
          },
          {
            _itemId: veesOathkeeper!.id,
            minorDamageRate: 40,
            majorDamageRate: 40,
          },
          {
            _itemId: loaderGunGAmma26!.id,
            minorDamageRate: 10,
            majorDamageRate: 40,
          },
          {
            _itemId: damericExecutioner!.id,
            minorDamageRate: 50,
            majorDamageRate: 60,
          },
          {
            _itemId: cetraahsFirehawk!.id,
            minorDamageRate: 45,
            majorDamageRate: 55,
          },
          {
            _itemId: pyrosDoublebarrel!.id,
            minorDamageRate: 15,
            majorDamageRate: 25,
          },
          {
            _itemId: cetraahsExecutioner!.id,
            minorDamageRate: 50,
            majorDamageRate: 70,
          },
          {
            _itemId: rc06Envisioner!.id,
            minorDamageRate: 55,
            majorDamageRate: 55,
          },
          {
            _itemId: nbl8Leviathan!.id,
            minorDamageRate: 65,
            majorDamageRate: 75,
          },
          {
            _itemId: hellfireShotgun!.id,
            minorDamageRate: 40,
            majorDamageRate: 90,
          },
        ],
        { transaction }
      );

      await queryInterface.bulkInsert(
        'ItemTrait',
        [
          {
            _itemId: nossecsPrime!.id,
            _traitId: TRAIT.DETECT,
          },
          {
            _itemId: dmitrevnasShotgun!.id,
            _traitId: TRAIT.ARMORBREAK,
          },
          {
            _itemId: watchmansChronogun!.id,
            _traitId: TRAIT.UNSEARCHABLE,
          },
          {
            _itemId: flareBlasterM21!.id,
            _traitId: TRAIT.PIERCING,
          },
          {
            _itemId: flareBlasterM21!.id,
            _traitId: TRAIT.BLAST_2,
          },
          {
            _itemId: kobolsThunderbolt!.id,
            _traitId: TRAIT.BLAST_3,
          },
          {
            _itemId: interceptorVIII!.id,
            _traitId: TRAIT.DETECT,
          },
          {
            _itemId: interceptorVIII!.id,
            _traitId: TRAIT.STEALTH,
          },
          {
            _itemId: flamersFirestarters!.id,
            _traitId: TRAIT.PIERCING,
          },
          {
            _itemId: veesOathkeeper!.id,
            _traitId: TRAIT.ARMORBREAK,
          },
          {
            _itemId: veesOathkeeper!.id,
            _traitId: TRAIT.DETECT,
          },
          {
            _itemId: loaderGunGAmma26!.id,
            _traitId: TRAIT.BLAST_ALL,
          },
          {
            _itemId: cetraahsFirehawk!.id,
            _traitId: TRAIT.PIERCING,
          },
          {
            _itemId: pyrosDoublebarrel!.id,
            _traitId: TRAIT.PIERCING,
          },
          {
            _itemId: pyrosDoublebarrel!.id,
            _traitId: TRAIT.DUALSTRIKE,
          },
          {
            _itemId: cetraahsExecutioner!.id,
            _traitId: TRAIT.DETECT,
          },
          {
            _itemId: rc06Envisioner!.id,
            _traitId: TRAIT.ARMORBREAK,
          },
          {
            _itemId: rc06Envisioner!.id,
            _traitId: TRAIT.DETECT,
          },
          {
            _itemId: hellfireShotgun!.id,
            _traitId: TRAIT.PIERCING,
          },
        ],
        { transaction }
      );

      //        ARMORS        ///////////////////////////////////////////////////////////
      const itemArmors: Item[] = (await queryInterface.bulkInsert(
        'Item',
        [
          {
            name: ITEM_NAME_TO_ADD.COMMON_ARMOR,
            emoji: ':arena-armor-common:',
            usageLimit: null,
            type: ITEM_TYPE.ARMOR,
            _itemRarityId: RARITY.COMMON,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.RARE_ARMOR,
            emoji: ':arena-armor-rare:',
            usageLimit: null,
            type: ITEM_TYPE.ARMOR,
            _itemRarityId: RARITY.RARE,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.EPIC_ARMOR,
            emoji: ':arena-armor-epic:',
            usageLimit: null,
            type: ITEM_TYPE.ARMOR,
            _itemRarityId: RARITY.EPIC,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.LEGENDARY_ARMOR,
            emoji: ':arena-armor-legendary:',
            usageLimit: null,
            type: ITEM_TYPE.ARMOR,
            _itemRarityId: RARITY.LEGENDARY,
            _organizationId: firstOrganization.id,
          },
        ],
        { transaction, returning: true } as QueryOptions
      )) as Item[];

      const [commonArmor] = await queryItemByName(
        ITEM_NAME_TO_ADD.COMMON_ARMOR,
        queryInterface,
        transaction
      );

      const [rareArmor] = await queryItemByName(
        ITEM_NAME_TO_ADD.RARE_ARMOR,
        queryInterface,
        transaction
      );

      const [epicArmor] = await queryItemByName(
        ITEM_NAME_TO_ADD.EPIC_ARMOR,
        queryInterface,
        transaction
      );

      const [legendaryArmor] = await queryItemByName(
        ITEM_NAME_TO_ADD.LEGENDARY_ARMOR,
        queryInterface,
        transaction
      );

      await queryInterface.bulkInsert(
        'ItemArmor',
        [
          {
            _itemId: commonArmor!.id,
            reductionRate: 0.1,
          },
          {
            _itemId: rareArmor!.id,
            reductionRate: 0.15,
          },
          {
            _itemId: epicArmor!.id,
            reductionRate: 0.2,
          },
          {
            _itemId: legendaryArmor!.id,
            reductionRate: 0.25,
          },
        ],
        { transaction }
      );

      //        HEALTH KITS        ///////////////////////////////////////////////////////////
      await queryInterface.bulkInsert(
        'Item',
        [
          {
            name: ITEM_NAME_TO_ADD.ARENA_HEALTH_KIT,
            emoji: ':medkit:',
            usageLimit: 1,
            type: ITEM_TYPE.HEALTH_KIT,
            _itemRarityId: RARITY.COMMON,
            _organizationId: firstOrganization.id,
          },
          {
            name: ITEM_NAME_TO_ADD.TOWER_HEALTH_KIT,
            emoji: ':medkit:',
            usageLimit: 1,
            type: ITEM_TYPE.HEALTH_KIT,
            _itemRarityId: RARITY.COMMON,
            _organizationId: firstOrganization.id,
          },
        ],
        { transaction, returning: true } as QueryOptions
      );

      const [basicArenaHealthkit] = await queryItemByName(
        ITEM_NAME_TO_ADD.ARENA_HEALTH_KIT,
        queryInterface,
        transaction
      );

      const [basicTowerHealthkit] = await queryItemByName(
        ITEM_NAME_TO_ADD.TOWER_HEALTH_KIT,
        queryInterface,
        transaction
      );

      await queryInterface.bulkInsert(
        'ItemHealthKit',
        [
          {
            _itemId: basicArenaHealthkit.id,
            healingPower: 35,
          },
          {
            _itemId: basicTowerHealthkit.id,
            healingPower: 20,
          },
        ],
        { transaction }
      );

      //        GAME AVAILABILITY        /////////////////////////////////////////////////////
      items.push(...itemWeapons, ...itemArmors);

      for (const item of items) {
        await queryInterface.bulkInsert(
          'GameItemAvailability',
          [
            {
              _gameTypeId: GAME_TYPE.ARENA,
              _itemId: item.id,
            },
            {
              _gameTypeId: GAME_TYPE.TOWER,
              _itemId: item.id,
            },
          ],
          { transaction }
        );
      }

      await queryInterface.bulkInsert(
        'GameItemAvailability',
        [
          {
            _gameTypeId: GAME_TYPE.ARENA,
            _itemId: basicArenaHealthkit.id,
          },
          {
            _gameTypeId: GAME_TYPE.TOWER,
            _itemId: basicTowerHealthkit.id,
          },
        ],
        { transaction }
      );

      //        ZONES        ///////////////////////////////////////////////////////////
      await queryInterface.bulkInsert(
        'ArenaZone',
        [
          {
            name: 'Closed Gate',
            emoji: ':arena-closed-gate:',
            ring: ARENA_ZONE_RING.ONE_A,
            isActive: true,
            _organizationId: firstOrganization.id,
          },
          {
            name: 'Obsidian Tower',
            emoji: ':arena-obsidian-tower:',
            ring: ARENA_ZONE_RING.ONE_D,
            isActive: true,
            _organizationId: firstOrganization.id,
          },
          {
            name: 'White Fortress',
            emoji: ':arena-white-fortress:',
            ring: ARENA_ZONE_RING.THREE_A,
            isActive: true,
            _organizationId: firstOrganization.id,
          },
          {
            name: 'Shrine of Time',
            emoji: ':arena-shrine-of-time:',
            ring: ARENA_ZONE_RING.ONE_B,
            isActive: true,
            _organizationId: firstOrganization.id,
          },
          {
            name: 'Bamboo Forest',
            emoji: ':arena-bamboo-forest:',
            ring: ARENA_ZONE_RING.ONE_C,
            isActive: true,
            _organizationId: firstOrganization.id,
          },
          {
            name: 'Pridelands',
            emoji: ':arena-pridelands:',
            ring: ARENA_ZONE_RING.TWO_B,
            isActive: true,
            _organizationId: firstOrganization.id,
          },
          {
            name: 'Ursine Darkwoods',
            emoji: ':arena-ursine-darkwoods:',
            ring: ARENA_ZONE_RING.FOUR_A,
            isActive: true,
            _organizationId: firstOrganization.id,
          },
          {
            name: 'Phoenix Pyramids',
            emoji: ':arena-phoenix-pyramids:',
            ring: ARENA_ZONE_RING.TWO_C,
            isActive: true,
            _organizationId: firstOrganization.id,
          },
          {
            name: 'Canine Mansion',
            emoji: ':arena-canine-mansion:',
            ring: ARENA_ZONE_RING.ONE_C,
            isActive: true,
            _organizationId: firstOrganization.id,
          },
          {
            name: 'Viking Watchtower',
            emoji: ':arena-viking-watchtower:',
            ring: ARENA_ZONE_RING.FOUR_C,
            isActive: true,
            _organizationId: firstOrganization.id,
          },
          {
            name: 'Streaming Zone',
            emoji: ':arena-streaming:',
            isActive: false,
            ring: ARENA_ZONE_RING.ONE_A,
            _organizationId: firstOrganization.id,
          },
          {
            name: 'Portal',
            emoji: ':arena-portal:',
            isActive: true,
            ring: ARENA_ZONE_RING.FIVE,
            _organizationId: firstOrganization.id,
          },
        ],
        { transaction }
      );
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete('Item', toDelete(ITEM_NAME_TO_ADD), { transaction });
    });
  },
};
