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
  Index,
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
  orderBy: Order;
  beforeUpsert: (
    data: LeaderboardResultsCreationAttributes,
    lbrInDb: LeaderboardResults
  ) => boolean;
}

const mapScoreStrategyOptions: { [key in ScoreStrategy]: ScoreStrategyOptions } = {
  [ScoreStrategy.HIGHEST]: {
    orderBy: [['score', 'DESC']],
    beforeUpsert: (data: LeaderboardResultsCreationAttributes, lbrInDb: LeaderboardResults) =>
      data.score > lbrInDb.score,
  },
  [ScoreStrategy.LOWEST]: {
    orderBy: [['score', 'ASC']],
    beforeUpsert: (data: LeaderboardResultsCreationAttributes, lbrInDb: LeaderboardResults) =>
      data.score < lbrInDb.score,
  },
  [ScoreStrategy.SUM]: {
    orderBy: [['score', 'DESC']],
    beforeUpsert: (data: LeaderboardResultsCreationAttributes, lbrInDb: LeaderboardResults) => {
      data.score = data.score + lbrInDb.score;
      return true;
    },
  },
  [ScoreStrategy.LATEST]: {
    orderBy: [['score', 'DESC']],
    beforeUpsert: (_: LeaderboardResultsCreationAttributes, __: LeaderboardResults) => true,
  },
};
@Table
export class LeaderboardResults extends Model<
  LeaderboardResultsAttributes,
  LeaderboardResultsCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Index({
    name: 'index_user_leaderboard',
    unique: true,
  })
  @ForeignKey(() => LeaderboardEntry)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare _leaderboardEntryId: number;

  @BelongsTo(() => LeaderboardEntry, {
    foreignKey: '_leaderboardEntryId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _leaderboardEntry?: LeaderboardEntry;

  @Index({
    name: 'index_user_leaderboard',
    unique: true,
  })
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare _userId: number;

  @BelongsTo(() => User, {
    foreignKey: '_userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _user?: User;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare score: number;

  @HasMany(() => LeaderboardResultsMeta, '_leaderboardResultsId')
  declare _leaderboardResultsMeta?: LeaderboardResultsMeta[];

  @AllowNull(false)
  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @AllowNull(false)
  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;

  static associations: {
    _user: Association<LeaderboardResults, User>;
    _leaderboardEntry: Association<LeaderboardResults, LeaderboardEntry>;
    _leaderboardResultsMeta: Association<LeaderboardResults, LeaderboardResultsMeta>;
  };
}

export function createOrUpdateLeaderBoardResult(data: LeaderboardResultsCreationAttributes) {
  return withTransaction(async (transaction) => {
    const lbrInDb = await getUserLeaderboardResultWithScoreStrategy(
      data._userId,
      data._leaderboardEntryId
    );

    if (shouldUpsert(data, lbrInDb)) {
      const rslt = await LeaderboardResults.upsert(
        {
          ...data,
          id: lbrInDb?.id,
        },
        {
          transaction,
          conflictFields: ['_userId', '_leaderboardEntryId'],
        }
      );

      if (rslt.length && data?._leaderboardResultsMeta) {
        for (const meta of data._leaderboardResultsMeta) {
          await LeaderboardResultsMeta.upsert(
            {
              ...meta,
              _leaderboardResultsId: rslt[0].id,
            },
            {
              transaction,
              conflictFields: ['attribute', '_leaderboardResultsId'],
            }
          );
        }
      }

      return rslt;
    }

    return;
  });
}

export function updateLeaderBoardResult(
  data: LeaderboardResultsCreationAttributes & { id: number }
) {
  return withTransaction(async (transaction) => {
    const [, rslt] = await LeaderboardResults.update(
      {
        score: data.score,
      },
      {
        where: {
          id: data.id,
        },
        transaction,
        returning: true,
      }
    );

    if (rslt.length && data?._leaderboardResultsMeta) {
      for (const meta of data._leaderboardResultsMeta) {
        await LeaderboardResultsMeta.upsert(
          {
            ...meta,
            _leaderboardResultsId: data.id,
          },
          {
            transaction,
            conflictFields: ['attribute', '_leaderboardResultsId'],
          }
        );
      }
    }

    return rslt[0];
  });
}

function shouldUpsert(
  data: LeaderboardResultsCreationAttributes,
  lbrInDb: LeaderboardResults | null
): boolean {
  const scoreStrategy = lbrInDb?._leaderboardEntry?.scoreStrategy;
  if (lbrInDb && scoreStrategy) {
    return mapScoreStrategyOptions[scoreStrategy].beforeUpsert(data, lbrInDb);
  }

  return true;
}

export function getLeaderboardResultRank(
  _leaderboardEntry: LeaderboardEntry,
  limit = 10,
  transaction?: Transaction
) {
  return LeaderboardResults.findAll({
    where: {
      _leaderboardEntryId: _leaderboardEntry.id,
    },
    include: [
      {
        association: LeaderboardResults.associations._user,
        attributes: ['displayName', 'email'],
      },
    ],
    attributes: ['score'],
    order: mapScoreStrategyOptions[_leaderboardEntry.scoreStrategy].orderBy,
    limit,
    transaction,
  });
}

export function getLeaderboardResultRankWithMeta(
  _leaderboardEntry: LeaderboardEntry,
  transaction?: Transaction
) {
  return LeaderboardResults.findAll({
    where: {
      _leaderboardEntryId: _leaderboardEntry.id,
    },
    include: [
      {
        association: LeaderboardResults.associations._user,
        attributes: ['displayName', 'email'],
      },
      {
        association: LeaderboardResults.associations._leaderboardResultsMeta,
        attributes: ['value', 'attribute'],
      },
    ],
    attributes: ['id', 'score', '_user.email', '_leaderboardResultsMeta.value'],
    order: mapScoreStrategyOptions[_leaderboardEntry.scoreStrategy].orderBy,
    transaction,
  });
}

export function getUserLeaderboardResult(
  _userId: number,
  _leaderboardEntryId: number,
  _gametypeId: number,
  transaction?: Transaction
) {
  return LeaderboardResults.findOne({
    where: {
      _userId,
      _leaderboardEntryId,
    },
    include: [
      {
        association: LeaderboardResults.associations._leaderboardEntry,
        attributes: [],
        include: [
          {
            association: LeaderboardEntry.associations._gameType,
            attributes: [],
            where: {
              id: _gametypeId,
            },
          },
        ],
      },
    ],
    transaction,
  });
}

function getUserLeaderboardResultWithScoreStrategy(
  _userId: number,
  _leaderboardEntryId: number,
  transaction?: Transaction
) {
  return LeaderboardResults.findOne({
    where: {
      _userId,
      _leaderboardEntryId,
    },
    include: [
      {
        association: LeaderboardResults.associations._leaderboardEntry,
        attributes: ['scoreStrategy'],
      },
    ],
    transaction,
  });
}

export function deleteLeaderboardResult(id: number, leaderboardId: number) {
  return LeaderboardResults.destroy({
    where: {
      id,
      _leaderboardEntryId: leaderboardId,
    },
  });
}
