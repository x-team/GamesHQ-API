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
import { logger } from '../config';

interface ItemWeaponAttributes {
  minorDamageRate: number;
  majorDamageRate: number;
  _itemId: number;
}

interface ItemWeaponCreationAttributes {
  minorDamageRate: number;
  majorDamageRate: number;
  _itemId?: number;
}

@Table
export class ItemWeapon
  extends Model<ItemWeaponAttributes, ItemWeaponCreationAttributes>
  implements ItemWeaponAttributes
{
  @Column(DataType.INTEGER)
  minorDamageRate!: number;

  @Column(DataType.INTEGER)
  majorDamageRate!: number;

  @PrimaryKey
  @ForeignKey(() => Item)
  @Column(DataType.INTEGER)
  _itemId!: number;

  @BelongsTo(() => Item, {
    foreignKey: '_itemId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _item?: Item;

  static associations: {
    _item: Association<ItemWeapon, Item>;
  };
}

export async function createOrUpdateWeapon(
  { id, name, emoji, usageLimit, _itemRarityId, type, traits }: ItemCreationAttributes,
  { minorDamageRate, majorDamageRate }: ItemWeaponCreationAttributes,
  itemsAvailability: GameItemAvailabilityCreationAttributes[],
  transaction: Transaction
) {
  const item = await createOrUpdateItem(
    {
      ...(id && { id }),
      name,
      emoji,
      usageLimit,
      _itemRarityId,
      type,
      traits,
    },
    itemsAvailability,
    transaction
  );

  return ItemWeapon.upsert(
    {
      _itemId: item.id,
      minorDamageRate,
      majorDamageRate,
    },
    { transaction }
  );
}

export async function listActiveWeaponsByGameType(gameType: GAME_TYPE, transaction?: Transaction) {
  return listActiveItemsByGameType(gameType, ITEM_TYPE.WEAPON, transaction);
}

export async function findWeaponsByRarity(rarityId: ITEM_RARITY, transaction?: Transaction) {
  return findItemsByRarityAndType(rarityId, ITEM_TYPE.WEAPON, transaction);
}

export function findWeaponById(weaponId: number, transaction?: Transaction) {
  return findItemById(weaponId, ITEM_TYPE.WEAPON, transaction);
}

export function findWeaponByName(weaponName: string, transaction?: Transaction) {
  return findItemByName(weaponName, ITEM_TYPE.WEAPON, transaction);
}
