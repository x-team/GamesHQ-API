import type { Association, Transaction } from 'sequelize';
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

import { Enemy, TowerFloor } from '.';

interface TowerFloorEnemyAttributes {
  _enemyId: number;
  _towerFloorId: number;
}

interface TowerFloorEnemyCreationAttributes {
  _enemyId: number;
  _towerFloorId: number;
}

@Table({
  indexes: [
    {
      fields: ['_towerFloorId', '_enemyId'],
    },
  ],
})
export class TowerFloorEnemy
  extends Model<TowerFloorEnemyAttributes, TowerFloorEnemyCreationAttributes>
  implements TowerFloorEnemyAttributes
{
  @ForeignKey(() => Enemy)
  @Column(DataType.INTEGER)
  declare _enemyId: number;

  @BelongsTo(() => Enemy, {
    foreignKey: '_enemyId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _enemy?: Enemy;

  @ForeignKey(() => TowerFloor)
  @Column(DataType.INTEGER)
  declare _towerFloorId: number;

  @BelongsTo(() => TowerFloor, {
    foreignKey: '_towerFloorId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _towerFloor?: TowerFloor;

  static associations: {
    _enemy: Association<TowerFloorEnemy, Enemy>;
    _towerFloor: Association<TowerFloorEnemy, TowerFloor>;
  };
}

export async function addTowerFloorEnemy(floorId: number, enemy: Enemy, transaction: Transaction) {
  return TowerFloorEnemy.create(
    {
      _towerFloorId: floorId,
      _enemyId: enemy.id,
    },
    { transaction }
  );
}

export async function addTowerFloorEnemies(
  floorId: number,
  enemyIds: number[],
  transaction: Transaction
) {
  const data = enemyIds.map((enemyId) => ({
    _towerFloorId: floorId,
    _enemyId: enemyId,
  }));

  return TowerFloorEnemy.bulkCreate(data, {
    transaction,
  });
}

export async function findTowerFloorEnemyById(id: number, transaction: Transaction) {
  return TowerFloorEnemy.findByPk(id, { transaction });
}

export async function deleteTowerFloorEnemyByTowerFloor(
  towerFloorId: number,
  transaction: Transaction
) {
  return TowerFloorEnemy.destroy({
    where: { _towerFloorId: towerFloorId },
    transaction,
  });
}
