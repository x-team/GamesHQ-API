import type { Association, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

import { Item, TowerRaider } from '.';
import { ZERO } from '../games/consts/global';

interface TowerItemInventoryAttributes {
  id: number;
  _towerRaiderId: number;
  _itemId: number;
  remainingUses: number | null;
}

interface TowerItemInventoryCreationAttributes {
  _towerRaiderId: number;
  _itemId: number;
  remainingUses: number | null;
}

@Table({
  indexes: [
    {
      unique: true,
      fields: ['_towerRaiderId', '_itemId'],
    },
  ],
})
export class TowerItemInventory
  extends Model<TowerItemInventoryAttributes, TowerItemInventoryCreationAttributes>
  implements TowerItemInventoryAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => TowerRaider)
  @Column(DataType.INTEGER)
  _towerRaiderId!: number;

  @BelongsTo(() => TowerRaider, {
    foreignKey: '_towerRaiderId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _raider?: TowerRaider;

  @ForeignKey(() => Item)
  @Column(DataType.INTEGER)
  _itemId!: number;

  @BelongsTo(() => Item, {
    foreignKey: '_itemId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _item?: Item;

  @Column(DataType.INTEGER)
  remainingUses!: number | null;

  static associations: {
    _raider: Association<TowerItemInventory, TowerRaider>;
    _item: Association<TowerItemInventory, Item>;
  };
}

export function findTowerItemInventory(
  { raider, item }: TowerRaiderItemInventoryInstances,
  transaction?: Transaction
) {
  return TowerItemInventory.findOne({
    where: {
      _towerRaiderId: raider.id,
      _itemId: item.id,
    },
    transaction,
  });
}

interface TowerRaiderItemInventoryInstances {
  raider: TowerRaider;
  item: Item & { TowerItemInventory: TowerItemInventory };
  ammo?: number;
}

interface TowerRaiderAndItem {
  raider: TowerRaider;
  item: Item;
}

export async function removePlayerItem(
  { raider, item }: TowerRaiderItemInventoryInstances,
  transaction: Transaction
) {
  return TowerItemInventory.destroy({
    where: {
      _towerRaiderId: raider.id,
      _itemId: item.id,
    },
    transaction,
  });
}

// Only use this function if weapon has usageLimit != null
export function addAmmoToItemInInventory(
  { raider, item, ammo }: TowerRaiderItemInventoryInstances,
  transaction: Transaction
) {
  return TowerItemInventory.update(
    {
      remainingUses:
        (item.TowerItemInventory.remainingUses ?? ZERO) + (ammo ?? item.usageLimit ?? ZERO),
    },
    {
      where: {
        _towerRaiderId: raider.id,
        _itemId: item.id,
      },
      transaction,
    }
  );
}

export function getRaiderItemCount({ raider, item }: TowerRaiderAndItem, transaction: Transaction) {
  return TowerItemInventory.count({
    where: { _towerRaiderId: raider.id, _itemId: item.id },
    transaction,
  });
}
