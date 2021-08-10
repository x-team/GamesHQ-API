import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

import { Enemy, Trait } from '.';
import { TRAIT } from '../games/consts/global';

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
  _enemyId!: number;

  @BelongsTo(() => Enemy, {
    foreignKey: '_enemyId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _enemy?: Enemy;

  @ForeignKey(() => Trait)
  @Column(DataType.TEXT)
  _traitId!: TRAIT;

  @BelongsTo(() => Trait, {
    foreignKey: '_traitId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _trait?: Trait;
}
