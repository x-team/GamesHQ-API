import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';
import { Transaction } from 'sequelize/types';

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

export async function createEnemyPattern(pattern: string, transaction?: Transaction) {
  return EnemyPattern.create(
    {
      id: pattern,
    },
    {
      transaction,
    }
  );
}

export async function existsEnemyPattern(id: string, transaction?: Transaction) {
  const enemyPattern = await findEnemyPatternById(id, transaction);

  return !!enemyPattern;
}

export function findEnemyPatternById(id: string, transaction?: Transaction) {
  return EnemyPattern.findByPk(id, { transaction });
}
