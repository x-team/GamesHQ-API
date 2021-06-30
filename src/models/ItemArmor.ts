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

import { Game } from './Game';
import type { GameItemAvailabilityCreationAttributes } from './GameItemAvailability';
import { GameItemAvailability } from './GameItemAvailability';
import type { ItemCreationAttributes } from './Item';
import { createOrUpdateItem, findItemById, findItemByName, findItemsByRarityAndType } from './Item';

import { Item } from './';

interface ItemArmorAttributes {
  reductionRate: number;
  _itemId: number;
}

interface ItemArmorCreationAttributes {
  reductionRate: number;
  _itemId: number;
}

@Table
export class ItemArmor
  extends Model<ItemArmorAttributes, ItemArmorCreationAttributes>
  implements ItemArmorAttributes
{
  @Column(DataType.DOUBLE)
  reductionRate!: number;

  @PrimaryKey
  @ForeignKey(() => Item)
  @Column(DataType.INTEGER)
  _itemId!: number;

  @BelongsTo(() => Item, '_itemId')
  _item?: Item;

  static associations: {
    _item: Association<ItemArmor, Item>;
  };
}

export async function createOrUpdateArmor(
  { name, emoji, usageLimit, _itemRarityId, type }: ItemCreationAttributes,
  { reductionRate }: ItemArmorCreationAttributes,
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

  return ItemArmor.upsert(
    {
      _itemId: item.id,
      reductionRate,
    },
    { transaction }
  );
}

export async function listActiveArmorsByGameType(gameType: GAME_TYPE, transaction?: Transaction) {
  return Item.findAll({
    where: { type: ITEM_TYPE.ARMOR },
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
      ItemArmor,
    ],
    transaction,
  });
}

export async function findArmorsByRarity(rarityId: ITEM_RARITY, transaction?: Transaction) {
  return findItemsByRarityAndType(rarityId, ITEM_TYPE.ARMOR, transaction);
}

export function findArmorById(armorId: number, transaction?: Transaction) {
  return findItemById(armorId, ITEM_TYPE.ARMOR, transaction);
}

export function findArmorByName(armorName: string, transaction?: Transaction) {
  return findItemByName(armorName, ITEM_TYPE.ARMOR, transaction);
}
