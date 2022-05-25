import type { Association, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  BelongsTo,
  AllowNull,
  ForeignKey,
  AutoIncrement,
  Default,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

import { GameType } from './GameType';

interface LeaderboardEntryAttributes {
  id: number;
  _gameTypeId: string;
  name: string;
  scoreStrategy: ScoreStrategy;
  resetStrategy: ResetStrategy;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntryCreationAttributes {
  _gameTypeId: string;
  name: string;
  scoreStrategy?: ScoreStrategy;
  resetStrategy?: ResetStrategy;
  createdAt?: Date;
  updatedAt?: Date;
}

enum ScoreStrategy {
  HIGHEST = 'highest',
  LOWEST = 'lowest',
  SUM = 'sum',
  LATEST = 'latest',
}

enum ResetStrategy {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  NEVER = 'never',
}

@Table
export class LeaderboardEntry extends Model<
  LeaderboardEntryAttributes,
  LeaderboardEntryCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => GameType)
  @AllowNull(false)
  @Column(DataType.TEXT)
  _gameTypeId!: string;

  @BelongsTo(() => GameType, {
    foreignKey: '_gameTypeId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _gameType?: GameType;

  static associations: {
    _gameType: Association<LeaderboardEntry, GameType>;
  };

  @AllowNull(false)
  @Column(DataType.TEXT)
  name!: string;

  @AllowNull(false)
  @Default(ScoreStrategy.HIGHEST)
  @Column(DataType.TEXT)
  scoreStrategy!: ScoreStrategy;

  @AllowNull(false)
  @Default(ResetStrategy.NEVER)
  @Column(DataType.TEXT)
  resetStrategy!: ResetStrategy;

  @AllowNull(false)
  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @AllowNull(false)
  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}

export function getLeaderBoardsByGameType(_gameTypeId: string, transaction?: Transaction) {
  return LeaderboardEntry.findAll({ where: { _gameTypeId }, transaction });
}

export function createLeaderBoard(
  leaderBoardData: LeaderboardEntryCreationAttributes,
  transaction?: Transaction
) {
  return LeaderboardEntry.create(
    {
      ...leaderBoardData,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { transaction }
  );
}
