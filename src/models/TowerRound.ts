import type { Association, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  Default,
  BelongsTo,
  HasMany,
  AutoIncrement,
  PrimaryKey,
} from 'sequelize-typescript';

import {
  TowerRoundAction,
  TowerRaider,
  User,
  Item,
  TowerFloorEnemy,
  TowerFloorBattlefield,
  TowerFloorBattlefieldEnemy,
} from '.';
import { ITEM_TYPE } from '../games/consts/global';

interface TowerRoundAttributes {
  id: number;
  isActive: boolean;
  isEveryoneVisible: boolean;
  startedAt: Date;
  endedAt: Date | null;
  _towerFloorBattlefieldId: number;
  _createdById: number;
}

interface TowerRoundCreationAttributes {
  isEveryoneVisible: boolean;
  startedAt: Date;
  isActive?: boolean;
  endedAt?: Date | null;
  _towerFloorBattlefieldId: number;
  _createdById: number;
}

function includeAllAssociations(includeAll: boolean) {
  return includeAll
    ? [
        {
          association: TowerRound.associations._actions,
          include: [
            {
              association: TowerRoundAction.associations._raider,
              include: [
                TowerRaider.associations._user,
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
              ],
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
        },
      ]
    : [];
}

@Table({
  indexes: [
    {
      fields: ['isActive', '_towerFloorBattlefieldId'],
    },
    {
      fields: ['_towerFloorBattlefieldId'],
    },
  ],
})
export class TowerRound
  extends Model<TowerRoundAttributes, TowerRoundCreationAttributes>
  implements TowerRoundAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isEveryoneVisible: boolean;

  @Column(DataType.DATE)
  declare startedAt: Date;

  @Default(null)
  @Column(DataType.DATE)
  declare endedAt: Date | null;

  @ForeignKey(() => TowerFloorBattlefield)
  @Column(DataType.INTEGER)
  declare _towerFloorBattlefieldId: number;

  @BelongsTo(() => TowerFloorBattlefield, {
    foreignKey: '_towerFloorBattlefieldId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _floorBattlefield?: TowerFloorBattlefield;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare _createdById: number;

  @BelongsTo(() => User, {
    foreignKey: '_createdById',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  declare _createdBy?: User;

  @HasMany(() => TowerRoundAction, '_towerRoundId')
  declare _actions?: TowerRoundAction[];

  static associations: {
    _createdBy: Association<TowerRound, User>;
    _floorBattlefield: Association<TowerRound, TowerFloorBattlefield>;
    _actions: Association<TowerRound, TowerRoundAction>;
  };

  makeEveryoneVisible(transaction: Transaction) {
    return this.update({ isEveryoneVisible: true }, { transaction });
  }

  endRound(transaction: Transaction) {
    return this.update(
      {
        isActive: false,
        endedAt: new Date(),
      },
      { transaction }
    );
  }
}

export function findActiveRound(
  floorBatllefieldId: number,
  includeAll: boolean,
  transaction?: Transaction
) {
  return TowerRound.findOne({
    where: { isActive: true, _towerFloorBattlefieldId: floorBatllefieldId },
    include: [
      TowerRound.associations._createdBy,
      TowerRound.associations._floorBattlefield,
      ...includeAllAssociations(includeAll),
    ],
    transaction,
  });
}

export function findPreviousRound(floorBatllefieldId: number, transaction?: Transaction) {
  return TowerRound.findOne({
    where: { isActive: false, _towerFloorBattlefieldId: floorBatllefieldId },
    include: [TowerRound.associations._createdBy, TowerRound.associations._floorBattlefield],
    order: [['endedAt', 'DESC']],
    transaction,
  });
}

export async function startRound(
  floorBattlefieldId: number,
  createdById: number,
  isEveryoneVisible: boolean,
  transaction: Transaction
) {
  const activeRound = await findActiveRound(floorBattlefieldId, false, transaction);
  if (activeRound) {
    await activeRound.endRound(transaction);
  }
  return createGameRound(
    {
      _towerFloorBattlefieldId: floorBattlefieldId,
      _createdById: createdById,
      isEveryoneVisible,
      startedAt: new Date(),
    },
    transaction
  );
}

export async function createGameRound(
  {
    _towerFloorBattlefieldId,
    _createdById,
    isEveryoneVisible = false,
    startedAt,
  }: TowerRoundCreationAttributes,
  transaction: Transaction
) {
  return TowerRound.create(
    {
      _towerFloorBattlefieldId,
      _createdById,
      isEveryoneVisible,
      startedAt,
    },
    { transaction }
  );
}
