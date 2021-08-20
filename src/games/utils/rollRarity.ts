import { random } from 'lodash';
import { Item } from '../../models';
import { GAME_TYPE, HUNDRED, ITEM_RARITY, ITEM_TYPE, ONE, ZERO } from '../consts/global';
import {
  COMMON_ARMOR_CHANCE,
  COMMON_WEAPON_CHANCE,
  EPIC_ARMOR_CHANCE,
  EPIC_WEAPON_CHANCE,
  LEGENDARY_ARMOR_CHANCE,
  LEGENDARY_WEAPON_CHANCE,
  RARE_ARMOR_CHANCE,
  RARE_WEAPON_CHANCE,
} from '../arena/consts';

export function weightedChance<T>(specs: Array<{ chance: number; result: T }>, defaultValue: T) {
  const total = specs.reduce((acc, { chance }) => acc + chance, 0);
  const luck = Math.random() * total;
  let mutableSum = 0;
  for (const { chance, result } of specs) {
    mutableSum += chance;
    if (luck < mutableSum) {
      return result;
    }
  }
  return defaultValue; // may not be hit. It's a TS return compliance.
}

interface ItemRollTable {
  common?: { chance: number; result: ITEM_RARITY.COMMON };
  rare?: { chance: number; result: ITEM_RARITY.RARE };
  epic?: { chance: number; result: ITEM_RARITY.EPIC };
  legendary?: { chance: number; result: ITEM_RARITY.LEGENDARY };
}

function getRarityRollTable([
  commonChance,
  rareChance,
  epicChance,
  legendaryChance,
]: number[]): ItemRollTable {
  return {
    common: {
      chance: commonChance,
      result: ITEM_RARITY.COMMON,
    },
    rare: {
      chance: rareChance,
      result: ITEM_RARITY.RARE,
    },
    epic: {
      chance: epicChance,
      result: ITEM_RARITY.EPIC,
    },
    legendary: {
      chance: legendaryChance,
      result: ITEM_RARITY.LEGENDARY,
    },
  };
}

export interface RollSearchRarityParams {
  searchRarityAvailability?: { [key in ITEM_RARITY]: boolean };
  rarityRollTable?: ItemRollTable;
  deltaBoost?: number;
}

export function rollSearchRarity({
  searchRarityAvailability,
  rarityRollTable,
  deltaBoost = ZERO,
}: RollSearchRarityParams): ITEM_RARITY {
  const rollTable: Array<{ chance: number; result: ITEM_RARITY }> = [];
  const HALF = 2;
  const deltaBoostHalf = deltaBoost / HALF;
  const roundTwoDecimalPoints = (num: number) => Math.round(num * HUNDRED) / HUNDRED;

  const legendaryChance = roundTwoDecimalPoints(
    rarityRollTable?.legendary?.chance! + deltaBoostHalf
  );
  const epicChance = roundTwoDecimalPoints(rarityRollTable?.epic?.chance! + deltaBoostHalf);
  const rareChance = roundTwoDecimalPoints(rarityRollTable?.rare?.chance! - deltaBoostHalf);
  const commonChance = roundTwoDecimalPoints(rarityRollTable?.common?.chance! - deltaBoostHalf);
  const defaultRollTable = [
    { chance: legendaryChance, result: ITEM_RARITY.LEGENDARY },
    { chance: epicChance, result: ITEM_RARITY.EPIC },
    { chance: rareChance, result: ITEM_RARITY.RARE },
    { chance: commonChance, result: ITEM_RARITY.COMMON },
  ];

  if (!searchRarityAvailability) {
    return weightedChance(defaultRollTable, ITEM_RARITY.COMMON);
  }

  if (searchRarityAvailability[ITEM_RARITY.COMMON]) {
    rollTable.push({ chance: commonChance, result: ITEM_RARITY.COMMON });
  }
  if (searchRarityAvailability[ITEM_RARITY.RARE]) {
    rollTable.push({ chance: rareChance, result: ITEM_RARITY.RARE });
  }
  if (searchRarityAvailability[ITEM_RARITY.EPIC]) {
    rollTable.push({ chance: epicChance, result: ITEM_RARITY.EPIC });
  }
  if (searchRarityAvailability[ITEM_RARITY.LEGENDARY]) {
    rollTable.push({ chance: legendaryChance, result: ITEM_RARITY.LEGENDARY });
  }
  return weightedChance(rollTable, ITEM_RARITY.COMMON);
}

export function rollItemRarity(itemType: ITEM_TYPE, searchRarityParams: RollSearchRarityParams) {
  const { rarityRollTable } = searchRarityParams;
  let mutableFinalRarityRollTable: ItemRollTable;
  switch (itemType) {
    case ITEM_TYPE.WEAPON:
      mutableFinalRarityRollTable = getRarityRollTable([
        rarityRollTable?.common?.chance ?? COMMON_WEAPON_CHANCE,
        rarityRollTable?.rare?.chance ?? RARE_WEAPON_CHANCE,
        rarityRollTable?.epic?.chance ?? EPIC_WEAPON_CHANCE,
        rarityRollTable?.legendary?.chance ?? LEGENDARY_WEAPON_CHANCE,
      ]);
      break;
    case ITEM_TYPE.ARMOR:
      mutableFinalRarityRollTable = getRarityRollTable([
        rarityRollTable?.common?.chance ?? COMMON_ARMOR_CHANCE,
        rarityRollTable?.rare?.chance ?? RARE_ARMOR_CHANCE,
        rarityRollTable?.epic?.chance ?? EPIC_ARMOR_CHANCE,
        rarityRollTable?.legendary?.chance ?? LEGENDARY_ARMOR_CHANCE,
      ]);
      break;
    default:
      mutableFinalRarityRollTable = getRarityRollTable([
        rarityRollTable?.common?.chance ?? COMMON_WEAPON_CHANCE,
        rarityRollTable?.rare?.chance ?? RARE_WEAPON_CHANCE,
        rarityRollTable?.epic?.chance ?? EPIC_WEAPON_CHANCE,
        rarityRollTable?.legendary?.chance ?? LEGENDARY_WEAPON_CHANCE,
      ]);
      break;
  }
  return rollSearchRarity({
    ...searchRarityParams,
    rarityRollTable: mutableFinalRarityRollTable,
  });
}

export function rarityWeight(rarityId: ITEM_RARITY): number {
  const COMMON = 1;
  const RARE = 2;
  const EPIC = 3;
  const LEGENDARY = 4;
  switch (rarityId) {
    case ITEM_RARITY.COMMON:
      return COMMON;
    case ITEM_RARITY.RARE:
      return RARE;
    case ITEM_RARITY.EPIC:
      return EPIC;
    case ITEM_RARITY.LEGENDARY:
      return LEGENDARY;
  }
}

export function randomizeItems(items: Item[]): Item {
  return items[random(items.length - ONE)];
}

export function generateItemRarityAvailability(
  items: Item[],
  gameType: GAME_TYPE
): { [key in ITEM_RARITY]: boolean } {
  return items.reduce(
    (acc, item) => {
      const isItemActive =
        item._gameItemAvailability?.find(
          (itemAvailability) => itemAvailability._gameTypeId === gameType
        )?.isActive ?? false;
      return {
        [ITEM_RARITY.COMMON]:
          acc[ITEM_RARITY.COMMON] || (item._itemRarityId === ITEM_RARITY.COMMON && isItemActive),
        [ITEM_RARITY.RARE]:
          acc[ITEM_RARITY.RARE] || (item._itemRarityId === ITEM_RARITY.RARE && isItemActive),
        [ITEM_RARITY.EPIC]:
          acc[ITEM_RARITY.EPIC] || (item._itemRarityId === ITEM_RARITY.EPIC && isItemActive),
        [ITEM_RARITY.LEGENDARY]:
          acc[ITEM_RARITY.LEGENDARY] ||
          (item._itemRarityId === ITEM_RARITY.LEGENDARY && isItemActive),
      };
    },
    {
      [ITEM_RARITY.COMMON]: false,
      [ITEM_RARITY.RARE]: false,
      [ITEM_RARITY.EPIC]: false,
      [ITEM_RARITY.LEGENDARY]: false,
    } as { [key in ITEM_RARITY]: boolean }
  );
}
