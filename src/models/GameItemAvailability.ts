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

import { GAME_TYPE } from '../games/consts/global';

import { Item, GameType } from './';

interface GameItemAvailabilityAttributes {
  _gameTypeId: GAME_TYPE;
  _itemId: number;
  isActive: boolean;
  isArchived: boolean;
}

export interface GameItemAvailabilityCreationAttributes {
  _gameTypeId: GAME_TYPE;
  _itemId: number;
  isActive: boolean;
  isArchived: boolean;
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
  @Column(DataType.TEXT)
  _gameTypeId!: GAME_TYPE;

  @BelongsTo(() => GameType, '_gameTypeId')
  _gameType?: GAME_TYPE;

  @PrimaryKey
  @ForeignKey(() => Item)
  @Column(DataType.INTEGER)
  _itemId!: number;

  @BelongsTo(() => Item, '_itemId')
  _item?: Item;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @Default(true)
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

export async function enableAllItems(gameType: GAME_TYPE, transaction: Transaction) {
  return GameItemAvailability.update(
    {
      isActive: true,
    },
    {
      where: {
        isArchived: false,
        _gameTypeId: gameType,
      },
      transaction,
    }
  );
}

export async function disableItems(
  gameType: GAME_TYPE,
  itemIds: number[],
  transaction: Transaction
) {
  await enableAllItems(gameType, transaction);
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
        _gameTypeId: gameType,
      },
    }
  );
}
