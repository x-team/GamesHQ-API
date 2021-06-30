import type { Transaction, Association } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  Default,
  BelongsTo,
  AllowNull,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

import { GAME_TYPE } from '../games/consts/global';
import { generateRandomNameForGame } from '../games/utils';

import { User } from './';

interface GameAttributes {
  id: number;
  name: string;
  isActive: boolean;
  startedAt: Date;
  endedAt: Date | null;
  type: GAME_TYPE;
  _createdById: number;
}

export interface GameCreationAttributes {
  name: string;
  isActive?: boolean;
  startedAt: Date;
  endedAt?: Date | null;
  _createdById: number;
  type: GAME_TYPE;
}

@Table({
  indexes: [
    {
      fields: ['name'],
    },
    {
      fields: ['isActive'],
    },
  ],
})
export class Game extends Model<GameAttributes, GameCreationAttributes> implements GameAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.TEXT)
  name!: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @Column(DataType.DATE)
  startedAt!: Date;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.DATE)
  endedAt!: Date | null;

  @Column(DataType.TEXT)
  type!: GAME_TYPE;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  _createdById!: number;

  @BelongsTo(() => User)
  _createdBy?: User;

  static associations: {
    _createdBy: Association<Game, User>;
  };

  async endGame(transaction: Transaction) {
    await this.update(
      {
        isActive: false,
        endedAt: new Date(),
      },
      { transaction }
    );
    return this.get({ plain: true });
  }
}

const basicUserInfo = ['id', 'displayName', 'slackId', 'email'];

export async function createGame(
  { name, _createdById, startedAt, type }: GameCreationAttributes,
  transaction: Transaction
) {
  const newGame = Game.build({
    name,
    isActive: true,
    startedAt,
    _createdById,
    type,
  });
  const game = await newGame.save({ transaction });
  return game.reload({
    include: [
      {
        model: User.unscoped(),
        attributes: basicUserInfo,
      },
    ],
    transaction,
  });
}

export async function findActiveGame(type: GAME_TYPE, transaction?: Transaction) {
  return Game.findOne({
    include: [
      {
        model: User.unscoped(),
        attributes: basicUserInfo,
      },
    ],
    where: { isActive: true, type },
    transaction,
  });
}

export async function findLastActiveGame(type: GAME_TYPE, transaction?: Transaction) {
  return Game.findOne({
    include: [
      {
        model: User.unscoped(),
        attributes: basicUserInfo,
      },
    ],
    where: { isActive: false, type },
    order: [['endedAt', 'DESC']],
    transaction,
  });
}

export async function startGame(
  { name, _createdById, type, startedAt }: GameCreationAttributes,
  transaction: Transaction
) {
  if (!name || !name.trim()) {
    name = generateRandomNameForGame(type);
  }
  const activeGame = await findActiveGame(type, transaction);
  if (activeGame) {
    throw Error('There is an active game. End it first, then try to create a new one');
  }
  return createGame({ name, _createdById, type, startedAt }, transaction);
}
