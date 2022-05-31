import { Association, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  BelongsTo,
  AllowNull,
  ForeignKey,
} from 'sequelize-typescript';

import { GAME_TYPE } from '../games/consts/global';
import { generateSecret } from '../utils/cryptography';
import { User } from './';

interface GameTypeAttributes {
  id: GAME_TYPE | string;
  clientSecret: string;
  signingSecret: string;
  _createdById: number;
}

interface GameTypeCreationAttributes {
  id: GAME_TYPE | string;
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
  @Column(DataType.TEXT)
  id!: GAME_TYPE | string;

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
  id: GAME_TYPE | string;
  clientSecret?: string;
  signingSecret?: string;
  _createdById: number;
}

export function findGameTypeByClientSecret(clientSecret: string, transaction?: Transaction) {
  return GameType.findOne({ where: { clientSecret }, transaction });
}

export function findGameTypeById(id: string, transaction?: Transaction) {
  return GameType.findByPk(id, { transaction });
}

export function findAllGameTypesByCreator(creatorId: number, transaction?: Transaction) {
  return GameType.findAll({ where: { _createdById: creatorId }, transaction });
}

export async function createOrUpdateGameType(
  gameTypeData: IGameEditorData,
  transaction?: Transaction
) {
  const { id, clientSecret, signingSecret, _createdById } = gameTypeData;
  const valuesToUpdate: GameTypeCreationAttributes = {
    id,
    clientSecret: clientSecret || (await generateSecret()),
    signingSecret: signingSecret || (await generateSecret()),
    _createdById: _createdById,
  };

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
