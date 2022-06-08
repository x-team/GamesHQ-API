import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AllowNull,
  ForeignKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
} from 'sequelize-typescript';

import { LeaderboardResults } from './';

export interface LeaderboardResultsMetaAttributes {
  id: number;
  _leaderboardResultsId: number;
  attribute: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardResultsMetaCreationAttributes {
  id?: number;
  _leaderboardResultsId?: number;
  attribute: string;
  value: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Table
export class LeaderboardResultsMeta extends Model<
  LeaderboardResultsMetaAttributes,
  LeaderboardResultsMetaCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => LeaderboardResults)
  @Column(DataType.INTEGER)
  _leaderboardResultsId!: number;

  @BelongsTo(() => LeaderboardResults, {
    foreignKey: '_leaderboardResultsId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _leaderboardResults?: LeaderboardResults;

  @AllowNull(false)
  @Column(DataType.TEXT)
  attribute!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  value!: string;

  @AllowNull(false)
  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @AllowNull(false)
  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
