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
  Unique,
} from 'sequelize-typescript';
import { v4 as uuid4 } from 'uuid';

import { logger } from '../config';
import { MILLISECONDS_IN_A_MONTH } from '../consts/api';
import { ZERO } from '../games/consts/global';

import { User } from './';

interface SessionAttributes {
  id: number;
  _userId: number;
  token: string;
  expireTime: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SessionCreationAttributes {
  _userId: number;
  token?: string;
  expireTime?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SessionBasicCreationAttributes {
  _userId: number;
}

interface SessionUpdateAttributes {
  id: number;
  _userId: number;
}

@Table
export class Session
  extends Model<SessionAttributes, SessionCreationAttributes>
  implements SessionAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare token: string;

  @AllowNull(false)
  @Default(ZERO)
  @Column(DataType.DOUBLE)
  declare expireTime: number;

  @AllowNull(false)
  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @AllowNull(false)
  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;

  @Unique
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare _userId: number;

  @BelongsTo(() => User, {
    foreignKey: '_userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _user?: User;

  static associations: {
    _user: Association<Session, User>;
  };
}

export function findSessionById(id: number, transaction?: Transaction) {
  return Session.findByPk(id, { transaction });
}

export function findSessionByToken(token: string, transaction?: Transaction) {
  return Session.findOne({ where: { token }, transaction });
}

export function findSessionByUser(userId: number, transaction?: Transaction) {
  return Session.findOne({ where: { _userId: userId }, transaction });
}

export function findSessionByUserEmail(email: string, transaction?: Transaction) {
  return Session.findOne({ include: [{ model: User, where: { email } }], transaction });
}

export function deleteSessionById(id: number, transaction?: Transaction) {
  return Session.destroy({
    where: {
      id,
    },
    transaction,
  });
}

export function deleteSessionByUser(userId: number, transaction?: Transaction) {
  return Session.destroy({
    where: {
      _userId: userId,
    },
    transaction,
  });
}

export function createSession(
  sessionData: SessionBasicCreationAttributes,
  transaction?: Transaction
) {
  const token = uuid4();
  const expireTimeDate = new Date();
  const expireTime = expireTimeDate.setMilliseconds(
    expireTimeDate.getMilliseconds() + MILLISECONDS_IN_A_MONTH
  );
  return Session.create(
    {
      ...sessionData,
      token,
      expireTime,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { transaction }
  );
}

export function updateSession(
  sessionData: SessionUpdateAttributes,
  updateToken = true,
  transaction?: Transaction
) {
  const token = uuid4();
  const expireTimeDate = new Date();
  const expireTime = expireTimeDate.setMilliseconds(
    expireTimeDate.getMilliseconds() + MILLISECONDS_IN_A_MONTH
  );
  const fieldsToUpdate: Partial<SessionAttributes> = {
    expireTime,
    updatedAt: new Date(),
  };
  if (updateToken) {
    fieldsToUpdate.token = token;
  }
  logger.info({ expireTime, updatedAt: expireTimeDate });
  return Session.update(fieldsToUpdate, {
    where: {
      ...sessionData,
    },
    transaction,
  });
}
