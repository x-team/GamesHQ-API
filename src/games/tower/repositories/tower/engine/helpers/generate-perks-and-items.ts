import { random, sampleSize } from 'lodash';
import { Transaction } from 'sequelize/types';
import { Item, TowerFloor, TowerRaider } from '../../../../../../models';
import { listActiveArmorsByGameType } from '../../../../../../models/ItemArmor';
import { listActiveHealthkitsByGameType } from '../../../../../../models/ItemHealthKit';
import { listActiveWeaponsByGameType } from '../../../../../../models/ItemWeapon';
import { findPerksByRarities } from '../../../../../../models/Perk';
import { filterItemsByRarity } from '../../../../../arena/utils';
import { GAME_TYPE, ITEM_RARITY, ONE, TRAIT, ZERO } from '../../../../../consts/global';
import { rarityWeight } from '../../../../../utils/rollRarity';
import {
  MAX_AMOUNT_HEALTHKITS_ALLOWED,
  TOWER_HEALTHKITS,
  TOWER_LOOT_PRIZES,
} from '../../../../consts';
import { rollLootPrize } from '../../../../utils';

export async function generatePerksAndItem(
  raider: TowerRaider,
  towerFloor: TowerFloor,
  transaction: Transaction
) {
  const floorNumber = towerFloor.number;
  let mutableRarityArray: Array<ITEM_RARITY>;
  const PERKS_TO_DISPLAY = 3;
  const FIRST_COHORT = 3;
  const SECOND_COHORT = 5;
  const THIRD_COHORT = 7;

  switch (floorNumber) {
    case FIRST_COHORT:
      mutableRarityArray = [ITEM_RARITY.COMMON];
      break;
    case SECOND_COHORT:
      mutableRarityArray = [ITEM_RARITY.COMMON, ITEM_RARITY.RARE];
      break;
    case THIRD_COHORT:
      mutableRarityArray = [ITEM_RARITY.RARE, ITEM_RARITY.EPIC];
      break;
    default:
      mutableRarityArray = [ITEM_RARITY.EPIC, ITEM_RARITY.LEGENDARY];
      break;
  }

  const rolledRarity = mutableRarityArray[random(mutableRarityArray.length - ONE)];
  const allPerks = await findPerksByRarities(mutableRarityArray, transaction);
  const randomPerks = sampleSize(allPerks, PERKS_TO_DISPLAY);

  const activeArmors = await listActiveArmorsByGameType(GAME_TYPE.TOWER, transaction);
  let mutableActiveArmorsFiltered = filterItemsByRarity(activeArmors, rolledRarity);

  const activeWeapons = await listActiveWeaponsByGameType(GAME_TYPE.TOWER, transaction);
  const weaponsFiltered = filterItemsByRarity(activeWeapons, rolledRarity);

  const activeHealthkits = await listActiveHealthkitsByGameType(GAME_TYPE.TOWER, transaction);
  const healthkitsFiltered = filterItemsByRarity(activeHealthkits, rolledRarity);
  const raidersHealthkit = raider._healthkits?.find(
    (healthkit) => healthkit.name === TOWER_HEALTHKITS.COMMON
  );
  const raidersHealthkitQuantity = raidersHealthkit?.TowerItemInventory?.remainingUses || ZERO;

  const availableItemPrizes: TOWER_LOOT_PRIZES[] = [];
  const currentArmor = raider.itemsAvailable(raider._armors)[ZERO];

  if (currentArmor) {
    const currentArmorRarity = rarityWeight(currentArmor._itemRarityId);
    mutableActiveArmorsFiltered = mutableActiveArmorsFiltered.filter(
      (armor) => rarityWeight(armor._itemRarityId) >= currentArmorRarity
    );
  }
  if (mutableActiveArmorsFiltered.length) {
    availableItemPrizes.push(TOWER_LOOT_PRIZES.ARMOR);
  }

  if (weaponsFiltered.length) {
    availableItemPrizes.push(TOWER_LOOT_PRIZES.WEAPON);
  }

  if (raidersHealthkitQuantity < MAX_AMOUNT_HEALTHKITS_ALLOWED) {
    availableItemPrizes.push(TOWER_LOOT_PRIZES.HEALTH_KIT);
  }

  const lootElement = rollLootPrize(availableItemPrizes);
  let mutableItemPicked: Item;
  let mutableItemType: string;
  switch (lootElement) {
    case TOWER_LOOT_PRIZES.HEALTH_KIT:
      mutableItemPicked = healthkitsFiltered[random(healthkitsFiltered.length - ONE)];
      mutableItemType = 'item';
      break;
    case TOWER_LOOT_PRIZES.ARMOR:
      mutableItemPicked =
        mutableActiveArmorsFiltered[random(mutableActiveArmorsFiltered.length - ONE)];
      mutableItemType = 'armor';
      break;
    case TOWER_LOOT_PRIZES.WEAPON:
      const noInitialWeapons = weaponsFiltered.filter((w) => !w.hasTrait(TRAIT.INITIAL));
      mutableItemPicked = noInitialWeapons[random(noInitialWeapons.length - ONE)];
      mutableItemType = 'weapon';
      break;
    default:
      const noInitialWeaponsFallbackWeaponsFiltered = weaponsFiltered.filter(
        (w) => !w.hasTrait(TRAIT.INITIAL)
      );
      mutableItemPicked =
        noInitialWeaponsFallbackWeaponsFiltered[
          random(noInitialWeaponsFallbackWeaponsFiltered.length - ONE)
        ];
      mutableItemType = 'weapon';
      break;
  }
  return { perksToPick: randomPerks, item: mutableItemPicked, itemType: mutableItemType };
}
