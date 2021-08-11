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

import { User, Game, Team } from '.';
import { ONE, ZERO } from '../games/consts/global';

interface TowerStatisticsAttributes {
  id: number;
  attempts: number;
  completed: number;
  _gameId: number;
  _userId: number;
}

interface TowerStatisticsCreationAttributes {
  attempts: number;
  completed: number;
  _gameId: number;
  _userId: number;
}

@Table({
  indexes: [
    {
      unique: true,
      fields: ['_userId', '_gameId'],
    },
  ],
})
export class TowerStatistics
  extends Model<TowerStatisticsAttributes, TowerStatisticsCreationAttributes>
  implements TowerStatisticsAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  _userId!: number;

  @BelongsTo(() => User, {
    foreignKey: '_userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _user?: User;

  @PrimaryKey
  @ForeignKey(() => Game)
  @Column(DataType.INTEGER)
  _gameId!: number;

  @BelongsTo(() => Game, {
    foreignKey: '_gameId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _game?: Game;

  @Column(DataType.INTEGER)
  attempts!: number;

  @Column(DataType.INTEGER)
  completed!: number;

  static associations: {
    _user: Association<TowerStatistics, User>;
    _game: Association<TowerStatistics, Game>;
  };
}

export function findOneTowerStatistics(gameId: number, userId: number, transaction?: Transaction) {
  return TowerStatistics.findOne({
    where: {
      _userId: userId,
      _gameId: gameId,
    },
    transaction,
  });
}

export async function findOrCreateTowerStatistics(
  gameId: number,
  userId: number,
  transaction?: Transaction
) {
  const [towerStatistics, created] = await TowerStatistics.findOrCreate({
    where: {
      _userId: userId,
      _gameId: gameId,
    },
    defaults: {
      _userId: userId,
      _gameId: gameId,
      attempts: ONE,
      completed: ZERO,
    },
    transaction,
  });
  if (!created) {
    await towerStatistics.increment({ attempts: ONE }, { transaction });
  }
  return towerStatistics.reload({ transaction });
}

export async function updateTowerAsCompleted(
  gameId: number,
  userId: number,
  transaction?: Transaction
) {
  const towerStats = await TowerStatistics.findOne({
    where: {
      _userId: userId,
      _gameId: gameId,
    },
    transaction,
  });
  if (towerStats) {
    await towerStats.increment({ completed: 1 }, { transaction });
  }
}

export function findTowerStatisticsByGame(gameId: number, transaction: Transaction) {
  return TowerStatistics.findAll({
    where: {
      _gameId: gameId,
    },
    order: [
      ['completed', 'DESC'],
      ['attempts', 'ASC'],
    ],
    include: [{ model: User, include: [Team] }],
    transaction,
  });
}

export async function updateTowerAttempts(
  gameId: number,
  userId: number,
  transaction?: Transaction
) {
  const towerStats = await TowerStatistics.findOne({
    where: {
      _userId: userId,
      _gameId: gameId,
    },
    transaction,
  });
  if (towerStats) {
    await towerStats.increment({ attempts: 1 }, { transaction });
  }
}
