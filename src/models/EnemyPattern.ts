import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

interface EnemyPatternAttributes {
  id: string;
}

interface EnemyPatternCreationAttributes {
  id: string;
}

@Table
export class EnemyPattern
  extends Model<EnemyPatternAttributes, EnemyPatternCreationAttributes>
  implements EnemyPatternAttributes
{
  @PrimaryKey
  @Column(DataType.TEXT)
  id!: string;
}
