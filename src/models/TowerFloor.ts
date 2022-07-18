import { Op } from 'sequelize';
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

import { withTransaction } from '../db';

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
      fields: ['_towerGameId'],
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
  declare id: number;

  @Column(DataType.INTEGER)
  declare number: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isEveryoneVisible: boolean;

  @ForeignKey(() => TowerGame)
  @Column(DataType.INTEGER)
  declare _towerGameId: number;

  @BelongsTo(() => TowerGame, {
    foreignKey: '_towerGameId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _towerGame?: TowerGame;

  @HasMany(() => TowerFloorEnemy, '_towerFloorId')
  declare _floorEnemies?: TowerFloorEnemy[];

  @HasMany(() => TowerFloorBattlefield, '_towerFloorId')
  declare _floorBattlefields?: TowerFloorBattlefield[];

  static associations: {
    _towerGame: Association<TowerFloor, TowerGame>;
    _floorEnemies: Association<TowerFloor, TowerFloorEnemy>;
    _floorBattlefields: Association<TowerFloor, TowerFloorBattlefield>;
  };

  async setVisibility(isEveryoneVisible: boolean, transaction: Transaction) {
    return this.isEveryoneVisible !== isEveryoneVisible
      ? this.update({ isEveryoneVisible }, { transaction })
      : this;
  }
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

export async function addTowerFloors(towerGame: TowerGame, transaction?: Transaction) {
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

export async function addFloor(floorNumber: number, _towerGameId: number): Promise<TowerFloor> {
  return withTransaction(async (transaction: Transaction) => {
    await TowerGame.increment('height', {
      by: 1,
      where: {
        id: _towerGameId,
      },
      transaction,
    });

    await TowerFloor.increment('number', {
      by: 1,
      where: {
        [Op.and]: {
          _towerGameId,
          number: {
            [Op.gte]: floorNumber,
          },
        },
      },
      transaction,
    });

    const floor = await TowerFloor.create(
      {
        _towerGameId,
        number: floorNumber,
      },
      {
        returning: true,
        transaction,
      }
    );

    return floor;
  });
}

export async function removeTowerFloor(
  towerFloor: number,
  towerGame: TowerGame,
  transaction: Transaction
) {
  const newFloorNumber = towerGame.height - 1;
  await TowerGame.update(
    {
      height: newFloorNumber,
    },
    {
      where: {
        id: towerGame.id,
      },
      transaction,
    }
  );

  await TowerFloor.destroy({
    where: {
      _towerGameId: towerGame.id,
      number: towerFloor,
    },
    transaction,
  });
}
