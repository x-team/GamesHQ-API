import type { Association, Transaction, Order } from 'sequelize';
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
  HasMany,
} from 'sequelize-typescript';

import { withTransaction } from '../db';

import { LeaderboardEntry, ScoreStrategy } from './LeaderboardEntry';
import type {
  LeaderboardResultsMetaAttributes,
  LeaderboardResultsMetaCreationAttributes,
} from './LeaderboardResultsMeta';

import { LeaderboardResultsMeta, User } from './';

interface LeaderboardResultsAttributes {
  id: number;
  _leaderboardEntryId: number;
  _userId: number;
  score: number;
  _leaderboardResultsMeta?: LeaderboardResultsMetaAttributes[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardResultsCreationAttributes {
  id?: number;
  _leaderboardEntryId: number;
  _userId: number;
  score: number;
  _leaderboardResultsMeta?: LeaderboardResultsMetaCreationAttributes[];
}

interface ScoreStrategyOptions {
  order: Order;
}

const ScoreStrategyOptionsMap: { [key in ScoreStrategy]: ScoreStrategyOptions } = {
  [ScoreStrategy.HIGHEST]: { order: [['score', 'DESC']] },
  [ScoreStrategy.LOWEST]: { order: [['score', 'ASC']] },
  [ScoreStrategy.SUM]: { order: [['score', 'DESC']] },
  [ScoreStrategy.LATEST]: { order: [['score', 'DESC']] },
};
@Table
export class LeaderboardResults extends Model<
  LeaderboardResultsAttributes,
  LeaderboardResultsCreationAttributes
> {
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

  @AllowNull(false)
  @Column(DataType.INTEGER)
  score!: number;

  @HasMany(() => LeaderboardResultsMeta, '_leaderboardResultsId')
  _leaderboardResultsMeta?: LeaderboardResultsMeta[];

  @AllowNull(false)
  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @AllowNull(false)
  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  static associations: {
    _user: Association<LeaderboardResults, User>;
    _leaderboardEntry: Association<LeaderboardResults, LeaderboardEntry>;
    _leaderboardResultsMeta: Association<LeaderboardResults, LeaderboardResultsMeta>;
  };
}

export function createOrUpdateLeaderBoardResult(
  leaderBoardData: LeaderboardResultsCreationAttributes
) {
  return withTransaction(async (transaction) => {
    //tbd if highest, only save if highest
    //tbd if lowests, only save if lowest
    //tbd if sum, update the  score + what is in db
    //tbd if latest, updates regardless

    const rslt = await LeaderboardResults.upsert(leaderBoardData, { transaction });

    if (rslt.length && leaderBoardData?._leaderboardResultsMeta) {
      for (const meta of leaderBoardData._leaderboardResultsMeta) {
        await LeaderboardResultsMeta.upsert(
          {
            ...meta,
            _leaderboardResultsId: rslt[0].id,
          },
          {
            transaction,
          }
        );
      }
    }

    return rslt;
  });
}

export function getLeaderboardResultRank(
  _leaderboardEntry: LeaderboardEntry,
  limit?: number,
  transaction?: Transaction
) {
  return getOrderedRank(
    _leaderboardEntry.id,
    {
      order: ScoreStrategyOptionsMap[_leaderboardEntry.scoreStrategy].order,
      limit,
    },
    transaction
  );
}

function getOrderedRank(
  _leaderboardEntryId: number,
  options?: { order?: Order; limit?: number },
  transaction?: Transaction
) {
  return LeaderboardResults.findAll({
    where: {
      _leaderboardEntryId,
    },
    include: [
      {
        association: LeaderboardResults.associations._user,
        attributes: ['displayName'],
      },
    ],
    attributes: ['score'],
    order: options?.order,
    limit: options?.limit,
    transaction,
  });
}

export function getUserLeaderboardResult(
  _userId: number,
  _leaderboardEntryId: number,
  transaction?: Transaction
) {
  return LeaderboardResults.findOne({
    where: {
      _userId,
      _leaderboardEntryId,
    },
    transaction,
  });
}
