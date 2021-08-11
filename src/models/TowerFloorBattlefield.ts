import type { Association, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

import { /*TowerRaider, TowerRound,*/ TowerFloor, TowerFloorBattlefieldEnemy } from '.';

interface TowerFloorBattlefieldAttributes {
  id: number;
  createdAt: Date;
  _towerFloorId: number;
}

interface TowerFloorBattlefieldCreationAttributes {
  createdAt: Date;
  _towerFloorId: number;
}

@Table({
  indexes: [
    {
      fields: ['_towerFloorId'],
    },
  ],
})
export class TowerFloorBattlefield
  extends Model<TowerFloorBattlefieldAttributes, TowerFloorBattlefieldCreationAttributes>
  implements TowerFloorBattlefieldAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.DATE)
  createdAt!: Date;

  @ForeignKey(() => TowerFloor)
  @Column(DataType.INTEGER)
  _towerFloorId!: number;

  @BelongsTo(() => TowerFloor, {
    foreignKey: '_towerFloorId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _towerFloor?: TowerFloor;

  @HasMany(() => TowerFloorBattlefieldEnemy, '_towerFloorBattlefieldId')
  _enemies?: TowerFloorBattlefieldEnemy[];

  // @HasMany(() => TowerRaider, '_towerFloorBattlefieldId')
  // _raiders?: TowerRaider[];

  // @HasMany(() => TowerRound, '_towerFloorBattlefieldId')
  // _rounds?: TowerRound[];

  static associations: {
    _towerFloor: Association<TowerFloorBattlefield, TowerFloor>;
    _enemies: Association<TowerFloorBattlefield, TowerFloorBattlefieldEnemy>;
    // _raiders: Association<TowerFloorBattlefield, Towerraider>;
    // _rounds: Association<TowerFloorBattlefield, TowerRound>;
  };
}

export function createBattlefield(floorId: number, transaction: Transaction) {
  return TowerFloorBattlefield.create(
    {
      _towerFloorId: floorId,
      createdAt: new Date(),
    },
    { transaction }
  );
}

// export async function totalRaidersAlive(battlefieldId: number, transaction: Transaction) {
//   const battlefield = await TowerFloorBattlefield.findByPk(battlefieldId, {
//     include: [TowerRaider],
//     transaction,
//   });
//   const reduceTotalAlive = (acc: number, raider: TowerRaider) =>
//     raider.health > 0 ? acc + 1 : acc;
//   return battlefield!._raiders!.reduce(reduceTotalAlive, 0);
// }

export async function totalEnemiesAlive(battlefieldId: number, transaction: Transaction) {
  const battlefield = await TowerFloorBattlefield.findByPk(battlefieldId, {
    include: [TowerFloorBattlefieldEnemy],
    transaction,
  });
  const reduceTotalAlive = (acc: number, enemy: TowerFloorBattlefieldEnemy) =>
    enemy.health > 0 ? acc + 1 : acc;
  return battlefield!._enemies!.reduce(reduceTotalAlive, 0);
}
