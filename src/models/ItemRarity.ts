import { memoize } from 'lodash';
import type { Transaction } from 'sequelize';
import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

import { ITEM_RARITY } from '../games/consts/global';

interface ItemRarityAttributes {
  id: ITEM_RARITY;
}

interface ItemRarityCreationAttributes {
  id: ITEM_RARITY;
}

@Table
export class ItemRarity
  extends Model<ItemRarityAttributes, ItemRarityCreationAttributes>
  implements ItemRarityAttributes
{
  @PrimaryKey
  @Column(DataType.TEXT)
  id!: ITEM_RARITY;
}

export const findItemRarity = memoize((id: string, transaction?: Transaction) =>
  ItemRarity.findByPk(id, { transaction })
);
