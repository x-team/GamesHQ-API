import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { TRAITS } from '../games/consts/global';

interface TraitAttributes {
  id: TRAITS;
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
      fields: ['displayName']
    },
  ],
})
export class Trait extends Model<TraitAttributes, TraitCreationAttributes>
implements TraitAttributes {
  @PrimaryKey
  @Column(DataType.TEXT)
  id!: TRAITS;

  @Column(DataType.TEXT)
  displayName!: string;

  @Column(DataType.TEXT)
  shortDescription!: string;
}
