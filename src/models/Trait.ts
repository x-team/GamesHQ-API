import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { TRAIT } from '../games/consts/global';

interface TraitAttributes {
  id: TRAIT;
  displayName: string;
  shortDescription: string;
}

interface TraitCreationAttributes {
  displayName: string;
  shortDescription: string;
}

@Table({
  indexes: [
    {
      fields: ['displayName'],
    },
  ],
})
export class Trait
  extends Model<TraitAttributes, TraitCreationAttributes>
  implements TraitAttributes
{
  @PrimaryKey
  @Column(DataType.TEXT)
  declare id: TRAIT;

  @Column(DataType.TEXT)
  declare displayName: string;

  @Column(DataType.TEXT)
  declare shortDescription: string;
}
