import { Op } from 'sequelize';
import type { Transaction, Association } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { Item, GameType } from './';
interface GameItemAvailabilityAttributes {
  _gameTypeId: number;
  _itemId: number;
  isActive: boolean;
  isArchived: boolean;
}

export interface AnonymousGameItemAvailabilityCreationAttributes {
  _gameTypeId: number;
  _itemId?: number;
  isActive: boolean;
  isArchived: boolean;
}

export interface GameItemAvailabilityCreationAttributes
  extends AnonymousGameItemAvailabilityCreationAttributes {
  _itemId: number;
}

@Table({
  indexes: [
    {
      fields: ['isArchived'],
    },
    {
      fields: ['isActive'],
    },
  ],
})
export class GameItemAvailability
  extends Model<GameItemAvailabilityAttributes, GameItemAvailabilityCreationAttributes>
  implements GameItemAvailabilityAttributes
{
  @PrimaryKey
  @ForeignKey(() => GameType)
  @Column(DataType.INTEGER)
  _gameTypeId!: number;

  @BelongsTo(() => GameType, {
    foreignKey: '_gameTypeId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _gameType?: GameType;

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

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isArchived!: boolean;

  static associations: {
    _gameType: Association<GameItemAvailability, GameType>;
    _item: Association<GameItemAvailability, Item>;
  };
}

export function createOrUpdateItemAvailability(
  { _gameTypeId, _itemId, isArchived }: GameItemAvailabilityCreationAttributes,
  transaction: Transaction
) {
  return GameItemAvailability.upsert(
    {
      _gameTypeId,
      _itemId,
      isArchived,
      isActive: !isArchived,
    },
    {
      transaction,
    }
  );
}

export async function enableAllItems(gameTypeId: number, transaction: Transaction) {
  return GameItemAvailability.update(
    {
      isActive: true,
    },
    {
      where: {
        isArchived: false,
        _gameTypeId: gameTypeId,
      },
      transaction,
    }
  );
}

export async function disableItems(
  gameTypeId: number,
  itemIds: number[],
  transaction: Transaction
) {
  await enableAllItems(gameTypeId, transaction);
  return GameItemAvailability.update(
    {
      isActive: false,
    },
    {
      where: {
        isArchived: false,
        _itemId: {
          [Op.notIn]: itemIds,
        },
        _gameTypeId: gameTypeId,
      },
      transaction,
    }
  );
}

export async function removeAllGameItemAvailability(itemId: number, transaction: Transaction) {
  return GameItemAvailability.destroy({
    where: {
      _itemId: itemId,
    },
    transaction,
  });
}
