import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Transaction } from 'sequelize/types';
import { ItemTrait } from '.';
import { logger } from '../config';

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

interface ItemTraitCreationAttributes {
  itemId: number;
  trait: TRAIT;
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
  id!: TRAIT;

  @Column(DataType.TEXT)
  displayName!: string;

  @Column(DataType.TEXT)
  shortDescription!: string;
}

export async function createOrUpdateItemTrait(
  { itemId, trait }: ItemTraitCreationAttributes,
  transaction: Transaction
) {
  return ItemTrait.upsert(
    {
      _itemId: itemId,
      _traitId: trait,
    },
    {
      transaction,
    }
  );
}

export async function removeAllItemTraits(itemId: number, transaction: Transaction) {
  return ItemTrait.destroy({
    where: {
      _itemId: itemId,
    },
    transaction,
  });
}
