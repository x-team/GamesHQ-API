import { Op } from 'sequelize';
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
  Unique,
} from 'sequelize-typescript';

import type { GAME_TYPE } from '../games/consts/global';
import { generateSecret } from '../utils/cryptography';

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

  static associations: {
    _createdBy: Association<GameType, User>;
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
  return GameType.findByPk(id, { transaction });
}

export function findGameTypeByName(name: string, transaction?: Transaction) {
  return GameType.findOne({ where: { name }, transaction });
}

export function findAllGameTypesByCreator(creatorId: number, transaction?: Transaction) {
  return GameType.findAll({
    where: {
      [Op.or]: [
        { _createdById: creatorId },
        { id: 1 }, // TBD : hack to return The Tower and Arena, Must chagne once creatorId logic is fixed in FR
        { id: 2 },
      ],
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
    transaction,
  });
}
