import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import type { Association } from 'sequelize/types';

import { TRAIT } from '../games/consts/global';

import { Enemy, Trait } from '.';

interface EnemyTraitAttributes {
  _enemyId: number;
  _traitId: TRAIT;
}

interface EnemyTraitCreationAttributes {
  _enemyId: number;
  _traitId: TRAIT;
}

@Table({
  indexes: [
    {
      fields: ['_enemyId', '_traitId'],
    },
  ],
})
export class EnemyTrait
  extends Model<EnemyTraitAttributes, EnemyTraitCreationAttributes>
  implements EnemyTraitAttributes
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

  @ForeignKey(() => Trait)
  @Column(DataType.TEXT)
  declare _traitId: TRAIT;

  @BelongsTo(() => Trait, {
    foreignKey: '_traitId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _trait?: Trait;

  static associations: {
    _enemy: Association<EnemyTrait, Enemy>;
    _trait: Association<EnemyTrait, Trait>;
  };
}
