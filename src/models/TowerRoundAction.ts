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
  AllowNull,
  AutoIncrement,
} from 'sequelize-typescript';

import { ITEM_TYPE } from '../games/consts/global';
import type { TOWER_ACTIONS } from '../games/tower/consts';

import { TowerAction } from './AvailableAction';

import {
  AvailableAction,
  Item,
  TowerRaider,
  TowerRound,
  TowerFloorBattlefieldEnemy,
  TowerFloorEnemy,
} from '.';

type Values<T> = T[keyof T];

export type TOWER_ACTIONS_TYPE = Values<typeof TOWER_ACTIONS>;

interface TowerRoundActionAttributes {
  id: number;
  isCompleted: boolean;
  createdAt: Date;
  completedAt: Date | null;
  actionJSON: TowerAction;
  _towerRaiderId: number;
  _towerRoundId: number;
  _availableActionId: TOWER_ACTIONS_TYPE;
  _towerFloorBattlefieldEnemyId: number;
}

interface TowerRoundActionCreationAttributes {
  isCompleted: boolean;
  completedAt?: Date | null;
  createdAt: Date;
  actionJSON: TowerAction;
  _towerRaiderId: number | null;
  _towerRoundId: number;
  _availableActionId: TOWER_ACTIONS_TYPE;
  _towerFloorBattlefieldEnemyId: number | null;
}

function includeRaiderInventory() {
  return [
    TowerRaider.associations._user,
    TowerRaider.associations._perks,
    {
      association: TowerRaider.associations._healthkits,
      include: [Item.associations._healthkit],
      where: {
        type: ITEM_TYPE.HEALTH_KIT,
      },
      required: false,
      as: '_healthkits',
    },
    {
      association: TowerRaider.associations._weapons,
      include: [Item.associations._weapon, Item.associations._traits],
      where: {
        type: ITEM_TYPE.WEAPON,
      },
      required: false,
      as: '_weapons',
    },
    {
      association: TowerRaider.associations._armors,
      include: [Item.associations._armor],
      where: {
        type: ITEM_TYPE.ARMOR,
      },
      required: false,
      as: '_armors',
    },
  ];
}

@Table({
  indexes: [
    {
      fields: ['_towerRaiderId'],
    },
    {
      fields: ['_towerRoundId'],
    },
    {
      fields: ['_towerFloorBattlefieldEnemyId'],
    },
    {
      unique: true,
      fields: ['_towerRoundId', '_towerRaiderId', '_towerFloorBattlefieldEnemyId'],
    },
  ],
})
export class TowerRoundAction
  extends Model<TowerRoundActionAttributes, TowerRoundActionCreationAttributes>
  implements TowerRoundActionAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => TowerRaider)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  _towerRaiderId!: number;

  @BelongsTo(() => TowerRaider, {
    foreignKey: '_towerRaiderId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _raider?: TowerRaider;

  @ForeignKey(() => TowerFloorBattlefieldEnemy)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  _towerFloorBattlefieldEnemyId!: number;

  @BelongsTo(() => TowerFloorBattlefieldEnemy, {
    foreignKey: '_towerFloorBattlefieldEnemyId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _enemy?: TowerFloorBattlefieldEnemy;

  @ForeignKey(() => TowerRound)
  @Column(DataType.INTEGER)
  _towerRoundId!: number;

  @BelongsTo(() => TowerRound, {
    foreignKey: '_towerRoundId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _round?: TowerRound;

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
  _availableActionId!: TOWER_ACTIONS_TYPE;

  @BelongsTo(() => AvailableAction, '_availableActionId')
  _action?: AvailableAction;

  @Column(DataType.JSONB)
  actionJSON!: TowerAction;

  static associations: {
    _action: Association<TowerRoundAction, AvailableAction>;
    _round: Association<TowerRoundAction, TowerRound>;
    _enemy: Association<TowerRoundAction, TowerFloorBattlefieldEnemy>;
    _raider: Association<TowerRoundAction, TowerRaider>;
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

interface RoundActionKey {
  raiderId?: number | null;
  enemyId?: number | null;
  roundId: number;
}

interface RoundActionParams extends RoundActionKey {
  action: TowerAction;
}

export async function setRoundAction(
  { raiderId = null, enemyId = null, roundId, action }: RoundActionParams,
  transaction: Transaction
) {
  // upsert will not work here
  let mutableRoundAction = await findRoundAction({ raiderId, enemyId, roundId }, transaction);
  if (mutableRoundAction) {
    mutableRoundAction.createdAt = new Date();
    mutableRoundAction._availableActionId = action.id as TOWER_ACTIONS_TYPE;
    mutableRoundAction.actionJSON = action;
  } else {
    mutableRoundAction = await TowerRoundAction.create(
      {
        _towerRaiderId: raiderId,
        _towerFloorBattlefieldEnemyId: enemyId,
        _towerRoundId: roundId,
        isCompleted: false,
        createdAt: new Date(),
        _availableActionId: action.id as TOWER_ACTIONS_TYPE,
        actionJSON: action,
      },
      { transaction }
    );
  }
  return mutableRoundAction.save({ transaction });
}

export async function findAllActionsByRound(roundId: number, transaction: Transaction) {
  return TowerRoundAction.findAll({
    where: {
      _towerRoundId: roundId,
    },
    include: [
      {
        association: TowerRoundAction.associations._raider,
        include: includeRaiderInventory(),
      },
      {
        association: TowerRoundAction.associations._enemy,
        include: [
          {
            association: TowerFloorBattlefieldEnemy.associations._towerFloorEnemy,
            include: [TowerFloorEnemy.associations._enemy],
          },
        ],
      },
    ],
    transaction,
  });
}

export async function findRoundAction(
  { raiderId = null, enemyId = null, roundId }: RoundActionKey,
  transaction?: Transaction
) {
  return TowerRoundAction.findOne({
    where: {
      _towerRaiderId: raiderId ?? undefined,
      _towerFloorBattlefieldEnemyId: enemyId ?? undefined,
      _towerRoundId: roundId ?? undefined,
    },
    transaction,
  });
}

export async function findLastRaiderActionByRound(
  { raiderId, roundId }: RoundActionKey,
  transaction?: Transaction
) {
  return TowerRoundAction.findOne({
    where: { _towerRoundId: roundId, isCompleted: true, _towerRaiderId: raiderId } as WhereOptions,
    include: [
      {
        association: TowerRoundAction.associations._raider,
        include: includeRaiderInventory(),
      },
    ],
    order: [['completedAt', 'DESC']],
    transaction,
  });
}

export async function removeActionFromRound(
  roundId: number,
  actionId: TOWER_ACTIONS_TYPE,
  transaction: Transaction
) {
  return TowerRoundAction.destroy({
    where: {
      _towerRoundId: roundId,
      _availableActionId: actionId,
    },
    transaction,
  });
}

export async function removeActionsByFloorBattlefieldEnemy(
  battlefieldEnemyId: number,
  transaction: Transaction
) {
  return TowerRoundAction.destroy({
    where: { _towerFloorBattlefieldEnemyId: battlefieldEnemyId },
    transaction,
  });
}
