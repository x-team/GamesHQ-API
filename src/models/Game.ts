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
import { GameError } from '../games/utils/GameError';

import { findGameTypeByName } from './GameType';

import { User, ArenaGame, GameType, TowerGame, TowerFloor, TowerFloorEnemy } from './';

function includeArrayByGameType(gameTypeName: string) {
  return gameTypeName === GAME_TYPE.ARENA
    ? [
        {
          association: Game.associations._arena,
          include: [ArenaGame.associations._rounds],
        },
      ]
    : [
        {
          association: Game.associations._tower,
          include: [
            {
              association: TowerGame.associations._floors,
              include: [
                {
                  association: TowerFloor.associations._floorEnemies,
                  include: [TowerFloorEnemy.associations._enemy],
                },
              ],
              // order: [['number', 'ASC']],
            },
          ],
        },
      ];
}

interface GameAttributes {
  id: number;
  name: string;
  isActive: boolean;
  startedAt: Date;
  endedAt: Date | null;
  _gameTypeId: number;
  _createdById: number;
}

interface GameCreationAttributes {
  name: string;
  isActive?: boolean;
  startedAt: Date;
  endedAt?: Date | null;
  _createdById: number;
  _gameTypeId: number;
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
  @Column(DataType.INTEGER)
  _gameTypeId!: number;

  @BelongsTo(() => GameType, {
    foreignKey: '_gameTypeId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _gameType?: GameType;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  _createdById!: number;

  @BelongsTo(() => User, {
    foreignKey: '_createdById',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _createdBy?: User;

  @HasOne(() => ArenaGame)
  _arena?: ArenaGame;

  @HasOne(() => TowerGame)
  _tower?: TowerGame;

  static associations: {
    _arena: Association<Game, ArenaGame>;
    _tower: Association<Game, TowerGame>;
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

  async updateGame({ name, isActive }: Partial<GameAttributes>, transaction: Transaction) {
    return this.update(
      {
        name,
        isActive,
      },
      { transaction }
    );
  }
}

const basicUserInfo = ['id', 'displayName', 'slackId', 'email'];

export async function createGame(
  { name, _createdById, startedAt, _gameTypeId }: GameCreationAttributes,
  transaction?: Transaction
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

export async function findActiveGame(gameTypeName: GAME_TYPE | string, transaction?: Transaction) {
  return Game.findOne({
    include: [
      {
        model: User.unscoped(),
        attributes: basicUserInfo,
      },
      {
        model: GameType,
        where: {
          name: gameTypeName,
        },
      },
      ...includeArrayByGameType(gameTypeName),
    ],
    where: {
      isActive: true,
    },
    order: [['startedAt', 'DESC']],
    transaction,
  });
}

export async function findLastActiveGame(
  gameTypeName: GAME_TYPE | string,
  transaction?: Transaction
) {
  return Game.findOne({
    include: [
      {
        model: User.unscoped(),
        attributes: basicUserInfo,
      },
      {
        model: GameType,
        where: {
          name: gameTypeName,
        },
      },
      ...includeArrayByGameType(gameTypeName),
    ],
    where: { isActive: false },
    order: [['endedAt', 'DESC']],
    transaction,
  });
}

export async function startGame(
  gameTypeName: GAME_TYPE | string,
  name: string,
  _createdById: number,
  startedAt: Date,
  transaction: Transaction
) {
  if (!name || !name.trim()) {
    name = generateRandomNameForGame(gameTypeName);
  }
  const activeGame = await findActiveGame(gameTypeName, transaction);
  if (activeGame) {
    throw GameError.activeGameRunning(
      'There is an active game running. End it first (Use /arena-endgame command), then try to create a new one.'
    );
  }

  const gameType = await findGameTypeByName(gameTypeName, transaction);

  if (!gameType) {
    throw GameError.notFound('GameType not found');
  }

  return createGame({ name, _createdById, _gameTypeId: gameType.id, startedAt }, transaction);
}
