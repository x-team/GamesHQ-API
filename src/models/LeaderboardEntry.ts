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
  _gameTypeId: number;
  name: string;
  scoreStrategy: ScoreStrategy;
  resetStrategy: ResetStrategy;
  createdAt: Date;
  updatedAt: Date;
}
export interface LeaderboardEntryCreationAttributes {
  id?: number;
  _gameTypeId: number;
  name: string;
  scoreStrategy?: ScoreStrategy;
  resetStrategy?: ResetStrategy;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum ScoreStrategy {
  HIGHEST = 'highest',
  LOWEST = 'lowest',
  SUM = 'sum',
  LATEST = 'latest',
}

export enum ResetStrategy {
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
  @Column(DataType.INTEGER)
  _gameTypeId!: number;

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

export function getLeaderBoard(
  id: number,
  _gameTypeId: number,
  _createdById: number,
  transaction?: Transaction
) {
  return LeaderboardEntry.findOne<LeaderboardEntry>({
    where: {
      id,
      _gameTypeId,
    },
    include: [
      {
        association: LeaderboardEntry.associations._gameType,
        attributes: ['id'],
        where: {
          _createdById,
        },
      },
    ],
    transaction,
  });
}

export function getLeaderBoardsByGameType(_gameTypeId: number, transaction?: Transaction) {
  return LeaderboardEntry.findAll({ where: { _gameTypeId }, transaction });
}

export function deleteLeaderboardById(id: number, transaction?: Transaction) {
  return LeaderboardEntry.destroy({
    where: {
      id,
    },
    transaction,
  });
}

export function createOrUpdateLeaderBoard(
  leaderBoardData: LeaderboardEntryCreationAttributes,
  transaction?: Transaction
) {
  return LeaderboardEntry.upsert(leaderBoardData, {
    transaction,
    returning: true,
  });
}
