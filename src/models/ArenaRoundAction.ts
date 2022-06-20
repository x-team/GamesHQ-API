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
import { Item } from './Item';

import { AvailableAction, ArenaPlayer, ArenaRound } from './';

type Values<T> = T[keyof T];

export type ARENA_ACTIONS_TYPE = Values<typeof ARENA_ACTIONS>;

// type ARENA_ACTIONS_TYPE = ARENA_ACTIONS[keyof ARENA_ACTIONS];

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
  declare _arenaPlayerId: number;

  @BelongsTo(() => ArenaPlayer, '_arenaPlayerId')
  declare _player?: ArenaPlayer;

  @PrimaryKey
  @ForeignKey(() => ArenaRound)
  @Column(DataType.INTEGER)
  declare _arenaRoundId: number;

  @BelongsTo(() => ArenaRound, '_arenaRoundId')
  declare _round?: ArenaRound;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isCompleted: boolean;

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Default(null)
  @Column(DataType.DATE)
  declare completedAt: Date | null;

  @ForeignKey(() => AvailableAction)
  @Column(DataType.TEXT)
  declare _availableActionId: ARENA_ACTIONS_TYPE;

  @BelongsTo(() => AvailableAction, {
    foreignKey: '_availableActionId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _action?: AvailableAction;

  @Column(DataType.JSONB)
  declare actionJSON: ArenaAction;

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
      _availableActionId: action.id as ARENA_ACTIONS_TYPE,
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
        association: ArenaRoundAction.associations._player,
        include: [
          ArenaPlayer.associations._user,
          {
            association: ArenaPlayer.associations._healthkits,
            include: [Item.associations._healthkit],
            as: '_healthkits',
          },
          {
            association: ArenaPlayer.associations._weapons,
            include: [Item.associations._weapon, Item.associations._traits],
            as: '_weapons',
          },
          {
            association: ArenaPlayer.associations._armors,
            include: [Item.associations._armor],
            as: '_armors',
          },
        ],
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
        association: ArenaRoundAction.associations._round,
        where: { _gameId: gameId },
      },
      {
        association: ArenaRoundAction.associations._player,
        include: [ArenaPlayer.associations._user],
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
