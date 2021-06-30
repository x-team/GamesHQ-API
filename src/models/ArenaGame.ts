import type { Transaction, Association } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  Default,
  BelongsTo,
  HasMany,
  Unique,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

import { GAME_TYPE, ONE, ZERO } from '../games/consts/global';

import { createGameRound } from './ArenaRound';
import { pickRingSystemAlgorithm } from './ArenaZone';
import type { GameCreationAttributes } from './Game';
import { startGame } from './Game';

import { ArenaPlayer, Game, ArenaRound, User } from './';

interface ArenaGameAttributes {
  id: number;
  hasZoneDeactivation: boolean;
  teamBased: boolean;
  ringSystemAlgorithm: string;
  currentRingDeactivation: number;
  inactiveZonePenaltyPower: number;
  _gameId: number;
}

interface ArenaGameCreationAttributes {
  hasZoneDeactivation?: boolean;
  teamBased?: boolean;
  ringSystemAlgorithm?: string;
  currentRingDeactivation?: number;
  inactiveZonePenaltyPower?: number;
  _gameId: number;
}

@Table({
  indexes: [
    {
      unique: true,
      fields: ['_gameId'],
    },
  ],
})
export class ArenaGame
  extends Model<ArenaGameAttributes, ArenaGameCreationAttributes>
  implements ArenaGameAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  hasZoneDeactivation!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  teamBased!: boolean;

  // Ring System
  @Default('5')
  @Column(DataType.TEXT)
  ringSystemAlgorithm!: string;

  @Default(ONE)
  @Column(DataType.INTEGER)
  currentRingDeactivation!: number;

  @Default(ZERO)
  @Column(DataType.INTEGER)
  inactiveZonePenaltyPower!: number;

  @Unique
  @ForeignKey(() => Game)
  @Column(DataType.INTEGER)
  _gameId!: number;

  @BelongsTo(() => Game, '_gameId')
  _game?: Game;

  @HasMany(() => ArenaRound, '_arenaGameId')
  _rounds?: ArenaRound[];

  @HasMany(() => ArenaPlayer, '_arenaGameId')
  _players?: ArenaPlayer[];

  static associations: {
    _players: Association<ArenaGame, ArenaPlayer>;
    _rounds: Association<ArenaGame, ArenaRound>;
    _game: Association<ArenaGame, Game>;
  };

  toggleZoneDeactivation(hasZoneDeactivation: boolean, transaction: Transaction) {
    return this.update(
      {
        hasZoneDeactivation,
      },
      {
        transaction,
      }
    );
  }

  setRingSystemAlgorithm(algorithm: string, transaction: Transaction) {
    return this.update({ ringSystemAlgorithm: algorithm }, { transaction });
  }

  incrementInactiveZonePenaltyPower(transaction: Transaction) {
    const INCREMENT_BY = 1;
    return this.increment({ inactiveZonePenaltyPower: INCREMENT_BY }, { transaction });
  }

  incrementCurrentRingDeactivation(transaction: Transaction) {
    const INCREMENT_BY = 1;
    return this.increment({ currentRingDeactivation: INCREMENT_BY }, { transaction });
  }

  resetCurrentRingDeactivation(transaction: Transaction) {
    const RESET_BY = 1;
    return this.update({ currentRingDeactivation: RESET_BY }, { transaction });
  }

  async totalPlayersAlive(transaction?: Transaction) {
    await this.reload({
      include: [ArenaPlayer],
      transaction,
    });
    const reduceTotalAlive = (acc: number, player: ArenaPlayer) =>
      player.health > ZERO ? acc + ONE : acc;
    return this._players ? this._players.reduce(reduceTotalAlive, ZERO) : ZERO;
  }
}

const basicUserInfo = ['id', 'displayName', 'slackId', 'email'];

export async function createArenaGame(
  game: Game,
  { teamBased, hasZoneDeactivation }: ArenaGameCreationAttributes,
  transaction: Transaction
) {
  const ringSystemAlgorithmPicked = await pickRingSystemAlgorithm(transaction);
  const newArenaGameBuild: ArenaGame = ArenaGame.build({
    teamBased,
    ringSystemAlgorithm: ringSystemAlgorithmPicked,
    hasZoneDeactivation,
    _gameId: game.id,
  });
  const newArenaGame = await newArenaGameBuild.save({ transaction });
  await createGameRound(newArenaGame.id, game._createdById, false, transaction);
  return newArenaGame.reload({
    include: [
      {
        model: Game,
        include: {
          model: User.unscoped(),
          attributes: basicUserInfo,
        },
      },
      ArenaRound,
    ],
    transaction,
  });
}

export async function startArenaGame(
  {
    name,
    _createdById,
    teamBased,
    hasZoneDeactivation = true,
  }: GameCreationAttributes & ArenaGameCreationAttributes,
  transaction: Transaction
) {
  const newGame = await startGame(
    { name, _createdById, type: GAME_TYPE.ARENA, startedAt: new Date() },
    transaction
  );
  return createArenaGame(
    newGame,
    { teamBased, hasZoneDeactivation, _gameId: newGame.id },
    transaction
  );
}

export async function findActiveArenaGame(transaction?: Transaction) {
  return ArenaGame.findOne({
    include: [
      {
        model: Game,
        where: { isActive: true, type: GAME_TYPE.ARENA },
        include: {
          model: User.unscoped(),
          attributes: basicUserInfo,
        },
        order: [['startedAt', 'DESC']],
      },
      ArenaRound,
    ],
    where: {},
    transaction,
  });
}

export async function findLastActiveArenaGame(transaction?: Transaction) {
  return ArenaGame.findOne({
    include: [
      {
        model: Game,
        where: { isActive: false, type: GAME_TYPE.ARENA },
        include: {
          model: User.unscoped(),
          attributes: basicUserInfo,
        },
        order: [['endedAt', 'DESC']],
      },
      ArenaRound,
    ],
    where: {},
    transaction,
  });
}
