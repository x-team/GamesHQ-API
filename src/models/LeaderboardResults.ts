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
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

import { LeaderboardEntry } from './LeaderboardEntry';

import { User } from './';

interface LeaderboardResultsAttributes {
  id: number;
  _leaderboardEntryId: number;
  _userId: number;
  score: number;
  meta: JSON;
  createdAt: Date;
  updatedAt: Date;
}

interface LeaderboardResultsCreationAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

interface LeaderboardResultsBasicCreationAttributes {
  _userId: number;
}

@Table
export class LeaderboardResults
  extends Model<LeaderboardResultsAttributes, LeaderboardResultsCreationAttributes>
  implements LeaderboardResultsAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => LeaderboardEntry)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  _leaderboardEntryId!: number;

  @BelongsTo(() => LeaderboardEntry, {
    foreignKey: '_leaderboardEntryId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _leaderboardEntry?: LeaderboardEntry;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  _userId!: number;

  @BelongsTo(() => User, {
    foreignKey: '_userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _user?: User;

  static associations: {
    _user: Association<LeaderboardResults, User>;
    _leaderboardEntry: Association<LeaderboardResults, LeaderboardEntry>;
  };

  @AllowNull(false)
  @Column(DataType.INTEGER)
  score!: number;

  @AllowNull(true)
  @Column(DataType.JSON)
  meta!: JSON;

  @AllowNull(false)
  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @AllowNull(false)
  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}

export function createLeaderBoardResult(
  leaderBoardData: LeaderboardResultsBasicCreationAttributes,
  transaction?: Transaction
) {
  return LeaderboardResults.create(
    {
      ...leaderBoardData,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { transaction }
  );
}
