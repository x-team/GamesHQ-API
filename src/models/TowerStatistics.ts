import type { Association, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
} from 'sequelize-typescript';

import { ONE, ZERO } from '../games/consts/global';

import { User, TowerGame, Perk, PerkInventory } from '.';

interface TowerStatisticsAttributes {
  attempts: number;
  completed: number;
  _towerGameId: number;
  _userId: number;
}

interface TowerStatisticsCreationAttributes {
  attempts: number;
  completed: number;
  _towerGameId: number;
  _userId: number;
}

@Table({
  indexes: [
    {
      unique: true,
      fields: ['_userId', '_towerGameId'],
    },
  ],
})
export class TowerStatistics
  extends Model<TowerStatisticsAttributes, TowerStatisticsCreationAttributes>
  implements TowerStatisticsAttributes
{
  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare _userId: number;

  @BelongsTo(() => User, {
    foreignKey: '_userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _user?: User;

  @PrimaryKey
  @ForeignKey(() => TowerGame)
  @Column(DataType.INTEGER)
  declare _towerGameId: number;

  @BelongsTo(() => TowerGame, {
    foreignKey: '_towerGameId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _towerGame?: TowerGame;

  @Column(DataType.INTEGER)
  declare attempts: number;

  @Column(DataType.INTEGER)
  declare completed: number;

  @Column(DataType.INTEGER)
  declare lastFloorVisited: number;

  @Column(DataType.INTEGER)
  declare lastHealth: number;

  @Column(DataType.INTEGER)
  declare perks: number;

  static associations: {
    _user: Association<TowerStatistics, User>;
    _towerGame: Association<TowerStatistics, TowerGame>;
  };
}

export function findOneTowerStatistics(gameId: number, userId: number, transaction?: Transaction) {
  return TowerStatistics.findOne({
    where: {
      _userId: userId,
      _towerGameId: gameId,
    },
    transaction,
  });
}

export async function findOrCreateTowerStatistics(
  gameId: number,
  userId: number,
  transaction?: Transaction
) {
  const [towerStatistics, created] = await TowerStatistics.findOrCreate({
    where: {
      _userId: userId,
      _towerGameId: gameId,
    },
    defaults: {
      _userId: userId,
      _towerGameId: gameId,
      attempts: ONE,
      completed: ZERO,
    },
    transaction,
  });
  if (!created) {
    await towerStatistics.increment({ attempts: ONE }, { transaction });
  }
  return towerStatistics.reload({ transaction });
}

function calculatePerkNumber(perks: Array<Perk & { PerkInventory: PerkInventory }>) {
  return perks.reduce(
    (totalPerks, { PerkInventory: { quantity } }) => totalPerks + (quantity ?? ZERO),
    ZERO
  );
}

export async function updateTowerAsCompleted(
  gameId: number,
  userId: number,
  lastFloorVisited: number,
  perks: Array<Perk & { PerkInventory: PerkInventory }>,
  transaction?: Transaction
) {
  const towerStats = await TowerStatistics.findOne({
    where: {
      _userId: userId,
      _towerGameId: gameId,
    },
    transaction,
  });
  if (towerStats) {
    const perksNumber = calculatePerkNumber(perks);
    await towerStats.increment({ completed: 1 }, { transaction });
    if (lastFloorVisited >= towerStats.lastFloorVisited) {
      towerStats.lastFloorVisited = lastFloorVisited;
    }
    towerStats.perks = perksNumber;
    await towerStats.save({ transaction });
  }
}

export function findTowerStatisticsByGame(gameId: number, transaction: Transaction) {
  return TowerStatistics.findAll({
    where: {
      _towerGameId: gameId,
    },
    order: [
      ['lastFloorVisited', 'DESC'],
      ['lastHealth', 'DESC'],
      ['perks', 'ASC'],
      ['completed', 'DESC'],
      ['attempts', 'ASC'],
    ],
    include: [
      {
        association: TowerStatistics.associations._user,
      },
    ],
    transaction,
  });
}

export async function updateTowerAttempts(
  gameId: number,
  userId: number,
  lastFloorVisited: number,
  perks: Array<Perk & { PerkInventory: PerkInventory }>,
  transaction?: Transaction
) {
  const towerStats = await TowerStatistics.findOne({
    where: {
      _userId: userId,
      _towerGameId: gameId,
    },
    transaction,
  });
  if (towerStats) {
    const perksNumber = calculatePerkNumber(perks);
    await towerStats.increment({ attempts: 1 }, { transaction });
    if (lastFloorVisited >= towerStats.lastFloorVisited) {
      towerStats.lastFloorVisited = lastFloorVisited;
    }
    towerStats.perks = perksNumber;
    await towerStats.save({ transaction });
  }
}

export async function updateLastHealth(
  gameId: number,
  userId: number,
  lastFloorVisited: number,
  lastHealth: number,
  transaction?: Transaction
) {
  const towerStats = await TowerStatistics.findOne({
    where: {
      _userId: userId,
      _towerGameId: gameId,
    },
    transaction,
  });
  if (towerStats && lastFloorVisited >= towerStats.lastFloorVisited) {
    towerStats.lastHealth = lastHealth;
    await towerStats.save({ transaction });
  }
}
