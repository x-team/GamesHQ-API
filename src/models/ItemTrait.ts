import { Op } from 'sequelize';
import type { Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
} from 'sequelize-typescript';

import { TRAIT } from '../games/consts/global';

import { Item, Trait } from './';

interface ItemTraitCreationAttributes {
  itemId: number;
  trait: TRAIT;
}
interface TraitAttributes {
  _itemId: number;
  _traitId: TRAIT;
}

interface TraitCreationAttributes {
  _itemId: number;
  _traitId: TRAIT;
}

@Table({
  indexes: [
    {
      unique: true,
      fields: ['_itemId', '_traitId'],
    },
  ],
})
export class ItemTrait
  extends Model<TraitAttributes, TraitCreationAttributes>
  implements TraitAttributes
{
  @PrimaryKey
  @ForeignKey(() => Item)
  @Column(DataType.INTEGER)
  declare _itemId: number;

  @BelongsTo(() => Item, {
    foreignKey: '_itemId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _item?: Item;

  @PrimaryKey
  @ForeignKey(() => Trait)
  @Column(DataType.TEXT)
  declare _traitId: TRAIT;

  @BelongsTo(() => Trait)
  declare _trait?: Trait;
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

export async function refreshItemTraits(item: Item, traits: string[], transaction?: Transaction) {
  if (traits.length == 0) {
    return;
  }
  await ItemTrait.destroy({
    where: {
      _itemId: item.id,
    },
    transaction,
  });

  const traitRefs = await Trait.findAll({
    where: {
      id: {
        [Op.in]: traits,
      },
    },
    transaction,
  });

  traitRefs.forEach(async (traitRef) => {
    await ItemTrait.create(
      {
        _itemId: item.id,
        _traitId: traitRef.id,
      },
      {
        transaction,
      }
    );
  });
}
