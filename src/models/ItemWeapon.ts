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

import { ITEM_TYPE } from '../games/consts/global';
import type { ITEM_RARITY } from '../games/consts/global';

import type { AnonymousGameItemAvailabilityCreationAttributes } from './GameItemAvailability';
import {
  listActiveItemsByGameType,
  createOrUpdateItem,
  findItemById,
  findItemByName,
  findItemsByRarityAndType,
} from './Item';
import type { ItemCreationAttributes } from './Item';

import { Item } from '.';

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
  declare minorDamageRate: number;

  @Column(DataType.INTEGER)
  declare majorDamageRate: number;

  @PrimaryKey
  @ForeignKey(() => Item)
  @Column(DataType.INTEGER)
  declare _itemId: number;

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
  itemsAvailability: AnonymousGameItemAvailabilityCreationAttributes[],
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

export async function listActiveWeaponsByGameType(gameTypeName: string, transaction?: Transaction) {
  return listActiveItemsByGameType(gameTypeName, ITEM_TYPE.WEAPON, transaction);
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
