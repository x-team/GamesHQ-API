import type { Association, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

import { TowerGame, TowerFloorBattlefield, TowerFloorEnemy } from '.';

interface TowerFloorAttributes {
  id: number;
  number: number;
  isEveryoneVisible: boolean;
  _towerGameId: number;
}

interface TowerFloorCreationAttributes {
  number: number;
  isEveryoneVisible?: boolean;
  _towerGameId: number;
}

@Table({
  indexes: [
    {
      fields: ['_gameId'],
    },
  ],
})
export class TowerFloor
  extends Model<TowerFloorAttributes, TowerFloorCreationAttributes>
  implements TowerFloorAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.INTEGER)
  number!: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isEveryoneVisible!: boolean;

  @ForeignKey(() => TowerGame)
  @Column(DataType.INTEGER)
  _towerGameId!: number;

  @BelongsTo(() => TowerGame, {
    foreignKey: '_gameId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _towerGame?: TowerGame;

  @HasMany(() => TowerFloorEnemy, '_towerFloorId')
  _floorEnemies?: TowerFloorEnemy[];

  @HasMany(() => TowerFloorBattlefield, '_towerFloorId')
  _floorBattlefields?: TowerFloorBattlefield[];

  static associations: {
    _towerGame: Association<TowerFloor, TowerGame>;
    _floorEnemies: Association<TowerFloor, TowerFloorEnemy>;
    _floorBattlefields: Association<TowerFloor, TowerFloorBattlefield>;
  };
}

export function findTowerFloorById(id: number, includeAll: boolean, transaction?: Transaction) {
  return TowerFloor.findByPk(id, {
    include: includeAll
      ? [
          {
            association: TowerFloor.associations._towerGame,
            include: [
              {
                association: TowerGame.associations._floors,
                include: [
                  {
                    association: TowerFloor.associations._floorEnemies,
                    include: [TowerFloorEnemy.associations._enemy],
                  },
                ],
                order: [['number', 'ASC']],
              },
            ],
          },
        ]
      : [
          {
            association: TowerFloor.associations._floorEnemies,
            include: [TowerFloorEnemy.associations._enemy],
          },
        ],
    transaction,
  });
}

export async function addTowerFloors(towerGame: TowerGame, transaction: Transaction) {
  for (let mutableIndex = 1; mutableIndex <= towerGame.height!; mutableIndex++) {
    await TowerFloor.create(
      {
        _towerGameId: towerGame.id,
        number: mutableIndex,
      },
      { transaction }
    );
  }
}

export async function setTowerFloorVisibility(
  floor: TowerFloor,
  isEveryoneVisible: boolean,
  transaction: Transaction
) {
  return floor.isEveryoneVisible !== isEveryoneVisible
    ? floor.update({ isEveryoneVisible }, { transaction })
    : floor;
}
