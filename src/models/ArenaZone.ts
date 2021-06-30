import type { Transaction, Association } from 'sequelize';
import { sampleSize } from 'lodash';
import { Op } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  HasMany,
  Unique,
  Sequelize,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

import {
  ARENA_ZONE_RING,
  RING_SYSTEM_MAX_PENALTY_NUMBER,
} from '../games/arena/consts';
import { SORT_ACTION_ARRAY_RATE } from '../games/consts/global';
import { arenaZoneCapacity } from '../games/arena/utils';

import { ArenaPlayer, ArenaGame } from '.';

interface ArenaZoneAttributes {
  id: number;
  name: string;
  emoji: string;
  ring: ARENA_ZONE_RING;
  isArchived: boolean;
  isActive: boolean;
}

interface ArenaZoneCreationAttributes {
  name: string;
  emoji: string;
  ring: ARENA_ZONE_RING;
  isArchived: boolean;
  isActive?: boolean;
}

@Table({
  indexes: [
    {
      fields: ['name'],
    },
    {
      fields: ['ring'],
    },
  ],
})
export class ArenaZone extends Model<ArenaZoneAttributes, ArenaZoneCreationAttributes>
implements ArenaZoneAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Unique
  @Column(DataType.TEXT)
  name!: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isArchived!: boolean;

  @Default(false)
  @Column(DataType.TEXT)
  emoji!: string;

  @Column(DataType.TEXT)
  ring!: ARENA_ZONE_RING;

  @HasMany(() => ArenaPlayer, '_arenaZoneId')
  _players?: ArenaPlayer[];

  static associations: {
    _players: Association<ArenaZone, ArenaPlayer>;
  }
}

export function findAllArenaZones(transaction?: Transaction) {
  return ArenaZone.findAll({ transaction });
}

export function findActiveArenaZones(transaction?: Transaction) {
  return ArenaZone.findAll({
    include: [ArenaPlayer],
    where: { isActive: true },
    order: [['id', 'ASC']],
    transaction,
  });
}

export function countActivateArenaZones(transaction?: Transaction) {
  return ArenaZone.count({
    where: { isActive: true },
    transaction,
  });
}

export function countDeactivatedArenaZones(transaction?: Transaction) {
  return ArenaZone.count({
    where: { isActive: false },
    transaction,
  });
}

export function findArenaZoneById(id: number, transaction?: Transaction) {
  return ArenaZone.findByPk(id, { transaction });
}

export function findArenaZoneByName(name: string, transaction?: Transaction) {
  return ArenaZone.findOne({
    where: { name },
    transaction,
  });
}

export function findArenaZonesByRing(ring: ARENA_ZONE_RING, transaction?: Transaction) {
  return ArenaZone.findAll({
    include: [ArenaPlayer],
    where: { ring },
    transaction,
  });
}

export async function findArenaZonesWithPlayers(transaction?: Transaction) {
  const allArenaZones = await ArenaZone.findAll({
    order: [['isActive', 'DESC']],
    include: [ArenaPlayer],
    transaction,
  });
  const GO_FIRST = -1;
  const GO_LAST = 1;
  return allArenaZones
    .filter((arenaZone) => arenaZone._players?.length)
    .sort((zoneA, zoneB) => {
      if (zoneA.isActive === zoneB.isActive) {
        if (Math.random() < SORT_ACTION_ARRAY_RATE) {
          return GO_FIRST;
        } else {
          return GO_LAST;
        }
      }
      if (zoneA.isActive) {
        return GO_FIRST;
      }
      if (zoneB.isActive) {
        return GO_LAST;
      }
      if (zoneA.name === 'Streaming Zone') {
        return GO_LAST;
      }
      return GO_LAST; // may not be hit. It's a TS return compliance.
    });
}

export async function findAvailableArenaZonesToLand(transaction?: Transaction) {
  const arenaZonesAvailable = await ArenaZone.findAll({
    where: {
      isActive: true,
    },
    include: [ArenaPlayer],
    transaction,
  });
  return arenaZonesAvailable.filter(
    (arenaZone) => (arenaZone._players?.length ?? 0) < arenaZoneCapacity()
  );
}

interface RingSystemZonesToDeactivate {
  ringSystemAlgorithm: string;
  currentRingDeactivation: number;
}

export async function findRingSystemZonesToDeactivate(
  { ringSystemAlgorithm, currentRingDeactivation }: RingSystemZonesToDeactivate,
  transaction: Transaction
) {
  const startsWith = `${currentRingDeactivation}%`;
  const doesntEndsWith = `%${ringSystemAlgorithm}`;
  return ArenaZone.findAll({
    where: {
      ring: {
        [Op.like]: startsWith,
        [Op.notLike]: doesntEndsWith,
      },
      name: {
        [Op.not]: 'Streaming Zone',
      },
      isActive: true,
    },
    transaction,
  });
}

export async function deactivateRingSystemZones(
  { ringSystemAlgorithm, currentRingDeactivation }: RingSystemZonesToDeactivate,
  transaction: Transaction
) {
  const startsWith = `${currentRingDeactivation}%`;
  const doesntEndsWith = `%${ringSystemAlgorithm}`;
  return ArenaZone.update(
    {
      isActive: false,
    },
    {
      where: {
        isActive: true,
        ring: {
          [Op.like]: startsWith,
          [Op.notLike]: doesntEndsWith,
        },
        name: {
          [Op.not]: 'Streaming Zone',
        },
      },
      transaction,
    }
  );
}

export async function deactivateZones(zoneIds: number[]) {
  await activateAllArenaZones();
  return ArenaZone.update(
    {
      isActive: false,
    },
    {
      where: {
        id: {
          [Op.notIn]: zoneIds,
        },
      },
    }
  );
}

export async function activateAllArenaZones(transaction?: Transaction) {
  const [, arenaZonesActivated] = await ArenaZone.update(
    {
      isActive: true,
    },
    {
      where: {
        isArchived: false,
        name: {
          [Op.not]: 'Streaming Zone',
        },
      },
      transaction,
    }
  );
  return arenaZonesActivated;
}

export async function createOrUpdateArenaZone(zoneData: ArenaZoneCreationAttributes) {
  const { name, emoji, ring, isArchived } = zoneData;

  return ArenaZone.upsert({
    name,
    emoji,
    ring,
    isArchived,
    isActive: !isArchived,
  });
}

export function deleteZoneById(id: number, transaction: Transaction) {
  return ArenaZone.destroy({
    where: {
      id,
    },
    transaction,
  });
}

export async function ringDeactivationSystem(game: ArenaGame, transaction: Transaction) {
  // Ring Deactivation System
  const RADIX = 10;
  const ARENA_PORTAL = 5;
  const isDefaultAlgorithm =
    parseInt(game.ringSystemAlgorithm, RADIX) === ARENA_PORTAL ? true : false;
  // If there's only the Portal zone left, then do nothing
  if (isDefaultAlgorithm && game.currentRingDeactivation === ARENA_PORTAL) {
    return;
  }
  await deactivateRingSystemZones(
    {
      ringSystemAlgorithm: game.ringSystemAlgorithm,
      currentRingDeactivation: game.currentRingDeactivation,
    },
    transaction
  );

  if (game.inactiveZonePenaltyPower < RING_SYSTEM_MAX_PENALTY_NUMBER) {
    await game.incrementInactiveZonePenaltyPower(transaction);
  }

  await game.incrementCurrentRingDeactivation(transaction);
  if (!isDefaultAlgorithm && game.currentRingDeactivation === ARENA_PORTAL) {
    await game.resetCurrentRingDeactivation(transaction);
    await game.setRingSystemAlgorithm('5', transaction);
  }
}

export async function pickRingSystemAlgorithm(transaction: Transaction) {
  const PICK_ONE = 1;
  const defaultAlgorithm = '5';
  const zonesByDistinctRings = await ArenaZone.findAll({
    attributes: [[Sequelize.literal('DISTINCT ring'), 'ring']],
    order: [['ring', 'DESC']],
    transaction,
  });
  const ringsAvailable = zonesByDistinctRings
    .map((zone) => zone.ring)
    .map((ring) => ring[1])
    .filter((ring) => !!ring);
  const uniqueLetters: Set<string> = new Set();
  ringsAvailable.forEach((ring) => uniqueLetters.add(ring));
  uniqueLetters.add(defaultAlgorithm);
  const finalRingsAvailable = Array.from(uniqueLetters);
  const [algorithmPicked] = sampleSize(finalRingsAvailable, PICK_ONE);
  return algorithmPicked;
}
