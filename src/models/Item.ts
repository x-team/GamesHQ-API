import type { Transaction, Association } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  BelongsToMany,
  ForeignKey,
  Unique,
  AllowNull,
  HasMany,
  AutoIncrement,
  PrimaryKey,
  HasOne,
} from 'sequelize-typescript';

import { logger } from '../config';
import { ITEM_RARITY, ITEM_TYPE } from '../games/consts/global';
import type { TRAIT } from '../games/consts/global';

import {
  removeAllGameItemAvailability,
  createOrUpdateItemAvailability,
} from './GameItemAvailability';
import type { AnonymousGameItemAvailabilityCreationAttributes } from './GameItemAvailability';
import { createOrUpdateItemTrait, removeAllItemTraits } from './ItemTrait';
import { Organization } from './Organization';

import {
  ArenaPlayer,
  ItemRarity,
  ItemArmor,
  ItemWeapon,
  ItemHealthKit,
  Trait,
  ItemTrait,
  TowerRaider,
  TowerItemInventory,
  ArenaItemInventory,
  GameItemAvailability,
} from './';

interface ItemAttributes {
  id: number;
  name: string;
  emoji: string;
  usageLimit: number | null;
  type: ITEM_TYPE;
  _itemRarityId: ITEM_RARITY;
}

export interface ItemCreationAttributes {
  id?: number;
  name: string;
  emoji: string;
  usageLimit: number | null;
  type: ITEM_TYPE;
  _itemRarityId: ITEM_RARITY;
  traits?: TRAIT[];
}

function itemTypeToAssociation(itemType: ITEM_TYPE) {
  switch (itemType) {
    case ITEM_TYPE.ARMOR:
      return Item.associations._armor;
    case ITEM_TYPE.WEAPON:
      return Item.associations._weapon;
    case ITEM_TYPE.HEALTH_KIT:
      return Item.associations._healthkit;
    default:
      return Item.associations._healthkit;
  }
}

@Table({
  indexes: [
    {
      fields: ['name'],
    },
    {
      fields: ['_itemRarityId'],
    },
  ],
})
export class Item extends Model<ItemAttributes, ItemCreationAttributes> implements ItemAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Unique
  @Column(DataType.TEXT)
  name!: string;

  @Column(DataType.TEXT)
  emoji!: string;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  usageLimit!: number | null;

  @Column(DataType.TEXT)
  type!: ITEM_TYPE;

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

  @BelongsToMany(() => ArenaPlayer, {
    through: () => ArenaItemInventory,
    foreignKey: '_itemId',
    otherKey: '_arenaPlayerId',
    as: '_arenaPlayers',
  })
  _arenaPlayers?: ArenaPlayer[];

  @BelongsToMany(() => Trait, {
    through: () => ItemTrait,
    foreignKey: '_itemId',
    otherKey: '_traitId',
    as: '_traits',
  })
  _traits?: Array<Trait & { ItemTrait: ItemTrait }>;

  @BelongsToMany(() => TowerRaider, {
    through: () => TowerItemInventory,
    foreignKey: '_itemId',
    otherKey: '_towerRaiderId',
    as: '_towerRaiders',
  })
  _towerRaiders?: TowerRaider[];

  @HasMany(() => GameItemAvailability, '_itemId')
  _gameItemAvailability?: GameItemAvailability[];

  @HasOne(() => ItemArmor, '_itemId')
  _armor?: ItemArmor;

  @HasOne(() => ItemWeapon, '_itemId')
  _weapon?: ItemWeapon;

  @HasOne(() => ItemHealthKit, '_itemId')
  _healthkit?: ItemHealthKit;

  static associations: {
    _arenaPlayers: Association<Item, ArenaPlayer>;
    _towerRaiders: Association<Item, TowerRaider>;
    _gameItemAvailability: Association<Item, GameItemAvailability>;
    _rarity: Association<Item, ItemRarity>;
    _organization: Association<Item, Organization>;
    _traits: Association<Item, Trait>;
    _armor: Association<Item, ItemArmor>;
    _weapon: Association<Item, ItemWeapon>;
    _healthkit: Association<Item, ItemHealthKit>;
  };

  isLegendayItem(): boolean {
    return this._itemRarityId === ITEM_RARITY.LEGENDARY;
  }

  hasTrait(trait: TRAIT) {
    if (!this._traits) {
      logger.error("An Item without the Traits relationship called 'hasTrait()'.");
      return false;
    }
    return this._traits.filter((traitInstance) => traitInstance.id === trait).length > 0;
  }
}

export async function createOrUpdateItem(
  { id, name, emoji, usageLimit, _itemRarityId, type, traits }: ItemCreationAttributes,
  itemsAvailability: AnonymousGameItemAvailabilityCreationAttributes[],
  transaction: Transaction
) {
  const [item] = await Item.upsert(
    {
      ...(id && { id }),
      name,
      emoji,
      usageLimit,
      _itemRarityId,
      type,
    },
    { transaction }
  );

  if (id) {
    await removeAllItemTraits(id, transaction);
    await removeAllGameItemAvailability(id, transaction);
  }

  await Promise.all(
    itemsAvailability.map(async ({ _gameTypeId, isArchived }) => {
      return createOrUpdateItemAvailability(
        { _gameTypeId, _itemId: item.id, isArchived, isActive: !isArchived },
        transaction
      );
    })
  );

  if (traits) {
    traits.map((trait) => createOrUpdateItemTrait({ itemId: item.id, trait }, transaction));
  }

  return item;
}

export async function findItemById(itemId: number, itemType: ITEM_TYPE, transaction?: Transaction) {
  return Item.findByPk(itemId, {
    include: [
      itemTypeToAssociation(itemType),
      Item.associations._traits,
      Item.associations._gameItemAvailability,
    ],
    transaction,
  });
}

export async function findItemsByRarity(rarityId: ITEM_RARITY, transaction?: Transaction) {
  return Item.findAll({
    where: { _itemRarityId: rarityId },
    transaction,
  });
}

export async function findItemsByRarityAndType(
  rarityId: ITEM_RARITY,
  itemType: ITEM_TYPE,
  transaction?: Transaction
) {
  return Item.findAll({
    where: { type: itemType, _itemRarityId: rarityId },
    include: [itemTypeToAssociation(itemType), Item.associations._traits],
    transaction,
  });
}

export async function findItemByName(
  itemName: string,
  itemType: ITEM_TYPE,
  transaction?: Transaction
) {
  return Item.findOne({
    where: { name: itemName },
    include: [itemTypeToAssociation(itemType), Item.associations._traits],
    transaction,
  });
}

export function listAllWeapons(transaction?: Transaction) {
  return Item.findAll({
    where: { type: ITEM_TYPE.WEAPON },
    include: [
      {
        association: Item.associations._gameItemAvailability,
        include: [GameItemAvailability.associations._gameType],
      },
      itemTypeToAssociation(ITEM_TYPE.WEAPON),
      Item.associations._traits,
    ],
    transaction,
  });
}

export function listActiveItemsByGameType(
  _gameTypeName: string,
  itemType: ITEM_TYPE,
  transaction?: Transaction
) {
  return Item.findAll({
    where: { type: itemType },
    include: [
      {
        association: Item.associations._gameItemAvailability,
        where: { isActive: true },
        include: [
          {
            association: GameItemAvailability.associations._gameType,
            where: { name: _gameTypeName },
          },
        ],
      },
      itemTypeToAssociation(itemType),
      Item.associations._traits,
    ],
    transaction,
  });
}

export async function listAllItems(transaction?: Transaction) {
  return Item.findAll({
    include: [
      Item.associations._rarity,
      Item.associations._traits,
      {
        association: Item.associations._gameItemAvailability,
        include: [GameItemAvailability.associations._gameType],
      },
    ],
    transaction,
  });
}

export async function deleteItem(itemId: number, transaction?: Transaction) {
  // await ArenaItemInventory.destroy({
  //   where: {
  //     _itemId: itemId,
  //   },
  //   transaction,
  // });

  // await TowerItemInventory.destroy({
  //   where: {
  //     _itemId: itemId,
  //   },
  //   transaction,
  // });

  return Item.destroy({
    where: {
      id: itemId,
    },
    transaction,
  });
}
