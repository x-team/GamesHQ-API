import type { Association, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import type { GAME_TYPE, ITEM_RARITY } from '../games/consts/global';
import { ITEM_TYPE } from '../games/consts/global';

import type { GameItemAvailabilityCreationAttributes } from './GameItemAvailability';
import type { ItemCreationAttributes } from './Item';
import {
  listActiveItemsByGameType,
  createOrUpdateItem,
  findItemById,
  findItemByName,
  findItemsByRarityAndType,
} from './Item';

import { Item } from '.';

interface ItemHealthKitAttributes {
  healingPower: number;
  _itemId: number;
}

interface ItemHealthKitCreationAttributes {
  healingPower: number;
  _itemId: number;
}

@Table
export class ItemHealthKit
  extends Model<ItemHealthKitAttributes, ItemHealthKitCreationAttributes>
  implements ItemHealthKitAttributes
{
  @Column(DataType.INTEGER)
  declare healingPower: number;

  @PrimaryKey
  @ForeignKey(() => Item)
  @Column(DataType.INTEGER)
  declare _itemId: number;

  @BelongsTo(() => Item, {
    foreignKey: '_itemId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _item?: Item;

  static associations: {
    _item: Association<ItemHealthKit, Item>;
  };
}

export async function createOrUpdateHealthkit(
  { name, emoji, usageLimit, _itemRarityId, type }: ItemCreationAttributes,
  { healingPower }: ItemHealthKitCreationAttributes,
  itemsAvailability: GameItemAvailabilityCreationAttributes[],
  transaction: Transaction
) {
  const item = await createOrUpdateItem(
    {
      name,
      emoji,
      usageLimit,
      _itemRarityId,
      type,
    },
    itemsAvailability,
    transaction
  );

  return ItemHealthKit.upsert(
    {
      _itemId: item.id,
      healingPower,
    },
    { transaction }
  );
}

export async function listActiveHealthkitsByGameType(
  gameType: GAME_TYPE,
  transaction?: Transaction
) {
  return listActiveItemsByGameType(gameType, ITEM_TYPE.HEALTH_KIT, transaction);
}

export async function findHealthkitsByRarity(rarityId: ITEM_RARITY, transaction?: Transaction) {
  return findItemsByRarityAndType(rarityId, ITEM_TYPE.HEALTH_KIT, transaction);
}

export function findHealthkitById(healthkitId: number, transaction?: Transaction) {
  return findItemById(healthkitId, ITEM_TYPE.HEALTH_KIT, transaction);
}

export function findHealthkitByName(healthkitName: string, transaction?: Transaction) {
  return findItemByName(healthkitName, ITEM_TYPE.HEALTH_KIT, transaction);
}
