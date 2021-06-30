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

interface ItemWeaponAttributes {
  minorDamageRate: number;
  majorDamageRate: number;
  _itemId: number;
}

interface ItemWeaponCreationAttributes {
  minorDamageRate: number;
  majorDamageRate: number;
  _itemId: number;
}

@Table
export class ItemWeapon extends Model<ItemWeaponAttributes, ItemWeaponCreationAttributes>
implements ItemWeaponAttributes {
  @Column(DataType.INTEGER)
  minorDamageRate!: number;

  @Column(DataType.INTEGER)
  majorDamageRate!: number;

  @PrimaryKey
  @ForeignKey(() => Item)
  @Column(DataType.INTEGER)
  _itemId!: number;

  @BelongsTo(() => Item, '_itemId')
  _item?: Item;

  static associations: {
    _item: Association<ItemWeapon, Item>;
  }
}

export async function createOrUpdateWeapon(
  {
    name,
    emoji,
    usageLimit,
    _itemRarityId,
    type,
  }: ItemCreationAttributes,
  {
    minorDamageRate,
    majorDamageRate,
  }: ItemWeaponCreationAttributes,
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
  return Item.findAll({
    where: { type: ITEM_TYPE.WEAPON },
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
      ItemWeapon,
    ],
    transaction,
  });
}

export async function findWeaponsByRarity(rarityId: ITEM_RARITY, transaction?: Transaction) {
  return findItemsByRarityAndType(rarityId, ITEM_TYPE.ARMOR, transaction);
}

export function findWeaponById(weaponId: number, transaction?: Transaction) {
  return findItemById(weaponId, ITEM_TYPE.ARMOR, transaction);
}

export function findWeaponByName(weaponName: string, transaction?: Transaction) {
  return findItemByName(weaponName, ITEM_TYPE.ARMOR, transaction);
}