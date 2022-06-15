import type { Association, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
  AllowNull,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

import { Perk, TowerRaider, TowerFloorBattlefieldEnemy } from '.';
import { ONE, PERK } from '../games/consts/global';

interface PerkInventoryAttributes {
  id: number;
  _perkId: PERK;
  _towerRaiderId?: number | null;
  _towerFloorBattlefieldEnemyId?: number | null;
  quantity?: number;
  createdAt: Date;
}

interface PerkInventoryCreationAttributes {
  _perkId: PERK;
  _towerRaiderId?: number | null;
  _towerFloorBattlefieldEnemyId?: number | null;
  quantity?: number;
  createdAt: Date;
}

@Table({
  indexes: [
    {
      fields: ['_perkId'],
    },
    {
      fields: ['_towerRaiderId'],
    },
    {
      fields: ['_towerFloorBattlefieldEnemyId'],
    },
    {
      unique: true,
      fields: ['_perkId', '_towerRaiderId', '_towerFloorBattlefieldEnemyId'],
    },
  ],
})
export class PerkInventory
  extends Model<PerkInventoryAttributes, PerkInventoryCreationAttributes>
  implements PerkInventoryAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Perk)
  @Column(DataType.TEXT)
  declare _perkId: PERK;

  @BelongsTo(() => Perk, {
    foreignKey: '_perkId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _perk?: Perk;

  @ForeignKey(() => TowerRaider)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare _towerRaiderId: number;

  @BelongsTo(() => TowerRaider, {
    foreignKey: '_towerRaiderId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _raider?: TowerRaider;

  @ForeignKey(() => TowerFloorBattlefieldEnemy)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare _towerFloorBattlefieldEnemyId: number;

  @BelongsTo(() => TowerFloorBattlefieldEnemy, '_towerFloorBattlefieldEnemyId')
  _towerFloorBattlefieldEnemy?: TowerFloorBattlefieldEnemy;

  @Default(ONE)
  @Column(DataType.INTEGER)
  quantity?: number;

  @Column(DataType.DATE)
  declare createdAt: Date;

  static associations: {
    _raider: Association<PerkInventory, TowerRaider>;
    _perk: Association<PerkInventory, Perk>;
    _towerFloorBattlefieldEnemy: Association<PerkInventory, TowerFloorBattlefieldEnemy>;
  };
}

interface PerkInventoryKey {
  raiderId?: number | null;
  enemyId?: number | null;
  perkId: PERK;
}

export function findPerkInventory(
  { perkId, enemyId = null, raiderId = null }: PerkInventoryKey,
  transaction?: Transaction
) {
  return PerkInventory.findOne({
    where: {
      _perkId: perkId,
      _towerRaiderId: raiderId,
      _towerFloorBattlefieldEnemyId: enemyId,
    },
    transaction,
  });
}

export async function setPerkInventoryQuantity(
  { raiderId = null, enemyId = null, perkId, quantity }: PerkInventoryKey & { quantity: number },
  transaction: Transaction
) {
  const perkEntry = await findPerkInventory({ raiderId, perkId, enemyId }, transaction);
  if (perkEntry && quantity < ONE) {
    await PerkInventory.destroy({
      where: {
        _perkId: perkId,
        _towerRaiderId: raiderId,
        _towerFloorBattlefieldEnemyId: enemyId,
      },
      transaction,
    });
    return undefined;
  } else if (perkEntry) {
    perkEntry.quantity = quantity;
    await perkEntry.save({ transaction });
    return perkEntry.reload({ transaction });
  } else {
    return PerkInventory.create(
      {
        _perkId: perkId,
        _towerRaiderId: raiderId,
        _towerFloorBattlefieldEnemyId: enemyId,
        quantity,
        createdAt: new Date(),
      },
      { transaction }
    );
  }
}
