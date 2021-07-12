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

import type { GAME_TYPE, TRAIT } from '../games/consts/global';
import { ITEM_RARITY, ITEM_TYPE } from '../games/consts/global';

import type { GameItemAvailabilityCreationAttributes } from './GameItemAvailability';
import { createOrUpdateItemAvailability } from './GameItemAvailability';

import {
  ArenaPlayer,
  ItemRarity,
  ItemArmor,
  ItemWeapon,
  ItemHealthKit,
  Trait,
  ItemTrait,
  /*TowerRaider,*/
  /*TowerItemInventory,*/
  ArenaItemInventory,
  GameItemAvailability,
  Game,
} from './';
import { logger } from '../config';

interface ItemAttributes {
  id: number;
  name: string;
  emoji: string;
  usageLimit: number | null;
  type: ITEM_TYPE;
  _itemRarityId: ITEM_RARITY;
}

export interface ItemCreationAttributes {
  name: string;
  emoji: string;
  usageLimit: number | null;
  type: ITEM_TYPE;
  _itemRarityId: ITEM_RARITY;
}

function itemTypeToClass(itemType: ITEM_TYPE) {
  switch (itemType) {
    case ITEM_TYPE.ARMOR:
      return ItemArmor;
    case ITEM_TYPE.WEAPON:
      return ItemWeapon;
    case ITEM_TYPE.HEALTH_KIT:
      return ItemHealthKit;
    default:
      return ItemHealthKit;
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

  // @BelongsToMany(() => TowerRaider, {
  //   through: () => TowerItemInventory,
  //   foreignKey: '_itemId',
  //   otherKey: '_towerRaiderId',
  //   as: '_towerRaiders',
  // })
  // _towerRaiders?: TowerRaider[];

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
    // _towerRaiders: Association<Item, TowerRaider>;
    _gameItemAvailability: Association<Item, GameItemAvailability>;
    _rarity: Association<Item, ItemRarity>;
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
  { name, emoji, usageLimit, _itemRarityId, type }: ItemCreationAttributes,
  itemsAvailability: GameItemAvailabilityCreationAttributes[],
  transaction: Transaction
) {
  const [item] = await Item.upsert(
    {
      name,
      emoji,
      usageLimit,
      _itemRarityId,
      type,
    },
    { transaction }
  );
  await Promise.all(
    itemsAvailability.map(({ _gameTypeId, isArchived }) =>
      createOrUpdateItemAvailability(
        { _gameTypeId, _itemId: item.id, isArchived, isActive: !isArchived },
        transaction
      )
    )
  );
  return item;
}

export async function findItemById(itemId: number, itemType: ITEM_TYPE, transaction?: Transaction) {
  return Item.findByPk(itemId, {
    include: [itemTypeToClass(itemType)],
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
    include: [itemTypeToClass(itemType)],
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
    include: [itemTypeToClass(itemType)],
    transaction,
  });
}

export function listActiveItemsByGameType(gameType: GAME_TYPE, transaction?: Transaction) {
  return Item.findAll({
    include: [
      {
        model: GameItemAvailability,
        where: { isActive: true },
        include: [
          {
            model: Game,
            where: { type: gameType },
          },
        ],
      },
    ],
    transaction,
  });
}

export async function listAllItems(transaction?: Transaction) {
  return Item.findAll({
    include: [ItemRarity, Trait, { model: GameItemAvailability, include: [Game] }],
    transaction,
  });
}

export async function deleteItem(itemId: number, transaction?: Transaction) {
  await ArenaItemInventory.destroy({
    where: {
      _itemId: itemId,
    },
    transaction,
  });

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
