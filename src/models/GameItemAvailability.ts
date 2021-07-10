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

import { Item, Game } from './';

interface GameItemAvailabilityAttributes {
  _gameId: number;
  _itemId: number;
  isActive: boolean;
  isArchived: boolean;
}

export interface GameItemAvailabilityCreationAttributes {
  _gameId: number;
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
  @ForeignKey(() => Game)
  @Column(DataType.INTEGER)
  _gameId!: number;

  @BelongsTo(() => Game, '_ownedById')
  _game?: Game;

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
    _game: Association<Item, Item>;
    _item: Association<Item, Item>;
  };
}

export function createOrUpdateItemAvailability(
  { _gameId, _itemId, isArchived }: GameItemAvailabilityCreationAttributes,
  transaction: Transaction
) {
  return GameItemAvailability.upsert(
    {
      _gameId,
      _itemId,
      isArchived,
      isActive: !isArchived,
    },
    {
      transaction,
    }
  );
}

export async function enableAllItems(gameId: number, transaction: Transaction) {
  return GameItemAvailability.update(
    {
      isActive: true,
    },
    {
      where: {
        isArchived: false,
        _gameId: gameId,
      },
      transaction,
    }
  );
}

export async function disableItems(gameId: number, itemIds: number[], transaction: Transaction) {
  await enableAllItems(gameId, transaction);
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
        _gameId: gameId,
      },
    }
  );
}
