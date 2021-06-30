import type { Transaction } from 'sequelize';
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

import { ZERO } from '../games/consts/global';

import { ArenaPlayer, Item } from '.';

interface ArenaItemInventoryAttributes {
  id: number;
  _arenaPlayerId: number;
  _itemId: number;
  remainingUses: number | null;
}

interface ArenaItemInventoryCreationAttributes {
  _arenaPlayerId: number;
  _itemId: number;
  remainingUses: number | null;
}

@Table({
  indexes: [
    {
      unique: true,
      fields: ['_arenaPlayerId', '_itemId'],
    },
  ],
})
export class ArenaItemInventory
  extends Model<ArenaItemInventoryAttributes, ArenaItemInventoryCreationAttributes>
  implements ArenaItemInventoryAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => ArenaPlayer)
  @Column(DataType.INTEGER)
  _arenaPlayerId!: number;

  @BelongsTo(() => ArenaPlayer, '_arenaPlayerId')
  _player?: ArenaPlayer;

  @ForeignKey(() => Item)
  @Column(DataType.INTEGER)
  _itemId!: number;

  @BelongsTo(() => Item, '_itemId')
  _item?: Item;

  @Column(DataType.INTEGER)
  remainingUses!: number | null;
}

interface ArenaPlayerItemInventoryInstances {
  player: ArenaPlayer;
  item: Item & { ArenaItemInventory: ArenaItemInventory };
  ammo?: number;
}

interface ArenaPlayerAndItem {
  player: ArenaPlayer;
  item: Item;
}

export async function removePlayerItem(
  { player, item }: ArenaPlayerItemInventoryInstances,
  transaction: Transaction
) {
  return ArenaItemInventory.destroy({
    where: {
      _arenaPlayerId: player.id,
      _itemId: item.id,
    },
    transaction,
  });
}

// Only use this function if weapon has usageLimit != null
export function addAmmoToInventory(
  { player, item, ammo }: ArenaPlayerItemInventoryInstances,
  transaction: Transaction
) {
  return ArenaItemInventory.update(
    {
      remainingUses:
        item.ArenaItemInventory.remainingUses ?? ZERO + (ammo ?? item.usageLimit ?? ZERO),
    },
    {
      where: {
        _arenaPlayerId: player.id,
        _itemId: item.id,
      },
      transaction,
    }
  );
}

export function getPlayerItemCount({ player, item }: ArenaPlayerAndItem, transaction: Transaction) {
  return ArenaItemInventory.count({
    where: { _arenaPlayerId: player.id, _itemId: item.id },
    transaction,
  });
}
