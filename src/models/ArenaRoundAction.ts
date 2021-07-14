import type { Association, Transaction, WhereOptions } from 'sequelize';
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

import type { ARENA_ACTIONS } from '../games/arena/consts';

import { ArenaAction } from './AvailableAction';

import { AvailableAction, ItemHealthKit, ArenaPlayer, ArenaRound, ItemWeapon, User } from './';

type ARENA_ACTIONS_TYPE = typeof ARENA_ACTIONS;

interface ArenaRoundActionAttributes {
  _arenaPlayerId: number;
  _arenaRoundId: number;
  _availableActionId: ARENA_ACTIONS_TYPE;
  isCompleted: boolean;
  createdAt: Date;
  completedAt: Date | null;
  actionJSON: ArenaAction;
}

interface ArenaRoundActionCreationAttributes {
  _arenaPlayerId: number;
  _arenaRoundId: number;
  _availableActionId: ARENA_ACTIONS_TYPE;
  isCompleted: boolean;
  createdAt: Date;
  completedAt: Date | null;
  actionJSON: ArenaAction;
}

@Table
export class ArenaRoundAction
  extends Model<ArenaRoundActionAttributes, ArenaRoundActionCreationAttributes>
  implements ArenaRoundActionAttributes
{
  @PrimaryKey
  @ForeignKey(() => ArenaPlayer)
  @Column(DataType.INTEGER)
  _arenaPlayerId!: number;

  @BelongsTo(() => ArenaPlayer, '_arenaPlayerId')
  _player?: ArenaPlayer;

  @PrimaryKey
  @ForeignKey(() => ArenaRound)
  @Column(DataType.INTEGER)
  _arenaRoundId!: number;

  @BelongsTo(() => ArenaRound, '_arenaRoundId')
  _round?: ArenaRound;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isCompleted!: boolean;

  @Column(DataType.DATE)
  createdAt!: Date;

  @Default(null)
  @Column(DataType.DATE)
  completedAt!: Date | null;

  @ForeignKey(() => AvailableAction)
  @Column(DataType.TEXT)
  _availableActionId!: ARENA_ACTIONS_TYPE;

  @BelongsTo(() => AvailableAction, '_availableActionId')
  _action?: AvailableAction;

  @Column(DataType.JSONB)
  actionJSON!: ArenaAction;

  static associations: {
    _player: Association<ArenaRoundAction, ArenaPlayer>;
    _round: Association<ArenaRoundAction, ArenaRound>;
    _action: Association<ArenaRoundAction, AvailableAction>;
  };

  completeRoundAction(transaction: Transaction) {
    return this.update(
      {
        isCompleted: true,
        completedAt: new Date(),
      },
      { transaction }
    );
  }
}

export async function setPlayerRoundAction(
  player: ArenaPlayer,
  round: ArenaRound,
  action: ArenaAction,
  transaction: Transaction
) {
  const [roundAction] = await ArenaRoundAction.upsert(
    {
      _arenaPlayerId: player.id,
      _arenaRoundId: round.id,
      _availableActionId: action.id,
      isCompleted: false,
      completedAt: null,
      createdAt: new Date(),
      actionJSON: action,
    },
    { transaction, returning: true }
  );
  return roundAction;
}

export async function findPlayerRoundAction(
  playerId: number,
  roundId: number,
  transaction?: Transaction
) {
  return ArenaRoundAction.findOne({
    where: {
      _arenaPlayerId: playerId,
      _arenaRoundId: roundId,
    },
    transaction,
  });
}

export async function findActionsByRound(
  roundId: number,
  actionId?: string,
  transaction?: Transaction
) {
  return ArenaRoundAction.findAll({
    where: { _arenaRoundId: roundId, _availableActionId: actionId } as WhereOptions,
    include: [
      {
        model: ArenaPlayer,
        include: [User, ItemWeapon, ItemHealthKit],
      },
    ],
    transaction,
  });
}

export async function findPlayerActionsByGame(
  playerId: number,
  gameId: number,
  actionId?: ARENA_ACTIONS_TYPE,
  transaction?: Transaction
) {
  const whereQuery: WhereOptions = {
    _arenaPlayerId: playerId,
    isCompleted: true,
  };

  if (actionId) {
    whereQuery._availableActionId = actionId;
  }

  return ArenaRoundAction.findAll({
    where: whereQuery,
    include: [
      {
        model: ArenaRound,
        where: { _gameId: gameId },
      },
      {
        model: ArenaPlayer,
        include: [User],
      },
    ],
    order: [['completedAt', 'DESC']],
    transaction,
  });
}

export async function removeActionFromRound(
  roundId: number,
  actionId: ARENA_ACTIONS_TYPE,
  transaction: Transaction
) {
  return ArenaRoundAction.destroy({
    where: { _arenaRoundId: roundId, _availableActionId: actionId },
    transaction,
  });
}
