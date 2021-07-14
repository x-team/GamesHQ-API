import type { Association, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
  Default,
  BelongsTo,
} from 'sequelize-typescript';

import type { ARENA_PLAYER_PERFORMANCE } from '../games/arena/consts';
import { MAX_TOP_OUTSTANDING_PERFORMANCE } from '../games/arena/consts';
import { ZERO } from '../games/consts/global';

import { Game, ArenaPlayer, User } from './';

interface ArenaPlayerPerformanceAttributes {
  _arenaPlayerId: number;
  _gameId: number;
  cheersReceived: number;
  weaponsFound: number;
  damageDealt: number;
  cheersGiven: number;
  healed: number;
  kills: number;
  firstBlood: boolean;
}

interface ArenaPlayerPerformanceCreationAttributes {
  _arenaPlayerId: number;
  _gameId: number;
  cheersReceived: number;
  weaponsFound: number;
  damageDealt: number;
  cheersGiven: number;
  healed: number;
  kills: number;
  firstBlood: boolean;
}

@Table
export class ArenaPlayerPerformance
  extends Model<ArenaPlayerPerformanceAttributes, ArenaPlayerPerformanceCreationAttributes>
  implements ArenaPlayerPerformanceAttributes
{
  @PrimaryKey
  @ForeignKey(() => ArenaPlayer)
  @Column(DataType.INTEGER)
  _arenaPlayerId!: number;

  @BelongsTo(() => ArenaPlayer, '_arenaPlayerId')
  _player?: ArenaPlayer;

  @PrimaryKey
  @ForeignKey(() => Game)
  @Column(DataType.INTEGER)
  _gameId!: number;

  @BelongsTo(() => Game, '_gameId')
  _game?: Game;

  @Default(ZERO)
  @Column(DataType.INTEGER)
  cheersReceived!: number;

  @Default(ZERO)
  @Column(DataType.INTEGER)
  weaponsFound!: number;

  @Default(ZERO)
  @Column(DataType.INTEGER)
  damageDealt!: number;

  @Default(ZERO)
  @Column(DataType.INTEGER)
  cheersGiven!: number;

  @Default(ZERO)
  @Column(DataType.INTEGER)
  healed!: number;

  @Default(ZERO)
  @Column(DataType.INTEGER)
  kills!: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  firstBlood!: boolean;

  static associations: {
    _game: Association<ArenaPlayerPerformance, Game>;
    _player: Association<ArenaPlayerPerformance, ArenaPlayer>;
  };
}

interface PlayerPerformanceInput {
  field: ARENA_PLAYER_PERFORMANCE;
  value: number;
}

export async function setPlayerPerformanceAction(
  playerId: number,
  gameId: number,
  performance: PlayerPerformanceInput,
  transaction: Transaction
) {
  const [arenaPerformance] = await ArenaPlayerPerformance.findOrCreate({
    where: {
      _arenaPlayerId: playerId,
      _gameId: gameId,
    },
    transaction,
  });
  const { field, value } = performance;
  await arenaPerformance.increment(field, { by: value, transaction });
  return arenaPerformance.reload({ transaction });
}

export async function findPlayersPerformanceByAction(
  gameId: number,
  action: ARENA_PLAYER_PERFORMANCE,
  transaction: Transaction
) {
  return ArenaPlayerPerformance.findAll({
    where: {
      _gameId: gameId,
    },
    include: [{ model: ArenaPlayer, include: [User] }],
    order: [[`${action}`, 'DESC']],
    limit: MAX_TOP_OUTSTANDING_PERFORMANCE,
    transaction,
  });
}

export async function findSinglePlayerPerformance(
  playerId: number,
  gameId: number,
  transaction?: Transaction
) {
  return ArenaPlayerPerformance.findOne({
    where: {
      _arenaPlayerId: playerId,
      _gameId: gameId,
    },
    include: [{ model: ArenaPlayer, include: [User] }],
    transaction,
  });
}

export async function findFirstBlood(gameId: number, transaction?: Transaction) {
  return ArenaPlayerPerformance.findOne({
    where: {
      _gameId: gameId,
      firstBlood: true,
    },
    include: [{ model: ArenaPlayer, include: [User] }],
    transaction,
  });
}

export async function setFirstBlood(playerId: number, gameId: number, transaction: Transaction) {
  const playerPerformance = await findSinglePlayerPerformance(playerId, gameId, transaction);
  if (!playerPerformance?.firstBlood) {
    return playerPerformance?.update({ firstBlood: true }, { transaction });
  }
  return playerPerformance;
}
