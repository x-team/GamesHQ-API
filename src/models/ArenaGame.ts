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

import { createArenaRound } from './ArenaRound';
import { pickRingSystemAlgorithm } from './ArenaZone';
import { findActiveGame, findLastActiveGame, startGame } from './Game';

import { Game, ArenaRound, User } from './';

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
  declare id: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare hasZoneDeactivation: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare teamBased: boolean;

  // Ring System
  @Default('5')
  @Column(DataType.TEXT)
  declare ringSystemAlgorithm: string;

  @Default(ONE)
  @Column(DataType.INTEGER)
  declare currentRingDeactivation: number;

  @Default(ZERO)
  @Column(DataType.INTEGER)
  declare inactiveZonePenaltyPower: number;

  @Unique
  @ForeignKey(() => Game)
  @Column(DataType.INTEGER)
  declare _gameId: number;

  @BelongsTo(() => Game, {
    foreignKey: '_gameId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _game?: Game;

  @HasMany(() => ArenaRound, '_gameId')
  _rounds?: ArenaRound[];

  static associations: {
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
}

const basicUserInfo = ['id', 'displayName', 'slackId', 'email'];

export async function createArenaGame(
  game: Game,
  { teamBased, hasZoneDeactivation }: ArenaGameCreationAttributes,
  transaction?: Transaction
) {
  const ringSystemAlgorithmPicked = await pickRingSystemAlgorithm(transaction);
  const newArenaGameBuild: ArenaGame = ArenaGame.build({
    teamBased,
    ringSystemAlgorithm: ringSystemAlgorithmPicked,
    hasZoneDeactivation,
    _gameId: game.id,
  });
  const newArenaGame = await newArenaGameBuild.save({ transaction });
  await createArenaRound(
    {
      _createdById: game._createdById,
      _gameId: newArenaGame.id,
      isEveryoneVisible: false,
      isActive: true,
      startedAt: new Date(),
      endedAt: null,
    },
    transaction
  );
  return game.reload({
    include: [
      {
        model: User.unscoped(),
        attributes: basicUserInfo,
      },
      {
        association: Game.associations._arena,
        include: [{ association: ArenaGame.associations._rounds }],
      },
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
  }: {
    name: string;
    _createdById: number;
    teamBased: boolean;
    hasZoneDeactivation?: boolean;
  },
  transaction: Transaction
) {
  const newGame = await startGame(GAME_TYPE.ARENA, name, _createdById, new Date(), transaction);

  return createArenaGame(
    newGame,
    { teamBased, hasZoneDeactivation, _gameId: newGame.id },
    transaction
  );
}

export async function findActiveArenaGame(transaction?: Transaction) {
  return findActiveGame(GAME_TYPE.ARENA, transaction);
}

export async function findLastActiveArenaGame(transaction?: Transaction) {
  return findLastActiveGame(GAME_TYPE.ARENA, transaction);
}
