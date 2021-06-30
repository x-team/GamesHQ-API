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
import { GAME_TYPE, ITEM_RARITY, ITEM_TYPE } from '../games/consts/global';
import { Item } from '.';
import { Game } from './Game';
import { GameItemAvailability, GameItemAvailabilityCreationAttributes } from './GameItemAvailability';
import { createOrUpdateItem, findItemById, findItemByName, findItemsByRarityAndType, ItemCreationAttributes } from './Item';

interface ItemHealthKitAttributes {
  healingPower: number;
  _itemId: number;
}

interface ItemHealthKitCreationAttributes {
  healingPower: number;
  _itemId: number;
}

@Table
export class ItemHealthKit extends Model<ItemHealthKitAttributes, ItemHealthKitCreationAttributes>
implements ItemHealthKitAttributes {
  @Column(DataType.INTEGER)
  healingPower!: number;

  @PrimaryKey
  @ForeignKey(() => Item)
  @Column(DataType.INTEGER)
  _itemId!: number;

  @BelongsTo(() => Item, '_itemId')
  _item?: Item;

  static associations: {
    _item: Association<ItemHealthKit, Item>;
  }
}

export async function createOrUpdateHealthkit(
  {
    name,
    emoji,
    usageLimit,
    _itemRarityId,
    type,
  }: ItemCreationAttributes,
  {
    healingPower,
  }: ItemHealthKitCreationAttributes,
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
    transaction,
  );

  return ItemHealthKit.upsert(
    {
      _itemId: item.id,
      healingPower,
    },
    { transaction }
  );
}

export async function listActivehealthkitsByGameType(gameType: GAME_TYPE, transaction?: Transaction) {
  return Item.findAll({
    where: { type: ITEM_TYPE.HEALTH_KIT },
    include: [
      {
        model: GameItemAvailability,
        where: { isActive: true },
        include: [
          {
            model: Game,
            where: { type: gameType },
          }
        ],
      },
      ItemHealthKit,
    ],
    transaction,
  });
}

export async function findhealthkitsByRarity(rarityId: ITEM_RARITY, transaction?: Transaction) {
  return findItemsByRarityAndType(rarityId, ITEM_TYPE.ARMOR, transaction);
}

export function findhealthkitById(healthkitId: number, transaction?: Transaction) {
  return findItemById(healthkitId, ITEM_TYPE.ARMOR, transaction);
}

export function findhealthkitByName(healthkitName: string, transaction?: Transaction) {
  return findItemByName(healthkitName, ITEM_TYPE.ARMOR, transaction);
}