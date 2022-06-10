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
  Index,
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

  @Index({
    name: 'index_attribute_leaderboardresult',
    unique: true,
  })
  @ForeignKey(() => LeaderboardResults)
  @Column(DataType.INTEGER)
  _leaderboardResultsId!: number;

  @BelongsTo(() => LeaderboardResults, {
    foreignKey: '_leaderboardResultsId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _leaderboardResults?: LeaderboardResults;

  @Index({
    name: 'index_attribute_leaderboardresult',
    unique: true,
  })
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
