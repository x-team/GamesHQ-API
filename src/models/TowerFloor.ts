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

import { Enemy, Game, TowerFloorBattlefield, TowerFloorEnemy } from '.';

interface TowerFloorAttributes {
  id: number;
  number: number;
  isEveryoneVisible: boolean;
  _gameId: number;
}

interface TowerFloorCreationAttributes {
  number: number;
  isEveryoneVisible?: boolean;
  _gameId: number;
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

  @ForeignKey(() => Game)
  @Column(DataType.INTEGER)
  _gameId!: number;

  @BelongsTo(() => Game, {
    foreignKey: '_gameId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _game?: Game;

  @HasMany(() => TowerFloorEnemy, '_towerFloorId')
  _floorEnemies?: TowerFloorEnemy[];

  @HasMany(() => TowerFloorBattlefield, '_towerFloorId')
  _floorBattlefields?: TowerFloorBattlefield[];

  static associations: {
    _game: Association<TowerFloor, Game>;
    _floorEnemies: Association<TowerFloor, TowerFloorEnemy>;
    _floorBattlefields: Association<TowerFloor, TowerFloorBattlefield>;
  };
}

export function findTowerFloorById(id: number, includeAll: boolean, transaction?: Transaction) {
  return TowerFloor.findByPk(id, {
    include: includeAll
      ? [
          {
            model: Game,
            include: [
              {
                model: TowerFloor,
                include: [{ model: TowerFloorEnemy, include: [Enemy] }],
                order: [['number', 'ASC']],
              },
            ],
          },
        ]
      : [{ model: TowerFloorEnemy, include: [Enemy] }],
    transaction,
  });
}

export async function addTowerFloors(game: Game, transaction: Transaction) {
  for (let mutableIndex = 1; mutableIndex <= game._tower?.height!; mutableIndex++) {
    await TowerFloor.create(
      {
        _gameId: game.id,
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
