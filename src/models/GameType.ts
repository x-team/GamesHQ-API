import type { Association, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  BelongsTo,
  HasMany,
  AllowNull,
  ForeignKey,
  Unique,
} from 'sequelize-typescript';

import type { GAME_TYPE } from '../games/consts/global';
import { generateSecret } from '../utils/cryptography';

import { Achievement } from './Achievements';
import { LeaderboardEntry } from './LeaderboardEntry';

import { User } from './';

interface GameTypeAttributes {
  id: number;
  name: GAME_TYPE | string;
  clientSecret: string;
  signingSecret: string;
  _createdById: number;
}

interface GameTypeCreationAttributes {
  id?: number;
  name: GAME_TYPE | string;
  clientSecret: string;
  signingSecret: string;
  _createdById: number;
}

@Table
export class GameType
  extends Model<GameTypeAttributes, GameTypeCreationAttributes>
  implements GameTypeAttributes
{
  @PrimaryKey
  @Column(DataType.INTEGER)
  id!: number;

  @Unique(true)
  @AllowNull(false)
  @Column(DataType.TEXT)
  name!: GAME_TYPE | string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  clientSecret!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  signingSecret!: string;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  _createdById!: number;

  @BelongsTo(() => User, {
    foreignKey: '_createdById',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _createdBy?: User;

  @HasMany(() => LeaderboardEntry, '_gameTypeId')
  _leaderboards?: LeaderboardEntry[];

  @HasMany(() => Achievement, '_gameTypeId')
  _acheivements?: Achievement[];

  static associations: {
    _createdBy: Association<GameType, User>;
    _leaderboards: Association<GameType, LeaderboardEntry>;
    _acheivements: Association<GameType, Achievement>;
  };
}

export interface IGameEditorData {
  id?: number;
  name: GAME_TYPE | string;
  clientSecret?: string;
  signingSecret?: string;
  _createdById: number;
}

export function findGameTypeByClientSecret(clientSecret: string, transaction?: Transaction) {
  return GameType.findOne({ where: { clientSecret }, transaction });
}

export function findGameTypeById(id: number, transaction?: Transaction) {
  return GameType.findByPk(id, {
    transaction,
    include: [GameType.associations._leaderboards, GameType.associations._acheivements],
  });
}

export function findGameTypeByName(name: string, transaction?: Transaction) {
  return GameType.findOne({ where: { name }, transaction });
}

export function findAllGameTypesByCreator(creatorId: number, transaction?: Transaction) {
  return GameType.findAll({
    where: {
      _createdById: creatorId,
    },
    transaction,
  });
}

export async function createOrUpdateGameType(
  gameTypeData: IGameEditorData,
  transaction?: Transaction
) {
  const { id, name, clientSecret, signingSecret, _createdById } = gameTypeData;

  const valuesToUpdate: GameTypeCreationAttributes = {
    id,
    name,
    clientSecret: clientSecret || (await generateSecret()),
    signingSecret: signingSecret || (await generateSecret()),
    _createdById: _createdById,
  };

  if (!id) {
    delete valuesToUpdate.id;
  }

  return GameType.upsert(valuesToUpdate, { transaction });
}

export function deleteGameTypeById(id: number, transaction?: Transaction) {
  return GameType.destroy({
    where: {
      id,
    },
    cascade: true,
    transaction,
  });
}
