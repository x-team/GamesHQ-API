import type { Transaction, Association } from 'sequelize';
import { Op } from 'sequelize';
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
  declare _gameTypeId: number;

  @BelongsTo(() => GameType, {
    foreignKey: '_gameTypeId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _gameType?: GameType;

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

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isArchived: boolean;

  static associations: {
    _gameType: Association<GameItemAvailability, GameType>;
    _item: Association<GameItemAvailability, Item>;
  };
}

export async function createOrUpdateItemAvailability(
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

export async function enableAllItems(_gameTypeId: number, transaction?: Transaction) {
  return GameItemAvailability.update(
    {
      isActive: true,
    },
    {
      where: {
        isArchived: false,
        _gameTypeId,
      },

      transaction,
    }
  );
}

export async function disableItems(
  _gameTypeId: number,
  itemIds: number[],
  transaction?: Transaction
) {
  await enableAllItems(_gameTypeId, transaction);
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
        _gameTypeId,
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
