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
  HasOne,
} from 'sequelize-typescript';

import { GAME_TYPE } from '../games/consts/global';
import { generateRandomNameForGame } from '../games/utils';

import { User, ArenaGame, GameType } from './';

function includeArrayByGameType(type: GAME_TYPE) {
  return type === GAME_TYPE.ARENA
    ? [
        {
          association: Game.associations._arena,
          include: [ArenaGame.associations._rounds],
        },
      ]
    : [
        /*
        {
          model: TowerGame,
          include: [TowerRound],
        },
    */
      ];
}

interface GameAttributes {
  id: number;
  name: string;
  isActive: boolean;
  startedAt: Date;
  endedAt: Date | null;
  _gameTypeId: GAME_TYPE;
  _createdById: number;
}

interface GameCreationAttributes {
  name: string;
  isActive?: boolean;
  startedAt: Date;
  endedAt?: Date | null;
  _createdById: number;
  _gameTypeId: GAME_TYPE;
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

  @ForeignKey(() => GameType)
  @Column(DataType.TEXT)
  _gameTypeId!: GAME_TYPE;

  @BelongsTo(() => GameType, '_gameTypeId')
  _gameType?: GameType;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  _createdById!: number;

  @BelongsTo(() => User)
  _createdBy?: User;

  @HasOne(() => ArenaGame)
  _arena?: ArenaGame;

  // @HasOne(() => TowerGame)
  // _tower?: TowerGame;

  static associations: {
    _arena: Association<Game, ArenaGame>;
    _createdBy: Association<Game, User>;
    _gameType: Association<Game, GameType>;
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
  { name, _createdById, startedAt, _gameTypeId }: GameCreationAttributes,
  transaction: Transaction
) {
  const newGame = Game.build({
    name,
    isActive: true,
    startedAt,
    _createdById,
    _gameTypeId,
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

export async function findActiveGame(gameType: GAME_TYPE, transaction?: Transaction) {
  return Game.findOne({
    include: [
      {
        model: User.unscoped(),
        attributes: basicUserInfo,
      },
      ...includeArrayByGameType(gameType),
    ],
    where: { isActive: true, _gameTypeId: gameType },
    order: [['startedAt', 'DESC']],
    transaction,
  });
}

export async function findLastActiveGame(gameType: GAME_TYPE, transaction?: Transaction) {
  return Game.findOne({
    include: [
      {
        model: User.unscoped(),
        attributes: basicUserInfo,
      },
      ...includeArrayByGameType(gameType),
    ],
    where: { isActive: false, _gameTypeId: gameType },
    order: [['endedAt', 'DESC']],
    transaction,
  });
}

export async function startGame(
  { name, _createdById, _gameTypeId, startedAt }: GameCreationAttributes,
  transaction: Transaction
) {
  if (!name || !name.trim()) {
    name = generateRandomNameForGame(_gameTypeId);
  }
  const activeGame = await findActiveGame(_gameTypeId, transaction);
  if (activeGame) {
    throw Error('There is an active game. End it first, then try to create a new one');
  }
  return createGame({ name, _createdById, _gameTypeId, startedAt }, transaction);
}
