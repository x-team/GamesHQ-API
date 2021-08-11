// import type { Transaction } from 'sequelize';
// import {
//   Table,
//   Column,
//   Model,
//   DataType,
//   ForeignKey,
//   BelongsTo,
//   Default,
//   AllowNull,
// } from 'sequelize-typescript';

// import { PERKS } from '../plugins/slack-integrations/tower/consts';

// import { Perk, TowerRaider, TowerFloorBattlefieldEnemy } from '.';

// @Table({
//   indexes: [
//     {
//       fields: ['_perkId'],
//     },
//     {
//       fields: ['_towerRaiderId'],
//     },
//     {
//       fields: ['_towerFloorBattlefieldEnemyId'],
//     },
//     {
//       unique: true,
//       fields: ['_perkId', '_towerRaiderId', '_towerFloorBattlefieldEnemyId'],
//     },
//   ],
// })
// export class PerkInventory extends Model {
//   @ForeignKey(() => Perk)
//   @Column(DataType.TEXT)
//   _perkId!: PERKS;

//   @BelongsTo(() => Perk, '_perkId')
//   _perk?: Perk;

//   @ForeignKey(() => TowerRaider)
//   @AllowNull(true)
//   @Column(DataType.INTEGER)
//   _towerRaiderId!: number;

//   @BelongsTo(() => TowerRaider, '_towerRaiderId')
//   _raider?: TowerRaider;

//   @ForeignKey(() => TowerFloorBattlefieldEnemy)
//   @AllowNull(true)
//   @Column(DataType.INTEGER)
//   _towerFloorBattlefieldEnemyId!: number;

//   @BelongsTo(() => TowerFloorBattlefieldEnemy, '_towerFloorBattlefieldEnemyId')
//   _towerFloorBattlefieldEnemy?: TowerFloorBattlefieldEnemy;

//   @Default(1)
//   @Column(DataType.INTEGER)
//   quantity?: number;

//   @Column(DataType.DATE)
//   createdAt!: Date;
// }
// interface PerkInventoryKey {
//   raiderId?: number | null;
//   enemyId?: number | null;
//   perkId: PERKS;
// }

// export function findPerkInventory(
//   { perkId, enemyId = null, raiderId = null }: PerkInventoryKey,
//   transaction?: Transaction
// ) {
//   return PerkInventory.findOne({
//     where: {
//       _perkId: perkId,
//       _towerRaiderId: raiderId,
//       _towerFloorBattlefieldEnemyId: enemyId,
//     },
//     transaction,
//   });
// }

// export async function setPerkInventoryQuantity(
//   { raiderId = null, enemyId = null, perkId, quantity }: PerkInventoryKey & { quantity: number },
//   transaction: Transaction
// ) {
//   const perkEntry = await findPerkInventory({ raiderId, perkId, enemyId }, transaction);
//   if (perkEntry && quantity < 1) {
//     await PerkInventory.destroy({
//       where: {
//         _perkId: perkId,
//         _towerRaiderId: raiderId,
//         _towerFloorBattlefieldEnemyId: enemyId,
//       },
//       transaction,
//     });
//     return undefined;
//   } else if (perkEntry) {
//     perkEntry.quantity = quantity;
//     await perkEntry.save({ transaction });
//     return perkEntry.reload({ transaction });
//   } else {
//     return PerkInventory.create(
//       {
//         _perkId: perkId,
//         _towerRaiderId: raiderId,
//         _towerFloorBattlefieldEnemyId: enemyId,
//         quantity,
//         createdAt: new Date(),
//       },
//       { transaction }
//     );
//   }
// }
